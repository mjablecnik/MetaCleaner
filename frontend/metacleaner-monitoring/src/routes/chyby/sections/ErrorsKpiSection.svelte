<script lang="ts">
	import { t } from '$lib/i18n';
	import type { ErrorKpi } from '$lib/repositories/errorsRepository';

	let { kpis }: { kpis: ErrorKpi[] } = $props();
</script>

<!-- Desktop: 4-col KPI grid -->
<section class="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
	{#each kpis as kpi (kpi.key)}
		<div class="bg-card border border-surface rounded-xl p-5">
			<div class="flex justify-between items-start mb-3">
				<h3 class="text-textSec text-sm font-medium">{t(kpi.labelKey)}</h3>
				<span class="px-2 py-0.5 text-xs rounded-full font-medium {kpi.severityClass}"
					>{t(kpi.severityKey)}</span
				>
			</div>
			<div class="flex items-end gap-2">
				<span class="text-3xl font-bold {kpi.valueClass}">{kpi.value}</span>
				<span class="text-sm {kpi.trendClass} mb-1 flex items-center gap-1">
					<i class="fa-solid {kpi.trendUp ? 'fa-arrow-up' : 'fa-arrow-down'} text-xs"
					></i>{kpi.trend > 0 ? '+' : ''}{kpi.trend}
				</span>
			</div>
			<p class="text-xs text-textSec mt-2">{t(kpi.subtextKey)}</p>
		</div>
	{/each}
</section>

<!-- Mobile: 2x2 compact KPI grid -->
<section class="lg:hidden grid grid-cols-2 gap-3">
	{#each kpis as kpi (kpi.key)}
		<div class="bg-card border border-surface rounded-xl p-4">
			<div class="flex items-center justify-between mb-2">
				<span class="text-textSec text-xs font-medium leading-tight">{t(kpi.labelKeyMobile)}</span>
				<span class="px-1.5 py-0.5 text-[10px] rounded-full font-medium {kpi.severityClass}"
					>{t(kpi.severityKey)}</span
				>
			</div>
			<div class="flex items-end gap-1.5">
				<span class="text-2xl font-bold {kpi.valueClass}">{kpi.value}</span>
				<span class="text-xs {kpi.trendClass} mb-0.5 flex items-center gap-0.5">
					<i class="fa-solid {kpi.trendUp ? 'fa-arrow-up' : 'fa-arrow-down'} text-[10px]"
					></i>{kpi.trend > 0 ? '+' : ''}{kpi.trend}
				</span>
			</div>
			<p class="text-[10px] text-textSec mt-1.5">{t(kpi.subtextKeyMobile)}</p>
		</div>
	{/each}
</section>
