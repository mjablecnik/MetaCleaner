# MetaCleaner Monitoring — Mock Data Alignment

## Problem Statement

The MetaCleaner Monitoring dashboard (`frontend/metacleaner-monitoring/`) is a SvelteKit application that visualizes infrastructure metrics, errors, availability, and business KPIs. Currently it is a **UI-only mockup** — all data is hardcoded in repository files under `src/lib/repositories/`. No real API calls are made.

The problem is that the mock data uses **generic placeholder content** (fictional e-commerce endpoints like `/api/v1/orders/checkout`, generic "node-canvas segfault" errors, unnamed "fra-01/02/03" machines) that does not reflect the real MetaCleaner product at all.

**Goal:** Replace all generic mock data with realistic values that accurately represent the MetaCleaner system — its real services, endpoints, error scenarios, user base, and business model. This makes the dashboard useful as a visual prototype and design reference for stakeholders, and prepares the data layer structure for eventual real API integration.

---

## What is MetaCleaner?

MetaCleaner is a SaaS product that strips privacy-sensitive metadata (GPS, EXIF, XMP, device info) from photos and videos. The system consists of:

### Deployable Services (all on Fly.io, Frankfurt region)

| Fly.io App Name | What It Does | Tech | Resources |
|---|---|---|---|
| `metacleaner-server` | Backend REST API + metadata cleaning pipeline. Receives uploaded files, invokes ExifTool (images) or FFmpeg (videos) as subprocesses, returns cleaned files. Also handles auth, billing, API keys, PDF report generation, WebSocket progress streaming. | Go 1.23 | 1–2 machines, 512MB–1GB RAM each, CPU-intensive during processing |
| `metacleaner-web` | Marketing/landing website. Static SPA (SvelteKit pre-rendered → nginx). Pages: home, features, pricing, about, privacy, terms. | nginx:alpine | 1 machine, 64–128MB RAM, near-zero CPU |
| `metacleaner-app` | Main user-facing application. SPA where users upload files, see scan results, trigger cleaning, view reports, manage account/billing/API keys. | nginx:alpine | 1 machine, 64–128MB RAM, near-zero CPU |
| `metacleaner-monitoring` | This monitoring dashboard. | SvelteKit (Node) | 1 machine, 256MB RAM, auto-stop enabled |

### External Services

| Service | Provider | Role in MetaCleaner |
|---|---|---|
| PostgreSQL | Supabase (PostgREST) | Stores jobs, reports, files metadata, users, subscriptions, credits, API keys |
| Auth | Supabase Auth | User registration, login (email/password, Google OAuth, Apple OAuth, magic link) |
| Object Storage | Supabase Storage | Permanent storage for generated PDF reports |
| DNS + CDN | Cloudflare | Domain routing, static asset caching, DDoS/bot protection |
| Payments | Stripe | Subscriptions (Free/Pro/Business plans), credit system, checkout |
| Error Tracking | Sentry | Captures unhandled backend errors |

### Key Backend Endpoints (metacleaner-server)

| Method | Path | What It Does | Performance Profile |
|---|---|---|---|
| POST | `/api/upload` | Multipart file upload (max 500MB) | Slow — large file I/O |
| POST | `/api/jobs` | Create cleaning job, triggers pipeline | Slow — subprocess invocation |
| GET | `/api/jobs/{id}` | Poll job status | Fast |
| GET | `/api/jobs/{id}/progress` | WebSocket real-time progress | Long-lived connection |
| GET | `/api/jobs/{id}/download` | Download all cleaned files as ZIP | Slow — ZIP generation |
| GET | `/api/files/{id}/download` | Download single cleaned file | Medium |
| GET | `/api/reports/{id}/pdf` | Generate + serve PDF report with QR code | Slow — PDF generation |
| GET | `/api/reports` | List user's reports | Fast |
| POST | `/api/auth/register` | User registration via Supabase | Medium — external call |
| POST | `/api/auth/login` | User login | Medium — external call |
| POST | `/api/billing/checkout` | Create Stripe checkout session | Medium — Stripe API |
| POST | `/api/billing/webhook` | Stripe webhook receiver | Fast |
| GET | `/api/health` | Health check | Fast (< 20ms) |
| POST | `/api/keys` | Create API key | Fast |

### Business Model

- **Free tier:** Limited credits per month, basic cleaning
- **Pro ($9/mo):** More credits, priority processing
- **Business ($29/mo):** Highest credits, API access, PDF reports
- Credit-based: each file cleaned costs 1 credit

### Typical Error Scenarios (backend)

- ExifTool process timeout (corrupted or very large image files)
- FFmpeg OOM kill (4K video exceeding RAM limit during remuxing)
- Supabase PostgREST connection pool exhaustion under load
- Stripe webhook signature verification failure (clock skew)
- WebSocket write to closed connection (client disconnected during job progress)
- Upload rejection (file exceeds 500MB limit)
- Temp file race condition (cleaned file missing after pipeline)
- ExifTool unsupported format (e.g., .cr3 Canon RAW not yet supported)

---

## Current State of the Monitoring App

The data layer lives entirely in `src/lib/repositories/`. Each repository file exports factory functions that return typed arrays/objects of hardcoded data. The UI components consume these functions directly.

**Repository files to modify:**

| File | What it provides | Current state |
|---|---|---|
| `availabilityRepository.ts` | Service cards, health checks, incidents, SLA goals | Generic "Frontend/Backend/DB/Edge" services |
| `dashboardRepository.ts` | Overview KPI stats, alerts, response time | Generic uptime + error rate |
| `runtimeRepository.ts` | Machine instances, deploy history, error log, KPIs | Generic "fra-01/02/03" machines, fake commits |
| `performanceRepository.ts` | Slow endpoints, KPIs, performance events | Generic e-commerce endpoints |
| `errorsRepository.ts` | Error entries from Sentry | Generic "node-canvas segfault" errors |
| `databaseRepository.ts` | DB table stats, query performance | Generic PostgreSQL metrics |
| `businessRepository.ts` | Revenue, subscribers, churn | Generic MRR/churn |
| `usersRepository.ts` | Registration stats, user activity | Generic user data |
| `edgeRepository.ts` | Cloudflare CDN metrics, threats | Generic CDN data |

---

## Required Changes

### Category A: Mock Data Replacement (repository files only, no UI changes)

For each repository below, replace the hardcoded values with realistic MetaCleaner-specific data. Keep the same TypeScript interfaces and function signatures — only change the returned values.

---

#### A1. `availabilityRepository.ts`

**getServiceCards()** — Replace 4 generic services with these 7:

| key | name | icon | provider | uptimePercent | Notes |
|---|---|---|---|---|---|
| `server` | MetaCleaner Server | `fa-server` | Fly.io | 99.92 | Most restarts happen here (ExifTool/FFmpeg OOM) |
| `web` | MetaCleaner Web | `fa-globe` | Fly.io | 99.99 | Static nginx, almost never fails |
| `app` | MetaCleaner App | `fa-desktop` | Fly.io | 99.99 | Static nginx, almost never fails |
| `monitoring` | Monitoring | `fa-chart-line` | Fly.io | 99.95 | Auto-stop/start, occasional cold start delays |
| `database` | Supabase DB | `fa-database` | Supabase | 99.97 | PostgREST occasionally hits pool limit |
| `auth` | Supabase Auth | `fa-shield-halved` | Supabase | 99.98 | Very stable |
| `edge` | Cloudflare CDN | `fa-cloud` | Cloudflare | 99.94 | Rare regional degradations |

**getHealthChecks()** — Replace with:

| endpoint | service | typical latency |
|---|---|---|
| `GET /api/health` | MetaCleaner Server | 15–50ms |
| `GET /` (200 check) | MetaCleaner Web | 5–20ms |
| `GET /` (200 check) | MetaCleaner App | 5–20ms |
| `GET /` (200 check) | Monitoring | 30–80ms |
| Supabase REST ping | Supabase DB | 40–120ms |
| CF edge check | Cloudflare CDN | 3–10ms |

**getIncidents()** — Replace with:

1. (active) "Backend OOM during video cleaning" — metacleaner-server machine exceeded 1GB RAM limit processing a 4K MOV file. Auto-restarted in 12s. Service: Fly.io Backend, icon: `fa-server`
2. (resolved) "Supabase connection pool exhausted" — PostgREST connection pool hit 100 limit during evening traffic spike. Resolved after scaling pool to 150. Duration: 7m 12s. Service: Supabase DB, icon: `fa-database`
3. (resolved) "Stripe webhook delivery timeout" — Billing webhook endpoint returned 504 during Stripe event flood. Events delivered on retry. Duration: 2m 45s. Service: Fly.io Backend, icon: `fa-server`
4. (resolved) "Cloudflare certificate renewal hiccup" — Brief edge degradation during automated SSL cert rotation. Duration: 48s. Service: Cloudflare, icon: `fa-cloud`

**getSlaGoals()** — Replace with:

| service | actual | target |
|---|---|---|
| MetaCleaner Server | 99.92 | 99.9 |
| MetaCleaner Web | 99.99 | 99.9 |
| MetaCleaner App | 99.99 | 99.9 |
| Supabase DB | 99.97 | 99.5 |
| Cloudflare CDN | 99.94 | 99.9 |

---

#### A2. `dashboardRepository.ts`

**getDashboardStats()** — Replace with MetaCleaner-specific overview KPIs:

| key | label | value | icon | Notes |
|---|---|---|---|---|
| `uptimeServer` | Server Uptime | 99.92% | `fa-server` | Backend availability (the critical number) |
| `jobsProcessed` | Jobs (24h) | 847 | `fa-broom` | Cleaning jobs completed in last 24 hours |
| `avgCleaningTime` | Avg Clean Time | 4.2s | `fa-clock` | Average time to clean one file |
| `errorRate` | Failed Jobs | 0.8% | `fa-bug` | Percentage of jobs that errored out |

**getDashboardAlerts()** — Replace with:

1. (error) "ExifTool process timeout" — ExifTool hung on a corrupted HEIC file, job failed after 30s timeout. `POST /api/jobs`. 15 min ago.
2. (warning) "High memory on metacleaner-server" — RAM at 89% (910MB / 1024MB), approaching limit during concurrent video processing. 2 hours ago.
3. (resolved) "Stripe webhook retry storm" — Stripe retried failed webhook 3× before successful delivery, billing data synced with 4-minute delay. Yesterday 14:30.

---

#### A3. `performanceRepository.ts`

**getSlowEndpoints()** — Replace with real MetaCleaner endpoints:

| method | path | avg ms | call count (24h) | error rate |
|---|---|---|---|---|
| POST | `/api/upload` | 2,840 | 1,420 | 1.2% |
| POST | `/api/jobs` | 1,620 | 1,380 | 2.1% |
| GET | `/api/jobs/{id}/download` | 980 | 640 | 0.4% |
| GET | `/api/reports/{id}/pdf` | 740 | 280 | 0.7% |
| POST | `/api/billing/checkout` | 520 | 45 | 0% |
| POST | `/api/auth/register` | 340 | 34 | 2.9% |

**getPerformanceEvents()** — Replace with:

1. (critical) "Upload timeout" — POST /api/upload exceeded 30s on 450MB video file. Active.
2. (warning) "Pipeline backpressure" — Job worker pool full (3/3 concurrent), new jobs queued for 12s average. Resolved.
3. (warning) "Supabase slow query" — SELECT on reports table took 2,400ms (missing index on user_id + created_at). Resolved.
4. (info) "Traffic spike" — 120 concurrent uploads during 19:00–20:00 evening peak, all handled within SLA. Resolved.
5. (info) "Deploy rollout" — metacleaner-server v1.8.2 deployed, rolling restart completed in 38s. Completed.

**getPerformanceKpiStats()** — Adjust values to reflect MetaCleaner scale:
- Apdex: 0.91 (threshold 500ms — cleaning endpoints are inherently slow)
- Avg response time: 340ms (inflated by upload/job endpoints)
- Throughput: 890 req/min (small-medium SaaS, not e-commerce scale)
- Error rate: 1.2%

---

#### A4. `runtimeRepository.ts`

**getMachineInstances()** — Replace 3 generic instances with 5 real machines:

| name | app | region | CPU % | RAM used | RAM total | uptime |
|---|---|---|---|---|---|---|
| `server-01` | metacleaner-server | fra (Frankfurt) | 72% | 680 MB | 1 GB | 18h 42m |
| `server-02` | metacleaner-server | fra (Frankfurt) | 45% | 420 MB | 1 GB | 6h 18m |
| `web-01` | metacleaner-web | fra (Frankfurt) | 2% | 48 MB | 256 MB | 4d 12h |
| `app-01` | metacleaner-app | fra (Frankfurt) | 3% | 52 MB | 256 MB | 4d 12h |
| `mon-01` | metacleaner-monitoring | fra (Frankfurt) | 8% | 180 MB | 512 MB | 2h 45m |

**getDeployHistory()** — Replace with real MetaCleaner commits:

1. `metacleaner-server` v1.8.2 — "fix: ExifTool timeout on corrupted HEIC files" — martin.j — success, 42s
2. `metacleaner-app` v2.5.1 — "fix: locale switch scroll position preserved" — martin.j — success, 28s
3. `metacleaner-web` v1.3.0 — "feat: pricing page redesign with shared components" — martin.j — success, 25s
4. `metacleaner-server` v1.8.1 — "feat: API key rate limiting (120 RPM default)" — martin.j — success, 40s
5. `metacleaner-server` v1.8.0 — "feat: PDF report generation with QR codes" — martin.j — failed (health check timeout after deploy), rollback to v1.7.9

**getRuntimeErrorLog()** — Replace with:

1. OOM Kill — "FFmpeg killed — exceeded 1GB limit during 4K MOV remuxing" — server-01 — restarted
2. Crash — "ExifTool process timeout 30s on corrupted DNG file" — server-02 — restarted
3. Health — "Health check failed 3× — /api/health returned 503 (Supabase connection refused)" — server-01 — resolved
4. Timeout — "WebSocket write to closed connection — client disconnected during job progress" — server-01 — resolved
5. Crash — "Panic: nil pointer in metadata field categorization" — server-02 — restarted
6. OOM Kill — "RSS exceeded 1GB during concurrent batch (3 large videos simultaneously)" — server-01 — restarted
7. Timeout — "POST /api/upload timed out after 60s — 480MB file on slow connection" — server-01 — resolved
8. Health — "Readiness probe failed — temp storage disk full (cleanup job stalled)" — server-02 — resolved

**getRuntimeStats()** — Adjust to reflect MetaCleaner server:
- CPU: 72% (avg of 2 server machines, heavy when processing)
- RAM: 1.1 / 2 GB (combined both server instances)
- Uptime 30d: 99.92%
- Restarts 24h: 3 (OOM: 2, Crash: 1)

**getRuntimeSummary()** — Update:
- machinesOnline: 5, machinesTotal: 5, region: "fra (Frankfurt)"

---

#### A5. `errorsRepository.ts`

Replace all error entries with MetaCleaner Sentry errors:

| error type | message | count | severity |
|---|---|---|---|
| PipelineError | "ExifTool exit code 1 — unsupported format .cr3 (Canon RAW)" | 24 | warning |
| TimeoutError | "Job exceeded 60s processing limit (large video file)" | 8 | error |
| StorageError | "Temp cleaned file not found after pipeline completion (race condition)" | 3 | error |
| StripeWebhookError | "Webhook signature verification failed (possible clock skew)" | 2 | warning |
| WebSocketError | "Write to closed connection — client disconnected mid-stream" | 41 | info (noise) |
| AuthError | "Refresh token expired — user session invalidated" | 12 | warning |
| SupabaseError | "PostgREST 503 — connection pool exhausted during peak" | 4 | error |
| FFmpegError | "FFmpeg exit code 137 (SIGKILL) — OOM during video processing" | 6 | error |

---

#### A6. `databaseRepository.ts`

Replace generic DB metrics with Supabase/PostgreSQL tables relevant to MetaCleaner:

**Tables:**

| table | rows | size | description |
|---|---|---|---|
| `jobs` | 12,400 | 8 MB | Cleaning job records |
| `reports` | 9,800 | 15 MB | Generated cleaning reports |
| `files` | 31,000 | 5 MB | File metadata (original + cleaned references) |
| `users` | 2,100 | 1 MB | User profiles (synced from Supabase Auth) |
| `api_keys` | 340 | 200 KB | API keys for external integrations |
| `subscriptions` | 890 | 400 KB | Stripe subscription records |
| `credits` | 2,100 | 300 KB | Credit balances per user |

**Key metrics:**
- DB size total: ~30 MB
- Connection pool: 42 / 100 active
- Avg query time: 12ms
- Slowest query: `SELECT * FROM reports WHERE user_id = $1 ORDER BY created_at DESC` — 180ms (needs composite index)
- Supabase Storage (PDF reports bucket): 2.4 GB

---

#### A7. `businessRepository.ts`

Replace with MetaCleaner business KPIs:

| metric | value | trend |
|---|---|---|
| MRR (Monthly Recurring Revenue) | $1,240 | +8.2% |
| Active Subscribers | 89 | +5 this month |
| Free Tier Users | 1,840 | +34 this week |
| Credits Consumed (30d) | 14,200 | +12% vs prev month |
| Files Cleaned (30d) | 28,400 | +15% vs prev month |
| API Key Integrations | 12 active keys | +2 this month |
| Churn Rate | 3.2% | -0.4% (improving) |
| ARPU | $13.93 | stable |

**Subscription plan breakdown:**
- Free: 1,840 users (no recurring revenue)
- Pro ($9/mo): 62 subscribers → $558/mo
- Business ($29/mo): 27 subscribers → $783/mo

---

#### A8. `usersRepository.ts`

Replace with:

| metric | value |
|---|---|
| Total registered | 2,100 |
| New registrations (7d) | 34 |
| Active users (had cleaning job in last 7d) | 210 |
| Power users (>50 jobs/month) | 18 |
| Auth method: Email/password | 68% |
| Auth method: Google OAuth | 24% |
| Auth method: Apple OAuth | 5% |
| Auth method: Magic Link | 3% |

---

#### A9. `edgeRepository.ts`

Replace with MetaCleaner Cloudflare data:

| metric | value |
|---|---|
| Cache hit ratio | 94.2% |
| Total requests (24h) | 48,200 |
| Bandwidth saved by cache | 12.8 GB |
| Blocked threats (24h) | 142 |
| Top threats | Bot traffic (64), SQL injection attempts (38), path traversal (22), credential stuffing (18) |
| Geo: Czech Republic | 62% |
| Geo: Slovakia | 8% |
| Geo: Germany | 7% |
| Geo: United States | 5% |
| Geo: Other | 18% |

---

### Category B: Frontend Code Changes

These changes require modifying TypeScript interfaces and/or Svelte component templates.

---

#### B1. Add `app` field to `DeployEntry` interface

**File:** `src/lib/repositories/runtimeRepository.ts`

Add a new field to the `DeployEntry` interface:

```typescript
app: string;  // e.g. "metacleaner-server", "metacleaner-web", "metacleaner-app"
```

Then in the component that renders deploy entries, display a colored badge next to each deploy showing which app it belongs to:

- `metacleaner-server` → blue badge
- `metacleaner-web` → green badge
- `metacleaner-app` → purple badge
- `metacleaner-monitoring` → gray badge

This helps immediately distinguish which service each deploy was for when looking at a combined timeline.

---

#### B2. Add `app` field to `MachineInstance` interface

**File:** `src/lib/repositories/runtimeRepository.ts`

Add a new field:

```typescript
app: string;  // e.g. "metacleaner-server", "metacleaner-web"
```

In the component rendering machine instances, display the app name as a subtitle or secondary label under/beside the machine name. For example: "server-01" with a smaller "metacleaner-server" label beneath it.

No need to restructure the layout — just add the text so it's clear which Fly.io app each machine belongs to.

---

#### B3. Update `.env.example`

Add the following environment variables:

```env
# Fly.io
FLY_API_TOKEN=your-fly-api-token-here
FLY_ORG=personal
FLY_APPS=metacleaner-server,metacleaner-web,metacleaner-app,metacleaner-monitoring

# Sentry
SENTRY_AUTH_TOKEN=your-sentry-auth-token-here
SENTRY_ORG=your-sentry-org-slug
SENTRY_PROJECT=metacleaner-server

# Stripe
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key-here
```

---

#### B4. Update i18n keys

Any new labels introduced by the above changes (KPI names, badge labels, status texts) need corresponding entries in both `messages/en.json` and `messages/cs.json`. Use existing key naming patterns as reference (e.g., `dashboard_stats_*`, `runtime_kpi_*`).

---

## Deliverables

After implementing this brief, the following files will be modified:

### Modified repository files (mock data replacement):
- `src/lib/repositories/dashboardRepository.ts` — new KPI values + alert texts
- `src/lib/repositories/availabilityRepository.ts` — 7 services instead of 4, new health checks, incidents, SLA goals
- `src/lib/repositories/runtimeRepository.ts` — 5 machines with `app` field, new deploys with `app` field, new error log entries, updated KPIs + summary
- `src/lib/repositories/performanceRepository.ts` — new slow endpoints, events, adjusted KPI values
- `src/lib/repositories/errorsRepository.ts` — all new error entries matching MetaCleaner backend
- `src/lib/repositories/databaseRepository.ts` — Supabase tables + metrics
- `src/lib/repositories/businessRepository.ts` — MRR, subscribers, credits, plan breakdown
- `src/lib/repositories/usersRepository.ts` — registration stats, auth method split, activity metrics
- `src/lib/repositories/edgeRepository.ts` — Cloudflare metrics with Czech geo-focus

### Modified component files (interface + UI additions):
- Component rendering deploy history entries — add colored app badge (find by searching for `DeployEntry` usage in Svelte files)
- Component rendering machine instances — add app name subtitle (find by searching for `MachineInstance` usage in Svelte files)

### Modified config/translation files:
- `.env.example` — add FLY_APPS, SENTRY_*, STRIPE_SECRET_KEY variables
- `messages/en.json` — add/update i18n keys for new KPI labels
- `messages/cs.json` — add/update i18n keys for new KPI labels

### No files deleted. No new files created.

---

## Implementation Order (Suggested)

1. **Start with `dashboardRepository.ts`** — it's the landing page, immediately visible, quick to validate.
2. **Then `availabilityRepository.ts`** — core service list, sets the tone for the whole dashboard.
3. **Then `runtimeRepository.ts`** (including B1 + B2 interface changes) — most complex, has the deploy badge and machine app label changes.
4. **Then `performanceRepository.ts`** — slow endpoints are very visible and impactful.
5. **Then `errorsRepository.ts`** — straightforward text replacement.
6. **Then `databaseRepository.ts`, `businessRepository.ts`, `usersRepository.ts`, `edgeRepository.ts`** — remaining pages.
7. **Finally `.env.example` and i18n keys** — cleanup pass.

---

## Constraints

- **Do not change TypeScript interfaces** unless explicitly stated in Category B. The UI components depend on the existing shape of the data.
- **Do not change component layouts or styling.** Only the data values change (Category A) or minimal field additions (Category B).
- **Keep mock data realistic but static.** No need to add randomization, date calculations, or dynamic logic. Hardcoded values are fine — this is still a mockup.
- **Keep all existing i18n keys working.** If you rename a key, update both `messages/en.json` and `messages/cs.json`.
- **The availability page currently renders a 4-card grid.** With 7 services, verify the grid still looks good (it should — the grid is responsive — but check visually).
