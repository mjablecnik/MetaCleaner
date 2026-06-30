# Post-Restart Verification Checklist

Purpose: after an environment restart, verify that the things requiring a restart were actually
fixed (installing `bun`, the Playwright browsers path, and the system libraries for Chromium).

> For Claude: when the user pokes you after the restart, run the blocks below and evaluate them
> against the expected results. If something fails, propose a fix. Once verified, you may delete
> this file or keep it as a reference.

## Baseline BEFORE the restart (captured 2026-06-30)

| Check | State before restart |
|---|---|
| `bun` in PATH | ❌ NOT FOUND (user installed it, pending restart) |
| `PLAYWRIGHT_BROWSERS_PATH` | `/opt/playwright-browsers` (was read-only → EACCES on mkdir) |
| contents of `/opt/playwright-browsers` | `chromium-1228`, `chromium_headless_shell-1228`, `ffmpeg-1011` |
| `~/.playwright-browsers` | missing |
| `libnspr4` | ✅ present |
| `go` | ✅ go1.23.6 |
| `exiftool` / `ffmpeg` (system PATH) | ❌ missing (only needed to run the Go backend locally) |

---

## 1) Bun installed and on PATH

```bash
command -v bun && bun --version
```
**Expected:** prints a path (e.g. `~/.bun/bin/bun`) and a version (≥ 1.3.x).
If missing, add to PATH: `export PATH="$HOME/.bun/bin:$PATH"` (ideally also in `~/.bashrc`/`~/.profile`).

```bash
cd /workspace && bun install --dry-run 2>&1 | tail -5
```
**Expected:** runs without the `EUNSUPPORTEDPROTOCOL: workspace:` error (that was the `npm` symptom).

## 2) Playwright browsers usable (the `/opt` path was read-only)

```bash
echo "PLAYWRIGHT_BROWSERS_PATH=${PLAYWRIGHT_BROWSERS_PATH:-<unset>}"
# writing to the target path must succeed (previously EACCES):
touch "${PLAYWRIGHT_BROWSERS_PATH:-/opt/playwright-browsers}/.write-test" \
  && echo "WRITABLE OK" && rm -f "${PLAYWRIGHT_BROWSERS_PATH:-/opt/playwright-browsers}/.write-test" \
  || echo "STILL READ-ONLY — install to ~/.playwright-browsers and export that path"
ls "${PLAYWRIGHT_BROWSERS_PATH:-/opt/playwright-browsers}"
```
**Expected:** `WRITABLE OK` **or** browsers available at a writable path that `PLAYWRIGHT_BROWSERS_PATH`
points to. `chromium-1228` (and `chromium_headless_shell-1228`) must be present.

## 3) System libraries for Chromium (`libnspr4.so` was missing)

```bash
ldconfig -p | grep -E 'libnspr4|libnss3|libatk-1\.0|libgbm' || echo "MISSING — run: npx playwright install-deps chromium (root)"
```
**Expected:** all 4 libraries listed.

## 4) Real test — browser tests actually start (the strongest proof)

Run in one frontend project that has browser tests (app or monitoring):

```bash
cd /workspace/frontend/metacleaner-monitoring
PLAYWRIGHT_BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH:-$HOME/.playwright-browsers}" bun run test:unit 2>&1 | tail -20
```
**Expected:** tests start (no `libnspr4.so: cannot open shared object file`,
no `Executable doesn't exist`). Server-only assertions pass.

---

## Optional (outside points 1–3, but it comes up with the Go backend)

`metacleaner-server` requires `exiftool` + `ffmpeg` in PATH to run locally (see its CLAUDE.md).
Both are currently missing from the system PATH. If the backend will be tested locally:

```bash
command -v exiftool && command -v ffmpeg || echo "install: apt-get install -y libimage-exiftool-perl ffmpeg"
```
