package source

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"strings"
	"time"
)

const (
	ErrAuthUnauthorized = "AUTH_UNAUTHORIZED"
	ErrAuthTokenExpired = "AUTH_TOKEN_EXPIRED"
	ErrAuthTokenInvalid = "AUTH_TOKEN_INVALID"
)

// contextKey is an unexported type for context keys in this package.
type contextKey int

const userIDKey contextKey = iota

// UserIDFromContext returns the authenticated user ID stored in ctx by AuthMiddleware.
// Returns empty string if not set.
func UserIDFromContext(ctx context.Context) string {
	v, _ := ctx.Value(userIDKey).(string)
	return v
}

// AuthMiddleware validates JWT Bearer tokens on protected routes.
type AuthMiddleware struct {
	jwtSecret []byte
}

// NewAuthMiddleware creates an AuthMiddleware from the given config.
func NewAuthMiddleware(cfg Config) *AuthMiddleware {
	return &AuthMiddleware{
		jwtSecret: []byte(cfg.SupabaseJWTSecret),
	}
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

// validateJWT parses and verifies a HS256 JWT, returning the sub claim on success.
func (m *AuthMiddleware) validateJWT(token string) (string, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return "", &authError{code: ErrAuthTokenInvalid, message: "malformed token"}
	}

	// Verify signature: HMAC-SHA256 over "header.payload"
	signingInput := parts[0] + "." + parts[1]
	mac := hmac.New(sha256.New, m.jwtSecret)
	mac.Write([]byte(signingInput))
	expectedSig := base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
	if !hmac.Equal([]byte(expectedSig), []byte(parts[2])) {
		return "", &authError{code: ErrAuthTokenInvalid, message: "invalid token signature"}
	}

	// Decode and parse payload claims
	payloadBytes, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return "", &authError{code: ErrAuthTokenInvalid, message: "malformed token payload"}
	}
	var claims jwtClaims
	if err := json.Unmarshal(payloadBytes, &claims); err != nil {
		return "", &authError{code: ErrAuthTokenInvalid, message: "malformed token claims"}
	}

	// Check expiry
	if claims.Exp > 0 && time.Now().Unix() > claims.Exp {
		return "", &authError{code: ErrAuthTokenExpired, message: "token has expired"}
	}

	if claims.Sub == "" {
		return "", &authError{code: ErrAuthTokenInvalid, message: "token missing subject claim"}
	}

	return claims.Sub, nil
}

// Middleware returns an HTTP middleware that enforces authentication on non-exempt paths.
// Exempt paths: /api/auth/*, /api/health, /.well-known/*
// On success, the user ID is stored in the request context via UserIDFromContext.
func (m *AuthMiddleware) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if isExemptPath(r.URL.Path) {
			next.ServeHTTP(w, r)
			return
		}

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
	return strings.HasPrefix(path, "/api/auth/") ||
		path == "/api/health" ||
		strings.HasPrefix(path, "/.well-known/")
}

// authError carries an error code and human-readable message for auth failures.
type authError struct {
	code    string
	message string
}

func (e *authError) Error() string {
	return e.code + ": " + e.message
}
