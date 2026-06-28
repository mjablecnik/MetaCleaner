# UI Refactoring Tasks — Monitorly (metacleaner-monitoring)

## Phase 0 — Theme / Design Tokens

- [x] 1. [HIGH] Extend `layout.css` @theme with missing color tokens: `--color-surface` (#1e293b), `--color-border` (#334155), `--color-blue` (#3b82f6), `--color-green-muted` (#3ecf8e), `--color-purple` (#8b5cf6), `--color-amber` (#f59e0b), `--color-purple-light` (#a78bfa), `--color-surface-hover` (#2d3748), `--color-surface-deep` (#0f172a); create `src/lib/theme/chartColors.ts` exporting all color hex values for Plotly usage
- [x] 2. [HIGH] Replace all hardcoded `bg-[#1e293b]`, `border-[#1e293b]`, `text-[#1e293b]` (486 occurrences) with `bg-surface`, `border-surface` theme utilities across all pages
- [x] 3. [HIGH] Replace all hardcoded `border-[#334155]`, `bg-[#334155]` (125 occurrences) with `border-border`, `bg-border` theme utilities across all pages
- [x] 4. [MEDIUM] Replace remaining hardcoded color values (`bg-[#3b82f6]`, `text-[#3b82f6]`, `bg-[#8b5cf6]`, `bg-[#3ecf8e]`, `bg-[#f59e0b]`, `bg-[#a78bfa]`, `bg-[#2d3748]`, `bg-[#0f172a]`, `text-[#ef4444]`, `text-[#f97316]`, `text-[#22c55e]`, `text-[#3ecf8e]`, `text-[#a78bfa]`, `text-[#f59e0b]`) with theme token utilities across all pages
- [x] 5. [MEDIUM] Replace all hardcoded hex values in Plotly chart `onMount` blocks with imports from `src/lib/theme/chartColors.ts`

## Phase 1 — Shared Elements

- [x] 6. [HIGH] Create `StatCard` element in `src/lib/shared/elements/StatCard.svelte` — KPI stat card with value, label, icon, optional trend/progress bar; used by all 10 pages
- [x] 7. [HIGH] Create `StatCard.stories.svelte` — states: Default, WithTrend, WithProgressBar, WithSubtext
- [x] 8. [HIGH] Create `ChartCard` element in `src/lib/shared/elements/ChartCard.svelte` — card wrapper with title and optional right-side snippet for chart containers; used by all 10 pages
- [x] 9. [HIGH] Create `ChartCard.stories.svelte` — states: Default, WithRightContent, Mobile
- [x] 10. [HIGH] Create `AccordionSection` element in `src/lib/shared/elements/AccordionSection.svelte` — collapsible section with rotating chevron; used by 8 pages (mobile)
- [x] 11. [HIGH] Create `AccordionSection.stories.svelte` — states: Open, Closed, WithIcon
- [x] 12. [HIGH] Create `StatusBadge` element in `src/lib/shared/elements/StatusBadge.svelte` — colored status pill (online/degraded/offline/active/resolved/critical/warning/info); used by 6 pages
- [x] 13. [HIGH] Create `StatusBadge.stories.svelte` — states: Online, Degraded, Offline, Active, Resolved, Critical, Warning, Info
- [x] 14. [MEDIUM] Create `MethodBadge` element in `src/lib/shared/elements/MethodBadge.svelte` — HTTP method badge (GET/POST/PUT/DELETE); used by 4 pages
- [x] 15. [MEDIUM] Create `MethodBadge.stories.svelte` — states: GET, POST, PUT, DELETE
- [x] 16. [MEDIUM] Create `ProgressBar` element in `src/lib/shared/elements/ProgressBar.svelte` — horizontal progress bar with optional label/percent; used by 5 pages
- [x] 17. [MEDIUM] Create `ProgressBar.stories.svelte` — states: Default, WithLabel, Full, Empty, CustomColor
- [x] 18. [MEDIUM] Create `FilterPill` element in `src/lib/shared/elements/FilterPill.svelte` — toggleable filter button; used by 5 pages
- [x] 19. [MEDIUM] Create `FilterPill.stories.svelte` — states: Active, Inactive
- [x] 20. [MEDIUM] Create `DataTable` element in `src/lib/shared/elements/DataTable.svelte` — responsive table container with header row; used by 8 pages
- [x] 21. [MEDIUM] Create `DataTable.stories.svelte` — states: Default, Empty, ManyRows

## Phase 2 — Shared Components

- [x] 22. [HIGH] Create `MobileBottomNav` component in `src/lib/shared/components/MobileBottomNav.svelte` — fixed bottom navigation bar with active state; used by 9 pages
- [x] 23. [HIGH] Create `MobileBottomNav.stories.svelte` — states: Default, DifferentActiveItem
- [x] 24. [HIGH] Create `PageHeader` component in `src/lib/shared/components/PageHeader.svelte` — desktop sticky header + mobile title area combined; used by all 10 pages
- [x] 25. [HIGH] Create `PageHeader.stories.svelte` — states: Default, WithStatusBadge, WithActions
- [x] 26. [HIGH] Create `KpiGrid` component in `src/lib/shared/components/KpiGrid.svelte` — responsive grid rendering StatCard elements; used by 8 pages
- [x] 27. [HIGH] Create `KpiGrid.stories.svelte` — states: FourColumns, TwoColumns, WithTrends
- [x] 28. [HIGH] Create `PlotlyChart` component in `src/lib/shared/components/PlotlyChart.svelte` — Plotly init/resize/cleanup wrapper; used by all 10 pages
- [x] 29. [HIGH] Create `PlotlyChart.stories.svelte` — states: LineChart, BarChart, PieChart
- [x] 30. [HIGH] Create `EventLogTable` component in `src/lib/shared/components/EventLogTable.svelte` — filterable event log with severity badges, time column, optional filters; used by 7 pages
- [x] 31. [HIGH] Create `EventLogTable.stories.svelte` — states: Default, WithFilters, Empty
- [x] 32. [MEDIUM] Create `TabSwitcher` component in `src/lib/shared/components/TabSwitcher.svelte` — horizontal tab bar for mobile chart switching; used by 5 pages
- [x] 33. [MEDIUM] Create `TabSwitcher.stories.svelte` — states: Default, ThreeTabs, FourTabs

## Phase 3 — Page-Specific Components and Sections

### Dashboard

- [x] 34. [HIGH] Create `AlertItem` component in `src/routes/components/AlertItem.svelte` + story — single alert row with severity styling
- [x] 35. [HIGH] Create `DashboardKpiSection` in `src/routes/sections/DashboardKpiSection.svelte` — 4 stat cards section
- [x] 36. [HIGH] Create `DashboardChartsRow1Section` in `src/routes/sections/DashboardChartsRow1Section.svelte` — response time + errors charts
- [x] 37. [HIGH] Create `DashboardChartsRow2Section` in `src/routes/sections/DashboardChartsRow2Section.svelte` — server resources + DB latency charts
- [x] 38. [HIGH] Create `DashboardAlertsSection` in `src/routes/sections/DashboardAlertsSection.svelte` — alerts list composing AlertItem

### Availability (dostupnost)

- [x] 39. [HIGH] Create page-specific components in `src/routes/dostupnost/components/`: `ServiceUptimeCard`, `UptimeTimeline`, `HealthCheckRow`, `IncidentItem`, `SlaGoalBar` + stories for each
- [x] 40. [HIGH] Create sections in `src/routes/dostupnost/sections/`: `AvailabilityServiceCardsSection`, `AvailabilityResponseChartSection`, `AvailabilityHealthChecksSection`, `AvailabilityTimelineSection`, `AvailabilityIncidentsSection`, `AvailabilitySlaSection`, `AvailabilityQuickStatsSection`

### Errors (chyby)

- [x] 41. [HIGH] Create page-specific components in `src/routes/chyby/components/`: `ErrorEndpointRow`, `ErrorLogRow` + stories for each
- [x] 42. [HIGH] Create sections in `src/routes/chyby/sections/`: `ErrorsKpiSection`, `ErrorsTimelineSection`, `ErrorsComparisonSection`, `ErrorsEndpointsSection`, `ErrorsLogSection`

### Database (databaze)

- [x] 43. [HIGH] Create page-specific components in `src/routes/databaze/components/`: `SlowQueryItem`, `TableSizeRow`, `ConnectionPoolIndicator` + stories for each
- [x] 44. [HIGH] Create sections in `src/routes/databaze/sections/`: `DatabaseKpiSection`, `DatabaseSecondaryKpiSection`, `DatabaseChartsSection`, `DatabaseQueriesSection`, `DatabaseTablesSection`, `DatabaseErrorLogSection`

### Runtime

- [x] 45. [HIGH] Create page-specific components in `src/routes/runtime/components/`: `InstanceCard`, `DeployItem` + stories for each
- [x] 46. [HIGH] Create sections in `src/routes/runtime/sections/`: `RuntimeKpiSection`, `RuntimeChartsSection`, `RuntimeInstancesSection`, `RuntimeDeploySection`, `RuntimeErrorLogSection`, `RuntimeHttpSection`

### Edge

- [x] 47. [HIGH] Create page-specific components in `src/routes/edge/components/`: `CacheRuleItem`, `TtfbRegionBar` + stories for each
- [x] 48. [HIGH] Create sections in `src/routes/edge/sections/`: `EdgeKpiSection`, `EdgeChartsSection`, `EdgeThreatSection`, `EdgeCacheRulesSection`, `EdgeSecurityLogSection`

### Performance

- [x] 49. [HIGH] Create page-specific components in `src/routes/performance/components/`: `WebVitalCard`, `SlowEndpointRow` + stories for each
- [x] 50. [HIGH] Create sections in `src/routes/performance/sections/`: `PerformanceKpiSection`, `PerformanceChartsSection`, `PerformanceEndpointsSection`, `PerformanceWebVitalsSection`, `PerformanceEventLogSection`

### Security

- [x] 51. [HIGH] Create page-specific components in `src/routes/security/components/`: `ThreatItem`, `BlockedIpRow` + stories for each
- [x] 52. [HIGH] Create sections in `src/routes/security/sections/`: `SecurityKpiSection`, `SecurityChartsSection`, `SecurityThreatsSection`, `SecurityBlockedIpsSection`, `SecurityEventLogSection`

### Business

- [x] 53. [HIGH] Create page-specific components in `src/routes/business/components/`: `FunnelStep`, `CohortCell`, `GoalProgressBar`, `TopCustomerRow` + stories for each
- [x] 54. [HIGH] Create sections in `src/routes/business/sections/`: `BusinessKpiSection`, `BusinessRevenueChartsSection`, `BusinessFunnelSection`, `BusinessCohortSection`, `BusinessGoalsSection`, `BusinessTopCustomersSection`

### Users (uzivatele)

- [x] 55. [HIGH] Create page-specific components in `src/routes/uzivatele/components/`: `UserRow`, `UserCard`, `PaginationControls` + stories for each
- [x] 56. [HIGH] Create sections in `src/routes/uzivatele/sections/`: `UsersKpiSection`, `UsersChartsSection`, `UsersTableSection`

## Phase 4 — Refactor Pages

- [x] 57. [MEDIUM] Refactor Dashboard `src/routes/+page.svelte` to compose PageHeader + DashboardKpiSection + DashboardChartsRow1Section + DashboardChartsRow2Section + DashboardAlertsSection + MobileBottomNav
- [x] 58. [MEDIUM] Refactor Availability `src/routes/dostupnost/+page.svelte` to compose PageHeader + sections + MobileBottomNav
- [x] 59. [MEDIUM] Refactor Errors `src/routes/chyby/+page.svelte` to compose PageHeader + sections + MobileBottomNav
- [x] 60. [MEDIUM] Refactor Database `src/routes/databaze/+page.svelte` to compose PageHeader + sections + MobileBottomNav
- [x] 61. [MEDIUM] Refactor Runtime `src/routes/runtime/+page.svelte` to compose PageHeader + sections + MobileBottomNav
- [x] 62. [MEDIUM] Refactor Edge `src/routes/edge/+page.svelte` to compose PageHeader + sections + MobileBottomNav
- [x] 63. [MEDIUM] Refactor Performance `src/routes/performance/+page.svelte` to compose PageHeader + sections + MobileBottomNav
- [x] 64. [MEDIUM] Refactor Security `src/routes/security/+page.svelte` to compose PageHeader + sections + MobileBottomNav
- [x] 65. [MEDIUM] Refactor Business `src/routes/business/+page.svelte` to compose PageHeader + sections + MobileBottomNav
- [x] 66. [MEDIUM] Refactor Users `src/routes/uzivatele/+page.svelte` to compose PageHeader + sections + MobileBottomNav

## Final

- [x] 67. Verify all pages render correctly — no visual regressions, build passes (`bun run build`), Storybook builds (`bun run build-storybook`), no duplicated code
