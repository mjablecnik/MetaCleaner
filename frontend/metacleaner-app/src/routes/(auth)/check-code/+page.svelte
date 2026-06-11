<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';

	let currentStep = $state(2);
	let sentEmail = $state('vas@email.cz');
	let emailInput = $state('');
	let emailError = $state('');

	let otpValues = $state(['', '', '', '', '', '']);
	let otpError = $state('');
	let otpShake = $state(false);

	let newPassword = $state('');
	let confirmPassword = $state('');
	let confirmError = $state('');
	let newPasswordVisible = $state(false);
	let confirmPasswordVisible = $state(false);
	let submitState = $state<'idle' | 'loading' | 'success'>('idle');

	let countdown = $state('14:59');
	let countdownInterval: ReturnType<typeof setInterval> | null = null;
	let progressBarVisible = $state(true);

	let otpInputs: HTMLInputElement[] = $state([]);

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
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
		setTimeout(() => {
			if (otpInputs[0]) otpInputs[0].focus();
		}, 100);
	}

	function handleOtpSubmit(e: SubmitEvent) {
		e.preventDefault();
		otpError = '';
		const code = otpValues.join('');
		if (code.length < 6) {
			otpError = tx('auth.common.validation.otpIncomplete');
			otpShake = true;
			setTimeout(() => {
				otpShake = false;
			}, 400);
			return;
		}
		if (countdownInterval) clearInterval(countdownInterval);
		goto('/new-password');
	}

	function resendCode() {
		otpValues = ['', '', '', '', '', ''];
		startCountdown();
		setTimeout(() => {
			if (otpInputs[0]) otpInputs[0].focus();
		}, 100);
	}

	function handleOtpInput(idx: number, e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const val = input.value.replace(/[^0-9]/g, '').slice(0, 1);
		const next = [...otpValues];
		next[idx] = val;
		otpValues = next;
		if (val && idx < 5 && otpInputs[idx + 1]) {
			otpInputs[idx + 1].focus();
		}
	}

	function handleOtpKeydown(idx: number, e: KeyboardEvent) {
		if (e.key === 'Backspace' && !otpValues[idx] && idx > 0 && otpInputs[idx - 1]) {
			otpInputs[idx - 1].focus();
		}
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
			if (total <= 0) {
				clearInterval(countdownInterval!);
				countdownInterval = null;
			}
			total--;
		}, 1000);
	}

	onMount(() => {
		startCountdown();
		setTimeout(() => {
			if (otpInputs[0]) otpInputs[0].focus();
		}, 100);
	});

	const strengthLabelKeys = [
		'',
		'auth.common.strength.weak',
		'auth.common.strength.average',
		'auth.common.strength.good',
		'auth.common.strength.strong'
	];

	type StrengthResult = {
		score: number;
		label: string;
		color: string;
		widthClass: string;
		bgClass: string;
	};

	function getStrength(pwd: string): StrengthResult {
		const len = pwd.length >= 8;
		const upper = /[A-Z]/.test(pwd);
		const num = /[0-9]/.test(pwd);
		const long = pwd.length >= 12;
		const score = [len, upper, num, long].filter(Boolean).length;
		const colors = [
			'text-text-muted',
			'text-brand-red',
			'text-brand-orange',
			'text-brand-yellow',
			'text-brand-green'
		];
		const widths = ['w-0', 'w-1/4', 'w-2/4', 'w-3/4', 'w-full'];
		const bgs = ['', 'bg-brand-red', 'bg-brand-orange', 'bg-brand-yellow', 'bg-brand-green'];
		const labelKey = strengthLabelKeys[score];
		return {
			score,
			label: labelKey ? tx(labelKey) : '',
			color: colors[score],
			widthClass: widths[score],
			bgClass: bgs[score]
		};
	}

	const strength = $derived(getStrength(newPassword));

	function reqMet(check: boolean) {
		return check
			? 'flex items-center gap-2 text-xs text-brand-green'
			: 'flex items-center gap-2 text-xs text-text-muted';
	}
	function reqIcon(check: boolean) {
		return check ? 'fa-solid fa-circle-check text-brand-green' : 'fa-solid fa-circle text-[6px]';
	}
</script>

<svelte:head>
	<title>{tx('auth.checkCode.meta.title')}</title>
</svelte:head>

<div
	class="flex min-h-screen flex-col"
	style="background-image: radial-gradient(ellipse at 20% 50%, var(--color-page-gradient-blue) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, var(--color-page-gradient-green) 0%, transparent 50%);"
>
	<!-- Navbar -->
	<nav
		class="mx-auto flex w-full max-w-[1100px] items-center justify-between px-4 py-4 lg:px-6 lg:py-6"
	>
		<div class="flex items-center gap-2.5 lg:gap-3">
			<div
				class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue text-white shadow-glow-blue lg:h-10 lg:w-10"
			>
				<i class="fa-solid fa-shield-halved text-base lg:text-xl"></i>
			</div>
			<span class="text-lg font-bold tracking-tight lg:text-xl">{tx('common.brandName')}</span>
		</div>
		<div class="flex items-center gap-2">
			<span class="hidden text-sm text-text-muted lg:inline">{tx('auth.common.nav.remembered')}</span>
			<a
				href="/login"
				class="rounded-lg border border-gray-700 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-navy-lighter lg:px-4 lg:py-2 lg:text-sm"
			>
				{tx('auth.common.nav.login')}
			</a>
		</div>
	</nav>

	<!-- Main -->
	<main
		class="mx-auto flex w-full max-w-[1100px] flex-1 items-center justify-center px-4 pb-8 lg:px-6 lg:pb-16"
	>
		<div class="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2">

			<!-- Left: Branding (desktop only) -->
			<div class="hidden flex-col gap-8 lg:flex">
				<div class="flex flex-col gap-4">
					<div
						class="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-blue/30 bg-brand-blue/15 floating-icon"
					>
						<i class="fa-solid fa-key text-3xl text-brand-blue"></i>
					</div>
					<h1 class="text-4xl font-black leading-tight text-white">
						{tx('auth.forgotPassword.branding.headline')}<br /><span class="text-brand-green">{tx('auth.forgotPassword.branding.headlineHighlight')}</span> {tx('auth.forgotPassword.branding.headlineAfter')}
					</h1>
					<p class="max-w-md text-base leading-relaxed text-text-muted">
						{tx('auth.forgotPassword.branding.description')}
					</p>
				</div>

				<!-- Step Info Cards -->
				<div class="flex flex-col gap-3">
					<!-- Step 1: Done -->
					<div
						class="step-info-card done-card flex items-center gap-4 rounded-xl border border-gray-800 bg-navy-card p-4"
					>
						<div
							class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-green/15"
						>
							<i class="fa-solid fa-check text-sm text-brand-green"></i>
						</div>
						<div>
							<p class="text-sm font-semibold text-white">{tx('auth.forgotPassword.step1.title')}</p>
							<p class="mt-0.5 text-xs text-text-muted">{tx('auth.forgotPassword.step1.desc')}</p>
						</div>
						<div class="ml-auto">
							<i class="fa-solid fa-circle-check text-brand-green opacity-80"></i>
						</div>
					</div>
					<!-- Step 2: Active -->
					<div
						class="step-info-card active-card flex items-center gap-4 rounded-xl border border-gray-800 bg-navy-card p-4"
					>
						<div
							class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-blue/20 text-sm font-bold text-brand-blue ring-2 ring-brand-blue/30"
						>
							2
						</div>
						<div>
							<p class="text-sm font-semibold text-white">{tx('auth.forgotPassword.step2.title')}</p>
							<p class="mt-0.5 text-xs text-text-muted">{tx('auth.forgotPassword.step2.desc')}</p>
						</div>
						<div class="ml-auto">
							<i class="fa-solid fa-shield-halved text-brand-blue opacity-80"></i>
						</div>
					</div>
					<!-- Step 3: Neutral -->
					<div
						class="step-info-card flex items-center gap-4 rounded-xl border border-gray-800 bg-navy-card p-4"
					>
						<div
							class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-green/15 text-sm font-bold text-brand-green"
						>
							3
						</div>
						<div>
							<p class="text-sm font-semibold text-white">{tx('auth.forgotPassword.step3.title')}</p>
							<p class="mt-0.5 text-xs text-text-muted">{tx('auth.forgotPassword.step3.desc')}</p>
						</div>
						<div class="ml-auto">
							<i class="fa-solid fa-lock text-brand-green opacity-60"></i>
						</div>
					</div>
				</div>

				<!-- Email Hint Card -->
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
			</div>

			<!-- Right: Form -->
			<div class="mx-auto w-full max-w-[480px] lg:mx-0 lg:ml-auto">

				<!-- Progress Bar -->
				{#if progressBarVisible}
					<div class="mb-5 flex items-center gap-2 lg:mb-6">
						<div class="flex flex-1 items-center gap-2">
							<div
								class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white transition-all duration-300 lg:h-8 lg:w-8"
								style="background: {currentStep > 1 ? 'var(--color-brand-green)' : currentStep === 1 ? 'var(--color-brand-blue)' : 'var(--color-navy-lighter)'};"
							>
								{#if currentStep > 1}
									<i class="fa-solid fa-check text-xs"></i>
								{:else}
									1
								{/if}
							</div>
							<div class="flex-1 h-1 overflow-hidden rounded-full bg-navy-lighter">
								<div
									class="h-full rounded-full transition-all duration-500"
									style="width: {currentStep > 1 ? '100%' : '0'}; background: {currentStep > 1 ? 'var(--color-brand-green)' : 'var(--color-brand-blue)'};"
								></div>
							</div>
						</div>
						<div class="flex flex-1 items-center gap-2">
							<div
								class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 lg:h-8 lg:w-8"
								style="background: {currentStep > 2 ? 'var(--color-brand-green)' : currentStep === 2 ? 'var(--color-brand-blue)' : 'var(--color-navy-lighter)'}; color: {currentStep < 2 ? 'var(--color-text-muted)' : 'white'};"
							>
								{#if currentStep > 2}
									<i class="fa-solid fa-check text-xs"></i>
								{:else}
									2
								{/if}
							</div>
							<div class="flex-1 h-1 overflow-hidden rounded-full bg-navy-lighter">
								<div
									class="h-full rounded-full transition-all duration-500"
									style="width: {currentStep > 2 ? '100%' : '0'}; background: var(--color-brand-blue);"
								></div>
							</div>
						</div>
						<div
							class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 lg:h-8 lg:w-8"
							style="background: {currentStep === 3 ? 'var(--color-brand-blue)' : 'var(--color-navy-lighter)'}; color: {currentStep === 3 ? 'white' : 'var(--color-text-muted)'};"
						>
							3
						</div>
					</div>
				{/if}

				<!-- Form Card -->
				<div class="rounded-2xl border border-gray-800 bg-navy-card p-5 shadow-card lg:p-8">

					<!-- Step 1: Email -->
					{#if currentStep === 1}
						<form onsubmit={handleEmailSubmit} class="flex flex-col gap-3.5 lg:gap-4">
							<div class="flex flex-col gap-1">
								<h2 class="text-xl font-bold text-white lg:text-2xl">{tx('auth.forgotPassword.form.title')}</h2>
								<p class="text-sm text-text-muted">
									{tx('auth.forgotPassword.form.description')}
								</p>
							</div>

							<div class="flex flex-col gap-1.5">
								<label for="email-input" class="text-sm font-medium text-white"
									>{tx('auth.common.field.emailLabel')}</label
								>
								<div class="relative">
									<span
										class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-muted"
									>
										<i class="fa-regular fa-envelope"></i>
									</span>
									<input
										id="email-input"
										type="email"
										bind:value={emailInput}
										placeholder={tx('auth.common.field.emailPlaceholder')}
										class="min-h-[44px] w-full rounded-xl border py-3.5 pl-10 pr-4 text-sm font-medium text-white transition-[border-color,box-shadow] placeholder:text-text-muted focus:outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] lg:min-h-0 lg:py-3"
										style="background: var(--color-navy-main); border-color: {emailError ? 'var(--color-brand-red)' : 'var(--color-navy-lighter)'};"
										onfocus={(ev) =>
											((ev.currentTarget as HTMLInputElement).style.borderColor = emailError
												? 'var(--color-brand-red)'
												: 'var(--color-brand-blue)')}
										onblur={(ev) =>
											((ev.currentTarget as HTMLInputElement).style.borderColor = emailError
												? 'var(--color-brand-red)'
												: 'var(--color-navy-lighter)')}
									/>
								</div>
								{#if emailError}
									<span class="text-[12px] text-brand-red">
										<i class="fa-solid fa-circle-exclamation mr-1"></i>{emailError}
									</span>
								{/if}
							</div>

							<button
								type="submit"
								class="mt-1 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-500 lg:min-h-0 lg:py-3.5"
								style="background: var(--color-brand-green);"
							>
								<i class="fa-solid fa-paper-plane"></i> {tx('auth.forgotPassword.submit.sendCode')}
							</button>

							<div class="text-center">
								<a
									href="/login"
									class="text-sm text-text-muted transition-colors hover:text-white"
								>
									<i class="fa-solid fa-arrow-left mr-1.5"></i>{tx('auth.common.nav.backToLogin')}
								</a>
							</div>
						</form>
					{/if}

					<!-- Step 2: OTP -->
					{#if currentStep === 2}
						<form onsubmit={handleOtpSubmit} class="flex flex-col gap-3.5 lg:gap-4">
							<div class="mb-1 flex items-center gap-3">
								<div
									class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-brand-blue/30 bg-brand-blue/15"
								>
									<i class="fa-solid fa-shield-halved text-brand-blue"></i>
								</div>
								<div>
									<h2 class="text-xl font-bold text-white lg:text-2xl">{tx('auth.forgotPassword.otp.title')}</h2>
									<p class="mt-0.5 text-xs text-text-muted">{tx('auth.forgotPassword.otp.stepLabel')}</p>
								</div>
							</div>

							<p class="text-sm text-text-muted">
								{tx('auth.checkCode.otp.sentTo')}
								<span class="break-all font-semibold text-white">{sentEmail}</span>
							</p>

							<!-- OTP Inputs -->
							<div
								class="mt-1 flex justify-between otp-wrapper {otpShake ? 'shake' : ''}"
							>
								{#each otpValues as val, idx}
									<input
										bind:this={otpInputs[idx]}
										type="text"
										inputmode="numeric"
										pattern="[0-9]*"
										maxlength={1}
										value={val}
										oninput={(e) => handleOtpInput(idx, e)}
										onkeydown={(e) => handleOtpKeydown(idx, e)}
										class="otp-input text-center font-bold text-white transition-[border-color,box-shadow] focus:outline-none"
										style="background: var(--color-navy-main); border-color: {val ? 'var(--color-brand-green)' : 'var(--color-navy-lighter)'}; box-shadow: {val ? '0 0 8px var(--color-brand-green-20)' : 'none'};"
										onfocus={(ev) => {
											const el = ev.currentTarget as HTMLInputElement;
											if (!el.value) el.style.borderColor = 'var(--color-brand-blue)';
										}}
										onblur={(ev) => {
											const el = ev.currentTarget as HTMLInputElement;
											el.style.borderColor = el.value ? 'var(--color-brand-green)' : 'var(--color-navy-lighter)';
										}}
									/>
								{/each}
							</div>

							{#if otpError}
								<span class="text-[12px] text-brand-red">
									<i class="fa-solid fa-circle-exclamation mr-1"></i>{otpError}
								</span>
							{/if}

							<!-- Progress Dots -->
							<div class="flex items-center justify-center gap-1.5 py-1">
								{#each otpValues as val}
									<div
										class="h-2 w-2 rounded-full transition-all duration-200"
										style="background: {val ? 'var(--color-brand-green)' : 'var(--color-navy-lighter)'};"
									></div>
								{/each}
							</div>

							<!-- Countdown Card -->
							<div
								class="flex items-center justify-between rounded-xl border border-gray-800 bg-navy-main p-3"
							>
								<div class="flex items-center gap-2">
									<i class="fa-regular fa-clock text-sm text-text-muted"></i>
									<span class="text-xs text-text-muted">{tx('auth.checkCode.countdown.label')}</span>
									<span class="tabular-nums text-sm font-bold text-white">{countdown}</span>
								</div>
								<button
									type="button"
									onclick={resendCode}
									class="flex items-center gap-1.5 text-xs font-semibold text-brand-blue transition-colors hover:text-blue-400"
								>
									<i class="fa-solid fa-rotate-right text-xs"></i> {tx('auth.common.action.resend')}
								</button>
							</div>

							<!-- Verify Button -->
							<button
								type="submit"
								class="pulse-green flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-500 lg:min-h-0 lg:py-3.5"
								style="background: var(--color-brand-green);"
							>
								<i class="fa-solid fa-shield-halved"></i> {tx('auth.forgotPassword.otp.verify')}
							</button>

							<!-- Help Text -->
							<div
								class="flex items-start gap-2 rounded-xl border border-gray-800 bg-navy-main p-3 text-xs text-text-muted"
							>
								<i
									class="fa-solid fa-circle-info mt-0.5 flex-shrink-0 text-text-muted"
								></i>
								<span>{tx('auth.checkCode.help.description')}</span>
							</div>

							<!-- Back -->
							<div class="text-center">
								<button
									type="button"
									onclick={() => goToStep(1)}
									class="py-1 text-sm text-text-muted transition-colors hover:text-white"
								>
									<i class="fa-solid fa-arrow-left mr-1.5"></i>{tx('auth.common.nav.back')}
								</button>
							</div>
						</form>
					{/if}

					<!-- Step 3: New Password -->
					{#if currentStep === 3}
						<form onsubmit={handleNewPasswordSubmit} class="flex flex-col gap-3.5 lg:gap-4">
							<div class="mb-1 flex items-center gap-3">
								<div
									class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-brand-blue/30 bg-brand-blue/15"
								>
									<i class="fa-solid fa-shield-halved text-brand-blue"></i>
								</div>
								<div>
									<h2 class="text-xl font-bold text-white lg:text-2xl">{tx('auth.forgotPassword.newPassword.title')}</h2>
									<p class="mt-0.5 text-xs text-text-muted">{tx('auth.forgotPassword.newPassword.stepLabel')}</p>
								</div>
							</div>
							<p class="text-sm text-text-muted">{tx('auth.forgotPassword.newPassword.description')}</p>

							<!-- New Password Field -->
							<div class="flex flex-col gap-1.5">
								<label for="new-password" class="text-sm font-medium text-white">{tx('auth.common.field.newPasswordLabel')}</label>
								<div class="relative">
									<span
										class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-muted"
									>
										<i class="fa-solid fa-lock"></i>
									</span>
									<input
										id="new-password"
										type={newPasswordVisible ? 'text' : 'password'}
										bind:value={newPassword}
										placeholder="••••••••"
										class="min-h-[44px] w-full rounded-xl border py-3.5 pl-10 pr-12 text-sm font-medium text-white transition-[border-color,box-shadow] placeholder:text-text-muted focus:outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] lg:min-h-0 lg:py-3"
										style="background: var(--color-navy-main); border-color: var(--color-navy-lighter);"
										onfocus={(ev) =>
											((ev.currentTarget as HTMLInputElement).style.borderColor = 'var(--color-brand-blue)')}
										onblur={(ev) =>
											((ev.currentTarget as HTMLInputElement).style.borderColor = 'var(--color-navy-lighter)')}
									/>
									<button
										type="button"
										onclick={() => { newPasswordVisible = !newPasswordVisible; }}
										aria-label={newPasswordVisible ? tx('auth.common.a11y.hidePassword') : tx('auth.common.a11y.showPassword')}
										class="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-sm text-text-muted transition-colors hover:text-white"
									>
										<i class={newPasswordVisible ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'}
										></i>
									</button>
								</div>
								<!-- Strength Bar -->
								<div class="mt-1 h-1.5 overflow-hidden rounded-full bg-navy-lighter">
									<div
										class="h-full rounded-full transition-all duration-300 {strength.widthClass} {strength.bgClass}"
									></div>
								</div>
								{#if newPassword.length > 0}
									<p class="text-xs {strength.color}">{strength.label}</p>
								{/if}
							</div>

							<!-- Confirm Password Field -->
							<div class="flex flex-col gap-1.5">
								<label for="confirm-password" class="text-sm font-medium text-white"
									>{tx('auth.common.field.confirmPasswordLabel')}</label
								>
								<div class="relative">
									<span
										class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-muted"
									>
										<i class="fa-solid fa-lock"></i>
									</span>
									<input
										id="confirm-password"
										type={confirmPasswordVisible ? 'text' : 'password'}
										bind:value={confirmPassword}
										placeholder="••••••••"
										class="min-h-[44px] w-full rounded-xl border py-3.5 pl-10 pr-12 text-sm font-medium text-white transition-[border-color,box-shadow] placeholder:text-text-muted focus:outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] lg:min-h-0 lg:py-3"
										style="background: var(--color-navy-main); border-color: {confirmError ? 'var(--color-brand-red)' : 'var(--color-navy-lighter)'};"
										onfocus={(ev) =>
											((ev.currentTarget as HTMLInputElement).style.borderColor = confirmError
												? 'var(--color-brand-red)'
												: 'var(--color-brand-blue)')}
										onblur={(ev) =>
											((ev.currentTarget as HTMLInputElement).style.borderColor = confirmError
												? 'var(--color-brand-red)'
												: 'var(--color-navy-lighter)')}
									/>
									<button
										type="button"
										onclick={() => { confirmPasswordVisible = !confirmPasswordVisible; }}
										aria-label={confirmPasswordVisible ? tx('auth.common.a11y.hidePassword') : tx('auth.common.a11y.showPassword')}
										class="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-sm text-text-muted transition-colors hover:text-white"
									>
										<i
											class={confirmPasswordVisible
												? 'fa-regular fa-eye-slash'
												: 'fa-regular fa-eye'}
										></i>
									</button>
								</div>
								{#if confirmError}
									<span class="text-[12px] text-brand-red">
										<i class="fa-solid fa-circle-exclamation mr-1"></i>{confirmError}
									</span>
								{/if}
							</div>

							<!-- Requirements -->
							<div class="flex flex-col gap-1.5 rounded-xl border border-gray-800 bg-navy-main p-3">
								<p class="text-xs font-semibold uppercase tracking-wider text-text-muted">
									{tx('auth.common.requirements.title')}
								</p>
								<div class="mt-1 flex flex-col gap-1">
									<div class={reqMet(newPassword.length >= 8)}>
										<i class={reqIcon(newPassword.length >= 8)}></i>{tx('auth.common.requirements.min8')}
									</div>
									<div class={reqMet(/[A-Z]/.test(newPassword))}>
										<i class={reqIcon(/[A-Z]/.test(newPassword))}></i>{tx('auth.common.requirements.uppercase')}
									</div>
									<div class={reqMet(/[0-9]/.test(newPassword))}>
										<i class={reqIcon(/[0-9]/.test(newPassword))}></i>{tx('auth.common.requirements.number')}
									</div>
								</div>
							</div>

							<!-- Submit -->
							<button
								type="submit"
								disabled={submitState === 'loading'}
								class="mt-1 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-500 lg:min-h-0 lg:py-3.5"
								style="background: var(--color-brand-green);"
							>
								{#if submitState === 'loading'}
									<i class="fa-solid fa-spinner fa-spin"></i> {tx('auth.common.submit.saving')}
								{:else}
									<i class="fa-solid fa-check"></i> {tx('auth.common.submit.setNewPassword')}
								{/if}
							</button>

							<!-- Back -->
							<div class="text-center">
								<button
									type="button"
									onclick={() => goToStep(2)}
									class="py-1 text-sm text-text-muted transition-colors hover:text-white"
								>
									<i class="fa-solid fa-arrow-left mr-1.5"></i>{tx('auth.common.nav.backToCode')}
								</button>
							</div>
						</form>
					{/if}

					<!-- Step 4: Success -->
					{#if currentStep === 4}
						<div class="flex flex-col items-center gap-4 py-6 text-center lg:gap-5">
							<div
								class="flex h-20 w-20 items-center justify-center rounded-full border-2 border-brand-green/40 bg-brand-green/15"
							>
								<i class="fa-solid fa-circle-check text-5xl text-brand-green"></i>
							</div>
							<div>
								<h2 class="text-2xl font-bold text-white">{tx('auth.common.success.passwordChanged')}</h2>
								<p class="mt-2 text-sm leading-relaxed text-text-muted">
									{tx('auth.common.success.passwordChangedDesc')}
								</p>
							</div>
							<a
								href="/login"
								class="mt-1 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-500 lg:min-h-0 lg:py-3.5"
								style="background: var(--color-brand-green);"
							>
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
</div>

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

	.step-info-card.done-card {
		border-color: var(--color-brand-green-30) !important;
		background: var(--color-brand-green-4) !important;
	}

	.step-info-card.active-card {
		border-color: var(--color-brand-blue-40) !important;
		background: var(--color-brand-blue-5) !important;
	}

	@keyframes shake {
		0%,
		100% {
			transform: translateX(0);
		}
		20% {
			transform: translateX(-6px);
		}
		40% {
			transform: translateX(6px);
		}
		60% {
			transform: translateX(-4px);
		}
		80% {
			transform: translateX(4px);
		}
	}

	.otp-wrapper.shake {
		animation: shake 0.4s ease;
	}

	@keyframes pulseGreen {
		0%,
		100% {
			box-shadow: 0 0 0 0 var(--color-brand-green-30);
		}
		50% {
			box-shadow: 0 0 0 8px transparent;
		}
	}

	.pulse-green {
		animation: pulseGreen 1.5s ease-in-out infinite;
	}

	/* OTP input sizing */
	.otp-input {
		border: 1px solid var(--color-navy-lighter);
		border-radius: 10px;
		height: 52px;
		font-size: 1.25rem;
		flex: 1;
	}

	@media (min-width: 1024px) {
		.otp-input {
			border-radius: 12px;
			width: 52px;
			height: 60px;
			font-size: 1.5rem;
			flex: none;
		}

		.otp-wrapper {
			gap: 0.5rem;
		}
	}

	.otp-wrapper {
		display: flex;
		gap: 0.375rem;
	}
</style>
