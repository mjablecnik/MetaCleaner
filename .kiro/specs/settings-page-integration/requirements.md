# Requirements Document

## Introduction

This feature integrates and refactors the MetaCleaner application's Settings page. It consolidates API key management (currently a standalone page) into the settings page, connects account info and password change forms to the backend API, adds account deletion with confirmation, removes unnecessary UI elements, and ensures responsive design consistency across desktop and mobile viewports.

## Glossary

- **Settings_Page**: The `/settings` route in the MetaCleaner frontend application that contains user account management features organized in accordion cards.
- **API_Keys_Section**: The settings page section that provides full CRUD management of API keys (create, list, revoke, delete).
- **Account_Info_Section**: The settings page section displaying and allowing edits to the user's profile (first name, last name, email).
- **Password_Change_Section**: The settings page section allowing authenticated users to change their current password.
- **Account_Deletion_Modal**: A confirmation modal dialog that requires explicit user confirmation before permanently deleting the user account.
- **Backend_API**: The Go HTTP server providing authentication, profile, and API key endpoints at the configured API base URL.
- **Auth_Store**: The reactive Svelte 5 state module (`auth.svelte.ts`) managing JWT tokens, user session, and authentication actions.
- **API_Keys_Client**: The HTTP client module (`apiKeysClient.ts`) providing typed functions for API key CRUD operations against the backend.
- **Navigation**: The application's NavBar and routing configuration that determines which pages are accessible from the main menu.

## Requirements

### Requirement 1: Code Quality Refactoring

**User Story:** As a developer, I want the Settings page code to be well-structured with reusable components and no duplication, so that future maintenance is straightforward.

#### Acceptance Criteria

1. WHEN the Settings_Page renders form field inputs (text, email), THE Settings_Page SHALL use the `AuthTextInput` element from `$lib/shared/elements/` or an equivalent shared input component instead of inline `<input>` markup with duplicated styling classes.
2. WHEN the Settings_Page renders status indicators (Pro, Verified, Active, Sandbox), THE Settings_Page SHALL use the `Badge` element from `$lib/shared/elements/` instead of inline `<span>` markup with duplicated badge styling classes.
3. WHEN the Settings_Page renders action buttons (Save, Copy), THE Settings_Page SHALL use the `Button` element from `$lib/shared/elements/` instead of inline `<button>` markup with duplicated button styling classes.
4. THE Settings_Page SHALL maintain consistent spacing, typography, and layout patterns between desktop (1024px+ viewport) and mobile (<1024px viewport) viewports, matching the conventions used in other application pages (reports, pricing).
5. WHEN the Settings_Page renders on desktop viewport (1024px+), THE Settings_Page SHALL use the same page container structure (`max-w-[1100px]`, horizontal padding of `px-6`, vertical gap via flex column) as other application pages.

### Requirement 2: Responsive Design Verification

**User Story:** As a user, I want the Settings page to be fully usable on both desktop and mobile devices, so that I can manage my account from any device.

#### Acceptance Criteria

1. THE Settings_Page SHALL display accordion cards in a two-column grid layout on desktop viewports (≥1024px) and a single-column stacked layout on mobile viewports (<1024px).
2. WHILE the viewport width is below 1024px, THE Settings_Page SHALL ensure all interactive elements (buttons, inputs, toggles) have a minimum touch target size of 44×44px.
3. THE Settings_Page SHALL not produce horizontal scrollbar overflow at any viewport width from 320px to 2560px.
4. WHILE the viewport width is below 1024px, THE Settings_Page SHALL stack all form fields in a single column within each accordion card.
5. THE Settings_Page SHALL ensure all text content within accordion cards remains readable without horizontal scrolling or truncation at viewport widths down to 320px.

### Requirement 3: Remove Unnecessary UI Elements

**User Story:** As a user, I want a clean settings interface without redundant navigation or unused fields, so that I can focus on relevant account management tasks.

#### Acceptance Criteria

1. THE Settings_Page SHALL NOT render a "back to cleaning" navigation button in the DOM (standard browser/app back navigation is used instead).
2. THE Account_Info_Section SHALL NOT render a "company" input field in the DOM.
3. THE Account_Info_Section SHALL NOT render a "last login" indicator (date/time of last sign-in) in the DOM.
4. THE Account_Info_Section SHALL NOT provide avatar upload functionality; it SHALL display only a static neutral user icon (e.g., Font Awesome `fa-solid fa-user` or equivalent SVG) as the profile image placeholder.
5. THE Settings_Page SHALL NOT render the Affiliate Program accordion card section to the user.
6. THE Settings_Page source code SHALL contain the Affiliate Program accordion card section in a commented-out state with a developer comment indicating the feature is planned for a future release.

### Requirement 4: API Keys Integration

**User Story:** As a user, I want to manage my API keys directly within the settings page, so that I do not need to navigate to a separate page.

#### Acceptance Criteria

1. THE API_Keys_Section SHALL display a list of all API keys belonging to the authenticated user, showing each key's name, prefix, status, and creation date, fetched from the Backend_API via GET /api/keys.
2. WHEN the user initiates key creation, THE API_Keys_Section SHALL display a modal dialog for entering a key name (1–100 characters, required) and optional note (max 500 characters), then call POST /api/keys on the Backend_API.
3. WHEN a new API key is created successfully, THE API_Keys_Section SHALL display the plaintext key value exactly once with a copy-to-clipboard action and a warning that the key cannot be shown again.
4. WHEN the user initiates key revocation, THE API_Keys_Section SHALL call PATCH /api/keys/{id}/revoke on the Backend_API and update the key status to "revoked" in the list.
5. WHEN the user initiates key deletion, THE API_Keys_Section SHALL display a confirmation dialog and upon confirmation call DELETE /api/keys/{id} on the Backend_API, removing the key from the list.
6. THE Navigation SHALL not display the standalone `/api-keys` route in the main menu or sidebar (the route page is commented out or removed from navigation).
7. IF the Backend_API returns an error during any API key operation, THEN THE API_Keys_Section SHALL display a localized inline error message near the relevant action.
8. IF no API keys exist for the authenticated user, THEN THE API_Keys_Section SHALL display a localized empty state message with a call-to-action to create the first key.

### Requirement 5: Backend Connection for Account Info

**User Story:** As a user, I want my account information to be loaded from and saved to the server, so that my profile data persists and is consistent across devices.

#### Acceptance Criteria

1. WHEN the Settings_Page loads, THE Account_Info_Section SHALL fetch the authenticated user's profile data from the Backend_API via GET /api/auth/me and populate the form fields (first name, last name, email).
2. WHEN the user submits the account info form, THE Account_Info_Section SHALL validate that first name and last name are non-empty strings (not blank after trimming whitespace) and that each is between 1 and 100 characters before sending the request.
3. WHEN the user submits valid account info changes (first name or last name modified), THE Account_Info_Section SHALL send the updated first name and last name to the Backend_API and display a localized success message within the Account_Info_Section upon receiving a successful response.
4. WHEN the user changes the email address and submits the form, THE Account_Info_Section SHALL validate the new email matches a valid email format (local-part@domain with at least one dot in domain) before sending the change request to the Backend_API, which triggers a verification email with an activation link to the new address.
5. WHEN an email change is submitted successfully, THE Account_Info_Section SHALL display a localized informational message explaining that the email will not update until the user clicks the activation link sent to the new address, and the message SHALL remain visible until the user navigates away from the Settings_Page.
6. THE Account_Info_Section SHALL not update the displayed email in the UI until the user completes the email verification process via the activation link; the previously confirmed email SHALL remain displayed.
7. IF the Backend_API returns a validation error on account info submission, THEN THE Account_Info_Section SHALL display localized inline error messages next to the corresponding fields without clearing the user's input.
8. WHILE the account info form is submitting, THE Account_Info_Section SHALL disable the save button and show a loading indicator in place of or adjacent to the save button.
9. IF the Backend_API is unreachable or returns a server error (network failure or 5xx status) during profile fetch on page load, THEN THE Account_Info_Section SHALL display a localized error message indicating the profile could not be loaded and provide a retry action.
10. IF the user submits the account info form with no changes compared to the fetched profile data, THEN THE Account_Info_Section SHALL not send a request to the Backend_API.

### Requirement 6: Backend Connection for Password Change

**User Story:** As a user, I want to change my password securely through the settings page, so that I can maintain account security.

#### Acceptance Criteria

1. WHEN the user submits the password change form, THE Password_Change_Section SHALL validate that the current password field is non-empty before sending the request.
2. WHEN the user submits the password change form, THE Password_Change_Section SHALL validate that the new password is between 8 and 72 characters.
3. WHEN the user submits the password change form, THE Password_Change_Section SHALL validate that the new password and confirmation password fields match.
4. IF client-side validation fails, THEN THE Password_Change_Section SHALL display a localized inline error message next to the specific field that failed validation, without clearing any entered values.
5. WHEN validation passes, THE Password_Change_Section SHALL send the current password and new password to the Backend_API using the authenticated user's access token.
6. WHEN the password change succeeds, THE Password_Change_Section SHALL clear all password fields and display a localized success message.
7. IF the Backend_API returns an error during password change, THEN THE Password_Change_Section SHALL display a localized inline error message indicating the reason for failure (such as incorrect current password or service unavailability).
8. WHILE the password change form is submitting, THE Password_Change_Section SHALL disable the save button and show a loading indicator.

### Requirement 7: Account Deletion

**User Story:** As a user, I want to be able to delete my account permanently, so that I can remove all my data from the service when I no longer need it.

#### Acceptance Criteria

1. THE Settings_Page SHALL display an account deletion action (button or link) in a visually distinct danger zone area styled with the application's danger/red color scheme.
2. WHEN the user initiates account deletion, THE Account_Deletion_Modal SHALL appear requiring the user to click a dedicated confirm button before proceeding.
3. THE Account_Deletion_Modal SHALL display localized text stating that the action is permanent, irreversible, and will remove all user data.
4. THE Account_Deletion_Modal SHALL provide a cancel or close action that dismisses the modal without initiating deletion.
5. WHEN the user confirms account deletion, THE Settings_Page SHALL send a delete request to the Backend_API using the authenticated user's access token.
6. WHEN account deletion succeeds, THE Settings_Page SHALL clear the local session (tokens, user data) and redirect the user to the login page.
7. IF the Backend_API returns an error during account deletion, THEN THE Account_Deletion_Modal SHALL display a localized error message, remain open, and re-enable the confirm button so the user can retry or cancel.
8. WHILE the deletion request is in progress, THE Account_Deletion_Modal SHALL disable the confirm button, disable the cancel action, and show a loading indicator to prevent duplicate submissions or premature dismissal.
