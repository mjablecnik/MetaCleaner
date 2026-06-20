# Implementation Plan: About & 404 Pages

## Overview

Replace the existing About page and 404 error page with fully-featured redesigns. The About page introduces Hero, Story, Values, and Contact sections. The 404 page features an animated orbit visual, terminal diagnostic card, action buttons, and quick links grid. Shared navigation and footer components are updated to include About links. All text goes through Paraglide i18n (en + cs). A pure `validateContactForm` utility is extracted for property-based testing.

## Tasks

- [x] 1. Add i18n message keys and shared utilities
  - [x] 1.1 Add About page and 404 page message keys to `messages/en.json`
    - Add all `about_*` keys (hero, story, values, contact form labels/errors/success)
    - Add all `error_404_*` keys (badge, heading, description, buttons, links, terminal lines)
    - Add `nav_about` key if not already present
    - Verify `meta_about_title`, `meta_about_description`, `error_404_title` keys exist
    - _Requirements: 10.1, 10.3_

  - [x] 1.2 Add Czech translations to `messages/cs.json`
    - Mirror all new keys from `en.json` with Czech translations
    - Ensure every `about_*` and `error_404_*` key has a non-empty Czech string
    - _Requirements: 10.2, 10.3_

  - [x] 1.3 Create `src/lib/utils/contactFormValidation.ts`
    - Define `ContactFormData`, `ValidationErrors`, `ValidationResult` interfaces
    - Implement `validateContactForm()` as a pure function
    - Rules: name required + max 100 chars, email required + max 254 chars + email format, subject required + max 150 chars, message required + max 2000 chars
    - "Required" means non-empty after trimming
    - Export all interfaces and the function
    - _Requirements: 4.4, 4.8_

  - [x] 1.4 Create `src/lib/utils/brevoClient.ts`
    - Define `ContactEmailPayload` interface (senderName, senderEmail, subject, message)
    - Implement `sendContactEmail()` function using Brevo transactional email API (`/v3/smtp/email`)
    - API key from `import.meta.env.VITE_BREVO_API_KEY`
    - Recipient: hello@metacleaner.app (or from env)
    - Returns `{ success: boolean; error?: string }`
    - Add `VITE_BREVO_API_KEY` to `.env.example`
    - _Requirements: 4.9, 4.10, 4.11_

  - [ ]* 1.5 Write property tests for `validateContactForm` (Property 1: Valid data passes)
    - **Property 1: Valid contact form data passes validation**
    - Generate random valid form data (non-empty strings within length limits, valid email format) → assert `{ valid: true, errors: {} }`
    - Use fast-check with minimum 100 iterations
    - File: `src/lib/utils/contactFormValidation.property.test.ts`
    - **Validates: Requirements 4.4, 4.8**

  - [ ]* 1.6 Write property tests for `validateContactForm` (Property 2: Empty fields fail)
    - **Property 2: Empty or whitespace-only required fields fail validation**
    - Generate form data with at least one field being whitespace-only → assert `{ valid: false }` with error on that field
    - Use fast-check with minimum 100 iterations
    - File: `src/lib/utils/contactFormValidation.property.test.ts`
    - **Validates: Requirements 4.8**

  - [ ]* 1.7 Write property tests for `validateContactForm` (Property 3: Over-length fails)
    - **Property 3: Over-length fields fail validation**
    - Generate form data with at least one field exceeding max length → assert `{ valid: false }` with error on that field
    - Use fast-check with minimum 100 iterations
    - File: `src/lib/utils/contactFormValidation.property.test.ts`
    - **Validates: Requirements 4.4, 4.8**

  - [ ]* 1.8 Write property tests for `validateContactForm` (Property 4: Invalid email fails)
    - **Property 4: Invalid email format fails validation**
    - Generate strings without valid email structure → assert `{ valid: false }` with email error
    - Use fast-check with minimum 100 iterations
    - File: `src/lib/utils/contactFormValidation.property.test.ts`
    - **Validates: Requirements 4.4, 4.8**

- [x] 2. Update shared layout and navigation components
  - [x] 2.1 Update `SiteNavbar.svelte` to add About link
    - Extend `Props.active` union type to include `'about'`
    - Add NavLink with `href="/about"`, `label={m.nav_about()}`, `active={active === 'about'}` after Pricing and before FAQ
    - _Requirements: 8.1, 8.3, 8.4, 8.5_

  - [x] 2.2 Update `MobileMenu.svelte` to add About link
    - Extend `Props.active` union type to include `'about'`
    - Add About link with `fa-solid fa-circle-info` icon in both `drawer` and `dropdown` variants
    - Position after Pricing and before FAQ in both variants
    - Apply active state styling (`text-white`) when `active === 'about'`
    - _Requirements: 8.2, 8.3, 8.4, 8.5_

  - [x] 2.3 Update `+layout.svelte` activePage logic
    - Change the `activePage` derived to return `'about'` when path starts with `/about`
    - Remove `/about` from the condition that currently returns `'home'`
    - _Requirements: 8.5_

  - [x] 2.4 Update `SiteFooter.svelte` contact links
    - Change desktop Company column Contact link href from `'#'` to `'/about#contact'`
    - Change mobile footer Contact link href from `'#'` to `'/about#contact'`
    - _Requirements: 9.1, 9.2, 9.3_

- [ ] 3. Checkpoint — Verify shared component changes
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement About page sections
  - [ ] 4.1 Create `src/routes/about/sections/HeroSection.svelte`
    - Render label, headline with GradientText, descriptive paragraph
    - Render two badges (founded 2022, Prague location) with Font Awesome icons
    - Render stats grid (4 items in 2×2): 50K+ users, 2M+ files, 100% local, 4.9★ rating
    - Two-column layout at lg+ (55% text left, stats right), stacked below lg
    - All text from Paraglide messages
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ] 4.2 Create `src/routes/about/components/StatCard.svelte`
    - Props: value, label, colorClass
    - Display a single stat item in the hero grid
    - _Requirements: 1.3_

  - [ ] 4.3 Create `src/routes/about/sections/StorySection.svelte`
    - Render eyebrow label, heading, gradient divider (brand-blue → brand-green)
    - Render 3 narrative paragraphs from separate Paraglide message keys
    - Two-column layout at lg+ (1/3 heading + 2/3 paragraphs), stacked below lg
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 4.4 Create `src/routes/about/sections/ValuesSection.svelte` and `ValueCard.svelte`
    - ValuesSection: header (label, heading, subtitle) + 6 ValueCard components
    - Responsive grid: lg:grid-cols-3, sm:grid-cols-2, below sm: grid-cols-1
    - ValueCard props: icon, title, description, hoverColor
    - Hover changes border to assigned brand color
    - All text from Paraglide
    - Create ValueCard at `src/routes/about/components/ValueCard.svelte`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 4.5 Create `src/routes/about/sections/ContactSection.svelte` and sub-components
    - ContactSection: id="contact", header, two-column layout (2/5 info + 3/5 form at lg+, stacked on mobile)
    - Create `src/routes/about/components/ContactInfoCard.svelte` — email, security email, address, company ID
    - Create `src/routes/about/components/ResponseTimeCard.svelte` — 24h business, 4h security
    - Create `src/routes/about/components/ContactForm.svelte` — form with name, email, subject, message fields + submit button
    - ContactForm uses `validateContactForm()` for client-side validation
    - Shows inline error messages on invalid submission, preserves input
    - Shows success message on valid submission
    - Shows error message on server/network failure
    - All text from Paraglide
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10_

  - [ ] 4.6 Replace `src/routes/about/+page.svelte`
    - Import and render HeroSection, StorySection, ValuesSection, ContactSection
    - Set `<title>` and `<meta name="description">` via Paraglide keys
    - _Requirements: 11.1, 11.2_

- [ ] 5. Checkpoint — Verify About page renders correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement 404 error page
  - [ ] 6.1 Create `src/routes/error/sections/OrbitVisual.svelte`
    - Two concentric rotating rings with dashed borders (outer 18s CW, inner 28s CCW)
    - Glowing dots on each ring (brand-blue outer, brand-red inner)
    - Center card with warning triangle icon (`fa-solid fa-triangle-exclamation`) in brand-red
    - 5s vertical floating animation on entire visual
    - CSS `@media (prefers-reduced-motion: reduce)` sets all animations to 0ms
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ] 6.2 Create `src/routes/error/sections/TerminalCard.svelte`
    - Terminal header with traffic-light dots, title, pulsing LIVE indicator (1.5s cycle)
    - 5 diagnostic lines with 500ms sequential delay: path, status (red), privacy (green), timestamp, suggestion (orange)
    - Blinking cursor after lines (1.4s toggle)
    - Footer bar with "Secure", "Server OK" indicators and "404" badge
    - Props: `currentPath` (from `$page.url.pathname`)
    - prefers-reduced-motion: show all lines immediately, static cursor
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ] 6.3 Create `src/routes/error/sections/ActionButtons.svelte`
    - Three buttons: "Back to Home" (green CTA, href="/"), "Go Back" (history.back()), "Support" (href="/about#contact")
    - All labels from Paraglide messages
    - _Requirements: 5.4_

  - [ ] 6.4 Create `src/routes/error/sections/QuickLinksGrid.svelte` and `QuickLinkCard.svelte`
    - QuickLinksGrid: 4 quick link cards in responsive grid
    - Links: Try Free (/), Features (/features), Pricing (/pricing), FAQ (/#faq)
    - Each card: clickable link, min 44×44px touch target, icon + label, hover border color
    - Create QuickLinkCard at `src/routes/error/components/QuickLinkCard.svelte`
    - _Requirements: 5.5_

  - [ ] 6.5 Replace `src/routes/+error.svelte`
    - Import OrbitVisual, TerminalCard, ActionButtons, QuickLinksGrid from `error/` subdirectories
    - Display error badge with pulsing red dot and "Error 404 — Page Not Found" text
    - Display large "404" number with gradient
    - Display heading and description paragraph from Paraglide
    - Two-column layout at lg+ (text left, orbit visual right); stacked on mobile (badge → visual → heading → buttons → links)
    - Handle non-404 errors with simplified fallback (status code, generic heading, home button)
    - Set `<title>` via Paraglide (`error_404_title` for 404, generic fallback for other errors)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6, 5.7, 11.3, 11.4_

- [ ] 7. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The `validateContactForm` utility is deliberately extracted as a pure function to enable property-based testing with fast-check
- All components use Svelte 5 runes mode (`$props()`, `$state()`, `$derived()`)
- All user-visible text goes through Paraglide `$lib/paraglide/messages`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4"] },
    { "id": 1, "tasks": ["1.5", "1.6", "1.7", "1.8", "2.1", "2.2", "2.3", "2.4"] },
    { "id": 2, "tasks": ["4.1", "4.2", "4.3", "4.4", "4.5"] },
    { "id": 3, "tasks": ["4.6", "6.1", "6.2", "6.3", "6.4"] },
    { "id": 4, "tasks": ["6.5"] }
  ]
}
```
