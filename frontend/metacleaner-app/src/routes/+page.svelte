<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import { scannerStore } from '$lib/scanner/scannerStore.svelte';
	import UploadZoneCard from './(step1)/sections/UploadZoneCard.svelte';
	import RiskScannerCard from './(step1)/sections/RiskScannerCard.svelte';
	import FileListCard from './(step1)/sections/FileListCard.svelte';
	import MobileRiskBanner from './(step1)/sections/MobileRiskBanner.svelte';
	import OptionsSheet from './(step1)/sections/OptionsSheet.svelte';
	import UpgradeSheet from './(step1)/sections/UpgradeSheet.svelte';

	let optionsSheetOpen = $state(false);
	let upgradeSheetOpen = $state(false);

	const hasFiles = $derived(scannerStore.hasFiles);

	function tx(key: string): string {
		void locale.current;
		const fn = (m as unknown as Record<string, (() => string) | undefined>)[key];
		return fn ? fn() : key;
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

	{#if !hasFiles}
		<!-- Upload-only layout (full width) -->
		<div class="flex flex-col gap-4 lg:gap-5">
			<UploadZoneCard onOpenOptions={() => (optionsSheetOpen = true)} />
			<!-- Disabled Start Cleaning button (desktop, no files) -->
			<div class="hidden lg:block">
				<button
					disabled
					class="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-gray-700 py-3.5 text-sm font-bold text-gray-500 opacity-60"
				>
					<i class="fa-solid fa-wand-magic-sparkles"></i>
					{tx('step1.actions.startCleaning')}
				</button>
			</div>
		</div>
	{:else}
		<!-- Unified layout: upload + risk scanner -->
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-[55%_43%] lg:gap-6">
			<!-- Left column -->
			<div class="flex flex-col gap-4 lg:gap-5">
				<UploadZoneCard onOpenOptions={() => (optionsSheetOpen = true)} />

				<!-- Mobile risk banner (between upload zone and file list) -->
				<div class="lg:hidden">
					<MobileRiskBanner />
				</div>

				<FileListCard />

				<!-- Start Cleaning button (mobile fixed bottom / inline on desktop) -->
				<div class="hidden lg:block">
					<button
						onclick={() => goto(resolve('/step3'))}
						class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-3.5 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-500"
					>
						<i class="fa-solid fa-wand-magic-sparkles"></i>
						{tx('step1.actions.startCleaning')}
					</button>
				</div>
			</div>

			<!-- Right column (desktop: risk scanner panel) -->
			<div class="flex flex-col gap-4 lg:gap-5">
				<RiskScannerCard />
			</div>
		</div>
	{/if}
</main>

<!-- Mobile fixed bottom CTA (shown when hasFiles) -->
{#if hasFiles}
	<div class="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-800 bg-navy-main px-4 py-4 lg:hidden">
		<button
			onclick={() => goto(resolve('/step3'))}
			class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-4 text-sm font-bold text-white shadow-glow-green transition-transform active:scale-95"
		>
			<i class="fa-solid fa-wand-magic-sparkles"></i>
			{tx('step1.actions.startCleaning')}
		</button>
	</div>
{:else}
	<!-- Disabled Start Cleaning button when no files -->
	<div class="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-800 bg-navy-main px-4 py-4 lg:hidden">
		<button
			disabled
			class="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-gray-700 py-4 text-sm font-bold text-gray-500 opacity-60"
		>
			<i class="fa-solid fa-wand-magic-sparkles"></i>
			{tx('step1.actions.startCleaning')}
		</button>
	</div>
{/if}

<OptionsSheet open={optionsSheetOpen} onClose={() => (optionsSheetOpen = false)} />

<UpgradeSheet open={upgradeSheetOpen} onClose={() => (upgradeSheetOpen = false)} />
