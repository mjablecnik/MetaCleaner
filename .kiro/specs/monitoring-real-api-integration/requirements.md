# Requirements Document

## Introduction

This feature replaces all hardcoded/mocked data in the MetaCleaner monitoring dashboard with live data fetched from external service APIs (Fly.io, Cloudflare, Stripe, Supabase, Sentry, Brevo). The dashboard transitions from a static UI prototype to a functional monitoring tool pulling real-time metrics from production infrastructure. All API communication happens server-side via SvelteKit load functions to keep secrets secure.

## Glossary

- **Dashboard**: The MetaCleaner monitoring SvelteKit application (`frontend/metacleaner-monitoring/`)
- **API_Client**: A TypeScript module in `src/lib/clients/` responsible for communicating with a single external service API
- **Load_Function**: A SvelteKit `+page.server.ts` file that fetches data server-side before rendering a page
- **Repository_Interface**: The existing TypeScript interfaces and function signatures in `src/lib/repositories/` that define the shape of data consumed by UI components
- **Environment_Config**: The `.env` file containing API tokens, organization slugs, zone IDs, and other service configuration
- **Connection_State**: A UI state indicating whether an external service is properly configured and reachable (connected, missing key, or errored)
- **Fly_Client**: The API client module for communicating with the Fly.io Machines REST API
- **Cloudflare_Client**: The API client module for communicating with the Cloudflare Analytics GraphQL and REST APIs
- **Stripe_Client**: The API client module for communicating with the Stripe REST API
- **Supabase_Client**: The API client module for communicating with the Supabase PostgREST and Management APIs
- **Sentry_Client**: The API client module for communicating with the Sentry REST API
- **Brevo_Client**: The API client module for communicating with the Brevo REST API

## Requirements

### Requirement 1: Environment Configuration

**User Story:** As a developer, I want to configure all external service credentials via a `.env` file, so that I can connect the dashboard to production services without modifying code.

#### Acceptance Criteria

1. THE Environment_Config SHALL define variables for all supported services: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `FLY_API_TOKEN`, `FLY_ORG`, `FLY_APPS`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `STRIPE_SECRET_KEY`
2. WHEN the Dashboard server starts, THE Dashboard SHALL load environment variables from the `.env` file using SvelteKit's built-in `$env/static/private` or `$env/dynamic/private` modules
3. THE Dashboard SHALL never expose the following secret variables to client-side JavaScript bundles: `SUPABASE_SERVICE_KEY`, `FLY_API_TOKEN`, `CLOUDFLARE_API_TOKEN`, `SENTRY_AUTH_TOKEN`, `STRIPE_SECRET_KEY`
4. WHEN a new environment variable is added to `.env`, THE Dashboard SHALL have a corresponding entry in `.env.example` with a descriptive placeholder value
5. IF a required environment variable (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`) is missing or empty at server startup, THEN THE Dashboard SHALL fail to start and log an error message indicating which variable is missing
6. IF an optional service variable (`FLY_API_TOKEN`, `CLOUDFLARE_API_TOKEN`, `SENTRY_AUTH_TOKEN`, `STRIPE_SECRET_KEY`) is missing or empty, THEN THE Dashboard SHALL start successfully and disable the corresponding service integration

---

### Requirement 2: API Client Layer

**User Story:** As a developer, I want a dedicated API client module for each external service, so that API communication logic is isolated from page-level data loading.

#### Acceptance Criteria

1. THE Dashboard SHALL provide an API_Client module for each external service in the `src/lib/clients/` directory: `flyClient.ts`, `cloudflareClient.ts`, `stripeClient.ts`, `supabaseClient.ts`, `sentryClient.ts`
2. THE API_Client SHALL accept configuration parameters (tokens, org slugs, zone IDs) as constructor or function arguments rather than reading environment variables directly
3. IF a required configuration parameter is missing or empty, THEN THE API_Client SHALL throw a descriptive error at construction time before making any HTTP request
4. THE API_Client SHALL return data in the shape of raw API responses or intermediate typed objects, not in the final Repository_Interface shape
5. THE API_Client SHALL use the native `fetch` API available in SvelteKit server-side context for HTTP requests with a per-request timeout of 10 seconds
6. IF an HTTP request to an external service returns a non-2xx status code or the network request fails, THEN THE API_Client SHALL throw a typed error that includes the service name, the HTTP status code (when available), and a human-readable message

---

### Requirement 3: Server-Side Data Fetching

**User Story:** As a developer, I want all API calls to happen in SvelteKit server-side load functions, so that API keys remain secure and are never sent to the browser.

#### Acceptance Criteria

1. WHEN a page is requested, THE Load_Function SHALL fetch data from the relevant API_Client modules on the server and SHALL NOT import or invoke API_Client modules in any client-side code (files without `.server` in the name)
2. THE Load_Function SHALL map raw API responses to the existing Repository_Interface shapes before passing data to the page component, such that the page component receives data matching the return type of the corresponding repository function (e.g., `DashboardStat[]`, `DashboardAlert[]`, `MachineInstance[]`)
3. THE Dashboard SHALL implement a `+page.server.ts` file for each page that requires live data: root (`/`), dostupnost, chyby, databaze, runtime, edge, performance, business, uzivatele
4. THE Load_Function SHALL pass fetched data to the page component via the SvelteKit `data` prop
5. IF a Load_Function does not receive a response from an API_Client within 10 seconds, THEN THE Load_Function SHALL abort that request and return an error state for the affected section rather than blocking page rendering indefinitely

---

### Requirement 4: Missing Configuration Handling

**User Story:** As a developer, I want the dashboard to clearly indicate when a service is not configured, so that I know which API keys are missing without seeing misleading mock data.

#### Acceptance Criteria

1. WHEN an API token or required configuration variable for a service is missing, empty, or contains only whitespace, THE Dashboard SHALL display a "not connected" state for the affected dashboard section instead of any data content
2. WHEN a service is not configured, THE Dashboard SHALL NOT display hardcoded mock data for that service and SHALL instead show only the "not connected" indicator within that section
3. THE "not connected" state SHALL list all missing environment variable names for the affected service so the developer knows exactly what to configure
4. WHEN all environment variables required by a service are present and non-empty, THE Dashboard SHALL display live data for that service without any "not connected" indicators
5. THE Dashboard SHALL evaluate configuration completeness on page load by checking environment variables before requesting data from any external service

---

### Requirement 5: Graceful Error Handling

**User Story:** As a developer, I want the dashboard to handle API failures gracefully, so that a single service outage does not crash the entire page.

#### Acceptance Criteria

1. IF an API_Client call does not receive a response within 10 seconds or receives a non-2xx HTTP response, THEN THE Load_Function SHALL catch the error and return an error state for the affected section only, without retrying the request automatically
2. IF an API call fails, THEN THE Dashboard SHALL display an inline error message in the affected section indicating the failure category: "timeout" for requests exceeding the 10-second threshold, "unauthorized" for HTTP 401 or 403 responses, "service unavailable" for HTTP 5xx responses or network errors, or "request error" for all other non-2xx responses
3. IF one service API fails, THEN THE Dashboard SHALL continue to display data from other services that responded successfully, rendering their content normally without re-fetching
4. IF an API call fails due to an HTTP 401 response (invalid or expired token), THEN THE Dashboard SHALL display an "authentication failed" error state using a visually distinct style (different icon and color scheme from connection/timeout errors)
5. WHEN the user activates a retry control displayed within a section that is in an error state, THE Dashboard SHALL re-invoke the Load_Function for that section and replace the error message with a skeleton loading placeholder until the new response arrives

---

### Requirement 6: Fly.io Integration

**User Story:** As a developer, I want the dashboard to display live Fly.io machine metrics, so that I can monitor CPU, RAM, uptime, and deploy history for all MetaCleaner services.

#### Acceptance Criteria

1. WHEN the Runtime page loads, THE Fly_Client SHALL fetch machine status for all apps listed in `FLY_APPS` from the Fly.io Machines API with a request timeout of 10 seconds per app
2. WHEN machine data is fetched, THE Load_Function SHALL map Fly.io machine responses to the `MachineInstance` interface (id, name, app, region, status, cpuPercent, ramDisplay, uptime)
3. WHEN the Runtime page loads, THE Fly_Client SHALL fetch the 10 most recent deployments from the Fly.io Machines API and map them to the `DeployEntry` interface
4. THE Fly_Client SHALL authenticate all Fly.io API requests using the `FLY_API_TOKEN` Bearer token
5. WHEN the Availability page loads, THE Fly_Client SHALL fetch app health status for each Fly.io-hosted app listed in `FLY_APPS` and map the response to `ServiceCard` entries where: a running machine with a passing health check is `online`, a running machine with a failing health check is `degraded`, and a stopped or unreachable machine is `offline`
6. IF the Fly.io API request fails or times out, THEN THE Fly_Client SHALL return the corresponding data set as empty and the Load_Function SHALL display the affected section with an error indicator without blocking the remainder of the page

---

### Requirement 7: Cloudflare Integration

**User Story:** As a developer, I want the dashboard to display live Cloudflare CDN analytics, so that I can monitor cache performance, bandwidth, and threat blocking.

#### Acceptance Criteria

1. WHEN the Edge page loads, THE Cloudflare_Client SHALL fetch analytics data from the Cloudflare Analytics GraphQL API for the configured zone, querying the last 24 hours of data, with a request timeout of 10 seconds
2. WHEN analytics data is fetched, THE Load_Function SHALL map Cloudflare responses to the `EdgeKpiStat` interface (cache hit rate, total requests, saved bandwidth, blocked threats)
3. WHEN the Edge page loads, THE Cloudflare_Client SHALL fetch geographic distribution data for the last 24 hours, map it to the `GeoDistribution` interface, and return the top 5 countries by traffic percentage plus an aggregated "Other" entry for remaining countries
4. WHEN the Edge page loads, THE Cloudflare_Client SHALL fetch the 20 most recent WAF/firewall events from the last 24 hours and map each to the `WafLogEntry` interface
5. THE Cloudflare_Client SHALL authenticate requests using the `CLOUDFLARE_API_TOKEN` header and target the zone specified by `CLOUDFLARE_ZONE_ID`
6. IF the Cloudflare API request fails or times out, THEN THE Cloudflare_Client SHALL return an error state and THE Edge page SHALL display an error message indicating that CDN analytics are temporarily unavailable
7. IF the `CLOUDFLARE_API_TOKEN` or `CLOUDFLARE_ZONE_ID` environment variable is missing at startup, THEN THE Cloudflare_Client SHALL log a warning and THE Edge page SHALL display a configuration error state instead of analytics data

---

### Requirement 8: Stripe Integration

**User Story:** As a developer, I want the dashboard to display live business metrics from Stripe, so that I can monitor MRR, active subscribers, plan breakdown, and churn.

#### Acceptance Criteria

1. WHEN the Business page loads, THE Stripe_Client SHALL fetch all subscriptions with status `active` from the Stripe Subscriptions API and compute MRR as the sum of each active subscription's plan amount normalized to a monthly interval
2. WHEN subscription data is fetched, THE Load_Function SHALL map Stripe responses to the `BusinessKpiStat` interface where: MRR is the total monthly recurring revenue, active users is the count of active subscriptions, churn rate is the percentage of subscriptions that transitioned to `canceled` status within the last 30 days relative to total active subscriptions at the start of that period, and ARPU is MRR divided by the active subscriber count
3. WHEN the Business page loads, THE Stripe_Client SHALL fetch plan breakdown data grouped by Stripe product/price and map it to the `PlanRevenue` interface where: `value` is the monthly revenue for that plan, and `percent` is that plan's revenue as a percentage of total MRR
4. THE Stripe_Client SHALL authenticate requests using the `STRIPE_SECRET_KEY` via the Stripe API standard authentication method
5. IF the Stripe API does not respond within 10 seconds or returns a non-2xx status, THEN THE Stripe_Client SHALL propagate an error state so the Load_Function can return a section-level error to the page

---

### Requirement 9: Supabase Integration

**User Story:** As a developer, I want the dashboard to display live database and user metrics from Supabase, so that I can monitor table sizes, connection status, and user activity.

#### Acceptance Criteria

1. WHEN the Database page loads, THE Supabase_Client SHALL fetch table statistics (row counts and sizes in bytes) from the Supabase PostgREST or Management API within 10 seconds and populate the `TableSize` and `DbKpi` interfaces with the response data
2. WHEN the Users page loads, THE Supabase_Client SHALL fetch user statistics (total registered count, registrations within the last 7 days, and auth method distribution as percentage per provider) from Supabase Auth admin endpoints within 10 seconds
3. THE Supabase_Client SHALL authenticate all requests using the `SUPABASE_SERVICE_KEY` environment variable as a Bearer token in the Authorization header against the base URL defined in `SUPABASE_URL`
4. IF the Supabase API returns a non-2xx response or the request exceeds 10 seconds, THEN THE Supabase_Client SHALL cancel the request and THE page SHALL display an error message indicating the data source is unavailable

---

### Requirement 10: Sentry Integration

**User Story:** As a developer, I want the dashboard to display live error tracking data from Sentry, so that I can monitor recent errors, error counts by type, and affected endpoints.

#### Acceptance Criteria

1. WHEN the Errors page loads, THE Sentry_Client SHALL fetch the 25 most recent issues from the Sentry Issues API for the configured project, filtered to issues with activity within the last 24 hours
2. WHEN error data is fetched, THE Load_Function SHALL map each Sentry issue to the `ErrorLogEntry` interface, deriving `time` from the issue's `lastSeen` timestamp, `type` from the issue's short error class name, `message` from the issue title, `source` from the issue's culprit field, and `status` from the issue's `status` field (unresolved, resolved, ignored)
3. WHEN the Errors page loads, THE Sentry_Client SHALL fetch error count aggregations for the last 24 hours and map them to the `ErrorKpi` interface, populating 5xx count from issues tagged with `status_code:5xx`, exceptions from issues of type `Error` or `Exception`, and timeouts from issues containing "timeout" in the title
4. THE Sentry_Client SHALL authenticate all requests using the `SENTRY_AUTH_TOKEN` as a Bearer token in the Authorization header, targeting the organization specified by `SENTRY_ORG` and the project specified by `SENTRY_PROJECT`
5. IF the Sentry API returns a non-2xx response or the request fails to complete within 10 seconds, THEN THE Sentry_Client SHALL display the Errors page with an empty state message indicating that error data is temporarily unavailable, without crashing or blocking other page content

---

### Requirement 11: Interface Preservation

**User Story:** As a developer, I want the existing TypeScript interfaces in the repository layer preserved, so that UI components continue to work without modification.

#### Acceptance Criteria

1. THE Load_Function SHALL return data where every object conforms to the field names, field types, and optional/required markers defined in the existing Repository_Interface types (DashboardStat, ServiceCard, MachineInstance, ErrorKpi, DbKpi, BusinessKpiStat, EdgeKpiStat, UserStat, and all other interfaces exported from `src/lib/repositories/`)
2. THE Dashboard SHALL NOT modify the existing TypeScript interface definitions in `src/lib/repositories/` — no fields added, removed, renamed, or retyped
3. THE Dashboard SHALL NOT modify existing Svelte UI components — only the data source changes from direct repository function calls to load function output passed via page data
4. WHEN an API response does not provide sufficient data to populate all required fields of a Repository_Interface type, THE Load_Function SHALL compute or derive the missing fields from available data so that no required field is undefined or null
5. IF the Load_Function cannot compute or derive a missing required field from available API data, THEN THE Load_Function SHALL supply a type-safe default value that satisfies the field's type constraint

---

### Requirement 12: Data Fetching on Page Load

**User Story:** As a developer, I want data to be fetched fresh on each page load, so that I always see current metrics without needing to implement polling or WebSocket connections.

#### Acceptance Criteria

1. WHEN a page is navigated to (via client-side SvelteKit navigation or full page load), THE Load_Function SHALL re-execute and make fresh API calls to the relevant API_Client modules without reusing previously fetched data from a prior navigation
2. THE Dashboard SHALL NOT implement client-side polling, WebSocket connections, automatic refresh timers, or a manual refresh button for live data in this initial implementation
3. WHEN the user manually reloads the page or navigates away and back via browser navigation or in-app links, THE Load_Function SHALL fetch fresh data from the APIs without serving cached responses
4. THE Load_Function SHALL set HTTP cache-control headers to prevent browser and CDN caching of page data responses (e.g., `Cache-Control: no-store`), ensuring that repeated requests always reach the server

---

### Requirement 13: Dashboard Overview Integration

**User Story:** As a developer, I want the main Dashboard page to aggregate key metrics from multiple services, so that I get a quick health overview without visiting individual pages.

#### Acceptance Criteria

1. WHEN the Dashboard page loads, THE Load_Function SHALL fetch uptime data from Fly_Client, error rate from Sentry_Client, and job count from Supabase_Client concurrently and return results within 10 seconds
2. WHEN aggregated data is fetched, THE Load_Function SHALL map the combined results to the `DashboardStat` interface populating all four stat entries: server uptime (percentage from Fly_Client health data), jobs processed (count from Supabase_Client jobs table for the last 24 hours), avg clean time (average duration in seconds from Supabase_Client completed jobs for the last 24 hours), and failed jobs percentage (ratio of errored jobs to total jobs from Supabase_Client for the last 24 hours)
3. WHEN the Dashboard page loads, THE Load_Function SHALL fetch recent alerts by combining the 5 most recent unresolved Sentry issues (mapped to severity "error" or "warning") and the 5 most recent Fly.io machine events with non-healthy status (mapped to severity "error" for crashes, "warning" for restarts) into the `DashboardAlert` interface, ordered by time descending and limited to a maximum of 10 alerts
4. IF Fly_Client, Sentry_Client, or Supabase_Client fails to respond, THEN THE Load_Function SHALL return the successfully fetched data from the other services and provide an error Connection_State for the failed service section only
5. IF a specific metric cannot be computed due to missing source data (e.g., no jobs in the last 24 hours), THEN THE Load_Function SHALL return a `DashboardStat` entry with a value of "0" for counts or "N/A" for computed ratios

---

### Requirement 14: Performance Page Integration

**User Story:** As a developer, I want the Performance page to display real endpoint latency and throughput data, so that I can identify slow endpoints and performance bottlenecks.

#### Acceptance Criteria

1. WHEN the Performance page loads, THE Load_Function SHALL fetch endpoint performance metrics from the configured data source (Fly.io request logs or Cloudflare analytics as determined by environment configuration) for the last 24 hours, sort them by average response time descending, return at most 10 endpoints, and map each entry to the `SlowEndpoint` interface
2. WHEN performance data is fetched, THE Load_Function SHALL compute the `PerformanceKpiStat` values from the raw metrics: Apdex (using a 500ms satisfied threshold and 2000ms tolerating threshold), average response time in milliseconds, throughput in requests per minute, and error rate as a percentage of responses with HTTP 5xx status codes
3. WHEN the Performance page loads, THE Load_Function SHALL construct `PerformanceEvent` entries from requests exceeding 5000ms response time or error rate increases above 5% within a 5-minute window, sourced from Sentry or Fly.io data for the last 24 hours, returning at most 20 entries sorted by timestamp descending
4. IF the data source (Fly.io, Cloudflare, or Sentry) is unreachable or returns an error, THEN THE Load_Function SHALL display the Performance page with an empty state indicating the data source is unavailable, without crashing or showing raw error details to the user
