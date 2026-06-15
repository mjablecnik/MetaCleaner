package tests

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	src "metacleaner-server/source"
)

// newSupabaseConfig creates a Config that points the Supabase client at a given test server URL.
func newSupabaseConfig(serverURL string) src.Config {
	return src.Config{
		SupabaseURL:            serverURL,
		SupabaseAPIKey:         "test-api-key",
		SupabaseServiceRoleKey: "test-service-role-key",
	}
}

// assertAuthHeaders verifies apikey and Authorization headers are present on the request.
func assertAuthHeaders(t *testing.T, r *http.Request) {
	t.Helper()
	if r.Header.Get("apikey") == "" {
		t.Error("missing apikey header")
	}
	if !strings.HasPrefix(r.Header.Get("Authorization"), "Bearer ") {
		t.Errorf("Authorization header should start with 'Bearer ', got %q", r.Header.Get("Authorization"))
	}
}

// ─── CreateJob ───────────────────────────────────────────────────────────────

func TestSupabaseClient_CreateJob_Success(t *testing.T) {
	createdAt := time.Now().UTC().Truncate(time.Second)

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assertAuthHeaders(t, r)
		if r.Method != http.MethodPost {
			t.Errorf("CreateJob: expected POST, got %s", r.Method)
		}
		if !strings.HasSuffix(r.URL.Path, "/cleaning_jobs") {
			t.Errorf("CreateJob: unexpected path %q", r.URL.Path)
		}
		if r.Header.Get("Prefer") != "return=representation" {
			t.Errorf("CreateJob: missing Prefer header, got %q", r.Header.Get("Prefer"))
		}

		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `[{"id":"job-123","status":"processing","total_files":2,"files_completed":0,"fields_removed":0,"gps_locations_removed":0,"created_at":%q}]`,
			createdAt.Format(time.RFC3339))
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	job := &src.Job{
		UserID:     "user-1",
		Status:     "processing",
		TotalFiles: 2,
	}
	if err := client.CreateJob(context.Background(), job); err != nil {
		t.Fatalf("CreateJob returned error: %v", err)
	}
	if job.ID != "job-123" {
		t.Errorf("job.ID = %q, want %q", job.ID, "job-123")
	}
}

func TestSupabaseClient_CreateJob_ServerError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{"message":"internal error"}`))
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	job := &src.Job{Status: "processing", TotalFiles: 1}
	err := client.CreateJob(context.Background(), job)
	if err == nil {
		t.Fatal("expected error for 500 response, got nil")
	}
}

// ─── GetJob ──────────────────────────────────────────────────────────────────

func TestSupabaseClient_GetJob_Found(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assertAuthHeaders(t, r)
		if r.Method != http.MethodGet {
			t.Errorf("GetJob: expected GET, got %s", r.Method)
		}
		if !strings.Contains(r.URL.RawQuery, "id=eq.job-abc") {
			t.Errorf("GetJob: query missing id filter: %q", r.URL.RawQuery)
		}
		w.Header().Set("Content-Type", "application/json")
		now := time.Now().UTC().Format(time.RFC3339)
		fmt.Fprintf(w, `[{"id":"job-abc","status":"done","total_files":3,"files_completed":3,"fields_removed":10,"gps_locations_removed":1,"created_at":%q}]`, now)
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	job, err := client.GetJob(context.Background(), "job-abc", "")
	if err != nil {
		t.Fatalf("GetJob returned error: %v", err)
	}
	if job == nil {
		t.Fatal("GetJob returned nil job")
	}
	if job.ID != "job-abc" {
		t.Errorf("job.ID = %q, want %q", job.ID, "job-abc")
	}
	if job.Status != "done" {
		t.Errorf("job.Status = %q, want %q", job.Status, "done")
	}
	if job.TotalFiles != 3 {
		t.Errorf("job.TotalFiles = %d, want 3", job.TotalFiles)
	}
	if job.FieldsRemoved != 10 {
		t.Errorf("job.FieldsRemoved = %d, want 10", job.FieldsRemoved)
	}
}

func TestSupabaseClient_GetJob_NotFound(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`[]`))
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	job, err := client.GetJob(context.Background(), "missing-job", "")
	if err != nil {
		t.Fatalf("GetJob (not found) returned error: %v", err)
	}
	if job != nil {
		t.Errorf("expected nil job for not-found, got %+v", job)
	}
}

func TestSupabaseClient_GetJob_WithUserID(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.Contains(r.URL.RawQuery, "user_id=eq.user-42") {
			t.Errorf("GetJob with userID: missing user_id filter in query: %q", r.URL.RawQuery)
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`[]`))
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	client.GetJob(context.Background(), "job-1", "user-42")
}

// ─── GetReport ───────────────────────────────────────────────────────────────

func TestSupabaseClient_GetReport_Found(t *testing.T) {
	filesCalled := false
	reportDate := time.Date(2025, 1, 15, 10, 0, 0, 0, time.UTC)

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assertAuthHeaders(t, r)
		w.Header().Set("Content-Type", "application/json")

		switch {
		case strings.HasSuffix(r.URL.Path, "/cleaning_reports") && strings.Contains(r.URL.RawQuery, "id=eq.report-uuid"):
			fmt.Fprintf(w, `[{"id":"report-uuid","job_id":"job-1","report_id":"MC-2025-001","date":%q,"files_processed":2,"fields_removed":20,"gps_locations_removed":1,"total_time_seconds":10,"file_types":"jpeg","dominant_type":"image","has_gps":true,"tags":[],"pdf_status":"done","chart_data":[]}]`,
				reportDate.Format(time.RFC3339))
		case strings.HasSuffix(r.URL.Path, "/job_files"):
			filesCalled = true
			w.Write([]byte(`[]`))
		default:
			w.Write([]byte(`[]`))
		}
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	detail, err := client.GetReport(context.Background(), "report-uuid")
	if err != nil {
		t.Fatalf("GetReport returned error: %v", err)
	}
	if detail == nil {
		t.Fatal("GetReport returned nil detail")
	}
	if detail.ReportID != "MC-2025-001" {
		t.Errorf("ReportID = %q, want %q", detail.ReportID, "MC-2025-001")
	}
	if detail.FilesProcessed != 2 {
		t.Errorf("FilesProcessed = %d, want 2", detail.FilesProcessed)
	}
	if !filesCalled {
		t.Error("expected GetFileRecords to be called to build report detail")
	}
}

func TestSupabaseClient_GetReport_NotFound(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`[]`))
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	detail, err := client.GetReport(context.Background(), "no-such-report")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if detail != nil {
		t.Errorf("expected nil for not-found report, got %+v", detail)
	}
}

// ─── ListReports ─────────────────────────────────────────────────────────────

func TestSupabaseClient_ListReports_ReturnsAll(t *testing.T) {
	reportDate := time.Date(2025, 6, 1, 0, 0, 0, 0, time.UTC)
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assertAuthHeaders(t, r)
		if r.Method != http.MethodGet {
			t.Errorf("ListReports: expected GET, got %s", r.Method)
		}
		if !strings.Contains(r.URL.RawQuery, "order=date.desc") {
			t.Errorf("ListReports: missing order=date.desc in query: %q", r.URL.RawQuery)
		}
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `[
			{"id":"r1","report_id":"MC-001","date":%q,"files_processed":2,"fields_removed":5,"total_time_seconds":3,"file_types":"jpeg","dominant_type":"image","has_gps":false,"tags":[],"pdf_status":"done","gps_locations_removed":0,"chart_data":[]},
			{"id":"r2","report_id":"MC-002","date":%q,"files_processed":1,"fields_removed":3,"total_time_seconds":2,"file_types":"png","dominant_type":"image","has_gps":true,"tags":[],"pdf_status":"pending","gps_locations_removed":1,"chart_data":[]}
		]`, reportDate.Format(time.RFC3339), reportDate.Format(time.RFC3339))
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	summaries, err := client.ListReports(context.Background(), "")
	if err != nil {
		t.Fatalf("ListReports returned error: %v", err)
	}
	if len(summaries) != 2 {
		t.Fatalf("expected 2 summaries, got %d", len(summaries))
	}
	if summaries[0].ReportID != "MC-001" {
		t.Errorf("summaries[0].ReportID = %q, want %q", summaries[0].ReportID, "MC-001")
	}
}

func TestSupabaseClient_ListReports_WithUserID(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.Contains(r.URL.RawQuery, "user_id=eq.user-99") {
			t.Errorf("ListReports with userID: missing user_id filter: %q", r.URL.RawQuery)
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`[]`))
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	summaries, err := client.ListReports(context.Background(), "user-99")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(summaries) != 0 {
		t.Errorf("expected empty summaries for no-match user, got %d", len(summaries))
	}
}

func TestSupabaseClient_ListReports_Empty(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`[]`))
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	summaries, err := client.ListReports(context.Background(), "")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(summaries) != 0 {
		t.Errorf("expected 0 summaries, got %d", len(summaries))
	}
}

// ─── VerifyFileOwnership ─────────────────────────────────────────────────────

func TestSupabaseClient_VerifyFileOwnership_True(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assertAuthHeaders(t, r)
		if r.Method != http.MethodGet {
			t.Errorf("VerifyFileOwnership: expected GET, got %s", r.Method)
		}
		if !strings.Contains(r.URL.Path, "/job_files") {
			t.Errorf("VerifyFileOwnership: unexpected path %q", r.URL.Path)
		}
		// Query should contain file_name filter with localID prefix and user_id filter
		q := r.URL.RawQuery
		if !strings.Contains(q, "file_name=like.local-id-1") {
			t.Errorf("missing file_name filter in query: %q", q)
		}
		if !strings.Contains(q, "user_id=eq.user-1") {
			t.Errorf("missing user_id filter in query: %q", q)
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`[{"id":"file-1","job_id":"job-1","file_name":"local-id-1_original.jpg","file_extension":".jpg","file_size_bytes":1024,"file_type":"image","format":"jpeg","status":"done","fields_removed":5,"gps_removed":false}]`))
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	ok, err := client.VerifyFileOwnership(context.Background(), "local-id-1", "user-1")
	if err != nil {
		t.Fatalf("VerifyFileOwnership returned error: %v", err)
	}
	if !ok {
		t.Error("expected ownership=true, got false")
	}
}

func TestSupabaseClient_VerifyFileOwnership_False(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`[]`)) // no matching file
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	ok, err := client.VerifyFileOwnership(context.Background(), "no-such-file", "user-1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if ok {
		t.Error("expected ownership=false, got true")
	}
}

func TestSupabaseClient_VerifyFileOwnership_ServerError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{"message":"db error"}`))
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	_, err := client.VerifyFileOwnership(context.Background(), "file-1", "user-1")
	if err == nil {
		t.Fatal("expected error for 500 response, got nil")
	}
}

// ─── GetReportIDByJobID ───────────────────────────────────────────────────────

func TestSupabaseClient_GetReportIDByJobID_Found(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assertAuthHeaders(t, r)
		if r.Method != http.MethodGet {
			t.Errorf("GetReportIDByJobID: expected GET, got %s", r.Method)
		}
		q := r.URL.RawQuery
		if !strings.Contains(q, "job_id=eq.job-xyz") {
			t.Errorf("missing job_id filter in query: %q", q)
		}
		if !strings.Contains(q, "select=report_id") {
			t.Errorf("missing select=report_id in query: %q", q)
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`[{"report_id":"MC-2025-007","job_id":"job-xyz"}]`))
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	reportID, err := client.GetReportIDByJobID(context.Background(), "job-xyz")
	if err != nil {
		t.Fatalf("GetReportIDByJobID returned error: %v", err)
	}
	if reportID != "MC-2025-007" {
		t.Errorf("reportID = %q, want %q", reportID, "MC-2025-007")
	}
}

func TestSupabaseClient_GetReportIDByJobID_NotFound(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`[]`))
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	reportID, err := client.GetReportIDByJobID(context.Background(), "no-such-job")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if reportID != "" {
		t.Errorf("expected empty reportID for not-found job, got %q", reportID)
	}
}

// ─── UpdateJob ───────────────────────────────────────────────────────────────

func TestSupabaseClient_UpdateJob_SendsCorrectVerbAndPath(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assertAuthHeaders(t, r)
		if r.Method != http.MethodPatch {
			t.Errorf("UpdateJob: expected PATCH, got %s", r.Method)
		}
		if !strings.Contains(r.URL.RawQuery, "id=eq.job-upd") {
			t.Errorf("UpdateJob: missing id filter in query: %q", r.URL.RawQuery)
		}
		// Decode body to verify fields
		var body map[string]interface{}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			t.Errorf("UpdateJob: failed to decode body: %v", err)
		}
		if body["status"] != "done" {
			t.Errorf("UpdateJob: body.status = %v, want %q", body["status"], "done")
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`[]`))
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	now := time.Now().UTC()
	job := &src.Job{
		ID:              "job-upd",
		Status:          "done",
		TotalFiles:      2,
		FilesCompleted:  2,
		FieldsRemoved:   8,
		TotalTimeSeconds: 5,
		CompletedAt:     &now,
	}
	if err := client.UpdateJob(context.Background(), job); err != nil {
		t.Fatalf("UpdateJob returned error: %v", err)
	}
}
