package tests

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	src "metacleaner-server/source"
)

// newMockSupabaseReports returns a test server that handles report-related endpoints.
func newMockSupabaseReports(t *testing.T) *httptest.Server {
	t.Helper()
	now := time.Now().UTC().Format(time.RFC3339)
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		path := r.URL.Path
		query := r.URL.RawQuery

		switch {
		case strings.Contains(path, "cleaning_reports") && strings.Contains(query, "order=date.desc"):
			// ListReports
			fmt.Fprintf(w, `[
				{"id":"r1","job_id":"j1","report_id":"MCR-2024-0115-AA","date":%q,"files_processed":3,"fields_removed":50,"gps_locations_removed":1,"total_time_ms":10,"file_types":"JPEG","dominant_type":"image","has_gps":true,"pdf_status":"uploaded","tags":["GPS","EXIF"],"icon_color":"green"},
				{"id":"r2","job_id":"j2","report_id":"MCR-2024-0116-BB","date":%q,"files_processed":2,"fields_removed":30,"gps_locations_removed":0,"total_time_ms":8,"file_types":"MP4","dominant_type":"video","has_gps":false,"pdf_status":"pending","tags":["ID3"],"icon_color":"blue"}
			]`, now, now)

		case strings.Contains(path, "cleaning_reports") && strings.Contains(query, "report_id=eq.MCR-2024-0115-AA"):
			// GetReportByHumanID — found
			fmt.Fprintf(w, `[{"id":"r1","job_id":"j1","report_id":"MCR-2024-0115-AA","date":%q,"files_processed":3,"fields_removed":50,"gps_locations_removed":1,"total_time_ms":10,"file_types":"JPEG","dominant_type":"image","has_gps":true,"pdf_status":"uploaded","pdf_path":"r1.pdf","tags":["GPS","EXIF"],"icon_color":"green","chart_data":[{"label":"GPS","fields":10,"percentage":20}]}]`, now)

		case strings.Contains(path, "cleaning_reports") && strings.Contains(query, "report_id=eq.MCR-NOTFOUND"):
			// GetReportByHumanID — not found
			w.Write([]byte(`[]`))

		case strings.Contains(path, "cleaning_reports") && strings.Contains(query, "report_id=eq.MCR-NOPDF"):
			// Report with pdf_status != "uploaded"
			fmt.Fprintf(w, `[{"id":"r3","job_id":"j3","report_id":"MCR-NOPDF","date":%q,"files_processed":1,"fields_removed":5,"gps_locations_removed":0,"total_time_ms":3,"file_types":"PNG","dominant_type":"image","has_gps":false,"pdf_status":"failed","pdf_path":"","tags":["EXIF"],"icon_color":"green"}]`, now)

		case strings.Contains(path, "job_files") && strings.Contains(query, "job_id=eq.j1"):
			// File records for job j1
			w.Write([]byte(`[{"id":"f1","job_id":"j1","file_name":"photo.jpg","file_extension":".jpg","file_size_bytes":1048576,"file_type":"image","format":"jpeg","status":"done","fields_removed":50,"gps_removed":true,"device":"Canon EOS"}]`))

		case strings.Contains(path, "/storage/v1/object/sign/") && r.Method == http.MethodPost:
			// GetPDFSignedURL
			w.Write([]byte(`{"signedURL":"https://example.com/signed/r1.pdf"}`))

		default:
			w.Write([]byte(`[]`))
		}
	}))
}

// Test list reports returns correct count and summary stats
func TestHandleListReports(t *testing.T) {
	srv := newMockSupabaseReports(t)
	defer srv.Close()

	cfg := newTestConfig(t)
	cfg.SupabaseURL = srv.URL
	db := src.NewSupabaseClient(cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/reports", nil)
	rr := httptest.NewRecorder()
	src.HandleListReports(db)(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}

	var resp struct {
		Reports []src.ReportSummary     `json:"reports"`
		Summary src.ReportsSummaryStats `json:"summary"`
	}
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("decode error: %v", err)
	}
	if len(resp.Reports) != 2 {
		t.Errorf("expected 2 reports, got %d", len(resp.Reports))
	}
	if resp.Summary.TotalReports != 2 {
		t.Errorf("expected totalReports 2, got %d", resp.Summary.TotalReports)
	}
	if resp.Summary.FieldsRemoved != 80 {
		t.Errorf("expected fieldsRemoved 80, got %d", resp.Summary.FieldsRemoved)
	}
	if resp.Summary.FilesProcessed != 5 {
		t.Errorf("expected filesProcessed 5, got %d", resp.Summary.FilesProcessed)
	}
	// Only 1 report has GPS=true
	if resp.Summary.GPSRemoved != 1 {
		t.Errorf("expected gpsRemoved 1, got %d", resp.Summary.GPSRemoved)
	}
}

// Test report detail with a valid human-readable ID → 200
func TestHandleGetReportSuccess(t *testing.T) {
	srv := newMockSupabaseReports(t)
	defer srv.Close()

	cfg := newTestConfig(t)
	cfg.SupabaseURL = srv.URL
	db := src.NewSupabaseClient(cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/reports/MCR-2024-0115-AA", nil)
	req.SetPathValue("id", "MCR-2024-0115-AA")
	rr := httptest.NewRecorder()
	src.HandleGetReport(db)(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}

	var detail src.ReportDetail
	if err := json.NewDecoder(rr.Body).Decode(&detail); err != nil {
		t.Fatalf("decode error: %v", err)
	}
	if detail.ReportID != "MCR-2024-0115-AA" {
		t.Errorf("expected reportId MCR-2024-0115-AA, got %q", detail.ReportID)
	}
	if detail.FieldsRemoved != 50 {
		t.Errorf("expected fieldsRemoved 50, got %d", detail.FieldsRemoved)
	}
	if len(detail.Files) != 1 {
		t.Errorf("expected 1 file detail, got %d", len(detail.Files))
	}
}

// Test report detail with an invalid ID → 404
func TestHandleGetReportNotFound(t *testing.T) {
	srv := newMockSupabaseReports(t)
	defer srv.Close()

	cfg := newTestConfig(t)
	cfg.SupabaseURL = srv.URL
	db := src.NewSupabaseClient(cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/reports/MCR-NOTFOUND", nil)
	req.SetPathValue("id", "MCR-NOTFOUND")
	rr := httptest.NewRecorder()
	src.HandleGetReport(db)(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp src.ErrorResponse
	json.NewDecoder(rr.Body).Decode(&resp)
	if resp.Error != src.ErrReportNotFound {
		t.Errorf("expected error %q, got %q", src.ErrReportNotFound, resp.Error)
	}
}

// Test PDF download → 200 with JSON URL
func TestHandleGetReportPDFRedirect(t *testing.T) {
	srv := newMockSupabaseReports(t)
	defer srv.Close()

	cfg := newTestConfig(t)
	cfg.SupabaseURL = srv.URL
	db := src.NewSupabaseClient(cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/reports/MCR-2024-0115-AA/pdf", nil)
	req.SetPathValue("id", "MCR-2024-0115-AA")
	rr := httptest.NewRecorder()
	src.HandleGetReportPDF(db)(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp struct{ URL string `json:"url"` }
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode JSON response: %v", err)
	}
	if !strings.Contains(resp.URL, "signed") {
		t.Errorf("expected signed URL in response, got %q", resp.URL)
	}
}

// Test PDF download when PDF status is failed → 404
func TestHandleGetReportPDFNotAvailable(t *testing.T) {
	srv := newMockSupabaseReports(t)
	defer srv.Close()

	cfg := newTestConfig(t)
	cfg.SupabaseURL = srv.URL
	db := src.NewSupabaseClient(cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/reports/MCR-NOPDF/pdf", nil)
	req.SetPathValue("id", "MCR-NOPDF")
	rr := httptest.NewRecorder()
	src.HandleGetReportPDF(db)(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp src.ErrorResponse
	json.NewDecoder(rr.Body).Decode(&resp)
	if resp.Error != src.ErrReportNotFound {
		t.Errorf("expected error %q, got %q", src.ErrReportNotFound, resp.Error)
	}
}

// Test that the public endpoint returns aggregate data but NOT raw metadata field values.
func TestHandleGetPublicReport_ReturnsRedactedDetail(t *testing.T) {
	now := time.Now().UTC().Format(time.RFC3339)
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		path := r.URL.Path
		query := r.URL.RawQuery
		switch {
		case strings.Contains(path, "cleaning_reports") && strings.Contains(query, "report_id=eq.MCR-TEST"):
			fmt.Fprintf(w, `[{"id":"r9","job_id":"j9","report_id":"MCR-TEST","date":%q,"files_processed":1,"fields_removed":5,"gps_locations_removed":1,"total_time_ms":3,"file_types":"JPEG","dominant_type":"image","has_gps":true,"pdf_status":"uploaded","tags":["GPS"],"chart_data":[{"label":"GPS","fields":5,"percentage":100}]}]`, now)
		case strings.Contains(path, "job_files") && strings.Contains(query, "job_id=eq.j9"):
			// Return a file record WITH raw metadata values that must be stripped.
			w.Write([]byte(`[{"id":"f9","job_id":"j9","file_name":"secret.jpg","original_name":"vacation-barcelona.jpg","file_extension":".jpg","file_size_bytes":2097152,"file_type":"image","format":"jpeg","device":"Nikon D850","status":"done","fields_removed":5,"gps_removed":true,"sha256_hash":"abc123","metadata_breakdown":{"gpsFields":[{"label":"GPSLatitude","value":"41.3851"},{"label":"GPSLongitude","value":"2.1734"}],"exifFields":[{"label":"SerialNumber","value":"SN-99887766"}],"xmpFields":[],"id3Fields":[],"mp4Atoms":[],"totalRemoved":3}}]`))
		default:
			w.Write([]byte(`[]`))
		}
	}))
	defer srv.Close()

	cfg := newTestConfig(t)
	cfg.SupabaseURL = srv.URL
	db := src.NewSupabaseClient(cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/public/reports/MCR-TEST", nil)
	req.SetPathValue("id", "MCR-TEST")
	rr := httptest.NewRecorder()
	src.HandleGetPublicReport(db)(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}

	var pub src.PublicReportDetail
	if err := json.NewDecoder(rr.Body).Decode(&pub); err != nil {
		t.Fatalf("decode error: %v", err)
	}

	// Aggregate data must be present.
	if pub.ReportID != "MCR-TEST" {
		t.Errorf("expected reportId MCR-TEST, got %q", pub.ReportID)
	}
	if pub.FieldsRemoved != 5 {
		t.Errorf("expected fieldsRemoved 5, got %d", pub.FieldsRemoved)
	}
	if pub.GPSLocationsRemoved != 1 {
		t.Errorf("expected gpsLocationsRemoved 1, got %d", pub.GPSLocationsRemoved)
	}
	if len(pub.Files) != 1 {
		t.Fatalf("expected 1 file, got %d", len(pub.Files))
	}

	// Per-file verification data must be present.
	pf := pub.Files[0]
	if pf.SHA256Hash != "abc123" {
		t.Errorf("expected sha256Hash abc123, got %q", pf.SHA256Hash)
	}
	if !pf.HasGPS {
		t.Error("expected hasGps true in public file detail")
	}
	if pf.FieldsRemoved != 5 {
		t.Errorf("expected fieldsRemoved 5 in public file detail, got %d", pf.FieldsRemoved)
	}

	// Raw response bytes must NOT contain the actual metadata values (GPS coords, serial).
	body := rr.Body.Bytes()
	for _, secret := range []string{"41.3851", "2.1734", "SN-99887766", "vacation-barcelona", "Nikon D850", "secret.jpg"} {
		if strings.Contains(string(body), secret) {
			t.Errorf("public response must not contain sensitive value %q", secret)
		}
	}
}

// Test that the public endpoint returns 404 for an unknown report ID.
func TestHandleGetPublicReport_NotFound(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`[]`))
	}))
	defer srv.Close()

	cfg := newTestConfig(t)
	cfg.SupabaseURL = srv.URL
	db := src.NewSupabaseClient(cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/public/reports/MCR-UNKNOWN", nil)
	req.SetPathValue("id", "MCR-UNKNOWN")
	rr := httptest.NewRecorder()
	src.HandleGetPublicReport(db)(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d: %s", rr.Code, rr.Body.String())
	}
}

// Test that generateReportID produces unguessable IDs with a long hex suffix.
func TestGenerateReportID_IsHighEntropy(t *testing.T) {
	report := src.BuildReport(
		&src.Job{ID: "j", Status: "completed"},
		[]src.FileRecord{},
	)
	id := report.ReportID
	if !strings.HasPrefix(id, "MCR-") {
		t.Fatalf("expected MCR- prefix, got %q", id)
	}
	// The hex suffix after "MCR-YYYY-MMDD-" must be 32 chars (16 bytes × 2 hex digits).
	parts := strings.Split(id, "-")
	if len(parts) < 4 {
		t.Fatalf("expected at least 4 dash-separated segments in %q", id)
	}
	hexSuffix := parts[len(parts)-1]
	if len(hexSuffix) != 32 {
		t.Errorf("expected 32-char hex suffix for 128-bit entropy, got %d chars in %q", len(hexSuffix), id)
	}
	// IDs generated in the same second must differ (collision check).
	id2 := src.BuildReport(&src.Job{ID: "j2", Status: "completed"}, nil).ReportID
	if id == id2 {
		t.Errorf("two consecutive generateReportID calls produced identical IDs: %q", id)
	}
}

// Test that buildReport produces correct fields from job and file data
func TestBuildReport(t *testing.T) {
	job := &src.Job{
		ID:                  "job-123",
		Status:              "completed",
		TotalFiles:          2,
		FilesCompleted:      2,
		FieldsRemoved:       30,
		GPSLocationsRemoved: 1,
		TotalTimeMs:    5,
	}
	files := []src.FileRecord{
		{
			ID:       "f1",
			JobID:    "job-123",
			FileType: "image",
			Format:   "jpeg",
			Status:   "done",
			MetadataBreakdown: &src.MetadataDetail{
				GPSFields:  []src.MetadataField{{Label: "GPSLatitude", Value: "51.5"}},
				EXIFFields: []src.MetadataField{{Label: "Make", Value: "Canon"}},
			},
		},
		{
			ID:       "f2",
			JobID:    "job-123",
			FileType: "image",
			Format:   "png",
			Status:   "done",
			MetadataBreakdown: &src.MetadataDetail{
				XMPFields: []src.MetadataField{{Label: "XMPCreator", Value: "Lightroom"}},
			},
		},
	}

	report := src.BuildReport(job, files)

	if report.JobID != "job-123" {
		t.Errorf("expected jobId job-123, got %q", report.JobID)
	}
	if report.FilesProcessed != 2 {
		t.Errorf("expected filesProcessed 2, got %d", report.FilesProcessed)
	}
	if report.FieldsRemoved != 30 {
		t.Errorf("expected fieldsRemoved 30, got %d", report.FieldsRemoved)
	}
	if !report.HasGPS {
		t.Error("expected hasGps true")
	}
	if report.DominantType != "image" {
		t.Errorf("expected dominantType image, got %q", report.DominantType)
	}
	if report.PDFStatus != "pending" {
		t.Errorf("expected pdfStatus pending, got %q", report.PDFStatus)
	}
	if !strings.HasPrefix(report.ReportID, "MCR-") {
		t.Errorf("expected reportId to start with MCR-, got %q", report.ReportID)
	}
	if len(report.ChartData) == 0 {
		t.Error("expected non-empty chartData")
	}
	// Verify GPS tag is present
	hasGPSTag := false
	for _, tag := range report.Tags {
		if tag == "GPS" {
			hasGPSTag = true
		}
	}
	if !hasGPSTag {
		t.Errorf("expected GPS in tags, got %v", report.Tags)
	}
}
