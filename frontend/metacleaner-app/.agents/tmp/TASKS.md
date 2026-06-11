# TASKS — Auth Pages i18n Extraction

## Phase 1 — Setup (i18n infrastructure already exists)

- [x] 1. [HIGH] Add all auth i18n keys to `messages/en.json` — ~130 new keys with `auth.*` prefix
- [x] 2. [HIGH] Add all auth i18n keys to `messages/cs.json` — ~130 new keys matching en.json structure

## Phase 2 — Create repository/data layer

- [x] 3. [HIGH] Create `src/lib/repositories/authRepository.ts` with `getAuthStats()` and `getAuthPlans()` mock data — provides marketing stats (50K+, 2M+, 100%) and plan options (Free/Pro) used on login/register pages

## Phase 3 — Extract static UI strings to i18n

- [x] 4. [MEDIUM] Extract hardcoded strings from `src/routes/(auth)/login/+page.svelte` to translation keys — 45 strings
- [x] 5. [MEDIUM] Extract hardcoded strings from `src/routes/(auth)/register/+page.svelte` to translation keys — 75 strings
- [x] 6. [MEDIUM] Extract hardcoded strings from `src/routes/(auth)/check-email/+page.svelte` to translation keys — 40 strings
- [x] 7. [MEDIUM] Extract hardcoded strings from `src/routes/(auth)/forgot-password/+page.svelte` to translation keys — 55 strings
- [x] 8. [MEDIUM] Extract hardcoded strings from `src/routes/(auth)/check-code/+page.svelte` to translation keys — 55 strings
- [ ] 9. [MEDIUM] Extract hardcoded strings from `src/routes/(auth)/new-password/+page.svelte` to translation keys — 50 strings

## Phase 4 — Replace API data with repository calls

- [ ] 10. [MEDIUM] Replace hardcoded stats (50K+, 2M+, 100%) in login page with `authRepository.getAuthStats()` calls
- [ ] 11. [MEDIUM] Replace hardcoded stats and plan data in register page with `authRepository.getAuthStats()` and `authRepository.getAuthPlans()` calls
- [ ] 12. [MEDIUM] Replace hardcoded stats in check-email page with `authRepository.getAuthStats()` calls

## Phase 5 — Language switching

- [ ] 13. [LOW] Language switching already works via existing locale store and localStorage persistence — verify auth pages respect the active locale by importing `tx()` and `locale` correctly

## Final

- [ ] 14. [LOW] Verify all auth page strings are translated, no hardcoded Czech text remains, locale switching works on auth pages
