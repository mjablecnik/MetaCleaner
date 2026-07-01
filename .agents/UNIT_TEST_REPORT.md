# Test Report
Created: 2026-07-01 15:23:56 UTC
Updated: 2026-07-01 17:17 UTC

## Summary
- Total tests: 137
- Passing: 137
- Failing: 0
- Coverage: 100% of executed source (Statements 72/72, Branches 34/34, Functions 21/21, Lines 68/68). Only files imported by the unit tests are measured; Svelte components and route pages are excluded (validated by the Playwright E2E suite, not unit tests).

## Test Results
| Test File | Tests | Pass | Fail | Status |
|---|---|---|---|---|
| src/lib/utils/__tests__/brevoClient.test.ts | 9 | 9 | 0 | ✅ Pass |
| src/lib/utils/__tests__/contactFormValidation.test.ts | 24 | 24 | 0 | ✅ Pass |
| src/lib/repositories/__tests__/features.test.ts | 13 | 13 | 0 | ✅ Pass |
| src/lib/repositories/__tests__/staticRepos.test.ts | 24 | 24 | 0 | ✅ Pass |
| src/lib/repositories/__tests__/pricing.test.ts | 13 | 13 | 0 | ✅ Pass |
| src/lib/repositories/__tests__/index.test.ts | 11 | 11 | 0 | ✅ Pass |
| src/lib/repositories/__tests__/metadataDemo.test.ts | 10 | 10 | 0 | ✅ Pass |
| src/lib/__tests__/i18n.test.ts | 3 | 3 | 0 | ✅ Pass |
| src/__tests__/hooks.server.test.ts | 9 | 9 | 0 | ✅ Pass |
| src/__tests__/hooks.test.ts | 6 | 6 | 0 | ✅ Pass |
| src/__tests__/csp-nginx-compat.test.ts | 5 | 5 | 0 | ✅ Pass |
| src/routes/sitemap.xml/__tests__/server.test.ts | 10 | 10 | 0 | ✅ Pass |
| **Total** | **137** | **137** | **0** | ✅ Pass |

## Failures (if any)
- None. All 137 tests passed.

## Uncovered (no tests)
The unit suite covers utilities, repositories, hooks, i18n, CSP/nginx compat, and the sitemap endpoint at 100%. The following have no unit tests (by design — the `client` Vitest project defines a browser runner but currently has zero `*.svelte.test.ts` files; UI is validated by the Playwright E2E suite in `e2e/`):
- Svelte components under `src/lib/components/` (elements, shared) and `src/lib/shared/sections/SiteFooter.svelte`
- Route page components under `src/routes/` (home, about/contact, features, pricing, privacy, terms, 404)
- Generated i18n runtime `src/lib/paraglide/**` (auto-generated — not tested directly)

## Notes
- Command: `bun run test:unit -- --run --coverage` (Vitest 4.1.8, v8 coverage provider).
- The Vitest config defines two projects: `server` (node env) and `client` (Playwright/chromium browser). All 137 tests ran under `server`; the `client` project matched 0 files (`passWithNoTests`), so no browser tests exist in this package yet.
- Duration ~3.0s.
- Non-fatal build warning: `metacleaner-shared` has a `svelte` field in package.json but no `svelte` exports condition (vite-plugin-svelte warning). Cosmetic; does not affect test results.
- Coverage percentages reflect only source files imported by the unit tests; coverage `all`/`include` is not configured, so untested source files are not part of the denominator. Component/page coverage is provided separately by the Playwright E2E suite (`bun run test:e2e`).
- Note: a prior version of this file reported ~1416 tests across `server`/`client`/`storybook` projects with `src/lib/scanner/**` paths — those belong to a different package (`metacleaner-app`), not `metacleaner-web`. This report reflects the `frontend/metacleaner-web` suite only.
