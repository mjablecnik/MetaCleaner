# MetaCleaner Monitoring — Simplification Spec

## Goal

Remove duplicated, unrealizable, and low-value metrics from the monitoring dashboard. This is a deletion/simplification task — no new features are added.

## Technical Context

- Project: `frontend/metacleaner-monitoring/` — SvelteKit 2, Svelte 5 (runes), Tailwind CSS 4, Paraglide i18n (en/cs)
- Navigation is driven by `src/lib/repositories/navigationRepository.ts` (sidebar) and per-page `navItems` arrays (MobileBottomNav)
- Charts use Plotly.js (loaded globally via `window.Plotly`)
- i18n keys live in `messages/en.json` and `messages/cs.json`

## Changes

### 1. Delete Security Route (entire page)

Delete `src/routes/security/` directory and `src/lib/repositories/securityRepository.ts`. Remove security from sidebar navigation (`navigationRepository.ts`) and from the Edge page's MobileBottomNav `navItems` array.

### 2. Remove Performance → Web Vitals Section

Delete `PerformanceWebVitalsSection.svelte` and `WebVitalCard.svelte` (+ stories). Remove import/usage from `performance/+page.svelte`. Remove `getCoreWebVitals` from `performanceRepository.ts`.

### 3. Remove Performance → CPU/RAM + Error Distribution (Charts Row 2)

From `PerformanceChartsSection.svelte`: remove the entire "Charts Row 2" section (desktop `lg:grid-cols-3` with CPU/RAM chart + Error Distribution donut) and its mobile accordion equivalents (`cpu` and `errors`). Keep only Response Time + Throughput (Row 1). Remove `getErrorCodeDistribution` from `performanceRepository.ts`.

### 4. Remove Runtime → HTTP Section

Delete `RuntimeHttpSection.svelte`. Remove import/usage from `runtime/+page.svelte`. Remove `getRuntimeHttpStatusDistribution` from `runtimeRepository.ts`.

### 5. Remove Edge → TTFB by Region

From `EdgeThreatSection.svelte`: remove TTFB region bars (desktop + mobile), the `chart-ttfb-region` / `chart-ttfb-region-m` Plotly charts, and related resize handlers. Keep only the Threat Types donut pie + legend. Change desktop grid from `grid-cols-3` to a single column card. Delete `TtfbRegionBar.svelte` (+ stories). Remove `getTtfbRegions` from `edgeRepository.ts`.

### 6. Remove Database → Secondary KPI Section

Delete `DatabaseSecondaryKpiSection.svelte`. Remove import/usage from `databaze/+page.svelte`. Remove `getDbSecondaryKpis` from `databaseRepository.ts`.

### 7. Simplify Users → Remove Active Sessions Chart

From `UsersChartsSection.svelte`: remove the "Active Sessions" chart (desktop + mobile). Change desktop layout from `grid-cols-2` to single full-width. Remove session-related Plotly code and chart elements.

### 8. Update .env.example

Add Sentry and Stripe environment variables.

### 9. Clean i18n Keys

Remove unused i18n keys from `messages/en.json` and `messages/cs.json` for deleted sections (prefixes: `security_`, `performance_cwv_`, `edge_ttfb_`, `runtime_charts_http`, `runtime_charts_rpm`).

## File Deletions

```
src/routes/security/                    (entire directory)
src/lib/repositories/securityRepository.ts
src/routes/performance/sections/PerformanceWebVitalsSection.svelte
src/routes/performance/components/WebVitalCard.svelte
src/routes/performance/components/WebVitalCard.stories.svelte
src/routes/runtime/sections/RuntimeHttpSection.svelte
src/routes/edge/components/TtfbRegionBar.svelte
src/routes/edge/components/TtfbRegionBar.stories.svelte
src/routes/databaze/sections/DatabaseSecondaryKpiSection.svelte
```

## File Modifications

```
src/lib/repositories/navigationRepository.ts  (remove security nav item)
src/routes/edge/+page.svelte                   (remove security from MobileBottomNav navItems)
src/routes/performance/+page.svelte            (remove WebVitals import/usage)
src/routes/performance/sections/PerformanceChartsSection.svelte (remove Row 2 + mobile cpu/errors)
src/routes/runtime/+page.svelte                (remove RuntimeHttpSection import/usage)
src/routes/edge/sections/EdgeThreatSection.svelte (remove TTFB, simplify grid)
src/routes/databaze/+page.svelte               (remove DatabaseSecondaryKpiSection import/usage)
src/routes/uzivatele/sections/UsersChartsSection.svelte (remove Active Sessions chart)
src/lib/repositories/edgeRepository.ts         (remove getTtfbRegions)
src/lib/repositories/runtimeRepository.ts      (remove getRuntimeHttpStatusDistribution)
src/lib/repositories/performanceRepository.ts  (remove getCoreWebVitals, getErrorCodeDistribution)
src/lib/repositories/databaseRepository.ts     (remove getDbSecondaryKpis)
.env.example                                   (add Sentry + Stripe keys)
messages/en.json                               (remove unused keys)
messages/cs.json                               (remove unused keys)
```

## Constraints

- Do not delete any files that are still imported elsewhere after the changes
- The build must pass after all changes (`bun run check`)
- Keep all remaining functionality intact — this is purely subtractive
