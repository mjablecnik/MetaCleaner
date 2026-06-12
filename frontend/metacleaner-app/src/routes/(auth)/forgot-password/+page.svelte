<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import AuthLayout from '../components/AuthLayout.svelte';
	import AuthNavbar from '../components/AuthNavbar.svelte';
	import StepProgressBar from '../components/StepProgressBar.svelte';
	import ForgotPasswordFormSection from './sections/ForgotPasswordFormSection.svelte';
	import TrustBadges from '../components/TrustBadges.svelte';
	import PasswordRecoveryProgressCards from '../components/PasswordRecoveryProgressCards.svelte';

	let step = $state<1 | 2 | 3 | 4>(1);
	let sentEmail = $state('');

	const metaTitle = $derived(
		step <= 2
			? tx('auth.forgotPassword.meta.title')
			: step === 3
				? tx('auth.newPassword.meta.title')
				: tx('auth.newPassword.meta.title')
	);
</script>

<svelte:head>
	<title>{metaTitle}</title>
</svelte:head>

<AuthLayout>
	<AuthNavbar
		rightText={tx('auth.common.nav.remembered')}
		rightHref="/login"
		rightLabel={tx('auth.common.nav.login')}
	/>

	<main
		class="mx-auto flex w-full max-w-[1100px] flex-1 items-center justify-center px-5 pb-8 lg:px-6 lg:pb-16"
	>
		<div class="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2">
			<!-- Left: Branding (desktop only) -->
			<div class="hidden flex-col gap-8 lg:flex">
				{#if step === 1}
					<!-- Step 1: Overview -->
					<div class="flex flex-col gap-4">
						<div
							class="floating-icon mb-2 flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-blue/30 bg-brand-blue/15"
						>
							<i class="fa-solid fa-key text-3xl text-brand-blue"></i>
						</div>
						<h1 class="text-4xl leading-tight font-black text-white">
							{tx('auth.forgotPassword.branding.headline')}<br /><span class="text-brand-green"
								>{tx('auth.forgotPassword.branding.headlineHighlight')}</span
							>
							{tx('auth.forgotPassword.branding.headlineAfter')}
						</h1>
						<p class="max-w-md text-base leading-relaxed text-text-muted">
							{tx('auth.forgotPassword.branding.description')}
						</p>
					</div>

					<div class="flex flex-col gap-3">
						<div class="flex items-center gap-4 rounded-xl border border-gray-800 bg-navy-card p-4">
							<div
								class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-blue/15 text-sm font-bold text-brand-blue"
							>
								1
							</div>
							<div>
								<p class="text-sm font-semibold text-white">
									{tx('auth.forgotPassword.step1.title')}
								</p>
								<p class="mt-0.5 text-xs text-text-muted">{tx('auth.forgotPassword.step1.desc')}</p>
							</div>
							<div class="ml-auto">
								<i class="fa-solid fa-envelope text-brand-blue opacity-60"></i>
							</div>
						</div>
						<div class="flex items-center gap-4 rounded-xl border border-gray-800 bg-navy-card p-4">
							<div
								class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-orange/15 text-sm font-bold text-brand-orange"
							>
								2
							</div>
							<div>
								<p class="text-sm font-semibold text-white">
									{tx('auth.forgotPassword.step2.title')}
								</p>
								<p class="mt-0.5 text-xs text-text-muted">{tx('auth.forgotPassword.step2.desc')}</p>
							</div>
							<div class="ml-auto">
								<i class="fa-solid fa-shield-halved text-brand-orange opacity-60"></i>
							</div>
						</div>
						<div class="flex items-center gap-4 rounded-xl border border-gray-800 bg-navy-card p-4">
							<div
								class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-green/15 text-sm font-bold text-brand-green"
							>
								3
							</div>
							<div>
								<p class="text-sm font-semibold text-white">
									{tx('auth.forgotPassword.step3.title')}
								</p>
								<p class="mt-0.5 text-xs text-text-muted">{tx('auth.forgotPassword.step3.desc')}</p>
							</div>
							<div class="ml-auto">
								<i class="fa-solid fa-lock text-brand-green opacity-60"></i>
							</div>
						</div>
					</div>

					<div
						class="flex h-[72px] items-start gap-3 rounded-xl border border-brand-green/20 bg-brand-green/5 p-4"
					>
						<i class="fa-solid fa-circle-check mt-0.5 text-brand-green"></i>
						<div>
							<p class="text-sm font-semibold text-white">
								{tx('auth.forgotPassword.security.title')}
							</p>
							<p class="mt-0.5 text-xs text-text-muted">
								{tx('auth.forgotPassword.security.description')}
							</p>
						</div>
					</div>
				{:else if step === 2}
					<!-- Step 2: OTP hint -->
					<div class="flex flex-col gap-4">
						<div
							class="floating-icon mb-2 flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-blue/30 bg-brand-blue/15"
						>
							<i class="fa-solid fa-key text-3xl text-brand-blue"></i>
						</div>
						<h1 class="text-4xl leading-tight font-black text-white">
							{tx('auth.forgotPassword.branding.headline')}<br /><span class="text-brand-green"
								>{tx('auth.forgotPassword.branding.headlineHighlight')}</span
							>
							{tx('auth.forgotPassword.branding.headlineAfter')}
						</h1>
						<p class="max-w-md text-base leading-relaxed text-text-muted">
							{tx('auth.forgotPassword.branding.description')}
						</p>
					</div>

					<PasswordRecoveryProgressCards currentStep={2} />

					<div
						class="flex h-[72px] items-start gap-3 rounded-xl border border-brand-blue/20 bg-brand-blue/5 p-4"
					>
						<i class="fa-solid fa-envelope-open-text mt-0.5 text-brand-blue"></i>
						<div>
							<p class="text-sm font-semibold text-white">{tx('auth.checkCode.hint.title')}</p>
							<p class="mt-0.5 text-xs text-text-muted">
								{tx('auth.checkCode.hint.description', { email: sentEmail })}
							</p>
						</div>
					</div>
				{:else}
					<!-- Steps 3–4: New password / Success -->
					<div class="flex flex-col gap-4">
						<div
							class="floating-icon mb-2 flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-green/30 bg-brand-green/15"
						>
							<i class="fa-solid fa-lock text-3xl text-brand-green"></i>
						</div>
						<h1 class="text-4xl leading-tight font-black text-white">
							{tx('auth.newPassword.branding.headline')}
						</h1>
						<p class="max-w-md text-base leading-relaxed text-text-muted">
							{tx('auth.newPassword.branding.description')}
						</p>
					</div>

					<PasswordRecoveryProgressCards
						currentStep={step === 4 ? 4 : 3}
						step1DoneDesc={tx('auth.newPassword.step1.doneDesc')}
						step2DoneDesc={tx('auth.newPassword.step2.doneDesc')}
					/>

					<div
						class="flex items-start gap-3 rounded-xl border border-brand-green/20 bg-brand-green/5 p-4"
					>
						<i class="fa-solid fa-shield-halved mt-0.5 flex-shrink-0 text-brand-green"></i>
						<div>
							<p class="text-sm font-semibold text-white">{tx('auth.newPassword.tip.title')}</p>
							<p class="mt-0.5 text-xs text-text-muted">{tx('auth.newPassword.tip.description')}</p>
						</div>
					</div>
				{/if}
			</div>

			<!-- Right: Form -->
			<div class="mx-auto w-full max-w-[480px] lg:mx-0 lg:ml-auto">
				<StepProgressBar steps={3} currentStep={step} />
				<ForgotPasswordFormSection bind:step bind:sentEmail />
				<TrustBadges />
			</div>
		</div>
	</main>
</AuthLayout>

<style>
	@keyframes float {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-8px);
		}
	}
	.floating-icon {
		animation: float 3s ease-in-out infinite;
	}
</style>
