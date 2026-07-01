<script lang="ts">
	import { base } from '$app/paths';
	import { invalidate } from '$app/navigation';
	import { t } from '$lib/i18n';
	import PageHeader from '$lib/shared/components/PageHeader.svelte';
	import MobileBottomNav from '$lib/shared/components/MobileBottomNav.svelte';
	import NotConfiguredCard from '$lib/shared/components/NotConfiguredCard.svelte';
	import SectionErrorCard from '$lib/shared/components/SectionErrorCard.svelte';
	import ErrorsKpiSection from './sections/ErrorsKpiSection.svelte';
	import ErrorsTimelineSection from './sections/ErrorsTimelineSection.svelte';
	import ErrorsComparisonSection from './sections/ErrorsComparisonSection.svelte';
	import ErrorsEndpointsSection from './sections/ErrorsEndpointsSection.svelte';
	import ErrorsLogSection from './sections/ErrorsLogSection.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const navItems = [
		{ href: `${base}/`, icon: 'fa-gauge-high', label: t('layout_nav_dashboard') },
		{ href: `${base}/dostupnost`, icon: 'fa-server', label: t('layout_nav_availability') },
		{
			href: `${base}/chyby`,
			icon: 'fa-triangle-exclamation',
			label: t('layout_nav_errors'),
			activeClass: 'text-error'
		},
		{ href: `${base}/performance`, icon: 'fa-bolt', label: t('layout_nav_performance') },
		{ href: `${base}/nastaveni`, icon: 'fa-gear', label: t('layout_nav_settings') }
	];
</script>

{#snippet statusBadge()}
	<div
		class="flex items-center gap-2 px-3 py-1.5 bg-surface border border-surface rounded-lg text-textSec text-sm font-medium"
	>
		<div class="w-2 h-2 rounded-full bg-textSec"></div>
		{t('common_labels_noData')}
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
	<div class="lg:hidden px-4 pt-4 space-y-3 pb-2">
		<div class="flex items-start justify-between gap-3">
			<div>
				<h1 class="text-xl font-bold text-textMain">{t('errors_header_title')}</h1>
				<p class="text-xs text-textSec mt-0.5">{t('errors_header_subtitleMobile')}</p>
			</div>
			<select
				class="bg-surface border border-border text-xs text-textMain rounded-lg px-3 py-2 focus:outline-none"
				style="min-height:44px"
			>
				<option>{t('common_timeRange_last24h')}</option>
				<option>{t('common_timeRange_last7d')}</option>
				<option>{t('common_timeRange_last30d')}</option>
			</select>
		</div>
		<div class="p-3 rounded-xl bg-surface border border-surface/60 flex items-center gap-3">
			<div
				class="w-8 h-8 rounded-full bg-surface flex items-center justify-center flex-shrink-0"
			>
				<i class="fa-solid fa-triangle-exclamation text-textSec text-sm"></i>
			</div>
			<div class="flex-1 min-w-0">
				<p class="text-sm font-semibold text-textMain">{t('common_labels_noData')}</p>
			</div>
		</div>
	</div>
{/snippet}

<PageHeader
	titleKey="errors_header_title"
	subtitleKey="errors_header_subtitle"
	{statusBadge}
	{actions}
	{mobileContent}
/>

<div class="px-4 pt-4 pb-20 space-y-4 lg:p-6 lg:pb-6 lg:space-y-6 lg:max-w-7xl lg:mx-auto">
	{#if data.kpis.status === 'ok'}
		<ErrorsKpiSection kpis={data.kpis.data} />
	{:else if data.kpis.status === 'not-configured'}
		<NotConfiguredCard missingVars={data.kpis.missingVars} />
	{:else}
		<SectionErrorCard
			category={data.kpis.error.category}
			message={data.kpis.error.message}
			onretry={() => invalidate('app:chyby')}
		/>
	{/if}
	<ErrorsTimelineSection />
	<ErrorsComparisonSection />
	{#if data.topEndpoints.status === 'ok'}
		<ErrorsEndpointsSection endpoints={data.topEndpoints.data} />
	{:else if data.topEndpoints.status === 'not-configured'}
		<NotConfiguredCard missingVars={data.topEndpoints.missingVars} />
	{:else}
		<SectionErrorCard
			category={data.topEndpoints.error.category}
			message={data.topEndpoints.error.message}
			onretry={() => invalidate('app:chyby')}
		/>
	{/if}
	{#if data.log.status === 'ok'}
		<ErrorsLogSection logEntries={data.log.data} />
	{:else if data.log.status === 'not-configured'}
		<NotConfiguredCard missingVars={data.log.missingVars} />
	{:else}
		<SectionErrorCard
			category={data.log.error.category}
			message={data.log.error.message}
			onretry={() => invalidate('app:chyby')}
		/>
	{/if}
</div>

<MobileBottomNav items={navItems} activeHref="{base}/chyby" />
