<script lang="ts">
	import { page } from '$app/state';
	import { tx } from '$lib/shared/utils/i18n';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authStore } from '$lib/auth/auth.svelte.js';

	const error = $derived(page.url.searchParams.get('error'));
	const isSuccess = $derived(!error);
	const isLoggedIn = $derived(authStore.isAuthenticated);

	function goHome() {
		goto(resolve('/' as import('$app/types').Pathname));
	}
</script>

<svelte:head>
	<title>{tx('emailChanged.meta.title')}</title>
</svelte:head>

<div
	class="flex min-h-screen flex-col"
	style="background-image: radial-gradient(ellipse at 20% 50%, var(--color-page-gradient-blue) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, var(--color-page-gradient-green) 0%, transparent 50%);"
>
	<!-- Minimal header -->
	<nav
		class="flex w-full items-center justify-between px-5 py-4 lg:mx-auto lg:max-w-[1100px] lg:px-6 lg:py-5"
	>
		<div class="flex items-center gap-2.5 lg:gap-3">
			<div
				class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-blue text-white shadow-glow-blue lg:h-10 lg:w-10"
			>
				<i class="fa-solid fa-shield-halved text-base lg:text-xl"></i>
			</div>
			<span class="text-base font-bold tracking-tight lg:text-lg">{tx('common.brandName')}</span>
		</div>
		{#if !isLoggedIn}
			<a
				href={resolve('/login' as import('$app/types').Pathname)}
				class="flex items-center gap-2 rounded-lg border border-gray-700 bg-navy-lighter px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
			>
				<i class="fa-solid fa-right-to-bracket text-xs text-brand-green"></i>
				{tx('emailChanged.success.goToLogin')}
			</a>
		{/if}
	</nav>

	<!-- Main content -->
	<main
		class="mx-auto flex w-full max-w-[1100px] flex-1 items-center justify-center px-6 py-4 lg:py-8"
	>
		<!-- Mobile layout -->
		<div class="flex w-full flex-col items-center lg:hidden">
			{#if isSuccess}
				<!-- Success icon -->
				<div class="success-ring relative">
					<div class="pulse-glow absolute inset-0 rounded-full"></div>
					<div
						class="success-circle relative z-10 flex h-20 w-20 items-center justify-center rounded-full"
					>
						<i class="fa-solid fa-circle-check text-[2.5rem] text-brand-green"></i>
					</div>
				</div>
				<h1 class="mt-4 text-center text-2xl font-black text-white">
					{tx('emailChanged.success.title')}
				</h1>
				<p class="mt-2 max-w-xs text-center text-sm leading-relaxed text-text-muted">
					{tx('emailChanged.success.description')}
				</p>
			{:else}
				<!-- Error icon -->
				<div class="error-ring relative">
					<div
						class="error-circle relative z-10 flex h-20 w-20 items-center justify-center rounded-full"
					>
						<i class="fa-solid fa-circle-xmark text-[2.5rem] text-brand-red"></i>
					</div>
				</div>
				<h1 class="mt-4 text-center text-2xl font-black text-white">
					{tx('emailChanged.error.title')}
				</h1>
				<p class="mt-2 max-w-xs text-center text-sm leading-relaxed text-text-muted">
					{#if error === 'invalid_or_expired_token' || error === 'missing_token'}
						{tx('emailChanged.error.expired')}
					{:else}
						{tx('emailChanged.error.generic')}
					{/if}
				</p>
			{/if}

			<!-- Mobile CTA -->
			<div class="mt-8 flex w-full flex-col gap-3">
				{#if isLoggedIn}
					<a
						href={resolve('/settings' as import('$app/types').Pathname)}
						class="cta-btn flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-xl py-4 text-base font-bold text-white shadow-glow-green"
					>
						<i class="fa-solid fa-gear"></i>
						{tx('emailChanged.success.goToSettings')}
					</a>
					<button
						onclick={goHome}
						class="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-gray-700 bg-navy-lighter py-3.5 text-sm font-semibold text-white transition-colors active:bg-gray-800"
					>
						<i class="fa-solid fa-home text-text-muted"></i>
						{tx('emailChanged.success.goHome')}
					</button>
				{:else}
					<a
						href={resolve('/login' as import('$app/types').Pathname)}
						class="cta-btn flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-xl py-4 text-base font-bold text-white shadow-glow-green"
					>
						<i class="fa-solid fa-right-to-bracket"></i>
						{tx('emailChanged.success.goToLogin')}
					</a>
				{/if}
			</div>

			<!-- Trust badges -->
			<div class="mt-6 flex items-center justify-center gap-4 text-xs text-text-muted">
				<span class="flex items-center gap-1.5">
					<i class="fa-solid fa-lock text-brand-green"></i>
					{tx('auth.common.trust.ssl')}
				</span>
				<span class="flex items-center gap-1.5">
					<i class="fa-solid fa-shield-halved text-brand-blue"></i>
					{tx('auth.common.trust.gdpr')}
				</span>
			</div>
		</div>

		<!-- Desktop layout (two columns) -->
		<div class="hidden w-full items-center gap-8 lg:grid lg:grid-cols-2">
			<!-- Left column: headline + description -->
			<div class="fade-in flex flex-col gap-6">
				<div class="flex flex-col gap-3">
					{#if isSuccess}
						<h1 class="text-4xl leading-tight font-black text-white">
							{tx('emailChanged.desktop.headline')}<br />
							<span class="text-brand-green">{tx('emailChanged.desktop.headlineHighlight')}</span>
						</h1>
						<p class="max-w-sm text-base leading-relaxed text-text-muted">
							{tx('emailChanged.desktop.description')}
						</p>
					{:else}
						<h1 class="text-4xl leading-tight font-black text-white">
							{tx('emailChanged.desktop.errorHeadline')}<br />
							<span class="text-brand-red">{tx('emailChanged.desktop.errorHighlight')}</span>
						</h1>
						<p class="max-w-sm text-base leading-relaxed text-text-muted">
							{#if error === 'invalid_or_expired_token' || error === 'missing_token'}
								{tx('emailChanged.error.expired')}
							{:else}
								{tx('emailChanged.error.generic')}
							{/if}
						</p>
					{/if}
				</div>

				<!-- Info cards -->
				{#if isSuccess}
					<div class="flex flex-col gap-3">
						<div
							class="flex items-center gap-3 rounded-xl border border-gray-800 bg-navy-card px-4 py-3"
						>
							<div
								class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-green/10"
							>
								<i class="fa-solid fa-envelope-circle-check text-brand-green"></i>
							</div>
							<div>
								<p class="text-sm font-semibold text-white">{tx('emailChanged.info.loginTitle')}</p>
								<p class="text-xs text-text-muted">{tx('emailChanged.info.loginDesc')}</p>
							</div>
						</div>
						<div
							class="flex items-center gap-3 rounded-xl border border-gray-800 bg-navy-card px-4 py-3"
						>
							<div
								class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10"
							>
								<i class="fa-solid fa-shield-halved text-brand-blue"></i>
							</div>
							<div>
								<p class="text-sm font-semibold text-white">
									{tx('emailChanged.info.securityTitle')}
								</p>
								<p class="text-xs text-text-muted">{tx('emailChanged.info.securityDesc')}</p>
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Right column: card -->
			<div class="ml-auto w-full max-w-[460px]">
				<div
					class="flex flex-col items-center gap-7 rounded-2xl border border-gray-800 bg-navy-card p-8 shadow-card"
				>
					{#if isSuccess}
						<div class="success-ring relative">
							<div class="pulse-glow absolute inset-0 rounded-full"></div>
							<div
								class="success-circle relative z-10 flex h-24 w-24 items-center justify-center rounded-full"
							>
								<i class="fa-solid fa-circle-check text-5xl text-brand-green"></i>
							</div>
						</div>
						<div class="text-center">
							<h2 class="text-2xl font-bold text-white">
								{tx('emailChanged.success.title')}
							</h2>
							<p class="mt-1.5 text-sm leading-relaxed text-text-muted">
								{tx('emailChanged.success.description')}
							</p>
						</div>
					{:else}
						<div class="error-ring relative">
							<div
								class="error-circle relative z-10 flex h-24 w-24 items-center justify-center rounded-full"
							>
								<i class="fa-solid fa-circle-xmark text-5xl text-brand-red"></i>
							</div>
						</div>
						<div class="text-center">
							<h2 class="text-2xl font-bold text-white">
								{tx('emailChanged.error.title')}
							</h2>
							<p class="mt-1.5 text-sm leading-relaxed text-text-muted">
								{#if error === 'invalid_or_expired_token' || error === 'missing_token'}
									{tx('emailChanged.error.expired')}
								{:else}
									{tx('emailChanged.error.generic')}
								{/if}
							</p>
						</div>
					{/if}

					<!-- Divider -->
					<div class="flex w-full items-center gap-3">
						<div class="h-px flex-1 bg-gray-800"></div>
						<span class="text-xs font-medium text-text-muted">
							{#if isSuccess}
								{tx('emailChanged.divider.nextSteps')}
							{:else}
								{tx('emailChanged.divider.whatNow')}
							{/if}
						</span>
						<div class="h-px flex-1 bg-gray-800"></div>
					</div>

					<!-- CTA buttons -->
					<div class="flex w-full flex-col gap-3">
						{#if isLoggedIn}
							<a
								href={resolve('/settings' as import('$app/types').Pathname)}
								class="cta-btn flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-sm font-bold text-white shadow-glow-green"
							>
								<i class="fa-solid fa-gear"></i>
								{tx('emailChanged.success.goToSettings')}
							</a>
							<button
								onclick={goHome}
								class="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-700 bg-navy-lighter py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
							>
								<i class="fa-solid fa-home text-text-muted"></i>
								{tx('emailChanged.success.goHome')}
							</button>
						{:else}
							<a
								href={resolve('/login' as import('$app/types').Pathname)}
								class="cta-btn flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-sm font-bold text-white shadow-glow-green"
							>
								<i class="fa-solid fa-right-to-bracket"></i>
								{tx('emailChanged.success.goToLogin')}
							</a>
						{/if}
					</div>
				</div>

				<!-- Trust badges -->
				<div class="mt-5 flex items-center justify-center gap-5 text-xs text-text-muted">
					<span class="flex items-center gap-1.5">
						<i class="fa-solid fa-lock text-brand-green"></i>
						{tx('auth.common.trust.ssl')}
					</span>
					<span class="flex items-center gap-1.5">
						<i class="fa-solid fa-shield-halved text-brand-blue"></i>
						{tx('auth.common.trust.gdpr')}
					</span>
					<span class="flex items-center gap-1.5">
						<i class="fa-solid fa-eye-slash text-text-muted"></i>
						{tx('auth.common.trust.noTracking')}
					</span>
				</div>
			</div>
		</div>
	</main>
</div>

<style>
	.fade-in {
		animation: fadeIn 0.6s ease-out forwards;
	}
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(14px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.success-circle {
		background: linear-gradient(135deg, var(--color-brand-green-15), var(--color-brand-green-4));
		border: 2px solid var(--color-brand-green-35);
	}

	.success-ring {
		animation: successRing 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both;
	}
	@keyframes successRing {
		from {
			transform: scale(0.5);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}

	.pulse-glow {
		animation: pulseGlow 2.5s ease-in-out infinite;
	}
	@keyframes pulseGlow {
		0%,
		100% {
			box-shadow:
				0 0 0 0 var(--color-brand-green-30),
				0 0 24px var(--color-brand-green-15);
		}
		50% {
			box-shadow:
				0 0 0 16px transparent,
				0 0 40px var(--color-brand-green-30);
		}
	}

	.error-circle {
		background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.04));
		border: 2px solid rgba(239, 68, 68, 0.35);
	}

	.error-ring {
		animation: successRing 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both;
	}

	.cta-btn {
		background: linear-gradient(
			135deg,
			var(--color-brand-green) 0%,
			var(--color-brand-green-dark) 100%
		);
		transition: all 0.2s ease;
	}
	.cta-btn:hover {
		background: linear-gradient(
			135deg,
			var(--color-brand-green-dark) 0%,
			var(--color-brand-green-darker) 100%
		);
		transform: translateY(-1px);
		box-shadow: 0 8px 24px var(--color-brand-green-40);
	}
	.cta-btn:active {
		transform: scale(0.98);
	}
</style>
