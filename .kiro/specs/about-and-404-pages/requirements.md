# Requirements Document

## Introduction

This feature replaces the existing About page and 404 error page in the MetaCleaner marketing website with new, redesigned versions based on HTML design mockups. It also updates navigation and footer links to reference the new About page and its contact section anchor. The new About page features Hero (with stats), Story, Values, and Contact sections. The new 404 page features an animated orbit visual, terminal diagnostic card, action buttons, and quick links grid.

## Glossary

- **About_Page**: The `/about` route page presenting company information, values, and contact form
- **Error_Page**: The SvelteKit `+error.svelte` page displayed when a route is not found (HTTP 404) or other errors occur
- **SiteNavbar**: The desktop navigation bar component shared across all pages
- **MobileMenu**: The mobile slide-in menu component shared across all pages
- **SiteFooter**: The footer section component shared across all pages
- **Hero_Section**: The top section of the About page containing company tagline, description, badges, and stats grid
- **Story_Section**: The narrative section describing how MetaCleaner started
- **Values_Section**: The section displaying six company value cards
- **Contact_Section**: The section containing a contact form and company contact information
- **Orbit_Visual**: The animated decorative element on the 404 page with rotating rings and a warning icon
- **Terminal_Card**: The diagnostic log card on the 404 page displaying animated status lines
- **Quick_Links_Grid**: The grid of shortcut links on the 404 page directing users to key pages
- **Paraglide**: The i18n framework used for translations (English and Czech)

## Requirements

### Requirement 1: About Page Hero Section

**User Story:** As a visitor, I want to see a compelling hero section with company tagline and key statistics when I visit the About page, so that I immediately understand what MetaCleaner is about and its scale.

#### Acceptance Criteria

1. WHEN a user navigates to `/about`, THE Hero_Section SHALL display a company label ("O společnosti" / "About company"), a headline with gradient text ("Soukromí je základní právo" / "Privacy is a fundamental right"), and a descriptive paragraph
2. THE Hero_Section SHALL display two badges: one for founding year (2022) with a calendar icon (`fa-solid fa-calendar-days`), and one for location (Prague, Czech Republic) with a location icon (`fa-solid fa-location-dot`)
3. THE Hero_Section SHALL display a stats grid card containing four statistics in a 2×2 grid: active users count (50K+), cleaned files count (2M+), local processing percentage (100%), and user rating (4.9★)
4. WHILE the viewport width is at or above the `lg` breakpoint (1024px), THE Hero_Section SHALL use a two-column layout with text content occupying 55% on the left and the stats grid card on the right; WHILE the viewport width is below `lg`, THE Hero_Section SHALL stack vertically with text above stats
5. THE Hero_Section SHALL render all text through Paraglide message functions for i18n support in both English and Czech

### Requirement 2: About Page Story Section

**User Story:** As a visitor, I want to read the company's origin story, so that I understand the motivation behind MetaCleaner and trust the team.

#### Acceptance Criteria

1. THE Story_Section SHALL display a section label (eyebrow text via Paraglide: "Náš příběh" / "Our story"), a heading (via Paraglide: "Jak to začalo" / "How it started"), and a gradient divider element using a horizontal line with a left-to-right gradient from brand-blue to brand-green
2. THE Story_Section SHALL display exactly three paragraphs of narrative text, each rendered from a separate Paraglide message key, describing the founding story
3. WHILE the viewport width is at least 1024px (lg breakpoint), THE Story_Section SHALL use a two-column layout with the heading positioned in the left column (1/3 width) and the narrative paragraphs in the right column (2/3 width)
4. WHILE the viewport width is below 1024px, THE Story_Section SHALL stack the heading above the narrative paragraphs in a single-column vertical layout
5. THE Story_Section SHALL render all user-visible text (section label, heading, and all three narrative paragraphs) through Paraglide message functions, with no hardcoded strings in the template

### Requirement 3: About Page Values Section

**User Story:** As a visitor, I want to see the company's core values, so that I understand the principles driving MetaCleaner's development.

#### Acceptance Criteria

1. WHEN a user scrolls to the Values section, THE Values_Section SHALL display a section label ("Co nás pohání" / "What drives us"), a heading ("Naše hodnoty" / "Our values"), and a subtitle describing the guiding principles behind MetaCleaner's development
2. THE Values_Section SHALL display six value cards in a responsive grid: 3 columns on viewports at or above the `lg` breakpoint (1024px), 2 columns on viewports at or above the `sm` breakpoint (640px) but below `lg`, and 1 column on viewports below `sm`
3. THE Values_Section SHALL display each value card with a Font Awesome icon, a title, and a description for each of the six values: Privacy First (`fa-solid fa-lock`), Transparency (`fa-solid fa-eye-slash`), Accessibility (`fa-solid fa-universal-access`), Open Source (`fa-solid fa-code`), Security (`fa-solid fa-shield-halved`), and Innovation (`fa-solid fa-lightbulb`)
4. WHEN a user hovers over a value card, THE Values_Section SHALL change the card border color to the brand color assigned to that value (Privacy First: brand-blue, Transparency: brand-green, Accessibility: brand-orange, Open Source: brand-blue, Security: brand-green, Innovation: brand-orange)
5. THE Values_Section SHALL render all text (section label, heading, subtitle, and all value card titles and descriptions) through Paraglide message functions for i18n support in both English and Czech

### Requirement 4: About Page Contact Section

**User Story:** As a visitor, I want to find contact information and submit a message, so that I can reach the MetaCleaner team with questions or collaboration interest.

#### Acceptance Criteria

1. WHEN a user scrolls to the Contact section, THE Contact_Section SHALL display a section label ("Kontakt" / "Contact"), a heading ("Napište nám" / "Write to us"), and a subtitle describing the purpose of the contact form
2. THE Contact_Section SHALL display contact information including: general email (hello@metacleaner.app), security email (security@metacleaner.app), company address (Václavské náměstí 12, 110 00 Praha 1), and company ID (IČO: 12345678 · DIČ: CZ12345678)
3. THE Contact_Section SHALL display a response time notice card indicating 24-hour business day response and 4-hour security report response
4. THE Contact_Section SHALL display a contact form with the following required fields: name (maximum 100 characters), email (maximum 254 characters, validated as email format), subject (maximum 150 characters), and message (maximum 2000 characters), plus a submit button
5. THE Contact_Section SHALL use a two-column layout on desktop (info spanning 2/5 columns left, form spanning 3/5 columns right) and stack vertically on mobile
6. THE Contact_Section SHALL have the HTML id attribute "contact" to enable anchor linking (`/about#contact`)
7. THE Contact_Section SHALL render all text and labels through Paraglide message functions for i18n support
8. IF the user submits the contact form with any required field empty or with an invalid email format, THEN THE Contact_Section SHALL display inline validation error messages next to each invalid field without clearing user input
9. WHEN the user submits the contact form with all fields valid, THE Contact_Section SHALL send the form data via the Brevo (formerly Sendinblue) transactional email API and display a localized success confirmation message indicating the message was sent
10. IF the contact form submission fails due to a server or network error (including Brevo API failure), THEN THE Contact_Section SHALL display a localized error message near the form indicating the submission failed and preserve all user input
11. THE Contact_Section SHALL send form contents to the configured recipient address via a server-side integration — NOTE: the implementation deliberately uses a Supabase Edge Function (`send-contact-email`) that holds the `BREVO_API_KEY` secret server-side, rather than calling the Brevo API directly from the browser with `VITE_BREVO_API_KEY`. This is a security improvement over the original spec (a client-side API key would be exposed in the browser bundle). Do NOT revert to the client-side approach.

### Requirement 5: 404 Error Page Redesign

**User Story:** As a visitor who navigates to a non-existent page, I want to see a helpful and visually engaging error page, so that I understand what happened and can navigate to useful pages.

#### Acceptance Criteria

1. WHEN the application encounters a 404 error, THE Error_Page SHALL display an error badge containing a pulsing red dot (animation cycle of 1500ms) and the text "Error 404 — Page Not Found", rendered through Paraglide message functions
2. THE Error_Page SHALL display a large "404" number with a gradient from white through gray to blue
3. THE Error_Page SHALL display a heading ("This page doesn't exist") and a descriptive paragraph explaining the error while reassuring the user about privacy, both rendered through Paraglide message functions
4. THE Error_Page SHALL display three action buttons: a "Back to Home" green CTA button linking to `/`, a "Go Back" button that invokes `history.back()`, and a "Support" button linking to `/about#contact`
5. THE Error_Page SHALL display a Quick_Links_Grid with four shortcut cards: "Try Free" (linking to the app root `/`), "Features" (linking to `/features`), "Pricing" (linking to `/pricing`), and "FAQ" (linking to the home page FAQ section `/#faq`), each card being a clickable link with a minimum touch target of 44×44px
6. WHILE the viewport width is at or above the `lg` breakpoint (1024px), THE Error_Page SHALL use a two-column layout with text content on the left and the 404 visual on the right; WHILE the viewport width is below the `lg` breakpoint, THE Error_Page SHALL stack content vertically in the order: error badge, 404 visual, heading and paragraph, action buttons, Quick_Links_Grid
7. THE Error_Page SHALL render all user-facing text through Paraglide message functions, supporting both English (en) and Czech (cs) locales

### Requirement 6: 404 Error Page Orbit Visual

**User Story:** As a visitor, I want to see an engaging animated visual on the error page, so that the experience feels polished rather than a dead end.

#### Acceptance Criteria

1. THE Orbit_Visual SHALL display two concentric rotating ring elements with dashed borders, where the outer ring completes one clockwise rotation every 18 seconds and the inner ring completes one counter-clockwise rotation every 28 seconds
2. THE Orbit_Visual SHALL display one glowing dot on each ring — brand-blue on the outer ring and brand-red on the inner ring — positioned to rotate along with its respective ring
3. THE Orbit_Visual SHALL display a center card containing a warning triangle icon (`fa-solid fa-triangle-exclamation`) rendered in brand-red
4. THE Orbit_Visual SHALL animate the entire visual with a continuous vertical floating motion over a 5-second cycle
5. WHILE the user has `prefers-reduced-motion` enabled, THE Orbit_Visual SHALL set all animation durations and transition durations to 0ms, rendering the visual in a static state

### Requirement 7: 404 Error Page Terminal Card

**User Story:** As a visitor, I want to see a diagnostic terminal card that contextually shows the error details, so that the page feels informative and on-brand.

#### Acceptance Criteria

1. THE Terminal_Card SHALL display a terminal header with traffic-light dots (red, orange, green), a title "error.log — diagnostics", and a "LIVE" indicator with a pulsing red dot that animates on a 1.5-second cycle
2. THE Terminal_Card SHALL display five diagnostic lines that animate in sequentially with a 500ms delay between each line: fetch path (showing the current URL path), status ("404 Not Found" in red), privacy ("Protected" in green), timestamp (current time), and suggestion ("Navigate to homepage" in orange)
3. THE Terminal_Card SHALL display a blinking cursor (toggling visibility on a 1.4-second cycle) at the end of the diagnostic output after all five lines have appeared
4. THE Terminal_Card SHALL display a footer bar with "Secure" and "Server OK" status indicators and a "404" error badge
5. WHILE the user has `prefers-reduced-motion` enabled, THE Terminal_Card SHALL display all five lines immediately without sequential animation and show the cursor in a static visible state without blinking

### Requirement 8: Navigation Update

**User Story:** As a visitor, I want to access the About page from the main navigation, so that I can learn about the company from any page.

#### Acceptance Criteria

1. THE SiteNavbar SHALL include an "About" / "O nás" NavLink pointing to `/about` positioned after the "Pricing" link and before the "FAQ" link
2. THE MobileMenu SHALL include an "About" / "O nás" link pointing to `/about` with a Font Awesome icon (`fa-solid fa-circle-info`) in both drawer and dropdown variants, following the same link structure as existing navigation items
3. WHEN the user is on the `/about` route, THE navigation link SHALL display the active state by applying the same visual styling (white text color) used for other active navigation links such as "Features" or "Pricing"
4. THE navigation links SHALL use Paraglide message functions for the "About" / "O nás" link label
5. WHEN the user is on the `/about` route, THE layout's `activePage` derived value SHALL return `'about'`, and the `active` prop type on SiteNavbar and MobileMenu SHALL include `'about'` in its union type

### Requirement 9: Footer Contact Link Update

**User Story:** As a visitor, I want the footer "Contact" link to navigate directly to the contact section on the About page, so that I can quickly find contact information.

#### Acceptance Criteria

1. THE SiteFooter SHALL render the "Contact" link in the desktop Company column with href `/about#contact`
2. THE SiteFooter SHALL render the "Contact" link in the mobile footer links with href `/about#contact`
3. WHEN a user clicks the Contact link in the footer, THE application SHALL navigate to the About page and scroll until the contact section is visible within the viewport
4. THE About page SHALL contain an element with `id="contact"` wrapping the contact information section, so that the `#contact` hash fragment resolves to a valid scroll target

### Requirement 10: Internationalization Messages

**User Story:** As a visitor using English or Czech, I want all new page content to be properly translated, so that I can read the content in my preferred language.

#### Acceptance Criteria

1. THE application SHALL include English translations in `messages/en.json` for every user-visible text string rendered on the About page and 404 page, using the `about_` prefix for About page keys and `error_404_` prefix for 404 page keys
2. THE application SHALL include Czech translations in `messages/cs.json` for every key present in `messages/en.json` that uses the `about_` or `error_404_` prefix, with each key having a non-empty translated string value
3. THE application SHALL use message keys with descriptive prefixes: `about_` for About page content and `error_404_` for 404 page content
4. WHEN the user switches language via the language switcher, THE About page and 404 page SHALL display all text content in the selected language without triggering a full page reload
5. THE About page and 404 page SHALL NOT contain any hardcoded user-visible text strings — all rendered text content SHALL be referenced through Paraglide message keys from the translation files

### Requirement 11: SEO and Meta Tags

**User Story:** As a search engine or social media platform, I want proper meta tags on the About page, so that the page is correctly indexed and displayed in previews.

#### Acceptance Criteria

1. WHEN the About_Page is rendered, THE About_Page SHALL set the document `<title>` tag to the localized value of the `meta_about_title` message key, reflecting the user's current locale
2. WHEN the About_Page is rendered, THE About_Page SHALL set a `<meta name="description">` tag whose `content` attribute is the localized value of the `meta_about_description` message key, reflecting the user's current locale
3. WHEN a 404 error occurs, THE Error_Page SHALL set the document `<title>` tag to the localized value of the `error_404_title` message key, reflecting the user's current locale
4. IF the Error_Page is displayed for a non-404 error status, THEN THE Error_Page SHALL set the document `<title>` tag to a generic fallback value containing the site name
