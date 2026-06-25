# Design Document: Settings Page Design Fixes

## Overview

This document describes the technical changes needed to align the Settings page implementation with the design mockups and the user's specific requirements. All changes are frontend-only within `frontend/metacleaner-app/src/routes/settings/`. No backend changes are required. The fixes address 7 discrepancies: missing page header, unwanted avatar row, separated email field, API key card layout mismatch, missing dates, and hidden affiliate section.

## Glossary

- **SettingsHeaderSection**: The page header component showing a gear icon, title, and subtitle at the top of the Settings page.
- **AccountInfoSection**: The form section for editing user profile (names, email) with badges.
- **ApiKeysSection**: The section listing user's API keys with CRUD actions.
- **AffiliateProgramSection**: The affiliate program section showing stats and referral link.
- **SettingsAccordionCard**: A reusable accordion wrapper used for collapsible sections on mobile.
- **Design mockup**: The HTML files in `.design/metacleaner-settings-desktop.html` and `.design/metacleaner-settings-mobile.html`.

## Bug Details

The Settings page implementation has 7 visual/structural discrepancies from the approved design mockups:

1. **Missing page header** — `SettingsHeaderSection` component exists in the codebase but is not imported or rendered in `+page.svelte`.
2. **Unwanted avatar/icon row** — `AccountInfoSection` displays a static `fa-user` icon in a blue container above the badges and form fields, which the user does not want.
3. **Separated email field** — Email is split from name fields with a `border-t` divider and has a separate "Change Email" button, whereas the design shows all fields in a unified form with a single "Save" button.
4. **Save password button color** — Reported as wrong color, but upon investigation `variant="primary"` already renders green via the `Button` component's `variantMap`. No change needed.
5. **API key cards don't match design** — Keys are displayed as plain rows with text, missing the design's card layout with masked `<input type="password">`, eye toggle button, and copy button.
6. **Missing "last used" date** — Only creation date is shown; design shows both created and last used dates.
7. **Affiliate section hidden** — Entire section is commented out; user wants it visible but in a deactivated/coming-soon state.

## Expected Behavior

Per bugfix requirements:

- **2.1**: Page header (gear icon + title + subtitle) displayed at top, without last-login indicator.
- **2.2**: No avatar/icon row in AccountInfoSection — only badges and form fields.
- **2.3**: Email field in same form as name fields, single "Save" button handles all changes (email change triggers verification flow silently).
- **2.4**: Password save button is green — already correct (no change).
- **2.5**: Each API key in a card with masked password input, eye toggle, copy button, status badge, dates, plus action buttons.
- **2.6**: Both creation date and last-used date displayed per key.
- **2.7**: Affiliate section visible but in a greyed-out/disabled "Coming Soon" state.

## Hypothesized Root Cause

These are not logic bugs but intentional omissions and design divergences during the initial implementation:

1. **Header**: Was likely removed to simplify the page during development — the component was created but never wired up.
2. **Avatar row**: Was a placeholder since the design showed an avatar image, but the user decided against avatars entirely.
3. **Separated email**: Was split into a separate section because email change has a different backend flow (verification). This is an architectural choice that diverges from the visual design.
4. **Button color**: Non-issue — `primary` variant is green.
5. **API key layout**: The implementation took a simpler list approach rather than the richer card design shown in mockups.
6. **Last used date**: Field exists in the `ApiKey` type (`last_used_at`) but was not rendered.
7. **Affiliate**: Intentionally commented out as "planned for future" — user now wants it visible but marked as upcoming.

## Fix Implementation

### Fix 1: Restore SettingsHeaderSection in +page.svelte

**File:** `frontend/metacleaner-app/src/routes/settings/+page.svelte`

Import `SettingsHeaderSection` and render it above the grid:

```svelte
<script lang="ts">
	// ... existing imports
	import SettingsHeaderSection from './sections/SettingsHeaderSection.svelte';
</script>

<main class="mx-auto w-full max-w-[1100px] px-6 pt-4 pb-24 lg:pt-0">
	<SettingsHeaderSection />
	<div class="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
		<!-- columns unchanged -->
	</div>
</main>
```

Also uncomment the Affiliate section (see Fix 6).

---

### Fix 2: Remove lastLogin from SettingsHeaderSection

**File:** `frontend/metacleaner-app/src/routes/settings/sections/SettingsHeaderSection.svelte`

Remove the `Props` interface and `lastLogin` prop entirely. Remove the last-login badge `<div>` (the one with `sm:flex`, `fa-solid fa-clock`). Simplify the layout from `flex-col sm:flex-row sm:items-center sm:justify-between` to just a flex row since there's no right-side element anymore.

Final structure:
```svelte
<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
</script>

<div class="fade-in-up mb-4 flex items-center gap-3 lg:mb-6 lg:gap-4">
	<div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-brand-blue/40 bg-brand-blue/10 lg:h-14 lg:w-14 lg:rounded-2xl">
		<i class="fa-solid fa-gear text-xl text-brand-blue lg:text-3xl"></i>
	</div>
	<div>
		<h1 class="text-xl leading-tight font-bold text-white lg:text-3xl">
			{tx('settings.header.title')}
		</h1>
		<p class="mt-0.5 text-xs text-text-muted lg:mt-1 lg:text-sm">
			{tx('settings.header.subtitle')}
		</p>
	</div>
</div>
```

---

### Fix 3: AccountInfoSection — Remove Icon Row + Merge Email

**File:** `frontend/metacleaner-app/src/routes/settings/sections/AccountInfoSection.svelte`

**3a. Remove avatar/icon row:**

Delete the entire block:
```svelte
<!-- Avatar row -->
<div class="flex items-center gap-4">
	<div class="flex h-16 w-16 ...">...</div>
	<div class="flex items-center gap-1.5 ...">...</div>
</div>
```

**3b. Move badges inline** — Place badges at the top of the loaded content (without icon):
```svelte
<div class="mb-3 flex items-center gap-1.5 lg:gap-2">
	<Badge color="green" label={tx('settings.account.proBadge')} />
	<Badge color="blue" label={tx('settings.account.verifiedBadge')} />
</div>
```

**3c. Merge email into main form:**

Remove the `<div class="border-t border-gray-700 pt-4">` wrapper and the separate "Change Email" button. Place the email field below the name grid:

```svelte
<!-- Name fields -->
<div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
	<AuthTextInput id="settings-first-name" label={tx('settings.account.firstNameLabel')} bind:value={firstName} error={firstNameError} />
	<AuthTextInput id="settings-last-name" label={tx('settings.account.lastNameLabel')} bind:value={lastName} error={lastNameError} />
</div>

<!-- Email field (same form) -->
<AuthTextInput id="settings-email" label={tx('settings.account.emailLabel')} type="email" bind:value={email} error={emailError} />
```

**3d. Single save handler:**

Merge `handleEmailChange()` logic into `handleSave()`:
```typescript
async function handleSave() {
	// Reset errors
	// Validate name + email
	// If name changed → call updateProfile()
	// If email changed → call changeEmail()
	// Show success; if email changed, show additional verification info message
}
```

Remove the separate `handleEmailChange` function and `emailLoading`/`emailSuccess` state (consolidate into the single save flow).

---

### Fix 4: ChangePasswordSection — No Change

`variant="primary"` in the `Button` component already maps to `bg-brand-green`. The button is already green. No code change required.

---

### Fix 5: ApiKeysSection — Redesign Key Cards

**File:** `frontend/metacleaner-app/src/routes/settings/sections/ApiKeysSection.svelte`

Replace the current key item markup with the design-matching card layout.

**New state:**
```typescript
let revealedKeys = $state<Set<string>>(new Set());
// For newly created keys, store the full plaintext temporarily
let newKeyValues = $state<Map<string, string>>(new Map());
```

**New key card template (per key):**
```svelte
<div class="rounded-xl border border-gray-800 bg-navy-main p-4 flex flex-col gap-3">
	<!-- Header row: dot indicator + key name + status badge -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<div class="h-2 w-2 rounded-full {key.status === 'active' ? 'bg-brand-green animate-pulse' : 'bg-gray-600'}"></div>
			<span class="text-xs font-semibold {key.status === 'active' ? 'text-white' : 'text-text-muted'}">{key.name}</span>
		</div>
		<Badge color={key.status === 'active' ? 'green' : 'gray'} label={statusLabel} dot={key.status === 'active'} />
	</div>

	<!-- Key value row: masked input + eye toggle + copy button -->
	<div class="flex gap-2">
		<input
			type={revealedKeys.has(key.id) ? 'text' : 'password'}
			readonly
			value={getDisplayValue(key)}
			class="flex-1 min-w-0 px-3 py-2 rounded-lg bg-navy-card border border-gray-700 text-xs text-text-muted font-mono focus:outline-none"
		/>
		<button onclick={() => toggleReveal(key.id)} class="w-9 h-9 lg:w-9 lg:h-9 min-h-[44px] min-w-[44px] lg:min-h-0 lg:min-w-0 rounded-lg bg-navy-lighter border border-gray-700 flex items-center justify-center text-text-muted hover:text-white transition-colors shrink-0">
			<i class="fa-solid {revealedKeys.has(key.id) ? 'fa-eye-slash' : 'fa-eye'} text-xs"></i>
		</button>
		<button onclick={() => copyKey(key)} class="w-9 h-9 lg:w-9 lg:h-9 min-h-[44px] min-w-[44px] lg:min-h-0 lg:min-w-0 rounded-lg bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue hover:bg-brand-blue/20 transition-colors shrink-0">
			<i class="fa-solid fa-copy text-xs"></i>
		</button>
	</div>

	<!-- Dates -->
	<p class="text-[10px] text-text-muted">
		{tx('apiKeys.createdAt')}: {formatDate(key.created_at)}{#if key.last_used_at} · {tx('apiKeys.lastUsedAt')}: {formatDate(key.last_used_at)}{/if}
	</p>

	<!-- Actions -->
	<div class="flex items-center gap-2">
		{#if key.status === 'active'}
			<Button variant="secondary" size="sm" disabled={revokingId === key.id} onclick={() => handleRevoke(key)}>
				{#if revokingId === key.id}<i class="fa-solid fa-circle-notch animate-spin"></i>{:else}<i class="fa-solid fa-ban"></i>{/if}
				{tx('apiKeys.action.revoke')}
			</Button>
		{/if}
		<Button variant="danger" size="sm" disabled={deletingId === key.id} onclick={() => handleDeleteClick(key)}>
			{#if deletingId === key.id}<i class="fa-solid fa-circle-notch animate-spin"></i>{:else}<i class="fa-solid fa-trash"></i>{/if}
			{tx('apiKeys.action.delete')}
		</Button>
	</div>
</div>
```

**Helper functions:**
```typescript
function getDisplayValue(key: ApiKey): string {
	if (revealedKeys.has(key.id) && newKeyValues.has(key.id)) {
		return newKeyValues.get(key.id)!;
	}
	return `${key.key_prefix}••••••••${key.key_suffix}`;
}

function toggleReveal(keyId: string) {
	if (revealedKeys.has(keyId)) {
		revealedKeys = new Set([...revealedKeys].filter(id => id !== keyId));
	} else {
		revealedKeys = new Set([...revealedKeys, keyId]);
	}
}

function copyKey(key: ApiKey) {
	const value = newKeyValues.get(key.id) ?? `${key.key_prefix}••••••••${key.key_suffix}`;
	navigator.clipboard.writeText(value).catch(() => {});
}
```

**On key creation:** When `handleKeyCreated` is called, also store the full plaintext in `newKeyValues`:
```typescript
function handleKeyCreated(key: ApiKey, fullKey?: string) {
	keys = [...keys, key];
	if (fullKey) {
		newKeyValues = new Map([...newKeyValues, [key.id, fullKey]]);
	}
	showCreateModal = false;
}
```

Update `CreateKeyModal`'s `onCreated` callback to also pass the plaintext key value.

---

### Fix 6: Uncomment Affiliate Section (Deactivated)

**File:** `frontend/metacleaner-app/src/routes/settings/+page.svelte`

Uncomment the Affiliate `SettingsAccordionCard` block. Add `disabled={true}` prop. Change badge to "Coming Soon":

```svelte
<SettingsAccordionCard
	icon="fa-solid fa-users"
	colorVariant="orange"
	title={tx('settings.affiliate.title')}
	subtitle={tx('settings.affiliate.subtitle')}
	badge={tx('settings.affiliate.comingSoonBadge')}
	animationDelay="delay-3"
	disabled={true}
>
	<AffiliateProgramSection />
</SettingsAccordionCard>
```

Import `AffiliateProgramSection` at the top of the script.

---

### Fix 7: Add `disabled` Prop to SettingsAccordionCard

**File:** `frontend/metacleaner-app/src/routes/settings/components/SettingsAccordionCard.svelte`

Add `disabled?: boolean` to the Props interface (default `false`). When true, apply `opacity-50 pointer-events-none` to the root container:

```svelte
<div
	class="fade-in-up overflow-hidden rounded-2xl border border-gray-800 bg-navy-card shadow-card {animationDelay ?? ''} {disabled ? 'opacity-50 pointer-events-none' : ''}"
>
```

---

### Fix 8: Make AffiliateProgramSection Work Without External Data

**File:** `frontend/metacleaner-app/src/routes/settings/sections/AffiliateProgramSection.svelte`

Make `affiliateStats` optional with zero/empty defaults:

```typescript
interface Props {
	affiliateStats?: AffiliateStats;
	onCopy?: (text: string, msg: string) => void;
}

const defaultStats: AffiliateStats = {
	referrals: 0,
	conversions: 0,
	earnings: '€0',
	affiliateLink: 'https://metacleaner.com/ref/...'
};

let { affiliateStats = defaultStats, onCopy }: Props = $props();
```

---

## i18n Keys

New/updated keys in `messages/en.json` and `messages/cs.json`:

| Key | EN | CS |
|-----|----|----|
| `settings.affiliate.comingSoonBadge` | `Coming Soon` | `Připravujeme` |
| `apiKeys.createdAt` | `Created` | `Vytvořen` |
| `apiKeys.lastUsedAt` | `Last used` | `Použit` |

---

## Correctness Properties

### Property 1: Unified save handles both name and email

For any combination of name/email changes in the AccountInfoSection form, the single "Save" button SHALL:
- Call `updateProfile()` only if name fields differ from original
- Call `changeEmail()` only if email differs from original
- Call both if both changed
- Call neither if nothing changed (no-op with instant success)

**Validates: Requirements 2.3**

### Property 2: API key reveal only shows full value for newly created keys

For any API key loaded from the backend (not just created), toggling the eye button SHALL only alternate between showing `{prefix}••••••••{suffix}` (password type) and the same value in plaintext — the full key is never available for previously-created keys. Only keys created in the current session have their full value temporarily available.

**Validates: Requirements 2.5**

---

## Testing Strategy

Manual verification:
1. Load Settings page → header visible with gear icon + title + subtitle
2. AccountInfoSection → no icon/avatar row, badges at top, email in same form as names, single "Save" button
3. Change only name → "Save" calls profile update, not email change
4. Change only email → "Save" calls email change, shows verification info
5. Change both → both API calls made
6. ChangePasswordSection → button is green (same as before)
7. API key cards → design-matching layout with masked input, eye toggle, copy, dates, action buttons
8. Eye toggle on existing key → shows prefix+dots+suffix as text (no full reveal)
9. Create new key → full key visible in card, eye toggle works, copy works
10. Affiliate section → visible but greyed out with "Coming Soon" badge, non-interactive
11. Danger Zone → still at bottom of left column, fully functional
12. Mobile → all sections stack, accordions collapse, touch targets ≥ 44px

## Files Modified

| File | Action |
|------|--------|
| `src/routes/settings/+page.svelte` | Import header + uncomment affiliate |
| `src/routes/settings/sections/SettingsHeaderSection.svelte` | Remove lastLogin prop + badge |
| `src/routes/settings/sections/AccountInfoSection.svelte` | Remove icon row, merge email form |
| `src/routes/settings/sections/ApiKeysSection.svelte` | Redesign key cards |
| `src/routes/settings/components/SettingsAccordionCard.svelte` | Add disabled prop |
| `src/routes/settings/sections/AffiliateProgramSection.svelte` | Make props optional |
| `messages/en.json` | Add 3 new keys |
| `messages/cs.json` | Add 3 new keys |
