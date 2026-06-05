<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import RiskScoreRing from '../components/RiskScoreRing.svelte';
	import RiskBreakdownBar from '../components/RiskBreakdownBar.svelte';
	import BeforeAfterScore from '../components/BeforeAfterScore.svelte';

	interface Props {
		score?: number;
		beforeScore?: number;
		afterScore?: number;
	}

	const { score = 72, beforeScore = 72, afterScore = 100 }: Props = $props();

	let accordionOpen = $state(false);

	function tx(key: string, params: Record<string, unknown> = {}): string {
		locale.current;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}
</script>

<div
	class="lg:hidden bg-navy-card rounded-2xl border border-brand-red/30 shadow-card overflow-hidden"
>
	<button
		type="button"
		onclick={() => (accordionOpen = !accordionOpen)}
		class="w-full flex items-center justify-between px-4 py-3.5"
	>
		<div class="flex items-center gap-3">
			<RiskScoreRing {score} color="red" size="sm" />
			<div>
				<div class="flex items-center gap-2 mb-0.5">
					<span class="text-sm font-bold text-white">{tx('step2.risk.title')}</span>
					<span
						class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-red/10 text-brand-red border border-brand-red/20 uppercase flex items-center gap-1"
					>
						<span class="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse inline-block"></span>
						{tx('step2.risk.highRisk')}
					</span>
				</div>
				<div class="flex items-center gap-1.5">
					<span
						class="px-1.5 py-0.5 rounded text-[9px] font-bold border border-brand-red/25 bg-brand-red/15 text-brand-red"
						>GPS</span
					>
					<span
						class="px-1.5 py-0.5 rounded text-[9px] font-bold border border-brand-orange/25 bg-brand-orange/15 text-brand-orange"
						>{tx('step2.risk.chipIdentity')}</span
					>
					<span
						class="px-1.5 py-0.5 rounded text-[9px] font-bold border border-brand-orange/25 bg-brand-orange/15 text-brand-orange"
						>{tx('step2.risk.chipDevice')}</span
					>
				</div>
			</div>
		</div>
		<i
			class="fa-solid fa-chevron-down text-text-muted text-sm transition-transform flex-shrink-0 ml-2 {accordionOpen
				? 'rotate-180'
				: ''}"
		></i>
	</button>

	{#if accordionOpen}
		<div class="px-4 pb-4 flex flex-col gap-4">
			<p class="text-xs text-text-muted leading-relaxed">
				{tx('step2.risk.description')}
			</p>

			<div class="flex flex-col gap-3">
				<p class="text-[10px] font-bold uppercase tracking-widest text-text-muted">
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
