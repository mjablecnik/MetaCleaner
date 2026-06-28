# Implementation Plan: Monitoring Real API Integration

## Overview

Replace all hardcoded repository data in the MetaCleaner monitoring dashboard with live data fetched from external service APIs (Fly.io, Cloudflare, Stripe, Supabase, Sentry). This involves creating a three-layer architecture: API clients → mappers → load functions, with graceful error handling and per-section isolation.

## Tasks

- [x] 1. Set up shared types, config module, and project infrastructure
  - [x] 1.1 Create the shared client types module (`src/lib/server/clients/types.ts`)
    - Define `ClientConfig` interface, `ClientError` class, and `SectionResult<T>` discriminated union type
    - Implement the `fetchWithTimeout` helper using `AbortController`
    - Implement the `callSection<T>` helper that wraps async calls and catches `ClientError`
    - Export `categorizeStatus` function mapping HTTP status codes to error categories
    - _Requirements: 2.5, 2.6, 5.1, 5.2_

  - [x] 1.2 Create the configuration module (`src/lib/server/config.ts`)
    - Import from `$env/dynamic/private`
    - Define `ServiceConfigs` type with discriminated union per service (`configured: true` with config or `configured: false` with `missingVars`)
    - Implement `getServiceConfigs()` that checks presence and non-emptiness of all env vars
    - Validate required vars (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`) with startup-time assertion
    - Validate optional service vars (`FLY_API_TOKEN`, `CLOUDFLARE_API_TOKEN`, `SENTRY_AUTH_TOKEN`, `STRIPE_SECRET_KEY`) returning `configured: false` if missing
    - _Requirements: 1.1, 1.2, 1.5, 1.6, 4.1, 4.5_

  - [x]* 1.3 Write property test for configuration detection (Property 1)
    - **Property 1: Configuration Detection**
    - For any subset of environment variables where one or more required variables are missing or empty, `getServiceConfigs()` returns `{ configured: false, missingVars: [...] }` with exactly the missing variable names
    - **Validates: Requirements 1.6, 4.1, 4.2, 4.3**

  - [x] 1.4 Create page data types (`src/lib/types/pageData.ts`)
    - Define typed interfaces for each route's load function return value using `SectionResult<T>` wrapping existing repository types
    - Include: `DashboardPageData`, `RuntimePageData`, `AvailabilityPageData`, `ErrorsPageData`, `DatabasePageData`, `EdgePageData`, `PerformancePageData`, `BusinessPageData`, `UsersPageData`
    - _Requirements: 3.2, 3.4, 11.1_

  - [x] 1.5 Update `.env.example` with all service variables
    - Ensure all env vars from the design are listed with descriptive placeholders
    - _Requirements: 1.4_

- [x] 2. Implement API client modules
  - [x] 2.1 Create the Fly.io client (`src/lib/server/clients/flyClient.ts`)
    - Define `FlyClientConfig` extending `ClientConfig` with `org`, `apps` fields
    - Define raw response types (`FlyMachineRaw`, etc.)
    - Implement `getMachines(config, app)` — fetch machine list for a single app
    - Implement `getMachinesForAllApps(config)` — fetch across all configured apps
    - Use Bearer token auth, 10s timeout via `fetchWithTimeout`
    - Throw `ClientError` on non-2xx responses with correct category
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 6.1, 6.4_

  - [x] 2.2 Create the Cloudflare client (`src/lib/server/clients/cloudflareClient.ts`)
    - Define `CloudflareClientConfig` extending `ClientConfig` with `zoneId`
    - Define raw response types (`CfAnalyticsRaw`, `CfGeoRaw`, `CfFirewallEventRaw`)
    - Implement `getAnalytics(config)` — GraphQL query for 24h zone analytics
    - Implement `getGeoDistribution(config)` — geographic traffic data
    - Implement `getFirewallEvents(config, limit)` — recent WAF events
    - Use Bearer token auth, 10s timeout
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 7.1, 7.5_

  - [x] 2.3 Create the Stripe client (`src/lib/server/clients/stripeClient.ts`)
    - Define `StripeClientConfig` extending `ClientConfig`
    - Define raw response types (`StripeSubscriptionRaw`, `StripePriceRaw`)
    - Implement `getActiveSubscriptions(config)` — list active subs
    - Implement `getCanceledSubscriptions(config, since)` — recently canceled subs
    - Implement `getPrices(config)` — list product prices
    - Use Stripe standard auth (Basic with secret key), 10s timeout
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 8.4_

  - [x] 2.4 Create the Supabase client (`src/lib/server/clients/supabaseClient.ts`)
    - Define `SupabaseClientConfig` with `url`, `serviceKey`, `timeout`
    - Define raw response types (`SupabaseTableStatsRaw`, `SupabaseUserRaw`)
    - Implement `getTableStats(config)` — table size and row count data
    - Implement `getUsers(config, page, perPage)` — paginated user list from Auth admin
    - Implement `queryTable<T>(config, table, params)` — generic PostgREST query helper
    - Use service key Bearer auth, 10s timeout
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 9.1, 9.3_

  - [x] 2.5 Create the Sentry client (`src/lib/server/clients/sentryClient.ts`)
    - Define `SentryClientConfig` extending `ClientConfig` with `org`, `project`
    - Define raw response types (`SentryIssueRaw`)
    - Implement `getRecentIssues(config, limit)` — fetch recent issues
    - Implement `getIssueStats(config)` — error count aggregations
    - Use Bearer token auth, 10s timeout
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 10.4_

  - [x]* 2.6 Write property test for client configuration validation (Property 2)
    - **Property 2: Client Configuration Validation**
    - For any client config with missing/empty/whitespace-only required fields, the client throws `ClientError` before making HTTP requests
    - **Validates: Requirements 2.3**

  - [x]* 2.7 Write property test for HTTP error categorization (Property 3)
    - **Property 3: HTTP Error Categorization**
    - For any non-2xx HTTP response, verify: 401/403 → `unauthorized`, 5xx → `service_unavailable`, AbortError → `timeout`, other → `request_error`
    - **Validates: Requirements 2.6, 5.2**

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement mapper modules
  - [x] 4.1 Create the Fly.io mapper (`src/lib/server/mappers/flyMapper.ts`)
    - Implement `mapToMachineInstances(raw)` → `MachineInstance[]`
    - Implement `mapToDeployEntries(raw)` → `DeployEntry[]`
    - Implement `mapToServiceCards(raw)` → `ServiceCard[]`
    - Implement `mapToRuntimeStats(raw)` → `RuntimeStat[]`
    - Map machine state to status: "started" → "running", "stopped" → "stopped", else → "error"
    - Derive uptime from last start event, compute `displayId` as first 8 chars of machine ID
    - Ensure all required fields in repository interfaces are populated (no undefined)
    - _Requirements: 3.2, 6.2, 6.3, 6.5, 11.1, 11.4, 11.5_

  - [x] 4.2 Create the Cloudflare mapper (`src/lib/server/mappers/cloudflareMapper.ts`)
    - Implement `mapToEdgeKpiStats(raw)` → `EdgeKpiStat[]`
    - Implement `mapToGeoDistribution(raw)` → `GeoDistribution[]` (top 5 + "Other")
    - Implement `mapToWafLog(raw)` → `WafLogEntry[]`
    - Implement `mapToHttpStatusDistribution(raw)` → `HttpStatusDistribution[]`
    - Compute cache hit rate, saved bandwidth (bytes → GB), format request counts with separators
    - _Requirements: 3.2, 7.2, 7.3, 7.4, 11.1, 11.4_

  - [x] 4.3 Create the Stripe mapper (`src/lib/server/mappers/stripeMapper.ts`)
    - Implement `mapToBusinessKpiStats(subs, canceled)` → `BusinessKpiStat[]`
    - Implement `mapToPlanRevenue(subs, prices)` → `PlanRevenue[]`
    - Implement `computeMrr(subs)` — normalize billing intervals to monthly
    - Implement `computeChurnRate(active, canceled)` — percentage calculation
    - Implement `computeArpu(mrr, activeCount)` — MRR / active subscribers
    - _Requirements: 3.2, 8.1, 8.2, 8.3, 11.1, 11.4_

  - [x] 4.4 Create the Supabase mapper (`src/lib/server/mappers/supabaseMapper.ts`)
    - Implement `mapToTableSizes(raw)` → `TableSize[]`
    - Implement `mapToDbKpis(raw)` → `DbKpi[]`
    - Implement `mapToUserStats(users)` → `UserStat[]`
    - Implement `mapToUsers(raw)` → `User[]`
    - Format bytes to human-readable sizes, compute bar widths relative to largest table
    - _Requirements: 3.2, 9.1, 9.2, 11.1, 11.4_

  - [x] 4.5 Create the Sentry mapper (`src/lib/server/mappers/sentryMapper.ts`)
    - Implement `mapToErrorLog(issues)` → `ErrorLogEntry[]`
    - Implement `mapToErrorKpis(issues, stats)` → `ErrorKpi[]`
    - Map `lastSeen` to `HH:mm:ss` time format, `metadata.type` to short codes (EXC, TMT, ERR)
    - Map `status`: "unresolved" → active, "resolved" → resolved
    - _Requirements: 3.2, 10.1, 10.2, 10.3, 11.1, 11.4_

  - [x]* 4.6 Write property test for mapper completeness (Property 5)
    - **Property 5: Mapper Completeness**
    - For any valid raw API response, the mapper returns objects where every required field in the target repository interface is present and non-undefined
    - **Validates: Requirements 3.2, 11.1, 11.4**

  - [x]* 4.7 Write property test for MRR normalization (Property 6)
    - **Property 6: MRR Normalization**
    - For any set of subscriptions with varying intervals (monthly, yearly, weekly), MRR equals sum of normalized monthly amounts; ARPU equals MRR / active count; plan revenue percentages sum to 100% (±1%)
    - **Validates: Requirements 8.1, 8.2, 8.3**

  - [x]* 4.8 Write property test for geographic distribution aggregation (Property 7)
    - **Property 7: Geographic Distribution Aggregation**
    - For any array of country traffic records (N ≥ 1), result has at most 6 entries (top 5 + "Other"), percentages sum to 100% (±1%), sorted by traffic desc. If N ≤ 5, no "Other" entry.
    - **Validates: Requirements 7.3**

  - [ ]* 4.9 Write property test for health status mapping (Property 10)
    - **Property 10: Health Status Mapping**
    - Machine state "started" + all checks passing → `online`; "started" + any check failing → `degraded`; "stopped"/"destroyed"/unreachable → `offline`
    - **Validates: Requirements 6.5**

  - [ ]* 4.10 Write property test for endpoint sorting and limiting (Property 11)
    - **Property 11: Endpoint Sorting and Limiting**
    - For any array of endpoint records, result has at most 10 entries sorted by avg response time descending
    - **Validates: Requirements 14.1**

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement load functions for all routes
  - [ ] 6.1 Create dashboard load function (`src/routes/+page.server.ts`)
    - Call `getServiceConfigs()` and check each service
    - Fetch uptime from Fly, error rate from Sentry, job count from Supabase concurrently via `Promise.allSettled`
    - Map to `DashboardStat[]` and `DashboardAlert[]`
    - Merge recent Sentry issues + Fly events for alerts, sort by timestamp desc, limit to 10
    - Set `Cache-Control: no-store` header
    - Return `SectionResult` per section, isolating failures
    - _Requirements: 3.1, 3.3, 3.4, 5.1, 5.3, 12.1, 12.4, 13.1, 13.2, 13.3, 13.4, 13.5_

  - [ ] 6.2 Create runtime load function (`src/routes/runtime/+page.server.ts`)
    - Check Fly config, return `not-configured` if missing
    - Fetch machines for all apps + deploy history
    - Map via `flyMapper` to `MachineInstance[]`, `DeployEntry[]`, `RuntimeStat[]`, `RuntimeErrorEntry[]`
    - Return typed `RuntimePageData` with `SectionResult` per section
    - Set `Cache-Control: no-store`
    - _Requirements: 3.1, 3.3, 3.4, 4.1, 5.1, 6.1, 6.2, 6.3, 6.6, 12.1, 12.4_

  - [ ] 6.3 Create availability load function (`src/routes/dostupnost/+page.server.ts`)
    - Check Fly config
    - Fetch health status for each app in `FLY_APPS`
    - Map to `ServiceCard[]`, `HealthCheck[]`, `Incident[]`, `SlaGoal[]`
    - _Requirements: 3.1, 3.3, 6.5, 12.1, 12.4_

  - [ ] 6.4 Create errors load function (`src/routes/chyby/+page.server.ts`)
    - Check Sentry config
    - Fetch recent issues (25 most recent with activity in last 24h) and error aggregations
    - Map to `ErrorLogEntry[]`, `ErrorKpi[]`, `TopEndpoint[]`
    - _Requirements: 3.1, 3.3, 10.1, 10.2, 10.3, 10.5, 12.1, 12.4_

  - [ ] 6.5 Create database load function (`src/routes/databaze/+page.server.ts`)
    - Check Supabase config (always configured since required)
    - Fetch table stats from Supabase
    - Map to `TableSize[]`, `DbKpi[]`
    - _Requirements: 3.1, 3.3, 9.1, 12.1, 12.4_

  - [ ] 6.6 Create edge load function (`src/routes/edge/+page.server.ts`)
    - Check Cloudflare config
    - Fetch analytics, geo distribution, firewall events
    - Map to `EdgeKpiStat[]`, `GeoDistribution[]`, `WafLogEntry[]`, `HttpStatusDistribution[]`
    - _Requirements: 3.1, 3.3, 7.1, 7.2, 7.3, 7.4, 7.6, 7.7, 12.1, 12.4_

  - [ ] 6.7 Create performance load function (`src/routes/performance/+page.server.ts`)
    - Check Fly and/or Cloudflare config
    - Fetch endpoint metrics, compute Apdex, avg response time, throughput, error rate
    - Map to `PerformanceKpiStat[]`, `SlowEndpoint[]`, `PerformanceEvent[]`
    - Sort slow endpoints by avg response time desc, limit to 10
    - _Requirements: 3.1, 3.3, 14.1, 14.2, 14.3, 14.4, 12.1, 12.4_

  - [ ] 6.8 Create business load function (`src/routes/business/+page.server.ts`)
    - Check Stripe config
    - Fetch active subs, canceled subs, prices
    - Map to `BusinessKpiStat[]`, `PlanRevenue[]`, `ConversionFunnelStep[]`
    - _Requirements: 3.1, 3.3, 8.1, 8.2, 8.3, 8.5, 12.1, 12.4_

  - [ ] 6.9 Create users load function (`src/routes/uzivatele/+page.server.ts`)
    - Check Supabase config
    - Fetch user list + statistics from Supabase Auth admin
    - Map to `UserStat[]`, `User[]`
    - _Requirements: 3.1, 3.3, 9.2, 12.1, 12.4_

  - [ ]* 6.10 Write property test for section error isolation (Property 4)
    - **Property 4: Section Error Isolation**
    - For any load function with N sections, if K sections throw `ClientError`, exactly K sections return error and N-K return ok
    - **Validates: Requirements 5.1, 5.3**

  - [ ]* 6.11 Write property test for dashboard alert merge and sort (Property 8)
    - **Property 8: Dashboard Alert Merge and Sort**
    - Merged alerts sorted by timestamp desc, at most 10 entries, severity correctly derived from source
    - **Validates: Requirements 13.3**

  - [ ]* 6.12 Write property test for Apdex and performance metrics (Property 9)
    - **Property 9: Apdex and Performance Metrics**
    - Apdex = (satisfied + tolerating * 0.5) / total with 500ms/2000ms thresholds; error rate = (5xx count / total) * 100
    - **Validates: Requirements 14.2**

- [ ] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Create error state UI components and wire pages to load data
  - [ ] 8.1 Create `NotConfiguredCard.svelte` component (`src/lib/shared/components/NotConfiguredCard.svelte`)
    - Accept `missingVars: string[]` prop
    - Display a card with "not connected" indicator and list of missing env var names
    - Match existing design system (dark navy theme, text-muted colors)
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ] 8.2 Create `SectionErrorCard.svelte` component (`src/lib/shared/components/SectionErrorCard.svelte`)
    - Accept `category: string` and `message: string` props, plus `onretry` callback
    - Display error category with appropriate icon/color: timeout (clock icon), unauthorized (lock icon, distinct style), service_unavailable (cloud-off icon), request_error (alert icon)
    - Include a retry button that calls the `onretry` handler
    - _Requirements: 5.2, 5.4, 5.5_

  - [ ] 8.3 Update page components to consume `data` prop from load functions
    - In each route's `+page.svelte`, accept `data` from the load function via `$props()`
    - For each section, check `section.status` and render `NotConfiguredCard`, `SectionErrorCard`, or actual content
    - Retain all existing section components unchanged — only change the data source from direct repository calls to `data` prop fields
    - Wire retry button to call `invalidate()` from `$app/navigation`
    - _Requirements: 3.4, 4.1, 4.2, 5.2, 5.3, 5.5, 11.2, 11.3_

- [ ] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The existing repository interfaces in `src/lib/repositories/` MUST NOT be modified
- The existing Svelte UI components are not changed — only the data source changes
- All API clients live in `src/lib/server/` to ensure secrets stay server-side
- `fast-check` is used for property-based tests with Vitest

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.4", "1.5"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3", "2.1", "2.2", "2.3", "2.4", "2.5"] },
    { "id": 3, "tasks": ["2.6", "2.7", "4.1", "4.2", "4.3", "4.4", "4.5"] },
    { "id": 4, "tasks": ["4.6", "4.7", "4.8", "4.9", "4.10"] },
    { "id": 5, "tasks": ["6.1", "6.2", "6.3", "6.4", "6.5", "6.6", "6.7", "6.8", "6.9"] },
    { "id": 6, "tasks": ["6.10", "6.11", "6.12", "8.1", "8.2"] },
    { "id": 7, "tasks": ["8.3"] }
  ]
}
```
