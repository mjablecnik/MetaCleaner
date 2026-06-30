# MetaCleaner Web

Marketing website for the MetaCleaner service — a SvelteKit static site with Tailwind CSS v4, Paraglide i18n (English and Czech), and pre-rendered pages deployable to any static host or Docker/nginx.

## Description

MetaCleaner Web is the public-facing marketing site for MetaCleaner, a tool that strips metadata from files to protect user privacy. It explains what MetaCleaner does, showcases its features, and drives users to the app.

Key features:
- Fully pre-rendered static site (SSG) via `@sveltejs/adapter-static`
- Bilingual: English and Czech, with URL-based locale switching
- Pages: Home, Features, Pricing, About/Contact, Privacy, Terms
- Contact form backed by a Supabase Edge Function (sends email via Brevo)
- Docker + nginx deployment and Fly.io deployment scripts included
- Cookie consent banner, JSON-LD structured data, sitemap

## Prerequisites

- **Node.js 22+** — [nodejs.org](https://nodejs.org)
- **Bun** — [bun.sh](https://bun.sh) (package manager and runtime)
  ```sh
  curl -fsSL https://bun.sh/install | bash
  ```
- Supported OS: Linux, macOS, WSL

## Installation / Setup

```sh
# 1. Clone the repository
git clone <repo-url>
cd frontend/metacleaner-web

# 2. Install dependencies (from workspace root)
bun install

# 3. Copy environment config and fill in values
cp .env.example .env
```

Edit `.env` and set the required variables (see [DOCS.md](DOCS.md) for details).

## Usage / Running

```sh
# Start the dev server (http://localhost:5173)
bun run dev

# Build a production static site into build/
bun run build

# Preview the production build locally (http://localhost:4173)
bun run preview
```

### Docker

```sh
# Build image and start nginx container on http://localhost:3001
scripts/start-docker.sh

# Stop and remove the container
scripts/stop-docker.sh
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

Copyright © 2024 Martin Jablečník. Released under the [MIT License](LICENSE).
