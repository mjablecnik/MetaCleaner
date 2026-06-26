<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { locale } from '$lib/locale.svelte';

	interface Props {
		targetPlanId: string;
		targetPlanName: string;
		targetPrice: string;
		differentialFeatures: string[];
		onUpgrade: () => void;
	}

	const {
		targetPlanId: _targetPlanId,
		targetPlanName,
		targetPrice,
		differentialFeatures,
		onUpgrade
	}: Props = $props();

	function upgradeTitle() {
		void locale.current;
		return tx('subscription.upgrade.title', { plan: targetPlanName });
	}
</script>

<div
	class="rounded-2xl border border-blue-600/40 bg-gradient-to-br from-blue-950/60 to-navy-card p-5 shadow-card lg:p-6"
>
	<div class="mb-4 flex items-start justify-between">
		<div>
			<p class="mb-0.5 text-xs font-medium tracking-wider text-blue-400/70 uppercase">
				{upgradeTitle()}
			</p>
			<h3 class="text-xl font-bold text-white">{targetPlanName}</h3>
		</div>
		<span class="text-lg font-bold text-blue-400">{targetPrice}</span>
	</div>

	{#if differentialFeatures.length > 0}
		<div class="mb-5">
			<p class="mb-2 text-xs font-medium tracking-wider text-text-muted uppercase">
				{tx('subscription.upgrade.featuresGained')}
			</p>
			<ul class="space-y-1.5">
				{#each differentialFeatures as feature (feature)}
					<li class="flex items-center gap-2 text-sm text-white">
						<i class="fa-solid fa-plus text-[11px] text-blue-400"></i>
						{feature}
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<button
		onclick={onUpgrade}
		class="w-full rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-brand-blue/90 active:scale-[0.98]"
	>
		{tx('subscription.upgrade.button')}
	</button>
</div>
