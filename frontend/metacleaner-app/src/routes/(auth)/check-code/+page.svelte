<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import AuthLayout from '../components/AuthLayout.svelte';
	import AuthNavbar from '../components/AuthNavbar.svelte';
	import StepProgressBar from '../components/StepProgressBar.svelte';
	import OtpInput from '../components/OtpInput.svelte';
	import PasswordInput from '../components/PasswordInput.svelte';
	import PasswordStrengthMeter from '../components/PasswordStrengthMeter.svelte';

	let currentStep = $state(2);
	let sentEmail = $state('vas@email.cz');
	let emailInput = $state('');
	let emailError = $state('');
	let emailFocused = $state(false);

	let otpValues = $state(['', '', '', '', '', '']);
	let otpError = $state('');

	let newPassword = $state('');
	let confirmPassword = $state('');
	let confirmError = $state('');
	let newPasswordVisible = $state(false);
	let confirmPasswordVisible = $state(false);
	let submitState = $state<'idle' | 'loading' | 'success'>('idle');

	let countdown = $state('14:59');
	let countdownInterval: ReturnType<typeof setInterval> | null = null;
	let progressBarVisible = $state(true);

	let otpRef: OtpInput;

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}

	function validateEmail(v: string) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
	}

	function goToStep(n: number) {
		currentStep = n;
		if (n !== 2 && countdownInterval) {
			clearInterval(countdownInterval);
			countdownInterval = null;
		}
	}

	function handleEmailSubmit(e: SubmitEvent) {
		e.preventDefault();
		emailError = '';
		if (!validateEmail(emailInput)) {
			emailError = tx('auth.common.validation.emailInvalid');
			return;
		}
		sentEmail = emailInput.trim();
		goToStep(2);
		startCountdown();
		setTimeout(() => { otpRef?.focus(); }, 100);
	}

	function handleOtpSubmit(e: SubmitEvent) {
		e.preventDefault();
		otpError = '';
		const code = otpValues.join('');
		if (code.length < 6) {
			otpError = tx('auth.common.validation.otpIncomplete');
			return;
		}
		if (countdownInterval) clearInterval(countdownInterval);
		goto('/new-password');
	}

	function resendCode() {
		otpValues = ['', '', '', '', '', ''];
		startCountdown();
		setTimeout(() => { otpRef?.focus(); }, 100);
	}

	function handleNewPasswordSubmit(e: SubmitEvent) {
		e.preventDefault();
		confirmError = '';
		if (newPassword !== confirmPassword || newPassword.length < 8) {
			confirmError = tx('auth.common.validation.passwordsMismatchOrShort');
			return;
		}
		submitState = 'loading';
		setTimeout(() => {
			submitState = 'idle';
			progressBarVisible = false;
			goToStep(4);
		}, 1200);
	}

	function startCountdown() {
		let total = 899;
		if (countdownInterval) clearInterval(countdownInterval);
		countdown = '14:59';
		countdownInterval = setInterval(() => {
			const min = Math.floor(total / 60);
			const s = total % 60;
			countdown = min + ':' + String(s).padStart(2, '0');
			if (total <= 0) { clearInterval(countdownInterval!); countdownInterval = null; }
			total--;
		}, 1000);
	}

	onMount(() => {
		startCountdown();
		setTimeout(() => { otpRef?.focus(); }, 100);
	});

	function getStrengthScore(pwd: string): number {
		return [pwd.length >= 8, /[A-Z]/.test(pwd), /[0-9]/.test(pwd), pwd.length >= 12].filter(Boolean).length;
	}
	const strengthScore = $derived(newPassword.length > 0 ? getStrengthScore(newPassword) : 0);

	function reqMet(check: boolean) {
		return check ? 'flex items-center gap-2 text-xs text-brand-green' : 'flex items-center gap-2 text-xs text-text-muted';
	}
	function reqIcon(check: boolean) {
		return check ? 'fa-solid fa-circle-check text-brand-green' : 'fa-solid fa-circle text-[6px]';
	}

	const emailBorderColor = $derived(
		emailError ? 'var(--color-brand-red)' : emailFocused ? 'var(--color-brand-blue)' : 'var(--color-navy-lighter)'
	);
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

				<!-- Step Info Cards -->
				<div class="flex flex-col gap-3">
					<div class="step-info-card done-card flex items-center gap-4 rounded-xl border border-gray-800 bg-navy-card p-4">
						<div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-green/15">
							<i class="fa-solid fa-check text-sm text-brand-green"></i>
						</div>
						<div>
							<p class="text-sm font-semibold text-white">{tx('auth.forgotPassword.step1.title')}</p>
							<p class="mt-0.5 text-xs text-text-muted">{tx('auth.forgotPassword.step1.desc')}</p>
						</div>
						<div class="ml-auto"><i class="fa-solid fa-circle-check text-brand-green opacity-80"></i></div>
					</div>
					<div class="step-info-card active-card flex items-center gap-4 rounded-xl border border-gray-800 bg-navy-card p-4">
						<div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-blue/20 text-sm font-bold text-brand-blue ring-2 ring-brand-blue/30">2</div>
						<div>
							<p class="text-sm font-semibold text-white">{tx('auth.forgotPassword.step2.title')}</p>
							<p class="mt-0.5 text-xs text-text-muted">{tx('auth.forgotPassword.step2.desc')}</p>
						</div>
						<div class="ml-auto"><i class="fa-solid fa-shield-halved text-brand-blue opacity-80"></i></div>
					</div>
					<div class="step-info-card flex items-center gap-4 rounded-xl border border-gray-800 bg-navy-card p-4">
						<div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-green/15 text-sm font-bold text-brand-green">3</div>
						<div>
							<p class="text-sm font-semibold text-white">{tx('auth.forgotPassword.step3.title')}</p>
							<p class="mt-0.5 text-xs text-text-muted">{tx('auth.forgotPassword.step3.desc')}</p>
						</div>
						<div class="ml-auto"><i class="fa-solid fa-lock text-brand-green opacity-60"></i></div>
					</div>
				</div>

				<!-- Email Hint Card -->
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
				{#if progressBarVisible}
					<StepProgressBar steps={3} {currentStep} />
				{/if}

				<div class="rounded-2xl border border-gray-800 bg-navy-card p-5 shadow-card lg:p-8">

					<!-- Step 1: Email -->
					{#if currentStep === 1}
						<form onsubmit={handleEmailSubmit} class="flex flex-col gap-3.5 lg:gap-4">
							<div class="flex flex-col gap-1">
								<h2 class="text-xl font-bold text-white lg:text-2xl">{tx('auth.forgotPassword.form.title')}</h2>
								<p class="text-sm text-text-muted">{tx('auth.forgotPassword.form.description')}</p>
							</div>

							<div class="flex flex-col gap-1.5">
								<label for="email-input" class="text-sm font-medium text-white">{tx('auth.common.field.emailLabel')}</label>
								<div class="relative">
									<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-muted">
										<i class="fa-regular fa-envelope"></i>
									</span>
									<input
										id="email-input"
										type="email"
										bind:value={emailInput}
										placeholder={tx('auth.common.field.emailPlaceholder')}
										class="min-h-[44px] w-full rounded-xl border py-3.5 pl-10 pr-4 text-sm font-medium text-white transition-[border-color,box-shadow] placeholder:text-text-muted focus:outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] lg:min-h-0 lg:py-3"
										style="background: var(--color-navy-main); border-color: {emailBorderColor};"
										onfocus={() => (emailFocused = true)}
										onblur={() => (emailFocused = false)}
									/>
								</div>
								{#if emailError}
									<span class="text-[12px] text-brand-red"><i class="fa-solid fa-circle-exclamation mr-1"></i>{emailError}</span>
								{/if}
							</div>

							<button type="submit" class="mt-1 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-4 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-500 lg:min-h-0 lg:py-3.5">
								<i class="fa-solid fa-paper-plane"></i> {tx('auth.forgotPassword.submit.sendCode')}
							</button>

							<div class="text-center">
								<a href="/login" class="text-sm text-text-muted transition-colors hover:text-white">
									<i class="fa-solid fa-arrow-left mr-1.5"></i>{tx('auth.common.nav.backToLogin')}
								</a>
							</div>
						</form>
					{/if}

					<!-- Step 2: OTP -->
					{#if currentStep === 2}
						<form onsubmit={handleOtpSubmit} class="flex flex-col gap-3.5 lg:gap-4">
							<div class="mb-1 flex items-center gap-3">
								<div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-brand-blue/30 bg-brand-blue/15">
									<i class="fa-solid fa-shield-halved text-brand-blue"></i>
								</div>
								<div>
									<h2 class="text-xl font-bold text-white lg:text-2xl">{tx('auth.forgotPassword.otp.title')}</h2>
									<p class="mt-0.5 text-xs text-text-muted">{tx('auth.forgotPassword.otp.stepLabel')}</p>
								</div>
							</div>

							<p class="text-sm text-text-muted">
								{tx('auth.checkCode.otp.sentTo')} <span class="break-all font-semibold text-white">{sentEmail}</span>
							</p>

							<OtpInput bind:this={otpRef} bind:values={otpValues} error={otpError} />

							<!-- Progress Dots -->
							<div class="flex items-center justify-center gap-1.5 py-1">
								{#each otpValues as val}
									<div class="h-2 w-2 rounded-full transition-all duration-200" style="background: {val ? 'var(--color-brand-green)' : 'var(--color-navy-lighter)'};">
									</div>
								{/each}
							</div>

							<!-- Countdown Card -->
							<div class="flex items-center justify-between rounded-xl border border-gray-800 bg-navy-main p-3">
								<div class="flex items-center gap-2">
									<i class="fa-regular fa-clock text-sm text-text-muted"></i>
									<span class="text-xs text-text-muted">{tx('auth.checkCode.countdown.label')}</span>
									<span class="tabular-nums text-sm font-bold text-white">{countdown}</span>
								</div>
								<button type="button" onclick={resendCode} class="flex items-center gap-1.5 text-xs font-semibold text-brand-blue transition-colors hover:text-blue-400">
									<i class="fa-solid fa-rotate-right text-xs"></i> {tx('auth.common.action.resend')}
								</button>
							</div>

							<button type="submit" class="pulse-green flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-4 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-500 lg:min-h-0 lg:py-3.5">
								<i class="fa-solid fa-shield-halved"></i> {tx('auth.forgotPassword.otp.verify')}
							</button>

							<div class="flex items-start gap-2 rounded-xl border border-gray-800 bg-navy-main p-3 text-xs text-text-muted">
								<i class="fa-solid fa-circle-info mt-0.5 flex-shrink-0 text-text-muted"></i>
								<span>{tx('auth.checkCode.help.description')}</span>
							</div>

							<div class="text-center">
								<button type="button" onclick={() => goToStep(1)} class="py-1 text-sm text-text-muted transition-colors hover:text-white">
									<i class="fa-solid fa-arrow-left mr-1.5"></i>{tx('auth.common.nav.back')}
								</button>
							</div>
						</form>
					{/if}

					<!-- Step 3: New Password -->
					{#if currentStep === 3}
						<form onsubmit={handleNewPasswordSubmit} class="flex flex-col gap-3.5 lg:gap-4">
							<div class="mb-1 flex items-center gap-3">
								<div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-brand-blue/30 bg-brand-blue/15">
									<i class="fa-solid fa-shield-halved text-brand-blue"></i>
								</div>
								<div>
									<h2 class="text-xl font-bold text-white lg:text-2xl">{tx('auth.forgotPassword.newPassword.title')}</h2>
									<p class="mt-0.5 text-xs text-text-muted">{tx('auth.forgotPassword.newPassword.stepLabel')}</p>
								</div>
							</div>
							<p class="text-sm text-text-muted">{tx('auth.forgotPassword.newPassword.description')}</p>

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
									error={confirmError}
									visible={confirmPasswordVisible}
									onToggle={() => (confirmPasswordVisible = !confirmPasswordVisible)}
									ariaShowLabel={tx('auth.common.a11y.showPassword')}
									ariaHideLabel={tx('auth.common.a11y.hidePassword')}
								/>
							</div>

							<div class="flex flex-col gap-1.5 rounded-xl border border-gray-800 bg-navy-main p-3">
								<p class="text-xs font-semibold uppercase tracking-wider text-text-muted">{tx('auth.common.requirements.title')}</p>
								<div class="mt-1 flex flex-col gap-1">
									<div class={reqMet(newPassword.length >= 8)}><i class={reqIcon(newPassword.length >= 8)}></i>{tx('auth.common.requirements.min8')}</div>
									<div class={reqMet(/[A-Z]/.test(newPassword))}><i class={reqIcon(/[A-Z]/.test(newPassword))}></i>{tx('auth.common.requirements.uppercase')}</div>
									<div class={reqMet(/[0-9]/.test(newPassword))}><i class={reqIcon(/[0-9]/.test(newPassword))}></i>{tx('auth.common.requirements.number')}</div>
								</div>
							</div>

							<button type="submit" disabled={submitState === 'loading'} class="mt-1 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-4 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-500 lg:min-h-0 lg:py-3.5">
								{#if submitState === 'loading'}
									<i class="fa-solid fa-spinner fa-spin"></i> {tx('auth.common.submit.saving')}
								{:else}
									<i class="fa-solid fa-check"></i> {tx('auth.common.submit.setNewPassword')}
								{/if}
							</button>

							<div class="text-center">
								<button type="button" onclick={() => goToStep(2)} class="py-1 text-sm text-text-muted transition-colors hover:text-white">
									<i class="fa-solid fa-arrow-left mr-1.5"></i>{tx('auth.common.nav.backToCode')}
								</button>
							</div>
						</form>
					{/if}

					<!-- Step 4: Success -->
					{#if currentStep === 4}
						<div class="flex flex-col items-center gap-4 py-6 text-center lg:gap-5">
							<div class="flex h-20 w-20 items-center justify-center rounded-full border-2 border-brand-green/40 bg-brand-green/15">
								<i class="fa-solid fa-circle-check text-5xl text-brand-green"></i>
							</div>
							<div>
								<h2 class="text-2xl font-bold text-white">{tx('auth.common.success.passwordChanged')}</h2>
								<p class="mt-2 text-sm leading-relaxed text-text-muted">{tx('auth.common.success.passwordChangedDesc')}</p>
							</div>
							<a href="/login" class="mt-1 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-4 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-500 lg:min-h-0 lg:py-3.5">
								<i class="fa-solid fa-arrow-right-to-bracket"></i> {tx('auth.common.nav.login')}
							</a>
							<p class="flex items-center gap-1.5 text-xs text-text-muted">
								<i class="fa-solid fa-shield-halved text-xs"></i>
								{tx('auth.common.success.encrypted')}
							</p>
						</div>
					{/if}
				</div>

				<!-- Trust Badges -->
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
