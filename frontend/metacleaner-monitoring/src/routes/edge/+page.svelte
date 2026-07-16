<script lang="ts">
	import { base } from '$app/paths';
	import { invalidate } from '$app/navigation';
	import { t } from '$lib/i18n';
	import PageHeader from '$lib/shared/components/PageHeader.svelte';
	import MobileBottomNav from '$lib/shared/components/MobileBottomNav.svelte';
	import NotConfiguredCard from '$lib/shared/components/NotConfiguredCard.svelte';
	import SectionErrorCard from '$lib/shared/components/SectionErrorCard.svelte';
	import EdgeKpiSection from './sections/EdgeKpiSection.svelte';
	import EdgeChartsSection from './sections/EdgeChartsSection.svelte';
	import EdgeSecurityLogSection from './sections/EdgeSecurityLogSection.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const navItems = [
		{ href: `${base}/dostupnost`, icon: 'fa-server', label: t('layout_nav_availability') },
		{
			href: `${base}/edge`,
			icon: 'fa-cloud',
			label: t('layout_nav_edge'),
			activeClass: 'text-cf-orange'
		},
		{ href: `${base}/business`, icon: 'fa-chart-line', label: t('layout_nav_business') },
		{ href: `${base}/nastaveni`, icon: 'fa-gear', label: t('layout_nav_settings') }
	];
</script>

{#snippet statusBadge()}
	<div
		class="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-lg text-success text-sm font-medium"
	>
		<div class="w-2 h-2 rounded-full bg-success animate-pulse"></div>
		{t('edge_status_cdnOnline')}
	</div>
{/snippet}

{#snippet actions()}
	<select
		class="bg-surface border border-border text-sm text-textMain rounded-lg px-3 py-2 focus:outline-none"
	>
		<option>{t('common_timeRange_last24h')}</option>
		<option>{t('common_timeRange_last7d')}</option>
		<option>{t('common_timeRange_last30d')}</option>
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
					class="w-7 h-7 rounded-md bg-cf-orange/15 border border-cf-orange/30 flex items-center justify-center"
				>
					<i class="fa-solid fa-cloud text-cf-orange text-xs"></i>
				</div>
				<div>
					<h1 class="text-sm font-bold text-textMain leading-tight">{t('layout_nav_edge')}</h1>
					<p class="text-xs text-textSec">{t('edge_header_subtitleMobile')}</p>
				</div>
			</div>
			<div class="flex items-center gap-2">
				<div
					class="flex items-center gap-1.5 px-2.5 py-1.5 bg-success/10 border border-success/20 rounded-lg text-success text-xs font-medium"
				>
					<div class="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
					{t('edge_status_cdnOnline')}
				</div>
				<select
					class="bg-surface border border-border text-xs text-textMain rounded-lg px-2.5 py-2 focus:outline-none min-h-[36px]"
				>
					<option>{t('common_timeRange_last24h')}</option>
					<option>{t('common_timeRange_last7d')}</option>
					<option>{t('common_timeRange_last30d')}</option>
				</select>
			</div>
		</div>
	</div>
{/snippet}

<PageHeader
	titleKey="layout_nav_edge"
	subtitleKey="edge_header_subtitle"
	icon="fa-cloud"
	iconContainerClass="bg-cf-orange/15 border border-cf-orange/30"
	iconClass="text-cf-orange text-sm"
	{statusBadge}
	{actions}
	{mobileContent}
/>

<div class="px-4 pb-20 space-y-4 lg:p-6 lg:pb-6 lg:space-y-6 lg:max-w-7xl lg:mx-auto">
	{#if data.kpis.status === 'ok'}
		<EdgeKpiSection kpis={data.kpis.data} />
	{:else if data.kpis.status === 'not-configured'}
		<NotConfiguredCard missingVars={data.kpis.missingVars} />
	{:else}
		<SectionErrorCard
			category={data.kpis.error.category}
			message={data.kpis.error.message}
			onretry={() => invalidate('app:edge')}
		/>
	{/if}
	{#if data.httpStatusDistribution.status === 'ok'}
		<EdgeChartsSection httpStatusDistribution={data.httpStatusDistribution.data} />
	{:else if data.httpStatusDistribution.status === 'not-configured'}
		<NotConfiguredCard missingVars={data.httpStatusDistribution.missingVars} />
	{:else}
		<SectionErrorCard
			category={data.httpStatusDistribution.error.category}
			message={data.httpStatusDistribution.error.message}
			onretry={() => invalidate('app:edge')}
		/>
	{/if}
	{#if data.wafLog.status === 'ok'}
		<EdgeSecurityLogSection wafLog={data.wafLog.data} />
	{:else if data.wafLog.status === 'not-configured'}
		<NotConfiguredCard missingVars={data.wafLog.missingVars} />
	{:else}
		<SectionErrorCard
			category={data.wafLog.error.category}
			message={data.wafLog.error.message}
			onretry={() => invalidate('app:edge')}
		/>
	{/if}
</div>

<MobileBottomNav items={navItems} activeHref="{base}/edge" />
