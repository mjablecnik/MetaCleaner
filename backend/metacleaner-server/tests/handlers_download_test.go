package tests

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	src "metacleaner-server/src"
)

// Test download of a completed (cleaned) file → 200 with correct headers
func TestHandleFileDownloadCompleted(t *testing.T) {
	cfg := newTestConfig(t)

	fileID := "f-download1"
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
	rr := httptest.NewRecorder()
	src.HandleFileDownload(cfg)(rr, req)

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
	cfg := newTestConfig(t)

	fileID := "f-inprogress1"
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
	rr := httptest.NewRecorder()
	src.HandleFileDownload(cfg)(rr, req)

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
	cfg := newTestConfig(t)

	req := httptest.NewRequest(http.MethodGet, "/api/files/f-missing/download", nil)
	req.SetPathValue("id", "f-missing")
	rr := httptest.NewRecorder()
	src.HandleFileDownload(cfg)(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp src.ErrorResponse
	json.NewDecoder(rr.Body).Decode(&resp)
	if resp.Error != src.ErrFileNotFound {
		t.Errorf("expected error %q, got %q", src.ErrFileNotFound, resp.Error)
	}
}
