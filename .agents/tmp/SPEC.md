# Tigris Integration — Cleaned Files Storage

## Overview

Replace the Fly.io persistent volume (`metacleaner_tmp`) with Tigris object storage (S3-compatible) for storing cleaned files. This eliminates the shared filesystem dependency, enabling horizontal scaling across multiple machines. Uploads and pipeline processing remain on ephemeral `/tmp` disk; only the "save result" and "download" paths change.

## Goals

1. Cleaned files stored in Tigris instead of local persistent volume
2. Local files deleted immediately after upload to Tigris
3. Download endpoints serve presigned URLs (302 redirect) instead of `os.Open`
4. ZIP download streams objects from Tigris
5. Remove `[[mounts]]` from both `fly.toml` and `fly.stage.toml`
6. Cleanup scheduler only handles `/tmp` uploads (Tigris lifecycle handles cleaned file expiry)
7. Deploy script no longer creates volumes

## Technical Approach

### S3 Client

Use AWS SDK for Go v2 (`github.com/aws/aws-sdk-go-v2`) with S3-compatible endpoint configuration pointing to Tigris (`https://fly.storage.tigris.dev`). A single `TigrisClient` struct wraps upload, download (presign), and delete operations.

**Bucket**: `metacleaner-files`
**Key pattern**: `cleaned/{localId}_cleaned.{ext}`

### Config Changes

Add to `Config` struct:
- `TigrisAccessKey` (required when not in dev mode)
- `TigrisSecretKey` (required when not in dev mode)
- `TigrisBucket` (default: `metacleaner-files`)
- `TigrisEndpoint` (default: `https://fly.storage.tigris.dev`)
- `TigrisPresignExpiry` (default: 1 hour)

### Pipeline Changes

After exiftool/ffmpeg produces the cleaned file on disk:
1. Upload cleaned file to Tigris at key `cleaned/{localId}_cleaned.{ext}`
2. Delete the local cleaned file immediately
3. Store the Tigris object key in `FileRecord.CleanedStorageKey`

The upload step happens inside `ProcessJob` after computing SHA-256 and before emitting `file_complete`.

### Download Handler Changes

**Single file download** (`GET /api/files/{id}/download`):
- Generate a presigned GET URL (1h expiry) from Tigris
- Return `302 Found` redirect to the presigned URL
- Fallback: if Tigris key not found, return 404 (file expired)

**ZIP download** (`GET /api/jobs/{id}/download`):
- Stream each cleaned file from Tigris via `GetObject` into the ZIP writer
- No local disk needed for ZIP assembly (stream directly to HTTP response)
- PDF inclusion from Supabase Storage remains unchanged

### Cleanup Changes

- `CleanupScheduler` continues to clean `/tmp/metacleaner/uploads/` for upload expiry
- Remove cleaning of `/tmp/metacleaner/cleaned/` — files are deleted immediately after Tigris upload
- Tigris bucket lifecycle policy (24h TTL) serves as safety net for object expiry

### Deployment Changes

- Remove `[[mounts]]` from `fly.toml` and `fly.stage.toml`
- Remove volume creation from `scripts/deploy.sh`
- Add Tigris env vars to `.env.example`
- Set Tigris secrets via `fly secrets set`

## File Structure

New file:
```
source/tigris.go       — TigrisClient: NewTigrisClient, Upload, PresignURL, Delete, GetObject
```

Modified files:
```
source/config.go       — Add Tigris config fields + env loading
source/pipeline.go     — Upload to Tigris after cleaning, delete local file
source/job_handlers.go — Rewrite download handlers to use presigned URLs / streaming
source/cleanup.go      — Remove cleaned/ directory scanning
source/main.go         — Initialize TigrisClient, pass to handlers/pipeline
source/router.go       — Pass TigrisClient to handlers
source/models.go       — Add CleanedStorageKey field to FileRecord
fly.toml               — Remove [[mounts]]
fly.stage.toml         — Remove [[mounts]]
scripts/deploy.sh      — Remove volume creation block
.env.example           — Add Tigris vars
go.mod                 — Add aws-sdk-go-v2 dependencies
```

Test files:
```
tests/tigris_test.go   — Unit tests for TigrisClient (mocked S3)
tests/job_handlers_download_test.go — Updated download handler tests
```

## Constraints & Edge Cases

1. **Pipeline failure after Tigris upload**: If the pipeline crashes between uploading to Tigris and emitting progress, the object still exists with 24h TTL — no data loss, just orphaned.
2. **Presigned URL expiry**: If a user gets a 302 but delays the actual download beyond 1h, they'll get a Tigris 403. Frontend should retry the download endpoint.
3. **Large files**: Tigris supports multipart upload for files >5GB. Use `s3manager.Uploader` for automatic multipart handling.
4. **Local dev without Tigris**: Support a `TIGRIS_ENDPOINT=""` check — if Tigris is not configured, fall back to existing local file behavior. This keeps local dev simple.
5. **Concurrent access**: Presigned URLs are stateless — multiple downloads of the same file don't conflict.
6. **ZIP streaming memory**: Streaming from Tigris → ZIP → HTTP response uses constant memory regardless of file size.
