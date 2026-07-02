# metacleaner-monitoring — Documentation

## Environment Variables

Copy `.env.example` to `.env` and set the values below.

### Required

| Variable                   | Description                                                         |
| -------------------------- | ------------------------------------------------------------------- |
| `SUPABASE_URL`             | Supabase project URL (`https://<project>.supabase.co`)              |
| `SUPABASE_SERVICE_KEY`     | Supabase service role key (server-side only)                        |
| `DASHBOARD_SESSION_SECRET` | Password for dashboard login; also used as the session cookie value |

The server calls `getServiceConfigs()` at startup and exits immediately (`process.exit(1)`) if either Supabase variable is missing. `DASHBOARD_SESSION_SECRET` is not validated at startup — omitting it disables login and locks every user out.

### Optional — Fly.io (runtime section)

| Variable        | Description                                                                              |
| --------------- | ---------------------------------------------------------------------------------------- |
| `FLY_API_TOKEN` | Fly.io personal access token                                                             |
| `FLY_ORG`       | Fly.io organisation slug                                                                 |
| `FLY_APPS`      | Comma-separated list of app names to monitor (e.g. `metacleaner-server,metacleaner-web`) |

All three must be set together; a partial set disables the Fly.io integration.

### Optional — Cloudflare (edge section)

| Variable               | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Zone Analytics read permission |
| `CLOUDFLARE_ZONE_ID`   | Zone ID of the domain to monitor                         |

### Optional — Sentry (errors section)

| Variable            | Description                            |
| ------------------- | -------------------------------------- |
| `SENTRY_AUTH_TOKEN` | Sentry internal integration auth token |
| `SENTRY_ORG`        | Sentry organisation slug               |
| `SENTRY_PROJECT`    | Sentry project slug                    |

> `SENTRY_DSN` appears in `.env.example` but is not read by any server code — it is present for reference only.

### Optional — Stripe (business section)

| Variable            | Description                                    |
| ------------------- | ---------------------------------------------- |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_live_…` or `sk_test_…`) |

> `STRIPE_WEBHOOK_SECRET` appears in `.env.example` but is not read by any server code — it is present for reference only.

### Server (set in fly.toml for production)

| Variable   | Default      | Description                     |
| ---------- | ------------ | ------------------------------- |
| `NODE_ENV` | `production` | Node environment                |
| `PORT`     | `3000`       | HTTP port the server listens on |

---

## Project Structure

```
metacleaner-monitoring/
├── src/
│   ├── app.html               # HTML shell; paraglide placeholders for lang/dir
│   ├── hooks.server.ts        # Rate limiting, auth guard, security headers, i18n
│   ├── hooks.ts               # Client-side reroute hook
│   ├── lib/
│   │   ├── components/        # Shared Svelte components (LanguageSwitcher)
│   │   ├── shared/            # Cross-route UI components, elements, and sections
│   │   │   ├── components/    # KpiGrid, PlotlyChart, EventLogTable, TabSwitcher, etc.
│   │   │   ├── elements/      # Primitive UI elements (FilterPill, ProgressBar, DataTable, etc.)
│   │   │   └── sections/      # Reusable page-section components
│   │   ├── repositories/      # Client-side data shapes and static repos
│   │   ├── theme/             # Chart colour constants
│   │   ├── types/             # Shared TypeScript types (pageData.ts)
│   │   ├── paraglide/         # Generated i18n runtime (do not edit manually)
│   │   └── server/
│   │       ├── config.ts      # Reads env vars; validates required vars at startup
│   │       ├── dashboardAlerts.ts  # Merges Sentry + Fly alerts, deduplicates by ID
│   │       ├── clients/       # One file per external API (Fly, Cloudflare, Sentry, Stripe, Supabase)
│   │       └── mappers/       # Transform raw API responses to page data shapes
│   └── routes/
│       ├── +page.{server,svelte}      # Dashboard overview (/)
│       ├── +layout.svelte             # Root layout; nav sidebar
│       ├── login/                     # Login page (/login)
│       ├── business/                  # Business metrics (/business)
│       ├── chyby/                     # Errors (/chyby)
│       ├── databaze/                  # Database (/databaze)
│       ├── dostupnost/                # Availability (/dostupnost)
│       ├── edge/                      # Edge / CDN (/edge)
│       ├── performance/               # Performance (/performance)
│       ├── runtime/                   # Runtime / infrastructure (/runtime)
│       └── uzivatele/                 # Users (/uzivatele)
├── messages/
│   ├── en.json                # English strings
│   └── cs.json                # Czech strings
├── scripts/
│   ├── build.sh               # Build Docker image
│   ├── start-docker.sh        # Build + run container on port 3002
│   ├── stop-docker.sh         # Stop and remove container
│   └── deploy.sh              # Deploy to Fly.io with secrets from env file
├── .storybook/                # Storybook configuration
├── project.inlang/            # Paraglide i18n project config
├── Dockerfile                 # Multi-stage: Bun build → Node.js runtime
├── fly.toml                   # Fly.io app config (region: fra, port: 3000)
└── playwright.config.ts       # E2E test config (builds + previews before running)
```

---

## Deployment

### Fly.io

The deploy script reads secrets from a local env file and pushes them to Fly.io before deploying.

```sh
# Deploy using .env-prod (default)
./scripts/deploy.sh

# Deploy using a named env file (.env-staging)
./scripts/deploy.sh --env staging

# Or override via environment variable
DPLOY_ENV_FILE=.env-custom ./scripts/deploy.sh
```

The script:

1. Creates the Fly.io app if it does not exist yet.
2. Sets all secrets from the env file (skips variables already hardcoded in `fly.toml [env]`).
3. Runs `fly deploy` (builds the Docker image on Fly's remote builder).

Fly.io app name and primary region are configured in `fly.toml` (`fra`).

### Docker (manual)

```sh
# Build
./scripts/build.sh
# or: docker build -t metacleaner-monitoring .

# Run (port 3002 → container 3000, reads .env for secrets)
./scripts/start-docker.sh

# Stop
./scripts/stop-docker.sh
```

---

## Testing

### Unit tests (Vitest)

```sh
bun run test:unit
# or: npm run test:unit -- --run
```

Two Vitest projects run in parallel:

- **server** — Node.js environment; covers `src/lib/server/**` (clients, mappers, config, dashboardAlerts).
- **client** — Chromium via Playwright browser provider; covers `*.svelte.{test,spec}.{ts,js}`.

### E2E tests (Playwright)

```sh
bun run test:e2e
# or: npm run test:e2e
```

Playwright builds the app with `npm run build && npm run preview`, then runs all `*.e2e.{ts,js}` files against port 4173.

### Run everything

```sh
bun run test
# or: npm run test
```

The first run downloads required browser binaries automatically.

### Storybook (component development)

```sh
bun run storybook        # dev server on port 6006
bun run build-storybook  # static build → storybook-static/
```

---

## Troubleshooting

**Server exits immediately at startup**
Check that `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are set. The server calls `getServiceConfigs()` and exits with a `[FATAL]` log if either is missing.

**Login page keeps rejecting the password**
Ensure `DASHBOARD_SESSION_SECRET` is set in `.env`. The value you enter on the login form must exactly match this variable.

**A dashboard section shows "not configured"**
The section's required env vars are missing or empty. Empty/whitespace values are treated as absent. Check the optional vars table above.

**Playwright browsers not found**
If `PLAYWRIGHT_BROWSERS_PATH` points to a read-only directory, install to a writable path:

```sh
PLAYWRIGHT_BROWSERS_PATH=~/.playwright-browsers npx playwright install chromium
```

**`invalidate('app:x')` retry button does nothing**
Each `+page.server.ts` load must call `depends('app:<route>')` for `invalidate('app:<route>')` to trigger a re-fetch. Without a matching `depends`, the invalidation is a no-op.
