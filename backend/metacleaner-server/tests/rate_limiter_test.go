package tests

// NOTE: The ipRateLimiter in router.go wraps only the download endpoints
// (GET /api/files/{id}/download and GET /api/jobs/{id}/download). Those endpoints
// require auth via authMW.Middleware, which rejects HS256 tokens and only accepts
// ES256 tokens via JWKS. The test helper buildJWT creates HS256 tokens, so
// per-IP rate limiter tests through the download routes are not possible without
// a mock JWKS server.
//
// These tests exercise per-IP rate limiting behavior through the auth endpoints
// (POST /api/auth/register, POST /api/auth/login), which:
//   - are exempt from JWT auth (isExemptPath returns true for /api/auth/*)
//   - are rate limited by AuthRateLimiter (5 req/min burst, per IP)
//
// The AuthRateLimiter uses the same per-IP token bucket pattern as ipRateLimiter.

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	src "metacleaner-server/source"
)

// TestAuthIPRateLimiter_SameIPExhaustedBeforeDifferentIP verifies that consuming
// the burst for IP A does not consume the burst for IP B.
func TestAuthIPRateLimiter_SameIPExhaustedBeforeDifferentIP(t *testing.T) {
	cfg := newTestConfig(t)
	cfg.SupabaseJWTSecret = testJWTSecret
	cfg.RateLimitRPM = 1000 // high value so ipRateLimiter doesn't interfere

	router := newTestRouter(t, cfg)

	makeRegisterFrom := func(ip string) *httptest.ResponseRecorder {
		body := `{"email":"test@example.com","password":"Test1234!","name":"Test"}`
		req := httptest.NewRequest(http.MethodPost, "/api/auth/register", strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.RemoteAddr = ip + ":5000"
		rr := httptest.NewRecorder()
		router.ServeHTTP(rr, req)
		return rr
	}

	// Exhaust IP A's auth rate limit burst (5 requests).
	for i := 0; i < 5; i++ {
		rr := makeRegisterFrom("10.10.1.1")
		if rr.Code == http.StatusTooManyRequests {
			t.Fatalf("request %d of 5 from IP A: should not be rate limited yet (burst=5)", i+1)
		}
	}

	// 6th request from IP A — must be rate limited.
	rrA6 := makeRegisterFrom("10.10.1.1")
	if rrA6.Code != http.StatusTooManyRequests {
		t.Fatalf("6th request from IP A: expected 429, got %d", rrA6.Code)
	}

	// IP B should have its own fresh burst — first request must NOT be rate limited.
	rrB1 := makeRegisterFrom("10.10.1.2")
	if rrB1.Code == http.StatusTooManyRequests {
		t.Errorf("1st request from IP B: should not be rate limited (independent limiter from IP A), got 429")
	}
}

// TestAuthIPRateLimiter_BurstAllowsExactlyFiveRequests verifies the burst size
// of the auth rate limiter: exactly 5 requests succeed before the 6th is blocked.
func TestAuthIPRateLimiter_BurstAllowsExactlyFiveRequests(t *testing.T) {
	cfg := newTestConfig(t)
	cfg.RateLimitRPM = 1000

	router := newTestRouter(t, cfg)

	makeReq := func() *httptest.ResponseRecorder {
		body := `{"email":"burst@example.com","password":"Test1234!","name":"Burst"}`
		req := httptest.NewRequest(http.MethodPost, "/api/auth/login", strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.RemoteAddr = "10.20.1.1:1234"
		rr := httptest.NewRecorder()
		router.ServeHTTP(rr, req)
		return rr
	}

	for i := 1; i <= 5; i++ {
		rr := makeReq()
		if rr.Code == http.StatusTooManyRequests {
			t.Fatalf("request %d/5: should not be blocked (burst=5)", i)
		}
	}

	rr := makeReq()
	if rr.Code != http.StatusTooManyRequests {
		t.Errorf("6th request: expected 429, got %d (burst should be exhausted)", rr.Code)
	}
}

// TestAuthIPRateLimiter_RateLimitedResponseHasRetryAfter verifies that 429
// responses include the Retry-After header for client guidance.
func TestAuthIPRateLimiter_RateLimitedResponseHasRetryAfter(t *testing.T) {
	cfg := newTestConfig(t)
	cfg.RateLimitRPM = 1000

	router := newTestRouter(t, cfg)

	makeReq := func() *httptest.ResponseRecorder {
		body := `{"email":"retry@example.com","password":"Test1234!"}`
		req := httptest.NewRequest(http.MethodPost, "/api/auth/login", strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.RemoteAddr = "10.30.1.1:9999"
		rr := httptest.NewRecorder()
		router.ServeHTTP(rr, req)
		return rr
	}

	// Exhaust the 5-request burst.
	for i := 0; i < 5; i++ {
		makeReq()
	}
	rr := makeReq()
	if rr.Code != http.StatusTooManyRequests {
		t.Fatalf("expected 429 after exhausting burst, got %d", rr.Code)
	}
	if rr.Header().Get("Retry-After") == "" {
		t.Error("429 response must include Retry-After header")
	}

	var errResp src.ErrorResponse
	if err := json.NewDecoder(rr.Body).Decode(&errResp); err == nil {
		if errResp.Error != src.ErrRateLimitExceeded {
			t.Errorf("error code = %q, want %q", errResp.Error, src.ErrRateLimitExceeded)
		}
	}
}

// TestAuthIPRateLimiter_MultipleIPsAreIsolated verifies that three different IPs
// each get their own rate limit counter.
func TestAuthIPRateLimiter_MultipleIPsAreIsolated(t *testing.T) {
	cfg := newTestConfig(t)
	cfg.RateLimitRPM = 1000

	router := newTestRouter(t, cfg)

	makeReqFrom := func(ip string) *httptest.ResponseRecorder {
		body := `{"email":"isolated@example.com","password":"Test1234!"}`
		req := httptest.NewRequest(http.MethodPost, "/api/auth/login", strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.RemoteAddr = ip + ":4444"
		rr := httptest.NewRecorder()
		router.ServeHTTP(rr, req)
		return rr
	}

	ips := []string{"172.16.0.1", "172.16.0.2", "172.16.0.3"}

	// Exhaust IP[0]'s burst.
	for i := 0; i < 5; i++ {
		makeReqFrom(ips[0])
	}
	if rr := makeReqFrom(ips[0]); rr.Code != http.StatusTooManyRequests {
		t.Fatalf("IP[0] 6th request: expected 429, got %d", rr.Code)
	}

	// IP[1] and IP[2] should be unaffected.
	for _, ip := range ips[1:] {
		rr := makeReqFrom(ip)
		if rr.Code == http.StatusTooManyRequests {
			t.Errorf("IP %s: should not be rate limited (different limiter from IP[0])", ip)
		}
	}
}
