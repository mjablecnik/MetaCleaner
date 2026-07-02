# Security Audit — `frontend/metacleaner-app`

**Date:** 2026-07-02
**Scope:** `frontend/metacleaner-app/` (SvelteKit 2 + Svelte 5 static SPA, adapter-static)
**Auditor:** automated security review (with a dedicated deep-dive pass on auth/token flows)

## Project profile

- **Language / framework:** TypeScript 6 (strict), SvelteKit 2, Svelte 5 (runes), Tailwind 4.
- **Build output:** pure client-side SPA (`@sveltejs/adapter-static`) served by nginx (Docker) or Fly.io. **No server-side rendering, no server routes, no DB, no shell/exec, no filesystem access at runtime.** The backend (Go) is audited separately.
- **Auth:** JWT via a backend proxy. Access token kept **in memory only**; refresh token in `localStorage`; OAuth/magic-link tokens delivered via URL and scrubbed from the address bar.
- **Runtime dependencies:** `exifr`, `exifreader`, `mediainfo.js` (client-side metadata parsing), `metacleaner-shared`, Capacitor (Android). All metadata parsing runs in the browser on user-selected files.

## Executive summary

**Overall risk level: MEDIUM.**

The attack surface is small by construction — a static SPA with no server-side code, so SQLi, command injection, path traversal, SSRF, and server auth bypass do not apply here (they live in the separately-audited Go backend). The DOM-XSS posture is good (the one `{@html}` sink escapes on every path and only renders static docs), no secrets are hardcoded or logged, and nginx ships a full security-header set.

However, a focused review of the auth flow found one **HIGH** issue that lifts the overall rating: the app adopts `access_token`/`refresh_token` from the URL of **any** route, at module load and again in the root layout, with **no OAuth `state`/nonce and no dedicated callback route** — a login-CSRF / session-fixation vector. A crafted link silently swaps the victim into an attacker-controlled session, so anything the victim then uploads (images/metadata — the sensitive core of this product) lands in the attacker's account. A second, related issue puts the long-lived **access token in the WebSocket URL query string**, where reverse proxies routinely log it.

The `.gitignore` also fails to ignore the deploy script's production secrets file (`.env-prod`), so it can be committed by accident. The remaining items are lower-severity hardening.

| # | Severity | Category | Title |
|---|----------|----------|-------|
| 1 | HIGH | AuthN / Session mgmt | Callback tokens adopted from any route with no OAuth `state` → login CSRF / session fixation |
| 2 | MEDIUM | Data Exposure | Access token placed in the WebSocket URL query string |
| 3 | MEDIUM | Data Exposure / Config | `.env-prod` deploy secrets file is not gitignored |
| 4 | MEDIUM | Data Exposure | Query-string token fallback leaks tokens to logs/`Referer` before cleanup |
| 5 | LOW | Injection (open-redirect / script-URI) | Backend-provided URLs assigned to `location`/`href` without a scheme allowlist |
| 6 | LOW | Configuration | CSP allows `'unsafe-inline'` for `script-src` |
| 7 | LOW | Authentication | Refresh token stored in `localStorage` (XSS-reachable) |
| 8 | LOW | Session mgmt | Password-reset bearer token retained in component `$state`, not cleared after use |
| 9 | LOW | Reliability / Auth | `billingClient`/`apiKeysClient` bypass `apiFetch`, can send `Bearer null` |

---

## Findings

### 1. [HIGH] Callback tokens adopted from any route with no OAuth `state` — Authentication / Session fixation / login CSRF

**Files:** `src/lib/auth/auth.svelte.ts:161-196` (`_restore`, invoked at module load — `:231`) and `src/routes/+layout.svelte:98` (`handleAuthCallback(window.location.href, true)` in `onMount`) → `src/lib/auth/token-utils.ts:66-90`. Also reachable via `LoginFormSection.svelte` and `email-verified/+page.svelte`.

**Description:**
`_restore()` runs at auth-store module load (`auth.svelte.ts:231`), which — because the store is imported by the root layout — executes on **every page load for every route**. It reads `access_token`/`refresh_token` from `window.location` (hash preferred, query string as fallback) and, if both are present, calls `_persist(...)`, writing the refresh token to `localStorage` and starting a session:

```ts
const hasCallbackTokens = href.includes('access_token') && href.includes('refresh_token');
...
if (accessToken && refreshToken) {
	_persist(accessToken, refreshToken, expiresIn);   // adopts whatever was in the URL
	...
}
```

The root layout's `onMount` independently calls `handleAuthCallback(window.location.href, true)`, which does the same via `token-utils.ts`. Neither path:
- restricts token adoption to a dedicated callback route (the Capacitor `deep-link.ts` handler *does* allowlist `/api/auth/*/callback` paths — the browser paths do not);
- verifies an OAuth `state`/nonce that proves the app itself initiated the flow;
- requires any user confirmation.

This is textbook **login CSRF / session fixation**. An attacker registers their own account, obtains their own valid Supabase tokens, and sends the victim a link:

```
https://app.metacleaner.com/?access_token=<ATTACKER_JWT>&refresh_token=<ATTACKER_RT>&expires_in=3600
```

**Exploitation scenario:** the victim clicks, `_restore()`/`handleAuthCallback` silently persist the attacker's refresh token and log the victim into the **attacker's** account. Believing it is their own session, the victim uploads images and metadata (the sensitive core of this product) — which are now stored in the attacker's account and retrievable by the attacker later. Because the tokens are accepted on any route including deep-links into `/report`, `/settings`, etc., the swap is easy to disguise.

**Recommended fix:**
- Process auth-callback tokens **only** on a single dedicated route (e.g. `/auth/callback`), never in `_restore()` on arbitrary pages.
- Generate a random `state` before redirecting to the IdP, store it (e.g. `sessionStorage`), and reject any callback whose `state` does not match.
- Prefer the hash fragment and reject query-string tokens (see finding 4).
- Do not adopt tokens found on non-callback routes at all.

---

### 2. [MEDIUM] Access token placed in the WebSocket URL query string — Data Exposure

**File:** `src/lib/clients/metaCleanerApi.ts:127-131` (`connectJobProgress`)

**Description:**
The job-progress WebSocket embeds the JWT access token in the query string:

```ts
const tokenParam = token ? `?token=${encodeURIComponent(token)}` : '';
const url = buildWsUrl(`/api/jobs/${jobId}/progress${tokenParam}`);
return new WebSocket(url);
```

The browser `WebSocket` API cannot set request headers, so a query param is a common workaround — but it is also the highest-risk placement: full request URIs (including query strings) are routinely written to reverse-proxy, load-balancer, and server access logs, even over `wss:`. A long-lived bearer JWT in that position is exactly the "tokens in URLs" leak class. The Go backend audit already tracks the server side of this (its task 10: replace the WS `?token=` access-JWT with a short-lived single-use progress ticket); this is the client half.

**Exploitation scenario:** anyone with access to proxy/LB/server logs (an insider, a log-aggregation breach, an SSRF that reads log files) recovers valid access tokens and replays them until expiry.

**Recommended fix:** obtain a short-lived, single-use progress ticket from an authenticated `POST` and pass that in the URL instead of the access token, or authenticate the upgrade via a cookie / `Sec-WebSocket-Protocol` subprotocol. Coordinate with the backend's task 10 so both halves change together, and confirm the backend does not log the full WS upgrade URI.

---

### 3. [MEDIUM] `.env-prod` production secrets file is not gitignored — Data Exposure / Configuration

**File:** `frontend/metacleaner-app/.gitignore:19-22` (the `# Env` block), in relation to `frontend/metacleaner-app/scripts/deploy.sh:9-24`

**Description:**
`scripts/deploy.sh` reads deployment secrets from a file named **`.env-prod`** by default (and `.env-<name>` via `--env <name>`), then pushes each line to `fly secrets set`. The `.gitignore` ignore rules use a **dot** separator (`.env.*`), which matches `.env.prod` but **not** `.env-prod` (hyphen). Verified:

```
$ git check-ignore .env-prod      → (no output; NOT ignored)
$ git check-ignore .env-staging   → (no output; NOT ignored)
$ git check-ignore .env.prod      → .env.prod    (ignored)
```

So the exact filename the deploy script expects for real production secrets is one a stray `git add -A` would stage and commit.

**Exploitation scenario:** an operator populates `.env-prod` (Fly tokens, Stripe/Supabase keys) to run the deploy script, later runs `git add .` / `git commit`, and the secrets are pushed to the remote and preserved in history even if deleted later.

**Recommended fix:**
```gitignore
# Env
.env
.env.*
.env-*
!.env.example
!.env.test
```
Optionally mirror in a `.dockerignore` (none exists today; the Docker build copies only explicit paths, so nothing is leaked into the build context right now — cheap insurance if that COPY list ever broadens).

---

### 4. [MEDIUM] Query-string token fallback leaks tokens before cleanup — Data Exposure

**File:** `src/lib/auth/auth.svelte.ts:175-192`; related `src/lib/auth/token-utils.ts:79-87`

**Description:**
`_restore()` correctly prefers the hash fragment (which is never sent to the server), but retains an active **query-string fallback** that reads tokens from `window.location.search` and only removes them *after* processing via `history.replaceState`. By the time cleanup runs, the full URL — tokens included — has already been sent to the server in the initial navigation request (and recorded in access logs), and would appear in the `Referer` header of any subresource fetched before cleanup. The in-code comment acknowledges this, but the path is still live. Combined with finding 1, any query-string token flow is a concrete leak.

**Exploitation scenario:** a magic-link/OAuth redirect that lands tokens in the query string leaves them in server access logs and potentially in outbound `Referer` headers before the address-bar scrub completes.

**Recommended fix:** reject query-string tokens outright; require the backend to return callback tokens only in the hash fragment.

---

### 5. [LOW] Backend-provided URLs assigned to `location`/anchor `href` without a scheme allowlist — Injection (open-redirect / `javascript:` URI)

**Files:** `src/routes/subscription/+page.svelte:135` (`window.location.href = url`, from `createCheckoutSession`); `src/routes/report/[id]/+page.svelte:80` and `src/routes/reports/+page.svelte:105` (`link.href = url`, from `getReportPdf`).

**Description:** these flows assign a backend-returned URL to `location.href`/anchor `href` with no scheme check. If the backend ever returned a `javascript:`/`data:` URL, the same-tab `location.href` case could execute script in-origin. Risk is low (first-party HTTPS backend; the two anchor cases use `target="_blank"`, where `javascript:` does not execute), so this is defense-in-depth.

**Recommended fix:** validate before navigating —
```ts
const u = new URL(raw, window.location.origin);
if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new Error('bad scheme');
window.location.href = u.toString();
```

---

### 6. [LOW] CSP allows `'unsafe-inline'` for `script-src` — Configuration

**File:** `frontend/metacleaner-app/nginx.conf` (CSP header)

**Description:** the CSP is otherwise strong (`object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'self'`, scoped `connect-src`), but `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'` keeps `'unsafe-inline'`. This directly undermines the app's deliberate memory-only-access-token defense: an injected inline script would still run, and `connect-src ... https:` permits exfiltration to any HTTPS host — where it could read the `localStorage` refresh token (finding 7). The file already flags nonce-based CSP as the target.

**Recommended fix:** adopt SvelteKit's `kit.csp` (nonce/hash mode) in `svelte.config.js` so `script-src` can drop `'unsafe-inline'`; consider tightening `connect-src` to the known API/WS origins.

---

### 7. [LOW] Refresh token stored in `localStorage` — Authentication / Session management

**File:** `src/lib/auth/auth.svelte.ts:120` (`_persist`), read at `:202`, `:308`

**Description:** the access token is kept in memory only (good), but the refresh token is persisted to `localStorage`, readable by any script in the origin. An XSS or compromised dependency could exfiltrate the long-lived refresh token and mint access tokens indefinitely. This is an accepted SPA trade-off (a static SPA cannot set an `HttpOnly` cookie itself), recorded as a residual risk; its severity is coupled to finding 6.

**Recommended fix (needs backend cooperation):** deliver the refresh token as an `HttpOnly; Secure; SameSite=Strict` cookie set by the backend/proxy, so JS cannot read it.

---

### 8. [LOW] Password-reset bearer token retained in component `$state` — Session management

**File:** `src/routes/(auth)/forgot-password/sections/ForgotPasswordFormSection.svelte:112-113` (stored), `:163` (used as `Bearer`)

**Description:** the privileged, password-change-capable token from `/api/auth/verify-reset-code` is held in a plain `resetToken` `$state` for the whole step 2→3 window and is not cleared on error or when navigating back — widening the window an XSS could exfiltrate it.

**Recommended fix:** zero `resetToken` immediately after `/api/auth/reset-password` succeeds and on step change/unmount.

---

### 9. [LOW] `billingClient`/`apiKeysClient` bypass `apiFetch` and can send `Bearer null` — Reliability / Auth consistency

**Files:** `src/lib/clients/billingClient.ts:21,34,48,64,79,94`; `src/lib/clients/apiKeysClient.ts:49,59,68,76`

**Description:** these clients build `Authorization: Bearer ${authStore.accessToken}` directly instead of routing through `apiFetch`, so they skip the proactive-refresh / single-flight logic in `api-client.ts`. When the access token is expired or absent they send a stale token or the literal `Bearer null`. Not a token leak, but an inconsistency that causes spurious 401s and duplicate refreshes.

**Recommended fix:** route all authenticated calls through `apiFetch` so refresh handling is centralized.

---

## Areas reviewed and found clean

- **XSS / `{@html}`:** the only `{@html}` sink is `CodeBlock.svelte:448`. Every highlighter branch runs `escapeHtml()` on the raw source and only injects static `class="..."` spans; the `code` prop is fed static documentation strings, never live backend/user data.
- **DOM XSS sinks:** no `innerHTML`, `outerHTML`, `document.write`, `eval`, or `new Function` in `src`.
- **Injection (SQL / command / path / template / NoSQL):** not applicable — no server code, DB, shell, or template engine in this package.
- **Hardcoded secrets:** none. `.env`/`.env.example` contain only `PUBLIC_API_URL` and an empty `PUBLIC_PRIVACY_POLICY_URL`. No keys/tokens/passwords in source; no `.pem` files tracked.
- **Sensitive data in logs:** the non-test `console.*` calls log generic errors only; the token-shaped `console.log`s in `docsRepository.ts` are inside example-code strings rendered as documentation. No tokens reach `console`, `sessionStorage`, `postMessage`, `window.opener`, or `Referer` (sessionStorage holds only a deep-link error string).
- **Open-redirect on `returnTo`:** `_safeReturnTo` (`auth.svelte.ts:80-91`) rejects `//`, `/\`, and scheme URLs; callers `encodeURIComponent` the value. Correct.
- **Deep-link handler:** `deep-link.ts` allowlists callback pathnames before processing (the browser paths do not — see finding 1).
- **Security headers:** nginx sets CSP, HSTS (2y, includeSubDomains, preload), X-Frame-Options SAMEORIGIN, X-Content-Type-Options nosniff, Referrer-Policy; `fly.toml` sets `force_https = true`.
- **File upload validation:** `UploadZoneCard.svelte` enforces a 500 MB size cap and an extension/MIME allowlist client-side (server remains authoritative).
- **Regex DoS:** no catastrophic-backtracking patterns; regexes are linear.
- **Route guards:** client-side only, correct for adapter-static (real enforcement is the backend's job); all protected routes call the guards.
- **External links:** the one `target="_blank"` link carries `rel="noopener noreferrer"`.
- **Dependencies:** current metadata-parsing libraries, no known critical CVEs at audited versions; re-run `bun audit` / `osv-scanner` in CI to keep this fresh.
