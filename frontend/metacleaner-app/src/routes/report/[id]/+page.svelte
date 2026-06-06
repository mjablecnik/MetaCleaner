<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import { getReportDetail } from '$lib/api/client';
	import type { ReportDetail, ReportFileDetail } from '$lib/types/report';
	import type { ApiReportDetail } from '$lib/api/client';
	import SummaryStatsRow from '$lib/shared/sections/SummaryStatsRow.svelte';
	import ReportDetailHeader from '../sections/ReportDetailHeader.svelte';
	import ReportChartCard from '../sections/ReportChartCard.svelte';
	import FileAccordionList from '../sections/FileAccordionList.svelte';

	let reportDetail = $state<ReportDetail | null>(null);
	let isLoading = $state(true);
	let loadError = $state<string | null>(null);

	const reportId = $derived(page.params.id);

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}

	function mapApiToReportDetail(api: ApiReportDetail): ReportDetail {
		return {
			reportId: api.reportId,
			date: api.date,
			filesProcessed: api.filesProcessed,
			fieldsRemoved: api.fieldsRemoved,
			gpsLocationsRemoved: api.gpsLocationsRemoved,
			totalTimeSeconds: api.totalTimeSeconds,
			chartData: api.chartData,
			files: api.files.map(
				(f): ReportFileDetail => ({
					name: f.name,
					extension: f.extension,
					sizeMB: f.sizeMB,
					format: f.format,
					device: f.device,
					type: f.type,
					iconColor: f.iconColor,
					hasGps: f.hasGps,
					fieldsRemoved: f.fieldsRemoved,
					barWidthPercent:
						api.fieldsRemoved > 0 ? Math.round((f.fieldsRemoved / api.fieldsRemoved) * 100) : 0,
					barGradientFrom: f.type === 'video' ? 'brand-orange' : 'brand-green',
					barGradientTo: f.type === 'video' ? 'orange-400' : 'green-400',
					metadata: {
						gpsFields: f.metadata.gpsFields,
						exifFields: f.metadata.exifFields,
						xmpFields: f.metadata.xmpFields,
						totalRemoved: f.metadata.totalRemoved
					}
				})
			)
		};
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
		getReportDetail(reportId ?? '')
			.then((apiDetail) => {
				reportDetail = mapApiToReportDetail(apiDetail);
			})
			.catch((err) => {
				loadError = err instanceof Error ? err.message : 'Failed to load report';
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
				<p class="text-sm text-text-muted">{tx('common.loading') || 'Loading report...'}</p>
			</div>
		</div>
	{:else if loadError}
		<div
			class="flex flex-col items-center gap-4 rounded-2xl border border-red-800/50 bg-brand-red/10 p-8 text-center"
		>
			<i class="fa-solid fa-triangle-exclamation text-2xl text-brand-red"></i>
			<p class="text-sm font-semibold text-white">
				{tx('common.error') || 'Failed to load report'}
			</p>
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
