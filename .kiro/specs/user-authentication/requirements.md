# Requirements Document

## Introduction

User Authentication for MetaCleaner implements registration, login, and password reset flows across both the Go backend (API endpoints proxying to Supabase Auth) and the SvelteKit frontend (auth pages with multi-step UI flows). Only authenticated users may access the MetaCleaner application. Supabase handles user storage, email confirmation, and password reset codes. The backend exposes auth API endpoints that the frontend consumes, and Row Level Security (RLS) on Supabase ensures data isolation per user.

## Glossary

- **Auth_API**: The set of authentication-related HTTP endpoints exposed by the Backend at `/api/auth/*`
- **Backend**: The Go HTTP server application at `backend/metacleaner-server/`
- **Frontend**: The SvelteKit 5 web application at `frontend/metacleaner-app/`
- **Supabase_Auth**: The Supabase built-in authentication service that manages user accounts, sessions, email confirmation, and password resets
- **Access_Token**: A JWT issued by Supabase_Auth upon successful login, used to authorize API requests
- **Refresh_Token**: A long-lived token issued alongside the Access_Token, used to obtain a new Access_Token without re-authentication
- **Session**: The combination of Access_Token and Refresh_Token representing an authenticated user's active login state
- **RLS**: Row Level Security — PostgreSQL policies on Supabase tables that restrict data access to the currently authenticated user based on the JWT claims
- **Auth_Guard**: A client-side routing mechanism that redirects unauthenticated users to the login page and prevents access to protected routes
- **Auth_Middleware**: A server-side HTTP middleware on the Backend that validates the Access_Token from incoming requests and rejects unauthorized access
- **Password_Reset_Code**: A one-time code sent to the user's email by Supabase_Auth for verifying password reset requests
- **OAuth**: Open Authorization — a standard protocol that allows users to authenticate via third-party identity providers (Google, Apple) without sharing their password with the application
- **OAuth_Provider**: A third-party identity service (Google or Apple) configured in Supabase_Auth that handles user authentication and returns verified identity information
- **OAuth_Flow**: The complete sequence of redirecting the user to an OAuth_Provider, receiving an authorization code callback, and exchanging it for a Session via Supabase_Auth
- **OAuth_Callback_URL**: The Backend endpoint that receives the authorization code from the OAuth_Provider after the user authenticates, completing the OAuth_Flow
- **User_Profile**: A database record in the `profiles` table that stores user-specific data (first name, last name, email, subscription type, credits) linked to the Supabase auth.users table via user ID
- **Magic_Link**: A one-time-use URL sent to a user's email address that, when clicked, authenticates the user without requiring a password — the link contains a token that is exchanged for a Session via Supabase_Auth
- **Deep_Link**: A URL that, when opened on a mobile device with the app installed, launches the app directly instead of the browser — used for OAuth and Magic_Link callbacks in the Capacitor mobile app, configured via Android App Links (intent filters + Digital Asset Links) and iOS Universal Links (Apple App Site Association)

---

## Requirements

### Requirement 1: User Registration

**User Story:** As a new user, I want to create an account with my email, first name, last name, and password, so that I can access the MetaCleaner application.

#### Acceptance Criteria

1. WHEN a POST request is received at `/api/auth/register` with a valid email, first_name, last_name, and password, THE Auth_API SHALL create a new user account via Supabase_Auth and return HTTP 201 with a success message
2. WHEN a registration request contains an email that is already registered, THE Auth_API SHALL return HTTP 409 with an error message indicating the email is already in use
3. WHEN a registration request contains an email that does not conform to a standard email format (local-part@domain with a valid domain containing at least one dot), THE Auth_API SHALL return HTTP 400 with an error message identifying the validation failure
4. WHEN a registration request contains a password shorter than 8 characters or longer than 72 characters, THE Auth_API SHALL return HTTP 400 with an error message indicating the allowed password length range
5. WHEN a user account is successfully created, THE Supabase_Auth service SHALL send a confirmation email to the provided email address
6. WHILE a user has not confirmed their email, THE Auth_API SHALL reject login attempts for that user with HTTP 403 and an error message indicating email confirmation is required
7. WHEN a registration request is missing the email field, the first_name field, the last_name field, or the password field, THE Auth_API SHALL return HTTP 400 with an error message identifying the missing field
8. IF Supabase_Auth is unreachable or returns a server error during registration, THEN THE Auth_API SHALL return HTTP 503 with an error message indicating the authentication service is temporarily unavailable
9. WHEN a registration request contains a first_name or last_name field that is empty or contains only whitespace, THE Auth_API SHALL return HTTP 400 with an error message indicating the field is required and must be non-empty

---

### Requirement 2: User Login

**User Story:** As a registered user, I want to log in with my email and password, so that I can access my cleaning data and use the application.

#### Acceptance Criteria

1. WHEN a POST request is received at `/api/auth/login` with a JSON body containing a valid `email` and `password` for a confirmed user, THE Auth_API SHALL return HTTP 200 with a JSON response containing an Access_Token, Refresh_Token, token expiration time in seconds, and user profile data (email, user ID)
2. WHEN a login request contains incorrect credentials, THE Auth_API SHALL return HTTP 401 with a generic error message that does not reveal whether the email exists
3. WHEN a login request contains a valid email but the account has not been confirmed, THE Auth_API SHALL return HTTP 403 with an error message indicating email confirmation is required
4. WHEN a login request is missing the `email` field, the `password` field, or contains an empty value for either, THE Auth_API SHALL return HTTP 400 with an error message identifying the missing or empty field
5. THE Auth_API SHALL apply a rate limit of 5 requests per minute per IP on the login endpoint, returning HTTP 429 with a Retry-After header when exceeded

---

### Requirement 3: Token Refresh

**User Story:** As a logged-in user, I want my session to be extended automatically, so that I am not forced to re-login frequently during active use.

#### Acceptance Criteria

1. WHEN a POST request is received at `/api/auth/refresh` with a valid Refresh_Token, THE Auth_API SHALL return HTTP 200 with a new Access_Token (including expiration time), a new Refresh_Token, and user profile data (email, user ID)
2. WHEN a refresh request contains an expired or invalid Refresh_Token, THE Auth_API SHALL return HTTP 401 with an error message indicating the session has expired
3. WHEN the Access_Token is within 60 seconds of expiration and the user has an active browser session, THE Frontend SHALL automatically send a refresh request to `/api/auth/refresh` without displaying any loading indicator or blocking user interaction
4. IF the automatic token refresh fails with HTTP 401, THEN THE Frontend SHALL clear all locally stored tokens and redirect the user to the login page
5. IF the automatic token refresh fails due to a network error, THEN THE Frontend SHALL retry the refresh request once after 5 seconds before clearing tokens and redirecting to the login page

---

### Requirement 4: User Logout

**User Story:** As a logged-in user, I want to log out of the application, so that my session is terminated and my account is secured.

#### Acceptance Criteria

1. WHEN a POST request is received at `/api/auth/logout` with a valid Access_Token, THE Auth_API SHALL invalidate the user's Session (both Access_Token and Refresh_Token) via Supabase_Auth and return HTTP 200 with a JSON body containing a success confirmation message
2. WHEN the user triggers logout from the Frontend, THE Frontend SHALL send a POST request to `/api/auth/logout`, clear all locally stored tokens (Access_Token and Refresh_Token), and redirect the user to the `/login` page
3. IF the logout request contains an expired, invalid, or missing Access_Token, THEN THE Auth_API SHALL return HTTP 401 with an error message indicating the token is invalid
4. IF the Frontend logout API call fails due to a network error or non-200 response, THEN THE Frontend SHALL still clear all locally stored tokens and redirect the user to the `/login` page

---

### Requirement 5: Password Reset Flow

**User Story:** As a user who forgot my password, I want to reset it using my email, so that I can regain access to my account.

#### Acceptance Criteria

1. WHEN a POST request is received at `/api/auth/forgot-password` with a registered email, THE Auth_API SHALL trigger Supabase_Auth to send a Password_Reset_Code to that email and return HTTP 200 with a success message
2. WHEN a forgot-password request contains an unregistered email, THE Auth_API SHALL return HTTP 200 with the same success message (to prevent email enumeration)
3. WHEN a forgot-password request contains an invalid email format or a missing email field, THE Auth_API SHALL return HTTP 400 with an error message indicating the validation failure
4. WHEN a POST request is received at `/api/auth/verify-reset-code` with a valid email and Password_Reset_Code, THE Auth_API SHALL return HTTP 200 with a short-lived access token that authorizes only the reset-password endpoint
5. WHEN a verify-reset-code request contains an invalid or expired code, THE Auth_API SHALL return HTTP 400 with an error message indicating the code is invalid or expired
6. WHEN a POST request is received at `/api/auth/reset-password` with a valid access token obtained from verify-reset-code and a new password between 8 and 128 characters, THE Auth_API SHALL update the user's password via Supabase_Auth and return HTTP 200 with a success message
7. WHEN a reset-password request contains a new password shorter than 8 characters or longer than 128 characters, THE Auth_API SHALL return HTTP 400 with an error message indicating the password length requirements
8. WHEN a reset-password request is missing a valid access token from the verify-reset-code step or the token has expired, THE Auth_API SHALL return HTTP 401 with an error message indicating the reset session is invalid or expired
9. IF Supabase_Auth is unreachable during any password reset step, THEN THE Auth_API SHALL return HTTP 503 with an error message indicating the service is temporarily unavailable

---

### Requirement 6: Protected Route Access

**User Story:** As an application owner, I want only authenticated users to access the MetaCleaner application, so that unauthorized users cannot use the service.

#### Acceptance Criteria

1. THE Auth_Middleware SHALL validate the Access_Token on all Backend API endpoints except the auth endpoints (`/api/auth/*`) and the health endpoint (`/api/health`) by verifying the token signature and confirming the token has not expired
2. WHEN a request to a protected endpoint lacks an Access_Token or contains a malformed Access_Token that cannot be parsed, THE Auth_Middleware SHALL return HTTP 401 with an error message indicating authentication is required
3. WHEN a request contains an expired Access_Token, THE Auth_Middleware SHALL return HTTP 401 with an error message indicating the token has expired
4. WHEN an unauthenticated user attempts to access any protected route, THE Auth_Guard on the Frontend SHALL redirect the user to the `/login` page
5. WHEN an authenticated user navigates to an auth page (`/login`, `/register`, `/forgot-password`), THE Auth_Guard on the Frontend SHALL redirect the user to the `/` page
6. WHEN a request to a protected endpoint contains an Access_Token with an invalid signature, THE Auth_Middleware SHALL return HTTP 401 with an error message indicating the token is invalid

---

### Requirement 7: Row Level Security Configuration

**User Story:** As an application owner, I want database access restricted to the authenticated user's own data, so that users cannot access or modify other users' data.

#### Acceptance Criteria

1. THE Supabase database SHALL have RLS enabled on all application tables (cleaning_jobs, job_files, cleaning_reports)
2. THE RLS policies SHALL allow a user to SELECT, INSERT, UPDATE, and DELETE only rows where the `user_id` column matches the authenticated user's ID from the JWT `sub` claim
3. WHEN the Backend makes requests to Supabase_DB on behalf of an authenticated user, THE Backend SHALL forward the user's access token in the Authorization header so that RLS policies are enforced per-user
4. THE database migration script SHALL include a `user_id` column (UUID, NOT NULL, referencing auth.users) on the cleaning_jobs, job_files, and cleaning_reports tables
5. WHEN a new row is inserted into cleaning_jobs, job_files, or cleaning_reports, THE Backend SHALL set the `user_id` column value to the authenticated user's ID extracted from the JWT `sub` claim
6. IF a user requests a single resource (e.g., GET /api/reports/{id}) that belongs to another user, THEN THE Backend SHALL return HTTP 404 with an error message indicating the resource was not found
7. IF a user requests a list endpoint (e.g., GET /api/reports) with no rows matching their `user_id`, THEN THE Backend SHALL return HTTP 200 with an empty collection

---

### Requirement 8: Frontend Login Page

**User Story:** As a user, I want a login page with an email and password form, so that I can authenticate and access the application.

#### Acceptance Criteria

1. THE Frontend login page SHALL display a form with an email input field, a password input field with a visibility toggle button, a "Login" submit button, a "Forgot password?" link, a "Register" link, a "Sign in with Google" button, a "Sign in with Apple" button, and a "Send magic link" button alongside the email input in a separate section separated from the password login by an "or" divider
2. WHEN the login form is submitted with a valid email format and a non-empty password, THE Frontend SHALL call the Auth_API login endpoint, store the returned tokens, and redirect to the main application page
3. IF the login API returns an error, THEN THE Frontend SHALL display the error message below the form without clearing the email field
4. WHILE the login request is in progress, THE Frontend SHALL disable the submit button and display a loading indicator
5. THE Frontend login page SHALL match the design mockups in `.design/auth-login-form-desktop.html` and `.design/auth-login-form-mobile.html`
6. IF the login form is submitted with an invalid email format or an empty password, THEN THE Frontend SHALL display inline validation errors below the respective input fields and SHALL NOT call the Auth_API login endpoint
7. THE Frontend login page SHALL display the "Sign in with Google" and "Sign in with Apple" buttons visually separated from the email/password form by a divider with the text "or"
8. WHEN the user clicks the "Sign in with Google" button, THE Frontend SHALL initiate the OAuth_Flow by calling the Auth_API OAuth initiation endpoint with provider set to "google"
9. WHEN the user clicks the "Sign in with Apple" button, THE Frontend SHALL initiate the OAuth_Flow by calling the Auth_API OAuth initiation endpoint with provider set to "apple"

---

### Requirement 9: Frontend Registration Page

**User Story:** As a new user, I want a registration page with a form and email verification step, so that I can create my account and confirm my email.

#### Acceptance Criteria

1. THE Frontend registration page SHALL display a form with first name input, last name input, email input, password input (with visibility toggle), password confirmation input, a "Register" submit button, a "Login" link, a "Sign in with Google" button, and a "Sign in with Apple" button
2. WHEN the user types in the password input, THE Frontend SHALL display a password strength indicator showing the strength level based on length (minimum 8 characters), uppercase letters, numbers, and special characters
3. WHEN the password and password confirmation do not match, THE Frontend SHALL display a validation error below the confirmation field and prevent form submission
4. IF the email input is empty or does not match a valid email format, THEN THE Frontend SHALL display a validation error below the email field and prevent form submission
5. IF the first name input or last name input is empty, THEN THE Frontend SHALL display a validation error below the respective field indicating the field is required and prevent form submission
6. WHEN the registration form is submitted successfully, THE Frontend SHALL transition to an email verification message view on the same page displaying the submitted email address and a "Back to login" link
7. WHEN the registration API returns an error, THE Frontend SHALL display the error message below the form and re-enable the submit button
8. WHILE the registration request is in progress, THE Frontend SHALL disable the submit button and display a loading indicator within the button
9. THE Frontend registration page SHALL match the design mockups in `.design/auth-registration-form-desktop.html` and `.design/auth-registration-form-mobile.html`
10. THE email verification view SHALL match the design mockups in `.design/auth-check-email-desktop.html` and `.design/auth-check-email-mobile.html`
11. THE Frontend registration page SHALL display the "Sign in with Google" and "Sign in with Apple" buttons visually separated from the email/password form by a divider with the text "or"
12. WHEN the user clicks the "Sign in with Google" button on the registration page, THE Frontend SHALL initiate the OAuth_Flow by calling the Auth_API OAuth initiation endpoint with provider set to "google"
13. WHEN the user clicks the "Sign in with Apple" button on the registration page, THE Frontend SHALL initiate the OAuth_Flow by calling the Auth_API OAuth initiation endpoint with provider set to "apple"

---

### Requirement 10: Frontend Password Reset Page

**User Story:** As a user who forgot my password, I want a multi-step password reset flow on a single page, so that I can reset my password without navigating between multiple pages.

#### Acceptance Criteria

1. THE Frontend password reset page SHALL display an initial form with an email input field, a "Send code" submit button, and a "Back to login" link
2. WHEN the user submits the email form with a valid email address and the request succeeds, THE Frontend SHALL transition on the same page to the code input view displaying the submitted email address and 6 individual single-digit numeric input fields for the verification code
3. IF the user submits the email form with an empty or invalid email format, THEN THE Frontend SHALL display an inline validation error below the email input without submitting the request
4. WHEN the code view is displayed, THE Frontend SHALL show a countdown timer starting at 15 minutes and a "Resend code" button that resets the countdown and clears the code inputs when pressed
5. WHEN a valid 6-digit code is submitted and the request succeeds, THE Frontend SHALL transition on the same page to the new password form with a password input, a confirm password input, password visibility toggle buttons, and a password strength indicator
6. IF the user submits the new password form with passwords that do not match, THEN THE Frontend SHALL display an inline error message indicating the mismatch below the confirm password field
7. WHEN the new password is submitted successfully, THE Frontend SHALL display a success confirmation view on the same page, then redirect the user to the login page when the user clicks the "Log in" button
8. IF any step's API request returns an error, THEN THE Frontend SHALL display the error message inline within the current step view without navigating away
9. WHILE any API request is in progress, THE Frontend SHALL disable the submit button and display a loading indicator within the button
10. THE Frontend password reset page SHALL display a 3-step progress bar above the form card indicating the current step (active), completed steps (with checkmark), and remaining steps (inactive)
11. THE Frontend password reset email step SHALL match the design mockups in `.design/auth-forgot-password-desktop.html` and `.design/auth-forgot-password-mobile.html`
12. THE Frontend password reset code step SHALL match the design mockups in `.design/auth-check-code-desktop.html` and `.design/auth-check-code-mobile.html`
13. THE Frontend password reset new password step SHALL match the design mockups in `.design/auth-new-password-desktop.html` and `.design/auth-new-password-mobile.html`

---

### Requirement 11: Backend Auth API Structure

**User Story:** As a frontend developer, I want consistent auth API endpoints with clear request/response formats, so that I can integrate authentication in the frontend reliably.

#### Acceptance Criteria

1. THE Auth_API SHALL expose the following endpoints: POST `/api/auth/register`, POST `/api/auth/login`, POST `/api/auth/logout`, POST `/api/auth/refresh`, POST `/api/auth/forgot-password`, POST `/api/auth/verify-reset-code`, POST `/api/auth/reset-password`, GET `/api/auth/me`, POST `/api/auth/magic-link`, GET `/api/auth/magic-link/callback`
2. THE Auth_API SHALL return all error responses in the same JSON format as existing Backend endpoints: `{"error": "<code>", "message": "<description>", "timestamp": "<ISO 8601>"}`
3. THE Auth_API SHALL accept request bodies in JSON format with Content-Type: application/json
4. IF a request to an Auth_API endpoint has a missing or invalid Content-Type header or contains malformed JSON, THEN THE Auth_API SHALL return HTTP 400 status with an error message indicating the request format is invalid
5. THE Auth_API endpoints SHALL be exempt from the existing rate limiter applied to the upload endpoint
6. THE Auth_API SHALL apply a separate rate limit of 5 requests per minute per IP on the `/api/auth/login`, `/api/auth/register`, `/api/auth/forgot-password`, and `/api/auth/verify-reset-code` endpoints to prevent brute-force attacks
7. WHEN a client exceeds the auth rate limit, THE Auth_API SHALL return HTTP 429 status with an error message indicating the limit has been exceeded and a Retry-After header with the value in seconds until the next request is allowed
8. WHEN a login or token refresh request succeeds, THE Auth_API SHALL return a JSON response containing an access token, a refresh token, and the token expiration duration in seconds

---

### Requirement 12: Session Storage on Frontend

**User Story:** As a user, I want my login session to persist across page reloads and browser tabs, so that I am not logged out unexpectedly.

> **Implementation note (XSS hardening):** The Access_Token is intentionally kept **in-memory only** (not stored in localStorage) to reduce XSS exfiltration risk. Only the Refresh_Token and its expiry are persisted in localStorage under `mc_refresh_token` / `mc_token_expires_at`. On page reload, `_restore()` silently calls `/api/auth/refresh` to obtain a new in-memory Access_Token from the persisted Refresh_Token. This satisfies Reqs 12.2–12.7 without violating them; Req 12.1 below reflects this corrected model.

#### Acceptance Criteria

1. THE Frontend SHALL store the Refresh_Token in localStorage under `mc_refresh_token` so that sessions survive page reloads. The Access_Token SHALL be kept in-memory only (not written to `mc_access_token` in localStorage) to limit XSS exposure; any previously stored `mc_access_token` value is actively purged on startup.
2. THE Frontend SHALL include the Access_Token in the Authorization header (Bearer scheme) for all API requests to protected Backend endpoints (all endpoints except `/api/auth/*` and `/api/health`)
3. WHEN the in-memory Access_Token's JWT `exp` claim indicates the token will expire within 60 seconds and a Refresh_Token exists in localStorage, THE Frontend SHALL call the `/api/auth/refresh` endpoint to obtain a new in-memory Access_Token before making the API request
4. IF the token refresh request fails (HTTP 401 or network error), THEN THE Frontend SHALL clear all stored tokens from localStorage and redirect the user to the login page
5. WHEN both the in-memory Access_Token and the localStorage Refresh_Token are absent or the Access_Token is expired and no Refresh_Token exists, THE Frontend SHALL redirect the user to the login page
6. WHEN the user triggers logout, THE Frontend SHALL clear the in-memory Access_Token and remove the Refresh_Token from localStorage before redirecting to the login page
7. WHILE a token refresh request is in progress, THE Frontend SHALL queue any concurrent API requests and resolve them with the new Access_Token once the refresh completes, rather than triggering multiple simultaneous refresh calls

---

### Requirement 13: User ID Association with Data

**User Story:** As a developer, I want all user-generated data to be associated with the authenticated user, so that data isolation is enforced at the application level.

#### Acceptance Criteria

1. WHEN the Backend creates a new cleaning_job record, THE Backend SHALL set the `user_id` column to the authenticated user's ID extracted from the Access_Token
2. WHEN the Backend creates new job_files records, THE Backend SHALL set the `user_id` column to the authenticated user's ID
3. WHEN the Backend creates a new cleaning_reports record, THE Backend SHALL set the `user_id` column to the authenticated user's ID
4. WHEN the Backend queries data for GET /api/jobs/{id}, GET /api/reports, GET /api/reports/{id}, or GET /api/reports/{id}/pdf endpoints, THE Backend SHALL include a `user_id` filter matching the authenticated user's ID in the query (in addition to RLS enforcement)
5. THE Backend SHALL extract the user ID from the validated Access_Token JWT `sub` claim and verify it is a non-empty UUID before using it in any database operation
6. IF the Access_Token does not contain a valid `sub` claim or the extracted user ID is empty, THEN THE Backend SHALL return HTTP 401 with an error message indicating authentication is invalid and SHALL NOT create or query any records
7. WHEN a file download request is received at GET /api/files/{id}/download, THE Backend SHALL verify that the requested file belongs to the authenticated user before serving the file, and return HTTP 404 if the file belongs to a different user

---

### Requirement 14: OAuth Backend Flow

**User Story:** As a user, I want to sign in with my Google or Apple account, so that I can access MetaCleaner without creating a separate email/password account.

#### Acceptance Criteria

1. THE Auth_API SHALL expose a GET endpoint at `/api/auth/oauth/{provider}` where `{provider}` is either "google" or "apple", which initiates the OAuth_Flow by returning an HTTP 302 redirect to the OAuth_Provider's authorization URL
2. THE Auth_API SHALL expose a GET endpoint at `/api/auth/oauth/callback` that receives the authorization code from the OAuth_Provider and exchanges it for a Session via Supabase_Auth
3. WHEN the OAuth callback is received with a valid authorization code, THE Auth_API SHALL return HTTP 302 redirecting to the Frontend application with the Access_Token, Refresh_Token, and token expiration time encoded as URL query parameters
4. WHEN a user authenticates via OAuth_Provider for the first time (no existing account with that email), THE Supabase_Auth service SHALL automatically create a new user account linked to the OAuth_Provider identity
5. WHEN a user authenticates via OAuth_Provider and an account with the same email already exists (registered via email/password), THE Supabase_Auth service SHALL link the OAuth identity to the existing account and issue a valid Session
6. WHEN a user authenticates via OAuth_Provider, THE Auth_API SHALL treat the user's email as confirmed (skipping email confirmation) because the OAuth_Provider has already verified the email
7. IF the OAuth callback receives an invalid or expired authorization code, THEN THE Auth_API SHALL redirect to the Frontend login page with an error query parameter indicating authentication failed
8. IF the `{provider}` path parameter is not "google" or "apple", THEN THE Auth_API SHALL return HTTP 400 with an error message indicating the provider is not supported
9. IF Supabase_Auth is unreachable during the OAuth_Flow, THEN THE Auth_API SHALL redirect to the Frontend login page with an error query parameter indicating the authentication service is temporarily unavailable
10. THE Supabase project SHALL have Google and Apple configured as enabled OAuth providers with valid client IDs and client secrets
11. THE OAuth_Callback_URL configured in both Google and Apple developer consoles SHALL match the Auth_API callback endpoint URL
12. THE OAuth_Callback_URL format SHALL use the production domain URL (e.g., `metacleaner.fly.dev/api/auth/oauth/callback`) so that the callback is compatible with Deep_Link interception by the mobile app

---

### Requirement 15: OAuth Frontend Integration

**User Story:** As a user, I want to click a "Sign in with Google" or "Sign in with Apple" button and be authenticated seamlessly, so that I can access the application without manual registration.

#### Acceptance Criteria

1. WHEN the user clicks the "Sign in with Google" or "Sign in with Apple" button, THE Frontend SHALL redirect the browser to the Auth_API OAuth initiation endpoint (`/api/auth/oauth/google` or `/api/auth/oauth/apple`)
2. WHEN the Frontend receives a redirect back from the OAuth_Flow containing Access_Token and Refresh_Token as URL query parameters, THE Frontend SHALL store the tokens in localStorage and redirect the user to the main application page
3. WHEN the Frontend receives a redirect back from the OAuth_Flow containing an error query parameter, THE Frontend SHALL display the error message on the login page
4. THE Frontend SHALL remove the token query parameters from the URL after extracting and storing them, so that tokens are not visible in the browser address bar or history
5. WHILE the OAuth_Flow is in progress (between clicking the OAuth button and receiving the redirect back), THE Frontend SHALL disable both OAuth buttons to prevent duplicate authentication attempts
6. IF the OAuth redirect returns without any tokens or error parameter, THEN THE Frontend SHALL display a generic authentication error message on the login page

---

### Requirement 16: User Profile

**User Story:** As a registered user, I want a profile record to be created automatically when I sign up, so that the application can store my personal data and manage subscription-related attributes.

#### Acceptance Criteria

1. THE Supabase database SHALL have a `profiles` table with the following columns: `id` (UUID, primary key, foreign key referencing auth.users), `first_name` (text, NOT NULL), `last_name` (text, NOT NULL), `email` (text, NOT NULL), `subscription_type` (enum of "free", "pro", "premium", default "free"), `credits` (integer, default 3), `created_at` (timestamptz, default now), `updated_at` (timestamptz, default now)
2. WHEN a user registers via email/password, THE Backend SHALL create a User_Profile record with the `first_name` and `last_name` values from the registration form, the user's email, default `subscription_type` ("free"), and `credits` set to 3 (trial credits)
3. WHEN a user registers via OAuth_Provider, THE Backend SHALL create a User_Profile record with `first_name` and `last_name` extracted from the OAuth_Provider's identity data (if available), the user's email, default `subscription_type` ("free"), and `credits` set to 3 (trial credits)
4. IF the OAuth_Provider identity data does not include first_name or last_name, THEN THE Backend SHALL set the missing fields to an empty string in the User_Profile record
5. WHEN a user registers via Magic_Link for the first time, THE Backend SHALL create a User_Profile record with empty `first_name` and `last_name` fields, the user's email, default `subscription_type` ("free"), and `credits` set to 3 (trial credits)
6. THE Backend SHALL assign trial credits (3) exactly once per new account creation, regardless of the registration method (email/password, OAuth, or Magic_Link)
7. THE Auth_API SHALL expose a GET endpoint at `/api/auth/me` that returns the authenticated user's User_Profile data (id, first_name, last_name, email, subscription_type, credits, created_at, updated_at)
8. WHEN a GET request is received at `/api/auth/me` without a valid Access_Token, THE Auth_API SHALL return HTTP 401 with an error message indicating authentication is required
9. THE Supabase database SHALL have RLS enabled on the `profiles` table with policies allowing a user to SELECT and UPDATE only the row where the `id` column matches the authenticated user's ID from the JWT `sub` claim
10. THE `subscription_type` and `credits` columns SHALL be included in the `profiles` table schema with their default values but SHALL NOT have any associated business logic implemented in this feature

---

### Requirement 17: Magic Link Authentication (Backend)

**User Story:** As a user, I want to log in via a magic link sent to my email, so that I can access MetaCleaner without remembering a password.

#### Acceptance Criteria

1. WHEN a POST request is received at `/api/auth/magic-link` with a valid email address, THE Auth_API SHALL trigger Supabase_Auth signInWithOtp to send a Magic_Link email to the provided address and return HTTP 200 with a success message
2. WHEN the email provided to `/api/auth/magic-link` is not registered, THE Supabase_Auth service SHALL automatically create a new user account for that email (no email confirmation required since clicking the Magic_Link proves email ownership)
3. THE Magic_Link email SHALL contain a URL that, when clicked, authenticates the user and redirects to the Auth_API callback endpoint
4. THE Auth_API SHALL expose a GET endpoint at `/api/auth/magic-link/callback` that receives the token from the Magic_Link click and exchanges it for a Session via Supabase_Auth
5. WHEN the Magic_Link callback receives a valid token, THE Auth_API SHALL return HTTP 302 redirecting to the Frontend application with the Access_Token, Refresh_Token, and token expiration time encoded as URL query parameters (same pattern as OAuth_Callback_URL)
6. THE Auth_API SHALL apply a rate limit of 3 requests per email per 10 minutes on the `/api/auth/magic-link` endpoint, returning HTTP 429 with a Retry-After header when exceeded
7. THE Magic_Link SHALL expire after 1 hour from the time it was sent
8. WHEN a new account is created via Magic_Link, THE Backend SHALL create a User_Profile record with empty `first_name` and `last_name` fields, the user's email, default `subscription_type` ("free"), and `credits` set to 3 (trial credits)
9. WHEN a user authenticates via Magic_Link and the account already exists, THE Backend SHALL NOT modify the existing User_Profile credits value
10. IF the Magic_Link callback receives an expired or invalid token, THEN THE Auth_API SHALL redirect to the Frontend login page with an error query parameter indicating the link is expired or invalid
11. IF a POST request to `/api/auth/magic-link` contains an invalid email format or a missing email field, THEN THE Auth_API SHALL return HTTP 400 with an error message indicating the validation failure
12. IF Supabase_Auth is unreachable during the Magic_Link flow, THEN THE Auth_API SHALL return HTTP 503 with an error message indicating the authentication service is temporarily unavailable
13. THE Magic_Link callback URL format SHALL use the production domain URL (e.g., `metacleaner.fly.dev/api/auth/magic-link/callback`) so that the callback is compatible with Deep_Link interception by the mobile app

---

### Requirement 18: Magic Link Frontend Integration

**User Story:** As a user, I want to request a magic link from the login page and be authenticated when I click it, so that I can access MetaCleaner without a password.

#### Acceptance Criteria

1. THE Frontend login page SHALL display a "Send magic link" button alongside the email input field in a separate section from the password login, separated by an "or" divider
2. WHEN the user enters a valid email and clicks the "Send magic link" button, THE Frontend SHALL call the Auth_API magic link endpoint at POST `/api/auth/magic-link` with the entered email
3. WHEN the magic link request succeeds, THE Frontend SHALL transition to a "Check your email" view displaying the submitted email address, a message indicating a magic link has been sent, and a "Back to login" link
4. WHILE the magic link request is in progress, THE Frontend SHALL disable the "Send magic link" button and display a loading indicator
5. IF the magic link request returns an error (HTTP 429 rate limit or HTTP 400 validation error), THEN THE Frontend SHALL display the error message below the magic link section without navigating away
6. WHEN the Frontend receives a redirect from the Magic_Link callback containing Access_Token and Refresh_Token as URL query parameters, THE Frontend SHALL store the tokens in localStorage and redirect the user to the main application page
7. THE Frontend SHALL remove the token query parameters from the URL after extracting and storing them, so that tokens are not visible in the browser address bar or history
8. WHEN the Frontend receives a redirect from the Magic_Link callback containing an error query parameter, THE Frontend SHALL display the error message on the login page
9. IF the "Send magic link" button is clicked with an empty or invalid email format, THEN THE Frontend SHALL display an inline validation error below the email input field and SHALL NOT call the Auth_API magic link endpoint

---

### Requirement 19: Mobile Deep Link Configuration

**User Story:** As a mobile app user, I want OAuth and Magic Link authentication callbacks to open the app directly instead of the browser, so that I can complete authentication seamlessly within the app.

#### Acceptance Criteria

1. THE Android app SHALL declare intent filters in `AndroidManifest.xml` for the URLs `metacleaner.fly.dev/api/auth/oauth/callback` and `metacleaner.fly.dev/api/auth/magic-link/callback` with `autoVerify="true"` to enable Android App Links
2. THE Backend SHALL serve a Digital Asset Links file at `GET /.well-known/assetlinks.json` containing the app package name (`com.metacleaner.app`) and SHA-256 certificate fingerprint for Android App Links domain verification
3. THE Backend SHALL serve the `/.well-known/assetlinks.json` endpoint as a static JSON response with Content-Type `application/json` without requiring authentication
4. THE Frontend Capacitor app SHALL use `App.addListener('appUrlOpen', ...)` to intercept Deep_Link URLs when the app is opened via an auth callback
5. WHEN the Capacitor app intercepts a Deep_Link URL containing Access_Token and Refresh_Token as query parameters, THE Frontend SHALL extract the tokens and store them in localStorage using the same logic as the web browser token extraction
6. THE Frontend auth token extraction logic SHALL work in both web browser context (reading from `window.location` query parameters) and Capacitor Deep_Link context (reading from the URL passed to the `appUrlOpen` listener)
7. WHERE iOS deployment is configured, THE Backend SHALL serve an Apple App Site Association file at `GET /.well-known/apple-app-site-association` containing the app identifier and allowed URL paths for Universal Links
8. THE `/.well-known/apple-app-site-association` endpoint SHALL return the response with Content-Type `application/json` without requiring authentication
9. WHEN the Capacitor app intercepts a Deep_Link URL containing an error query parameter, THE Frontend SHALL display the error message on the login page using the same logic as the web browser error handling
10. THE Deep_Link configuration SHALL be prepared for mobile deployment; the actual Android and iOS developer console setup (uploading signing certificates, verifying domain ownership) is a manual step documented separately
