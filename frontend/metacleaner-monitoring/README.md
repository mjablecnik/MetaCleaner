# metacleaner-monitoring

SvelteKit 2 monitoring dashboard with Svelte 5 runes, Tailwind CSS v4, paraglide-js i18n, and Plotly charts.

## Prerequisites

- Node.js 22+
- [Bun](https://bun.sh/) (primary package manager) or npm

## Install dependencies

```sh
bun install
# or: npm install
```

## Environment setup

Copy `.env.example` to `.env` and fill in your service credentials before running the app:

```sh
cp .env.example .env
```

The app requires at minimum `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`. Other variables
(`FLY_API_TOKEN`, `CLOUDFLARE_API_TOKEN`, `SENTRY_DSN`, `STRIPE_SECRET_KEY`, etc.) enable
the corresponding dashboard sections.

## Development

```sh
bun run dev
# or: npm run dev

# or start the server and open the app in a new browser tab
bun run dev -- --open
```

## Build

```sh
bun run build
# or: npm run build
```

Preview the production build locally:

```sh
bun run preview
# or: npm run preview
```

Start the production server (after build):

```sh
node build/index.js
```

## Docker

```sh
docker build -t metacleaner-monitoring .
docker run -p 3000:3000 metacleaner-monitoring
```

## Lint & type-check

```sh
bun run lint
# or: npm run lint

bun run check
# or: npm run check
```

## Tests

```sh
bun run test
# or: npm run test
```

Unit tests use Vitest with Playwright browser provider; E2E tests use Playwright. The first run
will automatically download required browser binaries.

> **Note:** If `PLAYWRIGHT_BROWSERS_PATH` is set to a read-only directory, install browsers to
> a writable path instead:
>
> ```sh
> PLAYWRIGHT_BROWSERS_PATH=~/.playwright-browsers npx playwright install chromium
> PLAYWRIGHT_BROWSERS_PATH=~/.playwright-browsers npm run test:unit -- --run
> ```
