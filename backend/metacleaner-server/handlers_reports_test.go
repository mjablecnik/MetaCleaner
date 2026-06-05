package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
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
				{"id":"r1","job_id":"j1","report_id":"MCR-2024-0115-AA","date":%q,"files_processed":3,"fields_removed":50,"gps_locations_removed":1,"total_time_seconds":10,"file_types":"JPEG","dominant_type":"image","has_gps":true,"pdf_status":"uploaded","tags":["GPS","EXIF"],"icon_color":"green"},
				{"id":"r2","job_id":"j2","report_id":"MCR-2024-0116-BB","date":%q,"files_processed":2,"fields_removed":30,"gps_locations_removed":0,"total_time_seconds":8,"file_types":"MP4","dominant_type":"video","has_gps":false,"pdf_status":"pending","tags":["ID3"],"icon_color":"blue"}
			]`, now, now)

		case strings.Contains(path, "cleaning_reports") && strings.Contains(query, "report_id=eq.MCR-2024-0115-AA"):
			// GetReportByHumanID — found
			fmt.Fprintf(w, `[{"id":"r1","job_id":"j1","report_id":"MCR-2024-0115-AA","date":%q,"files_processed":3,"fields_removed":50,"gps_locations_removed":1,"total_time_seconds":10,"file_types":"JPEG","dominant_type":"image","has_gps":true,"pdf_status":"uploaded","pdf_path":"r1.pdf","tags":["GPS","EXIF"],"icon_color":"green","chart_data":[{"label":"GPS","fields":10,"percentage":20}]}]`, now)

		case strings.Contains(path, "cleaning_reports") && strings.Contains(query, "report_id=eq.MCR-NOTFOUND"):
			// GetReportByHumanID — not found
			w.Write([]byte(`[]`))

		case strings.Contains(path, "cleaning_reports") && strings.Contains(query, "report_id=eq.MCR-NOPDF"):
			// Report with pdf_status != "uploaded"
			fmt.Fprintf(w, `[{"id":"r3","job_id":"j3","report_id":"MCR-NOPDF","date":%q,"files_processed":1,"fields_removed":5,"gps_locations_removed":0,"total_time_seconds":3,"file_types":"PNG","dominant_type":"image","has_gps":false,"pdf_status":"failed","pdf_path":"","tags":["EXIF"],"icon_color":"green"}]`, now)

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
	db := NewSupabaseClient(cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/reports", nil)
	rr := httptest.NewRecorder()
	handleListReports(db)(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}

	var resp struct {
		Reports []ReportSummary     `json:"reports"`
		Summary ReportsSummaryStats `json:"summary"`
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
	db := NewSupabaseClient(cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/reports/MCR-2024-0115-AA", nil)
	req.SetPathValue("id", "MCR-2024-0115-AA")
	rr := httptest.NewRecorder()
	handleGetReport(db)(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}

	var detail ReportDetail
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
	db := NewSupabaseClient(cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/reports/MCR-NOTFOUND", nil)
	req.SetPathValue("id", "MCR-NOTFOUND")
	rr := httptest.NewRecorder()
	handleGetReport(db)(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp ErrorResponse
	json.NewDecoder(rr.Body).Decode(&resp)
	if resp.Error != ErrReportNotFound {
		t.Errorf("expected error %q, got %q", ErrReportNotFound, resp.Error)
	}
}

// Test PDF download redirect → 302 with Location header
func TestHandleGetReportPDFRedirect(t *testing.T) {
	srv := newMockSupabaseReports(t)
	defer srv.Close()

	cfg := newTestConfig(t)
	cfg.SupabaseURL = srv.URL
	db := NewSupabaseClient(cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/reports/MCR-2024-0115-AA/pdf", nil)
	req.SetPathValue("id", "MCR-2024-0115-AA")
	rr := httptest.NewRecorder()
	handleGetReportPDF(db)(rr, req)

	if rr.Code != http.StatusFound {
		t.Fatalf("expected 302, got %d: %s", rr.Code, rr.Body.String())
	}
	loc := rr.Header().Get("Location")
	if !strings.Contains(loc, "signed") {
		t.Errorf("expected signed URL in Location header, got %q", loc)
	}
}

// Test PDF download when PDF status is failed → 404
func TestHandleGetReportPDFNotAvailable(t *testing.T) {
	srv := newMockSupabaseReports(t)
	defer srv.Close()

	cfg := newTestConfig(t)
	cfg.SupabaseURL = srv.URL
	db := NewSupabaseClient(cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/reports/MCR-NOPDF/pdf", nil)
	req.SetPathValue("id", "MCR-NOPDF")
	rr := httptest.NewRecorder()
	handleGetReportPDF(db)(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp ErrorResponse
	json.NewDecoder(rr.Body).Decode(&resp)
	if resp.Error != ErrReportNotFound {
		t.Errorf("expected error %q, got %q", ErrReportNotFound, resp.Error)
	}
}

// Test that buildReport produces correct fields from job and file data
func TestBuildReport(t *testing.T) {
	job := &Job{
		ID:                  "job-123",
		Status:              "completed",
		TotalFiles:          2,
		FilesCompleted:      2,
		FieldsRemoved:       30,
		GPSLocationsRemoved: 1,
		TotalTimeSeconds:    5,
	}
	files := []FileRecord{
		{
			ID:       "f1",
			JobID:    "job-123",
			FileType: "image",
			Format:   "jpeg",
			Status:   "done",
			MetadataBreakdown: &MetadataDetail{
				GPSFields:  []MetadataField{{Label: "GPSLatitude", Value: "51.5"}},
				EXIFFields: []MetadataField{{Label: "Make", Value: "Canon"}},
			},
		},
		{
			ID:       "f2",
			JobID:    "job-123",
			FileType: "image",
			Format:   "png",
			Status:   "done",
			MetadataBreakdown: &MetadataDetail{
				XMPFields: []MetadataField{{Label: "XMPCreator", Value: "Lightroom"}},
			},
		},
	}

	report := buildReport(job, files)

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
