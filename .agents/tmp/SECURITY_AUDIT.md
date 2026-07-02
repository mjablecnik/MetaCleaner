# Security Audit — MetaCleaner Go Backend (`backend/metacleaner-server/`)

**Date:** 2026-07-02
**Scope:** `backend/metacleaner-server/` — Go 1.23 HTTP server (net/http `ServeMux`), Supabase (PostgREST/Storage/Auth) via REST with the service-role key, Stripe billing, Brevo email, ExifTool/FFmpeg subprocess pipeline.
**Method:** Route map (`router.go`) → per-handler data-flow tracing → DB sink review, across injection, authN/authZ, data exposure, cryptography, dependencies, input validation, and configuration/deployment. The core injection class was empirically verified with a Go test showing `r.PathValue("id")` returns URL-decoded input that is concatenated verbatim onto the PostgREST query string.

---

## Executive Summary

**Overall risk: HIGH** (a single CRITICAL, unauthenticated, network-exploitable data-exfiltration path).

The dominant issue is **PostgREST filter injection**: user-controlled path/query IDs (`reportID`, `jobID`, API-key `id`, email-change `token`) are concatenated **raw and unvalidated** into Supabase REST query URLs that run with the **service-role key** (Row-Level Security bypassed). File IDs are correctly guarded by a regex (`localIDPattern`), but the other identifiers are only empty-checked. An injected `&` becomes a new PostgREST query parameter, letting an attacker append `or=`, `select=`, `limit=`, `order=` clauses to defeat the intended single-row equality lookup and the `user_id` ownership filter. The public (no-auth) report endpoint makes this exploitable by anyone.

Command injection, path traversal, SSRF, raw-SQL, template and LDAP injection were investigated and found **not exploitable** (subprocess args are discrete argv from server-generated, regex-validated IDs; all outbound base URLs are constants). Cryptography is sound (`crypto/rand` throughout, correct JWT verification with no `alg=none`/HS-RS confusion, Stripe webhook HMAC verified). Passwords are fully delegated to Supabase. Most resource handlers correctly scope by `userID`.

Secondary themes: a detached processing pipeline with **no timeout** (worker-pool exhaustion DoS), session **tokens placed in redirect URL query strings**, **production defaulting to Debug logging**, and several **DoS-hardening gaps** (WebSocket read/connection limits, missing request-body caps, upload validated by extension only).

| Severity | Count |
|---|---|
| CRITICAL | 1 |
| HIGH | 8 |
| MEDIUM | 9 |
| LOW | 6 |

---

## CRITICAL

### C-1. PostgREST filter injection on the public (unauthenticated) report endpoints — arbitrary report exfiltration
- **Category:** Injection (NoSQL / PostgREST API injection) → broken access control / data exposure
- **Severity:** CRITICAL
- **Files:** `source/report_handlers.go:266-286` (`HandleGetPublicReport`), `source/report_handlers.go:291-319` (`HandleGetPublicReportPDF`); sink `source/supabase.go:700-706` (`GetReportByHumanID`) and `source/supabase.go:723-728` (`GetReportMetaByHumanID`).
- **Description:** `reportID := r.PathValue("id")` is only checked for emptiness, then flows into:
  ```go
  url := c.restURL("cleaning_reports?report_id=eq." + humanID) // humanID unescaped, unvalidated
  if userID != "" { url += "&user_id=eq." + userID }           // "" on the public path — no scoping at all
  ```
  `restURL` (`supabase.go:242`) does no encoding: `return c.baseURL + "/rest/v1/" + path`. These routes are in `isExemptPath` (`auth_middleware.go:443`, prefix `/api/public/`), so no token is required, and the query runs with the **service-role key** (RLS bypassed).
- **Proof of concept:**
  ```
  GET /api/public/reports/eq.null%26or=(report_id.not.is.null)&order=date.desc
  ```
  The decoded `id` is `eq.null&or=(report_id.not.is.null)`, so the wire query becomes
  `cleaning_reports?report_id=eq.eq.null&or=(report_id.not.is.null)&order=date.desc` — the injected `or=` clause overrides the equality match and returns arbitrary rows. `HandleGetPublicReportPDF` then hands back a signed URL to the full (unredacted) PDF of any report.
- **Recommended fix (defense in depth — do both):**
  1. Validate at the handler before the DB call (mirror the existing `localIDPattern` approach):
     ```go
     var reportIDPattern = regexp.MustCompile(`^MCR-\d{4}-\d{4}-[0-9A-F]{32}$`)
     if !reportIDPattern.MatchString(reportID) {
         WriteError(w, http.StatusBadRequest, ErrInvalidRequest, "Invalid report ID")
         return
     }
     ```
  2. Encode at the sink so no value can break out of its `col=eq.<value>` token:
     ```go
     url := c.restURL("cleaning_reports?report_id=eq." + url.QueryEscape(humanID))
     if userID != "" { url += "&user_id=eq." + url.QueryEscape(userID) }
     ```

---

## HIGH

### H-1. PostgREST filter injection via unvalidated `jobID` — cross-user job/file IDOR
- **Category:** Injection (PostgREST) → IDOR
- **Severity:** HIGH
- **Files:** `source/job_handlers.go:235-237` (`HandleJobDownload`), `source/job_handlers.go:340-342` (`HandleGetJob`), `source/websocket.go:189` (`HandleJobProgress`); sinks `source/supabase.go:314-319` (`GetJob`) and `source/supabase.go:529-531` (`GetFileRecords` — **no** user filter at all).
- **Description:** `jobID := r.PathValue("id")` is empty-checked only, then concatenated into `"cleaning_jobs?id=eq." + jobID + "&user_id=eq." + userID`. An injected `or=` defeats the trailing ownership filter; `GetFileRecords` has no `user_id` filter, so broadening it exposes other users' file records and cleaned-file names.
- **Proof of concept:** `GET /api/jobs/eq.null%26or=(status.eq.completed)` → returns completed jobs regardless of owner.
- **Fix:** validate `jobID` as UUIDv4 at the handler and `url.QueryEscape` at the sink (see C-1).

### H-2. PostgREST filter injection via unvalidated `reportID` on authenticated report endpoints — report IDOR
- **Category:** Injection (PostgREST) → IDOR
- **Severity:** HIGH
- **Files:** `source/report_handlers.go:214-234` (`HandleGetReport`), `source/report_handlers.go:322-352` (`HandleGetReportPDF`); same sinks as C-1.
- **Description:** identical mechanism to C-1 but on the authenticated routes; injecting `or=` defeats the `&user_id=eq.<uuid>` scope and returns another user's full report detail (raw GPS coordinates, camera serials, XMP creator) or a signed URL to their PDF.
- **Proof of concept:** `GET /api/reports/eq.null%26or=(id.not.is.null)&order=date.desc`.
- **Fix:** as C-1 (reportID regex + `url.QueryEscape`).

### H-3. Unbounded subprocess pipeline — no processing timeout (worker-pool exhaustion DoS)
- **Category:** Configuration / DoS (resource exhaustion)
- **Severity:** HIGH
- **Files:** `source/job_handlers.go:120` (`ctx := context.Background()`), through `source/job_worker.go` → `source/pipeline.go` → `source/pipeline_ffmpeg.go:58,92` / `source/pipeline_exiftool.go:200,245`.
- **Description:** the job goroutine builds `context.Background()` with **no deadline** and threads it into every `exec.CommandContext(ctx, "ffmpeg"/"ffprobe"/"exiftool", ...)`. There is no `context.WithTimeout`/`WithDeadline` anywhere in the pipeline (verified). A crafted/pathological media file that makes a tool hang or run very long occupies a worker slot forever. With `MaxConcurrentJobs=3` (default), three such files permanently exhaust the pool; all other jobs queue indefinitely. The HTTP `WriteTimeout` does not help because processing is detached from the request.
- **Fix:** wrap each file/job in a bounded context:
  ```go
  ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
  defer cancel()
  ```

### H-4. Session access & refresh tokens placed in redirect URL query strings
- **Category:** Data exposure
- **Severity:** HIGH
- **Files:** `source/auth_handlers.go:527-537` (magic-link callback), `source/auth_handlers.go:~692-696` (OAuth callback).
- **Description:** the callbacks set `access_token` and `refresh_token` as URL **query** parameters and 302-redirect the browser:
  ```go
  params.Set("access_token", session.AccessToken)
  params.Set("refresh_token", session.RefreshToken)
  http.Redirect(w, r, frontendLogin+"?"+params.Encode(), http.StatusFound)
  ```
  Tokens in the query land in browser history, `Referer` headers to any third-party resources on the landing page, and any intermediary/proxy/CDN access logs. The refresh token is long-lived.
- **Fix:** deliver via the URL **fragment** (`#`, not sent to servers/Referer) or a one-time exchange code redeemed over POST, or set an HttpOnly+Secure cookie server-side.

### H-5. Production defaults to Debug/text logging (`APP_ENV` unset in deploy config)
- **Category:** Configuration / data exposure
- **Severity:** HIGH
- **Files:** `source/logger.go:17-27`; `fly.toml`, `Dockerfile` (verified: `APP_ENV` set in neither).
- **Description:** `InitLogger` selects JSON@Info only when `APP_ENV == "production"`, else **text handler at Debug level**. Because `APP_ENV` is not set in `fly.toml [env]` or the `Dockerfile`, the deployed container runs at Debug. Debug lines then execute in prod, e.g. `auth_middleware.go:341` logs resolved `userID`/`keyID` on every API-key request, plus broad Debug verbosity to Fly logs.
- **Fix:** set `APP_ENV=production` in `fly.toml [env]` (and/or fail-closed to Info level when the value is unrecognized).

### H-6. WebSocket connection has no read-size limit or read deadline (memory DoS)
- **Category:** Input validation / WebSocket DoS
- **Severity:** HIGH
- **Files:** `source/websocket.go:167-172` (upgrader), `source/websocket.go:205-222` (read loop).
- **Description:** the upgrader sets only `CheckOrigin`; the connection never calls `SetReadLimit` or `SetReadDeadline` (verified — neither appears anywhere in `source/`). gorilla/websocket defaults to **no** read-size cap, so an authenticated client can send one arbitrarily large frame and `ReadMessage` buffers it fully into memory. Half-open connections also linger with no idle deadline.
- **Fix:** the progress endpoint expects no client payload — `conn.SetReadLimit(512)`, set a read deadline, and use ping/pong keepalive.

### H-7. No cap on WebSocket connections per job/user (goroutine/FD/memory DoS)
- **Category:** WebSocket DoS / unbounded resource use
- **Severity:** HIGH
- **Files:** `source/websocket.go:74-90` (`Register`), route `source/router.go:48` (no `rateLimited` wrapper), exempt from IP limiter via `auth_middleware.go:439`.
- **Description:** `Register` appends to `h.conns[jobID]` with no per-job/per-user limit, and the `/progress` upgrade path is exempt from the IP rate limiter, so a user who owns a job can open unbounded connections. Combined with H-6 this multiplies memory pressure.
- **Fix:** cap concurrent connections per job/user and apply a connection-establishment rate limit on the upgrade path.

### H-8. Missing request-body size limits on JSON endpoints (incl. unauthenticated `io.ReadAll`)
- **Category:** Input validation / DoS
- **Severity:** HIGH
- **Files:** `source/auth_handlers.go:25,107,194,303,339,386,434`; `source/account_handlers.go:25,65`; `source/billing_handlers.go:59,350`; `source/email_change.go:226`; `source/apikey_handlers.go:21`; and `source/auth_rate_limiter.go:117` (`io.ReadAll` in `MagicLinkMiddleware`).
- **Description:** only `job_handlers.go:35` and `upload_handlers.go:66` wrap the body in `http.MaxBytesReader`. Every other JSON handler decodes an **unbounded** body, including unauthenticated `/api/auth/register|login|refresh|forgot-password|magic-link`. The magic-link rate-limit middleware does `io.ReadAll(r.Body)` with no limit — the whole body is buffered into memory *before* rate limiting applies, a direct unauthenticated memory-DoS amplifier.
- **Fix:** wrap every handler body in `http.MaxBytesReader` (e.g. 1 MB); replace the magic-link `io.ReadAll` with `io.LimitReader` (as `billing_webhook.go:45` already does).

### H-9. Upload content validated by extension only — no magic-byte / content-type check
- **Category:** Input validation / file upload
- **Severity:** HIGH
- **Files:** `source/upload_handlers.go:99-108` (`ValidateFileFormat` on `filepath.Ext(fh.Filename)`); consumed at `pipeline.go` via `SelectTool(f.FileExtension)`.
- **Description:** acceptance is based purely on the client-supplied filename extension; the multipart `Content-Type` is ignored and no content sniffing is done. Arbitrary bytes can be uploaded as `.jpg` and are later fed to ExifTool/FFmpeg (which have their own CVE history). This is the entry point for the H-3 media-bomb/hang scenario. (Path traversal is *not* possible — the on-disk name is a server-generated `f-<hex>` ID, not the user filename.)
- **Fix:** sniff magic bytes (`http.DetectContentType` / a format allow-list) and cross-check against the extension before accepting; keep processing behind the H-3 timeout.

---

## MEDIUM

### M-1. PostgREST filter injection via unvalidated API-key `id`
- **Category:** Injection (PostgREST)
- **Severity:** MEDIUM (queries retain `&user_id=eq.<uuid>`, but an injected `or=` can broaden the match on DELETE/PATCH)
- **Files:** `source/apikey_handlers.go:99,131,169`; sinks `source/supabase_apikeys.go:84,92,105,124,143,161`.
- **Description:** `keyID := r.PathValue("id")` (empty-check only) is concatenated into `"api_keys?id=eq." + keyID + "&user_id=eq." + userID` for delete/revoke/activate. PostgREST honors all filters on mutating requests, so a broadening clause can affect rows beyond the caller.
- **Fix:** validate `keyID` as UUID + `url.QueryEscape` at the sink.

### M-2. PostgREST filter injection via unvalidated email-change `token`
- **Category:** Injection (PostgREST)
- **Severity:** MEDIUM (unauthenticated; can defeat the `expires_at=gt.now()` freshness gate)
- **Files:** `source/email_change.go:283` (`HandleConfirmEmailChange`); sink `source/email_change.go:87` (`Verify`) and delete at `source/email_change.go:116`.
- **Description:** `token := r.URL.Query().Get("token")` (empty-check only) flows into `"...?token=eq." + token + "&expires_at=gt.now()&select=user_id,new_email"`. An injected `or=` can bypass expiry and, combined with a broadening clause, match a pending token — the subsequent `AdminUpdateUser` then applies the email change.
- **Fix:** validate `token` against `^[0-9a-f]{64}$` + `url.QueryEscape`.

### M-3. Job creation does not verify the uploader owns the referenced files (IDOR)
- **Category:** Authorization (broken object-level authorization)
- **Severity:** MEDIUM (file IDs are 128-bit random, so exploitation needs a leaked ID)
- **File:** `source/job_handlers.go:49-80` (`HandleCreateJob`).
- **Description:** the loop validates only that `fileID` matches `localIDPattern` and that `<uploads>/<fileID>_original.*` exists on disk; it never checks who uploaded it. `HandleUpload` records no `user_id` at upload time, so no ownership binding exists. If user A learns user B's freshly-uploaded file ID, A can process it under A's account.
- **Fix:** record the uploader's `user_id` at upload time (persist an upload record) and verify it in `HandleCreateJob`.

### M-4. PKCE verifier cookie missing the `Secure` flag
- **Category:** Cryptography / configuration
- **Severity:** MEDIUM
- **File:** `source/auth_handlers.go:606-613`.
- **Description:** the `mc_pkce_verifier` cookie is `HttpOnly` + `SameSite=Lax` but not `Secure`, so it can be sent over plaintext HTTP, weakening PKCE's protection against auth-code interception.
- **Fix:** add `Secure: true` to the cookie.

### M-5. Docker container runs as root
- **Category:** Deployment
- **Severity:** MEDIUM
- **File:** `Dockerfile` (no `USER` directive — verified).
- **Description:** the server (which shells out to `exiftool`/`ffmpeg` on user-uploaded files) runs as root, enlarging the blast radius of any RCE/container escape.
- **Fix:** add a non-root user and `USER appuser` before `ENTRYPOINT`.

### M-6. Rate-limiting gaps on sensitive auth and key endpoints
- **Category:** Configuration / DoS / credential attack surface
- **Severity:** MEDIUM
- **File:** `source/router.go` — `authRateLimited` wraps only `register`, `login`, `forgot-password`, `verify-reset-code`.
- **Description:** unthrottled: `POST /api/auth/reset-password` (:38), `POST /api/auth/refresh` (:30), `change-password`/`change-email`/`DELETE account` (:34,33,35), and API-key CRUD `POST/DELETE/PATCH /api/keys` (:71-75). Reset-password and refresh being unthrottled are the notable brute-force/grinding surfaces.
- **Fix:** apply the auth rate limiter to reset-password and refresh (and a general limiter to the rest).

### M-7. Rate limiter keys on `r.RemoteAddr`, ignoring the Fly proxy (and mis-splits IPv6)
- **Category:** Configuration
- **Severity:** MEDIUM
- **Files:** `source/middleware.go:91-100`, `source/auth_rate_limiter.go:96,131`.
- **Description:** the client IP is taken from `r.RemoteAddr` and never from `Fly-Client-IP`/`X-Forwarded-For`. Behind Fly's proxy this can collapse all clients into one bucket (or make per-IP limiting ineffective). The port-stripping also splits on the last `:`, corrupting IPv6 keys.
- **Fix:** derive the client IP from `Fly-Client-IP` (trusted at the edge) with a correct IPv6-aware host parse.

### M-8. Outdated transitive dependency `golang.org/x/net v0.23.0`
- **Category:** Dependency vulnerability
- **Severity:** MEDIUM
- **File:** `go.sum` (`golang.org/x/net v0.23.0`).
- **Description:** this version trails later `golang.org/x/net/http2` advisories (fixes shipped in 0.33+/0.38+). Bump regardless of runtime reachability.
- **Fix:** `go get golang.org/x/net@latest && go mod tidy`; also refresh other `golang.org/x/*` modules and build on the latest Go 1.23.x patch.

### M-9. No startup guard requiring `FRONTEND_ORIGIN` (WS origin protection can silently disable)
- **Category:** Configuration
- **Severity:** MEDIUM
- **Files:** `source/middleware.go:12-31`, `source/websocket.go:170`, `source/config.go`.
- **Description:** if `FRONTEND_ORIGIN` is empty, `corsMiddleware` becomes a no-op and the WS `CheckOrigin` comparison degrades, so a misconfigured prod deploy silently loses origin protection. Not a confirmed bypass when the value is set, but there is no guard enforcing it.
- **Fix:** fail startup in production if `FRONTEND_ORIGIN` is unset.

---

## LOW

### L-1. Report handlers rely on middleware to guarantee non-empty `userID` (defense-in-depth)
- **Severity:** LOW (not currently exploitable)
- **Files:** `source/report_handlers.go:214-234,321-352`.
- **Description:** unlike most handlers, `HandleGetReport`/`HandleGetReportPDF` don't check `if userID == ""`. If a future refactor made these exempt, the empty userID would drop the DB `user_id` filter and expose any report. Add the explicit guard.

### L-2. `HandleFileDownload` performs ownership check only when `userID != ""`
- **Severity:** LOW (not currently exploitable — route is non-exempt so `userID` is always set)
- **File:** `source/job_handlers.go:193-200`.
- **Description:** the `if userID != ""` wrapper around `VerifyFileOwnership` is fragile; make the check unconditional so an auth-config change can't turn it into a file IDOR.

### L-3. Email-change confirmation token delivered in URL query
- **Severity:** LOW (single-use, 1h TTL, deleted on use)
- **File:** `source/email_change.go:259`.
- **Description:** the confirmation link carries `?token=<token>`, which lands in server/proxy access logs for that GET. Acceptable given single-use + short TTL; noted for completeness.

### L-4. Outdated/archived dependency `github.com/pkg/errors v0.8.1`
- **Severity:** LOW (no known CVE)
- **File:** `go.mod:16`.
- **Description:** archived library, v0.9.1 is the last release. Bump or drop.

### L-5. HTTP server missing `ReadHeaderTimeout` / `MaxHeaderBytes`
- **Severity:** LOW
- **File:** `source/main.go:88-94`.
- **Description:** `ReadTimeout`/`WriteTimeout`/`IdleTimeout` are set but `ReadHeaderTimeout` and an explicit `MaxHeaderBytes` are not. Minor Slowloris/large-header hardening.

### L-6. No Content-Security-Policy header
- **Severity:** LOW (JSON API surface)
- **File:** `source/middleware.go:113-121`.
- **Description:** security headers are present (`X-Content-Type-Options`, `X-Frame-Options: DENY`, HSTS, `X-XSS-Protection: 0`) but no CSP. Low impact for a JSON API; add a restrictive default CSP for any HTML/redirect responses.

---

## Verified NOT vulnerable (checked to avoid false positives)

- **Command injection:** ExifTool/FFmpeg invoked via `exec.CommandContext` with discrete argv (no shell); paths are server-generated `f-<hex>` IDs prefixed by the temp dir, so no option/`../` injection. (`pipeline_exiftool.go`, `pipeline_ffmpeg.go`)
- **Path traversal:** all filesystem paths derive from `generateFileID` output or values validated against `localIDPattern = ^f-[0-9a-f]+$`. (`upload_handlers.go`, `job_handlers.go`, `cleanup.go`)
- **SSRF / raw SQL / template / LDAP injection:** all outbound base URLs are constants/config; no `database/sql` string building; no `text/template` on user data; no LDAP.
- **JWT:** HS256/ES256 strictly separated (no HS/RS confusion), `alg=none`/unknown rejected, expiry and non-empty `sub` enforced. (`auth_middleware.go`)
- **Cryptography:** `crypto/rand` for API keys, email-change tokens, file/report IDs, PKCE verifiers; API keys stored as SHA-256; HMAC compared with `hmac.Equal`. No MD5/SHA1/DES/RC4, no `math/rand`.
- **Stripe webhook:** signature verified via `webhook.ConstructEventWithOptions`, rejects on failure, body capped at 64 KB; plan/credits come from server-set session metadata. (`billing_webhook.go`)
- **Billing & API-key ownership:** all scope by `GetSubscriptionByUserID`/`&user_id=eq.<userID>`; no direct client control of plan/credits.
- **Passwords:** fully delegated to Supabase; change-password re-verifies the current password first. No local hashing.
- **CORS:** single configured origin, not reflected/wildcarded.
- **Secrets:** none hardcoded; `.env` gitignored; no keys committed.
- **ReDoS:** email/fileID regexes are linear and Go's RE2 engine has no catastrophic backtracking.
</content>
</invoke>
