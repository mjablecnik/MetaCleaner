# Requirements Document

## Introduction

This document specifies the requirements for adding API Key management to the MetaCleaner application. The feature enables users to create, view, copy, revoke, and delete API keys through a dedicated frontend page, and introduces API key-based authentication as an alternative to JWT for accessing protected backend endpoints. The existing "Settings" navigation item is replaced with an "API Keys" link.

## Glossary

- **API_Key**: A secret token with prefix `mtd_key_` used to authenticate requests to the MetaCleaner backend as an alternative to JWT
- **Key_Hash**: A SHA-256 hash of the full API key stored in the database for validation purposes
- **Key_Display_Hint**: The key prefix combined with the last 4 characters of the key, stored in plaintext for display purposes (e.g., `mtd_key_••••Kx9p`)
- **Frontend**: The MetaCleaner SvelteKit application located in `frontend/metacleaner-app/`
- **Backend**: The MetaCleaner Go HTTP server located in `backend/metacleaner-server/`
- **Auth_Middleware**: The existing authentication middleware that validates Bearer tokens on protected routes
- **Rate_Limiter**: The per-key request throttling mechanism enforcing a maximum number of requests per minute
- **Create_Key_Modal**: The modal dialog for creating a new API key with name and optional note fields
- **Delete_Confirm_Modal**: The confirmation dialog shown before permanently deleting an API key

## Requirements

### Requirement 1: API Key Creation

**User Story:** As an authenticated user, I want to create new API keys with a name, so that I can authenticate programmatic access to the MetaCleaner API.

#### Acceptance Criteria

1. WHEN an authenticated user submits the Create_Key_Modal with a valid key name, THE Backend SHALL generate a cryptographically random API key of 32 bytes (64 hex characters) with the prefix `mtd_key_`
2. WHEN a new API_Key is generated, THE Backend SHALL store the Key_Hash (SHA-256) and Key_Display_Hint in the Supabase database associated with the authenticated user
3. WHEN a new API_Key is successfully created, THE Backend SHALL return the full plaintext key exactly once in the creation response
4. WHEN the Backend returns a successful creation response, THE Frontend SHALL display the full plaintext key in the Create_Key_Modal with a copy button
5. WHEN the user closes the Create_Key_Modal after key creation, THE Frontend SHALL never display the full plaintext key again
6. IF the key name is empty, contains only whitespace, or exceeds 100 characters, THEN THE Backend SHALL reject the request with HTTP 400 and a validation error message

### Requirement 2: API Key Listing

**User Story:** As an authenticated user, I want to view all my API keys with their status and metadata, so that I can manage my programmatic access credentials.

#### Acceptance Criteria

1. WHEN an authenticated user navigates to the `/api-keys` route, THE Frontend SHALL fetch and display a list of all API keys belonging to that user, showing a skeleton loading state while the data is being retrieved
2. THE Frontend SHALL display each key with its name, status badge (Active or Revoked), creation date, last used timestamp (or "Never used" if the key has not been used), and Key_Display_Hint
3. WHILE a key has status "Revoked", THE Frontend SHALL render the key row with 50% opacity and disable the copy and eye-toggle buttons
4. WHILE a key has status "Active", THE Frontend SHALL display a copy button, an eye toggle button, and a delete button for that key
5. THE Frontend SHALL display a usage summary section showing active key count and rate limit per minute
6. IF the user has no API keys, THEN THE Frontend SHALL display an empty state message indicating no keys exist and a call-to-action to create the first key
7. IF the API key list request fails, THEN THE Frontend SHALL display an inline error message indicating the failure and a retry button, without navigating away from the page

### Requirement 3: API Key Deletion

**User Story:** As an authenticated user, I want to permanently delete an API key, so that I can revoke access for compromised or unused keys.

#### Acceptance Criteria

1. WHEN the user clicks the delete button on a key, THE Frontend SHALL display the Delete_Confirm_Modal with a warning stating that the deletion is permanent and cannot be undone
2. WHEN the user confirms deletion in the Delete_Confirm_Modal, THE Backend SHALL verify that the API key belongs to the authenticated user and permanently remove the API key record from the database
3. WHEN an API key is successfully deleted, THE Frontend SHALL remove the key from the displayed list without a full page reload
4. IF a deleted API_Key is used in a subsequent request, THEN THE Auth_Middleware SHALL reject the request with HTTP 401 and error code AUTH_UNAUTHORIZED
5. IF the deletion request fails due to a server or database error, THEN THE Frontend SHALL display an inline error message near the Delete_Confirm_Modal and preserve the key in the displayed list unchanged
6. IF the authenticated user attempts to delete an API key that does not exist or does not belong to them, THEN THE Backend SHALL respond with HTTP 404 and an error indicating the key was not found

### Requirement 4: API Key Revocation

**User Story:** As an authenticated user, I want to revoke an API key without permanently deleting it, so that I can temporarily disable access while keeping a record.

#### Acceptance Criteria

1. WHEN the user clicks a "Revoke" action on an active key in the API Keys list, THE Frontend SHALL send a revocation request to `PATCH /api/keys/{id}/revoke` on the Backend
2. WHEN the Backend receives a valid revocation request for an active key owned by the authenticated user, THE Backend SHALL set the key status to "revoked", record the revocation timestamp in the `revoked_at` field, and return the updated key record
3. IF the user attempts to revoke a key that is already revoked, THEN THE Backend SHALL return HTTP 409 with an error indicating the key is already revoked
4. WHEN an API_Key with status "revoked" is used in a request, THE Auth_Middleware SHALL reject the request with HTTP 401 and error code AUTH_UNAUTHORIZED
5. WHILE a key is revoked, THE Frontend SHALL display a "Revoked" badge and the revocation date instead of the "last used" timestamp
6. WHEN revocation succeeds, THE Frontend SHALL update the key row to the revoked visual state (reduced opacity, disabled copy and eye-toggle buttons) without a full page reload

### Requirement 5: API Key Authentication Middleware

**User Story:** As a developer, I want to authenticate API requests using an API key in the Authorization header, so that I can access protected endpoints without a JWT session.

#### Acceptance Criteria

1. WHEN a request contains an Authorization header with a Bearer token matching the prefix `mtd_key_`, THE Auth_Middleware SHALL treat the token as an API_Key and validate it by computing its SHA-256 hash and comparing it against stored Key_Hash values in the database
2. WHEN the API_Key hash matches a stored key with status "active", THE Auth_Middleware SHALL set the associated user ID in the request context and allow the request to proceed
3. IF the API_Key hash does not match any stored key with status "active", THEN THE Auth_Middleware SHALL reject the request with HTTP 401 and error code AUTH_UNAUTHORIZED without falling back to JWT validation
4. WHEN a Bearer token does not match the `mtd_key_` prefix, THE Auth_Middleware SHALL validate the token as a JWT using the existing JWT validation logic
5. WHEN a valid API_Key is used, THE Backend SHALL update the "last used" timestamp for that key asynchronously without blocking the request response

### Requirement 6: API Key Rate Limiting

**User Story:** As a system operator, I want to enforce per-key rate limits on API key authenticated requests, so that individual keys cannot overload the system.

#### Acceptance Criteria

1. THE Rate_Limiter SHALL enforce a configurable maximum number of requests per minute for each API_Key independently, with a default limit of 120 requests per minute per key
2. WHEN an API_Key exceeds its configured rate limit, THE Backend SHALL respond with HTTP 429 status code, a Retry-After header containing the number of seconds until the next request is allowed, and a JSON error body with error code "RATE_LIMIT_EXCEEDED"
3. WHEN a rate-limited request is received from one API_Key, THE Rate_Limiter SHALL NOT affect the remaining quota of any other API_Key
4. THE Frontend SHALL display the numeric rate limit value (requests per minute) in the usage summary section
5. IF an API_Key is not recognized or has been revoked, THEN THE Backend SHALL respond with HTTP 401 before applying rate limit evaluation

### Requirement 7: Navigation Update

**User Story:** As a user, I want to access the API Keys page from the navigation menu, so that I can manage my keys from anywhere in the application.

#### Acceptance Criteria

1. THE Frontend SHALL display an "API Keys" navigation item with a key icon (`fa-key`) in the UserDropdown component, positioned where the existing "Settings" link currently appears (between "Report history" and "Log out"), replacing the "Settings" link entirely
2. THE Frontend SHALL display an "API Keys" navigation item with a key icon (`fa-key`) in the MobileHamburgerMenu component, positioned where the existing "Settings" button currently appears (between "Report history" and "Log out"), replacing the "Settings" button entirely
3. WHEN the user clicks the "API Keys" navigation item in either the UserDropdown or MobileHamburgerMenu, THE Frontend SHALL navigate to the `/api-keys` route using an anchor element with href resolved via `resolve('/api-keys')`
4. THE Frontend SHALL use the i18n key `common.nav.apiKeys` for the navigation label, with the English value "API Keys" and the Czech value "API klíče"
5. WHEN the "API Keys" navigation item replaces the "Settings" link, THE Frontend SHALL remove the `onSettings` callback prop from both the UserDropdown and MobileHamburgerMenu component interfaces

### Requirement 8: API Key Page Layout

**User Story:** As a user, I want the API Keys page to be responsive and follow the application design system, so that I have a consistent experience across devices.

#### Acceptance Criteria

1. THE Frontend SHALL render the API Keys page with a page header containing a green key icon, title, and "Create new key" button
2. THE Frontend SHALL render a usage summary section with 2 stat cards (active keys, rate limit per minute)
3. IF the user has no API keys, THEN THE Frontend SHALL display the stat cards with zero values (0 active keys and the rate limit value)
4. THE Frontend SHALL render a security info box explaining that keys are shown only once after creation
5. THE Frontend SHALL render a usage guide section with code examples (Authorization header, cURL, JavaScript fetch)
6. WHILE the viewport width is below 1024px, THE Frontend SHALL render the usage guide as a collapsible accordion with all sections collapsed by default
7. WHILE the viewport width is 1024px or above, THE Frontend SHALL render the usage guide code blocks in a side-by-side grid layout
8. THE `/api-keys` route SHALL be accessible only to authenticated users; unauthenticated users SHALL be redirected to the login page by the existing auth guard

### Requirement 9: API Key Database Schema

**User Story:** As a developer, I want API keys stored securely in the database with proper indexing, so that key validation is fast and secure.

#### Acceptance Criteria

1. THE Backend SHALL store each API key record with fields: id (UUID primary key), user_id (UUID, NOT NULL), name (TEXT, NOT NULL, maximum 100 characters), key_hash (TEXT, NOT NULL, UNIQUE), key_prefix (TEXT, first 8 characters including prefix), key_suffix (TEXT, last 4 characters), status (TEXT, constrained to 'active' or 'revoked'), note (TEXT, nullable, maximum 500 characters), created_at (TIMESTAMPTZ, NOT NULL, defaults to NOW()), last_used_at (TIMESTAMPTZ, nullable), revoked_at (TIMESTAMPTZ, nullable)
2. THE Backend SHALL create a unique index on the key_hash column to enforce uniqueness and enable fast lookup during authentication
3. THE Backend SHALL enforce a foreign key relationship between the API key user_id and the auth.users table with ON DELETE CASCADE, so that deleting a user removes all associated API keys
4. IF the database operation fails during key creation, THEN THE Backend SHALL return an error response indicating the failure reason without storing a partial record
5. THE Backend SHALL create an index on the user_id column to support efficient listing of all API keys belonging to a specific user

### Requirement 10: API Key Copy and Reveal

**User Story:** As a user, I want to copy masked API keys and temporarily reveal them, so that I can use them in my applications.

#### Acceptance Criteria

1. WHEN the user clicks the copy button on an active key, THE Frontend SHALL copy the Key_Display_Hint value to the clipboard
2. IF the clipboard write operation fails (due to browser permissions or API unavailability), THEN THE Frontend SHALL display an inline error message indicating the copy failed
3. WHEN the user clicks the eye toggle button on an active key, THE Frontend SHALL toggle between showing the Key_Display_Hint (e.g., `mtd_key_••••Kx9p`) and a fully masked representation where all characters are replaced with dot characters
4. THE Frontend SHALL display the fully masked representation as the default state for each key row, requiring the user to click the eye toggle to reveal the Key_Display_Hint
5. WHEN a key value is successfully copied to the clipboard, THE Frontend SHALL change the copy button icon to a checkmark for 2 seconds before reverting to the default copy icon
