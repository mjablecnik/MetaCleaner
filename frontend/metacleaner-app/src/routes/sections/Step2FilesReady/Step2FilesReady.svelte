<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { appState } from '$lib/stores/appState.svelte';
	import { scannerStore } from '$lib/scanner/scannerStore.svelte';
	import MobileBottomCta from '$lib/shared/components/MobileBottomCta.svelte';
	import UploadZoneCard from '../../(step1)/sections/UploadZoneCard.svelte';
	import FileListCard from '../../(step1)/sections/FileListCard.svelte';
	import RiskScannerCard from '../../(step1)/sections/RiskScannerCard.svelte';
	import MobileRiskBanner from '../../(step1)/sections/MobileRiskBanner.svelte';

	function startCleaning() {
		if (scannerStore.hasFiles) appState.transitionTo('processing');
	}
</script>

<!-- Desktop: two-column grid 55%/43% | Mobile: single column -->
<div class="grid grid-cols-1 gap-4 lg:grid-cols-[55%_43%] lg:gap-6">
	<!-- Left: upload zone + risk banner (mobile) + file list + desktop start button -->
	<div class="flex flex-col gap-4 lg:gap-5">
		<UploadZoneCard />

		<!-- Mobile risk banner (collapsible accordion) -->
		<div class="lg:hidden">
			<MobileRiskBanner />
		</div>

		<FileListCard />

		<!-- Mobile CTA hint card -->
		<div
			class="flex items-center gap-3 rounded-xl border border-brand-green/20 bg-brand-green/[0.06] px-4 py-3 lg:hidden"
		>
			<i class="fa-solid fa-shield-halved text-sm text-brand-green"></i>
			<p class="text-xs text-text-muted">
				{tx('step2.risk.reducePre')}
				<span class="font-semibold text-brand-green">{tx('step2.risk.reduceHighlight')}</span>
			</p>
		</div>

		<!-- Desktop-only enabled start cleaning button -->
		<div class="hidden lg:block">
			<button
				onclick={startCleaning}
				class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-3.5 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-500"
			>
				<i class="fa-solid fa-wand-magic-sparkles"></i>
				{tx('common.startCleaning')}
			</button>
		</div>
	</div>

	<!-- Right: risk scanner panel (desktop only) -->
	<div class="hidden flex-col lg:flex">
		<RiskScannerCard />
	</div>
</div>

<!-- Mobile: fixed bottom CTA -->
<MobileBottomCta>
	<button
		onclick={startCleaning}
		class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-4 text-sm font-bold text-white shadow-glow-green transition-transform active:scale-95"
	>
		<i class="fa-solid fa-wand-magic-sparkles"></i>
		{tx('common.startCleaning')}
	</button>
</MobileBottomCta>
