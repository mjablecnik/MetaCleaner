# Test Report
Created: 2026-06-30 21:53:56 UTC
Updated: 2026-06-30 21:53:56 UTC

## Summary
- Total tests: 391
- Passing: 391
- Failing: 0
- Coverage: 57.8% of statements (across `./...`, measured from the `tests` package)

## Test Results
| Test File | Tests | Pass | Fail | Status |
|---|---|---|---|---|
| source/email_change_test.go | 15 | 15 | 0 | ✅ Pass |
| source/format_helpers_test.go | 7 | 7 | 0 | ✅ Pass |
| source/supabase_auth_url_test.go | 17 | 17 | 0 | ✅ Pass |
| tests/account_cleanup_test.go | 5 | 5 | 0 | ✅ Pass |
| tests/account_handlers_test.go | 5 | 5 | 0 | ✅ Pass |
| tests/account_property_test.go | 1 | 1 | 0 | ✅ Pass |
| tests/apikey_handlers_test.go | 19 | 19 | 0 | ✅ Pass |
| tests/apikey_rate_limiter_test.go | 7 | 7 | 0 | ✅ Pass |
| tests/auth_handlers_test.go | 57 | 57 | 0 | ✅ Pass |
| tests/auth_middleware_test.go | 15 | 15 | 0 | ✅ Pass |
| tests/auth_property_credits_test.go | 4 | 4 | 0 | ✅ Pass |
| tests/auth_property_error_format_test.go | 8 | 8 | 0 | ✅ Pass |
| tests/auth_property_input_validation_test.go | 6 | 6 | 0 | ✅ Pass |
| tests/auth_property_middleware_test.go | 4 | 4 | 0 | ✅ Pass |
| tests/auth_rate_limiter_test.go | 14 | 14 | 0 | ✅ Pass |
| tests/billing_handlers_test.go | 21 | 21 | 0 | ✅ Pass |
| tests/billing_webhook_test.go | 8 | 8 | 0 | ✅ Pass |
| tests/cleanup_test.go | 5 | 5 | 0 | ✅ Pass |
| tests/config_test.go | 12 | 12 | 0 | ✅ Pass |
| tests/cors_test.go | 6 | 6 | 0 | ✅ Pass |
| tests/errors_test.go | 1 | 1 | 0 | ✅ Pass |
| tests/handlers_download_test.go | 7 | 7 | 0 | ✅ Pass |
| tests/handlers_fileid_validation_test.go | 4 | 4 | 0 | ✅ Pass |
| tests/handlers_jobs_test.go | 7 | 7 | 0 | ✅ Pass |
| tests/handlers_reports_test.go | 9 | 9 | 0 | ✅ Pass |
| tests/handlers_test.go | 9 | 9 | 0 | ✅ Pass |
| tests/health_handlers_test.go | 4 | 4 | 0 | ✅ Pass |
| tests/job_worker_test.go | 7 | 7 | 0 | ✅ Pass |
| tests/logger_test.go | 5 | 5 | 0 | ✅ Pass |
| tests/models_test.go | 12 | 12 | 0 | ✅ Pass |
| tests/pdf_test.go | 7 | 7 | 0 | ✅ Pass |
| tests/pipeline_integration_test.go | 5 | 5 | 0 | ✅ Pass |
| tests/pipeline_test.go | 3 | 3 | 0 | ✅ Pass |
| tests/rate_limiter_test.go | 4 | 4 | 0 | ✅ Pass |
| tests/request_id_test.go | 6 | 6 | 0 | ✅ Pass |
| tests/security_test.go | 5 | 5 | 0 | ✅ Pass |
| tests/supabase_apikeys_test.go | 12 | 12 | 0 | ✅ Pass |
| tests/supabase_billing_test.go | 19 | 19 | 0 | ✅ Pass |
| tests/supabase_test.go | 18 | 18 | 0 | ✅ Pass |
| tests/websocket_test.go | 5 | 5 | 0 | ✅ Pass |
| tests/well_known_test.go | 6 | 6 | 0 | ✅ Pass |

> Counts reflect top-level `Test*` functions (391 total). Many of these run additional table-driven and
> property-based (`pgregory.net/rapid`) subtests, so the effective assertion count is substantially higher.

## Failures (if any)
- None. All 391 tests pass.

## Uncovered (no tests)
- `source/main.go` — process entrypoint (flag parsing / server bootstrap); 0% statement coverage, conventionally not unit-tested.
- `cmd` package — reports `[no test files]` (thin binary wrapper).

## Notes
- Full suite run with `go test ./... -count=1` (cache disabled). Result: `ok metacleaner-server/source` and `ok metacleaner-server/tests`; `cmd` has no test files.
- Coverage measured with `-coverpkg=./...`: 57.8% of all module statements are exercised by the `tests` package. The `source` package's own in-package tests report 4.1% locally because most production code is covered cross-package from `tests/` rather than in-package.
- The `tests/` package run takes ~21s (integration + property tests); allow extra time on slower machines.
- First run downloads module dependencies (gorilla/websocket, stripe-go/v82, rapid, godotenv, gopdf, go-qrcode, golang.org/x/time, gofpdi, pkg/errors). Ensure network access or a warm module cache for a clean offline run.
