# Memory

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
- Solution: Use `$effect(() => { if (!scannerStore.hasFiles) goto(resolve('/' as Pathname), { replaceState: true }); });` at the top of each step's `<script>` block. Using `$effect` (not bare script) ensures it runs only in the browser, avoids SSR issues, and reacts to reactive changes.
- Source: code-review-fix, 2026-06-05

## step4/step5 UploadedFile → QueuedFile migration pattern

- Problem: `step4/+page.svelte` and `step5/+page.svelte` used `getUploadedFiles()` (mock fileRepository) returning `UploadedFile` (size: string, extension: 'JPG'). All child components (`ErrorFilesCard`, `ErrorLogAccordion`, `ErrorStateCard`, `FileResultsCard`, `FileResultItem`) used `UploadedFile`.
- Solution: Replace `UploadedFile` with `QueuedFile` throughout. Key field mapping: `file.size` (number) → `formatSize(file.size)`, `file.extension` ('.jpg') → `file.extension.replace('.', '').toUpperCase()`, `file.hasGps` → `file.scanResult?.hasGps ?? false`, `file.metadataFieldCount` → `file.scanResult?.fieldCount ?? 0`, `file.device` → `file.scanResult?.device`. For step5's `FileResultsCard`, switch from ID-based result lookup to index-based pairing since mock result IDs don't match real file IDs.
- Source: code-review-fix, 2026-06-05
