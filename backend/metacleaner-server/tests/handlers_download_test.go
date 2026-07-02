package tests

import (
	"archive/zip"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	src "metacleaner-server/source"
)

// newFileOwnershipMockSupabase creates a Supabase mock that confirms ownership for the given fileID and userID.
func newFileOwnershipMockSupabase(t *testing.T, fileID, ownerID string) *httptest.Server {
	t.Helper()
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		if strings.Contains(r.URL.Path, "job_files") && strings.Contains(r.URL.RawQuery, fileID) {
			fmt.Fprintf(w, `[{"file_name":%q,"user_id":%q}]`, fileID+"_original.jpg", ownerID)
		} else {
			w.Write([]byte(`[]`))
		}
	}))
}

// Test download of a completed (cleaned) file → 200 with correct headers
func TestHandleFileDownloadCompleted(t *testing.T) {
	fileID := "f-aa1234bb"
	userID := "user-download-1"

	srv := newFileOwnershipMockSupabase(t, fileID, userID)
	defer srv.Close()

	cfg := newTestConfig(t)
	cfg.SupabaseURL = srv.URL
	db := src.NewSupabaseClient(cfg)

	cleanedDir := filepath.Join(cfg.TempStoragePath, "cleaned")
	if err := os.MkdirAll(cleanedDir, 0755); err != nil {
		t.Fatal(err)
	}
	cleanedPath := filepath.Join(cleanedDir, fileID+"_cleaned.jpg")
	if err := os.WriteFile(cleanedPath, []byte("cleaned jpeg content"), 0644); err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/files/"+fileID+"/download", nil)
	req.SetPathValue("id", fileID)
	req = withUserID(req, userID)
	rr := httptest.NewRecorder()
	src.HandleFileDownload(cfg, db)(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	ct := rr.Header().Get("Content-Type")
	if ct != "image/jpeg" {
		t.Errorf("expected Content-Type image/jpeg, got %q", ct)
	}
	cd := rr.Header().Get("Content-Disposition")
	if cd == "" {
		t.Errorf("expected Content-Disposition header, got empty")
	}
}

// Test download of a file that is still being processed → 409
func TestHandleFileDownloadInProgress(t *testing.T) {
	fileID := "f-cc5678dd"
	userID := "user-download-2"

	srv := newFileOwnershipMockSupabase(t, fileID, userID)
	defer srv.Close()

	cfg := newTestConfig(t)
	cfg.SupabaseURL = srv.URL
	db := src.NewSupabaseClient(cfg)

	uploadsDir := filepath.Join(cfg.TempStoragePath, "uploads")
	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		t.Fatal(err)
	}
	// Only the original exists, no cleaned file yet.
	if err := os.WriteFile(filepath.Join(uploadsDir, fileID+"_original.png"), []byte("original png"), 0644); err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/files/"+fileID+"/download", nil)
	req.SetPathValue("id", fileID)
	req = withUserID(req, userID)
	rr := httptest.NewRecorder()
	src.HandleFileDownload(cfg, db)(rr, req)

	if rr.Code != http.StatusConflict {
		t.Fatalf("expected 409, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp src.ErrorResponse
	json.NewDecoder(rr.Body).Decode(&resp)
	if resp.Error != src.ErrFileNotReady {
		t.Errorf("expected error %q, got %q", src.ErrFileNotReady, resp.Error)
	}
}

// Test download of an expired or never-uploaded file → 404
func TestHandleFileDownloadNotFound(t *testing.T) {
	fileID := "f-ffffffff"
	userID := "user-download-3"

	// Ownership mock returns empty — file not found in DB.
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`[]`))
	}))
	defer srv.Close()

	cfg := newTestConfig(t)
	cfg.SupabaseURL = srv.URL
	db := src.NewSupabaseClient(cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/files/"+fileID+"/download", nil)
	req.SetPathValue("id", fileID)
	req = withUserID(req, userID)
	rr := httptest.NewRecorder()
	src.HandleFileDownload(cfg, db)(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp src.ErrorResponse
	json.NewDecoder(rr.Body).Decode(&resp)
	if resp.Error != src.ErrFileNotFound {
		t.Errorf("expected error %q, got %q", src.ErrFileNotFound, resp.Error)
	}
}

// newJobDownloadMockSupabase returns a test server that simulates Supabase for job download tests.
func newJobDownloadMockSupabase(t *testing.T, jobID, jobStatus string, fileRecordsJSON string) *httptest.Server {
	t.Helper()
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		now := time.Now().UTC().Format(time.RFC3339)
		path := r.URL.Path
		switch {
		case strings.Contains(path, "cleaning_jobs"):
			if jobID == "" {
				w.Write([]byte(`[]`))
			} else {
				fmt.Fprintf(w, `[{"id":%q,"status":%q,"total_files":1,"files_completed":1,"fields_removed":5,"gps_locations_removed":1,"created_at":%q}]`,
					jobID, jobStatus, now)
			}
		case strings.Contains(path, "job_files"):
			if fileRecordsJSON != "" {
				w.Write([]byte(fileRecordsJSON))
			} else {
				w.Write([]byte(`[]`))
			}
		default:
			w.Write([]byte(`[]`))
		}
	}))
}

// jobIDDownloadMissing is a valid UUID v4 with no matching DB row.
const jobIDDownloadMissing = "00000000-0000-4000-8000-000000000001"

// Test HandleJobDownload: job not found → 404 JOB_NOT_FOUND
func TestHandleJobDownloadJobNotFound(t *testing.T) {
	srv := newJobDownloadMockSupabase(t, "", "", "")
	defer srv.Close()

	cfg := newTestConfig(t)
	cfg.SupabaseURL = srv.URL
	db := src.NewSupabaseClient(cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/jobs/"+jobIDDownloadMissing+"/download", nil)
	req.SetPathValue("id", jobIDDownloadMissing)
	rr := httptest.NewRecorder()
	src.HandleJobDownload(cfg, db)(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp src.ErrorResponse
	json.NewDecoder(rr.Body).Decode(&resp)
	if resp.Error != src.ErrJobNotFound {
		t.Errorf("expected %q, got %q", src.ErrJobNotFound, resp.Error)
	}
}

// Test HandleJobDownload: job status != "completed" → 409 JOB_NOT_READY
func TestHandleJobDownloadJobNotReady(t *testing.T) {
	jobID := "00000000-0000-4000-8000-000000000002"
	srv := newJobDownloadMockSupabase(t, jobID, "processing", "")
	defer srv.Close()

	cfg := newTestConfig(t)
	cfg.SupabaseURL = srv.URL
	db := src.NewSupabaseClient(cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/jobs/"+jobID+"/download", nil)
	req.SetPathValue("id", jobID)
	req = withUserID(req, testUserUUID)
	rr := httptest.NewRecorder()
	src.HandleJobDownload(cfg, db)(rr, req)

	if rr.Code != http.StatusConflict {
		t.Fatalf("expected 409, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp src.ErrorResponse
	json.NewDecoder(rr.Body).Decode(&resp)
	if resp.Error != src.ErrJobNotReady {
		t.Errorf("expected %q, got %q", src.ErrJobNotReady, resp.Error)
	}
}

// Test HandleJobDownload: completed job but cleaned files missing from disk → 404 FILES_EXPIRED
func TestHandleJobDownloadFilesExpired(t *testing.T) {
	jobID := "00000000-0000-4000-8000-000000000003"
	fileRecords := fmt.Sprintf(`[{"id":"fr-001","job_id":%q,"file_name":"f-abc12345.jpg","file_extension":".jpg","file_size_bytes":1024,"file_type":"image","format":"jpeg","status":"done","fields_removed":5,"gps_removed":true}]`, jobID)
	srv := newJobDownloadMockSupabase(t, jobID, "completed", fileRecords)
	defer srv.Close()

	cfg := newTestConfig(t)
	cfg.SupabaseURL = srv.URL
	db := src.NewSupabaseClient(cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/jobs/"+jobID+"/download", nil)
	req.SetPathValue("id", jobID)
	req = withUserID(req, testUserUUID)
	rr := httptest.NewRecorder()
	src.HandleJobDownload(cfg, db)(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp src.ErrorResponse
	json.NewDecoder(rr.Body).Decode(&resp)
	if resp.Error != src.ErrFilesExpired {
		t.Errorf("expected %q, got %q", src.ErrFilesExpired, resp.Error)
	}
}

// Test HandleJobDownload: successful download → 200 with ZIP headers and correct file contents
func TestHandleJobDownloadSuccess(t *testing.T) {
	jobID := "00000000-0000-4000-8000-000000000004"
	fileID := "f-aabb1234"
	fileRecords := fmt.Sprintf(`[{"id":"fr-002","job_id":%q,"file_name":%q,"file_extension":".jpg","file_size_bytes":2048,"file_type":"image","format":"jpeg","status":"done","fields_removed":3,"gps_removed":false}]`,
		jobID, fileID+".jpg")
	srv := newJobDownloadMockSupabase(t, jobID, "completed", fileRecords)
	defer srv.Close()

	cfg := newTestConfig(t)
	cfg.SupabaseURL = srv.URL
	db := src.NewSupabaseClient(cfg)

	cleanedDir := filepath.Join(cfg.TempStoragePath, "cleaned")
	if err := os.MkdirAll(cleanedDir, 0755); err != nil {
		t.Fatal(err)
	}
	cleanedContent := []byte("cleaned jpeg data for zip test")
	if err := os.WriteFile(filepath.Join(cleanedDir, fileID+"_cleaned.jpg"), cleanedContent, 0644); err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/jobs/"+jobID+"/download", nil)
	req.SetPathValue("id", jobID)
	req = withUserID(req, testUserUUID)
	rr := httptest.NewRecorder()
	src.HandleJobDownload(cfg, db)(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	if ct := rr.Header().Get("Content-Type"); ct != "application/zip" {
		t.Errorf("expected Content-Type application/zip, got %q", ct)
	}
	cd := rr.Header().Get("Content-Disposition")
	if !strings.Contains(cd, "metacleaner-"+jobID+".zip") {
		t.Errorf("expected Content-Disposition with job ZIP name, got %q", cd)
	}

	zipReader, err := zip.NewReader(bytes.NewReader(rr.Body.Bytes()), int64(rr.Body.Len()))
	if err != nil {
		t.Fatalf("failed to read ZIP response: %v", err)
	}
	if len(zipReader.File) != 1 {
		t.Fatalf("expected 1 file in ZIP, got %d", len(zipReader.File))
	}

	rc, err := zipReader.File[0].Open()
	if err != nil {
		t.Fatal(err)
	}
	defer rc.Close()
	data, err := io.ReadAll(rc)
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Equal(data, cleanedContent) {
		t.Errorf("ZIP file content mismatch: got %q, want %q", data, cleanedContent)
	}
}
