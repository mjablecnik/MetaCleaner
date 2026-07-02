# Security Audit — `frontend/metacleaner-web` (2026-07-02)

## Project profile

- **Language / framework:** TypeScript + Svelte 5 / SvelteKit 2, Tailwind CSS v4, Paraglide i18n.
- **Build / deploy:** `@sveltejs/adapter-static` → fully **prerendered static site** served by **nginx** (`nginx.conf`) in a Docker container on Fly.io. There is **no application server at runtime** — nginx serves static HTML/JS/CSS only.
- **Server-side code:** one build-time `sitemap.xml/+server.ts` endpoint (hardcoded paths, prerendered) and one **Supabase Edge Function** (`supabase/functions/send-contact-email/index.ts`, Deno) that proxies the contact form to Brevo.
- **Package manager:** Bun (`bun.lock`).

## Executive summary

**Overall risk: LOW.**

Because this package is a static, prerendered marketing site, entire server-side vulnerability classes (SQL/NoSQL injection, command injection, path traversal, IDOR, session/JWT handling) are **out of scope** — there is no runtime server, database, shell, filesystem access, or authenticated area in this package. The one dynamic surface (the contact-email Edge Function) is well built: strict payload validation with length caps, atomic per-IP rate limiting via Deno KV, **fail-closed** CORS (missing `ENVIRONMENT` is treated as production), spoof-resistant client-IP selection (`cf-connecting-ip` / rightmost `x-forwarded-for`), and no secrets returned to clients.

Positive controls already in place: no secrets committed (only placeholder `.env.example`; real `.env`/`.env-*` are git-ignored), Subresource Integrity + `crossorigin` on the Font Awesome CDN `<link>`, hash-based CSP for scripts (`kit.csp` mode `hash`), HSTS with preload, `X-Frame-Options: SAMEORIGIN` + `frame-ancestors 'self'`, `X-Content-Type-Options: nosniff`, `object-src 'none'`, and `base-uri 'self'`. The only `{@html}` sink (`JsonLd.svelte`) renders **static, developer-controlled data**, not user input.

The findings below are all **LOW** severity — hardening / defense-in-depth improvements, not exploitable vulnerabilities in the current code.

---

## Findings

### [LOW] 1. nginx `add_header` in the static-asset `location` block drops all inherited security headers — Configuration
**File:** `nginx.conf:18-21` (the `location ~* \.(js|css|png|...)$` block)

**Description:** In nginx, `add_header` directives are **not** inherited by a nested block once that block defines *any* `add_header` of its own. The `location ~* \.(js|css|...)` block adds only `Cache-Control`, so responses for JS/CSS/SVG/font assets are served **without** the CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`, and `Referrer-Policy` headers defined at the `server` level. HTML documents still get them (they match `location /`), so the practical impact is limited, but asset responses lose HSTS and nosniff.

**Exploitation scenario:** A MITM on a first-visit asset request (before any HSTS was seen on an HTML response) is not downgrade-protected for that request; an asset served with a wrong/guessable content type isn't `nosniff`-protected. Low impact for a static asset host.

**Recommended fix:** Re-declare the security headers inside the asset block, or use an `include` file shared by both blocks:
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    # ...repeat the remaining security headers, or `include /etc/nginx/security-headers.conf;`
}
```

---

### [LOW] 2. CSP `style-src` allows `'unsafe-inline'` — Configuration / XSS hardening
**File:** `nginx.conf:33`

**Description:** The delivered CSP permits `style-src 'self' 'unsafe-inline' ...`. `'unsafe-inline'` for styles allows attacker-injected inline styles (CSS-based data exfiltration / UI-redressing) should any HTML-injection path ever appear. Scripts are already locked down via hash-based CSP, so this is the weakest remaining directive.

**Exploitation scenario:** Defense-in-depth only — there is no HTML-injection sink today (the sole `{@html}` renders static JSON-LD). If one were introduced, inline styles would not be blocked.

**Recommended fix:** Tailwind v4 does not require runtime inline styles for utility classes; move toward a hashed/nonce style policy and drop `'unsafe-inline'` from `style-src`. If a few inline styles remain, enumerate their hashes instead.

---

### [LOW] 3. CSP `connect-src` uses a wildcard Supabase subdomain — Configuration
**File:** `nginx.conf:33` (`connect-src 'self' https://*.supabase.co`)

**Description:** `https://*.supabase.co` allows the browser to connect to **any** Supabase project, not just this app's. If script-injection ever occurred it could exfiltrate to an attacker-controlled `*.supabase.co` project. The app only talks to one fixed project (`VITE_SUPABASE_URL`).

**Recommended fix:** Pin the exact project origin, e.g. `connect-src 'self' https://asxkfzpsxglifgmtgujx.supabase.co` (or template it from the build-time env), instead of the wildcard.

---

### [LOW] 4. `{@html}` used to inject JSON-LD script — XSS (defensive note)
**File:** `src/lib/components/shared/JsonLd.svelte:7`

**Description:** `{@html \`<script type="application/ld+json">${JSON.stringify(data)}</script>\`}` is an HTML-injection sink. It is currently **safe** because every caller passes a static, developer-defined object (e.g. `pricingJsonLd` in `src/routes/pricing/+page.svelte`), and the serialized data contains no `</script>` breakout. Flagged so it is not later fed user-derived content without escaping.

**Exploitation scenario:** Only exploitable if a future change passes user-controllable strings into `data`; a value containing `</script><script>...` would break out of the JSON-LD block.

**Recommended fix:** Keep `data` developer-controlled, and defensively escape `<` in the serialized output:
```svelte
{@html `<${'script'} type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</${'script'}>`}
```

---

### [LOW] 5. Transitive dependency advisories (`cookie`, `esbuild`) present in the lockfile — Dependency
**File:** `bun.lock` (workspace root)

**Description:** `bun audit` reports 2 low-severity advisories: `cookie <0.7.0` (out-of-bounds chars in cookie name/path/domain, via `@sveltejs/kit`) and `esbuild >=0.27.3 <0.28.1` (dev-server arbitrary file read on Windows, via Storybook/Vite). Both are surfaced through the **sibling `metacleaner-app`** workspace rather than `metacleaner-web` directly, and both are **low**; the esbuild one only affects a running dev server on Windows, not the production static build.

**Recommended fix:** Run `bun update` at the workspace root to pull patched `cookie` (≥0.7.0) and `esbuild` (≥0.28.1), then re-run `bun audit` to confirm 0 findings.

---

### [LOW] 6. Hardcoded (non-secret) Supabase project ref in deploy script — Configuration / hygiene
**File:** `scripts/deploy-functions.sh:15-16`

**Description:** `DEV_PROJECT_REF` and `PROD_PROJECT_REF` are both the literal `asxkfzpsxglifgmtgujx`. A project ref is **not a secret** (it appears publicly in the function URL), so this is not a credential leak. The script already refuses to deploy to production while the two refs are equal, which is a good guard. The residual issue is purely operational: prod would share the dev backend (secrets, data, CORS) if the guard were removed.

**Recommended fix:** Replace `PROD_PROJECT_REF` with the real production ref before any prod deploy (the existing guard enforces this), and consider sourcing both from env rather than hardcoding.

---

## Areas reviewed with no issues found

- **Injection:** No SQL/NoSQL/ORM, no `child_process`/`exec`/shell interpolation of user input, no dynamic `fs` path built from user input, no template-engine eval. `sitemap.xml/+server.ts` builds XML from a hardcoded path array (no user input).
- **XSS:** Only one `{@html}` sink, fed static data (finding 4). All other rendering uses Svelte's auto-escaping. No `innerHTML`/`document.write`/`eval`/`new Function`.
- **Secrets:** Committed `.env`/`.env.example` contain only placeholders; `.gitignore` correctly ignores `.env` and `.env.*` while allow-listing `.env.example`/`.env.test`. `VITE_SUPABASE_ANON_KEY` is a public anon key by design. No private keys, tokens, or passwords in source.
- **Contact Edge Function:** Strict `validatePayload` with type + trim + length caps (name ≤100, email ≤254 + regex, subject ≤150, message ≤2000); atomic compare-and-swap rate limiting (5 req / 10 min / IP) via Deno KV; fail-closed CORS + production detection; spoof-resistant IP selection; no internal error detail leaked to clients (generic messages, details only to `console.error`).
- **Redirects:** `pricing/+page.svelte:39` sets `window.location.href` from the build-time constant `PUBLIC_APP_URL` plus internal `planId`/`billing` values — not attacker-controlled, no open-redirect.
- **Headers / crypto:** HSTS (preload), `frame-ancestors`/`X-Frame-Options`, `nosniff`, `Referrer-Policy`, `object-src 'none'`, `base-uri 'self'` all present; hash-based script CSP; SRI + `crossorigin` on the CDN font stylesheet; `force_https = true` in `fly.toml`. No weak hashing/ciphers (MD5/SHA1/DES/RC4) and no custom crypto in this package.
- **Regex DoS:** The email regexes (`contactFormValidation.ts`, Edge Function `isValidEmail`) use bounded, non-backtracking `[^\s@]+` character classes — no catastrophic backtracking.
- **Client-side storage:** `localStorage` used only for a non-sensitive `cookie_consent` flag, wrapped in try/catch for private-browsing.
