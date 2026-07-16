<script lang="ts">
	import { base } from '$app/paths';
	import { invalidate } from '$app/navigation';
	import { t } from '$lib/i18n';
	import PageHeader from '$lib/shared/components/PageHeader.svelte';
	import MobileBottomNav from '$lib/shared/components/MobileBottomNav.svelte';
	import NotConfiguredCard from '$lib/shared/components/NotConfiguredCard.svelte';
	import SectionErrorCard from '$lib/shared/components/SectionErrorCard.svelte';
	import RuntimeKpiSection from './sections/RuntimeKpiSection.svelte';
	import RuntimeChartsSection from './sections/RuntimeChartsSection.svelte';
	import RuntimeInstancesSection from './sections/RuntimeInstancesSection.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const statusBadgeText = $derived(
		data.machines.status === 'ok'
			? `${data.machines.data.filter((m) => m.status === 'running').length}/${data.machines.data.length} online`
			: t('common_status_allSystemsOperational')
	);

	const navItems = [
		{ href: `${base}/dostupnost`, icon: 'fa-server', label: t('layout_nav_availability') },
		{ href: `${base}/chyby`, icon: 'fa-triangle-exclamation', label: t('layout_nav_errors') },
		{
			href: `${base}/runtime`,
			icon: 'fa-microchip',
			label: t('layout_nav_runtime'),
			activeClass: 'text-purple-light'
		},
		{ href: `${base}/nastaveni`, icon: 'fa-gear', label: t('layout_nav_settings') }
	];
</script>

{#snippet statusBadge()}
	<div
		class="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-lg text-success text-sm font-medium"
	>
		<div class="w-2 h-2 rounded-full bg-success animate-pulse"></div>
		{statusBadgeText}
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
		<div class="px-4 pt-3 pb-2">
			<div class="flex items-center gap-2.5">
				<div
					class="w-7 h-7 rounded-md bg-purple-light/15 border border-purple-light/30 flex items-center justify-center"
				>
					<i class="fa-solid fa-microchip text-purple-light text-xs"></i>
				</div>
				<div>
					<h1 class="text-sm font-bold text-textMain leading-tight">{t('layout_nav_runtime')}</h1>
					<p class="text-xs text-textSec">{t('runtime_header_subtitleMobile')}</p>
				</div>
			</div>
		</div>
		<div class="px-4 pb-3">
			<div
				class="flex items-center gap-2 px-3 py-2 bg-success/10 border border-success/20 rounded-lg text-success text-xs font-medium w-fit"
			>
				<div class="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
				{statusBadgeText}
			</div>
		</div>
		<div class="px-4 pb-4">
			<div class="flex items-center gap-2">
				<select
					class="flex-1 bg-card border border-border text-sm text-textMain rounded-xl px-4 py-3 focus:outline-none"
				>
					<option>{t('common_timeRange_last24h')}</option>
					<option>{t('common_timeRange_last7d')}</option>
					<option>{t('common_timeRange_last30d')}</option>
				</select>
				<div
					class="flex items-center gap-1.5 px-3 py-3 bg-card border border-surface rounded-xl text-textSec text-xs"
				>
					<i class="fa-solid fa-server text-xs"></i>
					<span>fra</span>
				</div>
			</div>
		</div>
	</div>
{/snippet}

<PageHeader
	titleKey="layout_nav_runtime"
	subtitleKey="runtime_header_subtitle"
	icon="fa-microchip"
	iconContainerClass="bg-purple-light/15 border border-purple-light/30"
	iconClass="text-purple-light text-sm"
	{statusBadge}
	{actions}
	{mobileContent}
/>

<div class="px-4 pb-20 space-y-4 lg:p-6 lg:pb-6 lg:space-y-6 lg:max-w-7xl lg:mx-auto">
	{#if data.stats.status === 'ok'}
		<RuntimeKpiSection stats={data.stats.data} />
	{:else if data.stats.status === 'not-configured'}
		<NotConfiguredCard missingVars={data.stats.missingVars} />
	{:else}
		<SectionErrorCard
			category={data.stats.error.category}
			message={data.stats.error.message}
			onretry={() => invalidate('app:runtime')}
		/>
	{/if}
	{#if data.cpuTimeSeries.status === 'not-configured' || data.ramTimeSeries.status === 'not-configured'}
		<NotConfiguredCard
			missingVars={data.cpuTimeSeries.status === 'not-configured'
				? data.cpuTimeSeries.missingVars
				: data.ramTimeSeries.status === 'not-configured'
					? data.ramTimeSeries.missingVars
					: []}
		/>
	{:else if data.cpuTimeSeries.status === 'error' || data.ramTimeSeries.status === 'error'}
		<SectionErrorCard
			category={data.cpuTimeSeries.status === 'error'
				? data.cpuTimeSeries.error.category
				: data.ramTimeSeries.status === 'error'
					? data.ramTimeSeries.error.category
					: 'request_error'}
			message={data.cpuTimeSeries.status === 'error'
				? data.cpuTimeSeries.error.message
				: data.ramTimeSeries.status === 'error'
					? data.ramTimeSeries.error.message
					: ''}
			onretry={() => invalidate('app:runtime')}
		/>
	{:else}
		<RuntimeChartsSection
			cpuTimeSeries={data.cpuTimeSeries.data}
			ramTimeSeries={data.ramTimeSeries.data}
		/>
	{/if}
	{#if data.machines.status === 'ok'}
		<RuntimeInstancesSection machines={data.machines.data} />
	{:else if data.machines.status === 'not-configured'}
		<NotConfiguredCard missingVars={data.machines.missingVars} />
	{:else}
		<SectionErrorCard
			category={data.machines.error.category}
			message={data.machines.error.message}
			onretry={() => invalidate('app:runtime')}
		/>
	{/if}
</div>

<MobileBottomNav items={navItems} activeHref="{base}/runtime" />
