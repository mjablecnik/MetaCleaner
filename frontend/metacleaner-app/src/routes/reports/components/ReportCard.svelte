<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { tagStyle, iconStyle } from '$lib/shared/utils/reportStyles';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import type { Report } from '$lib/types/report';

	interface Props {
		report: Report;
		onDownload: (reportId: string) => void;
	}

	const { report, onDownload }: Props = $props();

	function fileCountLabel(n: number): string {
		if (n === 1) return tx('reports.fileCount.one');
		if (n >= 2 && n <= 4) return tx('reports.fileCount.few', { count: n });
		return tx('reports.fileCount.many', { count: n });
	}

	const fieldsTextClass = $derived(
		report.fieldsColor === 'orange' ? 'text-brand-orange font-bold' : 'text-text-muted'
	);
</script>

<div class="report-card border-b border-gray-800/50 px-4 py-3 last:border-0">
	<div class="flex items-start justify-between gap-2">
		<div class="flex min-w-0 flex-1 items-start gap-3">
			<div
				class="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl {iconStyle(
					report.iconColor
				)} border"
			>
				<i class="fa-solid {report.type === 'video' ? 'fa-video' : 'fa-image'} text-sm"></i>
			</div>
			<div class="min-w-0 flex-1">
				<div class="flex flex-wrap items-center gap-2">
					<span class="text-sm font-bold text-white">{report.date}</span>
					<span class="font-mono text-[10px] text-text-muted">{report.id}</span>
					<div class="h-2 w-2 flex-shrink-0 rounded-full bg-brand-green"></div>
				</div>
				<p class="mt-0.5 text-xs text-text-muted">
					{report.time} · {report.duration} · {fileCountLabel(report.fileCount)} · {report.fileTypes}
				</p>
				<div class="mt-2 flex flex-wrap items-center gap-1.5">
					{#each report.tags as tag (tag)}
						<span class="rounded border px-1.5 py-0.5 text-[10px] font-semibold {tagStyle(tag)}"
							>{tag}</span
						>
					{/each}
					<span class="ml-1 text-[10px] {fieldsTextClass}"
						>{report.fields} {tx('reports.table.fieldsMobile')}</span
					>
				</div>
			</div>
		</div>
		<div class="flex flex-shrink-0 flex-col gap-1.5">
			<a
				href={resolve(`/report/${report.reportId}` as Pathname)}
				title={tx('reports.table.viewReport')}
				class="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-blue/20 bg-brand-blue/10"
			>
				<i class="fa-solid fa-eye text-xs text-brand-blue"></i>
			</a>
			<button
				onclick={() => onDownload(report.reportId)}
				title={tx('reports.table.downloadPdf')}
				class="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-green/20 bg-brand-green/10"
			>
				<i class="fa-solid fa-download text-xs text-brand-green"></i>
			</button>
		</div>
	</div>
</div>

<style>
	.report-card {
		transition: background 0.15s;
	}
	.report-card:active {
		background: var(--color-navy-lighter-60);
	}
</style>
