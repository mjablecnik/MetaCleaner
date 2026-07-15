# MetaCleaner Monitoring — Fly.io Prometheus Integration

## Problem

The Runtime (Fly.io) page in the monitoring dashboard shows "No data" for CPU and RAM metrics. The current Fly client (`flyClient.ts`) uses only the Machines API, which returns machine state (started/stopped) and configuration (allocated CPU/RAM), but **not actual resource utilization** (current CPU %, current RAM usage).

This means the dashboard displays:

- CPU Usage: `— %` (empty)
- RAM Usage: `— / 1.5 GB` (empty)
- CPU Usage Over Time graph: "No data"
- RAM Usage Over Time graph: "No data"

## Solution

Fly.io provides a managed Prometheus-compatible API at:

```
https://api.fly.io/prometheus/<org-slug>/api/v1/query
https://api.fly.io/prometheus/<org-slug>/api/v1/query_range
```

This API exposes real-time CPU and memory metrics for all running machines. Authentication uses the same `FLY_API_TOKEN` already configured in `.env`. No additional credentials needed.

## Available Metrics

| Metric                                   | Type                   | What it measures                             |
| ---------------------------------------- | ---------------------- | -------------------------------------------- |
| `fly_instance_memory_mem_total`          | Gauge (bytes)          | Total RAM allocated to the instance          |
| `fly_instance_memory_mem_available`      | Gauge (bytes)          | Available (free) RAM                         |
| `fly_instance_load_average{minutes="1"}` | Gauge                  | 1-minute load average                        |
| `fly_instance_cpu{cpu_id, mode}`         | Counter (centiseconds) | CPU time per mode (user, system, idle, etc.) |

CPU percentage is derived using `rate(fly_instance_cpu{mode!="idle"}[5m])` in PromQL.

## What Needs to Be Done

### 1. Create `src/lib/server/clients/flyPrometheusClient.ts`

A new client that:

- Calls `/api/v1/query` for instant (current) values
- Calls `/api/v1/query_range` for time-series data (graphs)
- Uses `FLY_API_TOKEN` for authentication (Bearer token)
- Uses `FLY_ORG` to construct the base URL
- Handles errors consistently with existing `ClientError` pattern

### 2. Create `src/lib/server/mappers/flyPrometheusMapper.ts`

A mapper that transforms Prometheus JSON responses into the UI data shapes:

- Current CPU % per machine and aggregated across all machines
- Current RAM used (total - available) per machine and aggregated
- Time-series arrays for CPU/RAM "Over Time" charts (array of `[timestamp, value]` pairs)

### 3. Update `src/lib/server/config.ts`

Add Prometheus base URL construction using existing `FLY_ORG` value:

```
baseUrl: `https://api.fly.io/prometheus/${org}`
```

No new env vars needed — `FLY_API_TOKEN` and `FLY_ORG` are already configured.

### 4. Update `src/routes/runtime/+page.server.ts`

Add Prometheus API calls alongside existing Machines API calls:

- Fetch current CPU/RAM for the KPI cards at the top
- Fetch time-range CPU/RAM for the "Over Time" Plotly charts
- Pass data to the page as additional fields in the load response

### 5. Update runtime page components (if needed)

The components likely already support receiving CPU/RAM data (they render "No data" as a fallback). Verify the data shapes match what the components expect and adjust if necessary.

## PromQL Queries to Use

**Current CPU % (aggregated per app):**

```promql
100 - avg(rate(fly_instance_cpu{mode="idle"}[5m])) by (app) * 100
```

**Current RAM usage (per instance):**

```promql
fly_instance_memory_mem_total - fly_instance_memory_mem_available
```

**CPU over time (last 24h, 5-min steps):**

```promql
100 - avg(rate(fly_instance_cpu{mode="idle"}[5m])) by (app)
```

→ Use `query_range` with `start`, `end`, `step=300`

**RAM over time (last 24h, 5-min steps):**

```promql
fly_instance_memory_mem_total - fly_instance_memory_mem_available
```

→ Use `query_range` with `start`, `end`, `step=300`

## API Response Format

**Instant query (`/api/v1/query`):**

```json
{
	"status": "success",
	"data": {
		"resultType": "vector",
		"result": [
			{
				"metric": { "app": "metacleaner-server-stage", "instance": "..." },
				"value": [1752506100, "42.5"]
			}
		]
	}
}
```

**Range query (`/api/v1/query_range`):**

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

## Constraints

- No new npm dependencies required — uses native `fetch`
- No new env vars required — reuses `FLY_API_TOKEN` and `FLY_ORG`
- Prometheus data is retained for 15 days by Fly.io
- Metrics are scraped every 15 seconds by Fly.io
- The monitoring dashboard queries should use 5-minute steps minimum to avoid excessive data points

## Files to Create

- `src/lib/server/clients/flyPrometheusClient.ts`
- `src/lib/server/mappers/flyPrometheusMapper.ts`

## Files to Modify

- `src/lib/server/config.ts` — add Prometheus URL to FlyClientConfig
- `src/routes/runtime/+page.server.ts` — add Prometheus data fetching
- Possibly runtime page sections/components — wire in real data where "No data" is shown

## Estimated Scope

~200–300 lines of new code. No architectural changes. Follows existing patterns (client → mapper → page.server.ts → component).
