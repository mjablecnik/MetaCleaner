# AI Log

## 2026-06-10 14:03 — manual
- Improved metadata handling in `imageParser.ts` and `videoParser.ts` with privacy categorization and raw metadata output
- Added new fields to scanner types (`src/lib/scanner/types.ts`) for privacy categories

## 2026-06-07 13:38 — manual
- Created AI image detection module (`src/lib/scanner/aiDetector.ts`) with heuristic scoring for AI-generated image identification
- Integrated AI detection into image parsing logic in `imageParser.ts`
- Added AI origin scoring to risk analyzer (`riskAnalyzer.ts`) and scanner constants
- Updated `metadataParser.ts`, `videoParser.ts`, and `scannerStore.svelte.ts` to support AI origin score field
- Enhanced AI detection capabilities with additional metadata checks and expanded constants

## 2026-06-07 07:50 — ui-tests
- No changes needed — all tests up to date

## 2026-06-07 03:43 — ui-tests
- No changes needed — all tests up to date

## 2026-06-07 01:30 — ui-tests
- Created Storybook story for `MobileBottomCta` component (states: WithButtonContent, WithTextContent) in `src/lib/shared/components/MobileBottomCta.stories.svelte`
- Removed orphaned E2E test in `navigation.spec.ts:190` — `/report` redirect assertion no longer valid
- Fixed `report-detail.spec.ts` (30 failures) — aligned `navigateToReportDetail()` helper with in-memory mock service data
- Fixed `hamburger-menu.spec.ts` report detail tests (6 failures) — same root cause as report-detail
- Fixed `navigation.spec.ts` report detail tests (2 failures) — updated assertions to match mock service reportId
- Fixed `responsive.spec.ts` report detail tests (4 failures) — aligned with in-memory mock service
- Fixed `step5-results.spec.ts:160` (1 failure) — resolved strict mode violation for mobile upload button selector

## 2026-06-06 20:47 — create-code
- Spec: design-alignment
- Implemented SPA state machine (`src/lib/stores/appState.svelte.ts`) with `idle`, `files-ready`, `processing`, `error`, `success` states and reactive transitions
- Implemented mock cleaning service layer (`src/lib/services/mockCleaningService.ts`) with simulated delays, progress updates, error scenarios, and mock report generation
- Added CSS animations to `layout.css`: `fadeInUp`, `spin-slow`, `pulse-ring`, `checkPop`, `shake`, `border-dance`
- Updated `NavBar` — removed `mobileStyle` prop, added `showBackButton`/`backHref`/`backLabel` props, hamburger menu always on mobile
- Created `MobileBottomCta` shared component (`src/lib/shared/components/MobileBottomCta.svelte`)
- Updated `UploadZoneCard` — dual state (full drop zone / compact "add more"), file type/size validation (max 500 MB), drag-over highlight
- Updated `FileListCard` — per-file remove button, 5 file row states (completed/in-progress/waiting/failed/skipped)
- Created Step 1 idle section (`src/routes/sections/Step1Idle/`) with `StatusCardIdle`
- Created Step 2 files-ready section (`src/routes/sections/Step2FilesReady/`) with `RiskScannerCard`, `MobileRiskBanner`
- Created Step 3 processing section (`src/routes/sections/Step3Processing/`) with `ProcessingFilesCard`, `ProcessingStatusCard`, mobile components
- Created Step 4 error section (`src/routes/sections/Step4Error/`) with `ErrorBanner`, `ErrorFilesCard`, `ErrorStateCard`, mobile accordions
- Created Step 5 success section (`src/routes/sections/Step5Success/`) with `SuccessHeader`, `MetadataOverview`, `FileResultsCard`
- Rewrote `src/routes/+page.svelte` as SPA state dispatcher (no route navigation for state transitions)
- Updated `/reports` page — desktop table layout, mobile card layout, filter/search bar, stat cards
- Updated `/report` page — chart section, per-file accordion with GPS/EXIF/XMP tables, PDF download/print buttons
- Wired `scannerStore` to file upload flow in `UploadZoneCard`
- Deleted old step routes (`step2/`, `step3/`, `step4/`, `step5/`) and removed dead code
- Added all new i18n keys to `messages/en.json` and `messages/cs.json`
- Created component tests (Vitest): NavBar, UploadZoneCard, FileListCard, Step3Processing, Step4Error, Step5Success, appState store transitions (`src/lib/stores/__tests__/appState.test.ts`)
- Created E2E tests (Playwright): step1→step2 transition, file validation, file removal, full flow step2→3→5, cancel (Zastavit), error flow, report navigation, reports page, mobile hamburger menu, updated existing E2E tests (272 passing)
- Fixed CRITICAL code review: removed dead `src/lib/api/client.ts` (247 lines), replaced hardcoded English strings in Step4Error log with `tx()` calls
- Fixed HIGH code review: wired `step2.meta.title` i18n key to page title, replaced hardcoded error fallbacks with `tx('common.error')`
- Fixed MEDIUM code review: removed duplicate file size validation from `scannerStore` (UploadZoneCard is single source of truth), removed unused `BottomSheet` and `FileListItem` components, added `.dockerignore`, added empty file list guard in `Step3Processing` onMount, added onMount cleanup return in `Step3Processing`, translated `step2.risk.score` to Czech
- Fixed LOW code review: replaced `?? 'Risk Score'` fallback in `RiskScoreRing` with `tx()` pattern, added download error toast in `Step5Success`, documented error-* filename convention in README, added code comment on `BeforeAfterScore afterScore={0}` in `RiskScannerCard`
- Updated `mockCleaningService.ts` with improved mock data generation
- Updated `MEMORY.md` with code review patterns and conventions

## 2026-06-06 09:02 — ui-tests

- No changes needed — all tests up to date

## 2026-06-06 07:16 — ui-tests

- Removed orphaned Storybook demo stories: `src/stories/Button.stories.svelte`, `src/stories/Header.stories.svelte`, `src/stories/Page.stories.svelte`
- Removed orphaned Storybook demo components and assets from `src/stories/`
- Created Storybook story for `MobileHamburgerMenu` component (states: Closed, Open, WithBackButton, OpenWithBackButton, NoUser)
- Created Storybook story for `FileListItemRisk` component (states: LowRisk, MediumRisk, HighRisk, +3 more)
- Created Storybook story for `ScanProgressIndicator` component (states: Idle, Scanning, Complete, Error)
- Set up Playwright E2E framework with `playwright.config.ts` and `e2e/` directory
- Created `e2e/helpers/mock-api.ts` with route handler utilities for mocking API endpoints
- Created E2E test `e2e/step1-upload.spec.ts` for Step 1 upload page
- Created E2E test `e2e/step2-risk-analysis.spec.ts` for Step 2 risk analysis page
- Created E2E test `e2e/step3-processing.spec.ts` for Step 3 processing page
- Created E2E test `e2e/step4-error.spec.ts` for Step 4 error page
- Created E2E test `e2e/step5-results.spec.ts` for Step 5 results page
- Created E2E test `e2e/reports.spec.ts` for Reports page
- Created E2E test `e2e/report-detail.spec.ts` for Report Detail page
- Created E2E test `e2e/navigation.spec.ts` for cross-page navigation flows
- Created E2E test `e2e/responsive.spec.ts` for responsive layout verification
- All 212 Storybook stories pass; 189 E2E tests created but cannot run in current environment (missing Chromium system libs)

## 2026-06-05 23:30 — manual

- Updated `.agents/MEMORY.md` with code review findings on WebSocket and state handling issues
- Documented `$state<Date>` lint error workaround (use `$state<number>` with `Date.now()` instead)
- Documented `cleaningStore` file_error handler mapping to wrong statuses
- Documented step5 `FileResultsCard` receiving empty `fileResults` from cleaningStore
- Documented WebSocket disconnect being immediately treated as fatal error instead of attempting reconnect/polling
- Documented `PUBLIC_API_URL` baking as empty in Docker production builds
- Documented missing i18n keys for step3 upload phase and report detail page
- Documented WebSocket polling fallback 30s timeout being too aggressive for large file batches

## 2026-06-05 18:07 — create-code

- Spec: metacleaner-backend
- Implemented Go backend service in `backend/metacleaner-server/`
- Implemented configuration loading (`config.go`) with env var parsing and defaults
- Implemented error types and JSON response helpers (`errors.go`)
- Implemented data models, DTOs, file validation, tool selection (`models.go`)
- Implemented Supabase client with PostgREST CRUD and Storage upload (`supabase.go`)
- Implemented file upload handler with multipart parsing and temp storage (`handlers.go`)
- Implemented metadata cleaning pipeline using ExifTool/FFmpeg subprocesses (`pipeline.go`)
- Implemented WebSocket progress handler for real-time job updates (`websocket.go`)
- Implemented job creation and orchestration endpoint (`handlers.go`)
- Implemented file download handler with expiration checks (`handlers.go`)
- Implemented report generation and PDF creation (`pdf.go`, `handlers.go`)
- Implemented cleanup scheduler for expired temp files (`cleanup.go`)
- Implemented health endpoint and startup validation (`main.go`)
- Implemented CORS middleware, rate limiter, and HTTP router (`router.go`)
- Implemented SQL database migration script (`scripts/migration.sql`)
- Implemented Dockerfile, `fly.toml`, `start-docker.sh`, `fly-setup.sh` for deployment
- Created `README.md` and `DOCS.md` documentation
- Created property tests for error response format (`tests/errors_test.go`)
- Created property tests for file size/format validation, tool selection, job progress, report summary (`tests/models_test.go`)
- Created pipeline unit tests (`pipeline_test.go`, `tests/pipeline_test.go`)
- Created upload handler tests (`handlers_test.go`)
- Created job handler tests (`handlers_jobs_test.go`)
- Created download handler tests (`handlers_download_test.go`)
- Created report handler tests (`handlers_reports_test.go`)
- Created cleanup scheduler tests (`cleanup_test.go`)
- Code review identified: PUBLIC_API_URL baked empty at Docker build time, no file download expiration UX, step2 page not implemented, missing i18n keys, aggressive WebSocket polling timeout

## 2026-06-05 15:09 — from-brief

- Brief: BRIEF.md
- Added package manager detection logic to `sync-android.sh` (checks `command -v bun`, sets `RUN_CMD`/`EXEC_CMD` variables to bun/bunx or npm/npx)
- Replaced hardcoded `bun run build` with `$RUN_CMD run build` and `bunx cap sync android` with `$EXEC_CMD cap sync android` in `sync-android.sh`

## 2026-06-05 14:28 — check-build

- Fixed formatting in 17 files (scanner module, Svelte components, agents docs) via prettier
- Fixed test script to run only server-side tests by default (browser tests require system libs unavailable without sudo)
- Added `test:browser` script for Playwright browser/Storybook tests
- Updated README: added Prerequisites section with bun install instructions, removed reference to non-existent `.env.example`, documented browser test setup requirement

## 2026-06-05 13:14 — create-code

- Spec: client-side-risk-scanner
- Implemented scanner module types and constants (`src/lib/scanner/types.ts`, `src/lib/scanner/constants.ts`)
- Implemented risk analyzer with `computeFileScore()`, `computeAggregatedRisk()`, `classifySeverity()` in `src/lib/scanner/riskAnalyzer.ts`
- Implemented format detector (`src/lib/scanner/parsers/formatDetector.ts`) supporting 8 image + 11 video formats
- Implemented image parser (`src/lib/scanner/parsers/imageParser.ts`) using exifr (JPEG/HEIC/PNG/AVIF/TIFF/DNG) and ExifReader (WebP/GIF)
- Implemented video parser (`src/lib/scanner/parsers/videoParser.ts`) with lazy mediainfo.js WASM loading
- Implemented metadata parser orchestrator (`src/lib/scanner/metadataParser.ts`) with error handling and large file optimization
- Implemented reactive scanner store (`src/lib/scanner/scannerStore.svelte.ts`) with Svelte 5 runes, sequential file processing, and aggregated risk computation
- Created unified upload + risk scanner page at `/` route (`src/routes/+page.svelte`) — merged step1 and step2 into single page
- Created `RiskScannerCard.svelte`, `FileListCard.svelte`, `MobileRiskBanner.svelte` sections in `src/routes/(step1)/sections/`
- Relocated `RiskScoreRing.svelte`, `RiskBreakdownBar.svelte`, `BeforeAfterScore.svelte`, `FileListItemRisk.svelte` to `src/routes/(step1)/components/`
- Created `ScanProgressIndicator.svelte` component for per-file scanning state display
- Updated `UploadZoneCard.svelte` to integrate with scannerStore (`addFiles`, `removeFile`)
- Connected step3 to scannerStore for file queue handoff
- Created property-based tests (fast-check) for risk analyzer: `src/lib/scanner/__tests__/riskAnalyzer.test.ts` (Properties 1–5)
- Created parser tests: `src/lib/scanner/__tests__/metadataParser.test.ts` (Properties 6–8)
- Created scanner store unit tests: `src/lib/scanner/__tests__/scannerStore.test.ts`
- Created integration tests: `src/lib/scanner/__tests__/scanPipeline.test.ts`
- Fixed CRITICAL code review findings: route guard, error handling improvements
- Fixed HIGH code review findings: step3 scannerStore connection, mobile remove button
- Fixed MEDIUM code review findings: lint errors, unused params/imports, QueuedFile migration patterns
- Updated `MEMORY.md` with route guard and QueuedFile migration patterns
- All 40 server tests pass, clean build and lint

## 2026-06-05 11:13 — manual

- Added Android back button handling with Capacitor `@capacitor/app` plugin in `src/routes/+layout.svelte`
- Created `sync-android.sh` script for Android project deployment and set executable permissions
- Updated `README.md` with project description and setup instructions
- Added `@capacitor/app` dependency to `package.json`

## 2026-06-05 10:56 — manual

- Updated language flag representation in `languageRepository.ts` from emoji to SVG image paths
- Added flag SVG files (`cs.svg`, `de.svg`, `en.svg`, `sk.svg`) to `static/flags/`
- Updated `LanguageDropdown.svelte`, `MobileHamburgerMenu.svelte`, and `NavBar.svelte` to render SVG flags

## 2026-06-05 10:18 — manual

- Added architectural and convention guidelines in `.kiro/steering/metacleaner-frontend.md`
- Added `CLAUDE.md` with project context for AI assistants
- Added `prettier-plugin-tailwindcss` dependency to `package.json`

## 2026-06-05 07:31 — check-build

- Resolved all build and lint errors for clean first-checkout experience
- Ran prettier on 143 files to fix formatting
- Fixed 112 ESLint errors: replaced bare `locale.current;` with `void locale.current;` in ~50 files, added keys to all `{#each}` blocks, wrapped hrefs with `resolve()` from `$app/paths`, used `Pathname` type for dynamic hrefs
- Added `storybook.configs['flat/recommended']` to ESLint config
- Removed unused snippets, variables, and imports across multiple components and stories
- Added `tabindex="0"` to `ToggleSwitch` for accessibility compliance
- Updated `README.md` with bun-based setup and Playwright install steps
- Created `.agents/MEMORY.md` documenting non-obvious build issues for future agents

## 2026-06-05 06:47 — ui-refactor

- Added theme tokens `--shadow-drop-red`, `--color-navy-lighter-50`, `--color-navy-lighter-60` to `src/routes/layout.css` @theme block
- Replaced inline `rgba(239,68,68,0.6)` in step2 SVG with `--shadow-drop-red` token
- Replaced inline `rgba(30,41,59,0.5/0.6)` in reports `<style>` block with `--color-navy-lighter-50`/`--color-navy-lighter-60` tokens
- Refactored `src/routes/+layout.svelte` to include NavBar with shared state (user, langOptions, locale switching)
- Removed duplicated NavBar markup and shared state from all 7 pages: `+page.svelte` (Step 1), `step2/+page.svelte`, `step3/+page.svelte`, `step4/+page.svelte`, `step5/+page.svelte`, `reports/+page.svelte`, `report/+page.svelte`
- Refactored `src/routes/+page.svelte` (Step 1) to compose UploadZoneCard, StatusCard, OptionsSheet, UpgradeSheet from `(step1)/sections/`
- Refactored `src/routes/step2/+page.svelte` to compose RiskScannerCard, MobileRiskBanner, FileListCard from `step2/sections/`
- Refactored `src/routes/step3/+page.svelte` to compose ProcessingStatusCard, MobileStatusCard, ProcessingFilesCard, ActivityLogAccordion from `step3/sections/`
- Refactored `src/routes/step4/+page.svelte` to compose ErrorBanner, ErrorFilesCard, ErrorStateCard, MobileErrorVisual, ErrorDetailAccordion, ErrorTypeAccordion, ErrorLogAccordion from `step4/sections/`
- Refactored `src/routes/step5/+page.svelte` to compose SuccessHeader, MetadataOverview, FileResultsCard from `step5/sections/`
- Refactored `src/routes/reports/+page.svelte` to compose SummaryStatsRow, ReportsHeader, FiltersBar, MobileFilters, ReportsTable, ReportsList from sections
- Refactored `src/routes/report/+page.svelte` to compose ReportDetailHeader, ReportChartCard, FileAccordionList from `report/sections/`
- Created stories: `FileListItemRisk.stories.svelte`, `RiskBreakdownBar.stories.svelte`, `BeforeAfterScore.stories.svelte` in `src/routes/step2/components/`
- Created stories: `ErrorDetailBox.stories.svelte`, `ErrorTypeSelector.stories.svelte` in `src/routes/step4/components/`
- Created stories: `MetadataPanel.stories.svelte` in `src/routes/step5/components/`
- Created stories: `FilterPill.stories.svelte`, `ReportTableRow.stories.svelte`, `ReportCard.stories.svelte` in `src/routes/reports/components/`
- Created stories: `ChartBar.stories.svelte`, `MetadataTable.stories.svelte`, `FileAccordionItem.stories.svelte` in `src/routes/report/components/`
- Verified build passes with zero errors (`npm run build`)
- Verified Storybook builds with zero errors (`npm run build-storybook`)

## 2026-06-05 00:50 — ui-refactor

- Extended `@theme` block in `src/routes/layout.css` with missing tokens (gray-700, border-radius vars, glow shadows)
- Replaced all inline `style="color:#ef4444"`, `style="background:rgba(...)"`, and `style="border:..."` with Tailwind theme utility classes
- Replaced hardcoded hex colors in `<style>` blocks and SVG attributes with CSS custom properties from theme
- Created shared elements in `src/lib/shared/elements/`: Button, Badge, Card, IconContainer, ProgressBar, ToggleSwitch, Chip, AccordionCard
- Created shared components in `src/lib/shared/components/`: NavBar, LanguageDropdown, UserDropdown, MobileHamburgerMenu, BottomSheet, PageHeader, FileListItem, StatCard, ActivityLog, Toast
- Created shared section in `src/lib/shared/sections/`: SummaryStatsRow
- Created Step 1 page-specific components in `src/routes/(step1)/`: DropZone, UploadZoneCard, StatusCard, OptionsSheet, UpgradeSheet
- Created Step 2 page-specific components in `src/routes/step2/`: RiskScoreRing, RiskBreakdownBar, BeforeAfterScore, RiskScannerCard, MobileRiskBanner, FileListCard
- Created Step 3 page-specific components in `src/routes/step3/`: ProcessingVisual, FileItemProcessing, ProcessingFilesCard, ProcessingStatusCard, MobileStatusCard, ActivityLogAccordion
- Created Step 4 page-specific components in `src/routes/step4/`: ErrorVisual, ErrorDetailBox, ErrorTypeSelector, ErrorBanner, ErrorFilesCard, ErrorStateCard, MobileErrorVisual, ErrorDetailAccordion, ErrorTypeAccordion, ErrorLogAccordion
- Created Step 5 page-specific components in `src/routes/step5/`: MetadataPanel, SuccessHeader, MetadataOverview, FileResultItem, FileResultsCard
- Created Reports page-specific components in `src/routes/reports/`: FilterPill, ReportTableRow, ReportCard, ReportsHeader, FiltersBar, MobileFilters, ReportsTable, ReportsList
- Created Report Detail page-specific components in `src/routes/report/`: ChartBar, MetadataTable, FileAccordionItem, ReportDetailHeader, ReportChartCard, FileAccordionList
- Created stories for all shared elements: Button, Badge, Card, IconContainer, ProgressBar, ToggleSwitch, Chip, AccordionCard
- Created stories for shared components: NavBar, LanguageDropdown, UserDropdown, BottomSheet, PageHeader, FileListItem, StatCard, ActivityLog, Toast
- Created stories for page-specific components: DropZone, RiskScoreRing, ProcessingVisual, ErrorVisual, FileItemProcessing, FileResultItem

## 2026-06-04 16:26 — data-refactor

- Extracted ~200 i18n keys per locale from 7 pages (step1–step5, reports, report) into `messages/en.json` and `messages/cs.json` using Paraglide
- Created translation files: `messages/en.json` (200+ keys), `messages/cs.json` (200+ keys)
- Created repositories: `userRepository.ts`, `languageRepository.ts`, `fileRepository.ts`, `processingRepository.ts`, `reportRepository.ts` in `src/lib/repositories/`
- Refactored `src/routes/+page.svelte` (Step 1) — connected to userRepo, langRepo, replaced ~55 hardcoded strings
- Refactored `src/routes/step2/+page.svelte` — connected to fileRepo, replaced ~65 strings, converted file list to `{#each}` loop from fileRepository
- Refactored `src/routes/step3/+page.svelte` — connected to processingRepo, fileRepo, replaced ~50 strings
- Refactored `src/routes/step4/+page.svelte` — connected to processingRepo, fileRepo, replaced ~60 strings
- Refactored `src/routes/step5/+page.svelte` — connected to processingRepo, fileRepo, replaced ~55 strings
- Refactored `src/routes/reports/+page.svelte` — connected to reportRepo, replaced ~40 strings
- Refactored `src/routes/report/+page.svelte` — connected to reportRepository.getReportDetail() and userRepository.getCurrentUser(), replaced ~45 strings, rendered charts and file metadata via `{#each}` loops
- Added parameterized key `report.header.generatedDesc` to both locale files
- Configured locale switching with localStorage persistence via `src/lib/locale.svelte.ts`
- Added language switcher to report page nav bar

## 2026-06-04 12:26 — design-to-code

- Created Step 1 — Upload (Idle State) page from `MetacleanerApp-step1-desktop.html` / `MetacleanerApp-step1-mobile.html`
- Created Step 2 — Files Loaded (Risk Scanner) page from `MetacleanerApp-step2-desktop.html` / `MetacleanerApp-step2-mobile.html`
- Created Step 3 — Processing page from `MetacleanerApp-step3-desktop.html` / `MetacleanerApp-step3-mobile.html`
- Created Step 4 — Error State page from `MetacleanerApp-step4-desktop.html` / `MetacleanerApp-step4-mobile.html`
- Created Step 5 — Success/Results page from `MetacleanerApp-step5-desktop.html` / `MetacleanerApp-step5-mobile.html`
- Created Report List (History) page from `MetacleanerApp-reportlist-desktop.html` / `MetacleanerApp-reportlist-mobile.html`
- Created Report Detail page from `MetacleanerApp-report-desktop.html` / `MetacleanerApp-report-mobile.html`
- Wired navigation between all pages: Step 1→2→3→5 (success flow), Step 3→4 (error flow), Step 5→Report Detail/List, Report List→Report Detail, Report List→Step 1, Report Detail→Step 5
