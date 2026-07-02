package source

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

// --- emailChangeStore tests ---

func TestEmailChangeStore_Create_DeletesExistingAndInsertsNew(t *testing.T) {
	var (
		deleteCalled bool
		insertCalled bool
		insertedBody map[string]string
	)

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		switch r.Method {
		case http.MethodDelete:
			deleteCalled = true
			w.WriteHeader(http.StatusNoContent)
		case http.MethodPost:
			insertCalled = true
			json.NewDecoder(r.Body).Decode(&insertedBody)
			w.WriteHeader(http.StatusCreated)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	}))
	defer srv.Close()

	store := newEmailChangeStore(srv.URL, "test-key", 5*time.Second)
	token, err := store.Create("user-123", "new@example.com")
	if err != nil {
		t.Fatalf("Create returned error: %v", err)
	}
	if token == "" {
		t.Error("Create returned empty token")
	}
	if !deleteCalled {
		t.Error("Create did not issue DELETE for existing tokens")
	}
	if !insertCalled {
		t.Error("Create did not issue POST to insert new token")
	}
	if insertedBody["user_id"] != "user-123" {
		t.Errorf("inserted body user_id=%q, want user-123", insertedBody["user_id"])
	}
	if insertedBody["new_email"] != "new@example.com" {
		t.Errorf("inserted body new_email=%q, want new@example.com", insertedBody["new_email"])
	}
	if insertedBody["token"] == "" {
		t.Error("inserted body missing token field")
	}
}

func TestEmailChangeStore_Create_ReturnsNonEmptyUniqueToken(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusCreated)
	}))
	defer srv.Close()

	store := newEmailChangeStore(srv.URL, "test-key", 5*time.Second)

	token1, err := store.Create("user-1", "a@example.com")
	if err != nil {
		t.Fatalf("first Create: %v", err)
	}
	token2, err := store.Create("user-1", "a@example.com")
	if err != nil {
		t.Fatalf("second Create: %v", err)
	}
	if token1 == "" || token2 == "" {
		t.Error("Create must return non-empty token")
	}
	if token1 == token2 {
		t.Error("successive Create calls must return different tokens")
	}
}

func TestEmailChangeStore_Create_ReturnsErrorWhenInsertFails(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodDelete:
			w.WriteHeader(http.StatusNoContent)
		case http.MethodPost:
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(`{"message":"db error"}`))
		}
	}))
	defer srv.Close()

	store := newEmailChangeStore(srv.URL, "test-key", 5*time.Second)
	_, err := store.Create("user-123", "new@example.com")
	if err == nil {
		t.Fatal("expected error when insert fails, got nil")
	}
}

func TestEmailChangeStore_Verify_ValidToken_ReturnsRequestAndTrue(t *testing.T) {
	var deleteForTokenCalled bool

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		switch r.Method {
		case http.MethodGet:
			json.NewEncoder(w).Encode([]map[string]string{
				{"user_id": "user-456", "new_email": "newemail@example.com"},
			})
		case http.MethodDelete:
			deleteForTokenCalled = true
			w.WriteHeader(http.StatusNoContent)
		}
	}))
	defer srv.Close()

	store := newEmailChangeStore(srv.URL, "test-key", 5*time.Second)
	req, ok := store.Verify("some-valid-token")
	if !ok {
		t.Fatal("Verify returned false for valid token")
	}
	if req.UserID != "user-456" {
		t.Errorf("Verify UserID = %q, want user-456", req.UserID)
	}
	if req.NewEmail != "newemail@example.com" {
		t.Errorf("Verify NewEmail = %q, want newemail@example.com", req.NewEmail)
	}
	if !deleteForTokenCalled {
		t.Error("Verify did not delete the consumed token")
	}
}

func TestEmailChangeStore_Verify_ExpiredOrMissingToken_ReturnsFalse(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		// Empty array = no matching unexpired token.
		json.NewEncoder(w).Encode([]interface{}{})
	}))
	defer srv.Close()

	store := newEmailChangeStore(srv.URL, "test-key", 5*time.Second)
	_, ok := store.Verify("expired-or-missing-token")
	if ok {
		t.Fatal("expected Verify to return false for expired/missing token, got true")
	}
}

func TestEmailChangeStore_Verify_ServerError_ReturnsFalse(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{"message":"db error"}`))
	}))
	defer srv.Close()

	store := newEmailChangeStore(srv.URL, "test-key", 5*time.Second)
	_, ok := store.Verify("any-token")
	if ok {
		t.Fatal("expected Verify to return false on server error, got true")
	}
}

// --- HandleChangeEmail handler tests ---

func TestHandleChangeEmail_NoUserID_Returns401(t *testing.T) {
	store := newEmailChangeStore("http://127.0.0.1:0", "test", 5*time.Second)
	authClient := NewSupabaseAuthClient(Config{SupabaseURL: "http://127.0.0.1:0"})
	cfg := Config{BrevoAPIKey: "brevo-key"}

	req := httptest.NewRequest(http.MethodPost, "/api/auth/change-email",
		strings.NewReader(`{"new_email":"new@example.com"}`))
	rr := httptest.NewRecorder()
	HandleChangeEmail(cfg, authClient, store)(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestHandleChangeEmail_InvalidEmail_Returns400(t *testing.T) {
	store := newEmailChangeStore("http://127.0.0.1:0", "test", 5*time.Second)
	authClient := NewSupabaseAuthClient(Config{SupabaseURL: "http://127.0.0.1:0"})
	cfg := Config{BrevoAPIKey: "brevo-key"}

	req := httptest.NewRequest(http.MethodPost, "/api/auth/change-email",
		strings.NewReader(`{"new_email":"not-an-email"}`))
	req = req.WithContext(ContextWithUserID(req.Context(), "user-123"))
	rr := httptest.NewRecorder()
	HandleChangeEmail(cfg, authClient, store)(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestHandleChangeEmail_EmptyEmail_Returns400(t *testing.T) {
	store := newEmailChangeStore("http://127.0.0.1:0", "test", 5*time.Second)
	authClient := NewSupabaseAuthClient(Config{SupabaseURL: "http://127.0.0.1:0"})
	cfg := Config{BrevoAPIKey: "brevo-key"}

	req := httptest.NewRequest(http.MethodPost, "/api/auth/change-email",
		strings.NewReader(`{"new_email":""}`))
	req = req.WithContext(ContextWithUserID(req.Context(), "user-123"))
	rr := httptest.NewRecorder()
	HandleChangeEmail(cfg, authClient, store)(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 for empty email, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestHandleChangeEmail_NoBrevoKey_Returns503(t *testing.T) {
	// BrevoAPIKey="" is checked before store.Create is called.
	store := newEmailChangeStore("http://127.0.0.1:0", "test", 5*time.Second)
	authClient := NewSupabaseAuthClient(Config{SupabaseURL: "http://127.0.0.1:0"})
	cfg := Config{BrevoAPIKey: ""}

	req := httptest.NewRequest(http.MethodPost, "/api/auth/change-email",
		strings.NewReader(`{"new_email":"valid@example.com"}`))
	req = req.WithContext(ContextWithUserID(req.Context(), "user-123"))
	rr := httptest.NewRecorder()
	HandleChangeEmail(cfg, authClient, store)(rr, req)

	if rr.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected 503 when BrevoAPIKey is empty, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestHandleChangeEmail_StoreCreateFails_Returns500(t *testing.T) {
	// POST fails → store.Create returns error → 500.
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodDelete:
			w.WriteHeader(http.StatusNoContent)
		case http.MethodPost:
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(`{"message":"db error"}`))
		}
	}))
	defer srv.Close()

	store := newEmailChangeStore(srv.URL, "test-key", 5*time.Second)
	authClient := NewSupabaseAuthClient(Config{SupabaseURL: "http://127.0.0.1:0"})
	cfg := Config{BrevoAPIKey: "brevo-key-set"}

	req := httptest.NewRequest(http.MethodPost, "/api/auth/change-email",
		strings.NewReader(`{"new_email":"valid@example.com"}`))
	req = req.WithContext(ContextWithUserID(req.Context(), "user-123"))
	rr := httptest.NewRecorder()
	HandleChangeEmail(cfg, authClient, store)(rr, req)

	if rr.Code != http.StatusInternalServerError {
		t.Fatalf("expected 500 when store.Create fails, got %d: %s", rr.Code, rr.Body.String())
	}
}

// --- HandleConfirmEmailChange handler tests ---

func TestHandleConfirmEmailChange_MissingToken_RedirectsWithMissingTokenError(t *testing.T) {
	store := newEmailChangeStore("http://127.0.0.1:0", "test", 5*time.Second)
	authClient := NewSupabaseAuthClient(Config{SupabaseURL: "http://127.0.0.1:0"})
	cfg := Config{FrontendURL: "https://app.example.com"}

	req := httptest.NewRequest(http.MethodGet, "/api/auth/confirm-email-change", nil)
	rr := httptest.NewRecorder()
	HandleConfirmEmailChange(cfg, authClient, store)(rr, req)

	if rr.Code != http.StatusFound {
		t.Fatalf("expected 302 redirect, got %d", rr.Code)
	}
	loc := rr.Header().Get("Location")
	if !strings.Contains(loc, "missing_token") {
		t.Errorf("redirect URL %q should contain missing_token", loc)
	}
}

func TestHandleConfirmEmailChange_InvalidToken_RedirectsWithInvalidTokenError(t *testing.T) {
	// Store returns empty array → Verify returns false.
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]interface{}{})
	}))
	defer srv.Close()

	store := newEmailChangeStore(srv.URL, "test-key", 5*time.Second)
	authClient := NewSupabaseAuthClient(Config{SupabaseURL: "http://127.0.0.1:0"})
	cfg := Config{FrontendURL: "https://app.example.com"}

	req := httptest.NewRequest(http.MethodGet, "/api/auth/confirm-email-change?token=invalid-token", nil)
	rr := httptest.NewRecorder()
	HandleConfirmEmailChange(cfg, authClient, store)(rr, req)

	if rr.Code != http.StatusFound {
		t.Fatalf("expected 302 redirect, got %d", rr.Code)
	}
	loc := rr.Header().Get("Location")
	if !strings.Contains(loc, "invalid_or_expired_token") {
		t.Errorf("redirect URL %q should contain invalid_or_expired_token", loc)
	}
}

func TestHandleConfirmEmailChange_ValidToken_UpdatesEmailAndRedirects(t *testing.T) {
	var adminUpdateCalled bool

	// authClient server: handles AdminUpdateUser (PUT /auth/v1/admin/users/*) and UpdateProfileEmail
	authSrv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		switch {
		case r.Method == http.MethodPut && strings.Contains(r.URL.Path, "/auth/v1/admin/users/"):
			adminUpdateCalled = true
			json.NewEncoder(w).Encode(map[string]interface{}{"id": "user-456", "email": "newemail@example.com"})
		case strings.Contains(r.URL.Path, "/rest/v1/profiles"):
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]interface{}{})
		default:
			w.WriteHeader(http.StatusNotFound)
		}
	}))
	defer authSrv.Close()

	// store server: GET returns matching row, DELETE succeeds
	storeSrv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		switch r.Method {
		case http.MethodGet:
			json.NewEncoder(w).Encode([]map[string]string{
				{"user_id": "user-456", "new_email": "newemail@example.com"},
			})
		case http.MethodDelete:
			w.WriteHeader(http.StatusNoContent)
		default:
			w.WriteHeader(http.StatusNotFound)
		}
	}))
	defer storeSrv.Close()

	store := newEmailChangeStore(storeSrv.URL, "test-key", 5*time.Second)
	authClient := NewSupabaseAuthClient(Config{
		SupabaseURL:            authSrv.URL,
		SupabaseAPIKey:         "test-anon",
		SupabaseServiceRoleKey: "test-service",
	})
	cfg := Config{FrontendURL: "https://app.example.com"}

	req := httptest.NewRequest(http.MethodGet, "/api/auth/confirm-email-change?token="+strings.Repeat("a", 64), nil)
	rr := httptest.NewRecorder()
	HandleConfirmEmailChange(cfg, authClient, store)(rr, req)

	if rr.Code != http.StatusFound {
		t.Fatalf("expected 302 redirect, got %d: %s", rr.Code, rr.Body.String())
	}
	loc := rr.Header().Get("Location")
	if !strings.Contains(loc, "/email-changed") {
		t.Errorf("expected redirect to /email-changed, got %q", loc)
	}
	if strings.Contains(loc, "error=") {
		t.Errorf("success redirect must not contain error parameter, got %q", loc)
	}
	if !adminUpdateCalled {
		t.Error("expected AdminUpdateUser to be called for valid token")
	}
}

func TestHandleConfirmEmailChange_AdminUpdateFails_RedirectsWithUpdateFailedError(t *testing.T) {
	// store server: returns valid token
	storeSrv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		switch r.Method {
		case http.MethodGet:
			json.NewEncoder(w).Encode([]map[string]string{
				{"user_id": "user-789", "new_email": "fail@example.com"},
			})
		case http.MethodDelete:
			w.WriteHeader(http.StatusNoContent)
		}
	}))
	defer storeSrv.Close()

	// authClient server: AdminUpdateUser fails
	authSrv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{"message": "update failed"})
	}))
	defer authSrv.Close()

	store := newEmailChangeStore(storeSrv.URL, "test-key", 5*time.Second)
	authClient := NewSupabaseAuthClient(Config{
		SupabaseURL:            authSrv.URL,
		SupabaseServiceRoleKey: "test-service",
	})
	cfg := Config{FrontendURL: "https://app.example.com"}

	req := httptest.NewRequest(http.MethodGet, "/api/auth/confirm-email-change?token="+strings.Repeat("b", 64), nil)
	rr := httptest.NewRecorder()
	HandleConfirmEmailChange(cfg, authClient, store)(rr, req)

	if rr.Code != http.StatusFound {
		t.Fatalf("expected 302 redirect, got %d", rr.Code)
	}
	loc := rr.Header().Get("Location")
	if !strings.Contains(loc, "update_failed") {
		t.Errorf("expected redirect with update_failed error, got %q", loc)
	}
}
