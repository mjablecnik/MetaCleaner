# AI Log

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
