# Issues

## [LOW] Refresh token stored in localStorage instead of HttpOnly cookie
- Run: manual
- Phase: security-audit (2026-07-02)
- Status: OPEN
- What: `frontend/metacleaner-app/src/lib/auth/auth.svelte.ts:119` persists the refresh
  token in `localStorage`. The access token is memory-only and not affected.
- Impact: an XSS or compromised dependency could read the refresh token and mint new
  access tokens indefinitely, giving persistent account access even after reload.
- Tried: not started.
- Next: move the refresh token into an `HttpOnly`/`Secure`/`SameSite=Strict` cookie set
  by the backend (`/api/auth/login`, `/api/auth/refresh`, cleared on `/api/auth/logout`).
  A working cookie pattern already exists in `backend/metacleaner-server/source/auth_handlers.go`
  (the PKCE verifier cookie). Needs a decision on the Capacitor mobile build first: its
  WebView origin is cross-site to the API, so `SameSite=Strict`/`Lax` would silently drop
  the cookie there — either use `SameSite=None`+`Secure` for the native build, or keep the
  current token-based flow for Capacitor and only cookie-ify the web build.
