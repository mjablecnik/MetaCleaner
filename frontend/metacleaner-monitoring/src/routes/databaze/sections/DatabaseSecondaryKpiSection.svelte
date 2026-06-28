<script lang="ts">
	import { t } from '$lib/i18n';
	import { getDbSecondaryKpis } from '$lib/repositories/databaseRepository';

	const secondaryKpis = getDbSecondaryKpis();
</script>

<!-- Desktop: 4-col grid -->
<section class="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
	{#each secondaryKpis as kpi (kpi.key)}
		<div class="bg-card border border-surface rounded-xl p-5">
			<div class="flex items-center gap-3 mb-3">
				<div class="w-8 h-8 rounded-lg {kpi.iconClass} flex items-center justify-center">
					<i class="fa-solid {kpi.icon} text-xs"></i>
				</div>
				<h3 class="text-textSec text-sm font-medium">{t(kpi.labelKey)}</h3>
			</div>
			<div class="text-2xl font-bold text-textMain">
				{#if kpi.key === 'backups'}
					{t('database_kpi_backupStatus')}
				{:else}
					{kpi.value}
				{/if}
			</div>
			<p class="text-xs text-textSec mt-1">{kpi.subtext}</p>
		</div>
	{/each}
</section>

<!-- Mobile: horizontal scroll row -->
<section class="lg:hidden flex gap-3 overflow-x-auto pb-1">
	{#each secondaryKpis as kpi (kpi.key)}
		<div class="bg-card border border-surface rounded-xl p-4 flex-shrink-0 w-36">
			<div class="w-7 h-7 rounded-lg {kpi.iconClass} flex items-center justify-center mb-2">
				<i class="fa-solid {kpi.icon} text-xs"></i>
			</div>
			<div class="text-lg font-bold text-textMain">
				{#if kpi.key === 'backups'}
					{t('database_kpi_backupStatus')}
				{:else}
					{kpi.value}
				{/if}
			</div>
			<p class="text-[10px] text-textSec mt-0.5">{t(kpi.labelKey)}</p>
			<p class="text-[10px] text-textSec">{kpi.subtext}</p>
		</div>
	{/each}
</section>
