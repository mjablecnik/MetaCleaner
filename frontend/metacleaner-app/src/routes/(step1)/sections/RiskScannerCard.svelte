<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import {
		ringColorMap,
		severityBadgeClass,
		dotColorClass,
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
	const allFilesErrored = $derived(
		risk.fileCount > 0 && risk.scannedCount === 0 && !risk.isScanning
	);

	interface RiskBar {
		icon: string;
		labelKey: string;
		value: number;
	}

	const sortedBars = $derived(
		(
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
			] satisfies RiskBar[]
		).toSorted((a, b) => b.value - a.value)
	);
</script>

<div aria-live="polite" aria-atomic="true" class="sr-only">
	{tx('step2.risk.srAnnouncement', { score, severity: tx(severityLabelKey[severity]) })}
</div>
<div class="flex flex-col gap-5">
	<div class="flex flex-col gap-5 rounded-2xl border border-gray-800 bg-navy-card p-6 shadow-card">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<h3 class="text-lg font-semibold text-white">{tx('step2.risk.title')}</h3>
			{#if !allFilesErrored}
				<span
					class="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wider uppercase {severityBadgeClass[
						severity
					]}"
				>
					<span
						class="inline-block h-1.5 w-1.5 animate-pulse rounded-full {dotColorClass[severity]}"
					></span>
					{tx(severityLabelKey[severity])}
				</span>
			{/if}
		</div>

		<!-- All files error state -->
		{#if allFilesErrored}
			<div class="flex flex-col items-center gap-3 py-6 text-center">
				<i class="fa-solid fa-triangle-exclamation text-2xl text-brand-orange"></i>
				<p class="text-sm font-semibold text-white">{tx('step2.risk.scanFailed')}</p>
				<p class="text-xs text-text-muted">{tx('step2.risk.scanFailedDesc')}</p>
			</div>
		{:else}
			<!-- Score Ring + Description -->
			<div class="flex items-center gap-6">
				<RiskScoreRing {score} color={ringColorMap[severity]} size="lg" showLabel={true} />
				<div class="flex flex-1 flex-col gap-2">
					<p class="text-sm font-bold text-white">{tx('step2.risk.leakProbable')}</p>
					<p class="text-xs leading-relaxed text-text-muted">
						{tx('step2.risk.description')}
					</p>
					{#if categories.gps > 0 || categories.deviceIdentity > 0 || categories.personalData > 0 || categories.aiOrigin > 0}
						<div class="mt-1 flex items-center gap-1.5">
							{#if categories.aiOrigin > 0}
								<span
									class="rounded border border-brand-red/25 bg-brand-red/15 px-2 py-0.5 text-[10px] font-bold text-brand-red"
									>{tx('step2.risk.chipAI')}</span
								>
							{/if}
							{#if categories.gps > 0}
								<span
									class="rounded border border-brand-red/25 bg-brand-red/15 px-2 py-0.5 text-[10px] font-bold text-brand-red"
									>GPS</span
								>
							{/if}
							{#if categories.deviceIdentity > 0}
								<span
									class="rounded border border-brand-orange/25 bg-brand-orange/15 px-2 py-0.5 text-[10px] font-bold text-brand-orange"
									>{tx('step2.risk.chipDevice')}</span
								>
							{/if}
							{#if categories.personalData > 0}
								<span
									class="rounded border border-brand-orange/25 bg-brand-orange/15 px-2 py-0.5 text-[10px] font-bold text-brand-orange"
									>{tx('step2.risk.chipPersonal')}</span
								>
							{/if}
						</div>
					{/if}
				</div>
			</div>

			<!-- Risk Breakdown -->
			<div class="flex flex-col gap-3">
				<p class="text-xs font-bold tracking-widest text-text-muted uppercase">
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

			<!-- Before/After: afterScore is always 0 because full cleaning removes all metadata fields -->
			<BeforeAfterScore beforeScore={score} afterScore={0} />

			<!-- CTA hint -->
			<div
				class="flex items-start gap-3 rounded-xl border border-brand-green/20 bg-brand-green/8 px-4 py-3"
			>
				<i class="fa-solid fa-shield-halved mt-0.5 text-sm text-brand-green"></i>
				<p class="text-xs text-text-muted">
					{tx('step2.risk.reducePre')}
					<span class="font-semibold text-brand-green">{tx('step2.risk.reduceHighlight')}</span>
				</p>
			</div>
		{/if}
	</div>
</div>
