#!/usr/bin/env bash
#
# check-patterns.sh — grep-based guard for recurring code-pattern bugs.
# See ../../.agents/AGENT_NOTES.md (section 3) for the rationale behind each check.
#
# Usage:
#   bash scripts/check-patterns.sh          # HARD checks only — gates (exit 1 on findings). Wired into `bun run lint`.
#   bash scripts/check-patterns.sh --all     # HARD + WARN checks. WARN findings are informational (do not change exit code).
#
# HARD checks are kept low-false-positive on purpose so they can gate CI.
# WARN checks are noisier and need a human eye, so they never fail the build.

set -uo pipefail

# Run from the package root regardless of where the script is invoked from.
cd "$(dirname "$0")/.." || exit 2

SRC="src"
[ -d "$SRC" ] || { echo "check-patterns: no src/ directory — nothing to check"; exit 0; }

EXCLUDE=(--exclude-dir=paraglide)   # generated i18n runtime — never our code
HARD_FAILS=0

red()  { printf '\033[31m%s\033[0m\n' "$1"; }
grn()  { printf '\033[32m%s\033[0m\n' "$1"; }
ylw()  { printf '\033[33m%s\033[0m\n' "$1"; }
hdr()  { printf '\n— %s\n' "$1"; }

# Report a hard finding: print the matches and bump the failure counter.
report_hard() {
  local title="$1"; shift
  local matches="$1"
  if [ -n "$matches" ]; then
    red "✗ $title"
    printf '%s\n' "$matches" | sed 's/^/    /'
    HARD_FAILS=$((HARD_FAILS + 1))
  else
    grn "✓ $title"
  fi
}

echo "check-patterns: scanning $SRC/ ($(pwd | sed 's#.*/##'))"

# ─────────────────────────── HARD CHECKS ───────────────────────────

# [1] invalidate('key') without a matching depends('key') → retry/refresh button is a silent no-op.
hdr "[1] invalidate() must have a matching depends()"
keys=$( { grep -rhoE "invalidate\('[^']+'" "$SRC" "${EXCLUDE[@]}" 2>/dev/null | sed -E "s/invalidate\('//; s/'$//";
          grep -rhoE 'invalidate\("[^"]+"' "$SRC" "${EXCLUDE[@]}" 2>/dev/null | sed -E 's/invalidate\("//; s/"$//'; } | sort -u )
if [ -z "$keys" ]; then
  grn "✓ (no invalidate() calls)"
else
  missing=""
  while IFS= read -r k; do
    [ -z "$k" ] && continue
    grep -rqE "depends\(\s*['\"]${k}['\"]" "$SRC" "${EXCLUDE[@]}" 2>/dev/null || missing+="invalidate('$k') has no depends('$k')"$'\n'
  done <<< "$keys"
  report_hard "every invalidate() key has a depends()" "${missing%$'\n'}"
fi

# [2] Runtime Tailwind arbitrary classes (w-[${..}], max-w-[${..}], etc.) are never compiled → zero-size element.
#     Signal: a JS interpolation `${` inside an arbitrary-value bracket `[...]` after a utility prefix.
#     Matches any prefix and any position on the line; static values like w-[50%] are correctly skipped.
hdr "[2] no runtime Tailwind arbitrary classes — use style=\"width:{x}%\""
m=$(grep -rnE -- '-\[[^]]*\$\{' "$SRC" "${EXCLUDE[@]}" 2>/dev/null)
report_hard "no <prefix>-[\${..}] arbitrary class strings" "$m"

# [3] tx(...) || 'fallback' hides missing i18n keys (tx already returns the key name when missing).
hdr "[3] no tx(...) || 'fallback'"
m=$(grep -rnE "tx\([^)]*\)\s*\|\|" "$SRC" "${EXCLUDE[@]}" 2>/dev/null)
report_hard "no || fallback after tx()" "$m"

# [4] Bare `locale.current;` (without void) trips ESLint no-unused-expressions.
hdr "[4] reactive locale dependency must be 'void locale.current;'"
m=$(grep -rnE "^\s*locale\.current;\s*\$" "$SRC" "${EXCLUDE[@]}" 2>/dev/null)
report_hard "no bare locale.current; (use 'void')" "$m"

# ─────────────────────────── WARN CHECKS (--all) ───────────────────────────

if [ "${1:-}" = "--all" ]; then
  echo
  echo "── WARN checks (informational; need a human eye) ──"

  # [5] Literal text in aria-label / title / placeholder bypasses i18n.
  #     Stories (*.stories.svelte) legitimately pass literal demo props, so exclude them.
  hdr "[5] literal aria-label/title/placeholder (should be tx()/{m...})"
  m=$(grep -rnE '(aria-label|title|placeholder)="[A-Za-z]' "$SRC" \
        --include='*.svelte' --exclude='*.stories.svelte' "${EXCLUDE[@]}" 2>/dev/null)
  if [ -n "$m" ]; then ylw "⚠ review these (some literals like a brand name are fine):"; printf '%s\n' "$m" | sed 's/^/    /'; else grn "✓ none"; fi

  # [6] window./document. without a typeof guard in .svelte.ts modules → breaks node test env.
  hdr "[6] window./document. without typeof guard in *.svelte.ts"
  m=$(grep -rnE '\b(window|document)\.' "$SRC" \
        --include='*.svelte.ts' --exclude='*.test.ts' --exclude='*.spec.ts' "${EXCLUDE[@]}" 2>/dev/null \
        | grep -vE 'typeof (window|document)')
  if [ -n "$m" ]; then ylw "⚠ confirm each is browser-only or guarded:"; printf '%s\n' "$m" | sed 's/^/    /'; else grn "✓ none"; fi
fi

# ─────────────────────────── RESULT ───────────────────────────

echo
if [ "$HARD_FAILS" -gt 0 ]; then
  red "check-patterns: $HARD_FAILS hard check(s) failed"
  exit 1
fi
grn "check-patterns: all hard checks passed"
exit 0
