# Tasks — MetaCleaner Code Review (2026-06-15)

- [x] 1. [HIGH] Add JWT authentication to WebSocket `/api/jobs/{id}/progress` endpoint — remove `/progress` exemption from `isExemptPath()`, pass token as query param, validate before upgrade
- [x] 2. [HIGH] Update Storybook story mock data to use `iconColor: 'blue'` for image type entries (not `'green'`) across ReportTableRow, ReportCard, ReportsList, ReportsTable stories
- [ ] 3. [MEDIUM] Add `onSettings`/`onLogout` callback props and `onclick` handlers to `MobileHamburgerMenu.svelte` (same pattern as UserDropdown fix)
- [ ] 4. [MEDIUM] Wrap all `goto('/path')` and `href="/path"` in auth route components with `resolve()` from `$app/paths`
- [ ] 5. [MEDIUM] Replace local `riskScoreLabel()` in `RiskScoreRing.svelte` with shared `tx('step2.risk.score')` import
- [ ] 6. [MEDIUM] Audit and remove dead i18n keys from `messages/en.json` and `messages/cs.json` that have zero references in source
- [ ] 7. [MEDIUM] Add client-side format validation in CLI `clean` command before uploading (same logic as `scan` command)
- [ ] 8. [MEDIUM] Fix CLI `compare` command temp file path to preserve original file extension
- [ ] 9. [LOW] Replace hardcoded English text in `ScanProgressIndicator.svelte` and `RiskScoreRing.svelte` with `tx()` i18n calls
- [ ] 10. [LOW] Add `(key)` expressions to `{#each}` blocks in auth components (OtpInput, PasswordStrengthMeter, StepProgressBar)
- [ ] 11. [LOW] Fix CLI `compare` command `format` field to use `IMAGE_EXTENSIONS`/`VIDEO_EXTENSIONS` mapping consistently
- [ ] 12. [LOW] Replace hardcoded `aria-label` and `.sr-only` English text with `tx()` i18n calls across all components
