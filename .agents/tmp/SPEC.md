# SPEC — MetaCleaner Monitoring: Mock Data Alignment

## 1. Overview & Goals

The MetaCleaner Monitoring dashboard (`frontend/metacleaner-monitoring/`) is a
SvelteKit UI-only mockup. All data is hardcoded in repository factory functions
under `src/lib/repositories/`. No real API calls are made.

**Problem:** the mock data uses generic placeholder content (fictional
e-commerce endpoints, generic errors, unnamed machines) that does not reflect
the real MetaCleaner product.

**Goal:** replace all generic mock data with realistic MetaCleaner-specific
values (real services, endpoints, error scenarios, business model, Czech-focused
geo) so the dashboard works as a credible visual prototype and design reference,
and so the data layer is shaped for eventual real API integration.

MetaCleaner = SaaS that strips privacy metadata (GPS/EXIF/XMP) from photos and
videos. Services run on Fly.io (Frankfurt): `metacleaner-server` (Go backend +
ExifTool/FFmpeg pipeline), `metacleaner-web` (nginx landing), `metacleaner-app`
(nginx SPA), `metacleaner-monitoring` (this app). External: Supabase
(Postgres/Auth/Storage), Cloudflare (CDN), Stripe (billing), Sentry (errors).

## 2. Technical Approach & Architecture

- **Data layer:** each file in `src/lib/repositories/` exports factory functions
  returning typed arrays/objects of hardcoded data. UI components consume them
  directly. Keep data static — no randomization or date math.
- **Two change categories:**
  - **A — Mock data replacement:** edit returned values only. Do NOT change
    TypeScript interfaces or function signatures (except where B requires it).
  - **B — Frontend code changes:** add `app` field to two interfaces and surface
    it in components; update `.env.example` and i18n.
- **No files deleted, no new files created.**
- **No layout/styling changes** beyond minimal field additions in B1/B2.
- Validate with `bun run check` (and visually confirm the availability grid
  handles 7 cards).

## 3. Key Components & Responsibilities

| Repository | Functions to update | Content |
|---|---|---|
| `dashboardRepository.ts` | `getDashboardStats`, `getDashboardAlerts` | Overview KPIs (server uptime, jobs/24h, avg clean time, failed jobs) + 3 alerts |
| `availabilityRepository.ts` | `getServiceCards`, `getHealthChecks`, `getIncidents`, `getSlaGoals` | 7 services, 6 health checks, 4 incidents, 5 SLA goals |
| `runtimeRepository.ts` | `getMachineInstances`, `getDeployHistory`, `getRuntimeErrorLog`, `getRuntimeStats`, `getRuntimeSummary` + interfaces `MachineInstance`, `DeployEntry` | 5 machines, 5 deploys, 8 error-log entries, KPIs, summary; add `app` field |
| `performanceRepository.ts` | `getSlowEndpoints`, `getPerformanceEvents`, `getPerformanceKpiStats` | 6 real endpoints, 5 events, adjusted KPIs |
| `errorsRepository.ts` | error entries | 8 Sentry-style MetaCleaner errors |
| `databaseRepository.ts` | table + query metrics | 7 Supabase tables, pool/query/storage metrics |
| `businessRepository.ts` | business KPIs | MRR, subscribers, credits, plan breakdown |
| `usersRepository.ts` | user metrics | registrations, activity, auth-method split |
| `edgeRepository.ts` | Cloudflare metrics | cache ratio, threats, Czech-focused geo |

**UI components (Category B):**
- `src/routes/runtime/components/DeployItem.svelte` — render colored app badge
  (server=blue, web=green, app=purple, monitoring=gray).
- `src/routes/runtime/components/InstanceCard.svelte` — render app name as
  secondary label under machine name.

**Config / i18n:**
- `.env.example` — ensure `FLY_ORG`, `FLY_APPS`, `SENTRY_*`, `STRIPE_SECRET_KEY`.
- `messages/en.json`, `messages/cs.json` — i18n keys for any new labels (badge,
  app subtitle, KPI labels), following existing patterns (`dashboard_stats_*`,
  `runtime_kpi_*`).

## 4. File Structure (existing — modify in place)

```
frontend/metacleaner-monitoring/
├── .env.example
├── messages/{en,cs}.json
└── src/
    ├── lib/repositories/
    │   ├── dashboardRepository.ts
    │   ├── availabilityRepository.ts
    │   ├── runtimeRepository.ts
    │   ├── performanceRepository.ts
    │   ├── errorsRepository.ts
    │   ├── databaseRepository.ts
    │   ├── businessRepository.ts
    │   ├── usersRepository.ts
    │   └── edgeRepository.ts
    └── routes/runtime/components/
        ├── DeployItem.svelte
        └── InstanceCard.svelte
```

## 5. Exact Data Values

All concrete values (service tables, endpoint lists, error rows, KPI numbers,
geo splits, plan breakdown) are specified in `BRIEF.md` sections A1–A9 and
B1–B4. Use those tables verbatim as the source of truth.

## 6. Constraints, Edge Cases & Considerations

- **Interfaces are frozen** except the explicit `app: string` additions to
  `MachineInstance` and `DeployEntry`.
- **Keep all existing i18n keys working;** if a key is renamed, update both
  `en.json` and `cs.json`.
- **Availability grid** currently renders 4 cards; with 7 it must still look
  good (responsive grid — verify visually).
- **Static data only** — no `Date.now()`, no randomization.
- **Adding the `app` field to runtime data depends on the interface change** —
  do the interface edits (B1/B2) before/with the runtime data updates.
- Czech-market focus for edge geo (CZ 62%, SK 8%, DE 7%, US 5%, Other 18%).
- Final gate: `bun run check` passes; no TypeScript/lint regressions.
