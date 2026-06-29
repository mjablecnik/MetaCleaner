#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

APP_NAME=$(grep '^app\s*=' fly.toml | sed 's/^app\s*=\s*["\x27]\(.*\)["\x27]/\1/' | tr -d '\r')

./scripts/build.sh

echo "Stopping existing container (if any)..."
docker stop "$APP_NAME" 2>/dev/null || true
docker rm "$APP_NAME" 2>/dev/null || true

echo "Starting container: $APP_NAME on port 3002"
docker run -d \
  --name "$APP_NAME" \
  --env-file .env \
  -p 3002:3000 \
  "$APP_NAME"

echo "Running at http://localhost:3002"
