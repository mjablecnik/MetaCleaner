<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';

	let newPassword = $state('');
	let confirmPassword = $state('');
	let newPasswordVisible = $state(false);
	let confirmPasswordVisible = $state(false);
	let submitState = $state<'idle' | 'loading' | 'success'>('idle');
	let step = $state<3 | 4>(3);

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}

	const hasLen = $derived(newPassword.length >= 8);
	const hasUpper = $derived(/[A-Z]/.test(newPassword));
	const hasLower = $derived(/[a-z]/.test(newPassword));
	const hasNum = $derived(/[0-9]/.test(newPassword));
	const hasSpecial = $derived(/[!@#$%^&*(),.?":{}|<>]/.test(newPassword));

	const strengthScore = $derived(
		[hasLen, hasUpper, hasLower, hasNum, hasSpecial].filter(Boolean).length
	);

	type StrengthInfo = { label: string; labelColor: string; hint: string; hintColor: string };

	const strengthInfo = $derived((): StrengthInfo => {
		if (newPassword.length === 0) return { label: '', labelColor: '', hint: '', hintColor: '' };
		if (strengthScore <= 2)
			return {
				label: tx('auth.common.strength.weakPassword'),
				labelColor: 'text-brand-red',
				hint: tx('auth.common.strength.addMore'),
				hintColor: 'text-text-muted'
			};
		if (strengthScore === 3)
			return {
				label: tx('auth.common.strength.averagePassword'),
				labelColor: 'text-brand-orange',
				hint: tx('auth.common.strength.couldBeStronger'),
				hintColor: 'text-text-muted'
			};
		if (strengthScore === 4)
			return {
				label: tx('auth.common.strength.strongPassword'),
				labelColor: 'text-brand-green',
				hint: tx('auth.common.strength.almostPerfect'),
				hintColor: 'text-text-muted'
			};
		return {
			label: tx('auth.common.strength.veryStrongPassword'),
			labelColor: 'text-brand-green',
			hint: tx('auth.common.strength.excellent'),
			hintColor: 'text-brand-green'
		};
	});

	function barColor(barIndex: number): string {
		if (newPassword.length === 0 || strengthScore === 0) return '#1e293b';
		if (strengthScore <= 2) return barIndex === 1 ? '#ef4444' : '#1e293b';
		if (strengthScore === 3) return barIndex <= 2 ? '#f97316' : '#1e293b';
		if (strengthScore === 4) return barIndex <= 3 ? '#22c55e' : '#1e293b';
		return '#22c55e';
	}

	const passwordsMatch = $derived(
		confirmPassword.length > 0 && newPassword === confirmPassword
	);
	const passwordsMismatch = $derived(
		confirmPassword.length > 0 && newPassword !== confirmPassword
	);

	function confirmBorderColor(): string {
		if (passwordsMismatch) return '#ef4444';
		if (passwordsMatch) return '#22c55e';
		return '#1e293b';
	}

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (newPassword.length < 8) return;
		if (newPassword !== confirmPassword) return;
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

<div
	class="flex min-h-screen flex-col"
	style="background-image: radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(34,197,94,0.06) 0%, transparent 50%);"
>
	<!-- Navbar -->
	<nav class="mx-auto flex w-full max-w-[1100px] items-center justify-between px-4 py-4 lg:px-6 lg:py-6">
		<div class="flex items-center gap-2.5 lg:gap-3">
			<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue text-white shadow-glow-blue lg:h-10 lg:w-10">
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
	<main class="mx-auto flex w-full max-w-[1100px] flex-1 px-4 pb-8 lg:px-6 lg:pb-16">
		<div class="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2">

			<!-- Left: Branding (desktop only) -->
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

				<!-- Step info cards -->
				<div class="flex flex-col gap-3">
					<!-- Step 1: Done -->
					<div class="step-info-card done-card flex items-center gap-4 rounded-xl border border-gray-800 bg-navy-card p-4">
						<div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-green/15">
							<i class="fa-solid fa-check text-sm text-brand-green"></i>
						</div>
						<div>
							<p class="text-sm font-semibold text-white">{tx('auth.forgotPassword.step1.title')}</p>
							<p class="mt-0.5 text-xs text-text-muted">{tx('auth.newPassword.step1.doneDesc')}</p>
						</div>
						<div class="ml-auto">
							<i class="fa-solid fa-circle-check text-brand-green opacity-80"></i>
						</div>
					</div>
					<!-- Step 2: Done -->
					<div class="step-info-card done-card flex items-center gap-4 rounded-xl border border-gray-800 bg-navy-card p-4">
						<div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-green/15">
							<i class="fa-solid fa-check text-sm text-brand-green"></i>
						</div>
						<div>
							<p class="text-sm font-semibold text-white">{tx('auth.forgotPassword.step2.title')}</p>
							<p class="mt-0.5 text-xs text-text-muted">{tx('auth.newPassword.step2.doneDesc')}</p>
						</div>
						<div class="ml-auto">
							<i class="fa-solid fa-circle-check text-brand-green opacity-80"></i>
						</div>
					</div>
					<!-- Step 3: Active -->
					<div
						class="step-info-card flex items-center gap-4 rounded-xl border border-gray-800 bg-navy-card p-4"
						class:active-card={step === 3}
						class:done-card={step === 4}
					>
						<div
							class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold {step === 3 ? 'ring-2 ring-brand-blue/30' : ''}"
							style={step === 4 ? 'background: rgba(34,197,94,0.15);' : 'background: rgba(59,130,246,0.2); color: #3b82f6;'}
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

				<!-- Security tip -->
				<div class="flex items-start gap-3 rounded-xl border border-brand-green/20 bg-brand-green/5 p-4">
					<i class="fa-solid fa-shield-halved mt-0.5 flex-shrink-0 text-brand-green"></i>
					<div>
						<p class="text-sm font-semibold text-white">{tx('auth.newPassword.tip.title')}</p>
						<p class="mt-0.5 text-xs text-text-muted">
							{tx('auth.newPassword.tip.description')}
						</p>
					</div>
				</div>
			</div>

			<!-- Right: Form -->
			<div class="mx-auto w-full max-w-[480px] lg:mx-0 lg:ml-auto">

				<!-- Mobile page header (mobile only) -->
				<div class="mb-5 flex items-center gap-3 lg:hidden">
					<div class="floating-icon flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-brand-green/30 bg-brand-green/15">
						<i class="fa-solid fa-lock text-xl text-brand-green"></i>
					</div>
					<div>
						<h1 class="text-xl font-bold leading-tight text-white">
							{tx('auth.newPassword.mobile.headline')}
						</h1>
						<p class="mt-0.5 text-xs text-text-muted">{tx('auth.newPassword.mobile.subtitle')}</p>
					</div>
				</div>

				<!-- Progress Bar -->
				<div class="mb-5 flex items-center gap-2 lg:mb-6">
					<div class="flex flex-1 items-center gap-2">
						<div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-green text-xs font-bold text-white">
							<i class="fa-solid fa-check text-xs"></i>
						</div>
						<div class="flex-1 h-1 overflow-hidden rounded-full bg-navy-lighter">
							<div class="h-full w-full rounded-full bg-brand-green transition-all duration-500"></div>
						</div>
					</div>
					<div class="flex flex-1 items-center gap-2">
						<div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-green text-xs font-bold text-white">
							<i class="fa-solid fa-check text-xs"></i>
						</div>
						<div class="flex-1 h-1 overflow-hidden rounded-full bg-navy-lighter">
							<div class="h-full w-full rounded-full bg-brand-green transition-all duration-500"></div>
						</div>
					</div>
					<div
						class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white transition-all duration-300"
						style={step === 4 ? 'background: #22c55e;' : 'background: #3b82f6;'}
					>
						{#if step === 4}
							<i class="fa-solid fa-check text-xs"></i>
						{:else}
							3
						{/if}
					</div>
				</div>

				<!-- Form Card -->
				<div class="rounded-2xl border border-gray-800 bg-navy-card p-5 shadow-card lg:p-8">

					<!-- Step 3: New Password -->
					{#if step === 3}
						<form onsubmit={handleSubmit} class="flex flex-col gap-4 lg:gap-5">
							<!-- Header (desktop only) -->
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

							<!-- New Password -->
							<div class="flex flex-col gap-1.5">
								<label for="new-password" class="text-sm font-medium text-white">{tx('auth.common.field.newPasswordLabel')}</label>
								<div class="relative">
									<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-muted">
										<i class="fa-solid fa-lock"></i>
									</span>
									<input
										id="new-password"
										type={newPasswordVisible ? 'text' : 'password'}
										bind:value={newPassword}
										placeholder="••••••••"
										class="min-h-[44px] w-full rounded-xl border py-3.5 pl-10 pr-12 text-sm font-medium text-white transition-[border-color,box-shadow] placeholder:text-text-muted focus:outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] lg:min-h-0 lg:py-3"
										style="background:#0a1628; border-color:#1e293b;"
										onfocus={(ev) => ((ev.currentTarget as HTMLInputElement).style.borderColor = '#3b82f6')}
										onblur={(ev) => ((ev.currentTarget as HTMLInputElement).style.borderColor = '#1e293b')}
									/>
									<button
										type="button"
										onclick={() => { newPasswordVisible = !newPasswordVisible; }}
										aria-label={newPasswordVisible ? tx('auth.common.a11y.hidePassword') : tx('auth.common.a11y.showPassword')}
										class="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-sm text-text-muted transition-colors hover:text-white"
									>
										<i class={newPasswordVisible ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'}></i>
									</button>
								</div>

								<!-- 4-segment strength bar -->
								<div class="mt-1 flex flex-col gap-1">
									<div class="flex gap-1.5">
										{#each [1, 2, 3, 4] as barIdx}
											<div
												class="flex-1 h-1.5 rounded-full transition-all duration-300"
												style="background: {barColor(barIdx)};"
											></div>
										{/each}
									</div>
									{#if newPassword.length > 0}
										<div class="flex items-center justify-between">
											<p class="text-xs {strengthInfo().labelColor}">{strengthInfo().label}</p>
											<p class="text-xs {strengthInfo().hintColor}">{strengthInfo().hint}</p>
										</div>
									{/if}
								</div>
							</div>

							<!-- Confirm Password -->
							<div class="flex flex-col gap-1.5">
								<label for="confirm-password" class="text-sm font-medium text-white">{tx('auth.common.field.confirmPasswordLabel')}</label>
								<div class="relative">
									<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-muted">
										<i class="fa-solid fa-lock"></i>
									</span>
									<input
										id="confirm-password"
										type={confirmPasswordVisible ? 'text' : 'password'}
										bind:value={confirmPassword}
										placeholder="••••••••"
										class="min-h-[44px] w-full rounded-xl border py-3.5 pl-10 pr-12 text-sm font-medium text-white transition-[border-color,box-shadow] placeholder:text-text-muted focus:outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] lg:min-h-0 lg:py-3"
										style="background:#0a1628; border-color:{confirmBorderColor()};"
										onfocus={(ev) => ((ev.currentTarget as HTMLInputElement).style.borderColor = passwordsMismatch ? '#ef4444' : passwordsMatch ? '#22c55e' : '#3b82f6')}
										onblur={(ev) => ((ev.currentTarget as HTMLInputElement).style.borderColor = confirmBorderColor())}
									/>
									<button
										type="button"
										onclick={() => { confirmPasswordVisible = !confirmPasswordVisible; }}
										aria-label={confirmPasswordVisible ? tx('auth.common.a11y.hidePassword') : tx('auth.common.a11y.showPassword')}
										class="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-sm text-text-muted transition-colors hover:text-white"
									>
										<i class={confirmPasswordVisible ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'}></i>
									</button>
								</div>
								{#if passwordsMismatch}
									<span class="text-[12px] text-brand-red">
										<i class="fa-solid fa-circle-exclamation mr-1"></i>{tx('auth.common.validation.passwordsMismatch')}
									</span>
								{/if}
								{#if passwordsMatch}
									<span class="text-xs text-brand-green">
										<i class="fa-solid fa-circle-check mr-1"></i>{tx('auth.common.validation.passwordsMatch')}
									</span>
								{/if}
							</div>

							<!-- Requirements -->
							<div class="rounded-xl border border-gray-800 bg-navy-main p-3.5 lg:p-4">
								<p class="mb-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted lg:mb-2">
									{tx('auth.common.requirements.title')}
								</p>
								<!-- Desktop: vertical list -->
								<div class="hidden flex-col gap-2 lg:flex">
									<div class={reqClass(hasLen)}>
										<i class="{reqIcon(hasLen)} w-4 text-center flex-shrink-0"></i>{tx('auth.common.requirements.min8')}
									</div>
									<div class={reqClass(hasUpper)}>
										<i class="{reqIcon(hasUpper)} w-4 text-center flex-shrink-0"></i>{tx('auth.common.requirements.uppercaseFull')}
									</div>
									<div class={reqClass(hasLower)}>
										<i class="{reqIcon(hasLower)} w-4 text-center flex-shrink-0"></i>{tx('auth.common.requirements.lowercase')}
									</div>
									<div class={reqClass(hasNum)}>
										<i class="{reqIcon(hasNum)} w-4 text-center flex-shrink-0"></i>{tx('auth.common.requirements.numberFull')}
									</div>
									<div class={reqClass(hasSpecial)}>
										<i class="{reqIcon(hasSpecial)} w-4 text-center flex-shrink-0"></i>{tx('auth.common.requirements.special')}
									</div>
								</div>
								<!-- Mobile: 2-column grid -->
								<div class="grid grid-cols-2 gap-1.5 lg:hidden">
									<div class={reqClass(hasLen)}>
										<i class="{reqIcon(hasLen)} w-3.5 text-center flex-shrink-0"></i><span>{tx('auth.common.requirements.min8')}</span>
									</div>
									<div class={reqClass(hasUpper)}>
										<i class="{reqIcon(hasUpper)} w-3.5 text-center flex-shrink-0"></i><span>{tx('auth.common.requirements.uppercase')}</span>
									</div>
									<div class={reqClass(hasLower)}>
										<i class="{reqIcon(hasLower)} w-3.5 text-center flex-shrink-0"></i><span>{tx('auth.common.requirements.lowercase')}</span>
									</div>
									<div class={reqClass(hasNum)}>
										<i class="{reqIcon(hasNum)} w-3.5 text-center flex-shrink-0"></i><span>{tx('auth.common.requirements.numberFull')}</span>
									</div>
									<div class="{reqClass(hasSpecial)} col-span-2">
										<i class="{reqIcon(hasSpecial)} w-3.5 text-center flex-shrink-0"></i><span>{tx('auth.common.requirements.special')}</span>
									</div>
								</div>
							</div>

							<!-- Submit -->
							<button
								type="submit"
								disabled={submitState === 'loading'}
								class="pulse-green mt-1 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-500 lg:min-h-0 lg:py-3.5"
								style="background: #22c55e;"
							>
								{#if submitState === 'loading'}
									<i class="fa-solid fa-spinner fa-spin"></i> {tx('auth.common.submit.saving')}
								{:else}
									<i class="fa-solid fa-check"></i> {tx('auth.common.submit.setNewPassword')}
								{/if}
							</button>

							<!-- Back -->
							<div class="text-center">
								<a
									href="/check-code"
									class="inline-block py-1 text-sm text-text-muted transition-colors hover:text-white"
								>
									<i class="fa-solid fa-arrow-left mr-1.5"></i>{tx('auth.common.nav.backToCode')}
								</a>
							</div>
						</form>
					{/if}

					<!-- Step 4: Success -->
					{#if step === 4}
						<div class="flex flex-col items-center gap-5 py-4 text-center lg:py-6">
							<div class="flex h-20 w-20 items-center justify-center rounded-full border-2 border-brand-green/40 bg-brand-green/15 lg:h-24 lg:w-24">
								<i class="fa-solid fa-circle-check text-4xl text-brand-green lg:text-5xl"></i>
							</div>
							<div class="flex flex-col gap-2">
								<h2 class="text-2xl font-bold text-white">{tx('auth.common.success.passwordChanged')}</h2>
								<p class="max-w-xs mx-auto text-sm leading-relaxed text-text-muted">
									{tx('auth.common.success.passwordChangedDesc')}
								</p>
							</div>
							<div class="mt-2 flex w-full flex-col gap-3">
								<a
									href="/login"
									class="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-500 lg:min-h-0 lg:py-3.5"
									style="background: #22c55e;"
								>
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

				<!-- Mobile: Security tip (shown when on step 3) -->
				{#if step === 3}
					<div class="mt-4 flex items-start gap-3 rounded-xl border border-brand-green/20 bg-brand-green/5 p-3.5 lg:hidden">
						<i class="fa-solid fa-shield-halved mt-0.5 flex-shrink-0 text-sm text-brand-green"></i>
						<p class="text-xs text-text-muted">
							<span class="font-semibold text-white">{tx('auth.common.tip.prefix')} </span>{tx('auth.newPassword.mobile.tip')}
						</p>
					</div>
				{/if}

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
		border-color: rgba(34, 197, 94, 0.3) !important;
		background: rgba(34, 197, 94, 0.04) !important;
	}

	.step-info-card.active-card {
		border-color: rgba(59, 130, 246, 0.4) !important;
		background: rgba(59, 130, 246, 0.05) !important;
	}

	@keyframes pulseGreen {
		0%,
		100% {
			box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.3);
		}
		50% {
			box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
		}
	}

	.pulse-green {
		animation: pulseGreen 1.5s ease-in-out infinite;
	}
</style>
