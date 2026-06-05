<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { Report } from '$lib/types/report';
	import ReportTableRow from '../components/ReportTableRow.svelte';

	interface Props {
		reports: Report[];
		totalCount: number;
		onDownload: (reportId: string) => void;
	}

	const { reports, totalCount, onDownload }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}
</script>

<div
	class="fade-in-up hidden overflow-hidden rounded-2xl border border-gray-800 bg-navy-card shadow-card delay-3 lg:block"
>
	<div class="flex items-center justify-between border-b border-gray-800 px-6 py-4">
		<h3 class="text-base font-semibold text-white">{tx('reports.table.title')}</h3>
		<div class="flex items-center gap-2">
			<span class="text-xs text-text-muted">
				{tx('reports.table.shown', { filtered: reports.length, total: totalCount })}
			</span>
		</div>
	</div>

	<div class="grid grid-cols-12 gap-2 border-b border-gray-800/60 bg-navy-main/40 px-6 py-3">
		<div class="col-span-1 text-[10px] font-semibold tracking-wider text-text-muted uppercase">
			{tx('reports.table.id')}
		</div>
		<div
			class="col-span-3 flex items-center gap-1 text-[10px] font-semibold tracking-wider text-text-muted uppercase"
		>
			{tx('reports.table.date')} <i class="fa-solid fa-sort sort-icon text-gray-600"></i>
		</div>
		<div
			class="col-span-2 flex items-center gap-1 text-[10px] font-semibold tracking-wider text-text-muted uppercase"
		>
			{tx('reports.table.files')} <i class="fa-solid fa-sort sort-icon text-gray-600"></i>
		</div>
		<div
			class="col-span-2 flex items-center gap-1 text-[10px] font-semibold tracking-wider text-text-muted uppercase"
		>
			{tx('reports.table.fields')} <i class="fa-solid fa-sort sort-icon text-gray-600"></i>
		</div>
		<div class="col-span-2 text-[10px] font-semibold tracking-wider text-text-muted uppercase">
			{tx('reports.table.tags')}
		</div>
		<div class="col-span-1 text-[10px] font-semibold tracking-wider text-text-muted uppercase">
			{tx('reports.table.status')}
		</div>
		<div
			class="col-span-1 text-right text-[10px] font-semibold tracking-wider text-text-muted uppercase"
		>
			{tx('reports.table.actions')}
		</div>
	</div>

	<div>
		{#each reports as report (report.id)}
			<ReportTableRow {report} {onDownload} />
		{/each}
		{#if reports.length === 0}
			<div class="px-6 py-12 text-center">
				<i class="fa-solid fa-search mb-3 text-2xl text-text-muted"></i>
				<p class="text-sm text-text-muted">{tx('reports.table.noResults')}</p>
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
