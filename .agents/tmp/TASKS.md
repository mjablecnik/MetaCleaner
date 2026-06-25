# TASKS — MetaCleaner App Data Refactor (Settings Page)

## Phase 1 — Setup i18n infrastructure

> Already complete. Paraglide JS is configured, `tx()` helper exists, `messages/en.json` and `messages/cs.json` are in place. No tasks needed.

## Phase 2 — Create repository/data layer

- [x] 1. [HIGH] Create `src/lib/repositories/settingsRepository.ts` with `getSettingsProfile()`, `getAffiliateStats()`, `getApiKeys()` — provides mock user profile, affiliate stats, and API key data

## Phase 3 — Extract static UI strings to i18n

- [x] 2. [HIGH] Add `settings.*` keys to `messages/en.json` — ~45 new keys covering account, password, affiliate, and API keys sections
- [x] 3. [HIGH] Add `settings.*` keys to `messages/cs.json` — matching Czech translations for all 45 keys

## Phase 4 — Replace hardcoded text and data in settings page

- [x] 4. [MEDIUM] Extract hardcoded strings from `src/routes/settings/+page.svelte` to `tx()` calls — ~45 UI strings (section titles, labels, buttons, toasts, badges, password strength labels)
- [x] 5. [MEDIUM] Replace hardcoded data in `src/routes/settings/+page.svelte` with `settingsRepository` calls — user profile (name, email, avatar, plan, lastLogin), affiliate stats (referrals, conversions, earnings, link), API keys (production key, test key, dates)

## Phase 5 — Language switching

> Already complete. `LanguageDropdown` in NavBar handles locale switching with localStorage persistence. No tasks needed.

## Final

- [ ] 6. [LOW] Verify all strings are translated, no hardcoded text remains in settings page, and language switching works correctly
