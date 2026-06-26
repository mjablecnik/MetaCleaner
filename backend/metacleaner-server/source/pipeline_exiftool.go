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
)

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
	"ImageWidth": true, "ImageHeight": true, "ImageSize": true, "Megapixels": true,
	"BitDepth": true, "BitsPerSample": true, "ColorComponents": true, "ColorSpace": true,
	"ColorType": true, "Compression": true, "EncodingProcess": true, "Filter": true,
	"Interlace": true, "XResolution": true, "YResolution": true, "ResolutionUnit": true,
	"YCbCrSubSampling": true, "YCbCrPositioning": true, "SamplesPerPixel": true,
	"PhotometricInterpretation": true, "PlanarConfiguration": true, "RowsPerStrip": true,
	"StripOffsets": true, "StripByteCounts": true, "Orientation": true,

	// EXIF technical fields (non-personal)
	"ExifImageWidth": true, "ExifImageHeight": true, "ExifVersion": true,
	"FlashpixVersion": true, "ComponentsConfiguration": true, "CompressedBitsPerPixel": true,
	"InteropIndex": true, "InteropVersion": true, "ThumbnailOffset": true,
	"ThumbnailLength": true, "ThumbnailImage": true, "PreviewImage": true,
	"ExifToolVersion": true, "Flash": true, "FocalLength": true,
	"FocalLengthIn35mmFormat": true, "FocalPlaneXResolution": true,
	"FocalPlaneYResolution": true, "FocalPlaneResolutionUnit": true,
	"ExposureTime": true, "FNumber": true, "ISO": true, "ISOSpeed": true,
	"ExposureProgram": true, "ExposureMode": true, "ExposureCompensation": true,
	"MeteringMode": true, "WhiteBalance": true, "LightSource": true,
	"SceneCaptureType": true, "SceneType": true, "SensingMethod": true,
	"SharpnessFrequency": true, "Sharpness": true, "Saturation": true,
	"Contrast": true, "GainControl": true, "SubjectDistanceRange": true,
	"FileSource": true, "CustomRendered": true, "DigitalZoomRatio": true,
	"MaxApertureValue": true, "ApertureValue": true, "BrightnessValue": true,
	"ShutterSpeedValue": true, "LightValue": true, "CFAPattern": true, "ColorFilter": true,

	// File type/format identification
	"FileType": true, "FileTypeExtension": true, "MIMEType": true,
	"ExifByteOrder": true, "JFIFVersion": true,

	// Color profile (ICC)
	"ProfileCMMType": true, "ProfileVersion": true, "ProfileClass": true,
	"ColorSpaceData": true, "ProfileConnectionSpace": true, "ProfileCreator": true,
	"ProfileDescription": true, "MediaWhitePoint": true, "MediaBlackPoint": true,
	"RedMatrixColumn": true, "GreenMatrixColumn": true, "BlueMatrixColumn": true,
	"RedTRC": true, "GreenTRC": true, "BlueTRC": true,
	"DeviceModelDesc": true, "DeviceMfgDesc": true, "ChromaticAdaptation": true,
	"ProfileFileSignature": true, "ProfileDateTime": true, "PrimaryPlatform": true,
	"CMMFlags": true, "DeviceAttributes": true, "RenderingIntent": true,
	"ConnectionSpaceIlluminant": true,

	// PNG structural
	"BackgroundColor": true, "PixelsPerUnitX": true, "PixelsPerUnitY": true,
	"PixelUnits": true, "Gamma": true, "SRGBRendering": true,

	// Video/audio codec parameters (technical, not personal)
	"Duration": true, "VideoFrameRate": true, "AudioBitrate": true,
	"AudioSampleRate": true, "AudioChannels": true, "VideoCodec": true,
	"AudioCodec": true, "BitRate": true, "AvgBitrate": true,
	"ImagePixelWidth": true, "ImagePixelHeight": true,
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

	if len(data) < 8 || data[0] != 0x89 || data[1] != 0x50 || data[2] != 0x4e || data[3] != 0x47 {
		return nil // Not a valid PNG, skip silently
	}

	var output bytes.Buffer
	output.Write(data[:8]) // PNG signature

	offset := 8
	modified := false

	for offset+8 <= len(data) {
		chunkLength := int(data[offset])<<24 | int(data[offset+1])<<16 | int(data[offset+2])<<8 | int(data[offset+3])
		chunkType := string(data[offset+4 : offset+8])
		totalChunkSize := 12 + chunkLength
		if offset+totalChunkSize > len(data) {
			output.Write(data[offset:])
			break
		}

		if chunkType == "caBX" || chunkType == "jUMb" {
			modified = true
			offset += totalChunkSize
			continue
		}

		output.Write(data[offset : offset+totalChunkSize])
		offset += totalChunkSize
	}

	if !modified {
		return nil
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

	if len(data) < 2 || data[0] != 0xFF || data[1] != 0xD8 {
		return nil // Not a valid JPEG, skip silently
	}

	var output bytes.Buffer
	output.Write(data[:2]) // SOI marker

	offset := 2
	modified := false

	for offset+2 <= len(data) {
		if data[offset] != 0xFF {
			output.Write(data[offset:])
			break
		}

		marker := data[offset+1]

		if marker == 0xDA {
			output.Write(data[offset:])
			break
		}

		if marker == 0xFF {
			output.WriteByte(0xFF)
			offset++
			continue
		}

		if marker == 0x00 || (marker >= 0xD0 && marker <= 0xD9) {
			output.Write(data[offset : offset+2])
			offset += 2
			continue
		}

		if offset+4 > len(data) {
			output.Write(data[offset:])
			break
		}

		segLength := int(data[offset+2])<<8 | int(data[offset+3])
		totalSize := 2 + segLength

		if offset+totalSize > len(data) {
			output.Write(data[offset:])
			break
		}

		if marker == 0xEB {
			if segLength > 10 {
				segData := data[offset+4 : offset+totalSize]
				segStr := string(segData)
				if strings.Contains(segStr, "jumb") || strings.Contains(segStr, "c2pa") ||
					strings.Contains(segStr, "JP") {
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
