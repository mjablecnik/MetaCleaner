# TASKS — Data Refactor (Incremental)

## Phase 1 — Setup i18n infrastructure

Already complete. Paraglide JS is configured, translation files exist, `tx()` helper is shared, language switcher is implemented with localStorage persistence.

- [x] 1. [HIGH] Install and configure i18n library for the project
- [x] 2. [HIGH] Create translation file structure (messages/en.json, messages/cs.json)
- [x] 3. [HIGH] Set up i18n provider/initialization in the app entry point

## Phase 2 — Create repository/data layer

Already complete. Repositories exist in `src/lib/repositories/` (authRepository, languageRepository, userRepository).

- [x] 4. [HIGH] Create authRepository with mocked stats and plans data
- [x] 5. [HIGH] Create languageRepository with available languages
- [x] 6. [HIGH] Create userRepository with current user data

## Phase 3 — Extract static UI strings to i18n

- [x] 7. [MEDIUM] Extract hardcoded strings from `src/routes/+error.svelte` to translation keys — 3 strings (`error.page.title`, `error.page.defaultMessage`, `error.page.goHome`)

## Phase 4 — Replace API data with repository calls

- [x] 8. [MEDIUM] Replace hardcoded stats (50K+, 2M+, 100%) in `src/routes/(auth)/email-verified/+page.svelte` with `getAuthStats()` from authRepository — 6 occurrences (desktop + mobile)
- [x] 9. [MEDIUM] Replace hardcoded `demoEmail` in `src/routes/(auth)/email-verified/+page.svelte` with authenticated user email from auth store or a page prop

## Phase 5 — Language switching

Already complete. `LanguageDropdown` component exists in NavBar, `switchLocale()` persists to localStorage.

- [x] 10. [MEDIUM] Add language switcher component (en/cs toggle)

## Final

- [ ] 11. [LOW] Verify all strings are translated, no hardcoded text remains, language switching works
