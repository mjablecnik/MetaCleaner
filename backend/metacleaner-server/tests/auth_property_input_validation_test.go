package tests

// Property test: Input validation rejects invalid payloads (rapid)
//
// Property 1: Input validation rejects invalid payloads
// Generates random invalid emails, passwords outside allowed ranges, and whitespace-only
// names, then verifies all return HTTP 400 and no Supabase call is made.
//
// Validates Requirements: 1.3 (email format), 1.4 (password length 8–72),
//                         1.9 (whitespace names), 5.3 (forgot-password email),
//                         5.7 (reset-password password 8–128), 17.11 (magic-link email)

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"pgregory.net/rapid"

	src "metacleaner-server/source"
)

// newValidationTestAuthClient creates a fake Supabase server that records whether it was called.
// Returns the auth client and a reset function that clears the "called" flag.
func newValidationTestAuthClient(t *testing.T) (*src.SupabaseAuthClient, func() bool) {
	t.Helper()
	var called bool
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		called = true
		http.Error(w, `{"error":"AUTH_INVALID_REQUEST","message":"unexpected supabase call","timestamp":"0"}`, http.StatusInternalServerError)
	}))
	t.Cleanup(srv.Close)
	client := src.NewSupabaseAuthClient(src.Config{
		SupabaseURL:            srv.URL,
		SupabaseAPIKey:         "test-anon-key",
		SupabaseServiceRoleKey: "test-service-key",
		FrontendURL:            "https://example.com",
	})
	resetAndGet := func() bool {
		c := called
		called = false
		return c
	}
	return client, resetAndGet
}

// drawInvalidEmail generates an email string that will fail the emailRegex validation.
// The regex is: ^[^@\s]+@[^@\s]+\.[^@\s]+$
// Invalid cases:
//
//	0 – no @ sign at all (purely alphanumeric)
//	1 – has @ but no dot in domain (user@nodomain)
//	2 – empty string
//	3 – starts with @ (no local part)
func drawInvalidEmail(t *rapid.T) string {
	choice := rapid.IntRange(0, 3).Draw(t, "emailChoice")
	switch choice {
	case 0:
		return rapid.StringMatching(`[a-zA-Z0-9]{1,20}`).Draw(t, "noAtEmail")
	case 1:
		local := rapid.StringMatching(`[a-zA-Z0-9]{1,10}`).Draw(t, "local")
		domain := rapid.StringMatching(`[a-zA-Z0-9]{1,10}`).Draw(t, "domainNoDot")
		return local + "@" + domain
	case 2:
		return ""
	default:
		// Starts with @ — no local part before the @
		domain := rapid.StringMatching(`[a-zA-Z0-9]{1,10}\.[a-zA-Z]{2,5}`).Draw(t, "domainOnly")
		return "@" + domain
	}
}

// drawOutOfRangePassword generates a password whose rune count is outside [minLen, maxLen].
// Either 0..(minLen-1) characters (too short) or (maxLen+1)..(maxLen+100) characters (too long).
func drawOutOfRangePassword(t *rapid.T, minLen, maxLen int) string {
	tooShort := rapid.Bool().Draw(t, "tooShort")
	if tooShort {
		length := rapid.IntRange(0, minLen-1).Draw(t, "shortLen")
		return strings.Repeat("a", length)
	}
	length := rapid.IntRange(maxLen+1, maxLen+100).Draw(t, "longLen")
	return strings.Repeat("a", length)
}

// drawWhitespaceOnlyName generates a string composed solely of whitespace characters
// (including the empty string), which must be rejected as a name value.
func drawWhitespaceOnlyName(t *rapid.T) string {
	length := rapid.IntRange(0, 20).Draw(t, "wsLen")
	return strings.Repeat(" ", length)
}

// postRequest sends a POST request to the given handler with a JSON body and returns the status code.
// It also resets the Supabase-call tracker via resetAndGet before sending, then returns
// whether Supabase was called.
func postRequest(handler http.HandlerFunc, body interface{}, resetAndGet func() bool) (statusCode int, supabaseCalled bool) {
	resetAndGet() // reset before request
	data, _ := json.Marshal(body)
	req := httptest.NewRequest(http.MethodPost, "/", bytes.NewReader(data))
	rr := httptest.NewRecorder()
	handler(rr, req)
	supabaseCalled = resetAndGet() // read (and reset) after request
	return rr.Code, supabaseCalled
}

// --- Property tests ---

// TestProperty_RegisterRejectsInvalidEmail verifies that POST /api/auth/register returns
// HTTP 400 for every malformed email and does not reach Supabase (Requirement 1.3).
func TestProperty_RegisterRejectsInvalidEmail(t *testing.T) {
	client, resetAndGet := newValidationTestAuthClient(t)
	handler := src.HandleRegister(client)

	rapid.Check(t, func(t *rapid.T) {
		email := drawInvalidEmail(t)
		code, called := postRequest(handler, map[string]string{
			"email": email, "first_name": "Alice", "last_name": "Smith", "password": "password123",
		}, resetAndGet)

		if code != http.StatusBadRequest {
			t.Fatalf("email %q: expected HTTP 400, got %d", email, code)
		}
		if called {
			t.Fatalf("email %q: Supabase must not be called when email is invalid", email)
		}
	})
}

// TestProperty_RegisterRejectsOutOfRangePassword verifies that POST /api/auth/register
// returns HTTP 400 for passwords outside the 8–72 character range and does not reach
// Supabase (Requirement 1.4).
func TestProperty_RegisterRejectsOutOfRangePassword(t *testing.T) {
	client, resetAndGet := newValidationTestAuthClient(t)
	handler := src.HandleRegister(client)

	rapid.Check(t, func(t *rapid.T) {
		password := drawOutOfRangePassword(t, 8, 72)
		code, called := postRequest(handler, map[string]string{
			"email": "valid@example.com", "first_name": "Alice", "last_name": "Smith", "password": password,
		}, resetAndGet)

		if code != http.StatusBadRequest {
			t.Fatalf("password len=%d: expected HTTP 400, got %d", len(password), code)
		}
		if called {
			t.Fatalf("password len=%d: Supabase must not be called for out-of-range password", len(password))
		}
	})
}

// TestProperty_RegisterRejectsWhitespaceOnlyNames verifies that POST /api/auth/register
// returns HTTP 400 when first_name or last_name is empty or all whitespace, and does not
// reach Supabase (Requirement 1.9).
func TestProperty_RegisterRejectsWhitespaceOnlyNames(t *testing.T) {
	client, resetAndGet := newValidationTestAuthClient(t)
	handler := src.HandleRegister(client)

	rapid.Check(t, func(t *rapid.T) {
		field := rapid.SampledFrom([]string{"first_name", "last_name"}).Draw(t, "field")
		wsName := drawWhitespaceOnlyName(t)

		body := map[string]string{
			"email": "valid@example.com", "first_name": "Alice", "last_name": "Smith", "password": "password123",
		}
		body[field] = wsName

		code, called := postRequest(handler, body, resetAndGet)

		if code != http.StatusBadRequest {
			t.Fatalf("field=%s value=%q: expected HTTP 400, got %d", field, wsName, code)
		}
		if called {
			t.Fatalf("field=%s value=%q: Supabase must not be called for whitespace-only name", field, wsName)
		}
	})
}

// TestProperty_ForgotPasswordRejectsInvalidEmail verifies that POST /api/auth/forgot-password
// returns HTTP 400 for every malformed email and does not reach Supabase (Requirement 5.3).
func TestProperty_ForgotPasswordRejectsInvalidEmail(t *testing.T) {
	client, resetAndGet := newValidationTestAuthClient(t)
	handler := src.HandleForgotPassword(client)

	rapid.Check(t, func(t *rapid.T) {
		email := drawInvalidEmail(t)
		code, called := postRequest(handler, map[string]string{"email": email}, resetAndGet)

		if code != http.StatusBadRequest {
			t.Fatalf("email %q: expected HTTP 400 on forgot-password, got %d", email, code)
		}
		if called {
			t.Fatalf("email %q: Supabase must not be called when forgot-password email is invalid", email)
		}
	})
}

// TestProperty_ResetPasswordRejectsOutOfRangePassword verifies that POST /api/auth/reset-password
// returns HTTP 400 for passwords outside the 8–128 character range and does not reach
// Supabase (Requirement 5.7).
func TestProperty_ResetPasswordRejectsOutOfRangePassword(t *testing.T) {
	client, resetAndGet := newValidationTestAuthClient(t)
	handler := src.HandleResetPassword(client)

	rapid.Check(t, func(t *rapid.T) {
		password := drawOutOfRangePassword(t, 8, 128)

		resetAndGet() // reset before request
		data, _ := json.Marshal(map[string]string{"password": password})
		req := httptest.NewRequest(http.MethodPost, "/", bytes.NewReader(data))
		req.Header.Set("Authorization", "Bearer fake-reset-token")
		rr := httptest.NewRecorder()
		handler(rr, req)
		called := resetAndGet() // read (and reset) after

		if rr.Code != http.StatusBadRequest {
			t.Fatalf("password len=%d: expected HTTP 400 on reset-password, got %d", len(password), rr.Code)
		}
		if called {
			t.Fatalf("password len=%d: Supabase must not be called for out-of-range password on reset-password", len(password))
		}
	})
}

// TestProperty_MagicLinkRejectsInvalidEmail verifies that POST /api/auth/magic-link returns
// HTTP 400 for every malformed email and does not reach Supabase (Requirement 17.11).
func TestProperty_MagicLinkRejectsInvalidEmail(t *testing.T) {
	client, resetAndGet := newValidationTestAuthClient(t)
	handler := src.HandleMagicLink(client)

	rapid.Check(t, func(t *rapid.T) {
		email := drawInvalidEmail(t)
		code, called := postRequest(handler, map[string]string{"email": email}, resetAndGet)

		if code != http.StatusBadRequest {
			t.Fatalf("email %q: expected HTTP 400 on magic-link, got %d", email, code)
		}
		if called {
			t.Fatalf("email %q: Supabase must not be called when magic-link email is invalid", email)
		}
	})
}
