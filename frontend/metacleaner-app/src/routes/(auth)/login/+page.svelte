<script lang="ts">
	import { goto } from '$app/navigation';
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import { getAuthStats } from '$lib/repositories/authRepository';

	let email = $state('');
	let password = $state('');
	let rememberMe = $state(false);
	let passwordVisible = $state(false);
	let emailError = $state('');
	let passwordError = $state('');
	let submitState = $state<'idle' | 'loading' | 'success'>('idle');

	const stats = getAuthStats();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}

	function togglePassword() {
		passwordVisible = !passwordVisible;
	}

	function toggleRemember() {
		rememberMe = !rememberMe;
	}

	function validateEmail(v: string) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
	}

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		emailError = '';
		passwordError = '';

		let valid = true;
		if (!validateEmail(email)) {
			emailError = tx('auth.common.validation.emailInvalid');
			valid = false;
		}
		if (password.length < 6) {
			passwordError = tx('auth.login.validation.passwordShort');
			valid = false;
		}
		if (!valid) return;

		submitState = 'loading';
		setTimeout(() => {
			submitState = 'success';
		}, 1500);
	}
</script>

<svelte:head>
	<title>{tx('auth.login.meta.title')}</title>
</svelte:head>

<div
	class="flex min-h-screen flex-col"
	style="background-image: radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(34,197,94,0.06) 0%, transparent 50%);"
>
	<!-- Navbar -->
	<nav class="mx-auto flex w-full max-w-[1100px] items-center justify-between px-5 py-4 lg:px-6 lg:py-6">
		<div class="flex items-center gap-2.5 lg:gap-3">
			<div
				class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue text-white shadow-glow-blue lg:h-10 lg:w-10"
			>
				<i class="fa-solid fa-shield-halved text-base lg:text-xl"></i>
			</div>
			<span class="text-lg font-bold tracking-tight lg:text-xl">{tx('common.brandName')}</span>
		</div>
		<div class="hidden items-center gap-2 lg:flex">
			<span class="text-sm text-text-muted">{tx('auth.login.nav.noAccount')}</span>
			<a
				href="/register"
				class="rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-lighter"
			>
				{tx('auth.login.nav.register')}
			</a>
		</div>
	</nav>

	<!-- Main -->
	<main class="mx-auto flex w-full max-w-[1100px] flex-1 items-center justify-center px-5 pb-8 lg:px-6 lg:pb-16">
		<div class="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2">

			<!-- Left: Branding (desktop only) -->
			<div class="hidden flex-col gap-8 lg:flex">
				<div class="flex flex-col gap-4">
					<h1 class="text-4xl font-black leading-tight text-white">
						{tx('auth.login.branding.headline')}<br /><span class="text-brand-green">{tx('auth.login.branding.headlineHighlight')}</span> {tx('auth.login.branding.headlineAfter')}
					</h1>
					<p class="max-w-md text-base leading-relaxed text-text-muted">
						{tx('auth.login.branding.description')}
					</p>
				</div>

				<!-- Feature Cards -->
				<div class="flex flex-col gap-3">
					<div class="flex items-center gap-4 rounded-xl border border-gray-800 bg-navy-card p-4">
						<div
							class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-blue/15"
						>
							<i class="fa-solid fa-lock text-brand-blue"></i>
						</div>
						<div>
							<p class="text-sm font-semibold text-white">{tx('auth.login.feature.secureTitle')}</p>
							<p class="mt-0.5 text-xs text-text-muted">{tx('auth.login.feature.secureDesc')}</p>
						</div>
						<div class="ml-auto">
							<span class="rounded bg-brand-blue/10 px-2 py-1 text-xs font-bold text-brand-blue">{tx('auth.login.feature.secureBadge')}</span>
						</div>
					</div>

					<div class="flex items-center gap-4 rounded-xl border border-gray-800 bg-navy-card p-4">
						<div
							class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-green/15"
						>
							<i class="fa-solid fa-bolt text-brand-green"></i>
						</div>
						<div>
							<p class="text-sm font-semibold text-white">{tx('auth.login.feature.fastTitle')}</p>
							<p class="mt-0.5 text-xs text-text-muted">{tx('auth.login.feature.fastDesc')}</p>
						</div>
						<div class="ml-auto">
							<span class="rounded bg-brand-green/10 px-2 py-1 text-xs font-bold text-brand-green">{tx('auth.login.feature.fastBadge')}</span>
						</div>
					</div>

					<div class="flex items-center gap-4 rounded-xl border border-gray-800 bg-navy-card p-4">
						<div
							class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-orange/15"
						>
							<i class="fa-solid fa-file-image text-brand-orange"></i>
						</div>
						<div>
							<p class="text-sm font-semibold text-white">{tx('auth.login.feature.formatsTitle')}</p>
							<p class="mt-0.5 text-xs text-text-muted">{tx('auth.login.feature.formatsDesc')}</p>
						</div>
						<div class="ml-auto flex gap-1">
							<span class="rounded bg-navy-lighter px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">JPG</span>
							<span class="rounded bg-navy-lighter px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">PNG</span>
						</div>
					</div>
				</div>

				<!-- Stats Row -->
				<div class="grid grid-cols-3 gap-4">
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
				<div class="mb-6 flex flex-col items-center text-center lg:hidden">
					<h1 class="mb-2 text-2xl font-black leading-tight text-white">
						{tx('auth.login.branding.headline')} <span class="text-brand-green">{tx('auth.login.branding.headlineHighlight')}</span> {tx('auth.login.branding.headlineAfter')}
					</h1>
					<p class="max-w-xs text-xs leading-relaxed text-text-muted">
						{tx('auth.login.branding.description')}
					</p>
					<!-- Mini Stats -->
					<div class="mt-4 flex w-full max-w-xs items-center justify-center">
						<div class="flex-1 text-center">
							<p class="text-lg font-black text-white">{stats[0].value}</p>
							<p class="text-[10px] text-text-muted">{tx(stats[0].labelKey)}</p>
						</div>
						<div class="h-8 w-px bg-gray-800"></div>
						<div class="flex-1 text-center">
							<p class="text-lg font-black text-brand-green">{stats[1].value}</p>
							<p class="text-[10px] text-text-muted">{tx(stats[1].labelKey)}</p>
						</div>
						<div class="h-8 w-px bg-gray-800"></div>
						<div class="flex-1 text-center">
							<p class="text-lg font-black text-brand-blue">{stats[2].value}</p>
							<p class="text-[10px] text-text-muted">{tx(stats[2].labelKey)}</p>
						</div>
					</div>
				</div>

				<!-- Form Card -->
				<div
					class="flex flex-col gap-5 rounded-2xl border border-gray-800 bg-navy-card p-5 shadow-card lg:gap-6 lg:p-8"
				>
					<!-- Header -->
					<div class="flex flex-col gap-0.5 lg:gap-1">
						<h2 class="text-xl font-bold text-white lg:text-2xl">{tx('auth.login.form.title')}</h2>
						<p class="text-xs text-text-muted lg:text-sm">{tx('auth.login.form.subtitle')}</p>
					</div>

					<!-- Social Login -->
					<div class="flex flex-col gap-2.5 lg:gap-3">
						<button
							class="flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-xl border border-[#374151] bg-navy-lighter py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:border-[#4b5563] hover:bg-[#263347] lg:py-3"
						>
							<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
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
							{tx('auth.login.social.google')}
						</button>
						<button
							class="flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-xl border border-[#374151] bg-navy-lighter py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:border-[#4b5563] hover:bg-[#263347] lg:py-3"
						>
							<i class="fa-brands fa-apple text-lg"></i>
							{tx('auth.login.social.apple')}
						</button>
					</div>

					<!-- Divider -->
					<div class="flex items-center gap-3">
						<div class="h-px flex-1 bg-navy-lighter"></div>
						<span class="whitespace-nowrap text-xs font-medium text-text-muted">{tx('auth.login.divider.orEmail')}</span>
						<div class="h-px flex-1 bg-navy-lighter"></div>
					</div>

					<!-- Form -->
					<form onsubmit={handleSubmit} class="flex flex-col gap-4">
						<!-- Email -->
						<div class="flex flex-col gap-1.5">
							<label for="email-input" class="text-sm font-medium text-white">{tx('auth.login.field.emailLabel')}</label>
							<div class="relative">
								<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-muted">
									<i class="fa-regular fa-envelope"></i>
								</span>
								<input
									id="email-input"
									type="email"
									bind:value={email}
									placeholder={tx('auth.login.field.emailPlaceholder')}
									class="min-h-[48px] w-full rounded-xl border py-3 pl-10 pr-4 text-sm font-medium text-white transition-[border-color,box-shadow] placeholder:text-text-muted focus:outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] lg:min-h-0 lg:py-3"
									style="background:#0a1628; border-color: {emailError ? '#ef4444' : '#1e293b'};"
									onfocus={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = emailError ? '#ef4444' : '#3b82f6')}
									onblur={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = emailError ? '#ef4444' : '#1e293b')}
								/>
							</div>
							{#if emailError}
								<span class="text-[12px] text-brand-red">
									<i class="fa-solid fa-circle-exclamation mr-1"></i>{emailError}
								</span>
							{/if}
						</div>

						<!-- Password -->
						<div class="flex flex-col gap-1.5">
							<div class="flex items-center justify-between">
								<label for="password-input" class="text-sm font-medium text-white">{tx('auth.login.field.passwordLabel')}</label>
								<a
									href="/forgot-password"
									class="text-xs font-medium text-brand-blue transition-colors hover:text-blue-400"
								>
									{tx('auth.login.field.forgotPassword')}
								</a>
							</div>
							<div class="relative">
								<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-muted">
									<i class="fa-solid fa-lock"></i>
								</span>
								<input
									id="password-input"
									type={passwordVisible ? 'text' : 'password'}
									bind:value={password}
									placeholder="••••••••"
									class="min-h-[48px] w-full rounded-xl border py-3 pl-10 pr-12 text-sm font-medium text-white transition-[border-color,box-shadow] placeholder:text-text-muted focus:outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] lg:min-h-0 lg:py-3"
									style="background:#0a1628; border-color: {passwordError ? '#ef4444' : '#1e293b'};"
									onfocus={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = passwordError ? '#ef4444' : '#3b82f6')}
									onblur={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = passwordError ? '#ef4444' : '#1e293b')}
								/>
								<button
									type="button"
									onclick={togglePassword}
									aria-label={passwordVisible ? tx('auth.common.a11y.hidePassword') : tx('auth.common.a11y.showPassword')}
									class="absolute right-3.5 top-1/2 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center text-sm text-text-muted transition-colors hover:text-white"
								>
									<i class={passwordVisible ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'}></i>
								</button>
							</div>
							{#if passwordError}
								<span class="text-[12px] text-brand-red">
									<i class="fa-solid fa-circle-exclamation mr-1"></i>{passwordError}
								</span>
							{/if}
						</div>

						<!-- Remember Me -->
						<div class="flex items-center gap-2.5 lg:gap-2.5">
							<button
								type="button"
								onclick={toggleRemember}
								class="flex min-w-[24px] h-6 w-6 flex-shrink-0 items-center justify-center rounded border transition-all lg:h-5 lg:w-5"
								style="background: {rememberMe ? '#3b82f6' : '#0a1628'}; border-color: {rememberMe ? '#3b82f6' : '#4b5563'};"
							>
								{#if rememberMe}
									<i class="fa-solid fa-check text-[10px] text-white"></i>
								{/if}
							</button>
							<span class="text-sm text-text-muted">{tx('auth.login.field.remember')}</span>
						</div>

						<!-- Submit -->
						<button
							type="submit"
							disabled={submitState === 'loading' || submitState === 'success'}
							class="mt-1 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-glow-green transition-all lg:min-h-0 lg:py-3.5"
							style="background: {submitState === 'success' ? '#16a34a' : '#22c55e'};"
						>
							{#if submitState === 'loading'}
								<i class="fa-solid fa-spinner fa-spin"></i> {tx('auth.login.submit.loading')}
							{:else if submitState === 'success'}
								<i class="fa-solid fa-circle-check"></i> {tx('auth.login.submit.success')}
							{:else}
								<i class="fa-solid fa-arrow-right-to-bracket"></i> {tx('auth.login.submit.idle')}
							{/if}
						</button>
					</form>

					<!-- Footer -->
					<div class="border-t border-gray-800 pt-1 text-center">
						<p class="text-sm text-text-muted">
							{tx('auth.login.footer.noAccount')}
							<a
								href="/register"
								class="font-semibold text-brand-blue transition-colors hover:text-blue-400"
							>
								{tx('auth.login.footer.registerFree')}
							</a>
						</p>
					</div>
				</div>

				<!-- Trust Badges -->
				<div class="mt-4 flex flex-wrap items-center justify-center gap-4 lg:mt-5 lg:gap-5">
					<div class="flex items-center gap-1.5 text-xs text-text-muted">
						<i class="fa-solid fa-shield-halved text-sm text-brand-green"></i>
						<span>{tx('auth.common.trust.ssl')}</span>
					</div>
					<div class="h-3 w-px bg-gray-700"></div>
					<div class="flex items-center gap-1.5 text-xs text-text-muted">
						<i class="fa-solid fa-user-shield text-sm text-brand-blue"></i>
						<span>{tx('auth.common.trust.gdpr')}</span>
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
