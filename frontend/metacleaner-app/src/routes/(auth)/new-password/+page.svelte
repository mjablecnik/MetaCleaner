<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import AuthLayout from '../components/AuthLayout.svelte';
	import AuthNavbar from '../components/AuthNavbar.svelte';
	import StepProgressBar from '../components/StepProgressBar.svelte';
	import NewPasswordFormSection from './sections/NewPasswordFormSection.svelte';

	let step = $state<3 | 4>(3);

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}
</script>

<svelte:head>
	<title>{tx('auth.newPassword.meta.title')}</title>
</svelte:head>

<AuthLayout>
	<AuthNavbar
		rightText={tx('auth.common.nav.remembered')}
		rightHref="/login"
		rightLabel={tx('auth.common.nav.login')}
	/>

	<main class="mx-auto flex w-full max-w-[1100px] flex-1 px-4 pb-8 lg:px-6 lg:pb-16">
		<div class="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2">

			<!-- Left: Desktop branding with step status cards -->
			<div class="hidden flex-col gap-8 lg:flex">
				<div class="flex flex-col gap-4">
					<div class="floating-icon mb-2 flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-green/30 bg-brand-green/15">
						<i class="fa-solid fa-lock text-3xl text-brand-green"></i>
					</div>
					<h1 class="text-4xl font-black leading-tight text-white">
						{tx('auth.newPassword.branding.headline')}
					</h1>
					<p class="max-w-md text-base leading-relaxed text-text-muted">
						{tx('auth.newPassword.branding.description')}
					</p>
				</div>

				<div class="flex flex-col gap-3">
					<div class="step-info-card done-card flex items-center gap-4 rounded-xl border border-gray-800 bg-navy-card p-4">
						<div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-green/15">
							<i class="fa-solid fa-check text-sm text-brand-green"></i>
						</div>
						<div>
							<p class="text-sm font-semibold text-white">{tx('auth.forgotPassword.step1.title')}</p>
							<p class="mt-0.5 text-xs text-text-muted">{tx('auth.newPassword.step1.doneDesc')}</p>
						</div>
						<div class="ml-auto"><i class="fa-solid fa-circle-check text-brand-green opacity-80"></i></div>
					</div>
					<div class="step-info-card done-card flex items-center gap-4 rounded-xl border border-gray-800 bg-navy-card p-4">
						<div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-green/15">
							<i class="fa-solid fa-check text-sm text-brand-green"></i>
						</div>
						<div>
							<p class="text-sm font-semibold text-white">{tx('auth.forgotPassword.step2.title')}</p>
							<p class="mt-0.5 text-xs text-text-muted">{tx('auth.newPassword.step2.doneDesc')}</p>
						</div>
						<div class="ml-auto"><i class="fa-solid fa-circle-check text-brand-green opacity-80"></i></div>
					</div>
					<div
						class="step-info-card flex items-center gap-4 rounded-xl border border-gray-800 bg-navy-card p-4"
						class:active-card={step === 3}
						class:done-card={step === 4}
					>
						<div
							class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold {step === 3 ? 'ring-2 ring-brand-blue/30' : ''}"
							style={step === 4 ? 'background: var(--color-brand-green-15);' : 'background: var(--color-brand-blue-20); color: var(--color-brand-blue);'}
						>
							{#if step === 4}
								<i class="fa-solid fa-check text-brand-green"></i>
							{:else}
								3
							{/if}
						</div>
						<div>
							<p class="text-sm font-semibold text-white">{tx('auth.forgotPassword.step3.title')}</p>
							<p class="mt-0.5 text-xs text-text-muted">{tx('auth.forgotPassword.step3.desc')}</p>
						</div>
						<div class="ml-auto">
							<i class={step === 4 ? 'fa-solid fa-circle-check text-brand-green opacity-80' : 'fa-solid fa-lock text-brand-blue opacity-80'}></i>
						</div>
					</div>
				</div>

				<div class="flex items-start gap-3 rounded-xl border border-brand-green/20 bg-brand-green/5 p-4">
					<i class="fa-solid fa-shield-halved mt-0.5 flex-shrink-0 text-brand-green"></i>
					<div>
						<p class="text-sm font-semibold text-white">{tx('auth.newPassword.tip.title')}</p>
						<p class="mt-0.5 text-xs text-text-muted">{tx('auth.newPassword.tip.description')}</p>
					</div>
				</div>
			</div>

			<!-- Right: Form -->
			<div class="mx-auto w-full max-w-[480px] lg:mx-0 lg:ml-auto">
				<!-- Mobile page header -->
				<div class="mb-5 flex items-center gap-3 lg:hidden">
					<div class="floating-icon flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-brand-green/30 bg-brand-green/15">
						<i class="fa-solid fa-lock text-xl text-brand-green"></i>
					</div>
					<div>
						<h1 class="text-xl font-bold leading-tight text-white">{tx('auth.newPassword.mobile.headline')}</h1>
						<p class="mt-0.5 text-xs text-text-muted">{tx('auth.newPassword.mobile.subtitle')}</p>
					</div>
				</div>

				<StepProgressBar steps={3} currentStep={step === 4 ? 4 : 3} />
				<NewPasswordFormSection bind:step />

				<div class="mt-4 flex items-center justify-center gap-4 lg:mt-5 lg:gap-5">
					<div class="flex items-center gap-1.5 text-xs text-text-muted">
						<i class="fa-solid fa-shield-halved text-sm text-brand-green"></i>
						<span class="hidden lg:inline">{tx('auth.common.trust.ssl')}</span>
						<span class="lg:hidden">{tx('auth.common.trust.sslShort')}</span>
					</div>
					<div class="h-3 w-px bg-gray-700"></div>
					<div class="flex items-center gap-1.5 text-xs text-text-muted">
						<i class="fa-solid fa-user-shield text-sm text-brand-blue"></i>
						<span class="hidden lg:inline">{tx('auth.common.trust.gdpr')}</span>
						<span class="lg:hidden">{tx('auth.common.trust.gdprShort')}</span>
					</div>
					<div class="h-3 w-px bg-gray-700"></div>
					<div class="flex items-center gap-1.5 text-xs text-text-muted">
						<i class="fa-solid fa-lock text-sm text-text-muted"></i>
						<span>{tx('auth.common.trust.noTracking')}</span>
					</div>
				</div>
			</div>
		</div>
	</main>
</AuthLayout>

<style>
	@keyframes float {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-8px); }
	}
	.floating-icon { animation: float 3s ease-in-out infinite; }

	.step-info-card.done-card {
		border-color: var(--color-brand-green-30) !important;
		background: var(--color-brand-green-4) !important;
	}
	.step-info-card.active-card {
		border-color: var(--color-brand-blue-40) !important;
		background: var(--color-brand-blue-5) !important;
	}
</style>
