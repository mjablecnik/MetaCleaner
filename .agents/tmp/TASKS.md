# Security Remediation Tasks — MetaCleaner Go Backend (re-audit 2026-07-02)

Derived from `SECURITY_AUDIT.md`. Sorted by severity (highest first). Each task is a single, independently fixable issue.

> The prior audit's 25 tasks are all remediated and verified in place; this list covers only the residual and newly-found issues.

- [x] 1. [HIGH] Move `context.WithTimeout(5m)` creation inside the pool's submitted closure so the pipeline runs under a live (not immediately-canceled) context — restores the worker-pool DoS bound and stops jobs failing on arrival — source/job_handlers.go:126-134, source/job_worker.go:76-116
- [x] 2. [HIGH] Add a per-connection write mutex (or `*wsConn` wrapper) and route Broadcast, the ping goroutine, and the close-message through it to stop the concurrent-write panic that crashes the whole process — source/websocket.go:173,238,253
- [x] 3. [MEDIUM] Add `.env-*` (and keep `!.env.example`) to `.gitignore` and `.dockerignore` so the deploy script's `.env-prod` secrets file can't be committed — backend/metacleaner-server/.gitignore, .dockerignore
- [x] 4. [MEDIUM] Apply `authRateLimited` to change-password/change-email/account-delete and `rateLimited` to the `/api/keys` CRUD routes (change-password is an unthrottled password oracle) — source/router.go:33,34,35,71-75
- [x] 5. [MEDIUM] Bump `go` directive to a patched 1.25.x (≥1.25.11) and update the Dockerfile builder to `golang:1.25-bookworm` (digest-pinned); add `govulncheck` to CI — resolves 21 reachable stdlib CVEs — go.mod:3, Dockerfile:2
- [x] 6. [MEDIUM] Validate JWT `sub` as a UUID in validateJWT and `url.QueryEscape` every `user_id=eq.`+userID interpolation to close the last PostgREST-injection gap — source/auth_middleware.go:318, source/supabase.go:560,745, source/supabase_auth.go:432,466,495,544,568, source/supabase_billing.go:62,85,109,223,245,389, source/supabase_apikeys.go:69,222, source/email_change.go:49
- [x] 7. [LOW] Require a present, non-zero `exp` claim in validateJWT so tokens without an expiry are rejected — source/auth_middleware.go:314
- [x] 8. [LOW] Explicitly require `claims.Role == "authenticated"` (and optionally validate `aud`/`iss`) instead of relying on the anon/service key's missing `sub` — source/auth_middleware.go:226-322
- [x] 9. [LOW] Make `GetJob`'s `user_id` filter unconditional and add `userID == ""` guards in HandleGetJob/HandleJobDownload — source/supabase.go:315-320, source/job_handlers.go:254,358
- [x] 10. [LOW] Replace the WebSocket `?token=` access-JWT with a short-lived single-use progress ticket (or Sec-WebSocket-Protocol) to keep the bearer token out of proxy logs — source/websocket.go:192
- [x] 11. [LOW] Log the JWKS lookup error server-side and return a generic "unable to verify token" so the Supabase project host isn't disclosed — source/auth_middleware.go:286
- [x] 12. [LOW] Stop logging the new email address (PII) at Info; drop `newEmail` or log only its domain — source/email_change.go:275
- [x] 13. [LOW] Store email-change tokens as `sha256` hashes and hash the presented token before the lookup — source/email_change.go:62-66,93
- [x] 14. [LOW] Return only `{status}` from unauthenticated `/api/health`, cache the tool checks, and rate-limit the route — source/health_handlers.go:25-58, source/router.go:79
- [x] 15. [LOW] Cap `firstName`/`lastName` (≤100 runes) and `email` (≤254) length in HandleRegister, mirroring HandleUpdateProfile — source/auth_handlers.go:31-57
- [x] 16. [LOW] Add `url.QueryEscape` to the two resource-ID sinks missed by the escape pass — source/supabase.go:546,560
- [x] 17. [LOW] Add a global/per-user WebSocket connection cap and rate-limit the `/progress` upgrade path — source/websocket.go:87-92, source/router.go:48
- [x] 18. [LOW] Track upstream `gopdf` for a release that drops the archived `github.com/pkg/errors` transitive dependency — go.mod (no code change required; pinned to latest available release — monitor https://github.com/signintech/gopdf for an update)
</content>
