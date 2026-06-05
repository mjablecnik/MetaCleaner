<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ReportDetail } from '$lib/types/report';

	interface Props {
		reportDetail: ReportDetail | null;
		userEmail: string;
	}

	let { reportDetail, userEmail }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}
</script>

<!-- Title row with icon, heading, and action buttons -->
<div
	class="fade-in-up mb-0 flex flex-col gap-3 lg:mb-2 lg:flex-row lg:items-center lg:justify-between lg:gap-4"
>
	<div class="flex items-center gap-3 lg:gap-4">
		<div
			class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border-2 border-brand-blue/40 bg-brand-blue/10 lg:h-14 lg:w-14 lg:rounded-2xl"
		>
			<i class="fa-solid fa-file-lines text-xl text-brand-blue lg:text-3xl"></i>
		</div>
		<div>
			<h1 class="text-xl leading-tight font-bold text-white lg:text-3xl">
				{tx('report.header.title')}
			</h1>
			<p class="mt-0.5 text-xs text-text-muted lg:mt-1 lg:text-sm">
				{#if reportDetail}
					<span class="hidden lg:inline">{tx('report.header.generated')} </span>{tx(
						'report.header.generatedDesc',
						{
							date: reportDetail.date,
							files: reportDetail.filesProcessed,
							fields: reportDetail.fieldsRemoved
						}
					)}
				{/if}
			</p>
		</div>
	</div>

	<!-- Mobile: full-width PDF download button -->
	<button
		class="no-print flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-3.5 text-sm font-bold text-white shadow-glow-green transition-transform active:scale-95 lg:hidden"
	>
		<i class="fa-solid fa-file-pdf"></i>
		<span>{tx('report.actions.downloadPdf')}</span>
	</button>

	<!-- Desktop: action buttons -->
	<div class="no-print hidden items-center gap-3 self-start lg:flex lg:self-auto">
		<button
			class="flex items-center gap-2 rounded-xl bg-brand-green px-5 py-2.5 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-400"
		>
			<i class="fa-solid fa-file-pdf"></i>
			<span>{tx('report.actions.downloadPdfShort')}</span>
		</button>
		<button
			onclick={() => window.print()}
			class="flex items-center gap-2 rounded-xl border border-gray-700 bg-navy-lighter px-4 py-2.5 text-sm font-semibold text-text-muted transition-all hover:bg-gray-800 hover:text-white"
		>
			<i class="fa-solid fa-print"></i>
			<span class="hidden sm:inline">{tx('report.actions.print')}</span>
		</button>
	</div>
</div>

<!-- Meta info bar -->
<div
	class="fade-in-up rounded-2xl border border-gray-800 bg-navy-card p-4 shadow-card delay-1 lg:p-5"
>
	<div class="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
		<div class="flex flex-col gap-0.5 lg:gap-1">
			<p class="text-[10px] font-semibold tracking-wider text-text-muted uppercase">
				{tx('report.meta.reportId')}
			</p>
			<p class="font-mono text-xs text-white lg:text-sm">{reportDetail?.reportId ?? ''}</p>
		</div>
		<div class="flex flex-col gap-0.5 lg:gap-1">
			<p class="text-[10px] font-semibold tracking-wider text-text-muted uppercase">
				{tx('report.meta.cleaningDate')}
			</p>
			<p class="text-xs font-semibold text-white lg:text-sm">{reportDetail?.date ?? ''}</p>
		</div>
		<div class="flex flex-col gap-0.5 lg:gap-1">
			<p class="text-[10px] font-semibold tracking-wider text-text-muted uppercase">
				{tx('report.meta.user')}
			</p>
			<p class="truncate text-xs font-semibold text-white lg:text-sm">{userEmail}</p>
		</div>
		<div class="flex flex-col gap-0.5 lg:gap-1">
			<p class="text-[10px] font-semibold tracking-wider text-text-muted uppercase">
				{tx('report.meta.status')}
			</p>
			<div class="flex items-center gap-1.5 lg:gap-2">
				<div class="h-2 w-2 flex-shrink-0 rounded-full bg-brand-green"></div>
				<p class="text-xs font-semibold text-brand-green lg:text-sm">
					<span class="hidden lg:inline">{tx('report.meta.statusSuccess')}</span>
					<span class="inline lg:hidden">{tx('report.meta.statusSuccessMobile')}</span>
				</p>
			</div>
		</div>
	</div>
</div>
