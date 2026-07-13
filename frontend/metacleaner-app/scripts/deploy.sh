#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# Workspace root is two levels up from frontend/metacleaner-app/
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

echo "=== MetaCleaner App — Deployment ($ENV) ==="
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

# Parse org from fly config (if present)
FLY_ORG=$(grep '^org\s*=' "$FLY_CONFIG" | sed "s/^org\s*=\s*[\"']\(.*\)[\"']/\1/" | tr -d '\r' || true)

# Create Fly.io app if not exists
APP_EXISTS=$(fly status --app "$APP_NAME" 2>&1 || true)
if echo "$APP_EXISTS" | grep -qi "could not find app"; then
  # If org not in config, ask interactively
  if [ -z "$FLY_ORG" ]; then
    echo "Available organizations:"
    ORGS=()
    NAMES=()
    i=1
    while IFS='|' read -r slug name; do
      [ -z "$slug" ] && continue
      ORGS+=("$slug")
      NAMES+=("$name")
      echo "  $i) $name ($slug)"
      i=$((i + 1))
    done < <(fly orgs list --json | jq -r 'to_entries[] | "\(.key)|\(.value)"')
    echo ""
    printf "Select organization for $APP_NAME [1-${#ORGS[@]}]: "
    read -r ORG_NUM
    FLY_ORG="${ORGS[$((ORG_NUM - 1))]}"
    if [ -z "$FLY_ORG" ]; then
      echo "ERROR: Invalid selection" >&2
      exit 2
    fi
  fi
  echo "Creating app $APP_NAME (org: $FLY_ORG)..."
  fly apps create "$APP_NAME" --org "$FLY_ORG"
  echo "✓ App $APP_NAME created"
else
  echo "✓ App $APP_NAME already exists"
fi

# Read build args from env file
# SvelteKit bakes PUBLIC_* env vars at build time, so they must be passed as --build-arg
echo ""
echo "Reading build args from $ENV_FILE..."
BUILD_ARGS=""
while IFS= read -r line; do
  [[ -z "$line" || "$line" == \#* ]] && continue
  KEY="${line%%=*}"
  VALUE="${line#*=}"
  [[ -z "$VALUE" ]] && continue
  echo "  Build arg: $KEY"
  BUILD_ARGS="$BUILD_ARGS --build-arg $KEY=$VALUE"
done < "$ENV_FILE"

# Deploy from workspace root (Dockerfile uses COPY paths relative to workspace root)
echo ""
echo "Deploying $APP_NAME from workspace root..."
cd "$WORKSPACE_ROOT"

fly deploy \
  --config "frontend/metacleaner-app/$FLY_CONFIG" \
  --dockerfile "frontend/metacleaner-app/Dockerfile" \
  --app "$APP_NAME" \
  $BUILD_ARGS

echo ""
echo "=== ✓ $APP_NAME deployed successfully ==="
echo "URL: https://$APP_NAME.fly.dev"
