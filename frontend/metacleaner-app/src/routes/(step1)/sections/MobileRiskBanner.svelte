<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import { scannerStore } from '$lib/scanner/scannerStore.svelte';
	import RiskScoreRing from '../components/RiskScoreRing.svelte';
	import RiskBreakdownBar from '../components/RiskBreakdownBar.svelte';
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

	let accordionOpen = $state(false);

	type RingColor = 'red' | 'orange' | 'green' | 'blue';
	type BarSeverity = 'critical' | 'high' | 'medium' | 'low';

	const ringColorMap: Record<SeverityLevel, RingColor> = {
		critical: 'red',
		high: 'orange',
		medium: 'orange',
		low: 'green'
	};

	const severityBadgeClass: Record<SeverityLevel, string> = {
		critical: 'border-brand-red/30 bg-navy-card border-brand-red/30',
		high: 'border-brand-orange/30 bg-navy-card',
		medium: 'border-brand-orange/30 bg-navy-card',
		low: 'border-gray-700 bg-navy-card'
	};

	const severityTextClass: Record<SeverityLevel, string> = {
		critical: 'text-brand-red',
		high: 'text-brand-orange',
		medium: 'text-brand-orange',
		low: 'text-text-muted'
	};

	const dotColorClass: Record<SeverityLevel, string> = {
		critical: 'bg-brand-red',
		high: 'bg-brand-orange',
		medium: 'bg-brand-orange',
		low: 'bg-gray-500'
	};

	const severityLabelKey: Record<SeverityLevel, string> = {
		critical: 'step2.risk.critical',
		high: 'step2.risk.high',
		medium: 'step2.risk.medium',
		low: 'step2.risk.low'
	};

	function barSeverity(v: number): BarSeverity {
		if (v >= 75) return 'critical';
		if (v >= 50) return 'high';
		if (v >= 25) return 'medium';
		return 'low';
	}
</script>

<div aria-live="polite" aria-atomic="true" class="sr-only">
	Risk score: {score} out of 100. Severity: {severity}.
</div>
<div
	class="overflow-hidden rounded-2xl border shadow-card lg:hidden {severityBadgeClass[severity]}"
>
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
						class="flex items-center gap-1 rounded-full border border-gray-700 bg-navy-lighter px-2 py-0.5 text-[10px] font-bold uppercase {severityTextClass[severity]}"
					>
						<span
							class="inline-block h-1.5 w-1.5 animate-pulse rounded-full {dotColorClass[severity]}"
						></span>
						{tx(severityLabelKey[severity])}
					</span>
				</div>
				<p class="text-[11px] text-text-muted">{tx('step2.risk.description')}</p>
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
			<div class="flex flex-col gap-3">
				<p class="text-[10px] font-bold tracking-widest text-text-muted uppercase">
					{tx('step2.risk.analysisTitle')}
				</p>
				<RiskBreakdownBar
					icon="fa-solid fa-location-dot"
					label={tx('step2.risk.gpsCoordinates')}
					severity={barSeverity(categories.gps)}
					severityLabel={tx(severityLabelKey[barSeverity(categories.gps)])}
					value={categories.gps}
				/>
				<RiskBreakdownBar
					icon="fa-solid fa-mobile-screen"
					label={tx('step2.risk.deviceIdentity')}
					severity={barSeverity(categories.deviceIdentity)}
					severityLabel={tx(severityLabelKey[barSeverity(categories.deviceIdentity)])}
					value={categories.deviceIdentity}
				/>
				<RiskBreakdownBar
					icon="fa-solid fa-user"
					label={tx('step2.risk.personalData')}
					severity={barSeverity(categories.personalData)}
					severityLabel={tx(severityLabelKey[barSeverity(categories.personalData)])}
					value={categories.personalData}
				/>
				<RiskBreakdownBar
					icon="fa-solid fa-clock"
					label={tx('step2.risk.timestamp')}
					severity={barSeverity(categories.timestamps)}
					severityLabel={tx(severityLabelKey[barSeverity(categories.timestamps)])}
					value={categories.timestamps}
				/>
			</div>
		</div>
	{/if}
</div>
