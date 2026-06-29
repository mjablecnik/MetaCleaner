package tests

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	src "metacleaner-server/source"
)

// TestHandleCreateJob_InvalidFileIDFormats verifies that fileIDs not matching
// the expected hex format are rejected with 400 before any file-system access.
func TestHandleCreateJob_InvalidFileIDFormats(t *testing.T) {
	cases := []struct {
		name    string
		fileIDs []string
	}{
		{"path traversal", []string{"../etc/passwd"}},
		{"path traversal encoded", []string{"..%2Fetc%2Fpasswd"}},
		{"non-hex characters", []string{"f-xyz123"}},
		{"uppercase hex", []string{"f-ABCDEF"}},
		{"missing f- prefix", []string{"abcdef01"}},
		{"empty string", []string{""}},
		{"whitespace only", []string{"   "}},
		{"null byte", []string{"f-\x00abc"}},
		{"invalid before valid in batch", []string{"f-INVALID", "f-abcdef01"}},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			cfg := newTestConfig(t)
			db := src.NewSupabaseClient(cfg)
			hub := src.NewWebSocketHub()
			pl := src.NewCleaningPipeline(cfg)
			pool := src.NewJobWorkerPool(cfg.MaxConcurrentJobs)

			fileIDsJSON, _ := json.Marshal(tc.fileIDs)
			body := `{"fileIds":` + string(fileIDsJSON) + `}`
			req := httptest.NewRequest(http.MethodPost, "/api/jobs", strings.NewReader(body))
			req.Header.Set("Content-Type", "application/json")
			rr := httptest.NewRecorder()

			src.HandleCreateJob(cfg, db, hub, pl, pool, nil)(rr, req)

			if rr.Code != http.StatusBadRequest {
				t.Errorf("fileID %v: expected 400, got %d: %s", tc.fileIDs, rr.Code, rr.Body.String())
				return
			}
			var resp src.ErrorResponse
			json.NewDecoder(rr.Body).Decode(&resp)
			if resp.Error != src.ErrInvalidRequest {
				t.Errorf("fileID %v: expected error %q, got %q", tc.fileIDs, src.ErrInvalidRequest, resp.Error)
			}
		})
	}
}

// TestHandleCreateJob_ValidFileIDFormat verifies that well-formed fileIDs pass
// format validation and reach the file-existence check (404 = file not found).
func TestHandleCreateJob_ValidFileIDFormat(t *testing.T) {
	cases := []string{
		"f-abcdef01",
		"f-0123456789abcdef",
		"f-abcdef0123456789abcdef0123456789",
	}

	for _, fileID := range cases {
		t.Run(fileID, func(t *testing.T) {
			cfg := newTestConfig(t)
			db := src.NewSupabaseClient(cfg)
			hub := src.NewWebSocketHub()
			pl := src.NewCleaningPipeline(cfg)
			pool := src.NewJobWorkerPool(cfg.MaxConcurrentJobs)

			body := `{"fileIds":["` + fileID + `"]}`
			req := httptest.NewRequest(http.MethodPost, "/api/jobs", strings.NewReader(body))
			req.Header.Set("Content-Type", "application/json")
			rr := httptest.NewRecorder()

			src.HandleCreateJob(cfg, db, hub, pl, pool, nil)(rr, req)

			// Format validation passed; file does not exist on disk → 404
			if rr.Code == http.StatusBadRequest {
				var resp src.ErrorResponse
				json.NewDecoder(rr.Body).Decode(&resp)
				if resp.Error == src.ErrInvalidRequest {
					t.Errorf("valid fileID %q was incorrectly rejected: %s", fileID, rr.Body.String())
				}
			}
		})
	}
}

// TestHandleFileDownload_InvalidFileIDFormats verifies that HandleFileDownload
// rejects requests whose {id} path value does not match the expected hex format.
func TestHandleFileDownload_InvalidFileIDFormats(t *testing.T) {
	cases := []struct {
		name   string
		fileID string
	}{
		{"empty string", ""},
		{"path traversal", "../etc/passwd"},
		{"path traversal with separator", "f-../../secret"},
		{"non-hex characters", "f-xyz123"},
		{"uppercase hex", "f-ABCDEF"},
		{"missing f- prefix", "abcdef01"},
		{"null byte attempt", "f-\x00abc"},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			cfg := newTestConfig(t)
			db := src.NewSupabaseClient(cfg)

			// Use a safe URL placeholder — the actual ID under test is injected via SetPathValue
			// so IDs with special characters (spaces, null bytes) don't cause request parse errors.
			req := httptest.NewRequest(http.MethodGet, "/api/files/placeholder/download", nil)
			req.SetPathValue("id", tc.fileID)
			rr := httptest.NewRecorder()

			src.HandleFileDownload(cfg, db)(rr, req)

			if rr.Code != http.StatusBadRequest {
				t.Errorf("fileID %q: expected 400, got %d: %s", tc.fileID, rr.Code, rr.Body.String())
				return
			}
			var resp src.ErrorResponse
			json.NewDecoder(rr.Body).Decode(&resp)
			if resp.Error != src.ErrInvalidRequest {
				t.Errorf("fileID %q: expected error %q, got %q", tc.fileID, src.ErrInvalidRequest, resp.Error)
			}
		})
	}
}

// TestHandleFileDownload_ValidFileIDFormat verifies that well-formed fileIDs pass
// format validation and reach subsequent logic (file not found → 404, not 400).
func TestHandleFileDownload_ValidFileIDFormat(t *testing.T) {
	cases := []string{
		"f-abcdef01",
		"f-0123456789abcdef",
		"f-abcdef0123456789abcdef0123456789",
	}

	for _, fileID := range cases {
		t.Run(fileID, func(t *testing.T) {
			cfg := newTestConfig(t)
			db := src.NewSupabaseClient(cfg)

			req := httptest.NewRequest(http.MethodGet, "/api/files/placeholder/download", nil)
			req.SetPathValue("id", fileID)
			rr := httptest.NewRecorder()

			src.HandleFileDownload(cfg, db)(rr, req)

			if rr.Code == http.StatusBadRequest {
				var resp src.ErrorResponse
				json.NewDecoder(rr.Body).Decode(&resp)
				if resp.Error == src.ErrInvalidRequest {
					t.Errorf("valid fileID %q rejected by format check: %s", fileID, rr.Body.String())
				}
			}
			// Expect 404 (file not found) since no file exists on disk, not 400.
			if rr.Code != http.StatusNotFound && rr.Code != http.StatusConflict && rr.Code != http.StatusOK {
				t.Errorf("fileID %q: unexpected status %d: %s", fileID, rr.Code, rr.Body.String())
			}
		})
	}
}
