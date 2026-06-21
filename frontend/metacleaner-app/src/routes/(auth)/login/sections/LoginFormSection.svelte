<script lang="ts">
	import { browser } from '$app/environment';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import { onMount } from 'svelte';
	import { tx } from '$lib/shared/utils/i18n';
	import { authStore } from '$lib/auth/auth.svelte.js';
	import { buildApiUrl } from '$lib/clients/api-config.js';
	import { handleAuthCallback } from '$lib/auth/token-utils.js';
	import AuthTextInput from '$lib/shared/elements/AuthTextInput.svelte';
	import PasswordInput from '../../components/PasswordInput.svelte';
	import SocialLoginButtons from '../../components/SocialLoginButtons.svelte';

	let email = $state('');
	let password = $state('');
	let rememberMe = $state(false);
	let passwordVisible = $state(false);
	let emailError = $state('');
	let passwordError = $state('');
	let apiError = $state('');

	let magicEmail = $state('');
	let magicEmailError = $state('');
	let magicError = $state('');
	let magicState = $state<'idle' | 'loading' | 'sent'>('idle');

	let isSubmitting = $state(false);
	let oauthLoading = $state(false);

	function validateEmail(v: string) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		apiError = '';
		emailError = '';
		passwordError = '';
		let valid = true;
		if (!validateEmail(email)) {
			emailError = tx('auth.common.validation.emailInvalid');
			valid = false;
		}
		if (!password.trim()) {
			passwordError = tx('auth.login.validation.passwordEmpty');
			valid = false;
		}
		if (!valid) return;
		isSubmitting = true;
		try {
			await authStore.login(email, password);
		} catch (err: unknown) {
			apiError = (err as Error).message ?? '';
		} finally {
			isSubmitting = false;
		}
	}

	function handleGoogle() {
		oauthLoading = true;
		if (browser) window.location.href = buildApiUrl('/api/auth/oauth/google');
	}

	function handleApple() {
		oauthLoading = true;
		if (browser) window.location.href = buildApiUrl('/api/auth/oauth/apple');
	}

	async function handleMagicLink() {
		magicEmailError = '';
		magicError = '';
		if (!validateEmail(magicEmail)) {
			magicEmailError = tx('auth.common.validation.emailInvalid');
			return;
		}
		magicState = 'loading';
		try {
			const res = await fetch(buildApiUrl('/api/auth/magic-link'), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: magicEmail })
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({ message: res.statusText }));
				throw new Error((data as { message?: string }).message || res.statusText);
			}
			magicState = 'sent';
		} catch (err: unknown) {
			magicState = 'idle';
			magicError = (err as Error).message ?? '';
		}
	}

	function resetMagicLink() {
		magicState = 'idle';
		magicEmail = '';
		magicError = '';
		magicEmailError = '';
	}

	onMount(() => {
		handleAuthCallback(window.location.href, true).then((urlError) => {
			const deepLinkError = sessionStorage.getItem('mc_deep_link_error');
			if (deepLinkError) sessionStorage.removeItem('mc_deep_link_error');
			if (urlError || deepLinkError) apiError = urlError ?? deepLinkError ?? '';
		});

		function handleVisibilityChange() {
			if (document.visibilityState === 'visible') oauthLoading = false;
		}
		document.addEventListener('visibilitychange', handleVisibilityChange);
		return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
	});
</script>

<SocialLoginButtons
	googleLabel={tx('auth.login.social.google')}
	appleLabel={tx('auth.login.social.apple')}
	disabled={oauthLoading || isSubmitting || magicState === 'loading'}
	onGoogle={handleGoogle}
	onApple={handleApple}
/>

<div class="flex items-center gap-3">
	<div class="h-px flex-1 bg-navy-lighter"></div>
	<span class="text-xs font-medium whitespace-nowrap text-text-muted"
		>{tx('auth.login.divider.orEmail')}</span
	>
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
			<label for="password-input" class="text-sm font-medium text-white"
				>{tx('auth.login.field.passwordLabel')}</label
			>
			<a
				href={resolve('/forgot-password' as Pathname)}
				class="text-xs font-medium text-brand-blue transition-colors hover:text-blue-400"
			>
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
			class="flex h-6 w-6 min-w-6 min-h-6 shrink-0 items-center justify-center rounded border transition-all lg:h-5 lg:w-5 lg:min-w-5 lg:min-h-5 {rememberMe
				? 'border-brand-blue bg-brand-blue'
				: 'border-gray-600 bg-navy-main'}"
		>
			{#if rememberMe}<i class="fa-solid fa-check text-[10px] text-white"></i>{/if}
		</button>
		<span class="text-sm text-text-muted">{tx('auth.login.field.remember')}</span>
	</div>

	{#if apiError}
		<p class="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
			<i class="fa-solid fa-circle-exclamation mr-1.5"></i>{apiError}
		</p>
	{/if}

	<button
		type="submit"
		disabled={isSubmitting}
		class="mt-1 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-3.5 text-sm font-bold text-white shadow-glow-green transition-all lg:min-h-0"
	>
		{#if isSubmitting}
			<i class="fa-solid fa-spinner fa-spin"></i> {tx('auth.login.submit.loading')}
		{:else}
			<i class="fa-solid fa-arrow-right-to-bracket"></i> {tx('auth.login.submit.idle')}
		{/if}
	</button>
</form>

<div class="flex items-center gap-3">
	<div class="h-px flex-1 bg-navy-lighter"></div>
	<span class="text-xs font-medium whitespace-nowrap text-text-muted"
		>{tx('auth.login.magic.divider')}</span
	>
	<div class="h-px flex-1 bg-navy-lighter"></div>
</div>

{#if magicState === 'sent'}
	<div class="flex flex-col items-center gap-3 rounded-xl bg-navy-lighter px-4 py-5 text-center">
		<div class="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue/15">
			<i class="fa-solid fa-envelope-circle-check text-lg text-brand-blue"></i>
		</div>
		<div class="flex flex-col gap-1">
			<p class="text-sm font-semibold text-white">{tx('auth.login.magic.successTitle')}</p>
			<p class="text-xs text-text-muted">
				{tx('auth.login.magic.successDesc')}
				<span class="font-medium text-white">{magicEmail}</span>
			</p>
		</div>
		<button
			type="button"
			onclick={resetMagicLink}
			class="text-xs font-medium text-brand-blue transition-colors hover:text-blue-400"
		>
			{tx('auth.login.magic.backToLogin')}
		</button>
	</div>
{:else}
	<div class="flex flex-col gap-2">
		<AuthTextInput
			id="magic-email-input"
			type="email"
			label=""
			bind:value={magicEmail}
			placeholder={tx('auth.login.field.emailPlaceholder')}
			icon="fa-regular fa-envelope"
			error={magicEmailError}
		/>
		{#if magicError}
			<p class="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
				<i class="fa-solid fa-circle-exclamation mr-1.5"></i>{magicError}
			</p>
		{/if}
		<button
			type="button"
			onclick={handleMagicLink}
			disabled={magicState === 'loading'}
			class="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-gray-700 bg-navy-lighter py-3.5 text-sm font-semibold text-white transition-all hover:border-gray-600 hover:bg-navy-hover disabled:opacity-60 lg:min-h-0 lg:py-3"
		>
			{#if magicState === 'loading'}
				<i class="fa-solid fa-spinner fa-spin"></i> {tx('auth.login.magic.sending')}
			{:else}
				<i class="fa-solid fa-wand-magic-sparkles"></i> {tx('auth.login.magic.send')}
			{/if}
		</button>
	</div>
{/if}

<div class="border-t border-gray-800 pt-1 text-center">
	<p class="text-sm text-text-muted">
		{tx('auth.login.footer.noAccount')}
		<a
			href={resolve('/register' as Pathname)}
			class="font-semibold text-brand-blue transition-colors hover:text-blue-400"
		>
			{tx('auth.login.footer.registerFree')}
		</a>
	</p>
</div>
