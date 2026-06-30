package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	src "metacleaner-server/source"
)

// newAPIKeyDB creates a SupabaseClient pointing at the given handler for API key tests.
func newAPIKeyDB(t *testing.T, handler http.Handler) *src.SupabaseClient {
	t.Helper()
	srv := httptest.NewServer(handler)
	t.Cleanup(srv.Close)
	return src.NewSupabaseClient(newSupabaseConfig(srv.URL))
}

// ─── HandleCreateAPIKey ──────────────────────────────────────────────────────

func TestHandleCreateAPIKey_MissingUserID_Returns401(t *testing.T) {
	db := newAPIKeyDB(t, http.NotFoundHandler())
	handler := src.HandleCreateAPIKey(db)

	req := httptest.NewRequest(http.MethodPost, "/api/keys", bytes.NewBufferString(`{"name":"MyKey"}`))
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d: %s", rr.Code, rr.Body.String())
	}
	resp := decodeErrResp(t, rr)
	if resp.Error != src.ErrAuthUnauthorized {
		t.Errorf("error = %q, want %q", resp.Error, src.ErrAuthUnauthorized)
	}
}

func TestHandleCreateAPIKey_InvalidBody_Returns400(t *testing.T) {
	db := newAPIKeyDB(t, http.NotFoundHandler())
	handler := src.HandleCreateAPIKey(db)

	req := httptest.NewRequest(http.MethodPost, "/api/keys", bytes.NewBufferString(`not-json`))
	req = withUserID(req, "user-1")
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestHandleCreateAPIKey_EmptyName_Returns400(t *testing.T) {
	db := newAPIKeyDB(t, http.NotFoundHandler())
	handler := src.HandleCreateAPIKey(db)

	req := httptest.NewRequest(http.MethodPost, "/api/keys", bytes.NewBufferString(`{"name":""}`))
	req = withUserID(req, "user-1")
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", rr.Code, rr.Body.String())
	}
	resp := decodeErrResp(t, rr)
	if resp.Error != src.ErrValidationError {
		t.Errorf("error = %q, want %q", resp.Error, src.ErrValidationError)
	}
}

func TestHandleCreateAPIKey_NameTooLong_Returns400(t *testing.T) {
	db := newAPIKeyDB(t, http.NotFoundHandler())
	handler := src.HandleCreateAPIKey(db)

	longName := strings.Repeat("a", 101)
	body, _ := json.Marshal(map[string]string{"name": longName})
	req := httptest.NewRequest(http.MethodPost, "/api/keys", bytes.NewBuffer(body))
	req = withUserID(req, "user-1")
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestHandleCreateAPIKey_NoteTooLong_Returns400(t *testing.T) {
	db := newAPIKeyDB(t, http.NotFoundHandler())
	handler := src.HandleCreateAPIKey(db)

	longNote := strings.Repeat("x", 501)
	body, _ := json.Marshal(map[string]string{"name": "valid", "note": longNote})
	req := httptest.NewRequest(http.MethodPost, "/api/keys", bytes.NewBuffer(body))
	req = withUserID(req, "user-1")
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestHandleCreateAPIKey_Success_Returns201WithPlaintextKey(t *testing.T) {
	db := newAPIKeyDB(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost && strings.Contains(r.URL.Path, "api_keys") {
			writeJSONResp(w, http.StatusCreated, []map[string]interface{}{
				apiKeyRow("key-new", "user-1", "My Key", "active"),
			})
		}
	}))
	handler := src.HandleCreateAPIKey(db)

	body, _ := json.Marshal(map[string]string{"name": "My Key", "note": "optional note"})
	req := httptest.NewRequest(http.MethodPost, "/api/keys", bytes.NewBuffer(body))
	req = withUserID(req, "user-1")
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", rr.Code, rr.Body.String())
	}

	var resp src.CreateAPIKeyResponse
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if resp.Key == "" {
		t.Error("expected non-empty plaintext key in response")
	}
	if !strings.HasPrefix(resp.Key, "mtd_key_") {
		t.Errorf("plaintext key %q does not start with mtd_key_", resp.Key)
	}
	if resp.APIKey.ID != "key-new" {
		t.Errorf("api_key.id = %q, want key-new", resp.APIKey.ID)
	}
}

// ─── HandleListAPIKeys ───────────────────────────────────────────────────────

func TestHandleListAPIKeys_MissingUserID_Returns401(t *testing.T) {
	db := newAPIKeyDB(t, http.NotFoundHandler())
	handler := src.HandleListAPIKeys(db)

	req := httptest.NewRequest(http.MethodGet, "/api/keys", nil)
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d: %s", rr.Code, rr.Body.String())
	}
	resp := decodeErrResp(t, rr)
	if resp.Error != src.ErrAuthUnauthorized {
		t.Errorf("error = %q, want %q", resp.Error, src.ErrAuthUnauthorized)
	}
}

func TestHandleListAPIKeys_Success_ReturnsKeys(t *testing.T) {
	db := newAPIKeyDB(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		writeJSONResp(w, http.StatusOK, []map[string]interface{}{
			apiKeyRow("key-1", "user-1", "Key One", "active"),
			apiKeyRow("key-2", "user-1", "Key Two", "revoked"),
		})
	}))
	handler := src.HandleListAPIKeys(db)

	req := httptest.NewRequest(http.MethodGet, "/api/keys", nil)
	req = withUserID(req, "user-1")
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}

	var keys []src.APIKey
	if err := json.NewDecoder(rr.Body).Decode(&keys); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if len(keys) != 2 {
		t.Errorf("expected 2 keys, got %d", len(keys))
	}
}

// ─── HandleDeleteAPIKey ──────────────────────────────────────────────────────

func TestHandleDeleteAPIKey_MissingUserID_Returns401(t *testing.T) {
	db := newAPIKeyDB(t, http.NotFoundHandler())
	handler := src.HandleDeleteAPIKey(db)

	req := httptest.NewRequest(http.MethodDelete, "/api/keys/key-1", nil)
	req.SetPathValue("id", "key-1")
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestHandleDeleteAPIKey_NotFound_Returns404(t *testing.T) {
	db := newAPIKeyDB(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Ownership lookup returns empty — key not found or not owned
		writeJSONResp(w, http.StatusOK, []interface{}{})
	}))
	handler := src.HandleDeleteAPIKey(db)

	req := httptest.NewRequest(http.MethodDelete, "/api/keys/key-99", nil)
	req.SetPathValue("id", "key-99")
	req = withUserID(req, "user-1")
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d: %s", rr.Code, rr.Body.String())
	}
	resp := decodeErrResp(t, rr)
	if resp.Error != src.ErrAPIKeyNotFound {
		t.Errorf("error = %q, want %q", resp.Error, src.ErrAPIKeyNotFound)
	}
}

func TestHandleDeleteAPIKey_Success_Returns204(t *testing.T) {
	db := newAPIKeyDB(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			writeJSONResp(w, http.StatusOK, []map[string]interface{}{
				apiKeyRow("key-1", "user-1", "My Key", "active"),
			})
		} else if r.Method == http.MethodDelete {
			w.WriteHeader(http.StatusOK)
		}
	}))
	handler := src.HandleDeleteAPIKey(db)

	req := httptest.NewRequest(http.MethodDelete, "/api/keys/key-1", nil)
	req.SetPathValue("id", "key-1")
	req = withUserID(req, "user-1")
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusNoContent {
		t.Fatalf("expected 204, got %d: %s", rr.Code, rr.Body.String())
	}
}

// ─── HandleRevokeAPIKey ──────────────────────────────────────────────────────

func TestHandleRevokeAPIKey_MissingUserID_Returns401(t *testing.T) {
	db := newAPIKeyDB(t, http.NotFoundHandler())
	handler := src.HandleRevokeAPIKey(db)

	req := httptest.NewRequest(http.MethodPatch, "/api/keys/key-1/revoke", nil)
	req.SetPathValue("id", "key-1")
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestHandleRevokeAPIKey_NotFound_Returns404(t *testing.T) {
	db := newAPIKeyDB(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		writeJSONResp(w, http.StatusOK, []interface{}{})
	}))
	handler := src.HandleRevokeAPIKey(db)

	req := httptest.NewRequest(http.MethodPatch, "/api/keys/key-99/revoke", nil)
	req.SetPathValue("id", "key-99")
	req = withUserID(req, "user-1")
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d: %s", rr.Code, rr.Body.String())
	}
	resp := decodeErrResp(t, rr)
	if resp.Error != src.ErrAPIKeyNotFound {
		t.Errorf("error = %q, want %q", resp.Error, src.ErrAPIKeyNotFound)
	}
}

func TestHandleRevokeAPIKey_AlreadyRevoked_Returns409(t *testing.T) {
	db := newAPIKeyDB(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			writeJSONResp(w, http.StatusOK, []map[string]interface{}{
				apiKeyRow("key-1", "user-1", "My Key", "revoked"),
			})
		}
	}))
	handler := src.HandleRevokeAPIKey(db)

	req := httptest.NewRequest(http.MethodPatch, "/api/keys/key-1/revoke", nil)
	req.SetPathValue("id", "key-1")
	req = withUserID(req, "user-1")
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusConflict {
		t.Fatalf("expected 409, got %d: %s", rr.Code, rr.Body.String())
	}
	resp := decodeErrResp(t, rr)
	if resp.Error != src.ErrAPIKeyAlreadyRevoked {
		t.Errorf("error = %q, want %q", resp.Error, src.ErrAPIKeyAlreadyRevoked)
	}
}

func TestHandleRevokeAPIKey_Success_ReturnsKey(t *testing.T) {
	db := newAPIKeyDB(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			writeJSONResp(w, http.StatusOK, []map[string]interface{}{
				apiKeyRow("key-1", "user-1", "My Key", "active"),
			})
		} else if r.Method == http.MethodPatch {
			row := apiKeyRow("key-1", "user-1", "My Key", "revoked")
			writeJSONResp(w, http.StatusOK, []map[string]interface{}{row})
		}
	}))
	handler := src.HandleRevokeAPIKey(db)

	req := httptest.NewRequest(http.MethodPatch, "/api/keys/key-1/revoke", nil)
	req.SetPathValue("id", "key-1")
	req = withUserID(req, "user-1")
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	var key src.APIKey
	if err := json.NewDecoder(rr.Body).Decode(&key); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if key.ID != "key-1" {
		t.Errorf("key.ID = %q, want key-1", key.ID)
	}
	if key.Status != "revoked" {
		t.Errorf("key.Status = %q, want revoked", key.Status)
	}
}

// ─── HandleActivateAPIKey ────────────────────────────────────────────────────

func TestHandleActivateAPIKey_MissingUserID_Returns401(t *testing.T) {
	db := newAPIKeyDB(t, http.NotFoundHandler())
	handler := src.HandleActivateAPIKey(db)

	req := httptest.NewRequest(http.MethodPatch, "/api/keys/key-1/activate", nil)
	req.SetPathValue("id", "key-1")
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestHandleActivateAPIKey_NotFound_Returns404(t *testing.T) {
	db := newAPIKeyDB(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		writeJSONResp(w, http.StatusOK, []interface{}{})
	}))
	handler := src.HandleActivateAPIKey(db)

	req := httptest.NewRequest(http.MethodPatch, "/api/keys/key-99/activate", nil)
	req.SetPathValue("id", "key-99")
	req = withUserID(req, "user-1")
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d: %s", rr.Code, rr.Body.String())
	}
	resp := decodeErrResp(t, rr)
	if resp.Error != src.ErrAPIKeyNotFound {
		t.Errorf("error = %q, want %q", resp.Error, src.ErrAPIKeyNotFound)
	}
}

func TestHandleActivateAPIKey_AlreadyActive_Returns409(t *testing.T) {
	db := newAPIKeyDB(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			writeJSONResp(w, http.StatusOK, []map[string]interface{}{
				apiKeyRow("key-1", "user-1", "My Key", "active"),
			})
		}
	}))
	handler := src.HandleActivateAPIKey(db)

	req := httptest.NewRequest(http.MethodPatch, "/api/keys/key-1/activate", nil)
	req.SetPathValue("id", "key-1")
	req = withUserID(req, "user-1")
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusConflict {
		t.Fatalf("expected 409, got %d: %s", rr.Code, rr.Body.String())
	}
	resp := decodeErrResp(t, rr)
	if resp.Error != src.ErrAPIKeyAlreadyActive {
		t.Errorf("error = %q, want %q", resp.Error, src.ErrAPIKeyAlreadyActive)
	}
}

func TestHandleActivateAPIKey_Success_ReturnsKey(t *testing.T) {
	db := newAPIKeyDB(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			writeJSONResp(w, http.StatusOK, []map[string]interface{}{
				apiKeyRow("key-1", "user-1", "My Key", "revoked"),
			})
		} else if r.Method == http.MethodPatch {
			row := apiKeyRow("key-1", "user-1", "My Key", "active")
			writeJSONResp(w, http.StatusOK, []map[string]interface{}{row})
		}
	}))
	handler := src.HandleActivateAPIKey(db)

	req := httptest.NewRequest(http.MethodPatch, "/api/keys/key-1/activate", nil)
	req.SetPathValue("id", "key-1")
	req = withUserID(req, "user-1")
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	var key src.APIKey
	if err := json.NewDecoder(rr.Body).Decode(&key); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if key.ID != "key-1" {
		t.Errorf("key.ID = %q, want key-1", key.ID)
	}
	if key.Status != "active" {
		t.Errorf("key.Status = %q, want active", key.Status)
	}
}
