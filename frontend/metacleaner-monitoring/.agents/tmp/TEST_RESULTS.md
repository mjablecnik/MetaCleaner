# Test Results — metacleaner-monitoring

**All unit tests pass.**

## Summary

| Suite | Test Files | Tests | Passing | Failing |
|-------|-----------|-------|---------|---------|
| vitest `client` (browser/chromium) | 1 | 1 | 1 | 0 |
| vitest `server` (node) | 22 | 359 | 359 | 0 |
| **Unit total** | **23** | **360** | **360** | **0** |

- **Total unit tests:** 360
- **Passing:** 360
- **Failing:** 0
- Duration: ~16s

Test runner: **Vitest 4.1.9** (two projects defined in `vite.config.ts`: `client` browser tests via Playwright provider, and `server` node tests).
Command: `npx vitest --run`

## Failures

None. All 360 unit tests pass.

## E2E (Playwright) — not executed

The Playwright e2e suite (`npm run test:e2e`, testMatch `**/*.e2e.{ts,js}`, 1 file:
`src/routes/demo/playwright/page.svelte.e2e.ts`) could **not run** in this environment.

- **Reason:** the dev web server fails to start — `[FATAL] Missing required
  configuration: Missing required environment variables: SUPABASE_URL,
  SUPABASE_SERVICE_KEY. The dashboard cannot start without Supabase configuration.`
- This is an environment/configuration issue (missing secrets), **not a test
  failure**. No e2e assertions were evaluated.
