# MetaCleaner Backend

A Go HTTP server that strips hidden metadata (EXIF, GPS, camera info, timestamps, XMP, ID3, MP4 atoms) from uploaded photos and videos. It uses ExifTool for images and FFmpeg for videos, provides real-time WebSocket progress updates, stores job history in Supabase, generates PDF cleaning reports, and runs as a Docker container on Fly.io.

## Prerequisites

- [Go 1.22+](https://golang.org/dl/)
- [Docker](https://docs.docker.com/get-docker/)
- [ExifTool](https://exiftool.org/) (required for local non-Docker runs)
- [FFmpeg](https://ffmpeg.org/download.html) (required for local non-Docker runs)
- [Fly.io CLI](https://fly.io/docs/hands-on/install-flyctl/) (required for cloud deployment only)
- A [Supabase](https://supabase.com/) project with the database schema applied (see [DOCS.md](DOCS.md#database-migration))

## Setup

1. Clone the repository and navigate to the backend directory:

```bash
cd backend/metacleaner-server
```

2. Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` and set `SUPABASE_URL` and `SUPABASE_API_KEY` to your Supabase project values. All other variables have sensible defaults.

3. Apply the database migration against your Supabase project (run once):

```sql
-- Paste and run scripts/migration.sql in the Supabase SQL editor
```

See [DOCS.md — Database Migration](DOCS.md#database-migration) for details.

## Local Development (without Docker)

Install Go dependencies:

```bash
go mod download
```

Run the server directly (requires ExifTool and FFmpeg in your PATH):

```bash
go run .
```

Run the test suite:

```bash
go test ./...
```

## Local Docker Usage

Build the image and start a container using the provided script:

```bash
./start-docker.sh
```

This script reads environment variables from `.env`, builds the Docker image, stops any running container with the same name, and starts a fresh one. The server is exposed on the port defined in `.env` (default `8080`).

Verify the server is healthy:

```bash
curl http://localhost:8080/api/health
```

## Fly.io Deployment

1. Authenticate with Fly.io:

```bash
flyctl auth login
```

2. Run the setup script to create the app (if needed) and push secrets from `.env`:

```bash
./fly-setup.sh
```

The script skips keys already defined in `fly.toml [env]` (non-sensitive config) and sets the rest as Fly.io secrets.

3. Deploy:

```bash
flyctl deploy
```

The app is configured in `fly.toml`. Health checks run against `/api/health`.

## Documentation

Full API reference, environment variables table, project structure, testing guide, and troubleshooting:

📄 **[DOCS.md](DOCS.md)**

## Author

Martin Jablečník — [martin.jablecnik@gmail.com](mailto:martin.jablecnik@gmail.com)

## Support

Report issues at the project repository. For Supabase-related questions, refer to the [Supabase documentation](https://supabase.com/docs).

## License

MIT
