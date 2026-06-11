<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import { getAuthStats } from '$lib/repositories/authRepository';
	import AuthLayout from '../components/AuthLayout.svelte';
	import AuthNavbar from '../components/AuthNavbar.svelte';
	import AuthBranding from '../components/AuthBranding.svelte';
	import AuthMobileHero from '../components/AuthMobileHero.svelte';
	import AuthFormCard from '../components/AuthFormCard.svelte';
	import AuthFeatureCard from '../components/AuthFeatureCard.svelte';
	import PasswordInput from '../components/PasswordInput.svelte';

	let email = $state('');
	let password = $state('');
	let rememberMe = $state(false);
	let passwordVisible = $state(false);
	let emailError = $state('');
	let passwordError = $state('');
	let submitState = $state<'idle' | 'loading' | 'success'>('idle');
	let emailFocused = $state(false);

	const stats = getAuthStats();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
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

	const emailBorderColor = $derived(
		emailError
			? 'var(--color-brand-red)'
			: emailFocused
				? 'var(--color-brand-blue)'
				: 'var(--color-navy-lighter)'
	);
</script>

<svelte:head>
	<title>{tx('auth.login.meta.title')}</title>
</svelte:head>

<AuthLayout>
	<AuthNavbar
		rightText={tx('auth.login.nav.noAccount')}
		rightHref="/register"
		rightLabel={tx('auth.login.nav.register')}
	/>

	<main class="mx-auto flex w-full max-w-[1100px] flex-1 items-center justify-center px-5 pb-8 lg:px-6 lg:pb-16">
		<div class="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2">

			<AuthBranding
				headline={tx('auth.login.branding.headline')}
				highlightedWord={tx('auth.login.branding.headlineHighlight')}
				afterWord={tx('auth.login.branding.headlineAfter')}
				description={tx('auth.login.branding.description')}
				{stats}
			>
				{#snippet children()}
					<div class="flex flex-col gap-3">
						<AuthFeatureCard
							icon="fa-solid fa-lock"
							iconClass="text-brand-blue"
							iconBgClass="bg-brand-blue/15"
							title={tx('auth.login.feature.secureTitle')}
							desc={tx('auth.login.feature.secureDesc')}
							badge={tx('auth.login.feature.secureBadge')}
							badgeClass="bg-brand-blue/10 text-brand-blue"
						/>
						<AuthFeatureCard
							icon="fa-solid fa-bolt"
							iconClass="text-brand-green"
							iconBgClass="bg-brand-green/15"
							title={tx('auth.login.feature.fastTitle')}
							desc={tx('auth.login.feature.fastDesc')}
							badge={tx('auth.login.feature.fastBadge')}
							badgeClass="bg-brand-green/10 text-brand-green"
						/>
						<AuthFeatureCard
							icon="fa-solid fa-file-image"
							iconClass="text-brand-orange"
							iconBgClass="bg-brand-orange/15"
							title={tx('auth.login.feature.formatsTitle')}
							desc={tx('auth.login.feature.formatsDesc')}
							chips={['JPG', 'PNG']}
						/>
					</div>
				{/snippet}
			</AuthBranding>

			<div class="mx-auto w-full max-w-[480px] lg:mx-0 lg:ml-auto">
				<AuthMobileHero
					headline={tx('auth.login.branding.headline')}
					highlightedWord={tx('auth.login.branding.headlineHighlight')}
					afterWord={tx('auth.login.branding.headlineAfter')}
					description={tx('auth.login.branding.description')}
					{stats}
				/>

				<AuthFormCard title={tx('auth.login.form.title')} subtitle={tx('auth.login.form.subtitle')}>
					{#snippet children()}
						<!-- Social Login -->
						<div class="flex flex-col gap-2.5 lg:gap-3">
							<button class="flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-xl border border-gray-700 bg-navy-lighter py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:border-gray-600 hover:bg-[#263347] lg:py-3">
								<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
									<path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
									<path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
									<path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
									<path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
								</svg>
								{tx('auth.login.social.google')}
							</button>
							<button class="flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-xl border border-gray-700 bg-navy-lighter py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:border-gray-600 hover:bg-[#263347] lg:py-3">
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
										style="background: var(--color-navy-main); border-color: {emailBorderColor};"
										onfocus={() => (emailFocused = true)}
										onblur={() => (emailFocused = false)}
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
									<a href="/forgot-password" class="text-xs font-medium text-brand-blue transition-colors hover:text-blue-400">
										{tx('auth.login.field.forgotPassword')}
									</a>
								</div>
								<PasswordInput
									id="password-input"
									bind:value={password}
									error={passwordError}
									visible={passwordVisible}
									onToggle={() => (passwordVisible = !passwordVisible)}
									ariaShowLabel={tx('auth.common.a11y.showPassword')}
									ariaHideLabel={tx('auth.common.a11y.hidePassword')}
								/>
							</div>

							<!-- Remember Me -->
							<div class="flex items-center gap-2.5">
								<button
									type="button"
									onclick={() => (rememberMe = !rememberMe)}
									class="flex h-6 w-6 min-w-[24px] flex-shrink-0 items-center justify-center rounded border transition-all lg:h-5 lg:w-5 {rememberMe ? 'bg-brand-blue border-brand-blue' : 'bg-navy-main border-gray-600'}"
								>
									{#if rememberMe}<i class="fa-solid fa-check text-[10px] text-white"></i>{/if}
								</button>
								<span class="text-sm text-text-muted">{tx('auth.login.field.remember')}</span>
							</div>

							<!-- Submit -->
							<button
								type="submit"
								disabled={submitState === 'loading' || submitState === 'success'}
								class="mt-1 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-glow-green transition-all lg:min-h-0 {submitState === 'success' ? 'bg-brand-green-dark' : 'bg-brand-green'}"
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
								<a href="/register" class="font-semibold text-brand-blue transition-colors hover:text-blue-400">
									{tx('auth.login.footer.registerFree')}
								</a>
							</p>
						</div>
					{/snippet}
				</AuthFormCard>

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
</AuthLayout>
