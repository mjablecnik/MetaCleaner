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

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}
</script>

<div class="hidden flex-col gap-5 lg:flex">
	<div class="flex flex-col gap-5 rounded-2xl border border-gray-800 bg-navy-card p-6 shadow-card">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<h3 class="text-lg font-semibold text-white">{tx('step2.risk.title')}</h3>
			<span
				class="flex items-center gap-1.5 rounded-full border border-brand-red/20 bg-brand-red/10 px-3 py-1 text-xs font-bold tracking-wider text-brand-red uppercase"
			>
				<span class="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand-red"></span>
				{tx('step2.risk.highRisk')}
			</span>
		</div>

		<!-- Score Ring + Description -->
		<div class="flex items-center gap-6">
			<RiskScoreRing {score} color="red" size="lg" showLabel={true} />
			<div class="flex flex-1 flex-col gap-2">
				<p class="text-sm font-bold text-white">{tx('step2.risk.leakProbable')}</p>
				<p class="text-xs leading-relaxed text-text-muted">
					{tx('step2.risk.description')}
				</p>
				<div class="mt-1 flex items-center gap-1.5">
					<span
						class="rounded border border-brand-red/25 bg-brand-red/15 px-2 py-0.5 text-[10px] font-bold text-brand-red"
						>GPS</span
					>
					<span
						class="rounded border border-brand-orange/25 bg-brand-orange/15 px-2 py-0.5 text-[10px] font-bold text-brand-orange"
						>{tx('step2.risk.chipIdentity')}</span
					>
					<span
						class="rounded border border-brand-orange/25 bg-brand-orange/15 px-2 py-0.5 text-[10px] font-bold text-brand-orange"
						>{tx('step2.risk.chipDevice')}</span
					>
				</div>
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

		<!-- Before/After -->
		<BeforeAfterScore {beforeScore} {afterScore} />

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
	</div>
</div>
