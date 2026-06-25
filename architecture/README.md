# MetaCleaner — Architecture (C4 Model)

This folder contains the architecture of the MetaCleaner project described using the **C4 model** and the **Structurizr DSL**.

## What is the C4 Model?

C4 is a hierarchical set of diagrams for visualising software architecture at four levels of abstraction:

| Level | Diagram | Audience |
|-------|---------|----------|
| 1 | **System Context** | Everyone — shows the system and its external dependencies |
| 2 | **Container** | Developers and architects — shows deployable units |
| 3 | **Component** | Developers — shows internal modules inside a container |
| 4 | **Code** | IDEs / UML tools — not covered here |

---

## Files in this folder

| File | Description |
|------|-------------|
| `workspace.dsl` | Complete Structurizr DSL workspace with all C4 diagrams |
| `README.md` | This file — explains structure and how to view diagrams |

---

## Diagrams in `workspace.dsl`

### Level 1 — System Context (`SystemContext`)
Shows MetaCleaner as a black box and its relationships with:
- **User** — uses the web or mobile app to clean photos and videos
- **Developer / Power User** — uses the CLI or REST API with API keys
- **Supabase** — managed database, auth, and file storage
- **Stripe** — payment processing and subscription management
- **ExifTool** — image metadata removal
- **FFmpeg** — video metadata removal
- **Brevo** — contact form email delivery

### Level 2 — Containers (`Containers`)
Shows all deployable units and internal packages:

| Container | Technology | Role |
|-----------|-----------|------|
| **Marketing Website** | SvelteKit, nginx | Static landing page, pricing, contact |
| **Web Application** | SvelteKit, Svelte 5 | Main SPA — file upload, cleaning, reports |
| **Mobile Application (Android)** | SvelteKit + Capacitor 8 | Android app (same codebase as web app) |
| **CLI Tool** | Bun, TypeScript | Terminal tool for scan / clean / compare |
| **Shared Component Library** | TypeScript, Svelte 5 | Reusable pricing UI across web + marketing |
| **Backend API** | Go 1.23, Docker | Core REST + WebSocket API, cleaning pipeline |

### Level 3 — Components: Backend API (`BackendAPIComponents`)
Internal components of the Go backend:
- **HTTP Router & Middleware** — gorilla/mux, CORS, security headers, request ID
- **Auth Middleware** — JWT validation via Supabase
- **Rate Limiter** — per-IP, per-email, per-API-key limits
- **Upload Handler** — multipart file upload, temp storage
- **Job Handler** — cleaning jobs, WebSocket orchestration, downloads
- **Auth Handler** — email/password, OAuth, magic link, password reset
- **Billing Handler** — Stripe checkout sessions, webhook verification
- **API Key Handler** — create, list, revoke, activate API keys
- **WebSocket Hub** — real-time progress broadcasting per job
- **Cleaning Pipeline** — ExifTool + FFmpeg subprocess orchestration
- **Supabase Client** — PostgREST, Auth, and Storage API calls
- **PDF Report Generator** — branded reports with QR codes
- **Cleanup Scheduler** — background temp file expiry

### Level 3 — Components: Web Application (`WebAppComponents`)
Internal modules of the SvelteKit SPA:
- **Auth Module** — JWT lifecycle, token refresh, all auth flows
- **API Client** — central HTTP + WebSocket client
- **Client-side Metadata Scanner** — browser-side EXIF parsing (no upload needed)
- **Risk Analyzer** — privacy risk scores and severity levels
- **Upload Wizard** — 5-step guided cleaning workflow
- **Billing & Subscription UI** — plan display, Stripe checkout
- **Report Viewer** — cleaning history, per-file metadata breakdown
- **API Keys Manager** — manage programmatic access keys

### Level 3 — Components: CLI Tool (`CLIComponents`)
- **Command Parser** — argument parsing and dispatch
- **Server Client** — HTTP wrapper for all backend calls
- **Local Metadata Scanner** — offline pre-scan
- **Output Formatter** — text tables and structured JSON

### Deployment — Production (`ProductionDeployment`)
- **Fly.io Frankfurt** — Backend (Docker, Go), Web App (Docker, nginx)
- **Fly.io Volume** — Persistent temp storage for cleaning jobs (1 h retention)
- **CDN / nginx** — Marketing Website
- **Supabase Cloud** — PostgreSQL + Auth + Storage
- **Stripe** — Payment processing

### Deployment — Development (`DevelopmentDeployment`)
- All services run locally on the developer's machine
- Backend on port 8080, Web App on port 3000, Marketing on port 5173
- Shared Supabase dev project (cloud or local via `supabase` CLI)

---

## How to view the diagrams

### Option 1 — Structurizr Lite (recommended, local, free)

Run Structurizr Lite as a Docker container pointing at this folder:

```bash
docker run -it --rm \
  -p 8080:8080 \
  -v "$(pwd)/architecture":/usr/local/structurizr \
  structurizr/lite
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.

### Option 2 — VS Code extension

Install the [Structurizr DSL extension](https://marketplace.visualstudio.com/items?itemName=systemticks.c4-dsl-support) for VS Code. Open `workspace.dsl` and use the preview panel to see diagrams inline.

### Option 3 — Structurizr Cloud

1. Create a free account at [structurizr.com](https://structurizr.com)
2. Create a new workspace
3. Upload `workspace.dsl` or paste its contents into the DSL editor
4. All diagrams will render automatically

### Option 4 — IntelliJ / JetBrains Plugin

Install the [Structurizr plugin](https://plugins.jetbrains.com/plugin/18828-structurizr) from JetBrains Marketplace.

---

## Key data flows

### File cleaning flow
```
User → Web App → POST /api/upload → Backend
                → POST /api/jobs  → Backend → Cleaning Pipeline → ExifTool / FFmpeg
                → WebSocket       → Backend → WebSocket Hub → User (real-time progress)
                → GET /api/files/{id}/download → Backend → User
                                              → PDF Generator → Supabase Storage
```

### Authentication flow
```
User → Web App → POST /api/auth/login → Backend → Supabase Auth API
                                                 ← JWT access + refresh tokens
Web App stores tokens in localStorage, attaches Bearer token to every API request.
Backend Auth Middleware validates each token against the Supabase JWT secret.
```

### Billing flow
```
User → Web App → POST /api/billing/checkout → Backend → Stripe (create session)
User completes Stripe payment form
Stripe → POST /api/billing/webhook → Backend (verify HMAC) → Supabase (update credits/subscription)
```
