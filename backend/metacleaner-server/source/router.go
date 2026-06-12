package source

import (
	"net/http"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

// corsMiddleware adds CORS headers and handles OPTIONS preflight requests.
func corsMiddleware(origin string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if origin != "" {
				w.Header().Set("Access-Control-Allow-Origin", origin)
			} else {
				w.Header().Set("Access-Control-Allow-Origin", "*")
			}
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
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
			ip := r.RemoteAddr
			// Strip port if present (IPv4).
			if idx := len(ip) - 1; idx >= 0 {
				for i := len(ip) - 1; i >= 0; i-- {
					if ip[i] == ':' {
						ip = ip[:i]
						break
					}
				}
			}
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

// jsonMiddleware sets Content-Type: application/json for all non-WebSocket responses.
func jsonMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Skip WebSocket upgrade requests and file downloads.
		if r.Header.Get("Upgrade") == "websocket" {
			next.ServeHTTP(w, r)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// NewRouter builds and returns the HTTP mux with all routes registered.
func NewRouter(cfg Config, db *SupabaseClient, hub *WebSocketHub, pl *CleaningPipeline, authClient *SupabaseAuthClient) http.Handler {
	mux := http.NewServeMux()

	rl := newIPRateLimiter(cfg.RateLimitRPM)
	rateLimited := rateLimitMiddleware(rl)

	authRL := NewAuthRateLimiter()
	authRateLimited := authRL.Middleware

	// POST /api/auth/register — rate limited
	mux.Handle("POST /api/auth/register", authRateLimited(HandleRegister(authClient)))

	// POST /api/auth/login — rate limited
	mux.Handle("POST /api/auth/login", authRateLimited(HandleLogin(authClient)))

	// POST /api/upload — rate limited
	mux.Handle("POST /api/upload", rateLimited(HandleUpload(cfg)))

	// POST /api/jobs
	mux.Handle("POST /api/jobs", HandleCreateJob(cfg, db, hub, pl))

	// GET /api/jobs/{id}
	mux.Handle("GET /api/jobs/{id}", HandleGetJob(db))

	// GET /api/jobs/{id}/progress — WebSocket
	mux.Handle("GET /api/jobs/{id}/progress", HandleJobProgress(hub))

	// GET /api/jobs/{id}/download
	mux.Handle("GET /api/jobs/{id}/download", HandleJobDownload(cfg, db))

	// GET /api/files/{id}/download
	mux.Handle("GET /api/files/{id}/download", HandleFileDownload(cfg))

	// GET /api/reports
	mux.Handle("GET /api/reports", HandleListReports(db))

	// GET /api/reports/{id}
	mux.Handle("GET /api/reports/{id}", HandleGetReport(db))

	// GET /api/reports/{id}/pdf
	mux.Handle("GET /api/reports/{id}/pdf", HandleGetReportPDF(db))

	// GET /api/health
	mux.Handle("GET /api/health", HandleHealth(cfg, db))

	cors := corsMiddleware(cfg.FrontendOrigin)
	return cors(mux)
}
