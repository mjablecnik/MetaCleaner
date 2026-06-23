# Requirements Document

## Introduction

This feature adds a comprehensive credits and subscription overview to the MetaCleaner frontend application (metacleaner-app). The goal is to give users continuous visibility into their credit balance, active subscription plan (Free, Pro, Pro+), and the estimated cost of cleaning actions. Additionally, certain features (Risk Scanner, Reports) are restricted to paid plans, encouraging users to upgrade.

The backend already provides `GET /api/billing/subscription` and `GET /api/billing/credits` endpoints returning credit balances and subscription status — this spec focuses exclusively on how the frontend consumes and displays that data, gates features by plan, and guides users toward upgrading.

The credit cost model is simple: cleaning 1 photo or 1 video costs 1 credit. When a user selects multiple files for cleaning, the total cost equals the number of files selected.

## Design References

- **Desktop mockup:** `frontend/metacleaner-app/.design/metacleaner-upgrade-desktop.html`
- **Mobile mockup:** `frontend/metacleaner-app/.design/metacleaner-upgrade-mobile.html`

These HTML mockups serve as the visual reference for all credit/subscription UI elements including the NavBar pills, Credits Banner, file list cost badges, credit summary row, Pro Overlay on Risk Scanner, and mobile drawer layout.

## Glossary

- **App**: The metacleaner-app SvelteKit frontend application
- **Credit_Balance_Indicator**: A pill-shaped UI element in the NavBar displaying the user's current total credit count with a pulsing green dot and bolt icon
- **Plan_Pill**: A pill-shaped UI element in the NavBar displaying the user's current plan (Free, Pro, Pro+) with appropriate styling
- **Credits_Banner**: A card-style banner below the page header showing credit balance with a progress bar, plan badge, and upgrade CTA button
- **Cost_Badge**: A small per-file badge showing the credit cost (1 credit) displayed on each file row in the file list
- **Credit_Summary_Row**: A summary bar at the bottom of the file list showing total cost for all selected files (e.g., "6 credits")
- **Cost_Indicator_Button**: A credit cost badge embedded in the "Start Cleaning" button itself showing the total cost
- **Pro_Overlay**: A gradient overlay shown over the Risk Scanner card when the user is on the Free plan, with a lock icon, Pro badge, feature preview chips, and an upgrade CTA button
- **Upgrade_Modal**: A modal dialog shown when Free users attempt to access restricted features (Reports), explaining the restriction and offering an upgrade path
- **NavBar**: The top navigation bar component shown on all authenticated pages
- **UserDropdown**: The user menu dropdown in the NavBar showing account options
- **MobileHamburgerMenu**: The full-screen mobile navigation drawer (side drawer)
- **Step2_FilesReady**: The wizard step where users review selected files before starting the cleaning process
- **MobileBottomCta**: The fixed bottom button bar shown on mobile during Step2
- **Risk_Scanner_Card**: The right-side panel showing risk analysis results (risk score, categories, severity)
- **Auth_Store**: The existing authentication store (`authStore`) that already fetches subscription status on login

## Requirements

### Requirement 1: Persistent Credit Balance in Navigation

**User Story:** As a logged-in user, I want to always see my current credit balance in the navigation, so that I know how many credits I have available without navigating to a separate page.

#### Acceptance Criteria

1. WHILE the user is authenticated, THE Credit_Balance_Indicator SHALL be visible in the NavBar on all pages as a pill-shaped element with a pulsing green dot (pulse cycle of 2 seconds), a bolt icon, the numeric credit count, and a localized "credits" label
2. THE Credit_Balance_Indicator SHALL display the user's total credit count (subscription_credits + purchased_credits) as a whole number, displaying values from 0 up to 99,999 literally and values above 99,999 as "99,999+"
3. WHEN the credit balance is zero, THE Credit_Balance_Indicator SHALL display "0" with a warning visual style (orange/red color scheme replacing the green dot, green border, and dark green background)
4. WHEN the credit balance is above zero, THE Credit_Balance_Indicator SHALL use the green color scheme (green dot, green border, dark green background)
5. THE Credit_Balance_Indicator SHALL be positioned in the NavBar between the language dropdown and the user dropdown on desktop
6. WHILE on mobile viewports, THE Credit_Balance_Indicator SHALL be displayed directly in the sticky mobile navbar (next to the hamburger button) as a compact pill showing only the dot, bolt icon, and number (omitting the "credits" label)
7. WHILE the credit balance data is being fetched, THE Credit_Balance_Indicator SHALL display a skeleton placeholder matching the pill dimensions instead of showing stale or empty content
8. IF the credit balance data fails to load, THEN THE Credit_Balance_Indicator SHALL hide itself and not display stale or placeholder values
9. WHEN a credit-consuming operation completes successfully, THE Credit_Balance_Indicator SHALL update the displayed count within 3 seconds without requiring a full page reload

### Requirement 2: Active Subscription Plan Display in Navigation

**User Story:** As a logged-in user, I want to see which subscription plan I currently have active in the navigation, so that I understand my account tier.

#### Acceptance Criteria

1. WHILE the user is authenticated, THE Plan_Pill SHALL be displayed in the NavBar on desktop as a pill-shaped element containing (in order): a 6px circular dot indicator, a lock icon (for Free plan) or a star icon (for Pro and Pro+ plans), and the plan name text
2. WHILE the user has no subscription or subscription status is "free" or "cancelled", THE Plan_Pill SHALL display the text "Free" with neutral gray styling (gray dot with gray glow, slate-gray border, dark navy gradient background, muted-gray text)
3. WHILE the user has an active Pro subscription (plan_id "pro", status "active"), THE Plan_Pill SHALL display the text "Pro" with blue styling (blue dot with blue glow, blue border, dark blue gradient background, blue text)
4. WHILE the user has an active Pro+ subscription (plan_id "proplus", status "active"), THE Plan_Pill SHALL display the text "Pro+" with orange/gold styling (orange dot with orange glow, orange border, dark orange gradient background, orange text)
5. THE Plan_Pill SHALL be positioned in the NavBar desktop right-side area between the Credit_Balance_Indicator (to its left) and the LanguageDropdown (to its right)
6. WHEN the user clicks the Plan_Pill, THE App SHALL navigate to the `/pricing` route
7. WHILE the user hovers over the Plan_Pill, THE Plan_Pill SHALL display a visible hover state with a lighter border color and slightly lighter background gradient within 200ms transition
8. WHILE the user is on a mobile viewport, THE Plan_Pill SHALL NOT be displayed in the sticky mobile navbar (plan information is shown in the MobileHamburgerMenu instead per Requirement 10)
9. WHILE the user is not authenticated, THE Plan_Pill SHALL NOT be displayed in the NavBar

### Requirement 3: Credits Banner on Main Page

**User Story:** As a user on the main cleaning page, I want to see a detailed credit balance overview with a progress bar and upgrade option, so that I have full context before starting a cleaning action.

#### Acceptance Criteria

1. THE Credits_Banner SHALL be displayed on the main page (Step2 FilesReady state) between the page header and the file upload section
2. THE Credits_Banner SHALL display: a bolt icon, the label "Credit balance", a plan badge (Free/Pro/Pro+), the remaining credits count in the format "remaining X of Y" where X is the current subscription_credits and Y is the plan's monthly allowance (Free = 3, Pro = 100, Pro+ = 100), and a horizontal progress bar filled proportionally to remaining credits divided by the plan's monthly allowance
3. THE Credits_Banner SHALL include an upgrade CTA button with orange gradient styling ("Get Pro plan" / "Získat Pro plán") on the right side that navigates the user to the pricing page when clicked
4. IF the user is on a paid plan (Pro or Pro+), THEN THE Credits_Banner SHALL hide the upgrade CTA button
5. THE Credits_Banner progress bar SHALL represent the ratio of remaining subscription credits to the plan's monthly allowance as a percentage (e.g., 12 remaining of 20 allowance = 60% filled bar width), where the bar is fully filled at 100% and empty at 0%
6. WHILE the viewport width is below the lg breakpoint (1024px), THE Credits_Banner SHALL adapt to a compact single-row layout with the bolt icon, credit count with progress bar, plan badge, and a smaller upgrade button showing abbreviated text ("Pro")

### Requirement 4: Per-File Credit Cost Badge

**User Story:** As a user reviewing my file list, I want to see the credit cost next to each file, so that I understand the cost breakdown per item.

#### Acceptance Criteria

1. WHILE files are listed in the file list (Step2 FilesReady), THE App SHALL display a Cost_Badge on each file row showing the credit cost for that file
2. THE Cost_Badge SHALL display "1" with a bolt icon for standard files (1 photo or 1 video = 1 credit)
3. THE Cost_Badge SHALL use green styling (green text, green border, semi-transparent green background) matching the design mockup
4. THE Cost_Badge SHALL be positioned on the right side of the file row, before the file format badge and remove button
5. IF a file has an unsupported format (type "unknown"), THEN THE Cost_Badge SHALL NOT be displayed for that file row
6. WHILE a file is in "pending" or "scanning" state, THE Cost_Badge SHALL still be displayed (cost is determined by file count, not scan result)

### Requirement 5: Credit Cost Summary Before Cleaning

**User Story:** As a user who has selected files for cleaning, I want to see the total credit cost summarized, so that I can decide whether to proceed.

#### Acceptance Criteria

1. WHILE files are selected in Step2_FilesReady, THE Credit_Summary_Row SHALL be displayed below the file list showing the total credit cost
2. THE Credit_Summary_Row SHALL display: an info icon, text indicating the number of files ("Cleaning cost for X files"), and a total badge showing the credit count with a bolt icon (e.g., "6 credits")
3. THE Cost_Indicator_Button SHALL be embedded in the "Start Cleaning" button itself as a small pill showing the total credit cost (e.g., bolt icon + "6")
4. WHEN files are added to or removed from the selection, THE Credit_Summary_Row SHALL update the displayed total cost and file count without a page reload
5. IF the total cost exceeds the user's current credit balance, THEN THE Credit_Summary_Row SHALL display a warning style (orange/red border, orange/red text) with a localized insufficient-credits message
6. IF the credit balance data is unavailable (loading or error state), THEN THE Credit_Summary_Row SHALL display the total cost in a neutral style without the sufficient/insufficient comparison

### Requirement 6: Insufficient Credits Prevention

**User Story:** As the system, I want to prevent users from starting a cleaning action when they don't have enough credits, so that they are not surprised by a failure mid-process.

#### Acceptance Criteria

1. WHILE the user's credit balance is less than the number of selected files, THE App SHALL disable the "Start Cleaning" button and apply a visually distinct disabled style (reduced opacity, no hover effect, cursor not-allowed)
2. WHILE the "Start Cleaning" button is disabled due to insufficient credits, THE App SHALL display a localized message below the Credit_Summary_Row explaining that the user does not have enough credits to clean the selected files
3. WHILE credits are insufficient, THE App SHALL display a link to the pricing page within the insufficient credits message area, allowing the user to purchase credits or upgrade the subscription plan
4. IF the user has zero credits and files are selected, THEN THE Credit_Summary_Row SHALL display a warning with orange/red styling indicating zero credits remain, accompanied by an upgrade prompt linking to the pricing page
5. WHEN the user removes files from the selection such that the remaining file count is less than or equal to the credit balance, THE App SHALL re-enable the "Start Cleaning" button and hide the insufficient credits message

### Requirement 7: Risk Scanner Restricted to Paid Plans

**User Story:** As a Free plan user, I want to see that the Risk Scanner is a premium feature, so that I am motivated to upgrade for detailed privacy analysis.

#### Acceptance Criteria

1. WHILE the user is on the Free plan, THE Risk_Scanner_Card content SHALL be blurred with a CSS blur filter of 4px and pointer events disabled so that the underlying content is not interactive
2. WHILE the user is on the Free plan, THE Pro_Overlay SHALL be displayed over the blurred Risk_Scanner_Card content, positioned to fully cover the card area
3. THE Pro_Overlay SHALL contain: a lock icon with a Pro star badge, the title "Risk Scanner" with a "PRO" badge, a description explaining what the feature provides, feature preview chips (GPS detection, Identity, Risk score), an upgrade CTA button ("Unlock Pro plan" / "Odemknout Pro plán"), and a price hint text (e.g., "From €2.99/month · Cancel anytime")
4. THE Pro_Overlay background SHALL use a vertical gradient from 0% opacity at the top to at least 85% opacity at the bottom, ensuring the blurred content is partially visible as a teaser at the top while the overlay text remains readable at the bottom
5. WHILE the user has an active Pro or Pro+ subscription, THE Risk_Scanner_Card SHALL display normally without blur and without the Pro_Overlay
6. WHEN the user clicks the upgrade CTA button in the Pro_Overlay, THE App SHALL navigate to the pricing page (`/pricing`)
7. IF the subscription status cannot be determined due to an API error, THEN THE App SHALL treat the user as a Free plan user and display the Pro_Overlay until the subscription status is successfully retrieved

### Requirement 8: Reports Restricted to Paid Plans

**User Story:** As a Free plan user who tries to access reports, I want to see a clear message that reports require a paid plan, so that I understand the restriction and can upgrade.

#### Acceptance Criteria

1. WHEN a Free plan user navigates to the reports list page (`/reports`), THE App SHALL display the Upgrade_Modal instead of the reports content
2. WHEN a Free plan user navigates to a report detail page (`/report/[id]`), THE App SHALL display the Upgrade_Modal instead of the report content
3. THE Upgrade_Modal SHALL contain: a lock icon, a title indicating that reports are a paid-plan feature, a localized description summarizing report capabilities (cleaning history, file details, downloadable PDF), an upgrade CTA button navigating to the pricing page, and a dismiss/close button that navigates back to the home page (`/`)
4. WHILE the user has a subscription with status "active" or "trialing" and plan_id "pro" or "pro_plus", THE reports pages SHALL display normally without any restriction modal
5. THE Upgrade_Modal SHALL be styled consistently with the Pro_Overlay (orange gradient CTA button, lock icon, Pro badge)
6. WHILE the subscription status is being fetched from the server, THE reports pages SHALL display a skeleton loading state instead of the Upgrade_Modal or the reports content
7. THE Upgrade_Modal text content (title, description, and CTA button label) SHALL be fully localized in both English and Czech

### Requirement 9: Credit Balance Refresh

**User Story:** As a user, I want my credit balance to update automatically after key actions, so that I always see an accurate count.

#### Acceptance Criteria

1. WHEN the user completes authentication (login or OAuth callback), THE App SHALL fetch the current credit balance from the backend and update the Credit_Balance_Indicator with the retrieved value
2. WHEN the user returns from a Stripe checkout success page, THE App SHALL refresh the credit balance from the backend
3. WHEN a cleaning job completes successfully, THE App SHALL refresh the credit balance from the backend to reflect the deducted credits
4. IF the App fails to fetch the credit balance from the backend, THEN THE App SHALL continue displaying the last known balance and show a small warning icon adjacent to the Credit_Balance_Indicator to signal that the displayed value may be outdated
5. THE App SHALL NOT display a loading spinner for credit balance refresh — the previous value SHALL remain visible until the new value arrives (optimistic display)
6. WHEN the App fetches the credit balance for the first time after authentication and no cached balance exists, THE App SHALL display a skeleton placeholder in the Credit_Balance_Indicator until the backend response arrives

### Requirement 10: Credit and Subscription Info in Mobile Drawer

**User Story:** As a mobile user, I want to see my credit balance and subscription plan in the mobile menu drawer, so that I have the same visibility as desktop users.

#### Acceptance Criteria

1. THE MobileHamburgerMenu (side drawer) SHALL display a dedicated credit section below the user info, showing: a pulsing green dot, bolt icon, remaining credit count with localized "credits remaining" text, a horizontal progress bar representing the ratio of remaining credits to the plan's monthly allowance, and the total allowance value displayed as "of X" text
2. THE MobileHamburgerMenu SHALL display the user's current subscription plan name (Free, Pro, or Pro+) as a styled text label within the user info section, using the same color scheme as the Plan_Pill (gray for Free, blue for Pro, orange/gold for Pro+)
3. IF the user is on the Free plan, THEN THE MobileHamburgerMenu SHALL display an upgrade CTA button at the bottom of the drawer with localized text ("Get Pro plan" / "Získat Pro plán"), an arrow icon, and orange gradient styling
4. IF the user has an active Pro or Pro+ subscription, THEN THE MobileHamburgerMenu SHALL hide the upgrade CTA button
5. THE credit section in the MobileHamburgerMenu SHALL use a card-style container with semi-transparent green background and green border
6. WHEN the user's credit balance is zero, THE credit section in the MobileHamburgerMenu SHALL switch to a warning visual style (orange/red color scheme instead of green) for the dot, progress bar, and border

### Requirement 11: Localization of Credit and Subscription UI

**User Story:** As a user using the app in Czech or English, I want all credit and subscription labels to be in my chosen language, so that the interface is consistent.

#### Acceptance Criteria

1. THE App SHALL provide i18n translation keys in both English (`en.json`) and Czech (`cs.json`) message files for every user-visible text string rendered by the Credit_Balance_Indicator, Plan_Pill, Credits_Banner, Cost_Badge, Credit_Summary_Row, Cost_Indicator_Button, Pro_Overlay, and Upgrade_Modal components
2. THE App SHALL keep plan names in English in both locales (Free, Pro, Pro+) as they are brand names that are never translated
3. WHEN displaying credit counts that include a unit label, THE App SHALL use locale-appropriate plural forms — English: "1 credit" / "2 credits"; Czech: "1 kredit" / "2 kredity" (2–4) / "5 kreditů" (5+, and 0)
4. THE Pro_Overlay text (title, description, feature preview chips, CTA button label, and price hint) SHALL have corresponding translation keys in both English and Czech, with the price hint using locale-appropriate currency formatting (English: "€2.99/month", Czech: "2,99 €/měsíc")
5. THE Upgrade_Modal text (title, description, CTA button label, and dismiss button label) SHALL have corresponding translation keys in both English and Czech
6. IF a translation key is missing from the active locale's message file, THEN THE App SHALL display the English fallback value instead of rendering a raw key string or empty content
