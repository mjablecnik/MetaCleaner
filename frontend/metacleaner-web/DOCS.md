# MetaCleaner Web — Documentation

## Environment Variables

Copy `.env.example` to `.env` before running locally. Environment variables are baked into the static build at compile time.

| Variable                 | Required         | Description                                                                     |
| ------------------------ | ---------------- | ------------------------------------------------------------------------------- |
| `PUBLIC_APP_URL`         | Yes              | URL of the MetaCleaner web app (e.g. `https://app.metacleaner.com`)             |
| `VITE_SUPABASE_URL`      | For contact form | Supabase project URL                                                            |
| `VITE_SUPABASE_ANON_KEY` | For contact form | Supabase anonymous (public) key                                                 |
| `BREVO_API_KEY`          | For contact form | Brevo API key set as a Supabase Edge Function secret (not in the browser build) |

`PUBLIC_APP_URL` must be set before `bun run build` — the build fails without it. The `.env.example` value (`https://app.metacleaner.com`) works for local development.

`BREVO_API_KEY`, `CONTACT_RECIPIENT`, `CONTACT_SENDER_EMAIL`, and `ALLOWED_ORIGINS` are Supabase Edge Function secrets deployed via `scripts/deploy-functions.sh`. They are never sent to the browser.

## Project Structure

```
frontend/metacleaner-web/
├── src/
│   ├── __tests__/               Unit tests for hooks
│   ├── app.d.ts                 Global type declarations
│   ├── app.html                 HTML shell
│   ├── hooks.server.ts          SvelteKit server hooks (CSP, locale redirect)
│   ├── hooks.ts                 SvelteKit client hooks (i18n rerouting)
│   └── lib/
│       ├── assets/
│       │   ├── favicon.svg
│       │   └── flags/           SVG flag icons (en.svg, cs.svg)
│       ├── components/
│       │   ├── LanguageSwitcher.svelte
│       │   ├── elements/        Atomic UI components (BrandLogo, CtaButton, …)
│       │   └── shared/          Layout-level components (SiteNavbar, MobileNavbar, MobileMenu, SeoHead, …)
│       ├── i18n.ts              Paraglide i18n helpers
│       ├── paraglide/           Generated i18n runtime (do not edit manually)
│       ├── repositories/        Data factories (audience, faq, features, pricing, stats, steps, …)
│       ├── shared/sections/     SiteFooter.svelte
│       └── utils/               brevoClient.ts, contactFormValidation.ts
├── src/routes/
│   ├── (home)/                  Home page sections and components
│   ├── about/                   About & Contact page
│   ├── error/                   Error page components
│   ├── features/                Features page
│   ├── pricing/                 Pricing page
│   ├── privacy/                 Privacy policy page
│   ├── terms/                   Terms of service page
│   ├── sitemap.xml/             Sitemap endpoint (prerendered)
│   ├── +error.svelte            Global error page
│   ├── +layout.svelte           Root layout (navbar, footer, cookie banner)
│   ├── +layout.ts               Sets prerender = true
│   └── layout.css               Global CSS (Tailwind base styles)
├── messages/
│   ├── en.json                  English i18n strings
│   └── cs.json                  Czech i18n strings
├── e2e/                         Playwright end-to-end tests
├── scripts/
│   ├── build.sh                 Build Docker image
│   ├── deploy.sh                Deploy to Fly.io
│   ├── deploy-functions.sh      Deploy Supabase Edge Functions
│   ├── start-docker.sh          Build image and run nginx container locally
│   └── stop-docker.sh           Stop and remove the local container
├── supabase/
│   └── config.toml              Supabase project config
├── static/                      Static assets (og-default.png, robots.txt, site.webmanifest)
├── Dockerfile                   Multi-stage: bun build → nginx serve
├── fly.toml                     Fly.io deployment config
├── nginx.conf                   nginx server config for the Docker container
├── playwright.config.ts         Playwright e2e config
└── vite.config.ts               Vite + SvelteKit + Vitest config
```

## Deployment

### Docker (local preview)

Build and start the nginx container locally:

```sh
scripts/start-docker.sh    # builds image, starts container on http://localhost:3001
scripts/stop-docker.sh     # stops and removes the container
```

The Dockerfile must be built from the **workspace root** (not the project directory) because it copies shared workspace packages:

```sh
docker build -f frontend/metacleaner-web/Dockerfile \
  --build-arg PUBLIC_APP_URL=https://app.metacleaner.com \
  -t metacleaner-web .
```

### Fly.io

```sh
scripts/deploy.sh                   # deploy using .env-prod
scripts/deploy.sh --env staging     # deploy using .env-staging
```

The script creates the Fly app if needed, syncs secrets from the env file (skipping keys already in `fly.toml [env]`), then runs `fly deploy`.

Requires the [Fly.io CLI](https://fly.io/docs/hands-on/install-flyctl/) and a Fly account with access to the `metacleaner-web` app.

### Supabase Edge Functions

The contact form calls a Supabase Edge Function (`send-contact-email`) that sends email via Brevo. Deploy or update it with:

```sh
scripts/deploy-functions.sh               # deploy to development
scripts/deploy-functions.sh --env prod    # deploy to production
```

Requires the [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started) and a logged-in session (`supabase login`). Secrets (`BREVO_API_KEY`, etc.) are read from `.env` (dev) or `.env.production` (prod).

### Static host (Netlify, Vercel, Cloudflare Pages, S3, etc.)

1. Run `bun run build`
2. Upload the contents of `build/` to your host
3. Configure URL rewrites to serve `200.html` for unmatched paths (enables client-side navigation)

## Testing

### Unit tests

```sh
bun run test:unit          # run in watch mode
bun run test:unit -- --run # run once (CI)
```

Unit tests use Vitest. Server-only tests run in a Node.js environment; Svelte component tests run in a headless Chromium browser via `@vitest/browser-playwright`.

### End-to-end tests

```sh
bun run test:e2e           # install Playwright browsers then run all e2e tests
```

E2E tests use Playwright against a built preview server (`npm run build && npm run preview` on port 4173). Test files live in `e2e/` and match `*.e2e.ts`.

On Linux, first-time setup may require:

```sh
npx playwright install-deps chromium   # requires sudo
```

### Run all tests

```sh
bun run test               # unit tests (once) + e2e tests
```

## Troubleshooting

**Build fails with "PUBLIC_APP_URL is not defined"**
Set `PUBLIC_APP_URL` in your `.env` file before running `bun run build`. The `.env.example` value works for local development.

**E2E tests fail immediately**
Playwright browsers must be installed first: `npx playwright install chromium`. On Linux also run `npx playwright install-deps chromium` (requires sudo).

**Contact form doesn't send email**
Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`, and ensure the `send-contact-email` Edge Function is deployed with a valid `BREVO_API_KEY` secret.

**Docker build fails with "package not found"**
The Dockerfile must be built from the **workspace root**, not from `frontend/metacleaner-web/`. Use `scripts/build.sh` or the docker command shown above.

**Language switcher loops or reloads unexpectedly**
The locale strategy is `['url', 'cookie', 'preferredLanguage', 'baseLocale']`. Scroll position is restored after locale switch via `sessionStorage`. If routing breaks, clear `sessionStorage` and cookies in the browser.
