# Unit / Integration Test Specification — metacleaner-monitoring

_Generated: 2026-06-30. Scope: unit + integration tests for server-side business logic
(config, API clients, data mappers, hooks). E2E/Storybook/visual tests are explicitly OUT
of scope (owned by the ui-tests pipeline)._

## 1. Detected tooling & conventions

| Aspect | Value |
| --- | --- |
| Framework | SvelteKit 2 (Svelte 5, runes) + TypeScript |
| Package manager | bun (npm lockfile also present) |
| Test runner | **Vitest 4** (`vite.config.ts` defines two projects) |
| Project `server` | `environment: 'node'`, includes `src/**/*.{test,spec}.{js,ts}`, **excludes** `*.svelte.{test,spec}.*` → this is the in-scope project |
| Project `client` | browser (Playwright provider), includes `src/**/*.svelte.{test,spec}.*` → OUT of scope |
| Assertion lib | Vitest `expect`; **`test.expect.requireAssertions: true`** — every test MUST assert |
| Property testing | **fast-check 4** (`fc.assert` / `fc.property` / `fc.asyncProperty`), used pervasively |
| Mocking | `vi.mock`, `vi.hoisted`, `vi.fn`; env mocked via `vi.mock('$env/dynamic/private', () => ({ env: mockEnv }))` |
| Test file location | `__tests__/` subdirs under the unit (e.g. `mappers/__tests__/flyMapper.test.ts`), or co-located (`config.test.ts`) |
| Naming | `*.test.ts` (preferred) |
| Run command | `npx vitest run --project server` |

### Conventions to follow exactly
- Mock `$env/dynamic/private` with the `vi.hoisted` + by-reference mutation pattern from `config.test.ts`.
- Mock `fetch` for client tests via `vi.stubGlobal('fetch', vi.fn())` (clients call global `fetch` through `fetchWithTimeout`).
- Prefer property tests (fast-check) for invariants; example-based tests for specific value mappings.
- Every `it` must contain at least one `expect` (requireAssertions is on).
- Use a fixed `now`/`Date.now()` (inject or `vi.useFakeTimers()`/`vi.setSystemTime`) for time-dependent mappers.

## 2. Current coverage overview

| Source unit | Test file | Coverage level |
| --- | --- | --- |
| `server/config.ts` | `config.test.ts` | ✅ full (property: detection, empty-vars, required-throw) |
| `server/clients/types.ts` → `callSection` | `clients/__tests__/sectionIsolation.test.ts` | ⚠️ present but **2 assertions outdated/broken** (see §5) |
| `server/clients/types.ts` → `categorizeStatus`, `fetchWithTimeout` | — | ❌ none |
| `server/clients/flyClient.ts` | — | ❌ none |
| `server/clients/stripeClient.ts` | — | ❌ none |
| `server/clients/sentryClient.ts` | — | ❌ none |
| `server/clients/cloudflareClient.ts` | — | ❌ none |
| `server/clients/supabaseClient.ts` | — | ❌ none |
| `server/mappers/flyMapper.ts` | `flyMapper.test.ts` + `mapperCompleteness.test.ts` | ✅ value + completeness |
| `server/mappers/stripeMapper.ts` | `stripeMapper.test.ts` + completeness | ✅ MRR/ARPU + completeness |
| `server/mappers/performanceMapper.ts` | `performanceMapper.test.ts` + `endpointSorting.test.ts` | ✅ apdex + sorting |
| `server/mappers/cloudflareMapper.ts` | `cloudflareMapper.test.ts` (geo only) + completeness | ⚠️ partial — only `mapToGeoDistribution` value-tested |
| `server/mappers/sentryMapper.ts` | completeness only | ⚠️ field-presence only, **no value tests** |
| `server/mappers/supabaseMapper.ts` | completeness only | ⚠️ field-presence only, **no value tests** |
| `server/dashboardAlerts.ts` | `__tests__/dashboardAlerts.test.ts` | ✅ merge/sort/severity |
| `hooks.server.ts` (auth / rate-limit / headers) | — | ❌ none (security-critical, recently added) |
| `lib/repositories/*.ts` | — | ❌ none (mostly static mock data; low value) |

`src/lib/vitest-examples/` (`greet.spec.ts`, `Welcome.svelte.spec.ts`) are SvelteKit template
scaffolding that test example code — they pass and their targets still exist, so they are not
orphaned. Optional to delete as cruft, not required.

## 3. Missing test groups (sorted: priority, then file)

### [HIGH] `hooks.server.ts` — auth guard, rate limiter, security headers
- **Behavior to verify** (each `Handle` is exercised by calling it with a fake `event` + a `resolve` spy):
  - `requireAuth`: `/login`, `/_app/*`, `/favicon*` paths bypass auth (resolve called, no redirect);
    missing `DASHBOARD_SESSION_SECRET` → redirect 303 `/login`; missing/incorrect `mc_session`
    cookie → redirect 303 `/login`; matching cookie === secret → resolve called.
  - `rateLimit`: under `RL_MAX` (60) requests in window → all resolve; the 61st from the same IP
    → `Response` 429 with `Retry-After` header; a different IP is independent; after `resetAt`
    the counter resets (advance fake time past 60 s window).
  - `securityHeaders`: response carries `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
    `Referrer-Policy`, `Strict-Transport-Security`, and a `Content-Security-Policy` containing
    `default-src 'self'` and `frame-ancestors 'none'`.
- **Inputs/outputs**: build minimal `RequestEvent` stubs (`url`, `cookies.get`, `getClientAddress`);
  `resolve` returns `new Response('ok')`. `redirect()` throws — assert via `expect(...).rejects` or
  try/catch on the thrown redirect object (`status`/`location`).
- **Mocking**: `vi.mock('$env/dynamic/private')`; `vi.useFakeTimers()` for window reset; the module
  runs `getServiceConfigs()` at import and `process.exit(1)` on failure — set valid SUPABASE_* env
  before import, and/or import only the named handles (consider `vi.spyOn(process,'exit')`).
- _Note: the `handle` sequence wiring and `handleParaglide` chunk replacement may be covered as part
  of this file or split out; `process.exit` on missing config is the riskiest edge to guard._

### [HIGH] `server/clients/flyClient.ts` — `getMachines`, `getMachinesForAllApps`
- **Behavior**: empty/missing token → throws `ClientError('fly', null, 'unauthorized', …)` without
  calling fetch; builds URL `{baseUrl}/apps/{app}/machines` with `Authorization: Bearer {token}`;
  `!response.ok` → `ClientError` with `statusCode` and category from `categorizeStatus` (401→unauthorized,
  500→service_unavailable, 404→request_error); `AbortError` from fetch → category `timeout`; other
  fetch throw → `request_error`; `response.ok` → returns parsed JSON array. `getMachinesForAllApps`
  fans out over `config.apps` and returns a `Map<app, machines[]>` (one rejecting app rejects all).
- **Mocking**: `vi.stubGlobal('fetch', vi.fn())` returning `{ ok, status, json }`; simulate abort by
  rejecting with `Object.assign(new Error(), { name: 'AbortError' })`.

### [HIGH] `server/clients/stripeClient.ts` — `getActiveSubscriptions`, `getCanceledSubscriptions`, `getPrices`, pagination
- **Behavior**: missing token → `unauthorized` ClientError on every exported fn; Basic-auth header is
  `Basic btoa("{token}:")`; query params set correctly (`status=active`; `status=canceled` +
  `canceled_at[gte]={since}`; `active=true`); **`listAll` pagination**: follows `has_more` using
  `starting_after = last.id`, accumulates across pages, stops when `has_more` false or page empty;
  non-ok → categorized `ClientError`; abort → `timeout`.
- **Mocking**: mock `fetch` to return a multi-page sequence (`{ object:'list', data:[…], has_more:true }`
  then `has_more:false`); assert request count and accumulated length; inspect URL `searchParams`.

### [HIGH] `server/clients/supabaseClient.ts` — `getTableStats`, `getUsers`, `queryTable`
- **Behavior**: missing serviceKey → `unauthorized`; missing url → `request_error`; headers include
  both `Authorization: Bearer` and `apikey`; `getUsers` builds `/auth/v1/admin/users?page&per_page`
  and **null-coalesces** `{ users: data.users ?? [], total: data.total ?? 0 }`; `getTableStats` hits
  `/rest/v1/rpc/get_table_stats`; non-ok/abort categorization as above.
- **Mocking**: `vi.stubGlobal('fetch')`; assert URL/searchParams and header object.

### [HIGH] `server/clients/sentryClient.ts` — `getRecentIssues`, `getIssueStats`
- **Behavior**: missing token → `unauthorized`; missing `org`/`project` → `request_error`; URL is
  `/projects/{org}/{project}/issues/` with `limit`, `query: lastSeen:>{iso}`, `sort: date` (and
  `statsPeriod: 24h` for stats); `lastSeen:>` uses now − 24 h (assert with fixed time); non-ok/abort
  categorization.
- **Mocking**: fake timers for the 24 h `since`; mock `fetch`; inspect searchParams.

### [HIGH] `server/clients/cloudflareClient.ts` — `executeGraphQL` + public fetchers
- **Behavior**: POSTs to `{baseUrl}/graphql` with `Bearer` auth and a JSON `{ query, variables }`
  body; non-ok HTTP → categorized `ClientError`; a 200 response carrying a non-empty
  `json.errors[]` → `ClientError('cloudflare', null, 'request_error', …)` (GraphQL-level error);
  abort → `timeout`; success returns `json.data`. Cover the public analytics/geo/firewall fetchers’
  variable construction (zoneId, date window).
- **Mocking**: mock `fetch`; return `{ ok:true, json: () => ({ data })}` and `{ ok:true, json: () => ({ errors:[{message}] })}`.

### [HIGH] `server/mappers/sentryMapper.ts` — value-level mapping
- **Behavior**:
  - `mapTypeCode`: title/metaType containing "timeout" → `TMT`; metaType ending `Error`/`Exception`
    → `EXC`; `status_code` tag ≥500 → `5XX`, ≥400 → `4XX`; otherwise `ERR`. Precedence order matters.
  - `mapToErrorKpis`: returns 4 KPIs; `value` counts for 5xx / jsErrors / exceptions / timeouts match
    the predicate filters; severity + class flip on count>0 vs 0 (e.g. 5xx>0 → `common_status_critical`
    + `bg-error/10`).
  - `mapToTopEndpoints`: aggregates by `culprit`, increments count for duplicates, sorts desc, caps at
    10; `parseCulprit` splits `"GET /path"` → `{method:'GET', path:'/path'}`, non-method → `{method:'ERR'}`;
    `barWidth` = `round(count/max*100)%` (slowest = 100%); `methodClass`/`barClass`/`countClass` thresholds.
  - `formatTime`: `HH:MM:SS` zero-padded from ISO (use fixed-TZ-safe values or assert format/length).
- **Mocking**: none (pure); fixtures of `SentryIssueRaw`.

### [HIGH] `server/mappers/supabaseMapper.ts` — value-level mapping (incl. security-critical email masking)
- **Behavior**:
  - `maskEmail` (**security fix — must stay correct**): `a@b.com` (local ≤2) → `a*@b.com`;
    longer local → first + `*`×(len−2) + last + domain; no `@` → `***`. Asserts middle chars hidden.
  - `nameFromEmail`: `john.doe@x.com` → `John Doe` (split `._-`, title-case).
  - `formatBytes`: <1 KB → `N B`; <1 MB → `N KB` (rounded); <1 GB → `N.N MB`; else `N.NN GB`.
  - `mapToTableSizes`: empty → `[]`; sorts by `total_bytes` desc; `barWidth` `= max(1, round(bytes/max*100))%`
    (largest = 100%); cycles `barClass` palette by index.
  - `mapToDbKpis`: storage % vs `STORAGE_CAP_BYTES` (8 GiB); badge thresholds <70/<90/≥90 →
    ok/warning/error keys+classes; `tableCount`/`totalRows` formatting; connections & latency are `—`.
  - `getUserStatus`/`formatLastLogin`: relative thresholds (online <15 min, idle <60 min, else offline;
    "Just now"/"N min ago"/"Nh ago"/"N days ago") — drive with fixed `Date.now()` via fake timers.
  - `mapToUserStats`: online (<15 min) and new (<30 days) counts; `total ?? users.length`.
- **Mocking**: `vi.useFakeTimers()` + `vi.setSystemTime()` for relative-time functions.

### [MEDIUM] `server/clients/types.ts` — `categorizeStatus`, `fetchWithTimeout`
- **Behavior**: `categorizeStatus` boundaries — 401→unauthorized, 403→unauthorized, 400/404/429→
  request_error, 500/503→service_unavailable (property: any ≥500 → service_unavailable).
  `fetchWithTimeout`: passes `signal` to fetch, clears the timeout on success, and aborts (controller
  fires) when the timeout elapses (use fake timers; assert the passed signal aborts / fetch rejects).
- **Mocking**: `vi.stubGlobal('fetch')`, `vi.useFakeTimers()`.

### [MEDIUM] `server/mappers/cloudflareMapper.ts` — value-level mapping (gaps)
- **Behavior** (geo already covered):
  - `mapToEdgeKpiStats`: 4 KPIs; cache-hit-ratio / requests / threats / bandwidth values derived from
    summed `httpRequests1dGroups`; badge thresholds.
  - `mapToWafLog`: per-event `action`→`actionKey`/`actionClass`, `source`→`type`/`typeClass`,
    `statusKey`/`statusClass`, country flag, time formatting.
  - `mapToHttpStatusDistribution`: 4 buckets, percents derived (or documented as fixed) and labeled.
- **Mocking**: none; `CfAnalyticsRaw`/`CfFirewallEventRaw` fixtures.

### [MEDIUM] `server/clients/types.ts` → `callSection` regression guard for sanitized messages
- After fixing the broken tests (§5), add an explicit assertion that **`callSection` never leaks the
  upstream message to the client** — for both `ClientError` and generic `Error`, `result.error.message`
  is `''` while `category` is preserved. This locks in security commit `a2863b9`.

### [LOW] `lib/repositories/navigationRepository.ts` — `getNavSections(base)`
- **Behavior**: returns 3 sections with 9 total items; every `href` is prefixed with `base`
  (e.g. `getNavSections('/x')[0].items[0].href === '/x/'`); labelKeys/icons stable.
- **Mocking**: none.

### [LOW] `lib/repositories/*` static data integrity (optional)
- The remaining repository functions return hardcoded mock/fallback data with no inputs. A single
  light data-integrity test (arrays non-empty, ids unique, percentages within range) per repository
  is low value but cheap; include only if coverage targets demand it.

## 4. Mocking summary
- **Env**: `vi.mock('$env/dynamic/private', () => ({ env: mockEnv }))` with `vi.hoisted` (see `config.test.ts`).
- **Network**: `vi.stubGlobal('fetch', vi.fn())`; return `{ ok, status, json: async () => (...) }`;
  simulate timeout via reject with `name: 'AbortError'`.
- **Time**: `vi.useFakeTimers()` + `vi.setSystemTime(fixedMs)` for sentry `since`, supabase relative
  times, dashboard `timeAgo`, and `fetchWithTimeout`.
- **No external service may be contacted** — all clients go through `fetch`, so stubbing `fetch` fully
  isolates them.

## 5. Broken / outdated tests (Phase 0 cleanup)
- **`src/lib/server/clients/__tests__/sectionIsolation.test.ts`** — 2 failing assertions test behavior
  that the security hardening commit `a2863b9` intentionally changed. `callSection` now blanks the
  client-facing message (`message: ''`) so upstream details aren’t leaked, but the test still expects
  the original message:
  - `it('error sections preserve ClientError category and message')` — `expect(result.error.message).toBe(err.message)` now fails.
  - `it('non-ClientError exceptions also produce error status …')` — `expect(result.error.message).toBe(message)` now fails.
  Fix: keep the **category** assertions, change the **message** assertions to `toBe('')` (and rename the
  describing text to reflect "category preserved, message sanitized"). Verified failing via
  `npx vitest run --project server` (2 failed | 87 passed).
- No orphaned tests for deleted code were found (vitest-examples targets still exist).
