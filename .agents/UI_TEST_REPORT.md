# Test Report
Created: 2026-06-19T05:26:00+00:00
Updated: 2026-07-01T16:42:00+00:00

Project: **frontend/metacleaner-web** (SvelteKit 2 / Svelte 5 + Vite + Tailwind v4,
Paraglide i18n, adapter-static). E2E via Playwright (`**/*.e2e.{ts,js}`, build + `vite preview`
on :4173, headless Chromium). Run command: `npx playwright test`.

## Summary
- Total E2E tests: 97
- Passing E2E tests: 93
- Failing E2E tests: 4
- Total component stories: 0 (no runner — see note below; 35 `*.stories.svelte` source files exist)
- Passing component stories: 0 (N/A — no catalog runner installed)
- Failing component stories: 0 (N/A — no catalog runner installed)

## E2E Test Coverage
| Page/Route | Test File | Status |
|---|---|---|
| `/` (home) | `e2e/home.e2e.ts` | ✅ Pass (9/9) |
| `/features` | `e2e/features.e2e.ts` | ✅ Pass (4/4) |
| `/pricing` | `e2e/pricing.e2e.ts` | ✅ Pass (10/10) |
| `/about` (+ contact form) | `e2e/about.e2e.ts` | ⚠️ Partial (8/9 — 1 fail) |
| `/privacy` | `e2e/privacy.e2e.ts` | ✅ Pass (3/3) |
| `/terms` | `e2e/terms.e2e.ts` | ✅ Pass (3/3) |
| 404 / error (`+error.svelte`) | `e2e/error.e2e.ts` | ⚠️ Partial (3/6 — 3 fail) |
| Cross-page navigation (navbar + footer legal/company links) | `e2e/navigation.e2e.ts` | ✅ Pass (16/16) |
| Mobile menu / hamburger drawer | `e2e/mobile-menu.e2e.ts` | ✅ Pass (9/9) |
| Responsive layout (375px / 1280px, all 6 pages) | `e2e/responsive.e2e.ts` | ✅ Pass (28/28) |

Route coverage: **every** page/route (`/`, `/features`, `/pricing`, `/about`, `/privacy`,
`/terms`, 404) has a dedicated E2E suite, plus cross-cutting navigation, mobile-menu, and
responsive suites. `/sitemap.xml` is a server endpoint covered by a Vitest unit test
(`src/routes/sitemap.xml/__tests__/server.test.ts`), not E2E.

## Component Test Coverage
No component-catalog test runner is installed. There are **35 `*.stories.svelte`** files
(Storybook CSF, `@storybook/addon-svelte-csf` imports), but **Storybook / Ladle / Histoire are
not dependencies and there is no `.storybook/` config**, so the stories cannot be built or
run as tests. Per the pipeline rules, no component catalog is detected → no component
stories are executed, and no `COMPONENT_TESTS.md` / `COMPONENT_TASKS.md` were produced.

| Component | Story File | States Covered | Status |
|---|---|---|---|
| — | — | — | N/A — no catalog runner installed |

## Uncovered (no tests)
- **Component stories** — 35 `*.stories.svelte` files exist but have no executable runner
  (no Storybook/Ladle/Histoire). They are documentation-only until a catalog runner is added.
- **`/cs/*` Czech-locale mirror** — no dedicated E2E suite (English is forced via
  `PARAGLIDE_LOCALE` in every suite). Locale routing itself is exercised indirectly.
- All application routes otherwise have E2E coverage.

## Notes
- **4 failing E2E tests — all are test-authoring (locator) bugs in the freshly generated
  `error.e2e.ts` / `about.e2e.ts`, NOT application regressions.** Root causes and fixes:
  1. `about.e2e.ts:17` "hero shows Privacy is / a fundamental right" — `getByText(/Privacy is/)`
     is an unanchored regex that also matches the Story-section paragraph ("…privacy is…") →
     **strict-mode violation (2 elements)**. Fix: assert the hero via
     `getByRole('heading', { name: /a fundamental right/ })` or scope to the hero section and
     use `{ exact: true }` on the `<span>`.
  2. `error.e2e.ts:29` "shows the 404 number" — `getByText('404', { exact: true })` matches
     **both** the badge `<span>404</span>` and the big `<p>404</p>` → strict-mode violation.
     Fix: scope to the number, e.g. `page.getByRole('paragraph').filter({ hasText: /^404$/ })`
     or `page.locator('p.four-zero-four')`.
  3. `error.e2e.ts:34` "Quick Links: Try Free, …" — the quick-link `<a>` accessible names carry
     a **leading space from the Font Awesome `<i>` icon** (rendered as `" Try Free"`, `" Features"`,
     …), so `getByRole('link', { name: 'Try Free', exact: true })` finds nothing. Fix: drop
     `exact: true` (substring match) or scope to the Quick-links grid and match by `hasText`.
  4. `error.e2e.ts:43` "Features quick link navigates to /features" — `getByRole('link',
     { name: 'Features', exact: true })` resolves to **2 elements** (navbar + footer both have a
     "Features" link) → strict-mode violation; the quick-link itself is also `" Features"` (space).
     Fix: scope to the Quick-links grid container before matching, and use a non-exact/`hasText`
     name.
  These mirror the exact gotchas documented in `.agents/AGENT_NOTES.md` (Font Awesome
  accessible-name noise; dual navbar/footer markup causing strict-mode violations). The
  generated `error.e2e.ts` did not apply container-scoping / non-exact matching there.
- The previously-failing `pricing.e2e.ts` "Pro+ CTA" assertion (stale "Coming soon" text) was
  fixed to assert "Activate Pro+ →"; `pricing.e2e.ts` is now 10/10.
- New this run: `about.e2e.ts` (incl. contact-form validation/success/rate-limit/server-error
  with `page.route('**/functions/v1/send-contact-email', …)` mocks), `privacy.e2e.ts`,
  `terms.e2e.ts`, `error.e2e.ts`; `navigation.e2e.ts` extended with footer legal/company link
  navigation; `responsive.e2e.ts` extended to cover `/about`, `/privacy`, `/terms`.
- **Recommendation:** have the E2E generation step fix the 4 `error.e2e.ts` / `about.e2e.ts`
  locators above (container-scope + drop `exact` on FA-icon links) to reach 97/97 green, and
  consider adding a component-catalog runner if the 35 stories should be executed as tests.
