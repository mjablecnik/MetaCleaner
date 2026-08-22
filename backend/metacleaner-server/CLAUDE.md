# MetaCleaner Backend — Agent Guide

Go HTTP server for stripping metadata from media files. Uses ExifTool (images) and FFmpeg (videos), with Supabase for DB/auth/storage, Stripe for billing, and Brevo for transactional email.

## Key Commands

```bash
# Run server locally (requires ExifTool + FFmpeg in PATH)
go run ./cmd/

# Run tests (main test suite)
go test ./tests/ -v

# Run tests in source/ package (email_change, auth URL helpers, format helpers)
go test ./source/ -v

# Run all tests with race detector
go test -race ./...

# Run a specific test
go test ./tests/ -run TestHandleUploadMultiFile

# Build binary
scripts/build.sh

# Local Docker
scripts/start-docker.sh   # build + run
scripts/stop-docker.sh    # stop

# Deploy to Fly.io (reads .env.prod, sets secrets, runs fly deploy)
scripts/deploy.sh

# Stripe webhook listener (local dev)
scripts/stripe-webhook.sh
```

## Project Structure

```
cmd/main.go            # Entry point — calls source.Run()
source/
  main.go              # Run(): startup checks, server lifecycle
  config.go            # Config struct + LoadConfig() — reads all env vars
  router.go            # All HTTP routes registered here
  errors.go            # WriteError(), error code constants
  models.go            # Shared structs + pure utility functions
  logger.go            # InitLogger(), LoggerFromContext()
  middleware.go         # CORS, security headers
  request_id.go        # X-Request-ID middleware

  auth_middleware.go   # JWT + API key validation (applied globally)
  auth_handlers.go     # Register/login/logout/refresh/OAuth/magic-link/password reset
  auth_models.go       # Auth request/response structs
  auth_rate_limiter.go # Rate limiter for auth endpoints
  account_handlers.go  # UpdateProfile, ChangePassword, DeleteAccount
  account_cleanup.go   # AccountCleanupScheduler (30-day deactivation → hard delete)
  email_change.go      # Email change verification token store

  upload_handlers.go   # HandleUpload, HandleFileDownload
  job_handlers.go      # HandleCreateJob, HandleGetJob
  job_worker.go        # JobWorkerPool — caps concurrent pipeline runs (default 3)
  pipeline.go          # CleaningPipeline — subprocess orchestration
  pipeline_exiftool.go # ExifTool logic
  pipeline_ffmpeg.go   # FFmpeg logic
  websocket.go         # WebSocketHub — per-job progress streaming
  pdf.go               # PDF report generation

  report_handlers.go   # Reports + public report endpoints
  health_handlers.go   # /api/health
  well_known.go        # /.well-known/assetlinks.json + /apple-app-site-association

  billing_handlers.go  # Stripe checkout + subscription management
  billing_webhook.go   # Stripe webhook event handler
  apikey_handlers.go   # API key CRUD
  apikey_models.go     # APIKey types
  apikey_rate_limiter.go # Per-key rate limiting

  supabase.go          # SupabaseClient (DB + Storage) — uses service role key
  supabase_auth.go     # SupabaseAuthClient (Supabase Auth API) — uses anon key
  supabase_apikeys.go  # API key DB operations
  supabase_billing.go  # Billing DB operations
  cleanup.go           # CleanupScheduler — temp file deletion

tests/                 # External test package — integration tests, property tests
migrations/
  001_full_schema.sql           # Idempotent schema — run once for a new Supabase project
  002_rename_total_time_ms.sql  # Run once on existing databases (renames column)
scripts/               # Shell scripts for build, deploy, Docker, Stripe
```

## Conventions

- **No global mutable state** — all dependencies injected via constructor functions and handler closures.
- **Handler pattern:** `Handle<Name>(deps...) http.HandlerFunc` — returns a closure, registered in `router.go`.
- **Errors:** always use `WriteError(w, statusCode, errorCode, message)` — never `http.Error`.
- **Auth context:** `UserIDFromContext(ctx)` returns the authenticated user ID set by `AuthMiddleware`. `KeyIDFromContext(ctx)` is non-empty when request used an API key.
- **Tests:** test files in `tests/` use build tag `package tests` and import `metacleaner-server/source`. Property tests use `pgregory.net/rapid`.
- **Logging:** structured `slog`; use `LoggerFromContext(ctx)` inside handlers to get a request-scoped logger with `request_id` attached.
- **File IDs:** format `f-<8hex>` (e.g. `f-a1b2c3d4`). Jobs use UUID4.
- **Temp dirs:** `<TEMP_STORAGE_PATH>/uploads/` and `<TEMP_STORAGE_PATH>/cleaned/`.

## Important Notes

- `SUPABASE_API_KEY` = anon key (used by auth client). `SUPABASE_SERVICE_ROLE_KEY` = service role key (used by DB client to bypass RLS). Both should be set in production.
- ExifTool and FFmpeg must be in PATH — server exits on startup if either is missing.
- The `auth_middleware.go` is applied globally via the router wrapper; individual handlers use `UserIDFromContext` to verify auth rather than re-checking headers.
- `JobWorkerPool` caps concurrency (default 3); extra jobs queue. Increase `MAX_CONCURRENT_JOBS` for beefy machines.
- `AccountCleanupScheduler` runs every 24h and hard-deletes Supabase auth users whose profile has `deactivated_at` older than 30 days.
- Stripe webhook endpoint (`POST /api/billing/webhook`) bypasses JWT auth — verified via HMAC signature using `STRIPE_WEBHOOK_SECRET`.
- Tests in `source/` (`email_change_test.go`, `supabase_auth_url_test.go`, `format_helpers_test.go`) run separately from `tests/`.

## Reference

Cross-project agent notes (env setup, Go test gotchas — `rapid`, ES256-only auth middleware in tests — and process notes): **[../../.agents/AGENT_NOTES.md](../../.agents/AGENT_NOTES.md)**.

For full API docs, environment variables, deployment steps, and troubleshooting see [DOCS.md](./DOCS.md).
