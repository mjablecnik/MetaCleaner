<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import {
		getReports,
		getSummaryStats,
		type Report,
		type ReportSummaryStats
	} from '$lib/repositories/reportRepository';
	import SummaryStatsRow from '$lib/shared/sections/SummaryStatsRow.svelte';
	import Toast from '$lib/shared/components/Toast.svelte';
	import ReportsHeader from './sections/ReportsHeader.svelte';
	import FiltersBar from './sections/FiltersBar.svelte';
	import MobileFilters from './sections/MobileFilters.svelte';
	import ReportsTable from './sections/ReportsTable.svelte';
	import ReportsList from './sections/ReportsList.svelte';

	let activeFilter = $state('all');
	let searchQuery = $state('');
	let showToast = $state(false);
	let toastMessage = $state('');
	let toastTimer: ReturnType<typeof setTimeout>;

	let reports = $state<Report[]>([]);
	let stats = $state<ReportSummaryStats | null>(null);

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}

	const filteredReports = $derived(
		reports.filter((r) => {
			if (activeFilter === 'image' && r.type !== 'image') return false;
			if (activeFilter === 'video' && r.type !== 'video') return false;
			if (activeFilter === 'gps' && !r.gps) return false;
			if (searchQuery) {
				const q = searchQuery.toLowerCase();
				const text = `${r.id} ${r.date} ${r.fileTypes} ${r.reportId}`.toLowerCase();
				if (!text.includes(q)) return false;
			}
			return true;
		})
	);

	const summaryStats = $derived([
		{
			icon: 'fa-solid fa-file-lines',
			iconColor: 'blue' as const,
			value: stats?.totalReports ?? 0,
			label: tx('reports.stats.totalReports')
		},
		{
			icon: 'fa-solid fa-eraser',
			iconColor: 'green' as const,
			value: stats?.fieldsRemoved?.toLocaleString() ?? 0,
			label: tx('reports.stats.fieldsRemoved'),
			labelMobile: tx('reports.stats.fieldsRemovedShort'),
			highlight: true
		},
		{
			icon: 'fa-solid fa-file-circle-check',
			iconColor: 'orange' as const,
			value: stats?.filesProcessed ?? 0,
			label: tx('reports.stats.filesProcessed')
		},
		{
			icon: 'fa-solid fa-location-dot',
			iconColor: 'red' as const,
			value: stats?.gpsRemoved ?? 0,
			label: tx('reports.stats.gpsRemoved'),
			labelMobile: tx('reports.stats.gpsRemovedShort')
		}
	]);

	function downloadReport(id: string) {
		toastMessage = tx('reports.toast.downloading') + ' ' + id;
		showToast = true;
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => {
			showToast = false;
		}, 2500);
	}

	onMount(() => {
		getReports().then((r) => {
			reports = r;
		});
		getSummaryStats().then((s) => {
			stats = s;
		});
	});
</script>

<svelte:head>
	<title>{tx('reports.meta.title')}</title>
</svelte:head>

<main
	class="mx-auto mt-4 flex w-full max-w-[1100px] flex-col gap-4 px-4 pb-28 lg:mt-0 lg:gap-6 lg:px-6 lg:pb-24"
>
	<ReportsHeader totalReports={stats?.totalReports ?? 0} />
	<SummaryStatsRow stats={summaryStats} class="fade-in-up delay-1" />
	<FiltersBar {activeFilter} bind:searchQuery onFilterChange={(f) => (activeFilter = f)} />
	<MobileFilters {activeFilter} bind:searchQuery onFilterChange={(f) => (activeFilter = f)} />
	<ReportsTable reports={filteredReports} totalCount={reports.length} onDownload={downloadReport} />
	<ReportsList reports={filteredReports} totalCount={reports.length} onDownload={downloadReport} />
</main>

<div class="mobile-gradient-fade fixed right-0 bottom-0 left-0 z-40 px-4 py-4 lg:hidden">
	<a
		href={resolve('/')}
		class="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-green py-4 text-base font-bold text-white shadow-glow-green"
	>
		<i class="fa-solid fa-plus"></i>
		<span>{tx('reports.header.newCleaning')}</span>
	</a>
</div>

<Toast message={toastMessage} show={showToast} />
