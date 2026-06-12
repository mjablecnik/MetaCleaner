<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { goto } from '$app/navigation';
	import { getAuthPlans } from '$lib/repositories/authRepository';
	import AuthTextInput from '$lib/shared/elements/AuthTextInput.svelte';
	import PasswordInput from '../../components/PasswordInput.svelte';
	import PasswordStrengthMeter from '../../components/PasswordStrengthMeter.svelte';
	import SocialLoginButtons from '../../components/SocialLoginButtons.svelte';

	interface Props {
		selectedPlan?: 'free' | 'pro';
	}

	let { selectedPlan = $bindable('free') }: Props = $props();

	const plans = getAuthPlans();

	function planColors(color: 'green' | 'orange') {
		return color === 'green'
			? { hex: 'var(--color-brand-green)', bg: 'var(--color-brand-green-6)', bg15: 'var(--color-brand-green-15)' }
			: { hex: 'var(--color-brand-orange)', bg: 'var(--color-brand-orange-6)', bg15: 'var(--color-brand-orange-15)' };
	}

	let firstName = $state('');
	let lastName = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let passwordVisible = $state(false);
	let termsAccepted = $state(false);
	let planOpen = $state(true);

	let firstNameError = $state('');
	let lastNameError = $state('');
	let emailError = $state('');
	let passwordError = $state('');
	let confirmError = $state('');
	let termsError = $state('');
	let submitState = $state<'idle' | 'loading' | 'success'>('idle');

	function getStrengthScore(val: string) {
		let score = 0;
		if (val.length >= 8) score++;
		if (/[A-Z]/.test(val)) score++;
		if (/[0-9]/.test(val)) score++;
		if (/[^A-Za-z0-9]/.test(val)) score++;
		return score;
	}

	const strengthScore = $derived(password.length > 0 ? getStrengthScore(password) : 0);

	function validateEmail(v: string) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
	}

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		firstNameError = '';
		lastNameError = '';
		emailError = '';
		passwordError = '';
		confirmError = '';
		termsError = '';

		let valid = true;
		if (!firstName.trim()) { firstNameError = tx('auth.register.validation.firstNameRequired'); valid = false; }
		if (!lastName.trim()) { lastNameError = tx('auth.register.validation.lastNameRequired'); valid = false; }
		if (!validateEmail(email)) { emailError = tx('auth.common.validation.emailInvalid'); valid = false; }
		if (password.length < 8) { passwordError = tx('auth.common.validation.passwordMin8'); valid = false; }
		if (password !== confirmPassword) { confirmError = tx('auth.common.validation.passwordsMismatch'); valid = false; }
		if (!termsAccepted) { termsError = tx('auth.register.validation.termsRequired'); valid = false; }
		if (!valid) return;

		submitState = 'loading';
		setTimeout(() => {
			submitState = 'success';
			goto('/check-email');
		}, 1500);
	}
</script>

<SocialLoginButtons
	googleLabel={tx('auth.register.social.google')}
	appleLabel={tx('auth.register.social.apple')}
/>

<div class="flex items-center gap-3">
	<div class="h-px flex-1 bg-navy-lighter"></div>
	<span class="whitespace-nowrap text-xs font-medium text-text-muted">{tx('auth.common.divider.orEmail')}</span>
	<div class="h-px flex-1 bg-navy-lighter"></div>
</div>

<form onsubmit={handleSubmit} class="flex flex-col gap-3.5 lg:gap-4">
	<div class="grid grid-cols-2 gap-2.5 lg:gap-3">
		<div class="flex flex-col gap-1 lg:gap-1.5">
			<label for="fname-input" class="text-xs font-medium text-white lg:text-sm">{tx('auth.register.field.firstName')}</label>
			<AuthTextInput
				id="fname-input"
				type="text"
				bind:value={firstName}
				placeholder={tx('auth.register.field.firstNamePlaceholder')}
				icon="fa-regular fa-user"
				error={firstNameError}
			/>
		</div>
		<div class="flex flex-col gap-1 lg:gap-1.5">
			<label for="lname-input" class="text-xs font-medium text-white lg:text-sm">{tx('auth.register.field.lastName')}</label>
			<AuthTextInput
				id="lname-input"
				type="text"
				bind:value={lastName}
				placeholder={tx('auth.register.field.lastNamePlaceholder')}
				error={lastNameError}
			/>
		</div>
	</div>

	<div class="flex flex-col gap-1 lg:gap-1.5">
		<label for="email-input" class="text-xs font-medium text-white lg:text-sm">{tx('auth.common.field.emailLabel')}</label>
		<AuthTextInput
			id="email-input"
			type="email"
			bind:value={email}
			placeholder={tx('auth.common.field.emailPlaceholder')}
			icon="fa-regular fa-envelope"
			error={emailError}
		/>
	</div>

	<div class="flex flex-col gap-1 lg:gap-1.5">
		<label for="password-input" class="text-xs font-medium text-white lg:text-sm">{tx('auth.common.field.passwordLabel')}</label>
		<PasswordInput
			id="password-input"
			bind:value={password}
			placeholder={tx('auth.register.field.passwordPlaceholder')}
			error={passwordError}
			visible={passwordVisible}
			onToggle={() => (passwordVisible = !passwordVisible)}
			ariaShowLabel={tx('auth.common.a11y.showPassword')}
			ariaHideLabel={tx('auth.common.a11y.hidePassword')}
		/>
		<PasswordStrengthMeter score={strengthScore} />
	</div>

	<div class="flex flex-col gap-1 lg:gap-1.5">
		<label for="confirm-input" class="text-xs font-medium text-white lg:text-sm">{tx('auth.common.field.confirmPasswordLabel')}</label>
		<AuthTextInput
			id="confirm-input"
			type="password"
			bind:value={confirmPassword}
			placeholder={tx('auth.register.field.confirmPlaceholder')}
			icon="fa-solid fa-lock"
			error={confirmError}
		/>
	</div>

	<div class="flex flex-col gap-2 lg:hidden">
		<button
			type="button"
			onclick={() => (planOpen = !planOpen)}
			class="flex w-full items-center justify-between py-2"
		>
			<span class="text-xs font-semibold text-white">{tx('auth.register.plan.titleMobile')}</span>
			<i class="fa-solid fa-chevron-down text-xs text-text-muted transition-transform" style="transform: {planOpen ? 'rotate(0deg)' : 'rotate(-90deg)'};"></i>
		</button>
		{#if planOpen}
			<div class="flex flex-col gap-2">
				{#each plans as plan}
					{@const c = planColors(plan.color)}
					{@const isSelected = selectedPlan === plan.id}
					<button
						type="button"
						onclick={() => (selectedPlan = plan.id)}
						class="flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-all"
						style="border-color: {isSelected ? c.hex : 'var(--color-navy-lighter)'}; background: {isSelected ? c.bg : 'transparent'};"
					>
						<div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg" style="background: {c.bg15};">
							<i class="{plan.icon} text-sm" style="color: {c.hex};"></i>
						</div>
						<div class="min-w-0 flex-1 text-left">
							<div class="flex items-center gap-1.5">
								<p class="text-sm font-bold text-white">{tx(plan.nameKey)}</p>
								<span class="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase" style="background: {c.bg15}; color: {c.hex};">{tx(plan.badgeKey)}</span>
							</div>
							<p class="mt-0.5 text-[11px] text-text-muted">{tx(plan.descriptionKey)}</p>
						</div>
						<div class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full" style="background: {isSelected ? c.hex : 'transparent'}; border: {isSelected ? 'none' : '1px solid var(--color-gray-600)'};">
							{#if isSelected}<i class="fa-solid fa-check text-[9px] text-white"></i>{/if}
						</div>
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<div class="flex items-start gap-2.5">
		<button
			type="button"
			onclick={() => { termsAccepted = !termsAccepted; if (termsAccepted) termsError = ''; }}
			class="mt-0.5 flex h-6 w-6 min-w-[24px] flex-shrink-0 items-center justify-center rounded border transition-all lg:h-5 lg:w-5 lg:min-w-[20px] {termsAccepted
				? 'bg-brand-blue border-brand-blue'
				: 'bg-navy-main border-gray-600'}"
		>
			{#if termsAccepted}<i class="fa-solid fa-check text-[9px] text-white lg:text-[10px]"></i>{/if}
		</button>
		<span class="text-xs leading-relaxed text-text-muted lg:text-sm">
			{tx('auth.register.terms.agree')} <a href="#" class="font-medium text-brand-blue transition-colors hover:text-blue-400">{tx('auth.register.terms.tos')}</a>
			{tx('auth.register.terms.and')} <a href="#" class="font-medium text-brand-blue transition-colors hover:text-blue-400">{tx('auth.register.terms.privacy')}</a>
		</span>
	</div>
	{#if termsError}
		<span class="-mt-2 text-[12px] text-brand-red"><i class="fa-solid fa-circle-exclamation mr-1"></i>{termsError}</span>
	{/if}

	<button
		type="submit"
		disabled={submitState === 'loading' || submitState === 'success'}
		class="mt-1 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold text-white shadow-glow-green transition-all lg:min-h-0 lg:py-3.5 {submitState === 'success'
			? 'bg-brand-green-dark'
			: 'bg-brand-green'}"
	>
		{#if submitState === 'loading'}
			<i class="fa-solid fa-spinner fa-spin"></i> {tx('auth.register.submit.loading')}
		{:else if submitState === 'success'}
			<i class="fa-solid fa-circle-check"></i> {tx('auth.register.submit.success')}
		{:else}
			<i class="fa-solid fa-user-plus"></i> {tx('auth.register.submit.idle')}
		{/if}
	</button>
</form>

<div class="border-t border-gray-800 pt-1 text-center">
	<p class="text-xs text-text-muted lg:text-sm">
		{tx('auth.register.footer.hasAccount')}
		<a href="/login" class="font-semibold text-brand-blue transition-colors hover:text-blue-400">{tx('auth.register.footer.login')}</a>
	</p>
</div>
