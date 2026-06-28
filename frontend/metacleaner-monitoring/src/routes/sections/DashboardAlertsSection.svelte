<script lang="ts">
	import { t } from '$lib/i18n';
	import AlertItem from '../components/AlertItem.svelte';
	import { getDashboardAlerts } from '$lib/repositories/dashboardRepository';

	const alerts = getDashboardAlerts();
</script>

<section class="bg-card border border-surface rounded-2xl lg:rounded-xl p-4 lg:p-5 shadow-sm">
	<div class="flex justify-between items-center mb-4 lg:mb-6">
		<h3 class="text-base lg:text-lg font-semibold text-textMain">
			{t('dashboard_alerts_title')}
			<span class="hidden lg:inline">{t('dashboard_alerts_titleSuffix')}</span>
		</h3>
		<button class="text-sm font-medium text-textSec hover:text-textMain transition-colors">
			<span class="lg:hidden">{t('common_status_all')}</span>
			<span class="hidden lg:inline">{t('common_actions_showAll')}</span>
		</button>
	</div>

	<div class="space-y-3">
		{#each alerts as alert (alert.id)}
			<AlertItem
				severity={alert.severity}
				title={alert.title}
				descriptionMobile={alert.descriptionMobile}
				descriptionDesktop={alert.descriptionDesktop}
				timeMobile={alert.timeMobile}
				timeDesktop={alert.timeDesktop}
			/>
		{/each}
	</div>
</section>
