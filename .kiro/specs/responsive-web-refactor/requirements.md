# Requirements Document

## Introduction

Refactor the `frontend/metacleaner-web/` SvelteKit marketing site to eliminate duplicated mobile/desktop HTML sections, consolidate navigation state management, clean up dead code and CSS, add meaningful test coverage, and produce proper documentation. The result is a maintainable, responsive codebase that uses Tailwind breakpoint utilities instead of separate mobile/desktop component trees.

## Glossary

- **Web_App**: The SvelteKit 2 marketing website at `frontend/metacleaner-web/`
- **Section_Component**: A Svelte component representing a full-width page section (e.g., HeroSection, WhyItMattersSection)
- **Layout**: The root `+layout.svelte` file that wraps all routes
- **Mobile_Menu**: The slide-out or dropdown navigation menu shown on viewports below the `md` breakpoint
- **Tailwind_Breakpoint**: A responsive prefix (`sm:`, `md:`, `lg:`, `xl:`) applied to Tailwind utility classes to vary styles by viewport width
- **Repository**: A TypeScript module in `src/lib/repositories/` that exports data arrays or factory functions for page content
- **Boilerplate**: Generated scaffold code (Storybook stories in `src/stories/`, vitest examples in `src/lib/vitest-examples/`) that serves no production purpose
- **Scoped_Style**: A `<style>` block inside a Svelte component that applies only to that component's markup
- **Adapter_Static**: The SvelteKit adapter that pre-renders all pages to static HTML for deployment without a Node.js server

## Requirements

### Requirement 1: Remove Dead Code and Boilerplate

**User Story:** As a developer, I want unused scaffold code removed, so that the project contains only production-relevant files and dependencies.

#### Acceptance Criteria

1. WHEN the production build is executed, THE Web_App SHALL NOT contain a `src/stories/` directory (default Storybook boilerplate stories)
2. WHEN the production build is executed, THE Web_App SHALL NOT contain a `src/lib/vitest-examples/` directory
3. WHEN the production build is executed, THE Web_App SHALL NOT contain a `src/routes/demo/` route directory
4. THE Web_App MAY contain a `CLAUDE.md` file in the project root — the monorepo convention mandates a per-package `CLAUDE.md` for each workspace package, and this takes precedence over the earlier requirement to omit it
5. THE Web_App `package.json` SHALL NOT list any devDependencies prefixed with `@storybook/`, nor `@chromatic-com/storybook`, nor `eslint-plugin-storybook`
6. THE Web_App `package.json` SHALL NOT contain `storybook` or `build-storybook` entries in the `scripts` object
7. THE Web_App SHALL NOT contain a `.storybook/` configuration directory
8. THE Web_App SHALL retain all project-specific `.stories.svelte` files co-located with their components (e.g., `CtaButton.stories.svelte`, `SiteNavbar.stories.svelte`) — only the default scaffold stories in `src/stories/` SHALL be removed
9. WHEN criteria 1 through 7 are satisfied, THE Web_App SHALL complete a production build (`bun run build`) with zero TypeScript errors and exit code 0

### Requirement 2: Unify Responsive Sections Using Tailwind Breakpoints

**User Story:** As a developer, I want each page section to use a single HTML block with Tailwind responsive utilities, so that layout duplication is eliminated and maintenance effort is halved.

#### Acceptance Criteria

1. THE Section_Component HeroSection SHALL render exactly one `<section>` element in the DOM that uses Tailwind_Breakpoint classes (at the `md:` breakpoint, 768px) to switch between mobile-stacked and desktop side-by-side layouts without a second hidden `<section>`
2. THE Section_Component WhyItMattersSection SHALL render exactly one `<section>` element in the DOM that uses Tailwind_Breakpoint classes (at the `md:` breakpoint, 768px) to adapt between mobile and desktop layouts without a second hidden `<section>`
3. THE Section_Component HowItWorksSection SHALL render exactly one `<section>` element in the DOM that uses Tailwind_Breakpoint classes (at the `md:` breakpoint, 768px) to adapt between mobile and desktop layouts without a second hidden `<section>`
4. THE Section_Component AudienceSection SHALL render exactly one `<section>` element in the DOM that uses Tailwind_Breakpoint classes (at the `md:` breakpoint, 768px) to adapt between mobile and desktop layouts without a second hidden `<section>`
5. THE Section_Component FaqSection SHALL render exactly one `<section>` element in the DOM that uses Tailwind_Breakpoint classes (at the `md:` breakpoint, 768px) to adapt between mobile and desktop layouts without a second hidden `<section>`
6. THE Web_App pricing page `<main>` element SHALL contain a single set of content blocks using Tailwind_Breakpoint classes instead of duplicating desktop and mobile `<main>` blocks
7. THE Web_App features page SHALL contain a single set of content blocks using Tailwind_Breakpoint classes for layout differences instead of duplicating content blocks
8. WHEN a Section_Component is refactored, THE Web_App SHALL preserve layout-identical visual appearance at viewport widths 375px (mobile) and 1280px (desktop), verified by comparing screenshots before and after refactoring with no differences in element positioning, sizing, or visibility
9. THE UploadCard component SHALL remove the `size` prop and use a single markup tree where spacing, font sizes, and container dimensions adapt via Tailwind_Breakpoint classes (at the `md:` breakpoint, 768px) instead of conditionally switching class sets based on the prop value
10. WHEN a refactored Section_Component is inspected in the browser DOM at any viewport width, THE component SHALL contain no sibling elements that are toggled between `hidden` and visible using breakpoint classes to duplicate the same content for different viewports

### Requirement 3: Unify FAQ and Metadata Repository Data

**User Story:** As a developer, I want repositories to return a single unified dataset regardless of viewport, so that content is not artificially split by layout and unused i18n keys are cleaned up.

#### Acceptance Criteria

1. THE Repository `faq.ts` SHALL export a single `getFaq()` function with no parameters that returns a `FaqItem[]` containing all FAQ items as a unified list
2. WHEN FAQ items are displayed, THE FaqSection SHALL render a single list of all FAQ items visible on every viewport width without conditionally hiding items based on breakpoint
3. THE Repository `faq.ts` SHALL NOT maintain separate mobile-specific and desktop-specific question sets or accept a `layout` parameter
4. WHEN the `getFaq()` function is called, THE Repository SHALL return all FAQ items from both the former mobile and desktop sets combined into one array without duplicates
5. THE `messages/en.json` and `messages/cs.json` SHALL NOT contain orphaned i18n keys that were used only by the former mobile-specific or desktop-specific duplicated content (e.g., `home_faq_m*` keys if unified into single keys, `footer_tagline_mobile`, `footer_tagline_features`, `*_mobile` suffixed keys for content that is now unified)
6. WHEN the responsive unification and footer consolidation are complete, THE Web_App SHALL remove all i18n keys that are no longer referenced by any component

### Requirement 4: Centralize Navigation State in Layout

**User Story:** As a developer, I want mobile menu open/close state managed in the root layout, so that individual pages do not duplicate navigation logic.

#### Acceptance Criteria

1. THE Layout SHALL own the `mobileMenuOpen` state and provide `toggleMobileMenu` and `closeMobileMenu` callbacks as props to the MobileNavbar and MobileMenu child components
2. WHEN a page is rendered, THE page component SHALL NOT declare its own `mobileMenuOpen` state variable, nor import SiteNavbar, MobileNavbar, or MobileMenu components
3. THE Layout SHALL render SiteNavbar, MobileNavbar, and MobileMenu components and SHALL derive the active page identifier and MobileMenu variant from the current route path
4. WHEN the MobileNavbar toggle is activated, THE Layout SHALL set `mobileMenuOpen` to true and render the MobileMenu overlay with a visible backdrop
5. WHEN the route path changes while `mobileMenuOpen` is true, THE Layout SHALL set `mobileMenuOpen` to false and hide the MobileMenu overlay

### Requirement 5: Prefer Tailwind, Allow Scoped CSS Where Simpler

**User Story:** As a developer, I want styling expressed primarily through Tailwind utility classes, with scoped CSS allowed only where it is genuinely simpler (e.g., complex keyframe animations), so that the global stylesheet stays minimal and components are self-contained.

#### Acceptance Criteria

1. THE `layout.css` file SHALL contain only: the Tailwind `@import` directive, `@plugin` declarations, the `@theme` block with design tokens (colors, fonts, shadows, custom animation tokens), a minimal `body` base reset, global cursor rules for interactive elements (Requirement 6), and global scrollbar styling (Requirement 7)
2. THE `layout.css` file SHALL NOT contain any component-specific CSS classes (`.lang-dropdown`, `.mobile-menu`, `.slide-menu`, `.menu-overlay`, `.lang-option`, etc.)
3. WHEN a component's styling can be expressed with Tailwind utility classes (positioning, transitions, visibility toggling, spacing, colors), THE component SHALL use Tailwind classes directly on elements instead of custom CSS classes
4. WHEN a component requires complex `@keyframes` animations that cannot be cleanly expressed as Tailwind utilities (e.g., `.dashed-border-anim` with multi-property background-position animation), THE component MAY define the animation in a scoped `<style>` block within that component's `.svelte` file
5. WHEN the LanguageSwitcher dropdown needs positioning/visibility logic, THE component SHALL use Tailwind utility classes (`absolute`, `hidden`, `block`, `z-*`, etc.) directly on elements instead of custom CSS classes defined in `layout.css`
6. WHEN the MobileMenu needs slide/overlay transitions, THE component SHALL use Tailwind transition utilities (`translate-x-full`, `translate-x-0`, `transition-transform`, `duration-300`, `fixed`, `inset-0`) with conditional class toggling via Svelte reactive expressions
7. WHEN the CSS cleanup is complete, THE Web_App SHALL pass a production build (`bun run build`) without errors and the visual appearance SHALL remain identical to pre-refactor state

### Requirement 6: Pointer Cursor on All Interactive Elements

**User Story:** As a user, I want the cursor to change to a pointer (hand) when hovering over any clickable element (buttons, toggles, dropdowns, cards with click handlers), so that interactive affordance is clear and consistent across the site.

#### Acceptance Criteria

1. THE Web_App SHALL apply `cursor: pointer` globally to all `<button>` elements and elements with `role="button"` via a base reset rule in `layout.css`
2. WHEN a user hovers over any element that has an `onclick` handler, a `role="button"` attribute, or is a `<button>` element, THE cursor SHALL display as a pointer (hand icon)
3. WHEN a `<button>` element is disabled, THE cursor SHALL display as `not-allowed` instead of pointer
4. THE CtaButton component SHALL display a pointer cursor on hover regardless of whether it renders as an `<a>` or `<button>` element

### Requirement 7: Custom Scrollbar on Desktop

**User Story:** As a user on desktop, I want a visible, styled scrollbar that matches the dark navy theme of the site, so that the page feels polished and the scrollbar does not clash with the design.

#### Acceptance Criteria

1. THE Web_App SHALL remove the existing `::-webkit-scrollbar { display: none }` rule that hides the scrollbar
2. WHEN the page is viewed on a desktop viewport (md breakpoint and above), THE scrollbar SHALL be visible and styled with colors from the project's design tokens (navy-card track, brand-blue or navy-lighter thumb)
3. THE scrollbar thumb SHALL have rounded corners and a hover state that lightens the thumb color for visual feedback
4. THE scrollbar track SHALL use a dark background color (e.g., `navy-main` or `navy-card`) that blends with the page background
5. ON mobile viewports (below md breakpoint), THE scrollbar MAY remain hidden or use the system default thin scrollbar to avoid taking up screen space
6. THE scrollbar styling SHALL be defined in `layout.css` as a global base style using `::-webkit-scrollbar`, `::-webkit-scrollbar-track`, and `::-webkit-scrollbar-thumb` pseudo-elements, plus `scrollbar-color` and `scrollbar-width` for Firefox support

### Requirement 8: SVG Flag Icons in Language Switcher

**User Story:** As a user, I want the language switcher to display proper SVG flag icons instead of emoji text characters, so that flags render consistently across all platforms and look crisp at any resolution.

#### Acceptance Criteria

1. THE LanguageSwitcher component SHALL display SVG flag icons (British flag for English, Czech flag for Czech) instead of emoji characters (🇬🇧, 🇨🇿)
2. THE SVG flag files SHALL be stored as static assets in `src/lib/assets/flags/` (e.g., `gb.svg`, `cz.svg`)
3. WHEN the language switcher button is in collapsed state (desktop), THE component SHALL show the current locale's SVG flag icon alongside the locale label (EN/CS) and chevron
4. WHEN the language switcher dropdown is open, EACH locale option SHALL display its corresponding SVG flag icon next to the language name
5. THE SVG flag icons SHALL render at a consistent size (e.g., 20×15px or 24×18px) with rounded corners for a polished appearance
6. THE SVG flags SHALL render identically across Chrome, Firefox, Safari, and Edge — no platform-dependent emoji rendering differences

### Requirement 9: Shared Layout Components Across Pages

**User Story:** As a developer, I want common page sections (footer) to use a single shared component instance, so that visual consistency is guaranteed and changes propagate automatically to all pages.

#### Acceptance Criteria

1. THE Web_App SHALL have a single shared `SiteFooter` component in `src/lib/shared/sections/` that renders the footer identically on every page (home, features, pricing)
2. WHEN the footer is displayed on any page, THE component SHALL render the same layout, columns, links, and bottom bar — with no per-page variations or page-specific footer components (HomeFooter, FeaturesFooter, PricingFooter SHALL be replaced by SiteFooter)
3. THE Layout (`+layout.svelte`) SHALL render the SiteFooter so that it appears on every page without individual pages importing or instantiating their own footer
4. WHEN the shared SiteFooter component is updated, THE change SHALL be immediately reflected on all pages without requiring edits to multiple files

### Requirement 10: Update Documentation

**User Story:** As a developer, I want an accurate README reflecting the actual project state, so that new contributors can set up and understand the project quickly.

#### Acceptance Criteria

1. THE Web_App `README.md` SHALL include, in this order: a project description, prerequisites (Node.js 22+ and Bun with install instructions, supported OS: Linux/macOS/WSL), installation steps (`bun install`), `.env` configuration (copy from `.env.example`), development commands, build commands, and deployment instructions
2. THE Web_App `README.md` SHALL document the adapter decision (`@sveltejs/adapter-static` for static site generation) including the rationale that the output is a pre-rendered static site served from a CDN or static host
3. THE Web_App `README.md` SHALL list every script defined in `package.json` with a one-sentence description of what it does, grouped by category (development, testing, build)
4. THE Web_App `README.md` SHALL include a "Quick Start" section containing the exact sequence of shell commands (clone, install, env setup, dev server start) required to reach a running dev server, with no steps requiring information not present in the README or `.env.example`
5. IF the Web_App `README.md` references an external dependency (Playwright browsers, backend server), THEN the document SHALL state whether that dependency is required or optional and provide the setup command or link to obtain it
6. THE Web_App SHALL contain a `CLAUDE.md` file per the monorepo convention — project configuration notes SHALL be documented there alongside the README

### Requirement 11: Configure Static Adapter for Production

**User Story:** As a developer, I want the SvelteKit build to produce a fully static site, so that it can be deployed to any static hosting provider without a server runtime.

#### Acceptance Criteria

1. THE Web_App SHALL use `@sveltejs/adapter-static` as the production adapter in the SvelteKit configuration
2. WHEN the build completes, THE Web_App SHALL produce a `build/` directory containing static HTML, CSS, and JS files with no server-side runtime dependency
3. THE Web_App SHALL configure a fallback page (`200.html`) for client-side routing support on static hosts — NOTE: the implementation intentionally uses `prerender = true` (full SSR prerendering) with a `200.html` fallback instead of the originally-specified `ssr = false; prerender = false` SPA approach, because prerendering produces indexable HTML for better SEO
4. THE Web_App SHALL prerender all pages at build time via `export const prerender = true` in the root layout, so that nginx serves static HTML files with SEO-friendly content — this supersedes the earlier requirement to disable SSR/prerendering
5. WHEN the build completes, THE output SHALL contain no server-side entry points, serverless functions, or Node.js runtime files
