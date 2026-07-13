package source

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

// AuthRateLimiter provides per-IP rate limiting for auth endpoints and
// per-email+IP rate limiting for the magic-link endpoint.
type AuthRateLimiter struct {
	mu            sync.Mutex
	ipLimiters    map[string]*authLimiterEntry
	emailLimiters map[string]*authLimiterEntry
}

type authLimiterEntry struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

// NewAuthRateLimiter creates an AuthRateLimiter and starts background cleanup.
func NewAuthRateLimiter() *AuthRateLimiter {
	arl := &AuthRateLimiter{
		ipLimiters:    make(map[string]*authLimiterEntry),
		emailLimiters: make(map[string]*authLimiterEntry),
	}
	go arl.cleanup()
	return arl
}

// getIPLimiter returns the per-IP limiter for auth endpoints (5 req/min, burst 5).
func (arl *AuthRateLimiter) getIPLimiter(ip string) *rate.Limiter {
	arl.mu.Lock()
	defer arl.mu.Unlock()
	entry, ok := arl.ipLimiters[ip]
	if !ok {
		entry = &authLimiterEntry{
			limiter: rate.NewLimiter(rate.Every(12*time.Second), 5),
		}
		arl.ipLimiters[ip] = entry
	}
	entry.lastSeen = time.Now()
	return entry.limiter
}

// getMagicLinkLimiter returns the per-email+IP limiter (3 req/10min, burst 3).
func (arl *AuthRateLimiter) getMagicLinkLimiter(key string) *rate.Limiter {
	arl.mu.Lock()
	defer arl.mu.Unlock()
	entry, ok := arl.emailLimiters[key]
	if !ok {
		entry = &authLimiterEntry{
			// 3 requests per 10 minutes = 1 token every 200 seconds
			limiter: rate.NewLimiter(rate.Every(200*time.Second), 3),
		}
		arl.emailLimiters[key] = entry
	}
	entry.lastSeen = time.Now()
	return entry.limiter
}

// cleanup removes stale entries every 15 minutes.
func (arl *AuthRateLimiter) cleanup() {
	ticker := time.NewTicker(15 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		arl.mu.Lock()
		cutoff := time.Now().Add(-20 * time.Minute)
		for key, entry := range arl.ipLimiters {
			if entry.lastSeen.Before(cutoff) {
				delete(arl.ipLimiters, key)
			}
		}
		for key, entry := range arl.emailLimiters {
			if entry.lastSeen.Before(cutoff) {
				delete(arl.emailLimiters, key)
			}
		}
		arl.mu.Unlock()
	}
}

// Middleware returns an HTTP middleware enforcing per-IP auth rate limiting:
// 5 requests per minute per IP. Intended for /api/auth/login, /api/auth/register,
// /api/auth/forgot-password, and /api/auth/verify-reset-code.
func (arl *AuthRateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := clientIP(r)
		limiter := arl.getIPLimiter(ip)
		reservation := limiter.Reserve()
		delay := reservation.Delay()
		if delay > 0 {
			reservation.Cancel()
			retryAfter := int(delay.Seconds()) + 1
			w.Header().Set("Retry-After", strconv.Itoa(retryAfter))
			WriteError(w, http.StatusTooManyRequests, ErrRateLimitExceeded,
				fmt.Sprintf("auth rate limit exceeded, retry after %d seconds", retryAfter))
			return
		}
		next.ServeHTTP(w, r)
	})
}

// MagicLinkMiddleware returns an HTTP middleware enforcing per-email+IP rate
// limiting for /api/auth/magic-link: 3 requests per email+IP per 10 minutes.
// The request body is read to extract the email, then restored for downstream handlers.
func (arl *AuthRateLimiter) MagicLinkMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Limit body read to 1 MB before rate-limit decision to prevent memory DoS
		// on the unauthenticated magic-link endpoint.
		body, err := io.ReadAll(io.LimitReader(r.Body, 1<<20))
		if err != nil {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidRequest, "failed to read request body")
			return
		}
		r.Body = io.NopCloser(bytes.NewReader(body))

		var req MagicLinkRequest
		if jsonErr := json.Unmarshal(body, &req); jsonErr != nil || req.Email == "" {
			// Invalid or missing email — pass to handler for proper validation response.
			next.ServeHTTP(w, r)
			return
		}

		ip := clientIP(r)
		key := req.Email + ":" + ip
		limiter := arl.getMagicLinkLimiter(key)
		reservation := limiter.Reserve()
		delay := reservation.Delay()
		if delay > 0 {
			reservation.Cancel()
			retryAfter := int(delay.Seconds()) + 1
			w.Header().Set("Retry-After", strconv.Itoa(retryAfter))
			WriteError(w, http.StatusTooManyRequests, ErrRateLimitExceeded,
				fmt.Sprintf("magic link rate limit exceeded, retry after %d seconds", retryAfter))
			return
		}
		next.ServeHTTP(w, r)
	})
}
