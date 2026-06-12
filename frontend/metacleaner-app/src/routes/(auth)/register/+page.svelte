<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { getAuthStats, getAuthPlans } from '$lib/repositories/authRepository';
	import AuthLayout from '../components/AuthLayout.svelte';
	import AuthNavbar from '../components/AuthNavbar.svelte';
	import AuthBranding from '../components/AuthBranding.svelte';
	import AuthFormCard from '../components/AuthFormCard.svelte';
	import RegisterFormSection from './sections/RegisterFormSection.svelte';
	import TrustBadges from '../components/TrustBadges.svelte';

	const stats = getAuthStats();
	const plans = getAuthPlans();

	let selectedPlan = $state<'free' | 'pro'>('free');

	function planColors(color: 'green' | 'orange') {
		return color === 'green'
			? { hex: 'var(--color-brand-green)', bg: 'var(--color-brand-green-6)', bg15: 'var(--color-brand-green-15)' }
			: { hex: 'var(--color-brand-orange)', bg: 'var(--color-brand-orange-6)', bg15: 'var(--color-brand-orange-15)' };
	}

</script>

<svelte:head>
	<title>{tx('auth.register.meta.title')}</title>
</svelte:head>

<AuthLayout>
	<AuthNavbar
		rightText={tx('auth.register.nav.hasAccount')}
		rightHref="/login"
		rightLabel={tx('auth.common.nav.login')}
	/>

	<main class="mx-auto flex w-full max-w-[1100px] flex-1 items-start justify-center px-4 pb-10 lg:items-center lg:px-6 lg:pb-16">
		<div class="grid w-full grid-cols-1 items-start gap-12 lg:grid-cols-2">

			<AuthBranding
				headline={tx('auth.register.branding.headline')}
				highlightedWord={tx('auth.register.branding.headlineHighlight')}
				afterWord="dnes"
				beforeHighlight="své"
				description={tx('auth.register.branding.description')}
				badge={{ icon: 'fa-solid fa-circle-check', text: tx('auth.register.badge.freeForever') }}
				{stats}
				statsBordered={true}
				topPadding={true}
			>
				{#snippet children()}
					<div class="flex flex-col gap-3">
						<p class="text-sm font-semibold text-white">{tx('auth.register.plan.title')}</p>
						{#each plans as plan}
							{@const c = planColors(plan.color)}
							{@const isSelected = selectedPlan === plan.id}
							<button
								type="button"
								onclick={() => (selectedPlan = plan.id)}
								class="flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all"
								style="border-color: {isSelected ? c.hex : 'var(--color-navy-lighter)'}; background: {isSelected ? c.bg : 'transparent'};"
							>
								<div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg" style="background: {c.bg15};">
									<i class="{plan.icon}" style="color: {c.hex};"></i>
								</div>
								<div class="flex-1 text-left">
									<div class="flex items-center gap-2">
										<p class="text-sm font-bold text-white">{tx(plan.nameKey)}</p>
										<span class="rounded px-2 py-0.5 text-[10px] font-bold uppercase" style="background: {c.bg15}; color: {c.hex};">{tx(plan.badgeKey)}</span>
									</div>
									<p class="mt-0.5 text-xs text-text-muted">{tx(plan.descriptionKey)}</p>
								</div>
								<div class="flex h-5 w-5 items-center justify-center rounded-full" style="background: {isSelected ? c.hex : 'transparent'}; border: {isSelected ? 'none' : '1px solid var(--color-gray-600)'};">
									{#if isSelected}<i class="fa-solid fa-check text-[10px] text-white"></i>{/if}
								</div>
							</button>
						{/each}
					</div>

					<div class="flex flex-col gap-2.5">
						{#each ['auth.register.benefit.noCard', 'auth.register.benefit.gdpr', 'auth.register.benefit.e2e', 'auth.register.benefit.cancel'] as key}
							<div class="flex items-center gap-3">
								<i class="fa-solid fa-circle-check flex-shrink-0 text-sm text-brand-green"></i>
								<span class="text-sm text-text-muted">{tx(key)}</span>
							</div>
						{/each}
					</div>
				{/snippet}
			</AuthBranding>

			<div class="mx-auto w-full max-w-[480px] lg:mx-0 lg:ml-auto">
				<div class="flex flex-col items-center gap-2 pb-5 pt-4 text-center lg:hidden">
					<div class="inline-flex items-center gap-1.5 rounded-full border border-brand-green/20 bg-brand-green/10 px-3 py-1">
						<i class="fa-solid fa-circle-check text-[10px] text-brand-green"></i>
						<span class="text-[10px] font-semibold text-brand-green">{tx('auth.register.badge.freeForever')}</span>
					</div>
					<h1 class="text-2xl font-black leading-tight text-white">
						{tx('auth.login.branding.headline')} <span class="text-brand-green">{tx('auth.login.branding.headlineHighlight')}</span>
					</h1>
					<p class="max-w-xs text-xs leading-relaxed text-text-muted">{tx('auth.register.mobile.description')}</p>
				</div>

				<AuthFormCard title={tx('auth.register.form.title')} subtitle={tx('auth.register.form.subtitle')}>
					{#snippet children()}
						<RegisterFormSection bind:selectedPlan />
					{/snippet}
				</AuthFormCard>

				<div class="mt-3 grid grid-cols-3 gap-2 border-t border-gray-800 pt-3 lg:hidden">
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

				<TrustBadges />
			</div>
		</div>
	</main>
</AuthLayout>
