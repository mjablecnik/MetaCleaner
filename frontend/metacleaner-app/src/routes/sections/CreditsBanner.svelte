<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import type { Pathname } from '$app/types';
	import { getPlanStyle } from '$lib/shared/utils/planStyleMap';
	import { computeProgressRatio } from '$lib/shared/utils/creditCost';
	import ProgressBar from '$lib/shared/elements/ProgressBar.svelte';

	interface Props {
		credits: number;
		subscriptionCredits: number;
		monthlyAllowance: number;
		planId: string;
		planStatus: string;
		isPaidPlan: boolean;
	}

	const {
		credits: _credits,
		subscriptionCredits,
		monthlyAllowance,
		planId,
		planStatus,
		isPaidPlan
	}: Props = $props();

	const planStyle = $derived(getPlanStyle(planId, planStatus));
	const progressRatio = $derived(computeProgressRatio(subscriptionCredits, monthlyAllowance));
	const progressPercent = $derived(Math.round(progressRatio * 100));

	function handleUpgrade() {
		goto(resolve('/subscription' as Pathname));
	}
</script>

<div class="rounded-xl border border-gray-800 bg-navy-card px-4 py-3 lg:px-5 lg:py-4">
	<!-- Desktop layout -->
	<div class="hidden items-center gap-4 lg:flex">
		<div class="flex items-center gap-2">
			<i class="fa-solid fa-bolt text-sm text-brand-green"></i>
			<span class="text-sm font-semibold text-white">{tx('credits.banner.title')}</span>
		</div>

		<!-- Plan badge -->
		<span
			class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold
				{planStyle.borderColor} {planStyle.textColor} bg-gradient-to-r {planStyle.bgGradient}"
		>
			<i class="fa-solid fa-{planStyle.icon} text-[9px]"></i>
			{planStyle.label}
		</span>

		<!-- Credits info + progress -->
		<div class="flex flex-1 items-center gap-3">
			<span class="text-sm text-text-muted">
				{tx('credits.banner.remaining')}
				<span class="font-bold text-white">{subscriptionCredits}</span>
				{tx('credits.banner.of')}
				<span class="font-semibold text-text-muted">{monthlyAllowance}</span>
			</span>
			<div class="flex-1">
				<ProgressBar value={progressPercent} color="green" height="xs" />
			</div>
		</div>

		<!-- Upgrade CTA -->
		{#if !isPaidPlan}
			<button
				onclick={handleUpgrade}
				class="flex-shrink-0 rounded-lg bg-gradient-to-r from-brand-orange to-orange-500 px-4 py-2 text-xs font-bold text-white shadow-glow-orange transition-all hover:from-orange-500 hover:to-orange-400"
			>
				{tx('credits.banner.upgrade')}
			</button>
		{/if}
	</div>

	<!-- Mobile layout (compact single row) -->
	<div class="flex items-center gap-2 lg:hidden">
		<i class="fa-solid fa-bolt text-xs text-brand-green"></i>

		<div class="flex flex-1 flex-col gap-1">
			<div class="flex items-center gap-2">
				<span class="text-xs font-bold text-white">{subscriptionCredits}</span>
				<span class="text-[10px] text-text-muted">{tx('credits.banner.of')} {monthlyAllowance}</span
				>
				<!-- Plan badge (compact) -->
				<span
					class="inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-bold
						{planStyle.borderColor} {planStyle.textColor} bg-gradient-to-r {planStyle.bgGradient}"
				>
					<i class="fa-solid fa-{planStyle.icon} text-[7px]"></i>
					{planStyle.label}
				</span>
			</div>
			<ProgressBar value={progressPercent} color="green" height="xs" />
		</div>

		{#if !isPaidPlan}
			<button
				onclick={handleUpgrade}
				class="flex-shrink-0 rounded-lg bg-gradient-to-r from-brand-orange to-orange-500 px-3 py-1.5 text-[10px] font-bold text-white"
			>
				{tx('credits.banner.upgradeMobile')}
			</button>
		{/if}
	</div>
</div>
