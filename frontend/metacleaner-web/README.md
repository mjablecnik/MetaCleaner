# MetaCleaner Web

Marketing website for the MetaCleaner service — a SvelteKit 2 static site with Tailwind CSS, Paraglide i18n (English and Czech), and SVG flag icons. Built with `@sveltejs/adapter-static` so the output is a pre-rendered static site deployable to any CDN or static host without a Node.js server.

## Prerequisites

- **Node.js 22+** — [nodejs.org](https://nodejs.org)
- **Bun** — [bun.sh](https://bun.sh) (used as package manager and build tool)
  ```sh
  curl -fsSL https://bun.sh/install | bash
  ```
- Supported OS: Linux, macOS, WSL

## Quick Start

```sh
# 1. Clone the repository
git clone <repo-url>
cd frontend/metacleaner-web

# 2. Install dependencies
bun install

# 3. Copy environment config (PUBLIC_APP_URL is required for build — see .env.example)
cp .env.example .env

# 4. Start the dev server
bun run dev
```

The dev server starts at `http://localhost:5173`.

## Environment Configuration

Copy `.env.example` to `.env` before running locally:

```sh
cp .env.example .env
```

| Variable                 | Required         | Description                                                         |
| ------------------------ | ---------------- | ------------------------------------------------------------------- |
| `PUBLIC_APP_URL`         | Yes              | URL of the MetaCleaner web app (e.g. `https://app.metacleaner.com`) |
| `VITE_SUPABASE_URL`      | For contact form | Supabase project URL                                                |
| `VITE_SUPABASE_ANON_KEY` | For contact form | Supabase anonymous key                                              |

`PUBLIC_APP_URL` is baked into the static build at compile time — the build will fail without it. The `.env.example` provides a default value (`https://app.metacleaner.com`) suitable for local development.

## Scripts

### Development

| Script            | Description                                                                  |
| ----------------- | ---------------------------------------------------------------------------- |
| `bun run dev`     | Start Vite dev server with hot module replacement at `localhost:5173`        |
| `bun run preview` | Serve the production `build/` directory locally to preview the static output |

### Type Checking and Linting

| Script                | Description                                                                     |
| --------------------- | ------------------------------------------------------------------------------- |
| `bun run check`       | Run `svelte-kit sync` then `svelte-check` for TypeScript and Svelte type errors |
| `bun run check:watch` | Same as `check` but re-runs on every file save                                  |
| `bun run lint`        | Check formatting with Prettier and run ESLint                                   |
| `bun run format`      | Auto-format all files with Prettier                                             |

### Testing

| Script              | Description                                                |
| ------------------- | ---------------------------------------------------------- |
| `bun run test:unit` | Run Vitest unit tests in watch mode                        |
| `bun run test`      | Run all tests: unit tests (once) then Playwright e2e tests |
| `bun run test:e2e`  | Install Playwright browsers then run end-to-end tests      |

> **Playwright browsers** are an optional dependency for e2e tests. Run `npx playwright install chromium` once before `test:e2e`. On Linux you may also need `npx playwright install-deps chromium` (requires sudo).

### Build

| Script          | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| `bun run build` | Compile a production static site into the `build/` directory |

## Adapter

This project uses [`@sveltejs/adapter-static`](https://kit.svelte.dev/docs/adapter-static). On `bun run build`, SvelteKit emits a `build/` directory of static HTML, CSS, and JS files with no server runtime. A fallback `index.html` is configured so client-side routing works on static hosts that lack server-side rewrite rules.

The root layout sets `export const ssr = false` and `export const prerender = false`, making all pages render client-side as a single-page application.

## Deployment

### Docker (recommended)

```sh
./start-docker.sh
```

Builds a production image and starts an nginx container serving the static site.

### Static host (Netlify, Vercel, Cloudflare Pages, S3, etc.)

1. Run `bun run build`
2. Upload the contents of `build/` to your host
3. Configure URL rewrites to serve `index.html` for all paths (for client-side routing)

## Project Structure

```
src/
  lib/
    assets/flags/      SVG flag icons (gb.svg, cz.svg) used by LanguageSwitcher
    repositories/      Data factories (faq.ts, audience.ts, …)
    shared/sections/   Shared layout components (SiteFooter.svelte, …)
  routes/
    (home)             Home page sections
    features/          Features page
    pricing/           Pricing page
messages/              Paraglide i18n JSON files (en.json, cs.json)
```

## Author

Martin Jablečník
