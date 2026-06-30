<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import {
		ringColorMap,
		dotColorClass,
		severityTextClass,
		severityLabelKey,
		barSeverity
	} from '$lib/shared/utils/riskStyles';
	import { scannerStore } from '$lib/scanner/scannerStore.svelte';
	import RiskScoreRing from '../components/RiskScoreRing.svelte';
	import RiskBreakdownBar from '../components/RiskBreakdownBar.svelte';
	import BeforeAfterScore from '../components/BeforeAfterScore.svelte';

	const risk = $derived(scannerStore.aggregatedRisk);
	const score = $derived(risk.overallScore);
	const severity = $derived(risk.severity);
	const categories = $derived(risk.categories);

	const sortedBars = $derived(
		[
			{
				icon: 'fa-solid fa-location-dot',
				labelKey: 'step2.risk.gpsCoordinates',
				value: categories.gps
			},
			{
				icon: 'fa-solid fa-mobile-screen',
				labelKey: 'step2.risk.deviceIdentity',
				value: categories.deviceIdentity
			},
			{
				icon: 'fa-solid fa-user',
				labelKey: 'step2.risk.personalData',
				value: categories.personalData
			},
			{
				icon: 'fa-solid fa-clock',
				labelKey: 'step2.risk.timestamp',
				value: categories.timestamps
			},
			{ icon: 'fa-solid fa-robot', labelKey: 'step2.risk.aiOrigin', value: categories.aiOrigin }
		].toSorted((a, b) => b.value - a.value)
	);

	let accordionOpen = $state(false);
</script>

<div aria-live="polite" aria-atomic="true" class="sr-only">
	{tx('step2.risk.srAnnouncement', { score, severity: tx(severityLabelKey[severity]) })}
</div>
<div class="overflow-hidden rounded-2xl border border-gray-800 bg-navy-card shadow-card lg:hidden">
	<button
		type="button"
		onclick={() => (accordionOpen = !accordionOpen)}
		class="flex w-full items-center justify-between px-4 py-3.5"
	>
		<div class="flex items-center gap-3">
			<RiskScoreRing {score} color={ringColorMap[severity]} size="sm" />
			<div>
				<div class="mb-0.5 flex items-center gap-2">
					<span class="text-sm font-bold text-white">{tx('step2.risk.title')}</span>
					<span
						class="flex items-center gap-1 rounded-full border border-gray-700 bg-navy-lighter px-2 py-0.5 text-[10px] font-bold uppercase {severityTextClass[
							severity
						]}"
					>
						<span
							class="inline-block h-1.5 w-1.5 animate-pulse rounded-full {dotColorClass[severity]}"
						></span>
						{tx(severityLabelKey[severity])}
					</span>
				</div>
				<!-- Category chips -->
				<div class="flex items-center gap-1.5">
					{#if categories.gps > 0}
						<span
							class="rounded border border-brand-red/25 bg-brand-red/15 px-1.5 py-0.5 text-[9px] font-bold text-brand-red"
							>GPS</span
						>
					{/if}
					{#if categories.deviceIdentity > 0}
						<span
							class="rounded border border-brand-orange/25 bg-brand-orange/15 px-1.5 py-0.5 text-[9px] font-bold text-brand-orange"
							>{tx('step2.risk.chipDevice')}</span
						>
					{/if}
					{#if categories.personalData > 0}
						<span
							class="rounded border border-brand-orange/25 bg-brand-orange/15 px-1.5 py-0.5 text-[9px] font-bold text-brand-orange"
							>{tx('step2.risk.chipPersonal')}</span
						>
					{/if}
				</div>
			</div>
		</div>
		<i
			class="fa-solid fa-chevron-down ml-2 flex-shrink-0 text-sm text-text-muted transition-transform {accordionOpen
				? 'rotate-180'
				: ''}"
		></i>
	</button>

	{#if accordionOpen}
		<div class="flex flex-col gap-4 px-4 pb-4">
			<p class="text-xs leading-relaxed text-text-muted">{tx('step2.risk.description')}</p>
			<div class="flex flex-col gap-3">
				<p class="text-[10px] font-bold tracking-widest text-text-muted uppercase">
					{tx('step2.risk.analysisTitle')}
				</p>
				{#each sortedBars as bar (bar.labelKey)}
					<RiskBreakdownBar
						icon={bar.icon}
						label={tx(bar.labelKey)}
						severity={barSeverity(bar.value)}
						severityLabel={tx(severityLabelKey[barSeverity(bar.value)])}
						value={bar.value}
					/>
				{/each}
			</div>
			<BeforeAfterScore beforeScore={score} afterScore={0} />
		</div>
	{/if}
</div>
