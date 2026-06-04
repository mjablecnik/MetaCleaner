# Data Refactoring Tasks — MetaCleaner App

## Phase 1 — Setup i18n Infrastructure

- [x] 1. [HIGH] Verify Paraglide configuration and ensure `messages/en.json` and `messages/cs.json` are properly linked — remove placeholder `hello_world` key
- [x] 2. [HIGH] Create full translation keys in `messages/en.json` with all English translations (~370 keys)
- [x] 3. [HIGH] Create full translation keys in `messages/cs.json` with all Czech translations (~370 keys, matching current hardcoded text)
- [x] 4. [HIGH] Set up Paraglide locale switching in the app — connect to `setLocale()`/`languageTag()` runtime, persist choice in localStorage, restore on mount
- [x] 5. [HIGH] Run `paraglide-js compile` to regenerate `src/lib/paraglide/messages.js` with new keys

## Phase 2 — Create Repository/Data Layer

- [x] 6. [HIGH] Create `src/lib/repositories/userRepository.ts` — returns current user (name, email)
- [x] 7. [HIGH] Create `src/lib/repositories/languageRepository.ts` — returns available language options (code, flag, label, name)
- [x] 8. [HIGH] Create `src/lib/repositories/fileRepository.ts` — returns mock uploaded files data (name, size, type, metadata field count, GPS status, device info)
- [x] 9. [HIGH] Create `src/lib/repositories/processingRepository.ts` — returns risk analysis, processing state, error state, and success results
- [x] 10. [HIGH] Create `src/lib/repositories/reportRepository.ts` — returns reports list, summary stats, and single report detail

## Phase 3 — Extract Static UI Strings to i18n

- [x] 11. [MEDIUM] Extract hardcoded strings from `src/routes/+page.svelte` (Step 1) to translation keys — ~55 strings (nav, upload zone, status card, options sheet, upgrade sheet)
- [ ] 12. [MEDIUM] Extract hardcoded strings from `src/routes/step2/+page.svelte` (Files Loaded) to translation keys — ~65 strings (nav, risk scanner, file list, action buttons)
- [ ] 13. [MEDIUM] Extract hardcoded strings from `src/routes/step3/+page.svelte` (Processing) to translation keys — ~50 strings (nav, status card, file progress, log)
- [ ] 14. [MEDIUM] Extract hardcoded strings from `src/routes/step4/+page.svelte` (Error) to translation keys — ~60 strings (nav, error banner, error detail, error types, log)
- [ ] 15. [MEDIUM] Extract hardcoded strings from `src/routes/step5/+page.svelte` (Success) to translation keys — ~55 strings (nav, stats, metadata overview, file results, actions)
- [ ] 16. [MEDIUM] Extract hardcoded strings from `src/routes/reports/+page.svelte` (Report List) to translation keys — ~40 strings (nav, stats, filters, table headers, toast)
- [ ] 17. [MEDIUM] Extract hardcoded strings from `src/routes/report/+page.svelte` (Report Detail) to translation keys — ~45 strings (nav, meta info, stats, chart labels)

## Phase 4 — Replace API Data with Repository Calls

- [ ] 18. [MEDIUM] Replace hardcoded user data in all pages with `userRepository` calls — user name and email in nav dropdowns
- [ ] 19. [MEDIUM] Replace hardcoded language options in `+page.svelte`, `step2`, `step3`, `step4`, `step5` with `languageRepository` calls
- [ ] 20. [MEDIUM] Replace hardcoded file list data in `step2/+page.svelte` with `fileRepository` calls — 4 mock files with metadata
- [ ] 21. [MEDIUM] Replace hardcoded file/processing data in `step3/+page.svelte` with `fileRepository` and `processingRepository` calls — file progress, log entries
- [ ] 22. [MEDIUM] Replace hardcoded error data in `step4/+page.svelte` with `processingRepository.getErrorState()` — error code, timestamps, log
- [ ] 23. [MEDIUM] Replace hardcoded result data in `step5/+page.svelte` with `processingRepository.getResults()` — stats, file results, metadata breakdown
- [ ] 24. [MEDIUM] Replace hardcoded reports array in `reports/+page.svelte` with `reportRepository.getReports()` — 12 report objects and summary stats
- [ ] 25. [MEDIUM] Replace hardcoded report detail data in `report/+page.svelte` with `reportRepository.getReportDetail()` — report metadata, file breakdown, chart data

## Phase 5 — Language Switching

- [ ] 26. [MEDIUM] Refactor language dropdown in Step 1 (`+page.svelte`) to use Paraglide's `setLocale()` — wire existing UI to actual locale switch, persist in localStorage
- [ ] 27. [MEDIUM] Refactor language dropdown in Step 2–5 pages to use shared Paraglide locale switching (same mechanism as Step 1)
- [ ] 28. [MEDIUM] Add language persistence — on app load, read from localStorage and apply via Paraglide runtime before rendering

## Final

- [ ] 29. [LOW] Verify all strings are translated — no hardcoded user-facing text remains in any `.svelte` component
- [ ] 30. [LOW] Verify language switching works end-to-end — switching between en/cs updates all visible text, choice persists across page navigations
- [ ] 31. [LOW] Verify all repository data renders correctly — no missing data, same visual appearance as before refactoring
- [ ] 32. [LOW] Run `svelte-check` and fix any type errors introduced during refactoring
