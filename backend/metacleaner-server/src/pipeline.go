package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

// CleaningPipeline orchestrates file metadata stripping.
type CleaningPipeline struct {
	cfg Config
}

// NewCleaningPipeline creates a pipeline using the given config.
func NewCleaningPipeline(cfg Config) *CleaningPipeline {
	return &CleaningPipeline{cfg: cfg}
}

// ProcessJob processes all files in the job sequentially, calling progressFn for each event.
func (p *CleaningPipeline) ProcessJob(ctx context.Context, job *Job, files []FileRecord, progressFn func(ProgressEvent)) error {
	start := time.Now()
	total := len(files)

	for i := range files {
		if ctx.Err() != nil {
			return ctx.Err()
		}

		f := &files[i]
		f.Status = "in_progress"

		progressFn(ProgressEvent{
			Type:            "file_progress",
			FileID:          f.ID,
			Status:          "in_progress",
			OverallProgress: CalculateJobProgress(i, total),
			FilesCompleted:  i,
			TotalFiles:      total,
			CurrentFileID:   f.ID,
		})

		originalPath := filepath.Join(p.cfg.TempStoragePath, "uploads", f.ID+"_original."+strings.TrimPrefix(f.FileExtension, "."))
		cleanedDir := filepath.Join(p.cfg.TempStoragePath, "cleaned")
		if err := os.MkdirAll(cleanedDir, 0755); err != nil {
			f.Status = "error"
			f.ErrorCode = ErrInsufficientStorage
			f.ErrorMessage = "failed to create cleaned directory"
			progressFn(buildFileErrorEvent(f, i+1, total))
			continue
		}

		cleanedPath := filepath.Join(cleanedDir, f.ID+"_cleaned."+strings.TrimPrefix(f.FileExtension, "."))

		var result *CleaningResult
		var processErr error

		if SelectTool(f.FileExtension) == "exiftool" {
			result, processErr = runExifTool(ctx, originalPath, cleanedPath)
		} else {
			result, processErr = runFFmpeg(ctx, originalPath, cleanedPath)
		}

		now := time.Now()
		if processErr != nil {
			f.Status = "error"
			f.ErrorCode = "PROCESSING_FAILED"
			f.ErrorMessage = processErr.Error()
			progressFn(buildFileErrorEvent(f, i+1, total))
			continue
		}

		f.Status = "done"
		f.ProcessedAt = &now
		f.FieldsRemoved = result.FieldsRemoved
		f.GPSRemoved = result.GPSRemoved
		f.Device = result.Device
		f.MetadataBreakdown = result.MetadataBreakdown

		job.FilesCompleted++
		job.FieldsRemoved += result.FieldsRemoved
		if result.GPSRemoved {
			job.GPSLocationsRemoved++
		}

		progressFn(ProgressEvent{
			Type:            "file_complete",
			FileID:          f.ID,
			Status:          "done",
			FieldsRemoved:   result.FieldsRemoved,
			GPSRemoved:      result.GPSRemoved,
			OverallProgress: CalculateJobProgress(i+1, total),
			FilesCompleted:  i + 1,
			TotalFiles:      total,
		})
	}

	elapsed := int(time.Since(start).Seconds())
	job.TotalTimeSeconds = elapsed
	job.Status = "completed"
	completed := time.Now()
	job.CompletedAt = &completed

	progressFn(ProgressEvent{
		Type:                "job_complete",
		JobID:               job.ID,
		Status:              "completed",
		OverallProgress:     100,
		FilesCompleted:      job.FilesCompleted,
		TotalFiles:          total,
		TotalTimeSeconds:    elapsed,
		GPSLocationsRemoved: job.GPSLocationsRemoved,
	})

	return nil
}

func buildFileErrorEvent(f *FileRecord, completed, total int) ProgressEvent {
	return ProgressEvent{
		Type:            "file_error",
		FileID:          f.ID,
		Status:          "error",
		ErrorCode:       f.ErrorCode,
		Message:         f.ErrorMessage,
		OverallProgress: CalculateJobProgress(completed, total),
		FilesCompleted:  completed,
		TotalFiles:      total,
	}
}

// --- ExifTool ---

// runExifTool reads metadata with `exiftool -json`, strips with `exiftool -all= -o`, returns CleaningResult.
func runExifTool(ctx context.Context, originalPath, cleanedPath string) (*CleaningResult, error) {
	fields, device, err := exifReadMetadata(ctx, originalPath)
	if err != nil {
		return nil, fmt.Errorf("exiftool read: %w", err)
	}

	if err := exifStrip(ctx, originalPath, cleanedPath); err != nil {
		return nil, fmt.Errorf("exiftool strip: %w", err)
	}

	breakdown := categorizeExifFields(fields)
	gpsRemoved := len(breakdown.GPSFields) > 0

	return &CleaningResult{
		FieldsRemoved:     breakdown.TotalRemoved,
		GPSRemoved:        gpsRemoved,
		MetadataBreakdown: breakdown,
		Device:            device,
	}, nil
}

// exifReadMetadata runs `exiftool -json <file>` and returns the flat key-value map + device string.
func exifReadMetadata(ctx context.Context, path string) (map[string]string, string, error) {
	out, err := exec.CommandContext(ctx, "exiftool", "-json", path).Output()
	if err != nil {
		return nil, "", fmt.Errorf("exiftool exited with error: %w", err)
	}

	var records []map[string]interface{}
	if err := json.Unmarshal(out, &records); err != nil || len(records) == 0 {
		return nil, "", fmt.Errorf("failed to parse exiftool output")
	}

	record := records[0]
	fields := make(map[string]string, len(record))
	var device string

	for k, v := range record {
		// Skip ExifTool's internal bookkeeping fields
		if k == "SourceFile" || k == "ExifToolVersion" || k == "Directory" ||
			k == "FileName" || k == "FileSize" || k == "FileModifyDate" ||
			k == "FileAccessDate" || k == "FileInodeChangeDate" || k == "FilePermissions" {
			continue
		}
		strVal := fmt.Sprintf("%v", v)
		fields[k] = strVal

		if k == "Model" || k == "DeviceModel" {
			device = strVal
		} else if device == "" && k == "Make" {
			device = strVal
		}
	}

	return fields, device, nil
}

// exifStrip runs `exiftool -all= -o <cleaned_path> <original_path>`.
func exifStrip(ctx context.Context, originalPath, cleanedPath string) error {
	cmd := exec.CommandContext(ctx, "exiftool", "-all=", "-o", cleanedPath, originalPath)
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("%w: %s", err, stderr.String())
	}
	return nil
}

// categorizeExifFields splits flat exif fields into GPS / XMP / EXIF buckets.
func categorizeExifFields(fields map[string]string) *MetadataDetail {
	detail := &MetadataDetail{}
	for k, v := range fields {
		field := MetadataField{Label: k, Value: v}
		cat := CategorizeMetadataField(k, "exif")
		switch cat {
		case "GPS":
			detail.GPSFields = append(detail.GPSFields, field)
		case "XMP":
			detail.XMPFields = append(detail.XMPFields, field)
		default:
			detail.EXIFFields = append(detail.EXIFFields, field)
		}
	}
	detail.TotalRemoved = len(detail.GPSFields) + len(detail.XMPFields) + len(detail.EXIFFields)
	return detail
}

// --- FFmpeg ---

// runFFmpeg reads metadata with ffprobe, strips with ffmpeg -map_metadata -1, returns CleaningResult.
func runFFmpeg(ctx context.Context, originalPath, cleanedPath string) (*CleaningResult, error) {
	fields, err := ffprobeReadMetadata(ctx, originalPath)
	if err != nil {
		return nil, fmt.Errorf("ffprobe read: %w", err)
	}

	if err := ffmpegStrip(ctx, originalPath, cleanedPath); err != nil {
		return nil, fmt.Errorf("ffmpeg strip: %w", err)
	}

	breakdown := categorizeFFmpegFields(fields)

	return &CleaningResult{
		FieldsRemoved:     breakdown.TotalRemoved,
		GPSRemoved:        false, // video metadata doesn't include GPS in this implementation
		MetadataBreakdown: breakdown,
	}, nil
}

// ffprobeOutput is the JSON structure returned by ffprobe.
type ffprobeOutput struct {
	Format  ffprobeFormat    `json:"format"`
	Streams []ffprobeStream  `json:"streams"`
}

type ffprobeFormat struct {
	Tags map[string]string `json:"tags"`
}

type ffprobeStream struct {
	Tags map[string]string `json:"tags"`
}

// ffprobeReadMetadata runs ffprobe and returns a flat key-value map of all metadata tags.
func ffprobeReadMetadata(ctx context.Context, path string) (map[string]string, error) {
	args := []string{
		"-v", "quiet",
		"-print_format", "json",
		"-show_format",
		"-show_streams",
		path,
	}
	out, err := exec.CommandContext(ctx, "ffprobe", args...).Output()
	if err != nil {
		return nil, fmt.Errorf("ffprobe exited with error: %w", err)
	}

	var probe ffprobeOutput
	if err := json.Unmarshal(out, &probe); err != nil {
		return nil, fmt.Errorf("failed to parse ffprobe output")
	}

	fields := make(map[string]string)
	for k, v := range probe.Format.Tags {
		fields[k] = v
	}
	for _, stream := range probe.Streams {
		for k, v := range stream.Tags {
			fields[k] = v
		}
	}
	return fields, nil
}

// ffmpegStrip runs ffmpeg stripping all global and per-stream metadata without re-encoding.
func ffmpegStrip(ctx context.Context, originalPath, cleanedPath string) error {
	args := []string{
		"-i", originalPath,
		"-map_metadata", "-1",
		"-map_metadata:s", "-1",
		"-fflags", "+bitexact",
		"-flags:v", "+bitexact",
		"-flags:a", "+bitexact",
		"-c", "copy",
		cleanedPath,
	}
	cmd := exec.CommandContext(ctx, "ffmpeg", args...)
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("%w: %s", err, stderr.String())
	}
	return nil
}

// categorizeFFmpegFields splits ffprobe tags into ID3 and MP4 atom buckets.
func categorizeFFmpegFields(fields map[string]string) *MetadataDetail {
	detail := &MetadataDetail{}
	for k, v := range fields {
		field := MetadataField{Label: k, Value: v}
		cat := CategorizeMetadataField(k, "ffmpeg")
		switch cat {
		case "ID3":
			detail.ID3Fields = append(detail.ID3Fields, field)
		default:
			detail.MP4Atoms = append(detail.MP4Atoms, field)
		}
	}
	detail.TotalRemoved = len(detail.ID3Fields) + len(detail.MP4Atoms)
	return detail
}

// --- Categorization ---

// CategorizeMetadataField returns the category for a metadata field key.
// source: "exif" → GPS / XMP / EXIF; "ffmpeg" → ID3 / MP4
func CategorizeMetadataField(key string, source string) string {
	upper := strings.ToUpper(key)
	switch source {
	case "exif":
		if strings.HasPrefix(upper, "GPS") {
			return "GPS"
		}
		if strings.HasPrefix(upper, "XMP") {
			return "XMP"
		}
		return "EXIF"
	case "ffmpeg":
		// ID3 tags are typically lowercase single-word tags used in MP3/AAC
		// Common ID3 frame IDs include TIT2, TPE1, TALB, TRCK, etc.
		// ffprobe usually returns them as human-readable lowercased keys
		id3Keys := map[string]bool{
			"TITLE": true, "ARTIST": true, "ALBUM": true, "ALBUMARTIST": true,
			"COMMENT": true, "GENRE": true, "TRACK": true, "DATE": true, "YEAR": true,
			"COMPOSER": true, "LYRICS": true, "DESCRIPTION": true, "ENCODER": true,
		}
		if id3Keys[upper] {
			return "ID3"
		}
		return "MP4"
	default:
		return "EXIF"
	}
}
