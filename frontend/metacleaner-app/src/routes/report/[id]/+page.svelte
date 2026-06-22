<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { apiCleaningService } from '$lib/services/apiCleaningService';
	import { getReportPdf } from '$lib/clients/metaCleanerApi';
	import { getCurrentUser } from '$lib/repositories/userRepository';
	import type { ReportDetail } from '$lib/types/report';
	import SummaryStatsRow from '$lib/shared/sections/SummaryStatsRow.svelte';
	import ReportDetailHeader from '../sections/ReportDetailHeader.svelte';
	import ReportChartCard from '../sections/ReportChartCard.svelte';
	import FileAccordionList from '../sections/FileAccordionList.svelte';
	import MobileBottomCta from '$lib/shared/components/MobileBottomCta.svelte';

	let reportDetail = $state<ReportDetail | null>(null);
	let isLoading = $state(true);
	let loadError = $state<string | null>(null);
	let userEmail = $state('');

	function formatTimeMs(ms: number): string {
		if (!Number.isFinite(ms) || ms <= 0) return '0ms';
		if (ms < 1000) return `${ms}ms`;
		const s = ms / 1000;
		return s >= 60
			? `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`
			: `${Math.round(s * 10) / 10}s`;
	}

	const reportId = $derived(page.params.id);

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
			value: reportDetail ? formatTimeMs(reportDetail.totalTimeMs ?? 0) : '',
			label: tx('report.stats.totalTime')
		}
	]);

	async function handleDownloadPdf() {
		if (!reportId) return;
		try {
			const url = await getReportPdf(reportId);
			if (url) {
				window.open(url, '_blank');
			}
		} catch (err) {
			console.error('PDF download failed:', err);
		}
	}

	onMount(() => {
		apiCleaningService
			.getReportDetail(reportId ?? '')
			.then((detail) => {
				reportDetail = detail;
			})
			.catch((err) => {
				loadError = err instanceof Error ? err.message : String(err);
			})
			.finally(() => {
				isLoading = false;
			});

		getCurrentUser().then((u) => {
			userEmail = u.email || u.name;
		});
	});
</script>

<svelte:head>
	<title>{tx('report.meta.title')}</title>
</svelte:head>

<main
	class="mx-auto flex w-full max-w-[1100px] flex-col gap-4 px-6 pt-4 pb-40 lg:gap-6 lg:pt-0 lg:pb-24"
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
			<p class="text-sm font-semibold text-white">
				{tx('common.error')}
			</p>
			<p class="text-xs text-text-muted">{loadError}</p>
		</div>
	{:else}
		<ReportDetailHeader {reportDetail} {userEmail} onDownloadPdf={handleDownloadPdf} />
		<SummaryStatsRow {stats} class="fade-in-up delay-1" />
		<ReportChartCard {reportDetail} />
		<FileAccordionList files={reportDetail?.files ?? []} />

		<div class="fade-in-up mt-4 pb-4 text-center text-sm text-text-muted delay-4 lg:mt-8">
			<p>{tx('common.footer.copyright', { year: new Date().getFullYear() })}</p>
		</div>
	{/if}
</main>

<MobileBottomCta>
	<button
		onclick={handleDownloadPdf}
		class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-3.5 text-sm font-bold text-white shadow-glow-green"
	>
		<i class="fa-solid fa-file-pdf"></i>
		{tx('report.actions.downloadPdf')}
	</button>
</MobileBottomCta>
