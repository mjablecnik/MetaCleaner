<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import { onMount } from 'svelte';
	import { tx } from '$lib/shared/utils/i18n';
	import { buildApiUrl } from '$lib/clients/api-config.js';
	import AuthTextInput from '$lib/shared/elements/AuthTextInput.svelte';
	import OtpInput from '../../components/OtpInput.svelte';
	import PasswordInput from '../../components/PasswordInput.svelte';
	import PasswordStrengthMeter from '../../components/PasswordStrengthMeter.svelte';
	import CountdownTimer from '../../components/CountdownTimer.svelte';

	interface Props {
		step?: 1 | 2 | 3 | 4;
		sentEmail?: string;
	}

	let { step = $bindable(1), sentEmail = $bindable('') }: Props = $props();

	// Step 1
	let emailInput = $state('');
	let emailError = $state('');
	let emailApiError = $state('');
	let emailLoading = $state(false);

	// Step 2
	let otpValues = $state(['', '', '', '', '', '']);
	let otpError = $state('');
	let otpApiError = $state('');
	let otpLoading = $state(false);
	let countdownKey = $state(0);
	let resetToken = $state('');
	let otpRef = $state<OtpInput | undefined>(undefined);
	let resendCooldown = $state(false);
	let resendSuccess = $state(false);
	let resendCooldownTimer: ReturnType<typeof setTimeout> | undefined;

	// Step 3
	let newPassword = $state('');
	let confirmPassword = $state('');
	let newPasswordVisible = $state(false);
	let confirmPasswordVisible = $state(false);
	let passwordApiError = $state('');
	let passwordLoading = $state(false);

	const hasLen = $derived(newPassword.length >= 8);
	const hasUpper = $derived(/[A-Z]/.test(newPassword));
	const hasLower = $derived(/[a-z]/.test(newPassword));
	const hasNum = $derived(/[0-9]/.test(newPassword));
	const hasSpecial = $derived(/[!@#$%^&*(),.?":{}|<>]/.test(newPassword));
	const strengthScore = $derived(
		newPassword.length > 0 ? [hasLen, hasUpper, hasNum, hasSpecial].filter(Boolean).length : 0
	);
	const passwordsMatch = $derived(confirmPassword.length > 0 && newPassword === confirmPassword);
	const passwordsMismatch = $derived(confirmPassword.length > 0 && newPassword !== confirmPassword);

	function validateEmail(v: string) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
	}

	async function handleEmailSubmit(e: SubmitEvent) {
		e.preventDefault();
		emailError = '';
		emailApiError = '';
		if (!validateEmail(emailInput)) {
			emailError = tx('auth.common.validation.emailInvalid');
			return;
		}
		emailLoading = true;
		try {
			const res = await fetch(buildApiUrl('/api/auth/forgot-password'), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: emailInput.trim() })
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({ message: res.statusText }));
				throw new Error((data as { message?: string }).message ?? res.statusText);
			}
			sentEmail = emailInput.trim();
			step = 2;
			setTimeout(() => {
				otpRef?.focus();
			}, 100);
		} catch (err: unknown) {
			emailApiError = (err as Error).message ?? '';
		} finally {
			emailLoading = false;
		}
	}

	async function handleOtpSubmit(e: SubmitEvent) {
		e.preventDefault();
		otpError = '';
		otpApiError = '';
		const code = otpValues.join('');
		if (code.length < 6) {
			otpError = tx('auth.common.validation.otpIncomplete');
			return;
		}
		otpLoading = true;
		try {
			const res = await fetch(buildApiUrl('/api/auth/verify-reset-code'), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: sentEmail, code })
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({ message: res.statusText }));
				throw new Error((data as { message?: string }).message ?? res.statusText);
			}
			const data = (await res.json()) as { access_token: string };
			resetToken = data.access_token;
			step = 3;
		} catch (err: unknown) {
			otpApiError = (err as Error).message ?? '';
			resetToken = '';
		} finally {
			otpLoading = false;
		}
	}

	async function resendCode() {
		if (resendCooldown) return;
		otpValues = ['', '', '', '', '', ''];
		otpApiError = '';
		countdownKey++;
		resendCooldown = true;
		resendSuccess = true;
		try {
			await fetch(buildApiUrl('/api/auth/forgot-password'), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: sentEmail })
			});
		} catch {
			// Silently fail — anti-enumeration (Req 5.2)
		}
		setTimeout(() => {
			otpRef?.focus();
		}, 100);
		// Hide success message after 4s
		setTimeout(() => {
			resendSuccess = false;
		}, 4000);
		// Cooldown 10s
		clearTimeout(resendCooldownTimer);
		resendCooldownTimer = setTimeout(() => {
			resendCooldown = false;
		}, 10000);
	}

	async function handlePasswordSubmit(e: SubmitEvent) {
		e.preventDefault();
		passwordApiError = '';
		if (newPassword.length < 8 || newPassword.length > 128 || newPassword !== confirmPassword)
			return;
		passwordLoading = true;
		try {
			const res = await fetch(buildApiUrl('/api/auth/reset-password'), {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${resetToken}`
				},
				body: JSON.stringify({ password: newPassword })
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({ message: res.statusText }));
				throw new Error((data as { message?: string }).message ?? res.statusText);
			}
			resetToken = '';
			step = 4;
		} catch (err: unknown) {
			passwordApiError = (err as Error).message ?? '';
		} finally {
			passwordLoading = false;
		}
	}

	function reqClass(met: boolean) {
		return met
			? 'flex items-center gap-2 text-xs text-brand-green'
			: 'flex items-center gap-2 text-xs text-text-muted';
	}
	function reqIcon(met: boolean) {
		return met
			? 'fa-solid fa-circle-check text-brand-green'
			: 'fa-solid fa-circle-xmark text-gray-600';
	}

	const mobileSteps = [
		{
			num: '1',
			colorClass: 'bg-brand-blue/15 text-brand-blue',
			titleKey: 'auth.forgotPassword.step1.title',
			descKey: 'auth.forgotPassword.mobile.step1Desc',
			icon: 'fa-solid fa-envelope text-brand-blue'
		},
		{
			num: '2',
			colorClass: 'bg-brand-orange/15 text-brand-orange',
			titleKey: 'auth.forgotPassword.step2.title',
			descKey: 'auth.forgotPassword.mobile.step2Desc',
			icon: 'fa-solid fa-shield-halved text-brand-orange'
		},
		{
			num: '3',
			colorClass: 'bg-brand-green/15 text-brand-green',
			titleKey: 'auth.forgotPassword.mobile.step3Title',
			descKey: 'auth.forgotPassword.mobile.step3Desc',
			icon: 'fa-solid fa-lock text-brand-green'
		}
	];

	onMount(() => {
		if (step === 2)
			setTimeout(() => {
				otpRef?.focus();
			}, 100);
	});
</script>

<div class="rounded-2xl border border-gray-800 bg-navy-card p-5 shadow-card lg:p-8">
	<!-- Step 1: Email -->
	{#if step === 1}
		<form onsubmit={handleEmailSubmit} class="flex flex-col gap-3.5 lg:gap-4">
			<!-- Mobile header -->
			<div class="mb-1 flex items-center gap-3 lg:hidden">
				<div
					class="floating-icon flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-brand-blue/30 bg-brand-blue/15"
				>
					<i class="fa-solid fa-key text-xl text-brand-blue"></i>
				</div>
				<div>
					<h2 class="text-xl leading-tight font-bold text-white">
						{tx('auth.forgotPassword.form.title')}
					</h2>
					<p class="mt-0.5 text-xs text-text-muted">{tx('auth.forgotPassword.form.subtitle')}</p>
				</div>
			</div>

			<!-- Desktop header -->
			<div class="hidden flex-col gap-1 lg:flex">
				<h2 class="text-2xl font-bold text-white">{tx('auth.forgotPassword.form.title')}</h2>
				<p class="text-sm text-text-muted">{tx('auth.forgotPassword.form.description')}</p>
			</div>
			<p class="text-sm text-text-muted lg:hidden">{tx('auth.forgotPassword.form.description')}</p>

			<AuthTextInput
				id="email-input"
				type="email"
				label={tx('auth.common.field.emailLabel')}
				bind:value={emailInput}
				placeholder={tx('auth.common.field.emailPlaceholder')}
				icon="fa-regular fa-envelope"
				error={emailError}
			/>

			{#if emailApiError}
				<p class="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
					<i class="fa-solid fa-circle-exclamation mr-1.5"></i>{emailApiError}
				</p>
			{/if}

			<button
				type="submit"
				disabled={emailLoading}
				class="mt-1 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-4 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-500 disabled:opacity-60 lg:min-h-0 lg:py-3.5"
			>
				{#if emailLoading}
					<i class="fa-solid fa-spinner fa-spin"></i> {tx('auth.common.submit.sending')}
				{:else}
					<i class="fa-solid fa-paper-plane"></i> {tx('auth.forgotPassword.submit.sendCode')}
				{/if}
			</button>

			<!-- Mobile steps preview -->
			<div class="mt-1 flex flex-col gap-2 lg:hidden">
				{#each mobileSteps as s (s.num)}
					<div class="flex items-center gap-3 rounded-xl border border-gray-800 bg-navy-main p-3">
						<div
							class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold {s.colorClass}"
						>
							{s.num}
						</div>
						<div class="flex-1">
							<p class="text-xs font-semibold text-white">{tx(s.titleKey)}</p>
							<p class="text-[11px] text-text-muted">{tx(s.descKey)}</p>
						</div>
						<i class="{s.icon} text-xs opacity-50"></i>
					</div>
				{/each}
			</div>

			<div class="mt-1 text-center">
				<a
					href={resolve('/login' as Pathname)}
					class="text-sm text-text-muted transition-colors hover:text-white"
				>
					<i class="fa-solid fa-arrow-left mr-1.5"></i>{tx('auth.common.nav.backToLogin')}
				</a>
			</div>
		</form>
	{/if}

	<!-- Step 2: OTP verification -->
	{#if step === 2}
		<form onsubmit={handleOtpSubmit} class="flex flex-col gap-3.5 lg:gap-4">
			<div class="mb-1 flex items-center gap-3">
				<div
					class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-brand-blue/30 bg-brand-blue/15"
				>
					<i class="fa-solid fa-shield-halved text-brand-blue"></i>
				</div>
				<div>
					<h2 class="text-xl font-bold text-white lg:text-2xl">
						{tx('auth.forgotPassword.otp.title')}
					</h2>
					<p class="mt-0.5 text-xs text-text-muted">{tx('auth.forgotPassword.otp.stepLabel')}</p>
				</div>
			</div>

			<p class="text-sm text-text-muted">
				{tx('auth.checkCode.otp.sentTo')}
				<span class="font-semibold break-all text-white">{sentEmail}</span>
			</p>

			<OtpInput bind:this={otpRef} bind:values={otpValues} error={otpError} />

			<!-- Progress dots -->
			<div class="flex items-center justify-center gap-1.5 py-1">
				{#each otpValues as val, i (i)}
					<div
						class="h-2 w-2 rounded-full transition-all duration-200"
						style="background: {val ? 'var(--color-brand-green)' : 'var(--color-navy-lighter)'};"
					></div>
				{/each}
			</div>

			<!-- Countdown card -->
			<div
				class="flex items-center justify-between rounded-xl border border-gray-800 bg-navy-main p-3"
			>
				<div class="flex items-center gap-2">
					<i class="fa-regular fa-clock text-sm text-text-muted"></i>
					<span class="text-xs text-text-muted">{tx('auth.checkCode.countdown.label')}</span>
					{#key countdownKey}
						<CountdownTimer durationSeconds={900} class="text-sm font-bold text-white" />
					{/key}
				</div>
				<button
					type="button"
					onclick={resendCode}
					disabled={resendCooldown}
					class="flex items-center gap-1.5 text-xs font-semibold transition-colors {resendCooldown
						? 'cursor-not-allowed text-text-muted/50'
						: 'text-brand-blue hover:text-blue-400'}"
				>
					{#if resendCooldown}
						<i class="fa-solid fa-check text-xs text-brand-green"></i>
						{tx('auth.common.action.sent')}
					{:else}
						<i class="fa-solid fa-rotate-right text-xs"></i>
						{tx('auth.common.action.resend')}
					{/if}
				</button>
			</div>

			{#if resendSuccess}
				<p
					class="flex items-center gap-2 rounded-lg bg-brand-green/10 px-3 py-2 text-xs text-brand-green"
				>
					<i class="fa-solid fa-circle-check"></i>
					{tx('auth.checkCode.resendSuccess')}
				</p>
			{/if}

			{#if otpApiError}
				<p class="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
					<i class="fa-solid fa-circle-exclamation mr-1.5"></i>{otpApiError}
				</p>
			{/if}

			<button
				type="submit"
				disabled={otpLoading}
				class="pulse-green flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-4 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-500 disabled:opacity-60 lg:min-h-0 lg:py-3.5"
			>
				{#if otpLoading}
					<i class="fa-solid fa-spinner fa-spin"></i> {tx('auth.common.submit.verifying')}
				{:else}
					<i class="fa-solid fa-shield-halved"></i> {tx('auth.forgotPassword.otp.verify')}
				{/if}
			</button>

			<div
				class="flex items-start gap-2 rounded-xl border border-gray-800 bg-navy-main p-3 text-xs text-text-muted"
			>
				<i class="fa-solid fa-circle-info mt-0.5 flex-shrink-0 text-text-muted"></i>
				<span>{tx('auth.checkCode.help.description')}</span>
			</div>

			<div class="text-center">
				<button
					type="button"
					onclick={() => {
						step = 1;
					}}
					class="py-1 text-sm text-text-muted transition-colors hover:text-white"
				>
					<i class="fa-solid fa-arrow-left mr-1.5"></i>{tx('auth.common.nav.back')}
				</button>
			</div>
		</form>
	{/if}

	<!-- Step 3: New password -->
	{#if step === 3}
		<form onsubmit={handlePasswordSubmit} class="flex flex-col gap-4 lg:gap-5">
			<div class="mb-1 flex items-center gap-3">
				<div
					class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-brand-green/30 bg-brand-green/15"
				>
					<i class="fa-solid fa-lock text-brand-green"></i>
				</div>
				<div>
					<h2 class="text-xl font-bold text-white lg:text-2xl">
						{tx('auth.forgotPassword.newPassword.title')}
					</h2>
					<p class="mt-0.5 text-xs text-text-muted">
						{tx('auth.forgotPassword.newPassword.stepLabel')}
					</p>
				</div>
			</div>
			<p class="text-sm text-text-muted">{tx('auth.newPassword.form.description')}</p>

			<div class="flex flex-col gap-1.5">
				<label for="new-password" class="text-sm font-medium text-white"
					>{tx('auth.common.field.newPasswordLabel')}</label
				>
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
				<label for="confirm-password" class="text-sm font-medium text-white"
					>{tx('auth.common.field.confirmPasswordLabel')}</label
				>
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
						<i class="fa-solid fa-circle-check mr-1"></i>{tx(
							'auth.common.validation.passwordsMatch'
						)}
					</span>
				{/if}
			</div>

			<div class="rounded-xl border border-gray-800 bg-navy-main p-3.5 lg:p-4">
				<p class="mb-1.5 text-xs font-semibold tracking-wider text-text-muted uppercase lg:mb-2">
					{tx('auth.common.requirements.title')}
				</p>
				<div class="hidden flex-col gap-2 lg:flex">
					<div class={reqClass(hasLen)}>
						<i class="{reqIcon(hasLen)} w-4 flex-shrink-0 text-center"></i>{tx(
							'auth.common.requirements.min8'
						)}
					</div>
					<div class={reqClass(hasUpper)}>
						<i class="{reqIcon(hasUpper)} w-4 flex-shrink-0 text-center"></i>{tx(
							'auth.common.requirements.uppercaseFull'
						)}
					</div>
					<div class={reqClass(hasLower)}>
						<i class="{reqIcon(hasLower)} w-4 flex-shrink-0 text-center"></i>{tx(
							'auth.common.requirements.lowercase'
						)}
					</div>
					<div class={reqClass(hasNum)}>
						<i class="{reqIcon(hasNum)} w-4 flex-shrink-0 text-center"></i>{tx(
							'auth.common.requirements.numberFull'
						)}
					</div>
					<div class={reqClass(hasSpecial)}>
						<i class="{reqIcon(hasSpecial)} w-4 flex-shrink-0 text-center"></i>{tx(
							'auth.common.requirements.special'
						)}
					</div>
				</div>
				<div class="grid grid-cols-2 gap-1.5 lg:hidden">
					<div class={reqClass(hasLen)}>
						<i class="{reqIcon(hasLen)} w-3.5 flex-shrink-0 text-center"></i><span
							>{tx('auth.common.requirements.min8')}</span
						>
					</div>
					<div class={reqClass(hasUpper)}>
						<i class="{reqIcon(hasUpper)} w-3.5 flex-shrink-0 text-center"></i><span
							>{tx('auth.common.requirements.uppercase')}</span
						>
					</div>
					<div class={reqClass(hasLower)}>
						<i class="{reqIcon(hasLower)} w-3.5 flex-shrink-0 text-center"></i><span
							>{tx('auth.common.requirements.lowercase')}</span
						>
					</div>
					<div class={reqClass(hasNum)}>
						<i class="{reqIcon(hasNum)} w-3.5 flex-shrink-0 text-center"></i><span
							>{tx('auth.common.requirements.numberFull')}</span
						>
					</div>
					<div class="{reqClass(hasSpecial)} col-span-2">
						<i class="{reqIcon(hasSpecial)} w-3.5 flex-shrink-0 text-center"></i><span
							>{tx('auth.common.requirements.special')}</span
						>
					</div>
				</div>
			</div>

			{#if passwordApiError}
				<p class="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
					<i class="fa-solid fa-circle-exclamation mr-1.5"></i>{passwordApiError}
				</p>
			{/if}

			<button
				type="submit"
				disabled={passwordLoading}
				class="pulse-green mt-1 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-4 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-500 disabled:opacity-60 lg:min-h-0 lg:py-3.5"
			>
				{#if passwordLoading}
					<i class="fa-solid fa-spinner fa-spin"></i> {tx('auth.common.submit.saving')}
				{:else}
					<i class="fa-solid fa-check"></i> {tx('auth.common.submit.setNewPassword')}
				{/if}
			</button>

			<div class="text-center">
				<button
					type="button"
					onclick={() => {
						resetToken = '';
						step = 2;
					}}
					class="inline-block py-1 text-sm text-text-muted transition-colors hover:text-white"
				>
					<i class="fa-solid fa-arrow-left mr-1.5"></i>{tx('auth.common.nav.backToCode')}
				</button>
			</div>
		</form>
	{/if}

	<!-- Step 4: Success -->
	{#if step === 4}
		<div class="flex flex-col items-center gap-5 py-4 text-center lg:py-6">
			<div
				class="flex h-20 w-20 items-center justify-center rounded-full border-2 border-brand-green/40 bg-brand-green/15 lg:h-24 lg:w-24"
			>
				<i class="fa-solid fa-circle-check text-4xl text-brand-green lg:text-5xl"></i>
			</div>
			<div class="flex flex-col gap-2">
				<h2 class="text-2xl font-bold text-white">{tx('auth.common.success.passwordChanged')}</h2>
				<p class="mx-auto max-w-xs text-sm leading-relaxed text-text-muted">
					{tx('auth.common.success.passwordChangedDesc')}
				</p>
			</div>
			<div class="mt-2 flex w-full flex-col gap-3">
				<a
					href={resolve('/login' as Pathname)}
					class="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-4 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-500 lg:min-h-0 lg:py-3.5"
				>
					<i class="fa-solid fa-arrow-right-to-bracket"></i>
					{tx('auth.common.nav.login')}
				</a>
				<div
					class="flex items-center gap-2 rounded-xl border border-brand-green/20 bg-navy-main p-3 text-xs text-text-muted"
				>
					<i class="fa-solid fa-shield-halved flex-shrink-0 text-brand-green"></i>
					<span>{tx('auth.common.success.encrypted')}</span>
				</div>
			</div>
		</div>
	{/if}
</div>

{#if step === 3}
	<div
		class="mt-4 flex items-start gap-3 rounded-xl border border-brand-green/20 bg-brand-green/5 p-3.5 lg:hidden"
	>
		<i class="fa-solid fa-shield-halved mt-0.5 flex-shrink-0 text-sm text-brand-green"></i>
		<p class="text-xs text-text-muted">
			<span class="font-semibold text-white">{tx('auth.common.tip.prefix')} </span>{tx(
				'auth.newPassword.mobile.tip'
			)}
		</p>
	</div>
{/if}

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
</style>
