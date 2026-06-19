# Test Report
Created: 2026-06-19T05:26:00+00:00
Updated: 2026-06-19T05:26:00+00:00

Project: **frontend/metacleaner-web** (SvelteKit 2 / Svelte 5 + Vite 8 + Tailwind v4,
static marketing site). E2E framework: **Playwright** (`**/*.e2e.{ts,js}`, port 4173).

## Summary
- Total E2E tests: 60
- Passing E2E tests: 54
- Failing E2E tests: 6
- Total component stories: 41
- Passing component stories: 0
- Failing component stories: 0

> **Component stories are not executed.** 41 `*.stories.svelte` files exist and use
> Storybook CSF (`@storybook/addon-svelte-csf`), but **no component-catalog runner is
> installed** (no Storybook/Ladle/Histoire in `package.json`, no `.storybook/`, no
> catalog binary). They therefore neither pass nor fail — they are authored but
> unrunnable. See Notes.

## E2E Test Coverage
| Page/Route | Test File | Status |
|---|---|---|
| `/` (home) | `e2e/home.e2e.ts` | ✅ Pass (9/9) |
| `/features` | `e2e/features.e2e.ts` | ✅ Pass (4/4) |
| `/pricing` | `e2e/pricing.e2e.ts` | ✅ Pass (10/10) |
| Cross-page navigation (navbar + footer) | `e2e/navigation.e2e.ts` | ✅ Pass (12/12) |
| Mobile menu / hamburger | `e2e/mobile-menu.e2e.ts` | ❌ Fail (5/9 — 4 failing) |
| Responsive layout (375px / 1280px) | `e2e/responsive.e2e.ts` | ❌ Fail (14/16 — 2 failing) |

All three application routes (`/`, `/features`, `/pricing`) have passing page-level
E2E coverage. The two suites with failures are cross-cutting behaviour suites; the
specific failing cases are listed under Notes.

## Component Test Coverage
No runner executes these; "Status" reflects authored coverage only (⚠️ Not run).

| Component | Story File | States Covered | Status |
|---|---|---|---|
| LanguageSwitcher | `LanguageSwitcher.stories.svelte` | Desktop, Mobile | ⚠️ Not run |
| BrandLogo | `elements/BrandLogo.stories.svelte` | Small, Medium, Large | ⚠️ Not run |
| CheckBullet | `elements/CheckBullet.stories.svelte` | Green, Blue Emphasized, Blue Emphasized Small, Extra small | ⚠️ Not run |
| CtaButton | `elements/CtaButton.stories.svelte` | Primary, Secondary, Blue, Outline, Disabled, Full Width Primary, Full Width Blue, Link | ⚠️ Not run |
| FooterBottomBar | `elements/FooterBottomBar.stories.svelte` | WithLinks, WithMadeWith | ⚠️ Not run |
| FooterBrand | `elements/FooterBrand.stories.svelte` | Default | ⚠️ Not run |
| FooterColumn | `elements/FooterColumn.stories.svelte` | Product, Company, Legal | ⚠️ Not run |
| FormatBadge | `elements/FormatBadge.stories.svelte` | JPG, PNG, HEIC, WEBP, Small, Extra small | ⚠️ Not run |
| GradientText | `elements/GradientText.stories.svelte` | Heading, Inline Text, Large Heading | ⚠️ Not run |
| IconBadge | `elements/IconBadge.stories.svelte` | Tinted/Solid colors, Circle, Rounded, sizes (Small–Extra Large) | ⚠️ Not run |
| NavLink | `elements/NavLink.stories.svelte` | Default, Active | ⚠️ Not run |
| SectionHeading | `elements/SectionHeading.stories.svelte` | Large/Small Eyebrow, Blue/Orange Eyebrow, No Eyebrow, No Subtitle | ⚠️ Not run |
| SocialIconLink | `elements/SocialIconLink.stories.svelte` | Twitter, GitHub, LinkedIn | ⚠️ Not run |
| MobileMenu | `shared/MobileMenu.stories.svelte` | Drawer Open, Dropdown Open (Features/Pricing), Dropdown Closed | ⚠️ Not run |
| MobileNavbar | `shared/MobileNavbar.stories.svelte` | Closed, Open | ⚠️ Not run |
| SiteNavbar | `shared/SiteNavbar.stories.svelte` | Home/Features/Pricing Active | ⚠️ Not run |
| AudienceCard | `(home)/components/AudienceCard.stories.svelte` | Journalist, Photographer | ⚠️ Not run |
| FaqAccordionItem | `(home)/components/FaqAccordionItem.stories.svelte` | Collapsed | ⚠️ Not run |
| MetadataComparisonCard | `(home)/components/MetadataComparisonCard.stories.svelte` | Desktop/Mobile × Before/After | ⚠️ Not run |
| MetadataFieldRow | `(home)/components/MetadataFieldRow.stories.svelte` | Desktop/Mobile × Before/After | ⚠️ Not run |
| RiskStatCard | `(home)/components/RiskStatCard.stories.svelte` | Desktop/Mobile × Red/Orange/Blue | ⚠️ Not run |
| StepCard | `(home)/components/StepCard.stories.svelte` | Desktop/Mobile × Step 1–3 | ⚠️ Not run |
| UploadCard | `(home)/components/UploadCard.stories.svelte` | Desktop, Mobile | ⚠️ Not run |
| AudienceSection | `(home)/sections/AudienceSection.stories.svelte` | Default | ⚠️ Not run |
| FaqSection | `(home)/sections/FaqSection.stories.svelte` | Default | ⚠️ Not run |
| HeroSection | `(home)/sections/HeroSection.stories.svelte` | Default | ⚠️ Not run |
| HowItWorksSection | `(home)/sections/HowItWorksSection.stories.svelte` | Default | ⚠️ Not run |
| WhyItMattersSection | `(home)/sections/WhyItMattersSection.stories.svelte` | Default | ⚠️ Not run |
| C2paIllustration | `features/components/C2paIllustration.stories.svelte` | Default | ⚠️ Not run |
| ExifIllustration | `features/components/ExifIllustration.stories.svelte` | Default | ⚠️ Not run |
| FeatureCard | `features/components/FeatureCard.stories.svelte` | Formats (brand-blue), Bullets (brand-orange) | ⚠️ Not run |
| FeatureRow | `features/components/FeatureRow.stories.svelte` | LTR/RTL × Formats/Bullets/Image/Illustration | ⚠️ Not run |
| FormatPill | `features/components/FormatPill.stories.svelte` | Red/Orange/Blue/Green/Muted × desktop/mobile | ⚠️ Not run |
| FeaturesCtaSection | `features/sections/FeaturesCtaSection.stories.svelte` | Default | ⚠️ Not run |
| FeaturesHeaderSection | `features/sections/FeaturesHeaderSection.stories.svelte` | Default | ⚠️ Not run |
| FeaturesShowcaseSection | `features/sections/FeaturesShowcaseSection.stories.svelte` | Default | ⚠️ Not run |
| BillingToggle | `pricing/components/BillingToggle.stories.svelte` | Monthly, Yearly | ⚠️ Not run |
| EnterpriseBanner | `pricing/components/EnterpriseBanner.stories.svelte` | Desktop, Mobile | ⚠️ Not run |
| PricingCard | `pricing/components/PricingCard.stories.svelte` | Free, Pack, Featured (Pro), Disabled (Pro+), Mobile variants | ⚠️ Not run |
| PricingHeaderSection | `pricing/sections/PricingHeaderSection.stories.svelte` | Monthly, Yearly | ⚠️ Not run |
| PricingPlansSection | `pricing/sections/PricingPlansSection.stories.svelte` | Monthly, Yearly | ⚠️ Not run |

## Uncovered (no tests)
- **`SiteFooter`** (`src/lib/shared/sections/SiteFooter.svelte`) — the only component
  with **no** `*.stories.svelte` file. (Its real links are nonetheless exercised
  indirectly by `e2e/navigation.e2e.ts`.)
- **All 41 component stories** are effectively uncovered at runtime: they exist but
  no catalog runner executes them.
- No application **routes** are uncovered — all three (`/`, `/features`, `/pricing`)
  have E2E suites.

## Notes
- **E2E run:** `playwright test` (build + preview on :4173, headless Chromium).
  Browsers were not present at the system path (`/opt/playwright-browsers` held
  chromium-1223; Playwright 1.60 needs 1228 and the dir is read-only); installed the
  matching `chrome-headless-shell` v1228 to `$HOME/.cache/ms-playwright` and ran with
  `PLAYWRIGHT_BROWSERS_PATH` pointed there. **Future runs must do the same** or the
  suite errors out with "Executable doesn't exist".
- **6 E2E failures** (selector-based, in newly generated suites):
  - `mobile-menu.e2e.ts` — 4 failing tests for the **dropdown** variant on
    `/features` and `/pricing`. The locator `div.md\:hidden.w-full.flex-col` is never
    visible, so the dropdown panel assertions time out. Likely the dropdown markup /
    class names differ from what the test expects; the drawer-variant (home) tests
    pass.
  - `responsive.e2e.ts` — 2 failing tests: `/pricing` mobile layout and `/pricing`
    desktop plan-grid visibility. Pricing-specific responsive selectors don't match.
  - The home, features, pricing, and navigation suites pass fully (35/35 combined).
- **No component-catalog runner.** Storybook CSF stories reference
  `@storybook/addon-svelte-csf` but Storybook itself is not a dependency and there is
  no `.storybook/` config (a prior install attempt is recorded in
  `debug-storybook.log` but never completed). To make the 41 stories count toward
  coverage, install + configure a runner (Storybook with the Svelte CSF addon, or
  migrate stories to `vitest-browser-svelte` component tests, which *is* installed and
  wired in `vite.config.ts` via the `client` browser project).
- **Prior report scope:** the previous `UI_TEST_REPORT.md` documented a different
  project (`metacleaner-app`, 418 tests, `/login`–`/report` routes). It does not apply
  to `metacleaner-web`; this report fully replaces it, hence a fresh `Created` date.
- **Recommendation:** fix the 6 failing selectors in the mobile-menu/responsive
  pricing tests, and stand up a component-catalog runner so the stories become
  executable coverage rather than authored-only.
