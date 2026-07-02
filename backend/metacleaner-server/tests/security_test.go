package tests

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	src "metacleaner-server/source"
)

// newTestRouter creates a full router stack for integration tests.
// Uses HS256 JWT validation via SupabaseJWTSecret (no JWKS fetch needed).
func newTestRouter(t *testing.T, cfg src.Config) http.Handler {
	t.Helper()
	db := src.NewSupabaseClient(cfg)
	hub := src.NewWebSocketHub()
	pl := src.NewCleaningPipeline(cfg)
	authClient := src.NewSupabaseAuthClient(cfg)
	return src.NewRouter(cfg, db, hub, pl, authClient)
}

// --- Task 5: Security headers middleware ---

// TestSecurityHeaders_SetOnHealthEndpoint verifies that X-Content-Type-Options,
// X-Frame-Options and Strict-Transport-Security are present on every response
// routed through the full NewRouter stack.
func TestSecurityHeaders_SetOnHealthEndpoint(t *testing.T) {
	cfg := newTestConfig(t)
	cfg.SupabaseJWTSecret = testJWTSecret
	cfg.RateLimitRPM = 1000

	router := newTestRouter(t, cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	headers := []struct{ name, want string }{
		{"X-Content-Type-Options", "nosniff"},
		{"X-Frame-Options", "DENY"},
		{"Strict-Transport-Security", "max-age=31536000; includeSubDomains"},
	}
	for _, h := range headers {
		got := rr.Header().Get(h.name)
		if got != h.want {
			t.Errorf("security header %s: expected %q, got %q", h.name, h.want, got)
		}
	}
}

// TestSecurityHeaders_SetOnUnauthorizedResponse verifies that security headers
// are applied even when the auth middleware rejects the request (401 response).
func TestSecurityHeaders_SetOnUnauthorizedResponse(t *testing.T) {
	cfg := newTestConfig(t)
	cfg.SupabaseJWTSecret = testJWTSecret
	cfg.RateLimitRPM = 1000

	router := newTestRouter(t, cfg)

	// No Authorization header — auth middleware returns 401
	req := httptest.NewRequest(http.MethodGet, "/api/reports", nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 for missing auth on /api/reports, got %d", rr.Code)
	}
	if got := rr.Header().Get("X-Content-Type-Options"); got != "nosniff" {
		t.Errorf("X-Content-Type-Options should be set on 401 responses, got %q", got)
	}
	if got := rr.Header().Get("X-Frame-Options"); got != "DENY" {
		t.Errorf("X-Frame-Options should be set on 401 responses, got %q", got)
	}
}

// --- Task 7: Rate limiting on file/job download endpoints ---

// TestRateLimit_FileDownload_BlocksAfterBurst verifies that the file download endpoint
// is rate-limited and returns 429 after the burst is exhausted from a single IP.
func TestRateLimit_FileDownload_BlocksAfterBurst(t *testing.T) {
	cfg := newTestConfig(t)
	cfg.SupabaseJWTSecret = testJWTSecret
	cfg.RateLimitRPM = 1 // burst of 1

	router := newTestRouter(t, cfg)

	token := buildJWT(testJWTSecret, map[string]any{
		"sub":  testUserUUID,
		"exp":  time.Now().Add(time.Hour).Unix(),
		"role": "authenticated",
	})

	makeReq := func() *httptest.ResponseRecorder {
		req := httptest.NewRequest(http.MethodGet, "/api/files/f-aabbccdd/download", nil)
		req.RemoteAddr = "10.0.99.1:12345"
		req.Header.Set("Authorization", "Bearer "+token)
		rr := httptest.NewRecorder()
		router.ServeHTTP(rr, req)
		return rr
	}

	// First request consumes the burst — reaches the handler (404 file not found)
	rr1 := makeReq()
	if rr1.Code == http.StatusTooManyRequests {
		t.Fatal("first request should not be rate limited")
	}

	// Second request from the same IP — must be rate limited
	rr2 := makeReq()
	if rr2.Code != http.StatusTooManyRequests {
		t.Fatalf("second request from same IP should be rate limited (429), got %d: %s", rr2.Code, rr2.Body.String())
	}
	var errResp src.ErrorResponse
	if err := json.NewDecoder(rr2.Body).Decode(&errResp); err != nil {
		t.Fatalf("decode error response: %v", err)
	}
	if errResp.Error != src.ErrRateLimitExceeded {
		t.Errorf("expected error code %q, got %q", src.ErrRateLimitExceeded, errResp.Error)
	}
}

// TestRateLimit_JobDownload_BlocksAfterBurst verifies that the job download endpoint
// is also rate-limited from the same per-IP limiter.
func TestRateLimit_JobDownload_BlocksAfterBurst(t *testing.T) {
	cfg := newTestConfig(t)
	cfg.SupabaseJWTSecret = testJWTSecret
	cfg.RateLimitRPM = 1 // burst of 1

	router := newTestRouter(t, cfg)

	token := buildJWT(testJWTSecret, map[string]any{
		"sub":  testUserUUID,
		"exp":  time.Now().Add(time.Hour).Unix(),
		"role": "authenticated",
	})

	makeReq := func() *httptest.ResponseRecorder {
		req := httptest.NewRequest(http.MethodGet, "/api/jobs/11223344-5566-4778-8990-aabbccddeeff/download", nil)
		req.RemoteAddr = "10.0.99.2:12345"
		req.Header.Set("Authorization", "Bearer "+token)
		rr := httptest.NewRecorder()
		router.ServeHTTP(rr, req)
		return rr
	}

	// First request consumes the burst
	rr1 := makeReq()
	if rr1.Code == http.StatusTooManyRequests {
		t.Fatal("first job download request should not be rate limited")
	}

	// Second request must be rate limited
	rr2 := makeReq()
	if rr2.Code != http.StatusTooManyRequests {
		t.Fatalf("second job download request from same IP should be rate limited (429), got %d", rr2.Code)
	}
}

// TestRateLimit_DifferentIPsHaveSeparateLimits verifies that rate limiting is
// per-IP and does not bleed between clients.
func TestRateLimit_DifferentIPsHaveSeparateLimits(t *testing.T) {
	cfg := newTestConfig(t)
	cfg.SupabaseJWTSecret = testJWTSecret
	cfg.RateLimitRPM = 1

	router := newTestRouter(t, cfg)

	token := buildJWT(testJWTSecret, map[string]any{
		"sub":  testUserUUID,
		"exp":  time.Now().Add(time.Hour).Unix(),
		"role": "authenticated",
	})

	makeReqFrom := func(ip string) *httptest.ResponseRecorder {
		req := httptest.NewRequest(http.MethodGet, "/api/files/f-aabbccdd/download", nil)
		req.RemoteAddr = ip + ":9999"
		req.Header.Set("Authorization", "Bearer "+token)
		rr := httptest.NewRecorder()
		router.ServeHTTP(rr, req)
		return rr
	}

	// Exhaust IP1's burst
	makeReqFrom("10.0.100.1")
	// IP1 is now rate limited
	if makeReqFrom("10.0.100.1").Code != http.StatusTooManyRequests {
		t.Fatal("IP1 should be rate limited after burst exhausted")
	}
	// IP2 must still be allowed
	if makeReqFrom("10.0.100.2").Code == http.StatusTooManyRequests {
		t.Fatal("IP2 should not be affected by IP1's rate limit")
	}
}
