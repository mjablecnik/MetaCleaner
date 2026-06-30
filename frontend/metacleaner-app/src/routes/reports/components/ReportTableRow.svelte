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
		report?.fieldsColor === 'orange' ? 'text-brand-orange' : 'text-white'
	);
</script>

<div
	class="report-row grid grid-cols-12 items-center gap-2 border-b border-gray-800/40 px-6 py-4 last:border-0"
>
	<div class="col-span-1">
		<span class="font-mono text-[10px] text-text-muted">{report?.id}</span>
	</div>

	<div class="col-span-3">
		<p class="text-sm font-semibold text-white">{report?.date}</p>
		<p class="text-[10px] text-text-muted">{report?.time} · {report?.duration}</p>
	</div>

	<div class="col-span-2 flex items-center gap-2">
		<div
			class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg {iconStyle(
				report?.iconColor
			)}"
		>
			<i class="fa-solid {report?.type === 'video' ? 'fa-video' : 'fa-image'} text-[10px]"></i>
		</div>
		<div>
			<p class="text-xs font-semibold text-white">{fileCountLabel(report?.fileCount)}</p>
			<p class="text-[10px] text-text-muted">{report?.fileTypes}</p>
		</div>
	</div>

	<div class="col-span-2">
		<p class="text-sm font-bold {fieldsTextClass}">{report?.fields}</p>
		<p class="text-[10px] text-text-muted">{tx('reports.table.fieldsRemoved')}</p>
	</div>

	<div class="col-span-2 flex flex-wrap gap-1">
		{#each (report?.tags ?? []) as tag (tag)}
			<span class="rounded border px-1.5 py-0.5 text-[9px] font-semibold {tagStyle(tag)}"
				>{tag}</span
			>
		{/each}
	</div>

	<div class="col-span-1">
		<div class="flex items-center gap-1.5">
			<div class="h-2 w-2 flex-shrink-0 rounded-full bg-brand-green"></div>
			<span class="hidden text-[10px] font-semibold text-brand-green lg:block">OK</span>
		</div>
	</div>

	<div class="col-span-1 flex items-center justify-end gap-1">
		<a
			href={resolve(`/report/${report?.reportId}` as Pathname)}
			title={tx('reports.table.viewReport')}
			class="flex h-7 w-7 items-center justify-center rounded-lg border border-brand-blue/20 bg-brand-blue/10 transition-colors hover:bg-brand-blue/20"
		>
			<i class="fa-solid fa-eye text-[10px] text-brand-blue"></i>
		</a>
		<button
			onclick={() => onDownload(report?.reportId)}
			title={tx('reports.table.downloadPdf')}
			class="flex h-7 w-7 items-center justify-center rounded-lg border border-brand-green/20 bg-brand-green/10 transition-colors hover:bg-brand-green/20"
		>
			<i class="fa-solid fa-download text-[10px] text-brand-green"></i>
		</button>
	</div>
</div>

<style>
	.report-row {
		transition: background 0.15s;
	}
	.report-row:hover {
		background: var(--color-navy-lighter-50);
	}
</style>
