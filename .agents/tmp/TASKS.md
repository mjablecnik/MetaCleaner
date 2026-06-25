# UI Refactoring Tasks — MetaCleaner App (Settings Page)

## Phase 0 — Theme Token Fixes

- [x] 1. [LOW] Add `--color-navy-deep: #080f1e` token to `layout.css` @theme and replace `bg-[#080f1e]` in `docs/components/QuickStartFlow.svelte` with `bg-navy-deep`
- [x] 2. [MEDIUM] Replace hardcoded hex colors in `settings/+page.svelte` strengthLevels array (`#ef4444`, `#f97316`, `#3b82f6`, `#22c55e`) with CSS variable references (`var(--color-brand-red)`, etc.)

## Phase 1 — Create Shared Elements

No new shared elements needed — existing elements (`AccordionCard`, `CopyButton`, `AuthTextInput`, `Button`, `Badge`) cover all patterns.

## Phase 2 — Promote/Create Shared Components

- [x] 3. [MEDIUM] Ensure `PasswordInput` from `(auth)/components/` is importable by the Settings page (verify no auth-specific coupling) — if coupled, extract to `shared/elements/`
- [x] 4. [MEDIUM] Ensure `PasswordStrengthMeter` from `(auth)/components/` is importable by the Settings page — if coupled, extract to `shared/elements/`

## Phase 3 — Create Settings Page-Specific Components and Sections

- [x] 5. [HIGH] Create `SettingsAccordionCard` component in `settings/components/` — mobile-collapsible / desktop-always-open accordion card with icon, title, subtitle, chevron; replaces inline `.acc-content` pattern
- [x] 6. [HIGH] Create `SettingsAccordionCard.stories.svelte` — states: Open, Closed, DesktopAlwaysOpen
- [x] 7. [HIGH] Create `SettingsHeaderSection` in `settings/sections/` — page title, subtitle, icon badge, last-login info
- [x] 8. [HIGH] Create `SettingsHeaderSection.stories.svelte`
- [x] 9. [HIGH] Create `AccountInfoSection` in `settings/sections/` — avatar with edit button, badges, name/email/company form fields, save button; props: profile data
- [x] 10. [HIGH] Create `AccountInfoSection.stories.svelte`
- [x] 11. [HIGH] Create `ChangePasswordSection` in `settings/sections/` — current/new/confirm password fields using shared `PasswordInput`, `PasswordStrengthMeter`, save button; props: callbacks
- [ ] 12. [HIGH] Create `ChangePasswordSection.stories.svelte`
- [ ] 13. [HIGH] Create `ApiKeysSection` in `settings/sections/` — production key card (pulsing dot, active badge) + test key card (dashed border, sandbox badge), each with eye toggle + copy using shared `CopyButton`; props: apiKeys data, copy callback
- [ ] 14. [HIGH] Create `ApiKeysSection.stories.svelte`
- [ ] 15. [HIGH] Create `AffiliateProgramSection` in `settings/sections/` — 3-stat grid, readonly affiliate link with copy, commission info box; props: affiliateStats, copy callback
- [ ] 16. [HIGH] Create `AffiliateProgramSection.stories.svelte`

## Phase 4 — Refactor Pages

- [ ] 17. [HIGH] Refactor `settings/+page.svelte` to compose `SettingsHeaderSection` + 4 section components wrapped in `SettingsAccordionCard`, use shared `Toast` instead of inline toast, remove `<style>` block (move accordion responsive logic into `SettingsAccordionCard`)
- [ ] 18. [LOW] (Optional) Split `docs/components/EndpointCard.svelte` (424 lines) into sub-components: `EndpointParams`, `EndpointResponse`, `EndpointCodeExample` — lower priority, docs-only component

## Final

- [ ] 19. [MEDIUM] Verify all pages render correctly — no visual regressions, build passes (`bun run build`), Storybook builds (`bun run build-storybook`), no duplicated code in Settings page
