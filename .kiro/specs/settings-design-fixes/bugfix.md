# Bugfix Requirements Document

## Introduction

The Settings page implementation (`frontend/metacleaner-app/src/routes/settings/`) has multiple visual and structural discrepancies from the approved design mockups (`.design/metacleaner-settings-desktop.html` and `.design/metacleaner-settings-mobile.html`). These issues affect page header visibility, account section layout, button styling, API key card presentation, and affiliate section visibility. This bugfix aligns the implementation with the design while preserving user-confirmed deviations.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the Settings page is rendered THEN the system does not display the page header section (gear icon + title + subtitle) despite the `SettingsHeaderSection` component existing in the codebase

1.2 WHEN the Account Info section is rendered THEN the system displays a static user icon row (fa-user in a rounded container) above the badges and form fields, which is not desired by the user

1.3 WHEN the email field is rendered in the Account Info section THEN the system separates it from the name fields with a `border-t` divider and provides a separate "Change Email" button, instead of including it in the same form grid with a single save action

1.4 WHEN the "Save password" button is rendered in the Change Password section THEN the system uses `variant="primary"` (blue style) instead of the green button style used for confirmatory actions throughout the app (as shown in the design)

1.5 WHEN the API Keys section renders key items THEN the system displays them as simple rows with name + masked prefix/suffix text + badges + action buttons, without the design's card layout featuring a password-type input field, eye toggle button for reveal/hide, and a copy button

1.6 WHEN the API Keys section renders key details THEN the system does not display the "last used" date alongside the creation date

1.7 WHEN the Settings page is rendered THEN the system does not display the Affiliate Program section at all (it is commented out in `+page.svelte`)

### Expected Behavior (Correct)

2.1 WHEN the Settings page is rendered THEN the system SHALL display the page header section with gear icon, title, and subtitle — but without the "last login" indicator

2.2 WHEN the Account Info section is rendered THEN the system SHALL NOT display any avatar/icon row — only the badges and form fields shall be shown

2.3 WHEN the email field is rendered in the Account Info section THEN the system SHALL include it in the same form grid as the name fields with a single "Save" button that handles both name and email changes (email change triggers verification flow silently in the background)

2.4 WHEN the "Save password" button is rendered in the Change Password section THEN the system SHALL use the green button style (`variant="green"` or equivalent) consistent with confirmatory actions in the rest of the app

2.5 WHEN the API Keys section renders key items THEN the system SHALL display each key in a card with: a masked password-type input field showing dots, an eye toggle button to reveal/hide the full key value, a copy button to copy the key to clipboard, a status badge (Active/green or Revoked/gray), creation date and last used date, plus Create/Revoke/Delete action buttons

2.6 WHEN the API Keys section renders key details THEN the system SHALL display both the creation date and the last used date (e.g., "Created: 15. 4. 2025 · Last used: 2. 6. 2025")

2.7 WHEN the Settings page is rendered THEN the system SHALL display the Affiliate Program section in a deactivated/coming-soon state with greyed-out styling and a "Coming Soon" badge indicator

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the Settings page is rendered THEN the system SHALL CONTINUE TO display the Danger Zone section at the bottom of the left column

3.2 WHEN the Account Info section is rendered THEN the system SHALL CONTINUE TO display the Pro/Verified badges next to the account information

3.3 WHEN the Account Info section is rendered THEN the system SHALL CONTINUE TO show first name and last name as two separate fields

3.4 WHEN the API Keys section is rendered THEN the system SHALL CONTINUE TO support Create, Revoke, and Delete actions for API keys

3.5 WHEN the API Keys section has no keys THEN the system SHALL CONTINUE TO display the empty state with a prompt to create a key

3.6 WHEN the Account Info section encounters a loading or error state THEN the system SHALL CONTINUE TO display loading/error/retry UI per section

3.7 WHEN form fields are submitted THEN the system SHALL CONTINUE TO perform client-side validation before sending requests

3.8 WHEN the API Keys section is rendered THEN the system SHALL CONTINUE TO treat all keys equally without any production/test or sandbox key type distinction — users choose their own key name upon creation

3.9 WHEN the Settings page layout is rendered THEN the system SHALL CONTINUE TO use the two-column grid layout (left: account + password + danger zone, right: API keys + affiliate)
