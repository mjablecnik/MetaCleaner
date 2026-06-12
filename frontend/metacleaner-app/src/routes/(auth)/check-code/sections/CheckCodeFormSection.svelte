<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import OtpInput from '../../components/OtpInput.svelte';
	import PasswordInput from '../../components/PasswordInput.svelte';
	import PasswordStrengthMeter from '../../components/PasswordStrengthMeter.svelte';
	import AuthTextInput from '$lib/shared/elements/AuthTextInput.svelte';
	import CountdownTimer from '../../components/CountdownTimer.svelte';

	interface Props {
		currentStep?: 1 | 2 | 3 | 4;
		sentEmail?: string;
	}

	let { currentStep = $bindable(2), sentEmail = $bindable('vas@email.cz') }: Props = $props();

	let emailInput = $state('');
	let emailError = $state('');

	let otpValues = $state(['', '', '', '', '', '']);
	let otpError = $state('');

	let newPassword = $state('');
	let confirmPassword = $state('');
	let confirmError = $state('');
	let newPasswordVisible = $state(false);
	let confirmPasswordVisible = $state(false);
	let submitState = $state<'idle' | 'loading' | 'success'>('idle');

	let countdownKey = $state(0);
	let progressBarVisible = $state(true);

	let otpRef: OtpInput;

	function validateEmail(v: string) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
	}

	function goToStep(n: number) {
		currentStep = n as 1 | 2 | 3 | 4;
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
		goto('/new-password');
	}

	function resendCode() {
		otpValues = ['', '', '', '', '', ''];
		countdownKey++;
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

	onMount(() => {
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
</script>

<div class="rounded-2xl border border-gray-800 bg-navy-card p-5 shadow-card lg:p-8">

	<!-- Step 1: Email -->
	{#if currentStep === 1}
		<form onsubmit={handleEmailSubmit} class="flex flex-col gap-3.5 lg:gap-4">
			<div class="flex flex-col gap-1">
				<h2 class="text-xl font-bold text-white lg:text-2xl">{tx('auth.forgotPassword.form.title')}</h2>
				<p class="text-sm text-text-muted">{tx('auth.forgotPassword.form.description')}</p>
			</div>

			<AuthTextInput
				id="email-input"
				type="email"
				label={tx('auth.common.field.emailLabel')}
				bind:value={emailInput}
				placeholder={tx('auth.common.field.emailPlaceholder')}
				icon="fa-regular fa-envelope"
				error={emailError}
			/>

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

			<!-- Progress dots -->
			<div class="flex items-center justify-center gap-1.5 py-1">
				{#each otpValues as val}
					<div class="h-2 w-2 rounded-full transition-all duration-200" style="background: {val ? 'var(--color-brand-green)' : 'var(--color-navy-lighter)'};">
					</div>
				{/each}
			</div>

			<!-- Countdown card -->
			<div class="flex items-center justify-between rounded-xl border border-gray-800 bg-navy-main p-3">
				<div class="flex items-center gap-2">
					<i class="fa-regular fa-clock text-sm text-text-muted"></i>
					<span class="text-xs text-text-muted">{tx('auth.checkCode.countdown.label')}</span>
					{#key countdownKey}
						<CountdownTimer durationSeconds={899} class="text-sm font-bold text-white" />
					{/key}
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

<style>
	@keyframes pulseGreen {
		0%, 100% { box-shadow: 0 0 0 0 var(--color-brand-green-30); }
		50% { box-shadow: 0 0 0 8px transparent; }
	}
	.pulse-green { animation: pulseGreen 1.5s ease-in-out infinite; }
</style>
