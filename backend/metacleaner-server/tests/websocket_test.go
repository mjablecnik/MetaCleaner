package tests

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gorilla/websocket"

	src "metacleaner-server/source"
)

// newWSMockSupabase creates a mock Supabase HTTP server that returns a valid job
// for any cleaning_jobs GET request. Used by WebSocket tests that reach db.GetJob().
func newWSMockSupabase(t *testing.T) *httptest.Server {
	t.Helper()
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		if strings.Contains(r.URL.Path, "/cleaning_jobs") && r.Method == http.MethodGet {
			now := time.Now().UTC().Format(time.RFC3339)
			fmt.Fprintf(w, `[{"id":"test-job-id","status":"processing","total_files":1,"files_completed":0,"fields_removed":0,"gps_locations_removed":0,"created_at":%q}]`, now)
			return
		}
		w.Write([]byte(`[]`))
	}))
}

// newTestWSServer creates an httptest.Server that serves HandleJobProgress.
// The wrapper sets the {id} path value so the handler can proceed to the WebSocket upgrade.
func newTestWSServer(t *testing.T, frontendOrigin string) *httptest.Server {
	t.Helper()
	cfg := newTestConfig(t)
	cfg.SupabaseJWTSecret = testJWTSecret
	cfg.FrontendOrigin = frontendOrigin

	mockDB := newWSMockSupabase(t)
	t.Cleanup(mockDB.Close)
	cfg.SupabaseURL = mockDB.URL

	authMW := src.NewAuthMiddleware(cfg, nil, nil)
	hub := src.NewWebSocketHub()
	db := src.NewSupabaseClient(cfg)

	handler := src.HandleJobProgress(hub, authMW, db, frontendOrigin)

	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		r.SetPathValue("id", "test-job-id")
		handler(w, r)
	}))
}

// validWSToken returns a short-lived JWT signed with testJWTSecret.
func validWSToken() string {
	return buildJWT(testJWTSecret, map[string]any{
		"sub": "ws-test-user",
		"exp": time.Now().Add(time.Hour).Unix(),
	})
}

// --- Task 6: WebSocket CheckOrigin restriction ---

// TestHandleJobProgress_MissingToken_Returns401 verifies that the WebSocket handler
// rejects requests with no ?token= query parameter before attempting the upgrade.
func TestHandleJobProgress_MissingToken_Returns401(t *testing.T) {
	cfg := newTestConfig(t)
	cfg.SupabaseJWTSecret = testJWTSecret
	authMW := src.NewAuthMiddleware(cfg, nil, nil)
	hub := src.NewWebSocketHub()

	req := httptest.NewRequest(http.MethodGet, "/api/jobs/job1/progress", nil)
	req.SetPathValue("id", "job1")
	rr := httptest.NewRecorder()

	// db is nil: the handler returns before reaching db.GetJob() (missing token returns 401 early).
	src.HandleJobProgress(hub, authMW, nil, "https://app.example.com")(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 for missing token, got %d: %s", rr.Code, rr.Body.String())
	}
}

// TestHandleJobProgress_InvalidToken_Returns401 verifies that an invalid/malformed
// JWT query token is rejected before the WebSocket upgrade.
func TestHandleJobProgress_InvalidToken_Returns401(t *testing.T) {
	cfg := newTestConfig(t)
	cfg.SupabaseJWTSecret = testJWTSecret
	authMW := src.NewAuthMiddleware(cfg, nil, nil)
	hub := src.NewWebSocketHub()

	req := httptest.NewRequest(http.MethodGet, "/api/jobs/job1/progress?token=not.a.valid.jwt", nil)
	req.SetPathValue("id", "job1")
	rr := httptest.NewRecorder()

	// db is nil: the handler returns before reaching db.GetJob() (invalid token returns 401 early).
	src.HandleJobProgress(hub, authMW, nil, "https://app.example.com")(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 for invalid token, got %d: %s", rr.Code, rr.Body.String())
	}
}

// TestHandleJobProgress_WrongOrigin_Returns403 verifies that the WebSocket upgrader
// rejects connections from an Origin that does not match the configured FRONTEND_ORIGIN.
func TestHandleJobProgress_WrongOrigin_Returns403(t *testing.T) {
	frontendOrigin := "https://app.example.com"
	srv := newTestWSServer(t, frontendOrigin)
	defer srv.Close()

	token := validWSToken()
	wsURL := "ws" + strings.TrimPrefix(srv.URL, "http") + "/?token=" + token

	dialer := &websocket.Dialer{HandshakeTimeout: 2 * time.Second}
	header := http.Header{"Origin": {"https://attacker.com"}}

	conn, resp, err := dialer.Dial(wsURL, header)
	if conn != nil {
		conn.Close()
	}
	if resp != nil {
		defer resp.Body.Close()
	}

	if err == nil {
		t.Fatal("expected WebSocket connection to be rejected for wrong origin, but upgrade succeeded")
	}
	if resp == nil {
		t.Fatal("expected an HTTP response on rejection, got nil")
	}
	if resp.StatusCode != http.StatusForbidden {
		t.Fatalf("expected 403 Forbidden for wrong origin, got %d", resp.StatusCode)
	}
}

// TestHandleJobProgress_CorrectOrigin_Accepted verifies that the WebSocket upgrader
// allows connections from the configured FRONTEND_ORIGIN.
func TestHandleJobProgress_CorrectOrigin_Accepted(t *testing.T) {
	frontendOrigin := "https://app.example.com"
	srv := newTestWSServer(t, frontendOrigin)
	defer srv.Close()

	token := validWSToken()
	wsURL := "ws" + strings.TrimPrefix(srv.URL, "http") + "/?token=" + token

	dialer := &websocket.Dialer{HandshakeTimeout: 2 * time.Second}
	header := http.Header{"Origin": {frontendOrigin}}

	conn, resp, err := dialer.Dial(wsURL, header)
	if conn != nil {
		conn.Close()
	}
	if err != nil {
		statusCode := 0
		if resp != nil {
			statusCode = resp.StatusCode
		}
		t.Fatalf("expected WebSocket upgrade to succeed for correct origin, got error: %v (status: %d)", err, statusCode)
	}
}

// TestHandleJobProgress_EmptyOrigin_Accepted verifies that requests with no Origin
// header (e.g. non-browser clients) are allowed through the CheckOrigin guard.
func TestHandleJobProgress_EmptyOrigin_Accepted(t *testing.T) {
	frontendOrigin := "https://app.example.com"
	srv := newTestWSServer(t, frontendOrigin)
	defer srv.Close()

	token := validWSToken()
	wsURL := "ws" + strings.TrimPrefix(srv.URL, "http") + "/?token=" + token

	// No Origin header
	dialer := &websocket.Dialer{HandshakeTimeout: 2 * time.Second}

	conn, resp, err := dialer.Dial(wsURL, nil)
	if conn != nil {
		conn.Close()
	}
	if err != nil {
		statusCode := 0
		if resp != nil {
			statusCode = resp.StatusCode
		}
		t.Fatalf("expected WebSocket upgrade to succeed with empty origin, got error: %v (status: %d)", err, statusCode)
	}
}
