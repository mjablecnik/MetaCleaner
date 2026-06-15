# Test Tasks — MetaCleaner (Unit & Integration)

_Derived from TEST_SPEC.md (2026-06-15). Prior pipeline tasks all complete; these cover the remaining uncovered logic._

## Phase 0 — Cleanup

- [x] No orphaned/broken tests found — `vitest-examples/{greet,Welcome.svelte}` retain live sources; no tests reference deleted code. Nothing to remove.

## Phase 1 — High Priority (core logic without coverage)

_None. All core logic without coverage was addressed in prior runs; remaining gaps are medium/low._

## Phase 2 — Medium Priority (edge cases, error handling)

- [x] [MEDIUM] Create unit tests for `backend/metacleaner-server/source/supabase_auth.go` pure helpers — `authURL`/`restURL` path concatenation, `GetOAuthURL` PKCE query params (`code_challenge`, `code_challenge_method=S256`, provider, encoding), and `SupabaseAuthError.Error()` formatting; no network (`source/supabase_auth_url_test.go`, package `source` for unexported funcs)
- [x] [MEDIUM] Create unit tests for `frontend/metacleaner-app/src/lib/repositories/userRepository.ts` `getCurrentUser` — unauthenticated returns empty user (no fetch), non-ok response returns empty user, success maps `first_name`+`last_name` → `name` (incl. missing/empty part) and `email`; mock `apiFetch` and `authStore` (`src/lib/repositories/__tests__/userRepository.test.ts`)
- [x] [MEDIUM] Create unit tests for `terminal/metacleaner-cli/src/polyfills.ts` `FileReaderPolyfill` — `readAsArrayBuffer`/`readAsText` set `result` + `readyState=DONE` and fire `load`/`loadend` with `event.target===reader`, error path fires `error`+`loadend`, static `EMPTY/LOADING/DONE` constants (`tests/polyfills.test.ts`)

## Phase 3 — Low Priority (utilities, simple logic)

- [x] [LOW] Create unit tests for `frontend/metacleaner-app/src/lib/repositories/authRepository.ts` — `getAuthStats` returns 3 expected stats; `getAuthPlans` returns `free`/`pro` plans with expected ids, colors, and i18n keys (`src/lib/repositories/__tests__/authRepository.test.ts`)
- [x] [LOW] Create unit tests for `frontend/metacleaner-app/src/lib/repositories/languageRepository.ts` — `getLanguages` resolves `cs`/`en` entries with expected `code`/`flag`/`label`/`name` shape (`src/lib/repositories/__tests__/languageRepository.test.ts`)
