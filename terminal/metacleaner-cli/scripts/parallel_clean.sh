#!/bin/bash
set -euo pipefail

# ============================================================================
# parallel_clean.sh — Clean multiple files on the server in parallel
#
# Each file gets its own upload → job → poll → download cycle running
# concurrently. Results are printed as they complete.
#
# Usage:
#   ./scripts/parallel_clean.sh [OPTIONS] [FILES...]
#
# Options:
#   --server <url>     Server URL (default: $METACLEANER_SERVER_URL or http://localhost:8080)
#   --email <email>    Login email (default: $METACLEANER_EMAIL)
#   --password <pass>  Login password (default: $METACLEANER_PASSWORD)
#   --token <jwt>      Use an existing JWT token (skips login)
#   --output <dir>     Output directory for cleaned files (default: ./images/cleaned)
#   --timeout <sec>    Max seconds to wait per job (default: 60)
#   --max-parallel <n> Max concurrent jobs (default: 4)
#   -h, --help         Show this help
#
# If no files are specified, all images from ./images/data/ are used.
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Load .env if present
if [ -f "$PROJECT_DIR/.env" ]; then
  set -a
  source "$PROJECT_DIR/.env"
  set +a
fi

# Defaults
SERVER_URL="${METACLEANER_SERVER_URL:-http://localhost:8080}"
EMAIL="${METACLEANER_EMAIL:-}"
PASSWORD="${METACLEANER_PASSWORD:-}"
TOKEN=""
OUTPUT_DIR="$PROJECT_DIR/images/cleaned"
TIMEOUT=60
MAX_PARALLEL=4
FILES=()

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Disable colors if not a TTY
if [ ! -t 1 ]; then
  RED='' GREEN='' YELLOW='' CYAN='' NC=''
fi

usage() {
  echo "Usage: $(basename "$0") [OPTIONS] [FILES...]"
  echo ""
  echo "Clean multiple files on the MetaCleaner server in parallel."
  echo ""
  echo "Options:"
  echo "  --server <url>      Server URL (default: \$METACLEANER_SERVER_URL or http://localhost:8080)"
  echo "  --email <email>     Login email (default: \$METACLEANER_EMAIL)"
  echo "  --password <pass>   Login password (default: \$METACLEANER_PASSWORD)"
  echo "  --token <jwt>       Use an existing JWT token (skips login)"
  echo "  --output <dir>      Output directory (default: ./images/cleaned)"
  echo "  --timeout <sec>     Max wait per job (default: 60)"
  echo "  --max-parallel <n>  Max concurrent jobs (default: 4)"
  echo "  -h, --help          Show this help"
  echo ""
  echo "If no files are specified, all images from ./images/data/ are used."
  echo ""
  echo "Environment variables:"
  echo "  METACLEANER_SERVER_URL   Server URL"
  echo "  METACLEANER_EMAIL        Login email"
  echo "  METACLEANER_PASSWORD     Login password"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --server)
      SERVER_URL="$2"
      shift 2
      ;;
    --email)
      EMAIL="$2"
      shift 2
      ;;
    --password)
      PASSWORD="$2"
      shift 2
      ;;
    --token)
      TOKEN="$2"
      shift 2
      ;;
    --output)
      OUTPUT_DIR="$2"
      shift 2
      ;;
    --timeout)
      TIMEOUT="$2"
      shift 2
      ;;
    --max-parallel)
      MAX_PARALLEL="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    -*)
      echo -e "${RED}Error: Unknown option $1${NC}" >&2
      usage >&2
      exit 2
      ;;
    *)
      FILES+=("$1")
      shift
      ;;
  esac
done

# If no files specified, use all from images/data/
if [ ${#FILES[@]} -eq 0 ]; then
  for f in "$PROJECT_DIR"/images/data/*; do
    [ -f "$f" ] && FILES+=("$f")
  done
fi

if [ ${#FILES[@]} -eq 0 ]; then
  echo -e "${RED}Error: No files found to process.${NC}" >&2
  exit 2
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Health check
echo -e "${CYAN}Checking server health at ${SERVER_URL}...${NC}"
if ! curl -sf "${SERVER_URL}/api/health" > /dev/null 2>&1; then
  echo -e "${RED}Error: Server at ${SERVER_URL} is not reachable.${NC}" >&2
  echo -e "${YELLOW}Make sure the backend is running (./start-docker.sh or 'go run ./cmd/').${NC}" >&2
  exit 2
fi
echo -e "${GREEN}Server is healthy.${NC}"

# Authenticate if no token provided
if [ -z "$TOKEN" ]; then
  if [ -z "$EMAIL" ] || [ -z "$PASSWORD" ]; then
    echo -e "${RED}Error: Authentication required.${NC}" >&2
    echo -e "${YELLOW}Provide --email and --password, or set METACLEANER_EMAIL and METACLEANER_PASSWORD in .env${NC}" >&2
    echo -e "${YELLOW}Alternatively, provide --token with an existing JWT.${NC}" >&2
    exit 2
  fi

  echo -e "${CYAN}Logging in as ${EMAIL}...${NC}"
  LOGIN_RESPONSE=$(curl -s --max-time 15 -X POST "${SERVER_URL}/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}" \
    2>&1)
  LOGIN_EXIT=$?

  if [ "$LOGIN_EXIT" -ne 0 ]; then
    echo -e "${RED}Error: Login request failed (curl exit code: ${LOGIN_EXIT}).${NC}" >&2
    echo -e "${YELLOW}Response: ${LOGIN_RESPONSE}${NC}" >&2
    exit 2
  fi

  # Check if the response contains an error
  if echo "$LOGIN_RESPONSE" | grep -q '"error"'; then
    ERROR_MSG=$(echo "$LOGIN_RESPONSE" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
    echo -e "${RED}Error: Login failed — ${ERROR_MSG:-unknown error}${NC}" >&2
    exit 2
  fi

  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

  if [ -z "$TOKEN" ]; then
    echo -e "${RED}Error: Could not extract access_token from login response.${NC}" >&2
    echo -e "${YELLOW}Response: ${LOGIN_RESPONSE}${NC}" >&2
    exit 2
  fi

  echo -e "${GREEN}Authenticated successfully.${NC}"
fi

echo ""

# Export token for subprocesses
export AUTH_TOKEN="$TOKEN"
export SERVER_URL
export OUTPUT_DIR
export TIMEOUT

# Counters (use temp files for cross-process communication)
RESULTS_DIR=$(mktemp -d)
trap 'rm -rf "$RESULTS_DIR"' EXIT

# Function to process a single file
process_file() {
  local file_path="$1"
  local file_name
  file_name=$(basename "$file_path")
  local result_file="$RESULTS_DIR/$file_name.result"

  echo -e "${CYAN}[START]${NC} $file_name — uploading..." >&2

  # Upload
  local upload_response
  upload_response=$(curl -s --max-time 30 -X POST "${SERVER_URL}/api/upload" \
    -H "Authorization: Bearer ${AUTH_TOKEN}" \
    -F "files=@${file_path}" \
    2>&1)

  if [ $? -ne 0 ] || echo "$upload_response" | grep -q '"error"'; then
    local err_msg
    err_msg=$(echo "$upload_response" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
    echo -e "${RED}[FAIL]${NC} $file_name — upload failed${err_msg:+ ($err_msg)}" >&2
    echo "error" > "$result_file"
    return 1
  fi

  local file_id
  file_id=$(echo "$upload_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

  if [ -z "$file_id" ]; then
    echo -e "${RED}[FAIL]${NC} $file_name — could not parse file ID from upload response" >&2
    echo "error" > "$result_file"
    return 1
  fi

  echo -e "${CYAN}[UPLOAD]${NC} $file_name — uploaded (id: ${file_id:0:8}...)" >&2

  # Create job
  local job_response
  job_response=$(curl -s --max-time 15 -X POST "${SERVER_URL}/api/jobs" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${AUTH_TOKEN}" \
    -d "{\"fileIds\":[\"$file_id\"]}" \
    2>&1)

  if [ $? -ne 0 ] || echo "$job_response" | grep -q '"error"'; then
    local err_msg
    err_msg=$(echo "$job_response" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
    echo -e "${RED}[FAIL]${NC} $file_name — job creation failed${err_msg:+ ($err_msg)}" >&2
    echo "error" > "$result_file"
    return 1
  fi

  local job_id
  job_id=$(echo "$job_response" | grep -o '"jobId":"[^"]*"' | cut -d'"' -f4)

  if [ -z "$job_id" ]; then
    echo -e "${RED}[FAIL]${NC} $file_name — could not parse job ID" >&2
    echo "error" > "$result_file"
    return 1
  fi

  echo -e "${CYAN}[JOB]${NC} $file_name — job created (id: ${job_id:0:8}...)" >&2

  # Poll for completion
  local elapsed=0
  local status="processing"

  while [ "$status" = "processing" ] && [ "$elapsed" -lt "$TIMEOUT" ]; do
    sleep 1
    elapsed=$((elapsed + 1))

    local status_response
    status_response=$(curl -s --max-time 10 "${SERVER_URL}/api/jobs/${job_id}" \
      -H "Authorization: Bearer ${AUTH_TOKEN}" \
      2>/dev/null) || continue

    status=$(echo "$status_response" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
  done

  if [ "$status" != "completed" ]; then
    if [ "$elapsed" -ge "$TIMEOUT" ]; then
      echo -e "${RED}[TIMEOUT]${NC} $file_name — timed out after ${TIMEOUT}s" >&2
    else
      echo -e "${RED}[FAIL]${NC} $file_name — job status: $status" >&2
    fi
    echo "error" > "$result_file"
    return 1
  fi

  # Download cleaned file
  local output_path="${OUTPUT_DIR}/${file_name%.*}_cleaned.${file_name##*.}"
  curl -s --max-time 30 "${SERVER_URL}/api/files/${file_id}/download" \
    -H "Authorization: Bearer ${AUTH_TOKEN}" \
    -o "$output_path" 2>/dev/null || {
    echo -e "${RED}[FAIL]${NC} $file_name — download failed" >&2
    echo "error" > "$result_file"
    return 1
  }

  # Verify the file was actually downloaded (not an error response)
  if [ ! -s "$output_path" ]; then
    echo -e "${RED}[FAIL]${NC} $file_name — downloaded file is empty" >&2
    rm -f "$output_path"
    echo "error" > "$result_file"
    return 1
  fi

  local original_size cleaned_size
  original_size=$(wc -c < "$file_path" | tr -d ' ')
  cleaned_size=$(wc -c < "$output_path" | tr -d ' ')

  echo -e "${GREEN}[DONE]${NC} $file_name — cleaned (${original_size} → ${cleaned_size} bytes) → $(basename "$output_path")" >&2
  echo "success" > "$result_file"
}

export -f process_file
export RED GREEN YELLOW CYAN NC RESULTS_DIR

# Run jobs in parallel with concurrency limit
echo -e "${CYAN}Processing ${#FILES[@]} files (max ${MAX_PARALLEL} parallel)...${NC}"
echo "────────────────────────────────────────────────────────────────"

START_TIME=$(date +%s)

# Use a simple semaphore with background jobs
running=0
for file in "${FILES[@]}"; do
  process_file "$file" &
  running=$((running + 1))

  if [ "$running" -ge "$MAX_PARALLEL" ]; then
    wait -n 2>/dev/null || true
    running=$((running - 1))
  fi
done

# Wait for remaining jobs
wait

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# Count results
success_count=0
error_count=0
for result_file in "$RESULTS_DIR"/*.result; do
  [ -f "$result_file" ] || continue
  if [ "$(cat "$result_file")" = "success" ]; then
    success_count=$((success_count + 1))
  else
    error_count=$((error_count + 1))
  fi
done

# Summary
echo ""
echo "════════════════════════════════════════════════════════════════"
echo -e "${CYAN}Summary:${NC}"
echo -e "  Total files:    ${#FILES[@]}"
echo -e "  ${GREEN}Successful:${NC}    $success_count"
[ "$error_count" -gt 0 ] && echo -e "  ${RED}Failed:${NC}        $error_count"
echo -e "  Duration:       ${DURATION}s"
echo -e "  Output:         $OUTPUT_DIR"
echo "════════════════════════════════════════════════════════════════"

if [ "$error_count" -gt 0 ]; then
  exit 1
fi
exit 0
