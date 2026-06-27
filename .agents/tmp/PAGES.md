# MetaCleaner Monitoring — Pages Summary

## Global Design System

**Brand**: Monitorly
**Theme**: Dark navy monitoring dashboard
**Font**: Inter (400, 500, 600, 700) from Google Fonts
**Icons**: Font Awesome 6 (CDN)
**Charts**: Plotly.js (line charts, bar charts, pie/donut charts, heatmaps)

### Color Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| background | #0a1628 | Page/body background |
| card | #111d33 | Card backgrounds |
| badge | #1e293b | Badge/input backgrounds, lighter surfaces |
| primary / success | #22c55e | Success states, active nav, CTA |
| secondary | #f97316 | Warnings, degraded states |
| error | #ef4444 | Errors, critical alerts |
| textMain | #ffffff | Primary text |
| textSec | #94a3b8 | Secondary/muted text |
| blue | #3b82f6 | Info, links, secondary charts |
| purple | #8b5cf6 | Accent charts, categories |

### Shared Layout Pattern

**Desktop**: Permanent left sidebar (w-64, bg-card) + main content area (flex-1, overflow-y-auto)
**Mobile**: Sticky top header bar with hamburger → slide-over drawer (w-72/w-[280px]) + bottom navigation bar (fixed)

### Desktop Sidebar Structure
- Logo area: green square "M" + "Monitorly" text, border-b separator
- Nav sections with uppercase gray labels: "Přehledy", "Infrastruktura", "Analytika"
- Active item: bg-[#1e293b]/50 or /70 with border, colored icon, font-medium
- Inactive items: text-textSec, hover:text-textMain, hover:bg-[#1e293b]/50
- Bottom: "Nastavení" link with gear icon, border-t separator

### Desktop Header
- Sticky top-0, bg-background/90, backdrop-blur-md, border-b
- Left: Page title (text-2xl font-bold) + subtitle (text-sm text-textSec)
- Right: Status badge + time selector dropdown + Export button

### Mobile Top Bar
- Sticky top-0, bg-background/95, backdrop-blur-md, border-b
- Left: Hamburger button (w-10 h-10, bg-badge) + logo "M" + "Monitorly"
- Right: Action buttons (export, search, etc.)

### Mobile Drawer
- Fixed, inset-y-0, left-0, w-72, bg-card, z-50, transform translateX
- Same nav structure as desktop sidebar but with larger touch targets (py-3, min-h 44px)
- Close button (X icon) in header
- Overlay: fixed inset-0, bg-black/60, z-40

### Mobile Bottom Navigation
- Fixed bottom-0, bg-card, border-t, flex justify-around
- 5 items: icon + small label, min-h 44/52px
- Active item: text-primary color
- Items vary by page but typically: Dashboard, Dostupnost, Chyby, Výkon/Perf., Nastavení/Více

### Card Pattern
- bg-card, border border-[#1e293b], rounded-xl, p-5 (desktop) / p-4 (mobile)
- Mobile: rounded-2xl variant on some pages

### Stat Card Pattern
- Title (text-textSec text-sm font-medium) + optional status badge
- Large number (text-3xl font-bold) + optional trend indicator
- Optional progress bar (h-1.5, rounded-full)
- Optional description (text-xs text-textSec)

---

## Page 1: Dashboard

**Design files**: `monitoring-dashboard-desktop.html`, `monitoring-dashboard-mobile.html`
**Purpose**: System overview / main landing page showing high-level health metrics across all services
**Active nav item**: "Dashboard" (fa-gauge-high icon, text-primary)

### Content Sections

1. **Quick Stats Row** — 4 cards in grid
   - Uptime (Frontend): 99.99%, full green progress bar
   - Uptime (Backend API): 99.95%, nearly-full green progress bar
   - Error Rate (5xx): 0.12%, -0.05% trend (green), "Dnes zaznamenáno 42 chyb"
   - DB Health: "Healthy" text, "Latence: ~45ms"

2. **Charts Section 1** — 2-column grid
   - API Response Time (p95): Line chart (green, spline, fill-tozeroy), current value "285 ms"
   - Chyby & Pády (Frontend + Backend): Bar chart (red), dropdown filter (Všechny/5xx/JS Errors)

3. **Charts Section 2** — 2-column grid (desktop only, on mobile only Server Resources shown)
   - Server Zdroje (Fly.io): Multi-line area chart (blue=CPU, purple=RAM) with legend
   - DB Latence & Připojení: Line chart (orange), "Supabase" badge

4. **Aktivní Alerty & Nedávné Incidenty** — List section
   - Red dot: "Zvýšený počet 500 chyb na API" — 15 min ago
   - Orange dot: "Zpomalené dotazy v DB" — 2 hod ago
   - Green dot (resolved): "Frontend Deployment Timeout" — Včera, 14:30, line-through title

### Desktop Layout
- 4 stat cards: grid-cols-4
- Charts: grid-cols-2 (lg)
- Alerts: single column full-width card

### Mobile Layout
- Stat cards: stacked vertically (flex-col), rounded-2xl, icons get bg-[#1e293b] p-2 rounded-lg
- Charts: stacked vertically, 200px height, tighter margins
- No DB Latency chart on mobile
- Status banner: full-width green indicator at top
- Alerts: left colored border strip (w-1) instead of dot, card-based layout
- No bottom nav on dashboard mobile (only drawer nav)

---

## Page 2: Dostupnost (Availability)

**Design files**: `monitoring-availability-desktop.html`, `monitoring-availability-mobile.html`
**Purpose**: Service availability monitoring, uptime percentages, health checks, SLA goals, incident history
**Active nav item**: "Dostupnost" (fa-server icon, text-primary)

### Content Sections

1. **Summary Cards** — 4 cards with left color accent border (w-1)
   - Frontend (Vercel): 99.99%, ONLINE badge (green), 0 výpadků, ↑+0.01%
   - Backend API (Fly.io): 99.95%, ONLINE badge, 2 výpadky, ↓-0.03%
   - Databáze (Supabase): 99.97%, ONLINE badge, 1 výpadek, ↑+0.02%
   - Edge/CDN (Cloudflare): 99.82%, DEGRADED badge (orange), 5 výpadků, ↓-0.08%

2. **Response Time Chart + Health Checks** — 3-column grid (2+1)
   - Response Time (p95) chart: dual-line (green=Frontend, blue=Backend API), 260px height
   - Health Checks panel: 5 endpoint checks (/health, /api/ping, / root, /api/db-health, CF Edge Check) with status dots, response codes, latency. Footer: "Posl. kontrola: před 12s" + Refresh button

3. **Uptime Timeline** — 90-day history per service
   - Color-coded blocks: green=Provoz, orange=Degradace, red=Výpadek, gray=Bez dat
   - 4 services: Frontend, Backend API, Databáze, Edge CDN
   - Each with percentage uptime label

4. **Incidents + SLA** — 3-column grid (2+1)
   - Incident Log: Active/resolved incidents with filter tabs (Všechny/Aktivní/Vyřešené)
     - Active: orange border, warning icon, "Zvýšená latence Edge CDN", duration "2h 18m"
     - Resolved: green check icon, strikethrough title, duration shown
   - SLA Goals panel: progress bars per service vs. target (99.9% or 99.5%)
   - Quick Stats panel: Celkové výpadky (8), MTTR (6m 34s), MTBF (8.4 dní), Nejdelší výpadek (18m 5s), Check interval (60s), Alerty odesláno (12)

### Desktop Layout
- Summary: grid-cols-4
- Charts row: grid-cols-3 (2 for chart, 1 for health checks)
- Timeline: full-width, 12px wide blocks with 2px gap
- Bottom: grid-cols-3 (2 for incidents, 1 for SLA)

### Mobile Layout
- Summary: grid-cols-2, smaller cards
- Status banner at top for active incident (clickable)
- Full-width time range selector
- Health Checks: accordion (expandable)
- Uptime Timeline: accordion, thinner blocks (flex:1, min-width:2px)
- Incidents: card-based list, no separate SLA column
- SLA Goals: separate accordion section
- Quick Stats: 2x3 grid of stat boxes with centered text
- Bottom nav present

---

## Page 3: Chyby & Pády (Errors & Crashes)

**Design files**: `monitoring-errors-desktop.html`, `monitoring-errors-mobile.html`
**Purpose**: Error tracking, crash reporting, error log with filtering
**Active nav item**: "Chyby & Pády" (fa-triangle-exclamation icon, text-error)

### Content Sections

1. **KPI Stats** — 4 cards
   - 5xx Chyby (24h): 43, +18 (red trend), "Kritické" badge, Rate: 0.12%
   - JS Errors (Frontend): 127, +34 (orange trend), "Varování" badge
   - Backend Exceptions: 19, -5 (green trend), "Kritické" badge
   - Timeouty: 8, -2 (green trend), "Varování" badge

2. **Charts Row** — 2-column
   - 5xx Chyby v čase: Area/line chart (red), with dots, "Backend API" badge
   - JS Errors vs Backend Exceptions: Grouped bar chart (orange=JS, red=Backend)

3. **Error Type Breakdown + Top Endpoints** — 3-column (1+2)
   - Typy chyb: Donut chart (hole: 0.62), center annotation "196 celkem", legend below
     - Colors: red=5xx(42), orange=JS(127), purple=Exceptions(19), blue=Timeouty(8)
   - Top endpointy s chybami: 5 rows with HTTP method badge, endpoint path, progress bar, count
     - POST /api/v1/checkout: 24 (red, 85%)
     - GET /api/v1/users/profile: 11 (orange, 45%)
     - GET /api/v1/products: 7 (orange, 28%)
     - PUT /api/v1/orders/update: 4 (blue, 15%)
     - DEL /api/v1/sessions: 2 (blue, 8%)

4. **Error Log Table** — Full-width card
   - Filter tabs: Všechny | 5xx | JS | Backend | Timeout (toggle buttons with active state)
   - Search input
   - Table columns: Čas, Typ (badge), Zpráva, Endpoint/Zdroj, Status
   - 6 sample rows with different error types and statuses (Aktivní/Varování/Vyřešeno/Info)

### Desktop Layout
- Stats: grid-cols-4
- Charts: grid-cols-2
- Breakdown: grid-cols-3 (1 pie + 2 endpoints)
- Log: full-width table

### Mobile Layout
- Stats: 2x2 grid, more compact
- Charts: stacked vertically (180px height)
- Breakdown: accordion sections (collapsible)
- Endpoints: accordion section
- Error Log: card-based entries instead of table, with filter pills (horizontally scrollable)
- Bottom nav with "Chyby" active (error-colored icon)
- Header shows "2 incidenty" badge

---

## Page 4: Databáze / Supabase

**Design files**: `monitoring-database-desktop.html`, `monitoring-database-mobile.html`
**Purpose**: Database monitoring — connection pool, query latency, storage, slow queries, table sizes, error log
**Active nav item**: "Databáze (Supabase)" (fa-database icon, text-primary)

### Content Sections

1. **KPI Stats Row 1** — 4 cards
   - Aktivní spojení: 87/100, "Varování" badge (orange), 87% progress bar
   - Avg. Query Latency: 24ms, -3ms trend (green), P95: 142ms, P99: 380ms
   - Využití úložiště: 6.2/8 GB, 77% progress bar (blue)
   - DB Chyby (24h): 12, +7 (red), "Kritické" badge

2. **KPI Stats Row 2** — 4 cards with icon badges
   - Queries/min: 1,842 (Peak: 3,210 qps)
   - Replikace lag: 18ms (Replika: eu-west-1b)
   - Zámky (locks): 3 (Deadlocks dnes: 1)
   - Zálohy: "Aktuální" (Poslední: dnes 03:00, 4.8 GB)

3. **Charts Row** — 2-column + 1-column grid
   - Query latency v čase: line chart
   - Aktivní spojení v čase: line chart
   - Typy dotazů: pie/donut chart (SELECT, INSERT, UPDATE, DELETE distribution)

4. **Nejpomalejší dotazy** — Full-width card
   - Top 5 slowest queries with SQL preview, average duration, table/function context

5. **Velikost tabulek** — Table sizes visualization

6. **Queries za minutu** — Additional throughput chart

7. **Databázový error log** — Log entries (12 records, last 24h)

### Desktop Layout
- Stats: grid-cols-4 per row (2 rows)
- Charts: grid-cols-2 for time series + separate pie
- Tables/log: full-width

### Mobile Layout
- Stats: 2x2 grid
- Charts: stacked, accordion sections
- Slow queries: card-based accordion
- Bottom nav present

---

## Page 5: Runtime / Fly.io

**Design files**: `monitoring-runtime-desktop.html`, `monitoring-runtime-mobile.html`
**Purpose**: Application runtime monitoring — CPU, RAM, instances, deploys, response time, network traffic
**Active nav item**: "Runtime (Fly.io)" (fa-microchip icon, text-primary)

### Content Sections

1. **KPI Stats Row 1** — 4 cards
   - CPU Využití: 74%, "Varování" badge, +12% trend, progress bar (orange)
   - RAM Využití: 1.8/4 GB, "OK" badge, 45% progress bar (blue)
   - Uptime (30 dní): 99.97%, "OK" badge, green
   - Restarty (24h): 5, +3 (red), "Kritické" badge, "OOM kill: 2, Crash: 3"

2. **KPI Stats Row 2** — 4 cards with icon badges
   - Aktivní instance: 3/5 max (Autoscale: OFF, fra region)
   - Síťový provoz: 2.4 GB/h (IN: 840 MB, OUT: 1.56 GB)
   - Avg. Response Time: 112ms (P99: 840ms, P95: 420ms)
   - Posl. deploy: v2.14.1 (Dnes 11:04, 38s deploy time)

3. **Charts Row** — 2-column
   - CPU využití v čase: line chart
   - RAM využití v čase: line chart (Heap & RSS)

4. **Stav instancí (Machines)** — Instance status panel
   - Fly.io region: fra, 3 active instances
   - Instance cards with status, CPU%, RAM, uptime

5. **Additional Charts** — 2-column
   - Response time: HTTP response time chart
   - Síťový provoz: Ingress/Egress per hour

6. **Historie deployů** — Deploy history (last 7 days)

7. **Runtime error log** — 8 log entries, last 24h

8. **HTTP Status kódy** — Distribution donut/pie

9. **Requesty za minutu** — Request throughput chart

### Desktop Layout
- Stats: grid-cols-4 per row
- Charts: grid-cols-2
- Instances: custom grid
- Log: full-width table

### Mobile Layout
- Stats: 2x2 grid
- Charts/sections: stacked with accordions
- Instance status: vertically stacked cards
- Bottom nav present

---

## Page 6: Edge / Cloudflare

**Design files**: `monitoring-edge-desktop.html`, `monitoring-edge-mobile.html`
**Purpose**: CDN and edge network monitoring — cache performance, bandwidth, threats, WAF, TTFB
**Active nav item**: "Edge (Cloudflare)" (fa-cloud icon, text-primary)

### Content Sections

1. **KPI Stats Row 1** — 4 cards
   - Cache Hit Rate: 94.2%, +1.4% (green), "Výborné" badge, progress bar
   - Celkové požadavky: 48.3M (24h), Peak: 2.4M/h
   - Ušetřená bandwidth: 2.8 TB, 72% progress bar (blue), 3.9 TB total
   - Blokované hrozby: 1,247, +312 (orange), "Pozor" badge

2. **KPI Stats Row 2** — 4 cards with icon badges
   - Aktivní PoP: 275 locations
   - Avg. TTFB: 38ms (-12ms vs. origin)
   - WAF Pravidla: 48 active, 3 new today
   - SSL/TLS Status: TLS 1.3, cert valid, 89 days remaining

3. **Charts Row** — 2-column + pie
   - Požadavky v čase: Cache hit vs. miss chart
   - Přenesená data (GB/h): Bandwidth chart
   - Typy hrozeb: Pie chart (threat distribution)

4. **TTFB dle regionu** — Regional latency comparison

5. **HTTP Status kódy** — Status code distribution from edge

6. **Cache pravidla** — Cache rules performance by URL patterns

7. **WAF & Security logy** — Security log table (1,247 records, last 24h)

### Desktop Layout
- Stats: grid-cols-4
- Charts: grid-cols-2 + separate pie section
- Tables: full-width

### Mobile Layout
- Stats: 2x2 grid
- Charts: stacked with accordions
- Bottom nav present

---

## Page 7: Performance

**Design files**: `monitoring-performance-desktop.html`, `monitoring-performance-mobile.html`
**Purpose**: Application performance analytics — Apdex, response times, throughput, Web Vitals, slow endpoints
**Active nav item**: "Performance" (fa-bolt icon, text-primary)

### Content Sections

1. **KPI Stats Row 1** — 4 cards
   - Apdex Score: 0.94, +0.02 (green), "Výborný" badge, progress bar (94%)
   - Avg. Response Time: 187ms, -14ms (green), P95: 480ms, P99: 1,240ms
   - Throughput: 3,841 req/min, "Normal" badge (blue), Peak: 6,210 rpm
   - Chybovost: 1.8%, +0.4% (red), "Varování" badge, Cíl: <1%

2. **KPI Stats Row 2** — 4 cards with icon badges
   - RAM Utilizace: 72%, 5.8/8 GB, progress bar (amber)
   - CPU Utilizace: 38%, progress bar (green), Peak: 84%
   - Síťová latence: 12ms, CDN cache hit: 91.4%
   - (4th card with uptime/reliability info)

3. **Charts** — 2-column + error donut
   - Response Time v čase: Line chart with avg and P95 lines
   - Throughput v čase: Requests per minute bar/line
   - CPU & RAM Utilizace: Dual-line area chart
   - Typy chyb: Donut chart (HTTP error code distribution)

4. **Nejpomalejší endpointy** — Top 6 by average response time
   - Endpoint path + method badge + latency bar + ms value

5. **Core Web Vitals** — Frontend performance metrics
   - LCP, FID, CLS with status indicators and progress bars

6. **Performance události** — Anomaly/incident log (24h)

### Desktop Layout
- Stats: grid-cols-4
- Charts: grid-cols-2 arrangement with separate donut
- Endpoints: full-width table/list
- Web Vitals: separate card section

### Mobile Layout
- Stats: 2x2 grid
- Charts/sections: stacked vertically with accordions
- Bottom nav present

---

## Page 8: Security Signály

**Design files**: `monitoring-security-desktop.html`, `monitoring-security-mobile.html`
**Purpose**: Security monitoring — threat score, attack detection, blocked IPs, failed logins, WAF events
**Active nav item**: "Security Signály" (fa-shield-halved icon, text-primary)

### Content Sections

1. **KPI Stats Row 1** — 4 cards
   - Threat Score: 74/100, +12 (red), "Kritické" badge, red border on card, progress bar
   - Neúspěšná přihlášení: 1,284, +340 (orange), "Varování" badge
   - Blokované IP adresy: 38, +6 (green), "Aktivní" badge, Auto: 28, Manual: 10
   - Anomálie (24h): 7, +3 (red), "Kritické" badge, SQL Injection/XSS/Rate Abuse

2. **KPI Stats Row 2** — 4 cards with icon badges
   - Skenování portů: 12 unique attackers today
   - SQL Injection pokusy: 23, all blocked by WAF
   - (API key related stats)
   - (Additional security stats)

3. **Charts** — 2-column + pie
   - Bezpečnostní události v čase: Events per hour chart
   - Geografický původ hrozeb: Top 5 attacker countries
   - Typy útoků: Pie chart (attack type distribution)

4. **Aktivní hrozby** — Active threats requiring attention

5. **Blokované IP adresy** — Blocked IP list (auto + manual)

6. **Neúspěšná přihlášení v čase** — Failed login attempts chart

7. **Security Event Log** — 47 records, last 24h

### Desktop Layout
- Stats: grid-cols-4
- Charts: grid-cols-2 + pie
- Threats and IPs: custom layout
- Log: full-width table

### Mobile Layout
- Stats: 2x2 grid
- Sections: stacked with accordions
- Bottom nav present

---

## Page 9: Business Metriky

**Design files**: `monitoring-bussiness-desktop.html`, `monitoring-bussiness-mobile.html`
**Purpose**: Business metrics — MRR, ARR, churn, user growth, LTV/CAC, ARPU, conversion funnel, OKRs
**Active nav item**: "Business Metriky" (fa-chart-line icon, text-primary)

### Content Sections

1. **KPI Stats Row 1** — 4 cards
   - MRR: $48,320, +12.4%, +$5,340 vs. last month
   - ARR: $579,840, +12.4%
   - Aktivní uživatelé: 12,842, +8.1%, DAU: 3,210, WAU: 8,940
   - Churn Rate: 2.1%, -0.3% (improving), Cíl: <2.0%, 48 left

2. **KPI Stats Row 2** — 4 cards with icon badges
   - Nové objednávky: 1,204, +142
   - Průměrná hodnota objednávky: $40.13, +$2.40
   - Noví zákazníci: 318, +52
   - NPS Skóre: 72/100, 1,840 responses

3. **Revenue Charts** — 2-column
   - Vývoj MRR: 12-month line chart
   - Růst uživatelů: Active users + new registrations

4. **LTV vs. CAC** — Bar chart comparison by plan

5. **ARPU Trend** — 12-month ARPU line

6. **Aktivita uživatelů** — Heatmap (sessions by day/hour)

7. **MRR Bridge** — Waterfall/bridge chart (June 2024 movement)

8. **Upgrade & Downgrade** — Funnel chart (plan movement)

9. **Denní příjem** — Daily revenue bar chart (30 days)

10. **Konverzní trychtýř** — Customer journey funnel with step counts

11. **Příjem podle plánu** — MRR distribution by plan (pie/bar)

12. **Churn vs. Nový MRR** — Comparison chart

13. **Retence kohort** — Cohort retention table/heatmap

14. **Příjem dle kanálu** — Revenue by acquisition channel

15. **Payback Period** — CAC payback by plan

16. **Top zákazníci dle MRR** — Top paying customers list

17. **Příjem dle regionu** — Geographic MRR distribution

18. **Cíle & OKR – Q2 2024** — Quarterly business goals and progress

### Desktop Layout
- Stats: grid-cols-4
- Charts: various grid-cols-2 and grid-cols-3 arrangements
- Tables/funnels: full-width or mixed

### Mobile Layout
- Stats: 2x2 grid
- All sections: stacked vertically with accordions
- Most extensive page — many collapsible sections
- Bottom nav present

---

## Page 10: Uživatelé (Users)

**Design files**: `monitoring-users-desktop.html`, `monitoring-users-mobile.html`
**Purpose**: User management — user list, registration stats, active sessions, online status tracking
**Active nav item**: "Uživatelé" (fa-users icon, text-primary)

### Content Sections

1. **KPI Stats** — 4 cards
   - Celkem uživatelů: 12,847, +8.4% vs. last month
   - Právě přihlášeni: 342 (Live badge)
   - Nové registrace (30d): 1,024
   - Neaktivní (30+ dní): 874

2. **Charts** — 2-column
   - Registrace za 30 dní: Bar/line chart showing daily registrations
   - Aktivní relace (24h): Live session count chart with "Live" badge

3. **User Table** — Full-width card with:
   - Tab bar: Všichni (12,847) | Online (342) | Noví 30d (1,024) | Neaktivní (874)
   - Filter and Sort buttons
   - Table columns: Uživatel (avatar + name + email), Stav (online/idle/offline dot), Registrován, Poslední přihlášení, Relací, Lokace, Role, Actions
   - Sample users with Czech names, avatars, roles (Admin/Editor/Developer/Viewer)
   - Pagination: "Zobrazeno 1-10 z 12,847" + page buttons

### Desktop Layout
- Stats: grid-cols-4
- Charts: grid-cols-2
- Table: full-width with all columns visible at various breakpoints (md/lg/xl)
- Pagination: inline

### Mobile Layout
- Stats: 2x2 grid
- Charts: stacked
- Search: expandable search bar (toggle button)
- User list: card-based instead of table, with key info per card
- Tabs: horizontally scrollable pill tabs
- Bottom nav present
