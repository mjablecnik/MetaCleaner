# E2E Test Analysis — metacleaner-web

## Detected Framework & Configuration

- **Framework:** Playwright (`@playwright/test` ^1.60.0, `playwright` ^1.60.0)
- **Config:** `playwright.config.ts`
  - `webServer`: `npm run build && npm run preview` on port **4173**
  - `testMatch`: `**/*.e2e.{ts,js}` — **test files must use the `.e2e.ts` extension** (not `.spec.ts`)
  - No `projects` / device presets configured; viewports must be set per-test via `page.setViewportSize(...)` or `test.use({ viewport })`.
- **Run command:** `npm run test:e2e` (runs `playwright install && playwright test`)
- All tests run **headless** (no X11/Wayland needed) — Chromium via Playwright.

> **Note — no component catalog detected.** There is no Storybook/Ladle/Histoire
> installed (no `.storybook/`, no catalog dependency in `package.json`, no catalog
> binary in `node_modules`, no config file). A Storybook install was *attempted*
> once — see `debug-storybook.log`, generated on a different machine — but it never
> completed. The many `*.stories.svelte` files in the tree have **no runner**, so
> per the pipeline detection rule no `COMPONENT_TESTS.md` / `COMPONENT_TASKS.md`
> are produced. Only the E2E side is analyzed below.

> **Note — prior reports describe a different project.** `.agents/UI_TEST_REPORT.md`
> and `.agents/AI_LOG.md` document `metacleaner-app` (an application with
> `/login`, `/register`, `/reports`, `/report`, and `step1`–`step5` routes and 418
> E2E tests in an `e2e/*.spec.ts` suite). The project under analysis here,
> **`frontend/metacleaner-web`**, is a separate **static marketing site** with 3
> routes and **no existing E2E tests**. The old report's coverage does NOT apply.

## Project Type

- **Framework:** SvelteKit 2 (Svelte 5 runes) + Vite 8 + Tailwind v4
- **Adapter:** `@sveltejs/adapter-static` (fully static SPA, `fallback: index.html`)
- **i18n:** Paraglide (`$lib/paraglide/messages`), locales: `en` (base) + `cs`.
  Strategy: `localStorage`, `cookie`, `preferredLanguage`, `baseLocale`.

## Pages / Routes

| Route | Source | Title (en) | Sections (anchors) |
|---|---|---|---|
| `/` (home) | `src/routes/(home)/+page.svelte` | `MetaCleaner — Protect Your Privacy` | `#hero`, `#why-it-matters`, `#how-it-works`, `#who-its-for`, `#faq` |
| `/features` | `src/routes/features/+page.svelte` | `MetaCleaner — Features` | `#features-header`, 6× `#feature-{id}`, `#cta-section` |
| `/pricing` | `src/routes/pricing/+page.svelte` | `MetaCleaner — Pricing` | header (billing toggle), plans, enterprise banner |

There are **no dynamic/parameterized routes** and **no error routes**.

### Should have E2E tests
- `/` (home)
- `/features`
- `/pricing`
- Cross-page navigation (navbar + footer links)
- Responsive layout (mobile 375px / desktop 1280px) incl. hamburger menu

### Already have E2E tests
- **None.** No `*.e2e.{ts,js}` files exist anywhere in `metacleaner-web`.

### Missing E2E tests
- All of the above (every page + navigation + responsive).

### Orphaned E2E tests
- **None** (there are no existing tests in this project).

### Failing E2E tests
- **None** (there are no existing tests to run).

## API Endpoints to Mock

**None.** This is a fully static marketing site. There are **no `fetch()` calls** and
no network data fetching in any page or component. All page data comes from
synchronous local repositories under `src/lib/repositories/` returning static data:
`featuresRepository()`, `pricingRepository()`, `getEnterprise()`, `getAudience()`,
`getFaq()`, `stepsRepository()`, `statsRepository()`, `getMetadataFields()`,
`getCleanedFields()`. The `.env` confirms: *"Currently no env vars required (static
marketing site)."*

The only external network references are non-essential static assets loaded in
`<svelte:head>` / markup — Google Fonts, Font Awesome CDN, and one feature
illustration image on Google Cloud Storage. These can be ignored or optionally
`page.route(...)`-aborted to speed up runs; they are **not** application data and
need no mock payloads.

## Per-Page Test Plans

### `/` (Home)
- **Assert title:** `MetaCleaner — Protect Your Privacy`.
- **Assert sections present** (by id): `#hero`, `#why-it-matters`, `#how-it-works`,
  `#who-its-for`, `#faq`.
- **Hero content:** headline text `Protect Your Privacy` / `Remove Metadata`, badge
  `100% local processing`.
- **Upload card** (static, no real upload): heading `Clean Files`, format badges
  `JPG`/`PNG`/`HEIC`/`WEBP`, local-only note. (No file input — it is a marketing
  mock, do not attempt an upload flow.)
- **Audience cards:** 6 cards (Journalists & Activists, Photographers & Creators,
  Businesses & Lawyers, Regular Users, Researchers & Academics, IT & Security Teams).
- **Interactive — FAQ accordion** (`FaqAccordionItem`): answer is rendered only when
  open (`{#if open}`). Click a question button → assert its answer becomes visible;
  click again → answer hidden. 8 FAQ items.

### `/features`
- **Assert title:** `MetaCleaner — Features`.
- **Header section** `#features-header`: eyebrow `Features`, title
  `Complete toolkit` / `for privacy protection`.
- **Showcase:** 6 feature rows, one `<section>` each:
  `#feature-exif`, `#feature-ai`, `#feature-c2pa`, `#feature-risk`,
  `#feature-batch`, `#feature-pdf`. Assert all 6 exist and each renders its title
  (e.g. `EXIF Metadata Removal`, `AI Tool Detection`, `C2PA Removal`,
  `Risk Scanner`, `Batch Processing`, `PDF Report`).
- **CTA section** `#cta-section`: title `Get started for free`.

### `/pricing`
- **Assert title:** `MetaCleaner — Pricing`.
- **Header:** title `Pricing`, subtitle `Simple pricing. Credits never expire.`
- **Interactive — BillingToggle** (`monthly` / `yearly`):
  - Default state is **monthly**; `Monthly` button is active.
  - The Pro plan price differs by billing: monthly `€5,99`, yearly `€57,51`
    (with original `€71,88` and save `€14,37`). Click **Yearly** → assert the Pro
    price updates to the yearly figure; click **Monthly** → reverts.
  - Yearly button shows a `−20%` badge.
- **Plans:** 4 cards — `Free` (`€0`), `50 photos` (`€4`), `Pro` (featured,
  `Most Popular` badge), `Pro+` (`Coming soon`, disabled CTA).
- **Enterprise banner:** title `Enterprise — custom`, CTA `Contact us →`.

## Navigation Test Plan

Source: `SiteNavbar.svelte` (desktop), `MobileNavbar.svelte` + `MobileMenu.svelte`
(mobile), `SiteFooter.svelte` (footer).

### Desktop navbar (visible ≥ `md` / 768px; `hidden md:flex`)
| Element | href | Expected |
|---|---|---|
| Brand logo | `/` | home |
| `How it Works` | `/#how-it-works` | home, scroll to `#how-it-works` |
| `Features` | `/features` | features page |
| `Pricing` | `/pricing` | pricing page |
| `FAQ` | `/#faq` | home, scroll to `#faq` |
| `Log In` | `#` | no-op (placeholder) |
| Language switcher | — | dropdown toggles (EN/CS) |

Active-state: navbar marks the current page (`active` prop derived from pathname in
`+layout.svelte`).

### Footer links (desktop layout `hidden md:block`)
- **Product:** `Features` → `/features`, `How it works` → `/#how-it-works`,
  `Pricing` → `/pricing`.
- **Company:** `About us` → `#`, `FAQ` → `/#faq`, `Contact` → `#`.
- **Legal:** `Privacy Policy`/`Terms of Service`/`Cookies` → `#` (placeholders).
- Verify the **real** links (`/features`, `/pricing`, `/#how-it-works`, `/#faq`)
  navigate correctly; `#` links are placeholders (assert presence only).

### Mobile menu (`md:hidden`)
`MobileNavbar` shows a hamburger button (`aria-label` toggles `Open menu` /
`Close menu`). Clicking it toggles `MobileMenu`, whose **variant depends on the
active page** (see `+layout.svelte`):
- **Home → `drawer`** variant: slide-in panel with anchor links `#how-it-works`,
  `#why-it-matters`, `#who-its-for`, `#faq`, plus `Log In` / `Register`. Has a
  backdrop and a close (✕) button (`aria-label` = `Close menu`).
- **Features / Pricing → `dropdown`** variant: inline panel with `/features`,
  `/pricing`, `/#how-it-works`, `/#faq`, `Log In`.
- Menu auto-closes on navigation (`$effect` resets `mobileMenuOpen` on path change)
  and each link has an `onClose` handler.

## Responsive Test Plan

Minimum viewports: **mobile 375px** and **desktop 1280px**.
Key breakpoint is Tailwind `md` = **768px** (desktop nav vs. mobile nav).

| Viewport | Expect visible | Expect hidden |
|---|---|---|
| **375px (mobile)** | `MobileNavbar` (hamburger, `md:hidden`), mobile footer layout (`md:hidden`) | desktop `<nav>` (`hidden md:flex`), desktop footer (`hidden md:block`) |
| **1280px (desktop)** | desktop `<nav>` (`hidden md:flex`), desktop footer grid | `MobileNavbar`, mobile menu |

Apply per-page where layout shifts:
- Home: hero/upload card stack on mobile vs. side-by-side on desktop; mobile vs.
  desktop drop hints (`md:hidden` / `hidden md:inline` text variants exist).
- Pricing: enterprise banner has separate mobile (`size="mobile"`) and desktop
  renders.

## Playwright Conventions for This Codebase

(From prior experience writing E2E tests for the sibling app — apply here too.)
- **Strict mode:** `getByText('X')` throws if it matches multiple nodes. Many
  components render **both** a mobile and a desktop variant in the DOM (one hidden
  via Tailwind). Use `{ exact: true }`, `.first()`/`.last()`, or scope to a visible
  container (`page.locator('nav.hidden.md\\:flex')` for desktop nav,
  `page.locator('nav.md\\:hidden')` for mobile nav).
- **DOM order:** mobile markup frequently appears **before** desktop markup but is
  hidden — prefer `locator(...).filter({ visible: true })` or container scoping over
  bare `.first()`.
- Prefer role/label selectors where possible: hamburger via
  `getByRole('button', { name: 'Open menu' })`, FAQ items via the question text on a
  `button`.
- Use the section **ids** (`#hero`, `#feature-exif`, …) for stable section asserts.
- Set locale deterministically (e.g. via `localStorage`/cookie or by asserting on
  base-locale `en` strings) so text assertions are stable.
