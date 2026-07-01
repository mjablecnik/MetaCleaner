# TEST_SPEC — metacleaner-app (unit / integration)

Generated 2026-07-01. Scope: unit + integration tests only. E2E, Storybook stories,
and visual regression are **out of scope** (handled by the ui-tests pipeline).

## Detected tooling & conventions

- **Framework / language**: SvelteKit SPA (adapter-static), TypeScript, Svelte 5 runes.
- **Test runner**: Vitest 4, configured in `vite.config.ts` with three projects:
  - `server` — `environment: 'node'`, includes `src/**/*.{test,spec}.{js,ts}`, excludes `*.svelte.{test,spec}.*`. Run via `bun run test`. **This is the reliable CI command and the target for all tasks below.**
  - `client` — browser (Playwright chromium), `src/**/*.svelte.{test,spec}.{js,ts}`. (component tests — out of scope here)
  - `storybook` — story tests (out of scope here)
- **Assertion / mocking**: Vitest `expect` (`requireAssertions: true` — every test must assert), `vi.mock` / `vi.hoisted` / `vi.fn`. Property tests use `fast-check` (`*.property.test.ts`).
- **File naming**: co-located `__tests__/` dirs next to source; `*.test.ts` for node/server logic, `*.svelte.spec.ts` for browser/component, `*.property.test.ts` for fast-check.
- **Key mocking rules** (from `frontend/metacleaner-app/CLAUDE.md` + AGENT_NOTES):
  - `vi.mock` path must match the import path exactly — **no `.js` extension for `.svelte.ts` files**.
  - `vi.hoisted()` required for mock fns referenced in `vi.mock()` factories.
  - Mock SvelteKit app modules: `vi.mock('$app/environment', () => ({ browser: true }))`, `vi.mock('$app/paths', () => ({ resolve: (p) => p }))`, `vi.mock('@sveltejs/kit', () => ({ redirect: mockRedirect }))`.
  - `new Response('', { status: 204 })` throws in Node — use `status: 200` for mocks.
  - Tests must run with no external services — mock all network/storage.

## Coverage overview

Coverage is **extensive and mature**. Nearly every source module with logic has a
co-located test. Confirmed well-covered areas (no action needed):

- `lib/auth/*` — api-client, auth-guard (partial, see gaps), auth.svelte, deep-link, token-utils (+ antiEnumeration, concurrentRefresh property tests)
- `lib/clients/*` — accountClient, api-config, apiKeysClient, billingClient, metaCleanerApi
- `lib/repositories/*` — auth, docs, language, settings, user (+ docs property test)
- `lib/scanner/*` — aiDetector, metadataParser, riskAnalyzer, scannerStore, formatDetector, imageParser, videoParser (+ extraction, scanPipeline)
- `lib/services/apiCleaningService` (+ preservation property test)
- `lib/shared/utils/*` — creditCost, creditPlural, formatCredits, planStyleMap (all via `creditUtils.property.test`), format, i18n, planHierarchy, reportStyles, riskStyles
- `lib/stores/*` — appState, billingStore, cleaningResultsStore
- `lib/locale.svelte.ts`, `routes/settings/validation.ts`

**Not testable / correctly untested** (no task created):

- `lib/services/cleaningService.ts` — interfaces & type declarations only, zero runtime logic.
- `lib/index.ts` — barrel re-exports.
- `lib/types/*.ts`, `lib/scanner/types.ts` — type declarations only.
- `lib/scanner/constants.ts` — constant values only.
- `routes/+layout.ts` — `export const ssr = false` config only.
- `lib/vitest-examples/*` — scaffold examples.

**Orphaned / broken tests**: none found. No test references the removed
`fileRepository` / `processingRepository` / `reportRepository` modules.
`routes/__tests__/layout.navProps.test.ts` tests self-contained inline pure logic
(documents intended navProps behavior) — it is not orphaned.

## Missing test groups (sorted by priority)

### [MEDIUM] `routes/subscription/+page.ts` — `load()` — NO coverage
The only route load function with real branching logic; currently untested.
- **Behavior to verify**:
  - When `plan` search param present: returns `{ plan, billing }` and calls `guardProtectedRoute` with `returnTo = /subscription?plan=<enc>&billing=<enc>` (both values `encodeURIComponent`-encoded).
  - When `plan` absent: `returnTo === '/subscription'`, returns `{ plan: null, billing }`.
  - `billing` defaults to `'monthly'` when the `billing` param is absent; passes through `'yearly'` when present.
  - Special characters in `plan`/`billing` are URL-encoded in `returnTo`.
- **Inputs**: mock `{ url: new URL('http://x/subscription?plan=pro&billing=yearly') }` etc.
- **Expected outputs**: return object + asserted argument to `guardProtectedRoute`.
- **Mocking**: `vi.mock('$lib/auth/auth-guard.js', () => ({ guardProtectedRoute: vi.fn() }))`; assert the mock's call arg. No network.
- **File**: `src/routes/subscription/__tests__/page.load.test.ts` (server project).

### [MEDIUM] `lib/auth/auth-guard.ts` — untested branches (extend existing `authGuard.test.ts`)
Existing test only exercises the no-arg / default paths. Two branches have zero coverage.
- **`guardProtectedRoute(returnTo)` — returnTo branch**: when unauthenticated AND `returnTo` provided, redirect target is `/login?returnTo=<encodeURIComponent(returnTo)>` (verify encoding of a value containing `?`, `&`, `/`). Assert `resolve` receives the encoded path and `redirect(302, ...)` is called with it.
- **`guardAuthRoute()` — `/email-verified` exception**: when authenticated AND `window.location.pathname === '/email-verified'`, `redirect` is **not** called (page allowed to land); when authenticated on any other path it IS called. Requires stubbing `window.location.pathname` (e.g. `vi.stubGlobal` / `Object.defineProperty`).
- **Mocking**: reuse the existing hoisted `mockRedirect`, `mockResolve`, `authState` harness in `authGuard.test.ts`.
- **File**: extend `src/lib/auth/__tests__/authGuard.test.ts`.

### [LOW] Protected-route `+layout.ts` guard delegations — NO coverage
`routes/settings/+layout.ts`, `routes/docs/+layout.ts`, `routes/report/+layout.ts`,
`routes/reports/+layout.ts` each call `guardProtectedRoute(...)`; `routes/(auth)/+layout.ts`
calls `guardAuthRoute()`. Thin wrappers over the (tested) guard, but the delegation +
redirect-arg is uncovered.
- **Behavior to verify**: each `load()` awaits the correct guard; `docs/+layout.ts` passes the `'/docs'` returnTo argument.
- **Mocking**: `vi.mock('$lib/auth/auth-guard.js', () => ({ guardProtectedRoute: vi.fn(), guardAuthRoute: vi.fn() }))`; assert call + arg.
- **File**: one grouped `src/routes/__tests__/layout.guards.test.ts` (server project).
- **Note**: low value (pure delegation) — include only if aiming for full route-load coverage.
