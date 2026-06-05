#!/usr/bin/env bash
set -euo pipefail

APP_NAME=$(grep '^app' fly.toml | head -1 | sed "s/app *= *['\"]\\(.*\\)['\"]$/\\1/")
if [[ -z "$APP_NAME" ]]; then
    echo "Error: could not parse app name from fly.toml" >&2
    exit 1
fi

echo "Building Docker image: $APP_NAME"
docker build -t "$APP_NAME" .

echo "Stopping existing container (if any)"
docker stop "$APP_NAME" 2>/dev/null || true
docker rm "$APP_NAME" 2>/dev/null || true

PORT=${PORT:-8080}

echo "Starting container: $APP_NAME on port $PORT"
docker run -d \
    --name "$APP_NAME" \
    --env-file .env \
    -p "${PORT}:${PORT}" \
    "$APP_NAME"

echo "Container started. Logs:"
docker logs -f "$APP_NAME"
