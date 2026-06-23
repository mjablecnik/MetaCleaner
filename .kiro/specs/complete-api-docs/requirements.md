# Requirements Document

## Introduction

This feature expands the existing API documentation page in the MetaCleaner frontend app to cover all 11 public API endpoints accessible via API key. The current `docsRepository.ts` documents only 6 endpoints (3 with full detail, 3 with placeholder text). This feature removes deprecated/non-existent endpoints (Metadata, Delete), adds missing endpoints (Reports, Account, Health, Job Download, Job Progress), expands all endpoint entries with full request/response detail, updates the sidebar navigation to group endpoints by domain (File Processing, Reports, Account, System), adds corresponding i18n translation keys, and implements a new `GET /api/account` backend endpoint in Go.

## Glossary

- **Docs_Repository**: The TypeScript module at `frontend/metacleaner-app/src/lib/repositories/docsRepository.ts` that exports typed data structures consumed by the documentation page components
- **Sidebar**: The left navigation panel on the `/docs` page that lists documentation sections and endpoint links grouped by category
- **Endpoint_Card**: A UI card component displaying full documentation for a single API endpoint including description, headers, parameters, cURL example, and response examples
- **i18n_Keys**: Translation key-value entries in `messages/en.json` and `messages/cs.json` consumed by the Paraglide i18n system
- **Account_Endpoint**: A new Go HTTP handler at `GET /api/account` on the backend that returns the authenticated user's account information (credits remaining, subscription plan, rate limit)
- **Backend**: The Go 1.23 HTTP server at `backend/metacleaner-server/`
- **Frontend**: The SvelteKit 5 web application at `frontend/metacleaner-app/`
- **API_Key_Auth**: Authentication mechanism where requests include an `Authorization: Bearer <api_key>` header validated by the backend auth middleware
- **EndpointData**: The TypeScript interface in Docs_Repository defining the shape of a fully documented endpoint (id, method, path, description, headers, params, cURL example, responses)
- **SidebarEndpoint**: The TypeScript interface in Docs_Repository defining sidebar navigation entries (id, method, label)
- **SidebarSection**: The TypeScript interface in Docs_Repository defining sidebar section group headers (id, icon, labelKey)

---

## Requirements

### Requirement 1: Remove Deprecated Endpoint Entries

**User Story:** As a developer reading the docs, I want only real, accessible endpoints documented, so that I do not attempt to call non-existent APIs.

#### Acceptance Criteria

1. THE Docs_Repository `getEndpoints()` function SHALL NOT include an entry with id `ep-metadata` (the `/files/{file_id}/metadata` endpoint does not exist on the backend)
2. THE Docs_Repository `getEndpoints()` function SHALL NOT include an entry with id `ep-delete` (the `DEL /files/{file_id}` endpoint is not exposed via API key authentication)
3. THE Docs_Repository `getSidebarEndpoints()` function SHALL NOT include entries for `ep-metadata` or `ep-delete`

---

### Requirement 2: Expand Existing Endpoints with Full Detail

**User Story:** As a developer integrating with the API, I want full request and response documentation for the Download endpoint, so that I can implement file downloads correctly.

#### Acceptance Criteria

1. THE Docs_Repository entry for endpoint `ep-download` (GET `/files/{file_id}/download`) SHALL include: a localized description, an `Authorization: Bearer YOUR_API_KEY` header Code_Block, a parameters table with `file_id` (string, required, path parameter), a cURL example, and response examples showing a 200 success response (binary file with `Content-Disposition: attachment` header description) and a 404 error response (JSON error body)
2. THE endpoint entry for `ep-download` SHALL have `isMinimal` set to `false` and SHALL NOT include a `placeholderKey` property
3. THE Docs_Repository entry for `ep-upload` SHALL update its path from `/files/upload` to `/api/upload` to match the actual backend route
4. THE Docs_Repository entry for `ep-clean` SHALL update its path from `/files/clean` to `/api/jobs` and its description to reflect that it creates a cleaning job from uploaded file IDs (accepting an array of `file_ids` rather than a single `file_id`)
5. THE Docs_Repository entry for `ep-status` SHALL update its path from `/jobs/{job_id}/status` to `/api/jobs/{id}` to match the actual backend route

---

### Requirement 3: Add Job Download Endpoint

**User Story:** As a developer, I want documentation for the job-level ZIP download endpoint, so that I can download all cleaned files from a job at once.

#### Acceptance Criteria

1. THE Docs_Repository SHALL include a new EndpointData entry with id `ep-job-download`, method `GET`, and path `/api/jobs/{id}/download`
2. THE `ep-job-download` entry SHALL include: a localized description explaining that it downloads all cleaned files from a completed job as a ZIP archive, an `Authorization: Bearer YOUR_API_KEY` header, a parameters table with `id` (string, required, path parameter for job ID), a cURL example showing the request with `-o cleaned.zip` output flag, and response examples showing 200 (binary ZIP file) and 404 (job not found JSON error)
3. THE `ep-job-download` entry SHALL NOT have `isMinimal` set to `true`

---

### Requirement 4: Add Job Progress WebSocket Endpoint

**User Story:** As a developer, I want documentation for the WebSocket progress endpoint, so that I can implement real-time progress tracking in my integration.

#### Acceptance Criteria

1. THE Docs_Repository SHALL include a new EndpointData entry with id `ep-job-progress`, method `GET`, and path `/api/jobs/{id}/progress`
2. THE `ep-job-progress` entry SHALL include: a localized description explaining this is a WebSocket upgrade endpoint for receiving real-time cleaning progress events, an `Authorization: Bearer YOUR_API_KEY` header (passed as query parameter `token` for WebSocket connections since browsers cannot set custom headers on WebSocket upgrade requests), a parameters table with `id` (string, required, path parameter for job ID) and `token` (string, required, query parameter for the API key), a connection example showing a JavaScript WebSocket client snippet that constructs the URL with the `token` query parameter, and at least 3 response examples showing the WebSocket message format for distinct event types — where each message is a JSON object using camelCase field names (including `type`, `fileId`, `status`, `overallProgress`, `fieldsRemoved`, `filesCompleted`, `totalFiles`)
3. THE `ep-job-progress` entry SHALL include `statusValues` listing the possible event types: `file_progress`, `file_complete`, `file_error`, `job_complete`, `job_error`, `report_ready`
4. IF the `token` query parameter is missing or contains an invalid/expired token, THEN THE endpoint SHALL return an HTTP 401 error response (JSON with `error` and `message` fields) instead of upgrading the connection to WebSocket
5. IF the `id` path parameter is missing or empty, THEN THE endpoint SHALL return an HTTP 400 error response (JSON with `error` and `message` fields) instead of upgrading the connection to WebSocket

---

### Requirement 5: Add Reports Endpoints

**User Story:** As a developer, I want documentation for the reports endpoints, so that I can retrieve and display cleaning history in my application.

#### Acceptance Criteria

1. THE Docs_Repository SHALL include a new EndpointData entry with id `ep-reports-list`, method `GET`, and path `/api/reports`
2. THE `ep-reports-list` entry SHALL include: a localized description, an `Authorization: Bearer YOUR_API_KEY` header, no required parameters (list returns all reports for the authenticated user), a cURL example, and response examples showing a 200 success response with a JSON array of report summary objects (each containing `id`, `created_at`, `file_count`, `fields_removed`, `gps_removed`, `status`)
3. THE Docs_Repository SHALL include a new EndpointData entry with id `ep-report-detail`, method `GET`, and path `/api/reports/{id}`
4. THE `ep-report-detail` entry SHALL include: a localized description, an `Authorization: Bearer YOUR_API_KEY` header, a parameters table with `id` (string, required, path parameter), a cURL example, and response examples showing a 200 success response with a full report object (containing `id`, `created_at`, `files` array with per-file details, `total_fields_removed`, `total_gps_removed`, `status`) and a 404 error response
5. THE Docs_Repository SHALL include a new EndpointData entry with id `ep-report-pdf`, method `GET`, and path `/api/reports/{id}/pdf`
6. THE `ep-report-pdf` entry SHALL include: a localized description explaining it returns a signed URL for downloading the PDF report, an `Authorization: Bearer YOUR_API_KEY` header, a parameters table with `id` (string, required, path parameter), a cURL example, and response examples showing a 200 success response with a JSON object containing `url` (the signed PDF download URL) and a 404 error response

---

### Requirement 6: Add Account Endpoint Documentation

**User Story:** As a developer, I want documentation for the account endpoint, so that I can check my remaining credits and rate limits programmatically.

#### Acceptance Criteria

1. THE Docs_Repository SHALL include a new EndpointData entry with id `ep-account`, method `GET`, and path `/api/account`
2. THE `ep-account` entry SHALL include: a localized description explaining it returns the authenticated user's account information, an `Authorization: Bearer YOUR_API_KEY` header, no request body or query parameters, a cURL example, and response examples showing a 200 success response with a JSON object containing `credits_remaining` (integer), `plan` (string, one of "free", "pro", "pro_plus"), and `rate_limit_rpm` (integer, requests per minute allowed)
3. THE `ep-account` entry SHALL include a 401 Unauthorized error response example for requests with a missing or invalid API key

---

### Requirement 7: Add Health Endpoint Documentation

**User Story:** As a developer, I want documentation for the health check endpoint, so that I can monitor API availability in my integration.

#### Acceptance Criteria

1. THE Docs_Repository SHALL include a new EndpointData entry with id `ep-health`, method `GET`, and path `/api/health`
2. THE `ep-health` entry SHALL include: a localized description explaining it returns the service health status and can be used for uptime monitoring, no authentication header required (public endpoint), no parameters, a cURL example, and a response example showing a 200 success response with a JSON object containing `status` ("ok"), `version` (string), and `timestamp` (ISO 8601 string)
3. THE `ep-health` entry SHALL note in its description that this endpoint does not require authentication

---

### Requirement 8: Update Sidebar Navigation with Grouped Endpoints

**User Story:** As a developer browsing the docs, I want endpoints grouped logically in the sidebar, so that I can quickly find the endpoint category I need.

#### Acceptance Criteria

1. THE Docs_Repository `getSidebarEndpoints()` function SHALL return entries for all 11 documented endpoints grouped into 4 logical sections in the following order: (1) File Processing — containing Upload, Create Job, Job Status, Job Progress, Job Download, File Download in that order; (2) Reports — containing List Reports, Report Detail, Report PDF in that order; (3) Account — containing Account Info; (4) System — containing Health Check
2. THE Docs_Repository `getSidebarSections()` function SHALL include a section entry for "Endpoints" with a Font Awesome icon (e.g. `fa-plug` or `fa-code`) that appears above the endpoint groups in the sidebar, rendered in the same style as other sidebar section entries (icon + localized label)
3. EACH SidebarEndpoint entry SHALL include a `group` string property whose value is one of `fileProcessing`, `reports`, `account`, or `system`, so the sidebar UI can render section group headers between endpoint categories
4. THE sidebar group headers SHALL use localized labels from i18n_Keys following the pattern `docs.sidebar.group.{groupName}`: "File Processing" / "Zpracování souborů", "Reports" / "Reporty", "Account" / "Účet", "System" / "Systém" (English / Czech)
5. THE sidebar SHALL render the group headers and their endpoint links in the order defined in criterion 1 (File Processing first, System last), with each group header visually separating its endpoints from the previous group

---

### Requirement 9: Add i18n Translation Keys

**User Story:** As a Czech-speaking developer, I want all new endpoint documentation text translated to Czech, so that I can read it in my preferred language.

#### Acceptance Criteria

1. WHEN a new endpoint entry is added to Docs_Repository, THE Frontend SHALL add corresponding i18n_Keys to both `messages/en.json` and `messages/cs.json` for: the endpoint description, each parameter description, each response label, and any section/group labels
2. THE i18n_Keys SHALL follow the existing naming convention: `docs.endpoint.{endpointName}.{property}` for endpoint-specific keys (e.g., `docs.endpoint.jobProgress.desc`, `docs.endpoint.reportDetail.param.id.desc`)
3. THE i18n_Keys for sidebar group labels SHALL follow the pattern `docs.sidebar.group.{groupName}` (e.g., `docs.sidebar.group.fileProcessing`, `docs.sidebar.group.reports`, `docs.sidebar.group.account`, `docs.sidebar.group.system`)
4. THE Czech translations SHALL be natural Czech text (not machine-translated placeholders) that accurately conveys the technical meaning of each English source string

---

### Requirement 10: Implement GET /api/account Backend Endpoint

**User Story:** As an API consumer, I want to call GET /api/account to retrieve my credits and plan info, so that my application can display usage limits.

#### Acceptance Criteria

1. THE Backend SHALL register a new route `GET /api/account` in the router that is accessible only to requests authenticated via API key (Bearer token) or JWT Bearer token, enforced by the existing auth middleware
2. WHEN a valid authenticated request is received at `GET /api/account`, THE Backend SHALL return a 200 response with a JSON body containing: `credits_remaining` (integer, the sum of the user's subscription credits and purchased credits), `plan` (string, one of: "free", "pro", or "proplus"), and `rate_limit_rpm` (integer, the per-API-key requests-per-minute limit configured for the server)
3. IF the request to `GET /api/account` has no valid authentication credentials, THEN THE Backend SHALL return a 401 response with the standard error JSON format (`{"error": "UNAUTHORIZED", "message": "...", "timestamp": "..."}`)
4. IF the database query for user credits or subscription fails, THEN THE Backend SHALL return a 500 response with error code "DATABASE_ERROR" and a message indicating the retrieval failure
5. THE `GET /api/account` endpoint SHALL be rate-limited using the same per-IP rate limiter applied to other API endpoints

---

### Requirement 11: Update Quick Start Flow

**User Story:** As a developer reading the introduction, I want the quick start steps to reflect the actual API paths, so that I can follow the guide without confusion.

#### Acceptance Criteria

1. THE Docs_Repository `getQuickStartSteps()` function SHALL update step 1 code snippet path from `/files/upload` to `/api/upload`
2. THE Docs_Repository `getQuickStartSteps()` function SHALL update step 2 code snippet path from `/files/clean` to `/api/jobs` and the response identifier from `job_id` to `job_id`
3. THE Docs_Repository `getQuickStartSteps()` function SHALL update step 3 code snippet path from `/jobs/{job_id}/status` to `/api/jobs/{id}`
4. THE Docs_Repository `getQuickStartSteps()` function SHALL update step 4 code snippet path from `/files/{file_id}/download` to `/api/files/{id}/download`
