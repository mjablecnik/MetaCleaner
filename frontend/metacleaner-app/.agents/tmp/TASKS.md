# Data Refactoring Tasks — MetaCleaner App

## Phase 1 — i18n Infrastructure (Already Complete ✅)

- [x] 1. [HIGH] Paraglide i18n already installed and configured
- [x] 2. [HIGH] Translation files exist: `messages/en.json` (200+ keys), `messages/cs.json` (200+ keys)
- [x] 3. [HIGH] i18n provider set up in `src/lib/locale.svelte.ts` with localStorage persistence

## Phase 2 — Repository/Data Layer (Already Complete ✅)

- [x] 4. [HIGH] Create `userRepository` — provides current user name and email
- [x] 5. [HIGH] Create `languageRepository` — provides available language options
- [x] 6. [HIGH] Create `fileRepository` — provides mock uploaded file list
- [x] 7. [HIGH] Create `processingRepository` — provides processing state, error state, and results
- [x] 8. [HIGH] Create `reportRepository` — provides report list, summary stats, and detailed report data

## Phase 3 — Extract Static UI Strings to i18n (Mostly Complete)

- [x] 9. [MEDIUM] Extract hardcoded strings from `+page.svelte` (Step 1) to translation keys — ~55 strings
- [x] 10. [MEDIUM] Extract hardcoded strings from `step2/+page.svelte` to translation keys — ~65 strings
- [x] 11. [MEDIUM] Extract hardcoded strings from `step3/+page.svelte` to translation keys — ~50 strings
- [x] 12. [MEDIUM] Extract hardcoded strings from `step4/+page.svelte` to translation keys — ~60 strings
- [x] 13. [MEDIUM] Extract hardcoded strings from `step5/+page.svelte` to translation keys — ~55 strings
- [x] 14. [MEDIUM] Extract hardcoded strings from `reports/+page.svelte` to translation keys — ~40 strings
- [x] 15. [MEDIUM] Extract hardcoded strings from `report/+page.svelte` to translation keys — ~45 strings (labels done, 1 key remaining)
- [x] 16. [MEDIUM] Add `report.header.generatedDesc` translation key to `messages/en.json` and `messages/cs.json` — parameterized report description string

## Phase 4 — Replace API Data with Repository Calls (Remaining Work)

- [x] 17. [HIGH] Refactor `report/+page.svelte` to import and consume `getReportDetail()` from `reportRepository` — replace all hardcoded report data (stats, chart values, file metadata) with reactive data from repository
- [x] 18. [HIGH] Refactor `report/+page.svelte` to import and consume `getCurrentUser()` from `userRepository` — replace hardcoded user name/email in nav and meta section
- [x] 19. [MEDIUM] Refactor `report/+page.svelte` file detail section to render via `{#each reportDetail.files}` loop — 4 files with metadata currently hardcoded as repeated HTML blocks
- [x] 20. [MEDIUM] Refactor `report/+page.svelte` chart section to render from `reportDetail.chartData` — replace hardcoded GPS/EXIF/XMP counts and percentages
- [x] 21. [MEDIUM] Refactor `report/+page.svelte` header generated description to use `tx('report.header.generatedDesc', {...})` with data from repository
- [x] 22. [MEDIUM] Refactor `step2/+page.svelte` file list to render via `{#each uploadedFiles}` loop — 4 files currently hardcoded as repeated HTML blocks

## Phase 5 — Language Switching (Already Complete ✅)

- [x] 23. [MEDIUM] Language switcher component exists in nav bar on all pages (en/cs/de/sk toggle via dropdown)
- [x] 24. [MEDIUM] Language preference persisted in localStorage via `switchLocale()`

## Final Verification

- [x] 25. [LOW] Verify all strings in `report/+page.svelte` are translated or served by repository — no hardcoded user-facing text remains
- [x] 26. [LOW] Verify `step2/+page.svelte` file list renders dynamically from repository data
- [x] 27. [LOW] Verify language switching works on report page (locale state + tx function operational)
- [ ] 28. [LOW] Run full app to confirm no visual regressions after refactoring
