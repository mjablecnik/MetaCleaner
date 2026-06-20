<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { onMount } from 'svelte';
	import { beforeNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import { appState } from '$lib/stores/appState.svelte';
	import { apiCleaningService } from '$lib/services/apiCleaningService';
	import type { Report, ReportSummaryStats } from '$lib/types/report';
	import SummaryStatsRow from '$lib/shared/sections/SummaryStatsRow.svelte';
	import Toast from '$lib/shared/components/Toast.svelte';
	import MobileBottomCta from '$lib/shared/components/MobileBottomCta.svelte';
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
	let isLoading = $state(true);
	let loadError = $state<string | null>(null);

	let reports = $state<Report[]>([]);
	let stats = $state<ReportSummaryStats | null>(null);

	// Reset app state when navigating back to the main cleaning page so the user
	// sees the idle state rather than the previous success/error result.
	beforeNavigate(({ to }) => {
		if (to?.url.pathname === '/') {
			appState.reset();
		}
	});

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
		apiCleaningService
			.getReports()
			.then((data) => {
				stats = data.summary;
				reports = data.reports;
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
	<title>{tx('reports.meta.title')}</title>
</svelte:head>

<main
	class="mx-auto mt-4 flex w-full max-w-[1100px] flex-col gap-4 px-6 pb-28 lg:mt-0 lg:gap-6 lg:pb-24"
>
	<ReportsHeader totalReports={stats?.totalReports ?? 0} />

	{#if isLoading}
		<div class="flex items-center justify-center py-12">
			<i class="fa-solid fa-circle-notch spin-slow text-2xl text-brand-blue"></i>
		</div>
	{:else if loadError}
		<div
			class="rounded-xl border border-red-800/50 bg-brand-red/10 p-4 text-center text-sm text-brand-red"
		>
			<i class="fa-solid fa-triangle-exclamation mr-2"></i>
			{loadError}
		</div>
	{:else}
		<SummaryStatsRow stats={summaryStats} class="fade-in-up delay-1" />
		<FiltersBar {activeFilter} bind:searchQuery onFilterChange={(f) => (activeFilter = f)} />
		<MobileFilters {activeFilter} bind:searchQuery onFilterChange={(f) => (activeFilter = f)} />
		<ReportsTable
			reports={filteredReports}
			totalCount={reports.length}
			onDownload={downloadReport}
		/>
		<ReportsList
			reports={filteredReports}
			totalCount={reports.length}
			onDownload={downloadReport}
		/>
	{/if}
</main>

<MobileBottomCta>
	<a
		href={resolve('/' as Pathname)}
		class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-3.5 text-sm font-bold text-white shadow-glow-green"
	>
		<i class="fa-solid fa-plus"></i>
		<span>{tx('reports.header.newCleaning')}</span>
	</a>
</MobileBottomCta>

<Toast message={toastMessage} show={showToast} />
