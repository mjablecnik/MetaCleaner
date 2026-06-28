<script lang="ts">
	import StatCard from '$lib/shared/elements/StatCard.svelte';
	import type { DashboardStat } from '$lib/repositories/dashboardRepository';

	let { stats }: { stats: DashboardStat[] } = $props();

	const us = $derived(stats.find((s) => s.key === 'uptimeServer')!);
	const jp = $derived(stats.find((s) => s.key === 'jobsProcessed')!);
	const act = $derived(stats.find((s) => s.key === 'avgCleaningTime')!);
	const fj = $derived(stats.find((s) => s.key === 'failedJobs')!);
</script>

<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
	<StatCard
		labelKey={us.labelKey}
		value={us.value}
		icon={us.icon}
		iconClass={us.iconClass}
		barWidth={us.barWidth}
		barClass={us.barClass}
	/>
	<StatCard
		labelKey={jp.labelKey}
		value={jp.value}
		icon={jp.icon}
		iconClass={jp.iconClass}
		subtextKey={jp.subtextMobile}
	/>
	<StatCard
		labelKey={act.labelKey}
		value={act.value}
		icon={act.icon}
		iconClass={act.iconClass}
		subtextKey={act.subtextMobile}
	/>
	<StatCard
		labelKey={fj.labelKey}
		value={fj.value}
		icon={fj.icon}
		iconClass={fj.iconClass}
		trend={fj.trend}
		trendPositive={fj.trendPositive}
	/>
</section>
