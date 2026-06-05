# Requirements Document

## Introduction

MetaCleaner Backend is a Go-based REST API server that strips hidden metadata (EXIF, GPS, camera info, timestamps, XMP, ID3, MP4 atoms, PNG chunks) from uploaded photos and videos. It integrates with ExifTool (for images) and FFmpeg (for videos) as subprocess tools, provides real-time progress updates via WebSocket, stores cleaning job data and report metadata in Supabase (PostgreSQL), generates PDF cleaning reports stored in Supabase Storage, and temporarily holds cleaned files in local Docker storage for download.

## Glossary

- **Backend**: The Go HTTP server application that processes metadata cleaning requests
- **Cleaning_Job**: A unit of work representing the metadata stripping operation for one or more uploaded files
- **ExifTool**: An external command-line tool used as a subprocess to read and strip metadata from image files
- **FFmpeg**: An external command-line tool used as a subprocess to strip metadata from video files
- **Metadata_Field**: A single key-value data element embedded in a file (e.g., GPS Latitude, Camera Make, Creator)
- **Metadata_Category**: A classification group for metadata fields: GPS, EXIF, XMP, ID3/MP4 atoms, or PNG chunks
- **Supabase_DB**: The Supabase-hosted PostgreSQL database used to persist job records, report metadata, and application data
- **Supabase_Storage**: The Supabase Storage service used to store generated PDF cleaning reports
- **Cleaning_Report**: A persistent record stored in Supabase_DB summarizing the results of a completed Cleaning_Job, with an associated PDF file stored in Supabase_Storage
- **Temporary_Storage**: A local disk directory within the Docker container where original uploaded files and cleaned files are held for a limited time before automatic deletion
- **Progress_Event**: A WebSocket message sent from the Backend to the client indicating current cleaning status
- **Frontend**: The SvelteKit web application that uploads files and displays cleaning results

---

## Requirements

### Requirement 1: File Upload

**User Story:** As a user, I want to upload one or more files to the backend for metadata cleaning, so that the server can process them.

#### Acceptance Criteria

1. WHEN a multipart file upload request is received, THE Backend SHALL accept files up to 500 MB per file
2. WHEN an uploaded file has a supported format (JPEG, PNG, HEIC, HEIF, AVIF, TIFF, DNG, WebP, GIF, MP4, MOV, AVI, MKV, WebM, WMV, FLV, 3GP, MPEG, OGV, MTS), THE Backend SHALL store the file in Temporary_Storage and return a unique file identifier
3. WHEN an uploaded file exceeds 500 MB, THE Backend SHALL reject the upload with HTTP 413 status and an error message indicating the size limit
4. WHEN an uploaded file has an unsupported format, THE Backend SHALL reject the upload with HTTP 415 status and an error message listing supported formats
5. WHEN a multipart upload contains multiple files, THE Backend SHALL process each file independently and return an identifier for each accepted file
6. IF a disk write failure occurs during upload, THEN THE Backend SHALL return HTTP 507 status with an error message indicating insufficient storage

---

### Requirement 2: Cleaning Job Execution

**User Story:** As a user, I want to start a metadata cleaning job for my uploaded files, so that all privacy-sensitive metadata is removed.

#### Acceptance Criteria

1. WHEN a cleaning job request is received with valid file identifiers, THE Backend SHALL create a Cleaning_Job and begin processing files sequentially
2. WHEN processing an image file (JPEG, PNG, HEIC, HEIF, AVIF, TIFF, DNG, WebP, GIF), THE Backend SHALL invoke ExifTool as a subprocess to strip all metadata fields
3. WHEN processing a video file (MP4, MOV, AVI, MKV, WebM, WMV, FLV, 3GP, MPEG, OGV, MTS), THE Backend SHALL invoke FFmpeg as a subprocess to strip all metadata fields
4. WHEN a file is successfully cleaned, THE Backend SHALL store the cleaned file in Temporary_Storage and record the count of removed Metadata_Fields grouped by Metadata_Category
5. WHEN a cleaning job request references a file identifier that does not exist, THE Backend SHALL return HTTP 404 status with an error message identifying the missing file
6. IF ExifTool or FFmpeg returns a non-zero exit code during processing, THEN THE Backend SHALL mark the file as failed, record the error details, and continue processing remaining files in the job
7. THE Backend SHALL categorize each removed Metadata_Field into one of: GPS, EXIF, XMP, ID3/MP4 atoms, or PNG chunks

---

### Requirement 3: Real-Time Progress Updates

**User Story:** As a user, I want to see live progress while my files are being cleaned, so that I know how long the process will take.

#### Acceptance Criteria

1. WHEN a WebSocket connection is established for a Cleaning_Job, THE Backend SHALL send Progress_Events as each file transitions between states (waiting, in_progress, done, error)
2. WHEN a file begins processing, THE Backend SHALL send a Progress_Event containing the file identifier, status "in_progress", and estimated progress percentage
3. WHEN a file completes processing, THE Backend SHALL send a Progress_Event containing the file identifier, status "done", and the count of removed metadata fields
4. WHEN a file fails processing, THE Backend SHALL send a Progress_Event containing the file identifier, status "error", and the error code
5. WHILE a Cleaning_Job is in progress, THE Backend SHALL send Progress_Events containing overall job progress (files completed, total files, total fields removed, estimated time remaining)
6. IF the WebSocket connection is lost during processing, THEN THE Backend SHALL continue processing the Cleaning_Job without interruption

---

### Requirement 4: Cleaned File Download

**User Story:** As a user, I want to download my cleaned files after processing completes, so that I can use them without privacy-sensitive metadata.

#### Acceptance Criteria

1. WHEN a download request is received with a valid file identifier for a completed file, THE Backend SHALL return the cleaned file as an HTTP response with appropriate Content-Type and Content-Disposition headers
2. WHEN a download request references a file that has not completed cleaning, THE Backend SHALL return HTTP 409 status with an error message indicating the file is not ready
3. WHEN a download request references a file identifier that does not exist or has expired, THE Backend SHALL return HTTP 404 status with an error message
4. THE Backend SHALL retain cleaned files in Temporary_Storage for a configurable duration (default: 1 hour) before automatic deletion
5. WHEN the retention period expires for a cleaned file, THE Backend SHALL delete both the original uploaded file and the cleaned file from Temporary_Storage

---

### Requirement 5: Cleaning Reports

**User Story:** As a user, I want to view a history of my cleaning operations, so that I can review what metadata was removed.

#### Acceptance Criteria

1. WHEN a Cleaning_Job completes (all files processed or failed), THE Backend SHALL create a Cleaning_Report record in Supabase_DB containing: job identifier, timestamp, files processed count, total fields removed, GPS locations removed, total processing time, and per-file breakdown by Metadata_Category
2. WHEN a Cleaning_Job completes, THE Backend SHALL generate a PDF document summarizing the cleaning results (job identifier, timestamp, per-file metadata breakdown by Metadata_Category, totals) and upload the PDF to Supabase_Storage
3. WHEN the PDF upload to Supabase_Storage succeeds, THE Backend SHALL store the PDF file path in the Cleaning_Report record in Supabase_DB
4. WHEN a list reports request is received, THE Backend SHALL return all Cleaning_Reports ordered by date descending with summary statistics (total reports, total fields removed, total files processed, total GPS removed)
5. WHEN a report detail request is received with a valid report identifier, THE Backend SHALL return the full Cleaning_Report including per-file metadata breakdown grouped by Metadata_Category and a download URL for the PDF report from Supabase_Storage
6. WHEN a report detail request references a non-existent report identifier, THE Backend SHALL return HTTP 404 status with an error message
7. IF the PDF generation or Supabase_Storage upload fails, THEN THE Backend SHALL log the error, store the Cleaning_Report record in Supabase_DB without a PDF path, and mark the PDF status as "failed"

---

### Requirement 6: REST API Structure

**User Story:** As a frontend developer, I want well-structured API endpoints with consistent response formats, so that I can integrate the backend with the SvelteKit frontend.

#### Acceptance Criteria

1. THE Backend SHALL expose the following REST endpoints: POST /api/upload, POST /api/jobs, GET /api/jobs/{id}, GET /api/jobs/{id}/progress, GET /api/files/{id}/download, GET /api/reports, GET /api/reports/{id}, GET /api/reports/{id}/pdf
2. THE Backend SHALL return all error responses in a consistent JSON format containing fields: error (string code), message (human-readable description), and timestamp
3. THE Backend SHALL include CORS headers allowing requests from the configured frontend origin
4. THE Backend SHALL return HTTP 400 status with a descriptive error message for malformed or missing request parameters
5. THE Backend SHALL accept and return data in JSON format for all non-file endpoints, using Content-Type: application/json

---

### Requirement 7: Temporary File Cleanup

**User Story:** As an operator, I want temporary files to be automatically cleaned up, so that local Docker disk usage stays bounded.

#### Acceptance Criteria

1. THE Backend SHALL run a periodic cleanup process that removes original uploaded files and cleaned files from Temporary_Storage older than the configured retention period
2. WHEN the Backend starts, THE Backend SHALL perform an initial cleanup of any expired files remaining from a previous run
3. THE Backend SHALL log each file deletion performed by the cleanup process, including the file identifier and age at deletion time
4. THE Backend SHALL store only original uploaded files and cleaned image/video files in Temporary_Storage (PDF reports are stored in Supabase_Storage and are not subject to local cleanup)

---

### Requirement 8: Health and Configuration

**User Story:** As an operator, I want to verify the backend is running correctly and has access to required tools, so that I can monitor service health.

#### Acceptance Criteria

1. WHEN a GET /api/health request is received, THE Backend SHALL return HTTP 200 with a JSON response containing server status, ExifTool availability, FFmpeg availability, Supabase_DB connectivity status, and disk space status
2. THE Backend SHALL read configuration from environment variables: port, frontend origin (CORS), file size limit, retention period, temporary storage path, Supabase URL, Supabase API key, and rate limit (requests per minute)
3. IF ExifTool or FFmpeg is not found in the system PATH at startup, THEN THE Backend SHALL log an error and exit with a non-zero status code
4. IF the Backend cannot establish a connection to Supabase_DB at startup, THEN THE Backend SHALL log an error and exit with a non-zero status code
5. THE Backend SHALL provide an .env.example file documenting all configuration variables with default values

---

### Requirement 9: Deployment Infrastructure

**User Story:** As an operator, I want to deploy the backend as a Docker container on Fly.io, so that the service is accessible from the internet.

#### Acceptance Criteria

1. THE Backend SHALL include a multi-stage Dockerfile that produces a minimal production image containing the Go binary, ExifTool, and FFmpeg
2. THE Backend SHALL include a start-docker.sh script that builds the Docker image and runs the container locally with environment variables from .env
3. THE Backend SHALL include a fly.toml configuration file defining the Fly.io app settings, port mapping, and non-sensitive environment variables
4. THE Backend SHALL include a fly-setup.sh script that creates the Fly.io app (if needed) and sets secrets from .env, skipping keys already defined in fly.toml [env]

---

### Requirement 10: Supabase Integration

**User Story:** As an operator, I want the backend to use Supabase for persistent data and report storage, so that data survives container restarts and can be accessed reliably.

#### Acceptance Criteria

1. THE Backend SHALL connect to Supabase_DB using the Supabase URL and API key provided via environment variables (SUPABASE_URL, SUPABASE_API_KEY)
2. THE Backend SHALL store all Cleaning_Job records, Cleaning_Report metadata, and job history in Supabase_DB
3. THE Backend SHALL upload generated PDF reports to a dedicated bucket in Supabase_Storage
4. THE Backend SHALL generate signed download URLs for PDF reports stored in Supabase_Storage when serving report detail requests
5. IF a Supabase_DB query fails during a request, THEN THE Backend SHALL return HTTP 503 status with an error message indicating a database connectivity issue
6. IF a Supabase_Storage upload fails, THEN THE Backend SHALL retry the upload once before marking the PDF status as "failed"
7. THE Backend SHALL NOT upload cleaned image or video files to Supabase_Storage (cleaned files remain in local Temporary_Storage only)

---

### Requirement 11: Database Schema Migration

**User Story:** As an operator, I want a SQL migration script that creates all required database tables, so that I can set up a new Supabase project quickly.

#### Acceptance Criteria

1. THE Backend SHALL include a SQL migration script (`scripts/migration.sql`) that creates all required tables (cleaning_jobs, job_files, cleaning_reports) with correct column types, constraints, and indexes
2. THE migration script SHALL be idempotent (safe to run multiple times without errors, using `CREATE TABLE IF NOT EXISTS` or equivalent)
3. THE migration script SHALL include comments describing each table's purpose
4. THE Backend documentation SHALL include instructions for running the migration against a Supabase project

---

### Requirement 12: Rate Limiting

**User Story:** As an operator, I want to prevent abuse of the upload endpoint, so that disk space and processing resources are protected.

#### Acceptance Criteria

1. THE Backend SHALL enforce a configurable rate limit on the POST /api/upload endpoint (default: 10 requests per minute per IP)
2. WHEN a client exceeds the rate limit, THE Backend SHALL return HTTP 429 status with an error message indicating the limit has been exceeded and a Retry-After header
3. THE Backend SHALL read the rate limit configuration from environment variables (RATE_LIMIT_RPM)
