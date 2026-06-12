<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import AuthTextInput from '$lib/shared/elements/AuthTextInput.svelte';
	import PasswordInput from '../../components/PasswordInput.svelte';
	import SocialLoginButtons from '../../components/SocialLoginButtons.svelte';

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}

	let email = $state('');
	let password = $state('');
	let rememberMe = $state(false);
	let passwordVisible = $state(false);
	let emailError = $state('');
	let passwordError = $state('');
	let submitState = $state<'idle' | 'loading' | 'success'>('idle');

	function validateEmail(v: string) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
	}

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		emailError = '';
		passwordError = '';
		let valid = true;
		if (!validateEmail(email)) {
			emailError = tx('auth.common.validation.emailInvalid');
			valid = false;
		}
		if (password.length < 6) {
			passwordError = tx('auth.login.validation.passwordShort');
			valid = false;
		}
		if (!valid) return;
		submitState = 'loading';
		setTimeout(() => {
			submitState = 'success';
		}, 1500);
	}
</script>

<SocialLoginButtons
	googleLabel={tx('auth.login.social.google')}
	appleLabel={tx('auth.login.social.apple')}
/>

<div class="flex items-center gap-3">
	<div class="h-px flex-1 bg-navy-lighter"></div>
	<span class="whitespace-nowrap text-xs font-medium text-text-muted">{tx('auth.login.divider.orEmail')}</span>
	<div class="h-px flex-1 bg-navy-lighter"></div>
</div>

<form onsubmit={handleSubmit} class="flex flex-col gap-4">
	<AuthTextInput
		id="email-input"
		type="email"
		label={tx('auth.login.field.emailLabel')}
		bind:value={email}
		placeholder={tx('auth.login.field.emailPlaceholder')}
		icon="fa-regular fa-envelope"
		error={emailError}
	/>

	<div class="flex flex-col gap-1.5">
		<div class="flex items-center justify-between">
			<label for="password-input" class="text-sm font-medium text-white">{tx('auth.login.field.passwordLabel')}</label>
			<a href="/forgot-password" class="text-xs font-medium text-brand-blue transition-colors hover:text-blue-400">
				{tx('auth.login.field.forgotPassword')}
			</a>
		</div>
		<PasswordInput
			id="password-input"
			bind:value={password}
			error={passwordError}
			visible={passwordVisible}
			onToggle={() => (passwordVisible = !passwordVisible)}
			ariaShowLabel={tx('auth.common.a11y.showPassword')}
			ariaHideLabel={tx('auth.common.a11y.hidePassword')}
		/>
	</div>

	<div class="flex items-center gap-2.5">
		<button
			type="button"
			onclick={() => (rememberMe = !rememberMe)}
			class="flex h-6 w-6 min-w-[24px] flex-shrink-0 items-center justify-center rounded border transition-all lg:h-5 lg:w-5 {rememberMe
				? 'bg-brand-blue border-brand-blue'
				: 'bg-navy-main border-gray-600'}"
		>
			{#if rememberMe}<i class="fa-solid fa-check text-[10px] text-white"></i>{/if}
		</button>
		<span class="text-sm text-text-muted">{tx('auth.login.field.remember')}</span>
	</div>

	<button
		type="submit"
		disabled={submitState === 'loading' || submitState === 'success'}
		class="mt-1 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-glow-green transition-all lg:min-h-0 {submitState === 'success'
			? 'bg-brand-green-dark'
			: 'bg-brand-green'}"
	>
		{#if submitState === 'loading'}
			<i class="fa-solid fa-spinner fa-spin"></i> {tx('auth.login.submit.loading')}
		{:else if submitState === 'success'}
			<i class="fa-solid fa-circle-check"></i> {tx('auth.login.submit.success')}
		{:else}
			<i class="fa-solid fa-arrow-right-to-bracket"></i> {tx('auth.login.submit.idle')}
		{/if}
	</button>
</form>

<div class="border-t border-gray-800 pt-1 text-center">
	<p class="text-sm text-text-muted">
		{tx('auth.login.footer.noAccount')}
		<a href="/register" class="font-semibold text-brand-blue transition-colors hover:text-blue-400">
			{tx('auth.login.footer.registerFree')}
		</a>
	</p>
</div>
