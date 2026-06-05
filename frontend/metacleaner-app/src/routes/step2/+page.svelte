<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import { scannerStore } from '$lib/scanner/scannerStore.svelte';
	import RiskScoreRing from '../(step1)/components/RiskScoreRing.svelte';
	import RiskBreakdownBar from '../(step1)/components/RiskBreakdownBar.svelte';
	import BeforeAfterScore from '../(step1)/components/BeforeAfterScore.svelte';
	import type { SeverityLevel } from '$lib/scanner/types';

	$effect(() => {
		if (!scannerStore.hasFiles) goto(resolve('/' as Pathname), { replaceState: true });
	});

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
	const fileCount = $derived(scannerStore.files.length);

	type BarSeverity = 'critical' | 'high' | 'medium' | 'low';

	const severityLabelKey: Record<SeverityLevel, string> = {
		critical: 'step2.risk.critical',
		high: 'step2.risk.high',
		medium: 'step2.risk.medium',
		low: 'step2.risk.low'
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

	type RingColor = 'red' | 'orange' | 'green' | 'blue';
	const ringColorMap: Record<SeverityLevel, RingColor> = {
		critical: 'red',
		high: 'orange',
		medium: 'orange',
		low: 'green'
	};

	function barSeverity(v: number): BarSeverity {
		if (v >= 75) return 'critical';
		if (v >= 50) return 'high';
		if (v >= 25) return 'medium';
		return 'low';
	}
</script>

<svelte:head>
	<title>{tx('step2.meta.title')}</title>
</svelte:head>

<main
	class="mx-auto mt-4 flex w-full max-w-[700px] flex-col gap-4 px-4 pb-32 lg:mt-0 lg:gap-6 lg:px-6"
>
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-white lg:text-3xl">
				<span class="hidden lg:inline">{tx('step2.header.readyDesktop')}</span>
				<span class="inline lg:hidden">{tx('step2.header.readyMobile')}</span>
			</h1>
			<p class="mt-1 text-sm text-text-muted">
				{tx('step2.risk.description')}
			</p>
		</div>
		<span
			class="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wider uppercase {severityBadgeClass[severity]}"
		>
			<span class="inline-block h-1.5 w-1.5 animate-pulse rounded-full {dotColorClass[severity]}"></span>
			{tx(severityLabelKey[severity])}
		</span>
	</div>

	<!-- Risk Analysis Card -->
	<div class="flex flex-col gap-5 rounded-2xl border border-gray-800 bg-navy-card p-5 shadow-card lg:p-6">
		<div class="flex items-center gap-2">
			<i class="fa-solid fa-shield-halved text-base text-brand-orange"></i>
			<h3 class="text-base font-semibold text-white">{tx('step2.risk.title')}</h3>
		</div>

		<!-- Score Ring + Description -->
		<div class="flex items-start gap-5">
			<RiskScoreRing {score} color={ringColorMap[severity]} size="lg" showLabel={true} />
			<div class="flex flex-1 flex-col gap-2 pt-1">
				<p class="text-sm font-bold text-white">{tx('step2.risk.leakProbable')}</p>
				{#if categories.gps > 0 || categories.deviceIdentity > 0 || categories.personalData > 0}
					<div class="flex flex-wrap items-center gap-1.5">
						{#if categories.gps > 0}
							<span class="rounded border border-brand-red/25 bg-brand-red/15 px-2 py-0.5 text-[10px] font-bold text-brand-red">GPS</span>
						{/if}
						{#if categories.deviceIdentity > 0}
							<span class="rounded border border-brand-orange/25 bg-brand-orange/15 px-2 py-0.5 text-[10px] font-bold text-brand-orange">{tx('step2.risk.chipDevice')}</span>
						{/if}
						{#if categories.personalData > 0}
							<span class="rounded border border-brand-orange/25 bg-brand-orange/15 px-2 py-0.5 text-[10px] font-bold text-brand-orange">{tx('step2.risk.chipPersonal')}</span>
						{/if}
					</div>
				{/if}
			</div>
		</div>

		<!-- Risk Breakdown -->
		<div class="flex flex-col gap-3">
			<p class="text-xs font-bold tracking-widest text-text-muted uppercase">{tx('step2.risk.analysisTitle')}</p>
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

		<!-- Before/After -->
		<BeforeAfterScore beforeScore={score} afterScore={0} />

		<!-- CTA hint -->
		<div class="flex items-start gap-3 rounded-xl border border-brand-green/20 bg-brand-green/8 px-4 py-3">
			<i class="fa-solid fa-shield-halved mt-0.5 text-sm text-brand-green"></i>
			<p class="text-xs text-text-muted">
				{tx('step2.risk.reducePre')}
				<span class="font-semibold text-brand-green">{tx('step2.risk.reduceHighlight')}</span>
			</p>
		</div>
	</div>

	<!-- File count summary -->
	<p class="text-center text-xs text-text-muted">
		{fileCount}
		{fileCount === 1 ? 'file' : 'files'} ready for cleaning
	</p>

	<!-- Desktop CTA -->
	<div class="hidden flex-col gap-3 lg:flex">
		<button
			onclick={() => goto(resolve('/step3' as Pathname))}
			class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-3.5 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-500"
		>
			<i class="fa-solid fa-wand-magic-sparkles"></i>
			{tx('step1.actions.startCleaning')}
		</button>
		<button
			onclick={() => goto(resolve('/' as Pathname))}
			class="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-700 bg-navy-lighter py-3 text-sm font-semibold text-text-muted transition-all hover:bg-gray-800 hover:text-white"
		>
			<i class="fa-solid fa-arrow-left"></i>
			{tx('step2.files.addMore')}
		</button>
	</div>
</main>

<!-- Mobile fixed bottom CTA -->
<div class="fixed right-0 bottom-0 left-0 z-50 flex flex-col gap-2 border-t border-gray-800 bg-navy-main px-4 py-4 lg:hidden">
	<button
		onclick={() => goto(resolve('/step3' as Pathname))}
		class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-4 text-sm font-bold text-white shadow-glow-green transition-transform active:scale-95"
	>
		<i class="fa-solid fa-wand-magic-sparkles"></i>
		{tx('step1.actions.startCleaning')}
	</button>
	<button
		onclick={() => goto(resolve('/' as Pathname))}
		class="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-700 bg-navy-lighter py-3 text-sm font-semibold text-text-muted transition-transform active:scale-95"
	>
		<i class="fa-solid fa-arrow-left"></i>
		{tx('step2.files.addMore')}
	</button>
</div>
