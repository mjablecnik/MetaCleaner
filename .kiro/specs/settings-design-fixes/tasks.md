# Implementation Plan: Settings Page Design Fixes

## Overview

This plan fixes 7 visual/structural discrepancies between the Settings page implementation and the design mockups. All changes are frontend-only (no backend work). Tasks are ordered to minimize conflicts: structural changes first (header, accordion card), then section-by-section fixes, then i18n, then verification.

## Tasks

- [ ] 1. Restore page header and simplify SettingsHeaderSection
  - Remove the `Props` interface and `lastLogin` prop from `frontend/metacleaner-app/src/routes/settings/sections/SettingsHeaderSection.svelte`
  - Remove the last-login badge `<div>` (the block with `sm:flex`, `fa-solid fa-clock`, and the lastLogin binding)
  - Simplify the outer `<div>` layout from `flex-col sm:flex-row sm:items-center sm:justify-between` to a simple `flex items-center gap-3 lg:gap-4`
  - Replace `flex-shrink-0` with `shrink-0` on the icon container
  - In `frontend/metacleaner-app/src/routes/settings/+page.svelte`, import `SettingsHeaderSection` and render it above the grid (inside `<main>`, before the `<div class="grid ...">`)
  - _Fixes: 2.1_

- [ ] 2. Remove avatar/icon row and merge email into unified form in AccountInfoSection
  - In `frontend/metacleaner-app/src/routes/settings/sections/AccountInfoSection.svelte`:
  - Delete the entire "Avatar row" block (`<div class="flex items-center gap-4">` containing the `fa-user` icon div and the badges div)
  - Add badges directly at the top of the `{:else}` loaded content block: `<div class="mb-3 flex items-center gap-1.5 lg:gap-2">` with `Badge` components for Pro and Verified
  - Remove the `<div class="border-t border-gray-700 pt-4">` wrapper, the separate `handleEmailChange` button, and related email-specific state (`emailLoading`, `emailSuccess`)
  - Place the email `AuthTextInput` field directly below the name fields grid (outside the grid, full width)
  - Add `originalEmail` state variable, populated from the fetched profile data alongside `originalFirstName`/`originalLastName`
  - Merge email change logic into `handleSave()`: after name validation, also validate email; if email differs from `originalEmail`, call `changeEmail()`; if name differs, call `updateProfile()`; show combined success, and if email changed show additional verification info message
  - Remove the separate `handleEmailChange` function entirely
  - Keep the single `Button variant="primary"` for save (already green)
  - _Fixes: 2.2, 2.3; Preserves: 3.2, 3.3, 3.6, 3.7_

- [ ] 3. Redesign API key cards to match design mockup
  - In `frontend/metacleaner-app/src/routes/settings/sections/ApiKeysSection.svelte`:
  - Add new state: `let revealedKeys = $state<Set<string>>(new Set())` and `let newKeyValues = $state<Map<string, string>>(new Map())`
  - Add helper functions: `getDisplayValue(key)` returning full key from `newKeyValues` if revealed and available, otherwise `{prefix}••••••••{suffix}`; `toggleReveal(keyId)` toggling the Set; `copyKey(key)` copying to clipboard
  - Replace the current key list markup (the `{#each keys as key}` block) with the card layout: `rounded-xl border border-gray-800 bg-navy-main p-4 flex flex-col gap-3` containing header row (dot + name + badge), key value row (masked input + eye button + copy button), dates row, and actions row
  - In the key value row: use `<input type={revealedKeys.has(key.id) ? 'text' : 'password'} readonly value={getDisplayValue(key)}>` with monospace font styling
  - Eye toggle button: `w-9 h-9` with `min-h-[44px] min-w-[44px] lg:min-h-0 lg:min-w-0` for mobile touch target, `bg-navy-lighter border border-gray-700`
  - Copy button: same dimensions, `bg-brand-blue/10 border border-brand-blue/20 text-brand-blue`
  - Dates row: `text-[10px] text-text-muted` showing `{tx('apiKeys.createdAt')}: {formatDate(key.created_at)}` and conditionally `· {tx('apiKeys.lastUsedAt')}: {formatDate(key.last_used_at)}`
  - Actions row: keep existing Revoke and Delete buttons (unchanged logic)
  - Update `handleKeyCreated` to accept a second parameter `fullKey?: string` and store it in `newKeyValues` map
  - Update `CreateKeyModal` usage: pass the full key value from the modal's `onCreated` callback (the modal already has `createdKey` state with the plaintext)
  - _Fixes: 2.5, 2.6; Preserves: 3.4, 3.5, 3.8_

- [ ] 4. Update CreateKeyModal callback to pass plaintext key
  - In `frontend/metacleaner-app/src/routes/settings/components/CreateKeyModal.svelte`:
  - Change the `onCreated` prop type from `(key: ApiKey) => void` to `(key: ApiKey, fullKey: string) => void`
  - In the `handleDone()` function, call `onCreated(createdApiKey, createdKey)` instead of `onCreated(createdApiKey)`
  - _Fixes: 2.5_

- [ ] 5. Add disabled prop to SettingsAccordionCard
  - In `frontend/metacleaner-app/src/routes/settings/components/SettingsAccordionCard.svelte`:
  - Add `disabled?: boolean` to the `Props` interface with default `false`
  - Destructure `disabled = false` in the `$props()` call
  - Add `{disabled ? 'opacity-50 pointer-events-none' : ''}` to the root `<div>` class string
  - _Fixes: 2.7_

- [ ] 6. Uncomment Affiliate section and show as deactivated
  - In `frontend/metacleaner-app/src/routes/settings/+page.svelte`:
  - Import `AffiliateProgramSection` from `./sections/AffiliateProgramSection.svelte`
  - Uncomment the Affiliate `SettingsAccordionCard` block in the right column
  - Change the `badge` prop from `tx('settings.affiliate.activeBadge')` to `tx('settings.affiliate.comingSoonBadge')`
  - Add `disabled={true}` prop to the `SettingsAccordionCard`
  - _Fixes: 2.7_

- [ ] 7. Make AffiliateProgramSection work without external data
  - In `frontend/metacleaner-app/src/routes/settings/sections/AffiliateProgramSection.svelte`:
  - Change `affiliateStats: AffiliateStats` to `affiliateStats?: AffiliateStats` in the Props interface
  - Add a `defaultStats` constant with zero values: `{ referrals: 0, conversions: 0, earnings: '€0', affiliateLink: 'https://metacleaner.com/ref/...' }`
  - Use `affiliateStats = defaultStats` in the `$props()` destructuring
  - _Fixes: 2.7_

- [ ] 8. Add i18n translation keys
  - In `frontend/metacleaner-app/messages/en.json`, add:
    - `"settings.affiliate.comingSoonBadge": "Coming Soon"`
    - `"apiKeys.createdAt": "Created"`
    - `"apiKeys.lastUsedAt": "Last used"`
  - In `frontend/metacleaner-app/messages/cs.json`, add:
    - `"settings.affiliate.comingSoonBadge": "Připravujeme"`
    - `"apiKeys.createdAt": "Vytvořen"`
    - `"apiKeys.lastUsedAt": "Použit"`
  - _Fixes: 2.5, 2.6, 2.7_

- [ ] 9. Manual verification
  - Load Settings page and verify page header is visible (gear icon + title + subtitle, no last login)
  - Verify AccountInfoSection has no icon/avatar row, badges are at top, email is in same form as name fields, single Save button
  - Test saving only name change → only profile update called
  - Test saving only email change → email change called, verification info shown
  - Test saving both → both calls made
  - Verify ChangePasswordSection button is green (unchanged)
  - Verify API key cards match design: masked input, eye toggle, copy button, dates, action buttons
  - Test eye toggle on existing key → shows prefix+dots+suffix as plaintext
  - Create a new key → full key visible, eye toggle reveals full value, copy copies full value
  - Verify Affiliate section is visible but greyed out with "Coming Soon" badge and non-interactive
  - Verify Danger Zone is still present at bottom of left column
  - Test on mobile viewport: sections stack, accordions work, touch targets adequate
  - Verify no horizontal overflow at any viewport width
  - _Validates: all bugfix requirements + regression prevention_


## Notes

- No backend changes required — all fixes are frontend-only
- Task 4 (ChangePasswordSection) from the design is skipped since `variant="primary"` already renders green
- The `CreateKeyModal` already has the `createdKey` plaintext value in its state — task 4 just passes it through the callback
- The `ApiKey` type already includes `last_used_at: string | null` — no type changes needed
- Affiliate section uses mock/zero data since the feature is deactivated

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1", "5", "7", "8"] },
    { "id": 1, "tasks": ["2", "3", "4", "6"] },
    { "id": 2, "tasks": ["9"] }
  ]
}
```
