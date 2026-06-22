package source

import (
	"net/http"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

// corsMiddleware adds CORS headers and handles OPTIONS preflight requests.
// If origin is empty (FRONTEND_ORIGIN not configured), cross-origin requests are denied
// by omitting all CORS headers — browsers will block them by default.
func corsMiddleware(origin string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if origin == "" {
				next.ServeHTTP(w, r)
				return
			}
			w.Header().Set("Access-Control-Allow-Origin", origin)
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

// securityHeadersMiddleware adds defensive HTTP security headers to every response.
func securityHeadersMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		w.Header().Set("X-XSS-Protection", "0")
		next.ServeHTTP(w, r)
	})
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

	apiKeyRL := NewAPIKeyRateLimiter(120)
	authMW := NewAuthMiddleware(cfg, db, apiKeyRL)

	// Job worker pool — limits concurrent pipeline executions.
	pool := NewJobWorkerPool(cfg.MaxConcurrentJobs)

	// POST /api/auth/register — rate limited
	mux.Handle("POST /api/auth/register", authRateLimited(HandleRegister(authClient)))

	// POST /api/auth/login — rate limited
	mux.Handle("POST /api/auth/login", authRateLimited(HandleLogin(authClient)))

	// POST /api/auth/logout
	mux.Handle("POST /api/auth/logout", HandleLogout(authClient))

	// POST /api/auth/refresh
	mux.Handle("POST /api/auth/refresh", HandleRefresh(authClient))

	// GET /api/auth/me
	mux.Handle("GET /api/auth/me", HandleMe(authClient))

	// POST /api/auth/forgot-password — rate limited
	mux.Handle("POST /api/auth/forgot-password", authRateLimited(HandleForgotPassword(authClient)))

	// POST /api/auth/verify-reset-code — rate limited
	mux.Handle("POST /api/auth/verify-reset-code", authRateLimited(HandleVerifyResetCode(authClient)))

	// POST /api/auth/reset-password
	mux.Handle("POST /api/auth/reset-password", HandleResetPassword(authClient))

	// GET /api/auth/oauth/callback — must be registered before the {provider} wildcard
	mux.Handle("GET /api/auth/oauth/callback", HandleOAuthCallback(authClient))

	// GET /api/auth/oauth/{provider} — initiates the OAuth flow
	mux.Handle("GET /api/auth/oauth/{provider}", HandleOAuthInitiate(authClient))

	// POST /api/auth/magic-link — rate limited per email+IP
	mux.Handle("POST /api/auth/magic-link", authRL.MagicLinkMiddleware(HandleMagicLink(authClient)))

	// GET /api/auth/magic-link/callback — receives token_hash from Supabase magic link email
	mux.Handle("GET /api/auth/magic-link/callback", HandleMagicLinkCallback(authClient))

	// POST /api/upload — rate limited
	mux.Handle("POST /api/upload", rateLimited(HandleUpload(cfg)))

	// POST /api/jobs
	mux.Handle("POST /api/jobs", HandleCreateJob(cfg, db, hub, pl, pool))

	// GET /api/jobs/{id}
	mux.Handle("GET /api/jobs/{id}", HandleGetJob(db))

	// GET /api/jobs/{id}/progress — WebSocket
	mux.Handle("GET /api/jobs/{id}/progress", HandleJobProgress(hub, authMW, cfg.FrontendOrigin))

	// GET /api/jobs/{id}/download
	mux.Handle("GET /api/jobs/{id}/download", rateLimited(HandleJobDownload(cfg, db)))

	// GET /api/files/{id}/download
	mux.Handle("GET /api/files/{id}/download", rateLimited(HandleFileDownload(cfg, db)))

	// GET /api/reports
	mux.Handle("GET /api/reports", HandleListReports(db))

	// GET /api/reports/{id}
	mux.Handle("GET /api/reports/{id}", HandleGetReport(db))

	// GET /api/reports/{id}/pdf
	mux.Handle("GET /api/reports/{id}/pdf", HandleGetReportPDF(db))

	// GET /api/public/reports/{id} — public report access (no auth, for QR code verification)
	mux.Handle("GET /api/public/reports/{id}", HandleGetPublicReport(db))

	// GET /api/public/reports/{id}/pdf — public PDF download (no auth, QR code target)
	mux.Handle("GET /api/public/reports/{id}/pdf", HandleGetPublicReportPDF(db))

	// POST /api/billing/checkout — authenticated, rate-limited
	mux.Handle("POST /api/billing/checkout", rateLimited(HandleCreateCheckout(cfg, db, authClient)))

	// POST /api/billing/webhook — no auth middleware, signature-verified by Stripe
	mux.Handle("POST /api/billing/webhook", HandleStripeWebhook(cfg, db))

	// GET /api/billing/subscription — authenticated
	mux.Handle("GET /api/billing/subscription", HandleGetSubscription(db))

	// GET /api/billing/credits — authenticated
	mux.Handle("GET /api/billing/credits", HandleGetCredits(db))

	// POST /api/keys — create a new API key (authenticated)
	mux.Handle("POST /api/keys", HandleCreateAPIKey(db))

	// GET /api/keys — list API keys for authenticated user
	mux.Handle("GET /api/keys", HandleListAPIKeys(db))

	// DELETE /api/keys/{id} — permanently delete an API key
	mux.Handle("DELETE /api/keys/{id}", HandleDeleteAPIKey(db))

	// PATCH /api/keys/{id}/revoke — revoke an active API key
	mux.Handle("PATCH /api/keys/{id}/revoke", HandleRevokeAPIKey(db))

	// GET /api/health
	mux.Handle("GET /api/health", HandleHealth(cfg, db))

	// GET /.well-known/assetlinks.json — Android App Links domain verification (no auth)
	mux.Handle("GET /.well-known/assetlinks.json", HandleAssetLinks(cfg))

	// GET /.well-known/apple-app-site-association — iOS Universal Links (no auth)
	mux.Handle("GET /.well-known/apple-app-site-association", HandleAppleAppSiteAssociation(cfg))

	cors := corsMiddleware(cfg.FrontendOrigin)
	return securityHeadersMiddleware(RequestIDMiddleware(cors(authMW.Middleware(mux))))
}
