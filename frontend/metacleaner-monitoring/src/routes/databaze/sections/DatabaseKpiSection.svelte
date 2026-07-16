<script lang="ts">
	import { t } from '$lib/i18n';
	import type { DbKpi } from '$lib/repositories/databaseRepository';

	let { kpis }: { kpis: DbKpi[] } = $props();

	const storage = $derived(kpis.find((k) => k.key === 'storageUsed'));
	const tableCount = $derived(kpis.find((k) => k.key === 'tableCount'));
</script>

<!-- Desktop: 2-col KPI grid (only metrics with real data) -->
<section class="hidden lg:grid grid-cols-2 gap-4">
	{#if storage}
		<div class="bg-card border border-surface rounded-xl p-5">
			<div class="flex justify-between items-start mb-3">
				<h3 class="text-textSec text-sm font-medium">{t(storage.labelKey)}</h3>
				<span class="px-2 py-0.5 {storage.badgeClass} text-xs rounded-full font-medium"
					>{t(storage.badgeKey)}</span
				>
			</div>
			<div class="flex items-end gap-2 mb-3">
				<span class="text-3xl font-bold text-textMain">{storage.value}</span>
				<span class="text-sm text-textSec mb-1">{storage.unit}</span>
				<span class="text-sm text-textSec mb-1">{storage.max}</span>
			</div>
			{#if storage.barWidth}
				<div class="w-full h-1.5 bg-surface rounded-full overflow-hidden">
					<div
						class="h-full {storage.barClass} rounded-full"
						style="width:{storage.barWidth}"
					></div>
				</div>
			{/if}
			<p class="text-xs text-textSec mt-2">
				{storage.subtextIsKey ? t(storage.subtext) : storage.subtext}
			</p>
		</div>
	{/if}

	{#if tableCount}
		<div class="bg-card border border-surface rounded-xl p-5">
			<div class="flex justify-between items-start mb-3">
				<h3 class="text-textSec text-sm font-medium">{t(tableCount.labelKey)}</h3>
				<span class="px-2 py-0.5 {tableCount.badgeClass} text-xs rounded-full font-medium"
					>{t(tableCount.badgeKey)}</span
				>
			</div>
			<div class="flex items-end gap-2">
				<span class="text-3xl font-bold text-textMain">{tableCount.value}</span>
			</div>
			<p class="text-xs text-textSec mt-2">
				{tableCount.subtextIsKey ? t(tableCount.subtext) : tableCount.subtext}
			</p>
		</div>
	{/if}
</section>

<!-- Mobile: 2-col compact KPI grid -->
<section class="lg:hidden grid grid-cols-2 gap-3">
	{#if storage}
		<div class="bg-card border border-surface rounded-xl p-4">
			<div class="flex items-center justify-between mb-2">
				<h3 class="text-textSec text-xs font-medium">{t(storage.labelKey)}</h3>
				<span class="px-1.5 py-0.5 {storage.badgeClass} text-[10px] rounded-full font-medium"
					>{t(storage.badgeKey)}</span
				>
			</div>
			<div class="flex items-end gap-1 mb-2">
				<span class="text-2xl font-bold text-textMain">{storage.value}</span>
				<span class="text-xs text-textSec mb-0.5">{storage.unit} {storage.max}</span>
			</div>
			{#if storage.barWidth}
				<div class="w-full h-1.5 bg-surface rounded-full overflow-hidden mb-1">
					<div
						class="h-full {storage.barClass} rounded-full"
						style="width:{storage.barWidth}"
					></div>
				</div>
			{/if}
			<p class="text-[10px] text-textSec">
				{storage.subtextIsKey ? t(storage.subtext) : storage.subtext}
			</p>
		</div>
	{/if}

	{#if tableCount}
		<div class="bg-card border border-surface rounded-xl p-4">
			<div class="flex items-center justify-between mb-2">
				<h3 class="text-textSec text-xs font-medium">{t(tableCount.labelKey)}</h3>
				<span class="px-1.5 py-0.5 {tableCount.badgeClass} text-[10px] rounded-full font-medium"
					>{t(tableCount.badgeKey)}</span
				>
			</div>
			<div class="flex items-end gap-1">
				<span class="text-2xl font-bold text-textMain">{tableCount.value}</span>
			</div>
			<p class="text-[10px] text-textSec mt-1">
				{tableCount.subtextIsKey ? t(tableCount.subtext) : tableCount.subtext}
			</p>
		</div>
	{/if}
</section>
