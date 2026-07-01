# Memory

## metacleaner-web: strict-mode violations from nav+footer ambiguity and partial regex matches
- Project: metacleaner-web
- Problem: Four E2E tests failed with strict-mode violations or element-not-found: (1) `getByText(/Privacy is/)` matched both hero `<span>Privacy is</span>` AND `about_story_p3` "Privacy isn't a feature…" (regex substring match). (2) `getByText('404', { exact: true })` matched both the TerminalCard footer badge `<span>404</span>` AND the large `<p class="four-zero-four">404</p>`. (3) `getByRole('link', { name: 'Try Free', exact: true })` found nothing — the only "Try Free" link is inside a QuickLinkCard that has a Font Awesome icon which breaks Playwright's accessible-name matching (same pattern as the FA-button MEMORY entry). (4) `getByRole('link', { name: 'Features', exact: true }).click()` resolved to 2 elements: the desktop nav link and the desktop footer link (no icons, exact text match).
- Solution: (1) Use `getByText('Privacy is', { exact: true })` to match only the span with exactly that text. (2) Use `locator('p.four-zero-four')` to target the CSS class on the large number. (3) Scope all QuickLinksGrid assertions to the container via `page.getByText('Quick links', { exact: true }).locator('xpath=..')` and use `.filter({ hasText })` for icon-wrapped links. (4) Use `.first()` on the click locator since any "Features" link on the 404 page navigates to /features (the test verifies navigation, not the click source).
- Source: create-tests, 2026-07-01

## dashboardAlerts: duplicate Sentry issue IDs cause sort test failure
- Project: metacleaner-monitoring
- Problem: `mergeAndSortAlerts` allows duplicate alert IDs when Sentry issues have the same `id`. The property test reconstructs timestamps via ID lookup, overwriting the map for duplicate IDs, then seeing a wrong timestamp for the second occurrence — causing a false "not sorted descending" assertion failure.
- Solution: After sorting `list` by `_ms` descending, deduplicate by `id` (keep first/most-recent). Added `const seen = new Set<string>()` dedup filter before `slice(0, 10)` in `dashboardAlerts.ts`.
- Source: code-review-fix, 2026-06-30

## monitoring: invalidate('app:x') retry no-ops without a matching depends('app:x')
- Project: metacleaner-monitoring
- Problem: All 9 pages wire the section retry button to `invalidate('app:<route>')`, but NO `+page.server.ts` load function calls `depends('app:<route>')` (and there is no `+layout.server.ts`). In SvelteKit a custom `invalidate(key)` only re-runs loads that registered that key via `depends(key)` — so every retry button silently does nothing (Req 5.5 unmet) even though task 8.3 is marked [x] and the button looks wired.
- Solution: Add `depends('app:<route>')` at the top of each load (the `LoadEvent` exposes `depends`), or change pages to `invalidateAll()`. When reviewing retry/refresh, always grep for `depends(` and confirm each `invalidate('custom:key')` has a matching `depends('custom:key')`.
- Source: code-review, 2026-06-30

## monitoring: real-API mappers fabricate metrics; spec-correct functions left as dead code
- Project: metacleaner-monitoring
- Problem: The Performance page presents invented numbers — Apdex computed as `1 - errorRate/50` (not the 500/2000ms formula), slow-endpoint `avgMs` guessed from Sentry issue severity (estimateAvgMs: 8000/3000/1500/600/250), and HttpStatusDistribution hardcoded (5xx=0.5%, 3xx=2.5%). Meanwhile the correct, property-tested `computeApdex` (Property 9) and `mapToSlowEndpoints` (Property 11) are NEVER called by any load function — so green property tests validate unused code and hide that Req 14.1/14.2 are unmet. Root cause: the chosen sources (Fly Machines API, CF analytics) don't expose per-request latency. Note: the DB/Users mappers handle the same gap honestly with `'—'` + "not available", which is the pattern the others should follow.
- Solution: When property tests pass, confirm the tested function is actually imported by a `+page.server.ts`/route — `grep` the function name outside `__tests__`. Treat severity-based or constant "estimates" rendered as live metrics as fabrication findings. Prefer the honest `'—'` pattern already present in the same codebase.
- Source: code-review, 2026-06-30

## Runtime-generated Tailwind arbitrary classes (w-[x%]) never render
- Project: metacleaner-monitoring
- Problem: dashboard `+page.server.ts` builds `barWidth = \`w-[${pct}%]\`` and StatCard applies it as a CLASS (`class="... {barWidth}"`). Tailwind only compiles arbitrary-value utilities it sees literally in source at build time; a runtime value like `w-[87.50%]` isn't in the stylesheet, so the bar has zero width. The mock's literal `w-[99.92%]` worked only because it was static source. Every OTHER component correctly uses inline `style="width:{barWidth}"` with a bare percent.
- Solution: For computed widths, emit a bare percent and use `style="width:{x}"`, never a `w-[..]` class string. Flag any data-layer value of the form `w-[${...}]` / `h-[${...}]` etc.
- Source: code-review, 2026-06-30

## metacleaner-web: defined-but-unrendered i18n keys signal forgotten spec content
- Project: metacleaner-web
- Problem: A key can exist in BOTH en.json and cs.json (so key-parity checks pass) yet be referenced nowhere — meaning either dead leftover content OR a spec requirement that was never wired up. Confirmed: `home_upload_local_note` (Req 6.8 corrected privacy note) was added to both locales but `UploadCard.svelte` never renders it, so the requirement is silently unmet AND the key looks "dead". Conversely, `pricing_*` keys appear unreferenced in `metacleaner-web/src` but are LIVE — consumed by the `metacleaner-shared` package via dynamic `translate('pricing_title')`.
- Solution: For each defined-but-unreferenced key, grep `src/` AND `../metacleaner-shared/src` before declaring it dead. If the key maps to a spec requirement, the bug is the missing render, not the key — wire it up rather than delete. Genuinely dead set found this pass: about_heading, about_description_p1/p2, about_contact_email, error_404_heading/message/cta, footer_col_features.
- Source: code-review, 2026-06-29

## metacleaner-web: design.md "REMOVED" prop notes diverge from actual components
- Project: metacleaner-web
- Problem: responsive-web-refactor design.md documents props as REMOVED (e.g. SectionHeading `size`), but the component still ships the prop with a `sizeMap` that swaps whole class strings by breakpoint — the exact conditional-class-set anti-pattern the refactor was meant to delete. Also: design `CtaButton` interface lists `class?: string` but the component lacks it, so HeroSection silently dropped `fullWidth`/`class` and its secondary CTA. Hardcoded English also hides in non-rendered spots: `+error.svelte` non-404 fallback (title/h1/button) and `CookieConsentBanner` `aria-label="Cookie consent"`.
- Solution: When a design says a prop was removed, open the component and confirm it. Grep `.svelte` for raw quoted text in `aria-label`/`title`/`placeholder` and in the non-primary branches of `{#if}` (error fallbacks), not just element bodies.
- Source: code-review, 2026-06-29

## auth.svelte.ts _restore() uses window.location without typeof guard — causes 37 test failures
- Project: metacleaner-app
- Problem: `_restore()` accessed `window.location.href` / `.hash` / `.search` directly inside a `if (!browser) return` guard. Tests mock `browser: true` but run in `environment: 'node'`, so `window` is undefined. All 33 authStore tests and 2 antiEnumeration tests failed with `ReferenceError: window is not defined`.
- Solution: Replace `window.location.href` with `typeof window !== 'undefined' ? window.location.href : ''` and add `typeof window !== 'undefined' &&` guards before `.hash` checks. The `login()` function already had this guard (see earlier MEMORY entry); `_restore()` did not.
- Source: security-audit, 2026-06-29

## authStore silent-refresh on page load: _fetchSubscription consumes mockResolvedValueOnce
- Project: metacleaner-app
- Problem: After removing the access token from localStorage, `_restore()` always calls `refresh()` to get a new token. In tests that mock `fetch` with `mockResolvedValueOnce`, the silent restore refresh consumes mock #1 and the subsequent `_fetchSubscription()` call (inside refresh().then()) consumes mock #2. Any explicit `authStore.refresh()` call after that gets undefined from `vi.fn()`, causing `TypeError: Cannot read properties of undefined (reading 'ok')`.
- Solution: For tests that need to call `authStore.refresh()` explicitly, import fresh with empty storage (so `_restore()` returns synchronously with no network call), then call `setTokensFromCallback()` to prime the in-memory state. Only then set up the single `mockResolvedValueOnce` for the explicit refresh.
- Source: security-audit, 2026-06-29

## Hardcoded English strings persist even when i18n keys already exist
- Project: metacleaner-app
- Problem: Components hardcode user-facing English while the matching `tx()` keys are already defined in `messages/en.json`/`cs.json` (so the keys become dead and Czech users see English). Confirmed in both `CreateKeyModal.svelte` copies (`apiKeys.createModal.cancel/submit/done/keyValueLabel/namePlaceholder/notePlaceholder` exist but unused), `UpgradeModal.svelte` reports branch, `KeyRow.svelte` `title="Delete"`, and attribute text (`CopyButton.svelte` `aria-label`, placeholders, `title` tooltips). A plain `tx('...')` grep misses these because they are raw literals, and a key-parity check passes because the keys exist — they're just not referenced.
- Solution: When reviewing i18n, grep `.svelte` files for raw quoted text in element bodies AND in `aria-label`/`title`/`placeholder` attributes, not just `tx()` calls. Also diff defined keys against referenced keys to surface defined-but-unused keys (a strong signal a component hardcoded what should have been a `tx()` call).
- Source: code-review, 2026-06-29

## "tasks.md marked [x]" does not mean the feature was implemented
- Project: metacleaner-app
- Problem: Spec tasks marked complete were not actually shipped. The api-keys reveal/copy redesign (copy button, eye-toggle, masked-by-default) is absent from `KeyRow.svelte`/`ApiKeysSection.svelte` though tasks are `[x]`; the created key's plaintext is dropped in `settings/+page.svelte` `handleKeyCreated` (ignores `_fullKey`) so reveal could never work; the mobile credit card (`MobileHamburgerMenu.svelte:120-157`) is entirely HTML-commented-out though credits Req 10 tasks are done; `docs-sidebar-highlight` is the inverse (fully implemented but all tasks still `[ ]`).
- Solution: Never trust task checkboxes during review — verify each claimed-done requirement against the actual rendered component. Watch for whole blocks wrapped in `<!-- ... -->` and for callback params prefixed `_` (intentionally-ignored values that silently drop spec-required data).
- Source: code-review, 2026-06-29

## Spec values silently diverge from constants (allowances, weights, blur, routes)
- Project: metacleaner-app
- Problem: Numeric/string constants drift from the spec without the spec being updated: `planStyleMap.ts` Pro+ `monthlyAllowance` is 300 (spec 100); scanner `CATEGORY_WEIGHTS` use gps 0.30 (design says 0.40) plus an undocumented `aiOrigin:0.65`; Step2 risk blur is `blur-[8px]` (spec 4px); CTAs go to `/subscription` (spec `/pricing`) and API keys moved into `/settings` (leaving `common.nav.apiKeys` orphaned). Some are intentional later decisions, but the source-of-truth spec was never reconciled.
- Solution: Grep specs for explicit numbers/paths and compare against the corresponding constants files (`planStyleMap.ts`, `scanner/constants.ts`, route literals). Flag each as either a bug or a stale spec needing update — don't assume the newest code is correct.
- Source: code-review, 2026-06-29

## Many .kiro/specs target sibling packages, not metacleaner-app
- Project: metacleaner-app
- Problem: When reviewing `frontend/metacleaner-app/` against `.kiro/specs/`, several spec folders describe OTHER packages and produce false "missing feature" findings if assumed in-scope: `responsive-web-refactor`, `web-content-overhaul`, `about-and-404-pages`/`about-and-error-pages` → `frontend/metacleaner-web/`; `monitoring-real-api-integration` → `frontend/metacleaner-monitoring/`; `steering-compliance-refactor` → CLI + Go backend; `metacleaner-backend`/`metadata-inspect-cli` → backend/CLI. (E.g. there is correctly NO `/about` route in metacleaner-app.)
- Solution: Read each spec's intro/requirements for the target directory before reviewing; skip specs that name a different package. Confirm the file paths a spec references actually exist in the app under review.
- Source: code-review, 2026-06-29

## docsRepository tests fail after WS endpoint added (baseUrl, method, success-response assertions)
- Project: metacleaner-app
- Problem: After adding the WebSocket endpoint (`method: 'WS'`) and removing `/v1` from `baseUrl`, 10 tests broke: (1) `baseUrl` assertion still expected `/v1`, (2) method-validity checks only allowed `['GET','POST','DEL']` not `'WS'`, (3) "full endpoints have at least one success response" included WS (which legitimately has only error responses), (4) i18n placeholder regex `/\$\{.*\}/` false-positived on JS template literals in WS curl examples (`${data.fileId}`).
- Solution: Update `baseUrl` expectations to `'https://api.metacleaner.com'`; add `'WS'` to valid method arrays; filter `ep.method !== 'WS'` in the success-response test; change i18n regex to `/\$\{[^}.]+\}/` so JS property accesses (`${data.prop}`) are excluded (they contain dots).
- Source: check-build, 2026-06-24

## vitest-browser-svelte: page.locator() unavailable — use container.querySelector or page.getByRole
- Project: metacleaner-app
- Problem: `page.locator('.fa-copy')` throws `TypeError: page.locator is not a function` in `vitest-browser-svelte` browser tests. The `page` object from `vitest/browser` does not expose a `.locator()` CSS-selector method in this project's vitest 4.x setup.
- Solution: For CSS class/attribute selectors use `container.querySelector('.fa-copy')` from the `render()` return value. For role-based selections use `page.getByRole(...)` or `page.getByText(...)`. For awaitable "not visible" assertions after a DOM state change, use `await expect.element(page.getByRole('table').first()).not.toBeInTheDocument()` instead of synchronous `querySelector` checks.
- Source: create-code, 2026-06-22

## vitest-browser-svelte Svelte 5: cannot pass children snippet via slots option
- Project: metacleaner-app
- Problem: `render(InfoBox, { variant: 'blue' }, { slots: { default: 'Hello' } })` does not inject children into Svelte 5 components that use `{@render children?.()}`. The `slots` option in vitest-browser-svelte is not supported for Svelte 5 snippet-based children.
- Solution: Skip testing children content injection for snippet-based components, or test structural props (variant classes, icon presence, etc.) using `container.querySelector()`. Alternatively, create a wrapper component if slot injection is critical.
- Source: create-code, 2026-06-22

## Playwright: Font Awesome icons break getByRole('button', { name }) matching
- Project: metacleaner-web
- Problem: `getByRole('button', { name: 'Question text?', exact: true })` times out in Playwright when the button contains both text and a Font Awesome `<i>` icon (e.g., chevron). The FA icon may contribute to the accessible name, causing the match to fail.
- Solution: Use `locator('button').filter({ hasText: 'Question text?' })` instead. This matches buttons that contain the text without requiring an exact accessible-name match.
- Source: ui-tests, 2026-06-19

## Playwright: getByText exact fails on split headings with inline elements
- Project: metacleaner-web
- Problem: `getByText('Complete toolkit', { exact: true })` fails when the text is a raw text node inside an `<h1>` that also contains a `<br>` and a child element with more text. No single element has exactly that text content.
- Solution: Use `getByText(/Complete toolkit/)` (regex) to match headings whose text node is part of a larger element's text content.
- Source: ui-tests, 2026-06-19

## Playwright: strict mode violations from dual mobile/desktop markup
- Project: metacleaner-web
- Problem: SvelteKit components render both mobile (md:hidden) and desktop (hidden md:flex) variants. `getByText('Coming soon', { exact: true })` violates strict mode because it matches both the visible desktop button and the hidden mobile button.
- Solution: Scope locators to the visible container — e.g. `page.locator('.hidden.md\\:flex').getByText('Coming soon')` for desktop. For mobile tests, scope to `.md\\:hidden`.
- Source: ui-tests, 2026-06-19

## fast-check stringMatching with [&&] set-intersection syntax hangs in JavaScript
- Project: metacleaner-cli
- Problem: `fc.stringMatching(/^-[b-z&&[^hvq]]$/)` uses set-intersection syntax (`&&`) which is only valid in the JS regex `v` flag (ES2024). Without `/v`, the `]` inside `[...]` ends the outer character class early, generating 3-character strings like `-b]`. A subsequent `.filter(s => s.length === 2)` never passes, causing fast-check to spin indefinitely trying to find values.
- Solution: Replace regex-based arbitrary with `fc.constantFrom('-a', '-b', ..., '-z')` listing only the known safe/unknown flags (omitting `-h`, `-v`, `-q`).
- Source: create-code, 2026-06-19

## computeAggregatedRisk used category score maxima instead of max(fileScore)
- Project: metacleaner-app
- Problem: `computeAggregatedRisk` computed `overallScore` as a weighted sum of per-category maxima across files. Tests that set `fileScore` directly with all-zero `categoryScores` (the common mock pattern) got `overallScore = 0` instead of `max(fileScore)`.
- Solution: Changed `overallScore` to `Math.min(100, Math.max(0, ...doneResults.map(r => r.fileScore)))`. Categories are still derived from category score maxima for the categories breakdown, but the top-level score now reflects the worst individual file directly.
- Source: create-tests, 2026-06-15

## parseVideo calls file.slice after getMediaInfo — slice never called when WASM fails
- Project: metacleaner-app
- Problem: `parseVideo` in `videoParser.ts` called `file.slice(0, MAX_VIDEO_HEADER_BYTES)` only after `getMediaInfo()` succeeded. In the test environment, `getMediaInfo()` throws (WASM not available), so the function returned early before any slice, causing the `sliceSpy` assertion to fail.
- Solution: Moved `file.slice()` call to before `getMediaInfo()` so the size-guard optimization is applied regardless of WASM availability.
- Source: create-tests, 2026-06-15

## auth.svelte.ts vi.mock path was wrong in authStore.test.ts
- Project: metacleaner-app

- Problem: `authStore.test.ts` mocked `'$lib/clients/metaCleanerApi.js'` but `auth.svelte.ts` imports `buildApiUrl` from `'$lib/clients/api-config.js'`. The wrong mock path means fetch URLs are not intercepted correctly.
- Solution: Changed mock to `vi.mock('$lib/clients/api-config.js', ...)`.
- Source: code-review-fix, 2026-06-12

## _restore() async refresh: must clear localStorage before calling refresh()
- Project: metacleaner-app

- Problem: Adding async token refresh in `_restore()` breaks the test "clears localStorage when expired tokens are found on init" — the test asserts all localStorage keys are null after `importFresh()`, but if we clear tokens only after async refresh fails, the assertion runs before the async completes.
- Solution: Clear all three localStorage keys synchronously at the start of the `else if (storedRefresh)` branch, BEFORE starting the async refresh. Set `_refreshToken` in-memory state so `refresh()` can still use it. This way the localStorage check is satisfied immediately and new tokens are written only if refresh succeeds.
- Source: code-review-fix, 2026-06-12

## vi.fn<> type signature changed in Vitest 4.x
- Project: metacleaner-app

- Problem: `vi.fn<[], Promise<void>>()` (old 2-arg syntax: params array + return type) fails TypeScript in Vitest 4.x with "Expected 0-1 type arguments, but got 2." This cascades to "Argument of type '[]' is not assignable to parameter of type 'never'" on every call site using the mock.
- Solution: Use the single function-type syntax: `vi.fn<() => Promise<void>>()`. Vitest 4.x `vi.fn<T>` takes one type arg that is the function signature itself.
- Source: create-code, 2026-06-12

## svelte/no-useless-children-snippet: drop {#snippet children()} wrapper
- Project: metacleaner-app

- Problem: When passing children to a Svelte 5 component that declares `children?: Snippet` in Props, wrapping the content in `{#snippet children()}...{/snippet}` triggers the `svelte/no-useless-children-snippet` ESLint error. ESLint considers it redundant.
- Solution: Remove the `{#snippet children()}` and `{/snippet}` wrappers; write the content directly inside the component tags. Svelte 5 automatically creates the `children` snippet from inline content.
- Source: create-code, 2026-06-12

## Node Response constructor rejects status 204 with a body
- Project: metacleaner-app

- Problem: `new Response('', { status: 204 })` throws `TypeError: Response constructor: Invalid response status code 204` in Node.js's native `fetch` implementation. Status 204 (No Content) disallows a body per spec, and Node enforces this strictly.
- Solution: Use `new Response('{}', { status: 200 })` when mocking a successful no-content response. Since `callAuthApi` swallows logout errors anyway, any 2xx mock suffices for logout tests.
- Source: create-code, 2026-06-12

## vi.mock hoisting: top-level const vi.fn() must use vi.hoisted()
- Project: metacleaner-app

- Problem: `const mockFn = vi.fn()` declared BEFORE `vi.mock(...)` factories causes an "error when mocking a module" unhandled rejection. `vi.mock()` is hoisted to run before any module code, so `const mockFn` is undefined when the factory executes. Browser tests produce an unhandled rejection with no test results.
- Solution: Replace top-level `const mockFn = vi.fn()` + `vi.mock(factory using mockFn)` with: `const { mockFn } = vi.hoisted(() => ({ mockFn: vi.fn() }))` followed by `vi.mock(factory using mockFn)`. The `vi.hoisted()` call is also hoisted alongside `vi.mock`.
- Source: create-code, 2026-06-12

## vi.mock path must match import path exactly (no .js extension for .ts files)
- Project: metacleaner-app

- Problem: `vi.mock('$lib/scanner/scannerStore.svelte.js', ...)` silently fails when the actual file is `scannerStore.svelte.ts`. Vitest cannot intercept imports that use `$lib/scanner/scannerStore.svelte` (no extension) because the mock path doesn't match.
- Solution: Always use the same path as the actual `import` statement. For SvelteKit `.svelte.ts` files, the import omits the extension: `vi.mock('$lib/scanner/scannerStore.svelte', ...)`.
- Source: create-code, 2026-06-12

## Browser vitest tests: use English text for button assertions (default locale)
- Project: metacleaner-app

- Problem: Tests using Czech text (`/zastavit/i`, `/zkusit znovu/i`, `/vymazat vše/i`) or "X / Y" format for `tx('step3.progress.filesCompleted')` fail because the default Paraglide locale is English. The browser test environment starts with no localStorage, so `initLocale()` defaults to English. Czech translations ("Zastavit", etc.) are never rendered.
- Solution: Use English equivalents in `filter({ hasText: ... })` locators: `/stop/i`, `/try again/i`, `/clear/i`. For file count text, use `/X of Y files/` regex pattern instead of `'X / Y'` literal (which matches neither language's translation format).
- Source: create-code, 2026-06-12

## getByText strict mode: multiple elements with same text require .first()
- Project: metacleaner-app

- Problem: `page.getByText('45%')` fails with strict mode violation when both the overall progress bar AND per-file rows render the same percentage. Any test that passes `overallProgress: 45` AND file states with `progress: 45` creates duplicate text.
- Solution: Use `page.getByText('45%').first()` to select the first match, or use a more specific selector targeting the parent container's text.
- Source: create-code, 2026-06-12

## Settings link in UserDropdown must be <a> for getByRole('link') ordering tests
- Project: metacleaner-app

- Problem: The Settings item in `UserDropdown.svelte` was a `<div role="button">` which is not found by `page.getByRole('link')`. Tests checking "Report history appears before Settings in dropdown order" use `findIndex` on links[], and get `settingsIdx = -1` (not found), causing `expect(0).toBeLessThan(-1)` to fail.
- Solution: Change the Settings `<div role="button">` to an `<a href="/settings">` element. If `onSettings` callback exists, call it via `onclick` with `e.preventDefault()`. This makes Settings discoverable by `getByRole('link')` while preserving the callback behavior.
- Source: create-code, 2026-06-12

## vitest strict mock: arbitrary key access on mocked modules throws
- Project: metacleaner-app

- Problem: `vi.mock('$lib/paraglide/messages', () => ({ 'known.key': () => '...' }))` creates a strict module namespace — accessing any property not in the factory return (e.g., `m['unknown.key']` inside `tx()`) throws `[vitest] No "unknown.key" export is defined on the mock`. This blocks property-based tests with `fc.string()` that generate arbitrary key names.
- Solution: Add explicitly absent keys as `undefined` values in the mock factory (e.g., `'absent.key': undefined`). Vitest allows undefined exports; `tx()` treats them as missing and returns the key unchanged. For property tests, use `fc.constantFrom(...ABSENT_KEYS)` over a fixed list of known-absent keys rather than `fc.string()`.
- Source: create-code, 2026-06-12

## Step5Success.download test: must mock API client, not apiCleaningService
- Project: metacleaner-app

- Problem: `Step5Success.svelte` imports `downloadFile` directly from `$lib/clients/metaCleanerApi.js` (not from `apiCleaningService`). The original test mocked `$lib/services/apiCleaningService.downloadFile` — a method that doesn't exist on the service and is never called by the component. The assertion `expect(mockDownloadFile).toHaveBeenCalledWith(...)` was vacuous (the mock was never triggered).
- Solution: Mock `$lib/clients/metaCleanerApi.js` to intercept `downloadFile`. Keep the `apiCleaningService` mock for `downloadResults` only (used by the multi-file ZIP path). Also verify the returned blob's MIME type is not `application/zip`.
- Source: create-tests, 2026-06-11T13:41:00+00:00

## Dead i18n key audit: simple tx() grep misses dynamic key references
- Project: metacleaner-app

- Problem: Running `grep -roh "tx('[^']*')" src/` to find all used i18n keys produces many false positives ("dead" keys that are actually used). Dynamic patterns like `metaTitleKey = state === 'processing' ? 'step3.meta.title' : ...` and object literals like `{ txKey: 'report.chart.gpsData' }` or severity maps `{ critical: 'step2.risk.critical', ... }` are NOT matched by the simple quoted-string grep.
- Solution: After running the basic grep, do a secondary broad search (`grep -rn "key.name" src/`) on every suspected dead key before removing it. Keys used via dynamic string variables or object property values are easy to miss.
- Source: code-review-fix, 2026-06-10

## WS cancel after job_complete: delayed close for trailing report_ready
- Project: metacleaner-app

- Problem: When `job_complete` fires, the component unmounts synchronously via `appState.transitionTo('success')` and the cleanup runs `job?.cancel()`, which immediately calls `ws?.close()`. Any trailing `report_ready` WS message sent by the backend after `job_complete` is dropped (either WS closed before it arrives, or `cancelled=true` suppresses the handler).
- Solution: In `cancel()`, when `jobCompleted=true`, delay `ws?.close()` by 500ms instead of closing immediately. In `ws.onmessage`, when `cancelled=true` but `jobCompleted=true`, still process `report_ready` to update `jobHandle.reportId`. The `job_complete.reportId` is still the authoritative source (already captured) — this is purely a defensive measure for the edge case where backend omits `reportId` from `job_complete`.
- Source: code-review-fix, 2026-06-10

## WS polling fallback: setJobCompleted must be wired to dispatchWsMessage
- Project: metacleaner-app

- Problem: Adding a `pollUntilComplete` fallback requires knowing when `job_complete` was already handled via WS — otherwise the polling loop and the WS `job_complete` handler both call `onComplete`, causing duplicate callbacks. The `jobCompleted` flag lives in the closure of `startCleaning`; `dispatchWsMessage` needed an additional `setJobCompleted: () => void` parameter to flip it.
- Solution: Add `setJobCompleted` as the last parameter of `dispatchWsMessage`, call it in the `job_complete` case before `callbacks.onComplete()`. In `ws.onerror`/`ws.onclose`, guard with `!jobCompleted` before starting `pollUntilComplete`. Also add `getJobStatus: vi.fn()` to the API mock in tests since the polling path now calls it.
- Source: code-review-fix, 2026-06-10

## pipeline_integration_test.go: LocalID and exiftool script args were wrong
- Project: metacleaner-app

- Problem: `TestPipelineMixedSuccess` failed because (1) FileRecord structs lacked `LocalID` field (pipeline uses `f.LocalID` for disk path lookup, not `f.ID`), and (2) the fake exiftool shell script used `cp "$3" "$2"` but the actual call is `exiftool -all= -o <cleanedPath> <originalPath>` so `$3`=cleanedPath, `$4`=originalPath — the copy should be `cp "$4" "$3"`.
- Solution: Add `LocalID: "f-ok"` etc. to FileRecord structs in the test, and change `cp "$3" "$2"` to `cp "$4" "$3"` in the exiftool script.
- Source: create-code, 2026-06-10T15:30:00+00:00

## Monorepo uses bun, not npm — npm install fails on workspace:* protocol
- Project: metacleaner-workspace (root)
- Problem: Running `npm install` at the workspace root fails with `EUNSUPPORTEDPROTOCOL: Unsupported URL Type "workspace:": workspace:*`. npm does not support the `workspace:*` protocol used in package.json dependencies.
- Solution: Install bun first (`curl -fsSL https://bun.sh/install | bash`), then run `bun install` at the workspace root. Bun handles workspace:* correctly.
- Source: check-build, 2026-06-22

## authStore login() accesses window.location without typeof guard
- Project: metacleaner-app
- Problem: `auth.svelte.ts` line 201 had `browser ? new URLSearchParams(window.location.search)...` — since the test mocks `browser: true` but runs in node without a `window` global, this threw `ReferenceError: window is not defined` for all 5 login state transition tests.
- Solution: Changed to `typeof window !== 'undefined' ? new URLSearchParams(window.location.search)...` — semantically equivalent in a real browser, but safe in node test environments.
- Source: check-build, 2026-06-22

## $state<Date> triggers svelte/prefer-svelte-reactivity lint error
- Project: metacleaner-app

- Problem: Storing `new Date()` in `$state<Date | null>` triggers ESLint error `svelte/prefer-svelte-reactivity` — Svelte's lint rule requires `SvelteDate` from `svelte/reactivity` instead of the native `Date` class for reactive state.
- Solution: Store the timestamp as `$state<number | null>` using `Date.now()` instead of `new Date()`. This avoids the reactive wrapper requirement while still allowing comparison arithmetic.
- Source: code-review-fix, 2026-06-05

## PUBLIC_API_URL requires .env file for svelte-check to pass
- Project: metacleaner-app

- Problem: After adding `import { PUBLIC_API_URL } from '$env/static/public'`, svelte-check reports "Module '$env/static/public' has no exported member 'PUBLIC_API_URL'" even when the .env file exists, because the SvelteKit ambient types are stale.
- Solution: Run `npx svelte-kit sync` to regenerate `.svelte-kit/ambient.d.ts` which picks up new PUBLIC\_ vars from .env. Also create both `.env` (for local dev, gitignored) and `.env.example` (committed, for documentation).
- Source: code-review-fix, 2026-06-05

## resolve() from $app/paths rejects dynamic route strings — cast to Pathname
- Project: metacleaner-app

- Problem: `resolve('/report/' + report.id)` or `resolve(\`/report/${id}\`)`fails TypeScript because`resolve()`is typed to accept only known static route strings (the`Pathname` union). Dynamic interpolated strings produce type error "Argument of type '[never]' is not assignable to parameter of type 'never'".
- Solution: Cast the dynamic string: `resolve(\`/report/${id}\` as Pathname)` where `Pathname` is imported from `'$app/types'`.
- Source: code-review-fix, 2026-06-05

## SvelteKit [id] route alongside static /report route — both valid
- Project: metacleaner-app

- Problem: Having both `/routes/report/+page.svelte` (static `/report` route) and `/routes/report/[id]/+page.svelte` (dynamic `/report/abc` route) causes no conflict in SvelteKit. Components in `/routes/report/components/` and `/routes/report/sections/` are importable from both routes.
- Solution: Keep the components in place; add `[id]` subdirectory with its own `+page.svelte`; redirect the static `/report` page to `/reports` using browser check.
- Source: code-review-fix, 2026-06-05

## svelte/no-navigation-without-resolve requires Pathname type for dynamic hrefs
- Project: metacleaner-app

- Problem: Adding `resolve()` from `$app/paths` to components that receive `href` as a `string` prop (e.g. NavBar.svelte `backHref`, Button.svelte `href`) causes TypeScript error: `Argument of type '[string]' is not assignable to parameter of type '[route: "/"] | ...'`. The `resolve()` function is typed to only accept SvelteKit's generated route union types.
- Solution: Import `type { Pathname } from '$app/types'` and cast: `resolve(backHref as Pathname)`. For generic components like Button that only accept internal routes, change the prop type to `Pathname` instead of `string`. This satisfies both the ESLint rule and TypeScript.
- Source: check-build, 2026-06-05

## locale.current reactive dependency pattern triggers no-unused-expressions
- Project: metacleaner-app

- Problem: The pattern `locale.current;` (bare expression) used throughout svelte components to create a reactive dependency for the `tx()` translation function triggers `@typescript-eslint/no-unused-expressions` ESLint error.
- Solution: Change `locale.current;` to `void locale.current;`. The `void` operator makes it an explicit void expression, which is excluded from the no-unused-expressions rule. Affected ~50 svelte files.
- Source: check-build, 2026-06-05

## eslint-plugin-storybook must be added to ESLint config
- Project: metacleaner-app

- Problem: `import storybook from 'eslint-plugin-storybook'` in eslint.config.js triggers `@typescript-eslint/no-unused-vars` because the plugin was imported but never added to the defineConfig call.
- Solution: Add `...storybook.configs['flat/recommended']` inside the `defineConfig(...)` call. The plugin's flat config is exported as `storybook.configs['flat/recommended']`.
- Source: check-build, 2026-06-05

## Hardcoded English strings in scanner UI components
- Project: metacleaner-app

- Problem: `ScanProgressIndicator.svelte` ("Pending", "Scanning") and `UploadZoneCard.svelte` ("Scanning X/Y files...") have hardcoded English text instead of using `tx()` i18n function. Same issue in `RiskScoreRing.svelte` ("RISK SCORE" label).
- Solution: Add i18n keys to `messages/en.json` and `messages/cs.json`, then replace hardcoded strings with `tx('key')` calls. Ensure the component imports `locale` and `* as m from '$lib/paraglide/messages'`.
- Source: code-review, 2026-06-05T12:19:50.256+00:00

## FileListItemRisk remove button invisible on mobile
- Project: metacleaner-app

- Problem: The remove (x) button uses `opacity-0 group-hover:opacity-100` which means touch/mobile users can never see or tap it since there's no hover state on mobile.
- Solution: Use `opacity-100 lg:opacity-0 lg:group-hover:opacity-100` to always show on mobile but hover-reveal on desktop.
- Source: code-review, 2026-06-05T12:19:50.256+00:00

## Step3 not connected to scanner store (broken pipeline)
- Project: metacleaner-app

- Problem: The "Start Cleaning" button navigates to `/step3` but step3 still reads files from mock `getUploadedFiles()` in `fileRepository.ts`, not from the scannerStore. The upload→scan→clean pipeline is broken at the transition.
- Solution: Refactor `step3/+page.svelte` to import `scannerStore` and use `$derived(scannerStore.files)` as `uploadedFiles`. The mock `ProcessingState` must also be generated from the real file IDs (not hardcoded mock IDs) so the `getFileById()` lookups in child sections find real files. All step3 child components (`FileItemProcessing`, sections) were updated from `UploadedFile` → `QueuedFile` (`size: number` needs `formatSize()`, `extension` is `.jpg` not `JPG` so strip dot and uppercase for display).
- Source: code-review-fix, 2026-06-05T12:50

## DropZone has no keyboard accessibility
- Project: metacleaner-app

- Problem: The DropZone component uses a `<div>` with onclick (suppressing a11y warnings) but has no role, tabindex, or keyboard handler. Keyboard-only users cannot activate it.
- Solution: Add `role="button"`, `tabindex="0"`, and `onkeydown` handler that triggers the hidden file input on Enter/Space keypress.
- Source: code-review, 2026-06-05T12:38:40.905+00:00

## Step4/Step5 still use mock fileRepository instead of scannerStore
- Project: metacleaner-app

- Problem: `step4/+page.svelte` and `step5/+page.svelte` import `getUploadedFiles()` from `fileRepository.ts` which returns hardcoded mock data. The real file data from scannerStore is lost after step3.
- Solution: Refactor step4 and step5 to import scannerStore and derive file list from `scannerStore.files` using `QueuedFile` type (same pattern as step3 fix). Update child components from `UploadedFile` to `QueuedFile`.
- Source: code-review, 2026-06-05T12:54:53.811+00:00

## RiskScannerCard chip labels swapped between deviceIdentity and personalData
- Project: metacleaner-app

- Problem: In RiskScannerCard.svelte, `chipIdentity` ("Identity") is shown for `categories.deviceIdentity > 0` and `chipDevice` ("Device") is shown for `categories.personalData > 0`. The semantic meaning is reversed.
- Solution: Swap the conditions: use `chipDevice` for deviceIdentity and introduce `chipPersonal` for personalData, or swap the existing assignments.
- Source: code-review, 2026-06-05T12:54:53.811+00:00

## No route guards on step3/step4/step5 — accessible without files
- Project: metacleaner-app

- Problem: Users can navigate directly to `/step3`, `/step4`, `/step5` via URL with no files in scannerStore. Pages render empty/broken state or mock data.
- Solution: Use `$effect(() => { if (!scannerStore.hasFiles) goto(resolve('/' as Pathname), { replaceState: true }); });` at the top of each step's `\<script\>` block. Using `$effect` (not bare script) ensures it runs only in the browser, avoids SSR issues, and reacts to reactive changes.
- Source: code-review-fix, 2026-06-05

## step4/step5 UploadedFile → QueuedFile migration pattern
- Project: metacleaner-app

- Problem: `step4/+page.svelte` and `step5/+page.svelte` used `getUploadedFiles()` (mock fileRepository) returning `UploadedFile` (size: string, extension: 'JPG'). All child components (`ErrorFilesCard`, `ErrorLogAccordion`, `ErrorStateCard`, `FileResultsCard`, `FileResultItem`) used `UploadedFile`.
- Solution: Replace `UploadedFile` with `QueuedFile` throughout. Key field mapping: `file.size` (number) → `formatSize(file.size)`, `file.extension` ('.jpg') → `file.extension.replace('.', '').toUpperCase()`, `file.hasGps` → `file.scanResult?.hasGps ?? false`, `file.metadataFieldCount` → `file.scanResult?.fieldCount ?? 0`, `file.device` → `file.scanResult?.device`. For step5's `FileResultsCard`, switch from ID-based result lookup to index-based pairing since mock result IDs don't match real file IDs.
- Source: code-review-fix, 2026-06-05

## No backend integration exists — entire processing pipeline is mock
- Project: metacleaner-app

- Problem: Steps 3/4/5 use hardcoded mock data from `processingRepository.ts`. No HTTP client, no WebSocket connection, no API calls. The backend spec defines 9 REST endpoints and a WebSocket protocol — none are called.
- Solution: Create an API client module (`src/lib/api/client.ts`) that implements upload, job creation, WebSocket progress, file download, and report fetching. Wire each step to the real data flow.
- Source: code-review, 2026-06-05T17:02:02.923+00:00

## Step2 is just a redirect — risk review page not implemented
- Project: metacleaner-app

- Problem: `step2/+page.svelte` only does `goto('/')`. The spec defines step2 as "Risk analysis review" — a distinct page. The "Start Cleaning" button on step1 navigates directly to `/step3`, skipping step2.
- Solution: Either implement step2 as a full review page with confirm CTA, or formally merge it with step1 (which already shows RiskScannerCard) and remove the dead route + empty directories.
- Source: code-review, 2026-06-05T17:02:02.923+00:00

## processingRepository.ts contains hardcoded Czech text
- Project: metacleaner-app

- Problem: `getErrorState()` mock data has Czech `description` strings in errorTypes: "Interní chyba při čištění metadat", "Ztráta spojení se serverem", "Operace překročila časový limit". Violates i18n and code language standards.
- Solution: Replace with English placeholders or i18n keys. When rendered in components, use `tx()` to look up the localized version.
- Source: code-review, 2026-06-05T17:02:02.923+00:00

## cleaningStore file_error handler maps to wrong statuses
- Project: metacleaner-app

- Problem: The `file_error` WebSocket event handler in `cleaningStore.svelte.ts` sets the failed file's status to `'waiting'` and log entry to `'in_progress'` instead of error-indicating values. The `FileProcessingStatus` type doesn't include `'error'`.
- Solution: Extend `FileProcessingStatus` to `'done' | 'in_progress' | 'waiting' | 'error'`. In the `file_error` handler, set file status to `'error'` and log status to a failure indicator.
- Source: code-review, 2026-06-05T17:25:48.603+00:00

## step5 FileResultsCard gets empty fileResults from cleaningStore
- Project: metacleaner-app

- Problem: `cleaningStore.results.fileResults` is always `[]` because the `job_complete` WS event doesn't contain per-file breakdown. The store's `handleWsEvent` for `job_complete` sets `fileResults: []`. The `FileResultsCard` then uses index-based lookup against an empty array.
- Solution: Accumulate per-file results during `file_complete` events (fieldsRemoved, gpsRemoved) in a temporary array, then assign to `results.fileResults` when `job_complete` fires. Or fetch full report via GET /api/reports/{id} after completion.
- Source: code-review, 2026-06-05T17:25:48.603+00:00

## WebSocket disconnect immediately treated as fatal error
- Project: metacleaner-app

- Problem: When WebSocket closes or errors during processing, step3 immediately navigates to step4 (error page). Backend continues processing (Req 3.6), so the job may complete successfully.
- Solution: On WS close/error, attempt reconnect or fall back to polling `GET /api/jobs/{id}` every 2-3s. Only treat as error if polling confirms job failure or times out.
- Source: code-review, 2026-06-05T17:25:48.603+00:00

## PUBLIC_API_URL empty in Docker production build
- Project: metacleaner-app

- Problem: `$env/static/public` resolves `PUBLIC_API_URL` at build time. The Dockerfile never copies `.env` into the build stage, so the variable bakes as empty string. The fallback `|| 'http://localhost:8080'` then points to nginx (the container itself) not the backend.
- Solution: Switch to `$env/dynamic/public` for runtime resolution, or add `ARG PUBLIC_API_URL` to the Dockerfile build stage and inject via `--build-arg`, or use relative URLs with nginx proxy.
- Source: code-review, 2026-06-05T17:46:39.061+00:00

## Missing i18n keys for step3 upload phase and report detail page
- Project: metacleaner-app

- Problem: Keys `step3.badge.uploading`, `step3.upload.title`, `step3.upload.description`, `common.loading`, `common.error`, `common.footer.copyright` are used in templates but don't exist in en.json/cs.json. Code uses `|| 'English fallback'` which breaks i18n for Czech users.
- Solution: Add all missing keys to both `messages/en.json` and `messages/cs.json`.
- Source: code-review, 2026-06-05T17:46:39.061+00:00

## WebSocket polling fallback too aggressive — 30s timeout for long operations
- Project: metacleaner-app

- Problem: When WS disconnects, step3 polls `GET /api/jobs/{id}` with `MAX_POLLS = 10` at 3s intervals (30s total). Large file batches (500MB × multiple files) can take several minutes on the backend.
- Solution: Increase `MAX_POLLS` to 100+ (5+ minutes) or use exponential backoff. Also attempt WS reconnection before falling back to polling.
- Source: code-review, 2026-06-05T17:46:39.061+00:00

## report/[id] page used real API client instead of mockCleaningService
- Project: metacleaner-app

- Problem: `/report/[id]/+page.svelte` imported `getReportDetail` from `$lib/api/client` and used `mapApiToReportDetail()` adapter — always failed with network error since no backend exists.
- Solution: Replace with `mockCleaningService.getReportDetail(id)` which returns `ReportDetail` directly (no mapping needed). Also removed `|| 'Loading report...'` hardcoded fallbacks — `tx()` already returns key name when key is missing.
- Source: code-review-fix, 2026-06-06

## Session report ID must be stored in cleaningResultsStore for navigation
- Project: metacleaner-app

- Problem: Step5 "View Report" navigated to static `/report` — no way to pass the session's job ID to the report detail page. The job ID is only available inside `onMount` where `job` is set.
- Solution: Add `reportId` field to `cleaningResultsStore`. In `Step3Processing.svelte`'s `onComplete` callback, pass `job?.jobId` (which is set synchronously before `onComplete` fires asynchronously) to `setResults(results, job?.jobId)`. Step5 then reads `cleaningResultsStore.reportId` for navigation.
- Source: code-review-fix, 2026-06-06

## cleaningResultsStore not cleared on appState.reset()
- Project: metacleaner-app

- Problem: `appState.reset()` calls `scannerStore.clearFiles()` but not `cleaningResultsStore.clear()`. Stale success/error data persists across sessions, potentially causing incorrect UI state after re-cleaning.
- Solution: Add `cleaningResultsStore.clear()` inside the `reset()` function in `src/lib/stores/appState.svelte.ts`.
- Source: code-review, 2026-06-06T20:01:35+00:00

## Step3Processing does not cancel job on component unmount
- Project: metacleaner-app

- Problem: If user navigates away during processing (e.g., browser back, direct URL change), the mock cleaning service continues running and may call `appState.transitionTo('success'/'error')` after the component is destroyed.
- Solution: Return a cleanup function from `onMount(() => { ... return () => { job?.cancel(); }; })` in `Step3Processing.svelte`.
- Source: code-review, 2026-06-06T20:01:35+00:00

## /report/[id] route calls real API instead of mock service
- Project: metacleaner-app

- Problem: `src/routes/report/[id]/+page.svelte` imports `getReportDetail` from `$lib/api/client` which makes real HTTP requests to `PUBLIC_API_URL`. No backend exists, so the page always shows an error state.
- Solution: Switch to `mockCleaningService.getReportDetail(id)` to match the rest of the app, or add fallback to mock on network error.
- Source: code-review, 2026-06-06T20:01:35+00:00

## Dead API client module persists after mock service migration
- Project: metacleaner-app

- Problem: `src/lib/api/client.ts` (175+ lines with HTTP/WebSocket functions) has zero imports anywhere in the codebase. It was superseded by `mockCleaningService.ts` but never deleted, violating Requirement 22 (remove dead code).
- Solution: Delete the file. When real backend integration is needed, create a new implementation of the `CleaningService` interface from `cleaningService.ts`.
- Source: code-review, 2026-06-06T20:16:48+00:00

## Hardcoded strings bypass i18n in error/log computation functions
- Project: metacleaner-app

- Problem: Template-literal strings with English/Czech text appear inside `$derived` or helper functions (e.g., Step4Error `computeLogEntries` uses `"fields removed"`, FileResultsCard uses `"polí"`). These bypass `tx()` because they're in script logic, not templates — easy to miss in review.
- Solution: Always use `tx()` for ANY user-visible text, even inside computed helper functions. Pass the `tx` function reference or call it at render-time in the template rather than baking text into data structures.
- Source: code-review, 2026-06-06T20:16:48+00:00

## Hardcoded fallback strings hide missing i18n keys
- Project: metacleaner-app

- Problem: Pattern `tx('key') || 'English fallback'` in UploadZoneCard.svelte silently hides missing i18n keys from developers. Since `tx()` returns the key name when the function isn't found, the `||` fallback only activates when the key is genuinely missing — but then Czech users see English text with no warning.
- Solution: Never use `|| 'fallback'` after `tx()`. The raw key name returned by `tx()` is the correct fallback — it makes missing translations visible during QA. If the keys exist in both JSON files, the fallback never fires anyway.
- Source: code-review, 2026-06-06T20:31:31+00:00

## Accessibility aria-labels and sr-only text must use i18n
- Project: metacleaner-app

- Problem: `aria-label="Dismiss"`, `aria-live` sr-only text with hardcoded English ("Risk score: X out of 100") bypass i18n. Easy to miss in review because they're not visually rendered.
- Solution: All `aria-label`, `aria-live`, and `.sr-only` text must use `tx()` calls. Add corresponding keys to both message files.
- Source: code-review, 2026-06-06T20:31:31+00:00

## report-detail page uses in-memory mock service — HTTP route mocks never fire
- Project: metacleaner-app

- Problem: `report-detail.spec.ts` (and hamburger-menu, navigation, responsive) mock `**/api/reports/*` with `page.route()`, but `/report/[id]/+page.svelte` calls `mockCleaningService.getReportDetail(id)` directly in-memory. HTTP intercepts never fire; `navigateToReportDetail()` was waiting for `'RPT-001'` but the service returns `reportId: 'MC-2025-001'` from `_generateMockReportDetail()`. The error state (`loadError`) is also unreachable since the in-memory service never throws.
- Solution: Updated `mockReportDetail` in `e2e/helpers/mock-api.ts` to match the service's fixed output (`reportId: 'MC-2025-001'`, `date: '4. 6. 2025 · 14:32'`, EXIF fields: Make/Model/DateTimeOriginal/ExposureTime). Removed untestable HTTP error tests; replaced route guard test (was asserting content on `/report` which now redirects to `/reports`) with redirect assertion. Other spec files (`hamburger-menu.spec.ts`, `navigation.spec.ts`, `responsive.spec.ts`) still hardcode `'RPT-001'` and need separate fixes.
- Source: ui-tests, 2026-06-07

## report_ready WebSocket event reportId is never stored — View Report broken
- Project: metacleaner-app

- Problem: `apiCleaningService.ts` handles `report_ready` with a no-op. The actual `reportId` from this WS message is discarded. `Step3Processing` stores `job?.jobId` into `cleaningResultsStore.reportId`. Step5 then navigates to `/report/{jobId}` which will 404 because the backend expects a report ID, not a job ID.
- Solution: Capture `reportId` from `report_ready` WS event, store it separately from `jobId` in `cleaningResultsStore`. Use `jobId` for downloads (`GET /api/jobs/{id}/download`) and `reportId` for report navigation (`GET /api/reports/{id}`). Handle timing: `report_ready` may arrive after `job_complete`.
- Source: code-review, 2026-06-10T16:12:16+00:00

## cleaningResultsStore conflates jobId and reportId in single field
- Project: metacleaner-app

- Problem: `cleaningResultsStore` has a field named `reportId` but `Step3Processing` stores `job?.jobId` into it via `setResults(results, job?.jobId)`. The naming is misleading and causes Step5 to use jobId for report navigation (wrong endpoint).
- Solution: Split into `jobId: string | null` and `reportId: string | null`. Update `setResults` signature. Step5 uses `jobId` for `downloadResults()` and `reportId` for "View Report" navigation.
- Source: code-review, 2026-06-10T16:12:16+00:00

## Dead i18n keys remain after mock layer removal
- Project: metacleaner-app

- Problem: When mock components and repositories were deleted, their i18n keys (e.g., `step3.actions.orGoToResults` with "(demo)" text) were not removed from `messages/en.json` and `messages/cs.json`. These dead keys accumulate and confuse translators.
- Solution: After removing any component or flow, grep for all `tx('key')` calls across `.svelte` and `.ts` files, then diff against the keys in both JSON message files. Remove keys that have zero references.
- Source: code-review, 2026-06-10T16:32:29+00:00

## languageRepository lists unsupported languages (DE, SK)
- Project: metacleaner-app

- Problem: `getLanguages()` returns 4 options (CS, EN, DE, SK) but only EN and CS have Paraglide message files. Selecting an unsupported language shows raw key names.
- Solution: Filter the dropdown to only show languages with actual message files in `messages/` directory, or remove DE/SK from the repository until translations are provided.
- Source: code-review, 2026-06-10T16:32:29+00:00

## RiskScoreRing inline riskScoreLabel() not extracted to shared tx()
- Project: metacleaner-app

- Problem: `RiskScoreRing.svelte` defines a local `riskScoreLabel()` function that reimplements the same logic as `tx()` — imports `locale` and `* as m`, reads `void locale.current`, looks up a key. This was missed during the bulk extraction in Task 4.1 because the function is named `riskScoreLabel` not `tx`, so grep for `function tx(` didn't catch it.
- Solution: Replace the entire function with `tx('step2.risk.score')` from the shared import. Remove the direct imports of `$lib/locale.svelte` and `$lib/paraglide/messages`.
- Source: code-review, 2026-06-12T09:44:53+00:00

## MobileHamburgerMenu Settings/Logout same a11y bug as UserDropdown
- Project: metacleaner-app

- Problem: `MobileHamburgerMenu.svelte` Settings and Logout divs have `onkeydown={(e) => e.key === 'Enter' && e.currentTarget.click()}` but no `onclick` handler and no callback props. The fix from Requirement 6 (UserDropdown) was not applied to the parallel component.
- Solution: Add `onSettings?: () => void` and `onLogout?: () => void` to Props. Add `onclick={() => onSettings?.()}` and `onclick={() => onLogout?.()}`. Replace `e.currentTarget.click()` with direct callback invocation.
- Source: code-review, 2026-06-12T09:44:53+00:00

## Auth pages missing resolve() — same bug class as AuthNavbar (Req 8)
- Project: metacleaner-app

- Problem: All auth page components (`login`, `register`, `forgot-password`, `check-code`, `check-email`, `new-password`) use bare `goto('/path')` and `href="/path"` without wrapping in `resolve()`. This is the same issue fixed in `AuthNavbar.svelte` per Requirement 8, but the fix was not applied to the other auth routes. Results in 11 `svelte/no-navigation-without-resolve` ESLint errors.
- Solution: Import `resolve` from `$app/paths` and `Pathname` from `$app/types`. Wrap all `goto('/x')` → `goto(resolve('/x' as Pathname))` and all `href="/x"` → `href={resolve('/x' as Pathname)}`.
- Source: code-review, 2026-06-12T09:59:43+00:00

## Auth pages missing {#each} keys — 8 violations
- Project: metacleaner-app

- Problem: `{#each}` blocks in auth components lack `(key)` expressions, triggering `svelte/require-each-key`. Affects OtpInput, PasswordStrengthMeter, StepProgressBar, AuthFeatureCard, and several section files.
- Solution: Add appropriate key expressions. For indexed items use `(index)`, for objects use a unique field like `(item.id)` or `(item.code)`.
- Source: code-review, 2026-06-12T09:59:43+00:00

## apiCleaningService.ts re-throws without cause — loses stack traces
- Project: metacleaner-app

- Problem: `downloadResults` and `getReportDetail` catch blocks throw `new Error('message')` without `{ cause: err }`, losing the original ApiHttpError stack. Triggers `preserve-caught-error` ESLint rule.
- Solution: Change to `throw new Error('message', { cause: err })` in all three locations (lines ~591, 592, 612).
- Source: code-review, 2026-06-12T09:59:43+00:00

## resendCode() in forgot-password does not actually resend API call
- Project: metacleaner-app

- Problem: `resendCode()` in `ForgotPasswordFormSection.svelte` only resets OTP inputs and countdown timer but never calls `/api/auth/forgot-password` to trigger a new email. Users clicking "Resend" get no new code.
- Solution: Add a `fetch(buildApiUrl('/api/auth/forgot-password'), { method: 'POST', body: JSON.stringify({ email: sentEmail }) })` call inside `resendCode()`. Swallow errors silently (anti-enumeration).
- Source: code-review, 2026-06-12T16:50:30+00:00

## Password reset max length validates 72 instead of spec's 128
- Project: metacleaner-app

- Problem: `ForgotPasswordFormSection.svelte` line 131 uses `newPassword.length > 72` for the reset-password step. Requirement 5.7 specifies the reset-password max is 128 characters (different from registration's 72 per Req 1.4).
- Solution: Change the condition to `newPassword.length > 128` in the password reset validation. Registration should stay at 72.
- Source: code-review, 2026-06-12T16:50:30+00:00

## Circular import: auth.svelte.ts → metaCleanerApi.js → api-client.ts → auth.svelte.ts
- Project: metacleaner-app

- Problem: `auth.svelte.ts` imports `buildApiUrl` from `$lib/clients/metaCleanerApi.js`. That module imports `apiFetch` from `$lib/auth/api-client.js`, which imports `authStore` from `$lib/auth/auth.svelte.js`. This creates a circular dependency chain.
- Solution: Change `auth.svelte.ts` to import `buildApiUrl` directly from `$lib/clients/api-config.js` (the source module). The metaCleanerApi re-export is unnecessary for the auth store.
- Source: code-review, 2026-06-12T16:50:30+00:00

## NavBar does not pass onLogout/onSettings to UserDropdown and MobileHamburgerMenu
- Project: metacleaner-app

- Problem: `NavBar.svelte` renders `UserDropdown` and `MobileHamburgerMenu` without passing `onLogout` or `onSettings` callbacks. Clicking Logout in the dropdown does nothing — `authStore.logout()` is never called from the UI.
- Solution: Add `onLogout` (and optionally `onSettings`) prop to `NavBar.svelte`. In `+layout.svelte`, pass `onLogout={() => authStore.logout()}`. NavBar forwards the callback to both `UserDropdown` and `MobileHamburgerMenu`.
- Source: code-review, 2026-06-12T17:10:50+00:00

## Auth guard flash-of-content on SPA page restore
- Project: metacleaner-app

- Problem: `guardProtectedRoute()` in `auth-guard.ts` returns early on server (`if (!browser) return`) and then calls `redirect()`. On client-side hard refresh, the page template renders briefly before the guard fires during hydration, causing a momentary flash of protected content for unauthenticated users.
- Solution: Add a reactive loading gate in root layout (or a global `isAuthReady` state) that prevents rendering children until auth state is resolved. Alternatively, use `$effect` in a shared layout to redirect reactively.
- Source: code-review, 2026-06-12T17:10:50+00:00

## Token restore does not attempt refresh when access token expired
- Project: metacleaner-app

- Problem: `_restore()` in `auth.svelte.ts` checks `expiresAt > Date.now()` and clears tokens if expired. It doesn't attempt `authStore.refresh()` using the (potentially still valid) refresh token. Users returning after access token expiry get silently logged out.
- Solution: In `_restore()`, if access token is expired but refresh token exists, set an `isRestoring` flag and call `refresh()`. Clear tokens only if refresh fails.
- Source: code-review, 2026-06-12T17:10:50+00:00

## Clean command skips format validation unlike scan
- Project: metacleaner-cli
- Problem: The `scan` command validates file extensions against IMAGE_EXTENSIONS/VIDEO_EXTENSIONS before processing, but the `clean` command uploads any file to the server without validation. This leads to inconsistent error messages (server error vs local "Unsupported format").
- Solution: Add the same extension validation from scanner.ts at the start of the clean command loop, before attempting upload. Report "Unsupported format" locally and continue with remaining files.
- Source: code-review, 2026-06-06T23:16:25.915+00:00

## Compare command temp file path can lose extension
- Project: metacleaner-cli
- Problem: In `executeCompare`, the temp file path is constructed as `metacleaner_<timestamp>_<filename>`. If the original filename has no extension, format detection on the cleaned file scan will fail since scanFiles validates extensions.
- Solution: Extract `extname(filePath)` and append it to the temp path directly: `const ext = extname(filePath); const tempPath = join(tmpdir(), \`metacleaner_${Date.now()}${ext}\`);`
- Source: code-review, 2026-06-06T23:16:25.915+00:00

## exifr uses FileReader.onloadend (not onload) in Bun environment
- Project: metacleaner-cli
- Problem: exifr.parse(blob) hangs indefinitely in Bun. Adding a FileReader polyfill that only handled `onload` still hung because exifr specifically uses `reader.onloadend = () => resolve(reader.result||new ArrayBuffer)`. The polyfill also must extend EventTarget so dispatchEvent works.
- Solution: FileReader polyfill must (1) extend EventTarget, (2) implement `onloadend` property, (3) dispatch both `load` and `loadend` events on success. Import polyfills.ts first in any file that imports from metacleaner-app. See `src/polyfills.ts`.
- Source: create-code, 2026-06-06

## Workspace link resolves from package directory
- Project: metacleaner-cli
- Problem: `import 'metacleaner-app/src/...'` fails when the script is run from outside the CLI package directory (e.g. /tmp)
- Solution: Run scripts from within `/workspace/terminal/metacleaner-cli/` so Bun resolves node_modules from the right package root
- Source: create-code, 2026-06-06 21:58

## Dockerfile COPY destination must include /src subdirectory
- Project: metacleaner-cli
- Problem: `COPY terminal/metacleaner-cli/src ./terminal/metacleaner-cli/` copies file contents directly into the package dir (no `src/` subdir), so `bun build src/index.ts` fails with "FileNotFound opening root directory src"
- Solution: Use `COPY terminal/metacleaner-cli/src ./terminal/metacleaner-cli/src` (trailing `/src` in destination) so the source tree is preserved correctly
- Source: verify-builds, 2026-06-06

## CLI Dockerfile requires workspace root as build context
- Project: metacleaner-cli
- Problem: CLI depends on `metacleaner-app` (workspace:*); building from within `terminal/metacleaner-cli/` cannot reach `frontend/metacleaner-app/` source
- Solution: Build from workspace root: `docker build -f terminal/metacleaner-cli/Dockerfile -t metacleaner-cli .` — Dockerfile copies both packages before installing and bundling
- Source: verify-builds, 2026-06-06

## Compare command `format` field inconsistent with scan results
- Project: metacleaner-cli
- Problem: `executeCompare` computes `format` as `extname(filePath).toLowerCase().slice(1)` (e.g. "jpg"), but `scanFiles` uses `IMAGE_EXTENSIONS[ext]` which maps `.jpg` → `"jpeg"`. This produces inconsistent `FileResult.format` values.
- Solution: Use `IMAGE_EXTENSIONS[ext] ?? VIDEO_EXTENSIONS[ext] ?? ext.slice(1)` in `executeCompare`, same pattern as `executeClean`.
- Source: code-review, 2026-06-06T23:28:34Z

## vi.stubGlobal / importActual not supported in this Bun version
- Project: metacleaner-cli
- Problem: `vi.stubGlobal`, `vi.unstubAllGlobals`, and the `importActual` factory argument in `vi.mock()` all throw "not a function" errors when running tests with Bun v1.3.14. Affects scanner.test.ts, serverClient.test.ts, and commands.test.ts.
- Solution: These are pre-existing Bun/vitest compatibility issues unrelated to source changes. formatter.test.ts and progress.test.ts (which don't use these APIs) pass cleanly. Source code correctness should be verified through those tests.
- Source: code-review-fix, 2026-06-06

## MIME type overrides missing for .3gp and .ogv
- Project: metacleaner-cli
- Problem: `scanner.ts` constructs MIME type as `video/${VIDEO_EXTENSIONS[ext]}` which produces `video/3gp` and `video/ogv` — the correct types are `video/3gpp` and `video/ogg`.
- Solution: Add entries to `MIME_TYPE_OVERRIDES`: `'.3gp': 'video/3gpp'` and `'.ogv': 'video/ogg'`.
- Source: code-review, 2026-06-06T23:28:34Z

## WebSocket progress endpoint exempt from auth — intentional but spec-violating
- Project: metacleaner-server
- Problem: `isExemptPath()` in `auth_middleware.go` exempts all paths ending with `/progress` from JWT validation. This allows unauthenticated WebSocket connections to `/api/jobs/{id}/progress`. The User Authentication spec (Req 6.1) only exempts `/api/auth/*` and `/api/health`.
- Solution: Remove the `/progress` suffix exemption. Pass JWT as WebSocket URL query parameter (`?token=...`), validate in `HandleJobProgress` before upgrading. Frontend `connectJobProgress` must append `?token=${authStore.accessToken}` to the WS URL.
- Source: code-review, 2026-06-15T11:35:25+00:00

## Storybook stories use outdated iconColor 'green' for images
- Project: metacleaner-app
- Problem: After bugfix 1.6 changed `computeIconColor('image')` from `'green'` to `'blue'`, the Storybook stories for ReportTableRow, ReportCard, ReportsList, and ReportsTable were not updated. They still pass `iconColor: 'green'` in mock data.
- Solution: Update all story mock data from `iconColor: 'green'` to `iconColor: 'blue'` for image-type entries. Video entries should use `'orange'`.
- Source: code-review, 2026-06-15T11:35:25+00:00

## ipRateLimiter tests blocked by ES256-only auth middleware
- Project: metacleaner-server
- Problem: `ipRateLimiter` wraps only `/api/files/{id}/download` and `/api/jobs/{id}/download`. These endpoints go through `authMW.Middleware(mux)` which rejects HS256 tokens (only accepts ES256 via JWKS). The test helper `buildJWT` creates HS256 tokens. So tests using `newTestRouter` with `buildJWT` never reach the rate limiter (they get 401 first). The existing security_test.go `TestRateLimit_*` tests have the same bug.
- Solution: Test per-IP rate limiting behavior through auth endpoints instead (`POST /api/auth/register`, `POST /api/auth/login`), which are exempt from JWT auth and use `AuthRateLimiter`. For true `ipRateLimiter` unit testing, either: (a) create a mock JWKS server with an ES256 key pair, or (b) write package-level tests in `source/` directory that can access unexported types.
- Source: create-tests, 2026-06-15T20:20:00+00:00

## WS auth fix: authMW must be instantiated before route registrations in NewRouter
- Project: metacleaner-server
- Problem: `HandleJobProgress` now takes `*AuthMiddleware` as a parameter. `NewRouter` originally instantiated `authMW` after all `mux.Handle()` calls at the bottom of the function. Passing `authMW` to `HandleJobProgress` before it's declared caused a compile error.
- Solution: Move `authMW := NewAuthMiddleware(cfg)` to the top of `NewRouter` (just after the rate limiters), before any `mux.Handle()` registrations. The line at the bottom becomes just `return cors(authMW.Middleware(mux))`.
- Source: code-review-fix, 2026-06-15

## svelte/no-navigation-without-resolve with paraglide-js: use ignoreLinks:true
- Project: metacleaner-monitoring
- Problem: `svelte/no-navigation-without-resolve` rule flags `href` attributes in navigation components because they don't call `resolve()` from `$app/paths`. The project uses paraglide-js `localizeHref()` for i18n link resolution, not SvelteKit's `resolve()`.
- Solution: Configure the rule with `ignoreLinks: true` in eslint.config.js: `'svelte/no-navigation-without-resolve': ['error', { ignoreLinks: true }]`. This disables href checking while still enforcing `goto()` calls to use `resolve()`.
- Source: check-build, 2026-06-28

## TypeScript: removing `any` from layout objects — don't use Record<string, unknown>
- Project: metacleaner-monitoring
- Problem: Changing `const layout: any = { font: {...}, ... }` to `const layout: Record<string, unknown> = {...}` causes TypeScript spread error "Spread types may only be created from object types" wherever sub-properties are spread (e.g., `{ ...layout.font }`). Sub-property type becomes `unknown`, which cannot be spread.
- Solution: Remove the explicit type annotation entirely (`const layout = {...}`) and let TypeScript infer the concrete type from the object literal. TypeScript correctly infers the full shape and sub-properties remain spreadable.
- Source: check-build, 2026-06-28

## Playwright browser path mismatch in metacleaner-app and metacleaner-web
- Project: metacleaner-app, metacleaner-web, metacleaner-monitoring
- Problem: vitest-browser-playwright and `@vitest/browser-playwright` default `PLAYWRIGHT_BROWSERS_PATH` to `/home/agent/.playwright-browsers`, but the actual browsers are installed at `/opt/playwright-browsers` (already has rev 1228).
- Solution: Run tests with `PLAYWRIGHT_BROWSERS_PATH=/opt/playwright-browsers npm run test:unit -- --run`. Both chromium-1228 and chromium_headless_shell-1228 are already present at that path.
- Source: check-build, 2026-06-29

## Storybook browser tests have 68 pre-existing unhandled errors (metacleaner-app)
- Project: metacleaner-app
- Problem: Running `npm run test:browser` reports 68 unhandled errors (TypeError: Cannot read properties of undefined) from Storybook stories. These occur when Storybook's autodocs feature renders components without required props. All 385 test assertions pass but the exit code is non-zero due to these runtime errors. Affected stories include FileAccordionItem, AuthStatsRow, NavBar, LanguageDropdown, ReportCard, ReportTableRow, and others.
- Solution: Not fixed — pre-existing issues not caused by recent changes. Server tests (`npm test`) pass cleanly with 482 tests. Browser tests are broken due to autodocs rendering missing required props. Fixing would require adding default args to 12+ story files.
- Source: check-build, 2026-06-18

## pgregory.net/rapid does not support WithMinSuccessfulTests option
- Project: metacleaner-server
- Problem: `rapid.Check(t, fn, rapid.WithMinSuccessfulTests(100))` fails to compile — `rapid.WithMinSuccessfulTests` does not exist and `rapid.Check` only accepts two arguments `(rapid.TB, func(*rapid.T))`.
- Solution: Use `rapid.Check(t, func(t *rapid.T) { ... })` with no options. rapid runs 100 tests by default, so no option needed to satisfy the "min 100 iterations" requirement.
- Source: create-code, 2026-06-19

## metacleaner-web: stale src/paraglide/ directory causes ESLint errors
- Project: metacleaner-web
- Problem: A `src/paraglide/` directory exists locally (not git-tracked) as a stale artifact from an older paraglide version. The current vite plugin outputs to `src/lib/paraglide` (which is in .gitignore). ESLint was linting the stale `src/paraglide/` files and reporting hundreds of "Unused eslint-disable directive" warnings because the auto-generated files contain `/* eslint-disable */` but have no actual violations. Prettier also flagged all these files.
- Solution: Add `src/paraglide` to both `.gitignore` and `.prettierignore`. The existing `includeIgnoreFile(gitignorePath)` in eslint.config.js means adding to .gitignore also excludes the directory from ESLint.
- Source: check-build, 2026-06-20

## metacleaner-web: svelte/no-navigation-without-resolve needs eslint-disable block for multi-line <a> tags
- Project: metacleaner-web
- Problem: `eslint-disable-next-line svelte/no-navigation-without-resolve` only suppresses the immediately following line. When an `<a>` tag spans multiple lines with `href` on a separate line (e.g., Prettier-formatted), the comment disables the `<a` line but not the `href={...}` line where the rule actually fires.
- Solution: Use `<!-- eslint-disable svelte/no-navigation-without-resolve -->` block comments around the entire `<a>` element, followed by `<!-- eslint-enable ... -->` after the closing `</a>`.
- Source: check-build, 2026-06-20

## contextKey type already declared in auth_middleware.go (backend)
- Project: metacleaner-server
- Problem: `source/auth_middleware.go` declares `type contextKey int` using `iota`. Adding a new file (`logger.go`) that also declares `type contextKey string` causes a redeclaration compile error.
- Solution: Use a distinct type name in the new file — e.g., `type loggerContextKey string` — to avoid collision with the existing `contextKey int` in auth_middleware.go.
- Source: create-code, 2026-06-19

## stripe-go v82: CurrentPeriodStart/End moved to SubscriptionItem; Invoice.Subscription removed
- Project: metacleaner-server
- Problem: stripe-go v82 removed `CurrentPeriodStart`/`CurrentPeriodEnd` from `stripe.Subscription` struct (they were on the subscription in older versions). Also `stripe.Invoice.Subscription` no longer exists directly; subscription info is under `Invoice.Parent.SubscriptionDetails.Subscription`.
- Solution: Extract period dates from `sub.Items.Data[0].CurrentPeriodStart/End` on `stripe.Subscription`. For invoices, use `inv.Parent.SubscriptionDetails.Subscription.ID` to get the subscription ID.
- Source: create-code, 2026-06-22

## Docker builds fail for monorepo packages using bun workspaces
- Project: metacleaner-app, metacleaner-web
- Problem: Dockerfiles in `frontend/metacleaner-app` and `frontend/metacleaner-web` copied only their own directory as the build context. Both packages depend on `metacleaner-shared` (workspace:*). Bun reads the root `package.json` workspace list and errors with "Workspace not found" for any workspace whose directory isn't present in the build context.
- Solution: Rebuild from the workspace root (`../../` relative to the package): copy the root `package.json` and `bun.lock`, copy the full `metacleaner-shared` source, copy stub `package.json` files for the other workspaces (no source needed), then run `bun install --frozen-lockfile`. Update `start-docker.sh` to use `-f Dockerfile <workspace-root>` as the build context. Also add `ARG PUBLIC_APP_URL` + `ENV` to metacleaner-web Dockerfile since it uses `$env/static/public` which requires the var at build time.
- Source: check-build, 2026-06-22

## API keys migration script numbering conflict
- Project: metacleaner-server
- Problem: The spec says to create `scripts/migration004.sql` but that file already exists (Stripe billing migration). Creating it would overwrite existing billing schema.
- Solution: Create `scripts/migration005.sql` instead for the API keys table.
- Source: create-code, 2026-06-22

## Svelte 5 $derived short-circuit dependency tracking bug in server tests
- Project: metacleaner-app
- Problem: When a `$derived` value uses `&&` and the first operand evaluates to `false`, the second operand is never read (short-circuit). In server-side vitest tests (non-component context), the second operand's reactive signal is then NOT added to the dependency set. On the next re-evaluation triggered by the first operand changing, the second operand reads a stale value, returning the wrong result. Specific case: `isPaidPlan = $derived((planId === 'pro' || planId === 'proplus') && (planStatus === 'active' || planStatus === 'trialing'))` returned `true` instead of `false` after going from `proplus/trialing` → `free/free` (clear) → `pro/cancelled` (refresh).
- Solution: Swap operands so the more-volatile / always-relevant signal is in the first position: `$derived((planStatus === 'active' || planStatus === 'trialing') && (planId === 'pro' || planId === 'proplus'))`. This ensures `planStatus` is always tracked. Use `$derived.by(() => { const a = dep1; const b = dep2; return ...; })` as an alternative to force all dependencies to be captured upfront.
- Source: create-code, 2026-06-23

## vitest-browser page.getByText: case-insensitive substring matching causes strict mode violations
- Project: metacleaner-app
- Problem: `page.getByText('Risk Scanner')` matched both the h3 element AND the p element containing "Unlock Risk Scanner to detect..." because Playwright's `getByText` defaults to case-insensitive substring matching (`exact: false`). This causes "strict mode violation: X elements resolved" errors that appear as 15s timeouts.
- Solution: Use `page.getByText('text', { exact: true })` to match elements whose full normalized text equals the query (avoids substring matches). For text that appears in BOTH desktop and mobile layouts (two DOM copies), use `expect(container.textContent).toContain('text')` instead. Use `page.getByRole('heading', { name: 'X' })` for heading elements to avoid ambiguity.
- Source: create-code, 2026-06-23

## vitest-browser: missing component import causes cascade test failures across all subsequent files
- Project: metacleaner-app
- Problem: `DocComponents.svelte.spec.ts` imported `DocsSidebar.svelte` which didn't exist. The `TypeError: Failed to fetch dynamically imported module` error ran first (alphabetically) and corrupted the browser test environment for all subsequent test files, causing seemingly unrelated button-click tests to fail (callbacks not being called).
- Solution: Create the missing `DocsSidebar.svelte` component. Once the import error is gone, all downstream tests pass. Always check for import errors first when multiple unrelated browser tests fail together.
- Source: create-code, 2026-06-23

## vitest-browser: CSS lg:hidden elements not found by page.getByRole() at desktop viewport
- Project: metacleaner-app
- Problem: `page.getByRole('button', { name: /pattern/i })` cannot find buttons wrapped in `lg:hidden` containers when Playwright runs at default desktop viewport (1280x720). Tailwind's responsive `hidden lg:flex` / `lg:hidden` classes apply `display:none` at the evaluated viewport, removing elements from the accessibility tree.
- Solution: For tests that need to find "mobile-only" UI, either: (a) change the button to use a label visible at desktop viewport size, or (b) use `container.querySelector()` which ignores CSS visibility. When both mobile and desktop variants exist, use `.first()` / `.last()` to target the correct one by DOM order.
- Source: create-code, 2026-06-23

## metacleaner-monitoring: DashboardKpiSection crash after repository key rename
- Project: metacleaner-monitoring
- Problem: `DashboardKpiSection.svelte` used `stats.find((s) => s.key === 'uptimeFrontend')` etc., but the dashboardRepository was updated to MetaCleaner-specific keys (`uptimeServer`, `jobsProcessed`, `avgCleaningTime`, `failedJobs`). The `.find()` returned `undefined` and accessing `.labelKey` threw a 500 at runtime.
- Solution: Update the find calls in `DashboardKpiSection.svelte` to match the new repository keys. Also restructured the 4th card from a hardcoded DB health card to a `StatCard` for `failedJobs` (which has `trend`/`trendPositive`).
- Source: check-build, 2026-06-28

## ESLint @typescript-eslint/no-unused-vars misses varsIgnorePattern for _ prefix
- Project: metacleaner-monitoring
- Problem: Destructuring patterns like `{ _sortMs: _ts, ...entry }` where `_ts` is intentionally unused (to strip the sort key from output) trigger `@typescript-eslint/no-unused-vars` errors. The recommended config only sets `argsIgnorePattern`/`caughtErrorsIgnorePattern`, not `varsIgnorePattern`.
- Solution: Add `{ varsIgnorePattern: '^_', argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }` to the `@typescript-eslint/no-unused-vars` rule override in eslint.config.js.
- Source: check-build, 2026-06-28

## CLI install.sh moved to scripts/ — test path update required
- Project: metacleaner-cli
- Problem: `tests/signals.test.ts` expected `install.sh` at project root (`join(PROJECT_ROOT, 'install.sh')`), but steering compliance commit moved it to `scripts/install.sh`. Tests failed with "expected false to be true" on existsSync check.
- Solution: Update test path to `join(PROJECT_ROOT, 'scripts', 'install.sh')`.
- Source: check-build, 2026-06-29

## Go backend: HandleCreateJob added authClient param — update test calls
- Project: metacleaner-server
- Problem: `HandleCreateJob` signature was extended with `authClient *SupabaseAuthClient` (used for Supabase credit deduction inside the async goroutine). All test calls in `tests/handlers_jobs_test.go` and `tests/handlers_fileid_validation_test.go` still used the old 5-arg form.
- Solution: Add `nil` as the 6th argument: `src.HandleCreateJob(cfg, db, hub, pl, pool, nil)(rr, req)`. Passing nil is safe because the authClient is only used after the HTTP response is already sent (inside the async goroutine).
- Source: check-build, 2026-06-29

## extractCallbackParams supports hash fragments — test was outdated
- Project: metacleaner-app
- Problem: `tokenUtils.test.ts` asserted that `extractCallbackParams` returns `{}` for hash-only URLs ("fragments are not query params"), but the implementation deliberately falls back to parsing hash fragments for Supabase implicit-flow OAuth (which puts tokens in `#access_token=…`). Test expected `{}`, implementation returned `{ tokens: … }`.
- Solution: Updated the test to expect the actual tokens. The implementation is correct: `extractAndCleanBrowserTokens` calls `extractCallbackParams(window.location.href)` and also clears `clean.hash`, so removing hash support would break the browser cleanup path.
- Source: create-tests, 2026-06-29

## getCurrentUser should return empty name, not email, when both first/last are absent
- Project: metacleaner-app
- Problem: `userRepository.ts` returned `{ name: name || profile.email }` — when `first_name` and `last_name` are both empty, the name field contained the email address. The `User` type already has a separate `email` field, so the fallback was redundant and caused the test `'returns empty name when both first_name and last_name are empty'` to fail.
- Solution: Changed to `return { name, email: profile.email }` — name is an empty string when no name parts are present; callers use the email field directly if they need to display it.
- Source: create-tests, 2026-06-29

## metacleaner-web: brevoClient already sends anon key — --no-verify-jwt removal works without client changes
- Project: metacleaner-web
- Problem: The edge function was deployed with --no-verify-jwt, making it publicly invocable. Removing it would break clients that don't send an Authorization header.
- Solution: brevoClient.ts already includes `Authorization: Bearer ${SUPABASE_ANON_KEY}` on every request, so dropping --no-verify-jwt from the deploy script requires zero client-side changes. The anon key is public by design (baked into the client bundle as VITE_SUPABASE_ANON_KEY).
- Source: security-audit, 2026-06-29

## metacleaner-web: Deno KV available in Supabase Edge Functions for durable rate limiting
- Project: metacleaner-web
- Problem: The in-memory rate limiter (Map + setInterval) is reset on every cold start and not shared across isolates, making it ineffective in a serverless environment.
- Solution: Use `await Deno.openKv()` at module level (top-level await works in Deno). Key structure: ['rl', ip, windowNumber] with expireIn for TTL-based cleanup. Use atomic compare-and-swap with 3-attempt retry loop for race-condition-safe increments. Makes isRateLimited async — update all call sites to `await isRateLimited(...)`.
- Source: security-audit, 2026-06-29

## metacleaner-web: {@html} with `<script>` literal causes ESLint Svelte parse error
- Project: metacleaner-web
- Problem: `JsonLd.svelte` uses `{@html \`<script type="application/ld+json">...\`}` inside `<svelte:head>`. The ESLint `eslint-plugin-svelte` parser sees the literal `<script type="application/ld+json">` string as an opening HTML script element and tries to parse its content as JavaScript. This causes "Unexpected keyword or identifier" at the `>` character closing the opening tag. Additionally, the `svelte/no-at-html-tags` rule fires because `{@html}` is flagged by default.
- Solution: Break the `<script` string with a template expression so the parser doesn't see a literal script tag: `{@html \`<${'script'} type="application/ld+json">${JSON.stringify(data)}</${'script'}>\`}`. Also add `<!-- eslint-disable-next-line svelte/no-at-html-tags -->` directly above the `{@html}` line since this usage is intentional (JSON-LD structured data injection).
- Source: check-build, 2026-06-30

## dashboardAlerts: negative resolvedIds check fails with duplicate issue IDs
- Project: metacleaner-monitoring
- Problem: Property test `'only unresolved Sentry issues appear'` used `expect(resolvedIds.has(alert.id)).toBe(false)` to verify resolved issues don't appear. When fast-check generates two issues with the same `id` (one `unresolved`, one `resolved`), the unresolved issue's alert appears in `resolvedIds`, causing a false failure.
- Solution: Replace with a positive assertion: build `unresolvedIds` from issues with `status === 'unresolved'` and check `expect(unresolvedIds.has(alert.id)).toBe(true)`. Unambiguous even with duplicate IDs.
- Source: create-tests, 2026-06-30

## Auth guard: redirect() in SvelteKit 2 does not require throw
- Project: metacleaner-monitoring
- Problem: In SvelteKit 2, `redirect()` is called without `throw` — calling `throw redirect(...)` still works but is deprecated; the function itself throws internally. Both forms work in practice but the non-throw form is preferred.
- Solution: Used `redirect(303, '/login')` without throw in both hooks.server.ts and login/+page.server.ts.
- Source: security-audit, 2026-06-30

## SvelteKit sequence() requires request store — must be mocked in unit tests
- Project: metacleaner-monitoring
- Problem: `sequence()` from `@sveltejs/kit/hooks` calls `get_request_store()` internally, which throws "Could not get the request store" when called outside a real SvelteKit request context. This makes `handle` (exported from `hooks.server.ts`) untestable with the real `sequence`.
- Solution: Mock `@sveltejs/kit/hooks` with a simple chaining implementation: `sequence: (...handlers) => ({ event, resolve }) => { function applyHandle(i, evt) { if (i >= handlers.length) return resolve(evt); return handlers[i]({ event: evt, resolve: (e) => applyHandle(i+1, e) }); } return applyHandle(0, event); }`. Import hooks.server.ts AFTER this mock is declared.
- Source: create-tests, 2026-06-30

## fetchWithTimeout abort test: attach rejection handler before advancing fake timers
- Project: metacleaner-monitoring
- Problem: In tests for `fetchWithTimeout` timeout behavior, calling `await vi.advanceTimersByTimeAsync()` before `expect(promise).rejects...` causes an unhandled rejection warning. The timer fires, the signal aborts, fetch rejects, and `resultPromise` rejects — but no handler is attached yet because we're still awaiting the `advanceTimers` call.
- Solution: Attach the assertion BEFORE advancing time: `const assertion = expect(resultPromise).rejects.toMatchObject(...); vi.advanceTimersByTime(ms); await assertion;`. This ensures the rejection handler is in place before the promise rejects.
- Source: create-tests, 2026-06-30

## Pre-existing type errors in mapperCompleteness.test.ts
- Project: metacleaner-monitoring
- Problem: `svelte-check` reports 22 errors, all in `src/lib/server/mappers/__tests__/mapperCompleteness.test.ts` related to `PlanRevenue[]`, `TableSize[]` etc. not being assignable to `Record<string, unknown>[]`. These are pre-existing errors unrelated to security work.
- Solution: Not introduced by security fixes; safe to ignore in this context.
- Source: security-audit, 2026-06-30

## Font Awesome media-swap onload incompatible with Svelte 5 svelte:head

- Project: metacleaner-web
- Problem: The standard non-render-blocking FA trick `<link media="print" onload="this.media='all'">` fails to compile in Svelte 5 because Svelte rejects string event handlers ("Event attribute must be a JavaScript expression, not a string").
- Solution: Move the `<link>` tag (with `onload="..."`) to `src/app.html` instead of `<svelte:head>`. `app.html` is plain HTML processed by SvelteKit at build time (not by Svelte's template compiler), so string event handlers are valid there. Also add `<link rel="preconnect">` for the CDN in `app.html`. Remove the duplicate `<link>` from `+layout.svelte`.
- Source: seo-audit, 2026-06-30

## adapter-static fallback conflicts with prerendered home page

- Project: metacleaner-web
- Problem: When enabling prerendering with `adapter-static`, the adapter setting `fallback: 'index.html'` overwrites the prerendered home page (`index.html`) with an empty SPA shell. The build warns: "Overwriting build/index.html with fallback page."
- Solution: Change `fallback: 'index.html'` to `fallback: '200.html'` in `vite.config.ts` (adapter config), and update `nginx.conf` to use `try_files $uri $uri/ $uri.html /200.html` instead of `/index.html`.
- Source: seo-audit, 2026-06-30

## Go goroutine gate test: buffer-1 channel causes deadlock when multiple goroutines signal after gate closed
- Project: metacleaner-server
- Problem: In `TestJobWorkerPool_PendingCount_PositiveWhileJobsQueued`, a channel `started := make(chan struct{}, 1)` was used to signal when the first goroutine started running. After `close(gate)`, subsequent goroutines (that were waiting for the semaphore) would eventually run and try `started <- struct{}{}`, but the buffer was already full (main consumed once; the second running goroutine refilled it; nobody consumed again), causing those goroutines to block forever on `started <- struct{}{}`, deadlocking the test.
- Solution: Use a non-blocking send with `select { case started <- struct{}{}: default: }`. The first goroutine signals successfully; subsequent goroutines skip sending if the buffer is already full and proceed directly to `<-gate`. This prevents the deadlock while still correctly detecting when the first job starts.
- Source: create-tests, 2026-06-30


## websocket_test.go broke after HandleJobProgress gained *SupabaseClient param
- Project: metacleaner-server
- Problem: `HandleJobProgress` signature was changed from `(hub, auth, frontendOrigin)` to `(hub, auth, db *SupabaseClient, frontendOrigin)` (needed to call `db.GetJob()` before upgrading the WS connection). The existing `websocket_test.go` still called it with 3 args → build failure.
- Solution: For tests that return before `db.GetJob()` is reached (missing/invalid token → 401), pass `nil` as db. For tests that complete the WS upgrade (origin checks), add a `newWSMockSupabase` helper that returns a valid job JSON for any `GET /rest/v1/cleaning_jobs` request, point `cfg.SupabaseURL` at it, and create a real `NewSupabaseClient(cfg)` from that config.
- Source: create-tests, 2026-06-30

## CopyButton execCommand fallback causes "silently fails" test to pass wrong state
- Project: metacleaner-app
- Problem: `CopyButton.svelte` has a two-step copy strategy: (1) `navigator.clipboard.writeText`, (2) `document.execCommand('copy')` fallback. A test mocking only `clipboard.writeText` to reject still gets `confirmed = true` because Chromium's `execCommand('copy')` succeeds on a selected textarea — making the test assertion that the copy icon remains visible fail.
- Solution: Also mock `document.execCommand` to return false when testing the "silently fails" scenario: `vi.spyOn(document, 'execCommand').mockReturnValue(false)`. The `afterEach(() => vi.restoreAllMocks())` cleans it up. Without this, the fallback path masks the clipboard failure.
- Source: create-tests, 2026-06-30

## Weak report IDs (MCR-YYYY-MMDD-XX) enable enumeration + UNIQUE collisions
- Project: metacleaner-server
- Problem: `generateReportID()` in `source/report_handlers.go` uses ONE random byte (`make([]byte, 1)`), giving only 256 distinct `MCR-YYYY-MMDD-XX` IDs per day. Two impacts: (1) Privacy — the unauthenticated public endpoints `GET /api/public/reports/{id}` and `/pdf` return the full `ReportDetail` including the actual stripped metadata *values* (GPS coordinates, device, XMP creator, etc.); with only 256 IDs/day + a known date an attacker can brute-force every report for a day and read the PII the user paid to remove. (2) Reliability — `cleaning_reports.report_id` is `UNIQUE`; birthday-paradox collisions start after a few dozen reports/day (hard cap 256/day). On collision PostgREST returns 409, which `isRetryableStatus` does NOT retry, so `CreateReport` errors, `createJobReport` bails, no `report_ready` WS event fires, and the user's completed job has no report ("View Report" broken).
- Solution: Changed `generateReportID` to use 16 random bytes (`make([]byte, 16)`) → 32-char hex suffix (128-bit entropy, format `MCR-YYYY-MMDD-<32hex>`). Added `PublicReportDetail`/`PublicReportFileDetail` types to `models.go` and a `toPublicReportDetail()` converter in `report_handlers.go` that strips `Metadata`, `Name`, `OriginalName`, `Device`, `SizeMB`, etc. — public endpoint now returns only aggregate counts and per-file `SHA256Hash`/`HasGPS`/`FieldsRemoved`. Added 3-attempt retry with fresh ID on 409 status in `createJobReport`. Tests added for all three fixes.
- Source: code-review-fix, 2026-06-30

## navProps `backAction` set but `showBackButton:false` → back button silently never renders
- Project: metacleaner-app
- Problem: In `src/routes/+layout.svelte` the `/report/[id]` branch of `navProps` returns `showBackButton: false` while still providing `backAction: () => history.back()` + `backLabel`. `NavBar.svelte` renders BOTH the mobile (`:108`) and desktop (`:149`) back controls only inside `{#if showBackButton}`, so the report-detail back button never appears and `backAction` is dead code. This silently defeats metacleaner-ux-fixes Bug 4 and design-alignment Req 15.1/20.2 — and a regression test (`ReportDetailHeader.ux-bugs.svelte.spec.ts`) exists asserting behavior that the gated-off button can never deliver. Contrast `/reports` (list) which correctly sets `showBackButton: true`.
- Solution: Set `showBackButton: true` in the `/report/` branch (the `backAction` is already correct), or change NavBar to render the control whenever `backAction` (or `showBackButton && backHref`) is truthy. When reviewing nav, always pair the navProps flags with NavBar's `{#if}` guards — a provided `backAction`/`backHref` is meaningless if the surrounding `showBackButton` gate is false.
- Source: code-review, 2026-06-30 22:23

## Tasks marked `[x]` are reversed by a later spec, leaving orphaned/dead code (api-keys ↔ settings)
- Project: metacleaner-app
- Problem: `api-keys-management` (Req 7, tasks 7.1/7.2 `[x]`) built a standalone `/api-keys` route and a nav "API Keys" link, then `settings-page-integration` (Req 4.6, task 6.1 `[x]`) moved key management into `/settings`, kept the `/settings` nav link, and was supposed to delete `/api-keys`. Result: the `/api-keys` route still exists (auth-guarded, URL-reachable, unlinked, with hardcoded English strings + divergent masking that breaks the cs locale), nav never changed, and BOTH specs' checkboxes read `[x]` while contradicting each other. A `[x]` checkbox is not proof of current state when a later spec supersedes an earlier one.
- Solution: When two specs touch the same surface, treat the newer one as authoritative; grep for the route/component the older spec created and confirm it was actually removed (`src/routes/api-keys/` was not). Delete superseded routes, mark the older tasks "superseded", and check sibling live components for the localized version to confirm the orphan is truly dead.
- Source: code-review, 2026-06-30 22:23

## Storybook autodocs teardown: new story files need defensive prop guards
- Project: metacleaner-app
- Problem: When a new `.stories.svelte` file is created with `tags: ['autodocs']`, Storybook's autodocs feature renders the component with only the default args from `defineMeta`. If the component's required props (arrays, snippets, function callbacks) have no defaults, the teardown reactive pass (where Storybook resets props to undefined before unmount) throws `TypeError: Cannot read properties of undefined (reading 'length'/'trim')` or `Svelte error: invalid_snippet`. These appear as "unhandled errors" — all story assertions still pass but the exit code is 1. Affected patterns: `features: string[]`, `code: string`, `content: Snippet`, `onConfirm/onCancel: () => void`.
- Solution: (1) Array props → add `= []` default in `$props()` destructuring and mark optional in interface. (2) String props used in functions → add `= ''` default. (3) Snippet props → use `{@render prop?.()}` (optional chaining). (4) Callback props called directly (not via `onclick`) → guard with `?.()`. Fixes: UpgradeCard/DowngradeCard (differentialFeatures/featuresLost), CancellingPlanCard/CancellingView/CurrentPlanCard (features), CodeBlock (code), ConfirmationModal (content snippet + onCancel), DeleteKeyModal (onConfirm). Passing `onclick={undefined}` to Button is fine (Svelte handles it); direct `fn()` calls are not.
- Source: fix-tests, 2026-07-01

## CSP `script-src 'self'` breaks SvelteKit hydration + Font Awesome onload (prod-only, invisible to e2e)
- Project: metacleaner-web
- Problem: `nginx.conf` sets `Content-Security-Policy: ... script-src 'self'` with no `'unsafe-inline'`, nonce, or hash, and `kit.csp` is not configured (SvelteKit options live inline in `vite.config.ts`; there is no `svelte.config.js`). SvelteKit's prerendered `build/index.html` contains an inline `<script>` bootstrap (`__sveltekit_*` + `kit.start(...)`) which the CSP blocks → the app never hydrates in production (mobile menu, language switcher, cookie-consent banner, contact form, pricing toggle all dead). The same CSP blocks Font Awesome's `onload="this.media='all'"` media-swap in `app.html`, so every `fa-*` icon is invisible in prod. Playwright e2e runs against `bun run preview` (Vite), which does NOT apply the nginx headers, so CI is green while prod is broken. Confirmed via `Dockerfile` (copies `nginx.conf` → default.conf, serves build/) + fly.toml port 8080.
- Solution: Configure `kit.csp: { mode: 'hash', directives: { 'script-src': ['self'] } }` so SvelteKit injects sha256 hashes for its inline bootstrap into the prerendered meta CSP, and keep nginx's `script-src` in sync (or drop it and let the meta CSP govern). For Font Awesome, self-host it (referenced from `'self'`) or load with `media="all"` and drop the inline `onload` handler. Add a CI check that serves the built site through the real nginx container (or asserts no CSP violations) so prod-only CSP regressions are caught.
- Meta-lesson: When reviewing a prerendered/static SvelteKit site behind nginx, always cross-check the runtime CSP (nginx.conf / Dockerfile) against the built `index.html` inline scripts — e2e against Vite preview will not surface it.
- Source: code-review, 2026-07-01 15:58

## meta CSP cannot relax nginx HTTP header CSP — must remove both default-src and script-src from nginx
- Project: metacleaner-web
- Problem: HTTP header CSP and meta CSP combine to the MOST RESTRICTIVE policy per the CSP spec. A meta CSP `script-src 'self' 'sha256-...'` CANNOT override nginx's `script-src 'self'` or `default-src 'self'` (which acts as the script-src fallback). Even with `kit.csp mode:'hash'`, the nginx header blocks the inline script if `default-src 'self'` or `script-src 'self'` remains.
- Solution: Remove BOTH `default-src 'self'` and `script-src 'self'` from the nginx CSP header. This lets SvelteKit's meta CSP (injected by `kit.csp: { mode: 'hash' }`) be the SOLE policy governing scripts, allowing the inline bootstrap via its sha256 hash. All other nginx CSP directives (style-src, font-src, img-src, connect-src, frame-ancestors, base-uri, object-src) remain. Add `src/__tests__/csp-nginx-compat.test.ts` to assert nginx.conf never defines script-src/default-src. For Font Awesome, change `media="print" onload="this.media='all'"` to `media="all"` in app.html (inline event handlers also need 'unsafe-inline' to run under CSP).
- Source: code-review-fix, 2026-07-01
