<script lang="ts">
	import { currentLocale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { Report } from '$lib/repositories/reportRepository';
	import ReportTableRow from '../components/ReportTableRow.svelte';

	interface Props {
		reports: Report[];
		totalCount: number;
		onDownload: (reportId: string) => void;
	}

	const { reports, totalCount, onDownload }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		currentLocale;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}
</script>

<div class="fade-in-up delay-3 hidden lg:block bg-navy-card rounded-2xl border border-gray-800 shadow-card overflow-hidden">
	<div class="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
		<h3 class="font-semibold text-base text-white">{tx('reports.table.title')}</h3>
		<div class="flex items-center gap-2">
			<span class="text-xs text-text-muted">
				{tx('reports.table.shown', { filtered: reports.length, total: totalCount })}
			</span>
		</div>
	</div>

	<div class="grid grid-cols-12 gap-2 px-6 py-3 border-b border-gray-800/60 bg-navy-main/40">
		<div class="col-span-1 text-[10px] text-text-muted uppercase tracking-wider font-semibold">
			{tx('reports.table.id')}
		</div>
		<div class="col-span-3 text-[10px] text-text-muted uppercase tracking-wider font-semibold flex items-center gap-1">
			{tx('reports.table.date')} <i class="fa-solid fa-sort sort-icon text-gray-600"></i>
		</div>
		<div class="col-span-2 text-[10px] text-text-muted uppercase tracking-wider font-semibold flex items-center gap-1">
			{tx('reports.table.files')} <i class="fa-solid fa-sort sort-icon text-gray-600"></i>
		</div>
		<div class="col-span-2 text-[10px] text-text-muted uppercase tracking-wider font-semibold flex items-center gap-1">
			{tx('reports.table.fields')} <i class="fa-solid fa-sort sort-icon text-gray-600"></i>
		</div>
		<div class="col-span-2 text-[10px] text-text-muted uppercase tracking-wider font-semibold">
			{tx('reports.table.tags')}
		</div>
		<div class="col-span-1 text-[10px] text-text-muted uppercase tracking-wider font-semibold">
			{tx('reports.table.status')}
		</div>
		<div class="col-span-1 text-[10px] text-text-muted uppercase tracking-wider font-semibold text-right">
			{tx('reports.table.actions')}
		</div>
	</div>

	<div>
		{#each reports as report}
			<ReportTableRow {report} {onDownload} />
		{/each}
		{#if reports.length === 0}
			<div class="px-6 py-12 text-center">
				<i class="fa-solid fa-search text-text-muted text-2xl mb-3"></i>
				<p class="text-text-muted text-sm">{tx('reports.table.noResults')}</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.sort-icon {
		cursor: pointer;
		transition: color 0.15s;
	}
	.sort-icon:hover {
		color: var(--color-text-main);
	}
</style>
