# Security Remediation Tasks — `frontend/metacleaner-web` (audit 2026-07-02)

Derived from `SECURITY_AUDIT.md`. Sorted by severity (highest first). Each task is a single, independently fixable issue.

> Overall risk: **LOW**. This is a fully prerendered static marketing site served by nginx — no runtime server, DB, shell, or auth in this package, so server-side vuln classes are out of scope. The one dynamic surface (contact-email Supabase Edge Function) is well validated, rate-limited, and fail-closed. All findings below are hardening / defense-in-depth.

- [x] 1. [LOW] Re-declare (or `include`) the security headers inside the static-asset `location ~* \.(js|css|...)` block so CSP/HSTS/nosniff/X-Frame-Options aren't dropped by nginx's non-inheriting `add_header` — nginx.conf:18-21
- [ ] 2. [LOW] Drop `'unsafe-inline'` from CSP `style-src` (move to hashed/nonce styles) — nginx.conf:33
- [ ] 3. [LOW] Replace the wildcard `https://*.supabase.co` in CSP `connect-src` with the exact project origin — nginx.conf:33
- [ ] 4. [LOW] Defensively escape `<` (as `<`) in the serialized JSON-LD before `{@html}`, and keep `data` developer-controlled only — src/lib/components/shared/JsonLd.svelte:7
- [ ] 5. [LOW] Run `bun update` at the workspace root to patch transitive `cookie` (≥0.7.0) and `esbuild` (≥0.28.1) advisories, then re-run `bun audit` — bun.lock
- [ ] 6. [LOW] Set a real, separate `PROD_PROJECT_REF` (or source both refs from env) before any production Edge Function deploy — scripts/deploy-functions.sh:15-16
