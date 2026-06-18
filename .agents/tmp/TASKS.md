# UI Refactoring Tasks — `frontend/metacleaner-web`

Derived from `REFACTORING.md`. Ordered so dependencies are created first. Storybook is detected
(`@storybook/addon-svelte-csf`), so every new element/component has a co-located
`*.stories.svelte` task. **No visual change** to any page is allowed.

All paths are relative to `frontend/metacleaner-web/`.

## Phase 0 — Theme / design tokens

- [x] 1. [HIGH] Add new color tokens to the `@theme` block in `src/routes/layout.css`: `--color-border: #1f2937`, `--color-border-strong: #374151`, `--color-watermark: #1f2937`; add container token `--container-site: 1100px`; (optional) `--blur-glow: 50px`, `--blur-glow-sm: 40px`.
- [x] 2. [HIGH] Replace hardcoded hex in `src/routes/layout.css` raw CSS (`body`, `.lang-dropdown-menu`, `.lang-option`, `.lang-check`) with `var(--color-*)` references (navy-main, navy-card, navy-lighter, text-main, text-muted, brand-blue, border-strong).
- [x] 3. [HIGH] Replace `border-gray-800` (×60) with `border-border` and `border-gray-700` (×13) / `hover:bg-gray-800` with `border-border-strong` / `bg-border` across the three pages.
- [x] 4. [MEDIUM] Replace `text-gray-800` watermark step numbers with `text-watermark`, `max-w-[1100px]` (×11) with `max-w-site`, `rounded-[16px]` with `rounded-2xl`, and (if tokenized) `blur-[50px]`/`blur-[40px]` with the blur tokens.
- [x] 5. [LOW] Replace the hardcoded `'Inter', sans-serif` in the `body` rule with `var(--font-family-sans)` (verify Tailwind still emits the `font-sans` utility; add `--font-sans` alias if needed).

## Phase 1 — Shared elements (`src/lib/components/elements/`)

- [x] 6. [HIGH] Create `BrandLogo.svelte` — logo tile + “MetaCleaner” wordmark; props `size` ('sm'|'md'|'lg'), `href='/'`.
- [x] 7. [HIGH] Create `BrandLogo.stories.svelte` — sizes sm/md/lg.
- [x] 8. [HIGH] Create `IconBadge.svelte` — tinted rounded icon container; props `icon`, `color`, `size`, `shape` ('circle'|'rounded'), `tint`.
- [x] 9. [HIGH] Create `IconBadge.stories.svelte` — color/shape/size variants.
- [x] 10. [HIGH] Create `SectionHeading.svelte` — eyebrow + title + subtitle; props `eyebrow`, `eyebrowColor`, `title`, `subtitle`, `size` ('lg'|'sm').
- [x] 11. [HIGH] Create `SectionHeading.stories.svelte` — with/without eyebrow, lg/sm.
- [x] 12. [HIGH] Create `CtaButton.svelte` — button/link; props `variant` ('primary'|'secondary'|'blue'|'outline'), `icon`, `label`, `href`, `disabled`, `fullWidth`.
- [x] 13. [HIGH] Create `CtaButton.stories.svelte` — all variants, disabled, full-width.
- [x] 14. [MEDIUM] Create `CheckBullet.svelte` — check icon + text; props `text`, `emphasis`.
- [x] 15. [MEDIUM] Create `CheckBullet.stories.svelte` — default + emphasis.
- [x] 16. [MEDIUM] Create `NavLink.svelte` — desktop nav link; props `href`, `label`, `active`.
- [x] 17. [MEDIUM] Create `NavLink.stories.svelte` — default + active.
- [x] 18. [MEDIUM] Create `GradientText.svelte` — blue→green clip-text wrapper (children snippet).
- [x] 19. [MEDIUM] Create `GradientText.stories.svelte` — sample heading.
- [x] 20. [LOW] Create `FormatBadge.svelte` — uppercase format tag; props `label`, `size`.
- [x] 21. [LOW] Create `FormatBadge.stories.svelte` — JPG/PNG/HEIC/WEBP, sizes.
- [x] 22. [LOW] Create `SocialIconLink.svelte` — square social icon button; props `icon`, `href`.
- [x] 23. [LOW] Create `SocialIconLink.stories.svelte` — twitter/github/linkedin.
- [x] 24. [MEDIUM] Create `FooterBrand.svelte` — `BrandLogo` + tagline; prop `tagline`.
- [x] 25. [MEDIUM] Create `FooterBrand.stories.svelte` — default.
- [x] 26. [MEDIUM] Create `FooterColumn.svelte` — heading + link list; props `heading`, `links`.
- [x] 27. [MEDIUM] Create `FooterColumn.stories.svelte` — sample column.
- [x] 28. [MEDIUM] Create `FooterBottomBar.svelte` — copyright + legal links (+ optional made-with); props `copyright`, `links`, `madeWith`.
- [x] 29. [MEDIUM] Create `FooterBottomBar.stories.svelte` — with/without made-with.

## Phase 2 — Shared components (`src/lib/components/shared/`)

- [x] 30. [HIGH] Create `SiteNavbar.svelte` — desktop navbar composing `BrandLogo`, `NavLink`, `LanguageSwitcher`, login `CtaButton`; prop `active`. Use `/#anchor` hrefs so it works from any page.
- [x] 31. [HIGH] Create `SiteNavbar.stories.svelte` — active = home/features/pricing.
- [x] 32. [HIGH] Create `MobileNavbar.svelte` — sticky top bar + hamburger; props `open`, `onToggle`.
- [x] 33. [HIGH] Create `MobileNavbar.stories.svelte` — open/closed.
- [x] 34. [HIGH] Create `MobileMenu.svelte` — unifies Home drawer + Features/Pricing dropdown; props `variant` ('drawer'|'dropdown'), `active`, `open`, `onClose`; composes `LanguageSwitcher`.
- [x] 35. [HIGH] Create `MobileMenu.stories.svelte` — drawer (open) + dropdown (open).
- [x] 36. [LOW] Create `LanguageSwitcher.stories.svelte` for the existing `src/lib/components/LanguageSwitcher.svelte` — desktop + mobile variants.

## Phase 3 — Page-specific components & sections

### Home components (`src/routes/(home)/components/`)
- [x] 37. [HIGH] Create `MetadataFieldRow.svelte` — icon + label + value/”removed”; props `field`, `variant` ('before'|'after'), `size`.
- [x] 38. [HIGH] Create `MetadataFieldRow.stories.svelte` — before/after, desktop/mobile.
- [x] 39. [HIGH] Create `MetadataComparisonCard.svelte` — before/after card composing `IconBadge` + `MetadataFieldRow`; props `variant`, `fields`, `size`.
- [x] 40. [HIGH] Create `MetadataComparisonCard.stories.svelte` — before + after.
- [x] 41. [MEDIUM] Create `UploadCard.svelte` — dashed drop card composing `FormatBadge`; prop `size` (desktop/mobile).
- [x] 42. [MEDIUM] Create `UploadCard.stories.svelte` — desktop + mobile.
- [x] 43. [MEDIUM] Create `RiskStatCard.svelte` — stat card composing `IconBadge`; props `stat`, `size`.
- [x] 44. [MEDIUM] Create `RiskStatCard.stories.svelte` — the three stat colors.
- [x] 45. [MEDIUM] Create `StepCard.svelte` — step card composing `IconBadge`; props `step`, `size`.
- [x] 46. [MEDIUM] Create `StepCard.stories.svelte` — desktop + mobile.
- [x] 47. [MEDIUM] Create `AudienceCard.svelte` — audience card composing `IconBadge` + `CheckBullet`; props `audience`, `compact`.
- [x] 48. [MEDIUM] Create `AudienceCard.stories.svelte` — full + compact.
- [x] 49. [MEDIUM] Create `FaqAccordionItem.svelte` — question/answer with internal `open` `$state` (replaces DOM-class toggling, same look/behavior); props `question`, `answer`, `size`.
- [x] 50. [MEDIUM] Create `FaqAccordionItem.stories.svelte` — collapsed + expanded.

### Home sections (`src/routes/(home)/sections/`)
- [x] 51. [HIGH] Create `HeroSection.svelte` — desktop+mobile hero composing `GradientText`, `UploadCard`, `CtaButton`.
- [x] 52. [HIGH] Create `WhyItMattersSection.svelte` — composing `SectionHeading`, `MetadataComparisonCard`, `RiskStatCard`.
- [x] 53. [HIGH] Create `HowItWorksSection.svelte` — composing `SectionHeading`, `StepCard`.
- [x] 54. [HIGH] Create `AudienceSection.svelte` — composing `SectionHeading`, `AudienceCard`.
- [x] 55. [HIGH] Create `FaqSection.svelte` — composing `SectionHeading`, `FaqAccordionItem`.
- [x] 56. [MEDIUM] Create `HomeFooter.svelte` — composing `FooterBrand`, `FooterColumn`, `FooterBottomBar`.

### Features components (`src/routes/features/components/`)
- [x] 57. [MEDIUM] Create `FormatPill.svelte` — format chip; props `format`, `size`.
- [x] 58. [MEDIUM] Create `FormatPill.stories.svelte` — color variants.
- [x] 59. [MEDIUM] Create `ExifIllustration.svelte` — inline EXIF decorative graphic.
- [x] 60. [MEDIUM] Create `ExifIllustration.stories.svelte` — default.
- [x] 61. [MEDIUM] Create `C2paIllustration.svelte` — inline C2PA decorative graphic.
- [x] 62. [MEDIUM] Create `C2paIllustration.stories.svelte` — default.
- [x] 63. [HIGH] Create `FeatureRow.svelte` — desktop alternating row composing `IconBadge`, `FormatPill`, `CheckBullet`, image/illustration; props `feature`.
- [x] 64. [HIGH] Create `FeatureRow.stories.svelte` — ltr/rtl, formats vs bullets, image vs illustration.
- [x] 65. [HIGH] Create `FeatureCard.svelte` — mobile feature card composing `IconBadge`, `FormatPill`, `CheckBullet`; props `feature`.
- [x] 66. [HIGH] Create `FeatureCard.stories.svelte` — formats + bullets variants.

### Features sections (`src/routes/features/sections/`)
- [x] 67. [HIGH] Create `FeaturesHeaderSection.svelte` — composing `SectionHeading`/`GradientText`.
- [x] 68. [HIGH] Create `FeaturesShowcaseSection.svelte` — desktop `FeatureRow` list + mobile `FeatureCard` list.
- [x] 69. [MEDIUM] Create `FeaturesCtaSection.svelte` — mobile CTA box composing `CtaButton`.
- [x] 70. [MEDIUM] Create `FeaturesFooter.svelte` — composing `FooterBrand`, `SocialIconLink`, `FooterColumn`, `FooterBottomBar`.

### Pricing components (`src/routes/pricing/components/`)
- [x] 71. [HIGH] Create `BillingToggle.svelte` — monthly/yearly toggle; props `value`, `onChange`.
- [x] 72. [HIGH] Create `BillingToggle.stories.svelte` — monthly + yearly.
- [x] 73. [HIGH] Create `PricingCard.svelte` — plan card (desktop+mobile) composing `CheckBullet`, `CtaButton`; props `plan`, `isYearly`.
- [x] 74. [HIGH] Create `PricingCard.stories.svelte` — free / pack / featured / disabled.
- [x] 75. [MEDIUM] Create `EnterpriseBanner.svelte` — composing `CtaButton`; prop `enterprise`.
- [x] 76. [MEDIUM] Create `EnterpriseBanner.stories.svelte` — default.

### Pricing sections (`src/routes/pricing/sections/`)
- [x] 77. [HIGH] Create `PricingHeaderSection.svelte` — title + subtitle + `BillingToggle`.
- [x] 78. [HIGH] Create `PricingPlansSection.svelte` — desktop + mobile `PricingCard` grids; props `plans`, `isYearly`.
- [x] 79. [MEDIUM] Create `PricingFooter.svelte` — composing `FooterBottomBar`.

## Phase 4 — Refactor pages

- [x] 80. [MEDIUM] Move `src/routes/+page.svelte` → `src/routes/(home)/+page.svelte` and rewrite it to compose `SiteNavbar`, `MobileNavbar`, `MobileMenu` (variant=drawer), and the Home sections; keep `mobileMenuOpen` `$state` in the page.
- [x] 81. [MEDIUM] Refactor `src/routes/features/+page.svelte` to compose `SiteNavbar`, `MobileNavbar`, `MobileMenu` (variant=dropdown), and the Features sections.
- [ ] 82. [MEDIUM] Refactor `src/routes/pricing/+page.svelte` to compose `SiteNavbar`, `MobileNavbar`, `MobileMenu` (variant=dropdown), and the Pricing sections; keep `currentBilling`/`isYearly` `$state` in the page and pass down.

## Final

- [ ] 83. [HIGH] Run `npm run check` and `vite build` — 0 type errors, clean build.
- [ ] 84. [HIGH] Run `npm run build-storybook` — all new stories build.
- [ ] 85. [HIGH] Visually verify Home, Features, Pricing (desktop + mobile) — no visual regressions, language switch + billing toggle + FAQ accordion + mobile menu still work, and no duplicated UI code remains.
