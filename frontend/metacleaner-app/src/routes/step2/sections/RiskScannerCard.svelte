<script lang="ts">
	import { currentLocale } from '$lib/locale.svelte';
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
		currentLocale;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}
</script>

<div class="hidden lg:flex flex-col gap-5">
	<div class="bg-navy-card rounded-2xl border border-gray-800 p-6 shadow-card flex flex-col gap-5">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<h3 class="font-semibold text-lg text-white">{tx('step2.risk.title')}</h3>
			<span
				class="text-xs font-bold px-3 py-1 rounded-full bg-brand-red/10 text-brand-red border border-brand-red/20 uppercase tracking-wider flex items-center gap-1.5"
			>
				<span class="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse inline-block"></span>
				{tx('step2.risk.highRisk')}
			</span>
		</div>

		<!-- Score Ring + Description -->
		<div class="flex items-center gap-6">
			<RiskScoreRing {score} color="red" size="lg" showLabel={true} />
			<div class="flex flex-col gap-2 flex-1">
				<p class="text-sm font-bold text-white">{tx('step2.risk.leakProbable')}</p>
				<p class="text-xs text-text-muted leading-relaxed">
					{tx('step2.risk.description')}
				</p>
				<div class="flex items-center gap-1.5 mt-1">
					<span
						class="px-2 py-0.5 rounded text-[10px] font-bold border border-brand-red/25 bg-brand-red/15 text-brand-red"
					>GPS</span>
					<span
						class="px-2 py-0.5 rounded text-[10px] font-bold border border-brand-orange/25 bg-brand-orange/15 text-brand-orange"
					>{tx('step2.risk.chipIdentity')}</span>
					<span
						class="px-2 py-0.5 rounded text-[10px] font-bold border border-brand-orange/25 bg-brand-orange/15 text-brand-orange"
					>{tx('step2.risk.chipDevice')}</span>
				</div>
			</div>
		</div>

		<!-- Risk Breakdown -->
		<div class="flex flex-col gap-3">
			<p class="text-xs font-bold uppercase tracking-widest text-text-muted">
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
			class="flex items-start gap-3 px-4 py-3 rounded-xl border border-brand-green/20 bg-brand-green/8"
		>
			<i class="fa-solid fa-shield-halved text-brand-green text-sm mt-0.5"></i>
			<p class="text-xs text-text-muted">
				{tx('step2.risk.reducePre')}
				<span class="text-brand-green font-semibold">{tx('step2.risk.reduceHighlight')}</span>
			</p>
		</div>
	</div>
</div>
