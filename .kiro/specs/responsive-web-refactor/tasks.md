# Implementation Plan:

## Overview

Refactor `frontend/metacleaner-web/` into a clean, responsive SvelteKit marketing site. Work proceeds in dependency order: cleanup → infrastructure (adapter, layout) → section-by-section responsive unification → polish (flags, i18n, docs).

## Tasks

- [x] 1. Remove boilerplate files and Storybook dependencies: Delete `src/stories/`, `src/lib/vitest-examples/`, `src/routes/demo/`, `.storybook/`, `CLAUDE.md`. Remove Storybook devDependencies and scripts from `package.json`. Remove storybook plugin from `eslint.config.js`. Run `bun install` and `bun run build` to verify. (Requirements: 1.1–1.9)
- [x] 2. Configure static adapter: Install `@sveltejs/adapter-static`, remove `adapter-auto`. Update `vite.config.ts` with static adapter config (fallback: `index.html`). Add `ssr = false` and `prerender = false` to `+layout.ts`. Verify build produces `build/` directory. (Requirements: 11.1–11.5)
- [x] 3. Centralize navigation in layout: Move `mobileMenuOpen` state, `SiteNavbar`, `MobileNavbar`, `MobileMenu` rendering into `+layout.svelte`. Derive `activePage` from `$page.url.pathname`. Add `$effect` to close menu on route change. Remove nav state and imports from all page components. (Requirements: 4.1–4.5)
- [x] 4. Create shared SiteFooter and add to layout: Create `src/lib/shared/sections/SiteFooter.svelte` as single responsive footer. Render in `+layout.svelte`. Remove `HomeFooter`, `FeaturesFooter`, `PricingFooter` components and their story files. (Requirements: 9.1–9.4)
- [x] 5. Clean up layout.css: Remove all component-specific CSS classes (`.lang-dropdown*`, `.mobile-menu`, `.slide-menu`, `.menu-overlay`). Remove `::-webkit-scrollbar { display: none }`. Add cursor rules for buttons. Add custom scrollbar styles for desktop (themed track/thumb with hover). Add mobile scrollbar hide. Keep only Tailwind imports, @theme, body reset, cursor and scrollbar globals. (Requirements: 5.1, 5.2, 6.1–6.3, 7.1–7.6)
- [x] 6. Refactor MobileMenu to Tailwind transitions: Replace `.slide-menu`/`.menu-overlay` CSS with Tailwind `translate-x-*`, `transition-transform`, `duration-300`, conditional classes. Replace dropdown variant `.mobile-menu` with `{open ? 'flex' : 'hidden'}`. (Requirements: 5.3, 5.6)
- [x] 7. Refactor LanguageSwitcher to Tailwind + SVG flags: Create `src/lib/assets/flags/gb.svg` and `cz.svg`. Replace emoji characters with `<img>` SVG imports. Replace all custom CSS classes with Tailwind utilities for dropdown positioning and visibility. (Requirements: 5.5, 8.1–8.6)
- [x] 8. Refactor HeroSection to single responsive section: Merge two `<section>` blocks into one with Tailwind breakpoints (`text-3xl md:text-5xl lg:text-6xl`, `flex-col lg:flex-row`, `px-4 md:px-6`). Show badge on mobile only via `md:hidden`. (Requirements: 2.1, 2.8, 2.10)
- [x] 9. Refactor UploadCard — remove size prop: Remove `size` prop and all 20+ `$derived()` variables. Replace with single markup using Tailwind breakpoints. Add scoped `<style>` for `.dashed-border-anim` keyframe. Update HeroSection usage. (Requirements: 2.9, 5.4)
- [x] 10. Refactor WhyItMattersSection to single section: Merge two `<section>` blocks. Remove `size` prop from `MetadataComparisonCard` and `RiskStatCard`, make them responsive via Tailwind. Use single data source. (Requirements: 2.2, 2.8, 2.10)
- [x] 11. Refactor HowItWorksSection to single section: Merge desktop/mobile blocks into one responsive `<section>`. Make `StepCard` responsive. (Requirements: 2.3, 2.8, 2.10)
- [x] 12. Refactor AudienceSection to single section: Merge blocks into one `<section>` with `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`. Make `AudienceCard` responsive. (Requirements: 2.4, 2.8, 2.10)
- [x] 13. Refactor FaqSection to single section: Merge blocks into one `<section>`. Make `FaqAccordionItem` responsive. Use unified `getFaq()` call. (Requirements: 2.5, 2.8, 2.10)
- [x] 14. Unify FAQ repository data: Update `faq.ts` to export `getFaq()` with no parameters returning combined deduplicated array. Create unified i18n keys. Remove old `home_faq_d*`/`home_faq_m*` keys. (Requirements: 3.1–3.4)
- [x] 15. Refactor Pricing page to single main block: Merge two `<main>` elements into one with `px-4 md:px-6 py-8 md:py-16`. (Requirements: 2.6, 2.8)
- [x] 16. Refactor Features page sections: Review and merge any duplicated mobile/desktop blocks in `FeaturesHeaderSection`, `FeaturesShowcaseSection`, `FeaturesCtaSection`. (Requirements: 2.7, 2.8)
- [x] 17. Clean up orphaned i18n keys: Remove `footer_tagline_mobile`, `footer_tagline_features`, `home_audience_*_mobile`, `home_stat_*_short`, `home_faq_eyebrow_mobile`, `home_faq_title_mobile`, `home_faq_subtitle_mobile` and other unused keys from both `en.json` and `cs.json`. Keep `home_upload_drop_mobile` (genuinely different UX text). (Requirements: 3.5, 3.6)
- [x] 18. Verify CtaButton cursor behavior: Confirm pointer cursor works on both `<a>` and `<button>` renders via global rule. Confirm disabled shows `not-allowed`. (Requirements: 6.4)
- [ ] 19. Write README: Replace default README with proper documentation: project description, prerequisites, Quick Start, scripts list, adapter-static rationale, Author section. (Requirements: 10.1–10.6)
- [ ] 20. Final verification: Run `bun run build` (exit 0), `bun run check` (zero TS errors), `bun run lint`. Build and start Docker container via `./start-docker.sh` to verify the containerized app serves correctly. Manually verify all pages at 375px and 1280px. Verify scrollbar, cursor, SVG flags, mobile menu behavior. (Requirements: All)

## Task Dependency Graph

```json
{
  "waves": [
    [1],
    [2],
    [3],
    [4, 5],
    [6, 7],
    [8, 9, 10, 11, 12, 13, 14, 15, 16],
    [17, 18],
    [19],
    [20]
  ]
}
```

## Notes

- Tasks 8–16 can be done in any order or in parallel. Each section is independent.
- Task 17 (i18n cleanup) should be done last among section tasks since it depends on knowing which keys are still referenced.
- Task 14 (FAQ repo) should be done together with or before Task 13 (FaqSection refactor).
- Co-located `.stories.svelte` files are preserved — they remain valid Svelte components even without Storybook runtime.
