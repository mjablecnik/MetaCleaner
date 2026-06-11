<script lang="ts">
	import { goto } from '$app/navigation';
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import { getAuthStats, getAuthPlans } from '$lib/repositories/authRepository';

	const stats = getAuthStats();
	const plans = getAuthPlans();

	function planColors(color: 'green' | 'orange') {
		return color === 'green'
			? { hex: '#22c55e', bg: 'rgba(34,197,94,0.06)', bg15: 'rgba(34,197,94,0.15)' }
			: { hex: '#f97316', bg: 'rgba(249,115,22,0.06)', bg15: 'rgba(249,115,22,0.15)' };
	}

	let firstName = $state('');
	let lastName = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let passwordVisible = $state(false);
	let termsAccepted = $state(false);
	let selectedPlan = $state<'free' | 'pro'>('free');
	let planOpen = $state(true);

	let firstNameError = $state('');
	let lastNameError = $state('');
	let emailError = $state('');
	let passwordError = $state('');
	let confirmError = $state('');
	let termsError = $state('');
	let submitState = $state<'idle' | 'loading' | 'success'>('idle');

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}

	function getStrengthScore(val: string) {
		let score = 0;
		if (val.length >= 8) score++;
		if (/[A-Z]/.test(val)) score++;
		if (/[0-9]/.test(val)) score++;
		if (/[^A-Za-z0-9]/.test(val)) score++;
		return score;
	}

	const strengthColors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
	const strengthKeys = [
		'auth.common.strength.veryWeak',
		'auth.common.strength.weak',
		'auth.common.strength.good',
		'auth.common.strength.strong'
	];

	let strengthScore = $derived(password.length > 0 ? getStrengthScore(password) : 0);
	let strengthColor = $derived(strengthScore > 0 ? strengthColors[strengthScore - 1] : '#374151');
	let strengthLabel = $derived(strengthScore > 0 ? tx(strengthKeys[strengthScore - 1]) : '');

	function togglePassword() {
		passwordVisible = !passwordVisible;
	}

	function toggleTerms() {
		termsAccepted = !termsAccepted;
		if (termsAccepted) termsError = '';
	}

	function selectPlan(plan: 'free' | 'pro') {
		selectedPlan = plan;
	}

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
		if (!firstName.trim()) {
			firstNameError = tx('auth.register.validation.firstNameRequired');
			valid = false;
		}
		if (!lastName.trim()) {
			lastNameError = tx('auth.register.validation.lastNameRequired');
			valid = false;
		}
		if (!validateEmail(email)) {
			emailError = tx('auth.common.validation.emailInvalid');
			valid = false;
		}
		if (password.length < 8) {
			passwordError = tx('auth.common.validation.passwordMin8');
			valid = false;
		}
		if (password !== confirmPassword) {
			confirmError = tx('auth.common.validation.passwordsMismatch');
			valid = false;
		}
		if (!termsAccepted) {
			termsError = tx('auth.register.validation.termsRequired');
			valid = false;
		}
		if (!valid) return;

		submitState = 'loading';
		setTimeout(() => {
			submitState = 'success';
			goto('/check-email');
		}, 1500);
	}
</script>

<svelte:head>
	<title>{tx('auth.register.meta.title')}</title>
</svelte:head>

<div
	class="flex min-h-screen flex-col"
	style="background-image: radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(34,197,94,0.06) 0%, transparent 50%);"
>
	<!-- Navbar -->
	<nav class="mx-auto flex w-full max-w-[1100px] items-center justify-between px-4 py-4 lg:px-6 lg:py-6">
		<div class="flex items-center gap-2 lg:gap-3">
			<div
				class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue text-white shadow-glow-blue lg:h-10 lg:w-10"
			>
				<i class="fa-solid fa-shield-halved text-base lg:text-xl"></i>
			</div>
			<span class="text-lg font-bold tracking-tight lg:text-xl">{tx('common.brandName')}</span>
		</div>
		<div class="flex items-center gap-2">
			<span class="text-xs text-text-muted lg:text-sm">{tx('auth.register.nav.hasAccount')}</span>
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
		class="mx-auto flex w-full max-w-[1100px] flex-1 items-start justify-center px-4 pb-10 lg:px-6 lg:pb-16 lg:items-center"
	>
		<div class="grid w-full grid-cols-1 items-start gap-12 lg:grid-cols-2">

			<!-- Left: Branding (desktop only) -->
			<div class="hidden flex-col gap-8 pt-2 lg:flex">
				<div class="flex flex-col gap-4">
					<div
						class="inline-flex w-fit items-center gap-2 rounded-full border border-brand-green/20 bg-brand-green/10 px-3 py-1.5"
					>
						<i class="fa-solid fa-circle-check text-xs text-brand-green"></i>
						<span class="text-xs font-semibold text-brand-green">{tx('auth.register.badge.freeForever')}</span>
					</div>
					<h1 class="text-4xl font-black leading-tight text-white">
						{tx('auth.register.branding.headline')}<br />své <span class="text-brand-green">{tx('auth.register.branding.headlineHighlight')}</span> dnes
					</h1>
					<p class="max-w-md text-base leading-relaxed text-text-muted">
						{tx('auth.register.branding.description')}
					</p>
				</div>

				<!-- Plan Selector -->
				<div class="flex flex-col gap-3">
					<p class="text-sm font-semibold text-white">{tx('auth.register.plan.title')}</p>
					{#each plans as plan}
						{@const c = planColors(plan.color)}
						{@const isSelected = selectedPlan === plan.id}
						<button
							type="button"
							onclick={() => selectPlan(plan.id)}
							class="flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all"
							style="border-color: {isSelected ? c.hex : '#1e293b'}; background: {isSelected ? c.bg : 'transparent'};"
						>
							<div
								class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
								style="background: {c.bg15};"
							>
								<i class="{plan.icon}" style="color: {c.hex};"></i>
							</div>
							<div class="flex-1 text-left">
								<div class="flex items-center gap-2">
									<p class="text-sm font-bold text-white">{tx(plan.nameKey)}</p>
									<span
										class="rounded px-2 py-0.5 text-[10px] font-bold uppercase"
										style="background: {c.bg15}; color: {c.hex};"
										>{tx(plan.badgeKey)}</span
									>
								</div>
								<p class="mt-0.5 text-xs text-text-muted">{tx(plan.descriptionKey)}</p>
							</div>
							<div
								class="flex h-5 w-5 items-center justify-center rounded-full"
								style="background: {isSelected ? c.hex : 'transparent'}; border: {isSelected ? 'none' : '1px solid #4b5563'};"
							>
								{#if isSelected}
									<i class="fa-solid fa-check text-[10px] text-white"></i>
								{/if}
							</div>
						</button>
					{/each}
				</div>

				<!-- Benefits -->
				<div class="flex flex-col gap-2.5">
					<div class="flex items-center gap-3">
						<i class="fa-solid fa-circle-check flex-shrink-0 text-sm text-brand-green"></i>
						<span class="text-sm text-text-muted">{tx('auth.register.benefit.noCard')}</span>
					</div>
					<div class="flex items-center gap-3">
						<i class="fa-solid fa-circle-check flex-shrink-0 text-sm text-brand-green"></i>
						<span class="text-sm text-text-muted">{tx('auth.register.benefit.gdpr')}</span>
					</div>
					<div class="flex items-center gap-3">
						<i class="fa-solid fa-circle-check flex-shrink-0 text-sm text-brand-green"></i>
						<span class="text-sm text-text-muted">{tx('auth.register.benefit.e2e')}</span>
					</div>
					<div class="flex items-center gap-3">
						<i class="fa-solid fa-circle-check flex-shrink-0 text-sm text-brand-green"></i>
						<span class="text-sm text-text-muted">{tx('auth.register.benefit.cancel')}</span>
					</div>
				</div>

				<!-- Stats -->
				<div class="grid grid-cols-3 gap-4 border-t border-gray-800 pt-2">
					<div class="text-center">
						<p class="text-2xl font-black text-white">{stats[0].value}</p>
						<p class="mt-1 text-xs text-text-muted">{tx(stats[0].labelKey)}</p>
					</div>
					<div class="border-x border-gray-800 text-center">
						<p class="text-2xl font-black text-brand-green">{stats[1].value}</p>
						<p class="mt-1 text-xs text-text-muted">{tx(stats[1].labelKey)}</p>
					</div>
					<div class="text-center">
						<p class="text-2xl font-black text-brand-blue">{stats[2].value}</p>
						<p class="mt-1 text-xs text-text-muted">{tx(stats[2].labelKey)}</p>
					</div>
				</div>
			</div>

			<!-- Right: Form Area -->
			<div class="mx-auto w-full max-w-[480px] lg:mx-0 lg:ml-auto">

				<!-- Mobile Hero (hidden on desktop) -->
				<div class="flex flex-col items-center gap-2 pb-5 pt-4 text-center lg:hidden">
					<div
						class="inline-flex items-center gap-1.5 rounded-full border border-brand-green/20 bg-brand-green/10 px-3 py-1"
					>
						<i class="fa-solid fa-circle-check text-[10px] text-brand-green"></i>
						<span class="text-[10px] font-semibold text-brand-green"
							>{tx('auth.register.badge.freeForever')}</span
						>
					</div>
					<h1 class="text-2xl font-black leading-tight text-white">
						{tx('auth.login.branding.headline')} <span class="text-brand-green">{tx('auth.login.branding.headlineHighlight')}</span>
					</h1>
					<p class="max-w-xs text-xs leading-relaxed text-text-muted">
						{tx('auth.register.mobile.description')}
					</p>
				</div>

				<!-- Form Card -->
				<div
					class="flex flex-col gap-4 rounded-2xl border border-gray-800 bg-navy-card p-5 shadow-card lg:gap-5 lg:p-8"
				>
					<!-- Header -->
					<div class="flex flex-col gap-0.5 lg:gap-1">
						<h2 class="text-xl font-bold text-white lg:text-2xl">{tx('auth.register.form.title')}</h2>
						<p class="text-xs text-text-muted lg:text-sm">
							{tx('auth.register.form.subtitle')}
						</p>
					</div>

					<!-- Social -->
					<div class="flex flex-col gap-2.5 lg:gap-3">
						<button
							class="flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-xl border border-[#374151] bg-navy-lighter py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:border-[#4b5563] hover:bg-[#263347] lg:min-h-0 lg:py-3"
						>
							<svg width="16" height="16" viewBox="0 0 18 18" fill="none">
								<path
									d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
									fill="#4285F4"
								/>
								<path
									d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
									fill="#34A853"
								/>
								<path
									d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
									fill="#FBBC05"
								/>
								<path
									d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"
									fill="#EA4335"
								/>
							</svg>
							{tx('auth.register.social.google')}
						</button>
						<button
							class="flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-xl border border-[#374151] bg-navy-lighter py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:border-[#4b5563] hover:bg-[#263347] lg:min-h-0 lg:py-3"
						>
							<i class="fa-brands fa-apple text-base lg:text-lg"></i>
							{tx('auth.register.social.apple')}
						</button>
					</div>

					<!-- Divider -->
					<div class="flex items-center gap-3">
						<div class="h-px flex-1 bg-navy-lighter"></div>
						<span class="whitespace-nowrap text-xs font-medium text-text-muted">{tx('auth.common.divider.orEmail')}</span>
						<div class="h-px flex-1 bg-navy-lighter"></div>
					</div>

					<!-- Form -->
					<form onsubmit={handleSubmit} class="flex flex-col gap-3.5 lg:gap-4">
						<!-- Name row -->
						<div class="grid grid-cols-2 gap-2.5 lg:gap-3">
							<div class="flex flex-col gap-1 lg:gap-1.5">
								<label for="fname-input" class="text-xs font-medium text-white lg:text-sm"
									>{tx('auth.register.field.firstName')}</label
								>
								<div class="relative">
									<span
										class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-muted lg:left-3.5 lg:text-sm"
									>
										<i class="fa-regular fa-user"></i>
									</span>
									<input
										id="fname-input"
										type="text"
										bind:value={firstName}
										placeholder={tx('auth.register.field.firstNamePlaceholder')}
										class="min-h-[44px] w-full rounded-xl border py-3 pl-9 pr-3 text-sm font-medium text-white transition-[border-color,box-shadow] placeholder:text-text-muted focus:outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] lg:pl-10 lg:pr-4"
										style="background:#0a1628; border-color: {firstNameError ? '#ef4444' : '#1e293b'};"
										onfocus={(e) =>
											((e.currentTarget as HTMLInputElement).style.borderColor = firstNameError
												? '#ef4444'
												: '#3b82f6')}
										onblur={(e) =>
											((e.currentTarget as HTMLInputElement).style.borderColor = firstNameError
												? '#ef4444'
												: '#1e293b')}
									/>
								</div>
								{#if firstNameError}
									<span class="text-[12px] text-brand-red">
										<i class="fa-solid fa-circle-exclamation mr-1"></i>{firstNameError}
									</span>
								{/if}
							</div>
							<div class="flex flex-col gap-1 lg:gap-1.5">
								<label for="lname-input" class="text-xs font-medium text-white lg:text-sm"
									>{tx('auth.register.field.lastName')}</label
								>
								<div class="relative">
									<input
										id="lname-input"
										type="text"
										bind:value={lastName}
										placeholder={tx('auth.register.field.lastNamePlaceholder')}
										class="min-h-[44px] w-full rounded-xl border px-3 py-3 text-sm font-medium text-white transition-[border-color,box-shadow] placeholder:text-text-muted focus:outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] lg:px-4"
										style="background:#0a1628; border-color: {lastNameError ? '#ef4444' : '#1e293b'};"
										onfocus={(e) =>
											((e.currentTarget as HTMLInputElement).style.borderColor = lastNameError
												? '#ef4444'
												: '#3b82f6')}
										onblur={(e) =>
											((e.currentTarget as HTMLInputElement).style.borderColor = lastNameError
												? '#ef4444'
												: '#1e293b')}
									/>
								</div>
								{#if lastNameError}
									<span class="text-[12px] text-brand-red">
										<i class="fa-solid fa-circle-exclamation mr-1"></i>{lastNameError}
									</span>
								{/if}
							</div>
						</div>

						<!-- Email -->
						<div class="flex flex-col gap-1 lg:gap-1.5">
							<label for="email-input" class="text-xs font-medium text-white lg:text-sm"
								>{tx('auth.common.field.emailLabel')}</label
							>
							<div class="relative">
								<span
									class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-muted lg:left-3.5 lg:text-sm"
								>
									<i class="fa-regular fa-envelope"></i>
								</span>
								<input
									id="email-input"
									type="email"
									bind:value={email}
									placeholder={tx('auth.common.field.emailPlaceholder')}
									class="min-h-[44px] w-full rounded-xl border py-3 pl-9 pr-3 text-sm font-medium text-white transition-[border-color,box-shadow] placeholder:text-text-muted focus:outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] lg:pl-10 lg:pr-4"
									style="background:#0a1628; border-color: {emailError ? '#ef4444' : '#1e293b'};"
									onfocus={(e) =>
										((e.currentTarget as HTMLInputElement).style.borderColor = emailError
											? '#ef4444'
											: '#3b82f6')}
									onblur={(e) =>
										((e.currentTarget as HTMLInputElement).style.borderColor = emailError
											? '#ef4444'
											: '#1e293b')}
								/>
							</div>
							{#if emailError}
								<span class="text-[12px] text-brand-red">
									<i class="fa-solid fa-circle-exclamation mr-1"></i>{emailError}
								</span>
							{/if}
						</div>

						<!-- Password -->
						<div class="flex flex-col gap-1 lg:gap-1.5">
							<label for="password-input" class="text-xs font-medium text-white lg:text-sm"
								>{tx('auth.common.field.passwordLabel')}</label
							>
							<div class="relative">
								<span
									class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-muted lg:left-3.5 lg:text-sm"
								>
									<i class="fa-solid fa-lock"></i>
								</span>
								<input
									id="password-input"
									type={passwordVisible ? 'text' : 'password'}
									bind:value={password}
									placeholder={tx('auth.register.field.passwordPlaceholder')}
									class="min-h-[44px] w-full rounded-xl border py-3 pl-9 pr-11 text-sm font-medium text-white transition-[border-color,box-shadow] placeholder:text-text-muted focus:outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] lg:pl-10"
									style="background:#0a1628; border-color: {passwordError ? '#ef4444' : '#1e293b'};"
									onfocus={(e) =>
										((e.currentTarget as HTMLInputElement).style.borderColor = passwordError
											? '#ef4444'
											: '#3b82f6')}
									onblur={(e) =>
										((e.currentTarget as HTMLInputElement).style.borderColor = passwordError
											? '#ef4444'
											: '#1e293b')}
								/>
								<button
									type="button"
									onclick={togglePassword}
									aria-label={passwordVisible ? tx('auth.common.a11y.hidePassword') : tx('auth.common.a11y.showPassword')}
									class="absolute right-3 top-1/2 flex min-h-[24px] min-w-[24px] -translate-y-1/2 items-center justify-center text-sm text-text-muted transition-colors hover:text-white lg:right-3.5"
								>
									<i class={passwordVisible ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'}
									></i>
								</button>
							</div>
							{#if password.length > 0}
								<div class="mt-1 flex flex-col gap-1 lg:gap-1.5">
									<div class="flex gap-1 lg:gap-1.5">
										{#each [1, 2, 3, 4] as bar}
											<div
												class="h-1 flex-1 rounded-sm transition-all duration-300"
												style="background: {bar <= strengthScore ? strengthColor : '#374151'};"
											></div>
										{/each}
									</div>
									{#if strengthLabel}
										<p class="text-[11px] lg:text-xs" style="color: {strengthColor};">
											{strengthLabel}
										</p>
									{/if}
								</div>
							{/if}
							{#if passwordError}
								<span class="text-[12px] text-brand-red">
									<i class="fa-solid fa-circle-exclamation mr-1"></i>{passwordError}
								</span>
							{/if}
						</div>

						<!-- Confirm Password -->
						<div class="flex flex-col gap-1 lg:gap-1.5">
							<label for="confirm-input" class="text-xs font-medium text-white lg:text-sm"
								>{tx('auth.common.field.confirmPasswordLabel')}</label
							>
							<div class="relative">
								<span
									class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-muted lg:left-3.5 lg:text-sm"
								>
									<i class="fa-solid fa-lock"></i>
								</span>
								<input
									id="confirm-input"
									type="password"
									bind:value={confirmPassword}
									placeholder={tx('auth.register.field.confirmPlaceholder')}
									class="min-h-[44px] w-full rounded-xl border py-3 pl-9 pr-3 text-sm font-medium text-white transition-[border-color,box-shadow] placeholder:text-text-muted focus:outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] lg:pl-10 lg:pr-4"
									style="background:#0a1628; border-color: {confirmError ? '#ef4444' : '#1e293b'};"
									onfocus={(e) =>
										((e.currentTarget as HTMLInputElement).style.borderColor = confirmError
											? '#ef4444'
											: '#3b82f6')}
									onblur={(e) =>
										((e.currentTarget as HTMLInputElement).style.borderColor = confirmError
											? '#ef4444'
											: '#1e293b')}
								/>
							</div>
							{#if confirmError}
								<span class="text-[12px] text-brand-red">
									<i class="fa-solid fa-circle-exclamation mr-1"></i>{confirmError}
								</span>
							{/if}
						</div>

						<!-- Plan selector (mobile collapsible) -->
						<div class="flex flex-col gap-2 lg:hidden">
							<button
								type="button"
								onclick={() => (planOpen = !planOpen)}
								class="flex w-full items-center justify-between py-2"
							>
								<span class="text-xs font-semibold text-white">{tx('auth.register.plan.titleMobile')}</span>
								<i
									class="fa-solid fa-chevron-down text-xs text-text-muted transition-transform"
									style="transform: {planOpen ? 'rotate(0deg)' : 'rotate(-90deg)'};"
								></i>
							</button>
							{#if planOpen}
								<div class="flex flex-col gap-2">
									{#each plans as plan}
										{@const c = planColors(plan.color)}
										{@const isSelected = selectedPlan === plan.id}
										<button
											type="button"
											onclick={() => selectPlan(plan.id)}
											class="flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-all"
											style="border-color: {isSelected ? c.hex : '#1e293b'}; background: {isSelected ? c.bg : 'transparent'};"
										>
											<div
												class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
												style="background: {c.bg15};"
											>
												<i class="{plan.icon} text-sm" style="color: {c.hex};"></i>
											</div>
											<div class="flex-1 min-w-0 text-left">
												<div class="flex items-center gap-1.5">
													<p class="text-sm font-bold text-white">{tx(plan.nameKey)}</p>
													<span
														class="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase"
														style="background: {c.bg15}; color: {c.hex};"
														>{tx(plan.badgeKey)}</span
													>
												</div>
												<p class="mt-0.5 text-[11px] text-text-muted">
													{tx(plan.descriptionKey)}
												</p>
											</div>
											<div
												class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
												style="background: {isSelected ? c.hex : 'transparent'}; border: {isSelected ? 'none' : '1px solid #4b5563'};"
											>
												{#if isSelected}
													<i class="fa-solid fa-check text-[9px] text-white"></i>
												{/if}
											</div>
										</button>
									{/each}
								</div>
							{/if}
						</div>

						<!-- Terms -->
						<div class="flex items-start gap-2.5">
							<button
								type="button"
								onclick={toggleTerms}
								class="mt-0.5 flex min-w-[24px] h-6 w-6 flex-shrink-0 items-center justify-center rounded border transition-all lg:h-5 lg:w-5 lg:min-w-[20px]"
								style="background: {termsAccepted ? '#3b82f6' : '#0a1628'}; border-color: {termsAccepted ? '#3b82f6' : '#4b5563'};"
							>
								{#if termsAccepted}
									<i class="fa-solid fa-check text-[9px] text-white lg:text-[10px]"></i>
								{/if}
							</button>
							<span class="text-xs leading-relaxed text-text-muted lg:text-sm">
								{tx('auth.register.terms.agree')} <a
									href="#"
									class="font-medium text-brand-blue transition-colors hover:text-blue-400"
									>{tx('auth.register.terms.tos')}</a
								> {tx('auth.register.terms.and')} <a
									href="#"
									class="font-medium text-brand-blue transition-colors hover:text-blue-400"
									>{tx('auth.register.terms.privacy')}</a
								>
							</span>
						</div>
						{#if termsError}
							<span class="-mt-2 text-[12px] text-brand-red">
								<i class="fa-solid fa-circle-exclamation mr-1"></i>{termsError}
							</span>
						{/if}

						<!-- Submit -->
						<button
							type="submit"
							disabled={submitState === 'loading' || submitState === 'success'}
							class="mt-1 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold text-white shadow-glow-green transition-all lg:min-h-0 lg:py-3.5"
							style="background: {submitState === 'success' ? '#16a34a' : '#22c55e'};"
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

					<!-- Footer -->
					<div class="border-t border-gray-800 pt-1 text-center">
						<p class="text-xs text-text-muted lg:text-sm">
							{tx('auth.register.footer.hasAccount')}
							<a
								href="/login"
								class="font-semibold text-brand-blue transition-colors hover:text-blue-400"
							>
								{tx('auth.register.footer.login')}
							</a>
						</p>
					</div>
				</div>

				<!-- Mobile Stats -->
				<div
					class="mt-3 grid grid-cols-3 gap-2 border-t border-gray-800 pt-3 lg:hidden"
				>
					<div class="text-center">
						<p class="text-lg font-black text-white">{stats[0].value}</p>
						<p class="text-[10px] text-text-muted">{tx(stats[0].labelKey)}</p>
					</div>
					<div class="border-x border-gray-800 text-center">
						<p class="text-lg font-black text-brand-green">{stats[1].value}</p>
						<p class="text-[10px] text-text-muted">{tx('auth.register.stats.cleanedLabel')}</p>
					</div>
					<div class="text-center">
						<p class="text-lg font-black text-brand-blue">{stats[2].value}</p>
						<p class="text-[10px] text-text-muted">{tx(stats[2].labelKey)}</p>
					</div>
				</div>

				<!-- Trust Badges -->
				<div class="mt-4 flex flex-wrap items-center justify-center gap-4 lg:mt-5 lg:gap-5">
					<div class="flex items-center gap-1 text-[10px] text-text-muted lg:gap-1.5 lg:text-xs">
						<i class="fa-solid fa-shield-halved text-xs text-brand-green lg:text-sm"></i>
						<span class="lg:hidden">{tx('auth.common.trust.sslShort')}</span>
						<span class="hidden lg:inline">{tx('auth.common.trust.ssl')}</span>
					</div>
					<div class="h-3 w-px bg-gray-700"></div>
					<div class="flex items-center gap-1 text-[10px] text-text-muted lg:gap-1.5 lg:text-xs">
						<i class="fa-solid fa-user-shield text-xs text-brand-blue lg:text-sm"></i>
						<span class="lg:hidden">{tx('auth.common.trust.gdprShort')}</span>
						<span class="hidden lg:inline">{tx('auth.common.trust.gdpr')}</span>
					</div>
					<div class="h-3 w-px bg-gray-700"></div>
					<div class="flex items-center gap-1 text-[10px] text-text-muted lg:gap-1.5 lg:text-xs">
						<i class="fa-solid fa-lock text-xs text-text-muted lg:text-sm"></i>
						<span>{tx('auth.common.trust.noTracking')}</span>
					</div>
				</div>
			</div>
		</div>
	</main>
</div>
