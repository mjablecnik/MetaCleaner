package main

import (
	"context"
	"os"
	"path/filepath"
	"testing"
	"time"
)

// fakeTool creates a tiny executable script at path that exits with the given code.
func writeFakeExec(t *testing.T, dir, name string, script string) string {
	t.Helper()
	p := filepath.Join(dir, name)
	if err := os.WriteFile(p, []byte("#!/bin/sh\n"+script+"\n"), 0755); err != nil {
		t.Fatalf("writeFakeExec %s: %v", name, err)
	}
	return p
}

// buildPipelineWithTools sets PATH so the pipeline picks up fake exiftool/ffmpeg/ffprobe.
func buildPipelineWithTools(t *testing.T, toolDir string) (*CleaningPipeline, func()) {
	t.Helper()
	origPath := os.Getenv("PATH")
	os.Setenv("PATH", toolDir+":"+origPath)
	restore := func() { os.Setenv("PATH", origPath) }

	tmp := t.TempDir()
	cfg := Config{
		TempStoragePath: tmp,
		MaxFileSize:     500 * 1024 * 1024,
		RetentionPeriod: time.Hour,
	}
	return NewCleaningPipeline(cfg), restore
}

// createFakeOriginal writes a placeholder file that the pipeline expects in uploads/.
func createFakeOriginal(t *testing.T, pipelineStoragePath, fileID, ext string) {
	t.Helper()
	dir := filepath.Join(pipelineStoragePath, "uploads")
	if err := os.MkdirAll(dir, 0755); err != nil {
		t.Fatal(err)
	}
	dest := filepath.Join(dir, fileID+"_original."+ext)
	if err := os.WriteFile(dest, []byte("fake image bytes"), 0644); err != nil {
		t.Fatal(err)
	}
}

// TestPipelineExifToolFailure ensures that an exiftool non-zero exit marks the file as
// "error" but the pipeline continues to the next file.
func TestPipelineExifToolFailure(t *testing.T) {
	toolDir := t.TempDir()
	// exiftool always exits 1 → subprocess failure
	writeFakeExec(t, toolDir, "exiftool", "exit 1")

	pipeline, restore := buildPipelineWithTools(t, toolDir)
	defer restore()

	createFakeOriginal(t, pipeline.cfg.TempStoragePath, "f-00000001", "jpg")
	createFakeOriginal(t, pipeline.cfg.TempStoragePath, "f-00000002", "png")

	job := &Job{ID: "job-1", Status: "processing", TotalFiles: 2}
	files := []FileRecord{
		{ID: "f-00000001", FileExtension: ".jpg", FileType: "image"},
		{ID: "f-00000002", FileExtension: ".png", FileType: "image"},
	}

	var events []ProgressEvent
	err := pipeline.ProcessJob(context.Background(), job, files, func(e ProgressEvent) {
		events = append(events, e)
	})
	if err != nil {
		t.Fatalf("ProcessJob returned unexpected error: %v", err)
	}

	// Both files should be marked error
	for _, f := range files {
		if f.Status != "error" {
			t.Errorf("file %s: expected status=error, got %q", f.ID, f.Status)
		}
	}

	// Final event should still be job_complete
	last := events[len(events)-1]
	if last.Type != "job_complete" {
		t.Errorf("expected last event type=job_complete, got %q", last.Type)
	}
}

// TestPipelineFFmpegFailure ensures that an ffmpeg non-zero exit marks the video file as
// "error" but the pipeline continues to the next file.
func TestPipelineFFmpegFailure(t *testing.T) {
	toolDir := t.TempDir()
	// ffprobe succeeds with empty JSON; ffmpeg fails
	writeFakeExec(t, toolDir, "ffprobe", `echo '{"format":{"tags":{}},"streams":[]}'`)
	writeFakeExec(t, toolDir, "ffmpeg", "exit 1")

	pipeline, restore := buildPipelineWithTools(t, toolDir)
	defer restore()

	createFakeOriginal(t, pipeline.cfg.TempStoragePath, "f-00000003", "mp4")
	createFakeOriginal(t, pipeline.cfg.TempStoragePath, "f-00000004", "jpg")
	// second file also needs exiftool — make it fail too so we can observe independent processing
	writeFakeExec(t, toolDir, "exiftool", "exit 1")

	job := &Job{ID: "job-2", Status: "processing", TotalFiles: 2}
	files := []FileRecord{
		{ID: "f-00000003", FileExtension: ".mp4", FileType: "video"},
		{ID: "f-00000004", FileExtension: ".jpg", FileType: "image"},
	}

	var events []ProgressEvent
	err := pipeline.ProcessJob(context.Background(), job, files, func(e ProgressEvent) {
		events = append(events, e)
	})
	if err != nil {
		t.Fatalf("ProcessJob returned unexpected error: %v", err)
	}

	// Both files should be errors
	for _, f := range files {
		if f.Status != "error" {
			t.Errorf("file %s: expected status=error, got %q", f.ID, f.Status)
		}
	}

	// Pipeline must emit a job_complete at the end
	last := events[len(events)-1]
	if last.Type != "job_complete" {
		t.Errorf("expected last event type=job_complete, got %q", last.Type)
	}
}

// TestPipelineMixedSuccess ensures a successful file after a failed one is processed correctly.
func TestPipelineMixedSuccess(t *testing.T) {
	toolDir := t.TempDir()
	// exiftool: on first call (read) return minimal JSON, on strip call produce the cleaned file
	exiftoolScript := `#!/bin/sh
case "$1" in
  -json)
    echo '[{"Make":"TestCam","GPSLatitude":"51.5","XMPRating":"4"}]'
    ;;
  -all=)
    # -o <cleaned> <original>: create cleaned file
    cp "$3" "$2"
    ;;
esac
exit 0`
	if err := os.WriteFile(filepath.Join(toolDir, "exiftool"), []byte(exiftoolScript), 0755); err != nil {
		t.Fatal(err)
	}
	writeFakeExec(t, toolDir, "ffmpeg", "exit 1")
	writeFakeExec(t, toolDir, "ffprobe", `echo '{"format":{"tags":{}},"streams":[]}'`)

	pipeline, restore := buildPipelineWithTools(t, toolDir)
	defer restore()

	createFakeOriginal(t, pipeline.cfg.TempStoragePath, "f-ok", "jpg")
	createFakeOriginal(t, pipeline.cfg.TempStoragePath, "f-fail", "mp4")

	job := &Job{ID: "job-3", Status: "processing", TotalFiles: 2}
	files := []FileRecord{
		{ID: "f-ok", FileExtension: ".jpg", FileType: "image"},
		{ID: "f-fail", FileExtension: ".mp4", FileType: "video"},
	}

	_ = pipeline.ProcessJob(context.Background(), job, files, func(e ProgressEvent) {})

	if files[0].Status != "done" {
		t.Errorf("file f-ok: expected status=done, got %q", files[0].Status)
	}
	if files[1].Status != "error" {
		t.Errorf("file f-fail: expected status=error, got %q", files[1].Status)
	}
}

// TestCategorizeMetadataFieldExif verifies GPS/XMP/EXIF categorization.
func TestCategorizeMetadataFieldExif(t *testing.T) {
	cases := []struct {
		key      string
		expected string
	}{
		{"GPSLatitude", "GPS"},
		{"GPSLongitude", "GPS"},
		{"gpsaltitude", "GPS"}, // case-insensitive
		{"XMPRating", "XMP"},
		{"xmp:CreateDate", "XMP"},
		{"Make", "EXIF"},
		{"Model", "EXIF"},
		{"DateTime", "EXIF"},
	}
	for _, tc := range cases {
		got := CategorizeMetadataField(tc.key, "exif")
		if got != tc.expected {
			t.Errorf("CategorizeMetadataField(%q, exif) = %q, want %q", tc.key, got, tc.expected)
		}
	}
}

// TestCategorizeMetadataFieldFFmpeg verifies ID3/MP4 categorization.
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
		got := CategorizeMetadataField(tc.key, "ffmpeg")
		if got != tc.expected {
			t.Errorf("CategorizeMetadataField(%q, ffmpeg) = %q, want %q", tc.key, got, tc.expected)
		}
	}
}
