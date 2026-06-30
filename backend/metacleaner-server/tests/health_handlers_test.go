package tests

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	src "metacleaner-server/source"
)

func newMockHealthSupabase(t *testing.T, pingStatus int) *httptest.Server {
	t.Helper()
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(pingStatus)
		if pingStatus < 300 {
			w.Write([]byte(`[]`))
		} else {
			w.Write([]byte(`{"message":"db error"}`))
		}
	}))
}

func TestHandleHealth_DatabaseReachable_Returns200WithDatabaseTrue(t *testing.T) {
	srv := newMockHealthSupabase(t, http.StatusOK)
	defer srv.Close()

	cfg := src.Config{SupabaseURL: srv.URL, SupabaseServiceRoleKey: "test"}
	db := src.NewSupabaseClient(cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	rr := httptest.NewRecorder()
	src.HandleHealth(cfg, db)(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp map[string]interface{}
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("decode health response: %v", err)
	}
	if resp["database"] != true {
		t.Errorf("expected database=true when ping succeeds, got %v", resp["database"])
	}
	if _, ok := resp["status"]; !ok {
		t.Error("response missing status field")
	}
}

func TestHandleHealth_DatabaseUnreachable_ReportsDegraded(t *testing.T) {
	srv := newMockHealthSupabase(t, http.StatusServiceUnavailable)
	defer srv.Close()

	cfg := src.Config{SupabaseURL: srv.URL, SupabaseServiceRoleKey: "test"}
	db := src.NewSupabaseClient(cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	rr := httptest.NewRecorder()
	src.HandleHealth(cfg, db)(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp map[string]interface{}
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("decode health response: %v", err)
	}
	if resp["database"] != false {
		t.Errorf("expected database=false when ping fails, got %v", resp["database"])
	}
	if resp["status"] != "degraded" {
		t.Errorf("expected status=degraded when DB unreachable, got %v", resp["status"])
	}
}

func TestHandleHealth_ResponseContainsRequiredFields(t *testing.T) {
	srv := newMockHealthSupabase(t, http.StatusOK)
	defer srv.Close()

	cfg := src.Config{SupabaseURL: srv.URL, SupabaseServiceRoleKey: "test", TempStoragePath: "/tmp"}
	db := src.NewSupabaseClient(cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	rr := httptest.NewRecorder()
	src.HandleHealth(cfg, db)(rr, req)

	ct := rr.Header().Get("Content-Type")
	if !strings.HasPrefix(ct, "application/json") {
		t.Errorf("expected Content-Type application/json, got %q", ct)
	}

	var resp map[string]interface{}
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("decode health response: %v", err)
	}
	for _, field := range []string{"status", "exiftool", "ffmpeg", "database", "diskSpace"} {
		if _, ok := resp[field]; !ok {
			t.Errorf("health response missing required field %q", field)
		}
	}
}

func TestHandleHealth_ExiftoolAndFfmpegFieldsAreBooleans(t *testing.T) {
	srv := newMockHealthSupabase(t, http.StatusOK)
	defer srv.Close()

	cfg := src.Config{SupabaseURL: srv.URL, SupabaseServiceRoleKey: "test"}
	db := src.NewSupabaseClient(cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	rr := httptest.NewRecorder()
	src.HandleHealth(cfg, db)(rr, req)

	var resp map[string]interface{}
	json.NewDecoder(rr.Body).Decode(&resp)

	if _, ok := resp["exiftool"].(bool); !ok {
		t.Errorf("exiftool field must be a boolean, got %T", resp["exiftool"])
	}
	if _, ok := resp["ffmpeg"].(bool); !ok {
		t.Errorf("ffmpeg field must be a boolean, got %T", resp["ffmpeg"])
	}
}
