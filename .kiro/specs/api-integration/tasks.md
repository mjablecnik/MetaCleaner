# Implementation Plan: API Integration

## Overview

Replace the mock data layer in the MetaCleaner frontend with a real HTTP + WebSocket integration against the Go backend. Implementation follows a two-layer architecture: a thin API client (`src/lib/clients/metaCleanerApi.ts`) for raw HTTP/WebSocket I/O, and an orchestration service (`src/lib/services/apiCleaningService.ts`) implementing the `CleaningService` interface with type mapping, fileName resolution, and ProcessingResults construction from accumulated WebSocket events.

## Tasks

- [x] 1. Create API client module with URL builders and endpoint methods
  - [x] 1.1 Create `src/lib/clients/metaCleanerApi.ts` with URL builders, response types, error class, and all endpoint methods
    - Implement `buildApiUrl(path)` reading from `PUBLIC_API_URL` env var
    - Implement `buildWsUrl(path)` deriving ws/wss protocol from http/https base URL
    - Define `UploadResponse`, `CreateJobResponse`, `JobStatusResponse`, `ApiErrorResponse`, `HealthResponse` types
    - Implement `ApiHttpError` class with status, errorCode, errorMessage, timestamp
    - Implement `parseErrorResponse` helper
    - Implement endpoint methods: `uploadFiles`, `createJob`, `getJobStatus`, `connectJobProgress`, `downloadFile`, `downloadJobZip`, `getReports`, `getReportDetail`, `getReportPdf`, `healthCheck`
    - _Requirements: 1.1, 1.2, 1.4, 8.1, 8.2, 8.3, 13.7_

  - [ ]* 1.2 Write property tests for URL construction and WebSocket URL derivation
    - **Property 1: API URL construction preserves base and path**
    - **Property 2: WebSocket URL protocol derivation**
    - **Validates: Requirements 1.2, 1.4, 8.1, 8.2, 8.3**

- [x] 2. Implement ApiCleaningService core orchestration
  - [x] 2.1 Create `src/lib/services/apiCleaningService.ts` with `analyzeFiles` (client-side scan aggregation) and `startCleaning` orchestration flow
    - Implement `analyzeFiles` using existing scan results without HTTP calls
    - Implement `startCleaning`: upload files → build fileNameMap from upload response → create job → open WebSocket → dispatch messages
    - Build `fileNameMap` from upload response `files[].id → files[].name` (Req 11.1)
    - Accumulate `file_complete` events in `accumulatedResults` array
    - Implement `cancel()` closing WebSocket connection
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 4.1, 4.2, 4.9, 11.1_

  - [ ]* 2.2 Write property tests for analyzeFiles aggregation and file name map completeness
    - **Property 3: analyzeFiles aggregation correctness**
    - **Property 12: File name map completeness from upload response**
    - **Validates: Requirements 2.4, 11.1**

  - [x] 2.3 Implement WebSocket message dispatcher with fileName resolution and progress extraction
    - Implement `dispatchWsMessage` handling all message types: `file_progress`, `file_complete`, `file_error`, `job_complete`, `report_ready`
    - Resolve `fileName` from `fileNameMap` for `file_progress` events (Req 11.2)
    - Extract `overallProgress`, `filesCompleted`, `totalFiles` from `file_progress` AND `file_complete` events and call `onProgress` — there is NO separate `job_progress` message type from the backend (Req 4.5)
    - Accumulate per-file results on `file_complete` for ProcessingResults construction
    - Call `buildProcessingResults` on `job_complete`
    - Handle `report_ready` by storing reportId silently (Req 4.10)
    - Ignore unknown message types without error
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.10, 11.2, 11.3, 11.6_

  - [ ]* 2.4 Write property tests for WebSocket message dispatch and ProcessingResults construction
    - **Property 6: WebSocket message dispatch correctness with fileName resolution**
    - **Property 7: ProcessingResults construction from accumulated events**
    - **Validates: Requirements 4.3, 4.4, 4.5, 4.6, 4.7, 11.2, 11.3, 11.5**

- [x] 3. Implement error mapping helpers
  - [x] 3.1 Implement error mapping functions in `apiCleaningService.ts`
    - Implement `mapApiHttpError` mapping status codes 413, 415, 429, 400, 404 to `CleaningError` codes
    - Implement `makeConnectionError` for WebSocket lifecycle errors
    - Implement `makeNetworkError` for fetch TypeError
    - Wire error handling in `startCleaning` try/catch and WebSocket onerror/onclose
    - _Requirements: 3.3, 3.4, 3.5, 3.6, 4.7, 4.8_

  - [ ]* 3.2 Write property test for HTTP error status code mapping
    - **Property 8: HTTP error status code mapping**
    - **Validates: Requirements 3.3, 3.4, 3.5**

- [x] 4. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement backend-to-frontend type mapping functions
  - [x] 5.1 Implement report summary mapping functions
    - Implement `mapSingleReport` transforming backend `ReportSummary` to frontend `Report`
    - Implement `extractDate(dateStr)` splitting ISO date strings
    - Implement `extractTime(dateStr)` extracting time portion or returning empty string
    - Implement `computeIconColor(type)` returning `'green'` for image, `'orange'` for video
    - Default `fieldsColor` to `'white'`
    - Implement `mapReportSummaries` applying `mapSingleReport` to arrays
    - _Requirements: 9.1, 9.2, 9.3, 9.7_

  - [ ]* 5.2 Write property test for report summary type mapping
    - **Property 10: Report summary type mapping correctness**
    - **Validates: Requirements 9.1, 9.2, 9.3**

  - [x] 5.3 Implement report file detail mapping functions
    - Implement `mapReportFileDetails` computing `barWidthPercent`, `iconColor`, gradients for each file
    - Implement `computeBarWidth(fileFieldsRemoved, totalFieldsRemoved)` as percentage
    - Implement `getGradientFrom(type)` and `getGradientTo(type)` with color values per file type
    - Implement `mapMetadataDetail` mapping backend MetadataDetail to frontend FileMetadataSection with `moreCount: undefined`
    - Implement `mapReportDetail` composing full ReportDetail from backend response
    - _Requirements: 9.4, 9.5, 9.6, 9.8_

  - [ ]* 5.4 Write property test for bar width percentage computation
    - **Property 11: Bar width percentage computation invariant**
    - **Validates: Requirements 9.4**

- [x] 6. Implement download and reports methods
  - [x] 6.1 Implement `downloadResults` accepting job ID and `getReports`/`getReportDetail` with type mapping
    - Implement `downloadResults(jobId)` calling `api.downloadJobZip(jobId)` returning Blob (batch ZIP by default)
    - Handle 404 → "File not found or expired", 409 → "Job is still processing"
    - Implement `getReports()` calling `api.getReports()` and mapping via `mapReportSummaries`
    - Implement `getReportDetail(reportId)` calling `api.getReportDetail()` and mapping via `mapReportDetail`
    - Handle 404 for report not found
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4, 6.5, 10.1, 10.2, 10.3, 10.4, 10.5, 13.8, 13.9_

  - [ ]* 6.2 Write unit tests for download error handling and report mapping integration
    - Test 404 and 409 status code handling in downloadResults
    - Test getReports returns correctly mapped summary and reports array
    - Test getReportDetail maps backend response to ReportDetail with computed fields
    - _Requirements: 5.3, 5.4, 6.5, 10.4, 10.5_

- [x] 7. Implement batch ZIP download endpoint (backend)
  - [x] 7.1 Add `ErrJobNotReady` and `ErrFilesExpired` error codes in `source/errors.go`
    - Add `ErrJobNotReady = "JOB_NOT_READY"` constant
    - Add `ErrFilesExpired = "FILES_EXPIRED"` constant
    - _Requirements: 13.4, 13.5, 13.6_

  - [x] 7.2 Verify `GetFileRecords` method and LocalID resolution strategy
    - The existing `GetFileRecords(ctx, jobID)` in `source/supabase.go` fetches ALL file records for a job
    - **IMPORTANT:** `LocalID` field is tagged `json:"-"` and is NOT persisted to DB — it will always be empty when fetched from DB
    - The handler MUST derive the local file ID from the stored `FileName` field (format: `f-abcd1234.ext`) by stripping the extension: `localID := strings.TrimSuffix(f.FileName, f.FileExtension)`
    - The handler filters by `status == "done"` in Go code (no DB-level filter needed)
    - No new Supabase method needed — use existing `GetFileRecords` with local derivation
    - _Requirements: 13.2_

  - [x] 7.3 Implement `HandleJobDownload` handler in `source/handlers.go`
    - Create `HandleJobDownload(cfg Config, db *SupabaseClient) http.HandlerFunc`
    - Look up job by ID using `r.PathValue("id")` (consistent with existing route convention)
    - Return 404 with `ErrJobNotFound` if not found
    - Return 409 with `ErrJobNotReady` if job status != `"completed"`
    - Fetch file records via `db.GetFileRecords(ctx, jobID)` — filter to only `status == "done"` files (skip errored)
    - Resolve cleaned file paths on disk — skip files whose cleaned output is missing
    - Return 404 with `ErrFilesExpired` only if NO cleaned files remain on disk at all
    - Stream ZIP archive directly to `http.ResponseWriter` using `archive/zip` package
    - Set `Content-Type: application/zip` and `Content-Disposition: attachment; filename="metacleaner-{jobId}.zip"`
    - Use `buildCleanedFileName` for each entry name in the ZIP
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [x] 7.4 Register `GET /api/jobs/{id}/download` route in `source/router.go`
    - Add `mux.Handle("GET /api/jobs/{id}/download", HandleJobDownload(cfg, db))` in `NewRouter`
    - Use `{id}` path parameter (consistent with existing routes like `GET /api/jobs/{id}`)
    - Place it after the existing `GET /api/jobs/{id}/progress` route
    - _Requirements: 13.1_

  - [x]* 7.5 Write unit tests for `HandleJobDownload` in `tests/handlers_download_test.go`
    - Test 404 response when job not found
    - Test 409 response when job status is not "completed"
    - Test 404 with `FILES_EXPIRED` when cleaned files are missing from disk
    - Test successful ZIP response with correct headers and file contents
    - _Requirements: 13.4, 13.5, 13.6_

- [x] 8. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Add `downloadJobZip` to frontend API client
  - [x] 9.1 Add `downloadJobZip(jobId: string): Promise<Blob>` method in `src/lib/clients/metaCleanerApi.ts`
    - Call `GET /api/jobs/{jobId}/download` and return response as Blob
    - Throw `ApiHttpError` on non-OK responses
    - _Requirements: 13.7_

  - [x] 9.2 Update `downloadResults` in `src/lib/services/apiCleaningService.ts` to call `downloadJobZip` by default
    - Change `downloadResults(jobId)` to call `api.downloadJobZip(jobId)` instead of `api.downloadFile(jobId)`
    - Keep per-file download as fallback if needed
    - _Requirements: 13.8, 13.9_

- [x] 10. Remove mock layer and wire ApiCleaningService
  - [x] 10.1 Delete `mockCleaningService.ts` and update all imports to use `apiCleaningService`
    - Delete `src/lib/services/mockCleaningService.ts`
    - Search and replace all imports of `mockCleaningService` with `apiCleaningService` from `./apiCleaningService.js`
    - Export `apiCleaningService` as the sole `CleaningService` instance consumed by the application
    - Files to update: `Step3Processing.svelte`, `Step5Success.svelte`, `reports/+page.svelte`, `report/[id]/+page.svelte`
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 10.2 Refactor `Step5Success.svelte` to pass real jobId to `downloadResults`
    - The current mock calls `downloadResults('current')` with a hardcoded placeholder string
    - Refactor to pass the real `jobId` obtained from the job creation/WebSocket flow
    - Ensure the jobId is stored in an accessible state (e.g. a store or prop) after job completion
    - _Requirements: 5.5, 11.8, 13.9_

- [x] 11. Environment configuration and README update
  - [x] 11.1 Add `PUBLIC_API_URL` to `.env.example` and update frontend README
    - Add `PUBLIC_API_URL=http://localhost:8080` to `frontend/metacleaner-app/.env.example`
    - Add API configuration section to `frontend/metacleaner-app/README.md` documenting:
      - How to set `PUBLIC_API_URL` for local development (default: `http://localhost:8080`)
      - How to set `PUBLIC_API_URL` for production (deployed backend URL)
      - That backend must have `FRONTEND_ORIGIN` set to frontend URL in production for CORS
    - _Requirements: 1.1, 1.3, 12.1, 12.5_

- [x] 12. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document (Properties 1–12)
- Unit tests validate specific examples and edge cases
- The programming language is TypeScript (SvelteKit project with Vitest + fast-check) for frontend, Go for backend
- The `downloadResults` parameter is semantically a job ID (batch ZIP download architecture, Req 13) — the service calls `downloadJobZip(jobId)` by default
- The existing `GetFileRecords(ctx, jobID)` in `supabase.go` already fetches file records by job ID — task 7.2 verifies suitability or adds a filtered wrapper
- The `HandleJobDownload` handler streams the ZIP directly to the response writer (no temp file on disk)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "7.1", "11.1"] },
    { "id": 1, "tasks": ["1.2", "2.1", "7.2"] },
    { "id": 2, "tasks": ["2.2", "2.3", "3.1", "7.3"] },
    { "id": 3, "tasks": ["2.4", "3.2", "5.1", "7.4"] },
    { "id": 4, "tasks": ["5.2", "5.3", "6.1", "7.5"] },
    { "id": 5, "tasks": ["5.4", "6.2", "9.1"] },
    { "id": 6, "tasks": ["9.2", "10.1"] },
    { "id": 7, "tasks": ["10.2"] }
  ]
}
```
