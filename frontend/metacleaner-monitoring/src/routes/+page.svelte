<script lang="ts">
	import { t } from '$lib/i18n';
	import PageHeader from '$lib/shared/components/PageHeader.svelte';
	import DashboardKpiSection from './sections/DashboardKpiSection.svelte';
	import DashboardChartsRow1Section from './sections/DashboardChartsRow1Section.svelte';
	import DashboardChartsRow2Section from './sections/DashboardChartsRow2Section.svelte';
	import DashboardAlertsSection from './sections/DashboardAlertsSection.svelte';
</script>

{#snippet statusBadge()}
	<div
		class="flex items-center gap-2 px-3 py-2.5 lg:py-1.5 bg-success/10 border border-success/20 rounded-xl lg:rounded-lg text-success text-sm font-medium w-full lg:w-auto"
	>
		<div class="w-2.5 lg:w-2 h-2.5 lg:h-2 rounded-full bg-success animate-pulse shrink-0"></div>
		{t('common_status_allSystemsOperational')}
	</div>
{/snippet}

{#snippet actions()}
	<button
		class="px-4 py-2 bg-surface hover:bg-surface-hover text-white rounded-lg text-sm font-medium transition-colors border border-border"
	>
		<i class="fa-solid fa-download mr-2"></i>{t('common_actions_export')}
	</button>
{/snippet}

<PageHeader
	titleKey="dashboard_header_title"
	subtitleKey="dashboard_header_subtitle"
	titleMobileKey="dashboard_header_titleMobile"
	subtitleMobileKey="dashboard_header_subtitleMobile"
	{statusBadge}
	{actions}
/>

<div class="p-4 lg:p-6 max-w-7xl mx-auto space-y-5 lg:space-y-6">
	<DashboardKpiSection />
	<DashboardChartsRow1Section />
	<DashboardChartsRow2Section />
	<DashboardAlertsSection />
</div>
