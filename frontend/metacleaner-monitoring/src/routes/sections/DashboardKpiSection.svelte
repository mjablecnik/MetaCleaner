<script lang="ts">
	import { t } from '$lib/i18n';
	import StatCard from '$lib/shared/elements/StatCard.svelte';
	import { getDashboardStats } from '$lib/repositories/dashboardRepository';

	const stats = getDashboardStats();
	const uf = stats.find((s) => s.key === 'uptimeFrontend')!;
	const ub = stats.find((s) => s.key === 'uptimeBackend')!;
	const er = stats.find((s) => s.key === 'errorRate')!;
	const db = stats.find((s) => s.key === 'dbHealth')!;

	const mobileIconBg = 'bg-surface lg:bg-transparent p-2 lg:p-0 rounded-lg lg:rounded-none';
</script>

<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
	<StatCard
		labelKey={uf.labelKey}
		value={uf.value}
		icon={uf.icon}
		iconClass="{uf.iconClass} {mobileIconBg}"
		barWidth={uf.barWidth}
		barClass={uf.barClass}
	/>
	<StatCard
		labelKey={ub.labelKey}
		value={ub.value}
		icon={ub.icon}
		iconClass="{ub.iconClass} {mobileIconBg}"
		barWidth={ub.barWidth}
		barClass={ub.barClass}
	/>
	<StatCard
		labelKey={er.labelKey}
		value={er.value}
		icon={er.icon}
		iconClass={er.iconClass}
		trend={er.trend}
		trendPositive={er.trendPositive}
		subtextKey={er.subtextMobile}
	/>
	<!-- DB Health — responsive value color and mobile/desktop subtext -->
	<div class="bg-card border border-surface rounded-2xl lg:rounded-xl p-5 shadow-sm">
		<div class="flex justify-between items-start mb-3 lg:mb-4">
			<h3 class="text-textSec text-sm font-medium">{t(db.labelKey)}</h3>
			<i class="fa-solid {db.icon} {db.iconClass} {mobileIconBg}"></i>
		</div>
		<span class="text-3xl font-bold text-success lg:text-textMain tracking-tight"
			>{t('common_status_healthy')}</span
		>
		<p class="text-xs lg:text-sm text-textSec mt-2">
			<span class="lg:hidden">{t(db.subtextMobile!)}</span>
			<span class="hidden lg:inline">{t(db.subtextDesktop!)}</span>
		</p>
	</div>
</section>
