# Security Audit — MetaCleaner Go Backend (`backend/metacleaner-server/`)

**Date:** 2026-07-02 (re-audit)
**Scope:** `backend/metacleaner-server/` — Go 1.25 HTTP server (net/http `ServeMux`), Supabase (PostgREST/Storage/Auth) via REST with the service-role key, Stripe billing, Brevo email, ExifTool/FFmpeg subprocess pipeline.
**Method:** Full re-audit of the current tree at commit `e3ef4d8`. Route map (`router.go`) → per-handler data-flow tracing → DB-sink review, across injection, authN/authZ, data exposure, cryptography, dependencies, input validation, and configuration/deployment. Four parallel deep-dive passes (injection / auth / data-exposure+config / input-validation+DoS+deps), then hand-verification of every HIGH/MEDIUM finding against the source and a `govulncheck` run.

> **Relationship to the prior audit.** The previous pass (same date) found a CRITICAL unauthenticated PostgREST-filter-injection exfiltration plus 24 lesser items; all 25 were remediated (see `TASKS.md` history and the five `security:` commits). **This re-audit verified every one of those fixes is in place and correct** — the CRITICAL is closed. The findings below are the *residual and newly-discovered* issues in the current code. The headline change is that the top risks are now two self-inflicted **denial-of-service** bugs (one crashes the whole process), not data exfiltration.

---

## Executive Summary

**Overall risk: HIGH** — driven by **H-2**, a network-triggerable concurrent-write panic that crashes the entire server process (all users dropped), and **H-1**, a broken job-timeout that both nullifies the worker-pool DoS protection and cancels legitimate jobs at startup. No CRITICAL and no unauthenticated data-exfiltration path remains.

The core security architecture is sound and the prior hardening holds up under re-review:

- **Injection** — the four headline PostgREST-injection sinks (report ID, job ID, API-key ID, email-change token) now have **both** handler-side regex validation **and** `url.QueryEscape` at the sink. Command injection, path traversal, SQL, SSRF, and template injection were re-checked and are **not exploitable** (discrete argv, server-generated/regex-validated paths, fixed outbound hosts). One residual gap: the `userID`/JWT-`sub` filter parameter is interpolated raw and never format-validated (**M-4**).
- **Auth** — JWT verification is real and complete (HS256 via `hmac.Equal`, ES256 via JWKS, `alg=none` rejected, no HS/ES confusion), Stripe webhook is HMAC-verified, PKCE cookie flags are correct, and session tokens now travel in the URL **fragment** (not query). Residual hardening: require `exp`, validate `role`/`aud` (**L-1/L-2**).
- **Crypto** — clean: `crypto/rand` throughout, SHA-256 API-key hashing, no MD5/SHA-1/DES/RC4, no hardcoded keys/IVs, no committed secrets.
- **Config/deploy** — `APP_ENV=production`, fixed-origin CORS with fail-closed startup, full security-header set incl. CSP/HSTS, non-root Docker `USER`, and HTTP server timeouts are all present.

Secondary themes this pass: an **outdated Go toolchain** (21 reachable stdlib CVEs) with a Dockerfile builder pinned even further back (**M-3**); **unthrottled sensitive authenticated endpoints**, including a password-verification oracle on `change-password` (**M-2**); a missing **`.env-*` gitignore guard** for the exact file the deploy script tells operators to create (**M-1**); and several low-severity data-hygiene / defense-in-depth items.

| Severity | Count |
|---|---|
| CRITICAL | 0 |
| HIGH | 2 |
| MEDIUM | 4 |
| LOW | 9 |

---

## HIGH

### H-1. Job-processing timeout is canceled immediately — DoS protection defeated and legitimate jobs killed
- **Category:** Configuration / DoS (resource exhaustion) — broken security control
- **Severity:** HIGH
- **Files:** `source/job_handlers.go:126-134`, `source/job_worker.go:29-55` (`Submit`), `source/job_worker.go:76-116` (`ProcessJobWithPool`)
- **Description:** The prior audit added a 5-minute `context.WithTimeout` to bound hanging ExifTool/FFmpeg runs. It is created in the wrong scope:
  ```go
  go func() {
      <-wsReady
      ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
      defer cancel()
      ProcessJobWithPool(pool, ctx, cfg, db, hub, pl, job, files, authClient)
  }()
  ```
  `ProcessJobWithPool` calls `pool.Submit(...)`, and `Submit` is **asynchronous** — it spawns its own goroutine and returns immediately (`job_worker.go:39-54`). So `ProcessJobWithPool` returns at once, the outer goroutine unwinds, and **`defer cancel()` fires before the pooled work runs**. The pipeline (`pl.ProcessJob`) therefore executes with an already-canceled context. `pipeline.go` checks `ctx.Err()` at the top of its per-file loop and bails out, so the job never reaches `completed`: it is stuck in `processing`, no files are cleaned, credits/report steps are skipped.
- **Proof of concept / impact:** No attacker action is required — this is a latent correctness + resource bug. Submit any job: the context is canceled essentially at once (`cancel()` is synchronous and immediate; the pool goroutine must still acquire a semaphore slot and log before invoking `fn()`, so `cancel` wins the race). Independently reproduced in isolation (10 jobs, pool size 3): all observed `ctx.Err() == context.Canceled`. Consequence (a): whenever the pipeline *does* start before cancel lands, its ExifTool/FFmpeg run is **unbounded** — the exact worker-pool exhaustion the timeout was meant to prevent. Consequence (b): jobs fail on arrival.
- **Recommended fix:** create the timeout context **inside** the unit of work submitted to the pool, so its lifetime spans execution:
  ```go
  // job_handlers.go
  go func() {
      <-wsReady
      ProcessJobWithPool(pool, cfg, db, hub, pl, job, files, authClient)
  }()

  // job_worker.go
  func ProcessJobWithPool(pool *JobWorkerPool, cfg Config, /* ... */) {
      pool.Submit(job.ID, func() {
          ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
          defer cancel()
          // ... existing body, using ctx ...
      })
  }
  ```

### H-2. Concurrent writes to a WebSocket connection panic → whole-process crash (remote DoS)
- **Category:** DoS (unrecovered panic) — availability
- **Severity:** HIGH
- **Files:** `source/websocket.go:173` (`Broadcast`) vs `source/websocket.go:249-257` (per-connection ping goroutine)
- **Description:** `gorilla/websocket` `*Conn.WriteMessage` is **not safe for concurrent use** and deliberately `panic("concurrent write to websocket connection")` when it detects one. Two independent writers touch the same `*Conn` with no serialization:
  1. the per-connection **ping goroutine** — `conn.WriteMessage(websocket.PingMessage, nil)` every 30 s (`websocket.go:253`), and
  2. **`Broadcast`** — `c.WriteMessage(websocket.TextMessage, data)` driven by the pipeline worker's `progressFn` (`websocket.go:173`, called from `job_worker.go:78`).

  The hub's `sync.Mutex` guards only the `conns` map, not the writes. There is **no per-connection write lock**. When a broadcast and a ping overlap on the same connection, gorilla panics. The ping runs in a goroutine spawned by the handler (`websocket.go:249`); a panic there is **not** recovered by `net/http` (which only recovers the request goroutine), so it **crashes the entire server process**, dropping every connected user across all jobs.
- **Proof of concept / exploitation:** Normal usage triggers it: open a progress WebSocket for an active job and keep it open ≥30 s so a keep-alive ping coincides with a progress broadcast. The per-event collision window is small, but across concurrent jobs it is statistically certain; a malicious client can widen it by opening many long-lived connections against active jobs.
- **Recommended fix:** serialize all writes to a connection behind a per-connection mutex, and route the broadcast, ping, and close-message paths through it:
  ```go
  type wsConn struct {
      conn *websocket.Conn
      mu   sync.Mutex
  }
  func (c *wsConn) write(msgType int, data []byte) error {
      c.mu.Lock()
      defer c.mu.Unlock()
      return c.conn.WriteMessage(msgType, data)
  }
  ```
  Store `*wsConn` in the hub's `conns` map and use `write(...)` in `Broadcast`, the ping loop, and the "too many connections"/close path. (Minimally, add one `sync.Mutex` per connection and guard all three `WriteMessage` sites; as a backstop, also `recover()` inside the ping goroutine.)

---

## MEDIUM

### M-1. `.env-prod` (production secrets) is not gitignored or dockerignored
- **Category:** Configuration / sensitive-file exposure
- **Severity:** MEDIUM
- **Files:** `backend/metacleaner-server/.gitignore` (matches only `.env`), `.dockerignore` (only `.env`), `scripts/deploy.sh:9,44-57`
- **Description:** `deploy.sh` instructs operators to place all production secrets (Supabase service-role key, Stripe secret key, JWT secret, Brevo key) in `.env-prod` (or `.env-<name>` via `--env`). `.gitignore` matches only the exact name `.env`, so `git check-ignore .env-prod` returns nothing — the secrets file the deploy process tells you to create is **not** ignored. The file doesn't exist right now, so nothing is leaked today; the guardrail is simply absent.
- **Exploitation scenario:** An operator runs `scripts/deploy.sh`, later runs `git add .` — the full production secret set is committed and propagates to every clone and CI cache.
- **Recommended fix:** in `.gitignore` and `.dockerignore`:
  ```gitignore
  .env
  .env-*
  .env.*
  !.env.example
  ```

### M-2. Sensitive authenticated endpoints have no rate limiting; `change-password` is a password oracle
- **Category:** Data exposure / missing rate limiting → credential brute force
- **Severity:** MEDIUM
- **Files:** `source/router.go:33-35,71-75`, `source/account_handlers.go:89`
- **Description:** Rate limiting is opt-in per route (there is no global fallback limiter). These mutating/sensitive routes are wrapped by **neither** `rateLimited` **nor** `authRateLimited`: `POST /api/auth/change-password` (`router.go:34`), `POST /api/auth/change-email` (`:33`), `DELETE /api/auth/account` (`:35`), and all API-key CRUD `POST/GET/DELETE/PATCH /api/keys*` (`:71-75`). `HandleChangePassword` calls `authClient.SignInWithPassword(profile.Email, req.CurrentPassword)` to verify the current password (`account_handlers.go:89`) — an **unthrottled password-verification oracle** for anyone holding a valid session/JWT (e.g. a stolen-but-not-yet-revoked token), enabling online brute force of the real password without tripping the login limiter. The `/api/keys` endpoints permit unlimited key creation/enumeration attempts.
- **Recommended fix:** apply `authRateLimited` (or a dedicated per-user limiter) to `change-password`, `change-email`, and account delete, and `rateLimited` to the `/api/keys` routes. Consider a low global fallback limiter in the middleware chain so no authenticated route is entirely unthrottled.

### M-3. Outdated Go toolchain — 21 reachable stdlib CVEs; Dockerfile builder pinned even older
- **Category:** Dependency / configuration
- **Severity:** MEDIUM
- **Files:** `go.mod:3` (`go 1.25.0`), `Dockerfile:2` (`FROM golang:1.23-bookworm`)
- **Description:** `govulncheck ./...` reports **21 called standard-library vulnerabilities** reachable from this code (net/http, crypto/tls, crypto/x509, net/url, net, os, encoding/pem, encoding/asn1, net/textproto). Notable reachable ones:
  - **GO-2026-4918** — HTTP/2 transport infinite loop on a bad `SETTINGS_MAX_FRAME_SIZE`, reached via the JWKS fetch (`auth_middleware.go`) and Supabase calls. Fixed in go1.25.10.
  - **GO-2026-4870** — TLS 1.3 KeyUpdate connection-retention DoS, reached via `main.go` `ListenAndServe`. Fixed in go1.25.9.
  - **GO-2026-4341** — memory exhaustion parsing query parameters, reached via `ParseMultipartForm` (`upload_handlers.go`) and `URL.Query()` (`websocket.go`). Fixed in go1.25.6.
  - **GO-2026-4602** — `FileInfo` can escape a `Root`, reached via `http.ServeFile` (`job_handlers.go`). Fixed in go1.25.8.

  Separately, the **Dockerfile builds with `golang:1.23`** while `go.mod` requires `1.25.0`; the build only succeeds because `GOTOOLCHAIN=auto` downloads go1.25.0 at build time, so the pinned base is fiction and `golang:1.23-bookworm` is itself past upstream support. Neither stage is digest-pinned.
- **Recommended fix:** bump the `go` directive to `go 1.25.11` (or newer) and set `FROM golang:1.25-bookworm` (ideally `@sha256:...`-pinned) for the builder. Add `govulncheck ./...` to CI. *(Note: `golang.org/x/net v0.38.0` is only an indirect requirement and `go mod why` shows the main module doesn't import it — the HTTP/2 CVE here is the stdlib copy, fixed by the toolchain bump.)*

### M-4. `userID`/JWT-`sub` interpolated raw and never format-validated into PostgREST filters
- **Category:** Injection (PostgREST filter injection) — incomplete remediation / defense-in-depth
- **Severity:** MEDIUM
- **Files:** `source/auth_middleware.go:314-322` (`sub` returned unvalidated); unescaped `user_id=eq.`+`userID` sinks at `source/supabase.go:560,745`, `source/supabase_apikeys.go:69,222`, `source/supabase_auth.go:432,466,495,544,568`, `source/supabase_billing.go:62,85,109,223,245,389`, `source/email_change.go:49`
- **Description:** The prior injection fix escaped the *resource* IDs but not the ownership parameter. `validateJWT` returns `claims.Sub` with **no format check** (only an emptiness check at `auth_middleware.go:318`), and every ownership filter concatenates it **raw**, without `url.QueryEscape`. Under the current threat model this is not externally exploitable (the JWT signature is verified, so `sub` can't be attacker-chosen), but it is exactly the injection class the prior audit set out to close and it was left open for `user_id` across ~15 filters — including a `DELETE` at `email_change.go:49`. If a legitimately-signed token with a crafted `sub` ever entered the system (e.g. a leaked/weak `SUPABASE_JWT_SECRET` on the HS256 path, or a future code path populating `userID` from request input), a value like `x&user_id=neq.x` or an injected `or=(...)` clause would break out of the `user_id=eq.` scope → cross-user read/write/delete.
- **Recommended fix:** validate `sub` as a UUID at the single choke point, and escape at the sinks for consistency:
  ```go
  // auth_middleware.go — after the claims.Sub == "" check
  var subjectPattern = regexp.MustCompile(`^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$`)
  if !subjectPattern.MatchString(claims.Sub) {
      return "", &authError{code: ErrAuthTokenInvalid, message: "invalid subject claim"}
  }
  ```
  and wrap each interpolation: `... + url.QueryEscape(userID)`.

---

## LOW

### L-1. JWT accepts tokens with no `exp` claim (effectively non-expiring)
- **Category:** Authentication / session management
- **Severity:** LOW
- **File:** `source/auth_middleware.go:314`
- **Description:** Expiry is enforced only when present: `if claims.Exp > 0 && time.Now().Unix() > claims.Exp`. A validly-signed token that omits `exp` (or sets it to 0) bypasses expiry and is accepted forever. Not exploitable without the signing key (signature is still verified), but a mis-issued long-lived/no-`exp` token would never age out.
- **Recommended fix:** require `exp` present and non-zero, then compare:
  ```go
  if claims.Exp == 0 { return "", &authError{code: ErrAuthTokenInvalid, message: "token missing expiry claim"} }
  if time.Now().Unix() > claims.Exp { return "", &authError{code: ErrAuthTokenExpired, message: "token has expired"} }
  ```

### L-2. No `role`/`aud`/`iss` validation — anon/service-key rejection is incidental
- **Category:** Authentication / authorization
- **Severity:** LOW
- **File:** `source/auth_middleware.go:226-322`
- **Description:** `jwtClaims` parses `Role` but never checks it; `aud`/`iss` are not parsed. On the HS256 path (`SUPABASE_JWT_SECRET` set), the Supabase **anon** and **service_role** keys are themselves JWTs signed with that same secret; the only thing stopping an attacker from presenting the public anon key as a Bearer token is that those legacy keys carry no `sub`, so line 318 rejects them — a fragile, incidental guard rather than an explicit authorization decision.
- **Recommended fix:** explicitly require `claims.Role == "authenticated"` (and optionally validate `aud`/`iss` against the expected Supabase issuer).

### L-3. `GetJob` applies the ownership filter conditionally (`if userID != ""`)
- **Category:** Authorization (IDOR class — defense-in-depth)
- **Severity:** LOW
- **Files:** `source/supabase.go:315-320` (`GetJob`), callers `source/job_handlers.go:254` (`HandleJobDownload`), `:358` (`HandleGetJob`)
- **Description:** `GetJob` adds `&user_id=eq.<userID>` only when `userID != ""`, and neither caller guards `userID == ""` before calling it (unlike `HandleGetReport`/`HandleGetReportPDF`, which do). Safe today because `/api/jobs/*` is non-exempt and middleware guarantees a non-empty `sub`; but this is the exact conditional-scoping pattern the prior audit flagged, and a future change to `isExemptPath` or the middleware would silently reopen cross-user access. `HandleFileDownload` already does this correctly via an unconditional `VerifyFileOwnership`.
- **Recommended fix:** make the DB filter unconditional (treat empty `userID` as a hard failure) and/or add explicit `userID == ""` guards in `HandleGetJob`/`HandleJobDownload`.

### L-4. Access JWT passed in the WebSocket URL query string
- **Category:** Data exposure (sensitive data in URL)
- **Severity:** LOW
- **File:** `source/websocket.go:192`
- **Description:** The full Supabase access JWT is sent as `?token=` on `GET /api/jobs/{id}/progress`. The app has no access-log middleware, but the URL (with query) is visible in Fly.io proxy logs, intermediaries, and browser history. Browsers genuinely can't set headers on a WS upgrade, so the limitation is real and documented — but the token is long-lived (~1 h) and grants full API access.
- **Recommended fix:** mint a short-lived (≤60 s), single-use WS ticket via an authenticated endpoint and pass that in the query instead of the access token, or use the `Sec-WebSocket-Protocol` header technique.

### L-5. Internal error detail leaked to clients on JWKS lookup failure
- **Category:** Data exposure (verbose error)
- **Severity:** LOW
- **File:** `source/auth_middleware.go:286`
- **Description:** `return "", &authError{..., message: "unable to verify token: " + err.Error()}` — on a JWKS key-lookup failure the raw Go error reaches the client via `WriteError`, and Go HTTP errors embed the full URL (e.g. `Get "https://<project>.supabase.co/auth/v1/.well-known/jwks.json": dial tcp ..."`), disclosing the Supabase project hostname and network state. This is the only place a raw internal `err.Error()` reaches clients.
- **Recommended fix:** log the error server-side and return a generic `"unable to verify token"`.

### L-6. New email address (PII) logged at Info level in production
- **Category:** Data exposure (PII in logs)
- **Severity:** LOW
- **File:** `source/email_change.go:275`
- **Description:** `...Info("change-email: verification email sent", "userId", userID, "newEmail", newEmail)` writes a user email (PII) to prod logs (Info passes the prod filter). Every other handler logs only opaque UUIDs.
- **Recommended fix:** drop `newEmail` or log a redacted form (e.g. domain only).

### L-7. Email-change verification tokens stored in plaintext in the DB
- **Category:** Cryptography / data-at-rest exposure
- **Severity:** LOW
- **Files:** `source/email_change.go:62-66` (insert `"token": token`), `:93` (equality lookup)
- **Description:** The 256-bit email-change token is stored as-is and matched by direct equality, whereas API keys in the same codebase are correctly stored as SHA-256 hashes (`apikey_models.go:51`). Tokens are single-use and expire (1 h), which bounds the damage, but DB/backup read access (or any future PostgREST leak) yields a usable pending token → email-change → account-takeover pivot.
- **Recommended fix:** store `hex(sha256(token))` and hash the presented token before the `token=eq.` lookup (same 64-hex shape, no schema change).

### L-8. Unauthenticated `/api/health` discloses infrastructure state and amplifies subprocess spawns
- **Category:** Data exposure / DoS (amplification)
- **Severity:** LOW
- **Files:** `source/health_handlers.go:25-58`; route registered without a limiter at `source/router.go:79`
- **Description:** The public health endpoint returns tool availability (`exiftool`, `ffmpeg`), live DB connectivity, and disk capacity/free space of the storage volume — useful recon (exact stack; watching free disk shrink to time a disk-exhaustion DoS via uploads). Each hit also spawns two subprocesses (`exiftool -ver`, `ffmpeg -version`) plus a DB ping, and the route is not rate-limited.
- **Recommended fix:** return only `{"status":"healthy|degraded"}` to unauthenticated callers (reserve details for authenticated admins), cache the tool checks (immutable at runtime), and wrap the route in `rateLimited`.

### L-9. Registration `firstName`/`lastName`/`email` have no maximum length
- **Category:** Input validation
- **Severity:** LOW
- **File:** `source/auth_handlers.go:31-57` (stored at `:78-83`)
- **Description:** `HandleRegister` checks presence and email *format* and password length, but imposes no upper bound on name/email length (unlike `HandleUpdateProfile`, which caps names at 100 runes). Bounded only by the 1 MB body cap, so ~1 MB names/emails can be persisted to Supabase.
- **Recommended fix:** mirror the profile handler — reject names > 100 runes and cap email length (≤254 per RFC 5321).

### L-10. Two resource-ID sinks missed by the `QueryEscape` pass
- **Category:** Injection (defense-in-depth)
- **Severity:** LOW
- **Files:** `source/supabase.go:546` (`GetReportIDByJobID`, `jobID` unescaped), `source/supabase.go:560` (`VerifyFileOwnership`, `localID` unescaped)
- **Description:** Both are safe today because callers pass `uuidV4Pattern`/`localIDPattern`-validated or DB-issued values, but they are the resource-ID sinks the escape fix skipped — inconsistent with the rest of the remediation.
- **Recommended fix:** add `url.QueryEscape` at both sinks for uniformity.

### L-11. No per-user/global WebSocket connection cap; upgrade path unrated
- **Category:** DoS (resource exhaustion)
- **Severity:** LOW
- **Files:** `source/websocket.go:87-92` (per-job cap only), `source/router.go:48` (route not rate-limited)
- **Description:** `maxWSConnsPerJob = 5` caps connections per job, but a user with many valid jobs can open many long-lived connections (each holds a goroutine + ping ticker), and the upgrade route is not rate-limited. No global or per-user ceiling exists.
- **Recommended fix:** add a global and/or per-user connection counter in the hub and rate-limit the upgrade path by client IP.

### L-12. Archived/unmaintained transitive dependency `github.com/pkg/errors`
- **Category:** Dependency hygiene
- **Severity:** LOW
- **File:** `go.mod` (`github.com/pkg/errors v0.9.1 // indirect`)
- **Description:** `pkg/errors` is archived/unmaintained, pulled in transitively via `signintech/gopdf` → `phpdave11/gofpdi`; not directly used by this code. No known CVE — flagged for future dependency hygiene. *(Third-party deps `gorilla/websocket v1.5.3`, `stripe-go/v82 v82.5.1`, `gopdf v0.36.1`, `skip2/go-qrcode`, `joho/godotenv v1.5.1`, `golang.org/x/time v0.15.0` show no known CVEs at these versions.)*
- **Recommended fix:** track upstream (`gopdf`) for a release that drops `pkg/errors`; no urgent action.

---

## Verified NOT vulnerable (re-checked this pass — do not re-flag)

- **PostgREST injection on resource IDs** — report ID, job ID, API-key ID, and email-change token all have handler-side regex validation **and** `url.QueryEscape` at the sink. The prior CRITICAL (unauthenticated `/api/public/reports/{id}` exfiltration) is **closed**.
- **Command injection** — `exec.CommandContext` with discrete argv, no shell; paths are `filepath.Join(TempStoragePath, …)` from server-generated `LocalID` (`f-<hex>`) + validated extension (`pipeline*.go`).
- **Path traversal** — `localIDPattern`/`uuidV4Pattern` contain no `/`, `.`, or `\`; enforced at job creation, file download, and job download.
- **SSRF** — all outbound hosts are constants (Supabase, Brevo, Stripe SDK) or Supabase-issued signed URLs; OAuth `provider` is whitelisted.
- **SQL injection** — no `database/sql` / raw SQL anywhere (all DB access via PostgREST HTTP).
- **JWT** — real signature verification, HS256 (`hmac.Equal`) and ES256 (JWKS) separated (no confusion), `alg=none`/unknown rejected, signature length checked, missing `sub` rejected.
- **Cryptography** — `crypto/rand` for all tokens (API keys, report IDs, email-change tokens, PKCE verifier), SHA-256 API-key hashing, no MD5/SHA-1/DES/RC4, no hardcoded keys/IVs.
- **Stripe webhook** — HMAC-verified with fail-closed on empty secret and a 64 KB body cap.
- **CORS / security headers** — single fixed `FRONTEND_ORIGIN` (fail-closed startup in prod), full header set (`nosniff`, `X-Frame-Options: DENY`, HSTS, CSP `default-src 'none'`).
- **Secrets** — none committed (only placeholder `.env.example`); no `.pem`/key files in the tree; all secrets read from env.
- **Prior DoS-hardening (present & correct)** — magic-byte upload validation, zero-byte rejection, `http.MaxBytesReader` on JSON handlers, `io.LimitReader` on magic-link, WebSocket `SetReadLimit(512)` + read deadline/pong, IPv6-aware `Fly-Client-IP` rate-limit keying, HTTP server timeouts, non-root Docker `USER`. Regex patterns are all linear (no ReDoS).
</content>
