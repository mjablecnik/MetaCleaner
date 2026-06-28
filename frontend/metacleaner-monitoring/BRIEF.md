# MetaCleaner Monitoring — Simplification Brief

This document describes all changes to simplify the monitoring dashboard by removing metrics that are duplicated, unrealizable without additional infrastructure, or low-value at this stage.

---

## 1. DELETE: Security page (entire route)

**Path:** `src/routes/security/`

**Reason:** The Security page is a near-duplicate of the Edge (Cloudflare) page. All security data (blocked IPs, WAF events, failed logins, threat types, geo origins) comes from Cloudflare Analytics API. The Edge page already has:
- EdgeThreatSection (threat types pie + TTFB by region)
- EdgeSecurityLogSection (WAF & security log table)

**Action:**
- Delete `src/routes/security/` directory entirely (page + all sections + all components)
- Remove security route from sidebar navigation in `+layout.svelte`
- Remove security route from all MobileBottomNav `navItems` arrays across pages
- Clean up unused i18n keys prefixed with `security_`
- Delete `src/lib/repositories/securityRepository.ts`

---

## 2. DELETE: Performance → Web Vitals section

**Path:** `src/routes/performance/sections/PerformanceWebVitalsSection.svelte`

**Reason:** Core Web Vitals (LCP, FID, CLS) require Real User Monitoring (RUM) — collecting metrics in the browser and sending them to a backend. We don't have Vercel Analytics, Google Analytics 4, or any RUM infrastructure. No data source exists for these metrics.

**Action:**
- Remove `PerformanceWebVitalsSection` import and usage from `src/routes/performance/+page.svelte`
- Delete `src/routes/performance/sections/PerformanceWebVitalsSection.svelte`
- Delete `src/routes/performance/components/WebVitalCard.svelte` and its stories file
- Remove `getCoreWebVitals` from `src/lib/repositories/performanceRepository.ts`
- Clean up unused i18n keys prefixed with `performance_cwv_`

---

## 3. DELETE: Performance → CPU/RAM chart

**Path:** Inside `src/routes/performance/sections/PerformanceChartsSection.svelte`

**Reason:** CPU and RAM charts are already displayed on the Runtime page (RuntimeChartsSection) with more detail (avg + peak CPU, RAM with limit line). Showing the same Fly.io Prometheus data on Performance is redundant.

**Action:**
- Remove the "Charts Row 2" section (CPU/RAM + Error Distribution donut) from `PerformanceChartsSection.svelte`
- Keep only: Response Time chart + Throughput chart (Charts Row 1)
- Move the Error Distribution donut into the existing Errors page (or drop it — it's also partially duplicated there)

---

## 4. DELETE: Runtime → HTTP Status + RPM section

**Path:** `src/routes/runtime/sections/RuntimeHttpSection.svelte`

**Reason:** HTTP status distribution and requests-per-minute are already shown on the Performance page (PerformanceChartsSection throughput chart). Duplicating them on Runtime adds no value.

**Action:**
- Remove `RuntimeHttpSection` import and usage from `src/routes/runtime/+page.svelte`
- Delete `src/routes/runtime/sections/RuntimeHttpSection.svelte`
- Clean up unused i18n keys prefixed with `runtime_charts_http`, `runtime_charts_rpm`
- Remove `getRuntimeHttpStatusDistribution` from `src/lib/repositories/runtimeRepository.ts`

---

## 5. DELETE: Edge → TTFB by Region (bars + chart)

**Path:** Inside `src/routes/edge/sections/EdgeThreatSection.svelte`

**Reason:** Cloudflare doesn't expose per-region TTFB easily via API. You'd need to query analytics per colo and aggregate — significant complexity for minimal value. The overall TTFB is already shown as a KPI card in EdgeKpiSection.

**Action:**
- From `EdgeThreatSection.svelte`, remove the TTFB region bars (TtfbRegionBar), the `chart-ttfb-region` chart, and related Plotly code
- Keep only the Threat Types donut pie + legend
- Change the desktop grid from `grid-cols-3` to a simpler layout (single card or 2-col with threats + something else)
- Delete `src/routes/edge/components/TtfbRegionBar.svelte` and its stories
- Remove `getTtfbRegions` from `src/lib/repositories/edgeRepository.ts`
- Clean up unused i18n keys prefixed with `edge_ttfb_`

---

## 6. SIMPLIFY: Database → Remove secondary KPI row

**Path:** `src/routes/databaze/sections/DatabaseSecondaryKpiSection.svelte`

**Reason:** The Database page has 8 KPI cards total (4 primary + 4 secondary). Secondary KPIs include "Queries/min", "Replikace lag", "Zámky (locks)", "Zálohy". Replication lag and locks are niche PostgreSQL metrics that provide no actionable insight at this stage. Queries/min is already shown as a chart.

**Action:**
- Remove `DatabaseSecondaryKpiSection` import and usage from `src/routes/databaze/+page.svelte`
- Delete `src/routes/databaze/sections/DatabaseSecondaryKpiSection.svelte`
- Keep the "Zálohy" (backups) status as a simple text indicator inside the primary KPI section or the tables section
- Remove `getDbSecondaryKpis` from `src/lib/repositories/databaseRepository.ts`
- Clean up unused i18n keys

---

## 7. SIMPLIFY: Users → Remove "Active Sessions" live chart

**Path:** Inside `src/routes/uzivatele/sections/UsersChartsSection.svelte`

**Reason:** The "Active Sessions" chart shows real-time online users per hour with a "Live" indicator. Supabase Auth doesn't expose who is currently online. Implementing this requires a WebSocket presence system or periodic heartbeat tracking — infrastructure we don't have.

**Action:**
- From `UsersChartsSection.svelte`, remove the "Active Sessions" chart (keep only "New Registrations" bar chart)
- Change desktop layout from 2-col grid to single full-width chart
- Remove session-related Plotly data and chart IDs
- Remove `getUserSessions` or equivalent from the users repository if it exists

---

## 8. ALREADY DONE: Business → Simplified metrics

The following were already removed from the Business page in a previous iteration:
- ARR (duplicate of MRR × 12)
- NPS Score (needs survey system)
- Average Order Value (irrelevant for subscription model)
- Revenue by Channel (needs attribution tracking)
- Revenue by Region/Geo (Stripe doesn't have region data)
- MRR Bridge / Waterfall (needs monthly snapshots)
- LTV vs CAC (needs marketing spend tracking)
- ARPU Trend (redundant)
- Activity Heatmap (needs event tracking)
- Payback Period (depends on CAC)
- BusinessGoalsSection (OKR with NPS goal)

---

## 9. UPDATE: Sidebar navigation

After removing the Security page, update the sidebar to reflect the final page list:

**Final pages (8 total):**
1. Dashboard (`/`)
2. Dostupnost (`/dostupnost`)
3. Chyby & Pády (`/chyby`)
4. Databáze (`/databaze`)
5. Runtime (`/runtime`)
6. Edge (`/edge`)
7. Performance (`/performance`)
8. Business Metriky (`/business`)
9. Uživatelé (`/uzivatele`)

**Remove from sidebar:**
- Security Signály link

---

## 10. UPDATE: .env.example — add missing API keys

Add the following to `.env.example` (needed for full functionality):

```env
# Sentry (error tracking)
SENTRY_AUTH_TOKEN=your-sentry-auth-token-here
SENTRY_ORG=your-sentry-org-slug
SENTRY_PROJECT=your-sentry-project-slug

# Stripe (business metrics)
STRIPE_SECRET_KEY=your-stripe-secret-key-here
```

---

## Summary of file deletions

```
DELETE src/routes/security/                    (entire directory)
DELETE src/lib/repositories/securityRepository.ts
DELETE src/routes/performance/sections/PerformanceWebVitalsSection.svelte
DELETE src/routes/performance/components/WebVitalCard.svelte
DELETE src/routes/performance/components/WebVitalCard.stories.svelte
DELETE src/routes/runtime/sections/RuntimeHttpSection.svelte
DELETE src/routes/edge/components/TtfbRegionBar.svelte
DELETE src/routes/edge/components/TtfbRegionBar.stories.svelte
DELETE src/routes/databaze/sections/DatabaseSecondaryKpiSection.svelte
DELETE src/routes/business/sections/BusinessGoalsSection.svelte       (already done)
DELETE src/routes/business/components/GoalProgressBar.svelte          (already done)
DELETE src/routes/business/components/GoalProgressBar.stories.svelte  (already done)
```

## Summary of file modifications

```
MODIFY src/routes/+layout.svelte                          (remove security nav link)
MODIFY src/routes/performance/+page.svelte                (remove WebVitals + CPU/RAM)
MODIFY src/routes/performance/sections/PerformanceChartsSection.svelte (remove CPU/RAM row)
MODIFY src/routes/runtime/+page.svelte                    (remove RuntimeHttpSection)
MODIFY src/routes/edge/sections/EdgeThreatSection.svelte   (remove TTFB region)
MODIFY src/routes/databaze/+page.svelte                   (remove SecondaryKpiSection)
MODIFY src/routes/uzivatele/sections/UsersChartsSection.svelte (remove Active Sessions)
MODIFY src/lib/repositories/edgeRepository.ts             (remove getTtfbRegions)
MODIFY src/lib/repositories/runtimeRepository.ts          (remove getRuntimeHttpStatusDistribution)
MODIFY src/lib/repositories/performanceRepository.ts      (remove getCoreWebVitals)
MODIFY src/lib/repositories/databaseRepository.ts         (remove getDbSecondaryKpis)
MODIFY .env.example                                       (add Sentry + Stripe keys)
MODIFY all pages with MobileBottomNav referencing security route
```
