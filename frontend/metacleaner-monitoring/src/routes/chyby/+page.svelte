<script lang="ts">
	import { base } from '$app/paths';
	import { t } from '$lib/i18n';
	import { getErrorsStats } from '$lib/repositories/errorsRepository';
	import PageHeader from '$lib/shared/components/PageHeader.svelte';
	import MobileBottomNav from '$lib/shared/components/MobileBottomNav.svelte';
	import ErrorsKpiSection from './sections/ErrorsKpiSection.svelte';
	import ErrorsTimelineSection from './sections/ErrorsTimelineSection.svelte';
	import ErrorsComparisonSection from './sections/ErrorsComparisonSection.svelte';
	import ErrorsEndpointsSection from './sections/ErrorsEndpointsSection.svelte';
	import ErrorsLogSection from './sections/ErrorsLogSection.svelte';

	const errStats = getErrorsStats();

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
		class="flex items-center gap-2 px-3 py-1.5 bg-error/10 border border-error/20 rounded-lg text-error text-sm font-medium"
	>
		<div class="w-2 h-2 rounded-full bg-error animate-pulse"></div>
		{errStats.activeIncidents}
		{t('errors_status_activeIncidents')}
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
		<div class="p-3 rounded-xl bg-error/10 border border-error/30 flex items-center gap-3">
			<div
				class="w-8 h-8 rounded-full bg-error/20 border border-error/40 flex items-center justify-center flex-shrink-0"
			>
				<i class="fa-solid fa-triangle-exclamation text-error text-sm"></i>
			</div>
			<div class="flex-1 min-w-0">
				<p class="text-sm font-semibold text-textMain">
					{errStats.activeIncidents}
					{t('errors_status_activeIncidents')}
				</p>
				<p class="text-xs text-textSec truncate">{errStats.bannerDescription}</p>
			</div>
			<i class="fa-solid fa-chevron-right text-textSec text-xs flex-shrink-0"></i>
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
	<ErrorsKpiSection />
	<ErrorsTimelineSection />
	<ErrorsComparisonSection />
	<ErrorsEndpointsSection />
	<ErrorsLogSection />
</div>

<MobileBottomNav items={navItems} activeHref="{base}/chyby" />
