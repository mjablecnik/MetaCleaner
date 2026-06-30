# metacleaner-monitoring

Internal monitoring dashboard for MetaCleaner services — aggregates real-time metrics from Supabase, Fly.io, Cloudflare, Sentry, and Stripe into a single view.

## Description

A SvelteKit 2 server-rendered dashboard that pulls live data from multiple third-party APIs and displays it across nine monitoring sections.

Key features:
- Nine monitoring sections: dashboard overview, business metrics, errors, database, availability, edge/CDN, performance, runtime infrastructure, and users
- Password-protected access via cookie-based session auth (`DASHBOARD_SESSION_SECRET`)
- Graceful degradation — sections without configured credentials show a placeholder instead of crashing
- Czech/English i18n via Paraglide.js
- Rate limiting (60 req/60 s per IP) and security headers (CSP, HSTS, X-Frame-Options)
- Responsive design with Tailwind CSS v4
- Deployed to Fly.io; Docker workflow available for local production testing

## Prerequisites

- Node.js 22+
- [Bun](https://bun.sh/) (recommended) or npm
- [flyctl](https://fly.io/docs/flyctl/install/) — required for deployment only

## Installation / Setup

```sh
git clone <repo-url>
cd metacleaner-monitoring
bun install        # or: npm install
cp .env.example .env
```

Edit `.env` and fill in your credentials. `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, and `DASHBOARD_SESSION_SECRET` are required — the server exits at startup without Supabase credentials. All other service variables are optional; missing sections display a "not configured" state.

See [DOCS.md](DOCS.md) for the full environment variable reference.

## Usage / Running

**Development:**
```sh
bun run dev
# or: npm run dev
```

**Production build and start:**
```sh
bun run build
node build/index.js
```

**Preview production build locally:**
```sh
bun run preview
```

**Docker (local production test — runs on port 3002):**
```sh
./scripts/start-docker.sh   # builds image and starts container
./scripts/stop-docker.sh    # stops and removes container
```

## Documentation

See [DOCS.md](DOCS.md) for environment variables, project structure, deployment, testing, and troubleshooting.

## Author

**Martin Jablečník**
- Website: [www.jablecnik.com](https://www.jablecnik.com)
- GitHub: [@mjablecnik](https://github.com/mjablecnik)

## Show your support

Give a ⭐️ if this project helped you!

## License

Copyright © 2024 Martin Jablečník. Licensed under the [MIT License](https://opensource.org/licenses/MIT).
