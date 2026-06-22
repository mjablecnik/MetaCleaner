#!/bin/bash
set -euo pipefail

APP_NAME=$(grep '^app\s*=' fly.toml | sed 's/^app\s*=\s*"\(.*\)"/\1/' | tr -d '\r')

# Load PUBLIC_APP_URL from .env if available
if [ -f .env ]; then
  export $(grep '^PUBLIC_APP_URL=' .env | xargs) 2>/dev/null || true
fi
PUBLIC_APP_URL="${PUBLIC_APP_URL:-https://app.metacleaner.com}"

echo "Building Docker image: $APP_NAME (PUBLIC_APP_URL=$PUBLIC_APP_URL)"
# Build context is the workspace root so metacleaner-shared is available
WORKSPACE_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
docker build -t "$APP_NAME" --build-arg "PUBLIC_APP_URL=$PUBLIC_APP_URL" \
  -f "$(dirname "$0")/Dockerfile" "$WORKSPACE_ROOT"

echo "Stopping existing container (if any)..."
docker stop "$APP_NAME" 2>/dev/null || true
docker rm "$APP_NAME" 2>/dev/null || true

echo "Starting container: $APP_NAME on port 3001"
docker run -d \
  --name "$APP_NAME" \
  -p 3001:8080 \
  "$APP_NAME"

echo "Running at http://localhost:3001"
