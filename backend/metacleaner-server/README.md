# MetaCleaner Backend

A Go HTTP server that strips hidden metadata (EXIF, GPS, camera info, timestamps, XMP, ID3, MP4 atoms) from uploaded photos and videos. It uses ExifTool for images and FFmpeg for videos, provides real-time WebSocket progress updates, stores job history in Supabase, generates PDF cleaning reports, and runs as a Docker container on Fly.io.

## Description

MetaCleaner Backend solves the privacy problem of hidden metadata in media files. Key features:

- Strips metadata from 20 image/video formats (JPEG, PNG, HEIC, HEIF, AVIF, TIFF, DNG, WebP, GIF, MP4, MOV, AVI, MKV, WebM, WMV, FLV, 3GP, MPEG, OGV, MTS)
- Real-time WebSocket progress updates during cleaning
- PDF report generation stored in Supabase Storage
- Configurable rate limiting on upload endpoint
- Automatic cleanup of temporary files
- Health check endpoint with dependency status

## Prerequisites

- [Go 1.23+](https://golang.org/dl/)
- [Docker](https://docs.docker.com/get-docker/)
- [ExifTool](https://exiftool.org/) (required for local non-Docker runs)
- [FFmpeg](https://ffmpeg.org/download.html) (required for local non-Docker runs)
- [Fly.io CLI](https://fly.io/docs/hands-on/install-flyctl/) (for cloud deployment only)
- A [Supabase](https://supabase.com/) project with the database schema applied

## Installation / Setup

1. Clone the repository and navigate to the backend directory:

```bash
cd backend/metacleaner-server
```

2. Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` and set `SUPABASE_URL` and `SUPABASE_API_KEY` to your Supabase project values. All other variables have sensible defaults.

3. Install Go dependencies:

```bash
go mod download
```

4. Apply the database migration against your Supabase project (run once):

Open your Supabase project → SQL Editor → paste contents of `scripts/migration.sql` → Run.

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

## Deployment

### Fly.io

1. Authenticate with Fly.io:

```bash
flyctl auth login
```

2. Run the deployment script:

```bash
scripts/deploy.sh
```

3. Deploy:

```bash
flyctl deploy
```

Useful commands:

```bash
fly logs --app metacleaner-server    # View logs
fly status --app metacleaner-server  # Check status
fly ssh console --app metacleaner-server  # SSH into container
```

## Documentation

For detailed API reference, architecture diagrams, environment variables, and troubleshooting:

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
