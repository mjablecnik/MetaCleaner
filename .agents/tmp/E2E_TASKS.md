# E2E Tasks

## Phase 1 — Fix failing tests

- [x] Fix `src/lib/auth/__tests__/authGuard.test.ts` — 2 tests fail with `ReferenceError: window is not defined`. The `guardAuthRoute` function accesses `window.location.pathname` on line 42 after the `browser` guard passes (because the test mocks `browser` as `true`). Fix: either mock `window.location` in the test setup, or move the test to the `client` vitest project which provides a DOM environment.

## Phase 2 — Create missing E2E tests

- [x] Create E2E test for `/email-verified` page (`e2e/email-verified.spec.ts`) — assert: animated checkmark hero, progress stepper (3 steps with current highlighted), stats row, "What's next" action cards with CTA buttons, trust badges. Responsive: mobile 375px (single column), desktop 1280px (two-column layout with left info panel). Navigation: verify CTA links navigate correctly.
