# Implementation Plan: API Keys Management

## Overview

Full-stack implementation of API key management for MetaCleaner. The plan covers: database migration, backend handlers (CRUD + revocation), auth middleware extension (prefix-based routing to API key validation), per-key rate limiting, frontend page with modals and navigation updates, and i18n keys. Tasks are ordered to build foundational layers first (schema, models, middleware) before wiring UI. All keys use a single type with prefix `mtd_key_` (no live/test distinction).

## Tasks

- [x] 1. Database migration and backend models
  - [x] 1.1 Create database migration script `scripts/migration004.sql`
    - Create `api_keys` table with columns: id (UUID PK), user_id (UUID NOT NULL), name (TEXT NOT NULL, ≤100 chars), key_hash (TEXT NOT NULL UNIQUE), key_prefix (TEXT NOT NULL), key_suffix (TEXT NOT NULL), status (TEXT NOT NULL DEFAULT 'active', CHECK IN ('active','revoked')), note (TEXT nullable, ≤500 chars), created_at (TIMESTAMPTZ NOT NULL DEFAULT NOW()), last_used_at (TIMESTAMPTZ nullable), revoked_at (TIMESTAMPTZ nullable)
    - Add unique index on key_hash, index on user_id
    - Enable RLS and create policy for user's own keys
    - Add foreign key to auth.users with ON DELETE CASCADE
    - _Requirements: 9.1, 9.2, 9.3, 9.5_

  - [x] 1.2 Create API key models in `source/apikey_models.go`
    - Define `APIKey` struct with JSON tags (exclude key_hash from JSON)
    - Define `CreateAPIKeyRequest` with fields: `Name` and `Note` only (no key_type)
    - Define `CreateAPIKeyResponse` struct with full plaintext key + APIKey record
    - Implement `generateAPIKey()` function: 32 random bytes → hex → prepend `mtd_key_` prefix → SHA-256 hash → extract prefix (first 8 chars) and suffix (last 4 chars)
    - _Requirements: 1.1, 1.2, 1.3, 9.1_

  - [ ]* 1.3 Write property test for key generation format (Property 1)
    - **Property 1: Key Generation Format Correctness**
    - **Validates: Requirements 1.1, 1.2**
    - Test that generated keys have prefix exactly `mtd_key_`, total length 72 chars (8-char prefix + 64 hex chars), SHA-256 hash matches stored hash, and suffix equals last 4 chars of plaintext

  - [ ]* 1.4 Write property test for invalid creation input rejection (Property 2)
    - **Property 2: Invalid Creation Input Rejection**
    - **Validates: Requirements 1.6**
    - Test that empty, whitespace-only, or >100 char names are always rejected with HTTP 400 and no record stored

- [x] 2. Backend API key handlers
  - [x] 2.1 Implement `HandleCreateAPIKey` in `source/apikey_handlers.go`
    - Validate name (non-empty, trimmed non-whitespace, ≤100 chars) and optional note (≤500 chars)
    - Call `generateAPIKey()`, store record via SupabaseClient, return full plaintext key once
    - Return HTTP 400 with VALIDATION_ERROR for invalid input
    - _Requirements: 1.1, 1.2, 1.3, 1.6, 9.4_

  - [x] 2.2 Implement `HandleListAPIKeys` in `source/apikey_handlers.go`
    - Query all API keys for authenticated user (from context), ordered by created_at DESC
    - Return array of APIKey records (without key_hash)
    - _Requirements: 2.1, 2.2_

  - [x] 2.3 Implement `HandleDeleteAPIKey` in `source/apikey_handlers.go`
    - Validate key belongs to authenticated user
    - Delete record permanently from database
    - Return HTTP 404 if key not found or belongs to another user
    - _Requirements: 3.2, 3.4, 3.6_

  - [x] 2.4 Implement `HandleRevokeAPIKey` in `source/apikey_handlers.go`
    - Validate key belongs to authenticated user and has status 'active'
    - Set status to 'revoked', set revoked_at timestamp
    - Return HTTP 409 if key is already revoked
    - Return updated APIKey record
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 2.5 Write property test for revocation state transition (Property 6)
    - **Property 6: Revocation State Transition**
    - **Validates: Requirements 4.2, 4.3**
    - Test that active keys transition to revoked with non-null revoked_at, and already-revoked keys get HTTP 409

  - [x] 2.6 Add Supabase client methods for API key operations
    - Add methods to `SupabaseClient`: `CreateAPIKey`, `ListAPIKeys`, `DeleteAPIKey`, `RevokeAPIKey`, `LookupAPIKeyByHash`, `UpdateAPIKeyLastUsed`
    - Use PostgREST HTTP calls following existing patterns in `supabase.go`
    - _Requirements: 9.1, 9.2, 9.4, 9.5_

- [x] 3. Checkpoint - Backend handlers complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Auth middleware extension and rate limiting
  - [x] 4.1 Extend auth middleware with API key validation in `source/auth_middleware.go`
    - In `Authenticate`, detect `mtd_key_` prefix before JWT validation
    - Add `validateAPIKey(token string)` method: SHA-256 hash → DB lookup → check status 'active' → return userID + keyID
    - Store keyID in request context alongside userID for downstream rate limiting
    - If prefix matches but key is invalid/revoked → HTTP 401, do NOT fall back to JWT
    - Update `last_used_at` asynchronously in a goroutine
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 4.2 Write property test for token routing by prefix (Property 4)
    - **Property 4: Token Routing by Prefix**
    - **Validates: Requirements 5.1, 5.4**
    - Test that tokens starting with `mtd_key_` route to API key validation, all others route to JWT validation

  - [ ]* 4.3 Write property test for non-active key rejection (Property 3)
    - **Property 3: Non-Active Key Authentication Rejection**
    - **Validates: Requirements 3.4, 4.4, 5.3**
    - Test that non-existent or revoked key hashes always get HTTP 401 without JWT fallback

  - [ ]* 4.4 Write property test for active key granting access (Property 5)
    - **Property 5: Active Key Grants Access with Correct Identity**
    - **Validates: Requirements 5.2**
    - Test that active key hash sets correct user_id in request context

  - [x] 4.5 Implement per-key rate limiter in `source/apikey_rate_limiter.go`
    - Create `APIKeyRateLimiter` struct with token bucket per key ID (default 120 RPM)
    - `Allow(keyID string) (bool, int)` returns allowed flag and retry-after seconds
    - Include cleanup goroutine to evict stale entries
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 4.6 Integrate API key rate limiter into middleware chain
    - After API key auth succeeds, check rate limit before forwarding to handler
    - On limit exceeded: return HTTP 429 with Retry-After header and RATE_LIMIT_EXCEEDED JSON error body
    - On auth failure (401): skip rate limit check entirely
    - _Requirements: 6.2, 6.5_

  - [ ]* 4.7 Write property test for per-key rate limit independence (Property 7)
    - **Property 7: Per-Key Rate Limit Independence**
    - **Validates: Requirements 6.1, 6.2, 6.3**
    - Test that exhausting one key's rate limit does not affect another key's quota

  - [ ]* 4.8 Write property test for auth-before-rate-limit ordering (Property 8)
    - **Property 8: Auth Before Rate Limit Ordering**
    - **Validates: Requirements 6.5**
    - Test that invalid/revoked keys always get HTTP 401 regardless of request count

- [x] 5. Backend route registration
  - [x] 5.1 Register API key routes in `source/router.go`
    - Add `POST /api/keys`, `GET /api/keys`, `DELETE /api/keys/{id}`, `PATCH /api/keys/{id}/revoke`
    - Wire rate limiter instance into middleware/handler chain
    - _Requirements: 1.1, 2.1, 3.2, 4.1, 6.1_

- [x] 6. Checkpoint - Backend fully wired
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Frontend navigation update
  - [ ] 7.1 Update UserDropdown to replace Settings with API Keys link
    - Remove `onSettings` prop from the interface
    - Replace Settings `<a>` with API Keys `<a>` using `resolve('/api-keys')` and `fa-key` icon
    - Use i18n key `common.nav.apiKeys`
    - _Requirements: 7.1, 7.3, 7.4, 7.5_

  - [ ] 7.2 Update MobileHamburgerMenu to replace Settings with API Keys link
    - Remove `onSettings` prop from the interface
    - Replace Settings `<button>` with API Keys `<a>` using `resolve('/api-keys')` and `fa-key` icon
    - Use i18n key `common.nav.apiKeys`
    - _Requirements: 7.2, 7.3, 7.4, 7.5_

  - [ ] 7.3 Add i18n keys to `messages/en.json` and `messages/cs.json`
    - Add all API keys i18n keys as defined in the design document
    - Include navigation key `common.nav.apiKeys`
    - _Requirements: 7.4, 8.1_

- [ ] 8. Frontend API client
  - [ ] 8.1 Create `src/lib/clients/apiKeysClient.ts`
    - Implement `createApiKey`, `listApiKeys`, `deleteApiKey`, `revokeApiKey` functions
    - `CreateKeyRequest` interface has only `name` and optional `note` fields
    - Use `buildApiUrl` from existing api-config for URL construction
    - Include auth token in Authorization header from auth store
    - Map error responses to typed errors
    - _Requirements: 1.3, 2.1, 3.2, 4.1_

- [ ] 9. Frontend page structure and sections
  - [ ] 9.1 Create route directory `src/routes/api-keys/+page.svelte`
    - Page shell that loads data via `apiKeysClient.listApiKeys()` on mount
    - Protect route with existing auth guard (redirect unauthenticated users to login)
    - Manage state: keys list, loading, error, modals open/close
    - Display skeleton while loading
    - Compose sections: PageHeaderSection, UsageSummarySection, SecurityInfoSection, KeysListSection, UsageGuideSection
    - _Requirements: 2.1, 2.5, 2.6, 2.7, 8.1, 8.8_

  - [ ] 9.2 Create `src/routes/api-keys/sections/PageHeaderSection.svelte`
    - Use existing `PageHeader` component with green key `IconContainer` and "Create new key" `Button`
    - Wire button to open CreateKeyModal
    - _Requirements: 8.1_

  - [ ] 9.3 Create `src/routes/api-keys/sections/UsageSummarySection.svelte`
    - 2 `StatCard` components: active keys count, rate limit per minute
    - Show 0 values when no keys exist (0 active keys, rate limit value displayed)
    - _Requirements: 2.5, 6.4, 8.2, 8.3_

  - [ ] 9.4 Create `src/routes/api-keys/sections/SecurityInfoSection.svelte`
    - Info box explaining that keys are shown only once after creation
    - Use `Card` element with appropriate styling
    - _Requirements: 8.4_

  - [ ] 9.5 Create `src/routes/api-keys/sections/KeysListSection.svelte`
    - Wrap key rows in a `Card` element
    - Show list header with key count
    - Render `KeyRow` for each key, or `EmptyState` when list is empty
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6_

  - [ ] 9.6 Create `src/routes/api-keys/sections/UsageGuideSection.svelte`
    - Code examples (Authorization header, cURL, JavaScript fetch)
    - On mobile (<1024px): use `AccordionCard` with all sections collapsed
    - On desktop (≥1024px): side-by-side grid layout
    - _Requirements: 8.5, 8.6, 8.7_

- [ ] 10. Frontend route-specific components
  - [ ] 10.1 Create `src/routes/api-keys/components/KeyRow.svelte`
    - Display key name, status `Badge` (Active green / Revoked red), creation date, last used, Key_Display_Hint
    - Active state: copy button, eye toggle, delete button, revoke action
    - Revoked state: 50% opacity, disabled copy/eye buttons, show revocation date
    - Default state: fully masked (dots), eye toggle reveals Key_Display_Hint
    - Copy button: copies Key_Display_Hint, shows checkmark for 2 seconds
    - _Requirements: 2.2, 2.3, 2.4, 10.1, 10.3, 10.4, 10.5_

  - [ ] 10.2 Create `src/routes/api-keys/components/CreateKeyModal.svelte`
    - Modal with backdrop (fixed fullscreen, bg-navy-main/85, backdrop-blur)
    - Form: key name input, optional note textarea (no key type selector)
    - Client-side validation (name required, ≤100 chars)
    - On success: display full plaintext key with copy button and warning message
    - Close via backdrop click or Escape key
    - _Requirements: 1.3, 1.4, 1.5, 1.6_

  - [ ] 10.3 Create `src/routes/api-keys/components/DeleteConfirmModal.svelte`
    - Modal with backdrop (same pattern as CreateKeyModal)
    - Warning text about permanent deletion
    - Cancel (secondary) and Delete (danger) buttons
    - On confirm: call `deleteApiKey`, remove from list on success
    - On error: show inline error, preserve key in list
    - _Requirements: 3.1, 3.3, 3.5_

  - [ ] 10.4 Create `src/routes/api-keys/components/EmptyState.svelte`
    - Message indicating no keys exist
    - CTA button to create first key (opens CreateKeyModal)
    - _Requirements: 2.6_

  - [ ]* 10.5 Write unit tests for `apiKeysClient.ts`
    - Test request construction for each endpoint
    - Test error mapping for 400, 404, 409, 500 responses
    - _Requirements: 1.6, 3.6, 4.3_

  - [ ]* 10.6 Write unit tests for KeyRow component
    - Test active vs revoked rendering
    - Test copy button clipboard interaction and checkmark timeout
    - Test eye toggle between masked and hint states
    - _Requirements: 2.2, 2.3, 2.4, 10.1, 10.3, 10.4, 10.5_

  - [ ]* 10.7 Write unit tests for CreateKeyModal component
    - Test form validation (empty name, name too long)
    - Test key reveal state after creation
    - Test copy button in success state
    - _Requirements: 1.4, 1.5, 1.6_

- [ ] 11. Frontend integration wiring
  - [ ] 11.1 Wire revocation flow in KeysListSection
    - Add revoke action to KeyRow for active keys
    - Call `revokeApiKey`, update key row to revoked state without page reload
    - Handle 409 error (already revoked)
    - _Requirements: 4.1, 4.5, 4.6_

  - [ ] 11.2 Handle clipboard errors in KeyRow
    - Catch clipboard write failures
    - Display inline error message near copy button
    - _Requirements: 10.2_

  - [ ] 11.3 Remove `onSettings` prop usage from parent components
    - Update `+layout.svelte` or any parent that passes `onSettings` to UserDropdown/MobileHamburgerMenu
    - Remove the prop and any associated callback logic
    - _Requirements: 7.5_

- [ ] 12. Final checkpoint - Full integration
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All keys use a single type with prefix `mtd_key_` — no live/test distinction
- The frontend page reuses existing shared elements (PageHeader, StatCard, Badge, Card, AccordionCard, Button, IconContainer) — no new primitives
- Modals follow the pattern defined in the design (backdrop + card, no existing modal component)
- The page uses the existing +layout.svelte (NavBar already provided)
- The `/api-keys` route is protected by the existing auth guard (redirects unauthenticated users to login)
- HTML mockups in `.design/` are the visual source of truth for spacing, colors, and layout
- Usage summary has 2 stat cards only (active keys count + rate limit per minute)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "7.3"] },
    { "id": 1, "tasks": ["1.3", "1.4", "2.6", "7.1", "7.2"] },
    { "id": 2, "tasks": ["2.1", "2.2", "2.3", "2.4", "8.1"] },
    { "id": 3, "tasks": ["2.5", "4.1", "4.5", "9.2", "9.4"] },
    { "id": 4, "tasks": ["4.2", "4.3", "4.4", "4.6", "9.3", "9.6", "10.4"] },
    { "id": 5, "tasks": ["4.7", "4.8", "5.1", "10.1", "10.2", "10.3"] },
    { "id": 6, "tasks": ["9.1", "9.5", "10.5", "10.6", "10.7"] },
    { "id": 7, "tasks": ["11.1", "11.2", "11.3"] }
  ]
}
```
