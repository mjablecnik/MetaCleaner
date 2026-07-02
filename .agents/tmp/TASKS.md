# Security Remediation Tasks — MetaCleaner Go Backend

Derived from `SECURITY_AUDIT.md`. Sorted by severity (critical first). Each task is independently fixable.

- [x] 1. [CRITICAL] Validate `reportID` (regex `^MCR-\d{4}-\d{4}-[0-9A-F]{32}$`) and `url.QueryEscape` it in the sink to stop PostgREST filter injection on the unauthenticated public report endpoints — source/report_handlers.go:266-319, source/supabase.go:700-728
- [x] 2. [HIGH] Validate `jobID` as UUIDv4 and escape it before building PostgREST URLs to stop cross-user job/file IDOR via injection — source/job_handlers.go:235,340, source/websocket.go:189, source/supabase.go:314-319,529-531
- [x] 3. [HIGH] Validate/escape `reportID` on the authenticated report endpoints to stop report IDOR via injection — source/report_handlers.go:214-234,322-352
- [x] 4. [HIGH] Wrap the processing pipeline in `context.WithTimeout` so hanging ExifTool/FFmpeg runs can't permanently exhaust the worker pool — source/job_handlers.go:120, source/pipeline.go
- [x] 5. [HIGH] Stop putting `access_token`/`refresh_token` in redirect URL query strings; use the URL fragment or a one-time exchange code / HttpOnly+Secure cookie — source/auth_handlers.go:527-537,692-696
- [x] 6. [HIGH] Set `APP_ENV=production` in deploy config so prod uses JSON@Info logging instead of Debug (which logs userID/keyID) — fly.toml, Dockerfile, source/logger.go:17-27
- [x] 7. [HIGH] Add `conn.SetReadLimit(512)` and a read deadline/ping-pong to the WebSocket connection to prevent memory-DoS from oversized frames — source/websocket.go:167-172,205-222
- [x] 8. [HIGH] Cap concurrent WebSocket connections per job/user and rate-limit the `/progress` upgrade path — source/websocket.go:74-90, source/router.go:48
- [x] 9. [HIGH] Add `http.MaxBytesReader` to every JSON handler and replace the unbounded magic-link `io.ReadAll` with `io.LimitReader` — source/auth_handlers.go:25,107,194,303,339,386,434, source/account_handlers.go:25,65, source/billing_handlers.go:59,350, source/email_change.go:226, source/apikey_handlers.go:21, source/auth_rate_limiter.go:117
- [x] 10. [HIGH] Validate uploaded file content by magic bytes/content-type (not extension alone) before handing it to ExifTool/FFmpeg — source/upload_handlers.go:99-108
- [x] 11. [MEDIUM] Validate API-key `id` as UUID and escape it in the delete/revoke/activate queries — source/apikey_handlers.go:99,131,169, source/supabase_apikeys.go:84,92,105,124,143,161
- [x] 12. [MEDIUM] Validate email-change `token` (`^[0-9a-f]{64}$`) and escape it so injection can't bypass the `expires_at` freshness filter — source/email_change.go:283,87,116
- [x] 13. [MEDIUM] Bind uploaded files to the uploader (record user_id at upload) and verify ownership in job creation — source/job_handlers.go:49-80, source/upload_handlers.go
- [x] 14. [MEDIUM] Add `Secure: true` to the PKCE verifier cookie — source/auth_handlers.go:606-613
- [x] 15. [MEDIUM] Add a non-root `USER` to the Dockerfile so the media-processing server doesn't run as root — Dockerfile
- [x] 16. [MEDIUM] Apply the auth rate limiter to `reset-password` and `refresh` (and a general limiter to change-password/email, account delete, and API-key CRUD) — source/router.go:30,34,35,38,71-75
- [x] 17. [MEDIUM] Key the rate limiter on `Fly-Client-IP` with an IPv6-aware host parse instead of raw `r.RemoteAddr` — source/middleware.go:91-100, source/auth_rate_limiter.go:96,131
- [x] 18. [MEDIUM] Bump `golang.org/x/net` (currently v0.23.0) and other `golang.org/x/*` deps to patched versions — go.mod, go.sum
- [x] 19. [MEDIUM] Fail startup in production when `FRONTEND_ORIGIN` is unset so CORS/WS origin protection can't silently disable — source/config.go, source/middleware.go:12-31, source/websocket.go:170
- [x] 20. [LOW] Add an explicit `if userID == ""` guard in the authenticated report handlers (defense in depth) — source/report_handlers.go:214-234,321-352
- [x] 21. [LOW] Make the file-download ownership check unconditional (remove the `if userID != ""` wrapper) — source/job_handlers.go:193-200
- [x] 22. [LOW] Reject zero-byte uploads (call `ValidateFileSize`) before processing — source/upload_handlers.go, source/models.go
- [x] 23. [LOW] Update or drop the archived `github.com/pkg/errors v0.8.1` dependency — go.mod:16
- [x] 24. [LOW] Set `ReadHeaderTimeout` and an explicit `MaxHeaderBytes` on the HTTP server — source/main.go:88-94
- [x] 25. [LOW] Add a restrictive Content-Security-Policy header for HTML/redirect responses — source/middleware.go:113-121
</content>
