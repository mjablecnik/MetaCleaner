# metacleaner-app

A SvelteKit 5 + Tailwind CSS 4 frontend app for metadata cleaning, with Storybook, Paraglide i18n, and Capacitor support.

## Tech Stack

- **Framework**: SvelteKit 2 with Svelte 5 (runes mode)
- **Language**: TypeScript
- **Package Manager**: bun
- **Styling**: Tailwind CSS 4
- **i18n**: Paraglide JS (en, cs)
- **Testing**: Vitest (server tests) + Vitest Browser with Playwright (component tests)
- **Stories**: Storybook 10
- **Build output**: Static site via `@sveltejs/adapter-static`

## Prerequisites

- Node.js 22+
- [bun](https://bun.sh) (or npm/pnpm/yarn as fallback)

## Setup

Install dependencies:

```sh
bun install
# or: npm install
```

For component tests (browser), install Playwright browsers:

```sh
npx playwright install chromium
# On Linux, also install system dependencies:
npx playwright install-deps chromium
```

## Developing

Start the development server:

```sh
bun run dev

# or open in browser automatically
bun run dev -- --open
```

## Building

```sh
bun run build
```

Preview the production build:

```sh
bun run preview
```

## Testing

Run all tests:

```sh
bun test
```

Run only server-side unit tests (no browser required):

```sh
bun run test:unit -- --run --project=server
```

Run Storybook:

```sh
bun run storybook
```

## Linting & Formatting

```sh
bun run lint      # prettier check + eslint
bun run format    # auto-format with prettier
bun run check     # TypeScript type check
```

## Recreating this project

```sh
bun x sv@0.15.3 create --template minimal --types ts --add prettier eslint vitest="usages:unit,component" tailwindcss="plugins:typography,forms" sveltekit-adapter="adapter:auto" paraglide="languageTags:en, cs+demo:no" mcp="ide:claude-code,other+setup:remote" storybook --install bun metacleaner-app
```
