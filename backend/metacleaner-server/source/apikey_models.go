package source

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"time"
)

// APIKey is the stored API key record. KeyHash is excluded from JSON responses.
type APIKey struct {
	ID         string     `json:"id"`
	UserID     string     `json:"user_id"`
	Name       string     `json:"name"`
	KeyHash    string     `json:"-"`
	KeyPrefix  string     `json:"key_prefix"`
	KeySuffix  string     `json:"key_suffix"`
	Status     string     `json:"status"`
	Note       string     `json:"note,omitempty"`
	CreatedAt  time.Time  `json:"created_at"`
	LastUsedAt *time.Time `json:"last_used_at,omitempty"`
	RevokedAt  *time.Time `json:"revoked_at,omitempty"`
}

// CreateAPIKeyRequest is the request body for POST /api/keys.
type CreateAPIKeyRequest struct {
	Name string `json:"name"`
	Note string `json:"note,omitempty"`
}

// CreateAPIKeyResponse is returned once on key creation; Key is the full plaintext key.
type CreateAPIKeyResponse struct {
	Key    string `json:"key"`
	APIKey APIKey `json:"api_key"`
}

// generateAPIKey generates a new API key and returns its components.
// plaintext: full key string (mtd_key_ + 64 hex chars, total 72 chars)
// hash:      SHA-256 of plaintext (hex-encoded)
// prefix:    first 8 chars of plaintext ("mtd_key_")
// suffix:    last 4 chars of plaintext
func generateAPIKey() (plaintext, hash, prefix, suffix string, err error) {
	raw := make([]byte, 32)
	if _, err = rand.Read(raw); err != nil {
		return "", "", "", "", fmt.Errorf("generate random bytes: %w", err)
	}

	plaintext = "mtd_key_" + hex.EncodeToString(raw)

	sum := sha256.Sum256([]byte(plaintext))
	hash = hex.EncodeToString(sum[:])

	prefix = plaintext[:8]
	suffix = plaintext[len(plaintext)-4:]

	return plaintext, hash, prefix, suffix, nil
}
