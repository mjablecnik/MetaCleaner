<script lang="ts">
	import { onMount } from 'svelte';
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import { getReportDetail, type ReportDetail } from '$lib/repositories/reportRepository';
	import { getCurrentUser, type User } from '$lib/repositories/userRepository';
	import SummaryStatsRow from '$lib/shared/sections/SummaryStatsRow.svelte';
	import ReportDetailHeader from './sections/ReportDetailHeader.svelte';
	import ReportChartCard from './sections/ReportChartCard.svelte';
	import FileAccordionList from './sections/FileAccordionList.svelte';

	let reportDetail = $state<ReportDetail | null>(null);
	let user = $state<User | null>(null);

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
		Promise.all([getReportDetail(), getCurrentUser()]).then(([detail, currentUser]) => {
			reportDetail = detail;
			user = currentUser;
		});
	});
</script>

<svelte:head>
	<title>{tx('report.meta.title')}</title>
</svelte:head>

<main
	class="mx-auto flex w-full max-w-[1100px] flex-col gap-4 px-4 pt-4 pb-24 lg:gap-6 lg:px-6 lg:pt-0"
>
	<ReportDetailHeader {reportDetail} userEmail={user?.email ?? ''} />
	<SummaryStatsRow {stats} class="fade-in-up delay-1" />
	<ReportChartCard {reportDetail} />
	<FileAccordionList files={reportDetail?.files ?? []} />

	<div class="fade-in-up mt-4 pb-4 text-center text-sm text-text-muted delay-4 lg:mt-8">
		<p>{tx('common.footer.copyright')}</p>
	</div>
</main>
