#!/bin/bash
set -euo pipefail

APP_NAME=$(grep '^app\s*=' fly.toml | sed 's/^app\s*=\s*"\(.*\)"/\1/' | tr -d '\r')

echo "Building Docker image: $APP_NAME"
docker build -t "$APP_NAME" .

echo "Stopping existing container (if any)..."
docker stop "$APP_NAME" 2>/dev/null || true
docker rm "$APP_NAME" 2>/dev/null || true

echo "Starting container: $APP_NAME on port 8080"
docker run -d \
  --name "$APP_NAME" \
  -p 8080:8080 \
  "$APP_NAME"

echo "Running at http://localhost:8080"
