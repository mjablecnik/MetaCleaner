package tests

import (
	"context"
	"os"
	"path/filepath"
	"testing"
	"time"

	src "metacleaner-server/source"
)

func writeFakeExec(t *testing.T, dir, name string, script string) string {
	t.Helper()
	p := filepath.Join(dir, name)
	if err := os.WriteFile(p, []byte("#!/bin/sh\n"+script+"\n"), 0755); err != nil {
		t.Fatalf("writeFakeExec %s: %v", name, err)
	}
	return p
}

func buildPipelineWithTools(t *testing.T, toolDir string) (*src.CleaningPipeline, func()) {
	t.Helper()
	origPath := os.Getenv("PATH")
	os.Setenv("PATH", toolDir+":"+origPath)
	restore := func() { os.Setenv("PATH", origPath) }

	tmp := t.TempDir()
	cfg := src.Config{
		TempStoragePath: tmp,
		MaxFileSize:     500 * 1024 * 1024,
		RetentionPeriod: time.Hour,
	}
	return src.NewCleaningPipeline(cfg), restore
}

func createFakeOriginal(t *testing.T, storagePath, fileID, ext string) {
	t.Helper()
	dir := filepath.Join(storagePath, "uploads")
	if err := os.MkdirAll(dir, 0755); err != nil {
		t.Fatal(err)
	}
	dest := filepath.Join(dir, fileID+"_original."+ext)
	if err := os.WriteFile(dest, []byte("fake image bytes"), 0644); err != nil {
		t.Fatal(err)
	}
}

func TestPipelineExifToolFailure(t *testing.T) {
	toolDir := t.TempDir()
	writeFakeExec(t, toolDir, "exiftool", "exit 1")

	pipeline, restore := buildPipelineWithTools(t, toolDir)
	defer restore()

	createFakeOriginal(t, pipeline.Cfg().TempStoragePath, "f-00000001", "jpg")
	createFakeOriginal(t, pipeline.Cfg().TempStoragePath, "f-00000002", "png")

	job := &src.Job{ID: "job-1", Status: "processing", TotalFiles: 2}
	files := []src.FileRecord{
		{ID: "f-00000001", FileExtension: ".jpg", FileType: "image"},
		{ID: "f-00000002", FileExtension: ".png", FileType: "image"},
	}

	var events []src.ProgressEvent
	err := pipeline.ProcessJob(context.Background(), job, files, func(e src.ProgressEvent) {
		events = append(events, e)
	})
	if err != nil {
		t.Fatalf("ProcessJob returned unexpected error: %v", err)
	}

	for _, f := range files {
		if f.Status != "error" {
			t.Errorf("file %s: expected status=error, got %q", f.ID, f.Status)
		}
	}

	last := events[len(events)-1]
	if last.Type != "job_complete" {
		t.Errorf("expected last event type=job_complete, got %q", last.Type)
	}
}

func TestPipelineFFmpegFailure(t *testing.T) {
	toolDir := t.TempDir()
	writeFakeExec(t, toolDir, "ffprobe", "echo '{\"format\":{\"tags\":{}},\"streams\":[]}'")
	writeFakeExec(t, toolDir, "ffmpeg", "exit 1")

	pipeline, restore := buildPipelineWithTools(t, toolDir)
	defer restore()

	createFakeOriginal(t, pipeline.Cfg().TempStoragePath, "f-00000003", "mp4")
	createFakeOriginal(t, pipeline.Cfg().TempStoragePath, "f-00000004", "jpg")
	writeFakeExec(t, toolDir, "exiftool", "exit 1")

	job := &src.Job{ID: "job-2", Status: "processing", TotalFiles: 2}
	files := []src.FileRecord{
		{ID: "f-00000003", FileExtension: ".mp4", FileType: "video"},
		{ID: "f-00000004", FileExtension: ".jpg", FileType: "image"},
	}

	var events []src.ProgressEvent
	err := pipeline.ProcessJob(context.Background(), job, files, func(e src.ProgressEvent) {
		events = append(events, e)
	})
	if err != nil {
		t.Fatalf("ProcessJob returned unexpected error: %v", err)
	}

	for _, f := range files {
		if f.Status != "error" {
			t.Errorf("file %s: expected status=error, got %q", f.ID, f.Status)
		}
	}

	last := events[len(events)-1]
	if last.Type != "job_complete" {
		t.Errorf("expected last event type=job_complete, got %q", last.Type)
	}
}

func TestPipelineMixedSuccess(t *testing.T) {
	toolDir := t.TempDir()
	exiftoolScript := "case \"$1\" in\n  -json)\n    echo '[{\"Make\":\"TestCam\",\"GPSLatitude\":\"51.5\",\"XMPRating\":\"4\"}]'\n    ;;\n  -all=)\n    cp \"$3\" \"$2\"\n    ;;\nesac\nexit 0"
	writeFakeExec(t, toolDir, "exiftool", exiftoolScript)
	writeFakeExec(t, toolDir, "ffmpeg", "exit 1")
	writeFakeExec(t, toolDir, "ffprobe", "echo '{\"format\":{\"tags\":{}},\"streams\":[]}'")

	pipeline, restore := buildPipelineWithTools(t, toolDir)
	defer restore()

	createFakeOriginal(t, pipeline.Cfg().TempStoragePath, "f-ok", "jpg")
	createFakeOriginal(t, pipeline.Cfg().TempStoragePath, "f-fail", "mp4")

	job := &src.Job{ID: "job-3", Status: "processing", TotalFiles: 2}
	files := []src.FileRecord{
		{ID: "f-ok", FileExtension: ".jpg", FileType: "image"},
		{ID: "f-fail", FileExtension: ".mp4", FileType: "video"},
	}

	_ = pipeline.ProcessJob(context.Background(), job, files, func(e src.ProgressEvent) {})

	if files[0].Status != "done" {
		t.Errorf("file f-ok: expected status=done, got %q", files[0].Status)
	}
	if files[1].Status != "error" {
		t.Errorf("file f-fail: expected status=error, got %q", files[1].Status)
	}
}

func TestCategorizeMetadataFieldExif(t *testing.T) {
	cases := []struct {
		key      string
		expected string
	}{
		{"GPSLatitude", "GPS"},
		{"GPSLongitude", "GPS"},
		{"gpsaltitude", "GPS"},
		{"XMPRating", "XMP"},
		{"xmp:CreateDate", "XMP"},
		{"Make", "EXIF"},
		{"Model", "EXIF"},
		{"DateTime", "EXIF"},
	}
	for _, tc := range cases {
		got := src.CategorizeMetadataField(tc.key, "exif")
		if got != tc.expected {
			t.Errorf("CategorizeMetadataField(%q, exif) = %q, want %q", tc.key, got, tc.expected)
		}
	}
}

func TestCategorizeMetadataFieldFFmpeg(t *testing.T) {
	cases := []struct {
		key      string
		expected string
	}{
		{"title", "ID3"},
		{"ARTIST", "ID3"},
		{"album", "ID3"},
		{"encoder", "ID3"},
		{"creation_time", "MP4"},
		{"handler_name", "MP4"},
		{"compatible_brands", "MP4"},
	}
	for _, tc := range cases {
		got := src.CategorizeMetadataField(tc.key, "ffmpeg")
		if got != tc.expected {
			t.Errorf("CategorizeMetadataField(%q, ffmpeg) = %q, want %q", tc.key, got, tc.expected)
		}
	}
}
