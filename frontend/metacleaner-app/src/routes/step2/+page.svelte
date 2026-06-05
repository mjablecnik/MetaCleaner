<script lang="ts">
	import { onMount } from 'svelte';
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import { getUploadedFiles, type UploadedFile } from '$lib/repositories/fileRepository';
	import MobileRiskBanner from './sections/MobileRiskBanner.svelte';
	import FileListCard from './sections/FileListCard.svelte';
	import RiskScannerCard from './sections/RiskScannerCard.svelte';

	let uploadedFiles = $state<UploadedFile[]>([]);

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}

	function removeFile(fileId: string) {
		uploadedFiles = uploadedFiles.filter((f) => f.id !== fileId);
	}

	function clearAll() {
		uploadedFiles = [];
	}

	onMount(() => {
		getUploadedFiles().then((files) => {
			uploadedFiles = files;
		});
	});
</script>

<svelte:head>
	<title>{tx('step2.meta.title')}</title>
</svelte:head>

<main
	class="mx-auto mt-4 flex w-full max-w-[1100px] flex-col gap-4 px-4 pb-32 lg:mt-0 lg:gap-6 lg:px-6 lg:pb-24"
>
	<!-- Page Header -->
	<div class="mb-0 flex flex-col gap-1 lg:mb-2">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h1 class="text-2xl font-bold text-white lg:text-3xl">{tx('step1.header.title')}</h1>
				<p class="mt-1 text-sm text-text-muted">{tx('step1.header.description')}</p>
			</div>
			<div
				class="flex items-center gap-2 self-start rounded-xl border border-gray-700 bg-navy-card px-3 py-2 sm:self-auto lg:px-4 lg:py-2.5"
			>
				<div class="h-2 w-2 animate-pulse rounded-full bg-brand-orange"></div>
				<span class="text-[10px] font-semibold text-text-muted lg:text-xs">
					<span class="hidden lg:inline">{tx('step2.header.readyDesktop')}</span>
					<span class="inline lg:hidden">{tx('step2.header.readyMobile')}</span>
				</span>
			</div>
		</div>
	</div>

	<MobileRiskBanner />

	<div class="grid grid-cols-1 gap-4 lg:grid-cols-[55%_43%] lg:gap-6">
		<FileListCard files={uploadedFiles} onClearAll={clearAll} onRemoveFile={removeFile} />
		<RiskScannerCard />
	</div>
</main>
