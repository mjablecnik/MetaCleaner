package source

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"os/exec"
	"strings"
)

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
	gpsRemoved := len(breakdown.GPSFields) > 0

	return &CleaningResult{
		FieldsRemoved:     breakdown.TotalRemoved,
		GPSRemoved:        gpsRemoved,
		MetadataBreakdown: breakdown,
	}, nil
}

// ffprobeOutput is the JSON structure returned by ffprobe.
type ffprobeOutput struct {
	Format  ffprobeFormat   `json:"format"`
	Streams []ffprobeStream `json:"streams"`
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

// categorizeFFmpegFields splits ffprobe tags into privacy-relevant categories.
// Non-privacy container metadata (major_brand, compatible_brands, etc.) is excluded from the count.
func categorizeFFmpegFields(fields map[string]string) *MetadataDetail {
	detail := &MetadataDetail{}
	for k, v := range fields {
		cat := classifyFFmpegField(k)
		if cat == "" {
			continue // Skip non-privacy container metadata
		}
		field := MetadataField{Label: k, Value: v}
		switch cat {
		case "GPS":
			detail.GPSFields = append(detail.GPSFields, field)
		case "ID3":
			detail.ID3Fields = append(detail.ID3Fields, field)
		default:
			detail.MP4Atoms = append(detail.MP4Atoms, field)
		}
	}
	detail.TotalRemoved = len(detail.GPSFields) + len(detail.ID3Fields) + len(detail.MP4Atoms)
	return detail
}

// classifyFFmpegField returns a category for privacy-relevant ffprobe fields,
// or empty string for non-privacy container metadata that should be excluded from counts.
func classifyFFmpegField(key string) string {
	lower := strings.ToLower(key)

	// GPS-related fields
	if strings.Contains(lower, "location") || strings.Contains(lower, "gps") || lower == "xyz" {
		return "GPS"
	}

	// ID3 tags (common in audio/video)
	id3Keys := map[string]bool{
		"title": true, "artist": true, "album": true, "album_artist": true,
		"comment": true, "genre": true, "track": true, "date": true, "year": true,
		"composer": true, "lyrics": true, "description": true, "encoder": true,
		"copyright": true, "author": true, "performer": true,
	}
	if id3Keys[lower] {
		return "ID3"
	}

	// Timestamps
	if strings.Contains(lower, "creation_time") || strings.Contains(lower, "date") ||
		lower == "encoded_date" || lower == "tagged_date" || lower == "recorded_date" {
		return "MP4"
	}

	// Device/software identity
	if strings.Contains(lower, "encoder") ||
		strings.Contains(lower, "software") || lower == "make" || lower == "model" {
		return "MP4"
	}

	// Non-privacy container metadata — skip these
	if lower == "handler_name" {
		return ""
	}
	return ""
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
