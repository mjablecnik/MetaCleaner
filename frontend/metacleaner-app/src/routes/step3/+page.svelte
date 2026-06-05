<script lang="ts">
	import { onMount } from 'svelte';
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import { getUploadedFiles, type UploadedFile } from '$lib/repositories/fileRepository';
	import { getProcessingState, type ProcessingState } from '$lib/repositories/processingRepository';
	import MobileStatusCard from './sections/MobileStatusCard.svelte';
	import ProcessingFilesCard from './sections/ProcessingFilesCard.svelte';
	import ProcessingStatusCard from './sections/ProcessingStatusCard.svelte';
	import ActivityLogAccordion from './sections/ActivityLogAccordion.svelte';

	let uploadedFiles = $state<UploadedFile[]>([]);
	let processingState = $state<ProcessingState | null>(null);
	let overallPct = $state(0);

	let currentFile = $derived(uploadedFiles.find((f) => f.id === processingState?.currentFileId));

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}

	let animationInterval: ReturnType<typeof setInterval> | undefined;

	onMount(() => {
		getUploadedFiles().then((files) => {
			uploadedFiles = files;
		});
		getProcessingState().then((ps) => {
			processingState = ps;
			overallPct = ps.overallProgress;
			animationInterval = setInterval(() => {
				if (overallPct >= 75) {
					clearInterval(animationInterval);
					return;
				}
				overallPct = Math.min(overallPct + 0.5, 75);
			}, 300);
		});
		return () => {
			if (animationInterval) clearInterval(animationInterval);
		};
	});
</script>

<svelte:head>
	<title>{tx('step3.meta.title')}</title>
</svelte:head>

<main
	class="mx-auto mt-4 flex w-full max-w-[1100px] flex-col gap-4 px-4 pb-24 lg:mt-0 lg:gap-6 lg:px-6"
>
	<!-- Page Header -->
	<div class="mb-0 flex flex-col gap-1 lg:mb-2">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h1 class="text-2xl font-bold text-white lg:text-3xl">{tx('step1.header.title')}</h1>
				<p class="mt-1 text-sm text-text-muted">
					{tx('step1.header.description')}
				</p>
			</div>
			<div
				class="flex items-center gap-2 self-start rounded-xl border border-blue-800/50 bg-navy-card px-3 py-2 sm:self-auto lg:px-4 lg:py-2.5"
			>
				<div class="h-2 w-2 animate-pulse rounded-full bg-brand-blue"></div>
				<span class="text-[10px] font-semibold text-brand-blue lg:text-xs">
					<span class="hidden lg:inline">{tx('step3.badge.inProgressDesktop')}</span>
					<span class="inline lg:hidden">{tx('step3.badge.inProgressMobile')}</span>
				</span>
			</div>
		</div>
	</div>

	<MobileStatusCard {processingState} {currentFile} />

	<div class="grid grid-cols-1 gap-4 lg:grid-cols-[55%_43%] lg:gap-6">
		<ProcessingFilesCard {processingState} {uploadedFiles} {overallPct} />
		<ProcessingStatusCard {processingState} {uploadedFiles} {currentFile} />
	</div>

	<ActivityLogAccordion {processingState} {uploadedFiles} />
</main>
