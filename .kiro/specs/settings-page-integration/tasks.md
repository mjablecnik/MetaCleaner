# Implementation Plan: Settings Page Integration

## Overview

This plan implements the full Settings page refactoring and backend integration. It covers code quality refactoring (shared elements), UI cleanup (removing unused elements), responsive layout enforcement, API Keys CRUD integration from the live backend, account info and password change backend connection, and account deletion with confirmation modal. Backend work adds four new endpoints: PATCH /api/auth/profile, POST /api/auth/change-email, POST /api/auth/change-password, DELETE /api/auth/account.

## Tasks

- [x] 1. Backend: New account management endpoints
  - [x] 1.1 Implement PATCH /api/auth/profile endpoint
    - Add `HandleUpdateProfile` handler in `backend/metacleaner-server/source/account_handlers.go`
    - Parse JSON body into `UpdateProfileRequest` (first_name, last_name)
    - Validate: non-empty after trim, 1–100 chars each; return 400 VALIDATION_ERROR on failure
    - Extract user ID from auth context; return 401 if missing
    - Call Supabase Admin API to update user metadata (first_name, last_name)
    - Return 200 with updated profile JSON on success
    - Register route in `router.go` under auth middleware
    - _Requirements: 5.2, 5.3, 5.7_

  - [x] 1.2 Implement POST /api/auth/change-email endpoint
    - Add `HandleChangeEmail` handler in `account_handlers.go`
    - Parse JSON body into `ChangeEmailRequest` (new_email)
    - Validate email format server-side (non-empty, contains @); return 400 on failure
    - Check if email is already in use; return 409 AUTH_EMAIL_EXISTS if taken
    - Call Supabase Admin API to initiate email change (sends verification email)
    - Return 200 with `{"message": "Verification email sent"}` on success
    - Register route in `router.go`
    - _Requirements: 5.4, 5.5, 5.6_

  - [x] 1.3 Implement POST /api/auth/change-password endpoint
    - Add `HandleChangePassword` handler in `account_handlers.go`
    - Parse JSON body into `ChangePasswordRequest` (current_password, new_password)
    - Validate: current_password non-empty; new_password 8–72 chars; return 400 on failure
    - Verify current password by calling Supabase SignInWithPassword with user's email
    - On wrong password, return 401 AUTH_INVALID_CREDENTIALS
    - On success, call Supabase Admin UpdateUser to set new password
    - Return 200 OK on success
    - Register route in `router.go`
    - _Requirements: 6.1, 6.2, 6.5_

  - [x] 1.4 Implement DELETE /api/auth/account endpoint
    - Add `HandleDeleteAccount` handler in `account_handlers.go`
    - Extract user ID from auth context; return 401 if missing
    - Call Supabase Admin `DeleteUser(userID)` to permanently remove the user
    - Handle Supabase unavailability with 503 AUTH_PROVIDER_UNAVAILABLE
    - Return 200 OK on success
    - Register route in `router.go`
    - _Requirements: 7.5, 7.6, 7.7_

  - [ ]* 1.5 Write unit tests for new account endpoints
    - Add `tests/account_handlers_test.go` tests for profile update validation (empty name, too long, valid)
    - Test change-email validation (invalid format, email exists, valid)
    - Test change-password validation (empty current, short new, mismatch, wrong current, valid)
    - Test delete-account (unauthorized, success, Supabase down)
    - _Requirements: 1.4, 5.2, 5.7, 6.1, 6.2, 7.5, 7.7_

- [ ] 2. Frontend: Account client and validation utilities
  - [x] 2.1 Create account API client module
    - Create `frontend/metacleaner-app/src/lib/clients/accountClient.ts`
    - Implement `updateProfile(data: {first_name, last_name})` using `apiFetch` with PATCH /api/auth/profile
    - Implement `changeEmail(newEmail: string)` using `apiFetch` with POST /api/auth/change-email
    - Implement `changePassword(currentPassword, newPassword)` using `apiFetch` with POST /api/auth/change-password
    - Implement `deleteAccount()` using `apiFetch` with DELETE /api/auth/account
    - Export typed error handling (parse backend error codes to i18n keys)
    - _Requirements: 5.3, 5.4, 6.5, 7.5_

  - [x] 2.2 Create validation utility module
    - Create `frontend/metacleaner-app/src/routes/settings/validation.ts`
    - Implement `validateName(value: string): string | null` — non-empty after trim, 1–100 chars
    - Implement `validateEmail(value: string): string | null` — matches `^[^@\s]+@[^@\s]+\.[^@\s]+$`
    - Implement `validatePassword(current, newPwd, confirm): Record<string, string>` — current non-empty, new 8–72 chars, confirm matches new
    - Implement `validateApiKeyName(name: string): string | null` — 1–100 chars after trim
    - Implement `validateApiKeyNote(note: string): string | null` — max 500 chars
    - Implement `isFormUnchanged(original, current): boolean` — compare trimmed fields
    - All functions return null on success or an i18n error key on failure
    - _Requirements: 5.2, 5.4, 6.1, 6.2, 6.3, 4.2, 5.10_

  - [ ]* 2.3 Write property test: API key name and note validation (Property 1)
    - **Property 1: API key name and note validation**
    - **Validates: Requirements 4.2**
    - Create test file at `frontend/metacleaner-app/src/routes/settings/__tests__/validation.test.ts`
    - Use fast-check to generate arbitrary strings; assert acceptance for 1–100 char trimmed names, rejection otherwise
    - Assert acceptance for 0–500 char notes, rejection for >500 chars

  - [ ]* 2.4 Write property test: Account info field validation (Property 2)
    - **Property 2: Account info field validation**
    - **Validates: Requirements 5.2, 5.4**
    - In the same test file, test validateName accepts non-empty trimmed 1–100 char strings, rejects others
    - Test validateEmail accepts valid email patterns, rejects malformed ones

  - [ ]* 2.5 Write property test: Unchanged form detection (Property 3)
    - **Property 3: Unchanged form does not trigger submission**
    - **Validates: Requirements 5.10**
    - Generate arbitrary profile objects; verify isFormUnchanged returns true when fields match after trim, false when any field differs

  - [ ]* 2.6 Write property test: Password change form validation (Property 4)
    - **Property 4: Password change form validation**
    - **Validates: Requirements 6.1, 6.2, 6.3**
    - Generate arbitrary string triples; verify validatePassword rejects empty current, rejects new <8 or >72, rejects mismatch, accepts only when all pass

- [ ] 3. Checkpoint — Backend endpoints and validation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Frontend: Page layout refactoring and UI cleanup
  - [x] 4.1 Refactor Settings page layout and remove unused elements
    - Rewrite `frontend/metacleaner-app/src/routes/settings/+page.svelte`
    - Remove `SettingsHeaderSection` import and rendering (removes back button + last login indicator)
    - Remove `AffiliateProgramSection` rendering; leave it as a commented-out section with `<!-- Affiliate Program: planned for future release -->` comment and position it after API Keys in the right column
    - Remove the mock data imports (`getSettingsProfile`, `getAffiliateStats`, `getApiKeys` from `settingsRepository`)
    - Use `max-w-[1100px] px-6` container with two-column grid `lg:grid-cols-2` and single-column `grid-cols-1` for mobile
    - Place AccountInfoSection, ChangePasswordSection, DangerZoneSection in left column
    - Place ApiKeysSection in right column
    - _Requirements: 1.4, 1.5, 2.1, 3.1, 3.5, 3.6_

  - [x] 4.2 Refactor AccountInfoSection with shared elements and backend connection
    - Rewrite `frontend/metacleaner-app/src/routes/settings/sections/AccountInfoSection.svelte`
    - Remove avatar upload button — display only static `fa-solid fa-user` icon in a styled circle
    - Remove company input field entirely
    - Replace inline `<input>` elements with `AuthTextInput` from `$lib/shared/elements/`
    - Replace inline badge `<span>` elements with `Badge` from `$lib/shared/elements/`
    - Replace inline save `<button>` with `Button` from `$lib/shared/elements/`
    - Split into first_name and last_name fields (two separate inputs)
    - On mount: fetch profile from GET /api/auth/me via `apiFetch`, populate fields
    - Implement save logic: validate with `validateName`, check `isFormUnchanged`, call `updateProfile`
    - Implement email change: validate with `validateEmail`, call `changeEmail`, show info message about verification
    - Show inline errors from validation, loading state on button, success/error messages
    - Handle profile fetch failure with error message and retry action
    - _Requirements: 1.1, 1.2, 1.3, 3.2, 3.3, 3.4, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10_

  - [x] 4.3 Refactor ChangePasswordSection with shared elements and backend connection
    - Rewrite `frontend/metacleaner-app/src/routes/settings/sections/ChangePasswordSection.svelte`
    - Replace inline inputs with `AuthTextInput` (type=password with show/hide toggle)
    - Replace inline save button with `Button` element
    - Implement validation using `validatePassword` from validation module
    - On submit: call `changePassword` from accountClient
    - On success: clear all fields, show success message
    - On error: show inline error next to relevant field (401 = current password wrong)
    - Disable save button + show spinner while submitting
    - _Requirements: 1.1, 1.3, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

  - [x] 4.4 Rewrite ApiKeysSection with full CRUD from backend
    - Rewrite `frontend/metacleaner-app/src/routes/settings/sections/ApiKeysSection.svelte`
    - Replace mock data with live data: call `listApiKeys()` from `apiKeysClient.ts` on mount
    - Display key list showing name, key_prefix, status badge, created_at
    - Use `Badge` element for status indicators (active=green, revoked=gray)
    - Use `Button` element for all action buttons
    - Add "Create Key" button that opens `CreateKeyModal`
    - Add revoke action per key (calls `revokeApiKey`)
    - Add delete action per key (opens `DeleteKeyModal`, then calls `deleteApiKey`)
    - Show empty state with i18n message and create CTA when no keys exist
    - Show inline error messages on operation failure
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [x] 4.5 Create CreateKeyModal component
    - Create `frontend/metacleaner-app/src/routes/settings/components/CreateKeyModal.svelte`
    - Modal with name input (required, 1–100 chars) and optional note textarea (max 500 chars)
    - Validate using `validateApiKeyName` and `validateApiKeyNote` before submit
    - On submit: call `createApiKey` from `apiKeysClient`
    - On success: display plaintext key value with copy-to-clipboard, show warning that key won't be shown again
    - Loading state on submit button, error display on failure
    - _Requirements: 4.2, 4.3_

  - [x] 4.6 Create DeleteKeyModal component
    - Create `frontend/metacleaner-app/src/routes/settings/components/DeleteKeyModal.svelte`
    - Display key name in the confirmation message
    - Confirm/cancel buttons
    - On confirm: call `deleteApiKey`, close modal, remove key from list
    - _Requirements: 4.5_

  - [x] 4.7 Create DangerZoneSection and AccountDeletionModal
    - Create `frontend/metacleaner-app/src/routes/settings/sections/DangerZoneSection.svelte`
    - Render danger-zone styled area (red color scheme) with "Delete Account" button
    - Create `frontend/metacleaner-app/src/routes/settings/components/AccountDeletionModal.svelte`
    - Modal with permanent deletion warning text (localized)
    - Confirm + Cancel buttons
    - On confirm: call `deleteAccount()` from accountClient, clear session via `authStore.logout()`, redirect to `/login`
    - On error: show error inside modal, keep modal open, re-enable buttons
    - While loading: disable confirm + cancel, show spinner
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

- [ ] 5. Checkpoint — Frontend integration complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Navigation and route cleanup
  - [x] 6.1 Remove standalone /api-keys route from navigation
    - Remove or comment out the `/api-keys` link from NavBar configuration (sidebar/menu items)
    - If an `/api-keys` route page exists, comment it out or remove it from the routes directory
    - Ensure no navigation element points to the standalone API keys page
    - _Requirements: 4.6_

  - [x] 6.2 Add i18n translation keys for all new UI text
    - Add all required keys to `messages/en.json` and `messages/cs.json` for:
      - Account info errors (firstNameRequired, lastNameRequired, emailInvalid)
      - Password errors (currentRequired, newLength, mismatch)
      - API key errors (nameRequired, noteTooLong)
      - Danger zone labels and modal text (deleteAccount, confirmDeletion, permanentWarning)
      - Email change info message
      - Success/error messages for all operations
    - _Requirements: 5.7, 6.4, 6.7, 7.3_

- [ ] 7. Responsive design verification and final polish
  - [ ] 7.1 Verify responsive layout and touch targets
    - Ensure two-column grid on desktop (≥1024px), single-column on mobile (<1024px)
    - Verify all buttons/inputs have min 44×44px touch targets on mobile
    - Verify no horizontal overflow at 320px–2560px viewports
    - Verify form fields stack single-column inside accordion cards on mobile
    - Verify text content readable without horizontal scrolling at 320px
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 7.2 Write integration tests for settings sections
    - Test AccountInfoSection: fetch→populate, submit→success/error, email change flow
    - Test ChangePasswordSection: validation→submit→success/error
    - Test ApiKeysSection: list→create→revoke→delete flows, empty state
    - Test DangerZoneSection + AccountDeletionModal: open→confirm→success/error, cancel
    - _Requirements: 5.1, 5.3, 6.5, 6.6, 7.5, 7.6_

- [ ] 8. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- The existing `apiKeysClient.ts` already implements full CRUD operations (create, list, delete, revoke) — task 4.4 reuses it directly
- The existing `apiFetch` wrapper in `lib/auth/api-client.ts` handles token injection and refresh — new account client functions use it
- Backend endpoints reuse existing auth middleware pattern from `router.go`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4", "2.1", "2.2"] },
    { "id": 1, "tasks": ["1.5", "2.3", "2.4", "2.5", "2.6", "4.1"] },
    { "id": 2, "tasks": ["4.2", "4.3", "4.4", "4.5", "4.6", "4.7"] },
    { "id": 3, "tasks": ["6.1", "6.2"] },
    { "id": 4, "tasks": ["7.1", "7.2"] }
  ]
}
```
