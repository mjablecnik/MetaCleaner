<script lang="ts">
	import { page } from '$app/state';
	import { tx } from '$lib/shared/utils/i18n';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authStore } from '$lib/auth/auth.svelte.js';
	import Button from '$lib/shared/elements/Button.svelte';

	const error = $derived(page.url.searchParams.get('error'));
	const isSuccess = $derived(!error);
	const isLoggedIn = $derived(authStore.isAuthenticated);

	function goToSettings() {
		goto(resolve('/settings' as import('$app/types').Pathname));
	}

	function goHome() {
		goto(resolve('/' as import('$app/types').Pathname));
	}

	function goToLogin() {
		goto(resolve('/login' as import('$app/types').Pathname));
	}
</script>

<svelte:head>
	<title>{tx('emailChanged.meta.title')}</title>
</svelte:head>

<main
	class="flex min-h-screen items-center justify-center bg-navy-main px-6 py-12"
>
	<div
		class="w-full max-w-md rounded-2xl border border-gray-800 bg-navy-card p-8 shadow-card text-center"
	>
		{#if isSuccess}
			<!-- Success state -->
			<div
				class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-green/10"
			>
				<i class="fa-solid fa-circle-check text-3xl text-brand-green"></i>
			</div>
			<h1 class="mb-2 text-2xl font-bold text-white">
				{tx('emailChanged.success.title')}
			</h1>
			<p class="mb-6 text-sm leading-relaxed text-text-muted">
				{tx('emailChanged.success.description')}
			</p>
			<div class="flex flex-col gap-3">
				{#if isLoggedIn}
					<Button variant="primary" fullWidth onclick={goToSettings}>
						<i class="fa-solid fa-gear"></i>
						{tx('emailChanged.success.goToSettings')}
					</Button>
					<Button variant="secondary" fullWidth onclick={goHome}>
						<i class="fa-solid fa-home"></i>
						{tx('emailChanged.success.goHome')}
					</Button>
				{:else}
					<Button variant="primary" fullWidth onclick={goToLogin}>
						<i class="fa-solid fa-right-to-bracket"></i>
						{tx('emailChanged.success.goToLogin')}
					</Button>
				{/if}
			</div>
		{:else}
			<!-- Error state -->
			<div
				class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-red/10"
			>
				<i class="fa-solid fa-circle-xmark text-3xl text-brand-red"></i>
			</div>
			<h1 class="mb-2 text-2xl font-bold text-white">
				{tx('emailChanged.error.title')}
			</h1>
			<p class="mb-6 text-sm leading-relaxed text-text-muted">
				{#if error === 'invalid_or_expired_token' || error === 'missing_token'}
					{tx('emailChanged.error.expired')}
				{:else}
					{tx('emailChanged.error.generic')}
				{/if}
			</p>
			<div class="flex flex-col gap-3">
				{#if isLoggedIn}
					<Button variant="primary" fullWidth onclick={goToSettings}>
						<i class="fa-solid fa-rotate-right"></i>
						{tx('emailChanged.error.tryAgain')}
					</Button>
				{:else}
					<Button variant="primary" fullWidth onclick={goToLogin}>
						<i class="fa-solid fa-right-to-bracket"></i>
						{tx('emailChanged.success.goToLogin')}
					</Button>
				{/if}
			</div>
		{/if}
	</div>
</main>
