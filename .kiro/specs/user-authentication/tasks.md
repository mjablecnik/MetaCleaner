# Implementation Plan: User Authentication

## Overview

This plan implements user authentication for MetaCleaner spanning the Go backend (auth API endpoints proxying to Supabase Auth) and the SvelteKit 5 frontend (auth pages, token management, route guards). Implementation is structured to build foundational infrastructure first, then handlers and pages, followed by integration wiring.

## Tasks

- [ ] 1. Backend auth infrastructure
  - [ ] 1.1 Create Supabase Auth client (`source/supabase_auth.go`)
    - Implement `SupabaseAuthClient` struct with `httpClient`, `baseURL`, `apiKey`, `serviceKey`, `jwtSecret` fields
    - Implement methods: `SignUp`, `SignInWithPassword`, `SignInWithOtp`, `RefreshToken`, `SignOut`, `ResetPasswordForEmail`, `VerifyOTP`, `UpdateUser`, `GetOAuthURL`, `ExchangeCodeForSession`, `GetUser`
    - Load new env vars: `SUPABASE_JWT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `OAUTH_CALLBACK_URL`, `MAGIC_LINK_CALLBACK_URL`, `FRONTEND_URL`
    - Update `.env.example` with new keys
    - _Requirements: 11.1, 14.2, 17.4, 1.1, 2.1, 3.1, 5.1_

  - [ ] 1.2 Create auth middleware (`source/auth_middleware.go`)
    - Implement `AuthMiddleware` struct with `jwtSecret` and `supabaseURL`
    - Implement `Authenticate(r *http.Request) (string, error)` — extract Bearer token, validate JWT signature and expiry, return `sub` claim as user ID
    - Implement `Middleware(next http.Handler) http.Handler` — wrap handler with auth check
    - Exempt paths: `/api/auth/*`, `/api/health`, `/.well-known/*`
    - Return proper error codes: `AUTH_UNAUTHORIZED`, `AUTH_TOKEN_EXPIRED`, `AUTH_TOKEN_INVALID`
    - _Requirements: 6.1, 6.2, 6.3, 6.6, 13.5, 13.6_

  - [ ] 1.3 Create auth rate limiter (`source/auth_rate_limiter.go`)
    - Implement per-IP rate limiting separate from existing upload rate limiter
    - Limits: 5 req/min for `/api/auth/login`, `/api/auth/register`, `/api/auth/forgot-password`, `/api/auth/verify-reset-code`
    - Limit: 3 req/email+IP/10 min for `/api/auth/magic-link`
    - Return HTTP 429 with `Retry-After` header when exceeded
    - _Requirements: 2.5, 11.5, 11.6, 11.7, 17.6_

  - [ ] 1.4 Create auth models and error codes (`source/auth_models.go`)
    - Define `AuthSession`, `AuthUser`, `Profile` structs
    - Define registration/login request/response structs
    - Define all auth error codes as constants (`AUTH_INVALID_REQUEST`, `AUTH_INVALID_EMAIL`, etc.)
    - Implement consistent error response helper matching existing `{"error", "message", "timestamp"}` format
    - _Requirements: 11.2, 11.3, 11.4, 16.1_

- [ ] 2. Backend auth handlers
  - [ ] 2.1 Implement register handler
    - POST `/api/auth/register` — validate email format, password length (8–72), non-empty first/last name
    - Call `SupabaseAuthClient.SignUp` with email, password, metadata
    - On success: create profile record in `profiles` table with default `subscription_type="free"` and `credits=3`
    - Return HTTP 201 with success message
    - Handle errors: 409 email exists, 400 validation, 503 Supabase unreachable
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.7, 1.8, 1.9, 16.2, 16.6_

  - [ ] 2.2 Implement login handler
    - POST `/api/auth/login` — validate email/password present
    - Call `SupabaseAuthClient.SignInWithPassword`
    - Return HTTP 200 with `access_token`, `refresh_token`, `expires_in`, user data
    - Return HTTP 401 generic error on bad credentials (anti-enumeration)
    - Return HTTP 403 if email not confirmed
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 11.8_

  - [ ] 2.3 Implement logout, refresh, and me handlers
    - POST `/api/auth/logout` — invalidate session via Supabase, return 200
    - POST `/api/auth/refresh` — exchange refresh token for new session, return 200 with new tokens
    - GET `/api/auth/me` — return authenticated user's profile data from `profiles` table
    - Handle 401 for invalid/expired tokens
    - _Requirements: 3.1, 3.2, 4.1, 4.3, 16.7, 16.8_

  - [ ] 2.4 Implement password reset handlers
    - POST `/api/auth/forgot-password` — trigger Supabase password reset email, always return 200 (anti-enumeration)
    - POST `/api/auth/verify-reset-code` — verify OTP code, return short-lived access token
    - POST `/api/auth/reset-password` — update password via Supabase using verified token, validate length 8–128
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

  - [ ] 2.5 Implement OAuth handlers
    - GET `/api/auth/oauth/{provider}` — validate provider (google/apple), redirect to Supabase OAuth URL
    - GET `/api/auth/oauth/callback` — exchange code for session, redirect to frontend with tokens as query params
    - Create profile on first OAuth login (extract name from identity data, fallback to empty strings)
    - Handle errors: invalid provider 400, invalid code redirect with error param, Supabase unreachable redirect with error
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8, 14.9, 16.3, 16.4, 16.6_

  - [ ] 2.6 Implement magic link handlers
    - POST `/api/auth/magic-link` — validate email, call `SignInWithOtp`, return 200
    - GET `/api/auth/magic-link/callback` — exchange token for session, redirect to frontend with tokens
    - Callback URL must use production domain format (e.g., `metacleaner.fly.dev/api/auth/magic-link/callback`) for Deep_Link compatibility
    - Create profile for new magic link users (empty first/last name, credits=3)
    - Do not modify credits for existing accounts
    - Magic link expiry (1 hour) is configured in Supabase dashboard — no backend code needed
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 17.8, 17.9, 17.10, 17.11, 17.12, 17.13, 16.5, 16.6_

  - [ ] 2.7 Implement well-known endpoints (`source/well_known.go`)
    - GET `/.well-known/assetlinks.json` — serve Android App Links JSON with package name and cert fingerprint
    - GET `/.well-known/apple-app-site-association` — serve iOS Universal Links JSON
    - Both endpoints: Content-Type `application/json`, no authentication required
    - _Requirements: 19.2, 19.3, 19.7, 19.8_

  - [ ] 2.8 Wire auth routes into router (`source/router.go`)
    - Register all `/api/auth/*` routes and `/.well-known/*` routes
    - Apply auth rate limiter middleware to auth endpoints
    - Apply auth middleware to all protected endpoints (exclude auth, health, well-known)
    - Update existing handlers to extract user_id from middleware context and include in DB queries
    - _Requirements: 7.3, 7.5, 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ] 3. Checkpoint — Backend auth complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Database schema and RLS
  - [ ] 4.1 Create auth migration script (`scripts/migration002.sql`)
    - Create `profiles` table with all columns (id UUID PK FK, first_name, last_name, email, subscription_type, credits, created_at, updated_at)
    - Add `user_id` column (UUID NOT NULL FK) to `cleaning_jobs`, `job_files`, `cleaning_reports`
    - Enable RLS on all four tables
    - Create RLS policies: profiles (select/update own), cleaning_jobs (select/insert/update/delete own), same for job_files and cleaning_reports
    - Add CHECK constraint on subscription_type (free/pro/premium)
    - _Requirements: 7.1, 7.2, 7.4, 7.6, 7.7, 16.1, 16.9_

- [ ] 5. Frontend auth store and API client
  - [x] 5.1 Create auth store (`src/lib/auth/auth.svelte.ts`)
    - Implement reactive auth state using Svelte 5 runes: `accessToken`, `refreshToken`, `user`, `isAuthenticated`, `isLoading`
    - Store tokens in localStorage with `mc_` prefix (`mc_access_token`, `mc_refresh_token`)
    - Implement `login()`, `register()`, `logout()`, `refresh()`, `setTokensFromCallback()` methods
    - On `logout()`: clear localStorage, redirect to `/login`
    - On page load: restore tokens from localStorage, check expiration
    - _Requirements: 12.1, 12.5, 12.6_

  - [x] 5.2 Create API client (`src/lib/auth/api-client.ts`)
    - Wrap `fetch` with automatic `Authorization: Bearer <token>` injection for protected endpoints
    - Implement proactive refresh when token expires within 60 seconds
    - Implement single-flight pattern: queue concurrent requests during refresh, resolve all with new token
    - On 401 after failed refresh: clear tokens, redirect to `/login`
    - Retry refresh once after 5s on network error before clearing
    - _Requirements: 12.2, 12.3, 12.4, 12.7, 3.3, 3.4, 3.5_

  - [x] 5.3 Create token extraction utility (`src/lib/auth/token-utils.ts`)
    - Extract tokens from URL query parameters (access_token, refresh_token, expires_in, error)
    - Clean tokens from URL after extraction (remove from address bar and history)
    - Work in both web browser context and Capacitor deep link context
    - _Requirements: 15.2, 15.4, 18.6, 18.7, 19.5, 19.6_

- [ ] 6. Frontend auth pages (wire auth logic into existing pages)
  - [x] 6.1 Wire auth logic into login page (`src/routes/(auth)/login/+page.svelte`)
    - Pages and UI components already exist — DO NOT recreate or restructure
    - Connect login form submission to auth store `login()` method
    - Connect "Sign in with Google" / "Sign in with Apple" buttons to OAuth flow (redirect to `/api/auth/oauth/{provider}`)
    - Connect "Send magic link" button to magic link API call
    - Add inline validation: email format, non-empty password (prevent submission if invalid)
    - Add loading state: disable submit button, show spinner while request is in progress
    - Display API error messages below form on failure
    - On success: store tokens, redirect to main application page
    - Verify visual match with `.design/auth-login-form-desktop.html` and `.design/auth-login-form-mobile.html`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 18.1, 18.2, 18.3, 18.4, 18.5, 18.9_

  - [ ] 6.2 Refactor registration into single-page multi-step flow (`src/routes/(auth)/register/+page.svelte`)
    - Consolidate existing `(auth)/check-email/` route into `(auth)/register/` as step 2
    - Remove `(auth)/check-email/` route folder after migration
    - Implement step state management with Svelte 5 runes (step 1: form, step 2: email confirmation)
    - Step 1: Registration form — first name, last name, email, password (with visibility toggle), password confirmation, OAuth buttons with "or" divider
    - Add password strength indicator (reuse existing `PasswordStrengthMeter` component)
    - Add inline validation: required fields, email format, password match, password length (8–72)
    - Connect form submission to auth store `register()` method
    - Connect OAuth buttons to OAuth flow
    - Add loading state: disable submit, show spinner
    - Display API error messages below form on failure
    - Step 2: Email verification message — display submitted email address, "Back to login" link
    - On successful registration: transition in-place to step 2 (no URL change)
    - Verify visual match with `.design/auth-registration-form-*.html` (step 1) and `.design/auth-check-email-*.html` (step 2)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10, 9.11, 9.12, 9.13_

  - [ ] 6.3 Refactor password reset into single-page multi-step flow (`src/routes/(auth)/forgot-password/+page.svelte`)
    - Consolidate existing separate routes (`check-code/`, `new-password/`) into a single multi-step page at `(auth)/forgot-password/`
    - Remove `(auth)/check-code/` and `(auth)/new-password/` route folders after migration
    - Implement step state management with Svelte 5 runes (step 1: email, step 2: code, step 3: new password, step 4: success)
    - Step 1: Email input, "Send code" button, "Back to login" link → calls `/api/auth/forgot-password`
    - Step 2: 6 single-digit OTP inputs (reuse existing `OtpInput` component), 15-min countdown timer (reuse `CountdownTimer`), "Resend code" button → calls `/api/auth/verify-reset-code`
    - Step 3: New password + confirm password inputs, visibility toggles, strength indicator (reuse `PasswordInput`, `PasswordStrengthMeter`) → calls `/api/auth/reset-password`
    - Step 4: Success confirmation view with "Log in" button (redirect to `/login`)
    - 3-step progress bar above form card using existing `StepProgressBar` component
    - Add inline validation and error display at each step
    - Add loading states on submit buttons
    - Verify visual match with `.design/auth-forgot-password-*.html`, `.design/auth-check-code-*.html`, `.design/auth-new-password-*.html`
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10, 10.11, 10.12, 10.13_

- [ ] 7. Frontend auth guard and deep link handler
  - [ ] 7.1 Create auth guard (`src/lib/auth/auth-guard.ts`)
    - SvelteKit load function guard for protected routes
    - Redirect to `/login` if no valid token on protected routes
    - Redirect to `/` if authenticated user visits `/login`, `/register`, `/forgot-password`
    - _Requirements: 6.4, 6.5, 12.5_

  - [ ] 7.2 Create deep link handler (`src/lib/auth/deep-link.ts`)
    - Capacitor `App.addListener('appUrlOpen', ...)` handler
    - Intercept OAuth and magic link callback URLs
    - Extract tokens using shared token-utils, store in localStorage
    - Navigate to main page on success, show error on login page on failure
    - Update `AndroidManifest.xml` intent filters for callback URLs with `autoVerify="true"`
    - _Requirements: 19.1, 19.4, 19.5, 19.6, 19.9, 19.10_

  - [ ] 7.3 Wire auth into existing pages
    - Apply auth guard to all protected routes (step1–5, reports, report)
    - Update existing API calls to use the new API client with token injection
    - Ensure existing handlers pass user_id in requests
    - Handle callback token extraction on app load (check URL params on login page mount)
    - _Requirements: 15.1, 15.2, 15.3, 15.5, 15.6, 18.6, 18.7, 18.8_

- [ ] 8. Checkpoint — Frontend auth complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Backend testing
  - [ ]* 9.1 Write unit tests for auth middleware
    - Test JWT validation: valid token, expired token, malformed token, missing token, wrong signature
    - Test exempt paths are not blocked
    - Test user ID extraction from `sub` claim
    - _Requirements: 6.1, 6.2, 6.3, 6.6_

  - [ ]* 9.2 Write unit tests for auth handlers
    - Test register: success, duplicate email, invalid input, Supabase error
    - Test login: success, bad credentials, unconfirmed email, missing fields
    - Test refresh: success, invalid token
    - Test password reset flow: all steps success and failure
    - Test OAuth and magic link handlers
    - _Requirements: 1.1–1.9, 2.1–2.5, 3.1–3.2, 4.1, 4.3, 5.1–5.9, 14.1–14.9, 17.1–17.12_

  - [ ]* 9.3 Write unit tests for auth rate limiter
    - Test per-IP limit enforcement and reset
    - Test Retry-After header value
    - Test magic link per-email+IP tracking
    - _Requirements: 11.6, 11.7, 17.6_

  - [ ]* 9.4 Write property test — input validation rejects invalid payloads (rapid)
    - **Property 1: Input validation rejects invalid payloads**
    - Generate random invalid emails, passwords outside 8–72 range, whitespace-only names
    - Verify all return HTTP 400 and no account is created
    - **Validates: Requirements 1.3, 1.4, 1.9, 5.3, 5.7, 17.11**

  - [ ]* 9.5 Write property test — auth middleware rejects unauthenticated requests (rapid)
    - **Property 3: Auth middleware rejects unauthenticated requests**
    - Generate random non-JWT strings, expired tokens, tokens with wrong signatures
    - Verify all return HTTP 401 and handler is never called
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.6**

  - [ ]* 9.6 Write property test — error response format consistency (rapid)
    - **Property 5: Error response format consistency**
    - Trigger various auth errors across endpoints
    - Verify every error response has exactly `error`, `message`, `timestamp` fields
    - **Validates: Requirements 11.2**

  - [ ]* 9.7 Write property test — trial credits assigned exactly once (rapid)
    - **Property 7: Trial credits assigned exactly once**
    - Register users via email, OAuth, and magic link
    - Verify credits=3 on creation, then verify login/refresh does not modify credits
    - **Validates: Requirements 16.6**

- [ ] 10. Frontend testing
  - [ ]* 10.1 Write unit tests for auth store (Vitest)
    - Test token storage/retrieval from localStorage
    - Test state transitions: login, logout, refresh
    - Test `setTokensFromCallback` with valid and missing params
    - _Requirements: 12.1, 12.5, 12.6_

  - [ ]* 10.2 Write unit tests for API client (Vitest)
    - Test token injection in Authorization header
    - Test proactive refresh trigger at 60s before expiry
    - Test redirect to login on 401 after failed refresh
    - Test retry on network error
    - _Requirements: 12.2, 12.3, 12.4, 3.3, 3.4, 3.5_

  - [ ]* 10.3 Write unit tests for auth guard (Vitest)
    - Test redirect to `/login` for unauthenticated access to protected routes
    - Test redirect to `/` for authenticated access to auth routes
    - _Requirements: 6.4, 6.5_

  - [ ]* 10.4 Write property test — anti-enumeration consistency (fast-check)
    - **Property 2: Anti-enumeration consistency**
    - Generate random emails (registered and unregistered)
    - Verify forgot-password response shape is identical regardless of email existence
    - Verify failed login error message is identical regardless of email existence
    - **Validates: Requirements 2.2, 5.2**

  - [ ]* 10.5 Write property test — concurrent refresh deduplication (fast-check)
    - **Property 6: Concurrent refresh deduplication**
    - Generate N concurrent API requests with an expired token
    - Verify exactly 1 refresh call is made and all N requests resolve with new token
    - **Validates: Requirements 12.7**

- [ ] 11. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Backend uses Go (`testing` + `pgregory.net/rapid`), frontend uses TypeScript (`vitest` + `fast-check`)
- The database migration (task 4.1) can be run independently once backend handlers are ready
- Frontend auth pages already exist in `src/routes/(auth)/` — tasks wire auth logic, refactor multi-step flows, and remove redundant route folders (`check-email/`, `check-code/`, `new-password/`)
- Supabase dashboard configuration (not code tasks): enable Google + Apple OAuth providers, set magic link expiry to 1 hour, configure email templates, set redirect URLs (Req 14.10, 14.11, 17.7)
- Requirement 16.10: subscription_type and credits columns are created but NO business logic (billing, credit deduction) is implemented in this feature

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.4"] },
    { "id": 1, "tasks": ["1.2", "1.3", "4.1"] },
    { "id": 2, "tasks": ["2.1", "2.2", "2.3", "2.4", "2.7"] },
    { "id": 3, "tasks": ["2.5", "2.6", "2.8"] },
    { "id": 4, "tasks": ["5.1", "5.3", "9.1", "9.3"] },
    { "id": 5, "tasks": ["5.2", "9.2", "9.4", "9.5", "9.6", "9.7"] },
    { "id": 6, "tasks": ["6.1", "6.2", "6.3", "7.1"] },
    { "id": 7, "tasks": ["7.2", "7.3", "10.1", "10.2", "10.3"] },
    { "id": 8, "tasks": ["10.4", "10.5"] }
  ]
}
```
