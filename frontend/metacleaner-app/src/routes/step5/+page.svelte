<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import { scannerStore } from '$lib/scanner/scannerStore.svelte';
	import { getResults, type ProcessingResults } from '$lib/repositories/processingRepository';
	import SummaryStatsRow, { type Stat } from '$lib/shared/sections/SummaryStatsRow.svelte';
	import SuccessHeader from './sections/SuccessHeader.svelte';
	import MetadataOverview from './sections/MetadataOverview.svelte';
	import FileResultsCard from './sections/FileResultsCard.svelte';

	$effect(() => {
		if (!scannerStore.hasFiles) goto(resolve('/' as Pathname), { replaceState: true });
	});

	const uploadedFiles = $derived(scannerStore.files);
	let results = $state<ProcessingResults | null>(null);

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}

	function startOver(): void {
		scannerStore.clearFiles();
		goto(resolve('/' as Pathname), { replaceState: true });
	}

	const stats: Stat[] = $derived([
		{
			icon: 'fa-solid fa-file-circle-check',
			iconColor: 'green',
			value: results?.filesProcessed ?? uploadedFiles.length,
			label: tx('step5.stats.filesProcessed')
		},
		{
			icon: 'fa-solid fa-eraser',
			iconColor: 'green',
			value: results?.fieldsRemoved ?? 87,
			label: tx('step5.stats.fieldsRemoved'),
			highlight: true
		},
		{
			icon: 'fa-solid fa-location-dot',
			iconColor: 'blue',
			value: results?.gpsLocationsRemoved ?? 3,
			label: tx('step5.stats.gpsRemoved'),
			highlight: true
		},
		{
			icon: 'fa-solid fa-clock',
			iconColor: 'orange',
			value: `${results?.totalTimeSeconds ?? 28}s`,
			label: tx('step5.stats.totalTime')
		}
	]);

	onMount(() => {
		getResults().then((r) => {
			results = r;
		});
	});
</script>

<svelte:head>
	<title>{tx('step5.meta.title')}</title>
</svelte:head>

<main
	class="mx-auto mt-4 flex w-full max-w-[1100px] flex-col gap-4 px-4 pb-8 lg:mt-0 lg:gap-6 lg:px-6 lg:pb-24"
>
	<SuccessHeader filesProcessed={results?.filesProcessed ?? uploadedFiles.length} />
	<SummaryStatsRow {stats} class="fade-in-up delay-1" />
	<MetadataOverview {results} />
	<FileResultsCard {results} {uploadedFiles} onStartOver={startOver} />
</main>
