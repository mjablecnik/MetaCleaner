# MetaCleaner Web — Architecture & Conventions

## Project Overview

MetaCleaner Web is a marketing/landing page website for the MetaCleaner service. It is a static SPA built with SvelteKit 2 + Tailwind CSS 4, deployed as pre-rendered HTML/CSS/JS served by nginx. It presents the product features, pricing plans, and guides visitors toward the main app.

The project lives in `frontend/metacleaner-web/`.

## Tech Stack

- **Framework**: SvelteKit 2 with Svelte 5 (runes mode enforced)
- **Language**: TypeScript (strict mode)
- **Package Manager**: bun
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS 4 (utility-first, dark navy theme) + `@tailwindcss/forms` + `@tailwindcss/typography`
- **i18n**: Paraglide JS (en base locale, cs secondary) — strategy: localStorage → cookie → preferredLanguage → baseLocale
- **Testing**: Vitest (server + browser projects) + Playwright E2E
- **Build Output**: Static site via `@sveltejs/adapter-static` (SPA fallback `index.html`)
- **Serving**: nginx (Docker) or any static host
- **Deployment**: Fly.io (`metacleaner-web` app, region `fra`)
- **Fonts**: Inter (Google Fonts), Font Awesome 6 (CDN)

## Project Structure

```
frontend/metacleaner-web/
├── src/
│   ├── lib/
│   │   ├── assets/
│   │   │   └── flags/              # SVG flag icons (gb.svg, cz.svg) for LanguageSwitcher
│   │   │   └── favicon.svg
│   │   ├── components/
│   │   │   ├── elements/           # Low-level UI primitives (BrandLogo, CtaButton, NavLink, etc.)
│   │   │   ├── shared/             # Shared navigation (SiteNavbar, MobileNavbar, MobileMenu)
│   │   │   ├── LanguageSwitcher.svelte
│   │   │   └── LanguageSwitcher.stories.svelte
│   │   ├── repositories/           # Data factories returning typed arrays (faq, audience, features, pricing, stats, steps, metadataDemo)
│   │   ├── shared/
│   │   │   └── sections/           # Shared layout sections (SiteFooter)
│   │   ├── i18n.ts                 # t() translation helper wrapping Paraglide messages
│   │   ├── index.ts                # Barrel export
│   │   └── paraglide/              # Auto-generated Paraglide runtime (do NOT edit)
│   ├── routes/
│   │   ├── (home)/                 # Home page
│   │   │   ├── sections/           # HeroSection, HowItWorksSection, WhyItMattersSection, AudienceSection, FaqSection
│   │   │   ├── components/         # AudienceCard, FaqAccordionItem, MetadataComparisonCard, StepCard, UploadCard, etc.
│   │   │   └── +page.svelte
│   │   ├── features/               # Features page
│   │   │   ├── sections/           # FeaturesHeaderSection, FeaturesShowcaseSection, FeaturesCtaSection
│   │   │   ├── components/         # FeatureCard, FeatureRow, FormatPill, C2paIllustration, ExifIllustration
│   │   │   └── +page.svelte
│   │   ├── pricing/                # Pricing page
│   │   │   ├── sections/           # PricingHeaderSection, PricingPlansSection
│   │   │   ├── components/         # PricingCard, BillingToggle, EnterpriseBanner
│   │   │   └── +page.svelte
│   │   ├── +layout.svelte          # Global layout (SiteNavbar, MobileNavbar, MobileMenu, SiteFooter)
│   │   ├── +layout.ts              # ssr=false, prerender=false (pure SPA)
│   │   └── layout.css              # Tailwind @theme tokens + base styles
│   ├── app.html                    # HTML shell
│   ├── app.d.ts                    # SvelteKit type declarations
│   ├── hooks.server.ts             # Server hooks
│   └── hooks.ts                    # Client hooks
├── messages/
│   ├── en.json                     # English translations (base locale)
│   └── cs.json                     # Czech translations
├── static/
│   └── robots.txt
├── .design/                        # HTML design mockups (reference only, not deployed)
│   ├── home-desktop.html / home-mobile.html
│   ├── features-desktop.html / features-mobile.html
│   ├── pricing-desktop.html / pricing-mobile.html
│   └── menu-mobile.html
├── project.inlang/settings.json    # Paraglide config (locales: en, cs)
├── Dockerfile                      # Multi-stage: bun build → nginx:alpine
├── nginx.conf                      # SPA fallback, asset caching, security headers
├── fly.toml                        # Fly.io config (app: metacleaner-web, port 8080)
├── fly-setup.sh                    # Idempotent Fly.io setup script
├── start-docker.sh                 # Local Docker build + run
├── package.json
├── tsconfig.json
├── vite.config.ts
├── eslint.config.js
├── playwright.config.ts
├── .env / .env.example
└── README.md
```

## Component Hierarchy

The project uses a 3-tier component structure (same pattern as metacleaner-app):

1. **Elements** (`src/lib/components/elements/`) — Low-level generic UI primitives: BrandLogo, CtaButton, NavLink, CheckBullet, FooterBottomBar, FooterBrand, FooterColumn, FormatBadge, GradientText, IconBadge, SectionHeading, SocialIconLink. No business logic.

2. **Shared Components** (`src/lib/components/shared/`) — Navigation components shared across all pages: SiteNavbar (desktop), MobileNavbar (mobile header), MobileMenu (mobile slide-in/dropdown menu).

3. **Sections** (`src/routes/[page]/sections/`) — Page-level composed sections that combine elements into meaningful blocks. Each route folder has its own `sections/` and `components/` subfolder.

### Naming Convention

- Component file: `PascalCase.svelte`
- Story file: `PascalCase.stories.svelte` (co-located with component)
- Repository file: `camelCase.ts`
- Route folders: lowercase with hyphens or `(groupName)` for route groups

## Svelte 5 Runes — Required Patterns

All components MUST use Svelte 5 runes. Never use legacy `$:`, `export let`, `on:event`, or `slot`.

```svelte
<script lang="ts">
  interface Props {
    label: string;
    class?: string;
    onclick?: (e: MouseEvent) => void;
  }

  const { label, class: extraClass = '', onclick }: Props = $props();

  let isOpen = $state(false);
  const displayLabel = $derived(`${label} (computed)`);
</script>
```

Use `{@render children?.()}` for content projection (not slots).

## Data Layer — Repositories

Page data is defined in repository files (`src/lib/repositories/`). These are pure factory functions that return typed arrays of content items (features, FAQ entries, pricing plans, etc.). Repositories use the `t()` helper for i18n.

Available repositories:
- `faq.ts` — FAQ questions and answers
- `audience.ts` — Target audience cards
- `features.ts` — Feature list items
- `pricing.ts` — Pricing plan definitions
- `stats.ts` — Statistics/numbers
- `steps.ts` — How-it-works steps
- `metadataDemo.ts` — Metadata comparison demo data

## i18n — Paraglide Pattern

Messages live in `messages/en.json` and `messages/cs.json`. The `t()` helper function is used:

```typescript
import { t } from '$lib/i18n';

// Usage in components
const title = t('home.hero.title');
```

The `t()` function wraps Paraglide's generated message functions. It logs a warning and returns the key as fallback if a message is missing.

- Base locale: English (`en`)
- Secondary locale: Czech (`cs`)
- Strategy: localStorage → cookie → preferredLanguage → baseLocale
- All user-facing text must go through i18n — never hardcode strings in templates

## Styling Conventions

### Theme Colors (defined in `layout.css` @theme)

| Token | Usage |
|---|---|
| `navy-main` | Page background (`#0a1628`) |
| `navy-card` | Card/surface backgrounds (`#111d33`) |
| `navy-lighter` | Inputs, lighter surfaces (`#1e293b`) |
| `brand-green` | Success, CTA buttons |
| `brand-blue` | Primary actions, links |
| `brand-orange` | Warnings, upgrades |
| `brand-red` | Errors, danger |
| `text-main` | Primary text (white) |
| `text-muted` | Secondary text (`#94a3b8`) |
| `border` / `border-strong` | Borders |
| `watermark` | Background watermark color |

### Custom Tokens

- `--max-width-site: 1100px` — max content width
- `--shadow-glow-green` / `--shadow-glow-blue` — glow effects
- `--shadow-card` — card elevation
- `--blur-glow` / `--blur-glow-sm` — blur backgrounds
- `--text-badge` / `--text-badge-xs` — badge font sizes

### Responsive Design

- Mobile-first approach
- Desktop navbar (SiteNavbar) hidden on mobile, MobileNavbar shown instead
- MobileMenu supports two variants: `drawer` (home page) and `dropdown` (features/pricing)
- Custom scrollbar styling on desktop (md+), hidden scrollbar on mobile

### Font & Icons

- Font: Inter (Google Fonts, `font-display: swap` via external link)
- Icons: Font Awesome 6 (`fa-solid fa-*`) loaded from CDN

## Route Structure

| Route | Purpose |
|---|---|
| `/` (home) | Landing page — Hero, How It Works, Why It Matters, Audience, FAQ |
| `/features` | Feature showcase page |
| `/pricing` | Pricing plans page |

All pages share the global layout with SiteNavbar (desktop), MobileNavbar (mobile), and SiteFooter.

## Layout Architecture

The root `+layout.svelte`:
- Loads Google Fonts and Font Awesome via `<svelte:head>`
- Renders MobileMenu (overlay/drawer)
- Wraps content in a flex column with SiteNavbar, MobileNavbar, page content, and SiteFooter
- Tracks active page from `$page.url.pathname` for navigation highlighting
- Auto-closes mobile menu on route change

The `+layout.ts` sets `ssr = false` and `prerender = false` — the entire site renders client-side as a pure SPA.

## Design Mockups

The `.design/` folder contains HTML reference mockups for each page in desktop and mobile variants. These are for visual reference during development and are NOT deployed.

## Testing Strategy

### Unit/Component Tests
- Server-side tests: `src/**/*.{test,spec}.ts` (Vitest, Node environment)
- Browser component tests: `src/**/*.svelte.{test,spec}.ts` (Vitest + Playwright browser provider)

### E2E Tests
- Playwright tests via `bun run test:e2e`

### Storybook
- Every component and section has a co-located `.stories.svelte` file for visual testing

## Build & Run Commands

```bash
bun install              # Install deps
bun run dev              # Dev server (localhost:5173)
bun run build            # Production build → build/ directory
bun run preview          # Preview production build locally
bun run check            # Type check (svelte-check)
bun run lint             # Prettier + ESLint check
bun run format           # Auto-format
bun run test:unit        # Vitest unit tests (watch mode)
bun run test             # All tests (unit + e2e)
bun run test:e2e         # Playwright E2E tests
./start-docker.sh        # Docker build + run locally (nginx on port 8080)
```

## Deployment

### Docker + Fly.io

The Dockerfile uses a multi-stage build:
1. **Build stage**: `oven/bun:1` — installs deps, builds static site
2. **Production stage**: `nginx:alpine` — serves `build/` directory

nginx config handles SPA fallback (`try_files $uri $uri/ /index.html`), long-term asset caching, and security headers.

Deploy:
```bash
./fly-setup.sh    # First time: creates app + sets secrets
fly deploy        # Deploy to Fly.io
```

## Environment Variables

Currently **none required** — this is a static marketing site. The `.env.example` documents any future additions. `fly.toml [env]` only sets `NODE_ENV=production`.

## Formatting & Linting

- **Prettier**: with `prettier-plugin-svelte` + `prettier-plugin-tailwindcss`
- **ESLint**: TypeScript ESLint + Svelte plugin
- **Type checking**: `bun run check` (svelte-check)

## Key Differences from metacleaner-app

| Aspect | metacleaner-web (this project) | metacleaner-app |
|---|---|---|
| Purpose | Marketing/landing page | Main application (file cleaning) |
| Auth | None | Supabase Auth (JWT) |
| Backend calls | None | Go backend via HTTP + WebSocket |
| Mobile | No | Capacitor (Android) |
| Complexity | Simple static site | Full SPA with business logic |
| Workspace link | Standalone | Part of bun workspace |
| Dependencies | Zero runtime deps | Many (exifr, mediainfo.js, etc.) |

## Known Patterns

- The `LanguageSwitcher` component uses SVG flags from `src/lib/assets/flags/`
- Navigation active state is derived from `$page.url.pathname`
- MobileMenu variant changes per page (`drawer` for home, `dropdown` for subpages)
- All page data comes from repository factory functions, not fetched from APIs
- Stories are co-located with their components (same directory, `.stories.svelte` suffix)
