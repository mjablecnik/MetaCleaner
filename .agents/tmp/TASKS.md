# TASKS — MetaCleaner Web i18n + repository refactor

Derived from `DATA_SPEC.md`. Do tasks in order; dependencies are created first.

## Phase 1 — Setup i18n infrastructure
- [x] 1. [HIGH] Confirm Paraglide is installed/wired (it is) and set the runtime locale strategy to `["localStorage", "cookie", "preferredLanguage", "baseLocale"]` (via the inlang/paraglide Vite plugin config), keeping `baseLocale: "en"`, `locales: ["en","cs"]`.
- [x] 2. [HIGH] Replace the scaffold `hello_world` in `messages/en.json` and `messages/cs.json` with the full key set from DATA_SPEC §6; seed the shared `nav_*`, `cta_*`, `footer_*`, `meta_*` keys in both languages.
- [x] 3. [HIGH] Add a `t(key)` resolver helper (e.g. `src/lib/i18n.ts`) that maps a repository key string to `m[key]()`, mirroring the app's `tx()` pattern, and verify `import * as m from '$lib/paraglide/messages'` compiles.

## Phase 2 — Create repository/data layer
- [x] 4. [HIGH] Create `src/lib/repositories/features.ts` — `featuresRepository` returning the 6 features (id, number, icon, color, layout, literal title, `descKey`, bullet/format keys, image `{src, altKey}`).
- [x] 5. [HIGH] Create `src/lib/repositories/pricing.ts` — `pricingRepository` returning the 4 plans (name key/literal, monthly/yearly prices, original price, save key, subtitle key, feature keys, CTA key, flags) + `getEnterprise()` + billing price helpers.
- [x] 6. [HIGH] Create `src/lib/repositories/audience.ts` — `audienceRepository` with `getAudience('full'|'compact')` (6 desktop / 4 mobile cards: icon, color, `titleKey`, `descKey`, bullet keys).
- [x] 7. [HIGH] Create `src/lib/repositories/faq.ts` — `faqRepository` with `getFaq('desktop'|'mobile')` returning `{ id, questionKey, answerKey }` for each layout's question set.
- [x] 8. [HIGH] Create `src/lib/repositories/steps.ts` — `stepsRepository` returning the 3 "how it works" steps (`number, icon, titleKey, descKey`, + mobile desc key).
- [x] 9. [HIGH] Create `src/lib/repositories/stats.ts` — `statsRepository` returning the 3 risk stats (`value, icon, color, labelKey`, + mobile short label key).
- [x] 10. [HIGH] Create `src/lib/repositories/metadataDemo.ts` — `metadataDemoRepository` returning the before/after EXIF sample fields (`icon, labelKey, value`) for desktop + mobile variants.
- [x] 11. [HIGH] Create `src/lib/repositories/index.ts` re-exporting all repositories and their interfaces.

## Phase 3 — Extract static UI strings to i18n
- [x] 12. [MEDIUM] Extract shared chrome strings (navbar, mobile drawer, footer, CTAs) on `src/routes/+page.svelte` to `nav_*`/`cta_*`/`footer_*` keys; delete the inline `langConfig`/`t` object. — ~20 strings
- [x] 13. [MEDIUM] Extract Home hero + upload card + Why-It-Matters headings/labels to `home_hero_*` / `home_upload_*` / `home_why_*` keys (desktop + mobile). — ~25 strings
- [x] 14. [MEDIUM] Extract Home How-It-Works, Who-It's-For, and FAQ section headings (eyebrow/title/subtitle) to `home_steps_*` / `home_audience_*` / `home_faq_*` keys. — ~9 strings
- [x] 15. [MEDIUM] Set `meta_home_title` and extract the Home `<title>`; verify no hardcoded copy remains in `+page.svelte` except brand/format literals. — 1 string + sweep
- [ ] 16. [MEDIUM] Extract `src/routes/features/+page.svelte` header, mobile CTA, and footer copy to `features_*` / `footer_*` keys; delete inline `t` object; set `meta_features_title`. — ~12 strings
- [ ] 17. [MEDIUM] Extract `src/routes/pricing/+page.svelte` header, billing toggle, enterprise banner, and footer copy to `pricing_*` / `footer_*` keys; set `meta_pricing_title`. — ~10 strings
- [ ] 18. [MEDIUM] Backfill `messages/cs.json` for every key added in Phase 3 and verify en/cs key parity (no missing keys in either file).

## Phase 4 — Replace API data with repository calls
- [ ] 19. [MEDIUM] Replace the 6 hardcoded feature sections (desktop + mobile) in `features/+page.svelte` with an `#each featuresRepository(...)` render using `t(key)`.
- [ ] 20. [MEDIUM] Replace the 4 hardcoded plan cards (desktop + mobile) and the `t` plan map in `pricing/+page.svelte` with `pricingRepository` + billing helpers.
- [ ] 21. [MEDIUM] Replace the hardcoded "Who It's For" cards (desktop + mobile) in `+page.svelte` with `audienceRepository`.
- [ ] 22. [MEDIUM] Replace the hardcoded FAQ items (desktop + mobile) in `+page.svelte` with `faqRepository`.
- [ ] 23. [MEDIUM] Replace the hardcoded How-It-Works steps (desktop + mobile) in `+page.svelte` with `stepsRepository`.
- [ ] 24. [MEDIUM] Replace the hardcoded risk stats in `+page.svelte` with `statsRepository`.
- [ ] 25. [MEDIUM] Replace the hardcoded before/after EXIF demo fields in `+page.svelte` with `metadataDemoRepository`.

## Phase 5 — Language switching
- [ ] 26. [MEDIUM] Create `src/lib/components/LanguageSwitcher.svelte` driven by Paraglide `getLocale`/`setLocale`/`locales`, with flag+label map, preserving the existing desktop dropdown + mobile drawer markup (en/cs only).
- [ ] 27. [MEDIUM] Mount `LanguageSwitcher` in all three pages' desktop navbar and mobile drawer; remove the per-page `langConfig`/`setLang`/`toggleLangDropdown`/`localStorage('lang')` code.

## Final
- [ ] 28. [LOW] Verify: en/cs key parity is complete, no hardcoded user-facing text remains (only brand/product/format/`−20%` literals), repositories back both layouts, language switch persists across reload, and both breakpoints are visually unchanged. Run `bun run build` / lint and update `.agents/AI_LOG.md`.
</content>
