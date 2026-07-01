# Test Report
Created: 2026-07-01 15:23:56 UTC
Updated: 2026-07-01 15:23:56 UTC

## Summary
- Total tests: 1416
- Passing: 1416
- Failing: 0
- Coverage: not measured (see Notes)

## Test Results
| Test File | Tests | Pass | Fail | Status |
|---|---|---|---|---|
| Vitest `server` project (47 files, node env) | 806 | 806 | 0 | ✅ Pass |
| Vitest `client` + `storybook` projects (132 files, Playwright/chromium) | 610 | 610 | 0 | ✅ Pass |
| **Total** | **1416** | **1416** | **0** | ✅ Pass |

> This is a SvelteKit/Vitest project, not Go — results are grouped by Vitest project
> (`server`, `client`, `storybook`) rather than per Go test file. The two runs cover 179 test files
> in total (47 server + 132 browser/storybook).

## Failures (if any)
- None. All 1416 tests pass.

## Uncovered (no tests)
- No coverage instrumentation was run this pass, so per-file gaps were not measured.
  Generated/config files not expected to have unit tests: `src/lib/paraglide/**` (auto-generated i18n
  runtime), `svelte.config.js`, `vite.config.ts`, and E2E specs under `e2e/` (Playwright, run separately
  via `bun run test:e2e`).

## Notes
- Server suite: `bun run test` → `vitest --run --project=server` (Node env). 47 files, 806 tests, ~29s.
- Browser suite: `PLAYWRIGHT_BROWSERS_PATH=/opt/playwright-browsers bun run test:browser`
  → `vitest --run --project=client --project=storybook` (Playwright/chromium, headless). 132 files, 610 tests, ~224s.
- Coverage reported as "not measured": the two full runs already take ~4 min combined, and a `--coverage`
  pass across the browser projects is substantially heavier. Re-run with `--coverage` (v8 provider is
  installed: `@vitest/coverage-v8`) if a coverage figure is required.
- Non-fatal warnings only (did not fail any test):
  - `metacleaner-shared` package missing a `svelte` exports condition (vite-plugin-svelte warning).
  - `vi.mock("mediainfo.js")` in `src/lib/scanner/parsers/__tests__/videoParser.test.ts` is not at module
    top level — hoisted correctly for now but will become an error in a future Vitest; worth relocating.
  - A few Svelte a11y hints (ConfirmationModal buttons, AffiliateProgramSection label,
    SettingsAccordionCard `state_referenced_locally`).
- `metacleaner-monitoring` is a separate package and is not covered by this app's suite.
