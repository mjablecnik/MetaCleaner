# Security Remediation Tasks — `frontend/metacleaner-app` (audit 2026-07-02)

Derived from `SECURITY_AUDIT.md`. Sorted by severity (highest first). Each task is a single, independently fixable issue.

> Overall risk: **MEDIUM**. This is a static client-side SPA (no server code/DB/shell), so classic server-side vuln classes are out of scope here. The rating is driven by an auth flow that adopts URL tokens on any route with no OAuth `state` (login CSRF), plus the access token being placed in the WebSocket URL.

- [x] 1. [HIGH] Restrict auth-callback token adoption to a single dedicated callback route and require a verified OAuth `state`/nonce; stop `_restore()` and the layout `onMount` from adopting `access_token`/`refresh_token` present on arbitrary routes — src/lib/auth/auth.svelte.ts:161-196,231, src/routes/+layout.svelte:98, src/lib/auth/token-utils.ts:66-90
- [x] 2. [MEDIUM] Replace the WebSocket `?token=<access-JWT>` with a short-lived single-use progress ticket (or cookie/subprotocol) so the bearer token is not written to proxy logs — src/lib/clients/metaCleanerApi.ts:127-131 (coordinate with backend task 10)
- [x] 3. [MEDIUM] Add `.env-*` to the `# Env` block so the deploy script's `.env-prod`/`.env-staging` secrets files can't be committed (keep `!.env.example`, `!.env.test`) — src/../.gitignore:19-22
- [x] 4. [MEDIUM] Reject query-string callback tokens (accept hash-fragment only) so tokens never reach server logs / `Referer` before the address-bar scrub — src/lib/auth/auth.svelte.ts:175-192
- [x] 5. [LOW] Validate URL scheme (http/https only) before `window.location.href = url` for the Stripe checkout redirect — src/routes/subscription/+page.svelte:135
- [x] 6. [LOW] Validate URL scheme before assigning the backend PDF URL to `link.href` in both report views — src/routes/report/[id]/+page.svelte:80, src/routes/reports/+page.svelte:105
- [x] 7. [LOW] Move to a nonce-/hash-based CSP (via SvelteKit `kit.csp`) so `script-src` can drop `'unsafe-inline'`; tighten `connect-src` to known API/WS origins — nginx.conf (CSP header) + svelte.config.js
- [x] 8. [LOW] Track migrating the refresh token from `localStorage` to an `HttpOnly; Secure; SameSite=Strict` cookie set by the backend (needs backend cooperation; access token already memory-only) — src/lib/auth/auth.svelte.ts:120
- [x] 9. [LOW] Clear the password-reset `resetToken` `$state` after `/api/auth/reset-password` succeeds and on step change/unmount — src/routes/(auth)/forgot-password/sections/ForgotPasswordFormSection.svelte:112-113,163
- [x] 10. [LOW] Route `billingClient`/`apiKeysClient` calls through `apiFetch` so token refresh is centralized and they never send `Bearer null` — src/lib/clients/billingClient.ts:21,34,48,64,79,94, src/lib/clients/apiKeysClient.ts:49,59,68,76
