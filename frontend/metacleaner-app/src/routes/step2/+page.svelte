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
		locale.current;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
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
	class="w-full max-w-[1100px] mx-auto px-4 lg:px-6 pb-32 lg:pb-24 flex flex-col gap-4 lg:gap-6 mt-4 lg:mt-0"
>
	<!-- Page Header -->
	<div class="flex flex-col gap-1 mb-0 lg:mb-2">
		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
			<div>
				<h1 class="text-2xl lg:text-3xl font-bold text-white">{tx('step1.header.title')}</h1>
				<p class="text-text-muted text-sm mt-1">{tx('step1.header.description')}</p>
			</div>
			<div
				class="flex items-center gap-2 bg-navy-card border border-gray-700 rounded-xl px-3 lg:px-4 py-2 lg:py-2.5 self-start sm:self-auto"
			>
				<div class="w-2 h-2 rounded-full bg-brand-orange animate-pulse"></div>
				<span class="text-[10px] lg:text-xs font-semibold text-text-muted">
					<span class="hidden lg:inline">{tx('step2.header.readyDesktop')}</span>
					<span class="inline lg:hidden">{tx('step2.header.readyMobile')}</span>
				</span>
			</div>
		</div>
	</div>

	<MobileRiskBanner />

	<div class="grid grid-cols-1 lg:grid-cols-[55%_43%] gap-4 lg:gap-6">
		<FileListCard
			files={uploadedFiles}
			onClearAll={clearAll}
			onRemoveFile={removeFile}
		/>
		<RiskScannerCard />
	</div>
</main>
