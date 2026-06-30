## Project Overview

SvelteKit 2 + Svelte 5 monitoring dashboard. Aggregates data from Supabase, Fly.io, Cloudflare, Sentry, and Stripe into nine read-only dashboard pages. Server-rendered with adapter-node. Password-protected (cookie session).

**Stack:** SvelteKit 2, Svelte 5 (runes-only), TypeScript, Tailwind CSS v4, Paraglide.js (i18n), Vitest, Playwright, Storybook.

## Key Commands

```sh
bun run dev           # dev server (hot reload)
bun run build         # production build → build/
node build/index.js   # start production server
bun run preview       # preview production build on port 4173

bun run lint          # prettier + eslint check
bun run format        # auto-format with prettier
bun run check         # svelte-kit sync + svelte-check (type errors)

bun run test:unit     # vitest (server + browser-chromium projects)
bun run test:e2e      # playwright E2E (builds + previews first)
bun run test          # both

bun run storybook           # Storybook dev on port 6006
bun run build-storybook     # build storybook → storybook-static/

./scripts/start-docker.sh   # docker build + run on port 3002
./scripts/stop-docker.sh    # stop container
./scripts/deploy.sh         # deploy to Fly.io (reads .env-prod by default)
./scripts/deploy.sh --env staging  # use .env-staging
```

## Project Structure

```
src/
  hooks.server.ts        — rate limit, auth guard, CSP headers, paraglide
  lib/
    server/
      config.ts          — reads env vars; throws on missing SUPABASE_* at startup
      dashboardAlerts.ts — merges Sentry + Fly alerts, deduplicates by ID
      clients/           — one file per API (flyClient, cloudflareClient, sentryClient, stripeClient, supabaseClient)
      mappers/           — transform raw API responses → page data shapes
    repositories/        — client-side data types and static repos
    components/          — shared Svelte components
    paraglide/           — GENERATED i18n runtime (do not edit)
  routes/
    +page.{server,svelte}  — dashboard home (/)
    login/               — login (/login)
    business/            — business metrics
    chyby/               — errors (Czech slug)
    databaze/            — database
    dostupnost/          — availability
    edge/                — edge/CDN
    performance/         — performance
    runtime/             — runtime / infrastructure
    uzivatele/           — users (Czech slug)
messages/
  en.json / cs.json      — i18n strings (English / Czech)
scripts/                 — shell helpers (build, deploy, docker)
fly.toml                 — Fly.io config (region fra, port 3000)
Dockerfile               — multi-stage: Bun build → Node 22 runtime
```

## Conventions

- **Svelte 5 runes everywhere** — `$state`, `$derived`, `$effect`, `$props`. Runes mode is forced via `vite.config.ts` compilerOptions.
- **Route co-location** — each route directory contains `+page.server.ts`, `+page.svelte`, a `components/` folder, and a `sections/` folder with named section components.
- **Server-only code** lives under `src/lib/server/` — never import from there in `.svelte` files or client-side modules.
- **i18n** — all user-visible strings go through Paraglide. Add keys to `messages/en.json` and `messages/cs.json`; run `bun run build` or the dev server to regenerate `src/lib/paraglide/`.
- **Section isolation** — each `+page.server.ts` calls `callSection()` around each API call so one failing integration does not crash the whole page.
- **No client-side data fetching** — all data is loaded server-side in `+page.server.ts` load functions.

## Important Notes

- `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are required — the server exits with `[FATAL]` if either is absent.
- `DASHBOARD_SESSION_SECRET` is **not** in `.env.example` but is required for login to work. Add it manually.
- Sentry integration uses `SENTRY_AUTH_TOKEN` / `SENTRY_ORG` / `SENTRY_PROJECT` — **not** `SENTRY_DSN` (which appears in `.env.example` but is unused in server code).
- `invalidate('app:<route>')` only re-runs loads that called `depends('app:<route>')`. Without the matching `depends()`, the retry button is a no-op.
- `mergeAndSortAlerts` deduplicates alerts by ID before slicing to 10. Duplicate Sentry issue IDs from the same `id` field would otherwise cause property-test failures.
- Docker: `start-docker.sh` maps container port 3000 → host port **3002** (not 3000).
- Storybook 10 is configured for `@storybook/sveltekit`; browser-based Vitest runs under the `client` project using Playwright provider.

## Reference

See [DOCS.md](DOCS.md) for environment variable details, deployment instructions, and troubleshooting.
