# Implementation Plan: MetaCleaner Backend

## Overview

A Go HTTP server that strips metadata from uploaded media files using ExifTool and FFmpeg subprocesses, provides real-time WebSocket progress updates, persists job/report data in Supabase, generates PDF reports, and manages temporary file storage with automatic cleanup. The implementation follows a flat file structure in `backend/` with Go 1.22+ `net/http` routing.

## Tasks

- [x] 1. Initialize project structure and configuration
  - [x] 1.1 Initialize Go module and install dependencies
    - Run `go mod init` in `backend/`
    - Add dependencies: `gorilla/websocket`, `signintech/gopdf`, `godotenv`, `flyingmutant/rapid` (for property tests)
    - Create `.env.example` with all required environment variables (PORT, FRONTEND_ORIGIN, MAX_FILE_SIZE, RETENTION_PERIOD, TEMP_STORAGE_PATH, SUPABASE_URL, SUPABASE_API_KEY, RATE_LIMIT_RPM)
    - Create `.dockerignore` excluding `.git/`, `.env`, `tests/`, `*.md`
    - _Requirements: 8.2, 8.5_

  - [x] 1.2 Implement configuration loading (`config.go`)
    - Define `Config` struct with typed fields: Port (int), FrontendOrigin (string), MaxFileSize (int64), RetentionPeriod (time.Duration), TempStoragePath (string), SupabaseURL (string), SupabaseAPIKey (string), RateLimitRPM (int)
    - Load values from environment variables using `godotenv`
    - Validate required values are present, apply defaults (Port=8080, MaxFileSize=500MB, RetentionPeriod=1h, TempStoragePath=/tmp/metacleaner, RateLimitRPM=10)
    - Exit with non-zero code if critical env vars missing
    - _Requirements: 8.2_

  - [x] 1.3 Implement error types and response helpers (`errors.go`)
    - Define `ErrorResponse` struct with Error, Message, Timestamp fields
    - Create `NewErrorResponse(code, message string) ErrorResponse` helper that sets timestamp to RFC 3339 format
    - Create `WriteError(w http.ResponseWriter, status int, code, message string)` helper that writes JSON error responses
    - Define error code constants: FILE_TOO_LARGE, UNSUPPORTED_FORMAT, INSUFFICIENT_STORAGE, FILE_NOT_FOUND, FILE_NOT_READY, JOB_NOT_FOUND, REPORT_NOT_FOUND, INVALID_REQUEST, DATABASE_ERROR, RATE_LIMIT_EXCEEDED
    - _Requirements: 6.2_

  - [x]* 1.4 Write property test for error response format consistency
    - **Property 8: Error response format consistency**
    - **Validates: Requirements 6.2**

- [x] 2. Implement data models
  - [x] 2.1 Create data models and DTOs (`models.go`)
    - Define all Go structs: Job, FileRecord, MetadataDetail, MetadataField, CleaningResult, ProgressEvent, ReportSummary, ReportDetail, ChartDataPoint, ReportFileDetail
    - Implement `ValidateFileSize(size int64, maxSize int64) bool` function
    - Implement `ValidateFileFormat(extension string) bool` with case-insensitive matching against supported formats list
    - Implement `GetFileType(extension string) string` returning "image" or "video"
    - Implement `SelectTool(extension string) string` returning "exiftool" or "ffmpeg" based on file type
    - Implement `CalculateJobProgress(completed, total int) int` returning floor percentage
    - Implement `IsFileExpired(createdAt time.Time, retention time.Duration) bool`
    - Implement `CalculateReportSummary(reports []ReportSummary) ReportsSummaryStats`
    - Define supported format constants: image formats (JPEG, PNG, HEIC, HEIF, AVIF, TIFF, DNG, WebP, GIF), video formats (MP4, MOV, AVI, MKV, WebM, WMV, FLV, 3GP, MPEG, OGV, MTS)
    - _Requirements: 1.1, 1.2, 2.2, 2.3, 2.7, 3.5, 4.4, 5.4_

  - [x]* 2.2 Write property test for file size validation
    - **Property 1: File size validation**
    - **Validates: Requirements 1.1, 1.3**

  - [x]* 2.3 Write property test for file format validation
    - **Property 2: File format validation**
    - **Validates: Requirements 1.2, 1.4**

  - [x]* 2.4 Write property test for tool selection by file type
    - **Property 3: Tool selection by file type**
    - **Validates: Requirements 2.2, 2.3**

  - [x]* 2.5 Write property test for job progress calculation
    - **Property 5: Job progress calculation**
    - **Validates: Requirements 3.5**

  - [x]* 2.6 Write property test for report summary statistics aggregation
    - **Property 7: Report summary statistics aggregation**
    - **Validates: Requirements 5.4**

- [x] 3. Implement Supabase client
  - [x] 3.1 Implement Supabase DB and Storage client (`supabase.go`)
    - Create `SupabaseClient` struct holding HTTP client, base URL, and API key
    - Implement `NewSupabaseClient(cfg Config) *SupabaseClient`
    - Implement `Ping(ctx) error` for health check (simple query to verify connectivity)
    - Implement `CreateJob(ctx, job *Job) error` — POST to PostgREST `/cleaning_jobs`
    - Implement `UpdateJob(ctx, job *Job) error` — PATCH to PostgREST `/cleaning_jobs?id=eq.{id}`
    - Implement `GetJob(ctx, jobID string) (*Job, error)` — GET from PostgREST
    - Implement `CreateFileRecords(ctx, files []FileRecord) error` — POST to `/job_files`
    - Implement `UpdateFileRecord(ctx, file *FileRecord) error` — PATCH to `/job_files`
    - Implement `GetFileRecords(ctx, jobID string) ([]FileRecord, error)` — GET from `/job_files?job_id=eq.{id}`
    - Implement `CreateReport(ctx, report *Report) error` — POST to `/cleaning_reports`
    - Implement `UpdateReportPDF(ctx, reportID, pdfPath, status string) error` — PATCH PDF path
    - Implement `GetReport(ctx, reportID string) (*ReportDetail, error)` — GET with joined file data
    - Implement `ListReports(ctx) ([]ReportSummary, error)` — GET ordered by date DESC
    - Implement `UploadPDF(ctx, reportID string, data []byte) (string, error)` — Upload to Supabase Storage bucket
    - Implement `GetPDFSignedURL(ctx, path string) (string, error)` — Generate signed URL for PDF download
    - Include retry logic for Storage uploads (retry once on failure)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement file upload handler
  - [x] 5.1 Implement upload handler and temp storage (`handlers.go` — upload section)
    - Create `handleUpload(w http.ResponseWriter, r *http.Request)` handler
    - Parse multipart form data with configurable max size
    - For each file: validate size (≤ MaxFileSize), validate format (extension check), generate unique file ID (UUID-based `f-{short}`)
    - Save accepted files to `{TempStoragePath}/uploads/{fileId}_original.{ext}`
    - Return 200 with JSON array of accepted file metadata (id, name, size, extension, type, format)
    - Return 413 if any file exceeds size limit
    - Return 415 if any file has unsupported format
    - Return 507 if disk write fails
    - Process each file independently in multi-file uploads
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x]* 5.2 Write unit tests for upload handler
    - Test multi-file upload processing (Req 1.5)
    - Test oversized file rejection → 413 (Req 1.3)
    - Test unsupported format rejection → 415 (Req 1.4)
    - Test disk write failure → 507 (Req 1.6)
    - _Requirements: 1.1–1.6_

- [x] 6. Implement cleaning pipeline
  - [x] 6.1 Implement cleaning pipeline orchestration (`pipeline.go`)
    - Create `CleaningPipeline` struct holding config and a progress callback function type
    - Implement `ProcessJob(ctx, job *Job, files []FileRecord, progressFn func(ProgressEvent)) error`
    - Process files sequentially within a job
    - For each file: set status "in_progress", send progress event, call appropriate tool, save result, set status "done"/"error", send completion event
    - Track overall job progress (files completed / total files)
    - On subprocess failure: mark file as "error", record error details, continue to next file
    - _Requirements: 2.1, 2.6_

  - [x] 6.2 Implement ExifTool subprocess for images
    - Run `exiftool -json <file>` to read all metadata fields before cleaning
    - Parse JSON output, categorize fields into GPS/EXIF/XMP categories
    - Run `exiftool -all= -o <cleaned_path> <original_path>` to strip metadata
    - Return `CleaningResult` with field counts by category and device info
    - Handle non-zero exit codes as file-level errors
    - _Requirements: 2.2, 2.4, 2.7_

  - [x] 6.3 Implement FFmpeg subprocess for videos
    - Run `ffprobe -v quiet -print_format json -show_format -show_streams <file>` to read metadata (global + per-stream)
    - Parse JSON output, categorize fields into ID3/MP4 atoms categories
    - Run `ffmpeg -i <input> -map_metadata -1 -map_metadata:s -1 -fflags +bitexact -flags:v +bitexact -flags:a +bitexact -c copy <output>` to strip all metadata (global + per-stream) without adding encoder tags
    - Return `CleaningResult` with field counts by category
    - Handle non-zero exit codes as file-level errors
    - _Requirements: 2.3, 2.4, 2.7_

  - [x] 6.4 Implement metadata field categorization logic
    - Create `CategorizeMetadataField(key string, source string) string` function
    - Categorize ExifTool fields: GPS* → GPS, XMP* → XMP, remainder → EXIF
    - Categorize FFprobe fields: ID3/MP4 atoms based on tag format
    - Ensure each field maps to exactly one category
    - Ensure sum of categorized fields equals total field count
    - _Requirements: 2.4, 2.7_

  - [x]* 6.5 Write property test for metadata field categorization
    - **Property 4: Metadata field categorization**
    - **Validates: Requirements 2.4, 2.7**

  - [x]* 6.6 Write unit tests for pipeline subprocess failure handling
    - Test ExifTool non-zero exit → file marked failed, other files continue
    - Test FFmpeg non-zero exit → file marked failed, other files continue
    - _Requirements: 2.6_

- [x] 7. Implement WebSocket progress handler
  - [x] 7.1 Implement WebSocket hub and progress broadcasting (`websocket.go`)
    - Create `WebSocketHub` struct with map of jobID → slice of connections (sync.Mutex protected)
    - Implement `Register(jobID string, conn *websocket.Conn)`
    - Implement `Unregister(jobID string, conn *websocket.Conn)`
    - Implement `Broadcast(jobID string, event ProgressEvent)` — send JSON to all connections for a job
    - Handle WebSocket upgrade in `handleJobProgress(w, r)` handler
    - On client disconnect: remove from hub, job processing continues uninterrupted
    - Send all event types: file_progress, file_complete, file_error, job_progress, job_complete
    - Close connection after sending job_complete event
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 8. Implement job creation and orchestration
  - [x] 8.1 Implement job creation handler (`handlers.go` — jobs section)
    - Create `handleCreateJob(w, r)` — parse JSON body with fileIds array
    - Validate fileIds not empty (400 if empty)
    - Verify each fileId exists in temp storage (404 if any missing)
    - Create Job record in Supabase DB (status: "processing")
    - Create FileRecord entries in Supabase DB for each file
    - Launch pipeline processing in a background goroutine
    - Return 201 with jobId, status, totalFiles, createdAt
    - _Requirements: 2.1, 2.5_

  - [x] 8.2 Implement job status handler (`handlers.go` — jobs section)
    - Create `handleGetJob(w, r)` — get job by ID from Supabase
    - Return current job state: status, totalFiles, filesCompleted, fieldsRemoved, times
    - Return 404 if job not found
    - _Requirements: 6.1_

  - [x]* 8.3 Write unit tests for job creation
    - Test job creation with valid fileIds → 201
    - Test job creation with missing fileIds → 404
    - Test job creation with empty fileIds → 400
    - _Requirements: 2.1, 2.5_

- [x] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement file download handler
  - [x] 10.1 Implement download handler (`handlers.go` — files section)
    - Create `handleFileDownload(w, r)` — extract fileId from URL path
    - Check file exists in temp storage cleaned directory
    - Check file processing status (query Supabase or in-memory state)
    - If file in-progress → return 409 with FILE_NOT_READY error
    - If file not found or expired → return 404 with FILE_NOT_FOUND error
    - If completed → serve file with Content-Type based on format and Content-Disposition: attachment header
    - _Requirements: 4.1, 4.2, 4.3_

  - [x]* 10.2 Write unit tests for download handler
    - Test download completed file → 200 with correct headers
    - Test download in-progress file → 409
    - Test download expired/missing file → 404
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 11. Implement report generation and PDF creation
  - [x] 11.1 Implement report creation after job completion
    - After pipeline finishes all files: create report record in Supabase DB
    - Generate human-readable report ID (MCR-YYYY-MMDD-XX format)
    - Populate: job_id, date, files_processed, fields_removed, gps_locations_removed, total_time_ms, file_types, dominant_type, has_gps, tags, icon_color, chart_data
    - Set pdf_status to "pending"
    - _Requirements: 5.1_

  - [x] 11.2 Implement PDF report generation (`pdf.go`)
    - Create `GenerateReportPDF(report *ReportDetail) ([]byte, error)` function using signintech/gopdf
    - Header: "MetaCleaner Report" + report ID + date
    - Summary section: files processed, fields removed, GPS locations removed, total time
    - Category breakdown as simple table/chart
    - Per-file detail table: file name, type, device, fields removed by category
    - Footer: page numbers
    - Return PDF as byte slice
    - _Requirements: 5.2_

  - [x] 11.3 Implement PDF upload to Supabase Storage
    - After PDF generation: upload bytes to Supabase Storage bucket `cleaning-reports`
    - On success: update report record with pdf_path and pdf_status="uploaded"
    - On failure: retry once, then mark pdf_status="failed" and log error
    - Report record is saved regardless of PDF success/failure
    - _Requirements: 5.2, 5.3, 5.7, 10.3, 10.6_

  - [x] 11.4 Implement reports list and detail endpoints (`handlers.go` — reports section)
    - Create `handleListReports(w, r)` — query all reports from Supabase, compute summary stats (totalReports, fieldsRemoved, filesProcessed, gpsRemoved), return ordered by date DESC
    - Create `handleGetReport(w, r)` — get full report detail with per-file breakdown, return 404 if not found
    - Create `handleGetReportPDF(w, r)` — get signed URL from Supabase Storage, redirect (302) to it, return 404 if report or PDF not found
    - _Requirements: 5.4, 5.5, 5.6, 10.4_

  - [x]* 11.5 Write unit tests for report endpoints
    - Test list reports returns summary stats
    - Test report detail with valid ID
    - Test report detail with invalid ID → 404
    - Test PDF download redirect
    - Test PDF download when PDF failed → 404
    - _Requirements: 5.4, 5.5, 5.6, 5.7_

- [x] 12. Implement cleanup scheduler
  - [x] 12.1 Implement periodic temp file cleanup (`cleanup.go`)
    - Create `CleanupScheduler` struct with config (retention period, temp path) and ticker (every 5 minutes)
    - Implement `Start(ctx context.Context)` — launch background goroutine with ticker
    - Implement `RunCleanup()` — scan uploads/ and cleaned/ directories, delete files older than retention period
    - Log each deletion with file identifier and age
    - On startup: run immediate cleanup for expired files from previous container runs
    - Only clean local temp files (not Supabase Storage PDFs)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 4.4, 4.5_

  - [x]* 12.2 Write property test for file expiration check
    - **Property 6: File expiration check**
    - **Validates: Requirements 4.4**

  - [x]* 12.3 Write unit tests for cleanup scheduler
    - Test expired files are deleted
    - Test non-expired files are retained
    - Test startup cleanup runs immediately
    - _Requirements: 7.1, 7.2_

- [x] 13. Implement health endpoint and startup validation
  - [x] 13.1 Implement health check handler (`handlers.go` — health section)
    - Create `handleHealth(w, r)` — check ExifTool availability (`exiftool -ver`), FFmpeg availability (`ffmpeg -version`), Supabase DB connectivity (ping), disk space status
    - Return 200 with JSON: status, exiftool (bool), ffmpeg (bool), database (bool), diskSpace (available, total)
    - _Requirements: 8.1_

  - [x] 13.2 Implement startup validation (`main.go`)
    - On startup: verify ExifTool in PATH (`exiftool -ver`), exit non-zero if missing
    - On startup: verify FFmpeg in PATH (`ffmpeg -version`), exit non-zero if missing
    - On startup: verify Supabase DB connectivity, exit non-zero if unreachable
    - Create temp storage directories if they don't exist
    - Start cleanup scheduler
    - _Requirements: 8.3, 8.4_

- [x] 14. Implement CORS middleware and router setup
  - [x] 14.1 Implement CORS middleware, rate limiter, and HTTP router (`router.go`)
    - Create CORS middleware allowing requests from configured FrontendOrigin
    - Set Access-Control-Allow-Origin, Allow-Methods, Allow-Headers, Allow-Credentials headers
    - Handle OPTIONS preflight requests
    - Create rate limiter middleware (token bucket or sliding window per IP, configurable RATE_LIMIT_RPM, default: 10 req/min)
    - Return 429 with Retry-After header when limit exceeded
    - Apply rate limiter to POST /api/upload endpoint
    - Register all routes using Go 1.22+ pattern matching with `{id}` path params:
      - POST /api/upload → handleUpload (rate limited)
      - POST /api/jobs → handleCreateJob
      - GET /api/jobs/{id} → handleGetJob
      - GET /api/jobs/{id}/progress → handleJobProgress (WebSocket)
      - GET /api/files/{id}/download → handleFileDownload
      - GET /api/reports → handleListReports
      - GET /api/reports/{id} → handleGetReport
      - GET /api/reports/{id}/pdf → handleGetReportPDF
      - GET /api/health → handleHealth
    - Ensure all responses use Content-Type: application/json (except file downloads and WebSocket)
    - _Requirements: 6.1, 6.3, 6.4, 6.5, 12.1, 12.2, 12.3_

  - [x] 14.2 Implement main entry point (`main.go`)
    - Load config from env
    - Run startup validations (ExifTool, FFmpeg, Supabase)
    - Initialize SupabaseClient, WebSocketHub, CleaningPipeline, CleanupScheduler
    - Create router with all handlers and middleware
    - Start HTTP server on configured port
    - Handle graceful shutdown on SIGINT/SIGTERM
    - _Requirements: 8.2, 8.3, 8.4_

- [x] 15. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Create database migration script
  - [x] 16.1 Create SQL migration script (`migrations/001_full_schema.sql`)
    - Create `cleaning_jobs` table with UUID PK, status, file counts, timestamps
    - Create `job_files` table with UUID PK, FK to cleaning_jobs, file metadata, status, metadata_breakdown JSONB
    - Create `cleaning_reports` table with UUID PK, FK to cleaning_jobs, report_id (unique human-readable), PDF path/status, chart_data JSONB, tags array
    - Create indexes: idx_job_files_job_id, idx_cleaning_reports_date, idx_cleaning_reports_job_id
    - Use `CREATE TABLE IF NOT EXISTS` for idempotency
    - Add comments describing each table's purpose
    - _Requirements: 11.1, 11.2, 11.3_

- [x] 17. Create deployment files
  - [x] 17.1 Create Dockerfile
    - Multi-stage build: Go 1.22+ builder stage, minimal production stage (debian-slim with ExifTool + FFmpeg installed)
    - Builder: copy go.mod/go.sum first, run `go mod download`, then copy source and build
    - Production: install exiftool and ffmpeg via apt, copy binary from builder
    - Expose configured port
    - CMD runs the Go binary
    - _Requirements: 9.1_

  - [x] 17.2 Create start-docker.sh
    - Parse APP_NAME from fly.toml
    - Build Docker image
    - Stop and remove existing container with same name
    - Run container with `--env-file .env` and port mapping
    - _Requirements: 9.2_

  - [x] 17.3 Create fly.toml
    - Define app name, primary region
    - Set port mapping (internal_port matching configured PORT)
    - Add [env] section with non-sensitive config (PORT, TEMP_STORAGE_PATH, RETENTION_PERIOD, MAX_FILE_SIZE)
    - Configure health check on /api/health
    - _Requirements: 9.3_

  - [x] 17.4 Create scripts/deploy.sh
    - Parse APP_NAME from fly.toml
    - Check if app exists (fly apps list), create only if missing
    - Read .env, skip comments/empty lines/empty values
    - Skip keys already in fly.toml [env]
    - Set remaining keys as Fly.io secrets
    - _Requirements: 9.4_

- [x] 18. Create documentation
  - [x] 18.1 Create README.md
    - Project name and description
    - Prerequisites (Go 1.22+, Docker, ExifTool, FFmpeg, Fly.io CLI)
    - Installation/setup instructions
    - Local Docker usage via start-docker.sh
    - Fly.io deployment via scripts/deploy.sh + fly deploy
    - Link to DOCS.md
    - Author section, support section, license
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x] 18.2 Create DOCS.md
    - Environment variables table (all keys from .env.example)
    - Project structure directory tree with descriptions
    - API documentation (all endpoints, request/response formats, WebSocket protocol)
    - Testing instructions (how to run tests, property tests)
    - Troubleshooting (common issues, ExifTool/FFmpeg setup, Supabase connectivity)
    - _Requirements: 6.1, 8.1, 8.2, 8.5_

- [x] 19. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document using the `rapid` library
- Unit tests validate specific examples and edge cases
- The project uses Go 1.22+ built-in routing (no external router dependency)
- All code lives in `backend/` directory at workspace root
