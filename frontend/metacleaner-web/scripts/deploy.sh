#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# Workspace root is two levels up from frontend/metacleaner-web/
WORKSPACE_ROOT="$(cd "$PROJECT_DIR/../.." && pwd)"

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

echo "=== MetaCleaner Web — Deployment ($ENV) ==="
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

# Read build args from env file
# SvelteKit bakes PUBLIC_* and VITE_* env vars at build time
# Only pass vars that are used as ARG in the Dockerfile
echo ""
echo "Reading build args from $ENV_FILE..."
BUILD_ARGS=""

# These are the ARGs defined in the Dockerfile
DOCKERFILE_ARGS="PUBLIC_APP_URL VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY"

while IFS= read -r line; do
  [[ -z "$line" || "$line" == \#* ]] && continue
  KEY="${line%%=*}"
  VALUE="${line#*=}"
  [[ -z "$VALUE" ]] && continue
  # Only pass keys that match Dockerfile ARGs
  if echo "$DOCKERFILE_ARGS" | grep -qw "$KEY"; then
    echo "  Build arg: $KEY"
    BUILD_ARGS="$BUILD_ARGS --build-arg $KEY=$VALUE"
  else
    echo "  Skipping $KEY (not a Dockerfile ARG)"
  fi
done < "$ENV_FILE"

# Deploy from workspace root (Dockerfile uses COPY paths relative to workspace root)
echo ""
echo "Deploying $APP_NAME from workspace root..."
cd "$WORKSPACE_ROOT"

fly deploy \
  --config "frontend/metacleaner-web/$FLY_CONFIG" \
  --dockerfile "frontend/metacleaner-web/Dockerfile" \
  --app "$APP_NAME" \
  $BUILD_ARGS

echo ""
echo "=== ✓ $APP_NAME deployed successfully ==="
echo "URL: https://$APP_NAME.fly.dev"
