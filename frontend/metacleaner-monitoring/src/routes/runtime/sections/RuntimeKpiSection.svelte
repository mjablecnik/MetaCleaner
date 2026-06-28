<script lang="ts">
	import { t } from '$lib/i18n';
	import { getRuntimeStats, getRuntimeSecondaryKpis } from '$lib/repositories/runtimeRepository';

	const runtimeStats = getRuntimeStats();
	const secondaryKpis = getRuntimeSecondaryKpis();
</script>

<!-- Desktop: 4-col KPI grids -->
<div class="hidden lg:block space-y-4">
	<!-- Row 1: primary stats -->
	<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		{#each runtimeStats as stat (stat.key)}
			<div class="bg-card border border-surface rounded-xl p-5">
				<div class="flex justify-between items-start mb-3">
					<h3 class="text-textSec text-sm font-medium">{t(stat.labelKey)}</h3>
					{#if stat.badgeKey}
						<span class="px-2 py-0.5 {stat.badgeClass} text-xs rounded-full font-medium">{t(stat.badgeKey)}</span>
					{/if}
				</div>
				<div class="flex items-end gap-2 {stat.barWidth ? 'mb-3' : ''}">
					<span class="text-3xl font-bold {stat.valueClass ?? 'text-textMain'}">{stat.value}</span>
					{#if stat.unit}
						<span class="text-sm text-textSec mb-1">{stat.unit}</span>
					{/if}
					{#if stat.trend}
						<span class="text-sm {stat.trendClass ?? 'text-secondary'} mb-1 flex items-center gap-1 ml-1">
							<i class="fa-solid {stat.trendUp ? 'fa-arrow-up' : 'fa-arrow-down'} text-xs"></i>{stat.trend}
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

	<!-- Row 2: secondary KPIs -->
	<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		{#each secondaryKpis as kpi (kpi.key)}
			<div class="bg-card border border-surface rounded-xl p-5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-8 h-8 rounded-lg {kpi.iconClass} flex items-center justify-center">
						<i class="fa-solid {kpi.icon} text-xs"></i>
					</div>
					<h3 class="text-textSec text-sm font-medium">{t(kpi.labelKey)}</h3>
				</div>
				<div class="text-2xl font-bold text-textMain">
					{kpi.value}{#if kpi.unit}<span class="text-sm font-normal text-textSec"> {kpi.unit}</span>{/if}
				</div>
				<p class="text-xs text-textSec mt-1">{kpi.subtext}</p>
			</div>
		{/each}
	</section>
</div>

<!-- Mobile: 2×2 grids -->
<div class="lg:hidden space-y-4">
	<!-- Primary stats 2×2 -->
	<section class="grid grid-cols-2 gap-3">
		{#each runtimeStats as stat (stat.key)}
			<div class="bg-card border border-surface rounded-xl p-4">
				<div class="flex items-start justify-between mb-2">
					<p class="text-textSec text-xs font-medium">{t(stat.labelKey)}</p>
					{#if stat.badgeKey}
						<span class="px-1.5 py-0.5 {stat.badgeClass} text-[10px] rounded-full font-medium">{t(stat.badgeKey)}</span>
					{/if}
				</div>
				<div class="flex items-end gap-1 {stat.barWidth ? 'mb-2' : ''}">
					<span class="text-2xl font-bold {stat.valueClass ?? 'text-textMain'}">{stat.value}</span>
					{#if stat.unit}
						<span class="text-xs text-textSec mb-0.5">{stat.unit}</span>
					{/if}
					{#if stat.trend}
						<span class="text-xs {stat.trendClass ?? 'text-secondary'} mb-0.5 ml-1">
							<i class="fa-solid {stat.trendUp ? 'fa-arrow-up' : 'fa-arrow-down'} text-xs"></i>{stat.trend}
						</span>
					{/if}
				</div>
				{#if stat.barWidth}
					<div class="w-full h-1.5 bg-surface rounded-full overflow-hidden mb-1">
						<div class="h-full {stat.barClass} rounded-full" style="width:{stat.barWidth}"></div>
					</div>
				{/if}
				<p class="text-[10px] text-textSec {!stat.barWidth ? 'mt-1' : ''}">{stat.subtext}</p>
			</div>
		{/each}
	</section>

	<!-- Secondary KPIs 2×2 -->
	<section class="grid grid-cols-2 gap-3">
		{#each secondaryKpis as kpi (kpi.key)}
			<div class="bg-card border border-surface rounded-xl p-4">
				<div class="flex items-center gap-2 mb-2">
					<div class="w-7 h-7 rounded-lg {kpi.iconClass} flex items-center justify-center flex-shrink-0">
						<i class="fa-solid {kpi.icon} text-xs"></i>
					</div>
					<p class="text-textSec text-xs font-medium">{t(kpi.labelKey)}</p>
				</div>
				<div class="text-2xl font-bold text-textMain">
					{kpi.value}{#if kpi.unit}<span class="text-sm font-normal text-textSec"> {kpi.unit}</span>{/if}
				</div>
				<p class="text-[10px] text-textSec mt-1">{kpi.subtext}</p>
			</div>
		{/each}
	</section>
</div>
