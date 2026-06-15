# Test Report
Created: 2026-06-15 20:45:33 UTC
Updated: 2026-06-15 20:45:33 UTC

## Summary
- Total tests: 815
- Passing: 797
- Failing: 18
- Coverage: not measured

Breakdown by suite:

| Suite | Runner | Files | Tests | Pass | Fail |
|---|---|---|---|---|---|
| Frontend (`frontend/metacleaner-app`, server project) | vitest | 30 | 450 | 450 | 0 |
| CLI (`terminal/metacleaner-cli`) | vitest | 5 | 144 | 144 | 0 |
| Backend (`backend/metacleaner-server`) | go test | 25 | 221 | 203 | 18 |
| **Combined** | | **60** | **815** | **797** | **18** |

## Test Results

### Backend — Go (`backend/metacleaner-server/tests/`)

| Test File | Tests | Pass | Fail | Status |
|---|---|---|---|---|
| tests/auth_handlers_test.go | 57 | 55 | 2 | ❌ Fail |
| tests/auth_middleware_test.go | 15 | 9 | 6 | ❌ Fail |
| tests/auth_property_credits_test.go | 4 | 4 | 0 | ✅ Pass |
| tests/auth_property_error_format_test.go | 8 | 8 | 0 | ✅ Pass |
| tests/auth_property_input_validation_test.go | 6 | 6 | 0 | ✅ Pass |
| tests/auth_property_middleware_test.go | 4 | 4 | 0 | ✅ Pass |
| tests/auth_rate_limiter_test.go | 14 | 14 | 0 | ✅ Pass |
| tests/cleanup_test.go | 5 | 5 | 0 | ✅ Pass |
| tests/config_test.go | 8 | 8 | 0 | ✅ Pass |
| tests/cors_test.go | 6 | 6 | 0 | ✅ Pass |
| tests/errors_test.go | 1 | 1 | 0 | ✅ Pass |
| tests/handlers_download_test.go | 7 | 4 | 3 | ❌ Fail |
| tests/handlers_fileid_validation_test.go | 4 | 4 | 0 | ✅ Pass |
| tests/handlers_jobs_test.go | 7 | 7 | 0 | ✅ Pass |
| tests/handlers_reports_test.go | 6 | 5 | 1 | ❌ Fail |
| tests/handlers_test.go | 8 | 8 | 0 | ✅ Pass |
| tests/models_test.go | 12 | 12 | 0 | ✅ Pass |
| tests/pdf_test.go | 5 | 5 | 0 | ✅ Pass |
| tests/pipeline_integration_test.go | 5 | 5 | 0 | ✅ Pass |
| tests/pipeline_test.go | 3 | 3 | 0 | ✅ Pass |
| tests/rate_limiter_test.go | 4 | 4 | 0 | ✅ Pass |
| tests/security_test.go | 5 | 2 | 3 | ❌ Fail |
| tests/supabase_test.go | 16 | 16 | 0 | ✅ Pass |
| tests/websocket_test.go | 5 | 2 | 3 | ❌ Fail |
| tests/well_known_test.go | 6 | 6 | 0 | ✅ Pass |

### Frontend — vitest server project (`frontend/metacleaner-app/`)

| Test File | Tests | Pass | Fail | Status |
|---|---|---|---|---|
| src/lib/__tests__/locale.test.ts | 11 | 11 | 0 | ✅ Pass |
| src/lib/auth/__tests__/antiEnumeration.test.ts | 4 | 4 | 0 | ✅ Pass |
| src/lib/auth/__tests__/apiClient.test.ts | 18 | 18 | 0 | ✅ Pass |
| src/lib/auth/__tests__/authGuard.test.ts | 6 | 6 | 0 | ✅ Pass |
| src/lib/auth/__tests__/authStore.test.ts | 33 | 33 | 0 | ✅ Pass |
| src/lib/auth/__tests__/concurrentRefreshProperty.test.ts | 2 | 2 | 0 | ✅ Pass |
| src/lib/auth/__tests__/deepLink.test.ts | 8 | 8 | 0 | ✅ Pass |
| src/lib/auth/__tests__/tokenUtils.test.ts | 15 | 15 | 0 | ✅ Pass |
| src/lib/clients/__tests__/metaCleanerApi.test.ts | 6 | 6 | 0 | ✅ Pass |
| src/lib/scanner/__tests__/aiDetector.test.ts | 39 | 39 | 0 | ✅ Pass |
| src/lib/scanner/__tests__/extraction.test.ts | 11 | 11 | 0 | ✅ Pass |
| src/lib/scanner/__tests__/formatDetector.test.ts | 47 | 47 | 0 | ✅ Pass |
| src/lib/scanner/__tests__/metadataParser.test.ts | 6 | 6 | 0 | ✅ Pass |
| src/lib/scanner/__tests__/riskAnalyzer.test.ts | 23 | 23 | 0 | ✅ Pass |
| src/lib/scanner/__tests__/scanPipeline.test.ts | 12 | 12 | 0 | ✅ Pass |
| src/lib/scanner/__tests__/scannerStore.test.ts | 10 | 10 | 0 | ✅ Pass |
| src/lib/scanner/parsers/__tests__/imageParser.test.ts | 21 | 21 | 0 | ✅ Pass |
| src/lib/scanner/parsers/__tests__/videoParser.test.ts | 3 | 3 | 0 | ✅ Pass |
| src/lib/services/__tests__/apiCleaningService.test.ts | 60 | 60 | 0 | ✅ Pass |
| src/lib/services/__tests__/preservation.property.test.ts | 15 | 15 | 0 | ✅ Pass |
| src/lib/shared/components/__tests__/UserDropdown.test.ts | 10 | 10 | 0 | ✅ Pass |
| src/lib/shared/utils/__tests__/format.test.ts | 8 | 8 | 0 | ✅ Pass |
| src/lib/shared/utils/__tests__/i18n.test.ts | 7 | 7 | 0 | ✅ Pass |
| src/lib/shared/utils/__tests__/reportStyles.test.ts | 9 | 9 | 0 | ✅ Pass |
| src/lib/shared/utils/__tests__/riskStyles.test.ts | 13 | 13 | 0 | ✅ Pass |
| src/lib/stores/__tests__/appState.test.ts | 13 | 13 | 0 | ✅ Pass |
| src/lib/stores/__tests__/cleaningResultsStore.test.ts | 14 | 14 | 0 | ✅ Pass |
| src/lib/vitest-examples/greet.spec.ts | 1 | 1 | 0 | ✅ Pass |
| src/routes/__tests__/layout.navProps.test.ts | 19 | 19 | 0 | ✅ Pass |
| src/routes/sections/Step5Success/__tests__/Step5Success.download.property.test.ts | 6 | 6 | 0 | ✅ Pass |

### CLI — vitest (`terminal/metacleaner-cli/`)

| Test File | Tests | Pass | Fail | Status |
|---|---|---|---|---|
| tests/commands.test.ts | 23 | 23 | 0 | ✅ Pass |
| tests/formatter.test.ts | 86 | 86 | 0 | ✅ Pass |
| tests/progress.test.ts | 7 | 7 | 0 | ✅ Pass |
| tests/scanner.test.ts | 13 | 13 | 0 | ✅ Pass |
| tests/serverClient.test.ts | 15 | 15 | 0 | ✅ Pass |

## Failures (if any)

All 18 failures are in the **Go backend** (`backend/metacleaner-server/tests/`). They fall into four clusters:

### Cluster 1 — JWT signing algorithm rejected (11 failures)
The auth middleware rejects the test tokens with `AUTH_TOKEN_INVALID: unsupported signing algorithm: HS256`. The middleware now only accepts RS256 tokens validated against a JWKS endpoint, but the JWKS fetch also fails in this environment (`JWKS fetch: ... unsupported protocol scheme ""`). The test helpers still sign tokens with HS256, so every test that exercises an authenticated path fails with 401.
- `TestHandleMe_Success`: expected 200, got 401 (unsupported signing algorithm: HS256) — `auth_handlers_test.go:482`
- `TestHandleMe_ProfileNotFound`: expected 404, got 401 (auth rejected before handler)
- `TestAuthenticate_ValidToken`: expected no error, got `AUTH_TOKEN_INVALID: unsupported signing algorithm: HS256` — `auth_middleware_test.go:60`
- `TestAuthenticate_ExpiredToken`: token rejected on algorithm before expiry is evaluated
- `TestAuthenticate_WrongSignature`: token rejected on algorithm before signature is evaluated
- `TestAuthenticate_MissingSubClaim`: token rejected on algorithm before claim check
- `TestAuthenticate_NoExpClaim_Valid`: token rejected on algorithm
- `TestMiddleware_ProtectedPath_ValidToken_PassesThrough`: expected 200, got 401 — `auth_middleware_test.go:247`
- `TestRateLimit_FileDownload_BlocksAfterBurst`: expected 429, got 401 (auth fails before rate limiter is reached) — `security_test.go:112`
- `TestRateLimit_JobDownload_BlocksAfterBurst`: expected 429, got 401 — `security_test.go:155`
- `TestRateLimit_DifferentIPsHaveSeparateLimits`: IP not rate limited because requests fail auth (401) first — `security_test.go:186`

### Cluster 2 — File ID validation too strict for download tests (3 failures)
The file-download handler rejects the test file IDs as `INVALID_REQUEST: Invalid file ID` (400) before reaching the intended logic.
- `TestHandleFileDownloadCompleted`: expected 200, got 400 (Invalid file ID) — `handlers_download_test.go:41`
- `TestHandleFileDownloadInProgress`: expected 409, got 400 (Invalid file ID) — `handlers_download_test.go:74`
- `TestHandleFileDownloadNotFound`: expected 404, got 400 (Invalid file ID) — `handlers_download_test.go:94`

### Cluster 3 — WebSocket origin check returns 401 instead of expected status (3 failures)
The job-progress WebSocket handler returns 401 (auth) before the origin check is evaluated, same auth root cause as Cluster 1.
- `TestHandleJobProgress_WrongOrigin_Returns403`: expected 403, got 401 — `websocket_test.go:110`
- `TestHandleJobProgress_CorrectOrigin_Accepted`: expected upgrade success, got `websocket: bad handshake (status: 401)` — `websocket_test.go:136`
- `TestHandleJobProgress_EmptyOrigin_Accepted`: expected upgrade success, got `bad handshake (status: 401)` — `websocket_test.go:162`

### Cluster 4 — Report PDF redirect returns JSON instead of redirect (1 failure)
- `TestHandleGetReportPDFRedirect`: expected 302 redirect, got 200 with JSON body `{"url":"https://example.com/signed/r1.pdf"}` — `handlers_reports_test.go:172`

## Uncovered (no tests)
All Go source files under `backend/metacleaner-server/source/` have a corresponding test file. The following source files have **no direct/dedicated test file** (behavior is exercised only indirectly via integration/router tests, if at all):
- `source/main.go` — application entry point (no dedicated unit test)
- `source/router.go` — route wiring (exercised indirectly through handler/integration tests, no dedicated `router_test.go`)

The frontend `server` project and the CLI suite cover their respective `src/lib/**` and `src/` modules; no source module in those packages was found without a corresponding `__tests__`/`tests` file.

## Notes
- **Backend was the only suite with failures (18).** The frontend `aggregatedRisk.overallScore` regression and the video-header-slice failure reported in the previous `TEST_RESULTS.md` are now fixed — the frontend server project is fully green (450/450).
- **Auth failures are a code↔test mismatch.** The middleware was changed to require RS256/JWKS validation, but the test helpers still mint HS256 tokens and no JWKS endpoint is reachable in this environment (repeated `initial JWKS fetch failed: ... unsupported protocol scheme ""` warnings). Either the test token helper needs to sign with the JWKS-backed key, or the middleware/test needs an injectable HS256 path for tests. This single root cause accounts for 14 of the 18 failures (Clusters 1 and 3).
- **Not run — browser & E2E.** The frontend `client`/`storybook` vitest projects (`npm run test:browser`) and Playwright E2E (`npm run test:e2e`) require a Chromium browser provider that is not installed in this environment (`~/.cache/ms-playwright` is empty), so they were skipped.
- **CLI runner note.** The `terminal/metacleaner-cli` `test` script uses `bunx`, which is unavailable here; the suite was run via the local `vitest` binary (`./node_modules/.bin/vitest --run`) — same test set.
- **Coverage** was not measured this run (no `--coverage` flag); reported as "not measured".
- A non-fatal vitest warning persists: a `vi.mock("mediainfo.js")` call in `videoParser.test.ts` is not at module top level (will become an error in a future vitest version) — worth relocating to the top level.

## How tests were run
- Frontend: `cd frontend/metacleaner-app && npm run test` (`vitest --run --project=server`)
- CLI: `cd terminal/metacleaner-cli && ./node_modules/.bin/vitest --run`
- Backend: `cd backend/metacleaner-server && go test ./tests/`
