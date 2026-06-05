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
		report.fieldsColor === 'orange' ? 'text-brand-orange font-bold' : 'text-text-muted'
	);
</script>

<div class="report-card px-4 py-3 border-b border-gray-800/50 last:border-0">
	<div class="flex items-start justify-between gap-2">
		<div class="flex items-start gap-3 flex-1 min-w-0">
			<div
				class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 {iconStyle(report.iconColor)} border"
			>
				<i class="fa-solid {report.type === 'video' ? 'fa-video' : 'fa-image'} text-sm"></i>
			</div>
			<div class="flex-1 min-w-0">
				<div class="flex items-center gap-2 flex-wrap">
					<span class="text-sm font-bold text-white">{report.date}</span>
					<span class="text-[10px] font-mono text-text-muted">{report.id}</span>
					<div class="w-2 h-2 rounded-full bg-brand-green flex-shrink-0"></div>
				</div>
				<p class="text-xs text-text-muted mt-0.5">
					{report.time} · {report.duration} · {fileCountLabel(report.fileCount)} · {report.fileTypes}
				</p>
				<div class="flex items-center gap-1.5 mt-2 flex-wrap">
					{#each report.tags as tag}
						<span class="text-[10px] px-1.5 py-0.5 rounded border font-semibold {tagStyle(tag)}">{tag}</span>
					{/each}
					<span class="text-[10px] ml-1 {fieldsTextClass}">{report.fields} {tx('reports.table.fieldsMobile')}</span>
				</div>
			</div>
		</div>
		<div class="flex flex-col gap-1.5 flex-shrink-0">
			<a
				href="/report"
				title={tx('reports.table.viewReport')}
				class="w-9 h-9 rounded-lg bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center"
			>
				<i class="fa-solid fa-eye text-brand-blue text-xs"></i>
			</a>
			<button
				onclick={() => onDownload(report.reportId)}
				title={tx('reports.table.downloadPdf')}
				class="w-9 h-9 rounded-lg bg-brand-green/10 border border-brand-green/20 flex items-center justify-center"
			>
				<i class="fa-solid fa-download text-brand-green text-xs"></i>
			</button>
		</div>
	</div>
</div>

<style>
	.report-card {
		transition: background 0.15s;
	}
	.report-card:active {
		background: rgba(30, 41, 59, 0.6);
	}
</style>
