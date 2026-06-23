<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { appState } from '$lib/stores/appState.svelte';
	import { scannerStore } from '$lib/scanner/scannerStore.svelte';
	import { billingStore } from '$lib/stores/billingStore.svelte';
	import { computeTotalCost, isInsufficientCredits } from '$lib/shared/utils/creditCost';
	import MobileBottomCta from '$lib/shared/components/MobileBottomCta.svelte';
	import UploadZoneCard from '../../(step1)/sections/UploadZoneCard.svelte';
	import FileListCard from '../../(step1)/sections/FileListCard.svelte';
	import RiskScannerCard from '../../(step1)/sections/RiskScannerCard.svelte';
	import MobileRiskBanner from '../../(step1)/sections/MobileRiskBanner.svelte';
	import CreditsBanner from '../CreditsBanner.svelte';
	import CreditSummaryRow from '../../(step1)/components/CreditSummaryRow.svelte';
	import ProOverlay from '../../(step1)/components/ProOverlay.svelte';

	const totalCost = $derived(computeTotalCost(scannerStore.files));
	const showProOverlay = $derived(billingStore.isFreeUser || billingStore.hasError);
	const insufficient = $derived(
		billingStore.credits !== null && isInsufficientCredits(totalCost, billingStore.credits)
	);

	function startCleaning() {
		if (scannerStore.hasFiles && !insufficient) appState.transitionTo('processing');
	}
</script>

<!-- CreditsBanner between page header and file upload section -->
<div class="mb-4 lg:mb-5">
	<CreditsBanner
		credits={billingStore.credits ?? 0}
		subscriptionCredits={billingStore.subscriptionCredits}
		monthlyAllowance={billingStore.monthlyAllowance}
		planId={billingStore.planId}
		planStatus={billingStore.planStatus}
		isPaidPlan={billingStore.isPaidPlan}
	/>
</div>

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

		<!-- CreditSummaryRow below file list -->
		<CreditSummaryRow
			{totalCost}
			fileCount={totalCost}
			creditBalance={billingStore.credits}
		/>

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

		<!-- Desktop-only start cleaning button -->
		<div class="hidden lg:block">
			<button
				onclick={startCleaning}
				disabled={insufficient}
				class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-3.5 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:bg-brand-green"
			>
				<i class="fa-solid fa-wand-magic-sparkles"></i>
				{tx('common.startCleaning')}
				<!-- CostIndicatorButton pill -->
				<span
					class="ml-1 inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/10 px-2 py-0.5 text-xs font-bold"
				>
					<i class="fa-solid fa-bolt text-[9px]"></i>
					{totalCost}
				</span>
			</button>
		</div>
	</div>

	<!-- Right: risk scanner panel (desktop only) -->
	<div class="relative hidden flex-col lg:flex">
		<div class={showProOverlay ? 'pointer-events-none blur-[4px]' : ''}>
			<RiskScannerCard />
		</div>
		{#if showProOverlay}
			<ProOverlay />
		{/if}
	</div>
</div>

<!-- Mobile: fixed bottom CTA -->
<MobileBottomCta>
	<button
		onclick={startCleaning}
		disabled={insufficient}
		class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-4 text-sm font-bold text-white shadow-glow-green transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:active:scale-100"
	>
		<i class="fa-solid fa-wand-magic-sparkles"></i>
		{tx('common.startCleaning')}
		<!-- CostIndicatorButton pill -->
		<span
			class="ml-1 inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/10 px-2 py-0.5 text-xs font-bold"
		>
			<i class="fa-solid fa-bolt text-[9px]"></i>
			{totalCost}
		</span>
	</button>
</MobileBottomCta>
