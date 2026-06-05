<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import RiskScoreRing from '../../(step1)/components/RiskScoreRing.svelte';
	import RiskBreakdownBar from '../../(step1)/components/RiskBreakdownBar.svelte';
	import BeforeAfterScore from '../../(step1)/components/BeforeAfterScore.svelte';

	interface Props {
		score?: number;
		beforeScore?: number;
		afterScore?: number;
	}

	const { score = 72, beforeScore = 72, afterScore = 100 }: Props = $props();

	let accordionOpen = $state(false);

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}
</script>

<div
	class="overflow-hidden rounded-2xl border border-brand-red/30 bg-navy-card shadow-card lg:hidden"
>
	<button
		type="button"
		onclick={() => (accordionOpen = !accordionOpen)}
		class="flex w-full items-center justify-between px-4 py-3.5"
	>
		<div class="flex items-center gap-3">
			<RiskScoreRing {score} color="red" size="sm" />
			<div>
				<div class="mb-0.5 flex items-center gap-2">
					<span class="text-sm font-bold text-white">{tx('step2.risk.title')}</span>
					<span
						class="flex items-center gap-1 rounded-full border border-brand-red/20 bg-brand-red/10 px-2 py-0.5 text-[10px] font-bold text-brand-red uppercase"
					>
						<span class="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand-red"></span>
						{tx('step2.risk.highRisk')}
					</span>
				</div>
				<div class="flex items-center gap-1.5">
					<span
						class="rounded border border-brand-red/25 bg-brand-red/15 px-1.5 py-0.5 text-[9px] font-bold text-brand-red"
						>GPS</span
					>
					<span
						class="rounded border border-brand-orange/25 bg-brand-orange/15 px-1.5 py-0.5 text-[9px] font-bold text-brand-orange"
						>{tx('step2.risk.chipIdentity')}</span
					>
					<span
						class="rounded border border-brand-orange/25 bg-brand-orange/15 px-1.5 py-0.5 text-[9px] font-bold text-brand-orange"
						>{tx('step2.risk.chipDevice')}</span
					>
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
			<p class="text-xs leading-relaxed text-text-muted">
				{tx('step2.risk.description')}
			</p>

			<div class="flex flex-col gap-3">
				<p class="text-[10px] font-bold tracking-widest text-text-muted uppercase">
					{tx('step2.risk.analysisTitle')}
				</p>
				<RiskBreakdownBar
					icon="fa-solid fa-location-dot"
					label={tx('step2.risk.gpsCoordinates')}
					severity="critical"
					severityLabel={tx('step2.risk.critical')}
					value={92}
				/>
				<RiskBreakdownBar
					icon="fa-solid fa-mobile-screen"
					label={tx('step2.risk.deviceIdentity')}
					severity="high"
					severityLabel={tx('step2.risk.high')}
					value={68}
				/>
				<RiskBreakdownBar
					icon="fa-solid fa-user"
					label={tx('step2.risk.personalData')}
					severity="medium"
					severityLabel={tx('step2.risk.medium')}
					value={48}
				/>
				<RiskBreakdownBar
					icon="fa-solid fa-clock"
					label={tx('step2.risk.timestamp')}
					severity="low"
					severityLabel={tx('step2.risk.low')}
					value={22}
				/>
			</div>

			<BeforeAfterScore {beforeScore} {afterScore} />
		</div>
	{/if}
</div>

<!-- Mobile CTA hint -->
<div
	class="flex items-center gap-3 rounded-xl border border-brand-green/20 bg-brand-green/6 px-4 py-3 lg:hidden"
>
	<i class="fa-solid fa-shield-halved text-sm text-brand-green"></i>
	<p class="text-xs text-text-muted">
		{tx('step2.risk.reducePre')}
		<span class="font-semibold text-brand-green">{tx('step2.risk.reduceHighlight')}</span>
	</p>
</div>
