package tests

// Property test: Error response format consistency (rapid)
//
// Property 5: Error response format consistency
// Triggers various auth errors across endpoints and verifies that every error
// response body is a JSON object with exactly three fields: "error", "message",
// and "timestamp" — no more, no less.
//
// Validates Requirements: 11.2

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"pgregory.net/rapid"

	src "metacleaner-server/source"
)

// newErrorFormatAuthClient starts a fake Supabase server that always returns a 500
// for every call, exercising the service-unavailable error path in every handler.
func newErrorFormatAuthClient(t *testing.T) *src.SupabaseAuthClient {
	t.Helper()
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{"error_code":"unexpected","message":"supabase unavailable"}`))
	}))
	t.Cleanup(srv.Close)
	return src.NewSupabaseAuthClient(src.Config{
		SupabaseURL:            srv.URL,
		SupabaseAPIKey:         "test-anon-key",
		SupabaseServiceRoleKey: "test-service-key",
		FrontendURL:            "https://example.com",
	})
}

// assertExactErrorFields decodes the response body and checks that the JSON object
// contains exactly the three fields: "error", "message", "timestamp". Any extra or
// missing field is a property violation.
func assertExactErrorFields(t *rapid.T, rr *httptest.ResponseRecorder, label string) {
	t.Helper()

	if rr.Code < 400 {
		// Not an error response — skip format check (success paths are allowed).
		return
	}

	var raw map[string]interface{}
	if err := json.NewDecoder(rr.Body).Decode(&raw); err != nil {
		t.Fatalf("%s: HTTP %d response is not valid JSON: %v (body: %s)",
			label, rr.Code, err, rr.Body.String())
	}

	required := []string{"error", "message", "timestamp"}
	for _, key := range required {
		if _, ok := raw[key]; !ok {
			t.Fatalf("%s: HTTP %d error response missing required field %q; got keys: %v",
				label, rr.Code, key, mapKeys(raw))
		}
	}

	if len(raw) != len(required) {
		t.Fatalf("%s: HTTP %d error response has %d fields, want exactly 3; keys: %v",
			label, rr.Code, len(raw), mapKeys(raw))
	}
}

// mapKeys returns the keys of a map as a slice (for diagnostic messages).
func mapKeys(m map[string]interface{}) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	return keys
}

// postErrorFormatRequest sends a POST request with the given body to the handler
// and returns the recorder.
func postErrorFormatRequest(handler http.HandlerFunc, body interface{}) *httptest.ResponseRecorder {
	data, _ := json.Marshal(body)
	req := httptest.NewRequest(http.MethodPost, "/", bytes.NewReader(data))
	rr := httptest.NewRecorder()
	handler(rr, req)
	return rr
}

// postWithAuthHeader sends a POST request with a Bearer token set.
func postWithAuthHeader(handler http.HandlerFunc, body interface{}, token string) *httptest.ResponseRecorder {
	data, _ := json.Marshal(body)
	req := httptest.NewRequest(http.MethodPost, "/", bytes.NewReader(data))
	req.Header.Set("Authorization", "Bearer "+token)
	rr := httptest.NewRecorder()
	handler(rr, req)
	return rr
}

// --- Property tests ---

// TestProperty_RegisterErrorFormatConsistency verifies that every error response
// from HandleRegister contains exactly {error, message, timestamp} (Requirement 11.2).
func TestProperty_RegisterErrorFormatConsistency(t *testing.T) {
	client := newErrorFormatAuthClient(t)
	handler := src.HandleRegister(client, nullDB(t))

	rapid.Check(t, func(t *rapid.T) {
		// Choose between: invalid email, out-of-range password, whitespace name,
		// or a valid payload that forces the Supabase error path.
		choice := rapid.IntRange(0, 3).Draw(t, "errorKind")

		var body map[string]string
		switch choice {
		case 0:
			// Invalid email triggers 400 before Supabase call.
			body = map[string]string{
				"email": drawInvalidEmail(t), "first_name": "Alice",
				"last_name": "Smith", "password": "password123",
			}
		case 1:
			// Out-of-range password triggers 400 before Supabase call.
			body = map[string]string{
				"email": "valid@example.com", "first_name": "Alice",
				"last_name": "Smith", "password": drawOutOfRangePassword(t, 8, 72),
			}
		case 2:
			// Whitespace-only name triggers 400 before Supabase call.
			field := rapid.SampledFrom([]string{"first_name", "last_name"}).Draw(t, "nameField")
			body = map[string]string{
				"email": "valid@example.com", "first_name": "Alice",
				"last_name": "Smith", "password": "password123",
			}
			body[field] = drawWhitespaceOnlyName(t)
		default:
			// Valid payload — Supabase returns 500, triggering service-unavailable error.
			body = map[string]string{
				"email": "valid@example.com", "first_name": "Alice",
				"last_name": "Smith", "password": "password123",
			}
		}

		rr := postErrorFormatRequest(handler, body)
		assertExactErrorFields(t, rr, "HandleRegister")
	})
}

// TestProperty_LoginErrorFormatConsistency verifies that every error response
// from HandleLogin contains exactly {error, message, timestamp} (Requirement 11.2).
func TestProperty_LoginErrorFormatConsistency(t *testing.T) {
	client := newErrorFormatAuthClient(t)
	handler := src.HandleLogin(client)

	rapid.Check(t, func(t *rapid.T) {
		choice := rapid.IntRange(0, 1).Draw(t, "errorKind")

		var body map[string]string
		switch choice {
		case 0:
			// Missing email/password triggers 400.
			field := rapid.SampledFrom([]string{"email", "password"}).Draw(t, "missingField")
			body = map[string]string{"email": "a@b.com", "password": "pass1234"}
			body[field] = ""
		default:
			// Valid-looking credentials — Supabase returns 500, triggers 401 or 503.
			body = map[string]string{"email": "user@example.com", "password": "password123"}
		}

		rr := postErrorFormatRequest(handler, body)
		assertExactErrorFields(t, rr, "HandleLogin")
	})
}

// TestProperty_ForgotPasswordErrorFormatConsistency verifies that every error response
// from HandleForgotPassword contains exactly {error, message, timestamp} (Requirement 11.2).
func TestProperty_ForgotPasswordErrorFormatConsistency(t *testing.T) {
	client := newErrorFormatAuthClient(t)
	handler := src.HandleForgotPassword(client)

	rapid.Check(t, func(t *rapid.T) {
		choice := rapid.IntRange(0, 1).Draw(t, "errorKind")

		var body map[string]string
		switch choice {
		case 0:
			// Invalid email → 400.
			body = map[string]string{"email": drawInvalidEmail(t)}
		default:
			// Valid email but Supabase returns 500 → service unavailable.
			body = map[string]string{"email": "user@example.com"}
		}

		rr := postErrorFormatRequest(handler, body)
		assertExactErrorFields(t, rr, "HandleForgotPassword")
	})
}

// TestProperty_ResetPasswordErrorFormatConsistency verifies that every error response
// from HandleResetPassword contains exactly {error, message, timestamp} (Requirement 11.2).
func TestProperty_ResetPasswordErrorFormatConsistency(t *testing.T) {
	client := newErrorFormatAuthClient(t)
	handler := src.HandleResetPassword(client)

	rapid.Check(t, func(t *rapid.T) {
		choice := rapid.IntRange(0, 2).Draw(t, "errorKind")

		switch choice {
		case 0:
			// Out-of-range password → 400 (no auth token needed — validation fires first).
			body := map[string]string{"password": drawOutOfRangePassword(t, 8, 128)}
			rr := postErrorFormatRequest(handler, body)
			assertExactErrorFields(t, rr, "HandleResetPassword/badPassword")
		case 1:
			// Missing Authorization header → 401.
			body := map[string]string{"password": "validpass123"}
			rr := postErrorFormatRequest(handler, body)
			assertExactErrorFields(t, rr, "HandleResetPassword/noAuth")
		default:
			// Valid password + Bearer token → Supabase returns 500 → error.
			body := map[string]string{"password": "validpass123"}
			rr := postWithAuthHeader(handler, body, "fake-reset-token")
			assertExactErrorFields(t, rr, "HandleResetPassword/supabaseError")
		}
	})
}

// TestProperty_MagicLinkErrorFormatConsistency verifies that every error response
// from HandleMagicLink contains exactly {error, message, timestamp} (Requirement 11.2).
func TestProperty_MagicLinkErrorFormatConsistency(t *testing.T) {
	client := newErrorFormatAuthClient(t)
	handler := src.HandleMagicLink(client)

	rapid.Check(t, func(t *rapid.T) {
		choice := rapid.IntRange(0, 1).Draw(t, "errorKind")

		var body map[string]string
		switch choice {
		case 0:
			// Invalid email → 400.
			body = map[string]string{"email": drawInvalidEmail(t)}
		default:
			// Valid email but Supabase returns 500.
			body = map[string]string{"email": "user@example.com"}
		}

		rr := postErrorFormatRequest(handler, body)
		assertExactErrorFields(t, rr, "HandleMagicLink")
	})
}

// TestProperty_RefreshErrorFormatConsistency verifies that every error response
// from HandleRefresh contains exactly {error, message, timestamp} (Requirement 11.2).
func TestProperty_RefreshErrorFormatConsistency(t *testing.T) {
	client := newErrorFormatAuthClient(t)
	handler := src.HandleRefresh(client)

	rapid.Check(t, func(t *rapid.T) {
		choice := rapid.IntRange(0, 1).Draw(t, "errorKind")

		var body map[string]string
		switch choice {
		case 0:
			// Missing refresh_token → 400.
			body = map[string]string{"refresh_token": ""}
		default:
			// Valid token but Supabase returns 500 → session expired / unavailable.
			body = map[string]string{"refresh_token": "some-refresh-token"}
		}

		rr := postErrorFormatRequest(handler, body)
		assertExactErrorFields(t, rr, "HandleRefresh")
	})
}

// TestProperty_LogoutErrorFormatConsistency verifies that error responses from
// HandleLogout contain exactly {error, message, timestamp} (Requirement 11.2).
func TestProperty_LogoutErrorFormatConsistency(t *testing.T) {
	client := newErrorFormatAuthClient(t)
	handler := src.HandleLogout(client)

	rapid.Check(t, func(t *rapid.T) {
		choice := rapid.IntRange(0, 1).Draw(t, "errorKind")

		switch choice {
		case 0:
			// No Authorization header → 401.
			req := httptest.NewRequest(http.MethodPost, "/", nil)
			rr := httptest.NewRecorder()
			handler(rr, req)
			assertExactErrorFields(t, rr, "HandleLogout/noAuth")
		default:
			// Valid-looking token but Supabase returns 500 → 401 with error format.
			rr := postWithAuthHeader(handler, nil, "some-access-token")
			assertExactErrorFields(t, rr, "HandleLogout/supabaseError")
		}
	})
}

// TestProperty_MiddlewareErrorFormatConsistency verifies that auth middleware 401
// responses also conform to the exact {error, message, timestamp} format.
func TestProperty_MiddlewareErrorFormatConsistency(t *testing.T) {
	m := newPropertyMiddleware()

	rapid.Check(t, func(t *rapid.T) {
		// All three bad-token categories should produce conforming 401 error bodies.
		category := rapid.IntRange(0, 2).Draw(t, "badTokenCat")
		var token string
		switch category {
		case 0:
			token = drawNonJWTString(t)
		case 1:
			token = drawExpiredToken(t)
		default:
			token = drawWrongSecretToken(t)
		}

		path := drawProtectedPath(t)
		req := httptest.NewRequest(http.MethodGet, path, nil)
		if token != "" {
			req.Header.Set("Authorization", "Bearer "+token)
		}

		next, _ := handlerCallTracker()
		rr := httptest.NewRecorder()
		m.Middleware(next).ServeHTTP(rr, req)

		assertExactErrorFields(t, rr, "AuthMiddleware")
	})
}
