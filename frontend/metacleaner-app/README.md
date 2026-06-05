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

## Setup

```bash
cp .env.example .env   # Configure environment
bun install            # Install dependencies
```

## Development

```bash
bun run dev            # Dev server
bun run check          # Type check
bun run lint           # Lint (prettier + eslint)
bun run format         # Auto-format
bun run test           # Run tests
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

## Project Structure

```
src/
├── lib/
│   ├── shared/
│   │   ├── elements/      # Low-level UI primitives (Button, Card, Badge…)
│   │   ├── components/    # Composed UI (NavBar, Toast, FileListItem…)
│   │   └── sections/      # Shared page sections
│   ├── repositories/      # Data layer (mock → API)
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
