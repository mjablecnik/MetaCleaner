# TASKS — metacleaner-app unit/integration tests

Derived from TEST_SPEC.md. Scope: unit + integration only (no E2E / Storybook / visual).
All tasks target the Vitest **server** project (`bun run test`) and must mock all
external dependencies (no network/storage). Follow existing `__tests__/` + `vi.hoisted`
conventions.

## Phase 0 — Cleanup
- [ ] No orphaned/broken tests found — nothing to remove. (No task.)

## Phase 1 — High priority (core logic without coverage)
- [ ] None. All core business logic (auth, clients, repositories, scanner, services, stores, utils) already has coverage.

## Phase 2 — Medium priority (edge cases, error handling)
- [x] [MEDIUM] Create `src/routes/subscription/__tests__/page.load.test.ts` — test `subscription/+page.ts` `load()`: returns `{ plan, billing }`; `billing` defaults to `'monthly'` (absent) and passes through `'yearly'`; builds `returnTo` as `/subscription?plan=<enc>&billing=<enc>` when `plan` present and `/subscription` when absent; URL-encodes special chars; asserts the `returnTo` arg passed to a mocked `guardProtectedRoute`.
- [x] [MEDIUM] Extend `src/lib/auth/__tests__/authGuard.test.ts` — add coverage for the two untested `auth-guard.ts` branches: (a) `guardProtectedRoute(returnTo)` redirects to `/login?returnTo=<encodeURIComponent(returnTo)>` when unauthenticated (verify encoding of `?`/`&`/`/`); (b) `guardAuthRoute()` does NOT redirect when authenticated and `window.location.pathname === '/email-verified'`, but DOES on other paths.

## Phase 3 — Low priority (utilities, simple logic)
- [x] [LOW] Create `src/routes/__tests__/layout.guards.test.ts` — verify each protected `+layout.ts` (`settings`, `docs`, `report`, `reports`) `load()` invokes mocked `guardProtectedRoute` (and `docs` passes `'/docs'`), and `(auth)/+layout.ts` `load()` invokes `guardAuthRoute`. Pure-delegation coverage — optional; include only for full route-load coverage.
