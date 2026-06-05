<script lang="ts">
	import { onMount } from 'svelte';
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import { getUploadedFiles, type UploadedFile } from '$lib/repositories/fileRepository';
	import { getErrorState, type ErrorState } from '$lib/repositories/processingRepository';
	import ErrorBanner from './sections/ErrorBanner.svelte';
	import MobileErrorVisual from './sections/MobileErrorVisual.svelte';
	import ErrorFilesCard from './sections/ErrorFilesCard.svelte';
	import ErrorStateCard from './sections/ErrorStateCard.svelte';
	import ErrorDetailAccordion from './sections/ErrorDetailAccordion.svelte';
	import ErrorTypeAccordion from './sections/ErrorTypeAccordion.svelte';
	import ErrorLogAccordion from './sections/ErrorLogAccordion.svelte';

	let bannerVisible = $state(true);
	let selectedErrorType = $state('cleaning');
	let uploadedFiles = $state<UploadedFile[]>([]);
	let errorState = $state<ErrorState | null>(null);

	function tx(key: string, params: Record<string, unknown> = {}): string {
		locale.current;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}

	function getFileById(id: string): UploadedFile | undefined {
		return uploadedFiles.find((f) => f.id === id);
	}

	const failedFileName = $derived(getFileById(errorState?.failedFileId ?? '')?.name ?? '');

	onMount(() => {
		getUploadedFiles().then((files) => { uploadedFiles = files; });
		getErrorState().then((es) => { errorState = es; });
	});
</script>

<svelte:head>
	<title>{tx('step4.meta.title')}</title>
</svelte:head>

<main class="w-full max-w-[1100px] mx-auto px-4 lg:px-6 pb-24 flex flex-col gap-4 lg:gap-6 mt-4 lg:mt-0">

	<!-- Page Header -->
	<div class="flex flex-col gap-1 mb-0 lg:mb-2">
		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
			<div>
				<h1 class="text-2xl lg:text-3xl font-bold text-white">{tx('step1.header.title')}</h1>
				<p class="text-text-muted text-sm mt-1">{tx('step1.header.description')}</p>
			</div>
			<div class="flex items-center gap-2 bg-navy-card border border-red-800/50 rounded-xl px-3 lg:px-4 py-2 lg:py-2.5 self-start sm:self-auto">
				<div class="w-2 h-2 rounded-full bg-brand-red"></div>
				<span class="text-[10px] lg:text-xs font-semibold text-brand-red">
					<span class="hidden lg:inline">{tx('step4.badge.errorDesktop')}</span>
					<span class="inline lg:hidden">{tx('step4.badge.errorMobile')}</span>
				</span>
			</div>
		</div>
	</div>

	<ErrorBanner {errorState} visible={bannerVisible} onDismiss={() => (bannerVisible = false)} />

	<MobileErrorVisual {errorState} {failedFileName} />

	<div class="grid grid-cols-1 lg:grid-cols-[55%_43%] gap-4 lg:gap-6">
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
