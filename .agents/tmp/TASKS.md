# Test Tasks — MetaCleaner (Unit & Integration)

## Phase 0 — Cleanup

- [x] Remove orphaned scaffold tests: `frontend/metacleaner-app/src/lib/vitest-examples/greet.spec.ts`, `greet.ts`, `Welcome.svelte.spec.ts` — verified NOT orphaned: `greet.ts` and `Welcome.svelte` live sources exist; no removal needed per TEST_SPEC.md.

## Phase 1 — High Priority (core logic without coverage)

- [x] [HIGH] Create unit tests for `backend/metacleaner-server/source/config.go` LoadConfig — validate error returns for missing SUPABASE_URL/SUPABASE_API_KEY, env var parsing (PORT, MAX_FILE_SIZE, RETENTION_PERIOD), and default fallbacks (`tests/config_test.go`)
- [x] [HIGH] Create unit tests for fileID validation in handlers — test that HandleCreateJob, HandleFileDownload, and HandleJobDownload reject invalid fileID formats (path traversal, non-hex, empty) with 400 status (`tests/handlers_fileid_validation_test.go`)
- [x] [HIGH] Create unit tests for `backend/metacleaner-server/source/router.go` corsMiddleware — test empty origin passthrough (no CORS headers), configured origin sets headers, OPTIONS returns 204 (`tests/cors_test.go`)
- [x] [HIGH] Create unit tests for `frontend/metacleaner-app/src/lib/scanner/aiDetector.ts` — test PNG/JPEG byte scanning, metadata AI signature detection, structural analysis, score aggregation, and empty/invalid input handling (`src/lib/scanner/__tests__/aiDetector.test.ts`)
- [x] [HIGH] Create unit tests for `frontend/metacleaner-app/src/lib/stores/cleaningResultsStore.svelte.ts` — test setResults, setError, setReportId, clear, and getter behavior (`src/lib/stores/__tests__/cleaningResultsStore.test.ts`)

## Phase 2 — Medium Priority (edge cases, error handling)

- [x] [MEDIUM] Create unit tests for `backend/metacleaner-server/source/well_known.go` — test HandleAssetLinks and HandleAppleAppSiteAssociation with configured and empty config values (`tests/well_known_test.go`)
- [x] [MEDIUM] Create unit tests for `backend/metacleaner-server/source/pdf.go` GenerateReportPDF — test valid output (PDF magic bytes), empty file list, multi-file report (`tests/pdf_test.go`)
- [x] [MEDIUM] Create unit tests for `backend/metacleaner-server/source/router.go` ipRateLimiter — test same IP returns same limiter, different IPs isolated, cleanup removes stale entries (`tests/rate_limiter_test.go`)
- [x] [MEDIUM] Create dedicated unit tests for `frontend/metacleaner-app/src/lib/scanner/parsers/imageParser.ts` — test format detection, GPS extraction, corrupt file handling, AI integration (`src/lib/scanner/parsers/__tests__/imageParser.test.ts`)
- [x] [MEDIUM] Add edge case tests for CLI `terminal/metacleaner-cli/src/commands.ts` executeClean — test format validation rejects unsupported extensions, no-extension files, mixed valid/invalid batches (`tests/commands.test.ts` — extend existing)
- [x] [MEDIUM] Create unit tests for `frontend/metacleaner-app/src/lib/locale.svelte.ts` — test initLocale reads localStorage, switchLocale persists, default fallback (`src/lib/__tests__/locale.test.ts`)

## Phase 3 — Low Priority (utilities, simple logic)

- [x] [LOW] Create unit tests for `backend/metacleaner-server/source/config.go` formatBytes and `handlers.go` formatBytesHuman — test size formatting across ranges (0, bytes, KB, MB, GB) (`source/format_helpers_test.go` — placed in source package to access unexported functions)
