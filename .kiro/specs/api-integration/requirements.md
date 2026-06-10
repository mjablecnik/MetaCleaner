# Requirements Document

## Introduction

Connect the MetaCleaner frontend (SvelteKit 5) to the MetaCleaner backend (Go) by implementing a real HTTP + WebSocket API client that replaces the existing mock data layer. The new implementation fulfills the existing `CleaningService` interface contract using the backend REST and WebSocket endpoints configured via the `PUBLIC_API_URL` environment variable.

## Glossary

- **Frontend**: The SvelteKit 5 web application located at `frontend/metacleaner-app/`
- **Backend**: The Go HTTP server located at `backend/metacleaner-server/` exposing REST and WebSocket endpoints
- **ApiCleaningService**: The new implementation of the `CleaningService` interface that communicates with the Backend over HTTP and WebSocket
- **CleaningService**: The TypeScript interface defining the contract for file analysis, cleaning, download, and report retrieval operations
- **PUBLIC_API_URL**: The environment variable holding the base URL of the Backend (e.g., `http://localhost:8080`)
- **WebSocket_Connection**: A WebSocket connection to the Backend endpoint `GET /api/jobs/{id}/progress` used for real-time cleaning progress
- **Mock_Layer**: The set of mock files (`mockCleaningService.ts` and related mock data helpers) that simulate backend behavior with fake data
- **ApiHttpError**: A custom error class thrown by the API_Client when the Backend returns a non-OK HTTP response, containing status code, error code, message, and timestamp
- **API_Client**: The thin HTTP/WebSocket client module (`src/lib/clients/metaCleanerApi.ts`) that handles raw network I/O, URL construction, and response parsing
- **Batch_ZIP_Download**: The `GET /api/jobs/{jobId}/download` endpoint that returns a ZIP archive containing all cleaned files from a completed job

## Requirements

### Requirement 1: API Base URL Configuration

**User Story:** As a developer, I want the backend API URL to be configurable per environment, so that the frontend connects to the correct server in development and production.

#### Acceptance Criteria

1. THE Frontend SHALL read the backend base URL from the `PUBLIC_API_URL` environment variable at build time
2. WHEN `PUBLIC_API_URL` is set to `http://localhost:8080`, THE Frontend SHALL use that value as the base URL for all Backend HTTP requests
3. THE Frontend SHALL include a `.env.example` file containing the `PUBLIC_API_URL` key with a default value of `http://localhost:8080`
4. THE Frontend SHALL construct all API request URLs by prepending the `PUBLIC_API_URL` value to the endpoint path

### Requirement 2: Real CleaningService Implementation

**User Story:** As a developer, I want a real implementation of the CleaningService interface that calls the backend API, so that the app uses live data instead of mocked responses.

#### Acceptance Criteria

1. THE ApiCleaningService SHALL implement the full `CleaningService` interface: `analyzeFiles`, `startCleaning`, `downloadResults`, `getReports`, and `getReportDetail`
2. THE ApiCleaningService SHALL reside in the file `src/lib/services/apiCleaningService.ts`
3. THE ApiCleaningService SHALL be the sole export consumed by the application where `CleaningService` is used
4. WHEN `analyzeFiles` is called, THE ApiCleaningService SHALL perform client-side metadata scanning using the existing scanner without making HTTP requests to the Backend
5. WHEN `startCleaning` is called, THE ApiCleaningService SHALL upload files via `POST /api/upload`, create a job via `POST /api/jobs`, and open a WebSocket_Connection to stream progress events
6. WHEN `downloadResults` is called with a job ID, THE ApiCleaningService SHALL issue a `GET /api/files/{id}/download` request and return the response as a Blob
7. WHEN `getReports` is called, THE ApiCleaningService SHALL issue a `GET /api/reports` request and return the summary and reports list
8. WHEN `getReportDetail` is called with a report ID, THE ApiCleaningService SHALL issue a `GET /api/reports/{id}` request and return the full report detail

### Requirement 3: File Upload Flow

**User Story:** As a user, I want my files uploaded to the server for cleaning, so that the backend can process them with ExifTool and FFmpeg.

#### Acceptance Criteria

1. WHEN `startCleaning` is invoked, THE ApiCleaningService SHALL send all queued files as `multipart/form-data` to `POST /api/upload` with the field name `files`
2. WHEN the upload response is received, THE ApiCleaningService SHALL extract the returned file IDs from the response body
3. IF the upload returns HTTP status 413, THEN THE ApiCleaningService SHALL invoke the `onError` callback with error code `FILE_TOO_LARGE`
4. IF the upload returns HTTP status 415, THEN THE ApiCleaningService SHALL invoke the `onError` callback with error code `UNSUPPORTED_FORMAT`
5. IF the upload returns HTTP status 429, THEN THE ApiCleaningService SHALL invoke the `onError` callback with error code `RATE_LIMIT_EXCEEDED`
6. IF the upload fails due to a network error, THEN THE ApiCleaningService SHALL invoke the `onError` callback with a descriptive error code and message

### Requirement 4: Job Creation and WebSocket Progress

**User Story:** As a user, I want real-time progress updates during cleaning, so that I can see which file is being processed and the estimated time remaining.

#### Acceptance Criteria

1. WHEN file IDs are obtained from upload, THE ApiCleaningService SHALL create a cleaning job by sending `POST /api/jobs` with the file IDs array
2. WHEN a job is created successfully, THE ApiCleaningService SHALL open a WebSocket_Connection to `ws://{host}/api/jobs/{jobId}/progress`
3. WHEN a `file_progress` message is received, THE ApiCleaningService SHALL invoke the `onFileStart` callback with the file ID and file name, AND SHALL invoke the `onProgress` callback with the `overallProgress`, `filesCompleted`, `totalFiles`, `fieldsRemoved`, and `timeRemainingSeconds` fields embedded in the same message
4. WHEN a `file_complete` message is received, THE ApiCleaningService SHALL invoke the `onFileComplete` callback with the file ID, fields removed count, and GPS removed flag, AND SHALL invoke the `onProgress` callback with the progress fields embedded in the same message
5. THE Backend does NOT emit a separate `job_progress` message type — progress data (`overallProgress`, `filesCompleted`, `totalFiles`) is embedded within each `file_progress` and `file_complete` event. THE ApiCleaningService SHALL extract progress data from these events.
6. WHEN a `job_complete` message is received, THE ApiCleaningService SHALL map the completion data to a `ProcessingResults` object and invoke the `onComplete` callback
7. WHEN a `file_error` message is received, THE ApiCleaningService SHALL invoke the `onError` callback with the error code and message from the event
8. IF the WebSocket_Connection closes unexpectedly before a `job_complete` message, THEN THE ApiCleaningService SHALL invoke the `onError` callback indicating a connection failure
9. WHEN `cancel()` is called on the returned `CleaningJob`, THE ApiCleaningService SHALL close the WebSocket_Connection
10. WHEN a `report_ready` message is received, THE ApiCleaningService MAY store the `reportId` for later use but SHALL NOT invoke any error callback

### Requirement 5: File Download

**User Story:** As a user, I want to download my cleaned files after processing, so that I can use the metadata-free versions.

#### Acceptance Criteria

1. WHEN `downloadResults` is called with a job ID, THE ApiCleaningService SHALL send a `GET` request to `{PUBLIC_API_URL}/api/jobs/{jobId}/download` to obtain the batch ZIP archive
2. THE ApiCleaningService SHALL return the response body as a `Blob` object
3. IF the download returns HTTP status 404, THEN THE ApiCleaningService SHALL throw an error indicating the file was not found or expired
4. IF the download returns HTTP status 409, THEN THE ApiCleaningService SHALL throw an error indicating the job is still processing
5. THE Frontend SHALL pass the real `jobId` (obtained from the job creation response or WebSocket events) to `downloadResults` — hardcoded placeholder strings are not permitted

### Requirement 6: Report Retrieval

**User Story:** As a user, I want to view my cleaning history and report details, so that I can review past operations and share evidence of metadata removal.

#### Acceptance Criteria

1. WHEN `getReports` is called, THE ApiCleaningService SHALL send a `GET` request to `{PUBLIC_API_URL}/api/reports`
2. THE ApiCleaningService SHALL map the response JSON to the `ReportSummaryStats` and `Report[]` types defined in `src/lib/types/report.ts`
3. WHEN `getReportDetail` is called, THE ApiCleaningService SHALL send a `GET` request to `{PUBLIC_API_URL}/api/reports/{id}`
4. THE ApiCleaningService SHALL map the response JSON to the `ReportDetail` type defined in `src/lib/types/report.ts`
5. IF a report request returns HTTP status 404, THEN THE ApiCleaningService SHALL throw an error indicating the report was not found

### Requirement 7: Mock Layer Removal

**User Story:** As a developer, I want all mock implementations removed, so that the codebase has a single source of truth and no dead code paths.

#### Acceptance Criteria

1. THE Frontend SHALL remove the file `src/lib/services/mockCleaningService.ts`
2. THE Frontend SHALL remove all import references to `mockCleaningService` across the codebase
3. THE Frontend SHALL replace all usages of the mock service with the ApiCleaningService implementation
4. WHEN the application starts, THE Frontend SHALL use only the ApiCleaningService for all `CleaningService` operations

### Requirement 8: WebSocket URL Construction

**User Story:** As a developer, I want WebSocket URLs derived correctly from the API base URL, so that the connection works in both HTTP and HTTPS environments.

#### Acceptance Criteria

1. WHEN `PUBLIC_API_URL` starts with `https://`, THE ApiCleaningService SHALL construct WebSocket URLs using the `wss://` protocol
2. WHEN `PUBLIC_API_URL` starts with `http://`, THE ApiCleaningService SHALL construct WebSocket URLs using the `ws://` protocol
3. THE ApiCleaningService SHALL derive the WebSocket host from the `PUBLIC_API_URL` by stripping the HTTP protocol prefix

### Requirement 9: Backend-to-Frontend Type Mapping

**User Story:** As a developer, I want the service layer to transform backend response shapes into the frontend type contracts, so that UI components receive the exact fields they expect without requiring backend changes.

#### Acceptance Criteria

1. WHEN the Backend returns a `ReportSummary` without a separate `time` field, THE ApiCleaningService SHALL derive the `time` value from the `date` field if it contains time information, or default to an empty string
2. WHEN the Backend returns a `ReportSummary` without an `iconColor` field, THE ApiCleaningService SHALL compute `iconColor` as `green` for type `image` and `orange` for type `video`
3. WHEN the Backend returns a `ReportSummary` without a `fieldsColor` field, THE ApiCleaningService SHALL default `fieldsColor` to `white`
4. WHEN the Backend returns a `ReportFileDetail` without `barWidthPercent`, THE ApiCleaningService SHALL compute `barWidthPercent` as the percentage of the file's `fieldsRemoved` relative to the total `fieldsRemoved` across all files in the report
5. WHEN the Backend returns a `ReportFileDetail` without `iconColor`, THE ApiCleaningService SHALL assign `iconColor` as `green` for type `image` and `orange` for type `video`
6. WHEN the Backend returns a `ReportFileDetail` without `barGradientFrom` and `barGradientTo`, THE ApiCleaningService SHALL assign gradient colors based on file type: `image` types use green gradient values and `video` types use orange gradient values
7. WHEN the Backend returns a `ReportsSummaryStats`, THE ApiCleaningService SHALL pass the fields directly to the frontend `ReportSummaryStats` type without transformation
8. WHEN the Backend returns a `MetadataDetail` with `MetadataField` entries containing `label` and `value`, THE ApiCleaningService SHALL map those directly to the frontend `MetadataField` type, defaulting `moreCount` to undefined

### Requirement 10: Per-File Download Architecture

**User Story:** As a developer, I want the download flow to align with the backend's per-file download endpoint, so that cleaned files can be retrieved individually by file ID.

#### Acceptance Criteria

1. THE ApiCleaningService SHALL support downloading individual cleaned files via `GET /api/files/{fileId}/download`
2. WHEN `downloadResults` is called, THE ApiCleaningService SHALL accept a file ID parameter and download the corresponding single file as a Blob
3. THE ApiCleaningService SHALL handle the backend `Content-Disposition: attachment` header and appropriate `Content-Type` in the download response
4. IF the download returns HTTP status 404, THEN THE ApiCleaningService SHALL throw an error indicating the file was not found or expired
5. IF the download returns HTTP status 409, THEN THE ApiCleaningService SHALL throw an error indicating the file is still processing

### Requirement 11: WebSocket Message Field Mapping

**User Story:** As a developer, I want the service layer to resolve WebSocket message field discrepancies, so that frontend callbacks receive all required parameters regardless of backend payload shape.

#### Acceptance Criteria

1. THE ApiCleaningService SHALL maintain a local mapping of file IDs to file names from the upload response to resolve file names during WebSocket progress events
2. WHEN a `file_progress` WebSocket message is received containing only `fileId`, THE ApiCleaningService SHALL resolve the `fileName` from the local file ID mapping and invoke `onFileStart` with both `fileId` and `fileName`
3. WHEN a `job_complete` WebSocket message is received without a `fileResults` array, THE ApiCleaningService SHALL construct the `ProcessingResults.fileResults` from accumulated per-file progress events received during the job
4. IF accumulated per-file events are insufficient to construct `fileResults`, THEN THE ApiCleaningService SHALL poll `GET /api/jobs/{jobId}` after completion to obtain final per-file data
5. WHEN constructing `ProcessingResults.beforeBreakdown`, THE ApiCleaningService SHALL derive category counts from accumulated file metadata or from the job status response
6. WHEN a `file_progress` or `file_complete` message contains `overallProgress`, `filesCompleted`, and `totalFiles` fields, THE ApiCleaningService SHALL extract those fields and invoke the `onProgress` callback — there is NO separate `job_progress` message type from the backend
7. WHEN a `report_ready` message is received (sent by backend after job completion), THE ApiCleaningService SHALL store the `reportId` from the message for potential later use and SHALL NOT treat it as an error
8. THE ApiCleaningService SHALL store the `jobId` (from job creation response) in a variable accessible to the `downloadResults` call after processing completes — components like Step5Success MUST pass this real jobId, not a hardcoded placeholder string

### Requirement 12: Environment and CORS Configuration

**User Story:** As a developer, I want clear environment configuration for connecting frontend to backend, so that local development and production deployments work without manual URL hunting.

#### Acceptance Criteria

1. THE Frontend SHALL include `PUBLIC_API_URL=http://localhost:8080` in the `.env.example` file for local development
2. THE Backend SHALL use the `FRONTEND_ORIGIN` environment variable to control CORS allowed origins
3. WHILE `FRONTEND_ORIGIN` is empty or unset, THE Backend SHALL allow requests from all origins for development purposes
4. WHEN deploying to production, THE Backend SHALL require `FRONTEND_ORIGIN` to be set to the frontend production URL
5. THE Frontend README SHALL document how to configure the `PUBLIC_API_URL` environment variable for connecting to the Backend


### Requirement 13: Batch ZIP Download Endpoint

**User Story:** As a user, I want to download all my cleaned files at once as a ZIP archive, so that I don't have to download each file individually.

#### Acceptance Criteria

1. THE Backend SHALL expose a new endpoint `GET /api/jobs/{id}/download` (using path parameter `{id}` consistent with existing route conventions) that returns a ZIP archive containing all successfully cleaned files from the specified job
2. WHEN the job is completed, THE Backend SHALL create a ZIP archive containing only files with status `"done"` — files that errored during processing SHALL be skipped silently
3. THE Backend SHALL respond with `Content-Type: application/zip` and `Content-Disposition: attachment; filename="metacleaner-{jobId}.zip"` headers
4. IF the job is not found, THEN THE Backend SHALL return HTTP status 404 with error code `JOB_NOT_FOUND`
5. IF the job is still processing (status != "completed"), THEN THE Backend SHALL return HTTP status 409 with error code `JOB_NOT_READY` and message "Job is still processing"
6. IF all cleaned files have expired (deleted by cleanup scheduler) and no cleaned files remain on disk, THEN THE Backend SHALL return HTTP status 404 with error code `FILES_EXPIRED` and message "Cleaned files have expired"
7. THE Frontend API_Client SHALL expose a `downloadJobZip(jobId: string): Promise<Blob>` method calling `GET /api/jobs/{jobId}/download`
8. THE ApiCleaningService `downloadResults` method SHALL use the batch ZIP endpoint by default (pass jobId), falling back to per-file download if needed
9. THE Frontend SHALL trigger the ZIP download using the jobId obtained from the job creation response or from accumulated WebSocket events
