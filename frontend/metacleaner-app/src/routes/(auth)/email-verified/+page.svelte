<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import AuthLayout from '../components/AuthLayout.svelte';
	import TrustBadges from '../components/TrustBadges.svelte';
	import EmailVerifiedHeroSection from './sections/EmailVerifiedHeroSection.svelte';
	import EmailVerifiedProgressSection from './sections/EmailVerifiedProgressSection.svelte';
	import EmailVerifiedStatsSection from './sections/EmailVerifiedStatsSection.svelte';
	import EmailVerifiedActionsSection from './sections/EmailVerifiedActionsSection.svelte';

	// This page is shown after clicking the email verification link.
	// No auto-login — user must sign in manually via the login page.
	const userEmail = '';
</script>

<svelte:head>
	<title>{tx('auth.emailVerified.meta.title')}</title>
</svelte:head>

<AuthLayout>
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

	<main
		class="mx-auto flex w-full max-w-[1100px] flex-1 items-center justify-center px-6 pt-6 pb-10 lg:pb-16"
	>
		<!-- Mobile layout (single-column, hidden on desktop) -->
		<div class="flex w-full flex-col lg:hidden">
			<EmailVerifiedHeroSection {userEmail} />
			<EmailVerifiedProgressSection currentStep={3} />
			<div class="mt-5">
				<EmailVerifiedStatsSection />
			</div>
			<EmailVerifiedActionsSection />
			<TrustBadges />
		</div>

		<!-- Desktop layout (two-column grid, hidden on mobile) -->
		<div class="hidden w-full items-center gap-10 lg:grid lg:grid-cols-2">
			<!-- Left: headline + vertical stepper + stats -->
			<div class="fade-in flex flex-col gap-8">
				<div class="flex flex-col gap-3">
					<h1 class="text-4xl leading-tight font-black text-white">
						{tx('auth.emailVerified.left.headline')}<br />
						<span class="text-brand-green">{tx('auth.emailVerified.left.headlineHighlight')}</span>
					</h1>
					<p class="max-w-sm text-base leading-relaxed text-text-muted">
						{tx('auth.emailVerified.left.description')}
					</p>
				</div>
				<EmailVerifiedProgressSection currentStep={3} />
				<EmailVerifiedStatsSection />
			</div>

			<!-- Right: success card + trust badges -->
			<div class="ml-auto w-full max-w-[460px]">
				<div
					class="flex flex-col gap-7 rounded-2xl border border-gray-800 bg-navy-card p-8 shadow-card"
				>
					<EmailVerifiedHeroSection {userEmail} />
					<EmailVerifiedActionsSection />
				</div>
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
		border-bottom: 1px solid var(--color-white-5);
	}
	@media (min-width: 1024px) {
		.verified-nav {
			background-color: transparent;
			backdrop-filter: none;
			border-bottom: none;
		}
	}
</style>
