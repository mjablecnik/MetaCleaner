#!/bin/bash
set -euo pipefail

APP_NAME=$(grep '^app\s*=' fly.toml | sed 's/^app\s*=\s*"\(.*\)"/\1/' | tr -d '\r')

# Load PUBLIC_API_URL from .env if available
if [ -f .env ]; then
  export $(grep '^PUBLIC_API_URL=' .env | xargs) 2>/dev/null || true
fi
PUBLIC_API_URL="${PUBLIC_API_URL:-http://localhost:8080}"

echo "Building Docker image: $APP_NAME (PUBLIC_API_URL=$PUBLIC_API_URL)"
docker build -t "$APP_NAME" --build-arg "PUBLIC_API_URL=$PUBLIC_API_URL" .

echo "Stopping existing container (if any)..."
docker stop "$APP_NAME" 2>/dev/null || true
docker rm "$APP_NAME" 2>/dev/null || true

echo "Starting container: $APP_NAME on port 3000"
docker run -d \
  --name "$APP_NAME" \
  -p 3000:8080 \
  "$APP_NAME"

echo "Running at http://localhost:3000"
