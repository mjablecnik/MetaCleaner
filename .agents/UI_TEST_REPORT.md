# Test Report
Created: 2026-07-01T23:23:00+00:00
Updated: 2026-07-01T23:23:00+00:00

Project: **frontend/metacleaner-monitoring** (SvelteKit 2 / Svelte 5, `@sveltejs/adapter-node` SSR,
Vite, Tailwind, Paraglide i18n). E2E via **Playwright** (`**/*.e2e.ts`, `npm run build && npm run preview`
on :4173, headless). Component catalog via **Storybook 10** + `@storybook/addon-svelte-csf`
(`*.stories.svelte`). Run commands: `npx playwright test` / `npm run build-storybook`.

> Note: the previous UI_TEST_REPORT.md described a different package (`metacleaner-web`). This run
> regenerates it for `metacleaner-monitoring`, hence Created is reset to this run's timestamp.

## Summary
- Total E2E tests: 62
- Passing E2E tests: 50 (60 when run serially — see Notes)
- Failing E2E tests: 12 (only **2** are genuine; 10 are rate-limit artifacts of parallel workers)
- Total component stories: 146 (across 41 `*.stories.svelte` files)
- Passing component stories: 146 (all compile — `build-storybook` exits 0)
- Failing component stories: 0

## E2E Test Coverage
| Page/Route | Test File | Status |
|---|---|---|
| `/login` | `src/routes/login/login.e2e.ts` | ✅ Pass (3/3) |
| Auth guard (unauth → `/login`) | `src/routes/auth-guard.e2e.ts` | ✅ Pass (3/3) |
| `/` (Dashboard / "System Overview") | `src/routes/dashboard.e2e.ts` | ⚠️ 4/5 (1 genuine fail — see Notes) |
| `/dostupnost` (Availability) | `src/routes/dostupnost/dostupnost.e2e.ts` | ⚠️ 3/4 (1 genuine fail — h1 text) |
| `/chyby` (Errors & Crashes) | `src/routes/chyby/chyby.e2e.ts` | ✅ Pass (4/4) |
| `/databaze` (Database) | `src/routes/databaze/databaze.e2e.ts` | ✅ Pass (4/4) |
| `/runtime` (Runtime / Fly.io) | `src/routes/runtime/runtime.e2e.ts` | ✅ Pass serially (4/4); rate-limited in parallel |
| `/edge` (Edge / Cloudflare) | `src/routes/edge/edge.e2e.ts` | ✅ Pass (4/4) |
| `/performance` (Performance) | `src/routes/performance/performance.e2e.ts` | ✅ Pass serially (4/4); rate-limited in parallel |
| `/business` (Business Metrics) | `src/routes/business/business.e2e.ts` | ✅ Pass (4/4) |
| `/uzivatele` (Users) | `src/routes/uzivatele/uzivatele.e2e.ts` | ✅ Pass serially (4/4); rate-limited in parallel |
| Cross-page sidebar navigation | `src/routes/navigation.e2e.ts` | ✅ Pass (2/2) |
| Responsive app shell (375 / 1280) | `src/routes/responsive.e2e.ts` | ⚠️ 4/8 in parallel (all pass serially — rate limit) |
| `/demo/playwright` (scaffolding) | `src/routes/demo/playwright/page.svelte.e2e.ts` | ✅ Pass (1/1) |

Route coverage: **every** real page (`/`, `/login`, `/dostupnost`, `/chyby`, `/databaze`, `/runtime`,
`/edge`, `/performance`, `/business`, `/uzivatele`) has a dedicated E2E suite, plus cross-cutting
auth-guard, navigation, and responsive suites.

## Component Test Coverage
Storybook `build-storybook` compiles all 41 story files (146 `<Story>` variants) with exit 0.
No Storybook–Vitest test project is wired in `vite.config.ts`, so `play` blocks (4 stories have them)
are **not** executed as pass/fail assertions in CI — the build is the verification. States listed are
the `<Story>` variant names per file.

| Component | Story File | States Covered | Status |
|---|---|---|---|
| SectionErrorCard | `src/lib/shared/components/SectionErrorCard.stories.svelte` | 7 (timeout, unauthorized, service_unavailable, request_error, ±message, retry) | ✅ Builds |
| NotConfiguredCard | `src/lib/shared/components/NotConfiguredCard.stories.svelte` | 3 (with missingVars, empty, …) | ✅ Builds |
| LanguageSwitcher | `src/lib/components/LanguageSwitcher.stories.svelte` | 2 (EN active, CS active) | ✅ Builds |
| EventLogTable | `src/lib/shared/components/EventLogTable.stories.svelte` | 3 | ✅ Builds |
| KpiGrid | `src/lib/shared/components/KpiGrid.stories.svelte` | 3 | ✅ Builds |
| MobileBottomNav | `src/lib/shared/components/MobileBottomNav.stories.svelte` | 3 | ✅ Builds |
| PageHeader | `src/lib/shared/components/PageHeader.stories.svelte` | 4 | ✅ Builds |
| PlotlyChart | `src/lib/shared/components/PlotlyChart.stories.svelte` | 3 | ✅ Builds |
| TabSwitcher | `src/lib/shared/components/TabSwitcher.stories.svelte` | 3 | ✅ Builds |
| AccordionSection | `src/lib/shared/elements/AccordionSection.stories.svelte` | 3 | ✅ Builds |
| ChartCard | `src/lib/shared/elements/ChartCard.stories.svelte` | 4 | ✅ Builds |
| DataTable | `src/lib/shared/elements/DataTable.stories.svelte` | 3 | ✅ Builds |
| FilterPill | `src/lib/shared/elements/FilterPill.stories.svelte` | 4 | ✅ Builds |
| MethodBadge | `src/lib/shared/elements/MethodBadge.stories.svelte` | 4 | ✅ Builds |
| ProgressBar | `src/lib/shared/elements/ProgressBar.stories.svelte` | 6 | ✅ Builds |
| StatCard | `src/lib/shared/elements/StatCard.stories.svelte` | 5 | ✅ Builds |
| StatusBadge | `src/lib/shared/elements/StatusBadge.stories.svelte` | 10 | ✅ Builds |
| CohortCell | `src/routes/business/components/CohortCell.stories.svelte` | 4 | ✅ Builds |
| FunnelStep | `src/routes/business/components/FunnelStep.stories.svelte` | 3 | ✅ Builds |
| TopCustomerRow | `src/routes/business/components/TopCustomerRow.stories.svelte` | 3 | ✅ Builds |
| ErrorEndpointRow | `src/routes/chyby/components/ErrorEndpointRow.stories.svelte` | 3 | ✅ Builds |
| ErrorLogRow | `src/routes/chyby/components/ErrorLogRow.stories.svelte` | 3 | ✅ Builds |
| AlertItem | `src/routes/components/AlertItem.stories.svelte` | 3 | ✅ Builds |
| ConnectionPoolIndicator | `src/routes/databaze/components/ConnectionPoolIndicator.stories.svelte` | 3 | ✅ Builds |
| SlowQueryItem | `src/routes/databaze/components/SlowQueryItem.stories.svelte` | 4 | ✅ Builds |
| TableSizeRow | `src/routes/databaze/components/TableSizeRow.stories.svelte` | 3 | ✅ Builds |
| HealthCheckRow | `src/routes/dostupnost/components/HealthCheckRow.stories.svelte` | 3 | ✅ Builds |
| IncidentItem | `src/routes/dostupnost/components/IncidentItem.stories.svelte` | 3 | ✅ Builds |
| ServiceUptimeCard | `src/routes/dostupnost/components/ServiceUptimeCard.stories.svelte` | 3 (has `play`) | ✅ Builds |
| SlaGoalBar | `src/routes/dostupnost/components/SlaGoalBar.stories.svelte` | 3 | ✅ Builds |
| UptimeTimeline | `src/routes/dostupnost/components/UptimeTimeline.stories.svelte` | 2 (has `play`) | ✅ Builds |
| CacheRuleItem | `src/routes/edge/components/CacheRuleItem.stories.svelte` | 3 | ✅ Builds |
| SlowEndpointRow | `src/routes/performance/components/SlowEndpointRow.stories.svelte` | 3 | ✅ Builds |
| DeployItem | `src/routes/runtime/components/DeployItem.stories.svelte` | 3 | ✅ Builds |
| InstanceCard | `src/routes/runtime/components/InstanceCard.stories.svelte` | 3 (has `play`) | ✅ Builds |
| PaginationControls | `src/routes/uzivatele/components/PaginationControls.stories.svelte` | 5 | ✅ Builds |
| UserCard | `src/routes/uzivatele/components/UserCard.stories.svelte` | 4 | ✅ Builds |
| UserRow | `src/routes/uzivatele/components/UserRow.stories.svelte` | 4 | ✅ Builds |
| Button (scaffolding) | `src/stories/Button.stories.svelte` | 4 | ✅ Builds |
| Header (scaffolding) | `src/stories/Header.stories.svelte` | 2 | ✅ Builds |
| Page (scaffolding) | `src/stories/Page.stories.svelte` | 2 (has `play`) | ✅ Builds |

## Uncovered (no tests)
- **`/demo` (parent scaffolding page)** — no dedicated E2E suite (only `/demo/playwright` has one).
  Throwaway SvelteKit/Storybook scaffolding; acceptable gap.
- **`/nastaveni` (Settings)** — the sidebar renders a `Settings` link to `/nastaveni`, but **no such
  route exists** (dangling link). Flagged in `navigation.e2e.ts`; no landing assertion possible.
- **~43 `*/sections/*.svelte` composition components** — no stories. By project convention the atomic
  row/card components are storied, not the section compositions (which receive already-resolved data).
  Tracked as an optional future enhancement, not a required gap.
- **Storybook interaction (`play`) assertions are not run in CI** — 4 stories (ServiceUptimeCard,
  UptimeTimeline, InstanceCard, Page) define `play` blocks that only execute inside the Storybook UI,
  because `vite.config.ts` defines no `@storybook/addon-vitest` test project.

## Notes
- **Rate-limit false failures (10 of 12).** `src/hooks.server.ts` enforces 60 requests / 60s **per IP**
  (`RL_MAX=60`, `RL_WINDOW_MS=60_000`). Under Playwright's default parallel workers, every request
  originates from the same localhost IP, so bursts exceed 60/min and the server returns
  `429 "Too Many Requests"`. Affected in the parallel run: all of `runtime.e2e.ts` (3) and
  `uzivatele.e2e.ts` (2, heading/nav), `performance` NotConfigured, and the 4 mobile `responsive`
  tests. **Re-running these files serially (`--workers=1`) → 12/12 green.** These are environmental,
  not app regressions and not test-authoring bugs. *Recommendation:* set `workers: 1` (or raise/skip
  the limiter for E2E via an env-gated `RL_MAX`) in `playwright.config.ts` to make the suite
  deterministic in parallel.
- **Genuine test-authoring failures (2).** Both persist when run serially:
  1. `dostupnost.e2e.ts:15` — asserts `h1` `toHaveText('Availability')`, but the page's `PageHeader`
     h1 is **"Service Availability"** (the sidebar *link* is "Availability"). Fix: assert
     `toHaveText('Service Availability')` or `toContainText('Availability')`.
  2. `dashboard.e2e.ts:44` — assumes `/` renders a `Retry` button or `Service Not Connected` text when
     data sources are unreachable/unconfigured. The root **"System Overview (MVP)"** page instead
     degrades gracefully to `N/A` / `0` / `No data` placeholders (it does **not** use
     SectionErrorCard/NotConfiguredCard). Fix: assert the placeholder text (e.g. `No data` / `N/A`)
     rather than error/not-configured cards.
- **Deterministic offline setup works as designed.** `playwright.config.ts` sets
  `SUPABASE_URL=http://127.0.0.1:9` (unreachable → SectionErrorCard) and leaves Fly/Cloudflare/Sentry/
  Stripe unset (→ NotConfiguredCard "Service Not Connected"); `DASHBOARD_SESSION_SECRET=e2e-test-secret`
  enables login + the `mc_session` cookie used by the authenticated page suites. No external network
  is required.
- **No `data-testid`s** anywhere (0 occurrences) — E2E selects by role / heading / i18n text
  (base locale `en`). Adding testids to PageHeader / NotConfiguredCard / SectionErrorCard would harden
  the suites.
- **Unit tests (out of scope for this report):** `vitest run` has 1 unrelated server-unit failure
  (`supabaseClient.test.ts > getUsers null-coalesces total to 0`) — not a UI/story/E2E test; recorded
  for visibility only.
