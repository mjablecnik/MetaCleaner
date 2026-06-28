<script lang="ts">
	import { t } from '$lib/i18n';
	import type { DbKpi } from '$lib/repositories/databaseRepository';

	let { kpis }: { kpis: DbKpi[] } = $props();
</script>

<!-- Desktop: 4-col KPI grid -->
<section class="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
	<!-- activeConnections -->
	<div class="bg-card border border-surface rounded-xl p-5">
		<div class="flex justify-between items-start mb-3">
			<h3 class="text-textSec text-sm font-medium">{t(kpis[0].labelKey)}</h3>
			<span class="px-2 py-0.5 {kpis[0].badgeClass} text-xs rounded-full font-medium"
				>{t(kpis[0].badgeKey)}</span
			>
		</div>
		<div class="flex items-end gap-2 mb-3">
			<span class="text-3xl font-bold text-textMain">{kpis[0].value}</span>
			<span class="text-sm text-textSec mb-1">{kpis[0].max}</span>
		</div>
		<div class="w-full h-1.5 bg-surface rounded-full overflow-hidden">
			<div class="h-full {kpis[0].barClass} rounded-full" style="width:{kpis[0].barWidth}"></div>
		</div>
		<p class="text-xs text-textSec mt-2">{kpis[0].subtext}</p>
	</div>

	<!-- queryLatency -->
	<div class="bg-card border border-surface rounded-xl p-5">
		<div class="flex justify-between items-start mb-3">
			<h3 class="text-textSec text-sm font-medium">{t(kpis[1].labelKey)}</h3>
			<span class="px-2 py-0.5 {kpis[1].badgeClass} text-xs rounded-full font-medium"
				>{t(kpis[1].badgeKey)}</span
			>
		</div>
		<div class="flex items-end gap-2">
			<span class="text-3xl font-bold text-textMain">{kpis[1].value}</span>
			<span class="text-sm text-textSec mb-1">{kpis[1].unit}</span>
			<span class="text-sm {kpis[1].trendClass} mb-1 flex items-center gap-1 ml-1">
				<i class="fa-solid fa-arrow-down text-xs"></i>{kpis[1].trend}
			</span>
		</div>
		<p class="text-xs text-textSec mt-2">{kpis[1].subtext}</p>
	</div>

	<!-- storageUsed -->
	<div class="bg-card border border-surface rounded-xl p-5">
		<div class="flex justify-between items-start mb-3">
			<h3 class="text-textSec text-sm font-medium">{t(kpis[2].labelKey)}</h3>
			<span class="px-2 py-0.5 {kpis[2].badgeClass} text-xs rounded-full font-medium"
				>{t(kpis[2].badgeKey)}</span
			>
		</div>
		<div class="flex items-end gap-2 mb-3">
			<span class="text-3xl font-bold text-textMain">{kpis[2].value}</span>
			<span class="text-sm text-textSec mb-1">{kpis[2].max}</span>
		</div>
		<div class="w-full h-1.5 bg-surface rounded-full overflow-hidden">
			<div class="h-full {kpis[2].barClass} rounded-full" style="width:{kpis[2].barWidth}"></div>
		</div>
		<p class="text-xs text-textSec mt-2">{kpis[2].subtext}</p>
	</div>

	<!-- dbErrors -->
	<div class="bg-card border border-surface rounded-xl p-5">
		<div class="flex justify-between items-start mb-3">
			<h3 class="text-textSec text-sm font-medium">{t(kpis[3].labelKey)}</h3>
			<span class="px-2 py-0.5 {kpis[3].badgeClass} text-xs rounded-full font-medium"
				>{t(kpis[3].badgeKey)}</span
			>
		</div>
		<div class="flex items-end gap-2">
			<span class="text-3xl font-bold {kpis[3].valueClass}">{kpis[3].value}</span>
			<span class="text-sm {kpis[3].trendClass} mb-1 flex items-center gap-1">
				<i class="fa-solid fa-arrow-up text-xs"></i>{kpis[3].trend}
			</span>
		</div>
		<p class="text-xs text-textSec mt-2">{kpis[3].subtext}</p>
	</div>
</section>

<!-- Mobile: 2x2 compact KPI grid -->
<section class="lg:hidden grid grid-cols-2 gap-3">
	<!-- activeConnections -->
	<div class="bg-card border border-surface rounded-xl p-4">
		<div class="flex items-center justify-between mb-2">
			<h3 class="text-textSec text-xs font-medium">{t(kpis[0].labelKey)}</h3>
			<span
				class="px-1.5 py-0.5 bg-secondary/10 text-secondary text-[10px] rounded-full font-medium"
				>!</span
			>
		</div>
		<div class="flex items-end gap-1 mb-2">
			<span class="text-2xl font-bold text-textMain">{kpis[0].value}</span>
			<span class="text-xs text-textSec mb-0.5">{kpis[0].max}</span>
		</div>
		<div class="w-full h-1.5 bg-surface rounded-full overflow-hidden mb-1">
			<div class="h-full {kpis[0].barClass} rounded-full" style="width:{kpis[0].barWidth}"></div>
		</div>
		<p class="text-[10px] text-secondary font-medium">{t('common_status_warning')} · 87%</p>
	</div>

	<!-- queryLatency -->
	<div class="bg-card border border-surface rounded-xl p-4">
		<div class="flex items-center justify-between mb-2">
			<h3 class="text-textSec text-xs font-medium">{t(kpis[1].labelKey)}</h3>
			<span class="px-1.5 py-0.5 bg-success/10 text-success text-[10px] rounded-full font-medium"
				>OK</span
			>
		</div>
		<div class="flex items-end gap-1 mb-1">
			<span class="text-2xl font-bold text-textMain">{kpis[1].value}</span>
			<span class="text-xs text-textSec mb-0.5">{kpis[1].unit}</span>
			<span class="text-xs {kpis[1].trendClass} mb-0.5 flex items-center gap-0.5 ml-1">
				<i class="fa-solid fa-arrow-down text-[9px]"></i>{kpis[1].trend}
			</span>
		</div>
		<p class="text-[10px] text-textSec">{kpis[1].subtext}</p>
	</div>

	<!-- storageUsed -->
	<div class="bg-card border border-surface rounded-xl p-4">
		<div class="flex items-center justify-between mb-2">
			<h3 class="text-textSec text-xs font-medium">{t(kpis[2].labelKey)}</h3>
			<span class="px-1.5 py-0.5 bg-success/10 text-success text-[10px] rounded-full font-medium"
				>OK</span
			>
		</div>
		<div class="flex items-end gap-1 mb-2">
			<span class="text-2xl font-bold text-textMain">{kpis[2].value}</span>
			<span class="text-xs text-textSec mb-0.5">{kpis[2].max}</span>
		</div>
		<div class="w-full h-1.5 bg-surface rounded-full overflow-hidden mb-1">
			<div class="h-full {kpis[2].barClass} rounded-full" style="width:{kpis[2].barWidth}"></div>
		</div>
		<p class="text-[10px] text-textSec">77.5% využito</p>
	</div>

	<!-- dbErrors -->
	<div class="bg-card border border-surface rounded-xl p-4">
		<div class="flex items-center justify-between mb-2">
			<h3 class="text-textSec text-xs font-medium">{t(kpis[3].labelKey)}</h3>
			<span class="px-1.5 py-0.5 {kpis[3].badgeClass} text-[10px] rounded-full font-medium"
				>{t(kpis[3].badgeKey)}</span
			>
		</div>
		<div class="flex items-end gap-1 mb-1">
			<span class="text-2xl font-bold {kpis[3].valueClass}">{kpis[3].value}</span>
			<span class="text-xs {kpis[3].trendClass} mb-0.5 flex items-center gap-0.5">
				<i class="fa-solid fa-arrow-up text-[9px]"></i>{kpis[3].trend}
			</span>
		</div>
		<p class="text-[10px] text-textSec">Timeout, deadlock</p>
	</div>
</section>
