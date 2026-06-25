<script lang="ts">
	import { onMount } from 'svelte';
	import { tx } from '$lib/shared/utils/i18n';
	import { apiFetch } from '$lib/auth/api-client.js';
	import AuthTextInput from '$lib/shared/elements/AuthTextInput.svelte';
	import Badge from '$lib/shared/elements/Badge.svelte';
	import Button from '$lib/shared/elements/Button.svelte';
	import {
		updateProfile,
		changeEmail,
		accountErrorToI18nKey,
		AccountError
	} from '$lib/clients/accountClient.js';
	import { validateName, validateEmail, isFormUnchanged } from '../validation.js';

	interface ProfileResponse {
		id: string;
		first_name: string;
		last_name: string;
		email: string;
		subscription_type?: string;
	}

	interface Props {
		onSave?: () => void;
	}

	let { onSave }: Props = $props();

	let firstName = $state('');
	let lastName = $state('');
	let email = $state('');

	let originalFirstName = $state('');
	let originalLastName = $state('');

	let firstNameError = $state('');
	let lastNameError = $state('');

	let saveLoading = $state(false);
	let saveSuccess = $state(false);
	let saveError = $state('');

	let emailLoading = $state(false);
	let emailSuccess = $state(false);
	let emailError = $state('');

	let fetchError = $state('');
	let fetchLoading = $state(true);

	async function loadProfile() {
		fetchLoading = true;
		fetchError = '';
		try {
			const res = await apiFetch('/api/auth/me');
			if (!res.ok) {
				fetchError = tx('settings.account.fetchError');
				return;
			}
			const profile: ProfileResponse = await res.json();
			firstName = profile.first_name ?? '';
			lastName = profile.last_name ?? '';
			email = profile.email ?? '';
			originalFirstName = firstName;
			originalLastName = lastName;
		} catch {
			fetchError = tx('settings.account.fetchError');
		} finally {
			fetchLoading = false;
		}
	}

	onMount(() => {
		loadProfile();
	});

	async function handleSave() {
		firstNameError = '';
		lastNameError = '';
		saveError = '';
		saveSuccess = false;

		const fnErr = validateName(firstName);
		const lnErr = validateName(lastName);

		if (fnErr) firstNameError = tx(fnErr as Parameters<typeof tx>[0]);
		if (lnErr) lastNameError = tx(lnErr as Parameters<typeof tx>[0]);

		if (fnErr || lnErr) return;

		if (
			isFormUnchanged(
				{ first_name: originalFirstName, last_name: originalLastName },
				{ first_name: firstName, last_name: lastName }
			)
		) {
			onSave?.();
			saveSuccess = true;
			return;
		}

		saveLoading = true;
		try {
			await updateProfile({ first_name: firstName.trim(), last_name: lastName.trim() });
			originalFirstName = firstName.trim();
			originalLastName = lastName.trim();
			saveSuccess = true;
			onSave?.();
		} catch (err) {
			if (err instanceof AccountError) {
				saveError = tx(accountErrorToI18nKey(err) as Parameters<typeof tx>[0]);
			} else {
				saveError = tx('settings.error.unknown');
			}
		} finally {
			saveLoading = false;
		}
	}

	async function handleEmailChange() {
		emailError = '';
		emailSuccess = false;

		const err = validateEmail(email);
		if (err) {
			emailError = tx(err as Parameters<typeof tx>[0]);
			return;
		}

		emailLoading = true;
		try {
			await changeEmail(email.trim());
			emailSuccess = true;
		} catch (err) {
			if (err instanceof AccountError) {
				emailError = tx(accountErrorToI18nKey(err) as Parameters<typeof tx>[0]);
			} else {
				emailError = tx('settings.error.unknown');
			}
		} finally {
			emailLoading = false;
		}
	}
</script>

<!-- Avatar row -->
<div class="flex items-center gap-4">
	<div
		class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-brand-blue/40 bg-brand-blue/10"
	>
		<i class="fa-solid fa-user text-2xl text-brand-blue"></i>
	</div>
	<div class="flex items-center gap-1.5 lg:gap-2">
		<Badge color="green" label={tx('settings.account.proBadge')} />
		<Badge color="blue" label={tx('settings.account.verifiedBadge')} />
	</div>
</div>

{#if fetchLoading}
	<div class="flex items-center gap-2 text-sm text-text-muted">
		<i class="fa-solid fa-circle-notch animate-spin"></i>
		<span>Loading...</span>
	</div>
{:else if fetchError}
	<div
		class="rounded-xl border border-brand-red/30 bg-brand-red/10 px-4 py-3 text-sm text-brand-red"
	>
		<i class="fa-solid fa-circle-exclamation mr-2"></i>{fetchError}
	</div>
	<Button variant="secondary" onclick={loadProfile}>
		{tx('settings.account.retry')}
	</Button>
{:else}
	<!-- Name fields -->
	<div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
		<AuthTextInput
			id="settings-first-name"
			label={tx('settings.account.firstNameLabel')}
			bind:value={firstName}
			error={firstNameError}
		/>
		<AuthTextInput
			id="settings-last-name"
			label={tx('settings.account.lastNameLabel')}
			bind:value={lastName}
			error={lastNameError}
		/>
	</div>

	{#if saveSuccess}
		<p class="text-sm text-brand-green">
			<i class="fa-solid fa-circle-check mr-1"></i>{tx('settings.account.saveSuccess')}
		</p>
	{/if}
	{#if saveError}
		<p class="text-sm text-brand-red">
			<i class="fa-solid fa-circle-exclamation mr-1"></i>{saveError}
		</p>
	{/if}

	<Button variant="primary" fullWidth disabled={saveLoading} onclick={handleSave}>
		{#if saveLoading}
			<i class="fa-solid fa-circle-notch animate-spin"></i>
		{:else}
			<i class="fa-solid fa-floppy-disk"></i>
		{/if}
		{tx('settings.account.saveButton')}
	</Button>

	<!-- Email change -->
	<div class="border-t border-gray-700 pt-4">
		<AuthTextInput
			id="settings-email"
			label={tx('settings.account.emailLabel')}
			type="email"
			bind:value={email}
			error={emailError}
		/>
		{#if emailSuccess}
			<p class="mt-2 text-sm text-brand-green">
				<i class="fa-solid fa-circle-check mr-1"></i>{tx('settings.account.emailChangeInfo')}
			</p>
		{/if}
		<div class="mt-3">
			<Button variant="secondary" fullWidth disabled={emailLoading} onclick={handleEmailChange}>
				{#if emailLoading}
					<i class="fa-solid fa-circle-notch animate-spin"></i>
				{:else}
					<i class="fa-solid fa-envelope"></i>
				{/if}
				{tx('settings.account.emailChangeButton')}
			</Button>
		</div>
	</div>
{/if}
