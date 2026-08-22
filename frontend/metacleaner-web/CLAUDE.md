# MetaCleaner Web — AI Agent Guide

Marketing website for MetaCleaner. SvelteKit 2 + Svelte 5, Tailwind CSS v4, Paraglide i18n, fully pre-rendered static site via `@sveltejs/adapter-static`. Deployed as a Docker/nginx container on Fly.io.

## Key Commands

```sh
bun run dev              # dev server at http://localhost:5173
bun run build            # static site → build/
bun run preview          # serve build/ at http://localhost:4173
bun run check            # TypeScript + Svelte type check
bun run lint             # Prettier + ESLint
bun run format           # auto-format
bun run test:unit        # Vitest unit tests (watch)
bun run test:unit -- --run  # Vitest unit tests (once, for CI)
bun run test:e2e         # Playwright e2e tests
bun run test             # unit (once) + e2e

scripts/start-docker.sh  # build Docker image and run on http://localhost:3001
scripts/stop-docker.sh   # stop the local container
scripts/deploy.sh        # deploy to Fly.io (reads .env.prod by default)
scripts/deploy-functions.sh  # deploy Supabase Edge Functions
```

## Project Structure

```
src/
  __tests__/         hooks unit tests
  hooks.server.ts    server hooks: CSP header, locale redirect
  hooks.ts           client hooks: Paraglide i18n URL rerouting
  lib/
    assets/flags/    SVG flag icons: en.svg, cs.svg
    components/
      elements/      atomic UI components
      shared/        layout components (SiteNavbar, MobileMenu, SeoHead, …)
    paraglide/       generated i18n runtime — DO NOT edit
    repositories/    data factories: audience, faq, features, metadataDemo, stats, steps
    shared/sections/ SiteFooter.svelte
    utils/           brevoClient.ts, contactFormValidation.ts
  routes/
    (home)/          home page sections
    about/           About + Contact page (contact form → Supabase Edge Function)
    features/        Features page
    pricing/         Pricing page
    privacy/         Privacy policy
    terms/           Terms of service
    sitemap.xml/     Sitemap server endpoint
    +layout.ts       exports prerender = true
messages/
  en.json, cs.json   i18n strings (source of truth; paraglide/ is generated)
e2e/                 Playwright tests (*.e2e.ts)
scripts/             shell scripts for build, deploy, Docker
supabase/            Supabase config
```

## Conventions

- **Svelte 5 runes mode** enforced for all non-library files (`compilerOptions.runes` in vite.config.ts). Use `$state`, `$derived`, `$effect`, `$props`.
- **Tailwind CSS v4** — utility classes only, no `tailwind.config.js`. CSS variables defined in `layout.css`.
- **i18n**: add strings to `messages/en.json` and `messages/cs.json`; import from `$lib/paraglide/messages.js` (auto-generated). Never edit `src/lib/paraglide/` directly.
- **Repositories** (`src/lib/repositories/`) return plain objects/arrays of content data; they are not API clients.
- **Stories files** (`*.stories.svelte`) are Storybook story files co-located with components; they are not tests.
- **Test files**: unit tests use `.test.ts` suffix; e2e tests use `.e2e.ts` suffix and live in `e2e/`.
- **Env vars**: `PUBLIC_*` are inlined into the browser build by SvelteKit. `VITE_*` are available at build time and in the browser. Neither should hold secrets.
- The Dockerfile must be built from the **workspace root** (not this directory) — it copies shared workspace packages.

## Important Notes

- **Prerendering**: all pages are prerendered at build time (`prerender = true` in `+layout.ts`). There is no server at runtime — nginx serves static files. The fallback `200.html` handles client-side navigation for routes not known at build time.
- **Contact form** calls a Supabase Edge Function (`send-contact-email`). It requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` at build time and a deployed Edge Function with the `BREVO_API_KEY` secret.
- **Workspace**: this package depends on `metacleaner-shared` via `workspace:*`. Always run `bun install` from the workspace root, not from this directory alone.
- **Docker context**: `scripts/build.sh` runs docker from the workspace root automatically. If building manually, you must run from the root.
- **Fly.io deploy**: `scripts/deploy.sh` reads `.env.prod` by default. Pass an environment name as the first argument (e.g. `scripts/deploy.sh staging`) to use `.env.staging` instead.

## Reference

Cross-project testing gotchas, review checklist (i18n, runtime Tailwind classes, SSR `window` guards) and process notes: **[../../.agents/AGENT_NOTES.md](../../.agents/AGENT_NOTES.md)** — read before writing tests, touching i18n, or doing code review.

See [DOCS.md](DOCS.md) for environment variables, deployment steps, and troubleshooting.
