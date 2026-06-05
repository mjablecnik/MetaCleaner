<script lang="ts">
	import { onMount } from 'svelte';
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import { getUploadedFiles, type UploadedFile } from '$lib/repositories/fileRepository';
	import { getResults, type ProcessingResults } from '$lib/repositories/processingRepository';
	import SummaryStatsRow, { type Stat } from '$lib/shared/sections/SummaryStatsRow.svelte';
	import SuccessHeader from './sections/SuccessHeader.svelte';
	import MetadataOverview from './sections/MetadataOverview.svelte';
	import FileResultsCard from './sections/FileResultsCard.svelte';

	let uploadedFiles = $state<UploadedFile[]>([]);
	let results = $state<ProcessingResults | null>(null);

	function tx(key: string, params: Record<string, unknown> = {}): string {
		locale.current;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}

	const stats: Stat[] = $derived([
		{
			icon: 'fa-solid fa-file-circle-check',
			iconColor: 'green',
			value: results?.filesProcessed ?? 4,
			label: tx('step5.stats.filesProcessed'),
		},
		{
			icon: 'fa-solid fa-eraser',
			iconColor: 'green',
			value: results?.fieldsRemoved ?? 87,
			label: tx('step5.stats.fieldsRemoved'),
			highlight: true,
		},
		{
			icon: 'fa-solid fa-location-dot',
			iconColor: 'blue',
			value: results?.gpsLocationsRemoved ?? 3,
			label: tx('step5.stats.gpsRemoved'),
			highlight: true,
		},
		{
			icon: 'fa-solid fa-clock',
			iconColor: 'orange',
			value: `${results?.totalTimeSeconds ?? 28}s`,
			label: tx('step5.stats.totalTime'),
		},
	]);

	onMount(() => {
		getUploadedFiles().then((files) => { uploadedFiles = files; });
		getResults().then((r) => { results = r; });
	});
</script>

<svelte:head>
	<title>{tx('step5.meta.title')}</title>
</svelte:head>

<main class="w-full max-w-[1100px] mx-auto px-4 lg:px-6 pb-8 lg:pb-24 flex flex-col gap-4 lg:gap-6 mt-4 lg:mt-0">
	<SuccessHeader filesProcessed={results?.filesProcessed ?? 4} />
	<SummaryStatsRow {stats} class="fade-in-up delay-1" />
	<MetadataOverview {results} />
	<FileResultsCard {results} {uploadedFiles} />
</main>
