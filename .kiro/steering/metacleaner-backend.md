# MetaCleaner Backend — Architecture & Conventions

## Project Overview

MetaCleaner Backend is a Go HTTP server that strips metadata from uploaded media files (photos/videos), provides real-time WebSocket progress updates, persists job/report data in Supabase, generates PDF reports, and manages temporary file storage with automatic cleanup.

The backend lives in `backend/metacleaner-server/`.

## Tech Stack

- **Language**: Go 1.23
- **Routing**: `net/http` built-in (Go 1.22+ pattern matching with `{id}` path params)
- **WebSocket**: gorilla/websocket
- **PDF Generation**: signintech/gopdf
- **Config**: godotenv + environment variables
- **Database**: Supabase PostgREST (HTTP calls, no ORM)
- **Storage**: Supabase Storage (PDF reports only)
- **Auth**: Supabase Auth (JWT validation)
- **Rate Limiting**: Custom per-IP token bucket (golang.org/x/time/rate)
- **Testing**: `go test` + pgregory.net/rapid (property-based tests)
- **External Tools**: ExifTool (images), FFmpeg (videos) — invoked as subprocesses
- **Deployment**: Fly.io with Docker (multi-stage build)

## Project Structure

```
backend/metacleaner-server/
├── cmd/main.go              # Entry point (calls source.Run())
├── source/                  # All application source code (flat, single package)
│   ├── main.go              # Bootstrap, lifecycle, graceful shutdown
│   ├── config.go            # Config struct + env loading
│   ├── router.go            # Route registration + middleware chain
│   ├── handlers.go          # REST endpoint handlers (upload, jobs, reports, download)
│   ├── auth_handlers.go     # Auth endpoint handlers (register, login, OAuth, etc.)
│   ├── auth_middleware.go   # JWT validation middleware
│   ├── auth_models.go       # Auth request/response types
│   ├── auth_rate_limiter.go # Auth-specific rate limiting
│   ├── models.go            # Data types, validation functions, constants
│   ├── errors.go            # Error codes, ErrorResponse, WriteError helper
│   ├── pipeline.go          # CleaningPipeline orchestration
│   ├── websocket.go         # WebSocketHub for real-time progress
│   ├── pdf.go               # PDF report generation
│   ├── supabase.go          # Supabase DB client (PostgREST + Storage)
│   ├── supabase_auth.go     # Supabase Auth client
│   ├── cleanup.go           # Periodic temp file cleanup scheduler
│   └── well_known.go        # /.well-known endpoints (App Links)
├── tests/                   # All test files (separate directory)
│   ├── handlers_test.go
│   ├── pipeline_test.go
│   ├── auth_*_test.go
│   └── ...
├── scripts/
│   ├── migration.sql        # Initial DB schema
│   └── migration002.sql     # Schema updates
├── Dockerfile               # Multi-stage build
├── fly.toml                 # Fly.io deployment config
├── fly-setup.sh             # Idempotent Fly.io setup script
├── start-docker.sh          # Local Docker build+run
├── .env / .env.example
├── go.mod / go.sum
└── README.md / DOCS.md
```

## Architecture Patterns

### Single Package, Flat Structure

All source files are in the `source` package. No subdirectories. Tests live in a separate `tests/` directory using the `tests` package importing `source` as `src`.

### Handler Pattern

Handlers are factory functions that return `http.HandlerFunc`:

```go
func HandleUpload(cfg Config) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        // handler logic
    }
}
```

### Middleware Chain

Middleware wraps handlers via `func(http.Handler) http.Handler`:

```go
cors := corsMiddleware(cfg.FrontendOrigin)
authMW := NewAuthMiddleware(cfg)
return cors(authMW.Middleware(mux))
```

Order: CORS → Auth → Rate Limit (per-route) → Handler

### Error Responses

All errors use a consistent JSON format:

```go
WriteError(w, http.StatusNotFound, ErrJobNotFound, "Job not found")
```

Response:
```json
{"error": "JOB_NOT_FOUND", "message": "Job not found", "timestamp": "2026-..."}
```

Error codes are constants defined in `errors.go`.

### Config Loading

Config is loaded from environment variables with sensible defaults. Required vars (SUPABASE_URL, SUPABASE_API_KEY) cause a fatal exit if missing. Non-sensitive vars are also in `fly.toml [env]`.

### Supabase Integration

- No ORM — direct HTTP calls to PostgREST and Storage REST APIs
- `SupabaseClient` handles DB queries (jobs, reports, files)
- `SupabaseAuthClient` handles auth operations (register, login, OAuth)
- Signed URLs for PDF downloads from Supabase Storage

### Cleaning Pipeline

Files are processed sequentially within a job. The pipeline:
1. Reads original file from temp storage
2. Invokes ExifTool (images) or FFmpeg (videos) as subprocess
3. Parses removed metadata fields from tool output
4. Categorizes fields into GPS/EXIF/XMP/ID3/MP4/PNG
5. Saves cleaned file to temp storage
6. Broadcasts progress via WebSocket hub
7. On job completion: creates report in DB, generates PDF

### File Storage

- Uploaded files: `{TempStoragePath}/uploads/{localId}_original.{ext}`
- Cleaned files: `{TempStoragePath}/cleaned/{localId}_cleaned.{ext}`
- Automatic cleanup after configurable retention period (default: 1h)
- PDF reports stored in Supabase Storage (permanent)

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/upload | Multipart file upload |
| POST | /api/jobs | Create cleaning job |
| GET | /api/jobs/{id} | Get job status |
| GET | /api/jobs/{id}/progress | WebSocket progress stream |
| GET | /api/jobs/{id}/download | Download job as ZIP |
| GET | /api/files/{id}/download | Download single cleaned file |
| GET | /api/reports | List all reports |
| GET | /api/reports/{id} | Get report detail |
| GET | /api/reports/{id}/pdf | Download report PDF |
| GET | /api/health | Health check |
| POST | /api/auth/register | User registration |
| POST | /api/auth/login | User login |
| POST | /api/auth/logout | User logout |
| POST | /api/auth/refresh | Token refresh |
| GET | /api/auth/me | Current user profile |
| POST | /api/auth/forgot-password | Request password reset |
| POST | /api/auth/verify-reset-code | Verify reset code |
| POST | /api/auth/reset-password | Set new password |
| GET | /api/auth/oauth/{provider} | Initiate OAuth flow |
| GET | /api/auth/oauth/callback | OAuth callback |
| POST | /api/auth/magic-link | Send magic link |
| GET | /api/auth/magic-link/callback | Magic link callback |

## Testing Conventions

### Test Location

All tests live in `tests/` directory using `package tests`:

```go
package tests

import (
    src "metacleaner-server/source"
    "testing"
)
```

### Test Helpers

```go
func newTestConfig(t *testing.T) src.Config {
    t.Helper()
    return src.Config{
        MaxFileSize:     500 * 1024 * 1024,
        TempStoragePath: t.TempDir(),
    }
}
```

### Property-Based Tests

Using `pgregory.net/rapid` for property-based testing:

```go
func TestPropertyName(t *testing.T) {
    rapid.Check(t, func(rt *rapid.T) {
        input := rapid.StringOf(...).Draw(rt, "input")
        // assertions
    })
}
```

Property tests validate invariants: file size validation, format detection, metadata categorization, error format consistency.

### Running Tests

```bash
cd backend/metacleaner-server
go test ./tests/ -v           # Run all tests
go test ./tests/ -v -run TestHandleUpload  # Run specific test
```

## Build & Run Commands

```bash
# Local development (requires exiftool + ffmpeg in PATH)
cd backend/metacleaner-server
go run ./cmd/

# Local Docker
./start-docker.sh

# Deploy to Fly.io
./fly-setup.sh    # First time: creates app + sets secrets
fly deploy        # Deploy
fly logs          # View logs
```

## Supported File Formats

**Images** (ExifTool): JPEG, PNG, HEIC, HEIF, AVIF, TIFF, DNG, WebP, GIF
**Videos** (FFmpeg): MP4, MOV, AVI, MKV, WebM, WMV, FLV, 3GP, MPEG, OGV, MTS
