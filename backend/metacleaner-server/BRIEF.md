# Tigris Integration — Cleaned Files Storage

> **Status: completed.** This migration has already been fully implemented (see `source/tigris.go`, `DOCS.md`). Kept as a historical design record of why and how it was done, not a pending plan.

## Goal

Replace local persistent volume with Tigris (S3-compatible object storage) for storing cleaned files. This enables horizontal scaling (multiple machines) without shared filesystem.

## Key Changes

1. **Remove Fly.io volume** — delete `[[mounts]]` from `fly.stage.toml` and `fly.toml`. Use ephemeral `/tmp` for processing only.

2. **Add Tigris S3 client** — new `tigris.go` file with AWS SDK v2 S3 client (upload, download/presign, delete). Single bucket `metacleaner-files`, prefix `cleaned/`.

3. **Update pipeline "save result" step** — after exiftool/ffmpeg produces cleaned file on disk, upload it to Tigris. Then delete local file immediately.

4. **Update download handler** — instead of `os.Open` on local disk, generate a presigned URL from Tigris (1h expiry) and redirect client, or stream the object.

5. **Update cleanup logic** — local `/tmp` files (uploads + working) are deleted right after pipeline completes. Tigris objects get auto-expired via bucket lifecycle policy (e.g., 24h TTL) as a safety net.

6. **Add Tigris env vars** — `TIGRIS_ACCESS_KEY`, `TIGRIS_SECRET_KEY`, `TIGRIS_BUCKET`, `TIGRIS_ENDPOINT` (default: `https://fly.storage.tigris.dev`).

7. **Update deploy script** — remove volume creation step. Add Tigris bucket setup (or document manual creation via `fly storage create`).

8. **Add `aws-sdk-go-v2`** to `go.mod` (S3 client modules).

## What stays the same

- Upload handler still writes to local `/tmp` (exiftool/ffmpeg need files on disk)
- Pipeline processing happens on local disk
- PDF reports stay on Supabase Storage
- Frontend unchanged
- WebSocket progress unchanged
- ZIP download endpoint logic stays the same (just source changes from disk to Tigris)

## Flow after change

```
User uploads file
  → saved to /tmp/uploads/ (ephemeral)
  → pipeline cleans it on disk (/tmp/cleaned/)
  → cleaned file uploaded to Tigris (cleaned/{localId}.{ext})
  → local files deleted immediately
  → user downloads via presigned Tigris URL
  → Tigris lifecycle deletes object after 24h
```
