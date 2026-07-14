package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	src "metacleaner-server/source"
)

// --- Test helpers ---

func writeJSONResp(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func writeSupabaseErr(w http.ResponseWriter, status int, errorCode, message string) {
	writeJSONResp(w, status, map[string]interface{}{
		"error_code": errorCode,
		"message":    message,
	})
}

// newFakeAuthClient starts a fake Supabase HTTP server with the given handler and returns
// a SupabaseAuthClient that directs all requests to it.
func newFakeAuthClient(t *testing.T, handler http.Handler) *src.SupabaseAuthClient {
	t.Helper()
	srv := httptest.NewServer(handler)
	t.Cleanup(srv.Close)
	return src.NewSupabaseAuthClient(src.Config{
		SupabaseURL:            srv.URL,
		SupabaseAPIKey:         "test-anon-key",
		SupabaseServiceRoleKey: "test-service-key",
		FrontendURL:            "https://example.com",
	})
}

// newFakeAuthAndDBClients starts a fake Supabase HTTP server and returns both
// a SupabaseAuthClient and a SupabaseClient pointing at the same server.
func newFakeAuthAndDBClients(t *testing.T, handler http.Handler) (*src.SupabaseAuthClient, *src.SupabaseClient) {
	t.Helper()
	srv := httptest.NewServer(handler)
	t.Cleanup(srv.Close)
	cfg := src.Config{
		SupabaseURL:            srv.URL,
		SupabaseAPIKey:         "test-anon-key",
		SupabaseServiceRoleKey: "test-service-key",
		FrontendURL:            "https://example.com",
	}
	return src.NewSupabaseAuthClient(cfg), src.NewSupabaseClient(cfg)
}

// nullDB returns a SupabaseClient that will never be called (for validation-failure tests).
func nullDB(t *testing.T) *src.SupabaseClient {
	t.Helper()
	return src.NewSupabaseClient(src.Config{SupabaseURL: "http://127.0.0.1:0"})
}

func postBody(t *testing.T, path string, v interface{}) *http.Request {
	t.Helper()
	data, _ := json.Marshal(v)
	return httptest.NewRequest(http.MethodPost, path, bytes.NewReader(data))
}

func decodeErrResp(t *testing.T, rr *httptest.ResponseRecorder) src.ErrorResponse {
	t.Helper()
	var resp src.ErrorResponse
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("decode error response: %v, body: %s", err, rr.Body.String())
	}
	return resp
}

// fakeSess returns a minimal SupabaseAuthSession JSON body.
func fakeSess() map[string]interface{} {
	return map[string]interface{}{
		"access_token":  "at-abc",
		"refresh_token": "rt-xyz",
		"expires_in":    3600,
		"user": map[string]interface{}{
			"id":    "user-001",
			"email": "test@example.com",
		},
	}
}

// --- HandleRegister ---

func TestHandleRegister_Success(t *testing.T) {
	profileCreated := false
	authClient, db := newFakeAuthAndDBClients(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.URL.Path == "/auth/v1/signup":
			writeJSONResp(w, http.StatusOK, map[string]interface{}{"id": "user-001", "email": "alice@example.com"})
		case strings.HasPrefix(r.URL.Path, "/rest/v1/profiles"):
			profileCreated = true
			w.WriteHeader(http.StatusCreated)
		case strings.HasPrefix(r.URL.Path, "/rest/v1/credit_balances"):
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusCreated)
			w.Write([]byte(`[]`))
		default:
			http.NotFound(w, r)
		}
	}))

	handler := src.HandleRegister(authClient, db)
	req := postBody(t, "/api/auth/register", map[string]string{
		"email": "alice@example.com", "first_name": "Alice", "last_name": "Smith", "password": "password123",
	})
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", rr.Code, rr.Body.String())
	}
	if !profileCreated {
		t.Fatal("expected profile to be created in Supabase REST")
	}
	var resp map[string]string
	json.NewDecoder(rr.Body).Decode(&resp)
	if resp["message"] == "" {
		t.Fatal("expected non-empty message")
	}
}

func TestHandleRegister_InvalidBody(t *testing.T) {
	authClient := newFakeAuthClient(t, http.NotFoundHandler())
	handler := src.HandleRegister(authClient, nullDB(t))
	req := httptest.NewRequest(http.MethodPost, "/api/auth/register", strings.NewReader("not-json"))
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rr.Code)
	}
}

func TestHandleRegister_MissingEmail(t *testing.T) {
	authClient := newFakeAuthClient(t, http.NotFoundHandler())
	handler := src.HandleRegister(authClient, nullDB(t))
	req := postBody(t, "/api/auth/register", map[string]string{
		"first_name": "Alice", "last_name": "Smith", "password": "password123",
	})
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rr.Code)
	}
}

func TestHandleRegister_WhitespaceOnlyFirstName(t *testing.T) {
	authClient := newFakeAuthClient(t, http.NotFoundHandler())
	handler := src.HandleRegister(authClient, nullDB(t))
	req := postBody(t, "/api/auth/register", map[string]string{
		"email": "alice@example.com", "first_name": "   ", "last_name": "Smith", "password": "password123",
	})
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rr.Code)
	}
	errResp := decodeErrResp(t, rr)
	if errResp.Error != src.ErrAuthInvalidRequest {
		t.Fatalf("expected %s, got %s", src.ErrAuthInvalidRequest, errResp.Error)
	}
}

func TestHandleRegister_MissingLastName(t *testing.T) {
	authClient := newFakeAuthClient(t, http.NotFoundHandler())
	handler := src.HandleRegister(authClient, nullDB(t))
	req := postBody(t, "/api/auth/register", map[string]string{
		"email": "alice@example.com", "first_name": "Alice", "password": "password123",
	})
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rr.Code)
	}
}

func TestHandleRegister_InvalidEmailFormat(t *testing.T) {
	authClient := newFakeAuthClient(t, http.NotFoundHandler())
	handler := src.HandleRegister(authClient, nullDB(t))
	req := postBody(t, "/api/auth/register", map[string]string{
		"email": "not-an-email", "first_name": "Alice", "last_name": "Smith", "password": "password123",
	})
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rr.Code)
	}
	errResp := decodeErrResp(t, rr)
	if errResp.Error != src.ErrAuthInvalidEmail {
		t.Fatalf("expected %s, got %s", src.ErrAuthInvalidEmail, errResp.Error)
	}
}

func TestHandleRegister_PasswordTooShort(t *testing.T) {
	authClient := newFakeAuthClient(t, http.NotFoundHandler())
	handler := src.HandleRegister(authClient, nullDB(t))
	req := postBody(t, "/api/auth/register", map[string]string{
		"email": "alice@example.com", "first_name": "Alice", "last_name": "Smith", "password": "short",
	})
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rr.Code)
	}
	errResp := decodeErrResp(t, rr)
	if errResp.Error != src.ErrAuthInvalidPassword {
		t.Fatalf("expected %s, got %s", src.ErrAuthInvalidPassword, errResp.Error)
	}
}

func TestHandleRegister_PasswordTooLong(t *testing.T) {
	authClient := newFakeAuthClient(t, http.NotFoundHandler())
	handler := src.HandleRegister(authClient, nullDB(t))
	req := postBody(t, "/api/auth/register", map[string]string{
		"email": "alice@example.com", "first_name": "Alice", "last_name": "Smith",
		"password": strings.Repeat("a", 73),
	})
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", rr.Code, rr.Body.String())
	}
	errResp := decodeErrResp(t, rr)
	if errResp.Error != src.ErrAuthInvalidPassword {
		t.Fatalf("expected %s, got %s", src.ErrAuthInvalidPassword, errResp.Error)
	}
}

func TestHandleRegister_DuplicateEmail(t *testing.T) {
	authClient := newFakeAuthClient(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/auth/v1/signup" {
			writeSupabaseErr(w, 422, "user_already_exists", "User already registered")
		}
	}))
	handler := src.HandleRegister(authClient, nullDB(t))
	req := postBody(t, "/api/auth/register", map[string]string{
		"email": "alice@example.com", "first_name": "Alice", "last_name": "Smith", "password": "password123",
	})
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusConflict {
		t.Fatalf("expected 409, got %d: %s", rr.Code, rr.Body.String())
	}
	errResp := decodeErrResp(t, rr)
	if errResp.Error != src.ErrAuthEmailExists {
		t.Fatalf("expected %s, got %s", src.ErrAuthEmailExists, errResp.Error)
	}
}

func TestHandleRegister_SupabaseUnavailable(t *testing.T) {
	authClient := newFakeAuthClient(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/auth/v1/signup" {
			writeSupabaseErr(w, 503, "service_unavailable", "Service unavailable")
		}
	}))
	handler := src.HandleRegister(authClient, nullDB(t))
	req := postBody(t, "/api/auth/register", map[string]string{
		"email": "alice@example.com", "first_name": "Alice", "last_name": "Smith", "password": "password123",
	})
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected 503, got %d: %s", rr.Code, rr.Body.String())
	}
	errResp := decodeErrResp(t, rr)
	if errResp.Error != src.ErrAuthProviderUnavailable {
		t.Fatalf("expected %s, got %s", src.ErrAuthProviderUnavailable, errResp.Error)
	}
}

// --- HandleLogin ---

func TestHandleLogin_Success(t *testing.T) {
	authClient := newFakeAuthClient(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.Contains(r.URL.RawQuery, "grant_type=password") {
			writeJSONResp(w, http.StatusOK, fakeSess())
		}
	}))
	handler := src.HandleLogin(authClient)
	req := postBody(t, "/api/auth/login", map[string]string{"email": "test@example.com", "password": "password123"})
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	var sess src.AuthSession
	json.NewDecoder(rr.Body).Decode(&sess)
	if sess.AccessToken == "" {
		t.Fatal("expected access_token in response")
	}
}

func TestHandleLogin_MissingEmail(t *testing.T) {
	authClient := newFakeAuthClient(t, http.NotFoundHandler())
	handler := src.HandleLogin(authClient)
	req := postBody(t, "/api/auth/login", map[string]string{"password": "password123"})
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rr.Code)
	}
}

func TestHandleLogin_MissingPassword(t *testing.T) {
	authClient := newFakeAuthClient(t, http.NotFoundHandler())
	handler := src.HandleLogin(authClient)
	req := postBody(t, "/api/auth/login", map[string]string{"email": "test@example.com"})
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rr.Code)
	}
}

func TestHandleLogin_BadCredentials(t *testing.T) {
	authClient := newFakeAuthClient(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.Contains(r.URL.RawQuery, "grant_type=password") {
			writeSupabaseErr(w, 400, "invalid_grant", "Invalid login credentials")
		}
	}))
	handler := src.HandleLogin(authClient)
	req := postBody(t, "/api/auth/login", map[string]string{"email": "test@example.com", "password": "wrong"})
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d: %s", rr.Code, rr.Body.String())
	}
	errResp := decodeErrResp(t, rr)
	if errResp.Error != src.ErrAuthInvalidCredentials {
		t.Fatalf("expected %s, got %s", src.ErrAuthInvalidCredentials, errResp.Error)
	}
}

func TestHandleLogin_UnconfirmedEmail(t *testing.T) {
	authClient := newFakeAuthClient(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.Contains(r.URL.RawQuery, "grant_type=password") {
			writeSupabaseErr(w, 400, "email_not_confirmed", "Email not confirmed")
		}
	}))
	handler := src.HandleLogin(authClient)
	req := postBody(t, "/api/auth/login", map[string]string{"email": "test@example.com", "password": "password123"})
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusForbidden {
		t.Fatalf("expected 403, got %d: %s", rr.Code, rr.Body.String())
	}
	errResp := decodeErrResp(t, rr)
	if errResp.Error != src.ErrAuthEmailNotConfirmed {
		t.Fatalf("expected %s, got %s", src.ErrAuthEmailNotConfirmed, errResp.Error)
	}
}

func TestHandleLogin_SupabaseUnavailable(t *testing.T) {
	authClient := newFakeAuthClient(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.Contains(r.URL.RawQuery, "grant_type=password") {
			writeSupabaseErr(w, 503, "service_unavailable", "Service unavailable")
		}
	}))
	handler := src.HandleLogin(authClient)
	req := postBody(t, "/api/auth/login", map[string]string{"email": "test@example.com", "password": "password123"})
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected 503, got %d: %s", rr.Code, rr.Body.String())
	}
}

// --- HandleLogout ---

func TestHandleLogout_Success(t *testing.T) {
	authClient := newFakeAuthClient(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/auth/v1/logout" {
			// Return 200 (Node Response workaround: use 200 not 204 per agent memory)
			writeJSONResp(w, http.StatusOK, map[string]string{})
		}
	}))
	handler := src.HandleLogout(authClient)
	req := httptest.NewRequest(http.MethodPost, "/api/auth/logout", nil)
	req.Header.Set("Authorization", "Bearer valid-token")
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestHandleLogout_MissingAuthHeader(t *testing.T) {
	authClient := newFakeAuthClient(t, http.NotFoundHandler())
	handler := src.HandleLogout(authClient)
	req := httptest.NewRequest(http.MethodPost, "/api/auth/logout", nil)
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rr.Code)
	}
}

func TestHandleLogout_InvalidToken(t *testing.T) {
	authClient := newFakeAuthClient(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/auth/v1/logout" {
			writeSupabaseErr(w, http.StatusUnauthorized, "invalid_token", "Invalid token")
		}
	}))
	handler := src.HandleLogout(authClient)
	req := httptest.NewRequest(http.MethodPost, "/api/auth/logout", nil)
	req.Header.Set("Authorization", "Bearer expired-token")
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d: %s", rr.Code, rr.Body.String())
	}
}

// --- HandleRefresh ---

func TestHandleRefresh_Success(t *testing.T) {
	authClient := newFakeAuthClient(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.Contains(r.URL.RawQuery, "grant_type=refresh_token") {
			writeJSONResp(w, http.StatusOK, fakeSess())
		}
	}))
	handler := src.HandleRefresh(authClient)
	req := postBody(t, "/api/auth/refresh", map[string]string{"refresh_token": "rt-old"})
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	var sess src.AuthSession
	json.NewDecoder(rr.Body).Decode(&sess)
	if sess.AccessToken == "" {
		t.Fatal("expected access_token in response")
	}
}

func TestHandleRefresh_MissingToken(t *testing.T) {
	authClient := newFakeAuthClient(t, http.NotFoundHandler())
	handler := src.HandleRefresh(authClient)
	req := postBody(t, "/api/auth/refresh", map[string]string{})
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rr.Code)
	}
}

func TestHandleRefresh_InvalidToken(t *testing.T) {
	authClient := newFakeAuthClient(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.Contains(r.URL.RawQuery, "grant_type=refresh_token") {
			writeSupabaseErr(w, http.StatusUnauthorized, "invalid_grant", "Refresh token invalid")
		}
	}))
	handler := src.HandleRefresh(authClient)
	req := postBody(t, "/api/auth/refresh", map[string]string{"refresh_token": "bad-token"})
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d: %s", rr.Code, rr.Body.String())
	}
	errResp := decodeErrResp(t, rr)
	if errResp.Error != src.ErrAuthSessionExpired {
		t.Fatalf("expected %s, got %s", src.ErrAuthSessionExpired, errResp.Error)
	}
}

// --- HandleMe ---

// HandleMe requires a user ID in context; inject it via AuthMiddleware at a non-exempt path.
func TestHandleMe_Success(t *testing.T) {
	authClient := newFakeAuthClient(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/rest/v1/profiles") {
			writeJSONResp(w, http.StatusOK, []map[string]interface{}{{
				"id":         "user-001",
				"first_name": "Alice",
				"last_name":  "Smith",
				"email":      "alice@example.com",
			}})
		}
	}))

	mw := src.NewAuthMiddleware(src.Config{SupabaseJWTSecret: testJWTSecret}, nil, nil)
	handler := mw.Middleware(src.HandleMe(authClient, nullDB(t)))

	token := buildJWT(testJWTSecret, map[string]any{
		"sub":  testUserUUID,
		"exp":  time.Now().Add(time.Hour).Unix(),
		"role": "authenticated",
	})
	// Use a non-exempt path so middleware injects user ID into context
	req := httptest.NewRequest(http.MethodGet, "/api/user/me", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestHandleMe_MissingUserID(t *testing.T) {
	authClient := newFakeAuthClient(t, http.NotFoundHandler())
	handler := src.HandleMe(authClient, nullDB(t))
	// Call without user ID in context (no middleware)
	req := httptest.NewRequest(http.MethodGet, "/api/auth/me", nil)
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rr.Code)
	}
}

// TestHandleMe_ProfileNotFound verifies that when a profile is missing, HandleMe
// auto-provisions a profile and trial credits, then returns 200 with the new profile.
func TestHandleMe_ProfileNotFound(t *testing.T) {
	authClient, db := newFakeAuthAndDBClients(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodGet && strings.HasPrefix(r.URL.Path, "/rest/v1/profiles"):
			// Profile not found
			writeJSONResp(w, http.StatusOK, []interface{}{})
		case r.URL.Path == "/auth/v1/user":
			// Return user for email provisioning and lazy email sync
			writeJSONResp(w, http.StatusOK, map[string]interface{}{
				"id":    "user-999",
				"email": "user999@example.com",
			})
		case r.Method == http.MethodPost && strings.HasPrefix(r.URL.Path, "/rest/v1/profiles"):
			// CreateProfile succeeds
			w.WriteHeader(http.StatusCreated)
		case r.Method == http.MethodPost && strings.HasPrefix(r.URL.Path, "/rest/v1/credit_balances"):
			// CreateCreditBalance succeeds
			w.WriteHeader(http.StatusCreated)
		}
	}))
	mw := src.NewAuthMiddleware(src.Config{SupabaseJWTSecret: testJWTSecret}, nil, nil)
	handler := mw.Middleware(src.HandleMe(authClient, db))
	const testUserUUID2 = "b2c3d4e5-f6a7-4890-bcde-f01234567890"
	token := buildJWT(testJWTSecret, map[string]any{
		"sub":  testUserUUID2,
		"exp":  time.Now().Add(time.Hour).Unix(),
		"role": "authenticated",
	})
	req := httptest.NewRequest(http.MethodGet, "/api/user/me", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200 (auto-provisioned profile), got %d: %s", rr.Code, rr.Body.String())
	}
	var profile src.UserProfile
	if err := json.NewDecoder(rr.Body).Decode(&profile); err != nil {
		t.Fatalf("decode profile response: %v", err)
	}
	if profile.ID != testUserUUID2 {
		t.Errorf("profile.ID = %q, want %q", profile.ID, testUserUUID2)
	}
}

// --- HandleForgotPassword ---

func TestHandleForgotPassword_Success(t *testing.T) {
	authClient := newFakeAuthClient(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/auth/v1/recover" {
			w.WriteHeader(http.StatusOK)
		}
	}))
	handler := src.HandleForgotPassword(authClient)
	req := postBody(t, "/api/auth/forgot-password", map[string]string{"email": "user@example.com"})
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp map[string]string
	json.NewDecoder(rr.Body).Decode(&resp)
	if resp["message"] == "" {
		t.Fatal("expected non-empty message")
	}
}

func TestHandleForgotPassword_UnregisteredEmail_StillReturns200(t *testing.T) {
	// Anti-enumeration: unregistered emails must return 200 identical to registered ones
	authClient := newFakeAuthClient(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/auth/v1/recover" {
			// Supabase may return non-5xx for unregistered email — handler must swallow it
			writeSupabaseErr(w, 422, "email_not_found", "User not found")
		}
	}))
	handler := src.HandleForgotPassword(authClient)
	req := postBody(t, "/api/auth/forgot-password", map[string]string{"email": "ghost@example.com"})
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200 for anti-enumeration, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestHandleForgotPassword_MissingEmail(t *testing.T) {
	authClient := newFakeAuthClient(t, http.NotFoundHandler())
	handler := src.HandleForgotPassword(authClient)
	req := postBody(t, "/api/auth/forgot-password", map[string]string{})
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rr.Code)
	}
}

func TestHandleForgotPassword_InvalidEmailFormat(t *testing.T) {
	authClient := newFakeAuthClient(t, http.NotFoundHandler())
	handler := src.HandleForgotPassword(authClient)
	req := postBody(t, "/api/auth/forgot-password", map[string]string{"email": "not-an-email"})
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rr.Code)
	}
	errResp := decodeErrResp(t, rr)
	if errResp.Error != src.ErrAuthInvalidEmail {
		t.Fatalf("expected %s, got %s", src.ErrAuthInvalidEmail, errResp.Error)
	}
}

func TestHandleForgotPassword_SupabaseUnavailable(t *testing.T) {
	authClient := newFakeAuthClient(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/auth/v1/recover" {
			writeSupabaseErr(w, 503, "service_unavailable", "Service unavailable")
		}
	}))
	handler := src.HandleForgotPassword(authClient)
	req := postBody(t, "/api/auth/forgot-password", map[string]string{"email": "user@example.com"})
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected 503, got %d: %s", rr.Code, rr.Body.String())
	}
}

// --- HandleVerifyResetCode ---

func TestHandleVerifyResetCode_Success(t *testing.T) {
	authClient := newFakeAuthClient(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/auth/v1/verify" {
			writeJSONResp(w, http.StatusOK, map[string]interface{}{
				"access_token":  "reset-token",
				"refresh_token": "rt",
				"expires_in":    300,
				"user":          map[string]interface{}{"id": "user-001", "email": "u@e.com"},
			})
		}
	}))
	handler := src.HandleVerifyResetCode(authClient)
	req := postBody(t, "/api/auth/verify-reset-code", map[string]string{"email": "u@e.com", "code": "123456"})
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp map[string]string
	json.NewDecoder(rr.Body).Decode(&resp)
	if resp["access_token"] == "" {
		t.Fatal("expected access_token in response")
	}
}

func TestHandleVerifyResetCode_MissingEmail(t *testing.T) {
	authClient := newFakeAuthClient(t, http.NotFoundHandler())
	handler := src.HandleVerifyResetCode(authClient)
	req := postBody(t, "/api/auth/verify-reset-code", map[string]string{"code": "123456"})
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rr.Code)
	}
}

func TestHandleVerifyResetCode_MissingCode(t *testing.T) {
	authClient := newFakeAuthClient(t, http.NotFoundHandler())
	handler := src.HandleVerifyResetCode(authClient)
	req := postBody(t, "/api/auth/verify-reset-code", map[string]string{"email": "u@e.com"})
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rr.Code)
	}
}

func TestHandleVerifyResetCode_InvalidCode(t *testing.T) {
	authClient := newFakeAuthClient(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/auth/v1/verify" {
			writeSupabaseErr(w, 422, "otp_expired", "OTP expired or invalid")
		}
	}))
	handler := src.HandleVerifyResetCode(authClient)
	req := postBody(t, "/api/auth/verify-reset-code", map[string]string{"email": "u@e.com", "code": "000000"})
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", rr.Code, rr.Body.String())
	}
	errResp := decodeErrResp(t, rr)
	if errResp.Error != src.ErrAuthInvalidCode {
		t.Fatalf("expected %s, got %s", src.ErrAuthInvalidCode, errResp.Error)
	}
}

// --- HandleResetPassword ---

func TestHandleResetPassword_Success(t *testing.T) {
	authClient := newFakeAuthClient(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/auth/v1/user" && r.Method == http.MethodPut {
			writeJSONResp(w, http.StatusOK, map[string]interface{}{"id": "user-001"})
		}
	}))
	handler := src.HandleResetPassword(authClient)
	req := postBody(t, "/api/auth/reset-password", map[string]string{"password": "newpassword123"})
	req.Header.Set("Authorization", "Bearer reset-token")
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestHandleResetPassword_MissingAuthHeader(t *testing.T) {
	authClient := newFakeAuthClient(t, http.NotFoundHandler())
	handler := src.HandleResetPassword(authClient)
	req := postBody(t, "/api/auth/reset-password", map[string]string{"password": "newpassword123"})
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rr.Code)
	}
}

func TestHandleResetPassword_MissingPassword(t *testing.T) {
	authClient := newFakeAuthClient(t, http.NotFoundHandler())
	handler := src.HandleResetPassword(authClient)
	req := postBody(t, "/api/auth/reset-password", map[string]string{})
	req.Header.Set("Authorization", "Bearer reset-token")
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rr.Code)
	}
}

func TestHandleResetPassword_PasswordTooShort(t *testing.T) {
	authClient := newFakeAuthClient(t, http.NotFoundHandler())
	handler := src.HandleResetPassword(authClient)
	req := postBody(t, "/api/auth/reset-password", map[string]string{"password": "short"})
	req.Header.Set("Authorization", "Bearer reset-token")
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rr.Code)
	}
	errResp := decodeErrResp(t, rr)
	if errResp.Error != src.ErrAuthInvalidPassword {
		t.Fatalf("expected %s, got %s", src.ErrAuthInvalidPassword, errResp.Error)
	}
}

func TestHandleResetPassword_PasswordTooLong(t *testing.T) {
	authClient := newFakeAuthClient(t, http.NotFoundHandler())
	handler := src.HandleResetPassword(authClient)
	req := postBody(t, "/api/auth/reset-password", map[string]string{"password": strings.Repeat("x", 129)})
	req.Header.Set("Authorization", "Bearer reset-token")
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rr.Code)
	}
	errResp := decodeErrResp(t, rr)
	if errResp.Error != src.ErrAuthInvalidPassword {
		t.Fatalf("expected %s, got %s", src.ErrAuthInvalidPassword, errResp.Error)
	}
}

func TestHandleResetPassword_InvalidResetToken(t *testing.T) {
	authClient := newFakeAuthClient(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/auth/v1/user" {
			writeSupabaseErr(w, http.StatusUnauthorized, "invalid_token", "Token expired")
		}
	}))
	handler := src.HandleResetPassword(authClient)
	req := postBody(t, "/api/auth/reset-password", map[string]string{"password": "newpassword123"})
	req.Header.Set("Authorization", "Bearer expired-reset-token")
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d: %s", rr.Code, rr.Body.String())
	}
	errResp := decodeErrResp(t, rr)
	if errResp.Error != src.ErrAuthResetTokenInvalid {
		t.Fatalf("expected %s, got %s", src.ErrAuthResetTokenInvalid, errResp.Error)
	}
}

// --- HandleMagicLink ---

func TestHandleMagicLink_Success(t *testing.T) {
	authClient := newFakeAuthClient(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/auth/v1/otp" {
			w.WriteHeader(http.StatusOK)
		}
	}))
	handler := src.HandleMagicLink(authClient)
	req := postBody(t, "/api/auth/magic-link", map[string]string{"email": "user@example.com"})
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestHandleMagicLink_MissingEmail(t *testing.T) {
	authClient := newFakeAuthClient(t, http.NotFoundHandler())
	handler := src.HandleMagicLink(authClient)
	req := postBody(t, "/api/auth/magic-link", map[string]string{})
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rr.Code)
	}
}

func TestHandleMagicLink_InvalidEmail(t *testing.T) {
	authClient := newFakeAuthClient(t, http.NotFoundHandler())
	handler := src.HandleMagicLink(authClient)
	req := postBody(t, "/api/auth/magic-link", map[string]string{"email": "bad-email"})
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rr.Code)
	}
	errResp := decodeErrResp(t, rr)
	if errResp.Error != src.ErrAuthInvalidEmail {
		t.Fatalf("expected %s, got %s", src.ErrAuthInvalidEmail, errResp.Error)
	}
}

func TestHandleMagicLink_SupabaseUnavailable(t *testing.T) {
	authClient := newFakeAuthClient(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/auth/v1/otp" {
			writeSupabaseErr(w, 503, "service_unavailable", "Down")
		}
	}))
	handler := src.HandleMagicLink(authClient)
	req := postBody(t, "/api/auth/magic-link", map[string]string{"email": "user@example.com"})
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected 503, got %d: %s", rr.Code, rr.Body.String())
	}
}

// --- HandleMagicLinkCallback ---

func TestHandleMagicLinkCallback_Success(t *testing.T) {
	profileChecked := false
	authClient, db := newFakeAuthAndDBClients(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.URL.Path == "/auth/v1/verify":
			writeJSONResp(w, http.StatusOK, map[string]interface{}{
				"access_token": "at", "refresh_token": "rt", "expires_in": 3600,
				"user": map[string]interface{}{"id": "user-ml", "email": "ml@example.com"},
			})
		case strings.HasPrefix(r.URL.Path, "/rest/v1/profiles") && r.Method == http.MethodGet:
			profileChecked = true
			writeJSONResp(w, http.StatusOK, []interface{}{}) // new user
		case strings.HasPrefix(r.URL.Path, "/rest/v1/profiles") && r.Method == http.MethodPost:
			w.WriteHeader(http.StatusCreated)
		case strings.HasPrefix(r.URL.Path, "/rest/v1/credit_balances"):
			w.WriteHeader(http.StatusCreated)
			w.Write([]byte("[]"))
		}
	}))

	handler := src.HandleMagicLinkCallback(authClient, db)
	req := httptest.NewRequest(http.MethodGet, "/api/auth/magic-link/callback?token_hash=abc123&type=magiclink", nil)
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusFound {
		t.Fatalf("expected 302 redirect, got %d: %s", rr.Code, rr.Body.String())
	}
	loc := rr.Header().Get("Location")
	if !strings.Contains(loc, "access_token=at") {
		t.Fatalf("expected access_token in redirect URL, got: %s", loc)
	}
	if !profileChecked {
		t.Fatal("expected profile lookup for new user")
	}
}

func TestHandleMagicLinkCallback_SignupTypeRedirectsToEmailVerified(t *testing.T) {
	authClient, db := newFakeAuthAndDBClients(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.URL.Path == "/auth/v1/verify":
			writeJSONResp(w, http.StatusOK, map[string]interface{}{
				"access_token": "at", "refresh_token": "rt", "expires_in": 3600,
				"user": map[string]interface{}{"id": "user-new", "email": "new@example.com"},
			})
		case strings.HasPrefix(r.URL.Path, "/rest/v1/profiles") && r.Method == http.MethodGet:
			writeJSONResp(w, http.StatusOK, []interface{}{}) // new user
		case strings.HasPrefix(r.URL.Path, "/rest/v1/profiles") && r.Method == http.MethodPost:
			w.WriteHeader(http.StatusCreated)
		case strings.HasPrefix(r.URL.Path, "/rest/v1/credit_balances"):
			w.WriteHeader(http.StatusCreated)
			w.Write([]byte("[]"))
		}
	}))

	handler := src.HandleMagicLinkCallback(authClient, db)
	req := httptest.NewRequest(http.MethodGet, "/api/auth/magic-link/callback?token_hash=abc123&type=signup", nil)
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusFound {
		t.Fatalf("expected 302 redirect, got %d: %s", rr.Code, rr.Body.String())
	}
	loc := rr.Header().Get("Location")
	// Signup type via magic link (no source=register) delivers tokens immediately.
	if !strings.Contains(loc, "/login") {
		t.Fatalf("expected redirect to /login, got: %s", loc)
	}
	if !strings.Contains(loc, "access_token=at") {
		t.Fatalf("expected access_token in redirect URL, got: %s", loc)
	}
}

func TestHandleMagicLinkCallback_RegisterSourceRedirectsToEmailVerified(t *testing.T) {
	authClient, db := newFakeAuthAndDBClients(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.URL.Path == "/auth/v1/verify":
			writeJSONResp(w, http.StatusOK, map[string]interface{}{
				"access_token": "at", "refresh_token": "rt", "expires_in": 3600,
				"user": map[string]interface{}{"id": "user-reg", "email": "reg@example.com"},
			})
		}
	}))

	handler := src.HandleMagicLinkCallback(authClient, db)
	req := httptest.NewRequest(http.MethodGet, "/api/auth/magic-link/callback?token_hash=abc123&type=signup&source=register", nil)
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusFound {
		t.Fatalf("expected 302 redirect, got %d: %s", rr.Code, rr.Body.String())
	}
	loc := rr.Header().Get("Location")
	// Registration confirmation shows "email verified" page without tokens.
	if !strings.Contains(loc, "/email-verified") {
		t.Fatalf("expected redirect to /email-verified, got: %s", loc)
	}
	if strings.Contains(loc, "access_token") {
		t.Fatalf("expected no tokens in redirect URL for register source, got: %s", loc)
	}
}

func TestHandleMagicLinkCallback_ErrorParam(t *testing.T) {
	authClient := newFakeAuthClient(t, http.NotFoundHandler())
	handler := src.HandleMagicLinkCallback(authClient, nullDB(t))
	req := httptest.NewRequest(http.MethodGet, "/api/auth/magic-link/callback?error=access_denied", nil)
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusFound {
		t.Fatalf("expected 302, got %d", rr.Code)
	}
	loc := rr.Header().Get("Location")
	if !strings.Contains(loc, "error=") {
		t.Fatalf("expected error in redirect URL, got: %s", loc)
	}
}

func TestHandleMagicLinkCallback_MissingTokenHash(t *testing.T) {
	authClient := newFakeAuthClient(t, http.NotFoundHandler())
	handler := src.HandleMagicLinkCallback(authClient, nullDB(t))
	req := httptest.NewRequest(http.MethodGet, "/api/auth/magic-link/callback", nil)
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusFound {
		t.Fatalf("expected 302, got %d", rr.Code)
	}
	loc := rr.Header().Get("Location")
	if !strings.Contains(loc, "error=") {
		t.Fatalf("expected error in redirect URL, got: %s", loc)
	}
}

func TestHandleMagicLinkCallback_InvalidToken(t *testing.T) {
	authClient := newFakeAuthClient(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/auth/v1/verify" {
			writeSupabaseErr(w, 422, "otp_expired", "Token expired")
		}
	}))
	handler := src.HandleMagicLinkCallback(authClient, nullDB(t))
	req := httptest.NewRequest(http.MethodGet, "/api/auth/magic-link/callback?token_hash=expired&type=magiclink", nil)
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusFound {
		t.Fatalf("expected 302, got %d", rr.Code)
	}
	loc := rr.Header().Get("Location")
	if !strings.Contains(loc, "error=") {
		t.Fatalf("expected error in redirect URL, got: %s", loc)
	}
}

// --- HandleOAuthInitiate ---

func TestHandleOAuthInitiate_ValidProvider_Google(t *testing.T) {
	authClient := newFakeAuthClient(t, http.NotFoundHandler())
	handler := src.HandleOAuthInitiate(authClient)
	req := httptest.NewRequest(http.MethodGet, "/api/auth/oauth/google", nil)
	req.SetPathValue("provider", "google")
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusFound {
		t.Fatalf("expected 302 redirect, got %d: %s", rr.Code, rr.Body.String())
	}
	loc := rr.Header().Get("Location")
	if !strings.Contains(loc, "provider=google") {
		t.Fatalf("expected provider=google in redirect URL, got: %s", loc)
	}
}

func TestHandleOAuthInitiate_ValidProvider_Apple(t *testing.T) {
	authClient := newFakeAuthClient(t, http.NotFoundHandler())
	handler := src.HandleOAuthInitiate(authClient)
	req := httptest.NewRequest(http.MethodGet, "/api/auth/oauth/apple", nil)
	req.SetPathValue("provider", "apple")
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusFound {
		t.Fatalf("expected 302 redirect, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestHandleOAuthInitiate_InvalidProvider(t *testing.T) {
	authClient := newFakeAuthClient(t, http.NotFoundHandler())
	handler := src.HandleOAuthInitiate(authClient)
	req := httptest.NewRequest(http.MethodGet, "/api/auth/oauth/facebook", nil)
	req.SetPathValue("provider", "facebook")
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rr.Code)
	}
	errResp := decodeErrResp(t, rr)
	if errResp.Error != src.ErrAuthInvalidProvider {
		t.Fatalf("expected %s, got %s", src.ErrAuthInvalidProvider, errResp.Error)
	}
}

// --- HandleOAuthCallback ---

func addPKCECookie(req *http.Request, verifier string) {
	req.AddCookie(&http.Cookie{Name: "mc_pkce_verifier", Value: verifier})
}

func TestHandleOAuthCallback_Success(t *testing.T) {
	authClient, db := newFakeAuthAndDBClients(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case strings.Contains(r.URL.RawQuery, "grant_type=pkce"):
			writeJSONResp(w, http.StatusOK, map[string]interface{}{
				"access_token": "at-oauth", "refresh_token": "rt-oauth", "expires_in": 3600,
				"user": map[string]interface{}{
					"id":            "user-oauth",
					"email":         "oauth@example.com",
					"user_metadata": map[string]interface{}{"full_name": "John Doe"},
					"identities":    []interface{}{},
				},
			})
		case strings.HasPrefix(r.URL.Path, "/rest/v1/profiles") && r.Method == http.MethodGet:
			writeJSONResp(w, http.StatusOK, []interface{}{}) // new user
		case strings.HasPrefix(r.URL.Path, "/rest/v1/profiles") && r.Method == http.MethodPost:
			w.WriteHeader(http.StatusCreated)
		case strings.HasPrefix(r.URL.Path, "/rest/v1/credit_balances"):
			w.WriteHeader(http.StatusCreated)
			w.Write([]byte("[]"))
		}
	}))

	handler := src.HandleOAuthCallback(authClient, db)
	req := httptest.NewRequest(http.MethodGet, "/api/auth/oauth/callback?code=auth-code-123", nil)
	addPKCECookie(req, "test-verifier")
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusFound {
		t.Fatalf("expected 302, got %d: %s", rr.Code, rr.Body.String())
	}
	loc := rr.Header().Get("Location")
	if !strings.Contains(loc, "access_token=at-oauth") {
		t.Fatalf("expected access_token in redirect URL, got: %s", loc)
	}
}

func TestHandleOAuthCallback_ErrorParam(t *testing.T) {
	authClient := newFakeAuthClient(t, http.NotFoundHandler())
	handler := src.HandleOAuthCallback(authClient, nullDB(t))
	req := httptest.NewRequest(http.MethodGet, "/api/auth/oauth/callback?error=access_denied", nil)
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusFound {
		t.Fatalf("expected 302, got %d", rr.Code)
	}
	loc := rr.Header().Get("Location")
	if !strings.Contains(loc, "error=") {
		t.Fatalf("expected error in redirect URL, got: %s", loc)
	}
}

func TestHandleOAuthCallback_MissingCode(t *testing.T) {
	authClient := newFakeAuthClient(t, http.NotFoundHandler())
	handler := src.HandleOAuthCallback(authClient, nullDB(t))
	req := httptest.NewRequest(http.MethodGet, "/api/auth/oauth/callback", nil)
	addPKCECookie(req, "test-verifier")
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusFound {
		t.Fatalf("expected 302, got %d", rr.Code)
	}
	loc := rr.Header().Get("Location")
	if !strings.Contains(loc, "error=") {
		t.Fatalf("expected error in redirect URL, got: %s", loc)
	}
}

func TestHandleOAuthCallback_MissingPKCECookie(t *testing.T) {
	authClient := newFakeAuthClient(t, http.NotFoundHandler())
	handler := src.HandleOAuthCallback(authClient, nullDB(t))
	req := httptest.NewRequest(http.MethodGet, "/api/auth/oauth/callback?code=auth-code", nil)
	// no cookie set
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusFound {
		t.Fatalf("expected 302, got %d", rr.Code)
	}
	loc := rr.Header().Get("Location")
	if !strings.Contains(loc, "error=") {
		t.Fatalf("expected error in redirect URL for missing cookie, got: %s", loc)
	}
}

func TestHandleOAuthCallback_InvalidCode(t *testing.T) {
	authClient := newFakeAuthClient(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.Contains(r.URL.RawQuery, "grant_type=pkce") {
			writeSupabaseErr(w, 400, "invalid_grant", "Invalid authorization code")
		}
	}))
	handler := src.HandleOAuthCallback(authClient, nullDB(t))
	req := httptest.NewRequest(http.MethodGet, "/api/auth/oauth/callback?code=bad-code", nil)
	addPKCECookie(req, "test-verifier")
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != http.StatusFound {
		t.Fatalf("expected 302, got %d", rr.Code)
	}
	loc := rr.Header().Get("Location")
	if !strings.Contains(loc, "error=") {
		t.Fatalf("expected error in redirect URL for invalid code, got: %s", loc)
	}
}
