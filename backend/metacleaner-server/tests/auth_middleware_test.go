package tests

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	src "metacleaner-server/source"
)

const testJWTSecret = "test-secret-key-for-unit-tests"

// testUserUUID is a valid UUID v4 used in tests that require UUID-format sub claims.
const testUserUUID = "a1b2c3d4-e5f6-4789-abcd-ef0123456789"

// buildJWT constructs a signed HS256 JWT with the given claims and secret.
func buildJWT(secret string, claims map[string]any) string {
	headerJSON, _ := json.Marshal(map[string]string{"alg": "HS256", "typ": "JWT"})
	payloadJSON, _ := json.Marshal(claims)

	header := base64.RawURLEncoding.EncodeToString(headerJSON)
	payload := base64.RawURLEncoding.EncodeToString(payloadJSON)
	signingInput := header + "." + payload

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(signingInput))
	sig := base64.RawURLEncoding.EncodeToString(mac.Sum(nil))

	return signingInput + "." + sig
}

func newTestAuthMiddleware() *src.AuthMiddleware {
	return src.NewAuthMiddleware(src.Config{
		SupabaseJWTSecret: testJWTSecret,
	}, nil, nil)
}

func reqWithBearer(token string) *http.Request {
	r := httptest.NewRequest(http.MethodGet, "/api/files", nil)
	if token != "" {
		r.Header.Set("Authorization", "Bearer "+token)
	}
	return r
}

// --- Authenticate tests ---

func TestAuthenticate_ValidToken(t *testing.T) {
	m := newTestAuthMiddleware()
	token := buildJWT(testJWTSecret, map[string]any{
		"sub":  testUserUUID,
		"exp":  time.Now().Add(time.Hour).Unix(),
		"role": "authenticated",
	})

	userID, err := m.Authenticate(reqWithBearer(token))
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}
	if userID != testUserUUID {
		t.Fatalf("expected userID %q, got %q", testUserUUID, userID)
	}
}

func TestAuthenticate_ExpiredToken(t *testing.T) {
	m := newTestAuthMiddleware()
	token := buildJWT(testJWTSecret, map[string]any{
		"sub": "user-abc-123",
		"exp": time.Now().Add(-time.Hour).Unix(), // expired 1h ago
	})

	_, err := m.Authenticate(reqWithBearer(token))
	if err == nil {
		t.Fatal("expected error for expired token, got nil")
	}
	if err.Error() != "AUTH_TOKEN_EXPIRED: token has expired" {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestAuthenticate_MalformedToken_WrongPartCount(t *testing.T) {
	m := newTestAuthMiddleware()

	_, err := m.Authenticate(reqWithBearer("not.a.valid.jwt.string"))
	if err == nil {
		t.Fatal("expected error for malformed token, got nil")
	}
	if err.Error() != "AUTH_TOKEN_INVALID: malformed token" {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestAuthenticate_MalformedToken_TwoParts(t *testing.T) {
	m := newTestAuthMiddleware()

	_, err := m.Authenticate(reqWithBearer("header.payload"))
	if err == nil {
		t.Fatal("expected error for 2-part token, got nil")
	}
	if err.Error() != "AUTH_TOKEN_INVALID: malformed token" {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestAuthenticate_MissingToken(t *testing.T) {
	m := newTestAuthMiddleware()

	_, err := m.Authenticate(reqWithBearer(""))
	if err == nil {
		t.Fatal("expected error for missing token, got nil")
	}
	if err.Error() != "AUTH_UNAUTHORIZED: missing or malformed Authorization header" {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestAuthenticate_WrongSignature(t *testing.T) {
	m := newTestAuthMiddleware()
	// sign with a different secret
	token := buildJWT("wrong-secret", map[string]any{
		"sub": "user-abc-123",
		"exp": time.Now().Add(time.Hour).Unix(),
	})

	_, err := m.Authenticate(reqWithBearer(token))
	if err == nil {
		t.Fatal("expected error for wrong signature, got nil")
	}
	if err.Error() != "AUTH_TOKEN_INVALID: invalid token signature" {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestAuthenticate_MissingSubClaim(t *testing.T) {
	m := newTestAuthMiddleware()
	token := buildJWT(testJWTSecret, map[string]any{
		"exp":  time.Now().Add(time.Hour).Unix(),
		"role": "authenticated",
		// no "sub"
	})

	_, err := m.Authenticate(reqWithBearer(token))
	if err == nil {
		t.Fatal("expected error for missing sub claim, got nil")
	}
	if err.Error() != "AUTH_TOKEN_INVALID: token missing subject claim" {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestAuthenticate_NoExpClaim_Rejected(t *testing.T) {
	m := newTestAuthMiddleware()
	// Tokens without an exp claim must be rejected — they would otherwise be accepted forever.
	token := buildJWT(testJWTSecret, map[string]any{
		"sub":  testUserUUID,
		"role": "authenticated",
		// no "exp"
	})

	_, err := m.Authenticate(reqWithBearer(token))
	if err == nil {
		t.Fatal("expected error for token without exp claim, got nil")
	}
	if err.Error() != "AUTH_TOKEN_INVALID: token missing expiry claim" {
		t.Fatalf("unexpected error: %v", err)
	}
}

// --- Middleware exempt path tests ---

func exemptPathHandler() (http.Handler, *bool) {
	called := false
	h := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		called = true
		w.WriteHeader(http.StatusOK)
	})
	return h, &called
}

func TestMiddleware_ExemptPath_AuthLogin(t *testing.T) {
	m := newTestAuthMiddleware()
	next, called := exemptPathHandler()
	handler := m.Middleware(next)

	// no token on an exempt path — should pass through
	req := httptest.NewRequest(http.MethodPost, "/api/auth/login", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if !*called {
		t.Fatal("next handler should have been called for exempt path /api/auth/login")
	}
	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rr.Code)
	}
}

func TestMiddleware_ExemptPath_Health(t *testing.T) {
	m := newTestAuthMiddleware()
	next, called := exemptPathHandler()
	handler := m.Middleware(next)

	req := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if !*called {
		t.Fatal("next handler should have been called for exempt path /api/health")
	}
}

func TestMiddleware_ExemptPath_WellKnown(t *testing.T) {
	m := newTestAuthMiddleware()
	next, called := exemptPathHandler()
	handler := m.Middleware(next)

	req := httptest.NewRequest(http.MethodGet, "/.well-known/assetlinks.json", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if !*called {
		t.Fatal("next handler should have been called for exempt path /.well-known/assetlinks.json")
	}
}

// --- Middleware protected path tests ---

func TestMiddleware_ProtectedPath_ValidToken_PassesThrough(t *testing.T) {
	m := newTestAuthMiddleware()

	var receivedUserID string
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		receivedUserID = src.UserIDFromContext(r.Context())
		w.WriteHeader(http.StatusOK)
	})
	handler := m.Middleware(next)

	token := buildJWT(testJWTSecret, map[string]any{
		"sub":  testUserUUID,
		"exp":  time.Now().Add(time.Hour).Unix(),
		"role": "authenticated",
	})
	req := httptest.NewRequest(http.MethodGet, "/api/files", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	if receivedUserID != testUserUUID {
		t.Fatalf("expected userID %q in context, got %q", testUserUUID, receivedUserID)
	}
}

func TestMiddleware_ProtectedPath_MissingToken_Returns401(t *testing.T) {
	m := newTestAuthMiddleware()
	next, called := exemptPathHandler()
	handler := m.Middleware(next)

	req := httptest.NewRequest(http.MethodGet, "/api/files", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if *called {
		t.Fatal("next handler must NOT be called when token is missing")
	}
	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rr.Code)
	}
}

func TestMiddleware_ProtectedPath_ExpiredToken_Returns401(t *testing.T) {
	m := newTestAuthMiddleware()
	next, called := exemptPathHandler()
	handler := m.Middleware(next)

	token := buildJWT(testJWTSecret, map[string]any{
		"sub": "user-abc",
		"exp": time.Now().Add(-time.Minute).Unix(),
	})
	req := httptest.NewRequest(http.MethodGet, "/api/files", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if *called {
		t.Fatal("next handler must NOT be called when token is expired")
	}
	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rr.Code)
	}
}

// --- UserIDFromContext tests ---

func TestUserIDFromContext_ReturnsEmptyWhenNotSet(t *testing.T) {
	ctx := context.Background()
	if id := src.UserIDFromContext(ctx); id != "" {
		t.Fatalf("expected empty string, got %q", id)
	}
}
