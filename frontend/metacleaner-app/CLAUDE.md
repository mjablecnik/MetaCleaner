# MetaCleaner App — AI Agent Guide

SvelteKit 2 + Svelte 5 frontend for metadata cleaning. Static SPA served via nginx/Docker or Fly.io.

## Key Commands

```bash
bun install                  # Install dependencies (bun only — npm fails on workspace:*)
bun run dev                  # Dev server (port 5173)
bun run build                # Production build → ./build
bun run preview              # Preview production build locally
bun run check                # Type check (svelte-check)
bun run lint                 # Prettier + ESLint check
bun run format               # Auto-format
bun run test                 # Server-side unit tests (Node, no browser required)
bun run test:browser         # Browser + Storybook tests (requires Playwright)
bun run test:e2e             # Playwright E2E tests
bun run storybook            # Storybook dev server (port 6006)
scripts/start-docker.sh      # Build Docker image + run on port 3000
scripts/stop-docker.sh       # Stop Docker container
scripts/deploy.sh            # Deploy to Fly.io (creates app if missing, reads .env.prod)
scripts/deploy.sh staging    # Deploy using .env.staging instead
scripts/sync-android.sh      # Build + sync web assets to Android (Capacitor)
```

## Tech Stack

- **Framework**: SvelteKit 2 with Svelte 5 (runes mode — always)
- **Language**: TypeScript 6 (strict mode)
- **Package Manager**: bun (`workspace:*` protocol — npm install will fail)
- **Styling**: Tailwind CSS 4 (dark navy theme, utility-first)
- **i18n**: Paraglide JS — `messages/en.json` + `messages/cs.json`
- **Testing**: Vitest 4 (server + browser projects) + Storybook 10 + Playwright E2E
- **Mobile**: Capacitor 8 (Android)
- **Build output**: `@sveltejs/adapter-static` (pure SPA, no SSR)
- **Auth**: JWT in localStorage via backend proxy
- **Shared**: `metacleaner-shared` workspace package (pricing UI shared with metacleaner-web)

## Project Structure

```
frontend/metacleaner-app/
├── src/
│   ├── lib/
│   │   ├── auth/              # Auth store, API client, route guards, deep-link
│   │   ├── clients/           # HTTP/WebSocket API clients (pure I/O, no business logic)
│   │   ├── services/          # CleaningService (upload → WS → results)
│   │   ├── scanner/           # Client-side metadata parsing + risk analysis
│   │   ├── stores/            # Global $state stores (appState, billingStore, etc.)
│   │   ├── repositories/      # Static data factories (languages, settings, docs content)
│   │   ├── shared/
│   │   │   ├── elements/      # Low-level UI primitives (Button, Badge, Card…)
│   │   │   ├── components/    # Mid-level composed UI (NavBar, Toast…)
│   │   │   ├── sections/      # Shared page sections
│   │   │   └── utils/         # tx(), format(), planStyleMap, riskStyles, etc.
│   │   ├── types/             # Shared TypeScript types (billing, processing, report)
│   │   ├── assets/            # Static SVGs/images
│   │   ├── paraglide/         # Generated i18n runtime (auto-generated — do not edit)
│   │   └── locale.svelte.ts   # Locale state + initLocale()
│   └── routes/
│       ├── (step1)/           # File upload + scan (wizard step 1)
│       ├── (auth)/            # Login, register, forgot-password, email-verified
│       ├── email-changed/     # Email change confirmation callback
│       ├── docs/              # API docs (sub-routes: auth, endpoints, errors)
│       ├── report/[id]/       # Report detail page
│       ├── reports/           # Report history list
│       ├── settings/          # User settings
│       ├── subscription/      # Subscription plans
│       ├── sections/          # Wizard step sections (Step1Idle–Step5Success)
│       ├── +page.svelte       # Root page — wizard step router (steps 1–5)
│       └── +layout.svelte     # Global layout (NavBar, auth guard, billing sync)
├── messages/                  # i18n message files (en.json, cs.json)
├── e2e/                       # Playwright E2E tests
├── scripts/                   # Shell scripts (build, deploy, docker, android)
├── Dockerfile                 # Multi-stage build (must be run from workspace root)
├── fly.toml                   # Fly.io deployment config
├── nginx.conf                 # Production nginx config (SPA fallback)
└── .env.example               # Environment variable template
```

## Conventions

### Component hierarchy

- `elements/` → single-responsibility primitives (no state, no business logic)
- `components/` → composed UI from elements (may have local state)
- `sections/` → page-level sections (may connect to stores)
- Route-local components go in `routes/<route>/components/` or `routes/<route>/sections/`

### Svelte 5 runes

- Always use runes: `$state`, `$derived`, `$effect`, `$props`
- Never use `$:` reactive declarations — runes only
- For reactive date values: `$state<number | null>` + `Date.now()`, not `$state<Date>` (ESLint bans it)
- Don't wrap inline children in `{#snippet children()}` — triggers `svelte/no-useless-children-snippet`

### i18n

- All user-facing text — including `aria-label`, `title`, `placeholder` — goes through `tx()` from `$lib/shared/utils/i18n`
- `void locale.current;` (not bare expression) — ESLint `no-unused-expressions` enforces this
- Never `tx('key') || 'fallback'` — missing keys return the key name visibly

### Navigation

- Wrap `goto()` and `href` with `resolve()` from `$app/paths` and cast to `Pathname` from `$app/types`
- Use `$app/state` (not deprecated `$app/stores`) for page state

### Styling

- Tailwind utility classes only — no custom component classes
- Computed widths: use `style="width:{pct}%"` not `class="w-[{pct}%]"` — dynamic arbitrary classes are never compiled
- Icons: Font Awesome (`fa-solid fa-*`)

### Testing

- `vi.mock` path must match the import path exactly — no `.js` extension for `.svelte.ts` files
- `vi.hoisted()` required for mock functions referenced in `vi.mock()` factories
- `vi.fn<() => Promise<void>>()` — single function-type arg (Vitest 4.x)
- Browser tests default to English locale — use English text in assertions
- `new Response('', { status: 204 })` throws in Node — use `status: 200` for mocks

## Important Notes

- **bun only**: `npm install` fails on `workspace:*` — always use `bun`
- **Docker context**: build from workspace root, not from this directory: `docker build -f frontend/metacleaner-app/Dockerfile .`
- **PUBLIC_API_URL baked at build time**: uses `$env/static/public`; pass via `--build-arg` for Docker/Fly.io — `fly secrets set` has no effect on the static bundle
- **Playwright browsers**: `npx playwright install chromium && npx playwright install-deps chromium`; in this environment set `PLAYWRIGHT_BROWSERS_PATH=/opt/playwright-browsers`
- **Paraglide sync**: after adding new `PUBLIC_*` env vars, run `bunx svelte-kit sync` to regenerate ambient types
- **Storybook browser tests**: 68 pre-existing unhandled errors from autodocs; `bun run test` (server-only) is the reliable CI command
- **Wizard steps 1–5 share the root `/` route** — no separate `/step2`, `/step3` etc.; transitions are controlled by `appState` store

## Reference

Cross-project testing gotchas, review checklist (i18n, runtime Tailwind classes, SSR `window` guards) and process notes: **[../../.agents/AGENT_NOTES.md](../../.agents/AGENT_NOTES.md)** — read before writing tests, touching i18n, or doing code review.

For environment variables, deployment, testing, and troubleshooting: **[DOCS.md](./DOCS.md)**

For full architecture, component patterns, and coding standards: **[.kiro/steering/metacleaner-frontend.md](../../.kiro/steering/metacleaner-frontend.md)**

## Svelte MCP Tools

You have access to the Svelte MCP server with Svelte 5 and SvelteKit documentation.

**list-sections** — Call first to discover all documentation sections. Use whenever asked about a Svelte/SvelteKit topic.

**get-documentation** — Fetch full content for specific sections. After `list-sections`, fetch ALL sections relevant to the task.

**svelte-autofixer** — Analyzes Svelte code for issues. Run before finalizing any Svelte component. Keep calling until no issues remain.

**playground-link** — Generates a Svelte Playground link. Only call after user confirms; never for code written to project files.
