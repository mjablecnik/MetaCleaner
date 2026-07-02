package source

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strings"
)

// HandleCreateAPIKey handles POST /api/keys.
// Validates the request, generates a new API key, stores it, and returns the plaintext key once.
func HandleCreateAPIKey(db *SupabaseClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := UserIDFromContext(r.Context())
		if userID == "" {
			WriteError(w, http.StatusUnauthorized, ErrAuthUnauthorized, "authentication required")
			return
		}

		r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
		var req CreateAPIKeyRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			WriteError(w, http.StatusBadRequest, ErrValidationError, "invalid request body")
			return
		}

		name := strings.TrimSpace(req.Name)
		if name == "" {
			WriteError(w, http.StatusBadRequest, ErrValidationError, "key name is required")
			return
		}
		if len(name) > 100 {
			WriteError(w, http.StatusBadRequest, ErrValidationError, "key name must not exceed 100 characters")
			return
		}

		note := strings.TrimSpace(req.Note)
		if len(note) > 500 {
			WriteError(w, http.StatusBadRequest, ErrValidationError, "note must not exceed 500 characters")
			return
		}

		plaintext, hash, prefix, suffix, err := generateAPIKey()
		if err != nil {
			slog.Error("apikeys: failed to generate key", "userID", userID, "error", err)
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "failed to generate API key")
			return
		}

		apiKey, err := db.CreateAPIKey(r.Context(), userID, name, hash, prefix, suffix, note)
		if err != nil {
			slog.Error("apikeys: failed to store key", "userID", userID, "error", err)
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "failed to store API key")
			return
		}

		slog.Info("apikeys: key created", "userID", userID, "keyID", apiKey.ID)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(CreateAPIKeyResponse{
			Key:    plaintext,
			APIKey: *apiKey,
		})
	}
}

// HandleListAPIKeys handles GET /api/keys.
// Returns all API keys for the authenticated user ordered by created_at DESC.
func HandleListAPIKeys(db *SupabaseClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := UserIDFromContext(r.Context())
		if userID == "" {
			WriteError(w, http.StatusUnauthorized, ErrAuthUnauthorized, "authentication required")
			return
		}

		keys, err := db.ListAPIKeys(r.Context(), userID)
		if err != nil {
			slog.Error("apikeys: failed to list keys", "userID", userID, "error", err)
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "failed to retrieve API keys")
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(keys)
	}
}

// HandleDeleteAPIKey handles DELETE /api/keys/{id}.
// Permanently removes the API key if it belongs to the authenticated user.
func HandleDeleteAPIKey(db *SupabaseClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := UserIDFromContext(r.Context())
		if userID == "" {
			WriteError(w, http.StatusUnauthorized, ErrAuthUnauthorized, "authentication required")
			return
		}

		keyID := r.PathValue("id")
		if keyID == "" {
			WriteError(w, http.StatusBadRequest, ErrValidationError, "key ID is required")
			return
		}
		if !uuidV4Pattern.MatchString(keyID) {
			WriteError(w, http.StatusBadRequest, ErrValidationError, "invalid key ID format")
			return
		}

		found, err := db.DeleteAPIKey(r.Context(), keyID, userID)
		if err != nil {
			slog.Error("apikeys: failed to delete key", "userID", userID, "keyID", keyID, "error", err)
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "failed to delete API key")
			return
		}
		if !found {
			WriteError(w, http.StatusNotFound, ErrAPIKeyNotFound, "API key not found")
			return
		}

		slog.Info("apikeys: key deleted", "userID", userID, "keyID", keyID)
		w.WriteHeader(http.StatusNoContent)
	}
}

// HandleRevokeAPIKey handles PATCH /api/keys/{id}/revoke.
// Sets the key status to 'revoked' and records the revocation timestamp.
func HandleRevokeAPIKey(db *SupabaseClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := UserIDFromContext(r.Context())
		if userID == "" {
			WriteError(w, http.StatusUnauthorized, ErrAuthUnauthorized, "authentication required")
			return
		}

		keyID := r.PathValue("id")
		if keyID == "" {
			WriteError(w, http.StatusBadRequest, ErrValidationError, "key ID is required")
			return
		}
		if !uuidV4Pattern.MatchString(keyID) {
			WriteError(w, http.StatusBadRequest, ErrValidationError, "invalid key ID format")
			return
		}

		apiKey, alreadyRevoked, err := db.RevokeAPIKey(r.Context(), keyID, userID)
		if err != nil {
			slog.Error("apikeys: failed to revoke key", "userID", userID, "keyID", keyID, "error", err)
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "failed to revoke API key")
			return
		}
		if apiKey == nil {
			WriteError(w, http.StatusNotFound, ErrAPIKeyNotFound, "API key not found")
			return
		}
		if alreadyRevoked {
			WriteError(w, http.StatusConflict, ErrAPIKeyAlreadyRevoked, "API key is already revoked")
			return
		}

		slog.Info("apikeys: key revoked", "userID", userID, "keyID", keyID)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(apiKey)
	}
}

// HandleActivateAPIKey handles PATCH /api/keys/{id}/activate.
// Sets a revoked key status back to 'active' and clears the revocation timestamp.
func HandleActivateAPIKey(db *SupabaseClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := UserIDFromContext(r.Context())
		if userID == "" {
			WriteError(w, http.StatusUnauthorized, ErrAuthUnauthorized, "authentication required")
			return
		}

		keyID := r.PathValue("id")
		if keyID == "" {
			WriteError(w, http.StatusBadRequest, ErrValidationError, "key ID is required")
			return
		}
		if !uuidV4Pattern.MatchString(keyID) {
			WriteError(w, http.StatusBadRequest, ErrValidationError, "invalid key ID format")
			return
		}

		apiKey, alreadyActive, err := db.ActivateAPIKey(r.Context(), keyID, userID)
		if err != nil {
			slog.Error("apikeys: failed to activate key", "userID", userID, "keyID", keyID, "error", err)
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "failed to activate API key")
			return
		}
		if apiKey == nil {
			WriteError(w, http.StatusNotFound, ErrAPIKeyNotFound, "API key not found")
			return
		}
		if alreadyActive {
			WriteError(w, http.StatusConflict, ErrAPIKeyAlreadyActive, "API key is already active")
			return
		}

		slog.Info("apikeys: key activated", "userID", userID, "keyID", keyID)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(apiKey)
	}
}
