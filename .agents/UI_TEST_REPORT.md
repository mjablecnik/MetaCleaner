# Test Report
Created: 2026-06-19T05:26:00+00:00
Updated: 2026-06-30T01:04:08+00:00

Project: **frontend/metacleaner-web** (SvelteKit 2 / Svelte 5 + Vite 8 + Tailwind v4,
static marketing site). E2E framework: **Playwright** (`**/*.e2e.{ts,js}`, build +
preview on port 4173, headless Chromium).

## Summary
- Total E2E tests: 60
- Passing E2E tests: 59
- Failing E2E tests: 1
- Total component stories: 112 (across 35 `*.stories.svelte` files)
- Passing component stories: 0
- Failing component stories: 0

> **Component stories are not executed.** 35 `*.stories.svelte` files (112 individual
> `<Story>` states) exist and use Storybook CSF (`@storybook/addon-svelte-csf`), but
> **no component-catalog runner is installed** (no Storybook / Ladle / Histoire in
> `package.json`, no `.storybook/` config, no catalog binary). They therefore neither
> pass nor fail — they are authored but unrunnable. See Notes.

## E2E Test Coverage
| Page/Route | Test File | Status |
|---|---|---|
| `/` (home) | `e2e/home.e2e.ts` | ✅ Pass (9/9) |
| `/features` | `e2e/features.e2e.ts` | ✅ Pass (4/4) |
| `/pricing` | `e2e/pricing.e2e.ts` | ❌ Fail (9/10 — 1 failing) |
| Cross-page navigation (navbar + footer) | `e2e/navigation.e2e.ts` | ✅ Pass (12/12) |
| Mobile menu / hamburger (drawer variant) | `e2e/mobile-menu.e2e.ts` | ✅ Pass (9/9) |
| Responsive layout (375px / 1280px) | `e2e/responsive.e2e.ts` | ✅ Pass (16/16) |

The three application routes with dedicated suites (`/`, `/features`, `/pricing`) plus
the two cross-cutting behaviour suites (navigation, mobile-menu) and the responsive
suite are all green except for a single pricing assertion (see Notes). Routes
`/about`, `/privacy`, `/terms`, and the `+error.svelte` error page have **no** E2E
coverage.

## Component Test Coverage
No runner executes these; "Status" reflects authored coverage only (⚠️ Not run).

| Component | Story File | States Covered | Status |
|---|---|---|---|
| LanguageSwitcher | `components/LanguageSwitcher.stories.svelte` | Desktop, Mobile | ⚠️ Not run |
| BrandLogo | `elements/BrandLogo.stories.svelte` | Small, Medium, Large | ⚠️ Not run |
| CheckBullet | `elements/CheckBullet.stories.svelte` | Green, Blue Emphasized, Blue Emphasized Small, Extra small | ⚠️ Not run |
| CtaButton | `elements/CtaButton.stories.svelte` | Primary, Secondary, Blue, Outline, Disabled, Full Width Primary, Full Width Blue, Link | ⚠️ Not run |
| FooterBottomBar | `elements/FooterBottomBar.stories.svelte` | WithLinks, WithMadeWith | ⚠️ Not run |
| FooterBrand | `elements/FooterBrand.stories.svelte` | Default | ⚠️ Not run |
| FooterColumn | `elements/FooterColumn.stories.svelte` | Product, Company, Legal | ⚠️ Not run |
| FormatBadge | `elements/FormatBadge.stories.svelte` | JPG, PNG, HEIC, WEBP, Small, Extra small | ⚠️ Not run |
| GradientText | `elements/GradientText.stories.svelte` | Heading, Inline Text, Large Heading | ⚠️ Not run |
| IconBadge | `elements/IconBadge.stories.svelte` | Tinted (Blue/Green/Red/Orange), Solid (Blue/Green), Circle, Rounded, sizes Small–Extra Large | ⚠️ Not run |
| NavLink | `elements/NavLink.stories.svelte` | Default, Active | ⚠️ Not run |
| SectionHeading | `elements/SectionHeading.stories.svelte` | Large/Small Eyebrow, Blue/Orange Eyebrow, No Eyebrow, No Subtitle | ⚠️ Not run |
| MobileMenu | `shared/MobileMenu.stories.svelte` | Drawer Open, Dropdown Open (Features/Pricing), Dropdown Closed | ⚠️ Not run |
| MobileNavbar | `shared/MobileNavbar.stories.svelte` | Closed, Open | ⚠️ Not run |
| SiteNavbar | `shared/SiteNavbar.stories.svelte` | Home Active, Features Active, Pricing Active | ⚠️ Not run |
| AudienceCard | `(home)/components/AudienceCard.stories.svelte` | Journalist, Photographer | ⚠️ Not run |
| FaqAccordionItem | `(home)/components/FaqAccordionItem.stories.svelte` | Collapsed | ⚠️ Not run |
| MetadataComparisonCard | `(home)/components/MetadataComparisonCard.stories.svelte` | Desktop/Mobile × Before/After | ⚠️ Not run |
| MetadataFieldRow | `(home)/components/MetadataFieldRow.stories.svelte` | Desktop/Mobile × Before/After | ⚠️ Not run |
| RiskStatCard | `(home)/components/RiskStatCard.stories.svelte` | Desktop/Mobile × Red/Orange/Blue | ⚠️ Not run |
| StepCard | `(home)/components/StepCard.stories.svelte` | Desktop/Mobile × Step 1–3 | ⚠️ Not run |
| UploadCard | `(home)/components/UploadCard.stories.svelte` | Desktop, Mobile | ⚠️ Not run |
| AudienceSection | `(home)/sections/AudienceSection.stories.svelte` | Default | ⚠️ Not run |
| FaqSection | `(home)/sections/FaqSection.stories.svelte` | Default | ⚠️ Not run |
| HeroSection (home) | `(home)/sections/HeroSection.stories.svelte` | Default | ⚠️ Not run |
| HowItWorksSection | `(home)/sections/HowItWorksSection.stories.svelte` | Default | ⚠️ Not run |
| WhyItMattersSection | `(home)/sections/WhyItMattersSection.stories.svelte` | Default | ⚠️ Not run |
| C2paIllustration | `features/components/C2paIllustration.stories.svelte` | Default | ⚠️ Not run |
| ExifIllustration | `features/components/ExifIllustration.stories.svelte` | Default | ⚠️ Not run |
| FeatureCard | `features/components/FeatureCard.stories.svelte` | Formats (brand-blue), Bullets (brand-orange) | ⚠️ Not run |
| FeatureRow | `features/components/FeatureRow.stories.svelte` | LTR/RTL × Formats/Bullets × Image/Illustration | ⚠️ Not run |
| FormatPill | `features/components/FormatPill.stories.svelte` | Red/Orange/Blue/Green/Muted × desktop/mobile | ⚠️ Not run |
| FeaturesCtaSection | `features/sections/FeaturesCtaSection.stories.svelte` | Default | ⚠️ Not run |
| FeaturesHeaderSection | `features/sections/FeaturesHeaderSection.stories.svelte` | Default | ⚠️ Not run |
| FeaturesShowcaseSection | `features/sections/FeaturesShowcaseSection.stories.svelte` | Default | ⚠️ Not run |

## Uncovered (no tests)

### Pages / routes without E2E coverage
- **`/about`** (`src/routes/about/+page.svelte`) — no `about.e2e.ts`.
- **`/privacy`** (`src/routes/privacy/+page.svelte`) — no E2E suite.
- **`/terms`** (`src/routes/terms/+page.svelte`) — no E2E suite.
- **`+error.svelte`** (root error page) — rendered on 404 / errors; no E2E suite. Its
  supporting components live under `src/routes/error/` (no `+page` of its own).
- The `sitemap.xml` server route (`src/routes/sitemap.xml/+server.ts`) has no test.

### Components without a `*.stories.svelte` file (18)
- `lib/components/shared/CookieConsentBanner.svelte`
- `lib/components/shared/JsonLd.svelte`
- `lib/components/shared/SeoHead.svelte`
- `lib/shared/sections/SiteFooter.svelte` (its links are exercised indirectly by `e2e/navigation.e2e.ts`)
- `routes/about/components/ContactForm.svelte`
- `routes/about/components/ContactInfoCard.svelte`
- `routes/about/components/ResponseTimeCard.svelte`
- `routes/about/components/StatCard.svelte`
- `routes/about/components/ValueCard.svelte`
- `routes/about/sections/ContactSection.svelte`
- `routes/about/sections/HeroSection.svelte`
- `routes/about/sections/StorySection.svelte`
- `routes/about/sections/ValuesSection.svelte`
- `routes/error/components/QuickLinkCard.svelte`
- `routes/error/sections/ActionButtons.svelte`
- `routes/error/sections/OrbitVisual.svelte`
- `routes/error/sections/QuickLinksGrid.svelte`
- `routes/error/sections/TerminalCard.svelte`

### Runtime-uncovered
- **All 35 component story files (112 states)** are effectively uncovered at runtime:
  they exist but no catalog runner executes them.

## Notes
- **E2E run:** `npx playwright test` (build + preview on :4173, headless Chromium),
  total wall time ~1.1 min. Playwright browsers were available at the default path
  (`PLAYWRIGHT_BROWSERS_PATH=/opt/playwright-browsers`, `chromium-1228` present, which
  matches Playwright 1.60). No manual browser install was needed this run — unlike
  prior runs where the matching build was missing.
- **1 E2E failure** — `e2e/pricing.e2e.ts:49` › "Pro+ plan has Coming soon CTA":
  ```
  Locator: locator('.hidden.md\:flex').getByText('Coming soon', { exact: true })
  Expected: visible — element(s) not found (timeout 5000ms)
  ```
  The "Coming soon" string itself exists (`messages/en.json` → `pricing_cta_coming_soon`).
  The failure is a **selector/markup mismatch**: the test scopes the lookup to the
  desktop plans container `.hidden.md:flex`, but the exact-text "Coming soon" node is
  not found there (likely the Pro+ CTA markup or class wrapper changed). The sibling
  pricing assertions (4 plan cards, prices, Most Popular badge, enterprise banner,
  billing toggle monthly/yearly) all pass — only this one selector is stale. This is an
  authored-test bug, not an application/build break.
- **No component-catalog runner.** Storybook CSF stories reference
  `@storybook/addon-svelte-csf`, but Storybook itself is not a dependency and there is
  no `.storybook/` config. To turn the 35 stories (112 states) into executable
  coverage, either install + configure Storybook with the Svelte CSF addon, or migrate
  the stories to `vitest-browser-svelte` component tests (which *is* installed and
  already wired in `vite.config.ts` via the `client` browser project — pattern
  `src/**/*.svelte.{test,spec}.{js,ts}`, currently zero such files).
- **Unit/component vitest:** 0 `*.svelte.{test,spec}.ts` files exist; `vitest` runs
  with `passWithNoTests: true`, so the unit layer is a no-op.
- **Project drift since last report:** the previous report listed `/pricing`
  sub-components/stories (BillingToggle, PricingCard, etc.) and `SocialIconLink` that no
  longer exist; meanwhile `/about`, `/privacy`, `/terms`, and the `error/` component
  set are new and lack stories/E2E. Coverage tables above reflect the **current** tree
  (53 components, 35 with stories).
- **Pipeline cleanup (STEP 4):** `.agents/tmp/` was already empty — no
  `COMPONENT_TESTS.md` / `E2E_TESTS.md` to delete, and no `COMPONENT_TASKS.md` /
  `E2E_TASKS.md` present (the AI_LOG step will find none).
- **Recommendations:** (1) fix the stale `.hidden.md:flex` "Coming soon" selector in
  `pricing.e2e.ts`; (2) add E2E suites for `/about`, `/privacy`, `/terms`, and the
  error page; (3) stand up a component-catalog runner so the 112 stories become real
  coverage; (4) add stories for the 18 uncovered components (notably the whole `about/`
  and `error/` component sets).
