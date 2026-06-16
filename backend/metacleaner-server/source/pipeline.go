package source

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

// Cfg returns the pipeline's configuration (used by tests to access TempStoragePath).
func (p *CleaningPipeline) Cfg() Config {
	return p.cfg
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

		// Use LocalID for progress events so the frontend can match events
		// to the file IDs it received in the upload response.
		fileProgressID := f.LocalID
		if fileProgressID == "" {
			fileProgressID = f.ID
		}

		progressFn(ProgressEvent{
			Type:            "file_progress",
			FileID:          fileProgressID,
			Status:          "in_progress",
			OverallProgress: CalculateJobProgress(i, total),
			FilesCompleted:  i,
			TotalFiles:      total,
			CurrentFileID:   fileProgressID,
		})

		originalPath := filepath.Join(p.cfg.TempStoragePath, "uploads", f.LocalID+"_original."+strings.TrimPrefix(f.FileExtension, "."))
		cleanedDir := filepath.Join(p.cfg.TempStoragePath, "cleaned")
		if err := os.MkdirAll(cleanedDir, 0755); err != nil {
			f.Status = "error"
			f.ErrorCode = ErrInsufficientStorage
			f.ErrorMessage = "failed to create cleaned directory"
			progressFn(buildFileErrorEvent(f, i+1, total))
			continue
		}

		cleanedPath := filepath.Join(cleanedDir, f.LocalID+"_cleaned."+strings.TrimPrefix(f.FileExtension, "."))

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
			FileID:          fileProgressID,
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
		FieldsRemoved:       job.FieldsRemoved,
		TotalTimeSeconds:    elapsed,
		GPSLocationsRemoved: job.GPSLocationsRemoved,
	})

	return nil
}

func buildFileErrorEvent(f *FileRecord, completed, total int) ProgressEvent {
	fileProgressID := f.LocalID
	if fileProgressID == "" {
		fileProgressID = f.ID
	}
	return ProgressEvent{
		Type:            "file_error",
		FileID:          fileProgressID,
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

	// Count C2PA chunks that were stripped (not visible to exiftool)
	c2paCount := countC2PAChunks(originalPath)
	if c2paCount > 0 {
		for i := 0; i < c2paCount; i++ {
			breakdown.PNGChunks = append(breakdown.PNGChunks, MetadataField{
				Label: "C2PA Content Credentials",
				Value: "removed",
			})
		}
		breakdown.TotalRemoved += c2paCount
	}

	return &CleaningResult{
		FieldsRemoved:     breakdown.TotalRemoved,
		GPSRemoved:        gpsRemoved,
		MetadataBreakdown: breakdown,
		Device:            device,
	}, nil
}

// countC2PAChunks counts the number of C2PA-related chunks (caBX, jUMb) in a PNG file,
// or C2PA APP11 segments in a JPEG file.
func countC2PAChunks(filePath string) int {
	ext := strings.ToLower(filepath.Ext(filePath))
	data, err := os.ReadFile(filePath)
	if err != nil {
		return 0
	}

	switch ext {
	case ".png":
		return countPngC2PAChunks(data)
	case ".jpg", ".jpeg":
		return countJpegC2PASegments(data)
	default:
		return 0
	}
}

func countPngC2PAChunks(data []byte) int {
	if len(data) < 8 || data[0] != 0x89 || data[1] != 0x50 {
		return 0
	}

	count := 0
	offset := 8
	for offset+8 <= len(data) {
		chunkLength := int(data[offset])<<24 | int(data[offset+1])<<16 | int(data[offset+2])<<8 | int(data[offset+3])
		chunkType := string(data[offset+4 : offset+8])
		totalChunkSize := 12 + chunkLength
		if offset+totalChunkSize > len(data) {
			break
		}
		if chunkType == "caBX" || chunkType == "jUMb" {
			count++
		}
		offset += totalChunkSize
	}
	return count
}

func countJpegC2PASegments(data []byte) int {
	if len(data) < 2 || data[0] != 0xFF || data[1] != 0xD8 {
		return 0
	}

	count := 0
	offset := 2
	for offset+2 <= len(data) {
		if data[offset] != 0xFF {
			break
		}
		marker := data[offset+1]
		if marker == 0xDA {
			break
		}
		if marker == 0xFF {
			offset++
			continue
		}
		if marker == 0x00 || (marker >= 0xD0 && marker <= 0xD9) {
			offset += 2
			continue
		}
		if offset+4 > len(data) {
			break
		}
		segLength := int(data[offset+2])<<8 | int(data[offset+3])
		totalSize := 2 + segLength
		if offset+totalSize > len(data) {
			break
		}
		if marker == 0xEB && segLength > 10 {
			segData := string(data[offset+4 : offset+totalSize])
			if strings.Contains(segData, "jumb") || strings.Contains(segData, "c2pa") || strings.Contains(segData, "JP") {
				count++
			}
		}
		offset += totalSize
	}
	return count
}

// safeMetadataWhitelist contains metadata field keys that are NOT privacy-relevant.
// These are purely technical/structural fields that do not reveal personal information.
// Fields NOT in this whitelist are considered risky and will be reported as removed.
// This whitelist is aligned with the frontend scanner's categorizeField() logic —
// any field that frontend does NOT categorize as risky should be whitelisted here.
var safeMetadataWhitelist = map[string]bool{
	// Image dimensions and structure
	"ImageWidth":        true,
	"ImageHeight":       true,
	"ImageSize":         true,
	"Megapixels":        true,
	"BitDepth":          true,
	"BitsPerSample":     true,
	"ColorComponents":   true,
	"ColorSpace":        true,
	"ColorType":         true,
	"Compression":       true,
	"EncodingProcess":   true,
	"Filter":            true,
	"Interlace":         true,
	"XResolution":       true,
	"YResolution":       true,
	"ResolutionUnit":    true,
	"YCbCrSubSampling":  true,
	"YCbCrPositioning":  true,
	"SamplesPerPixel":   true,
	"PhotometricInterpretation": true,
	"PlanarConfiguration":       true,
	"RowsPerStrip":      true,
	"StripOffsets":       true,
	"StripByteCounts":    true,
	"Orientation":       true,

	// EXIF technical fields (non-personal)
	"ExifImageWidth":          true,
	"ExifImageHeight":         true,
	"ExifVersion":             true,
	"FlashpixVersion":         true,
	"ComponentsConfiguration": true,
	"CompressedBitsPerPixel":  true,
	"InteropIndex":            true,
	"InteropVersion":          true,
	"ThumbnailOffset":         true,
	"ThumbnailLength":         true,
	"ThumbnailImage":          true,
	"PreviewImage":            true,
	"ExifToolVersion":         true,
	"Flash":                   true,
	"FocalLength":             true,
	"FocalLengthIn35mmFormat": true,
	"FocalPlaneXResolution":   true,
	"FocalPlaneYResolution":   true,
	"FocalPlaneResolutionUnit": true,
	"ExposureTime":            true,
	"FNumber":                 true,
	"ISO":                     true,
	"ISOSpeed":                true,
	"ExposureProgram":         true,
	"ExposureMode":            true,
	"ExposureCompensation":    true,
	"MeteringMode":            true,
	"WhiteBalance":            true,
	"LightSource":             true,
	"SceneCaptureType":        true,
	"SceneType":               true,
	"SensingMethod":           true,
	"SharpnessFrequency":      true,
	"Sharpness":               true,
	"Saturation":              true,
	"Contrast":                true,
	"GainControl":             true,
	"SubjectDistanceRange":    true,
	"FileSource":              true,
	"CustomRendered":          true,
	"DigitalZoomRatio":        true,
	"MaxApertureValue":        true,
	"ApertureValue":           true,
	"BrightnessValue":         true,
	"ShutterSpeedValue":       true,
	"LightValue":              true,
	"CFAPattern":              true,
	"ColorFilter":             true,

	// File type/format identification
	"FileType":          true,
	"FileTypeExtension": true,
	"MIMEType":          true,
	"ExifByteOrder":     true,
	"JFIFVersion":       true,

	// Color profile (ICC)
	"ProfileCMMType":          true,
	"ProfileVersion":          true,
	"ProfileClass":            true,
	"ColorSpaceData":          true,
	"ProfileConnectionSpace":  true,
	"ProfileCreator":          true,
	"ProfileDescription":      true,
	"MediaWhitePoint":         true,
	"MediaBlackPoint":         true,
	"RedMatrixColumn":         true,
	"GreenMatrixColumn":       true,
	"BlueMatrixColumn":        true,
	"RedTRC":                  true,
	"GreenTRC":                true,
	"BlueTRC":                 true,
	"DeviceModelDesc":         true,
	"DeviceMfgDesc":           true,
	"ChromaticAdaptation":     true,
	"ProfileFileSignature":    true,
	"ProfileDateTime":         true,
	"PrimaryPlatform":         true,
	"CMMFlags":                true,
	"DeviceAttributes":        true,
	"RenderingIntent":         true,
	"ConnectionSpaceIlluminant": true,

	// PNG structural
	"BackgroundColor": true,
	"PixelsPerUnitX":  true,
	"PixelsPerUnitY":  true,
	"PixelUnits":      true,
	"Gamma":           true,
	"SRGBRendering":   true,

	// Video/audio codec parameters (technical, not personal)
	"Duration":         true,
	"VideoFrameRate":   true,
	"AudioBitrate":     true,
	"AudioSampleRate":  true,
	"AudioChannels":    true,
	"VideoCodec":       true,
	"AudioCodec":       true,
	"BitRate":          true,
	"AvgBitrate":       true,
	"ImagePixelWidth":  true,
	"ImagePixelHeight": true,
}

// isWhitelistedField returns true if the field is safe (non-privacy) metadata.
func isWhitelistedField(key string) bool {
	return safeMetadataWhitelist[key]
}

// exifReadMetadata runs `exiftool -json <file>` and returns the flat key-value map + device string.
// Only privacy-relevant fields (not in whitelist) are returned.
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

		// Extract device info before filtering
		if k == "Model" || k == "DeviceModel" {
			device = strVal
		} else if device == "" && k == "Make" {
			device = strVal
		}

		// Skip whitelisted (safe/technical) fields — don't report them as removed
		if isWhitelistedField(k) {
			continue
		}

		fields[k] = strVal
	}

	return fields, device, nil
}

// exifStrip runs `exiftool -all= -o <cleaned_path> <original_path>`.
// For PNG files, it also removes C2PA content credential chunks (caBX, jUMb).
func exifStrip(ctx context.Context, originalPath, cleanedPath string) error {
	cmd := exec.CommandContext(ctx, "exiftool", "-all=", "-o", cleanedPath, originalPath)
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("%w: %s", err, stderr.String())
	}

	// Post-process to remove C2PA chunks that exiftool doesn't strip
	ext := strings.ToLower(filepath.Ext(cleanedPath))
	switch ext {
	case ".png":
		if err := stripPngC2PAChunks(cleanedPath); err != nil {
			return fmt.Errorf("c2pa strip: %w", err)
		}
	case ".jpg", ".jpeg":
		if err := stripJpegC2PASegments(cleanedPath); err != nil {
			return fmt.Errorf("c2pa strip: %w", err)
		}
	}

	return nil
}

// stripPngC2PAChunks rewrites a PNG file excluding caBX and jUMb chunks
// which contain C2PA content credentials (used by AI generators for provenance).
func stripPngC2PAChunks(pngPath string) error {
	data, err := os.ReadFile(pngPath)
	if err != nil {
		return err
	}

	// PNG signature: 8 bytes
	if len(data) < 8 || data[0] != 0x89 || data[1] != 0x50 || data[2] != 0x4e || data[3] != 0x47 {
		return nil // Not a valid PNG, skip silently
	}

	var output bytes.Buffer
	output.Write(data[:8]) // PNG signature

	offset := 8
	modified := false

	for offset+8 <= len(data) {
		// Chunk: 4 bytes length + 4 bytes type + data + 4 bytes CRC
		chunkLength := int(data[offset])<<24 | int(data[offset+1])<<16 | int(data[offset+2])<<8 | int(data[offset+3])
		chunkType := string(data[offset+4 : offset+8])

		totalChunkSize := 12 + chunkLength // 4 (length) + 4 (type) + data + 4 (CRC)
		if offset+totalChunkSize > len(data) {
			// Malformed chunk — write remaining bytes as-is
			output.Write(data[offset:])
			break
		}

		// Skip C2PA-related chunks
		if chunkType == "caBX" || chunkType == "jUMb" {
			modified = true
			offset += totalChunkSize
			continue
		}

		output.Write(data[offset : offset+totalChunkSize])
		offset += totalChunkSize
	}

	if !modified {
		return nil // No C2PA chunks found, no rewrite needed
	}

	return os.WriteFile(pngPath, output.Bytes(), 0644)
}

// stripJpegC2PASegments rewrites a JPEG file excluding APP11 (0xFFEB) segments
// that contain C2PA/JUMBF content credentials.
func stripJpegC2PASegments(jpegPath string) error {
	data, err := os.ReadFile(jpegPath)
	if err != nil {
		return err
	}

	// JPEG SOI check
	if len(data) < 2 || data[0] != 0xFF || data[1] != 0xD8 {
		return nil // Not a valid JPEG, skip silently
	}

	var output bytes.Buffer
	output.Write(data[:2]) // SOI marker

	offset := 2
	modified := false

	for offset+2 <= len(data) {
		if data[offset] != 0xFF {
			// Not a marker — write rest of file (image data after SOS)
			output.Write(data[offset:])
			break
		}

		marker := data[offset+1]

		// Start of Scan (SOS) — everything after this is image data
		if marker == 0xDA {
			output.Write(data[offset:])
			break
		}

		// Padding bytes (0xFF followed by 0xFF)
		if marker == 0xFF {
			output.WriteByte(0xFF)
			offset++
			continue
		}

		// Standalone markers (no length field)
		if marker == 0x00 || (marker >= 0xD0 && marker <= 0xD9) {
			output.Write(data[offset : offset+2])
			offset += 2
			continue
		}

		// Segment with length
		if offset+4 > len(data) {
			output.Write(data[offset:])
			break
		}

		segLength := int(data[offset+2])<<8 | int(data[offset+3])
		totalSize := 2 + segLength // marker (2) + length includes itself + data

		if offset+totalSize > len(data) {
			output.Write(data[offset:])
			break
		}

		// APP11 (0xEB) — used for C2PA/JUMBF
		if marker == 0xEB {
			// Check if this APP11 segment contains JUMBF/C2PA data
			if segLength > 10 {
				segData := data[offset+4 : offset+totalSize]
				segStr := string(segData)
				if strings.Contains(segStr, "jumb") || strings.Contains(segStr, "c2pa") ||
					strings.Contains(segStr, "JP") { // JP is the JUMBF box type prefix
					modified = true
					offset += totalSize
					continue
				}
			}
		}

		output.Write(data[offset : offset+totalSize])
		offset += totalSize
	}

	if !modified {
		return nil
	}

	return os.WriteFile(jpegPath, output.Bytes(), 0644)
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
	if lower == "handler_name" || strings.Contains(lower, "encoder") ||
		strings.Contains(lower, "software") || lower == "make" || lower == "model" {
		return "MP4"
	}

	// Non-privacy container metadata — skip these
	// major_brand, minor_version, compatible_brands, language, handler_type, etc.
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
