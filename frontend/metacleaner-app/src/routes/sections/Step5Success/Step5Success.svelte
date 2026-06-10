<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import { scannerStore } from '$lib/scanner/scannerStore.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { cleaningResultsStore } from '$lib/stores/cleaningResultsStore.svelte';
	import { apiCleaningService } from '$lib/services/apiCleaningService';
	import MobileBottomCta from '$lib/shared/components/MobileBottomCta.svelte';
	import Toast from '$lib/shared/components/Toast.svelte';
	import SuccessHeader from './SuccessHeader.svelte';
	import MetadataOverview from './MetadataOverview.svelte';
	import FileResultsCard from './FileResultsCard.svelte';

	let showDownloadError = $state(false);
	let downloadErrorTimer: ReturnType<typeof setTimeout>;

	onMount(() => {
		return () => {
			clearTimeout(downloadErrorTimer);
		};
	});

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}

	function formatTime(seconds: number): string {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return m > 0 ? `${m}m ${s}s` : `${s}s`;
	}

	const results = $derived(cleaningResultsStore.results);
	const files = $derived(scannerStore.files);

	const totalFieldsBefore = $derived(
		results
			? results.beforeBreakdown.gpsLocations +
					results.beforeBreakdown.exifFields +
					results.beforeBreakdown.xmpFields +
					results.beforeBreakdown.id3mp4Fields +
					results.beforeBreakdown.otherFields
			: 0
	);

	function handleUploadNew(): void {
		appState.reset();
	}

	async function handleDownload(): Promise<void> {
		if (!results) return;
		try {
			const blob = await apiCleaningService.downloadResults(cleaningResultsStore.reportId ?? '');
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'cleaned-files.zip';
			a.click();
			URL.revokeObjectURL(url);
		} catch {
			showDownloadError = true;
			clearTimeout(downloadErrorTimer);
			downloadErrorTimer = setTimeout(() => {
				showDownloadError = false;
			}, 3000);
		}
	}

	function handleViewReport(): void {
		const id = cleaningResultsStore.reportId ?? 'mock-report';
		void goto(resolve(`/report/${id}` as Pathname));
	}
</script>

<!-- Success badge -->
<div class="mb-2 flex items-center justify-end">
	<div
		class="flex items-center gap-1.5 rounded-xl border border-green-800/50 bg-navy-card px-3 py-2"
	>
		<div class="h-2 w-2 rounded-full bg-brand-green"></div>
		<span class="text-[11px] font-semibold text-brand-green">{tx('step5.badge.success')}</span>
	</div>
</div>

<!-- Success Header -->
<SuccessHeader fileCount={files.length} onUploadNew={handleUploadNew} />

{#if results}
	<!-- Stats row -->
	<div class="fade-in-up grid grid-cols-2 gap-3 delay-1 lg:grid-cols-4 lg:gap-4">
		<!-- Files processed -->
		<div
			class="flex flex-col gap-1 rounded-2xl border border-gray-800 bg-navy-card p-4 shadow-card lg:p-5"
		>
			<div
				class="mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg border border-brand-green/20 bg-brand-green/10 lg:mb-2 lg:h-9 lg:w-9"
			>
				<i class="fa-solid fa-file-circle-check text-sm text-brand-green lg:text-base"></i>
			</div>
			<p class="text-2xl font-black text-white">{results.filesProcessed}</p>
			<p class="text-[11px] text-text-muted lg:text-xs">{tx('step5.stats.filesProcessed')}</p>
		</div>

		<!-- Fields removed -->
		<div
			class="flex flex-col gap-1 rounded-2xl border border-brand-green/20 bg-navy-card p-4 shadow-card lg:p-5"
		>
			<div
				class="mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg border border-brand-green/20 bg-brand-green/10 lg:mb-2 lg:h-9 lg:w-9"
			>
				<i class="fa-solid fa-eraser text-sm text-brand-green lg:text-base"></i>
			</div>
			<p class="text-2xl font-black text-brand-green">{results.fieldsRemoved}</p>
			<p class="text-[11px] text-text-muted lg:text-xs">{tx('step5.stats.fieldsRemoved')}</p>
		</div>

		<!-- GPS removed -->
		<div
			class="flex flex-col gap-1 rounded-2xl border border-gray-800 bg-navy-card p-4 shadow-card lg:p-5"
		>
			<div
				class="mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg border border-brand-blue/20 bg-brand-blue/10 lg:mb-2 lg:h-9 lg:w-9"
			>
				<i class="fa-solid fa-location-dot text-sm text-brand-blue lg:text-base"></i>
			</div>
			<p class="text-2xl font-black text-brand-blue">{results.gpsLocationsRemoved}</p>
			<p class="text-[11px] text-text-muted lg:text-xs">{tx('step5.stats.gpsRemoved')}</p>
		</div>

		<!-- Total time -->
		<div
			class="flex flex-col gap-1 rounded-2xl border border-gray-800 bg-navy-card p-4 shadow-card lg:p-5"
		>
			<div
				class="mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg border border-brand-orange/20 bg-brand-orange/10 lg:mb-2 lg:h-9 lg:w-9"
			>
				<i class="fa-solid fa-clock text-sm text-brand-orange lg:text-base"></i>
			</div>
			<p class="text-2xl font-black text-white">{formatTime(results.totalTimeSeconds)}</p>
			<p class="text-[11px] text-text-muted lg:text-xs">{tx('step5.stats.totalTime')}</p>
		</div>
	</div>

	<!-- Metadata Overview -->
	<MetadataOverview
		beforeBreakdown={results.beforeBreakdown}
		{totalFieldsBefore}
		gpsLocationsRemoved={results.gpsLocationsRemoved}
	/>

	<!-- File Results Card -->
	<FileResultsCard
		{files}
		fileResults={results.fileResults}
		onDownload={handleDownload}
		onViewReport={handleViewReport}
	/>
{/if}

<Toast message={tx('common.downloadError')} show={showDownloadError} />

<!-- Mobile fixed bottom CTA bar — download, view report, upload new -->
<MobileBottomCta>
	<div class="flex flex-col gap-2">
		<button
			onclick={handleDownload}
			class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-3.5 text-sm font-bold text-navy-main"
		>
			<i class="fa-solid fa-download"></i>
			{tx('step5.actions.downloadAll')}
		</button>
		<div class="grid grid-cols-2 gap-2">
			<button
				onclick={handleViewReport}
				class="flex items-center justify-center gap-2 rounded-xl border border-gray-700 bg-navy-card py-3 text-xs font-semibold text-white"
			>
				<i class="fa-solid fa-file-lines"></i>
				{tx('step5.actions.viewReport')}
			</button>
			<button
				onclick={handleUploadNew}
				class="flex items-center justify-center gap-2 rounded-xl border border-gray-700 bg-navy-card py-3 text-xs font-semibold text-white"
			>
				<i class="fa-solid fa-arrow-up-from-bracket"></i>
				{tx('step5.actions.uploadNew')}
			</button>
		</div>
	</div>
</MobileBottomCta>
