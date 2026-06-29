# Test Report
Created: 2026-06-15 21:16:10 UTC
Updated: 2026-06-29 19:18 UTC

## Summary
- Total tests: 781
- Passing: 781
- Failing: 0
- Coverage: 41.95% statements (4500/10726), 44.97% lines, 14.73% branches, 12.63% functions — v8 provider, `server` project only

## Test Results
| Test File | Tests | Pass | Fail | Status |
|---|---|---|---|---|
| src/lib/__tests__/locale.test.ts | 11 | 11 | 0 | ✅ Pass |
| src/lib/auth/__tests__/antiEnumeration.test.ts | 4 | 4 | 0 | ✅ Pass |
| src/lib/auth/__tests__/apiClient.test.ts | 18 | 18 | 0 | ✅ Pass |
| src/lib/auth/__tests__/authGuard.test.ts | 6 | 6 | 0 | ✅ Pass |
| src/lib/auth/__tests__/authStore.test.ts | 33 | 33 | 0 | ✅ Pass |
| src/lib/auth/__tests__/concurrentRefreshProperty.test.ts | 2 | 2 | 0 | ✅ Pass |
| src/lib/auth/__tests__/deepLink.test.ts | 8 | 8 | 0 | ✅ Pass |
| src/lib/auth/__tests__/tokenUtils.test.ts | 15 | 15 | 0 | ✅ Pass |
| src/lib/clients/__tests__/accountClient.test.ts | 25 | 25 | 0 | ✅ Pass |
| src/lib/clients/__tests__/api-config.test.ts | 10 | 10 | 0 | ✅ Pass |
| src/lib/clients/__tests__/apiKeysClient.test.ts | 20 | 20 | 0 | ✅ Pass |
| src/lib/clients/__tests__/billingClient.test.ts | 23 | 23 | 0 | ✅ Pass |
| src/lib/clients/__tests__/metaCleanerApi.test.ts | 6 | 6 | 0 | ✅ Pass |
| src/lib/repositories/__tests__/authRepository.test.ts | 14 | 14 | 0 | ✅ Pass |
| src/lib/repositories/__tests__/docsRepository.property.test.ts | 9 | 9 | 0 | ✅ Pass |
| src/lib/repositories/__tests__/docsRepository.test.ts | 48 | 48 | 0 | ✅ Pass |
| src/lib/repositories/__tests__/languageRepository.test.ts | 8 | 8 | 0 | ✅ Pass |
| src/lib/repositories/__tests__/settingsRepository.test.ts | 14 | 14 | 0 | ✅ Pass |
| src/lib/repositories/__tests__/userRepository.test.ts | 10 | 10 | 0 | ✅ Pass |
| src/lib/scanner/__tests__/aiDetector.test.ts | 39 | 39 | 0 | ✅ Pass |
| src/lib/scanner/__tests__/extraction.test.ts | 11 | 11 | 0 | ✅ Pass |
| src/lib/scanner/__tests__/formatDetector.test.ts | 47 | 47 | 0 | ✅ Pass |
| src/lib/scanner/__tests__/metadataParser.test.ts | 6 | 6 | 0 | ✅ Pass |
| src/lib/scanner/__tests__/riskAnalyzer.test.ts | 23 | 23 | 0 | ✅ Pass |
| src/lib/scanner/__tests__/scanPipeline.test.ts | 12 | 12 | 0 | ✅ Pass |
| src/lib/scanner/__tests__/scannerStore.test.ts | 10 | 10 | 0 | ✅ Pass |
| src/lib/scanner/parsers/__tests__/imageParser.test.ts | 21 | 21 | 0 | ✅ Pass |
| src/lib/scanner/parsers/__tests__/videoParser.test.ts | 3 | 3 | 0 | ✅ Pass |
| src/lib/services/__tests__/apiCleaningService.test.ts | 60 | 60 | 0 | ✅ Pass |
| src/lib/services/__tests__/preservation.property.test.ts | 15 | 15 | 0 | ✅ Pass |
| src/lib/shared/components/__tests__/UserDropdown.test.ts | 5 | 5 | 0 | ✅ Pass |
| src/lib/shared/utils/__tests__/creditUtils.property.test.ts | 28 | 28 | 0 | ✅ Pass |
| src/lib/shared/utils/__tests__/format.test.ts | 8 | 8 | 0 | ✅ Pass |
| src/lib/shared/utils/__tests__/i18n.test.ts | 7 | 7 | 0 | ✅ Pass |
| src/lib/shared/utils/__tests__/planHierarchy.property.test.ts | 19 | 19 | 0 | ✅ Pass |
| src/lib/shared/utils/__tests__/reportStyles.test.ts | 9 | 9 | 0 | ✅ Pass |
| src/lib/shared/utils/__tests__/riskStyles.test.ts | 13 | 13 | 0 | ✅ Pass |
| src/lib/stores/__tests__/appState.test.ts | 13 | 13 | 0 | ✅ Pass |
| src/lib/stores/__tests__/billingStore.test.ts | 38 | 38 | 0 | ✅ Pass |
| src/lib/stores/__tests__/cleaningResultsStore.test.ts | 14 | 14 | 0 | ✅ Pass |
| src/lib/vitest-examples/greet.spec.ts | 1 | 1 | 0 | ✅ Pass |
| src/routes/__tests__/layout.navProps.test.ts | 19 | 19 | 0 | ✅ Pass |
| src/routes/docs/__tests__/docs.property.test.ts | 33 | 33 | 0 | ✅ Pass |
| src/routes/sections/Step5Success/__tests__/Step5Success.download.property.test.ts | 6 | 6 | 0 | ✅ Pass |
| src/routes/settings/__tests__/validation.test.ts | 37 | 37 | 0 | ✅ Pass |

## Failures (if any)
- None. All 781 tests across 45 files pass.

## Uncovered (no tests)
The reported coverage (~42% statements) is low because the `server` Vitest project only exercises logic modules (auth, clients, repositories, scanner, services, stores, utils). The following categories of source are not covered by this unit run:
- **Svelte UI components** (`*.svelte` in `src/routes/**` and `src/lib/**/components`) — these are exercised by the `client` and `storybook` browser projects (`npm run test:browser`) and Playwright E2E (`npm run test:e2e`), which are not part of this suite.
- **Paraglide i18n generated messages** (`src/lib/paraglide/**`) — generated code, not unit tested.
- Various route `+page.svelte` / `+layout.svelte` files whose extracted logic is tested (e.g. `layout.navProps`, `docs.property`) but whose markup is covered only by browser/E2E projects.

## Notes
- Test runner: Vitest 4.1.8, run via `npm test` (`vitest --run --project=server`).
- A non-fatal warning is emitted: the `vi.mock("mediainfo.js")` call in `src/lib/scanner/parsers/__tests__/videoParser.test.ts` is not at the top level of the module. It is hoisted correctly today but will become an error in a future Vitest version — recommend moving it to the top level.
- The two failures noted in earlier runs (hash-fragment token parsing in `tokenUtils.test.ts` and empty-name fallback in `userRepository.test.ts`) were fixed in commit `c5992de` and now pass.
- This run covers only the `server` unit project. The `client`/`storybook` browser projects and Playwright E2E were not executed.
- Coverage was measured with the v8 provider (`@vitest/coverage-v8`).
