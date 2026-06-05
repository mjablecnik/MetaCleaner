<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import UploadZoneCard from './(step1)/sections/UploadZoneCard.svelte';
	import StatusCard from './(step1)/sections/StatusCard.svelte';
	import OptionsSheet from './(step1)/sections/OptionsSheet.svelte';
	import UpgradeSheet from './(step1)/sections/UpgradeSheet.svelte';

	let uploadedFiles = $state<File[]>([]);
	let optionsSheetOpen = $state(false);
	let upgradeSheetOpen = $state(false);

	function tx(key: string): string {
		void locale.current;
		const fn = (m as unknown as Record<string, (() => string) | undefined>)[key];
		return fn ? fn() : key;
	}

	function addFiles(fileList: FileList) {
		uploadedFiles = [...uploadedFiles, ...Array.from(fileList)];
	}

	function removeFile(index: number) {
		uploadedFiles = uploadedFiles.filter((_, i) => i !== index);
	}

	function clearFiles() {
		uploadedFiles = [];
	}
</script>

<svelte:head>
	<title>{tx('step1.meta.title')}</title>
</svelte:head>

<main
	class="mx-auto mt-4 flex w-full max-w-[1100px] flex-col gap-4 px-4 pb-24 lg:mt-0 lg:gap-6 lg:px-6"
>
	<div class="mb-0 flex flex-col gap-1 lg:mb-2">
		<h1 class="text-2xl font-bold text-white lg:text-3xl">{tx('step1.header.title')}</h1>
		<p class="mt-1 text-sm text-text-muted">{tx('step1.header.description')}</p>
	</div>

	<div class="grid grid-cols-1 gap-4 lg:grid-cols-[55%_43%] lg:gap-6">
		<div class="flex flex-col gap-4 lg:gap-5">
			<UploadZoneCard
				files={uploadedFiles}
				onFiles={addFiles}
				onRemoveFile={removeFile}
				onClearFiles={clearFiles}
				onOpenOptions={() => (optionsSheetOpen = true)}
			/>
		</div>
		<div class="flex flex-col gap-4 lg:gap-5">
			<StatusCard />
		</div>
	</div>
</main>

<OptionsSheet open={optionsSheetOpen} onClose={() => (optionsSheetOpen = false)} />

<UpgradeSheet open={upgradeSheetOpen} onClose={() => (upgradeSheetOpen = false)} />
