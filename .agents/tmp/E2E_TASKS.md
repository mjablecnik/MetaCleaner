# E2E (Playwright) Tasks — `frontend/metacleaner-app`

Run with: `PLAYWRIGHT_BROWSERS_PATH=/opt/playwright-browsers npx playwright test`
(headless Chromium; `webServer` builds + previews on :4173 automatically).

## Phase 0 — Cleanup

- [x] No orphaned E2E tests to remove (all 23 specs target existing routes).

## Phase 1 — Fix failing tests

> The suite is broadly red after the auth/route refactor. Two systemic causes (see `E2E_TESTS.md`):
> (1) `/`, `/reports`, `/report`, `/docs`, `/settings`, `/subscription` are now `guardProtectedRoute()`-protected;
> (2) `auth.svelte.ts._restore()` purges `mc_access_token` and only authenticates via a silent
> `POST /api/auth/refresh` exchange of `mc_refresh_token`. Tests must authenticate by mocking that endpoint.

### 1a — Shared auth bootstrap (prerequisite for most Group-A fixes)
- [x] Create `e2e/helpers/auth.ts` exporting `injectAuth(page)` that (a) `addInitScript` sets
      `localStorage` `mc_refresh_token` + far-future `mc_token_expires_at`, and (b) `page.route('**/api/auth/refresh', …)`
      returns `{ access_token, refresh_token, expires_in: 3600, user }`. Also mock `**/api/auth/me`.
      (See the snippet in `E2E_TESTS.md`.) Call it in `beforeEach` **before** any `goto`.

### 1b — Group A: authenticated specs (add `injectAuth` + existing API mocks)
- [x] Fix `step1-upload.spec.ts` — `injectAuth` before `goto('/')`; the `#dropzone-file-input` 30 s timeout disappears once the wizard renders.
- [x] Fix `step1-to-step2-transition.spec.ts` — `injectAuth` + `mockUploadApi`.
- [x] Fix `step2-risk-analysis.spec.ts` — `injectAuth` + `mockAllApis`.
- [x] Fix `step2-to-step5-complete-flow.spec.ts` — `injectAuth` + `mockAllApis` + `mockWebSocketProgress`.
- [x] Fix `step3-processing.spec.ts` — `injectAuth` + `mockJobsApi` + `mockWebSocketProgress`.
- [x] Fix `step3-cancel.spec.ts` — `injectAuth` + job mocks.
- [x] Fix `step4-error.spec.ts` — `injectAuth` + `mockWebSocketProgress(page,'error')`.
- [x] Fix `step5-results.spec.ts` — `injectAuth` + `mockAllApis` (success WS).
- [x] Fix `step5-report-navigation.spec.ts` — `injectAuth` + report mocks.
- [x] Fix `file-removal.spec.ts` — `injectAuth` before `goto('/')`.
- [x] Fix `file-validation.spec.ts` — `injectAuth`; then re-assert the toast/reject behaviour.
- [x] Fix `responsive.spec.ts` — `injectAuth` for the `/` and protected-route cases.
- [x] Fix `navigation.spec.ts` — `injectAuth`; re-verify wizard→report and report→reports links.
- [x] Fix `reports.spec.ts` — `injectAuth` before `goto('/reports')` (redirects to `/login` otherwise).
- [x] Fix `report-detail.spec.ts` — `injectAuth` before `goto('/report/rpt-001')`.
- [x] Fix `hamburger-menu.spec.ts` — `injectAuth` (authenticated NavBar/menu on `/`).
- [x] Fix `docs-sidebar-highlight.spec.ts` — **replace** its `injectAuth` (sets `mc_access_token`,
      now purged, no refresh mock) with the new helper so `aside` renders; all 17 tests are failing.

### 1c — Group B: public auth-page specs (selector/text drift from the UI refactor)
- [x] Fix `email-verified.spec.ts` — `'Account created'` now matches 2 elements (strict-mode violation);
      scope with `getByRole('heading'|'paragraph', { name })` or `.first()`; re-verify stepper steps & stats text.
- [x] Fix `auth-navigation.spec.ts` — re-derive the login submit button's accessible name
      (now icon + `tx('auth.login.submit.idle')`); verify "Sign up"/"Sign in" navbar + footer link labels.
- [x] Fix `auth-responsive.spec.ts` — re-check `#email-input`, `#password-input`, submit-button role-name,
      branding-panel / mobile-hero visibility selectors at 375 px and 1280 px.
- [x] Fix `login.spec.ts` — re-check submit/loading text keys and any changed field/button selectors.
- [x] Fix `register.spec.ts` — same drift review (submit button, check-email content, step progress).
- [x] Fix `forgot-password.spec.ts` — re-check step-progress cards and submit button selectors.

- [ ] Before each Group-B fix, open the page (build + preview) to confirm the failure is selector
      drift, **not** a real regression. Do **not** remove the route guards — they are intended behaviour.
- [ ] Re-run the full suite and confirm 0 failures.

## Phase 2 — Create missing E2E tests

- [x] Create E2E test for **`/settings`** — `injectAuth` + mock `**/api/auth/me`, billing/plan, and
      `**/api/keys` (list/create/delete). Assert: header + plan badge, AccountInfo, ChangePassword,
      ApiKeys section (open CreateKeyModal → full key shown once; DeleteKeyModal), AffiliateProgram,
      DangerZone (AccountDeletionModal confirm gate), Toast on save. Mock: `/api/auth/refresh`,
      `/api/auth/me`, billing, `/api/keys`.
- [x] Create E2E test for **`/subscription`** — `injectAuth` + mock billing/checkout. Assert: pricing
      header, plans section, monthly/yearly toggle (`?billing=yearly`), CurrentPlanCard, Upgrade/Downgrade/
      Cancel flows opening ConfirmationModal, checkout error path. Mock: billing endpoints + checkout session.
- [x] Create E2E test for **`/subscription/success`** — `injectAuth`; assert success icon, title,
      "back to cleaning" link → `/`; mock the `fetchSubscription` + `billingStore.refresh` calls fired onMount.
- [x] Create E2E test for **`/email-changed`** — public; assert success state and the `?error=...`
      state, and the CTA ("go home" when logged in / login link when logged out).
- [x] Create a **docs content/navigation** test (or extend `navigation.spec.ts`) — with `injectAuth`,
      assert each docs page renders (`/docs`, `/docs/auth`, `/docs/endpoints`, `/docs/errors`) and the
      sidebar links navigate between them.
- [x] Extend the **navigation test** — authenticated UserDropdown links to `/reports`, `/docs`,
      `/subscription`, `/settings`, and logout.
- [ ] Create **responsive** assertions for each new page (`/settings`, `/subscription`,
      `/subscription/success`, `/email-changed`) at mobile 375 px and desktop 1280 px.

> Notes:
> - Mock data must be **static** (reuse `mock-api.ts` fixtures; no random values).
> - All specs run headless without X11/Wayland.
> - Browser/app default locale is **English** — assert against English text.
> - Avoid strict-mode violations: prefer `getByRole(..., { name })` / `{ exact: true }` / `.first()`
>   for text that appears in both mobile and desktop variants.
