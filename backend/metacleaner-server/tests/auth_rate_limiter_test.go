package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"

	src "metacleaner-server/source"
)

func newTestRateLimiter() *src.AuthRateLimiter {
	return src.NewAuthRateLimiter()
}

func okHandler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
}

func makeIPRequest(ip string) *http.Request {
	r := httptest.NewRequest(http.MethodPost, "/api/auth/login", nil)
	r.RemoteAddr = ip + ":12345"
	return r
}

// --- Per-IP rate limit tests ---

func TestAuthRateLimiter_AllowsFirstFiveRequests(t *testing.T) {
	arl := newTestRateLimiter()
	handler := arl.Middleware(okHandler())

	for i := 0; i < 5; i++ {
		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, makeIPRequest("10.0.0.1"))
		if rr.Code != http.StatusOK {
			t.Fatalf("request %d: expected 200, got %d", i+1, rr.Code)
		}
	}
}

func TestAuthRateLimiter_BlocksSixthRequest(t *testing.T) {
	arl := newTestRateLimiter()
	handler := arl.Middleware(okHandler())

	// Consume burst of 5
	for i := 0; i < 5; i++ {
		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, makeIPRequest("10.0.0.2"))
		if rr.Code != http.StatusOK {
			t.Fatalf("request %d: expected 200, got %d", i+1, rr.Code)
		}
	}

	// 6th request must be rate limited
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, makeIPRequest("10.0.0.2"))
	if rr.Code != http.StatusTooManyRequests {
		t.Fatalf("6th request: expected 429, got %d", rr.Code)
	}
}

func TestAuthRateLimiter_RetryAfterHeaderPresent(t *testing.T) {
	arl := newTestRateLimiter()
	handler := arl.Middleware(okHandler())

	// Consume the burst
	for i := 0; i < 5; i++ {
		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, makeIPRequest("10.0.0.3"))
	}

	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, makeIPRequest("10.0.0.3"))

	if rr.Code != http.StatusTooManyRequests {
		t.Fatalf("expected 429, got %d", rr.Code)
	}
	retryAfter := rr.Header().Get("Retry-After")
	if retryAfter == "" {
		t.Fatal("expected Retry-After header, got none")
	}
	val, err := strconv.Atoi(retryAfter)
	if err != nil || val < 1 {
		t.Fatalf("Retry-After must be a positive integer, got %q", retryAfter)
	}
}

func TestAuthRateLimiter_RetryAfterErrorCodeIsRateLimitExceeded(t *testing.T) {
	arl := newTestRateLimiter()
	handler := arl.Middleware(okHandler())

	for i := 0; i < 5; i++ {
		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, makeIPRequest("10.0.0.4"))
	}

	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, makeIPRequest("10.0.0.4"))

	var errResp src.ErrorResponse
	if err := json.NewDecoder(rr.Body).Decode(&errResp); err != nil {
		t.Fatalf("decode error response: %v", err)
	}
	if errResp.Error != "RATE_LIMIT_EXCEEDED" {
		t.Fatalf("expected error code RATE_LIMIT_EXCEEDED, got %q", errResp.Error)
	}
}

func TestAuthRateLimiter_DifferentIPsHaveSeparateLimits(t *testing.T) {
	arl := newTestRateLimiter()
	handler := arl.Middleware(okHandler())

	// Exhaust IP 10.0.1.1
	for i := 0; i < 5; i++ {
		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, makeIPRequest("10.0.1.1"))
	}

	// IP 10.0.1.2 should still have its own fresh quota
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, makeIPRequest("10.0.1.2"))
	if rr.Code != http.StatusOK {
		t.Fatalf("different IP should not be rate limited, got %d", rr.Code)
	}
}

// --- IP extraction tests ---

func TestExtractRemoteIP_StripsPort(t *testing.T) {
	arl := newTestRateLimiter()
	handler := arl.Middleware(okHandler())

	// Both requests from same underlying IP but different port — should share the same limiter
	for i := 0; i < 5; i++ {
		r := httptest.NewRequest(http.MethodPost, "/api/auth/login", nil)
		r.RemoteAddr = "192.168.1.1:9999"
		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, r)
	}

	// Now try with a different port — must still be blocked (same IP)
	r := httptest.NewRequest(http.MethodPost, "/api/auth/login", nil)
	r.RemoteAddr = "192.168.1.1:8080"
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, r)
	if rr.Code != http.StatusTooManyRequests {
		t.Fatalf("different port on same IP should be rate limited, got %d", rr.Code)
	}
}

// --- Magic link per-email+IP rate limit tests ---

func makeMagicLinkRequest(ip, email string) *http.Request {
	body, _ := json.Marshal(map[string]string{"email": email})
	r := httptest.NewRequest(http.MethodPost, "/api/auth/magic-link", bytes.NewReader(body))
	r.RemoteAddr = ip + ":54321"
	return r
}

func TestMagicLinkMiddleware_AllowsFirstThreeRequests(t *testing.T) {
	arl := newTestRateLimiter()
	handler := arl.MagicLinkMiddleware(okHandler())

	for i := 0; i < 3; i++ {
		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, makeMagicLinkRequest("10.0.2.1", "user@example.com"))
		if rr.Code != http.StatusOK {
			t.Fatalf("request %d: expected 200, got %d", i+1, rr.Code)
		}
	}
}

func TestMagicLinkMiddleware_BlocksFourthRequest(t *testing.T) {
	arl := newTestRateLimiter()
	handler := arl.MagicLinkMiddleware(okHandler())

	for i := 0; i < 3; i++ {
		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, makeMagicLinkRequest("10.0.2.2", "alice@example.com"))
		if rr.Code != http.StatusOK {
			t.Fatalf("request %d: expected 200, got %d", i+1, rr.Code)
		}
	}

	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, makeMagicLinkRequest("10.0.2.2", "alice@example.com"))
	if rr.Code != http.StatusTooManyRequests {
		t.Fatalf("4th request: expected 429, got %d", rr.Code)
	}
}

func TestMagicLinkMiddleware_RetryAfterHeaderPresent(t *testing.T) {
	arl := newTestRateLimiter()
	handler := arl.MagicLinkMiddleware(okHandler())

	for i := 0; i < 3; i++ {
		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, makeMagicLinkRequest("10.0.2.3", "bob@example.com"))
	}

	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, makeMagicLinkRequest("10.0.2.3", "bob@example.com"))

	retryAfter := rr.Header().Get("Retry-After")
	if retryAfter == "" {
		t.Fatal("expected Retry-After header on magic link 429, got none")
	}
	val, err := strconv.Atoi(retryAfter)
	if err != nil || val < 1 {
		t.Fatalf("Retry-After must be a positive integer, got %q", retryAfter)
	}
}

func TestMagicLinkMiddleware_DifferentEmailSameIPNotBlocked(t *testing.T) {
	arl := newTestRateLimiter()
	handler := arl.MagicLinkMiddleware(okHandler())

	// Exhaust email1@example.com from 10.0.3.1
	for i := 0; i < 3; i++ {
		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, makeMagicLinkRequest("10.0.3.1", "email1@example.com"))
	}

	// Different email from same IP should have its own limit
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, makeMagicLinkRequest("10.0.3.1", "email2@example.com"))
	if rr.Code != http.StatusOK {
		t.Fatalf("different email should not be rate limited, got %d", rr.Code)
	}
}

func TestMagicLinkMiddleware_SameEmailDifferentIPNotBlocked(t *testing.T) {
	arl := newTestRateLimiter()
	handler := arl.MagicLinkMiddleware(okHandler())

	// Exhaust shared@example.com from 10.0.4.1
	for i := 0; i < 3; i++ {
		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, makeMagicLinkRequest("10.0.4.1", "shared@example.com"))
	}

	// Same email but different IP should have its own limit
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, makeMagicLinkRequest("10.0.4.2", "shared@example.com"))
	if rr.Code != http.StatusOK {
		t.Fatalf("same email from different IP should not be rate limited, got %d", rr.Code)
	}
}

func TestMagicLinkMiddleware_MissingEmailPassesToNextHandler(t *testing.T) {
	arl := newTestRateLimiter()

	// Track whether next was called
	nextCalled := false
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		nextCalled = true
		w.WriteHeader(http.StatusOK)
	})
	handler := arl.MagicLinkMiddleware(next)

	// Request with no email field in body
	body := []byte(`{}`)
	r := httptest.NewRequest(http.MethodPost, "/api/auth/magic-link", bytes.NewReader(body))
	r.RemoteAddr = "10.0.5.1:1234"
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, r)

	if !nextCalled {
		t.Fatal("expected next handler to be called when email is missing")
	}
}

func TestMagicLinkMiddleware_InvalidJSONPassesToNextHandler(t *testing.T) {
	arl := newTestRateLimiter()

	nextCalled := false
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		nextCalled = true
		w.WriteHeader(http.StatusOK)
	})
	handler := arl.MagicLinkMiddleware(next)

	r := httptest.NewRequest(http.MethodPost, "/api/auth/magic-link", bytes.NewReader([]byte(`not-json`)))
	r.RemoteAddr = "10.0.5.2:1234"
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, r)

	if !nextCalled {
		t.Fatal("expected next handler to be called when JSON is invalid")
	}
}

func TestMagicLinkMiddleware_BodyRestoredForNextHandler(t *testing.T) {
	arl := newTestRateLimiter()

	var bodyReadByNext []byte
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		bodyReadByNext, _ = json.Marshal(map[string]string{})
		var m map[string]string
		if err := json.NewDecoder(r.Body).Decode(&m); err == nil {
			b, _ := json.Marshal(m)
			bodyReadByNext = b
		}
		w.WriteHeader(http.StatusOK)
	})
	handler := arl.MagicLinkMiddleware(next)

	email := "check@example.com"
	body, _ := json.Marshal(map[string]string{"email": email})
	r := httptest.NewRequest(http.MethodPost, "/api/auth/magic-link", bytes.NewReader(body))
	r.RemoteAddr = "10.0.6.1:1234"
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, r)

	// Verify the next handler received the full body
	var decoded map[string]string
	if err := json.Unmarshal(bodyReadByNext, &decoded); err != nil {
		t.Fatalf("next handler did not receive readable body: %v", err)
	}
	if decoded["email"] != email {
		t.Fatalf("body not restored: expected email %q, got %q", email, decoded["email"])
	}
}
