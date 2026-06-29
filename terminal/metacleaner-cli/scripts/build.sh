#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

BIN_DIR="$PROJECT_DIR/bin"
ENTRY="$PROJECT_DIR/src/index.ts"
OUTPUT="$BIN_DIR/metacleaner"

echo "Building MetaCleaner CLI..."

mkdir -p "$BIN_DIR"
bun build "$ENTRY" --compile --outfile "$OUTPUT"

echo ""
echo "Build complete: $OUTPUT"
echo "Usage: ./bin/metacleaner scan photo.jpg"
