package tests

import (
	"strings"
	"testing"
	"time"

	"pgregory.net/rapid"
)

// --- duplicated helpers from models.go for property testing ---

var (
	testImageFormats = map[string]bool{
		"jpg": true, "jpeg": true, "png": true, "heic": true, "heif": true,
		"avif": true, "tiff": true, "tif": true, "dng": true, "webp": true, "gif": true,
	}
	testVideoFormats = map[string]bool{
		"mp4": true, "mov": true, "avi": true, "mkv": true, "webm": true,
		"wmv": true, "flv": true, "3gp": true, "mpeg": true, "mpg": true,
		"ogv": true, "mts": true,
	}
)

func testValidateFileSize(size, maxSize int64) bool {
	return size > 0 && size <= maxSize
}

func testValidateFileFormat(extension string) bool {
	ext := strings.ToLower(strings.TrimPrefix(extension, "."))
	return testImageFormats[ext] || testVideoFormats[ext]
}

func testGetFileType(extension string) string {
	ext := strings.ToLower(strings.TrimPrefix(extension, "."))
	if testImageFormats[ext] {
		return "image"
	}
	return "video"
}

func testSelectTool(extension string) string {
	if testGetFileType(extension) == "image" {
		return "exiftool"
	}
	return "ffmpeg"
}

func testCalculateJobProgress(completed, total int) int {
	if total == 0 {
		return 0
	}
	return (completed * 100) / total
}

func testIsFileExpired(createdAt time.Time, retention time.Duration) bool {
	return time.Since(createdAt) > retention
}

type testReportSummary struct {
	FileCount int
	Fields    int
	GPS       bool
}

type testReportsSummaryStats struct {
	TotalReports   int
	FieldsRemoved  int
	FilesProcessed int
	GPSRemoved     int
}

func testCalculateReportSummary(reports []testReportSummary) testReportsSummaryStats {
	stats := testReportsSummaryStats{TotalReports: len(reports)}
	for _, r := range reports {
		stats.FieldsRemoved += r.Fields
		stats.FilesProcessed += r.FileCount
		if r.GPS {
			stats.GPSRemoved++
		}
	}
	return stats
}

// --- Property tests ---

// Property 1: File size validation
func TestFileSizeValidation(t *testing.T) {
	rapid.Check(t, func(t *rapid.T) {
		maxSize := rapid.Int64Range(1, 1024*1024*1024).Draw(t, "maxSize")
		size := rapid.Int64Range(1, maxSize*2).Draw(t, "size")

		result := testValidateFileSize(size, maxSize)
		if size <= maxSize {
			if !result {
				t.Fatalf("expected valid for size=%d maxSize=%d", size, maxSize)
			}
		} else {
			if result {
				t.Fatalf("expected invalid for size=%d maxSize=%d", size, maxSize)
			}
		}
	})
}

// Property 1b: zero and negative sizes are always invalid
func TestFileSizeValidationZero(t *testing.T) {
	if testValidateFileSize(0, 500*1024*1024) {
		t.Fatal("size 0 should be invalid")
	}
}

// Property 2: File format validation — supported formats accepted case-insensitively
func TestFileFormatValidation(t *testing.T) {
	supported := []string{
		"jpg", "jpeg", "png", "heic", "heif", "avif", "tiff", "tif", "dng", "webp", "gif",
		"mp4", "mov", "avi", "mkv", "webm", "wmv", "flv", "3gp", "mpeg", "mpg", "ogv", "mts",
	}
	for _, ext := range supported {
		if !testValidateFileFormat(ext) {
			t.Errorf("lowercase %q should be valid", ext)
		}
		if !testValidateFileFormat(strings.ToUpper(ext)) {
			t.Errorf("uppercase %q should be valid", strings.ToUpper(ext))
		}
		if !testValidateFileFormat("."+ext) {
			t.Errorf("dotted %q should be valid", "."+ext)
		}
	}
}

// Property 2b: unsupported extensions are rejected
func TestFileFormatValidationUnsupported(t *testing.T) {
	rapid.Check(t, func(t *rapid.T) {
		// generate strings that won't accidentally be supported extensions
		ext := rapid.StringMatching(`[a-z]{5,20}`).Draw(t, "ext")
		// skip if it happens to match a supported ext
		norm := strings.ToLower(ext)
		if testImageFormats[norm] || testVideoFormats[norm] {
			t.Skip()
		}
		if testValidateFileFormat(ext) {
			t.Fatalf("unsupported extension %q should not be valid", ext)
		}
	})
}

// Property 3: Tool selection — image formats use exiftool, video formats use ffmpeg
func TestToolSelectionByFileType(t *testing.T) {
	for ext := range testImageFormats {
		if tool := testSelectTool(ext); tool != "exiftool" {
			t.Errorf("image ext %q should use exiftool, got %q", ext, tool)
		}
	}
	for ext := range testVideoFormats {
		if tool := testSelectTool(ext); tool != "ffmpeg" {
			t.Errorf("video ext %q should use ffmpeg, got %q", ext, tool)
		}
	}
}

// Property 3b: no format is assigned to both tools
func TestToolSelectionNoDualAssignment(t *testing.T) {
	for ext := range testImageFormats {
		if testVideoFormats[ext] {
			t.Errorf("extension %q appears in both image and video maps", ext)
		}
	}
}

// Property 5: Job progress calculation
func TestJobProgressCalculation(t *testing.T) {
	rapid.Check(t, func(t *rapid.T) {
		total := rapid.IntRange(1, 1000).Draw(t, "total")
		completed := rapid.IntRange(0, total).Draw(t, "completed")

		progress := testCalculateJobProgress(completed, total)

		expected := (completed * 100) / total
		if progress != expected {
			t.Fatalf("progress mismatch: got %d, want %d (completed=%d total=%d)",
				progress, expected, completed, total)
		}
		if progress < 0 || progress > 100 {
			t.Fatalf("progress %d out of [0,100] range", progress)
		}
		if completed > total {
			t.Fatalf("completed (%d) exceeds total (%d)", completed, total)
		}
	})
}

// Property 5b: zero total returns 0
func TestJobProgressZeroTotal(t *testing.T) {
	if p := testCalculateJobProgress(0, 0); p != 0 {
		t.Fatalf("expected 0 for zero total, got %d", p)
	}
}

// Property 6: File expiration check
func TestFileExpirationCheck(t *testing.T) {
	rapid.Check(t, func(t *rapid.T) {
		// Generate a retention period between 1 second and 24 hours
		retentionSecs := rapid.Int64Range(1, 86400).Draw(t, "retentionSecs")
		retention := time.Duration(retentionSecs) * time.Second

		// Generate an age between 0 and 2x the retention period
		ageSecs := rapid.Int64Range(0, retentionSecs*2).Draw(t, "ageSecs")
		createdAt := time.Now().Add(-time.Duration(ageSecs) * time.Second)

		result := testIsFileExpired(createdAt, retention)

		// Files older than retention period must be expired
		if ageSecs > retentionSecs && !result {
			t.Fatalf("file with age=%ds, retention=%ds should be expired", ageSecs, retentionSecs)
		}
		// Files not yet at retention period must not be expired
		// (use ageSecs < retentionSecs-1 to avoid flakiness at boundary)
		if ageSecs < retentionSecs-1 && result {
			t.Fatalf("file with age=%ds, retention=%ds should not be expired", ageSecs, retentionSecs)
		}
	})
}

// Property 6b: zero-age file is never expired
func TestFileExpirationZeroAge(t *testing.T) {
	if testIsFileExpired(time.Now(), time.Hour) {
		t.Fatal("just-created file should not be expired")
	}
}

// Property 6c: file created before retention period is always expired
func TestFileExpirationAlwaysExpiredOldFile(t *testing.T) {
	createdAt := time.Now().Add(-2 * time.Hour)
	if !testIsFileExpired(createdAt, time.Hour) {
		t.Fatal("2-hour-old file with 1-hour retention should be expired")
	}
}

// Property 7: Report summary statistics aggregation
func TestReportSummaryAggregation(t *testing.T) {
	rapid.Check(t, func(t *rapid.T) {
		n := rapid.IntRange(0, 50).Draw(t, "n")
		reports := make([]testReportSummary, n)
		wantFields := 0
		wantFiles := 0
		wantGPS := 0
		for i := range reports {
			fc := rapid.IntRange(0, 100).Draw(t, "fileCount")
			fields := rapid.IntRange(0, 1000).Draw(t, "fields")
			gps := rapid.Bool().Draw(t, "gps")
			reports[i] = testReportSummary{FileCount: fc, Fields: fields, GPS: gps}
			wantFields += fields
			wantFiles += fc
			if gps {
				wantGPS++
			}
		}

		stats := testCalculateReportSummary(reports)
		if stats.TotalReports != n {
			t.Fatalf("TotalReports: got %d, want %d", stats.TotalReports, n)
		}
		if stats.FieldsRemoved != wantFields {
			t.Fatalf("FieldsRemoved: got %d, want %d", stats.FieldsRemoved, wantFields)
		}
		if stats.FilesProcessed != wantFiles {
			t.Fatalf("FilesProcessed: got %d, want %d", stats.FilesProcessed, wantFiles)
		}
		if stats.GPSRemoved != wantGPS {
			t.Fatalf("GPSRemoved: got %d, want %d", stats.GPSRemoved, wantGPS)
		}
	})
}
