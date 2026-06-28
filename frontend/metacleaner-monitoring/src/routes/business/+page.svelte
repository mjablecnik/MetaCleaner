<script lang="ts">
	import { base } from '$app/paths';
	import { invalidate } from '$app/navigation';
	import { t } from '$lib/i18n';
	import PageHeader from '$lib/shared/components/PageHeader.svelte';
	import MobileBottomNav from '$lib/shared/components/MobileBottomNav.svelte';
	import NotConfiguredCard from '$lib/shared/components/NotConfiguredCard.svelte';
	import SectionErrorCard from '$lib/shared/components/SectionErrorCard.svelte';
	import BusinessKpiSection from './sections/BusinessKpiSection.svelte';
	import BusinessRevenueChartsSection from './sections/BusinessRevenueChartsSection.svelte';
	import BusinessFunnelSection from './sections/BusinessFunnelSection.svelte';
	import BusinessCohortSection from './sections/BusinessCohortSection.svelte';
	import BusinessTopCustomersSection from './sections/BusinessTopCustomersSection.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const navItems = [
		{ href: `${base}/`, icon: 'fa-gauge-high', label: t('layout_nav_dashboard') },
		{ href: `${base}/dostupnost`, icon: 'fa-server', label: t('layout_nav_availability') },
		{ href: `${base}/chyby`, icon: 'fa-triangle-exclamation', label: t('layout_nav_errors') },
		{ href: `${base}/performance`, icon: 'fa-bolt', label: t('layout_nav_performance') },
		{
			href: `${base}/business`,
			icon: 'fa-chart-line',
			label: t('layout_nav_business'),
			activeClass: 'text-success'
		}
	];
</script>

{#snippet statusBadge()}
	<div
		class="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-lg text-success text-sm font-medium"
	>
		<div class="w-2 h-2 rounded-full bg-success animate-pulse"></div>
		{t('business_status_live')}
	</div>
{/snippet}

{#snippet actions()}
	<select
		class="bg-surface border border-border text-sm text-textMain rounded-lg px-3 py-2 focus:outline-none"
	>
		<option>{t('business_timeRange_june2024')}</option>
		<option>{t('business_timeRange_last30d')}</option>
		<option>{t('business_timeRange_q22024')}</option>
		<option>{t('business_timeRange_ytd2024')}</option>
	</select>
	<button
		class="px-4 py-2 bg-surface hover:bg-surface-hover text-white rounded-lg text-sm font-medium transition-colors border border-border"
	>
		<i class="fa-solid fa-download mr-2"></i>{t('common_actions_export')}
	</button>
{/snippet}

{#snippet mobileContent()}
	<div class="lg:hidden">
		<div
			class="px-4 pt-3 pb-3 bg-card border-b border-surface flex items-center justify-between gap-3"
		>
			<div class="flex items-center gap-2.5">
				<div
					class="w-8 h-8 rounded-lg bg-success/15 border border-success/30 flex items-center justify-center"
				>
					<i class="fa-solid fa-chart-line text-success text-xs"></i>
				</div>
				<div>
					<h1 class="text-base font-bold text-textMain leading-tight">
						{t('layout_nav_business')}
					</h1>
					<p class="text-xs text-textSec">{t('business_header_subtitleMobile')}</p>
				</div>
			</div>
			<div class="flex items-center gap-2">
				<div
					class="flex items-center gap-1.5 px-2.5 py-1.5 bg-success/10 border border-success/20 rounded-lg text-success text-xs font-medium"
				>
					<div class="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
					{t('business_status_live')}
				</div>
				<select
					class="bg-surface border border-border text-xs text-textMain rounded-lg px-2.5 py-2 focus:outline-none min-h-[36px]"
				>
					<option>{t('business_timeRange_june2024')}</option>
					<option>{t('business_timeRange_last30d')}</option>
					<option>{t('business_timeRange_q22024')}</option>
				</select>
			</div>
		</div>
	</div>
{/snippet}

<PageHeader
	titleKey="layout_nav_business"
	subtitleKey="business_header_subtitle"
	icon="fa-chart-line"
	iconContainerClass="bg-success/15 border border-success/30"
	iconClass="text-success text-sm"
	{statusBadge}
	{actions}
	{mobileContent}
/>

<div class="px-4 pb-24 space-y-4 lg:p-6 lg:pb-6 lg:space-y-6 lg:max-w-7xl lg:mx-auto">
	{#if data.kpis.status === 'ok'}
		<BusinessKpiSection kpis={data.kpis.data} />
	{:else if data.kpis.status === 'not-configured'}
		<NotConfiguredCard missingVars={data.kpis.missingVars} />
	{:else}
		<SectionErrorCard
			category={data.kpis.error.category}
			message={data.kpis.error.message}
			onretry={() => invalidate('app:business')}
		/>
	{/if}
	<BusinessRevenueChartsSection />
	{#if data.planRevenue.status === 'ok' && data.conversionFunnel.status === 'ok'}
		<BusinessFunnelSection
			planRevenue={data.planRevenue.data}
			conversionFunnel={data.conversionFunnel.data}
		/>
	{:else if data.planRevenue.status === 'not-configured' || data.conversionFunnel.status === 'not-configured'}
		<NotConfiguredCard
			missingVars={data.planRevenue.status === 'not-configured'
				? data.planRevenue.missingVars
				: data.conversionFunnel.status === 'not-configured'
					? data.conversionFunnel.missingVars
					: []}
		/>
	{:else if data.planRevenue.status === 'error'}
		<SectionErrorCard
			category={data.planRevenue.error.category}
			message={data.planRevenue.error.message}
			onretry={() => invalidate('app:business')}
		/>
	{:else if data.conversionFunnel.status === 'error'}
		<SectionErrorCard
			category={data.conversionFunnel.error.category}
			message={data.conversionFunnel.error.message}
			onretry={() => invalidate('app:business')}
		/>
	{/if}
	<BusinessCohortSection />
	<BusinessTopCustomersSection />
</div>

<MobileBottomNav items={navItems} activeHref="{base}/business" />
