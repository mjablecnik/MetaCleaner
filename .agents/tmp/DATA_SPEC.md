# DATA_SPEC.md — MetaCleaner Monitoring i18n + Repository Refactor

## Overview

**Project**: `frontend/metacleaner-monitoring/`
**Framework**: SvelteKit 2 + Svelte 5 (runes mode) + Tailwind CSS 4
**Current state**: 10 dashboard pages + 1 layout, all containing hardcoded Czech strings and mock data directly in components. No i18n usage beyond a placeholder `hello_world` key.

**Total hardcoded strings**: ~1,500+ user-facing strings across 11 files
- Czech text lines with diacritics: 894
- Additional English labels/titles: ~600+

**i18n infrastructure**: Paraglide JS already configured (`@inlang/paraglide-js`) with `en`/`cs` locales, but only a placeholder key exists. Generated runtime is in `src/lib/paraglide/`.

## Detected Framework & i18n Setup

### Already Configured
- Paraglide JS v2.18.2 (`@inlang/paraglide-js`)
- `project.inlang/settings.json` with `baseLocale: "en"`, `locales: ["en", "cs"]`
- Message files at `messages/en.json` and `messages/cs.json`
- Generated runtime at `src/lib/paraglide/`

### Required Setup
1. Create a `t()` helper in `src/lib/i18n.ts` (same pattern as metacleaner-app's `tx()`)
2. Populate `messages/en.json` and `messages/cs.json` with all extracted keys
3. Create locale state + initialization in `src/lib/locale.svelte.ts`
4. Add a language switcher component in the sidebar/drawer

### Translation Key Naming Convention

Pattern: `{page}.{section}.{element}`

Examples:
- `layout.nav.overviews` → "Overviews" / "Přehledy"
- `dashboard.header.title` → "System Overview" / "Přehled systému"
- `dashboard.stats.uptimeFrontend` → "Uptime (Frontend)"
- `availability.incidents.title` → "Outages & Incidents" / "Výpadky & Incidenty"
- `common.timeRange.last24h` → "Last 24 hours" / "Posledních 24 hodin"
- `common.status.allSystemsOperational` → "All systems operational" / "Všechny systémy operativní"

## File-by-File Analysis

---

### 1. `src/routes/+layout.svelte` (~170 lines)

**UI Strings (7):**
| String | Key | Type |
|--------|-----|------|
| `Přehledy` | `layout.nav.overviews` | UI |
| `Infrastruktura` | `layout.nav.infrastructure` | UI |
| `Analytika` | `layout.nav.analytics` | UI |
| `Dashboard` | `layout.nav.dashboard` | UI |
| `Dostupnost` | `layout.nav.availability` | UI |
| `Chyby & Pády` | `layout.nav.errors` | UI |
| `Databáze (Supabase)` | `layout.nav.database` | UI |
| `Runtime (Fly.io)` | `layout.nav.runtime` | UI |
| `Edge (Cloudflare)` | `layout.nav.edge` | UI |
| `Performance` | `layout.nav.performance` | UI |
| `Security Signály` | `layout.nav.security` | UI |
| `Business Metriky` | `layout.nav.business` | UI |
| `Uživatelé` | `layout.nav.users` | UI |
| `Nastavení` | `layout.nav.settings` | UI |
| `Monitorly` | (keep as brand, no i18n) | — |
| `Export` (aria-label) | `common.actions.export` | UI |
| `Menu` (aria-label) | `common.actions.menu` | UI |
| `Close Menu` (aria-label) | `common.actions.closeMenu` | UI |

**API/Data Strings**: None — navigation structure is **data** that should come from a repository.

---

### 2. `src/routes/+page.svelte` (Dashboard, ~340 lines)

**UI Strings (~25 Czech + ~15 English):**
- Page header: "Přehled systému (MVP)", "Produkční prostředí • Posledních 24 hodin"
- Status badge: "Všechny systémy operativní"
- Stat cards: "Uptime (Frontend)", "Uptime (Backend API)", "Error Rate (5xx)", "DB Health"
- Values context: "Dnes zaznamenáno 42 chyb", "Průměrná latence: ~45ms", "Latence: ~45ms"
- Chart titles: "API Response Time", "Chyby & Pády (Frontend + Backend)", "Server Zdroje (Fly.io)", "DB Latence & Připojení"
- Select options: "Všechny", "5xx", "JS Errors"
- Alerts section: "Aktivní Alerty & Nedávné Incidenty", "Zobrazit vše", "Vše"
- Export button: "Export"

**API/Data Strings:**
- Stat values: 99.99%, 99.95%, 0.12%, -0.05%, "Healthy", 285ms, 42 errors
- Alert items: titles, descriptions, timestamps (3 incidents with Czech descriptions)
- Chart legend: "CPU", "RAM", "Supabase" badge

---

### 3. `src/routes/dostupnost/+page.svelte` (Availability, ~900 lines)

**UI Strings (~107 Czech):**
- Header: "Dostupnost služeb", "Produkční prostředí • Monitoring v reálném čase"
- Status: "Všechny systémy operativní"
- Time range options: "Posledních 24 hodin/7 dní/30 dní"
- Service cards: "Frontend Web", "Backend API", "Databáze", "CDN & Edge"
- Stats: "Posledních 30 dní", "0 výpadků", "2 výpadky", "1 výpadek", "5 výpadků"
- Chart: "Průměrná odezva posledních 24 hodin"
- Health checks: "Každých 60s", "Posl. kontrola: před 12s"
- Timeline: "Historie dostupnosti — Posledních 90 dní", "Každý blok = 1 den. Najeďte myší pro detaily."
- Incidents section: "Výpadky & Incidenty", "Všechny/Aktivní/Vyřešené"
- SLA section, MTTR/MTBF stats

**API/Data Strings:**
- Service uptime values (99.99%, 99.95%, 99.92%, 99.78%)
- Response times (187ms, 245ms, 24ms, 42ms)
- Health check endpoint data (5 endpoints with URLs, status, latency)
- Incident log entries (timestamps, descriptions, durations)
- SLA progress values, MTTR/MTBF numbers

---

### 4. `src/routes/chyby/+page.svelte` (Errors, ~670 lines)

**UI Strings (~44 Czech):**
- Header: "Chyby & Pády", "Produkční prostředí • Posledních 24 hodin"
- Status: "2 aktivní incidenty"
- KPI cards: "5xx Chyby (24h)", "JS Exceptions", "Backend Exceptions", "Timeouts"
- Charts: "5xx Timeline", "JS vs Backend chyby", "Typy chyb"
- Breakdown section: "Rozpad dle typu", filter "Všechny/5xx/JS/Backend/Timeout"
- Top endpoints table headers
- Error log section with filter tabs

**API/Data Strings:**
- Error counts (42, 187, 23, 8)
- Trend values (+12%, +3.2%, -5%, +2)
- Error type breakdown items (TypeError, ReferenceError, etc.)
- Top error endpoints (5 entries with paths, counts, percentages)
- Error log entries (~15 entries with timestamps, types, messages)

---

### 5. `src/routes/databaze/+page.svelte` (Database, ~920 lines)

**UI Strings (~82 Czech):**
- Header: "Databáze (Supabase)", "Produkční prostředí • Region: eu-west-1 • Posledních 24 hodin"
- Status: "Databáze online"
- Stats: "Aktivní spojení", "Varování", "Využití úložiště", "Kritické"
- Charts: "Query latency v čase", "Aktivní spojení v čase", "Typy dotazů"
- Queries section: "Nejpomalejší dotazy", "Top 5 podle průměrné doby trvání"
- Table sizes section, DB error log

**API/Data Strings:**
- Connection pool values (87/100), query latency (24ms), storage (6.2/8 GB)
- Query type distribution (SELECT 45%, INSERT 28%, UPDATE 18%, DELETE 9%)
- Slowest queries (5 entries with SQL, table names, call counts, avg times)
- Table sizes (6 tables with row counts and sizes)
- DB error log entries

---

### 6. `src/routes/runtime/+page.svelte` (Fly.io Runtime, ~1100 lines)

**UI Strings (~80 Czech):**
- Header: "Runtime (Fly.io)", "Produkční prostředí • Region: fra (Frankfurt) • Posledních 24 hodin"
- Status: "3 / 3 Mašiny online"
- Stats: "CPU Využití", "RAM Využití", "Uptime (30 dní)", "Restarty (30 dní)"
- Charts: "CPU využití v čase", "RAM využití v čase", "Stav instancí (Machines)"
- Instance panel: machine names, regions, memory, status
- Deploy history: "Historie deployů", "Posledních 7 dní"
- Network chart, HTTP status, Requests/min

**API/Data Strings:**
- CPU/RAM percentages (67%, 45%, 99.98%)
- Restart count (3), instance count (3/3)
- Instance data (3 machines with IDs, regions, memory specs, uptimes)
- Deploy history (5 entries with versions, authors, timestamps, commit messages)
- Runtime error log entries

---

### 7. `src/routes/edge/+page.svelte` (Cloudflare Edge, ~1050 lines)

**UI Strings (~86 Czech):**
- Header: "Edge (Cloudflare)", "CDN & Security • 275+ PoP lokací • Posledních 24 hodin"
- Stats: "Cache Hit Rate", "Celkové požadavky", "Ušetřená bandwidth", "Blokované hrozby"
- Charts: "Požadavky v čase", "Přenesená data (GB/h)"
- Threat pie: "Distribuce blokovaných požadavků"
- TTFB section: "Průměrná latence z edge uzlů", "Top 6 regionů"
- Cache rules: "Výkon dle URL vzorů"
- HTTP status codes: "Distribuce odpovědí z edge"
- WAF log section

**API/Data Strings:**
- Cache hit rate (94.2%), total requests (48.3M), saved bandwidth (2.1 TB), blocked threats (12,847)
- PoP count (275), TTFB (18ms), WAF rules (847), SSL cert expiry (89 days)
- Requests/bandwidth chart data
- TTFB by region (6 regions with latencies)
- Cache rule performance (3 rules with hit rates)
- WAF security log entries (10+ entries)

---

### 8. `src/routes/performance/+page.svelte` (Performance, ~1060 lines)

**UI Strings (~115 Czech):**
- Header: "Performance", "Celková infrastruktura • Všechny regiony • Posledních 24 hodin"
- Status: "Systém OK"
- Stats: Apdex, Avg Response Time, Throughput, Error Rate
- Charts: "Response Time v čase", "Throughput v čase", "CPU & RAM využití"
- Error donut: "Distribuce HTTP chybových kódů"
- Endpoints: "Nejpomalejší endpointy", "Top 6 podle průměrné doby odpovědi"
- Core Web Vitals: LCP, FID, CLS with labels
- Event log section

**API/Data Strings:**
- Apdex (0.94), avg response (187ms), throughput (1,247 req/min), error rate (1.2%)
- Endpoint data (6 entries with paths, methods, avg times, call counts, error rates)
- Core Web Vitals values (LCP 1.8s, FID 12ms, CLS 0.05)
- Event log entries (10+ entries)

---

### 9. `src/routes/security/+page.svelte` (Security, ~980 lines)

**UI Strings (~148 Czech):**
- Header: "Security Signály", "Produkční prostředí • Všechny regiony • Posledních 24 hodin"
- Status: "3 aktivní hrozby"
- Stats: Threat Score, "Neúspěšná přihlášení", "Blokované IP adresy", "Anomálie (24h)"
- Charts: Security events timeline, Geographic origins
- Attack type pie, active threats panel
- Blocked IP list, security event log (47 records)

**API/Data Strings:**
- Threat score (74/100), failed logins (847), blocked IPs (38), anomalies (12)
- Geographic origin data (Russia, China, Ukraine, Iran)
- Attack type distribution (DDoS, Brute-force, SQL Injection, XSS, Port Scan)
- Active threats (3 entries with IPs, types, statuses)
- Blocked IP list (5+ entries)
- Security event log (47 entries shown, ~10 visible)

---

### 10. `src/routes/business/+page.svelte` (Business Metrics, ~1280 lines)

**UI Strings (~143 Czech):**
- Header: "Business Metriky", "Produkční prostředí • Všechny plány • Červen 2024"
- KPIs: MRR, ARR, "Aktivní uživatelé", Churn Rate
- Charts: "Vývoj MRR", "Růst uživatelů", "LTV vs CAC", "ARPU"
- Cohort heatmap, conversion funnel, OKR goals
- Secondary stats: "Nové objednávky", "Průměrná hodnota objednávky", "Noví zákazníci", "NPS Skóre"

**API/Data Strings:**
- MRR ($48,320), ARR ($579,840), active users (12,847), churn (1.8%)
- Monthly MRR data (12 months), user growth data
- LTV ($340) vs CAC ($85) values
- Cohort retention heatmap data
- Conversion funnel values (84,210 → 1,840)
- OKR goals (3 items with targets and progress)
- Geographic revenue distribution

---

### 11. `src/routes/uzivatele/+page.svelte` (Users, ~570 lines)

**UI Strings (~57 Czech):**
- Header: "Uživatelé", "Produkční prostředí • Přehled uživatelské báze"
- Stats: "Celkem uživatelů", "Právě přihlášeni", "Nové registrace (30d)", "Průměrná délka relace"
- Charts: "Registrace uživatelů", "Aktivní relace (24h)"
- Tab labels: "Všichni", "Online", "Noví (30d)", "Neaktivní"
- Table headers: "Stav", "Registrován", "Poslední přihlášení", "Relací", "Lokace", "Role"
- Pagination: "Zobrazeno 1–10 z 12 847 uživatelů"

**API/Data Strings:**
- User counts (12,847 total, 342 online, 1,024 new, 874 inactive)
- Session duration (8m 34s)
- User list (10 users with names, emails, avatars, statuses, dates, sessions, locations, roles)
- Registration chart data, active sessions chart data

---

## Repository Layer Design

### Repositories to Create

| Repository | File | Data Provided |
|---|---|---|
| `dashboardRepository` | `src/lib/repositories/dashboardRepository.ts` | Quick stats (uptime, error rate, DB health), alert items |
| `availabilityRepository` | `src/lib/repositories/availabilityRepository.ts` | Service uptime cards, health checks, incidents, SLA data, timeline |
| `errorsRepository` | `src/lib/repositories/errorsRepository.ts` | Error KPIs, error type breakdown, top endpoints, error log |
| `databaseRepository` | `src/lib/repositories/databaseRepository.ts` | Connection stats, query latency, storage, slowest queries, table sizes, DB errors |
| `runtimeRepository` | `src/lib/repositories/runtimeRepository.ts` | CPU/RAM stats, instances, deploy history, runtime errors |
| `edgeRepository` | `src/lib/repositories/edgeRepository.ts` | Cache stats, requests, bandwidth, threats, TTFB regions, WAF log |
| `performanceRepository` | `src/lib/repositories/performanceRepository.ts` | Apdex, response times, endpoints, Core Web Vitals, event log |
| `securityRepository` | `src/lib/repositories/securityRepository.ts` | Threat score, failed logins, blocked IPs, attack types, event log |
| `businessRepository` | `src/lib/repositories/businessRepository.ts` | MRR/ARR, user counts, churn, funnel, OKR goals, revenue geo |
| `usersRepository` | `src/lib/repositories/usersRepository.ts` | User stats, user list, registration/session chart data |
| `navigationRepository` | `src/lib/repositories/navigationRepository.ts` | Sidebar navigation sections and items |

Each repository exports typed factory functions returning mock data arrays/objects, ready to be replaced with real API calls later.

---

## Language Switching Mechanism

1. Locale state managed in `src/lib/locale.svelte.ts` with `$state` rune
2. Locale persisted in `localStorage('monitorly-locale')`
3. Language switcher added to the bottom of the desktop sidebar and mobile drawer (EN/CS toggle)
4. On switch: `setLocale()` from Paraglide runtime, update localStorage, re-render

---

## Translation File Structure

```
messages/
├── en.json    # ~500+ keys (English as base)
└── cs.json    # ~500+ keys (Czech translations)
```

Key namespaces:
- `common.*` — shared labels (time ranges, statuses, actions, pagination)
- `layout.*` — navigation, sidebar, brand
- `dashboard.*` — dashboard page
- `availability.*` — availability page
- `errors.*` — errors page
- `database.*` — database page
- `runtime.*` — runtime page
- `edge.*` — edge page
- `performance.*` — performance page
- `security.*` — security page
- `business.*` — business page
- `users.*` — users page
