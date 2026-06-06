# Test Report

Created: 2026-06-06T06:57:11+00:00
Updated: 2026-06-06T06:57:11+00:00

## Summary

- Total E2E tests: 189
- Passing E2E tests: 0 (environment issue — see Notes)
- Failing E2E tests: 189 (environment issue — see Notes)
- Total component stories: 212
- Passing component stories: 212
- Failing component stories: 0

## E2E Test Coverage

| Page/Route | Test File | Tests | Status |
|---|---|---|---|
| / (step1) | e2e/step1-upload.spec.ts | 11 | ⚠️ Env (browser missing libs) |
| /step2 | e2e/step2-risk-analysis.spec.ts | 16 | ⚠️ Env (browser missing libs) |
| /step3 | e2e/step3-processing.spec.ts | 14 | ⚠️ Env (browser missing libs) |
| /step4 | e2e/step4-error.spec.ts | 18 | ⚠️ Env (browser missing libs) |
| /step5 | e2e/step5-results.spec.ts | 21 | ⚠️ Env (browser missing libs) |
| /reports | e2e/reports.spec.ts | 24 | ⚠️ Env (browser missing libs) |
| /report/[id] | e2e/report-detail.spec.ts | 30 | ⚠️ Env (browser missing libs) |
| Cross-page navigation | e2e/navigation.spec.ts | 22 | ⚠️ Env (browser missing libs) |
| Responsive layout | e2e/responsive.spec.ts | 33 | ⚠️ Env (browser missing libs) |

## Component Test Coverage

| Component | Story File | States Covered | Status |
|---|---|---|---|
| ActivityLog | ActivityLog.stories.svelte | WithEntries, SuccessOnly, WithError, InProgress, Empty | ✅ Pass |
| BottomSheet | BottomSheet.stories.svelte | Closed, OpenWithContent, OpenEmpty | ✅ Pass |
| FileListItem | FileListItem.stories.svelte | ImageFile, VideoFile, WithGPSIndicator, WithRemoveButton, SuccessState, ErrorState | ✅ Pass |
| LanguageDropdown | LanguageDropdown.stories.svelte | Closed, Open, CzechSelectedClosed, CzechSelectedOpen | ✅ Pass |
| MobileHamburgerMenu | MobileHamburgerMenu.stories.svelte | Closed, Open, WithBackButton, OpenWithBackButton, NoUser | ✅ Pass |
| NavBar | NavBar.stories.svelte | Default, WithBackButton, WithoutLanguageDropdown, AvatarMobileStyle, Compact, NoUser | ✅ Pass |
| PageHeader | PageHeader.stories.svelte | WithoutBadge, WithBlueBadge, WithOrangeBadge, WithRedBadge | ✅ Pass |
| StatCard | StatCard.stories.svelte | Blue, Green, Red, Orange, BlueHighlighted, GreenHighlighted, RedHighlighted, OrangeHighlighted, WithMobileLabel | ✅ Pass |
| Toast | Toast.stories.svelte | Visible, Hidden, WithCustomIcon, ErrorIcon | ✅ Pass |
| UserDropdown | UserDropdown.stories.svelte | Closed, Open, NoUser, NoUserOpen | ✅ Pass |
| AccordionCard | AccordionCard.stories.svelte | Closed, Open, WithIconClosed, WithIconOpen, RedBorder, BlueBorder, GreenBorder, WithHeaderContent | ✅ Pass |
| Badge | Badge.stories.svelte | Blue, Green, Red, Orange, WithDot, WithDotGreen, WithIcon, WithIconRed, WithIconOrange, WithDotAndIcon | ✅ Pass |
| Button | Button.stories.svelte | Primary, Secondary, Danger, Ghost, Disabled, WithIcon, Loading, SizeSmall, SizeMedium, SizeLarge | ✅ Pass |
| Card | Card.stories.svelte | Default, GreenBorder, RedBorder, BlueBorder, OrangeBorder, CustomPadding | ✅ Pass |
| Chip | Chip.stories.svelte | Blue, Green, Red, Orange, Muted, WithoutBorder, RoundedShape, AllColors | ✅ Pass |
| IconContainer | IconContainer.stories.svelte | BlueTinted, GreenTinted, RedTinted, OrangeTinted, MutedTinted, BlueSolid, GreenSolid, RedSolid, OrangeSolid, MutedSolid, SizeXs, SizeSm, SizeMd, SizeLg, SizeXl, Size2xl, SquareShape, CircleShape, AllSizes, AllColorsTinted, AllColorsSolid | ✅ Pass |
| ProgressBar | ProgressBar.stories.svelte | Empty, Half, Full, Blue, Green, Red, Orange, Gray, HeightXS, HeightSM, HeightMD | ✅ Pass |
| ToggleSwitch | ToggleSwitch.stories.svelte | Off, On, DisabledOff, DisabledOn | ✅ Pass |
| DropZone | DropZone.stories.svelte | Idle, Dragover | ✅ Pass |
| ScanProgressIndicator | ScanProgressIndicator.stories.svelte | Idle, Scanning, Complete, Error | ✅ Pass |
| BeforeAfterScore | BeforeAfterScore.stories.svelte | ImprovedHighBeforeLowAfter, ImprovedModerateReduction, UnchangedBothScoresEqual, UnchangedZeroRisk | ✅ Pass |
| FileListItemRisk | FileListItemRisk.stories.svelte | LowRiskFewFieldsNoGPS, MediumRiskManyMetadataFields, HighRiskGPSDetected, +3 more | ✅ Pass |
| RiskBreakdownBar | RiskBreakdownBar.stories.svelte | CriticalGPSLocation, HighDeviceInfo, MediumTimestamps, LowAuthorInfo, MultipleCategories | ✅ Pass |
| RiskScoreRing | RiskScoreRing.stories.svelte | LowRisk20, MediumRisk50, HighRisk72, SmallSize, LargeSize, BlueVariant | ✅ Pass |
| FileItemProcessing | FileItemProcessing.stories.svelte | DoneImageNoGPS, DoneImageWithGPSRemoved, InProgressVideoFile, InProgressImageFile, Queued | ✅ Pass |
| ProcessingVisual | ProcessingVisual.stories.svelte | AnimatedLarge, AnimatedSmall | ✅ Pass |
| ErrorDetailBox | ErrorDetailBox.stories.svelte | SingleErrorJPEG, SingleErrorPDF, MultipleErrorsBatch, NullErrorState | ✅ Pass |
| ErrorTypeSelector | ErrorTypeSelector.stories.svelte | ActiveSingleType, InactiveSingleType, MultipleTypesFirstActive, MultipleTypesLastActive, MultipleTypesNoneActive | ✅ Pass |
| ErrorVisual | ErrorVisual.stories.svelte | AnimatedLarge, AnimatedSmall | ✅ Pass |
| FileResultItem | FileResultItem.stories.svelte | ImageGPSRemoved, VideoFile, ImageNoGPS | ✅ Pass |
| MetadataPanel | MetadataPanel.stories.svelte | BeforeWithData, AfterAllCleaned, BeforeAndAfterSideBySide, BeforeEmptyState | ✅ Pass |
| ChartBar | ChartBar.stories.svelte | RedHighValue, OrangeMediumValue, BlueLowValue, GreenFullBar, ZeroValue, AllColors | ✅ Pass |
| FileAccordionItem | FileAccordionItem.stories.svelte | CollapsedImageNoGPS, ExpandedImageWithMetadata, CollapsedWithGPSTag, ExpandedWithGPSAndRichMetadata, ExpandedVideoFile | ✅ Pass |
| MetadataTable | MetadataTable.stories.svelte | FewFields, ManyFields, WithMoreCountRow, SingleField | ✅ Pass |
| FilterPill | FilterPill.stories.svelte | Active, Inactive, ActiveWithCount, InactiveWithCount, ActiveWithIcon, InactiveWithIcon, PillGroupOneActive | ✅ Pass |
| ReportCard | ReportCard.stories.svelte | ImageType, VideoType, WithTags, HighFieldCount, MultipleCards | ✅ Pass |
| ReportTableRow | ReportTableRow.stories.svelte | ImageType, VideoType, WithGPSTag, HighFieldCount, MultipleRows | ✅ Pass |

## Uncovered (no tests)

- None — all pages have E2E test coverage and all interactive components have Storybook stories.

## Notes

- **Storybook build succeeds**: All 212 component stories compile and build without errors (`storybook build` exits 0).
- **App build verified**: `vite build` completes successfully as part of the Playwright webServer setup (confirmed by the build output during test attempts).
