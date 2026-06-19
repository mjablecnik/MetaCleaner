# Requirements Document

## Introduction

Comprehensive content and structure overhaul of the metacleaner-web marketing site. This includes adding new legal/informational pages, implementing GDPR cookie consent, cleaning up the footer, correcting inaccurate processing claims, removing non-existent app download references, fixing CTA button styling, and removing dead code from the project.

## Glossary

- **Marketing_Site**: The metacleaner-web SvelteKit 2 static SPA marketing website located in `frontend/metacleaner-web/`
- **Cookie_Consent_Banner**: A GDPR-compliant UI banner that appears on first visit, allowing users to accept or reject non-essential cookies
- **Footer**: The shared `SiteFooter` component rendered at the bottom of every page
- **Hero_Section**: The top section of the home page containing the main headline, subtitle, and call-to-action buttons
- **CTA_Button**: A call-to-action button component (`CtaButton`) used for primary user actions
- **i18n_System**: The Paraglide JS internationalization system supporting English (en) and Czech (cs) locales
- **Dead_Code**: Components, routes, assets, styles, or other code that is not referenced or used anywhere in the project

## Requirements

### Requirement 1: About Us Page

**User Story:** As a visitor, I want to view company information and contact details, so that I can learn about the organization behind MetaCleaner.

#### Acceptance Criteria

1. WHEN a visitor navigates to the "/about" route, THE Marketing_Site SHALL display an "About Us" page containing a page heading, a company description section (explaining what MetaCleaner is and who builds it), and a contact details section displaying at minimum an email address
2. THE Marketing_Site SHALL include all user-visible text on the About Us page (page heading, company description, and contact labels) in both English and Czech via the i18n_System
3. THE Marketing_Site SHALL include a navigation link labeled "About" (localized) in the site footer "Company" column, with the link navigating to the "/about" route
4. THE Marketing_Site SHALL render the About Us page using the shared site layout (navbar, footer)
5. THE Marketing_Site SHALL include localized SEO metadata for the About Us page: a unique `<title>` and `<meta name="description">` tag in the current locale

### Requirement 2: Privacy Policy Page

**User Story:** As a visitor, I want to read the privacy policy, so that I can understand how my data is handled.

#### Acceptance Criteria

1. WHEN a visitor navigates to the "/privacy" route, THE Marketing_Site SHALL display a Privacy Policy page with a localized page heading identifying the page as the Privacy Policy and the full privacy policy content organized into distinct sections with sub-headings
2. THE Marketing_Site SHALL include the Privacy Policy page content in both English and Czech via the i18n_System
3. THE Marketing_Site SHALL link to the Privacy Policy page from the footer "Legal" column in both the desktop layout (FooterColumn link) and the mobile layout (inline link), using "/privacy" as the href
4. THE Marketing_Site SHALL render the Privacy Policy page using the shared site layout (navbar, footer)
5. WHEN the Privacy Policy page is loaded, THE Marketing_Site SHALL set a localized page title and meta description specific to the Privacy Policy page

### Requirement 3: Terms of Use Page

**User Story:** As a visitor, I want to read the terms of use, so that I can understand the conditions for using MetaCleaner.

#### Acceptance Criteria

1. WHEN a visitor navigates to the "/terms" route, THE Marketing_Site SHALL display a Terms of Use page containing structured legal content with at least one top-level heading (h1) and one or more text sections separated by subheadings (h2)
2. THE Marketing_Site SHALL include the Terms of Use page content in both English and Czech via the i18n_System
3. THE Marketing_Site SHALL link to the Terms of Use page (href="/terms") from the footer "Legal" column in both the desktop footer and the mobile footer
4. THE Marketing_Site SHALL render the Terms of Use page using the shared site layout (navbar, footer)
5. WHEN a visitor loads the "/terms" route, THE Marketing_Site SHALL set a localized page title and meta description unique to the Terms of Use page

### Requirement 4: GDPR Cookie Consent Banner

**User Story:** As a visitor from the EU, I want to accept or reject non-essential cookies on my first visit, so that my privacy preferences are respected in compliance with GDPR.

#### Acceptance Criteria

1. WHEN a visitor loads any page for the first time (no prior consent stored), THE Cookie_Consent_Banner SHALL appear as a fixed bar at the bottom of the viewport
2. THE Cookie_Consent_Banner SHALL provide an "Accept" action, a "Reject" action for non-essential cookies, and a link to the Privacy Policy page (/privacy)
3. WHEN the visitor clicks "Accept" or "Reject", THE Cookie_Consent_Banner SHALL store the chosen preference (distinguishing acceptance from rejection) in localStorage and remove the banner from the viewport within 300ms
4. WHILE a consent preference is stored in localStorage, THE Cookie_Consent_Banner SHALL remain hidden on subsequent page visits
5. THE Cookie_Consent_Banner SHALL display all text in the current locale (English or Czech) via the i18n_System
6. THE Cookie_Consent_Banner SHALL remain visible and keyboard-accessible while not overlapping the site header, navigation links, or page scroll area (page content remains scrollable behind the banner)
7. WHILE no consent preference is stored in localStorage, THE System SHALL NOT execute any non-essential cookies or tracking scripts
8. IF the visitor's localStorage is cleared or unavailable, THEN THE Cookie_Consent_Banner SHALL appear again on the next page load as if no prior consent existed

### Requirement 5: Footer Cleanup

**User Story:** As a visitor, I want the footer to show only relevant and accurate links, so that I can navigate the site without encountering dead-end or misleading links.

#### Acceptance Criteria

1. THE Footer SHALL display the Legal column with only "Privacy Policy" and "Terms of Service" links, excluding the "Cookies" link
2. THE Footer SHALL not render any social media icon links (Twitter, GitHub, LinkedIn) in both the desktop and mobile layouts
3. THE Footer SHALL display the copyright text using the current calendar year determined at page render time from the system clock, in the format "© {year} MetaCleaner. All rights reserved." (localized equivalent for non-English locales)
4. THE Footer SHALL retain all other existing links, columns, brand content, and layout structure unchanged in both desktop and mobile variants

### Requirement 6: Correct Inaccurate Local Processing Claims

**User Story:** As a visitor, I want the website to accurately describe how MetaCleaner processes files, so that I have correct expectations about data handling.

#### Acceptance Criteria

1. THE Marketing_Site SHALL state that metadata scanning and analysis are performed locally in the browser without uploading files to any server
2. THE Marketing_Site SHALL state that metadata cleaning (removal) requires uploading files to the MetaCleaner server, and that uploaded files are automatically deleted from the server after processing is complete
3. THE Marketing_Site SHALL remove or reword all claims stating that files are processed "100% locally" or "never leave your device" so that such claims apply only to metadata scanning, not to metadata cleaning
4. THE Marketing_Site SHALL update the FAQ answer to question "Are my files safe? Are they uploaded to a server?" to state that scanning is local, cleaning requires a server upload, and files are deleted after processing
5. THE Marketing_Site SHALL update the footer tagline to remove the "100% local processing" claim and replace it with a statement that distinguishes local scanning from server-side cleaning
6. THE Marketing_Site SHALL update the hero badge text to state that scanning is performed locally and cleaning is performed server-side
7. THE Marketing_Site SHALL update the "How it works" step 1 description to remove the claim "Your data never leaves your device" and replace it with a statement that metadata analysis happens locally in the browser
8. THE Marketing_Site SHALL update the upload card note "Files are processed locally. Never uploaded." to state that scanning is local and cleaning requires uploading to the server
9. THE Marketing_Site SHALL apply all content corrections in both English and Czech via the i18n_System
10. THE Marketing_Site SHALL preserve all existing claims about local processing that refer specifically to metadata scanning or analysis, without removing or weakening them

### Requirement 7: Remove Download App References

**User Story:** As a visitor, I want the website to only promote actions that exist, so that I am not confused by non-functional download buttons.

#### Acceptance Criteria

1. THE Hero_Section SHALL render only the "Try for Free" CTA_Button (primary variant with cloud-upload icon) and SHALL NOT render the secondary "Download App" CTA_Button with Apple icon
2. THE Marketing_Site SHALL remove the `cta_download_app` i18n message key from both `messages/en.json` and `messages/cs.json` locale files
3. THE Marketing_Site SHALL remove the `home_faq_7_question` and `home_faq_7_answer` i18n message keys from both locale files and exclude FAQ entry 7 (offline/mobile app question) from the rendered FAQ section
4. THE Marketing_Site SHALL NOT contain any i18n message values or component template text that reference a downloadable native application, a mobile app store, or offline mobile app functionality within deployed site source files (components, sections, repositories, and locale files)

### Requirement 8: Shorten Bottom CTA Button

**User Story:** As a visitor, I want the primary CTA button in the bottom CTA section to have an appropriate width, so that the layout looks balanced and professional.

#### Acceptance Criteria

1. THE CTA_Button in the bottom CTA section SHALL render with a width determined by its text content and horizontal padding rather than spanning the full width of its container
2. WHEN the CTA_Button renders in the bottom CTA section, THE CTA_Button SHALL be horizontally centered within its container
3. IF the viewport width is less than 640px, THEN THE CTA_Button SHALL maintain auto-width sizing (not expand to full container width)

### Requirement 9: Custom 404 Error Page

**User Story:** As a visitor, I want to see a well-designed error page when I navigate to a non-existent URL, so that I understand something went wrong and can easily find my way back to useful content.

#### Acceptance Criteria

1. WHEN a visitor navigates to a route that does not exist, THE Marketing_Site SHALL display a custom 404 error page instead of the default plain-text "404 Not Found" response
2. THE 404 error page SHALL include a large, visually prominent "404" number or illustration as the focal element, a localized message explaining that the page was not found, and a CTA_Button linking back to the home page
3. THE 404 error page SHALL use the site's existing dark navy theme (navy-main background, brand colors for accents, text-main and text-muted for typography) and render within the shared site layout (navbar, footer)
4. THE 404 error page SHALL include a subtle decorative element (e.g., a gradient glow, floating particles, or an animated icon) to make it visually engaging rather than a plain text page
5. THE 404 error page SHALL display all user-visible text in the current locale (English or Czech) via the i18n_System
6. THE 404 error page SHALL include a localized page title (e.g., "Page Not Found | MetaCleaner") via the `<title>` tag

### Requirement 10: New Pages Design Consistency

**User Story:** As a visitor, I want all new pages to visually match the existing site design, so that the browsing experience feels cohesive and professional throughout the entire website.

#### Acceptance Criteria

1. THE About Us, Privacy Policy, and Terms of Use pages SHALL use the site's existing dark navy theme: navy-main (#0a1628) page background, text-main (white) for headings, text-muted (#94a3b8) for body text, and brand accent colors for links and interactive elements
2. THE new pages SHALL use consistent typography with the rest of the site: Inter font family, the same heading sizes (matching existing section headings), and the same paragraph line-height and spacing
3. THE new pages SHALL use the site's spacing system (consistent with other pages) for padding, margins, and content max-width (--max-width-site: 1100px)
4. THE new pages SHALL be fully responsive, maintaining readable content at all viewport widths (mobile-first approach, consistent with existing breakpoints)
5. THE new pages SHALL use the SectionHeading component or equivalent heading styling for page titles, matching how other page headers are presented across the site

### Requirement 11: Dead Code Cleanup

**User Story:** As a developer, I want the codebase to contain only referenced and used code, so that the project remains maintainable and the build output is minimal.

#### Acceptance Criteria

1. THE Marketing_Site project SHALL contain no Svelte components (`.svelte` files excluding `.stories.svelte` files) that are not imported or rendered by any route page, layout, or another non-story component
2. THE Marketing_Site project SHALL contain no TypeScript modules or repository files that are not imported by any route page, layout, component, or another TypeScript module within the `src/` directory (excluding test and story files)
3. THE Marketing_Site project SHALL contain no static assets (images, SVGs) in `src/lib/assets/` or `static/` that are not referenced by any component, layout, or stylesheet via an import statement or URL path
4. THE Marketing_Site project SHALL contain no i18n message keys in `messages/en.json` or `messages/cs.json` that are not referenced by any component, section, or repository file via a literal string key passed to the `t()` helper or Paraglide message function
5. THE Marketing_Site project SHALL contain no route directories under `src/routes/` for pages that are not reachable via at least one navigation link (`<a href>`) or programmatic navigation call in the SiteNavbar, MobileMenu, or SiteFooter components
6. IF a Svelte component file exists only to be re-exported by a barrel `index.ts` and has no direct import from any route, layout, or other component, THEN THE Marketing_Site project SHALL treat both the component and its barrel re-export as dead code to be removed

