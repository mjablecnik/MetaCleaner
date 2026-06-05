package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// newMockSupabase returns a test HTTP server that simulates Supabase responses.
func newMockSupabase(t *testing.T, jobID string) *httptest.Server {
	t.Helper()
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		path := r.URL.Path
		switch {
		case strings.HasSuffix(path, "/cleaning_jobs") && r.Method == http.MethodPost:
			now := time.Now().UTC().Format(time.RFC3339)
			fmt.Fprintf(w, `[{"id":%q,"status":"processing","total_files":1,"files_completed":0,"fields_removed":0,"gps_locations_removed":0,"created_at":%q}]`,
				jobID, now)
		case strings.Contains(path, "/cleaning_jobs") && r.Method == http.MethodGet:
			now := time.Now().UTC().Format(time.RFC3339)
			fmt.Fprintf(w, `[{"id":%q,"status":"processing","total_files":1,"files_completed":0,"fields_removed":0,"gps_locations_removed":0,"created_at":%q}]`,
				jobID, now)
		default:
			w.Write([]byte(`[]`))
		}
	}))
}

// Test job creation with empty fileIds → 400
func TestHandleCreateJobEmptyFileIDs(t *testing.T) {
	cfg := newTestConfig(t)
	db := NewSupabaseClient(cfg)
	hub := NewWebSocketHub()
	pl := NewCleaningPipeline(cfg)

	req := httptest.NewRequest(http.MethodPost, "/api/jobs", strings.NewReader(`{"fileIds":[]}`))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	handleCreateJob(cfg, db, hub, pl)(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp ErrorResponse
	json.NewDecoder(rr.Body).Decode(&resp)
	if resp.Error != ErrInvalidRequest {
		t.Errorf("expected error %q, got %q", ErrInvalidRequest, resp.Error)
	}
}

// Test job creation with a missing fileId → 404
func TestHandleCreateJobMissingFile(t *testing.T) {
	cfg := newTestConfig(t)
	db := NewSupabaseClient(cfg)
	hub := NewWebSocketHub()
	pl := NewCleaningPipeline(cfg)

	req := httptest.NewRequest(http.MethodPost, "/api/jobs", strings.NewReader(`{"fileIds":["f-nonexistent"]}`))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	handleCreateJob(cfg, db, hub, pl)(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp ErrorResponse
	json.NewDecoder(rr.Body).Decode(&resp)
	if resp.Error != ErrFileNotFound {
		t.Errorf("expected error %q, got %q", ErrFileNotFound, resp.Error)
	}
}

// Test job creation with valid fileIds → 201 with correct response fields
func TestHandleCreateJobSuccess(t *testing.T) {
	cfg := newTestConfig(t)

	uploadsDir := filepath.Join(cfg.TempStoragePath, "uploads")
	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		t.Fatal(err)
	}
	fileID := "f-testaaaa"
	if err := os.WriteFile(filepath.Join(uploadsDir, fileID+"_original.jpg"), []byte("fake jpeg"), 0644); err != nil {
		t.Fatal(err)
	}

	jobID := "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
	srv := newMockSupabase(t, jobID)
	defer srv.Close()

	cfg.SupabaseURL = srv.URL
	db := NewSupabaseClient(cfg)
	hub := NewWebSocketHub()
	pl := NewCleaningPipeline(cfg)

	body := fmt.Sprintf(`{"fileIds":[%q]}`, fileID)
	req := httptest.NewRequest(http.MethodPost, "/api/jobs", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	handleCreateJob(cfg, db, hub, pl)(rr, req)

	if rr.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp createJobResponse
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if resp.JobID != jobID {
		t.Errorf("expected jobId %q, got %q", jobID, resp.JobID)
	}
	if resp.Status != "processing" {
		t.Errorf("expected status 'processing', got %q", resp.Status)
	}
	if resp.TotalFiles != 1 {
		t.Errorf("expected totalFiles 1, got %d", resp.TotalFiles)
	}
}

// Test GET /api/jobs/{id} with a non-existent job → 404
func TestHandleGetJobNotFound(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`[]`)) // empty result = job not found
	}))
	defer srv.Close()

	cfg := newTestConfig(t)
	cfg.SupabaseURL = srv.URL
	db := NewSupabaseClient(cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/jobs/missing-id", nil)
	req.SetPathValue("id", "missing-id")
	rr := httptest.NewRecorder()
	handleGetJob(db)(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp ErrorResponse
	json.NewDecoder(rr.Body).Decode(&resp)
	if resp.Error != ErrJobNotFound {
		t.Errorf("expected error %q, got %q", ErrJobNotFound, resp.Error)
	}
}

// Test GET /api/jobs/{id} with an existing job → 200 with correct fields
func TestHandleGetJobSuccess(t *testing.T) {
	jobID := "cccccccc-dddd-eeee-ffff-000000000000"
	srv := newMockSupabase(t, jobID)
	defer srv.Close()

	cfg := newTestConfig(t)
	cfg.SupabaseURL = srv.URL
	db := NewSupabaseClient(cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/jobs/"+jobID, nil)
	req.SetPathValue("id", jobID)
	rr := httptest.NewRecorder()
	handleGetJob(db)(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	var job Job
	if err := json.NewDecoder(rr.Body).Decode(&job); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if job.ID != jobID {
		t.Errorf("expected jobId %q, got %q", jobID, job.ID)
	}
	if job.Status != "processing" {
		t.Errorf("expected status 'processing', got %q", job.Status)
	}
}
