# Implementation Plan: Complete API Documentation

## Overview

This implementation expands the API documentation page to cover all 11 public endpoints, updates the sidebar navigation with grouped sections, adds i18n keys for English and Czech, implements a new `GET /api/account` backend endpoint in Go, and updates the Quick Start flow paths. The approach is incremental: backend first, then frontend data layer, then i18n, then tests.

## Tasks

- [x] 1. Implement GET /api/account backend endpoint
  - [x] 1.1 Create account handler in Go
    - Create `source/account_handlers.go` with `HandleAccount(cfg Config, db *SupabaseClient) http.HandlerFunc`
    - Use `UserIDFromContext` for authentication check
    - Call `db.GetCreditBalance` for credits and `db.GetSubscriptionByUserID` for plan
    - Return JSON with `credits_remaining`, `plan`, and `rate_limit_rpm` fields
    - Return 401 if no valid auth, 500 if DB query fails
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 1.2 Register account route in router.go
    - Add `mux.Handle("GET /api/account", rateLimited(HandleAccount(cfg, db)))` in `router.go`
    - Place it inside the auth middleware chain (before the `cors` wrapping)
    - _Requirements: 10.1, 10.5_

  - [x]* 1.3 Write unit tests for HandleAccount
    - Create `tests/account_handlers_test.go`
    - Test 401 response when no auth header
    - Test 200 response with correct JSON shape for user with active subscription
    - Test 200 response returns plan "free" when no active subscription
    - Test 500 response when DB returns error
    - _Requirements: 10.2, 10.3, 10.4_

  - [ ]* 1.4 Write property test for account endpoint computation
    - **Property 2: Account endpoint returns correct computed state**
    - Create `tests/account_property_test.go` using `pgregory.net/rapid`
    - Generate random (subscriptionCredits, purchasedCredits, planID, rateLimitRPM) tuples
    - Assert `credits_remaining == subCredits + purchasedCredits`, `plan` matches active subscription or "free", `rate_limit_rpm == cfg.RateLimitRPM`
    - **Validates: Requirements 10.2**

- [x] 2. Checkpoint - Backend endpoint complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Update docsRepository.ts — remove deprecated, update existing, add new endpoints
  - [x] 3.1 Remove deprecated endpoints and update existing paths
    - Remove `ep-metadata` and `ep-delete` entries from `getEndpoints()`
    - Update `ep-upload` path from `/files/upload` to `/api/upload`
    - Update `ep-clean` path from `/files/clean` to `/api/jobs`, update description and params to accept `file_ids` array
    - Update `ep-status` path from `/jobs/{job_id}/status` to `/api/jobs/{id}`
    - Expand `ep-download` to full detail: set path to `/api/files/{id}/download`, remove `isMinimal` and `placeholderKey`, add params, response examples (200 binary, 404 error)
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 3.2 Add Job Download endpoint entry
    - Add `ep-job-download` with method GET, path `/api/jobs/{id}/download`
    - Include description, auth header, `id` path parameter, cURL example with `-o cleaned.zip`, response examples (200 binary ZIP, 404 error)
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 3.3 Add Job Progress WebSocket endpoint entry
    - Add `ep-job-progress` with method GET, path `/api/jobs/{id}/progress`
    - Include description, auth header note about `token` query parameter, parameters for `id` and `token`
    - Include JavaScript WebSocket connection example
    - Include 3+ response examples showing message format with camelCase fields (type, fileId, status, overallProgress, fieldsRemoved, filesCompleted, totalFiles)
    - Include `statusValues` with all 6 event types: file_progress, file_complete, file_error, job_complete, job_error, report_ready
    - Include 401 and 400 error response examples
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 3.4 Add Reports endpoints (list, detail, PDF)
    - Add `ep-reports-list` (GET `/api/reports`): description, auth header, no required params, response with array of report summaries
    - Add `ep-report-detail` (GET `/api/reports/{id}`): description, auth header, `id` param, response with full report object, 404 error
    - Add `ep-report-pdf` (GET `/api/reports/{id}/pdf`): description, auth header, `id` param, response with `url` field, 404 error
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 3.5 Add Account and Health endpoint entries
    - Add `ep-account` (GET `/api/account`): description, auth header, no params, response with `credits_remaining`, `plan`, `rate_limit_rpm`, include 401 error response
    - Add `ep-health` (GET `/api/health`): description, no auth required (noted in description), no params, response with `status`, `version`, `timestamp`
    - _Requirements: 6.1, 6.2, 6.3, 7.1, 7.2, 7.3_

- [x] 4. Update sidebar navigation with grouped endpoints
  - [x] 4.1 Add `group` property to SidebarEndpoint interface and update sidebar data
    - Extend `SidebarEndpoint` interface with `group: 'fileProcessing' | 'reports' | 'account' | 'system'`
    - Update `getSidebarEndpoints()` to return 11 entries with `group` values, ordered: File Processing (Upload, Create Job, Job Status, Job Progress, Job Download, File Download), Reports (List Reports, Report Detail, Report PDF), Account (Account Info), System (Health Check)
    - Remove `ep-metadata` and `ep-delete` from sidebar
    - _Requirements: 8.1, 8.3, 8.5_

  - [x] 4.2 Add Endpoints section to getSidebarSections
    - Add `{ id: 'sec-endpoints', icon: 'fa-plug', labelKey: 'docs.sidebar.endpoints' }` to the `getSidebarSections()` array
    - _Requirements: 8.2_

- [x] 5. Update Quick Start flow paths
  - [x] 5.1 Update getQuickStartSteps() with correct API paths
    - Step 1: `/files/upload` → `/api/upload`
    - Step 2: `/files/clean` → `/api/jobs`
    - Step 3: `/jobs/{job_id}/status` → `/api/jobs/{id}`
    - Step 4: `/files/{file_id}/download` → `/api/files/{id}/download`
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 6. Add i18n translation keys
  - [x] 6.1 Add English i18n keys to messages/en.json
    - Add all endpoint description keys: `docs.endpoint.jobDownload.desc`, `docs.endpoint.jobProgress.desc`, `docs.endpoint.reportsList.desc`, `docs.endpoint.reportDetail.desc`, `docs.endpoint.reportPdf.desc`, `docs.endpoint.account.desc`, `docs.endpoint.health.desc`
    - Add parameter description keys for each endpoint's params
    - Add response label keys for each endpoint's responses
    - Add sidebar group keys: `docs.sidebar.group.fileProcessing`, `docs.sidebar.group.reports`, `docs.sidebar.group.account`, `docs.sidebar.group.system`
    - Add `docs.sidebar.endpoints` key
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 6.2 Add Czech i18n keys to messages/cs.json
    - Add all corresponding Czech translations for keys added in 6.1
    - Group labels: "Zpracování souborů", "Reporty", "Účet", "Systém"
    - Use natural Czech text for all endpoint descriptions, parameter descriptions, and response labels
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 7. Checkpoint - Frontend data and i18n complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Update and write frontend tests
  - [x] 8.1 Update docsRepository.test.ts for new structure
    - Update `getEndpoints()` tests to assert 11 entries
    - Verify `ep-metadata` and `ep-delete` are absent
    - Verify updated paths (`/api/upload`, `/api/jobs`, `/api/jobs/{id}`)
    - Verify `ep-download` is no longer minimal
    - Verify `ep-job-progress` includes `statusValues` with 6 event types
    - Update `getSidebarEndpoints()` test to assert 11 entries with valid `group` values
    - Verify sidebar ordering: fileProcessing → reports → account → system
    - Verify `getSidebarSections()` includes endpoints section
    - Verify `getQuickStartSteps()` uses updated API paths
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.3, 2.4, 2.5, 3.1, 4.1, 4.3, 5.1, 5.3, 5.5, 6.1, 7.1, 8.1, 8.2, 8.3, 11.1, 11.2, 11.3, 11.4_

  - [ ]* 8.2 Write property test for i18n key completeness
    - **Property 1: i18n key completeness**
    - Create `src/lib/repositories/__tests__/docsRepository.property.test.ts` using Vitest + fast-check
    - For all i18n keys referenced in getEndpoints(), getSidebarEndpoints(), and getSidebarSections(), verify presence in both en.json and cs.json
    - **Validates: Requirements 9.1**

- [x] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (i18n completeness, account computation)
- Unit tests validate specific examples and edge cases
- The backend uses Go with `pgregory.net/rapid` for property tests
- The frontend uses TypeScript with Vitest + fast-check for property tests
- The existing `docsRepository.test.ts` already tests i18n key resolution via Paraglide messages import — the updated test should follow the same pattern

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4"] },
    { "id": 2, "tasks": ["3.1", "5.1"] },
    { "id": 3, "tasks": ["3.2", "3.3", "3.4", "3.5", "4.2"] },
    { "id": 4, "tasks": ["4.1", "6.1"] },
    { "id": 5, "tasks": ["6.2"] },
    { "id": 6, "tasks": ["8.1", "8.2"] }
  ]
}
```
