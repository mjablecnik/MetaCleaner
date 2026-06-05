<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import { scannerStore } from '$lib/scanner/scannerStore.svelte';
	import type { QueuedFile } from '$lib/scanner/types';
	import { cleaningStore } from '$lib/api/cleaningStore.svelte';
	import type { ErrorState } from '$lib/types/processing';
	import ErrorBanner from './sections/ErrorBanner.svelte';
	import MobileErrorVisual from './sections/MobileErrorVisual.svelte';
	import ErrorFilesCard from './sections/ErrorFilesCard.svelte';
	import ErrorStateCard from './sections/ErrorStateCard.svelte';
	import ErrorDetailAccordion from './sections/ErrorDetailAccordion.svelte';
	import ErrorTypeAccordion from './sections/ErrorTypeAccordion.svelte';
	import ErrorLogAccordion from './sections/ErrorLogAccordion.svelte';

	$effect(() => {
		if (!scannerStore.hasFiles) goto(resolve('/' as Pathname), { replaceState: true });
	});

	let bannerVisible = $state(true);
	let selectedErrorType = $state('cleaning');
	const uploadedFiles = $derived(scannerStore.files);

	// Use real error state from cleaning store, fall back to upload error message
	const errorState = $derived<ErrorState | null>(cleaningStore.errorState);

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}

	function getFileById(id: string): QueuedFile | undefined {
		return uploadedFiles.find((f) => f.id === id);
	}

	const failedFileName = $derived(getFileById(errorState?.failedFileId ?? '')?.name ?? '');
</script>

<svelte:head>
	<title>{tx('step4.meta.title')}</title>
</svelte:head>

<main
	class="mx-auto mt-4 flex w-full max-w-[1100px] flex-col gap-4 px-4 pb-24 lg:mt-0 lg:gap-6 lg:px-6"
>
	<!-- Page Header -->
	<div class="mb-0 flex flex-col gap-1 lg:mb-2">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h1 class="text-2xl font-bold text-white lg:text-3xl">{tx('step1.header.title')}</h1>
				<p class="mt-1 text-sm text-text-muted">{tx('step1.header.description')}</p>
			</div>
			<div
				class="flex items-center gap-2 self-start rounded-xl border border-red-800/50 bg-navy-card px-3 py-2 sm:self-auto lg:px-4 lg:py-2.5"
			>
				<div class="h-2 w-2 rounded-full bg-brand-red"></div>
				<span class="text-[10px] font-semibold text-brand-red lg:text-xs">
					<span class="hidden lg:inline">{tx('step4.badge.errorDesktop')}</span>
					<span class="inline lg:hidden">{tx('step4.badge.errorMobile')}</span>
				</span>
			</div>
		</div>
	</div>

	{#if cleaningStore.uploadError && !errorState}
		<div class="rounded-xl border border-red-800/50 bg-brand-red/10 p-4 text-sm text-brand-red">
			<i class="fa-solid fa-triangle-exclamation mr-2"></i>
			{cleaningStore.uploadError}
		</div>
	{/if}

	<ErrorBanner {errorState} visible={bannerVisible} onDismiss={() => (bannerVisible = false)} />

	<MobileErrorVisual {errorState} {failedFileName} />

	<div class="grid grid-cols-1 gap-4 lg:grid-cols-[55%_43%] lg:gap-6">
		<ErrorFilesCard {errorState} {uploadedFiles} />
		<ErrorStateCard
			{errorState}
			{failedFileName}
			{selectedErrorType}
			onSelectType={(id) => (selectedErrorType = id)}
			{getFileById}
		/>
	</div>

	<ErrorDetailAccordion {errorState} {failedFileName} />
	<ErrorTypeAccordion {errorState} bind:selectedErrorType />
	<ErrorLogAccordion {errorState} {getFileById} />
</main>
