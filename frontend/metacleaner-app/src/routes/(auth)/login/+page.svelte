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
	import LoginFormSection from './sections/LoginFormSection.svelte';

	const stats = getAuthStats();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}
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
						<LoginFormSection />
					{/snippet}
				</AuthFormCard>

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
