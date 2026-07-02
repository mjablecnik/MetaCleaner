package source

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"time"
)

// dbAPIKey is the PostgREST representation of an api_keys row.
type dbAPIKey struct {
	ID         string     `json:"id,omitempty"`
	UserID     string     `json:"user_id,omitempty"`
	Name       string     `json:"name,omitempty"`
	KeyHash    string     `json:"key_hash,omitempty"`
	KeyPrefix  string     `json:"key_prefix,omitempty"`
	KeySuffix  string     `json:"key_suffix,omitempty"`
	Status     string     `json:"status,omitempty"`
	Note       string     `json:"note,omitempty"`
	CreatedAt  *time.Time `json:"created_at,omitempty"`
	LastUsedAt *time.Time `json:"last_used_at,omitempty"`
	RevokedAt  *time.Time `json:"revoked_at,omitempty"`
}

func dbAPIKeyToAPIKey(r dbAPIKey) APIKey {
	key := APIKey{
		ID:         r.ID,
		UserID:     r.UserID,
		Name:       r.Name,
		KeyPrefix:  r.KeyPrefix,
		KeySuffix:  r.KeySuffix,
		Status:     r.Status,
		Note:       r.Note,
		LastUsedAt: r.LastUsedAt,
		RevokedAt:  r.RevokedAt,
	}
	if r.CreatedAt != nil {
		key.CreatedAt = *r.CreatedAt
	}
	return key
}

// CreateAPIKey inserts a new API key record and returns the stored record with its generated ID.
func (c *SupabaseClient) CreateAPIKey(ctx context.Context, userID, name, keyHash, keyPrefix, keySuffix, note string) (*APIKey, error) {
	rec := dbAPIKey{
		UserID:    userID,
		Name:      name,
		KeyHash:   keyHash,
		KeyPrefix: keyPrefix,
		KeySuffix: keySuffix,
		Status:    "active",
		Note:      note,
	}
	var rows []dbAPIKey
	if err := c.doJSON(ctx, http.MethodPost, c.restURL("api_keys"), rec, &rows); err != nil {
		return nil, fmt.Errorf("create api key: %w", err)
	}
	if len(rows) == 0 {
		return nil, fmt.Errorf("create api key: no row returned")
	}
	result := dbAPIKeyToAPIKey(rows[0])
	return &result, nil
}

// ListAPIKeys returns all API keys for the given user, ordered by created_at DESC.
func (c *SupabaseClient) ListAPIKeys(ctx context.Context, userID string) ([]APIKey, error) {
	var rows []dbAPIKey
	restURL := c.restURL("api_keys?user_id=eq." + url.QueryEscape(userID) + "&order=created_at.desc")
	if err := c.doJSON(ctx, http.MethodGet, restURL, nil, &rows); err != nil {
		return nil, fmt.Errorf("list api keys: %w", err)
	}
	keys := make([]APIKey, len(rows))
	for i, r := range rows {
		keys[i] = dbAPIKeyToAPIKey(r)
	}
	return keys, nil
}

// DeleteAPIKey permanently removes an API key that belongs to the given user.
// Returns false if the key was not found or belongs to a different user.
func (c *SupabaseClient) DeleteAPIKey(ctx context.Context, keyID, userID string) (bool, error) {
	// Fetch first to confirm ownership.
	var rows []dbAPIKey
	restURL := c.restURL("api_keys?id=eq." + url.QueryEscape(keyID) + "&user_id=eq." + url.QueryEscape(userID) + "&limit=1")
	if err := c.doJSON(ctx, http.MethodGet, restURL, nil, &rows); err != nil {
		return false, fmt.Errorf("delete api key lookup: %w", err)
	}
	if len(rows) == 0 {
		return false, nil
	}

	deleteURL := c.restURL("api_keys?id=eq." + url.QueryEscape(keyID) + "&user_id=eq." + url.QueryEscape(userID))
	if err := c.doJSON(ctx, http.MethodDelete, deleteURL, nil, nil); err != nil {
		return false, fmt.Errorf("delete api key: %w", err)
	}
	return true, nil
}

// RevokeAPIKey sets the status of an active key to 'revoked'.
// Returns the updated record, or nil if not found / wrong user.
// Returns errAlreadyRevoked sentinel if key is already revoked.
func (c *SupabaseClient) RevokeAPIKey(ctx context.Context, keyID, userID string) (*APIKey, bool, error) {
	// Fetch the key to validate ownership and current status.
	var rows []dbAPIKey
	restURL := c.restURL("api_keys?id=eq." + url.QueryEscape(keyID) + "&user_id=eq." + url.QueryEscape(userID) + "&limit=1")
	if err := c.doJSON(ctx, http.MethodGet, restURL, nil, &rows); err != nil {
		return nil, false, fmt.Errorf("revoke api key lookup: %w", err)
	}
	if len(rows) == 0 {
		return nil, false, nil
	}

	existing := rows[0]
	if existing.Status == "revoked" {
		result := dbAPIKeyToAPIKey(existing)
		return &result, true, nil // true = already revoked
	}

	now := time.Now().UTC()
	patch := map[string]interface{}{
		"status":     "revoked",
		"revoked_at": now,
	}
	patchURL := c.restURL("api_keys?id=eq." + url.QueryEscape(keyID) + "&user_id=eq." + url.QueryEscape(userID))
	var updated []dbAPIKey
	if err := c.doJSON(ctx, http.MethodPatch, patchURL, patch, &updated); err != nil {
		return nil, false, fmt.Errorf("revoke api key patch: %w", err)
	}

	if len(updated) == 0 {
		return nil, false, fmt.Errorf("revoke api key: no row returned after patch")
	}
	result := dbAPIKeyToAPIKey(updated[0])
	return &result, false, nil
}

// ActivateAPIKey sets the status of a revoked key back to 'active'.
// Returns the updated record, or nil if not found / wrong user.
// Returns alreadyActive=true if key is already active.
func (c *SupabaseClient) ActivateAPIKey(ctx context.Context, keyID, userID string) (*APIKey, bool, error) {
	// Fetch the key to validate ownership and current status.
	var rows []dbAPIKey
	restURL := c.restURL("api_keys?id=eq." + url.QueryEscape(keyID) + "&user_id=eq." + url.QueryEscape(userID) + "&limit=1")
	if err := c.doJSON(ctx, http.MethodGet, restURL, nil, &rows); err != nil {
		return nil, false, fmt.Errorf("activate api key lookup: %w", err)
	}
	if len(rows) == 0 {
		return nil, false, nil
	}

	existing := rows[0]
	if existing.Status == "active" {
		result := dbAPIKeyToAPIKey(existing)
		return &result, true, nil // true = already active
	}

	patch := map[string]interface{}{
		"status":     "active",
		"revoked_at": nil,
	}
	patchURL := c.restURL("api_keys?id=eq." + url.QueryEscape(keyID) + "&user_id=eq." + url.QueryEscape(userID))
	var updated []dbAPIKey
	if err := c.doJSON(ctx, http.MethodPatch, patchURL, patch, &updated); err != nil {
		return nil, false, fmt.Errorf("activate api key patch: %w", err)
	}

	if len(updated) == 0 {
		return nil, false, fmt.Errorf("activate api key: no row returned after patch")
	}
	result := dbAPIKeyToAPIKey(updated[0])
	return &result, false, nil
}

// LookupAPIKeyByHash finds an active API key by its SHA-256 hash.
// Returns nil if no active key matches.
func (c *SupabaseClient) LookupAPIKeyByHash(ctx context.Context, hash string) (*APIKey, error) {
	url := c.restURL("api_keys?key_hash=eq." + hash + "&status=eq.active&limit=1")

	// Retry up to 2 additional times on empty result to handle Supabase cold start
	// where PostgREST may return empty before the DB connection is fully warm.
	var rows []dbAPIKey
	for attempt := 0; attempt < 3; attempt++ {
		rows = nil
		if err := c.doJSON(ctx, http.MethodGet, url, nil, &rows); err != nil {
			return nil, fmt.Errorf("lookup api key by hash: %w", err)
		}
		if len(rows) > 0 {
			break
		}
		if attempt < 2 {
			time.Sleep(200 * time.Millisecond)
		}
	}

	if len(rows) == 0 {
		return nil, nil
	}
	result := dbAPIKeyToAPIKey(rows[0])
	// Preserve KeyHash for internal use (not serialized to JSON).
	result.KeyHash = rows[0].KeyHash
	return &result, nil
}

// UpdateAPIKeyLastUsed sets last_used_at to now for the given key ID.
func (c *SupabaseClient) UpdateAPIKeyLastUsed(ctx context.Context, keyID string) error {
	patch := map[string]interface{}{
		"last_used_at": time.Now().UTC(),
	}
	url := c.restURL("api_keys?id=eq." + keyID)
	return c.doJSON(ctx, http.MethodPatch, url, patch, nil)
}

// RevokeAllAPIKeys revokes all active API keys for a user.
// Used during account deactivation/deletion.
func (c *SupabaseClient) RevokeAllAPIKeys(ctx context.Context, userID string) error {
	now := time.Now().UTC()
	patch := map[string]interface{}{
		"status":     "revoked",
		"revoked_at": now,
	}
	restURL := c.restURL("api_keys?user_id=eq." + url.QueryEscape(userID) + "&status=eq.active")
	return c.doJSON(ctx, http.MethodPatch, restURL, patch, nil)
}
