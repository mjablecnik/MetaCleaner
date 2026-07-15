# MetaCleaner Monitoring — Fly.io Prometheus Integration Spec

## Overview

The runtime page in the monitoring dashboard currently shows "No data" for CPU and RAM metrics because the Fly Machines API only returns machine state/config, not real-time resource utilization. Fly.io exposes a managed Prometheus-compatible API that provides actual CPU/RAM metrics. This feature integrates that API to populate:

1. CPU Usage KPI card (current %)
2. RAM Usage KPI card (current used / total)
3. CPU Usage Over Time chart (24h time-series)
4. RAM Usage Over Time chart (24h time-series)

## Technical Approach

### Architecture

Follows the existing project pattern: **Client → Mapper → page.server.ts → Component**.

- **Client** (`flyPrometheusClient.ts`): Thin HTTP layer that calls the Prometheus query/query_range endpoints. Uses existing `ClientError` pattern, `fetchWithTimeout`, and `FlyClientConfig` (reuses `FLY_API_TOKEN` and `FLY_ORG`).
- **Mapper** (`flyPrometheusMapper.ts`): Transforms Prometheus JSON response format into UI-ready data shapes (current values for KPIs, time-series arrays for charts).
- **Config**: Prometheus base URL derived from existing `FLY_ORG` config value. No new env vars needed.
- **page.server.ts**: Adds Prometheus data fetching alongside existing Machines API calls, passes data as new fields in the page load response.

### Prometheus API

Base URL: `https://api.fly.io/prometheus/{org}/api/v1/`

Two endpoints:
- `GET /query?query=<promql>` — instant vector (current value)
- `GET /query_range?query=<promql>&start=<unix>&end=<unix>&step=<seconds>` — matrix (time-series)

Auth: `Authorization: Bearer <FLY_API_TOKEN>`

### PromQL Queries

| Metric | PromQL | Endpoint |
|--------|--------|----------|
| Current CPU % | `100 - avg(rate(fly_instance_cpu{mode="idle"}[5m])) by (app) * 100` | `/query` |
| Current RAM used | `fly_instance_memory_mem_total - fly_instance_memory_mem_available` | `/query` |
| CPU over time | `100 - avg(rate(fly_instance_cpu{mode="idle"}[5m])) by (app) * 100` | `/query_range` (24h, step=300) |
| RAM over time | `fly_instance_memory_mem_total - fly_instance_memory_mem_available` | `/query_range` (24h, step=300) |

### Response Formats

**Instant (`/query`):**
```json
{
  "status": "success",
  "data": {
    "resultType": "vector",
    "result": [
      { "metric": {"app": "metacleaner-server"}, "value": [1752506100, "42.5"] }
    ]
  }
}
```

**Range (`/query_range`):**
```json
{
  "status": "success",
  "data": {
    "resultType": "matrix",
    "result": [
      { "metric": {"app": "..."}, "values": [[1752500000, "40.2"], [1752500300, "41.8"], ...] }
    ]
  }
}
```

## Key Components

### 1. `src/lib/server/clients/flyPrometheusClient.ts`

- `queryInstant(config, promql)` → raw Prometheus vector response
- `queryRange(config, promql, start, end, step)` → raw Prometheus matrix response
- `getCurrentCpuPercent(config)` → calls queryInstant with CPU PromQL
- `getCurrentRamUsage(config)` → calls queryInstant with RAM PromQL
- `getCpuOverTime(config, start, end, step)` → calls queryRange with CPU PromQL
- `getRamOverTime(config, start, end, step)` → calls queryRange with RAM PromQL

Uses `FlyClientConfig` which already has `token` and `org`. Constructs Prometheus base URL internally: `https://api.fly.io/prometheus/${config.org}/api/v1`.

### 2. `src/lib/server/mappers/flyPrometheusMapper.ts`

- `mapToCurrentCpu(response)` → `{ percent: number, perApp: Map<string, number> }`
- `mapToCurrentRam(response)` → `{ usedBytes: number, perInstance: Map<string, number> }`
- `mapToTimeSeries(response)` → `Array<{ timestamp: number, value: number }>` (aggregated) or per-app map

Output shapes must match what `RuntimeChartsSection.svelte` and `RuntimeKpiSection.svelte` can consume.

### 3. Config Update (`src/lib/server/config.ts`)

No new config interface needed. The Prometheus URL is derived from `FlyClientConfig.org`:
```
prometheusBaseUrl: `https://api.fly.io/prometheus/${org}/api/v1`
```

This can be computed inside the client or added as a derived property on the config.

### 4. `src/routes/runtime/+page.server.ts`

Add Prometheus calls using `callSection()` wrapper (same pattern as existing Machines API):
- Fetch current CPU/RAM for KPI cards
- Fetch 24h CPU/RAM time-series for charts
- Return as new fields: `cpuTimeSeries`, `ramTimeSeries` (plus update `stats` KPI values)

### 5. `RuntimeChartsSection.svelte` Update

Currently displays static "No data" text. Will receive time-series data as props and render it using either:
- Existing Plotly chart component (if `PlotlyChart` is available in the project)
- Simple SVG/CSS bar chart (matches existing patterns)

### 6. `RuntimeKpiSection.svelte` Update

Already renders `stats` array. The mapper will populate the `value` and `barWidth` fields for `cpuUsage` and `ramUsage` KPI stats with real data from Prometheus (instead of current `'—'` and `'0%'`).

## File Structure

### New Files
- `src/lib/server/clients/flyPrometheusClient.ts`
- `src/lib/server/mappers/flyPrometheusMapper.ts`
- `src/lib/server/clients/__tests__/flyPrometheusClient.test.ts`
- `src/lib/server/mappers/__tests__/flyPrometheusMapper.test.ts`

### Modified Files
- `src/lib/server/config.ts` — add `prometheusBaseUrl` to `FlyClientConfig`
- `src/routes/runtime/+page.server.ts` — add Prometheus data fetching
- `src/routes/runtime/sections/RuntimeChartsSection.svelte` — render time-series data
- `src/routes/runtime/sections/RuntimeKpiSection.svelte` — (possibly) no changes if KPI data comes pre-mapped
- `src/lib/types/pageData.ts` — extend `RuntimePageData` with chart data fields
- `src/lib/server/mappers/flyMapper.ts` — update `mapToRuntimeStats` to accept optional Prometheus data

## Constraints

- No new npm dependencies — uses native `fetch` via existing `fetchWithTimeout`
- No new environment variables — reuses `FLY_API_TOKEN` and `FLY_ORG`
- Prometheus data retained 15 days by Fly.io
- Use 5-minute step minimum to avoid excessive data points
- Must handle gracefully when Prometheus returns empty results (no running machines)
- Must preserve existing "not-configured" behavior when `FLY_API_TOKEN`/`FLY_ORG` are missing
- All user-facing text goes through i18n (`t()` helper)

## Data Flow

```
page.server.ts
  ├── getMachinesForAllApps(flyConfig)     → existing machine state
  ├── getCurrentCpuPercent(flyConfig)      → NEW: current CPU %
  ├── getCurrentRamUsage(flyConfig)        → NEW: current RAM bytes
  ├── getCpuOverTime(flyConfig, ...)       → NEW: 24h CPU time-series
  └── getRamOverTime(flyConfig, ...)       → NEW: 24h RAM time-series
         │
         ▼
  mappers transform raw Prometheus responses
         │
         ▼
  Return to page component via SectionResult<T> pattern
```

## Estimated Scope

~250–350 lines of new code across client, mapper, and integration. No architectural changes. Pure additive feature following existing conventions.
