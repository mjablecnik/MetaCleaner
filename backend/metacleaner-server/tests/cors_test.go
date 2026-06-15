package tests

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

// TestCORSMiddleware_EmptyOrigin_NoHeadersSet verifies that when FRONTEND_ORIGIN is
// empty the corsMiddleware omits all Access-Control-* headers so browsers block
// cross-origin requests by default.
func TestCORSMiddleware_EmptyOrigin_NoHeadersSet(t *testing.T) {
	cfg := newTestConfig(t)
	cfg.SupabaseJWTSecret = testJWTSecret
	cfg.RateLimitRPM = 1000
	cfg.FrontendOrigin = "" // no origin configured

	router := newTestRouter(t, cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	corsHeaders := []string{
		"Access-Control-Allow-Origin",
		"Access-Control-Allow-Methods",
		"Access-Control-Allow-Headers",
		"Access-Control-Allow-Credentials",
	}
	for _, h := range corsHeaders {
		if got := rr.Header().Get(h); got != "" {
			t.Errorf("empty origin: header %s should not be set, got %q", h, got)
		}
	}
}

// TestCORSMiddleware_EmptyOrigin_RequestPassesThrough verifies that requests
// still reach handlers and get a normal response when CORS is disabled.
func TestCORSMiddleware_EmptyOrigin_RequestPassesThrough(t *testing.T) {
	cfg := newTestConfig(t)
	cfg.SupabaseJWTSecret = testJWTSecret
	cfg.RateLimitRPM = 1000
	cfg.FrontendOrigin = ""

	router := newTestRouter(t, cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected 200 on /api/health with empty origin, got %d", rr.Code)
	}
}

// TestCORSMiddleware_ConfiguredOrigin_HeadersSet verifies that when
// FRONTEND_ORIGIN is set, Access-Control-Allow-Origin echoes the configured value.
func TestCORSMiddleware_ConfiguredOrigin_HeadersSet(t *testing.T) {
	const origin = "https://app.example.com"

	cfg := newTestConfig(t)
	cfg.SupabaseJWTSecret = testJWTSecret
	cfg.RateLimitRPM = 1000
	cfg.FrontendOrigin = origin

	router := newTestRouter(t, cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if got := rr.Header().Get("Access-Control-Allow-Origin"); got != origin {
		t.Errorf("Access-Control-Allow-Origin = %q, want %q", got, origin)
	}
	if got := rr.Header().Get("Access-Control-Allow-Credentials"); got != "true" {
		t.Errorf("Access-Control-Allow-Credentials = %q, want %q", got, "true")
	}
	if got := rr.Header().Get("Access-Control-Allow-Methods"); got == "" {
		t.Error("Access-Control-Allow-Methods should be set when origin is configured")
	}
	if got := rr.Header().Get("Access-Control-Allow-Headers"); got == "" {
		t.Error("Access-Control-Allow-Headers should be set when origin is configured")
	}
}

// TestCORSMiddleware_OPTIONSPreflight_Returns204 verifies that OPTIONS requests
// return 204 No Content with all CORS headers when origin is configured.
func TestCORSMiddleware_OPTIONSPreflight_Returns204(t *testing.T) {
	const origin = "https://app.example.com"

	cfg := newTestConfig(t)
	cfg.SupabaseJWTSecret = testJWTSecret
	cfg.RateLimitRPM = 1000
	cfg.FrontendOrigin = origin

	router := newTestRouter(t, cfg)

	req := httptest.NewRequest(http.MethodOptions, "/api/health", nil)
	req.Header.Set("Origin", origin)
	req.Header.Set("Access-Control-Request-Method", "POST")
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusNoContent {
		t.Errorf("OPTIONS preflight: expected 204, got %d", rr.Code)
	}
	if got := rr.Header().Get("Access-Control-Allow-Origin"); got != origin {
		t.Errorf("OPTIONS: Access-Control-Allow-Origin = %q, want %q", got, origin)
	}
}

// TestCORSMiddleware_OPTIONSPreflight_EmptyOrigin_PassesThrough verifies that
// OPTIONS requests with no configured origin are forwarded to the handler instead
// of returning a 204 preflight response.
func TestCORSMiddleware_OPTIONSPreflight_EmptyOrigin_PassesThrough(t *testing.T) {
	cfg := newTestConfig(t)
	cfg.SupabaseJWTSecret = testJWTSecret
	cfg.RateLimitRPM = 1000
	cfg.FrontendOrigin = ""

	router := newTestRouter(t, cfg)

	req := httptest.NewRequest(http.MethodOptions, "/api/health", nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	// Should not be a CORS preflight 204 — the handler responds normally.
	if rr.Code == http.StatusNoContent {
		t.Error("OPTIONS with empty origin should not return 204 (cors preflight short-circuit)")
	}
	// No CORS headers should be set.
	if got := rr.Header().Get("Access-Control-Allow-Origin"); got != "" {
		t.Errorf("Access-Control-Allow-Origin should not be set with empty origin, got %q", got)
	}
}

// TestCORSMiddleware_NonOPTIONSWithOrigin_RequestPassesThrough verifies that
// non-OPTIONS methods still reach their handlers with CORS headers present.
func TestCORSMiddleware_NonOPTIONSWithOrigin_RequestPassesThrough(t *testing.T) {
	cfg := newTestConfig(t)
	cfg.SupabaseJWTSecret = testJWTSecret
	cfg.RateLimitRPM = 1000
	cfg.FrontendOrigin = "https://app.example.com"

	router := newTestRouter(t, cfg)

	token := buildJWT(testJWTSecret, map[string]any{
		"sub": "user-cors-test",
		"exp": time.Now().Add(time.Hour).Unix(),
	})

	req := httptest.NewRequest(http.MethodGet, "/api/reports", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	// Handler reached — auth passes, response is not a CORS rejection.
	if got := rr.Header().Get("Access-Control-Allow-Origin"); got != "https://app.example.com" {
		t.Errorf("Access-Control-Allow-Origin = %q, want %q", got, "https://app.example.com")
	}
}
