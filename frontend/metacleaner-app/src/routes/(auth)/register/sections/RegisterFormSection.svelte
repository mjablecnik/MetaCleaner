<script lang="ts">
	import { browser } from '$app/environment';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import { tx } from '$lib/shared/utils/i18n';
	import { authStore } from '$lib/auth/auth.svelte.js';
	import { buildApiUrl } from '$lib/clients/metaCleanerApi.js';
	import AuthTextInput from '$lib/shared/elements/AuthTextInput.svelte';
	import PasswordInput from '../../components/PasswordInput.svelte';
	import PasswordStrengthMeter from '../../components/PasswordStrengthMeter.svelte';
	import SocialLoginButtons from '../../components/SocialLoginButtons.svelte';

	interface Props {
		onSuccess?: (email: string) => void;
	}

	let { onSuccess }: Props = $props();

	let firstName = $state('');
	let lastName = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let passwordVisible = $state(false);
	let oauthLoading = $state(false);

	let firstNameError = $state('');
	let lastNameError = $state('');
	let emailError = $state('');
	let passwordError = $state('');
	let confirmError = $state('');
	let apiError = $state('');
	let submitState = $state<'idle' | 'loading' | 'success'>('idle');

	function getStrengthScore(val: string) {
		let score = 0;
		if (val.length >= 8) score++;
		if (/[A-Z]/.test(val)) score++;
		if (/[0-9]/.test(val)) score++;
		if (/[^A-Za-z0-9]/.test(val)) score++;
		return score;
	}

	const strengthScore = $derived(password.length > 0 ? getStrengthScore(password) : 0);

	function validateEmail(v: string) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
	}

	function handleGoogle() {
		oauthLoading = true;
		if (browser) window.location.href = buildApiUrl('/api/auth/oauth/google');
	}

	function handleApple() {
		oauthLoading = true;
		if (browser) window.location.href = buildApiUrl('/api/auth/oauth/apple');
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		firstNameError = '';
		lastNameError = '';
		emailError = '';
		passwordError = '';
		confirmError = '';
		apiError = '';

		let valid = true;
		if (!firstName.trim()) {
			firstNameError = tx('auth.register.validation.firstNameRequired');
			valid = false;
		}
		if (!lastName.trim()) {
			lastNameError = tx('auth.register.validation.lastNameRequired');
			valid = false;
		}
		if (!validateEmail(email)) {
			emailError = tx('auth.common.validation.emailInvalid');
			valid = false;
		}
		if (password.length < 8) {
			passwordError = tx('auth.common.validation.passwordMin8');
			valid = false;
		}
		if (password.length > 72) {
			passwordError = tx('auth.common.validation.passwordMax72');
			valid = false;
		}
		if (password !== confirmPassword) {
			confirmError = tx('auth.common.validation.passwordsMismatch');
			valid = false;
		}
		if (!valid) return;

		submitState = 'loading';
		try {
			await authStore.register(email, password, firstName, lastName);
			submitState = 'success';
			onSuccess?.(email);
		} catch (err: unknown) {
			submitState = 'idle';
			apiError = err instanceof Error ? err.message : tx('auth.common.error.unknown');
		}
	}
</script>

<SocialLoginButtons
	googleLabel={tx('auth.register.social.google')}
	appleLabel={tx('auth.register.social.apple')}
	disabled={oauthLoading || submitState === 'loading'}
	onGoogle={handleGoogle}
	onApple={handleApple}
/>

<div class="flex items-center gap-3">
	<div class="h-px flex-1 bg-navy-lighter"></div>
	<span class="text-xs font-medium whitespace-nowrap text-text-muted"
		>{tx('auth.common.divider.orEmail')}</span
	>
	<div class="h-px flex-1 bg-navy-lighter"></div>
</div>

<form onsubmit={handleSubmit} class="flex flex-col gap-3.5 lg:gap-4">
	<div class="grid grid-cols-2 gap-2.5 lg:gap-3">
		<div class="flex flex-col gap-1 lg:gap-1.5">
			<label for="fname-input" class="text-xs font-medium text-white lg:text-sm"
				>{tx('auth.register.field.firstName')}</label
			>
			<AuthTextInput
				id="fname-input"
				type="text"
				bind:value={firstName}
				placeholder={tx('auth.register.field.firstNamePlaceholder')}
				icon="fa-regular fa-user"
				error={firstNameError}
			/>
		</div>
		<div class="flex flex-col gap-1 lg:gap-1.5">
			<label for="lname-input" class="text-xs font-medium text-white lg:text-sm"
				>{tx('auth.register.field.lastName')}</label
			>
			<AuthTextInput
				id="lname-input"
				type="text"
				bind:value={lastName}
				placeholder={tx('auth.register.field.lastNamePlaceholder')}
				error={lastNameError}
			/>
		</div>
	</div>

	<div class="flex flex-col gap-1 lg:gap-1.5">
		<label for="email-input" class="text-xs font-medium text-white lg:text-sm"
			>{tx('auth.common.field.emailLabel')}</label
		>
		<AuthTextInput
			id="email-input"
			type="email"
			bind:value={email}
			placeholder={tx('auth.common.field.emailPlaceholder')}
			icon="fa-regular fa-envelope"
			error={emailError}
		/>
	</div>

	<div class="flex flex-col gap-1 lg:gap-1.5">
		<label for="password-input" class="text-xs font-medium text-white lg:text-sm"
			>{tx('auth.common.field.passwordLabel')}</label
		>
		<PasswordInput
			id="password-input"
			bind:value={password}
			placeholder={tx('auth.register.field.passwordPlaceholder')}
			error={passwordError}
			visible={passwordVisible}
			onToggle={() => (passwordVisible = !passwordVisible)}
			ariaShowLabel={tx('auth.common.a11y.showPassword')}
			ariaHideLabel={tx('auth.common.a11y.hidePassword')}
		/>
		<PasswordStrengthMeter score={strengthScore} />
	</div>

	<div class="flex flex-col gap-1 lg:gap-1.5">
		<label for="confirm-input" class="text-xs font-medium text-white lg:text-sm"
			>{tx('auth.common.field.confirmPasswordLabel')}</label
		>
		<AuthTextInput
			id="confirm-input"
			type="password"
			bind:value={confirmPassword}
			placeholder={tx('auth.register.field.confirmPlaceholder')}
			icon="fa-solid fa-lock"
			error={confirmError}
		/>
	</div>

	{#if apiError}
		<div
			class="rounded-lg border border-brand-red/30 bg-brand-red/10 px-3 py-2.5 text-sm text-brand-red"
		>
			<i class="fa-solid fa-circle-exclamation mr-2"></i>{apiError}
		</div>
	{/if}

	<button
		type="submit"
		disabled={submitState === 'loading' || submitState === 'success'}
		class="mt-1 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold text-white shadow-glow-green transition-all lg:min-h-0 lg:py-3.5 {submitState ===
		'success'
			? 'bg-brand-green-dark'
			: 'bg-brand-green'}"
	>
		{#if submitState === 'loading'}
			<i class="fa-solid fa-spinner fa-spin"></i> {tx('auth.register.submit.loading')}
		{:else if submitState === 'success'}
			<i class="fa-solid fa-circle-check"></i> {tx('auth.register.submit.success')}
		{:else}
			<i class="fa-solid fa-user-plus"></i> {tx('auth.register.submit.idle')}
		{/if}
	</button>
</form>

<div class="border-t border-gray-800 pt-1 text-center">
	<p class="text-xs text-text-muted lg:text-sm">
		{tx('auth.register.footer.hasAccount')}
		<a
			href={resolve('/login' as Pathname)}
			class="font-semibold text-brand-blue transition-colors hover:text-blue-400"
			>{tx('auth.register.footer.login')}</a
		>
	</p>
</div>
