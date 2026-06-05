<script lang="ts">
	import { currentLocale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { Report } from '$lib/repositories/reportRepository';

	interface Props {
		report: Report;
		onDownload: (reportId: string) => void;
	}

	const { report, onDownload }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		currentLocale;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}

	function fileCountLabel(n: number): string {
		if (n === 1) return tx('reports.fileCount.one');
		if (n >= 2 && n <= 4) return tx('reports.fileCount.few', { count: n });
		return tx('reports.fileCount.many', { count: n });
	}

	function tagStyle(tag: string): string {
		if (tag === 'GPS') return 'bg-brand-red/10 border-brand-red/20 text-brand-red';
		if (tag === 'EXIF') return 'bg-brand-orange/10 border-brand-orange/20 text-brand-orange';
		if (tag === 'XMP') return 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue';
		return 'bg-navy-lighter text-text-muted';
	}

	function iconStyle(color: string): string {
		if (color === 'green') return 'bg-brand-green/10 border-brand-green/20 text-brand-green';
		if (color === 'orange') return 'bg-brand-orange/10 border-brand-orange/20 text-brand-orange';
		return 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue';
	}

	const fieldsTextClass = $derived(
		report.fieldsColor === 'orange' ? 'text-brand-orange' : 'text-white'
	);
</script>

<div class="report-row grid grid-cols-12 gap-2 px-6 py-4 border-b border-gray-800/40 items-center last:border-0">
	<div class="col-span-1">
		<span class="text-[10px] font-mono text-text-muted">{report.id}</span>
	</div>

	<div class="col-span-3">
		<p class="text-sm font-semibold text-white">{report.date}</p>
		<p class="text-[10px] text-text-muted">{report.time} · {report.duration}</p>
	</div>

	<div class="col-span-2 flex items-center gap-2">
		<div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 {iconStyle(report.iconColor)}">
			<i class="fa-solid {report.type === 'video' ? 'fa-video' : 'fa-file-lines'} text-[10px]"></i>
		</div>
		<div>
			<p class="text-xs font-semibold text-white">{fileCountLabel(report.fileCount)}</p>
			<p class="text-[10px] text-text-muted">{report.fileTypes}</p>
		</div>
	</div>

	<div class="col-span-2">
		<p class="text-sm font-bold {fieldsTextClass}">{report.fields}</p>
		<p class="text-[10px] text-text-muted">{tx('reports.table.fieldsRemoved')}</p>
	</div>

	<div class="col-span-2 flex flex-wrap gap-1">
		{#each report.tags as tag}
			<span class="text-[9px] px-1.5 py-0.5 rounded border font-semibold {tagStyle(tag)}">{tag}</span>
		{/each}
	</div>

	<div class="col-span-1">
		<div class="flex items-center gap-1.5">
			<div class="w-2 h-2 rounded-full bg-brand-green flex-shrink-0"></div>
			<span class="text-[10px] text-brand-green font-semibold hidden lg:block">OK</span>
		</div>
	</div>

	<div class="col-span-1 flex items-center justify-end gap-1">
		<a
			href="/report"
			title={tx('reports.table.viewReport')}
			class="w-7 h-7 rounded-lg bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center hover:bg-brand-blue/20 transition-colors"
		>
			<i class="fa-solid fa-eye text-brand-blue text-[10px]"></i>
		</a>
		<button
			onclick={() => onDownload(report.reportId)}
			title={tx('reports.table.downloadPdf')}
			class="w-7 h-7 rounded-lg bg-brand-green/10 border border-brand-green/20 flex items-center justify-center hover:bg-brand-green/20 transition-colors"
		>
			<i class="fa-solid fa-download text-brand-green text-[10px]"></i>
		</button>
	</div>
</div>

<style>
	.report-row {
		transition: background 0.15s;
	}
	.report-row:hover {
		background: rgba(30, 41, 59, 0.5);
	}
</style>
