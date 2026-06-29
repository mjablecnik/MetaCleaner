#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

APP_NAME=$(grep '^app\s*=' fly.toml | sed 's/^app\s*=\s*["\x27]\(.*\)["\x27]/\1/' | tr -d '\r')

echo "Stopping container: $APP_NAME"
docker stop "$APP_NAME" 2>/dev/null || true
docker rm "$APP_NAME" 2>/dev/null || true
