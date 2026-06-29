#!/bin/bash
set -euo pipefail

# Deploy Supabase Edge Functions for metacleaner-web
# Usage:
#   ./scripts/deploy-functions.sh              # defaults to development
#   ./scripts/deploy-functions.sh --env dev    # development
#   ./scripts/deploy-functions.sh --env prod   # production

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Project refs
DEV_PROJECT_REF="asxkfzpsxglifgmtgujx"
PROD_PROJECT_REF="asxkfzpsxglifgmtgujx"  # TODO: Replace with production project ref when available

# Parse --env argument
DEPLOY_ENV="development"
while [[ $# -gt 0 ]]; do
  case $1 in
    --env)
      shift
      case "${1:-}" in
        prod|production) DEPLOY_ENV="production" ;;
        dev|development) DEPLOY_ENV="development" ;;
        *) echo "Error: Invalid environment '$1'. Use 'dev' or 'prod'."; exit 2 ;;
      esac
      shift
      ;;
    *)
      echo "Error: Unknown argument '$1'. Usage: $0 [--env dev|prod]"
      exit 2
      ;;
  esac
done

# Select project ref based on environment
if [ "$DEPLOY_ENV" = "production" ]; then
  # Refuse to deploy to production while PROD_PROJECT_REF is still the
  # placeholder dev ref — this prevents dev and prod from sharing the same
  # backend, which would conflate secrets, data, and CORS configuration.
  if [ "$PROD_PROJECT_REF" = "$DEV_PROJECT_REF" ]; then
    echo "Error: PROD_PROJECT_REF is still set to the dev project ref."
    echo "  Set a real, separate production project ref in this script before deploying."
    echo "  Current value: $PROD_PROJECT_REF"
    exit 1
  fi
  PROJECT_REF="$PROD_PROJECT_REF"
  ENV_FILE="$PROJECT_DIR/.env.production"
else
  PROJECT_REF="$DEV_PROJECT_REF"
  ENV_FILE="$PROJECT_DIR/.env"
fi

echo "=== MetaCleaner Web — Deploy Edge Functions ==="
echo "Environment: $DEPLOY_ENV"
echo "Project:     $PROJECT_REF"
echo "Env file:    $ENV_FILE"
echo ""

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
  echo "Error: supabase CLI not found."
  echo "Install: https://supabase.com/docs/guides/cli/getting-started"
  exit 2
fi

# Set secrets from env file
if [ -f "$ENV_FILE" ]; then
  echo "Setting secrets from $(basename "$ENV_FILE") (excluding VITE_* and empty values)..."

  SECRETS=""
  while IFS= read -r line; do
    [[ -z "$line" || "$line" =~ ^# ]] && continue
    [[ "$line" =~ ^VITE_ ]] && continue
    key="${line%%=*}"
    value="${line#*=}"
    [[ -z "$value" || "$value" == '""' || "$value" == "''" ]] && continue
    SECRETS="$SECRETS $line"
  done < "$ENV_FILE"

  # Always set ENVIRONMENT secret
  SECRETS="$SECRETS ENVIRONMENT=$DEPLOY_ENV"

  if [ -n "$SECRETS" ]; then
    echo "$SECRETS" | xargs supabase secrets set --project-ref "$PROJECT_REF"
  fi
  echo ""
else
  echo "No env file found at $ENV_FILE — setting ENVIRONMENT secret only."
  supabase secrets set "ENVIRONMENT=$DEPLOY_ENV" --project-ref "$PROJECT_REF"
  echo ""
fi

# Deploy the send-contact-email function
echo "Deploying send-contact-email..."
supabase functions deploy send-contact-email \
  --project-ref "$PROJECT_REF"

echo ""
echo "✓ Deployment complete! ($DEPLOY_ENV)"
echo ""
echo "Function URL:"
echo "  https://$PROJECT_REF.supabase.co/functions/v1/send-contact-email"
echo ""
echo "Secrets set:"
echo "  ENVIRONMENT=$DEPLOY_ENV"
echo "  BREVO_API_KEY (from env file)"
echo "  CONTACT_RECIPIENT (from env file, if set)"
echo "  CONTACT_SENDER_EMAIL (from env file, if set)"
