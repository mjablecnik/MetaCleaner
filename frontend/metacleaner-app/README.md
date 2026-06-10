# MetaCleaner App

MetaCleaner helps users protect their privacy by removing hidden metadata (EXIF, GPS, camera info, timestamps) from photos and videos before sharing them online. Users upload files, review identified privacy risks, choose what to clean, and download safe copies — all through a guided step-by-step wizard.

## Tech Stack

- **Framework**: SvelteKit 2 + Svelte 5 (runes mode)
- **Language**: TypeScript (strict)
- **Package Manager**: bun
- **Styling**: Tailwind CSS 4
- **i18n**: Paraglide JS (en, cs)
- **Testing**: Vitest + Storybook 10
- **Mobile**: Capacitor (Android)
- **Build Output**: Static site (`@sveltejs/adapter-static`)

## Prerequisites

- [Node.js](https://nodejs.org/) 22+
- [Bun](https://bun.sh/) — `curl -fsSL https://bun.sh/install | bash`

## Setup

```bash
bun install            # Install dependencies
```

## Development

```bash
bun run dev            # Dev server
bun run check          # Type check
bun run lint           # Lint (prettier + eslint)
bun run format         # Auto-format
bun run test           # Run server-side tests (no browser required)
bun run test:browser   # Run browser/Storybook tests (requires Playwright: npx playwright install chromium && npx playwright install-deps chromium)
bun run storybook      # Storybook dev (port 6006)
```

## Local Docker

```bash
./start-docker.sh      # Build image & run container on port 8080
docker stop metacleaner-app   # Stop container
```

## Android (Capacitor)

```bash
./sync-android.sh                    # Build app + sync web assets to Android project
bunx cap open android                # Open in Android Studio
bunx cap run android                 # Run on device/emulator
```

For live reload during development:

```bash
bunx cap run android --livereload --external
```

> Requires Android Studio and Android SDK installed.

## Fly.io Deployment

```bash
./fly-setup.sh         # Create app & set secrets from .env
fly deploy             # Deploy
fly logs --app metacleaner-app   # View logs
fly status --app metacleaner-app # Check status
```

## API Configuration

The frontend connects to the MetaCleaner backend via `PUBLIC_API_URL`.

### Local Development

Copy `.env.example` to `.env` and set the backend URL:

```bash
cp .env.example .env
# .env contains:
# PUBLIC_API_URL=http://localhost:8080
```

Start the backend on port 8080, then run `bun run dev`. All API calls will go to `http://localhost:8080`.

### Production Deployment

`PUBLIC_API_URL` is resolved at **build time** via `$env/static/public` (SvelteKit static adapter). It is baked into the JS bundle — it cannot be overridden at runtime via environment variables or secrets.

Set it as an environment variable when running the build:

```bash
PUBLIC_API_URL=https://api.your-domain.com bun run build
```

For Fly.io, pass it as a build argument — **do not** use `fly secrets set PUBLIC_API_URL` (secrets are runtime-only and will have no effect on the static bundle):

```bash
fly deploy --build-arg PUBLIC_API_URL=https://api.your-domain.com
```

The backend must have `FRONTEND_ORIGIN` set to the frontend production URL to allow CORS:

```bash
fly secrets set FRONTEND_ORIGIN=https://your-domain.com --app metacleaner-server
```

## Development Notes

### Backend Required

The app uses `ApiCleaningService` which communicates with the real backend over HTTP and WebSocket. There is no mock layer — a running backend at `PUBLIC_API_URL` is required for the upload, cleaning, and report flows to work.

## Project Structure

```
src/
├── lib/
│   ├── clients/           # HTTP/WebSocket API client (metaCleanerApi.ts)
│   ├── services/          # CleaningService implementations (apiCleaningService.ts)
│   ├── shared/
│   │   ├── elements/      # Low-level UI primitives (Button, Card, Badge…)
│   │   ├── components/    # Composed UI (NavBar, Toast, FileListItem…)
│   │   └── sections/      # Shared page sections
│   ├── repositories/      # Static UI config (languages, user placeholder)
│   └── paraglide/         # Generated i18n
├── routes/
│   ├── (step1)/           # File upload
│   ├── step2/             # Risk analysis
│   ├── step3/             # Processing
│   ├── step4/             # Error handling
│   ├── step5/             # Results
│   ├── reports/           # Report history
│   └── report/            # Single report detail
messages/                  # i18n message files (en.json, cs.json)
```
