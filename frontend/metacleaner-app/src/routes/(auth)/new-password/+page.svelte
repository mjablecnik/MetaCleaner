<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import AuthLayout from '../components/AuthLayout.svelte';
	import AuthNavbar from '../components/AuthNavbar.svelte';
	import StepProgressBar from '../components/StepProgressBar.svelte';
	import NewPasswordFormSection from './sections/NewPasswordFormSection.svelte';
	import TrustBadges from '../components/TrustBadges.svelte';
	import PasswordRecoveryProgressCards from '../components/PasswordRecoveryProgressCards.svelte';

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

				<PasswordRecoveryProgressCards
					currentStep={step === 4 ? 4 : 3}
					step1DoneDesc={tx('auth.newPassword.step1.doneDesc')}
					step2DoneDesc={tx('auth.newPassword.step2.doneDesc')}
				/>

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

				<TrustBadges />
			</div>
		</div>
	</main>
</AuthLayout>

