package tests

// Property test: Auth middleware rejects unauthenticated requests (rapid)
//
// Property 3: Auth middleware rejects unauthenticated requests
// Generates random non-JWT strings, expired tokens, and tokens signed with the wrong
// secret. Verifies every case returns HTTP 401 and the downstream handler is never called.
//
// Validates Requirements: 6.1 (missing/invalid token → 401),
//                         6.2 (expired token → 401),
//                         6.3 (wrong signature → 401),
//                         6.6 (handler is never called on auth failure)

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"pgregory.net/rapid"

	src "metacleaner-server/source"
)

const propertyTestJWTSecret = "property-test-secret-for-middleware"

// newPropertyMiddleware builds a fresh AuthMiddleware for property tests.
func newPropertyMiddleware() *src.AuthMiddleware {
	return src.NewAuthMiddleware(src.Config{
		SupabaseJWTSecret: propertyTestJWTSecret,
	}, nil, nil)
}

// handlerCallTracker wraps a next handler that records whether it was invoked.
func handlerCallTracker() (http.Handler, *bool) {
	called := false
	h := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		called = true
		w.WriteHeader(http.StatusOK)
	})
	return h, &called
}

// assertMiddlewareRejects sends req through the middleware and asserts:
//   - HTTP 401 is returned
//   - the next handler was never called
func assertMiddlewareRejects(t *rapid.T, m *src.AuthMiddleware, req *http.Request, label string) {
	t.Helper()
	next, called := handlerCallTracker()
	handler := m.Middleware(next)

	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("%s: expected HTTP 401, got %d (body: %s)", label, rr.Code, rr.Body.String())
	}
	if *called {
		t.Fatalf("%s: next handler must NOT be called on auth failure", label)
	}
}

// drawNonJWTString generates a random string that does not have the three-part
// "header.payload.signature" structure of a JWT (i.e. 0 or 1 dots, or > 2 dots).
func drawNonJWTString(t *rapid.T) string {
	choice := rapid.IntRange(0, 3).Draw(t, "nonJWTChoice")
	switch choice {
	case 0:
		// Completely random alphanumeric with no dots
		return rapid.StringMatching(`[a-zA-Z0-9]{1,60}`).Draw(t, "noDotsStr")
	case 1:
		// Single dot — only two parts
		part1 := rapid.StringMatching(`[a-zA-Z0-9]{1,20}`).Draw(t, "p1")
		part2 := rapid.StringMatching(`[a-zA-Z0-9]{1,20}`).Draw(t, "p2")
		return part1 + "." + part2
	case 2:
		// Four or more dots — too many parts
		extra := rapid.IntRange(1, 3).Draw(t, "extraDots")
		parts := make([]string, 4+extra)
		for i := range parts {
			parts[i] = rapid.StringMatching(`[a-zA-Z0-9]{1,10}`).Draw(t, "part")
		}
		return strings.Join(parts, ".")
	default:
		// Empty string — no token at all
		return ""
	}
}

// drawWrongSecretToken generates a valid JWT structure but signed with a different secret.
func drawWrongSecretToken(t *rapid.T) string {
	wrongSecret := rapid.StringMatching(`[a-zA-Z0-9!@#$%^&*]{8,40}`).Draw(t, "wrongSecret")
	// Make sure the "wrong" secret is actually different from the property test secret.
	if wrongSecret == propertyTestJWTSecret {
		wrongSecret = "definitely-wrong-" + wrongSecret
	}
	return buildJWT(wrongSecret, map[string]any{
		"sub":  testUserUUID,
		"exp":  time.Now().Add(time.Hour).Unix(),
		"role": "authenticated",
	})
}

// drawExpiredToken generates a valid JWT (correct signature) that has already expired.
func drawExpiredToken(t *rapid.T) string {
	secondsAgo := rapid.Int64Range(1, 7200).Draw(t, "expiredAgo")
	return buildJWT(propertyTestJWTSecret, map[string]any{
		"sub":  testUserUUID,
		"role": "authenticated",
		"exp":  time.Now().Unix() - secondsAgo,
	})
}

// protectedPath returns a random non-exempt path so the middleware always enforces auth.
func drawProtectedPath(t *rapid.T) string {
	paths := []string{
		"/api/files",
		"/api/jobs",
		"/api/jobs/abc123",
		"/api/reports",
		"/api/reports/rpt-456",
		"/api/upload",
	}
	return rapid.SampledFrom(paths).Draw(t, "protectedPath")
}

// --- Property tests ---

// TestProperty_MiddlewareRejectsNonJWTStrings verifies that random non-JWT strings
// in the Authorization header always produce HTTP 401 and never reach the handler
// (Requirements 6.1, 6.6).
func TestProperty_MiddlewareRejectsNonJWTStrings(t *testing.T) {
	m := newPropertyMiddleware()

	rapid.Check(t, func(t *rapid.T) {
		token := drawNonJWTString(t)
		path := drawProtectedPath(t)

		req := httptest.NewRequest(http.MethodGet, path, nil)
		if token != "" {
			req.Header.Set("Authorization", "Bearer "+token)
		}

		assertMiddlewareRejects(t, m, req, "non-JWT token="+token)
	})
}

// TestProperty_MiddlewareRejectsExpiredTokens verifies that valid JWTs whose exp
// claim is in the past always produce HTTP 401 and never reach the handler
// (Requirements 6.2, 6.6).
func TestProperty_MiddlewareRejectsExpiredTokens(t *testing.T) {
	m := newPropertyMiddleware()

	rapid.Check(t, func(t *rapid.T) {
		token := drawExpiredToken(t)
		path := drawProtectedPath(t)

		req := httptest.NewRequest(http.MethodGet, path, nil)
		req.Header.Set("Authorization", "Bearer "+token)

		assertMiddlewareRejects(t, m, req, "expired token")
	})
}

// TestProperty_MiddlewareRejectsWrongSignatureTokens verifies that structurally valid
// JWTs signed with the wrong secret always produce HTTP 401 and never reach the handler
// (Requirements 6.3, 6.6).
func TestProperty_MiddlewareRejectsWrongSignatureTokens(t *testing.T) {
	m := newPropertyMiddleware()

	rapid.Check(t, func(t *rapid.T) {
		token := drawWrongSecretToken(t)
		path := drawProtectedPath(t)

		req := httptest.NewRequest(http.MethodGet, path, nil)
		req.Header.Set("Authorization", "Bearer "+token)

		assertMiddlewareRejects(t, m, req, "wrong-signature token")
	})
}

// TestProperty_MiddlewareNeverCallsHandlerOnInvalidAuth is a combined property that
// randomly draws from all three bad-token categories and verifies the handler is never
// invoked (Requirements 6.1, 6.2, 6.3, 6.6).
func TestProperty_MiddlewareNeverCallsHandlerOnInvalidAuth(t *testing.T) {
	m := newPropertyMiddleware()

	rapid.Check(t, func(t *rapid.T) {
		category := rapid.IntRange(0, 2).Draw(t, "badTokenCategory")
		var token string
		var label string
		switch category {
		case 0:
			token = drawNonJWTString(t)
			label = "non-JWT"
		case 1:
			token = drawExpiredToken(t)
			label = "expired"
		default:
			token = drawWrongSecretToken(t)
			label = "wrong-signature"
		}

		path := drawProtectedPath(t)
		req := httptest.NewRequest(http.MethodGet, path, nil)
		if token != "" {
			req.Header.Set("Authorization", "Bearer "+token)
		}

		assertMiddlewareRejects(t, m, req, label)
	})
}
