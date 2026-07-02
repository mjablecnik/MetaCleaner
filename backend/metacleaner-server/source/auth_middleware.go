package source

import (
	"context"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"math/big"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"
)

// subjectPattern validates that the JWT sub claim is a well-formed UUID.
// The JWT signature is already verified, so this is defense-in-depth: it ensures
// a legitimately-signed token with a malformed sub can't inject into PostgREST
// user_id=eq. filters (e.g. via a weak SUPABASE_JWT_SECRET or future code paths).
var subjectPattern = regexp.MustCompile(`^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$`)

const (
	ErrAuthUnauthorized = "AUTH_UNAUTHORIZED"
	ErrAuthTokenExpired = "AUTH_TOKEN_EXPIRED"
	ErrAuthTokenInvalid = "AUTH_TOKEN_INVALID"
)

// contextKey is an unexported type for context keys in this package.
type contextKey int

const (
	userIDKey contextKey = iota
	keyIDKey
)

// UserIDFromContext returns the authenticated user ID stored in ctx by AuthMiddleware.
// Returns empty string if not set.
func UserIDFromContext(ctx context.Context) string {
	v, _ := ctx.Value(userIDKey).(string)
	return v
}

// ContextWithUserID returns a new context with the given userID set.
// Used in unit tests to simulate authenticated requests.
func ContextWithUserID(ctx context.Context, userID string) context.Context {
	return context.WithValue(ctx, userIDKey, userID)
}

// KeyIDFromContext returns the API key ID stored in ctx when the request was authenticated
// via an API key. Returns empty string if the request used JWT authentication.
func KeyIDFromContext(ctx context.Context) string {
	v, _ := ctx.Value(keyIDKey).(string)
	return v
}

// --- JWKS types ---

type jwksResponse struct {
	Keys []jwkKey `json:"keys"`
}

type jwkKey struct {
	KTY string `json:"kty"`
	CRV string `json:"crv"`
	X   string `json:"x"`
	Y   string `json:"y"`
	KID string `json:"kid"`
	Use string `json:"use"`
}

// --- Key cache ---

type keyCache struct {
	mu        sync.RWMutex
	keys      map[string]*ecdsa.PublicKey // kid -> public key
	fetchedAt time.Time
	jwksURL   string
	ttl       time.Duration
}

func newKeyCache(jwksURL string) *keyCache {
	return &keyCache{
		keys:    make(map[string]*ecdsa.PublicKey),
		jwksURL: jwksURL,
		ttl:     1 * time.Hour,
	}
}

func (kc *keyCache) getKey(kid string) (*ecdsa.PublicKey, error) {
	kc.mu.RLock()
	key, found := kc.keys[kid]
	expired := time.Since(kc.fetchedAt) > kc.ttl
	kc.mu.RUnlock()

	if found && !expired {
		return key, nil
	}

	// Refresh JWKS
	if err := kc.refresh(); err != nil {
		// If refresh fails but we have a cached key, use it
		if found {
			return key, nil
		}
		return nil, fmt.Errorf("failed to fetch JWKS: %w", err)
	}

	kc.mu.RLock()
	key, found = kc.keys[kid]
	kc.mu.RUnlock()

	if !found {
		return nil, fmt.Errorf("key with kid %q not found in JWKS", kid)
	}
	return key, nil
}

func (kc *keyCache) refresh() error {
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(kc.jwksURL)
	if err != nil {
		return fmt.Errorf("JWKS fetch: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("JWKS fetch returned %d: %s", resp.StatusCode, string(body))
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("JWKS read body: %w", err)
	}

	var jwks jwksResponse
	if err := json.Unmarshal(body, &jwks); err != nil {
		return fmt.Errorf("JWKS parse: %w", err)
	}

	newKeys := make(map[string]*ecdsa.PublicKey)
	for _, k := range jwks.Keys {
		if k.KTY != "EC" || k.CRV != "P-256" {
			continue
		}
		pubKey, err := parseECPublicKey(k)
		if err != nil {
			slog.Warn("auth-middleware: skipping JWKS key", "kid", k.KID, "error", err)
			continue
		}
		newKeys[k.KID] = pubKey
	}

	kc.mu.Lock()
	kc.keys = newKeys
	kc.fetchedAt = time.Now()
	kc.mu.Unlock()

	slog.Info("auth-middleware: JWKS refreshed", "keysLoaded", len(newKeys))
	return nil
}

func parseECPublicKey(k jwkKey) (*ecdsa.PublicKey, error) {
	xBytes, err := base64.RawURLEncoding.DecodeString(k.X)
	if err != nil {
		return nil, fmt.Errorf("decode x: %w", err)
	}
	yBytes, err := base64.RawURLEncoding.DecodeString(k.Y)
	if err != nil {
		return nil, fmt.Errorf("decode y: %w", err)
	}

	pubKey := &ecdsa.PublicKey{
		Curve: elliptic.P256(),
		X:     new(big.Int).SetBytes(xBytes),
		Y:     new(big.Int).SetBytes(yBytes),
	}

	if !pubKey.Curve.IsOnCurve(pubKey.X, pubKey.Y) {
		return nil, fmt.Errorf("point not on curve")
	}

	return pubKey, nil
}

// --- AuthMiddleware ---

// AuthMiddleware validates Bearer tokens on protected routes.
// Supports JWT (HS256/ES256) and API key tokens (mtd_key_ prefix).
type AuthMiddleware struct {
	cache     *keyCache
	jwtSecret []byte
	db        *SupabaseClient
	apiKeyRL  *APIKeyRateLimiter
}

// NewAuthMiddleware creates an AuthMiddleware.
// If cfg.SupabaseJWTSecret is set, HS256 tokens are validated using HMAC-SHA256.
// ES256 tokens are always validated via the Supabase JWKS endpoint.
// Pass db and apiKeyRL to enable API key authentication; both may be nil to disable it.
func NewAuthMiddleware(cfg Config, db *SupabaseClient, apiKeyRL *APIKeyRateLimiter) *AuthMiddleware {
	jwksURL := strings.TrimRight(cfg.SupabaseURL, "/") + "/auth/v1/.well-known/jwks.json"
	cache := newKeyCache(jwksURL)

	// Pre-fetch keys at startup (may fail in tests with no SupabaseURL — that's OK)
	if err := cache.refresh(); err != nil {
		slog.Warn("auth-middleware: initial JWKS fetch failed, will retry on first request", "error", err)
	}

	return &AuthMiddleware{
		cache:     cache,
		jwtSecret: []byte(cfg.SupabaseJWTSecret),
		db:        db,
		apiKeyRL:  apiKeyRL,
	}
}

// jwtHeader holds the JWT header fields we need.
type jwtHeader struct {
	Alg string `json:"alg"`
	KID string `json:"kid"`
	Typ string `json:"typ"`
}

// jwtClaims holds the standard JWT claims we care about.
type jwtClaims struct {
	Sub  string `json:"sub"`
	Exp  int64  `json:"exp"`
	Role string `json:"role"`
}

// Authenticate extracts and validates the Bearer JWT from r's Authorization header.
// Returns the user ID (sub claim) on success, or an error describing the failure.
func (m *AuthMiddleware) Authenticate(r *http.Request) (string, error) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		return "", &authError{code: ErrAuthUnauthorized, message: "missing or malformed Authorization header"}
	}
	token := strings.TrimPrefix(authHeader, "Bearer ")
	return m.validateJWT(token)
}

// validateJWT parses and verifies a JWT, returning the sub claim on success.
// Supports HS256 (when jwtSecret is set) and ES256 (via JWKS).
func (m *AuthMiddleware) validateJWT(token string) (string, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return "", &authError{code: ErrAuthTokenInvalid, message: "malformed token"}
	}

	// Parse header to get alg (and kid for ES256)
	headerBytes, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return "", &authError{code: ErrAuthTokenInvalid, message: "malformed token header"}
	}
	var header jwtHeader
	if err := json.Unmarshal(headerBytes, &header); err != nil {
		return "", &authError{code: ErrAuthTokenInvalid, message: "malformed token header"}
	}

	signingInput := parts[0] + "." + parts[1]
	sigBytes, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil {
		return "", &authError{code: ErrAuthTokenInvalid, message: "malformed token signature"}
	}

	switch header.Alg {
	case "HS256":
		if len(m.jwtSecret) == 0 {
			return "", &authError{code: ErrAuthTokenInvalid, message: "unsupported signing algorithm: HS256"}
		}
		mac := hmac.New(sha256.New, m.jwtSecret)
		mac.Write([]byte(signingInput))
		expected := mac.Sum(nil)
		if !hmac.Equal(expected, sigBytes) {
			return "", &authError{code: ErrAuthTokenInvalid, message: "invalid token signature"}
		}

	case "ES256":
		if header.KID == "" {
			return "", &authError{code: ErrAuthTokenInvalid, message: "token missing kid header"}
		}
		pubKey, err := m.cache.getKey(header.KID)
		if err != nil {
			slog.Warn("auth-middleware: JWKS key lookup failed", "kid", header.KID, "error", err)
			return "", &authError{code: ErrAuthTokenInvalid, message: "unable to verify token"}
		}
		hash := sha256.Sum256([]byte(signingInput))
		// ES256 signature is r || s, each 32 bytes
		if len(sigBytes) != 64 {
			return "", &authError{code: ErrAuthTokenInvalid, message: "invalid signature length"}
		}
		r := new(big.Int).SetBytes(sigBytes[:32])
		s := new(big.Int).SetBytes(sigBytes[32:])
		if !ecdsa.Verify(pubKey, hash[:], r, s) {
			return "", &authError{code: ErrAuthTokenInvalid, message: "invalid token signature"}
		}

	default:
		return "", &authError{code: ErrAuthTokenInvalid, message: "unsupported signing algorithm: " + header.Alg}
	}

	// Parse payload claims
	payloadBytes, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return "", &authError{code: ErrAuthTokenInvalid, message: "malformed token payload"}
	}
	var claims jwtClaims
	if err := json.Unmarshal(payloadBytes, &claims); err != nil {
		return "", &authError{code: ErrAuthTokenInvalid, message: "malformed token claims"}
	}

	// Require exp — tokens without an expiry would be accepted forever.
	if claims.Exp == 0 {
		return "", &authError{code: ErrAuthTokenInvalid, message: "token missing expiry claim"}
	}
	if time.Now().Unix() > claims.Exp {
		return "", &authError{code: ErrAuthTokenExpired, message: "token has expired"}
	}

	// Reject Supabase anon and service_role tokens. Previously these were incidentally
	// blocked by the empty-sub check, but an explicit role assertion is more robust.
	if claims.Role != "authenticated" {
		return "", &authError{code: ErrAuthUnauthorized, message: "insufficient role"}
	}

	if claims.Sub == "" {
		return "", &authError{code: ErrAuthTokenInvalid, message: "token missing subject claim"}
	}
	if !subjectPattern.MatchString(claims.Sub) {
		return "", &authError{code: ErrAuthTokenInvalid, message: "invalid subject claim"}
	}

	return claims.Sub, nil
}

// validateAPIKey validates an API key token by hashing it and looking it up in the DB.
// Returns userID and keyID on success, or an authError on failure.
// The key must exist and have status "active" — revoked keys are rejected.
func (m *AuthMiddleware) validateAPIKey(ctx context.Context, token string) (userID, keyID string, err error) {
	sum := sha256.Sum256([]byte(token))
	hash := hex.EncodeToString(sum[:])

	apiKey, dbErr := m.db.LookupAPIKeyByHash(ctx, hash)
	if dbErr != nil {
		slog.Warn("auth-middleware: api key lookup failed", "error", dbErr)
		return "", "", &authError{code: ErrAuthUnauthorized, message: "invalid API key"}
	}
	if apiKey == nil {
		slog.Warn("auth-middleware: api key not found by hash", "hashPrefix", hash[:8])
		return "", "", &authError{code: ErrAuthUnauthorized, message: "invalid or revoked API key"}
	}
	slog.Debug("auth-middleware: api key resolved", "userID", apiKey.UserID, "keyID", apiKey.ID)
	if apiKey.UserID == "" {
		slog.Error("auth-middleware: api key has empty user_id", "keyID", apiKey.ID)
		return "", "", &authError{code: ErrAuthUnauthorized, message: "API key has no associated user"}
	}
	return apiKey.UserID, apiKey.ID, nil
}

// Middleware returns an HTTP middleware that enforces authentication on non-exempt paths.
// Exempt paths: /api/auth/*, /api/health, /.well-known/*
// Tokens prefixed with "mtd_key_" are validated as API keys; all others as JWTs.
// On success, user ID (and key ID for API key requests) are stored in the request context.
func (m *AuthMiddleware) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if isExemptPath(r.URL.Path) {
			next.ServeHTTP(w, r)
			return
		}

		authHeader := r.Header.Get("Authorization")
		if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
			token := strings.TrimPrefix(authHeader, "Bearer ")
			if strings.HasPrefix(token, "mtd_key_") {
				// API key authentication — no JWT fallback
				if m.db == nil {
					WriteError(w, http.StatusUnauthorized, ErrAuthUnauthorized, "API key authentication not available")
					return
				}
				userID, keyID, authErr := m.validateAPIKey(r.Context(), token)
				if authErr != nil {
					if ae, ok := authErr.(*authError); ok {
						WriteError(w, http.StatusUnauthorized, ae.code, ae.message)
					} else {
						WriteError(w, http.StatusUnauthorized, ErrAuthUnauthorized, "unauthorized")
					}
					return
				}

				// Per-key rate limiting (applied after auth, only for API key requests)
				if m.apiKeyRL != nil {
					if allowed, retryAfter := m.apiKeyRL.Allow(keyID); !allowed {
						w.Header().Set("Retry-After", strconv.Itoa(retryAfter))
						WriteError(w, http.StatusTooManyRequests, ErrRateLimitExceeded,
							fmt.Sprintf("API key rate limit exceeded, retry after %d seconds", retryAfter))
						return
					}
				}

				// Endpoint access control — API keys can only access whitelisted paths
				if !isAllowedForAPIKey(r.URL.Path) {
					WriteError(w, http.StatusForbidden, ErrAPIKeyForbidden,
						"this endpoint is not available for API key authentication")
					return
				}

				// Update last_used_at asynchronously — failure is non-fatal
				go func() {
					if updateErr := m.db.UpdateAPIKeyLastUsed(context.Background(), keyID); updateErr != nil {
						slog.Warn("auth-middleware: failed to update api key last_used_at", "keyID", keyID, "error", updateErr)
					}
				}()

				ctx := context.WithValue(r.Context(), userIDKey, userID)
				ctx = context.WithValue(ctx, keyIDKey, keyID)
				next.ServeHTTP(w, r.WithContext(ctx))
				return
			}
		}

		// JWT authentication path (existing behavior)
		userID, err := m.Authenticate(r)
		if err != nil {
			if ae, ok := err.(*authError); ok {
				WriteError(w, http.StatusUnauthorized, ae.code, ae.message)
			} else {
				WriteError(w, http.StatusUnauthorized, ErrAuthUnauthorized, "unauthorized")
			}
			return
		}

		ctx := context.WithValue(r.Context(), userIDKey, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// isExemptPath returns true for paths that do not require authentication.
func isExemptPath(path string) bool {
	// These /api/auth/ paths require authentication despite the /api/auth/ prefix.
	switch path {
	case "/api/auth/me",
		"/api/auth/profile",
		"/api/auth/change-email",
		"/api/auth/change-password",
		"/api/auth/account":
		return false
	}
	// WebSocket progress endpoint handles its own auth via ?token= query param
	// (browsers cannot send custom headers on WebSocket upgrade requests).
	if strings.HasSuffix(path, "/progress") && strings.HasPrefix(path, "/api/jobs/") {
		return true
	}
	return strings.HasPrefix(path, "/api/auth/") ||
		strings.HasPrefix(path, "/api/public/") ||
		path == "/api/health" ||
		path == "/api/billing/webhook" ||
		strings.HasPrefix(path, "/.well-known/")
}

// --- API Key endpoint access control ---

// apiKeyAllowedPrefixes defines which URL path prefixes are accessible via API key authentication.
// All other endpoints require JWT (app session) authentication.
var apiKeyAllowedPrefixes = []string{
	"/api/upload",
	"/api/jobs",
	"/api/files/",
	"/api/reports",
	"/api/health",
	"/api/public/",
}

// isAllowedForAPIKey checks whether the given path is accessible for API key authenticated requests.
func isAllowedForAPIKey(path string) bool {
	for _, prefix := range apiKeyAllowedPrefixes {
		if path == prefix || strings.HasPrefix(path, prefix) {
			return true
		}
	}
	return false
}

// authError carries an error code and human-readable message for auth failures.
type authError struct {
	code    string
	message string
}

func (e *authError) Error() string {
	return e.code + ": " + e.message
}
