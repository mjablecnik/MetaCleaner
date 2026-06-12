<script lang="ts">
	import { goto } from '$app/navigation';
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import AuthTextInput from '$lib/shared/elements/AuthTextInput.svelte';

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}

	let email = $state('');
	let emailError = $state('');

	function validateEmail(v: string) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
	}

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		emailError = '';
		if (!validateEmail(email)) {
			emailError = tx('auth.common.validation.emailInvalid');
			return;
		}
		goto('/check-code');
	}
</script>

<div class="rounded-2xl border border-gray-800 bg-navy-card p-6 shadow-card lg:p-8">
	<form onsubmit={handleSubmit} class="flex flex-col gap-3.5 lg:gap-4">
		<!-- Mobile header -->
		<div class="mb-1 flex items-center gap-3 lg:hidden">
			<div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-brand-blue/30 bg-brand-blue/15 floating-icon">
				<i class="fa-solid fa-key text-xl text-brand-blue"></i>
			</div>
			<div>
				<h2 class="text-xl font-bold leading-tight text-white">{tx('auth.forgotPassword.form.title')}</h2>
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
			bind:value={email}
			placeholder={tx('auth.common.field.emailPlaceholder')}
			icon="fa-regular fa-envelope"
			error={emailError}
		/>

		<button type="submit" class="mt-1 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-4 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-500 lg:min-h-0 lg:py-3.5">
			<i class="fa-solid fa-paper-plane"></i> {tx('auth.forgotPassword.submit.sendCode')}
		</button>

		<!-- Mobile steps preview -->
		<div class="mt-1 flex flex-col gap-2 lg:hidden">
			{#each [
				{ num: '1', colorClass: 'bg-brand-blue/15 text-brand-blue', titleKey: 'auth.forgotPassword.step1.title', descKey: 'auth.forgotPassword.mobile.step1Desc', icon: 'fa-solid fa-envelope text-brand-blue' },
				{ num: '2', colorClass: 'bg-brand-orange/15 text-brand-orange', titleKey: 'auth.forgotPassword.step2.title', descKey: 'auth.forgotPassword.mobile.step2Desc', icon: 'fa-solid fa-shield-halved text-brand-orange' },
				{ num: '3', colorClass: 'bg-brand-green/15 text-brand-green', titleKey: 'auth.forgotPassword.mobile.step3Title', descKey: 'auth.forgotPassword.mobile.step3Desc', icon: 'fa-solid fa-lock text-brand-green' }
			] as step}
				<div class="flex items-center gap-3 rounded-xl border border-gray-800 bg-navy-main p-3">
					<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold {step.colorClass}">{step.num}</div>
					<div class="flex-1">
						<p class="text-xs font-semibold text-white">{tx(step.titleKey)}</p>
						<p class="text-[11px] text-text-muted">{tx(step.descKey)}</p>
					</div>
					<i class="{step.icon} text-xs opacity-50"></i>
				</div>
			{/each}
		</div>

		<div class="mt-1 text-center">
			<a href="/login" class="text-sm text-text-muted transition-colors hover:text-white">
				<i class="fa-solid fa-arrow-left mr-1.5"></i>{tx('auth.common.nav.backToLogin')}
			</a>
		</div>
	</form>
</div>

<style>
	@keyframes float {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-8px); }
	}
	.floating-icon { animation: float 3s ease-in-out infinite; }
</style>
