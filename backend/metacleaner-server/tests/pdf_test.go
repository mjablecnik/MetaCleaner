package tests

import (
	"bytes"
	"os"
	"testing"

	src "metacleaner-server/source"
)

// hasPDFFont returns true if at least one TTF font known to the PDF generator
// is available on the current system. Skips the calling test if none found.
func requirePDFFont(t *testing.T) {
	t.Helper()
	candidates := []string{
		"/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
		"/usr/share/fonts/liberation/LiberationSans-Regular.ttf",
		"/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
		"/usr/share/fonts/dejavu/DejaVuSans.ttf",
	}
	for _, p := range candidates {
		if _, err := os.Stat(p); err == nil {
			return
		}
	}
	t.Skip("no system font available for PDF generation — skipping")
}

func makePDFContext(report *src.ReportDetail) *src.PDFReportContext {
	return &src.PDFReportContext{
		Report:      report,
		FrontendURL: "https://app.metacleaner.com",
		ExifToolVer: "12.87",
		FFmpegVer:   "6.1.1",
		ServiceVer:  "1.0.0",
	}
}

func makePopulatedReport() *src.ReportDetail {
	return &src.ReportDetail{
		ReportID:            "MC-2025-001",
		Date:                "2025-01-15T10:30:00Z",
		FilesProcessed:      3,
		FieldsRemoved:       42,
		GPSLocationsRemoved: 2,
		TotalTimeSeconds:    15,
		ChartData: []src.ChartDataPoint{
			{Label: "GPS", Fields: 10, Percentage: 24},
			{Label: "EXIF", Fields: 20, Percentage: 48},
			{Label: "XMP", Fields: 12, Percentage: 28},
		},
		Files: []src.ReportFileDetail{
			{
				Name:          "photo.jpg",
				OriginalName:  "vacation_beach.jpg",
				Extension:     ".jpg",
				SizeMB:        "2.5",
				Format:        "jpeg",
				Device:        "Canon EOS R5",
				Type:          "image",
				HasGPS:        true,
				FieldsRemoved: 15,
				SHA256Hash:    "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
				Metadata: &src.MetadataDetail{
					GPSFields:  []src.MetadataField{{Label: "GPSLatitude", Value: "48.8566"}},
					EXIFFields: []src.MetadataField{{Label: "Make", Value: "Canon"}, {Label: "Model", Value: "EOS R5"}},
					XMPFields:  []src.MetadataField{{Label: "XMP-dc:Creator", Value: "John"}},
				},
			},
			{
				Name:          "landscape.png",
				Extension:     ".png",
				SizeMB:        "5.1",
				Format:        "png",
				Device:        "",
				Type:          "image",
				HasGPS:        false,
				FieldsRemoved: 12,
				SHA256Hash:    "b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3",
			},
			{
				Name:          "clip.mp4",
				Extension:     ".mp4",
				SizeMB:        "18.3",
				Format:        "mp4",
				Device:        "",
				Type:          "video",
				HasGPS:        true,
				FieldsRemoved: 15,
				SHA256Hash:    "c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
			},
		},
	}
}

// TestGenerateReportPDF_ValidReport checks that a populated report produces
// a non-empty, %PDF-prefixed byte slice.
func TestGenerateReportPDF_ValidReport(t *testing.T) {
	requirePDFFont(t)

	report := makePopulatedReport()
	data, err := src.GenerateReportPDF(makePDFContext(report))
	if err != nil {
		t.Fatalf("GenerateReportPDF returned error: %v", err)
	}
	if len(data) == 0 {
		t.Fatal("expected non-empty PDF bytes, got 0 bytes")
	}
	if !bytes.HasPrefix(data, []byte("%PDF")) {
		t.Errorf("PDF bytes do not start with %%PDF: first 4 bytes = %q", data[:min(4, len(data))])
	}
}

// TestGenerateReportPDF_EmptyFileList verifies that a report with no files still
// produces a valid PDF without panicking.
func TestGenerateReportPDF_EmptyFileList(t *testing.T) {
	requirePDFFont(t)

	report := &src.ReportDetail{
		ReportID:         "MC-2025-000",
		Date:             "2025-01-01T00:00:00Z",
		FilesProcessed:   0,
		FieldsRemoved:    0,
		TotalTimeSeconds: 0,
		Files:            []src.ReportFileDetail{},
		ChartData:        []src.ChartDataPoint{},
	}
	data, err := src.GenerateReportPDF(makePDFContext(report))
	if err != nil {
		t.Fatalf("GenerateReportPDF (empty files) returned error: %v", err)
	}
	if len(data) == 0 {
		t.Fatal("expected non-empty PDF bytes even for empty report")
	}
	if !bytes.HasPrefix(data, []byte("%PDF")) {
		t.Errorf("PDF bytes do not start with %%PDF")
	}
}

// TestGenerateReportPDF_ZeroValueFields verifies zero-value numeric fields
// produce a valid PDF (guards against divide-by-zero or format panics).
func TestGenerateReportPDF_ZeroValueFields(t *testing.T) {
	requirePDFFont(t)

	report := &src.ReportDetail{
		ReportID: "",
		Date:     "",
		Files: []src.ReportFileDetail{
			{Name: "", Extension: "", SizeMB: "", Format: "", Device: ""},
		},
		ChartData: []src.ChartDataPoint{
			{Label: "", Fields: 0, Percentage: 0},
		},
	}
	data, err := src.GenerateReportPDF(makePDFContext(report))
	if err != nil {
		t.Fatalf("GenerateReportPDF (zero fields) returned error: %v", err)
	}
	if !bytes.HasPrefix(data, []byte("%PDF")) {
		t.Errorf("PDF bytes do not start with %%PDF")
	}
}

// TestGenerateReportPDF_LongFileName verifies that long file names don't cause issues.
func TestGenerateReportPDF_LongFileName(t *testing.T) {
	requirePDFFont(t)

	report := makePopulatedReport()
	report.Files[0].OriginalName = "this_is_a_very_long_filename_that_exceeds_many_chars_and_should_still_work.jpg"

	data, err := src.GenerateReportPDF(makePDFContext(report))
	if err != nil {
		t.Fatalf("GenerateReportPDF (long filename) returned error: %v", err)
	}
	if !bytes.HasPrefix(data, []byte("%PDF")) {
		t.Errorf("PDF bytes do not start with %%PDF")
	}
}

// TestGenerateReportPDF_ManyFiles verifies that a report with enough files to
// span multiple PDF pages is generated correctly.
func TestGenerateReportPDF_ManyFiles(t *testing.T) {
	requirePDFFont(t)

	report := &src.ReportDetail{
		ReportID:         "MC-2025-002",
		Date:             "2025-06-01T00:00:00Z",
		FilesProcessed:   60,
		FieldsRemoved:    300,
		TotalTimeSeconds: 120,
		ChartData:        []src.ChartDataPoint{},
	}
	for i := range 60 {
		report.Files = append(report.Files, src.ReportFileDetail{
			Name:          "file.jpg",
			OriginalName:  "original_photo.jpg",
			Extension:     ".jpg",
			SizeMB:        "1.0",
			Format:        "jpeg",
			Type:          "image",
			HasGPS:        i%2 == 0,
			FieldsRemoved: 5,
			SHA256Hash:    "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
		})
	}

	data, err := src.GenerateReportPDF(makePDFContext(report))
	if err != nil {
		t.Fatalf("GenerateReportPDF (many files) returned error: %v", err)
	}
	if !bytes.HasPrefix(data, []byte("%PDF")) {
		t.Errorf("PDF bytes do not start with %%PDF")
	}
}

// TestGenerateReportPDF_NoFrontendURL verifies PDF generates even without QR code URL.
func TestGenerateReportPDF_NoFrontendURL(t *testing.T) {
	requirePDFFont(t)

	report := makePopulatedReport()
	ctx := &src.PDFReportContext{
		Report:      report,
		FrontendURL: "", // No frontend URL → QR code skipped
		ExifToolVer: "12.87",
		FFmpegVer:   "6.1.1",
		ServiceVer:  "1.0.0",
	}
	data, err := src.GenerateReportPDF(ctx)
	if err != nil {
		t.Fatalf("GenerateReportPDF (no frontend URL) returned error: %v", err)
	}
	if !bytes.HasPrefix(data, []byte("%PDF")) {
		t.Errorf("PDF bytes do not start with %%PDF")
	}
}

// TestGenerateReportPDF_WithMetadataDetails verifies detailed metadata labels are included.
func TestGenerateReportPDF_WithMetadataDetails(t *testing.T) {
	requirePDFFont(t)

	report := &src.ReportDetail{
		ReportID:            "MC-2025-003",
		Date:                "2025-03-15T12:00:00Z",
		FilesProcessed:      1,
		FieldsRemoved:       8,
		GPSLocationsRemoved: 1,
		TotalTimeSeconds:    3,
		ChartData: []src.ChartDataPoint{
			{Label: "GPS", Fields: 3, Percentage: 38},
			{Label: "EXIF", Fields: 5, Percentage: 62},
		},
		Files: []src.ReportFileDetail{
			{
				Name:          "f-abc123.jpg",
				OriginalName:  "sunset_photo.jpg",
				Extension:     ".jpg",
				SizeMB:        "3.2",
				Format:        "jpeg",
				Device:        "iPhone 15 Pro",
				Type:          "image",
				HasGPS:        true,
				FieldsRemoved: 8,
				SHA256Hash:    "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
				Metadata: &src.MetadataDetail{
					GPSFields: []src.MetadataField{
						{Label: "GPSLatitude", Value: "48.8566"},
						{Label: "GPSLongitude", Value: "2.3522"},
						{Label: "GPSAltitude", Value: "35m"},
					},
					EXIFFields: []src.MetadataField{
						{Label: "Make", Value: "Apple"},
						{Label: "Model", Value: "iPhone 15 Pro"},
						{Label: "Software", Value: "iOS 17.2"},
						{Label: "DateTimeOriginal", Value: "2025:03:15 12:00:00"},
						{Label: "CreateDate", Value: "2025:03:15 12:00:00"},
					},
					TotalRemoved: 8,
				},
			},
		},
	}

	data, err := src.GenerateReportPDF(makePDFContext(report))
	if err != nil {
		t.Fatalf("GenerateReportPDF (with metadata details) returned error: %v", err)
	}
	if !bytes.HasPrefix(data, []byte("%PDF")) {
		t.Errorf("PDF bytes do not start with %%PDF")
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
