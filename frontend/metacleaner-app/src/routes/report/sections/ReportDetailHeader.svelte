<script lang="ts">
	import { currentLocale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ReportDetail } from '$lib/repositories/reportRepository';

	interface Props {
		reportDetail: ReportDetail | null;
		userEmail: string;
	}

	let { reportDetail, userEmail }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		currentLocale;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}
</script>

<!-- Title row with icon, heading, and action buttons -->
<div class="fade-in-up flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4 mb-0 lg:mb-2">
	<div class="flex items-center gap-3 lg:gap-4">
		<div
			class="w-11 h-11 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-brand-blue/10 border-2 border-brand-blue/40 flex items-center justify-center flex-shrink-0"
		>
			<i class="fa-solid fa-file-lines text-brand-blue text-xl lg:text-3xl"></i>
		</div>
		<div>
			<h1 class="text-xl lg:text-3xl font-bold text-white leading-tight">{tx('report.header.title')}</h1>
			<p class="text-text-muted text-xs lg:text-sm mt-0.5 lg:mt-1">
				{#if reportDetail}
					<span class="hidden lg:inline">{tx('report.header.generated')} </span>{tx('report.header.generatedDesc', { date: reportDetail.date, files: reportDetail.filesProcessed, fields: reportDetail.fieldsRemoved })}
				{/if}
			</p>
		</div>
	</div>

	<!-- Mobile: full-width PDF download button -->
	<button
		class="no-print lg:hidden w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-brand-green text-white font-bold text-sm shadow-glow-green active:scale-95 transition-transform"
	>
		<i class="fa-solid fa-file-pdf"></i>
		<span>{tx('report.actions.downloadPdf')}</span>
	</button>

	<!-- Desktop: action buttons -->
	<div class="no-print hidden lg:flex items-center gap-3 self-start lg:self-auto">
		<button
			class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-green text-white font-bold text-sm hover:bg-green-400 transition-all shadow-glow-green"
		>
			<i class="fa-solid fa-file-pdf"></i>
			<span>{tx('report.actions.downloadPdfShort')}</span>
		</button>
		<button
			onclick={() => window.print()}
			class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-lighter border border-gray-700 text-text-muted font-semibold text-sm hover:bg-gray-800 hover:text-white transition-all"
		>
			<i class="fa-solid fa-print"></i>
			<span class="hidden sm:inline">{tx('report.actions.print')}</span>
		</button>
	</div>
</div>

<!-- Meta info bar -->
<div class="fade-in-up delay-1 bg-navy-card rounded-2xl border border-gray-800 p-4 lg:p-5 shadow-card">
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
		<div class="flex flex-col gap-0.5 lg:gap-1">
			<p class="text-[10px] text-text-muted uppercase tracking-wider font-semibold">{tx('report.meta.reportId')}</p>
			<p class="text-xs lg:text-sm font-mono text-white">{reportDetail?.reportId ?? ''}</p>
		</div>
		<div class="flex flex-col gap-0.5 lg:gap-1">
			<p class="text-[10px] text-text-muted uppercase tracking-wider font-semibold">{tx('report.meta.cleaningDate')}</p>
			<p class="text-xs lg:text-sm font-semibold text-white">{reportDetail?.date ?? ''}</p>
		</div>
		<div class="flex flex-col gap-0.5 lg:gap-1">
			<p class="text-[10px] text-text-muted uppercase tracking-wider font-semibold">{tx('report.meta.user')}</p>
			<p class="text-xs lg:text-sm font-semibold text-white truncate">{userEmail}</p>
		</div>
		<div class="flex flex-col gap-0.5 lg:gap-1">
			<p class="text-[10px] text-text-muted uppercase tracking-wider font-semibold">{tx('report.meta.status')}</p>
			<div class="flex items-center gap-1.5 lg:gap-2">
				<div class="w-2 h-2 rounded-full bg-brand-green flex-shrink-0"></div>
				<p class="text-xs lg:text-sm font-semibold text-brand-green">
					<span class="hidden lg:inline">{tx('report.meta.statusSuccess')}</span>
					<span class="inline lg:hidden">{tx('report.meta.statusSuccessMobile')}</span>
				</p>
			</div>
		</div>
	</div>
</div>
