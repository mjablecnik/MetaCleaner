<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import { scannerStore } from '$lib/scanner/scannerStore.svelte';
	import RiskScoreRing from '../components/RiskScoreRing.svelte';
	import RiskBreakdownBar from '../components/RiskBreakdownBar.svelte';
	import BeforeAfterScore from '../components/BeforeAfterScore.svelte';
	import type { SeverityLevel } from '$lib/scanner/types';

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}

	const risk = $derived(scannerStore.aggregatedRisk);
	const score = $derived(risk.overallScore);
	const severity = $derived(risk.severity);
	const categories = $derived(risk.categories);
	const allFilesErrored = $derived(
		risk.fileCount > 0 && risk.scannedCount === 0 && !risk.isScanning
	);

	type RingColor = 'red' | 'orange' | 'green' | 'blue';
	type BarSeverity = 'critical' | 'high' | 'medium' | 'low';

	const ringColorMap: Record<SeverityLevel, RingColor> = {
		critical: 'red',
		high: 'orange',
		medium: 'orange',
		low: 'green'
	};

	const severityBadgeClass: Record<SeverityLevel, string> = {
		critical: 'border-brand-red/20 bg-brand-red/10 text-brand-red',
		high: 'border-brand-orange/20 bg-brand-orange/10 text-brand-orange',
		medium: 'border-brand-orange/20 bg-brand-orange/10 text-brand-orange',
		low: 'border-gray-700 bg-navy-lighter text-text-muted'
	};

	const dotColorClass: Record<SeverityLevel, string> = {
		critical: 'bg-brand-red',
		high: 'bg-brand-orange',
		medium: 'bg-brand-orange',
		low: 'bg-gray-500'
	};

	function gpsBarSeverity(v: number): BarSeverity {
		if (v >= 75) return 'critical';
		if (v >= 50) return 'high';
		if (v >= 25) return 'medium';
		return 'low';
	}

	function deviceBarSeverity(v: number): BarSeverity {
		if (v >= 75) return 'critical';
		if (v >= 50) return 'high';
		if (v >= 25) return 'medium';
		return 'low';
	}

	const severityLabelKey: Record<SeverityLevel, string> = {
		critical: 'step2.risk.critical',
		high: 'step2.risk.high',
		medium: 'step2.risk.medium',
		low: 'step2.risk.low'
	};
</script>

<div aria-live="polite" aria-atomic="true" class="sr-only">
	Risk score: {score} out of 100. Severity: {severity}.
</div>
<div class="hidden flex-col gap-5 lg:flex">
	<div class="flex flex-col gap-5 rounded-2xl border border-gray-800 bg-navy-card p-6 shadow-card">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<h3 class="text-lg font-semibold text-white">{tx('step2.risk.title')}</h3>
			{#if !allFilesErrored}
				<span
					class="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wider uppercase {severityBadgeClass[severity]}"
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
				{#if categories.gps > 0 || categories.deviceIdentity > 0 || categories.personalData > 0}
					<div class="mt-1 flex items-center gap-1.5">
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
								>{tx('step2.risk.chipIdentity')}</span
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
			<RiskBreakdownBar
				icon="fa-solid fa-location-dot"
				label={tx('step2.risk.gpsCoordinates')}
				severity={gpsBarSeverity(categories.gps)}
				severityLabel={tx(severityLabelKey[gpsBarSeverity(categories.gps)])}
				value={categories.gps}
			/>
			<RiskBreakdownBar
				icon="fa-solid fa-mobile-screen"
				label={tx('step2.risk.deviceIdentity')}
				severity={deviceBarSeverity(categories.deviceIdentity)}
				severityLabel={tx(severityLabelKey[deviceBarSeverity(categories.deviceIdentity)])}
				value={categories.deviceIdentity}
			/>
			<RiskBreakdownBar
				icon="fa-solid fa-user"
				label={tx('step2.risk.personalData')}
				severity={deviceBarSeverity(categories.personalData)}
				severityLabel={tx(severityLabelKey[deviceBarSeverity(categories.personalData)])}
				value={categories.personalData}
			/>
			<RiskBreakdownBar
				icon="fa-solid fa-clock"
				label={tx('step2.risk.timestamp')}
				severity={deviceBarSeverity(categories.timestamps)}
				severityLabel={tx(severityLabelKey[deviceBarSeverity(categories.timestamps)])}
				value={categories.timestamps}
			/>
		</div>

		<!-- Before/After -->
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
