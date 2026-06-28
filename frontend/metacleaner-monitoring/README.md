# metacleaner-monitoring

SvelteKit 2 monitoring dashboard with Svelte 5 runes, Tailwind CSS v4, paraglide-js i18n, and Plotly charts.

## Prerequisites

- Node.js 22+
- [Bun](https://bun.sh/) (primary package manager)

## Install dependencies

```sh
bun install
```

## Development

```sh
bun run dev

# or start the server and open the app in a new browser tab
bun run dev -- --open
```

## Build

```sh
bun run build
```

Preview the production build locally:

```sh
bun run preview
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
bun run check
```

## Tests

```sh
bun run test
```

Unit tests use Vitest; E2E tests use Playwright. The first run of `bun run test` (or `bun run test:e2e`) will automatically download required browser binaries.
