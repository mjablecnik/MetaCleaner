package tests

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	src "metacleaner-server/source"
)

// apiKeyRow returns a minimal api_keys row for fake server responses.
func apiKeyRow(id, userID, name, status string) map[string]interface{} {
	now := time.Now().UTC().Format(time.RFC3339)
	return map[string]interface{}{
		"id":         id,
		"user_id":    userID,
		"name":       name,
		"key_hash":   "hash-" + id,
		"key_prefix": "mk_",
		"key_suffix": "xxxx",
		"status":     status,
		"note":       "test note",
		"created_at": now,
	}
}

// ─── CreateAPIKey ─────────────────────────────────────────────────────────────

func TestCreateAPIKey_SendsCorrectBodyAndReturnsRow(t *testing.T) {
	var gotBody map[string]interface{}
	var gotMethod, gotPath string

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assertAuthHeaders(t, r)
		gotMethod = r.Method
		gotPath = r.URL.Path
		data, _ := io.ReadAll(r.Body)
		json.Unmarshal(data, &gotBody)
		writeJSONResp(w, http.StatusCreated, []map[string]interface{}{
			apiKeyRow("key-1", "user-1", "My Key", "active"),
		})
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	key, err := client.CreateAPIKey(context.Background(), "user-1", "My Key", "hashval", "mk_", "xxxx", "test note")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if gotMethod != http.MethodPost {
		t.Errorf("method = %q, want POST", gotMethod)
	}
	if !strings.Contains(gotPath, "api_keys") {
		t.Errorf("path %q does not contain api_keys", gotPath)
	}
	if gotBody["user_id"] != "user-1" {
		t.Errorf("body user_id = %v, want user-1", gotBody["user_id"])
	}
	if gotBody["key_hash"] != "hashval" {
		t.Errorf("body key_hash = %v, want hashval", gotBody["key_hash"])
	}
	if gotBody["status"] != "active" {
		t.Errorf("body status = %v, want active", gotBody["status"])
	}
	if key == nil || key.ID != "key-1" {
		t.Errorf("returned key.ID = %v, want key-1", key)
	}
}

// ─── ListAPIKeys ──────────────────────────────────────────────────────────────

func TestListAPIKeys_ReturnsUserKeys(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assertAuthHeaders(t, r)
		if !strings.Contains(r.URL.RawQuery, "user_id=eq.user-1") {
			t.Errorf("missing user_id filter in query %q", r.URL.RawQuery)
		}
		writeJSONResp(w, http.StatusOK, []map[string]interface{}{
			apiKeyRow("key-1", "user-1", "Key One", "active"),
			apiKeyRow("key-2", "user-1", "Key Two", "revoked"),
		})
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	keys, err := client.ListAPIKeys(context.Background(), "user-1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(keys) != 2 {
		t.Fatalf("expected 2 keys, got %d", len(keys))
	}
	if keys[0].ID != "key-1" {
		t.Errorf("keys[0].ID = %q, want key-1", keys[0].ID)
	}
	if keys[1].Status != "revoked" {
		t.Errorf("keys[1].Status = %q, want revoked", keys[1].Status)
	}
}

// ─── DeleteAPIKey ─────────────────────────────────────────────────────────────

func TestDeleteAPIKey_Found_DeletesAndReturnsTrue(t *testing.T) {
	reqCount := 0
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		reqCount++
		if r.Method == http.MethodGet {
			// Ownership lookup
			writeJSONResp(w, http.StatusOK, []map[string]interface{}{
				apiKeyRow("key-1", "user-1", "My Key", "active"),
			})
		} else if r.Method == http.MethodDelete {
			if !strings.Contains(r.URL.RawQuery, "id=eq.key-1") {
				t.Errorf("DELETE missing key id filter, query=%q", r.URL.RawQuery)
			}
			if !strings.Contains(r.URL.RawQuery, "user_id=eq.user-1") {
				t.Errorf("DELETE missing user_id filter, query=%q", r.URL.RawQuery)
			}
			w.WriteHeader(http.StatusOK)
		}
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	deleted, err := client.DeleteAPIKey(context.Background(), "key-1", "user-1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !deleted {
		t.Error("expected deleted=true for found key")
	}
}

func TestDeleteAPIKey_NotFound_ReturnsFalse(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			writeJSONResp(w, http.StatusOK, []interface{}{})
		} else {
			t.Errorf("unexpected %s request (key not found, should not delete)", r.Method)
		}
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	deleted, err := client.DeleteAPIKey(context.Background(), "key-99", "user-1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if deleted {
		t.Error("expected deleted=false for missing key")
	}
}

// ─── RevokeAPIKey ────────────────────────────────────────────────────────────

func TestRevokeAPIKey_ActiveKey_RevokesAndReturnsRow(t *testing.T) {
	var patchedBody map[string]interface{}
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			writeJSONResp(w, http.StatusOK, []map[string]interface{}{
				apiKeyRow("key-1", "user-1", "My Key", "active"),
			})
		} else if r.Method == http.MethodPatch {
			data, _ := io.ReadAll(r.Body)
			json.Unmarshal(data, &patchedBody)
			row := apiKeyRow("key-1", "user-1", "My Key", "revoked")
			writeJSONResp(w, http.StatusOK, []map[string]interface{}{row})
		}
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	key, alreadyRevoked, err := client.RevokeAPIKey(context.Background(), "key-1", "user-1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if alreadyRevoked {
		t.Error("expected alreadyRevoked=false for active key")
	}
	if key == nil {
		t.Fatal("expected non-nil key after revoke")
	}
	if patchedBody["status"] != "revoked" {
		t.Errorf("patched status = %v, want revoked", patchedBody["status"])
	}
	if patchedBody["revoked_at"] == nil {
		t.Error("expected revoked_at to be set")
	}
}

func TestRevokeAPIKey_AlreadyRevoked_ReturnsAlreadyRevoked(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			writeJSONResp(w, http.StatusOK, []map[string]interface{}{
				apiKeyRow("key-1", "user-1", "My Key", "revoked"),
			})
		} else {
			t.Errorf("unexpected %s request (already revoked, no patch needed)", r.Method)
		}
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	key, alreadyRevoked, err := client.RevokeAPIKey(context.Background(), "key-1", "user-1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !alreadyRevoked {
		t.Error("expected alreadyRevoked=true for already-revoked key")
	}
	if key == nil {
		t.Error("expected key to be returned even if already revoked")
	}
}

func TestRevokeAPIKey_NotFound_ReturnsFalse(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			writeJSONResp(w, http.StatusOK, []interface{}{})
		}
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	key, _, err := client.RevokeAPIKey(context.Background(), "key-99", "user-1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if key != nil {
		t.Errorf("expected nil key for not-found, got %+v", key)
	}
}

// ─── ActivateAPIKey ──────────────────────────────────────────────────────────

func TestActivateAPIKey_RevokedKey_ActivatesAndReturnsRow(t *testing.T) {
	var patchedBody map[string]interface{}
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			writeJSONResp(w, http.StatusOK, []map[string]interface{}{
				apiKeyRow("key-1", "user-1", "My Key", "revoked"),
			})
		} else if r.Method == http.MethodPatch {
			data, _ := io.ReadAll(r.Body)
			json.Unmarshal(data, &patchedBody)
			row := apiKeyRow("key-1", "user-1", "My Key", "active")
			writeJSONResp(w, http.StatusOK, []map[string]interface{}{row})
		}
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	key, alreadyActive, err := client.ActivateAPIKey(context.Background(), "key-1", "user-1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if alreadyActive {
		t.Error("expected alreadyActive=false for revoked key")
	}
	if key == nil {
		t.Fatal("expected non-nil key after activate")
	}
	if patchedBody["status"] != "active" {
		t.Errorf("patched status = %v, want active", patchedBody["status"])
	}
}

func TestActivateAPIKey_AlreadyActive_ReturnsAlreadyActive(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			writeJSONResp(w, http.StatusOK, []map[string]interface{}{
				apiKeyRow("key-1", "user-1", "My Key", "active"),
			})
		} else {
			t.Errorf("unexpected %s request (already active, no patch needed)", r.Method)
		}
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	_, alreadyActive, err := client.ActivateAPIKey(context.Background(), "key-1", "user-1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !alreadyActive {
		t.Error("expected alreadyActive=true")
	}
}

// ─── LookupAPIKeyByHash ──────────────────────────────────────────────────────

func TestLookupAPIKeyByHash_Found_ReturnsKey(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.Contains(r.URL.RawQuery, "key_hash=eq.testhash") {
			t.Errorf("missing key_hash filter, query=%q", r.URL.RawQuery)
		}
		if !strings.Contains(r.URL.RawQuery, "status=eq.active") {
			t.Errorf("missing status filter, query=%q", r.URL.RawQuery)
		}
		row := apiKeyRow("key-5", "user-1", "Lookup Key", "active")
		row["key_hash"] = "testhash"
		writeJSONResp(w, http.StatusOK, []map[string]interface{}{row})
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	key, err := client.LookupAPIKeyByHash(context.Background(), "testhash")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if key == nil {
		t.Fatal("expected non-nil key")
	}
	if key.ID != "key-5" {
		t.Errorf("key.ID = %q, want key-5", key.ID)
	}
}

// ─── UpdateAPIKeyLastUsed ────────────────────────────────────────────────────

func TestUpdateAPIKeyLastUsed_SendsPatch(t *testing.T) {
	var gotBody map[string]interface{}
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assertAuthHeaders(t, r)
		if r.Method != http.MethodPatch {
			t.Errorf("method = %q, want PATCH", r.Method)
		}
		if !strings.Contains(r.URL.RawQuery, "id=eq.key-7") {
			t.Errorf("missing key id filter, query=%q", r.URL.RawQuery)
		}
		data, _ := io.ReadAll(r.Body)
		json.Unmarshal(data, &gotBody)
		w.WriteHeader(http.StatusOK)
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	if err := client.UpdateAPIKeyLastUsed(context.Background(), "key-7"); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if gotBody["last_used_at"] == nil {
		t.Error("expected last_used_at to be set in patch body")
	}
}

// ─── RevokeAllAPIKeys ────────────────────────────────────────────────────────

func TestRevokeAllAPIKeys_BulkPatchesUserActiveKeys(t *testing.T) {
	var gotBody map[string]interface{}
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assertAuthHeaders(t, r)
		if r.Method != http.MethodPatch {
			t.Errorf("method = %q, want PATCH", r.Method)
		}
		if !strings.Contains(r.URL.RawQuery, "user_id=eq.user-1") {
			t.Errorf("missing user_id filter, query=%q", r.URL.RawQuery)
		}
		if !strings.Contains(r.URL.RawQuery, "status=eq.active") {
			t.Errorf("missing status=eq.active filter, query=%q", r.URL.RawQuery)
		}
		data, _ := io.ReadAll(r.Body)
		json.Unmarshal(data, &gotBody)
		w.WriteHeader(http.StatusOK)
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	if err := client.RevokeAllAPIKeys(context.Background(), "user-1"); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if gotBody["status"] != "revoked" {
		t.Errorf("status = %v, want revoked", gotBody["status"])
	}
	if gotBody["revoked_at"] == nil {
		t.Error("expected revoked_at to be set")
	}
}
