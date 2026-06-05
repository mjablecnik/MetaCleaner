# MetaCleaner Backend — Documentation

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Project Structure](#project-structure)
3. [Database Migration](#database-migration)
4. [API Reference](#api-reference)
   - [POST /api/upload](#post-apiupload)
   - [POST /api/jobs](#post-apijobs)
   - [GET /api/jobs/{id}](#get-apijobsid)
   - [GET /api/jobs/{id}/progress (WebSocket)](#get-apijobsidprogress-websocket)
   - [GET /api/files/{id}/download](#get-apifilesiddownload)
   - [GET /api/reports](#get-apireports)
   - [GET /api/reports/{id}](#get-apireportsid)
   - [GET /api/reports/{id}/pdf](#get-apireportsidpdf)
   - [GET /api/health](#get-apihealth)
5. [Error Response Format](#error-response-format)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Environment Variables

All variables are read at startup. `SUPABASE_URL` and `SUPABASE_API_KEY` are required; the server exits with a non-zero code if they are missing. All others have defaults.

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | TCP port the HTTP server listens on |
| `FRONTEND_ORIGIN` | _(empty — allows all origins)_ | Allowed CORS origin, e.g. `https://metacleaner.app` |
| `MAX_FILE_SIZE` | `524288000` (500 MB) | Maximum accepted file size per upload in bytes |
| `RETENTION_PERIOD` | `1h` | How long cleaned/original files are kept in temp storage before deletion. Accepts Go duration strings: `30m`, `2h`, `24h`. |
| `TEMP_STORAGE_PATH` | `/tmp/metacleaner` | Root directory for temporary file storage inside the container |
| `SUPABASE_URL` | _(required)_ | Base URL of your Supabase project, e.g. `https://abc.supabase.co` |
| `SUPABASE_API_KEY` | _(required)_ | Supabase service role key (not the anon key) |
| `RATE_LIMIT_RPM` | `10` | Maximum upload requests per minute per IP address on `POST /api/upload` |

Copy `.env.example` to `.env` and edit before starting the server.

---

## Project Structure

```
backend/metacleaner-server/
├── main.go              # Entry point: config, startup checks, server lifecycle
├── config.go            # Config struct + LoadConfig() from environment
├── errors.go            # Error codes, ErrorResponse struct, WriteError helper
├── models.go            # All Go structs (Job, FileRecord, Report, …) + pure functions
├── handlers.go          # HTTP handlers: upload, jobs, files, reports, health
├── router.go            # HTTP mux, CORS middleware, rate limiter middleware
├── pipeline.go          # CleaningPipeline: ExifTool/FFmpeg subprocess orchestration
├── websocket.go         # WebSocketHub: per-job connection management + broadcasting
├── supabase.go          # SupabaseClient: PostgREST + Storage HTTP calls
├── pdf.go               # GenerateReportPDF() using signintech/gopdf
├── cleanup.go           # CleanupScheduler: periodic temp file deletion
├── *_test.go            # Unit and property tests for each component
├── tests/               # Additional integration/property test helpers
├── scripts/
│   └── migration.sql    # Idempotent SQL schema for Supabase
├── Dockerfile           # Multi-stage build: Go builder + debian-slim runtime
├── fly.toml             # Fly.io app configuration
├── start-docker.sh      # Build + run Docker container locally
├── fly-setup.sh         # Create Fly.io app + push .env secrets
├── .env.example         # Environment variable documentation with defaults
├── go.mod               # Go module definition
└── go.sum               # Dependency checksums
```

---

## Database Migration

Run `scripts/migration.sql` once against your Supabase project to create all required tables and indexes. The script uses `CREATE TABLE IF NOT EXISTS` so it is safe to run multiple times.

**Via the Supabase Dashboard:**

1. Open your project at [supabase.com/dashboard](https://supabase.com/dashboard)
2. Navigate to **SQL Editor**
3. Paste the contents of `scripts/migration.sql`
4. Click **Run**

**Via the Supabase CLI:**

```bash
supabase db push --db-url postgres://postgres:<password>@db.<project>.supabase.co:5432/postgres < scripts/migration.sql
```

**Tables created:**

| Table | Description |
|---|---|
| `cleaning_jobs` | One row per cleaning job; tracks status, file counts, timing |
| `job_files` | One row per file in a job; stores metadata breakdown as JSONB |
| `cleaning_reports` | Summary report per completed job; PDF path, chart data, tags |

---

## API Reference

All endpoints return `Content-Type: application/json` except file downloads (binary) and the WebSocket upgrade.

### POST /api/upload

Upload one or more files for cleaning. Rate limited to `RATE_LIMIT_RPM` requests per minute per IP.

**Request:** `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `files` | file(s) | One or more image or video files |

**Supported formats:** JPEG, PNG, HEIC, HEIF, AVIF, TIFF, DNG, WebP, GIF, MP4, MOV, AVI, MKV, WebM, WMV, FLV, 3GP, MPEG, OGV, MTS

**Response 200:**
```json
[
  {
    "id": "f-a1b2c3",
    "name": "photo.jpg",
    "size": 2048000,
    "extension": ".jpg",
    "type": "image",
    "format": "JPEG"
  }
]
```

**Error responses:**

| Status | Code | Condition |
|---|---|---|
| `413` | `FILE_TOO_LARGE` | File exceeds `MAX_FILE_SIZE` |
| `415` | `UNSUPPORTED_FORMAT` | File extension not in supported list |
| `429` | `RATE_LIMIT_EXCEEDED` | Rate limit exceeded; check `Retry-After` header |
| `507` | `INSUFFICIENT_STORAGE` | Disk write failure |

---

### POST /api/jobs

Create a cleaning job for previously uploaded files.

**Request body:**
```json
{
  "fileIds": ["f-a1b2c3", "f-d4e5f6"]
}
```

**Response 201:**
```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "totalFiles": 2,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Error responses:**

| Status | Code | Condition |
|---|---|---|
| `400` | `INVALID_REQUEST` | `fileIds` array is empty or missing |
| `404` | `FILE_NOT_FOUND` | One or more file IDs not found in temp storage |

---

### GET /api/jobs/{id}

Get the current status of a cleaning job.

**Response 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "done",
  "totalFiles": 2,
  "filesCompleted": 2,
  "fieldsRemoved": 47,
  "createdAt": "2024-01-15T10:30:00Z",
  "completedAt": "2024-01-15T10:30:12Z"
}
```

**Job status values:** `processing`, `done`, `failed`

**Error responses:**

| Status | Code | Condition |
|---|---|---|
| `404` | `JOB_NOT_FOUND` | Job ID not found |

---

### GET /api/jobs/{id}/progress (WebSocket)

WebSocket endpoint for real-time progress events during a cleaning job.

**Upgrade:** Standard WebSocket handshake (`Upgrade: websocket`)

**Progress event format (JSON):**
```json
{
  "type": "file_progress",
  "fileId": "f-a1b2c3",
  "status": "in_progress",
  "progress": 50
}
```

**Event types:**

| Type | Fields | Description |
|---|---|---|
| `file_progress` | `fileId`, `status`, `progress` | File status changed to `in_progress` |
| `file_complete` | `fileId`, `status`, `fieldsRemoved` | File finished; `status` is `done` |
| `file_error` | `fileId`, `status`, `errorCode` | File failed; `status` is `error` |
| `job_progress` | `filesCompleted`, `totalFiles`, `fieldsRemoved` | Overall job progress update |
| `job_complete` | `status`, `reportId` | All files processed; connection is closed by server |

If the connection drops during processing, the job continues uninterrupted. Reconnect and resume listening to catch remaining events.

---

### GET /api/files/{id}/download

Download a cleaned file.

**Response 200:** Binary file stream with:
- `Content-Type`: appropriate MIME type for the file format
- `Content-Disposition: attachment; filename="<original-name>"`

**Error responses:**

| Status | Code | Condition |
|---|---|---|
| `404` | `FILE_NOT_FOUND` | File ID not found or retention period expired |
| `409` | `FILE_NOT_READY` | File is still being processed |

---

### GET /api/reports

List all cleaning reports ordered by date descending.

**Response 200:**
```json
{
  "reports": [
    {
      "id": "MCR-2024-0115-01",
      "date": "2024-01-15T10:30:12Z",
      "filesProcessed": 2,
      "fieldsRemoved": 47,
      "gpsLocationsRemoved": 2,
      "totalTimeSeconds": 12,
      "dominantType": "image",
      "tags": ["GPS", "EXIF"],
      "iconColor": "#4F46E5"
    }
  ],
  "summary": {
    "totalReports": 1,
    "totalFieldsRemoved": 47,
    "totalFilesProcessed": 2,
    "totalGpsRemoved": 2
  }
}
```

---

### GET /api/reports/{id}

Get full detail for a single report including per-file breakdown.

**Report ID format:** `MCR-YYYY-MMDD-NN` (e.g. `MCR-2024-0115-01`)

**Response 200:**
```json
{
  "id": "MCR-2024-0115-01",
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2024-01-15T10:30:12Z",
  "filesProcessed": 2,
  "fieldsRemoved": 47,
  "gpsLocationsRemoved": 2,
  "totalTimeSeconds": 12,
  "pdfStatus": "uploaded",
  "chartData": [
    { "category": "GPS", "count": 3 },
    { "category": "EXIF", "count": 38 },
    { "category": "XMP", "count": 6 }
  ],
  "files": [
    {
      "name": "photo.jpg",
      "type": "image",
      "device": "Apple iPhone 14",
      "fieldsRemoved": 47,
      "breakdown": {
        "GPS": 3,
        "EXIF": 38,
        "XMP": 6
      }
    }
  ]
}
```

**Error responses:**

| Status | Code | Condition |
|---|---|---|
| `404` | `REPORT_NOT_FOUND` | Report ID not found |

---

### GET /api/reports/{id}/pdf

Redirect to a signed download URL for the PDF report stored in Supabase Storage.

**Response 302:** `Location` header contains the signed URL (valid for a limited time).

**Error responses:**

| Status | Code | Condition |
|---|---|---|
| `404` | `REPORT_NOT_FOUND` | Report ID not found |
| `404` | `FILE_NOT_FOUND` | PDF was not generated (`pdf_status` is `failed` or `pending`) |

---

### GET /api/health

Check server health and dependency availability.

**Response 200:**
```json
{
  "status": "ok",
  "exiftool": true,
  "ffmpeg": true,
  "database": true,
  "diskSpace": {
    "available": 10737418240,
    "total": 21474836480
  }
}
```

If any dependency is unavailable, `status` is `degraded` but the response is still `200`. A non-`200` response indicates the server itself is not running.

---

## Error Response Format

All error responses use this consistent JSON shape:

```json
{
  "error": "FILE_TOO_LARGE",
  "message": "File exceeds the maximum allowed size of 500 MB",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Error codes:**

| Code | HTTP Status | Description |
|---|---|---|
| `FILE_TOO_LARGE` | 413 | Uploaded file exceeds `MAX_FILE_SIZE` |
| `UNSUPPORTED_FORMAT` | 415 | File extension not in supported list |
| `INSUFFICIENT_STORAGE` | 507 | Disk write failure during upload |
| `FILE_NOT_FOUND` | 404 | File ID not found or expired |
| `FILE_NOT_READY` | 409 | File cleaning not yet complete |
| `JOB_NOT_FOUND` | 404 | Job ID not found |
| `REPORT_NOT_FOUND` | 404 | Report ID not found |
| `INVALID_REQUEST` | 400 | Malformed or missing request parameters |
| `DATABASE_ERROR` | 503 | Supabase DB query failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Upload rate limit exceeded |

---

## Testing

Run all unit and property tests:

```bash
go test ./...
```

Run tests with verbose output:

```bash
go test -v ./...
```

Run only property tests (using the `rapid` library):

```bash
go test -v -run TestProperty ./...
```

Run tests with race detector enabled:

```bash
go test -race ./...
```

**Test files:**

| File | What it tests |
|---|---|
| `handlers_test.go` | Upload handler: multi-file, oversized, unsupported format, disk failure |
| `handlers_jobs_test.go` | Job creation: valid IDs, missing IDs, empty array |
| `handlers_download_test.go` | Download handler: completed file, in-progress file, expired file |
| `handlers_reports_test.go` | Reports list, detail, PDF redirect |
| `pipeline_test.go` | ExifTool/FFmpeg subprocess failure handling |
| `cleanup_test.go` | Expired file deletion, non-expired file retention |
| `tests/` | Property tests: file size, format, tool selection, categorization, expiry, report aggregation, error format |

**Property tests** use [pgregory.net/rapid](https://github.com/flyingmutant/rapid) to verify universal invariants across random inputs:

- Property 1: File size validation (`ValidateFileSize`)
- Property 2: File format validation (`ValidateFileFormat`)
- Property 3: Tool selection by file type (`SelectTool`)
- Property 4: Metadata field categorization (`CategorizeMetadataField`)
- Property 5: Job progress calculation (`CalculateJobProgress`)
- Property 6: File expiration check (`IsFileExpired`)
- Property 7: Report summary statistics aggregation (`CalculateReportSummary`)
- Property 8: Error response format consistency (`NewErrorResponse`)

---

## Troubleshooting

### ExifTool not found at startup

```
FATAL exiftool not found in PATH
```

**Fix:** Install ExifTool and ensure it is in your `PATH`.

- macOS: `brew install exiftool`
- Ubuntu/Debian: `apt-get install libimage-exiftool-perl`
- Windows: Download from [exiftool.org](https://exiftool.org/)

When running via Docker, ExifTool is installed automatically inside the image.

---

### FFmpeg not found at startup

```
FATAL ffmpeg not found in PATH
```

**Fix:** Install FFmpeg and ensure it is in your `PATH`.

- macOS: `brew install ffmpeg`
- Ubuntu/Debian: `apt-get install ffmpeg`
- Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html)

When running via Docker, FFmpeg is installed automatically inside the image.

---

### Supabase connectivity failure at startup

```
FATAL cannot connect to Supabase: ...
```

**Check:**
1. `SUPABASE_URL` is the correct project URL (e.g. `https://abc.supabase.co`)
2. `SUPABASE_API_KEY` is the **service role** key, not the anon key
3. The Supabase project is not paused (free-tier projects pause after inactivity)
4. The database migration has been applied (`scripts/migration.sql`)

---

### Docker build fails with lockfile error

If `docker build` fails with `lockfile had changes`, the `go.sum` file is out of date. Re-generate it:

```bash
go mod tidy
```

Then rebuild:

```bash
docker build -t metacleaner-server .
```

---

### Rate limit exceeded on upload

The upload endpoint is limited to `RATE_LIMIT_RPM` requests per minute per IP (default: 10). If you hit `429` during testing, either wait for the window to reset or increase the limit in `.env`:

```
RATE_LIMIT_RPM=60
```

---

### PDF report stuck in `pending` status

If `pdf_status` remains `pending` after a job completes, the PDF generation or Supabase Storage upload failed. Check server logs for errors. The Supabase Storage bucket `cleaning-reports` must exist in your project. Create it via the Supabase Dashboard → Storage → New bucket.
