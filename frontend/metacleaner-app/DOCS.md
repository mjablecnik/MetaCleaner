# MetaCleaner App — Documentation

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Project Structure](#project-structure)
3. [Build & Deployment](#build--deployment)
4. [Testing](#testing)
5. [Internationalization](#internationalization)
6. [Mobile (Capacitor)](#mobile-capacitor)
7. [Troubleshooting](#troubleshooting)

---

## Environment Variables

All variables are loaded at **build time** via SvelteKit's `$env/static/public`. They are baked into the JS bundle and cannot be changed at runtime.

| Variable                    | Default                 | Required | Description                                           |
| --------------------------- | ----------------------- | -------- | ----------------------------------------------------- |
| `PUBLIC_API_URL`            | `http://localhost:8080` | Yes      | Backend API base URL (no trailing slash)              |
| `PUBLIC_PRIVACY_POLICY_URL` | —                       | No       | Privacy policy URL shown in registration consent text |

Reference: `.env.example`

### Important Notes

- `PUBLIC_API_URL` is resolved during `vite build`. For production, pass it as a build argument:
  ```bash
  PUBLIC_API_URL=https://api.your-domain.com bun run build
  ```
- For Fly.io deployment, use `--build-arg` (not `fly secrets set`):
  ```bash
  fly deploy --build-arg PUBLIC_API_URL=https://api.your-domain.com
  ```

---

## Project Structure

```
frontend/metacleaner-app/
├── src/
│   ├── lib/
│   │   ├── auth/                    # Authentication module (store, API client, guards)
│   │   ├── clients/                 # API client layer (HTTP + WebSocket, pure I/O)
│   │   ├── services/                # Business logic / orchestration (CleaningService)
│   │   ├── scanner/                 # Client-side metadata scanning (shared with CLI)
│   │   ├── stores/                  # Global reactive state ($state-based)
│   │   ├── repositories/            # Static UI config (languages, user placeholder)
│   │   ├── shared/
│   │   │   ├── elements/            # Low-level UI primitives (Button, Badge, Card…)
│   │   │   ├── components/          # Mid-level composed UI (NavBar, Toast…)
│   │   │   └── sections/            # Shared page sections
│   │   ├── types/                   # Shared TypeScript types
│   │   ├── assets/                  # Static assets (SVGs, images)
│   │   ├── paraglide/               # Generated i18n runtime (auto-generated)
│   │   └── locale.svelte.ts         # Locale state + initLocale()
│   └── routes/
│       ├── (step1)/                 # File upload + scan (wizard step 1)
│       ├── (auth)/                  # Login, register, forgot-password, email-verified
│       ├── email-changed/           # Email change confirmation callback
│       ├── docs/                    # API documentation (auth, endpoints, errors)
│       ├── report/[id]/             # Report detail page
│       ├── reports/                 # Report history list
│       ├── settings/                # User settings
│       ├── subscription/            # Subscription plans
│       ├── sections/                # Wizard step sections (Step1Idle–Step5Success)
│       ├── +page.svelte             # Root page — wizard step router (steps 1–5)
│       └── +layout.svelte           # Global layout (NavBar, auth guard, billing sync)
├── messages/                        # i18n message files (en.json, cs.json)
├── static/                          # Static assets served as-is
├── e2e/                             # Playwright E2E tests
├── scripts/                         # Shell scripts (build, deploy, docker, android)
├── package.json
├── svelte.config.js
├── vite.config.ts
├── tsconfig.json
├── Dockerfile
├── nginx.conf                       # Production nginx config (SPA fallback)
├── fly.toml                         # Fly.io deployment config
└── .env.example                     # Environment variable template
```

---

## Build & Deployment

### Local Development

```bash
bun install            # Install dependencies
bun run dev            # Start Vite dev server (port 5173)
```

### Production Build

```bash
bun run build          # Outputs to ./build (static SPA)
bun run preview        # Preview production build locally
```

### Local Docker

```bash
scripts/start-docker.sh      # Build image + run on port 3000 (reads PUBLIC_API_URL from .env)
scripts/stop-docker.sh       # Stop container
```

### Fly.io Deployment

```bash
scripts/deploy.sh                                  # Deploy (creates app if missing, reads .env-prod)
fly logs --app metacleaner-app                     # View logs
fly status --app metacleaner-app                   # Check status
```

---

## Testing

### Three Test Layers

| Layer             | Command                | Environment                 | Description                            |
| ----------------- | ---------------------- | --------------------------- | -------------------------------------- |
| Server-side unit  | `bun run test`         | Node (Vitest)               | Services, utilities, stores            |
| Browser component | `bun run test:browser` | Playwright browser (Vitest) | Rendered Svelte components + Storybook |
| E2E               | `bun run test:e2e`     | Playwright                  | Full page flows, all routes            |

### Running Tests

```bash
bun run test              # Server-side unit tests (single run)
bun run test:browser      # Browser + Storybook tests (requires: npx playwright install chromium)
bun run test:e2e          # Playwright E2E (requires: npx playwright install)
bun run storybook         # Storybook dev server (port 6006)
```

### Test Conventions

- Server tests: standard Vitest (`describe`, `it`, `expect`, `vi`)
- Browser tests: use `vi.hoisted()` for mocks referenced in `vi.mock()` factories
- `vi.mock` path must match import path exactly (no `.js` extension for `.ts` files)
- Browser tests default to English locale — use English text in assertions
- `new Response('', { status: 204 })` throws in Node — use `status: 200` for mocks

---

## Internationalization

The app supports two languages: English (`en`) and Czech (`cs`).

### Message Files

- `messages/en.json` — English translations
- `messages/cs.json` — Czech translations

### Usage Pattern

```typescript
import { locale } from '$lib/locale.svelte';
import * as m from '$lib/paraglide/messages';

function tx(key: string): string {
	void locale.current; // reactive dependency — REQUIRED
	const fn = (m as unknown as Record<string, (() => string) | undefined>)[key];
	return fn ? fn() : key;
}
```

### Key Rules

- All user-facing text goes through i18n — never hardcode strings in templates
- Message keys use dot notation: `step1.header.title`, `common.brandName`
- Use `void locale.current;` (not bare expression) to satisfy ESLint

---

## Mobile (Capacitor)

The app runs as an Android app via Capacitor.

### Setup

```bash
scripts/sync-android.sh              # Build + sync web assets to Android
bunx cap open android                # Open in Android Studio
bunx cap run android                 # Run on device/emulator
```

### Live Reload (during development)

```bash
bunx cap run android --livereload --external
```

### Deep Links

OAuth and magic link callbacks use Android App Links. The backend serves `/.well-known/assetlinks.json` for domain verification. Configure `ANDROID_CERT_FINGERPRINT` in the backend `.env`.

---

## Troubleshooting

### `bun run dev` fails with missing paraglide

Run `bun run prepare` (or `svelte-kit sync`) to generate the paraglide runtime:

```bash
bunx svelte-kit sync
```

### Storybook fails to start

Ensure you have the correct Playwright browser installed:

```bash
npx playwright install chromium
npx playwright install-deps chromium
```

### Build fails with "Cannot find module '$lib/paraglide/messages'"

The paraglide output is auto-generated and gitignored. Run:

```bash
bunx svelte-kit sync
```

### E2E tests fail with "browser not found"

Install all Playwright browsers:

```bash
npx playwright install
```

### Docker build fails

Ensure `bun.lock` is up to date:

```bash
bun install
```

Then rebuild:

```bash
scripts/start-docker.sh
```

### API calls fail in dev (CORS)

Ensure the backend has `FRONTEND_ORIGIN=http://localhost:5173` set in its `.env` file.

### MediaInfo WASM not loading

The `mediainfo.js` WASM binary must be accessible at the root. In Docker, the Dockerfile copies it to `/build/MediaInfoModule.wasm`. In dev, Vite serves it from `node_modules` automatically.
