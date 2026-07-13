#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# Resolve environment from $1 (dploy passes env as first positional arg)
ENV="${1:-prod}"

# Select fly config and env file based on environment
if [ "$ENV" = "prod" ]; then
  FLY_CONFIG="fly.toml"
  ENV_FILE=".env.prod"
else
  FLY_CONFIG="fly.${ENV}.toml"
  ENV_FILE=".env.${ENV}"
fi

echo "=== MetaCleaner Server — Deployment ($ENV) ==="
echo ""

# Validate all required files exist
MISSING=()
[ ! -f "$FLY_CONFIG" ] && MISSING+=("$FLY_CONFIG")
[ ! -f "$ENV_FILE" ] && MISSING+=("$ENV_FILE")
[ ! -f "Dockerfile" ] && MISSING+=("Dockerfile")

if [ ${#MISSING[@]} -gt 0 ]; then
  echo "ERROR: Required files not found in $PROJECT_DIR:"
  for f in "${MISSING[@]}"; do
    echo "  ✗ $f"
  done
  exit 2
fi

echo "✓ Config:     $FLY_CONFIG"
echo "✓ Env:        $ENV_FILE"
echo "✓ Dockerfile"

# Parse app name from fly config
APP_NAME=$(grep '^app\s*=' "$FLY_CONFIG" | sed "s/^app\s*=\s*[\"']\(.*\)[\"']/\1/" | tr -d '\r')

if [ -z "$APP_NAME" ]; then
  echo "ERROR: Could not parse app name from $FLY_CONFIG"
  exit 2
fi

echo ""
echo "App: $APP_NAME"
echo ""

# Parse org from fly config (if present), default to "personal"
FLY_ORG=$(grep '^org\s*=' "$FLY_CONFIG" | sed "s/^org\s*=\s*[\"']\(.*\)[\"']/\1/" | tr -d '\r' || true)
FLY_ORG="${FLY_ORG:-personal}"

# Create Fly.io app if not exists
APP_EXISTS=$(fly status --app "$APP_NAME" 2>&1 || true)
if echo "$APP_EXISTS" | grep -qi "could not find app"; then
  echo "Creating app $APP_NAME (org: $FLY_ORG)..."
  fly apps create "$APP_NAME" --org "$FLY_ORG"
  echo "✓ App $APP_NAME created"
else
  echo "✓ App $APP_NAME already exists"
fi

# Check if volume exists (backend needs a mount for temp storage)
if fly volumes list --app "$APP_NAME" 2>/dev/null | grep -q "metacleaner_tmp"; then
  echo "✓ Volume metacleaner_tmp already exists"
else
  echo "Creating volume metacleaner_tmp (1GB, fra)..."
  fly volumes create metacleaner_tmp --region fra --size 1 --app "$APP_NAME" -y
  echo "✓ Volume created"
fi

# Extract keys already in fly config [env] section (non-secret config)
FLY_ENV_KEYS=$(sed -n '/^\[env\]/,/^\[/p' "$FLY_CONFIG" | grep '=' | sed 's/\s*=.*//' | tr -d '\r')

# Set secrets from env file (skip keys already in fly config [env])
echo ""
echo "Setting secrets from $ENV_FILE..."
SECRETS_ARGS=""
while IFS= read -r line; do
  [[ -z "$line" || "$line" == \#* ]] && continue
  KEY="${line%%=*}"
  VALUE="${line#*=}"
  [[ -z "$VALUE" ]] && continue
  if echo "$FLY_ENV_KEYS" | grep -qx "$KEY"; then
    echo "  Skipping $KEY (already in $FLY_CONFIG [env])"
    continue
  fi
  echo "  Setting $KEY"
  SECRETS_ARGS="$SECRETS_ARGS $KEY=$VALUE"
done < "$ENV_FILE"

if [ -n "$SECRETS_ARGS" ]; then
  fly secrets set $SECRETS_ARGS --app "$APP_NAME" --stage
  echo "✓ Secrets staged"
else
  echo "  No secrets to set"
fi

# Deploy (staged secrets are applied automatically during deploy)
echo ""
echo "Deploying $APP_NAME..."
fly deploy --config "$FLY_CONFIG" --app "$APP_NAME"

echo ""
echo "=== ✓ $APP_NAME deployed successfully ==="
echo "URL: https://$APP_NAME.fly.dev"
