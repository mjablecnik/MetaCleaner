<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import AuthLayout from '../components/AuthLayout.svelte';
	import AuthNavbar from '../components/AuthNavbar.svelte';
	import StepProgressBar from '../components/StepProgressBar.svelte';
	import PasswordInput from '../components/PasswordInput.svelte';
	import PasswordStrengthMeter from '../components/PasswordStrengthMeter.svelte';

	let newPassword = $state('');
	let confirmPassword = $state('');
	let newPasswordVisible = $state(false);
	let confirmPasswordVisible = $state(false);
	let submitState = $state<'idle' | 'loading'>('idle');
	let step = $state<3 | 4>(3);

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}

	const hasLen = $derived(newPassword.length >= 8);
	const hasUpper = $derived(/[A-Z]/.test(newPassword));
	const hasLower = $derived(/[a-z]/.test(newPassword));
	const hasNum = $derived(/[0-9]/.test(newPassword));
	const hasSpecial = $derived(/[!@#$%^&*(),.?":{}|<>]/.test(newPassword));

	const strengthScore = $derived(
		newPassword.length > 0
			? [hasLen, hasUpper, hasNum, hasSpecial].filter(Boolean).length
			: 0
	);

	const passwordsMatch = $derived(confirmPassword.length > 0 && newPassword === confirmPassword);
	const passwordsMismatch = $derived(confirmPassword.length > 0 && newPassword !== confirmPassword);

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (newPassword.length < 8 || newPassword !== confirmPassword) return;
		submitState = 'loading';
		setTimeout(() => {
			submitState = 'idle';
			step = 4;
		}, 1200);
	}

	function reqClass(met: boolean) {
		return met ? 'flex items-center gap-2 text-xs text-brand-green' : 'flex items-center gap-2 text-xs text-text-muted';
	}
	function reqIcon(met: boolean) {
		return met ? 'fa-solid fa-circle-check text-brand-green' : 'fa-solid fa-circle-xmark text-gray-600';
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

				<div class="rounded-2xl border border-gray-800 bg-navy-card p-5 shadow-card lg:p-8">

					{#if step === 3}
						<form onsubmit={handleSubmit} class="flex flex-col gap-4 lg:gap-5">
							<div class="hidden flex-col gap-1 lg:flex">
								<div class="mb-2 flex items-center gap-3">
									<div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-brand-green/30 bg-brand-green/15">
										<i class="fa-solid fa-lock text-brand-green"></i>
									</div>
									<div>
										<h2 class="text-2xl font-bold text-white">{tx('auth.forgotPassword.newPassword.title')}</h2>
										<p class="text-xs text-text-muted">{tx('auth.forgotPassword.newPassword.stepLabel')}</p>
									</div>
								</div>
								<p class="text-sm text-text-muted">{tx('auth.newPassword.form.description')}</p>
							</div>

							<div class="flex flex-col gap-1.5">
								<label for="new-password" class="text-sm font-medium text-white">{tx('auth.common.field.newPasswordLabel')}</label>
								<PasswordInput
									id="new-password"
									bind:value={newPassword}
									visible={newPasswordVisible}
									onToggle={() => (newPasswordVisible = !newPasswordVisible)}
									ariaShowLabel={tx('auth.common.a11y.showPassword')}
									ariaHideLabel={tx('auth.common.a11y.hidePassword')}
								/>
								<PasswordStrengthMeter score={strengthScore} />
							</div>

							<div class="flex flex-col gap-1.5">
								<label for="confirm-password" class="text-sm font-medium text-white">{tx('auth.common.field.confirmPasswordLabel')}</label>
								<PasswordInput
									id="confirm-password"
									bind:value={confirmPassword}
									error={passwordsMismatch ? tx('auth.common.validation.passwordsMismatch') : ''}
									visible={confirmPasswordVisible}
									onToggle={() => (confirmPasswordVisible = !confirmPasswordVisible)}
									ariaShowLabel={tx('auth.common.a11y.showPassword')}
									ariaHideLabel={tx('auth.common.a11y.hidePassword')}
								/>
								{#if passwordsMatch}
									<span class="text-xs text-brand-green">
										<i class="fa-solid fa-circle-check mr-1"></i>{tx('auth.common.validation.passwordsMatch')}
									</span>
								{/if}
							</div>

							<div class="rounded-xl border border-gray-800 bg-navy-main p-3.5 lg:p-4">
								<p class="mb-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted lg:mb-2">
									{tx('auth.common.requirements.title')}
								</p>
								<div class="hidden flex-col gap-2 lg:flex">
									<div class={reqClass(hasLen)}><i class="{reqIcon(hasLen)} w-4 flex-shrink-0 text-center"></i>{tx('auth.common.requirements.min8')}</div>
									<div class={reqClass(hasUpper)}><i class="{reqIcon(hasUpper)} w-4 flex-shrink-0 text-center"></i>{tx('auth.common.requirements.uppercaseFull')}</div>
									<div class={reqClass(hasLower)}><i class="{reqIcon(hasLower)} w-4 flex-shrink-0 text-center"></i>{tx('auth.common.requirements.lowercase')}</div>
									<div class={reqClass(hasNum)}><i class="{reqIcon(hasNum)} w-4 flex-shrink-0 text-center"></i>{tx('auth.common.requirements.numberFull')}</div>
									<div class={reqClass(hasSpecial)}><i class="{reqIcon(hasSpecial)} w-4 flex-shrink-0 text-center"></i>{tx('auth.common.requirements.special')}</div>
								</div>
								<div class="grid grid-cols-2 gap-1.5 lg:hidden">
									<div class={reqClass(hasLen)}><i class="{reqIcon(hasLen)} w-3.5 flex-shrink-0 text-center"></i><span>{tx('auth.common.requirements.min8')}</span></div>
									<div class={reqClass(hasUpper)}><i class="{reqIcon(hasUpper)} w-3.5 flex-shrink-0 text-center"></i><span>{tx('auth.common.requirements.uppercase')}</span></div>
									<div class={reqClass(hasLower)}><i class="{reqIcon(hasLower)} w-3.5 flex-shrink-0 text-center"></i><span>{tx('auth.common.requirements.lowercase')}</span></div>
									<div class={reqClass(hasNum)}><i class="{reqIcon(hasNum)} w-3.5 flex-shrink-0 text-center"></i><span>{tx('auth.common.requirements.numberFull')}</span></div>
									<div class="{reqClass(hasSpecial)} col-span-2"><i class="{reqIcon(hasSpecial)} w-3.5 flex-shrink-0 text-center"></i><span>{tx('auth.common.requirements.special')}</span></div>
								</div>
							</div>

							<button
								type="submit"
								disabled={submitState === 'loading'}
								class="pulse-green mt-1 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-4 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-500 lg:min-h-0 lg:py-3.5"
							>
								{#if submitState === 'loading'}
									<i class="fa-solid fa-spinner fa-spin"></i> {tx('auth.common.submit.saving')}
								{:else}
									<i class="fa-solid fa-check"></i> {tx('auth.common.submit.setNewPassword')}
								{/if}
							</button>

							<div class="text-center">
								<a href="/check-code" class="inline-block py-1 text-sm text-text-muted transition-colors hover:text-white">
									<i class="fa-solid fa-arrow-left mr-1.5"></i>{tx('auth.common.nav.backToCode')}
								</a>
							</div>
						</form>
					{/if}

					{#if step === 4}
						<div class="flex flex-col items-center gap-5 py-4 text-center lg:py-6">
							<div class="flex h-20 w-20 items-center justify-center rounded-full border-2 border-brand-green/40 bg-brand-green/15 lg:h-24 lg:w-24">
								<i class="fa-solid fa-circle-check text-4xl text-brand-green lg:text-5xl"></i>
							</div>
							<div class="flex flex-col gap-2">
								<h2 class="text-2xl font-bold text-white">{tx('auth.common.success.passwordChanged')}</h2>
								<p class="mx-auto max-w-xs text-sm leading-relaxed text-text-muted">
									{tx('auth.common.success.passwordChangedDesc')}
								</p>
							</div>
							<div class="mt-2 flex w-full flex-col gap-3">
								<a href="/login" class="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-4 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-500 lg:min-h-0 lg:py-3.5">
									<i class="fa-solid fa-arrow-right-to-bracket"></i> {tx('auth.common.nav.login')}
								</a>
								<div class="flex items-center gap-2 rounded-xl border border-brand-green/20 bg-navy-main p-3 text-xs text-text-muted">
									<i class="fa-solid fa-shield-halved flex-shrink-0 text-brand-green"></i>
									<span>{tx('auth.common.success.encrypted')}</span>
								</div>
							</div>
						</div>
					{/if}
				</div>

				{#if step === 3}
					<div class="mt-4 flex items-start gap-3 rounded-xl border border-brand-green/20 bg-brand-green/5 p-3.5 lg:hidden">
						<i class="fa-solid fa-shield-halved mt-0.5 flex-shrink-0 text-sm text-brand-green"></i>
						<p class="text-xs text-text-muted">
							<span class="font-semibold text-white">{tx('auth.common.tip.prefix')} </span>{tx('auth.newPassword.mobile.tip')}
						</p>
					</div>
				{/if}

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

	@keyframes pulseGreen {
		0%, 100% { box-shadow: 0 0 0 0 var(--color-brand-green-30); }
		50% { box-shadow: 0 0 0 8px transparent; }
	}
	.pulse-green { animation: pulseGreen 1.5s ease-in-out infinite; }
</style>
