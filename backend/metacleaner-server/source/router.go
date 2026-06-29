package source

import (
	"net/http"
)

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

	// Email change verification store (tokens stored in Supabase DB).
	emailChangeStore := newEmailChangeStore(cfg.SupabaseURL, cfg.SupabaseServiceRoleKey, cfg.SupabaseTimeout)

	// --- Auth routes ---
	mux.Handle("POST /api/auth/register", authRateLimited(HandleRegister(authClient, db)))
	mux.Handle("POST /api/auth/login", authRateLimited(HandleLogin(authClient)))
	mux.Handle("POST /api/auth/logout", HandleLogout(authClient))
	mux.Handle("POST /api/auth/refresh", HandleRefresh(authClient))
	mux.Handle("GET /api/auth/me", HandleMe(authClient, db))
	mux.Handle("PATCH /api/auth/profile", HandleUpdateProfile(authClient))
	mux.Handle("POST /api/auth/change-email", HandleChangeEmail(cfg, authClient, emailChangeStore))
	mux.Handle("POST /api/auth/change-password", HandleChangePassword(authClient))
	mux.Handle("DELETE /api/auth/account", HandleDeleteAccount(cfg, authClient, db))
	mux.Handle("POST /api/auth/forgot-password", authRateLimited(HandleForgotPassword(authClient)))
	mux.Handle("POST /api/auth/verify-reset-code", authRateLimited(HandleVerifyResetCode(authClient)))
	mux.Handle("POST /api/auth/reset-password", HandleResetPassword(authClient))
	mux.Handle("GET /api/auth/oauth/callback", HandleOAuthCallback(authClient, db))
	mux.Handle("GET /api/auth/oauth/{provider}", HandleOAuthInitiate(authClient))
	mux.Handle("POST /api/auth/magic-link", authRL.MagicLinkMiddleware(HandleMagicLink(authClient)))
	mux.Handle("GET /api/auth/magic-link/callback", HandleMagicLinkCallback(authClient, db))

	// --- File & Job routes ---
	mux.Handle("POST /api/upload", rateLimited(HandleUpload(cfg)))
	mux.Handle("POST /api/jobs", HandleCreateJob(cfg, db, hub, pl, pool, authClient))
	mux.Handle("GET /api/jobs/{id}", HandleGetJob(db))
	mux.Handle("GET /api/jobs/{id}/progress", HandleJobProgress(hub, authMW, cfg.FrontendOrigin))
	mux.Handle("GET /api/jobs/{id}/download", rateLimited(HandleJobDownload(cfg, db)))
	mux.Handle("GET /api/files/{id}/download", rateLimited(HandleFileDownload(cfg, db)))

	// --- Report routes ---
	mux.Handle("GET /api/reports", HandleListReports(db))
	mux.Handle("GET /api/reports/{id}", HandleGetReport(db))
	mux.Handle("GET /api/reports/{id}/pdf", HandleGetReportPDF(db))
	mux.Handle("GET /api/public/reports/{id}", HandleGetPublicReport(db))
	mux.Handle("GET /api/public/reports/{id}/pdf", HandleGetPublicReportPDF(db))
	mux.Handle("GET /api/auth/confirm-email-change", HandleConfirmEmailChange(cfg, authClient, emailChangeStore))

	// --- Billing routes ---
	mux.Handle("POST /api/billing/checkout", rateLimited(HandleCreateCheckout(cfg, db, authClient)))
	mux.Handle("POST /api/billing/webhook", HandleStripeWebhook(cfg, db))
	mux.Handle("GET /api/billing/subscription", HandleGetSubscription(db))
	mux.Handle("GET /api/billing/credits", HandleGetCredits(db))
	mux.Handle("POST /api/billing/change-plan", rateLimited(HandleChangePlan(cfg, db)))
	mux.Handle("POST /api/billing/cancel", rateLimited(HandleCancelSubscription(cfg, db)))
	mux.Handle("POST /api/billing/reactivate", rateLimited(HandleReactivateSubscription(cfg, db)))

	// --- API Key routes ---
	mux.Handle("POST /api/keys", HandleCreateAPIKey(db))
	mux.Handle("GET /api/keys", HandleListAPIKeys(db))
	mux.Handle("DELETE /api/keys/{id}", HandleDeleteAPIKey(db))
	mux.Handle("PATCH /api/keys/{id}/revoke", HandleRevokeAPIKey(db))
	mux.Handle("PATCH /api/keys/{id}/activate", HandleActivateAPIKey(db))

	// --- Other routes ---
	mux.Handle("GET /api/account", rateLimited(HandleAccount(cfg, db)))
	mux.Handle("GET /api/health", HandleHealth(cfg, db))
	mux.Handle("GET /.well-known/assetlinks.json", HandleAssetLinks(cfg))
	mux.Handle("GET /.well-known/apple-app-site-association", HandleAppleAppSiteAssociation(cfg))

	// Wrap with middleware chain
	cors := corsMiddleware(cfg.FrontendOrigin)
	return securityHeadersMiddleware(RequestIDMiddleware(cors(authMW.Middleware(mux))))
}
