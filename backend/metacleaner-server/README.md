# MetaCleaner Backend

A Go HTTP server that strips hidden metadata (EXIF, GPS, camera info, timestamps, XMP, ID3, MP4 atoms) from uploaded photos and videos.

## Description

MetaCleaner Backend solves the privacy problem of hidden metadata in media files. Key features:

- Strips metadata from 20 image/video formats (JPEG, PNG, HEIC, HEIF, AVIF, TIFF, DNG, WebP, GIF, MP4, MOV, AVI, MKV, WebM, WMV, FLV, 3GP, MPEG, OGV, MTS)
- Full auth system — email/password registration, JWT sessions, OAuth (Google, Apple), magic-link, and password reset
- Stripe billing — Pro/Pro+ subscriptions, credit packs, usage metering, and webhook processing
- API key management — create, list, revoke, and rate-limit programmatic access
- Real-time WebSocket progress updates during cleaning
- PDF report generation stored in Supabase Storage; uploaded/cleaned media files stored in Tigris (S3-compatible object storage — see `DOCS.md`)
- Configurable rate limiting on upload and auth endpoints
- Automatic cleanup of temporary files and deactivated accounts
- Health check endpoint with dependency status

## Prerequisites

- [Go 1.25+](https://golang.org/dl/)
- [Docker](https://docs.docker.com/get-docker/)
- [ExifTool](https://exiftool.org/) (required for local non-Docker runs)
- [FFmpeg](https://ffmpeg.org/download.html) (required for local non-Docker runs)
- [Fly.io CLI](https://fly.io/docs/hands-on/install-flyctl/) (for cloud deployment only)
- A [Supabase](https://supabase.com/) project with the database schema applied
- A [Stripe](https://stripe.com/) account (for billing endpoints)

## Installation / Setup

1. Clone the repository and navigate to the backend directory:

```bash
cd backend/metacleaner-server
```

2. Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

At minimum, set `SUPABASE_URL`, `SUPABASE_API_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. For auth, also set `SUPABASE_JWT_SECRET`, `OAUTH_CALLBACK_URL`, `MAGIC_LINK_CALLBACK_URL`, and `FRONTEND_URL`. For billing, set the `STRIPE_*` variables. See [DOCS.md — Environment Variables](DOCS.md#environment-variables) for the full list.

3. Install Go dependencies:

```bash
go mod download
```

4. Apply the database migrations against your Supabase project:

- **New database:** Open your Supabase project → SQL Editor → paste contents of `migrations/001_full_schema.sql` → Run.
- **Existing database:** Also run `migrations/002_rename_total_time_ms.sql` (renames a column added before the unit was corrected to milliseconds).

See [DOCS.md — Database Migration](DOCS.md#database-migration) for details.

## Usage / Running

### Local development (without Docker)

Run the server directly (requires ExifTool and FFmpeg in your PATH):

```bash
go run ./cmd/
```

### Run tests

```bash
go test ./tests/ -v
```

### Local Docker

Build the image and start a container:

```bash
scripts/start-docker.sh
```

Stop the container:

```bash
scripts/stop-docker.sh
```

Verify the server is healthy:

```bash
curl http://localhost:8080/api/health
```

## Documentation

For API reference, environment variables, architecture, deployment, and troubleshooting:

📄 **[DOCS.md](./DOCS.md)**

## Author

👤 **Martin Jablečník**

- Website: [www.jablecnik.com](https://www.jablecnik.com)
- Github: [@mjablecnik](https://github.com/mjablecnik)

## Show your support

Give a ⭐️ if this project helped you!

## License

Copyright © 2025 Martin Jablečník.
This project is [MIT](LICENSE) licensed.
