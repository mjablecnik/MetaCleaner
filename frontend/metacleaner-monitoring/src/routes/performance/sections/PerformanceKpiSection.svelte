<script lang="ts">
	import { t } from '$lib/i18n';
	import type { PerformanceKpiStat } from '$lib/repositories/performanceRepository';

	let { kpis }: { kpis: PerformanceKpiStat[] } = $props();

	const kpiStats = $derived(kpis);
</script>

<!-- Desktop: Primary KPI Stats -->
<section class="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
	{#each kpiStats as stat (stat.key)}
		<div class="bg-card border border-surface rounded-xl p-5">
			<div class="flex justify-between items-start mb-3">
				<h3 class="text-textSec text-sm font-medium">{t(stat.labelKey)}</h3>
				<span class="px-2 py-0.5 {stat.badgeClass} text-xs rounded-full font-medium"
					>{t(stat.badgeKey)}</span
				>
			</div>
			<div class="flex items-end gap-2 mb-3">
				<span class="text-3xl font-bold {stat.valueClass ?? 'text-textMain'}">{stat.value}</span>
				{#if stat.unit}
					<span class="text-sm text-textSec mb-1">{stat.unit}</span>
				{/if}
				{#if stat.trend}
					<span
						class="text-sm {stat.trendPositive
							? 'text-success'
							: 'text-error'} mb-1 flex items-center gap-1"
					>
						<i class="fa-solid {stat.trendUp ? 'fa-arrow-up' : 'fa-arrow-down'} text-xs"
						></i>{stat.trend}
					</span>
				{/if}
			</div>
			{#if stat.barWidth}
				<div class="w-full h-1.5 bg-surface rounded-full overflow-hidden">
					<div class="h-full {stat.barClass} rounded-full" style="width:{stat.barWidth}"></div>
				</div>
			{/if}
			<p class="text-xs text-textSec mt-2">{stat.subtextIsKey ? t(stat.subtext) : stat.subtext}</p>
		</div>
	{/each}
</section>

<!-- Desktop: Secondary KPI Stats — no real data source available -->
<section class="hidden lg:block bg-card border border-surface rounded-xl p-5">
	<p class="text-sm text-textSec text-center py-4">{t('common_labels_noData')}</p>
</section>

<!-- Mobile: Primary KPI Stats -->
<section class="lg:hidden grid grid-cols-2 gap-3">
	{#each kpiStats as stat (stat.key)}
		<div class="bg-card border border-surface rounded-xl p-4">
			<div class="flex items-start justify-between mb-2">
				<h3 class="text-textSec text-xs font-medium leading-tight">
					{#if stat.key === 'avgResponseTime'}
						{t('performance_kpi_avgResponseTimeMobile')}
					{:else}
						{t(stat.labelKey)}
					{/if}
				</h3>
				<span
					class="px-1.5 py-0.5 {stat.badgeClass} text-xs rounded-full font-medium flex-shrink-0 ml-1"
				>
					{#if stat.key === 'apdex'}✓{:else if stat.key === 'errorRate'}⚠{:else if stat.key === 'throughput'}N{:else}{t(
							stat.badgeKey
						)}{/if}
				</span>
			</div>
			<div class="flex items-end gap-1 mb-2">
				<span class="text-2xl font-bold {stat.valueClass ?? 'text-textMain'}">{stat.value}</span>
				{#if stat.unit}
					<span class="text-xs text-textSec mb-0.5">{stat.unit}</span>
				{/if}
				{#if stat.trend}
					<span
						class="text-xs {stat.trendPositive
							? 'text-success'
							: 'text-error'} mb-0.5 flex items-center gap-0.5"
					>
						<i class="fa-solid {stat.trendUp ? 'fa-arrow-up' : 'fa-arrow-down'} text-xs"
						></i>{stat.trend}
					</span>
				{/if}
			</div>
			{#if stat.barWidth}
				<div class="w-full h-1.5 bg-surface rounded-full overflow-hidden">
					<div class="h-full {stat.barClass} rounded-full" style="width:{stat.barWidth}"></div>
				</div>
			{/if}
			<p class="text-xs text-textSec mt-1.5">{stat.subtextIsKey ? t(stat.subtext) : stat.subtext}</p>
		</div>
	{/each}
</section>

<!-- Mobile: System Resources — no real data source available -->
<section class="lg:hidden bg-card border border-surface rounded-xl p-4">
	<h3 class="text-sm font-semibold text-textMain mb-3">{t('performance_resources_title')}</h3>
	<p class="text-sm text-textSec text-center py-4">{t('common_labels_noData')}</p>
</section>
