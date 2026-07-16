# MetaCleaner Monitoring — Fly.io Prometheus Integration Tasks

- [x] 1. [HIGH] Create `src/lib/server/clients/flyPrometheusClient.ts` — implement `queryInstant(config, promql)` that calls `GET /api/v1/query` with Bearer token auth, error handling via `ClientError`, and `fetchWithTimeout`
- [x] 2. [HIGH] Add `queryRange(config, promql, start, end, step)` to `flyPrometheusClient.ts` — calls `GET /api/v1/query_range` with time range params, same error/timeout handling
- [x] 3. [HIGH] Add convenience functions to `flyPrometheusClient.ts`: `getCurrentCpuPercent(config)` and `getCurrentRamUsage(config)` — wrap `queryInstant` with the correct PromQL queries
- [x] 4. [HIGH] Add convenience functions to `flyPrometheusClient.ts`: `getCpuOverTime(config, start, end, step)` and `getRamOverTime(config, start, end, step)` — wrap `queryRange` with correct PromQL queries
- [x] 5. [HIGH] Create `src/lib/server/mappers/flyPrometheusMapper.ts` — implement `mapToCurrentCpu(response)` that extracts aggregated CPU % from Prometheus instant vector response
- [x] 6. [HIGH] Add `mapToCurrentRam(response)` to `flyPrometheusMapper.ts` — extracts per-instance RAM used (total - available) and aggregates across instances, returns bytes
- [x] 7. [HIGH] Add `mapToTimeSeries(response)` to `flyPrometheusMapper.ts` — transforms Prometheus matrix response into `Array<{ timestamp: number; value: number }>` suitable for chart rendering
- [x] 8. [MEDIUM] Update `src/lib/server/config.ts` — add `prometheusBaseUrl` field to `FlyClientConfig` interface, computed as `https://api.fly.io/prometheus/${org}/api/v1` in `getServiceConfigs()`
- [x] 9. [HIGH] Update `src/lib/types/pageData.ts` — extend `RuntimePageData` with `cpuCurrent`, `ramCurrent`, `cpuTimeSeries`, and `ramTimeSeries` fields using `SectionResult<T>` wrapper
- [x] 10. [HIGH] Update `src/routes/runtime/+page.server.ts` — add Prometheus API calls (current CPU/RAM + 24h time-series) using `callSection()` pattern, pass results in page load response
- [x] 11. [HIGH] Update `src/lib/server/mappers/flyMapper.ts` — modify `mapToRuntimeStats()` to accept optional current CPU/RAM values from Prometheus and populate the `value`/`barWidth` fields instead of `'—'`/`'0%'`
- [x] 12. [HIGH] Update `src/routes/runtime/sections/RuntimeChartsSection.svelte` — accept time-series data as props and render CPU/RAM line charts (or use existing PlotlyChart component if available), with "No data" fallback when data is empty
- [x] 13. [MEDIUM] Update `src/routes/runtime/+page.svelte` — pass `cpuTimeSeries` and `ramTimeSeries` data to `RuntimeChartsSection`, handle `SectionResult` status variants (ok/error/not-configured)
- [x] 14. [MEDIUM] Create `src/lib/server/clients/__tests__/flyPrometheusClient.test.ts` — test `queryInstant` and `queryRange` with mocked fetch (success, error, timeout scenarios)
- [x] 15. [MEDIUM] Create `src/lib/server/mappers/__tests__/flyPrometheusMapper.test.ts` — test `mapToCurrentCpu`, `mapToCurrentRam`, `mapToTimeSeries` with sample Prometheus JSON responses, empty results, and edge cases
- [x] 16. [LOW] Verify build compiles cleanly with `bun run check` and all unit tests pass with `bun run test:unit`
