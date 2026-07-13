package source

import (
	"log/slog"
	"net"
	"net/http"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

// responseRecorder wraps http.ResponseWriter to capture the status code.
type responseRecorder struct {
	http.ResponseWriter
	statusCode int
}

func (rr *responseRecorder) WriteHeader(code int) {
	rr.statusCode = code
	rr.ResponseWriter.WriteHeader(code)
}

// requestLoggingMiddleware logs every incoming HTTP request with method, path,
// status code, duration, and client IP. Skips noisy health checks.
func requestLoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Skip health check logs to avoid noise.
		if r.URL.Path == "/api/health" {
			next.ServeHTTP(w, r)
			return
		}

		start := time.Now()
		rec := &responseRecorder{ResponseWriter: w, statusCode: http.StatusOK}
		next.ServeHTTP(rec, r)
		duration := time.Since(start)

		level := slog.LevelInfo
		if rec.statusCode >= 500 {
			level = slog.LevelError
		} else if rec.statusCode >= 400 {
			level = slog.LevelWarn
		}

		slog.Log(r.Context(), level, "request",
			"method", r.Method,
			"path", r.URL.Path,
			"status", rec.statusCode,
			"duration", duration.Round(time.Millisecond).String(),
			"ip", clientIP(r),
		)
	})
}

// clientIP extracts the real client IP from the request.
// Prefers the Fly-Client-IP header (trusted at the Fly.io edge) over
// r.RemoteAddr so per-IP rate limiting works correctly behind the proxy.
// Uses net.SplitHostPort to handle IPv6 addresses correctly.
func clientIP(r *http.Request) string {
	if ip := r.Header.Get("Fly-Client-IP"); ip != "" {
		return ip
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

// corsMiddleware adds CORS headers and handles OPTIONS preflight requests.
func corsMiddleware(origin string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if origin == "" {
				next.ServeHTTP(w, r)
				return
			}
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
			w.Header().Set("Access-Control-Allow-Credentials", "true")

			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

// ipRateLimiter manages per-IP token bucket limiters.
type ipRateLimiter struct {
	mu       sync.Mutex
	limiters map[string]*rateLimiterEntry
	rpm      int
}

type rateLimiterEntry struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

func newIPRateLimiter(rpm int) *ipRateLimiter {
	rl := &ipRateLimiter{
		limiters: make(map[string]*rateLimiterEntry),
		rpm:      rpm,
	}
	go rl.cleanup()
	return rl
}

// get returns the rate limiter for the given IP, creating one if needed.
func (rl *ipRateLimiter) get(ip string) *rate.Limiter {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	entry, ok := rl.limiters[ip]
	if !ok {
		r := rate.Every(time.Minute / time.Duration(rl.rpm))
		entry = &rateLimiterEntry{
			limiter: rate.NewLimiter(r, rl.rpm),
		}
		rl.limiters[ip] = entry
	}
	entry.lastSeen = time.Now()
	return entry.limiter
}

// cleanup removes stale limiter entries every 5 minutes.
func (rl *ipRateLimiter) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		rl.mu.Lock()
		cutoff := time.Now().Add(-10 * time.Minute)
		for ip, entry := range rl.limiters {
			if entry.lastSeen.Before(cutoff) {
				delete(rl.limiters, ip)
			}
		}
		rl.mu.Unlock()
	}
}

// rateLimitMiddleware rejects requests from IPs that exceed the configured RPM.
func rateLimitMiddleware(rl *ipRateLimiter) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := clientIP(r)
			limiter := rl.get(ip)
			if !limiter.Allow() {
				w.Header().Set("Retry-After", "60")
				WriteError(w, http.StatusTooManyRequests, ErrRateLimitExceeded, "Rate limit exceeded")
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

// securityHeadersMiddleware adds defensive HTTP security headers to every response.
func securityHeadersMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		w.Header().Set("X-XSS-Protection", "0")
		// Restrict all resource loading for any HTML/redirect responses this
		// API might return (error pages, OAuth redirects). Has no effect on
		// JSON responses but prevents any future HTML from loading external
		// resources without explicit policy changes.
		w.Header().Set("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'")
		next.ServeHTTP(w, r)
	})
}
