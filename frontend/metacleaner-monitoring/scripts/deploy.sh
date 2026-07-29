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

echo "=== MetaCleaner Monitoring — Deployment ($ENV) ==="
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

# If org is not set in fly config, prompt user to choose
if [ -z "$FLY_ORG" ]; then
  echo "No org specified in $FLY_CONFIG."
  echo "Fetching available organizations..."
  echo ""

  # Get org slugs from fly orgs list output
  # Output format: columns are space-padded (Name, Slug, Type)
  # Skip header (line 1) and separator (line 2), extract Slug column
  ORG_OUTPUT=$(fly orgs list 2>/dev/null)
  # Find slug column position from header
  SLUG_START=$(echo "$ORG_OUTPUT" | head -1 | grep -bo 'Slug' | cut -d: -f1)
  TYPE_START=$(echo "$ORG_OUTPUT" | head -1 | grep -bo 'Type' | cut -d: -f1)
  SLUG_LEN=$((TYPE_START - SLUG_START))
  # Extract slug values (skip first 2 lines: header + separator), trim whitespace
  ORGS=($(echo "$ORG_OUTPUT" | tail -n +3 | cut -c$((SLUG_START+1))-$((SLUG_START+SLUG_LEN)) | sed 's/[[:space:]]*$//' | grep -v '^$' | grep -v '^-'))

  if [ ${#ORGS[@]} -eq 0 ]; then
    echo "ERROR: No organizations found. Are you logged in? (fly auth login)" >&2
    exit 1
  elif [ ${#ORGS[@]} -eq 1 ]; then
    FLY_ORG="${ORGS[0]}"
    echo "Only one org available: $FLY_ORG"
  else
    # Also extract org names for display
    NAME_LEN=$((SLUG_START))
    ORG_NAMES=()
    while IFS= read -r line; do
      NAME=$(echo "$line" | cut -c1-$NAME_LEN | sed 's/[[:space:]]*$//')
      [ -n "$NAME" ] && [ "$NAME" != "----" ] && [ "$NAME" != "Name" ] && ORG_NAMES+=("$NAME")
    done <<< "$(echo "$ORG_OUTPUT" | tail -n +3)"

    echo "Select organization:"
    for i in "${!ORGS[@]}"; do
      echo "  $((i+1))) ${ORG_NAMES[$i]:-${ORGS[$i]}} (${ORGS[$i]})"
    done
    echo ""
    while true; do
      printf "Choice [1-${#ORGS[@]}]: " >&2
      read -r CHOICE < /dev/tty
      CHOICE=$(echo "$CHOICE" | tr -d '[:space:]')
      if [[ "$CHOICE" =~ ^[0-9]+$ ]] && [ "$CHOICE" -ge 1 ] && [ "$CHOICE" -le ${#ORGS[@]} ]; then
        FLY_ORG="${ORGS[$((CHOICE-1))]}"
        break
      fi
      echo "Invalid choice. Try again."
    done
  fi

  # Save org to fly config so next deploy doesn't ask again
  sed -i "s/^app\s*=.*/&\norg = \"$FLY_ORG\"/" "$FLY_CONFIG"
  echo "✓ Saved org = \"$FLY_ORG\" to $FLY_CONFIG"
  echo ""
fi

# Create Fly.io app if not exists
APP_EXISTS=$(fly status --app "$APP_NAME" 2>&1 || true)
if echo "$APP_EXISTS" | grep -qi "could not find app"; then
  echo "Creating app $APP_NAME (org: $FLY_ORG)..."
  fly apps create "$APP_NAME" --org "$FLY_ORG"
  echo "✓ App $APP_NAME created"
else
  echo "✓ App $APP_NAME already exists"
fi

# Extract keys already in fly config [env] section (non-secret config)
FLY_ENV_KEYS=$(sed -n '/^\[env\]/,/^\[/p' "$FLY_CONFIG" | grep '=' | sed 's/\s*=.*//' | tr -d '\r')

# Set secrets from env file (skip keys already in fly config [env])
echo ""
echo "Setting secrets from $ENV_FILE..."
SECRETS_ARGS=""
while IFS= read -r line; do
  line="${line//$'\r'/}"
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
