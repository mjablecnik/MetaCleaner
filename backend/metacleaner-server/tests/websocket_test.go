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

// testWSJobID is a valid UUID v4 used as the job ID in WebSocket tests.
const testWSJobID = "11223344-5566-4778-8990-aabbccddeeff"

// wsTestTicketStore is a shared ticket store for WebSocket tests so tickets
// minted by validWSTicket() can be consumed by the handlers under test.
var wsTestTicketStore = src.NewWSTicketStore()

// newWSMockSupabase creates a mock Supabase HTTP server that returns a valid job
// for any cleaning_jobs GET request. Used by WebSocket tests that reach db.GetJob().
func newWSMockSupabase(t *testing.T) *httptest.Server {
	t.Helper()
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		if strings.Contains(r.URL.Path, "/cleaning_jobs") && r.Method == http.MethodGet {
			now := time.Now().UTC().Format(time.RFC3339)
			fmt.Fprintf(w, `[{"id":%q,"status":"processing","total_files":1,"files_completed":0,"fields_removed":0,"gps_locations_removed":0,"created_at":%q}]`, testWSJobID, now)
			return
		}
		w.Write([]byte(`[]`))
	}))
}

// newTestWSServer creates an httptest.Server that serves HandleJobProgress.
// It uses wsTestTicketStore so validWSTicket() tickets are accepted.
func newTestWSServer(t *testing.T, frontendOrigin string) *httptest.Server {
	t.Helper()
	hub := src.NewWebSocketHub()
	handler := src.HandleJobProgress(hub, wsTestTicketStore, frontendOrigin)
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		r.SetPathValue("id", testWSJobID)
		handler(w, r)
	}))
}

// validWSTicket mints a fresh 30-second ticket for testWSJobID/testUserUUID.
func validWSTicket() string {
	ticket, err := wsTestTicketStore.Mint(testUserUUID, testWSJobID)
	if err != nil {
		panic("validWSTicket: " + err.Error())
	}
	return ticket
}

// --- Task 6: WebSocket CheckOrigin restriction ---

// TestHandleJobProgress_MissingTicket_Returns401 verifies that the WebSocket handler
// rejects requests with no ?ticket= query parameter before attempting the upgrade.
func TestHandleJobProgress_MissingTicket_Returns401(t *testing.T) {
	hub := src.NewWebSocketHub()
	req := httptest.NewRequest(http.MethodGet, "/api/jobs/"+testWSJobID+"/progress", nil)
	req.SetPathValue("id", testWSJobID)
	rr := httptest.NewRecorder()
	src.HandleJobProgress(hub, src.NewWSTicketStore(), "https://app.example.com")(rr, req)
	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 for missing ticket, got %d: %s", rr.Code, rr.Body.String())
	}
}

// TestHandleJobProgress_InvalidTicket_Returns401 verifies that an unknown/expired
// ticket value is rejected before the WebSocket upgrade.
func TestHandleJobProgress_InvalidTicket_Returns401(t *testing.T) {
	hub := src.NewWebSocketHub()
	req := httptest.NewRequest(http.MethodGet, "/api/jobs/"+testWSJobID+"/progress?ticket=not-a-valid-ticket", nil)
	req.SetPathValue("id", testWSJobID)
	rr := httptest.NewRecorder()
	src.HandleJobProgress(hub, src.NewWSTicketStore(), "https://app.example.com")(rr, req)
	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 for invalid ticket, got %d: %s", rr.Code, rr.Body.String())
	}
}

// TestHandleJobProgress_WrongOrigin_Returns403 verifies that the WebSocket upgrader
// rejects connections from an Origin that does not match the configured FRONTEND_ORIGIN.
func TestHandleJobProgress_WrongOrigin_Returns403(t *testing.T) {
	frontendOrigin := "https://app.example.com"
	srv := newTestWSServer(t, frontendOrigin)
	defer srv.Close()

	ticket := validWSTicket()
	wsURL := "ws" + strings.TrimPrefix(srv.URL, "http") + "/?ticket=" + ticket

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

	ticket := validWSTicket()
	wsURL := "ws" + strings.TrimPrefix(srv.URL, "http") + "/?ticket=" + ticket

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

	ticket := validWSTicket()
	wsURL := "ws" + strings.TrimPrefix(srv.URL, "http") + "/?ticket=" + ticket

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
