<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { tx } from '$lib/shared/utils/i18n';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { handleAuthCallback } from '$lib/auth/token-utils.js';
	import AuthLayout from '../components/AuthLayout.svelte';
	import TrustBadges from '../components/TrustBadges.svelte';
	import { getAuthStats } from '$lib/repositories/authRepository';
	import { getCurrentUser } from '$lib/repositories/userRepository';

	const stats = getAuthStats();
	let userEmail = $state('');

	onMount(async () => {
		if (!browser) return;
		// Process tokens from the email confirmation callback URL and persist them.
		// On error, redirect to login so the user can try again.
		handleAuthCallback(window.location.href, true).then((urlError) => {
			if (urlError) goto(resolve('/login' as import('$app/types').Pathname));
		});
		const user = await getCurrentUser();
		userEmail = user.email;
	});
</script>

<svelte:head>
	<title>{tx('auth.emailVerified.meta.title')}</title>
</svelte:head>

<AuthLayout>
	<!-- Navbar -->
	<nav
		class="verified-nav sticky top-0 z-10 flex w-full items-center justify-between px-5 py-4 lg:static lg:mx-auto lg:max-w-[1100px] lg:px-6 lg:py-5"
	>
		<div class="flex items-center gap-2.5 lg:gap-3">
			<div
				class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-blue text-white shadow-glow-blue lg:h-10 lg:w-10"
			>
				<i class="fa-solid fa-shield-halved text-base lg:text-xl"></i>
			</div>
			<span class="text-base font-bold tracking-tight lg:text-lg">{tx('common.brandName')}</span>
		</div>
		<div
			class="flex items-center gap-1.5 rounded-full border border-brand-green/20 bg-brand-green/10 px-3 py-1.5"
		>
			<span class="inline-block h-2 w-2 rounded-full bg-brand-green"></span>
			<span class="text-xs font-semibold text-brand-green lg:hidden"
				>{tx('auth.emailVerified.nav.verified')}</span
			>
			<span class="hidden text-xs font-semibold text-brand-green lg:inline"
				>{tx('auth.emailVerified.nav.accountVerified')}</span
			>
		</div>
	</nav>

	<!-- Main -->
	<main
		class="mx-auto flex w-full max-w-[1100px] flex-1 items-center justify-center px-4 pb-10 pt-6 lg:px-6 lg:pb-16"
	>
		<div class="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-2">
			<!-- Left panel (desktop only) -->
			<div class="fade-in hidden flex-col gap-8 lg:flex">
				<div class="flex flex-col gap-3">
					<h1 class="text-4xl font-black leading-tight text-white">
						{tx('auth.emailVerified.left.headline')}<br
						/><span class="text-brand-green">{tx('auth.emailVerified.left.headlineHighlight')}</span>
					</h1>
					<p class="max-w-sm text-base leading-relaxed text-text-muted">
						{tx('auth.emailVerified.left.description')}
					</p>
				</div>

				<!-- Vertical steps -->
				<div class="flex flex-col gap-0">
					<!-- Step 1: Account created -->
					<div class="flex items-start gap-4">
						<div class="flex flex-col items-center">
							<div
								class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-brand-green bg-brand-green"
							>
								<i class="fa-solid fa-check text-xs text-white"></i>
							</div>
							<div class="mt-1 h-8 w-px bg-brand-green/25"></div>
						</div>
						<div class="pt-1">
							<p class="text-sm font-semibold text-white">
								{tx('auth.checkEmail.step.accountCreated')}
							</p>
							<p class="mt-0.5 text-xs text-text-muted">
								{tx('auth.checkEmail.step.accountCreatedDesc')}
							</p>
						</div>
					</div>

					<!-- Step 2: Email verified -->
					<div class="flex items-start gap-4">
						<div class="flex flex-col items-center">
							<div
								class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-brand-green bg-brand-green"
							>
								<i class="fa-solid fa-check text-xs text-white"></i>
							</div>
							<div class="mt-1 h-8 w-px bg-brand-green/25"></div>
						</div>
						<div class="flex items-center gap-2 pt-1">
							<p class="text-sm font-semibold text-white">
								{tx('auth.emailVerified.step.emailVerified')}
							</p>
							<span
								class="rounded bg-brand-green-15 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-green"
							>
								{tx('auth.emailVerified.step.doneBadge')}
							</span>
						</div>
					</div>

					<!-- Step 3: Start cleaning -->
					<div class="flex items-start gap-4">
						<div
							class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-brand-blue bg-brand-blue"
						>
							<i class="fa-solid fa-rocket text-xs text-white"></i>
						</div>
						<div class="flex items-center gap-2 pt-1">
							<p class="text-sm font-semibold text-white">
								{tx('auth.emailVerified.step.startCleaning')}
							</p>
							<span
								class="rounded bg-brand-blue-15 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-blue"
							>
								{tx('auth.emailVerified.step.currentBadge')}
							</span>
						</div>
					</div>
				</div>

				<!-- Stats row -->
				<div class="grid grid-cols-3 gap-4 border-t border-gray-800 pt-5">
					<div class="text-center">
						<p class="text-2xl font-black text-white">{stats[0].value}</p>
						<p class="mt-1 text-xs text-text-muted">{tx('auth.common.stats.usersLabel')}</p>
					</div>
					<div class="border-x border-gray-800 text-center">
						<p class="text-2xl font-black text-brand-green">{stats[1].value}</p>
						<p class="mt-1 text-xs text-text-muted">
							{tx('auth.common.stats.filesCleanedLabel')}
						</p>
					</div>
					<div class="text-center">
						<p class="text-2xl font-black text-brand-blue">{stats[2].value}</p>
						<p class="mt-1 text-xs text-text-muted">{tx('auth.common.stats.securityLabel')}</p>
					</div>
				</div>
			</div>

			<!-- Right: Success card -->
			<div class="mx-auto w-full max-w-[460px] lg:mx-0 lg:ml-auto">
				<!-- Mobile: Success hero (outside card) -->
				<div class="flex flex-col items-center gap-3 pb-2 pt-4 lg:hidden">
					<div class="success-ring relative">
						<div class="pulse-glow absolute inset-0 rounded-full"></div>
						<div
							class="success-circle relative z-10 flex h-20 w-20 items-center justify-center rounded-full"
						>
							<i class="fa-solid fa-circle-check text-brand-green" style="font-size: 2.5rem;"></i>
						</div>
					</div>
					<div class="flex flex-col items-center gap-1.5 text-center">
						<h1 class="text-2xl font-black leading-tight text-white">
							{tx('auth.emailVerified.hero.title')}
						</h1>
						<p class="max-w-xs text-sm leading-relaxed text-text-muted">
							{tx('auth.emailVerified.hero.subtitle')}
						</p>
						<div
							class="mt-1 inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-navy-lighter px-3 py-1.5"
						>
							<i class="fa-regular fa-envelope text-xs text-brand-green"></i>
							<span class="text-sm font-semibold text-white">{userEmail}</span>
							<i class="fa-solid fa-circle-check text-xs text-brand-green"></i>
						</div>
					</div>
				</div>

				<!-- Mobile: Progress steps (horizontal) -->
				<div
					class="flex items-center justify-between rounded-2xl border border-gray-800 bg-navy-card px-4 py-4 shadow-card lg:hidden"
				>
					<div class="flex flex-1 flex-col items-center gap-1">
						<div
							class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-green bg-brand-green"
						>
							<i class="fa-solid fa-check text-xs text-white"></i>
						</div>
						<span
							class="text-center text-[10px] font-semibold leading-tight text-brand-green"
							>{tx('auth.checkEmail.mobile.stepCreated')}</span
						>
					</div>
					<div class="mx-1 h-px flex-1 bg-brand-green/30"></div>
					<div class="flex flex-1 flex-col items-center gap-1">
						<div
							class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-green bg-brand-green"
						>
							<i class="fa-solid fa-check text-xs text-white"></i>
						</div>
						<div class="flex flex-col items-center gap-0.5">
							<span class="text-center text-[10px] font-semibold leading-tight text-brand-green"
								>{tx('auth.emailVerified.step.emailVerified')}</span
							>
							<span
								class="rounded bg-brand-green-15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-brand-green"
							>
								{tx('auth.emailVerified.step.doneBadge')}
							</span>
						</div>
					</div>
					<div class="mx-1 h-px flex-1 bg-brand-blue/30"></div>
					<div class="flex flex-1 flex-col items-center gap-1">
						<div
							class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-blue bg-brand-blue"
						>
							<i class="fa-solid fa-rocket text-xs text-white"></i>
						</div>
						<div class="flex flex-col items-center gap-0.5">
							<span class="text-center text-[10px] font-semibold leading-tight text-text-muted"
								>{tx('auth.emailVerified.step.startCleaning')}</span
							>
							<span
								class="rounded bg-brand-blue-15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-brand-blue"
							>
								{tx('auth.emailVerified.step.nextBadge')}
							</span>
						</div>
					</div>
				</div>

				<!-- Mobile: Stats cards -->
				<div class="mt-5 grid grid-cols-3 gap-3 lg:hidden">
					<div
						class="flex flex-col items-center gap-0.5 rounded-xl border border-gray-800 bg-navy-card py-3"
					>
						<p class="text-xl font-black text-white">{stats[0].value}</p>
						<p class="text-center text-[10px] leading-tight text-text-muted">
							{tx('auth.common.stats.usersLabel')}
						</p>
					</div>
					<div
						class="flex flex-col items-center gap-0.5 rounded-xl border border-gray-800 bg-navy-card py-3"
					>
						<p class="text-xl font-black text-brand-green">{stats[1].value}</p>
						<p class="text-center text-[10px] leading-tight text-text-muted">
							{tx('auth.common.stats.filesCleanedLabel')}
						</p>
					</div>
					<div
						class="flex flex-col items-center gap-0.5 rounded-xl border border-gray-800 bg-navy-card py-3"
					>
						<p class="text-xl font-black text-brand-blue">{stats[2].value}</p>
						<p class="text-center text-[10px] leading-tight text-text-muted">
							{tx('auth.common.stats.securityLabel')}
						</p>
					</div>
				</div>

				<!-- Desktop: Success card wrapper (hidden on mobile) -->
				<div class="hidden lg:block">
					<div
						class="flex flex-col gap-7 rounded-2xl border border-gray-800 bg-navy-card p-8 shadow-card"
					>
						<!-- Success icon + heading -->
						<div class="flex flex-col items-center gap-4 py-2">
							<div class="success-ring relative">
								<div class="pulse-glow absolute inset-0 rounded-full"></div>
								<div
									class="success-circle relative z-10 flex h-24 w-24 items-center justify-center rounded-full"
								>
									<i
										class="fa-solid fa-circle-check text-brand-green"
										style="font-size: 3rem;"
									></i>
								</div>
							</div>
							<div class="text-center">
								<h2 class="text-2xl font-bold text-white">
									{tx('auth.emailVerified.hero.title')}
								</h2>
								<p class="mt-1.5 text-sm leading-relaxed text-text-muted">
									{tx('auth.emailVerified.hero.subtitle')}
								</p>
								<div
									class="mt-3 inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-navy-lighter px-3 py-1.5"
								>
									<i class="fa-regular fa-envelope text-xs text-brand-green"></i>
									<span class="text-sm font-semibold text-white">{userEmail}</span>
									<i class="fa-solid fa-circle-check text-xs text-brand-green"></i>
								</div>
							</div>
						</div>

						<!-- Divider -->
						<div class="flex items-center gap-3">
							<div class="h-px flex-1 bg-gray-800"></div>
							<span class="text-xs font-medium text-text-muted"
								>{tx('auth.emailVerified.whatsNext.divider')}</span
							>
							<div class="h-px flex-1 bg-gray-800"></div>
						</div>

						<!-- Next steps -->
						<div class="flex flex-col gap-2.5">
							<a
								href={resolve('/' as import('$app/types').Pathname)}
								class="step-row flex cursor-pointer items-center gap-4 rounded-xl border border-brand-green/20 bg-navy-main p-4"
							>
								<div
									class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-green-10"
								>
									<i class="fa-solid fa-broom text-sm text-brand-green"></i>
								</div>
								<div class="flex-1">
									<p class="text-sm font-semibold text-white">
										{tx('auth.emailVerified.action.cleanTitle')}
									</p>
									<p class="mt-0.5 text-xs text-text-muted">
										{tx('auth.emailVerified.action.cleanDesc')}
									</p>
								</div>
								<i class="fa-solid fa-chevron-right text-xs text-text-muted"></i>
							</a>
							<button
								class="step-row flex cursor-pointer items-center gap-4 rounded-xl border border-gray-800 bg-navy-main p-4"
							>
								<div
									class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-orange-10"
								>
									<i class="fa-solid fa-crown text-sm text-brand-orange"></i>
								</div>
								<div class="flex-1 text-left">
									<p class="text-sm font-semibold text-white">
										{tx('auth.emailVerified.action.proTitle')}
									</p>
									<p class="mt-0.5 text-xs text-text-muted">
										{tx('auth.emailVerified.action.proDesc')}
									</p>
								</div>
								<span
									class="rounded bg-brand-orange-15 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-orange"
								>
									{tx('auth.emailVerified.action.proBadge')}
								</span>
							</button>
						</div>

						<!-- CTA buttons -->
						<div class="flex flex-col gap-3">
							<a
								href={resolve('/' as import('$app/types').Pathname)}
								class="cta-btn flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-sm font-bold text-white shadow-glow-green"
							>
								<i class="fa-solid fa-shield-halved"></i>
								{tx('auth.emailVerified.cta.login')}
							</a>
							<button
								class="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-700 bg-navy-lighter py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
							>
								<i class="fa-solid fa-download text-text-muted"></i>
								{tx('auth.emailVerified.cta.ebook')}
							</button>
						</div>
					</div>
				</div>

				<!-- Mobile: What's next section -->
				<div class="mt-5 flex flex-col gap-3 lg:hidden">
					<div class="flex items-center gap-3">
						<div class="h-px flex-1 bg-gray-800"></div>
						<span class="text-xs font-medium text-text-muted"
							>{tx('auth.emailVerified.whatsNext.divider')}</span
						>
						<div class="h-px flex-1 bg-gray-800"></div>
					</div>
					<a
						href={resolve('/' as import('$app/types').Pathname)}
						class="step-row flex cursor-pointer items-center gap-4 rounded-xl border border-brand-green/25 bg-navy-card p-4 active:scale-[0.98]"
					>
						<div
							class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-green-10"
						>
							<i class="fa-solid fa-broom text-base text-brand-green"></i>
						</div>
						<div class="min-w-0 flex-1">
							<p class="text-sm font-semibold text-white">
								{tx('auth.emailVerified.action.cleanTitle')}
							</p>
							<p class="mt-0.5 text-xs text-text-muted">
								{tx('auth.emailVerified.action.cleanDesc')}
							</p>
						</div>
						<i class="fa-solid fa-chevron-right flex-shrink-0 text-xs text-text-muted"></i>
					</a>
					<button
						class="step-row flex cursor-pointer items-center gap-4 rounded-xl border border-gray-800 bg-navy-card p-4 active:scale-[0.98]"
					>
						<div
							class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-orange-10"
						>
							<i class="fa-solid fa-crown text-base text-brand-orange"></i>
						</div>
						<div class="min-w-0 flex-1 text-left">
							<p class="text-sm font-semibold text-white">
								{tx('auth.emailVerified.action.proTitle')}
							</p>
							<p class="mt-0.5 text-xs text-text-muted">
								{tx('auth.emailVerified.action.proDesc')}
							</p>
						</div>
						<span
							class="flex-shrink-0 rounded bg-brand-orange-15 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-orange"
						>
							{tx('auth.emailVerified.action.proBadge')}
						</span>
					</button>
				</div>

				<!-- Mobile: CTA buttons -->
				<div class="mt-5 flex flex-col gap-3 pt-1 lg:hidden">
					<a
						href={resolve('/' as import('$app/types').Pathname)}
						class="cta-btn flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-xl py-4 text-base font-bold text-white shadow-glow-green"
					>
						<i class="fa-solid fa-shield-halved"></i>
						{tx('auth.emailVerified.cta.login')}
					</a>
					<button
						class="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-gray-700 bg-navy-lighter py-3.5 text-sm font-semibold text-white transition-colors active:bg-gray-800"
					>
						<i class="fa-solid fa-download text-text-muted"></i>
						{tx('auth.emailVerified.cta.ebook')}
					</button>
				</div>

				<!-- Trust badges -->
				<TrustBadges />
			</div>
		</div>
	</main>
</AuthLayout>

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

	.verified-nav {
		background-color: var(--color-navy-main-95);
		backdrop-filter: blur(12px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}
	@media (min-width: 1024px) {
		.verified-nav {
			background-color: transparent;
			backdrop-filter: none;
			border-bottom: none;
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
				0 0 0 16px rgba(34, 197, 94, 0),
				0 0 40px var(--color-brand-green-30);
		}
	}

	.cta-btn {
		background: linear-gradient(135deg, var(--color-brand-green) 0%, var(--color-brand-green-dark) 100%);
		transition: all 0.2s ease;
	}
	.cta-btn:hover {
		background: linear-gradient(135deg, var(--color-brand-green-dark) 0%, var(--color-brand-green-darker) 100%);
		transform: translateY(-1px);
		box-shadow: 0 8px 24px var(--color-brand-green-40);
	}
	.cta-btn:active {
		background: linear-gradient(135deg, var(--color-brand-green-dark) 0%, var(--color-brand-green-darker) 100%);
		transform: scale(0.98);
		box-shadow: 0 8px 24px var(--color-brand-green-40);
	}

	.step-row {
		transition: border-color 0.2s ease;
	}
	.step-row:hover {
		border-color: var(--color-brand-green-30);
	}
</style>
