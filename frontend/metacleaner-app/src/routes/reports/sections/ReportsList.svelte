<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import type { Report } from '$lib/types/report';
	import ReportCard from '../components/ReportCard.svelte';

	interface Props {
		reports: Report[];
		totalCount: number;
		onDownload: (reportId: string) => void;
	}

	const { reports, totalCount, onDownload }: Props = $props();
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
