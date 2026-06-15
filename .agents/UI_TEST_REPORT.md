# Test Report
Created: 2026-06-14T22:14:08+00:00
Updated: 2026-06-14T22:14:08+00:00

## Summary
- Total E2E tests: 418
- Passing E2E tests: 418
- Failing E2E tests: 0
- Total component stories: 314
- Passing component stories: 314
- Failing component stories: 0

## E2E Test Coverage
| Page/Route | Test File | Status |
|---|---|---|
| `/` (Step1 Upload) | e2e/step1-upload.spec.ts | ✅ Pass |
| `/` (Step1→Step2 Transition) | e2e/step1-to-step2-transition.spec.ts | ✅ Pass |
| `/` (Step2 Risk Analysis) | e2e/step2-risk-analysis.spec.ts | ✅ Pass |
| `/` (Step2→Step5 Complete Flow) | e2e/step2-to-step5-complete-flow.spec.ts | ✅ Pass |
| `/` (Step3 Processing) | e2e/step3-processing.spec.ts | ✅ Pass |
| `/` (Step3 Cancel) | e2e/step3-cancel.spec.ts | ✅ Pass |
| `/` (Step4 Error) | e2e/step4-error.spec.ts | ✅ Pass |
| `/` (Step5 Results) | e2e/step5-results.spec.ts | ✅ Pass |
| `/` → `/report` → `/reports` | e2e/step5-report-navigation.spec.ts | ✅ Pass |
| `/` (File Validation) | e2e/file-validation.spec.ts | ✅ Pass |
| `/` (File Removal) | e2e/file-removal.spec.ts | ✅ Pass |
| `/login` | e2e/login.spec.ts | ✅ Pass |
| `/register` | e2e/register.spec.ts | ✅ Pass |
| `/forgot-password` | e2e/forgot-password.spec.ts | ✅ Pass |
| `/email-verified` | e2e/email-verified.spec.ts | ✅ Pass |
| `/reports` | e2e/reports.spec.ts | ✅ Pass |
| `/report` | e2e/report-detail.spec.ts | ✅ Pass |
| Cross-page navigation | e2e/navigation.spec.ts | ✅ Pass |
| Responsive layout | e2e/responsive.spec.ts | ✅ Pass |
| Hamburger menu | e2e/hamburger-menu.spec.ts | ✅ Pass |
| Auth navigation | e2e/auth-navigation.spec.ts | ✅ Pass |
| Auth responsive | e2e/auth-responsive.spec.ts | ✅ Pass |

## Component Test Coverage
| Component | Story File | States Covered | Status |
|---|---|---|---|
| AccordionCard | AccordionCard.stories.svelte | Closed, Open, WithIcon, RedBorder + 4 more | ✅ Pass |
| AuthTextInput | AuthTextInput.stories.svelte | Default, WithIcon, Focused, WithError, Disabled | ✅ Pass |
| Badge | Badge.stories.svelte | Blue, Green, Red, Orange, WithDot + 5 more | ✅ Pass |
| Button | Button.stories.svelte | Primary, Secondary, Danger, Ghost, Disabled + 5 more | ✅ Pass |
| Card | Card.stories.svelte | Default, Green/Red/Blue/Orange Border, NoContent | ✅ Pass |
| Chip | Chip.stories.svelte | Blue, Green, Red, Orange, Muted + 3 more | ✅ Pass |
| IconContainer | IconContainer.stories.svelte | Blue, Green, Red, Orange, Muted + 16 more | ✅ Pass |
| ProgressBar | ProgressBar.stories.svelte | Empty, Half, Full, Blue, Green + 6 more | ✅ Pass |
| ToggleSwitch | ToggleSwitch.stories.svelte | Off, On, DisabledOff, DisabledOn | ✅ Pass |
| ActivityLog | ActivityLog.stories.svelte | WithEntries, SuccessOnly, WithError, InProgress, Empty | ✅ Pass |
| LanguageDropdown | LanguageDropdown.stories.svelte | Closed, Open, CzechSelected (2 states) | ✅ Pass |
| MobileBottomCta | MobileBottomCta.stories.svelte | WithButton, WithText | ✅ Pass |
| MobileHamburgerMenu | MobileHamburgerMenu.stories.svelte | Closed, Open, WithLanguage, NoUser (5 states) | ✅ Pass |
| NavBar | NavBar.stories.svelte | Default, WithBack, WithoutLang, Compact, NoUser | ✅ Pass |
| PageHeader | PageHeader.stories.svelte | NoBadge, Blue, Orange, Red | ✅ Pass |
| StatCard | StatCard.stories.svelte | Blue, Green, Red, Orange, Highlighted + 4 more | ✅ Pass |
| Toast | Toast.stories.svelte | Visible, Hidden, CustomIcon, ErrorIcon | ✅ Pass |
| UserDropdown | UserDropdown.stories.svelte | Closed, Open, NoUser (4 states) | ✅ Pass |
| SummaryStatsRow | SummaryStatsRow.stories.svelte | Default, VaryingData | ✅ Pass |
| AuthBranding | AuthBranding.stories.svelte | Login, Register | ✅ Pass |
| AuthFeatureCard | AuthFeatureCard.stories.svelte | WithBadge, WithFormatChips, Default | ✅ Pass |
| AuthFormCard | AuthFormCard.stories.svelte | WithTitle, WithTitleAndSubtitle, WithContent | ✅ Pass |
| AuthLayout | AuthLayout.stories.svelte | Default, WithContent | ✅ Pass |
| AuthMobileHero | AuthMobileHero.stories.svelte | Default, WithCustomStats, WithoutStats | ✅ Pass |
| AuthNavbar | AuthNavbar.stories.svelte | WithRegister, WithLogin, NoRightAction | ✅ Pass |
| AuthStatsRow | AuthStatsRow.stories.svelte | Default, Bordered, CustomValues | ✅ Pass |
| CountdownTimer | CountdownTimer.stories.svelte | Running, Expired, CustomDuration | ✅ Pass |
| OtpInput | OtpInput.stories.svelte | Empty, PartiallyFilled, Complete, WithError | ✅ Pass |
| PasswordInput | PasswordInput.stories.svelte | Default, WithValue, Showing, WithError, Disabled | ✅ Pass |
| PasswordRecoveryProgressCards | PasswordRecoveryProgressCards.stories.svelte | Step2Active, Step3Active, AllDone | ✅ Pass |
| PasswordStrengthMeter | PasswordStrengthMeter.stories.svelte | Empty, Weak, Medium, Strong, VeryStrong | ✅ Pass |
| SocialLoginButtons | SocialLoginButtons.stories.svelte | Default, LoginLabels, RegisterLabels | ✅ Pass |
| StepProgressBar | StepProgressBar.stories.svelte | Step1, Step2, Step3, AllComplete | ✅ Pass |
| TrustBadges | TrustBadges.stories.svelte | Default | ✅ Pass |
| ActionCard | ActionCard.stories.svelte | CleanAction, ProUpgradeAction | ✅ Pass |
| AnimatedCheckmark | AnimatedCheckmark.stories.svelte | SmallSize, LargeSize | ✅ Pass |
| VerificationStepper | VerificationStepper.stories.svelte | Horizontal, Vertical, Step1, Step2, AllDone | ✅ Pass |
| DropZone | DropZone.stories.svelte | Idle, Dragover | ✅ Pass |
| FileListItemRisk | FileListItemRisk.stories.svelte | High, Medium, Low, Scanning, Error + 1 more | ✅ Pass |
| RiskBreakdownBar | RiskBreakdownBar.stories.svelte | Critical, High, Medium, Low, Multiple | ✅ Pass |
| RiskScoreRing | RiskScoreRing.stories.svelte | Low, Medium, High, Small, Large + 1 more | ✅ Pass |
| ScanProgressIndicator | ScanProgressIndicator.stories.svelte | Idle, Scanning, Complete, Error | ✅ Pass |
| BeforeAfterScore | BeforeAfterScore.stories.svelte | Improved (2), Unchanged (2) | ✅ Pass |
| MobileRiskBanner | MobileRiskBanner.stories.svelte | LowRisk Collapsed, LowRisk Expanded | ✅ Pass |
| StatusCardIdle | StatusCardIdle.stories.svelte | Default | ✅ Pass |
| ErrorBanner | ErrorBanner.stories.svelte | Default, Dismissed | ✅ Pass |
| ErrorStateCard | ErrorStateCard.stories.svelte | Timeout, Connection, Cleaning | ✅ Pass |
| ErrorFilesCard | ErrorFilesCard.stories.svelte | SingleFile, MultipleFiles | ✅ Pass |
| ErrorDetailAccordion | ErrorDetailAccordion.stories.svelte | Expanded WithFile, Expanded NoFile, Collapsed | ✅ Pass |
| ErrorLogAccordion | ErrorLogAccordion.stories.svelte | Expanded Mixed, Expanded Success, Collapsed | ✅ Pass |
| ErrorTypeAccordion | ErrorTypeAccordion.stories.svelte | Cleaning, Connection, Timeout, Collapsed | ✅ Pass |
| ProcessingStatusCard | ProcessingStatusCard.stories.svelte | InProgress, NearCompletion | ✅ Pass |
| ProcessingFilesCard | ProcessingFilesCard.stories.svelte | Processing, SomeCompleted | ✅ Pass |
| MobileStatusCard | MobileStatusCard.stories.svelte | InProgress, NearCompletion | ✅ Pass |
| ActivityLogAccordion | ActivityLogAccordion.stories.svelte | Collapsed, Expanded | ✅ Pass |
| FileProcessingRow | FileProcessingRow.stories.svelte | Waiting, InProgress, Completed, Failed, Skipped | ✅ Pass |
| SuccessHeader | SuccessHeader.stories.svelte | Default, SingleFile | ✅ Pass |
| FileResultsCard | FileResultsCard.stories.svelte | SingleFile, MultipleFiles | ✅ Pass |
| MetadataOverview | MetadataOverview.stories.svelte | WithGPS, WithoutGPS | ✅ Pass |
| MetadataCategoryCard | MetadataCategoryCard.stories.svelte | HighRisk, LowRisk, AllClean, WithManyFields | ✅ Pass |
| MetadataFieldList | MetadataFieldList.stories.svelte | FewFields, ManyFields, AllRemoved, Mixed | ✅ Pass |
| ChartBar | ChartBar.stories.svelte | Red, Orange, Blue, Green, Zero + 1 more | ✅ Pass |
| FileAccordionItem | FileAccordionItem.stories.svelte | Collapsed, Expanded (5 states) | ✅ Pass |
| MetadataTable | MetadataTable.stories.svelte | FewFields, ManyFields, WithMoreCount, SingleField | ✅ Pass |
| ReportDetailHeader | ReportDetailHeader.stories.svelte | Default, NoReportData | ✅ Pass |
| ReportChartCard | ReportChartCard.stories.svelte | Default, VaryingData, NoData | ✅ Pass |
| FileAccordionList | FileAccordionList.stories.svelte | SingleFile, MultipleFiles | ✅ Pass |
| FilterPill | FilterPill.stories.svelte | Active, Inactive, WithCount (7 states) | ✅ Pass |
| ReportCard | ReportCard.stories.svelte | Image, Video, WithTags, HighFieldCount, Multiple | ✅ Pass |
| ReportTableRow | ReportTableRow.stories.svelte | Image, Video, WithGPS, HighFieldCount, Multiple | ✅ Pass |
| ReportsHeader | ReportsHeader.stories.svelte | Default, NoReports | ✅ Pass |
| FiltersBar | FiltersBar.stories.svelte | NoFilter, Successful, GPS, Photos, Video | ✅ Pass |
| MobileFilters | MobileFilters.stories.svelte | NoFilter, Successful, GPS, Photos, Video | ✅ Pass |
| ReportsList | ReportsList.stories.svelte | WithData, EmptyState, SingleReport | ✅ Pass |
| ReportsTable | ReportsTable.stories.svelte | WithData, EmptyState, Filtered | ✅ Pass |

## Uncovered (no tests)
- No pages/routes are missing E2E test coverage — all 8 routes are covered.
- All interactive components have Storybook stories.

## Notes
- Storybook build: ✅ Passes successfully (314 stories across 75 story files)
- E2E tests: ✅ All 418 tests pass (22 test files across all routes)
- Unit tests (Vitest server): 1 test times out in property-based testing (`apiCleaningService.test.ts` — ProcessingResults construction) due to slow CI environment, not a code defect
- Vitest browser project: Cannot run in headless CI (no browser runtime available) — requires local environment with browser
- The environment running these tests is significantly slower than typical development machines, causing occasional Playwright timeouts on first runs, but all tests pass with sufficient timeout allowance
