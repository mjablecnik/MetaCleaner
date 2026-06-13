# Test Report

Created: 2026-06-12T23:17:49+00:00
Updated: 2026-06-12T23:17:49+00:00

## Summary

- Total E2E tests: 84
- Passing E2E tests: 84
- Failing E2E tests: 0
- Total component stories: 244 (across 48 story files)
- Passing component stories: 244
- Failing component stories: 0
- Total unit tests (server): 342
- Passing unit tests: 342

## E2E Test Coverage

| Page/Route | Test File | Status |
|---|---|---|
| `/` (step1 — upload) | e2e/step1-upload.spec.ts | ✅ Pass |
| `/` (step1 → step2 transition) | e2e/step1-to-step2-transition.spec.ts | ✅ Pass |
| `/` (step2 — risk analysis) | e2e/step2-risk-analysis.spec.ts | ✅ Pass |
| `/` (step2 → step5 flow) | e2e/step2-to-step5-complete-flow.spec.ts | ✅ Pass |
| `/` (step3 — processing) | e2e/step3-processing.spec.ts | ✅ Pass |
| `/` (step3 — cancel) | e2e/step3-cancel.spec.ts | ✅ Pass |
| `/` (step4 — error) | e2e/step4-error.spec.ts | ✅ Pass |
| `/` (step5 — results) | e2e/step5-results.spec.ts | ✅ Pass |
| `/` (step5 → report nav) | e2e/step5-report-navigation.spec.ts | ✅ Pass |
| `/reports` | e2e/reports.spec.ts | ✅ Pass |
| `/report/[id]` | e2e/report-detail.spec.ts | ✅ Pass |
| `/login` | e2e/login.spec.ts | ✅ Pass |
| `/register` | e2e/register.spec.ts | ✅ Pass |
| `/forgot-password` | e2e/forgot-password.spec.ts | ✅ Pass |
| Auth navigation (cross-page) | e2e/auth-navigation.spec.ts | ✅ Pass |
| Auth responsive | e2e/auth-responsive.spec.ts | ✅ Pass |
| Navigation (global) | e2e/navigation.spec.ts | ✅ Pass |
| Responsive (global) | e2e/responsive.spec.ts | ✅ Pass |
| Hamburger menu | e2e/hamburger-menu.spec.ts | ✅ Pass |
| File validation | e2e/file-validation.spec.ts | ✅ Pass |
| File removal | e2e/file-removal.spec.ts | ✅ Pass |

## Component Test Coverage

| Component | Story File | States Covered | Status |
|---|---|---|---|
| Badge | elements/Badge.stories.svelte | Blue, Green, Red, Orange, WithDot, WithIcon + variants | ✅ Pass |
| Button | elements/Button.stories.svelte | Primary, Secondary, Danger, Ghost, Disabled, WithIcon, Loading, Sizes | ✅ Pass |
| Card | elements/Card.stories.svelte | Default, GreenBorder, RedBorder, BlueBorder, OrangeBorder, CustomPadding | ✅ Pass |
| Chip | elements/Chip.stories.svelte | Blue, Green, Red, Orange, Muted, WithoutBorder, Rounded, AllColors | ✅ Pass |
| AccordionCard | elements/AccordionCard.stories.svelte | Closed, Open, WithIcon, RedBorder, BlueBorder, GreenBorder, WithHeaderContent | ✅ Pass |
| IconContainer | elements/IconContainer.stories.svelte | All tints/solids, All sizes, Shapes | ✅ Pass |
| ProgressBar | elements/ProgressBar.stories.svelte | Empty, Half, Full, colors, heights | ✅ Pass |
| ToggleSwitch | elements/ToggleSwitch.stories.svelte | Off, On, DisabledOff, DisabledOn | ✅ Pass |
| AuthTextInput | elements/AuthTextInput.stories.svelte | Default, WithIcon, Focused, WithError, Disabled | ✅ Pass |
| NavBar | components/NavBar.stories.svelte | Default, WithBackButton, WithoutLanguageDropdown, Compact, NoUser | ✅ Pass |
| ActivityLog | components/ActivityLog.stories.svelte | WithEntries, SuccessOnly, WithError, InProgress, Empty | ✅ Pass |
| Toast | components/Toast.stories.svelte | Visible, Hidden, WithCustomIcon, ErrorIcon | ✅ Pass |
| StatCard | components/StatCard.stories.svelte | Blue, Green, Red, Orange, Highlighted variants, WithMobileLabel | ✅ Pass |
| PageHeader | components/PageHeader.stories.svelte | WithoutBadge, WithBlueBadge, WithOrangeBadge, WithRedBadge | ✅ Pass |
| LanguageDropdown | components/LanguageDropdown.stories.svelte | Closed, Open, CzechSelectedClosed, CzechSelectedOpen | ✅ Pass |
| UserDropdown | components/UserDropdown.stories.svelte | Closed, Open, NoUser, NoUserOpen | ✅ Pass |
| MobileHamburgerMenu | components/MobileHamburgerMenu.stories.svelte | Closed, Open, OpenWithLanguageOptions, NoUser, NoUserOpen | ✅ Pass |
| MobileBottomCta | components/MobileBottomCta.stories.svelte | WithButtonContent, WithTextContent | ✅ Pass |
| DropZone | (step1)/components/DropZone.stories.svelte | Idle, Dragover | ✅ Pass |
| RiskScoreRing | (step1)/components/RiskScoreRing.stories.svelte | LowRisk, MediumRisk, HighRisk, Small, Large, Blue | ✅ Pass |
| BeforeAfterScore | (step1)/components/BeforeAfterScore.stories.svelte | Improved, Moderate, Unchanged, Zero | ✅ Pass |
| RiskBreakdownBar | (step1)/components/RiskBreakdownBar.stories.svelte | Critical, High, Medium, Low, Multiple | ✅ Pass |
| ScanProgressIndicator | (step1)/components/ScanProgressIndicator.stories.svelte | Idle, Scanning, Complete, Error | ✅ Pass |
| FileListItemRisk | (step1)/components/FileListItemRisk.stories.svelte | HighRisk, MediumRisk, LowRisk, Scanning, Error, Video | ✅ Pass |
| FilterPill | reports/components/FilterPill.stories.svelte | Active, Inactive, WithCount, WithIcon, PillGroup | ✅ Pass |
| ReportCard | reports/components/ReportCard.stories.svelte | Image, Video, WithTags, HighFieldCount, Multiple | ✅ Pass |
| ReportTableRow | reports/components/ReportTableRow.stories.svelte | Image, Video, WithGPS, HighFieldCount, Multiple | ✅ Pass |
| ChartBar | report/components/ChartBar.stories.svelte | Red, Orange, Blue, Green, Zero, AllColors | ✅ Pass |
| FileAccordionItem | report/components/FileAccordionItem.stories.svelte | Collapsed, Expanded, WithGPS, WithRichMetadata, Video | ✅ Pass |
| MetadataTable | report/components/MetadataTable.stories.svelte | FewFields, ManyFields, WithMoreCount, SingleField | ✅ Pass |
| FileProcessingRow | Step3Processing/components/FileProcessingRow.stories.svelte | Waiting, InProgress, Completed, Failed, Skipped | ✅ Pass |
| MetadataCategoryCard | Step5Success/components/MetadataCategoryCard.stories.svelte | HighRisk, LowRisk, AllClean, WithManyFields | ✅ Pass |
| MetadataFieldList | Step5Success/components/MetadataFieldList.stories.svelte | FewFields, ManyFields, AllRemoved, Mixed | ✅ Pass |
| AuthBranding | (auth)/components/AuthBranding.stories.svelte | LoginBranding, RegisterBranding | ✅ Pass |
| AuthFeatureCard | (auth)/components/AuthFeatureCard.stories.svelte | WithBadge, WithFormatChips, Default | ✅ Pass |
| AuthFormCard | (auth)/components/AuthFormCard.stories.svelte | WithTitle, WithTitleAndSubtitle, WithContent | ✅ Pass |
| AuthLayout | (auth)/components/AuthLayout.stories.svelte | Default, WithContent | ✅ Pass |
| AuthMobileHero | (auth)/components/AuthMobileHero.stories.svelte | Default, WithCustomStats, WithoutStats | ✅ Pass |
| AuthNavbar | (auth)/components/AuthNavbar.stories.svelte | WithRegisterLink, WithLoginLink, NoRightAction | ✅ Pass |
| AuthStatsRow | (auth)/components/AuthStatsRow.stories.svelte | Default, Bordered, CustomValues | ✅ Pass |
| CountdownTimer | (auth)/components/CountdownTimer.stories.svelte | Running, Expired, CustomDuration | ✅ Pass |
| OtpInput | (auth)/components/OtpInput.stories.svelte | Empty, PartiallyFilled, Complete, WithError | ✅ Pass |
| PasswordInput | (auth)/components/PasswordInput.stories.svelte | Default, WithValue, ShowingPassword, WithError, Disabled | ✅ Pass |
| PasswordRecoveryProgressCards | (auth)/components/PasswordRecoveryProgressCards.stories.svelte | Step2Active, Step3Active, AllDone | ✅ Pass |
| PasswordStrengthMeter | (auth)/components/PasswordStrengthMeter.stories.svelte | Empty, Weak, Medium, Strong, VeryStrong | ✅ Pass |
| SocialLoginButtons | (auth)/components/SocialLoginButtons.stories.svelte | Default, LoginLabels, RegisterLabels | ✅ Pass |
| StepProgressBar | (auth)/components/StepProgressBar.stories.svelte | Step1Active, Step2Active, Step3Active, AllComplete | ✅ Pass |
| TrustBadges | (auth)/components/TrustBadges.stories.svelte | Default | ✅ Pass |

## Uncovered (no tests)

- `src/lib/shared/sections/SummaryStatsRow.svelte` — no story file

## Notes

- All 84 E2E tests pass (Playwright, Chromium, headless). Tests cover desktop (1280px) and mobile (375px) viewports.
- All 244 Storybook stories render successfully across 48 story files.
- 50 unhandled `TypeError: Cannot read properties of undefined (reading 'tags')` warnings occur during Storybook browser tests (originating from `ReportCard.stories.svelte` and `ReportTableRow.stories.svelte`). These do not cause test failures but should be investigated — likely a missing mock data property.
- All 342 server-side unit tests pass (Vitest).
- Storybook build (`storybook-static/`) is current and valid.
- The `/report` route redirects to `/report/[id]` — covered by `report-detail.spec.ts`.
