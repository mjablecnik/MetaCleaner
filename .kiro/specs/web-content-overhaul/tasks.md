# Implementation Plan: Web Content Overhaul

## Overview

Comprehensive content and structural overhaul of the metacleaner-web marketing site. Tasks cover adding new pages (About, Privacy, Terms), GDPR cookie consent banner, footer cleanup, processing claims correction, download app removal, CTA button fix, custom 404 page, design consistency, and dead code cleanup. All changes use Svelte 5 runes, Paraglide i18n (EN + CS), Tailwind CSS 4 with dark navy theme.

## Tasks

- [x] 1. Add i18n message keys for all new and modified content
  - [x] 1.1 Add cookie consent banner i18n keys to `messages/en.json` and `messages/cs.json`
    - Add keys: `cookie_banner_text`, `cookie_banner_accept`, `cookie_banner_reject`, `cookie_banner_privacy_link`
    - English and Czech translations for all four keys
    - _Requirements: 4.5_

  - [x] 1.2 Add About page i18n keys to both locale files
    - Add keys: `meta_about_title`, `meta_about_description`, `about_heading`, `about_description_p1`, `about_description_p2`, `about_contact_heading`, `about_contact_email_label`, `about_contact_email`
    - English and Czech translations
    - _Requirements: 1.2, 1.5_

  - [x] 1.3 Add Privacy Policy page i18n keys to both locale files
    - Add keys: `meta_privacy_title`, `meta_privacy_description`, `privacy_heading`, `privacy_intro`, `privacy_section1_title` through `privacy_section5_content`
    - Full legal content in both English and Czech
    - _Requirements: 2.2, 2.5_

  - [x] 1.4 Add Terms of Use page i18n keys to both locale files
    - Add keys: `meta_terms_title`, `meta_terms_description`, `terms_heading`, `terms_intro`, `terms_section1_title` through `terms_section5_content`
    - Full legal content in both English and Czech
    - _Requirements: 3.2, 3.5_

  - [x] 1.5 Add 404 error page i18n keys to both locale files
    - Add keys: `error_404_title`, `error_404_heading`, `error_404_message`, `error_404_cta`
    - English and Czech translations
    - _Requirements: 9.5, 9.6_

  - [x] 1.6 Update existing i18n keys for processing claims correction
    - Modify `home_hero_badge`: "Local scanning · Server-side cleaning"
    - Modify `footer_tagline`: distinguish local scanning from server-side cleaning
    - Modify `home_upload_local_note`: scanning is local, cleaning requires upload
    - Modify `home_step1_desc` and `home_step1_desc_mobile`: metadata analysis local in browser
    - Modify `home_faq_1_answer`: scanning local, cleaning requires server upload, files deleted after
    - Update all in both EN and CS locale files
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10_

  - [x] 1.7 Remove deprecated i18n keys from both locale files
    - Remove `cta_download_app`, `home_faq_7_question`, `home_faq_7_answer`, `footer_legal_cookies`
    - _Requirements: 7.2, 7.3, 5.1_

- [x] 2. Implement Cookie Consent Banner component
  - [x] 2.1 Create `CookieConsentBanner.svelte` in `src/lib/components/shared/`
    - Fixed-bottom bar with accept/reject buttons and privacy policy link
    - Reads/writes `cookie_consent` key in localStorage (`'accepted'` | `'rejected'`)
    - Shows on mount if no consent stored; hides with 300ms transition on action
    - Wrap localStorage access in try/catch for private browsing fallback
    - All text via Paraglide i18n messages (`cookie_banner_*` keys)
    - Keyboard accessible (focusable buttons, proper tab order)
    - Does not overlap header or block scrolling (`position: fixed; bottom: 0`)
    - Dark navy theme styling (`navy-card` background, brand accent buttons)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [ ]* 2.2 Write unit test for cookie consent localStorage logic
    - Test: banner visible when localStorage has no `cookie_consent` key
    - Test: accept sets `localStorage.cookie_consent = 'accepted'` and hides banner
    - Test: reject sets `localStorage.cookie_consent = 'rejected'` and hides banner
    - Test: banner hidden when consent already stored
    - Test: try/catch fallback when localStorage unavailable
    - _Requirements: 4.1, 4.3, 4.4, 4.8_

  - [x] 2.3 Add CookieConsentBanner to `+layout.svelte`
    - Import and render CookieConsentBanner after SiteFooter inside the flex column
    - Extend `activePage` derived to handle new routes (`/about`, `/privacy`, `/terms`)
    - _Requirements: 4.1, 4.6_

- [x] 3. Implement new pages (About, Privacy, Terms)
  - [x] 3.1 Create `src/routes/about/+page.svelte`
    - `<svelte:head>` with localized title and meta description
    - Page heading using SectionHeading or equivalent h1 styling
    - Company description section (two paragraphs from i18n)
    - Contact section with email display
    - Dark navy theme, Inter font, consistent spacing (max-width-site: 1100px)
    - Shared layout (navbar + footer) via existing `+layout.svelte`
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 10.1, 10.2, 10.3, 10.4, 10.5_

  - [x] 3.2 Create `src/routes/privacy/+page.svelte`
    - `<svelte:head>` with localized title and meta description
    - Page heading (h1) + structured content with h2 sub-sections
    - `prose` class from `@tailwindcss/typography` with dark mode overrides for legal content
    - All content from i18n messages (`privacy_*` keys)
    - Responsive and consistent with site design
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 10.1, 10.2, 10.3, 10.4, 10.5_

  - [x] 3.3 Create `src/routes/terms/+page.svelte`
    - `<svelte:head>` with localized title and meta description
    - Same pattern as Privacy page: h1 heading + h2 sub-sections + prose styling
    - All content from i18n messages (`terms_*` keys)
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 4. Implement custom 404 error page
  - [ ] 4.1 Create `src/routes/+error.svelte`
    - Large "404" number as focal element (gradient text using GradientText or custom gradient styling)
    - Subtitle message explaining page not found
    - CTA button linking to home `/` using CtaButton component
    - Decorative gradient glow orb (`bg-brand-blue/10 blur-glow` pattern)
    - Dark navy theme with brand accents
    - Localized `<title>` tag via `<svelte:head>`
    - All text via i18n messages (`error_404_*` keys)
    - Handle non-404 errors with generic "Something went wrong" message
    - Uses shared layout (navbar + footer)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 5. Checkpoint - Verify new pages and cookie consent
  - Ensure all new routes render correctly in both locales
  - Ensure cookie consent banner appears/hides correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Footer cleanup
  - [ ] 6.1 Remove social media icons from SiteFooter
    - Remove all social icon links (Twitter, GitHub, LinkedIn) from both desktop and mobile layouts in `src/lib/shared/sections/SiteFooter.svelte`
    - _Requirements: 5.2_

  - [ ] 6.2 Update footer link hrefs and remove Cookies link
    - Remove "Cookies" link from Legal column
    - Update "About us" link href from `#` to `/about`
    - Update "Privacy" link href to `/privacy`
    - Update "Terms" link href to `/terms`
    - Apply same changes to mobile layout links
    - _Requirements: 5.1, 5.4, 1.3, 2.3, 3.3_

  - [ ] 6.3 Replace hardcoded copyright year with dynamic year
    - Replace hardcoded "© 2024" with `new Date().getFullYear()` in FooterBottomBar or SiteFooter
    - Ensure localized format: "© {year} MetaCleaner. All rights reserved."
    - _Requirements: 5.3_

  - [ ]* 6.4 Write unit tests for footer changes
    - Test: Legal column renders only "Privacy Policy" and "Terms of Service" links (no "Cookies")
    - Test: No social media icon links rendered
    - Test: Copyright year matches current year
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 7. Correct processing claims and remove download references
  - [ ] 7.1 Update HeroSection to remove Download App button and fix badge
    - Remove secondary "Download App" CTA button from `src/routes/(home)/sections/HeroSection.svelte`
    - Remove wrapper `<div>` around primary button if it only exists for flex row layout
    - The hero badge text will already use the updated i18n key from task 1.6
    - _Requirements: 7.1, 6.6_

  - [ ] 7.2 Update FAQ repository to exclude entry 7
    - Modify `src/lib/repositories/faq.ts` to remove FAQ entry 7 (offline/mobile app question)
    - Ensure the FAQ returns correct number of items without the removed entry
    - _Requirements: 7.3, 7.4_

  - [ ]* 7.3 Write unit test for FAQ repository
    - Test: `getFaq()` does not return any entry referencing downloadable app or offline mobile functionality
    - Test: No FAQ entry contains references to app stores or native apps
    - _Requirements: 7.3, 7.4_

- [ ] 8. Fix CTA button width in Features page
  - [ ] 8.1 Ensure FeaturesCtaSection button is auto-width and centered
    - Verify/fix `src/routes/features/sections/FeaturesCtaSection.svelte` so the CtaButton renders with content-driven width (not full-width)
    - Wrap in `flex justify-center` if not already centered
    - Ensure auto-width is maintained on mobile viewports (< 640px)
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 9. Checkpoint - Verify all content corrections and UI fixes
  - Ensure footer renders correctly without social icons and with correct links
  - Ensure hero section shows only "Try for Free" button
  - Ensure processing claims are accurate across all updated sections
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Dead code cleanup
  - [ ] 10.1 Remove SocialIconLink component files
    - Delete `src/lib/components/elements/SocialIconLink.svelte`
    - Delete `src/lib/components/elements/SocialIconLink.stories.svelte`
    - Remove any barrel re-export of SocialIconLink from index files
    - _Requirements: 11.1, 11.6_

  - [ ] 10.2 Scan for and remove other dead code
    - Check for any remaining references to removed i18n keys in components
    - Verify no orphaned imports referencing SocialIconLink or removed FAQ entry
    - Remove any unused TypeScript modules or repository files no longer imported
    - Check for unused static assets in `src/lib/assets/` or `static/`
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 11. Final checkpoint - Ensure all tests pass and build succeeds
  - Run `bun run check` for type checking
  - Run `bun run lint` for formatting/linting
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- All i18n keys are added first (task 1) so subsequent component tasks can use them immediately
- The design has one Correctness Property (cookie consent round-trip persistence) but explicitly states PBT is not needed — unit tests cover the logic adequately
- Processing claims corrections span multiple components but the actual text changes are centralized in i18n keys (task 1.6)
- Dead code cleanup is last to avoid breaking intermediate builds

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7"] },
    { "id": 1, "tasks": ["2.1", "3.1", "3.2", "3.3", "4.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "6.1", "6.2", "6.3", "7.1", "7.2", "8.1"] },
    { "id": 3, "tasks": ["6.4", "7.3", "10.1"] },
    { "id": 4, "tasks": ["10.2"] }
  ]
}
```
