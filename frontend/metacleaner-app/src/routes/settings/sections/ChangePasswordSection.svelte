<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import Button from '$lib/shared/elements/Button.svelte';
	import PasswordInput from '../../(auth)/components/PasswordInput.svelte';
	import PasswordStrengthMeter from '../../(auth)/components/PasswordStrengthMeter.svelte';
	import {
		changePassword,
		accountErrorToI18nKey,
		AccountError
	} from '$lib/clients/accountClient.js';
	import { validatePassword } from '../validation.js';

	interface Props {
		onSave?: () => void;
	}

	let { onSave }: Props = $props();

	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');

	let showCurrentPass = $state(false);
	let showNewPass = $state(false);
	let showConfirmPass = $state(false);

	let currentError = $state('');
	let newPasswordError = $state('');
	let confirmError = $state('');
	let generalError = $state('');
	let successMessage = $state('');
	let isSubmitting = $state(false);

	const strengthScore = $derived.by(() => {
		let score = 0;
		if (newPassword.length >= 8) score++;
		if (/[A-Z]/.test(newPassword)) score++;
		if (/[0-9]/.test(newPassword)) score++;
		if (/[^A-Za-z0-9]/.test(newPassword)) score++;
		return score;
	});

	async function handleSave() {
		currentError = '';
		newPasswordError = '';
		confirmError = '';
		generalError = '';
		successMessage = '';

		const errors = validatePassword(currentPassword, newPassword, confirmPassword);

		if (errors.current) currentError = tx(errors.current as Parameters<typeof tx>[0]);
		if (errors.newPassword) newPasswordError = tx(errors.newPassword as Parameters<typeof tx>[0]);
		if (errors.confirm) confirmError = tx(errors.confirm as Parameters<typeof tx>[0]);

		if (errors.current || errors.newPassword || errors.confirm) return;

		isSubmitting = true;
		try {
			await changePassword(currentPassword, newPassword);
			currentPassword = '';
			newPassword = '';
			confirmPassword = '';
			successMessage = tx('settings.password.saveSuccess');
			onSave?.();
		} catch (err) {
			if (err instanceof AccountError) {
				const key = accountErrorToI18nKey(err) as Parameters<typeof tx>[0];
				if (err.status === 401) {
					currentError = tx('settings.error.invalidCurrentPassword');
				} else {
					generalError = tx(key);
				}
			} else {
				generalError = tx('settings.error.unknown');
			}
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-col gap-1.5">
		<label class="text-sm font-medium text-white" for="settings-current-password">
			{tx('settings.password.currentLabel')}
		</label>
		<PasswordInput
			id="settings-current-password"
			bind:value={currentPassword}
			placeholder="••••••••••••"
			visible={showCurrentPass}
			error={currentError}
			onToggle={() => (showCurrentPass = !showCurrentPass)}
		/>
	</div>

	<div class="flex flex-col gap-1.5">
		<label class="text-sm font-medium text-white" for="settings-new-password">
			{tx('settings.password.newLabel')}
		</label>
		<PasswordInput
			id="settings-new-password"
			bind:value={newPassword}
			placeholder="••••••••••••"
			visible={showNewPass}
			error={newPasswordError}
			onToggle={() => (showNewPass = !showNewPass)}
		/>
		<PasswordStrengthMeter score={strengthScore} />
	</div>

	<div class="flex flex-col gap-1.5">
		<label class="text-sm font-medium text-white" for="settings-confirm-password">
			{tx('settings.password.confirmLabel')}
		</label>
		<PasswordInput
			id="settings-confirm-password"
			bind:value={confirmPassword}
			placeholder="••••••••••••"
			visible={showConfirmPass}
			error={confirmError}
			onToggle={() => (showConfirmPass = !showConfirmPass)}
		/>
	</div>

	{#if successMessage}
		<p class="text-sm text-brand-green">
			<i class="fa-solid fa-circle-check mr-1"></i>{successMessage}
		</p>
	{/if}
	{#if generalError}
		<p class="text-sm text-brand-red">
			<i class="fa-solid fa-circle-exclamation mr-1"></i>{generalError}
		</p>
	{/if}

	<Button variant="primary" fullWidth disabled={isSubmitting} onclick={handleSave}>
		{#if isSubmitting}
			<i class="fa-solid fa-circle-notch animate-spin"></i>
		{:else}
			<i class="fa-solid fa-check"></i>
		{/if}
		{tx('settings.password.saveButton')}
	</Button>
</div>
