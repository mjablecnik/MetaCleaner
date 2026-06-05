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
		locale.current;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}
</script>

<div class="fade-in-up delay-3 lg:hidden flex flex-col gap-0 bg-navy-card rounded-2xl border border-gray-800 shadow-card overflow-hidden">
	<div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
		<h3 class="font-semibold text-sm text-white">{tx('reports.table.title')}</h3>
		<span class="text-xs text-text-muted">
			{tx('reports.table.shown', { filtered: reports.length, total: totalCount })}
		</span>
	</div>
	<div>
		{#each reports as report}
			<ReportCard {report} {onDownload} />
		{/each}
		{#if reports.length === 0}
			<div class="px-4 py-10 text-center">
				<i class="fa-solid fa-search text-text-muted text-xl mb-3"></i>
				<p class="text-text-muted text-sm">{tx('reports.table.noResults')}</p>
			</div>
		{/if}
	</div>
</div>
