<script lang="ts">
	import { base } from '$app/paths';
	import { invalidate } from '$app/navigation';
	import { t } from '$lib/i18n';
	import PageHeader from '$lib/shared/components/PageHeader.svelte';
	import MobileBottomNav from '$lib/shared/components/MobileBottomNav.svelte';
	import NotConfiguredCard from '$lib/shared/components/NotConfiguredCard.svelte';
	import SectionErrorCard from '$lib/shared/components/SectionErrorCard.svelte';
	import PerformanceKpiSection from './sections/PerformanceKpiSection.svelte';
	import PerformanceChartsSection from './sections/PerformanceChartsSection.svelte';
	import PerformanceEndpointsSection from './sections/PerformanceEndpointsSection.svelte';
	import PerformanceEventLogSection from './sections/PerformanceEventLogSection.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const navItems = [
		{ href: `${base}/`, icon: 'fa-gauge-high', label: t('layout_nav_dashboard') },
		{ href: `${base}/runtime`, icon: 'fa-microchip', label: t('layout_nav_runtime') },
		{
			href: `${base}/performance`,
			icon: 'fa-bolt',
			label: t('layout_nav_performance'),
			activeClass: 'text-amber'
		},
		{ href: `${base}/chyby`, icon: 'fa-triangle-exclamation', label: t('layout_nav_errors') },
		{ href: `${base}/nastaveni`, icon: 'fa-gear', label: t('layout_nav_settings') }
	];
</script>

{#snippet statusBadge()}
	<div
		class="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-lg text-success text-sm font-medium"
	>
		<div class="w-2 h-2 rounded-full bg-success animate-pulse"></div>
		{t('performance_status_systemOk')}
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
			class="px-4 pt-3 pb-2 bg-card border-b border-surface flex items-center justify-between gap-3"
		>
			<div class="flex items-center gap-2.5">
				<div
					class="w-7 h-7 rounded-md bg-amber/15 border border-amber/30 flex items-center justify-center"
				>
					<i class="fa-solid fa-bolt text-amber text-xs"></i>
				</div>
				<p class="text-xs text-textSec truncate">{t('performance_header_subtitleMobile')}</p>
			</div>
			<select
				class="bg-surface border border-border text-xs text-textMain rounded-lg px-2.5 py-1.5 focus:outline-none flex-shrink-0"
			>
				<option>{t('common_timeRange_last24h')}</option>
				<option>{t('common_timeRange_last7d')}</option>
				<option>{t('common_timeRange_last30d')}</option>
			</select>
		</div>
	</div>
{/snippet}

<PageHeader
	titleKey="layout_nav_performance"
	subtitleKey="performance_header_subtitle"
	icon="fa-bolt"
	iconContainerClass="bg-amber/15 border border-amber/30"
	iconClass="text-amber text-sm"
	{statusBadge}
	{actions}
	{mobileContent}
/>

<div class="px-4 py-4 space-y-4 lg:p-6 lg:pb-6 lg:space-y-6 lg:max-w-7xl lg:mx-auto pb-20">
	{#if data.kpis.status === 'ok'}
		<PerformanceKpiSection kpis={data.kpis.data} />
	{:else if data.kpis.status === 'not-configured'}
		<NotConfiguredCard missingVars={data.kpis.missingVars} />
	{:else}
		<SectionErrorCard
			category={data.kpis.error.category}
			message={data.kpis.error.message}
			onretry={() => invalidate('app:performance')}
		/>
	{/if}
	<PerformanceChartsSection />
	{#if data.slowEndpoints.status === 'ok'}
		<PerformanceEndpointsSection slowEndpoints={data.slowEndpoints.data} />
	{:else if data.slowEndpoints.status === 'not-configured'}
		<NotConfiguredCard missingVars={data.slowEndpoints.missingVars} />
	{:else}
		<SectionErrorCard
			category={data.slowEndpoints.error.category}
			message={data.slowEndpoints.error.message}
			onretry={() => invalidate('app:performance')}
		/>
	{/if}
	{#if data.events.status === 'ok'}
		<PerformanceEventLogSection events={data.events.data} />
	{:else if data.events.status === 'not-configured'}
		<NotConfiguredCard missingVars={data.events.missingVars} />
	{:else}
		<SectionErrorCard
			category={data.events.error.category}
			message={data.events.error.message}
			onretry={() => invalidate('app:performance')}
		/>
	{/if}
</div>

<MobileBottomNav items={navItems} activeHref="{base}/performance" />
