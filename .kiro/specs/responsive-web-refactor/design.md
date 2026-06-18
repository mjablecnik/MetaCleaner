# Technical Design Document

## Overview

This document describes the technical approach for refactoring the `frontend/metacleaner-web/` SvelteKit marketing site from duplicated mobile/desktop component trees into a single responsive codebase using Tailwind CSS breakpoint utilities.

## Architecture

### Post-Refactor Project Structure

```
frontend/metacleaner-web/
├── src/
│   ├── lib/
│   │   ├── assets/
│   │   │   ├── favicon.svg
│   │   │   └── flags/              # NEW: SVG flag icons
│   │   │       ├── gb.svg
│   │   │       └── cz.svg
│   │   ├── components/
│   │   │   ├── elements/           # Low-level UI primitives (unchanged)
│   │   │   │   ├── BrandLogo.svelte
│   │   │   │   ├── CtaButton.svelte
│   │   │   │   ├── CheckBullet.svelte
│   │   │   │   ├── FormatBadge.svelte
│   │   │   │   ├── GradientText.svelte
│   │   │   │   ├── IconBadge.svelte
│   │   │   │   ├── NavLink.svelte
│   │   │   │   ├── SectionHeading.svelte
│   │   │   │   ├── SocialIconLink.svelte
│   │   │   │   └── *.stories.svelte
│   │   │   ├── shared/             # Mid-level shared components
│   │   │   │   ├── SiteNavbar.svelte
│   │   │   │   ├── MobileNavbar.svelte
│   │   │   │   ├── MobileMenu.svelte
│   │   │   │   └── LanguageSwitcher.svelte  # MOVED from components/
│   │   │   └── *.stories.svelte
│   │   ├── shared/
│   │   │   └── sections/           # NEW: Shared page sections
│   │   │       └── SiteFooter.svelte
│   │   ├── repositories/           # Data layer (unchanged structure)
│   │   │   ├── index.ts
│   │   │   ├── faq.ts             # MODIFIED: unified, no layout param
│   │   │   ├── features.ts
│   │   │   ├── pricing.ts
│   │   │   ├── audience.ts
│   │   │   ├── steps.ts
│   │   │   ├── stats.ts
│   │   │   └── metadataDemo.ts
│   │   ├── paraglide/              # Generated i18n (unchanged)
│   │   ├── i18n.ts
│   │   └── index.ts
│   ├── routes/
│   │   ├── +layout.svelte          # MODIFIED: nav + footer rendered here
│   │   ├── +layout.ts              # MODIFIED: ssr=false, prerender=false
│   │   ├── layout.css              # MODIFIED: trimmed to theme + globals only
│   │   ├── (home)/
│   │   │   ├── +page.svelte        # SIMPLIFIED: no nav state, no footer
│   │   │   ├── components/         # Route-specific sub-components
│   │   │   │   ├── UploadCard.svelte        # MODIFIED: no size prop
│   │   │   │   ├── MetadataComparisonCard.svelte
│   │   │   │   ├── RiskStatCard.svelte
│   │   │   │   ├── StepCard.svelte
│   │   │   │   ├── AudienceCard.svelte
│   │   │   │   └── FaqAccordionItem.svelte
│   │   │   └── sections/           # MODIFIED: single responsive sections
│   │   │       ├── HeroSection.svelte
│   │   │       ├── WhyItMattersSection.svelte
│   │   │       ├── HowItWorksSection.svelte
│   │   │       ├── AudienceSection.svelte
│   │   │       └── FaqSection.svelte
│   │   ├── features/
│   │   │   ├── +page.svelte        # SIMPLIFIED: no nav state, no footer
│   │   │   ├── components/
│   │   │   └── sections/
│   │   └── pricing/
│   │       ├── +page.svelte        # SIMPLIFIED: no nav, no footer, single <main>
│   │       ├── components/
│   │       └── sections/
│   ├── messages/
│   │   ├── en.json                 # MODIFIED: orphaned keys removed
│   │   └── cs.json                 # MODIFIED: orphaned keys removed
│   ├── app.html
│   ├── app.d.ts
│   ├── hooks.server.ts
│   └── hooks.ts
├── package.json                     # MODIFIED: storybook deps removed, adapter-static added
├── vite.config.ts
├── tsconfig.json
├── eslint.config.js                 # MODIFIED: storybook plugin removed
├── .prettierrc
├── playwright.config.ts
└── README.md                        # REWRITTEN
```

### Deleted Files/Directories

```
REMOVED: src/stories/                    (Storybook boilerplate)
REMOVED: src/lib/vitest-examples/        (greet example)
REMOVED: src/routes/demo/                (demo route)
REMOVED: .storybook/                     (Storybook config)
REMOVED: CLAUDE.md                       (internal AI config)
REMOVED: src/routes/(home)/sections/HomeFooter.svelte
REMOVED: src/routes/features/sections/FeaturesFooter.svelte
REMOVED: src/routes/pricing/sections/PricingFooter.svelte
```

## Component Design

### 1. Root Layout (`+layout.svelte`)

Owns navigation state, renders nav + footer, derives active page from route.

```svelte
<script lang="ts">
  import './layout.css';
  import { page } from '$app/stores';
  import SiteNavbar from '$lib/components/shared/SiteNavbar.svelte';
  import MobileNavbar from '$lib/components/shared/MobileNavbar.svelte';
  import MobileMenu from '$lib/components/shared/MobileMenu.svelte';
  import SiteFooter from '$lib/shared/sections/SiteFooter.svelte';

  let { children } = $props();
  let mobileMenuOpen = $state(false);

  const activePage = $derived.by(() => {
    const path = $page.url.pathname;
    if (path.startsWith('/features')) return 'features';
    if (path.startsWith('/pricing')) return 'pricing';
    return 'home';
  });

  // Close menu on navigation
  $effect(() => {
    $page.url.pathname;
    mobileMenuOpen = false;
  });
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" crossorigin="anonymous" />
</svelte:head>

<MobileMenu active={activePage} open={mobileMenuOpen} onClose={() => mobileMenuOpen = false} />

<div class="flex flex-col items-center w-full min-h-screen">
  <SiteNavbar active={activePage} />
  <MobileNavbar open={mobileMenuOpen} onToggle={() => mobileMenuOpen = !mobileMenuOpen} />

  <main class="flex-1 w-full">
    {@render children()}
  </main>

  <SiteFooter />
</div>
```

### 2. Responsive Section Pattern (HeroSection Example)

Before: Two `<section>` elements (desktop hidden on mobile, mobile hidden on desktop).

After: Single `<section>` with Tailwind breakpoints.

```svelte
<script lang="ts">
  import * as m from '$lib/paraglide/messages';
  import GradientText from '$lib/components/elements/GradientText.svelte';
  import CtaButton from '$lib/components/elements/CtaButton.svelte';
  import UploadCard from '../components/UploadCard.svelte';
</script>

<section id="hero" class="w-full max-w-site mx-auto px-4 md:px-6 pt-8 md:pt-12 pb-8 flex flex-col lg:flex-row gap-6 lg:gap-12 items-center">
  <div class="w-full lg:w-[55%] flex flex-col gap-4 md:gap-6">
    <!-- Badge: mobile only -->
    <div class="md:hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 w-fit">
      <i class="fa-solid fa-lock text-brand-blue text-xs"></i>
      <span class="text-xs font-semibold text-brand-blue">{m.home_hero_badge()}</span>
    </div>

    <h1 class="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight md:leading-[1.1] tracking-tight">
      <span>{m.home_hero_title_line1()}</span><br />
      <GradientText>{m.home_hero_title_line2()}</GradientText>
    </h1>

    <p class="text-sm md:text-lg text-text-muted leading-relaxed max-w-xl">
      {m.home_hero_subtitle()}
    </p>

    <div class="flex flex-col sm:flex-row gap-3 md:gap-4 mt-2 md:mt-4">
      <CtaButton variant="primary" icon="fa-solid fa-cloud-arrow-up" label={m.cta_try_free()} href="#" fullWidth class="sm:w-auto" />
      <CtaButton variant="secondary" icon="fa-brands fa-apple" label={m.cta_download_app()} href="#" fullWidth class="sm:w-auto" />
    </div>
  </div>

  <div class="w-full lg:w-[45%] h-auto md:h-[400px]">
    <UploadCard />
  </div>
</section>
```

### 3. UploadCard (Responsive, No Props)

Before: `size` prop with 20+ `$derived()` variables switching CSS classes.

After: Single markup tree, Tailwind breakpoints.

```svelte
<script lang="ts">
  import * as m from '$lib/paraglide/messages';
  import FormatBadge from '$lib/components/elements/FormatBadge.svelte';

  const formats = ['JPG', 'PNG', 'HEIC', 'WEBP'];
</script>

<div class="w-full md:h-full rounded-2xl bg-navy-card border border-border p-5 md:p-6 flex flex-col shadow-card relative overflow-hidden">
  <div class="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/3 md:h-1/2 bg-brand-blue/10 blur-glow-sm md:blur-glow rounded-full pointer-events-none"></div>

  <div class="flex justify-between items-center mb-4 md:mb-6 z-10">
    <h3 class="font-semibold text-sm md:text-lg">{m.home_upload_title()}</h3>
    <div class="flex gap-1 md:gap-2">
      {#each formats as label (label)}
        <FormatBadge {label} />
      {/each}
    </div>
  </div>

  <div class="py-8 md:flex-1 rounded-xl bg-navy-main/50 dashed-border-anim flex flex-col items-center justify-center gap-3 md:gap-4 cursor-pointer z-10 md:hover:bg-navy-main/80 md:transition-colors">
    <div class="w-14 h-14 md:w-16 md:h-16 text-xl md:text-2xl rounded-full bg-navy-lighter flex items-center justify-center text-brand-blue shadow-glow-blue">
      <i class="fa-solid fa-file-arrow-up"></i>
    </div>
    <div class="text-center px-4 md:px-0">
      <p class="font-semibold text-white text-sm md:text-base mb-1">
        <span class="md:hidden">{m.home_upload_drop_mobile()}</span>
        <span class="hidden md:inline">{m.home_upload_drop()}</span>
      </p>
      <p class="text-xs text-text-muted">
        <span class="md:hidden">{m.home_upload_hint_mobile()}</span>
        <span class="hidden md:inline">{m.home_upload_hint()}</span>
      </p>
    </div>
    <p class="text-badge text-text-muted md:mt-2">
      <i class="fa-solid fa-lock mr-1"></i>{m.home_upload_local_note()}
    </p>
  </div>
</div>
```

### 4. MobileMenu (Tailwind Transitions)

Before: Custom CSS classes (`.slide-menu`, `.menu-overlay`, `.mobile-menu`) in `layout.css`.

After: Tailwind utilities with conditional class toggling.

```svelte
<!-- Overlay -->
{#if open}
  <div
    class="fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
    onclick={onClose}
    role="button"
    tabindex="-1"
    onkeydown={(e) => e.key === 'Escape' && onClose()}
  ></div>
{/if}

<!-- Drawer panel -->
<div class="fixed top-0 right-0 h-full w-full z-40 bg-navy-card border-l border-border flex flex-col shadow-2xl md:hidden transition-transform duration-300 {open ? 'translate-x-0' : 'translate-x-full'}">
  <!-- ... drawer content ... -->
</div>
```

### 5. LanguageSwitcher (SVG Flags + Tailwind Dropdown)

Before: Emoji flags + custom CSS classes from `layout.css`.

After: SVG imports + Tailwind positioning.

```svelte
<script lang="ts">
  import flagGb from '$lib/assets/flags/gb.svg';
  import flagCz from '$lib/assets/flags/cz.svg';

  const localeMap = {
    en: { flag: flagGb, label: 'EN', name: 'English' },
    cs: { flag: flagCz, label: 'CS', name: 'Čeština' }
  };
</script>

<!-- Desktop trigger -->
<div class="relative inline-block" bind:this={wrapperEl}>
  <button onclick={toggleDropdown} class="flex items-center gap-2 px-3 py-2 rounded-lg bg-navy-lighter border border-gray-700 text-sm font-semibold text-white hover:bg-gray-800 transition-colors cursor-pointer">
    <img src={localeMap[currentLocale].flag} alt="" class="w-5 h-4 rounded-sm object-cover" />
    <span>{localeMap[currentLocale].label}</span>
    <i class="fa-solid fa-chevron-down text-text-muted text-xs ml-1 transition-transform duration-200 {dropdownOpen ? 'rotate-180' : ''}"></i>
  </button>

  <!-- Dropdown menu -->
  <div class="absolute right-0 top-full mt-2 bg-navy-card border border-border-strong rounded-xl min-w-[160px] z-[200] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.5)] {dropdownOpen ? 'block' : 'hidden'}">
    {#each locales as locale (locale)}
      <button onclick={() => chooseLocale(locale)} class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium hover:bg-navy-lighter transition-colors cursor-pointer {currentLocale === locale ? 'text-white bg-navy-lighter' : 'text-text-muted'}">
        <img src={localeMap[locale].flag} alt="" class="w-5 h-4 rounded-sm object-cover" />
        <span class="flex-1 text-left">{localeMap[locale].name}</span>
        <i class="fa-solid fa-check text-brand-blue text-xs {currentLocale === locale ? '' : 'hidden'}"></i>
      </button>
    {/each}
  </div>
</div>
```

### 6. SiteFooter (Shared, Responsive)

Single component rendering the same footer on all pages.

```svelte
<script lang="ts">
  import * as m from '$lib/paraglide/messages';
  import BrandLogo from '$lib/components/elements/BrandLogo.svelte';
  import SocialIconLink from '$lib/components/elements/SocialIconLink.svelte';
</script>

<footer class="w-full bg-navy-card border-t border-border mt-auto">
  <!-- Desktop: 4-column grid -->
  <div class="max-w-site mx-auto px-4 md:px-6 py-8 md:py-16">
    <div class="hidden md:grid grid-cols-4 gap-10 mb-12">
      <!-- Brand column -->
      <!-- Product links -->
      <!-- Company links -->
      <!-- Legal links -->
    </div>

    <!-- Mobile: centered compact layout -->
    <div class="md:hidden flex flex-col items-center gap-6">
      <BrandLogo size="md" />
      <p class="text-xs text-text-muted text-center max-w-xs">{m.footer_tagline()}</p>
      <!-- Compact links row -->
    </div>

    <!-- Bottom bar (both) -->
    <div class="border-t border-border pt-6 md:pt-8 mt-6 md:mt-0">
      <p class="text-xs text-text-muted text-center">{m.footer_copyright()}</p>
    </div>
  </div>
</footer>
```

### 7. layout.css (Final State)

```css
@import 'tailwindcss';
@plugin '@tailwindcss/forms';
@plugin '@tailwindcss/typography';

@theme {
  --color-navy-main: #0a1628;
  --color-navy-card: #111d33;
  --color-navy-lighter: #1e293b;
  --color-brand-green: #22c55e;
  --color-brand-orange: #f97316;
  --color-brand-red: #ef4444;
  --color-brand-blue: #3b82f6;
  --color-text-main: #ffffff;
  --color-text-muted: #94a3b8;
  --color-border: #1f2937;
  --color-border-strong: #374151;
  --color-watermark: #1f2937;
  --font-family-sans: 'Inter', sans-serif;
  --shadow-glow-green: 0 0 20px rgba(34, 197, 94, 0.2);
  --shadow-glow-blue: 0 0 20px rgba(59, 130, 246, 0.2);
  --shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
  --max-width-site: 1100px;
  --blur-glow: 50px;
  --blur-glow-sm: 40px;
  --text-badge: 10px;
  --text-badge-xs: 9px;
}

/* Base reset */
body {
  margin: 0;
  padding: 0;
  background-color: var(--color-navy-main);
  color: var(--color-text-main);
  font-family: var(--font-family-sans);
}

/* Cursor: pointer for all interactive elements */
button,
[role='button'] {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
}

/* Custom scrollbar — desktop */
@media (min-width: 768px) {
  ::-webkit-scrollbar {
    width: 10px;
  }

  ::-webkit-scrollbar-track {
    background: var(--color-navy-card);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--color-navy-lighter);
    border-radius: 5px;
    border: 2px solid var(--color-navy-card);
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--color-brand-blue);
  }
}

/* Firefox scrollbar */
@media (min-width: 768px) {
  html {
    scrollbar-color: var(--color-navy-lighter) var(--color-navy-card);
    scrollbar-width: thin;
  }
}

/* Mobile: hide scrollbar */
@media (max-width: 767px) {
  ::-webkit-scrollbar {
    display: none;
  }
}
```

### 8. Static Adapter Configuration

**vite.config.ts** change:

```typescript
import adapter from '@sveltejs/adapter-static';

// In sveltekit() plugin config:
adapter: adapter({
  pages: 'build',
  assets: 'build',
  fallback: 'index.html',
  strict: false
})
```

**+layout.ts** (root):

```typescript
export const ssr = false;
export const prerender = false;
```

### 9. FAQ Repository (Unified)

```typescript
export interface FaqItem {
  id: string;
  questionKey: string;
  answerKey: string;
}

export function getFaq(): FaqItem[] {
  return [
    { id: '1', questionKey: 'faq_q1', answerKey: 'faq_a1' },
    { id: '2', questionKey: 'faq_q2', answerKey: 'faq_a2' },
    { id: '3', questionKey: 'faq_q3', answerKey: 'faq_a3' },
    { id: '4', questionKey: 'faq_q4', answerKey: 'faq_a4' },
    { id: '5', questionKey: 'faq_q5', answerKey: 'faq_a5' },
  ];
}
```

Unified i18n keys (merging desktop's detailed answers with mobile's shorter questions where appropriate — keep the more informative version).

### 10. SVG Flag Assets

Minimal inline SVG files at `src/lib/assets/flags/`:

- `gb.svg` — British flag (Union Jack), optimized to ~500B
- `cz.svg` — Czech flag (two horizontal stripes + blue triangle), optimized to ~300B

Imported as Vite static assets via standard `import flagGb from '$lib/assets/flags/gb.svg'` — resolves to URL string for use in `<img src={...}>`.

## Components and Interfaces

### Component Interfaces

#### SiteNavbar
```typescript
interface Props {
  active?: 'home' | 'features' | 'pricing' | 'faq';
}
```

#### MobileNavbar
```typescript
interface Props {
  open: boolean;
  onToggle: () => void;
}
```

#### MobileMenu
```typescript
interface Props {
  active?: 'home' | 'features' | 'pricing' | 'faq';
  open: boolean;
  onClose: () => void;
}
```

#### LanguageSwitcher
```typescript
interface Props {
  variant?: 'desktop' | 'mobile';
}
// Internal state: dropdownOpen, currentLocale
// Uses SVG flag imports from $lib/assets/flags/
```

#### SiteFooter
```typescript
// No props — renders same content on all pages
// Uses i18n messages for all text
```

#### UploadCard
```typescript
// No props — fully responsive via Tailwind breakpoints
// Previously had: size?: 'desktop' | 'mobile' (REMOVED)
```

#### CtaButton
```typescript
interface Props {
  variant?: 'primary' | 'secondary' | 'blue' | 'outline';
  size?: 'md' | 'sm';
  icon?: string;
  label: string;
  href?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  class?: string;
  onclick?: () => void;
}
```

#### SectionHeading
```typescript
interface Props {
  eyebrow: string;
  eyebrowColor?: string;
  title: string;
  subtitle?: string;
}
// Previously had: size?: 'sm' | 'md' (REMOVED — responsive via Tailwind)
```

### Repository Interfaces

```typescript
// faq.ts
export interface FaqItem {
  id: string;
  questionKey: string;
  answerKey: string;
}
export function getFaq(): FaqItem[];  // No layout parameter

// features.ts
export interface Feature { id: string; number: number; icon: string; color: string; layout: 'ltr' | 'rtl'; titleText: string; descKey: string; bullets?: string[]; formats?: FormatItem[]; image?: FeatureImage; }
export function featuresRepository(): Feature[];

// pricing.ts
export interface Plan { id: string; nameKey: string | null; nameText: string | null; priceMonthly: string; priceYearly: string; originalYearly: string | null; saveAmountYearly: string | null; subtitleKey: string; perKey: string | null; featureKeys: string[]; ctaKey: string; featured: boolean; disabled: boolean; }
export function pricingRepository(): Plan[];
export function getEnterprise(): EnterprisePlan;
export function getPlanPrice(plan: Plan, yearly: boolean): string;

// i18n.ts
export function t(key: string): string;
```

## Data Models

### Design Tokens (layout.css @theme)

| Token | Value | Usage |
|---|---|---|
| `--color-navy-main` | `#0a1628` | Page background |
| `--color-navy-card` | `#111d33` | Card backgrounds, scrollbar track |
| `--color-navy-lighter` | `#1e293b` | Input fields, lighter surfaces, scrollbar thumb |
| `--color-brand-green` | `#22c55e` | Success, CTA buttons |
| `--color-brand-blue` | `#3b82f6` | Primary actions, links, scrollbar hover |
| `--color-brand-orange` | `#f97316` | Warnings |
| `--color-brand-red` | `#ef4444` | Errors, danger |
| `--color-text-main` | `#ffffff` | Primary text |
| `--color-text-muted` | `#94a3b8` | Secondary text |
| `--color-border` | `#1f2937` | Default borders |
| `--color-border-strong` | `#374151` | Stronger borders |
| `--font-family-sans` | `'Inter', sans-serif` | All text |
| `--max-width-site` | `1100px` | Content max-width |
| `--shadow-glow-green` | green glow | CTA glow |
| `--shadow-glow-blue` | blue glow | Accent glow |
| `--shadow-card` | dark shadow | Card elevation |

### Locale Data Model

```typescript
interface LocaleEntry {
  flag: string;  // SVG import path (resolves to URL)
  label: string; // Short code: 'EN', 'CS'
  name: string;  // Full name: 'English', 'Čeština'
}

const localeMap: Record<string, LocaleEntry> = {
  en: { flag: flagGb, label: 'EN', name: 'English' },
  cs: { flag: flagCz, label: 'CS', name: 'Čeština' }
};
```

### Route → Active Page Mapping

```typescript
// Derived in +layout.svelte from $page.url.pathname
type ActivePage = 'home' | 'features' | 'pricing';

function deriveActivePage(pathname: string): ActivePage {
  if (pathname.startsWith('/features')) return 'features';
  if (pathname.startsWith('/pricing')) return 'pricing';
  return 'home';
}
```

## Dependency Changes

### Added

| Package | Purpose |
|---|---|
| `@sveltejs/adapter-static` | Static site generation |

### Removed

| Package | Reason |
|---|---|
| `@storybook/sveltekit` | Boilerplate removal |
| `@storybook/addon-svelte-csf` | Boilerplate removal |
| `@storybook/addon-vitest` | Boilerplate removal |
| `@storybook/addon-a11y` | Boilerplate removal |
| `@storybook/addon-docs` | Boilerplate removal |
| `@chromatic-com/storybook` | Boilerplate removal |
| `eslint-plugin-storybook` | Boilerplate removal |
| `storybook` | Boilerplate removal |
| `@sveltejs/adapter-auto` | Replaced by adapter-static |

## i18n Key Cleanup Strategy

After responsive unification:

1. Remove all `*_mobile` suffixed keys where the desktop version is used instead
2. Remove `home_faq_m*` keys (unified into single `faq_q*`/`faq_a*` keys)
3. Remove `home_faq_d*` keys (replaced by `faq_q*`/`faq_a*`)
4. Remove `footer_tagline_mobile`, `footer_tagline_features` (single `footer_tagline` used)
5. Remove `home_audience_*_title_mobile`, `home_audience_*_desc_mobile` (unified titles/descriptions)
6. Keep `home_upload_drop` vs `home_upload_drop_mobile` — these are genuinely different UX text (desktop says "Drop files here", mobile says "Tap to select") and toggle via `hidden md:inline` / `md:hidden`

## Migration Notes

- **No visual regressions**: Each section refactor should be screenshot-compared at 375px and 1280px before/after
- **Incremental approach**: Sections can be refactored one at a time. The layout change (nav/footer) should happen first since it touches all pages
- **Stories preserved**: Co-located `.stories.svelte` files remain functional for visual testing even without `@storybook/` runtime — they simply won't run until Storybook is re-added (if ever needed)

## Error Handling

- **Missing i18n key**: The `t()` helper logs a `console.warn` and returns the raw key string as fallback. No runtime crash.
- **SVG flag not found**: If an SVG import fails at build time, Vite will throw a build error (caught during `bun run build`). No runtime fallback needed since assets are statically resolved.
- **Route not matched**: The `deriveActivePage()` function defaults to `'home'` for unknown paths. No error state.
- **MobileMenu open on navigation**: The `$effect` in layout auto-closes the menu when `$page.url.pathname` changes. If navigation fails, the menu stays open (acceptable — user can close manually).

## Correctness Properties

### Property 1: Single-Section Invariant
After refactoring, no Section_Component shall render more than one `<section>` element in the DOM at any viewport width.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.10**

### Property 2: Navigation Singleton
Only `+layout.svelte` owns `mobileMenuOpen` state — grep for `mobileMenuOpen` should yield results only in `+layout.svelte`.

**Validates: Requirements 4.1, 4.2**

### Property 3: Footer Singleton
Only one `SiteFooter` component exists and is rendered from `+layout.svelte` — no route imports any footer component.

**Validates: Requirements 9.1, 9.2, 9.3**

### Property 4: i18n Completeness
Every key referenced in components exists in both `en.json` and `cs.json` — no orphaned keys remain in either file.

**Validates: Requirements 3.5, 3.6**

### Property 5: Build Integrity
`bun run build` exits with code 0 and produces a `build/` directory with `index.html` fallback.

**Validates: Requirements 1.9, 11.2, 11.3**

### Property 6: Zero Custom CSS Classes in layout.css
`layout.css` contains no class selectors (`.className {}`) except pseudo-element selectors for scrollbar styling.

**Validates: Requirements 5.1, 5.2**
