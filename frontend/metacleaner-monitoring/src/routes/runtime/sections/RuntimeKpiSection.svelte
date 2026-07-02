<script lang="ts">
	import { t } from '$lib/i18n';
	import type { RuntimeStat } from '$lib/repositories/runtimeRepository';

	let { stats }: { stats: RuntimeStat[] } = $props();

	const runtimeStats = $derived(stats);
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
						<span class="px-2 py-0.5 {stat.badgeClass} text-xs rounded-full font-medium"
							>{t(stat.badgeKey)}</span
						>
					{/if}
				</div>
				<div class="flex items-end gap-2 {stat.barWidth ? 'mb-3' : ''}">
					<span class="text-3xl font-bold {stat.valueClass ?? 'text-textMain'}">{stat.value}</span>
					{#if stat.unit}
						<span class="text-sm text-textSec mb-1">{stat.unit}</span>
					{/if}
					{#if stat.trend}
						<span
							class="text-sm {stat.trendClass ??
								'text-secondary'} mb-1 flex items-center gap-1 ml-1"
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
				<p class="text-xs text-textSec mt-2">
					{stat.subtextIsKey ? t(stat.subtext) : stat.subtext}
				</p>
			</div>
		{/each}
	</section>

	<!-- Row 2: secondary KPIs — no real data source available -->
	<section class="bg-card border border-surface rounded-xl p-5">
		<p class="text-sm text-textSec text-center py-4">{t('common_labels_noData')}</p>
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
						<span class="px-1.5 py-0.5 {stat.badgeClass} text-[10px] rounded-full font-medium"
							>{t(stat.badgeKey)}</span
						>
					{/if}
				</div>
				<div class="flex items-end gap-1 {stat.barWidth ? 'mb-2' : ''}">
					<span class="text-2xl font-bold {stat.valueClass ?? 'text-textMain'}">{stat.value}</span>
					{#if stat.unit}
						<span class="text-xs text-textSec mb-0.5">{stat.unit}</span>
					{/if}
					{#if stat.trend}
						<span class="text-xs {stat.trendClass ?? 'text-secondary'} mb-0.5 ml-1">
							<i class="fa-solid {stat.trendUp ? 'fa-arrow-up' : 'fa-arrow-down'} text-xs"
							></i>{stat.trend}
						</span>
					{/if}
				</div>
				{#if stat.barWidth}
					<div class="w-full h-1.5 bg-surface rounded-full overflow-hidden mb-1">
						<div class="h-full {stat.barClass} rounded-full" style="width:{stat.barWidth}"></div>
					</div>
				{/if}
				<p class="text-[10px] text-textSec {!stat.barWidth ? 'mt-1' : ''}">
					{stat.subtextIsKey ? t(stat.subtext) : stat.subtext}
				</p>
			</div>
		{/each}
	</section>

	<!-- Secondary KPIs — no real data source available -->
	<section class="bg-card border border-surface rounded-xl p-4">
		<p class="text-sm text-textSec text-center py-4">{t('common_labels_noData')}</p>
	</section>
</div>
