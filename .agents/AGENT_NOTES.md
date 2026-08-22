# Agent Notes — cross-project gotchas & review checklist

Cross-project lessons distilled from `.agents/MEMORY.md` (the full history with details lives there).
This is a quick checklist so the next agent doesn't step into the same traps.

**Read this BEFORE you:** write/fix tests, work on i18n, or do a code review.
Full rationale and concrete cases are in `.agents/MEMORY.md`.

Packages in this repo:
- `frontend/metacleaner-app` — SvelteKit SPA (adapter-static), Vitest 4 + Storybook 10 + Playwright
- `frontend/metacleaner-web` — marketing site, prerendered (adapter-static), Paraglide i18n
- `frontend/metacleaner-monitoring` — monitoring dashboard (adapter-node, SSR), Paraglide i18n
- `frontend/metacleaner-shared` — shared library (pricing UI)
- `terminal/metacleaner-cli` — Bun CLI
- `backend/metacleaner-server` — Go HTTP server

---

## 1) Environment

- **`bun` only** — `npm install` fails on the `workspace:*` protocol. Install: `curl -fsSL https://bun.sh/install | bash`, then add `$HOME/.bun/bin` to PATH.
- **Playwright browsers** live in `/opt/playwright-browsers` → run tests with `PLAYWRIGHT_BROWSERS_PATH=/opt/playwright-browsers`. If that path is read-only, install into `~/.playwright-browsers` and export that path.
- **System libraries for Chromium** (`libnspr4` etc.): `npx playwright install-deps chromium` (root). Without them, browser/storybook tests fail with `libnspr4.so: cannot open shared object file` — server-only tests (`bun run test`) still run.
- **Go backend** requires `exiftool` + `ffmpeg` in PATH to run locally.

## 2) Test tooling — recurring gotchas

### Vitest 4.x
- `vi.fn<() => Promise<void>>()` — a **single** type arg (the function signature), not the old 2-arg `vi.fn<[], T>()`.
- Mock functions used inside a `vi.mock()` factory must go through `vi.hoisted()` — a `const x = vi.fn()` declared before `vi.mock` is `undefined`.
- The path in `vi.mock(path)` must match the import **exactly** — for `.svelte.ts` files **without** the extension (`$lib/.../store.svelte`, not `.svelte.ts`/`.svelte.js`).
- A mocked module is a strict namespace — accessing a key the factory doesn't return throws. For property tests, add the missing keys as `undefined`.
- `new Response('', { status: 204 })` throws in Node (204 must not have a body) — use `status: 200` for the mock.

### vitest-browser-svelte (Svelte 5)
- `page.locator()` **does not exist** → use `container.querySelector()` or `page.getByRole()`/`getByText()`.
- `getByText('x')` defaults to **substring + case-insensitive** → strict-mode violations. Use `{ exact: true }`, `.first()`, or `getByRole('heading', { name })`.
- For text present twice in the DOM (mobile + desktop variants), use `expect(container.textContent).toContain('x')`.
- Elements in `lg:hidden`/`hidden lg:flex` are not in the accessibility tree at the desktop viewport → `getByRole` won't find them; use `container.querySelector()`.
- The `slots` option for a children snippet **does not work** in Svelte 5 — test structural props, not injected content.
- Browser tests default to **English** (Paraglide default locale) — write assertions against the English text.
- A missing component import takes down the whole browser test environment cascadingly — when several unrelated tests fail, look for an import error first.

### Bun vitest (CLI)
- `vi.stubGlobal`, `vi.unstubAllGlobals`, and the `importActual` factory arg in `vi.mock()` **don't work** in Bun (1.3.x) — verify correctness via tests that don't use them.
- `exifr.parse(blob)` hangs in Bun → needs a `FileReader` polyfill (extends `EventTarget`, implements `onloadend`, dispatches `load`+`loadend`). See `metacleaner-cli/src/polyfills.ts`.

### Go (backend)
- `pgregory.net/rapid`: `rapid.Check(t, fn)` takes only 2 args, no `WithMinSuccessfulTests` (the default is 100).
- The `buildJWT` test helper produces HS256 tokens, but the auth middleware only accepts ES256 (JWKS) → tests through protected endpoints get a 401 before they reach the logic under test. Test via auth-exempt endpoints or mock JWKS.

## 3) Recurring code-pattern checklist (review)

> Items 1–4 below are auto-checked by `scripts/check-patterns.sh` in each frontend project,
> wired into `bun run lint` (they gate). Run `bun run check:patterns` for the full audit
> including the noisier WARN checks (5–6), which are informational only.

These come back in **every** review — go through them before you call work done:

- [ ] **Hardcoded user-facing text instead of `tx()`** — the most common mistake. Look for raw text in `.svelte` and in `aria-label`/`title`/`placeholder`, in `{#if}` error branches, and in `$derived`/helper functions (not just element bodies). Then diff the keys defined in `en.json`/`cs.json` against the referenced ones — a defined-but-unreferenced key is either dead or a forgotten render.
- [ ] **`invalidate('custom:key')` without `depends('custom:key')`** → the retry/refresh button silently does nothing. Grep `depends(` and pair them up.
- [ ] **Runtime Tailwind arbitrary classes** `class="w-[${pct}%]"` / `h-[${...}]` never render (Tailwind only compiles literals seen at build time). Use `style="width:{pct}%"`.
- [ ] **`window.*` / `document.*` without `typeof window !== 'undefined'`** → fails in the node test environment (`browser: true` but `environment: 'node'`).
- [ ] **Dead i18n keys** after deleting a component/flow — grep all `tx('...')` across `.svelte`/`.ts` and diff against both JSON files. Watch out for dynamic keys (`cond ? 'a.b' : 'c.d'`, object literals `{ txKey: '...' }`) — a plain grep misses them.
- [ ] **Fabricated metrics presented as live data** — severity-based "estimates" / constants rendered as real values. When a property test passes, grep whether any `+page.server.ts` actually imports the tested function (outside `__tests__`). Prefer the honest `'—'` + "not available" pattern.

## 4) Process notes ("done" ≠ done)

- **A `tasks.md` / spec checkbox `[x]` ≠ the feature shipped.** Always verify each claimed-done requirement against the actual component. Watch for whole blocks wrapped in `<!-- ... -->` and callback params prefixed with `_` (intentionally-dropped data).
- **Green property tests ≠ the function is used.** Tests have validated functions that no route imports. After a test passes, grep for call sites outside `__tests__`.
- **`.kiro/specs/` target different packages** — `responsive-web-refactor`/`web-content-overhaul`/`about-*` → `metacleaner-web`; `monitoring-*` → `metacleaner-monitoring`; `metacleaner-backend`/CLI specs → backend/CLI. Read the spec's intro (target directory) before reviewing — otherwise you'll produce false "missing feature" findings.

---

Detailed individual cases (with line numbers and exact fixes): `.agents/MEMORY.md`.
