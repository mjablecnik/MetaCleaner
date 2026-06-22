#!/bin/bash
set -euo pipefail

# Deploy Supabase Edge Functions for metacleaner-web
# Prerequisites:
#   - Supabase CLI installed (npx supabase or brew install supabase/tap/supabase)
#   - Logged in: supabase login
#   - BREVO_API_KEY set in .env

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_REF="asxkfzpsxglifgmtgujx"

echo "=== MetaCleaner Web — Deploy Edge Functions ==="
echo "Project: $PROJECT_REF"
echo ""

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
  echo "Error: supabase CLI not found."
  echo "Install: https://supabase.com/docs/guides/cli/getting-started"
  exit 2
fi

# Set secrets from .env (only non-VITE_ keys with non-empty values)
ENV_FILE="$PROJECT_DIR/.env"
if [ -f "$ENV_FILE" ]; then
  echo "Setting secrets from .env (excluding VITE_* and empty values)..."

  # Filter: skip comments, empty lines, VITE_* prefixed, and keys with empty values
  SECRETS=""
  while IFS= read -r line; do
    # Skip comments and empty lines
    [[ -z "$line" || "$line" =~ ^# ]] && continue
    # Skip VITE_ prefixed variables (those are for the frontend build)
    [[ "$line" =~ ^VITE_ ]] && continue
    # Skip lines with empty values (KEY= or KEY="")
    key="${line%%=*}"
    value="${line#*=}"
    [[ -z "$value" || "$value" == '""' || "$value" == "''" ]] && continue

    SECRETS="$SECRETS $line"
  done < "$ENV_FILE"

  if [ -n "$SECRETS" ]; then
    echo "$SECRETS" | xargs supabase secrets set --project-ref "$PROJECT_REF"
  else
    echo "No secrets to set (all values empty or VITE_ prefixed)."
  fi
  echo ""
else
  echo "No .env found — skipping secret setup."
  echo "To set secrets manually:"
  echo "  supabase secrets set BREVO_API_KEY=your-key --project-ref $PROJECT_REF"
  echo ""
fi

# Deploy the send-contact-email function
echo "Deploying send-contact-email..."
supabase functions deploy send-contact-email \
  --project-ref "$PROJECT_REF" \
  --no-verify-jwt

echo ""
echo "✓ Deployment complete!"
echo ""
echo "Function URL:"
echo "  https://$PROJECT_REF.supabase.co/functions/v1/send-contact-email"
echo ""
echo "Required secrets (set via .env or 'supabase secrets set'):"
echo "  BREVO_API_KEY          — Brevo transactional email API key"
echo "  CONTACT_RECIPIENT      — (optional) Override recipient, default: hello@metacleaner.app"
echo "  CONTACT_SENDER_EMAIL   — (optional) Verified sender in Brevo, default: noreply@metacleaner.app"
