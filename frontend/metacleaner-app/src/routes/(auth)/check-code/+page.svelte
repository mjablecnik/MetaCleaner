<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import AuthLayout from '../components/AuthLayout.svelte';
	import AuthNavbar from '../components/AuthNavbar.svelte';
	import StepProgressBar from '../components/StepProgressBar.svelte';
	import CheckCodeFormSection from './sections/CheckCodeFormSection.svelte';
	import TrustBadges from '../components/TrustBadges.svelte';
	import PasswordRecoveryProgressCards from '../components/PasswordRecoveryProgressCards.svelte';

	let currentStep = $state<1 | 2 | 3 | 4>(2);
	let sentEmail = $state('vas@email.cz');

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}
</script>

<svelte:head>
	<title>{tx('auth.checkCode.meta.title')}</title>
</svelte:head>

<AuthLayout>
	<AuthNavbar
		rightText={tx('auth.common.nav.remembered')}
		rightHref="/login"
		rightLabel={tx('auth.common.nav.login')}
	/>

	<main class="mx-auto flex w-full max-w-[1100px] flex-1 items-center justify-center px-4 pb-8 lg:px-6 lg:pb-16">
		<div class="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2">

			<!-- Left: Branding (desktop only) -->
			<div class="hidden flex-col gap-8 lg:flex">
				<div class="flex flex-col gap-4">
					<div class="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-blue/30 bg-brand-blue/15 floating-icon">
						<i class="fa-solid fa-key text-3xl text-brand-blue"></i>
					</div>
					<h1 class="text-4xl font-black leading-tight text-white">
						{tx('auth.forgotPassword.branding.headline')}<br /><span class="text-brand-green">{tx('auth.forgotPassword.branding.headlineHighlight')}</span> {tx('auth.forgotPassword.branding.headlineAfter')}
					</h1>
					<p class="max-w-md text-base leading-relaxed text-text-muted">{tx('auth.forgotPassword.branding.description')}</p>
				</div>

				<PasswordRecoveryProgressCards currentStep={2} />

				<div class="flex h-[72px] items-start gap-3 rounded-xl border border-brand-blue/20 bg-brand-blue/5 p-4">
					<i class="fa-solid fa-envelope-open-text mt-0.5 text-brand-blue"></i>
					<div>
						<p class="text-sm font-semibold text-white">{tx('auth.checkCode.hint.title')}</p>
						<p class="mt-0.5 text-xs text-text-muted">{tx('auth.checkCode.hint.description', { email: sentEmail })}</p>
					</div>
				</div>
			</div>

			<!-- Right: Form -->
			<div class="mx-auto w-full max-w-[480px] lg:mx-0 lg:ml-auto">
				<StepProgressBar steps={3} {currentStep} />
				<CheckCodeFormSection bind:currentStep bind:sentEmail />
				<TrustBadges />
			</div>
		</div>
	</main>
</AuthLayout>

