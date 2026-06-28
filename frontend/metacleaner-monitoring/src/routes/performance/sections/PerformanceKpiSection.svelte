<script lang="ts">
	import { t } from '$lib/i18n';
	import { getPerformanceSecondaryKpis } from '$lib/repositories/performanceRepository';
	import type { PerformanceKpiStat } from '$lib/repositories/performanceRepository';

	let { kpis }: { kpis: PerformanceKpiStat[] } = $props();

	const kpiStats = $derived(kpis);
	const secondaryKpis = getPerformanceSecondaryKpis();
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
			<p class="text-xs text-textSec mt-2">{stat.subtext}</p>
		</div>
	{/each}
</section>

<!-- Desktop: Secondary KPI Stats -->
<section class="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
	{#each secondaryKpis as kpi (kpi.key)}
		<div class="bg-card border border-surface rounded-xl p-5">
			<div class="flex items-center gap-3 mb-3">
				<div class="w-8 h-8 rounded-lg {kpi.iconBg} flex items-center justify-center">
					<i class="fa-solid {kpi.icon} {kpi.iconColor} text-xs"></i>
				</div>
				<h3 class="text-textSec text-sm font-medium">{t(kpi.labelKey)}</h3>
			</div>
			{#if kpi.barWidth}
				<div class="flex items-end gap-2 mb-2">
					<span class="text-2xl font-bold text-textMain">{kpi.value}</span>
					{#if kpi.unit}
						<span class="text-sm text-textSec mb-0.5">{kpi.unit}</span>
					{/if}
				</div>
				<div class="w-full h-1.5 bg-surface rounded-full overflow-hidden">
					<div class="h-full {kpi.barColor} rounded-full" style="width:{kpi.barWidth}"></div>
				</div>
			{:else}
				<div class="text-2xl font-bold text-textMain">
					{kpi.value} <span class="text-sm font-normal text-textSec">{kpi.unit}</span>
				</div>
			{/if}
			<p class="text-xs text-textSec mt-2">{kpi.subtext}</p>
		</div>
	{/each}
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
			<p class="text-xs text-textSec mt-1.5">{stat.subtext}</p>
		</div>
	{/each}
</section>

<!-- Mobile: System Resources -->
<section class="lg:hidden bg-card border border-surface rounded-xl p-4">
	<h3 class="text-sm font-semibold text-textMain mb-3">{t('performance_resources_title')}</h3>
	<div class="grid grid-cols-2 gap-4">
		{#each secondaryKpis as kpi (kpi.key)}
			<div>
				<div class="flex items-center gap-2 mb-2">
					<div
						class="w-6 h-6 rounded-md {kpi.iconBg} flex items-center justify-center flex-shrink-0"
					>
						<i class="fa-solid {kpi.icon} {kpi.iconColor} text-xs"></i>
					</div>
					<span class="text-textSec text-xs">{kpi.shortLabel}</span>
				</div>
				{#if kpi.barWidth}
					<div class="flex items-end gap-1 mb-1.5">
						<span class="text-xl font-bold text-textMain">{kpi.value}</span>
						{#if kpi.unit}
							<span class="text-xs text-textSec mb-0.5">{kpi.unit}</span>
						{/if}
					</div>
					<div class="w-full h-1.5 bg-surface rounded-full overflow-hidden">
						<div class="h-full {kpi.barColor} rounded-full" style="width:{kpi.barWidth}"></div>
					</div>
				{:else}
					<div class="flex items-end gap-1">
						<span class="text-xl font-bold text-textMain">{kpi.value}</span>
						{#if kpi.unit}
							<span class="text-xs text-textSec mb-0.5">{kpi.unit}</span>
						{/if}
					</div>
				{/if}
				<p class="text-xs text-textSec mt-1">{kpi.subtext}</p>
			</div>
		{/each}
	</div>
</section>
