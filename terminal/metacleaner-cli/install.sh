#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

BINARY_SRC="${SCRIPT_DIR}/bin/metacleaner"
BINARY_DST="${HOME}/.local/bin/metacleaner"

COMPLETION_SRC="${SCRIPT_DIR}/completions/_metacleaner"
COMPLETION_DST="${HOME}/.zsh/completions/_metacleaner"

if [[ ! -f "${BINARY_SRC}" ]]; then
  echo "Error: binary not found at ${BINARY_SRC}. Run build.sh first." >&2
  exit 2
fi

mkdir -p "${HOME}/.local/bin"
cp "${BINARY_SRC}" "${BINARY_DST}"
chmod +x "${BINARY_DST}"

if [[ ! -f "${COMPLETION_SRC}" ]]; then
  echo "Warning: completion file not found at ${COMPLETION_SRC}. Skipping completion installation."
else
  mkdir -p "${HOME}/.zsh/completions"
  cp "${COMPLETION_SRC}" "${COMPLETION_DST}"
  echo "Installed: ${COMPLETION_DST}"
fi

echo "Installed: ${BINARY_DST}"
