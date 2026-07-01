# MetaCleaner App

Remove hidden metadata from photos and videos to protect privacy before sharing online.

## Description

MetaCleaner helps users protect their privacy by stripping hidden metadata (EXIF, GPS, camera info, timestamps) from photos and videos. Files are analyzed client-side for privacy risks, cleaned by the backend, and returned as safe copies.

**Key features:**

- Step-by-step wizard: upload → scan → clean → download
- Client-side metadata scanning with privacy risk scoring
- Real-time cleaning progress via WebSocket
- Report history with detailed per-field breakdown
- Multi-language support (English, Czech)
- User authentication (email/password, OAuth, magic link)
- Subscription and API key management
- Android app via Capacitor

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

## Installation / Setup

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
scripts/start-docker.sh      # Build image & run container on port 3000
scripts/stop-docker.sh       # Stop container
```

## Android (Capacitor)

```bash
scripts/sync-android.sh              # Build app + sync web assets to Android project
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
scripts/deploy.sh      # Deploy to Fly.io
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
│   ├── auth/              # Auth store, API client, route guards
│   ├── clients/           # HTTP/WebSocket API clients
│   ├── services/          # CleaningService (upload → WS → results)
│   ├── scanner/           # Client-side metadata parsing + risk analysis
│   ├── stores/            # Global reactive state (appState, billingStore, etc.)
│   ├── repositories/      # Static UI config (languages, settings data, etc.)
│   ├── shared/
│   │   ├── elements/      # Low-level UI primitives (Button, Card, Badge…)
│   │   ├── components/    # Composed UI (NavBar, Toast, FileListItem…)
│   │   ├── sections/      # Shared page sections
│   │   └── utils/         # Utility functions (tx, format, planStyleMap, etc.)
│   ├── types/             # Shared TypeScript types (billing, processing, report)
│   └── paraglide/         # Generated i18n runtime (auto-generated)
├── routes/
│   ├── (step1)/           # File upload + scan (wizard step 1)
│   ├── (auth)/            # Login, register, forgot-password, email-verified
│   ├── email-changed/     # Email change confirmation callback
│   ├── docs/              # API documentation (auth, endpoints, errors)
│   ├── report/[id]/       # Report detail page
│   ├── reports/           # Report history list
│   ├── settings/          # User settings
│   ├── subscription/      # Subscription plans
│   ├── sections/          # Wizard step sections (Step1Idle–Step5Success)
│   └── +page.svelte       # Root page — wizard step router (steps 1–5)
messages/                  # i18n message files (en.json, cs.json)
```

## Documentation

For detailed documentation on environment variables, project architecture, testing strategy, and troubleshooting:

📄 **[DOCS.md](./DOCS.md)**

## Author

👤 **Martin Jablečník**

- Website: [www.jablecnik.com](https://www.jablecnik.com)
- Github: [@mjablecnik](https://github.com/mjablecnik)

## Show your support

Give a ⭐️ if this project helped you!

## License

Copyright © 2025 Martin Jablečník.
This project is [MIT](LICENSE) licensed.
