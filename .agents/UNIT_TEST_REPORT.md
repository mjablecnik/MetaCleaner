# Test Report
Created: 2026-06-15 21:16:10 UTC
Updated: 2026-06-15 21:16:10 UTC

## Summary
- Total tests: 881
- Passing: 881
- Failing: 0
- Coverage: not measured

Breakdown by suite:

| Suite | Runner | Files | Tests | Pass | Fail |
|---|---|---|---|---|---|
| Frontend (`frontend/metacleaner-app`, server project) | vitest | 33 | 482 | 482 | 0 |
| CLI (`terminal/metacleaner-cli`) | vitest | 6 | 154 | 154 | 0 |
| Backend (`backend/metacleaner-server`) | go test | 26 | 245 | 245 | 0 |
| **Combined** | | **65** | **881** | **881** | **0** |

## Test Results

### Backend — Go (`backend/metacleaner-server`)

| Test File | Tests | Pass | Fail | Status |
|---|---|---|---|---|
| tests/auth_handlers_test.go | 57 | 57 | 0 | ✅ Pass |
| tests/auth_middleware_test.go | 15 | 15 | 0 | ✅ Pass |
| tests/auth_property_credits_test.go | 4 | 4 | 0 | ✅ Pass |
| tests/auth_property_error_format_test.go | 8 | 8 | 0 | ✅ Pass |
| tests/auth_property_input_validation_test.go | 6 | 6 | 0 | ✅ Pass |
| tests/auth_property_middleware_test.go | 4 | 4 | 0 | ✅ Pass |
| tests/auth_rate_limiter_test.go | 14 | 14 | 0 | ✅ Pass |
| tests/cleanup_test.go | 5 | 5 | 0 | ✅ Pass |
| tests/config_test.go | 8 | 8 | 0 | ✅ Pass |
| tests/cors_test.go | 6 | 6 | 0 | ✅ Pass |
| tests/errors_test.go | 1 | 1 | 0 | ✅ Pass |
| tests/handlers_download_test.go | 7 | 7 | 0 | ✅ Pass |
| tests/handlers_fileid_validation_test.go | 4 | 4 | 0 | ✅ Pass |
| tests/handlers_jobs_test.go | 7 | 7 | 0 | ✅ Pass |
| tests/handlers_reports_test.go | 6 | 6 | 0 | ✅ Pass |
| tests/handlers_test.go | 8 | 8 | 0 | ✅ Pass |
| tests/models_test.go | 12 | 12 | 0 | ✅ Pass |
| tests/pdf_test.go | 5 | 5 | 0 | ✅ Pass |
| tests/pipeline_integration_test.go | 5 | 5 | 0 | ✅ Pass |
| tests/pipeline_test.go | 3 | 3 | 0 | ✅ Pass |
| tests/rate_limiter_test.go | 4 | 4 | 0 | ✅ Pass |
| tests/security_test.go | 5 | 5 | 0 | ✅ Pass |
| tests/supabase_test.go | 16 | 16 | 0 | ✅ Pass |
| tests/websocket_test.go | 5 | 5 | 0 | ✅ Pass |
| tests/well_known_test.go | 6 | 6 | 0 | ✅ Pass |
| source/format_helpers_test.go | 7 | 7 | 0 | ✅ Pass |
| source/supabase_auth_url_test.go | 17 | 17 | 0 | ✅ Pass |

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
| src/lib/repositories/__tests__/authRepository.test.ts | 14 | 14 | 0 | ✅ Pass |
| src/lib/repositories/__tests__/languageRepository.test.ts | 8 | 8 | 0 | ✅ Pass |
| src/lib/repositories/__tests__/userRepository.test.ts | 10 | 10 | 0 | ✅ Pass |
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
| tests/polyfills.test.ts | 10 | 10 | 0 | ✅ Pass |
| tests/progress.test.ts | 7 | 7 | 0 | ✅ Pass |
| tests/scanner.test.ts | 13 | 13 | 0 | ✅ Pass |
| tests/serverClient.test.ts | 15 | 15 | 0 | ✅ Pass |

## Failures (if any)
None. All 881 tests across the three suites pass. The 18 backend failures recorded in the
previous run (HS256 auth rejection, file-ID validation, WebSocket origin checks, and the report
PDF redirect) have all been fixed by the recent commits (`bbede58`, `744c3d0`) and now pass.

## Uncovered (no tests)
- `backend/metacleaner-server/source/main.go` — application entry point, no dedicated unit test.
- `backend/metacleaner-server/source/router.go` — route wiring; exercised indirectly via the
  handler/integration tests in `tests/`, but has no dedicated `router_test.go`.
- The frontend `server` project and the CLI suite cover their respective `src/lib/**` and `src/`
  modules; no plain source module in those packages was found without a corresponding
  `__tests__`/`tests` file.

## Notes
- **All suites green.** Frontend server project (482), CLI (154), and Go backend (245, across both
  the `tests/` and `source/` packages) all pass with zero failures.
- **Not run — browser & E2E.** The frontend `client`/`storybook` vitest projects
  (`npm run test:browser`) and Playwright E2E (`npm run test:e2e`) require a Chromium browser
  provider that is not installed in this environment (`~/.cache/ms-playwright` is empty), so they
  are out of scope for this unit-test report.
- **CLI runner note.** The `terminal/metacleaner-cli` `test` script invokes `bunx`, which is not
  available on this machine; the suite was run via the local `vitest` binary
  (`npx vitest --run`) — the same test set.
- **Coverage** was not measured this run (no `--coverage` flag); reported as "not measured".
- A non-fatal vitest warning persists: a `vi.mock("mediainfo.js")` call in `videoParser.test.ts`
  is not at module top level (will become an error in a future vitest version) — worth relocating
  to the top level.

## How tests were run
- Frontend: `cd frontend/metacleaner-app && npm run test` (`vitest --run --project=server`)
- CLI: `cd terminal/metacleaner-cli && npx vitest --run`
- Backend: `cd backend/metacleaner-server && go test ./...`
