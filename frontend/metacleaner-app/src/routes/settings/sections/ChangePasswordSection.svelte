<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import PasswordInput from '../../(auth)/components/PasswordInput.svelte';
	import PasswordStrengthMeter from '../../(auth)/components/PasswordStrengthMeter.svelte';

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

	const strengthScore = $derived.by(() => {
		let score = 0;
		if (newPassword.length >= 8) score++;
		if (/[A-Z]/.test(newPassword)) score++;
		if (/[0-9]/.test(newPassword)) score++;
		if (/[^A-Za-z0-9]/.test(newPassword)) score++;
		return score;
	});
</script>

<div class="flex flex-col gap-1.5">
	<label class="text-xs font-semibold uppercase tracking-wider text-text-muted"
		>{tx('settings.password.currentLabel')}</label
	>
	<PasswordInput
		bind:value={currentPassword}
		placeholder="••••••••••••"
		visible={showCurrentPass}
		onToggle={() => (showCurrentPass = !showCurrentPass)}
	/>
</div>

<div class="flex flex-col gap-1.5">
	<label class="text-xs font-semibold uppercase tracking-wider text-text-muted"
		>{tx('settings.password.newLabel')}</label
	>
	<PasswordInput
		bind:value={newPassword}
		placeholder="••••••••••••"
		visible={showNewPass}
		onToggle={() => (showNewPass = !showNewPass)}
	/>
	<PasswordStrengthMeter score={strengthScore} />
</div>

<div class="flex flex-col gap-1.5">
	<label class="text-xs font-semibold uppercase tracking-wider text-text-muted"
		>{tx('settings.password.confirmLabel')}</label
	>
	<PasswordInput
		bind:value={confirmPassword}
		placeholder="••••••••••••"
		visible={showConfirmPass}
		onToggle={() => (showConfirmPass = !showConfirmPass)}
	/>
</div>

<button
	type="button"
	onclick={onSave}
	class="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-3 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-400 active:scale-95 lg:py-2.5"
>
	<i class="fa-solid fa-check"></i>
	{tx('settings.password.saveButton')}
</button>
