# Memory

## pipeline_integration_test.go: LocalID and exiftool script args were wrong

- Problem: `TestPipelineMixedSuccess` failed because (1) FileRecord structs lacked `LocalID` field (pipeline uses `f.LocalID` for disk path lookup, not `f.ID`), and (2) the fake exiftool shell script used `cp "$3" "$2"` but the actual call is `exiftool -all= -o <cleanedPath> <originalPath>` so `$3`=cleanedPath, `$4`=originalPath — the copy should be `cp "$4" "$3"`.
- Solution: Add `LocalID: "f-ok"` etc. to FileRecord structs in the test, and change `cp "$3" "$2"` to `cp "$4" "$3"` in the exiftool script.
- Source: create-code, 2026-06-10T15:30:00+00:00

## $state<Date> triggers svelte/prefer-svelte-reactivity lint error

- Problem: Storing `new Date()` in `$state<Date | null>` triggers ESLint error `svelte/prefer-svelte-reactivity` — Svelte's lint rule requires `SvelteDate` from `svelte/reactivity` instead of the native `Date` class for reactive state.
- Solution: Store the timestamp as `$state<number | null>` using `Date.now()` instead of `new Date()`. This avoids the reactive wrapper requirement while still allowing comparison arithmetic.
- Source: code-review-fix, 2026-06-05

## PUBLIC_API_URL requires .env file for svelte-check to pass

- Problem: After adding `import { PUBLIC_API_URL } from '$env/static/public'`, svelte-check reports "Module '$env/static/public' has no exported member 'PUBLIC_API_URL'" even when the .env file exists, because the SvelteKit ambient types are stale.
- Solution: Run `npx svelte-kit sync` to regenerate `.svelte-kit/ambient.d.ts` which picks up new PUBLIC\_ vars from .env. Also create both `.env` (for local dev, gitignored) and `.env.example` (committed, for documentation).
- Source: code-review-fix, 2026-06-05

## resolve() from $app/paths rejects dynamic route strings — cast to Pathname

- Problem: `resolve('/report/' + report.id)` or `resolve(\`/report/${id}\`)`fails TypeScript because`resolve()`is typed to accept only known static route strings (the`Pathname` union). Dynamic interpolated strings produce type error "Argument of type '[never]' is not assignable to parameter of type 'never'".
- Solution: Cast the dynamic string: `resolve(\`/report/${id}\` as Pathname)` where `Pathname` is imported from `'$app/types'`.
- Source: code-review-fix, 2026-06-05

## SvelteKit [id] route alongside static /report route — both valid

- Problem: Having both `/routes/report/+page.svelte` (static `/report` route) and `/routes/report/[id]/+page.svelte` (dynamic `/report/abc` route) causes no conflict in SvelteKit. Components in `/routes/report/components/` and `/routes/report/sections/` are importable from both routes.
- Solution: Keep the components in place; add `[id]` subdirectory with its own `+page.svelte`; redirect the static `/report` page to `/reports` using browser check.
- Source: code-review-fix, 2026-06-05

## Playwright browser tests fail without system libraries

- Problem: `npm test` / `bun test` fails with `libnspr4.so: cannot open shared object file`. Chromium headless shell requires system libraries not installed by default.
- Solution: Run `npx playwright install chromium` to download the browser, then `npx playwright install-deps chromium` (requires root/sudo) to install OS dependencies. In sandboxed environments without root, browser/storybook tests cannot run; server-side tests (`--project=server`) work fine.
- Source: check-build, 2026-06-05

## svelte/no-navigation-without-resolve requires Pathname type for dynamic hrefs

- Problem: Adding `resolve()` from `$app/paths` to components that receive `href` as a `string` prop (e.g. NavBar.svelte `backHref`, Button.svelte `href`) causes TypeScript error: `Argument of type '[string]' is not assignable to parameter of type '[route: "/"] | ...'`. The `resolve()` function is typed to only accept SvelteKit's generated route union types.
- Solution: Import `type { Pathname } from '$app/types'` and cast: `resolve(backHref as Pathname)`. For generic components like Button that only accept internal routes, change the prop type to `Pathname` instead of `string`. This satisfies both the ESLint rule and TypeScript.
- Source: check-build, 2026-06-05

## locale.current reactive dependency pattern triggers no-unused-expressions

- Problem: The pattern `locale.current;` (bare expression) used throughout svelte components to create a reactive dependency for the `tx()` translation function triggers `@typescript-eslint/no-unused-expressions` ESLint error.
- Solution: Change `locale.current;` to `void locale.current;`. The `void` operator makes it an explicit void expression, which is excluded from the no-unused-expressions rule. Affected ~50 svelte files.
- Source: check-build, 2026-06-05

## eslint-plugin-storybook must be added to ESLint config

- Problem: `import storybook from 'eslint-plugin-storybook'` in eslint.config.js triggers `@typescript-eslint/no-unused-vars` because the plugin was imported but never added to the defineConfig call.
- Solution: Add `...storybook.configs['flat/recommended']` inside the `defineConfig(...)` call. The plugin's flat config is exported as `storybook.configs['flat/recommended']`.
- Source: check-build, 2026-06-05

## Docker build fails: bun.lock outdated after package.json changes

- Problem: `docker build` fails with `error: lockfile had changes, but lockfile is frozen` when running `bun install --frozen-lockfile`. Happens when `package.json` is updated but `bun.lock` is not regenerated (e.g. after adding/updating dependencies).
- Solution: Cannot mount `/workspace` into Docker containers in this environment (volume mounts appear empty). Instead, build a temporary Docker image that runs `bun install` and pipe the updated lockfile out: `docker build -f - -t bun-lockfile-generator . <<'EOF'\nFROM oven/bun:1\nWORKDIR /app\nCOPY package.json bun.lock ./\nRUN bun install\nCMD ["cat", "bun.lock"]\nEOF` then `docker run --rm bun-lockfile-generator > bun.lock`.
- Source: verify-builds, 2026-06-05

## Hardcoded English strings in scanner UI components

- Problem: `ScanProgressIndicator.svelte` ("Pending", "Scanning") and `UploadZoneCard.svelte` ("Scanning X/Y files...") have hardcoded English text instead of using `tx()` i18n function. Same issue in `RiskScoreRing.svelte` ("RISK SCORE" label).
- Solution: Add i18n keys to `messages/en.json` and `messages/cs.json`, then replace hardcoded strings with `tx('key')` calls. Ensure the component imports `locale` and `* as m from '$lib/paraglide/messages'`.
- Source: code-review, 2026-06-05T12:19:50.256+00:00

## FileListItemRisk remove button invisible on mobile

- Problem: The remove (x) button uses `opacity-0 group-hover:opacity-100` which means touch/mobile users can never see or tap it since there's no hover state on mobile.
- Solution: Use `opacity-100 lg:opacity-0 lg:group-hover:opacity-100` to always show on mobile but hover-reveal on desktop.
- Source: code-review, 2026-06-05T12:19:50.256+00:00

## Step3 not connected to scanner store (broken pipeline)

- Problem: The "Start Cleaning" button navigates to `/step3` but step3 still reads files from mock `getUploadedFiles()` in `fileRepository.ts`, not from the scannerStore. The upload→scan→clean pipeline is broken at the transition.
- Solution: Refactor `step3/+page.svelte` to import `scannerStore` and use `$derived(scannerStore.files)` as `uploadedFiles`. The mock `ProcessingState` must also be generated from the real file IDs (not hardcoded mock IDs) so the `getFileById()` lookups in child sections find real files. All step3 child components (`FileItemProcessing`, sections) were updated from `UploadedFile` → `QueuedFile` (`size: number` needs `formatSize()`, `extension` is `.jpg` not `JPG` so strip dot and uppercase for display).
- Source: code-review-fix, 2026-06-05T12:50

## DropZone has no keyboard accessibility

- Problem: The DropZone component uses a `<div>` with onclick (suppressing a11y warnings) but has no role, tabindex, or keyboard handler. Keyboard-only users cannot activate it.
- Solution: Add `role="button"`, `tabindex="0"`, and `onkeydown` handler that triggers the hidden file input on Enter/Space keypress.
- Source: code-review, 2026-06-05T12:38:40.905+00:00

## Step4/Step5 still use mock fileRepository instead of scannerStore

- Problem: `step4/+page.svelte` and `step5/+page.svelte` import `getUploadedFiles()` from `fileRepository.ts` which returns hardcoded mock data. The real file data from scannerStore is lost after step3.
- Solution: Refactor step4 and step5 to import scannerStore and derive file list from `scannerStore.files` using `QueuedFile` type (same pattern as step3 fix). Update child components from `UploadedFile` to `QueuedFile`.
- Source: code-review, 2026-06-05T12:54:53.811+00:00

## RiskScannerCard chip labels swapped between deviceIdentity and personalData

- Problem: In RiskScannerCard.svelte, `chipIdentity` ("Identity") is shown for `categories.deviceIdentity > 0` and `chipDevice` ("Device") is shown for `categories.personalData > 0`. The semantic meaning is reversed.
- Solution: Swap the conditions: use `chipDevice` for deviceIdentity and introduce `chipPersonal` for personalData, or swap the existing assignments.
- Source: code-review, 2026-06-05T12:54:53.811+00:00

## No route guards on step3/step4/step5 — accessible without files

- Problem: Users can navigate directly to `/step3`, `/step4`, `/step5` via URL with no files in scannerStore. Pages render empty/broken state or mock data.
- Solution: Use `$effect(() => { if (!scannerStore.hasFiles) goto(resolve('/' as Pathname), { replaceState: true }); });` at the top of each step's `\<script\>` block. Using `$effect` (not bare script) ensures it runs only in the browser, avoids SSR issues, and reacts to reactive changes.
- Source: code-review-fix, 2026-06-05

## step4/step5 UploadedFile → QueuedFile migration pattern

- Problem: `step4/+page.svelte` and `step5/+page.svelte` used `getUploadedFiles()` (mock fileRepository) returning `UploadedFile` (size: string, extension: 'JPG'). All child components (`ErrorFilesCard`, `ErrorLogAccordion`, `ErrorStateCard`, `FileResultsCard`, `FileResultItem`) used `UploadedFile`.
- Solution: Replace `UploadedFile` with `QueuedFile` throughout. Key field mapping: `file.size` (number) → `formatSize(file.size)`, `file.extension` ('.jpg') → `file.extension.replace('.', '').toUpperCase()`, `file.hasGps` → `file.scanResult?.hasGps ?? false`, `file.metadataFieldCount` → `file.scanResult?.fieldCount ?? 0`, `file.device` → `file.scanResult?.device`. For step5's `FileResultsCard`, switch from ID-based result lookup to index-based pairing since mock result IDs don't match real file IDs.
- Source: code-review-fix, 2026-06-05

## No backend integration exists — entire processing pipeline is mock

- Problem: Steps 3/4/5 use hardcoded mock data from `processingRepository.ts`. No HTTP client, no WebSocket connection, no API calls. The backend spec defines 9 REST endpoints and a WebSocket protocol — none are called.
- Solution: Create an API client module (`src/lib/api/client.ts`) that implements upload, job creation, WebSocket progress, file download, and report fetching. Wire each step to the real data flow.
- Source: code-review, 2026-06-05T17:02:02.923+00:00

## Step2 is just a redirect — risk review page not implemented

- Problem: `step2/+page.svelte` only does `goto('/')`. The spec defines step2 as "Risk analysis review" — a distinct page. The "Start Cleaning" button on step1 navigates directly to `/step3`, skipping step2.
- Solution: Either implement step2 as a full review page with confirm CTA, or formally merge it with step1 (which already shows RiskScannerCard) and remove the dead route + empty directories.
- Source: code-review, 2026-06-05T17:02:02.923+00:00

## processingRepository.ts contains hardcoded Czech text

- Problem: `getErrorState()` mock data has Czech `description` strings in errorTypes: "Interní chyba při čištění metadat", "Ztráta spojení se serverem", "Operace překročila časový limit". Violates i18n and code language standards.
- Solution: Replace with English placeholders or i18n keys. When rendered in components, use `tx()` to look up the localized version.
- Source: code-review, 2026-06-05T17:02:02.923+00:00

## cleaningStore file_error handler maps to wrong statuses

- Problem: The `file_error` WebSocket event handler in `cleaningStore.svelte.ts` sets the failed file's status to `'waiting'` and log entry to `'in_progress'` instead of error-indicating values. The `FileProcessingStatus` type doesn't include `'error'`.
- Solution: Extend `FileProcessingStatus` to `'done' | 'in_progress' | 'waiting' | 'error'`. In the `file_error` handler, set file status to `'error'` and log status to a failure indicator.
- Source: code-review, 2026-06-05T17:25:48.603+00:00

## step5 FileResultsCard gets empty fileResults from cleaningStore

- Problem: `cleaningStore.results.fileResults` is always `[]` because the `job_complete` WS event doesn't contain per-file breakdown. The store's `handleWsEvent` for `job_complete` sets `fileResults: []`. The `FileResultsCard` then uses index-based lookup against an empty array.
- Solution: Accumulate per-file results during `file_complete` events (fieldsRemoved, gpsRemoved) in a temporary array, then assign to `results.fileResults` when `job_complete` fires. Or fetch full report via GET /api/reports/{id} after completion.
- Source: code-review, 2026-06-05T17:25:48.603+00:00

## WebSocket disconnect immediately treated as fatal error

- Problem: When WebSocket closes or errors during processing, step3 immediately navigates to step4 (error page). Backend continues processing (Req 3.6), so the job may complete successfully.
- Solution: On WS close/error, attempt reconnect or fall back to polling `GET /api/jobs/{id}` every 2-3s. Only treat as error if polling confirms job failure or times out.
- Source: code-review, 2026-06-05T17:25:48.603+00:00

## PUBLIC_API_URL empty in Docker production build

- Problem: `$env/static/public` resolves `PUBLIC_API_URL` at build time. The Dockerfile never copies `.env` into the build stage, so the variable bakes as empty string. The fallback `|| 'http://localhost:8080'` then points to nginx (the container itself) not the backend.
- Solution: Switch to `$env/dynamic/public` for runtime resolution, or add `ARG PUBLIC_API_URL` to the Dockerfile build stage and inject via `--build-arg`, or use relative URLs with nginx proxy.
- Source: code-review, 2026-06-05T17:46:39.061+00:00

## Missing i18n keys for step3 upload phase and report detail page

- Problem: Keys `step3.badge.uploading`, `step3.upload.title`, `step3.upload.description`, `common.loading`, `common.error`, `common.footer.copyright` are used in templates but don't exist in en.json/cs.json. Code uses `|| 'English fallback'` which breaks i18n for Czech users.
- Solution: Add all missing keys to both `messages/en.json` and `messages/cs.json`.
- Source: code-review, 2026-06-05T17:46:39.061+00:00

## WebSocket polling fallback too aggressive — 30s timeout for long operations

- Problem: When WS disconnects, step3 polls `GET /api/jobs/{id}` with `MAX_POLLS = 10` at 3s intervals (30s total). Large file batches (500MB × multiple files) can take several minutes on the backend.
- Solution: Increase `MAX_POLLS` to 100+ (5+ minutes) or use exponential backoff. Also attempt WS reconnection before falling back to polling.
- Source: code-review, 2026-06-05T17:46:39.061+00:00

## report/[id] page used real API client instead of mockCleaningService

- Problem: `/report/[id]/+page.svelte` imported `getReportDetail` from `$lib/api/client` and used `mapApiToReportDetail()` adapter — always failed with network error since no backend exists.
- Solution: Replace with `mockCleaningService.getReportDetail(id)` which returns `ReportDetail` directly (no mapping needed). Also removed `|| 'Loading report...'` hardcoded fallbacks — `tx()` already returns key name when key is missing.
- Source: code-review-fix, 2026-06-06

## Session report ID must be stored in cleaningResultsStore for navigation

- Problem: Step5 "View Report" navigated to static `/report` — no way to pass the session's job ID to the report detail page. The job ID is only available inside `onMount` where `job` is set.
- Solution: Add `reportId` field to `cleaningResultsStore`. In `Step3Processing.svelte`'s `onComplete` callback, pass `job?.jobId` (which is set synchronously before `onComplete` fires asynchronously) to `setResults(results, job?.jobId)`. Step5 then reads `cleaningResultsStore.reportId` for navigation.
- Source: code-review-fix, 2026-06-06

## cleaningResultsStore not cleared on appState.reset()

- Problem: `appState.reset()` calls `scannerStore.clearFiles()` but not `cleaningResultsStore.clear()`. Stale success/error data persists across sessions, potentially causing incorrect UI state after re-cleaning.
- Solution: Add `cleaningResultsStore.clear()` inside the `reset()` function in `src/lib/stores/appState.svelte.ts`.
- Source: code-review, 2026-06-06T20:01:35+00:00

## Step3Processing does not cancel job on component unmount

- Problem: If user navigates away during processing (e.g., browser back, direct URL change), the mock cleaning service continues running and may call `appState.transitionTo('success'/'error')` after the component is destroyed.
- Solution: Return a cleanup function from `onMount(() => { ... return () => { job?.cancel(); }; })` in `Step3Processing.svelte`.
- Source: code-review, 2026-06-06T20:01:35+00:00

## /report/[id] route calls real API instead of mock service

- Problem: `src/routes/report/[id]/+page.svelte` imports `getReportDetail` from `$lib/api/client` which makes real HTTP requests to `PUBLIC_API_URL`. No backend exists, so the page always shows an error state.
- Solution: Switch to `mockCleaningService.getReportDetail(id)` to match the rest of the app, or add fallback to mock on network error.
- Source: code-review, 2026-06-06T20:01:35+00:00

## Dead API client module persists after mock service migration

- Problem: `src/lib/api/client.ts` (175+ lines with HTTP/WebSocket functions) has zero imports anywhere in the codebase. It was superseded by `mockCleaningService.ts` but never deleted, violating Requirement 22 (remove dead code).
- Solution: Delete the file. When real backend integration is needed, create a new implementation of the `CleaningService` interface from `cleaningService.ts`.
- Source: code-review, 2026-06-06T20:16:48+00:00

## Hardcoded strings bypass i18n in error/log computation functions

- Problem: Template-literal strings with English/Czech text appear inside `$derived` or helper functions (e.g., Step4Error `computeLogEntries` uses `"fields removed"`, FileResultsCard uses `"polí"`). These bypass `tx()` because they're in script logic, not templates — easy to miss in review.
- Solution: Always use `tx()` for ANY user-visible text, even inside computed helper functions. Pass the `tx` function reference or call it at render-time in the template rather than baking text into data structures.
- Source: code-review, 2026-06-06T20:16:48+00:00

## Hardcoded fallback strings hide missing i18n keys

- Problem: Pattern `tx('key') || 'English fallback'` in UploadZoneCard.svelte silently hides missing i18n keys from developers. Since `tx()` returns the key name when the function isn't found, the `||` fallback only activates when the key is genuinely missing — but then Czech users see English text with no warning.
- Solution: Never use `|| 'fallback'` after `tx()`. The raw key name returned by `tx()` is the correct fallback — it makes missing translations visible during QA. If the keys exist in both JSON files, the fallback never fires anyway.
- Source: code-review, 2026-06-06T20:31:31+00:00

## Accessibility aria-labels and sr-only text must use i18n

- Problem: `aria-label="Dismiss"`, `aria-live` sr-only text with hardcoded English ("Risk score: X out of 100") bypass i18n. Easy to miss in review because they're not visually rendered.
- Solution: All `aria-label`, `aria-live`, and `.sr-only` text must use `tx()` calls. Add corresponding keys to both message files.
- Source: code-review, 2026-06-06T20:31:31+00:00

## report-detail page uses in-memory mock service — HTTP route mocks never fire

- Problem: `report-detail.spec.ts` (and hamburger-menu, navigation, responsive) mock `**/api/reports/*` with `page.route()`, but `/report/[id]/+page.svelte` calls `mockCleaningService.getReportDetail(id)` directly in-memory. HTTP intercepts never fire; `navigateToReportDetail()` was waiting for `'RPT-001'` but the service returns `reportId: 'MC-2025-001'` from `_generateMockReportDetail()`. The error state (`loadError`) is also unreachable since the in-memory service never throws.
- Solution: Updated `mockReportDetail` in `e2e/helpers/mock-api.ts` to match the service's fixed output (`reportId: 'MC-2025-001'`, `date: '4. 6. 2025 · 14:32'`, EXIF fields: Make/Model/DateTimeOriginal/ExposureTime). Removed untestable HTTP error tests; replaced route guard test (was asserting content on `/report` which now redirects to `/reports`) with redirect assertion. Other spec files (`hamburger-menu.spec.ts`, `navigation.spec.ts`, `responsive.spec.ts`) still hardcode `'RPT-001'` and need separate fixes.
- Source: ui-tests, 2026-06-07

## report_ready WebSocket event reportId is never stored — View Report broken

- Problem: `apiCleaningService.ts` handles `report_ready` with a no-op. The actual `reportId` from this WS message is discarded. `Step3Processing` stores `job?.jobId` into `cleaningResultsStore.reportId`. Step5 then navigates to `/report/{jobId}` which will 404 because the backend expects a report ID, not a job ID.
- Solution: Capture `reportId` from `report_ready` WS event, store it separately from `jobId` in `cleaningResultsStore`. Use `jobId` for downloads (`GET /api/jobs/{id}/download`) and `reportId` for report navigation (`GET /api/reports/{id}`). Handle timing: `report_ready` may arrive after `job_complete`.
- Source: code-review, 2026-06-10T16:12:16+00:00

## cleaningResultsStore conflates jobId and reportId in single field

- Problem: `cleaningResultsStore` has a field named `reportId` but `Step3Processing` stores `job?.jobId` into it via `setResults(results, job?.jobId)`. The naming is misleading and causes Step5 to use jobId for report navigation (wrong endpoint).
- Solution: Split into `jobId: string | null` and `reportId: string | null`. Update `setResults` signature. Step5 uses `jobId` for `downloadResults()` and `reportId` for "View Report" navigation.
- Source: code-review, 2026-06-10T16:12:16+00:00
