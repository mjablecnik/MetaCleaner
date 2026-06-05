<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { Report } from '$lib/repositories/reportRepository';
	import ReportCard from '../components/ReportCard.svelte';

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
	class="fade-in-up flex flex-col gap-0 overflow-hidden rounded-2xl border border-gray-800 bg-navy-card shadow-card delay-3 lg:hidden"
>
	<div class="flex items-center justify-between border-b border-gray-800 px-4 py-3">
		<h3 class="text-sm font-semibold text-white">{tx('reports.table.title')}</h3>
		<span class="text-xs text-text-muted">
			{tx('reports.table.shown', { filtered: reports.length, total: totalCount })}
		</span>
	</div>
	<div>
		{#each reports as report (report.id)}
			<ReportCard {report} {onDownload} />
		{/each}
		{#if reports.length === 0}
			<div class="px-4 py-10 text-center">
				<i class="fa-solid fa-search mb-3 text-xl text-text-muted"></i>
				<p class="text-sm text-text-muted">{tx('reports.table.noResults')}</p>
			</div>
		{/if}
	</div>
</div>
