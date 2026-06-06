<script lang="ts">
	import { onMount } from 'svelte';
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import { mockCleaningService } from '$lib/services/mockCleaningService';
	import type { ReportDetail } from '$lib/types/report';
	import SummaryStatsRow from '$lib/shared/sections/SummaryStatsRow.svelte';
	import ReportDetailHeader from './sections/ReportDetailHeader.svelte';
	import ReportChartCard from './sections/ReportChartCard.svelte';
	import FileAccordionList from './sections/FileAccordionList.svelte';

	let reportDetail = $state<ReportDetail | null>(null);
	let isLoading = $state(true);
	let loadError = $state<string | null>(null);

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}

	const stats = $derived([
		{
			icon: 'fa-solid fa-file-circle-check',
			iconColor: 'green' as const,
			value: reportDetail?.filesProcessed ?? '',
			label: tx('report.stats.filesProcessed')
		},
		{
			icon: 'fa-solid fa-eraser',
			iconColor: 'green' as const,
			value: reportDetail?.fieldsRemoved ?? '',
			label: tx('report.stats.fieldsRemoved'),
			highlight: true
		},
		{
			icon: 'fa-solid fa-location-dot',
			iconColor: 'blue' as const,
			value: reportDetail?.gpsLocationsRemoved ?? '',
			label: tx('report.stats.gpsRemoved')
		},
		{
			icon: 'fa-solid fa-clock',
			iconColor: 'orange' as const,
			value: reportDetail ? reportDetail.totalTimeSeconds + 's' : '',
			label: tx('report.stats.totalTime')
		}
	]);

	onMount(() => {
		mockCleaningService
			.getReportDetail('')
			.then((detail) => {
				reportDetail = detail;
			})
			.catch((err) => {
				loadError = err instanceof Error ? err.message : tx('common.error');
			})
			.finally(() => {
				isLoading = false;
			});
	});
</script>

<svelte:head>
	<title>{tx('report.meta.title')}</title>
</svelte:head>

<main
	class="mx-auto flex w-full max-w-[1100px] flex-col gap-4 px-4 pt-4 pb-24 lg:gap-6 lg:px-6 lg:pt-0"
>
	{#if isLoading}
		<div class="flex items-center justify-center py-20">
			<div class="flex flex-col items-center gap-3">
				<i class="fa-solid fa-circle-notch spin-slow text-2xl text-brand-blue"></i>
				<p class="text-sm text-text-muted">{tx('common.loading')}</p>
			</div>
		</div>
	{:else if loadError}
		<div
			class="flex flex-col items-center gap-4 rounded-2xl border border-red-800/50 bg-brand-red/10 p-8 text-center"
		>
			<i class="fa-solid fa-triangle-exclamation text-2xl text-brand-red"></i>
			<p class="text-sm font-semibold text-white">{tx('common.error')}</p>
			<p class="text-xs text-text-muted">{loadError}</p>
		</div>
	{:else}
		<ReportDetailHeader {reportDetail} userEmail="" />
		<SummaryStatsRow {stats} class="fade-in-up delay-1" />
		<ReportChartCard {reportDetail} />
		<FileAccordionList files={reportDetail?.files ?? []} />

		<div class="fade-in-up mt-4 pb-4 text-center text-sm text-text-muted delay-4 lg:mt-8">
			<p>{tx('common.footer.copyright')}</p>
		</div>
	{/if}
</main>
