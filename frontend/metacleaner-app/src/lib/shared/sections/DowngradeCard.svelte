<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { locale } from '$lib/locale.svelte';

	interface Props {
		targetPlanId: string;
		targetPlanName: string;
		targetPrice: string;
		featuresLost: string[];
		onDowngrade: () => void;
	}

	const { targetPlanId: _targetPlanId, targetPlanName, targetPrice, featuresLost, onDowngrade }: Props =
		$props();

	function downgradeTitle() {
		void locale.current;
		return tx('subscription.downgrade.title', { plan: targetPlanName });
	}
</script>

<div class="rounded-2xl border border-gray-700/60 bg-navy-card p-5 shadow-card lg:p-6">
	<div class="mb-4 flex items-start justify-between">
		<div>
			<p class="mb-0.5 text-xs font-medium uppercase tracking-wider text-text-muted">
				{downgradeTitle()}
			</p>
			<h3 class="text-xl font-bold text-white">{targetPlanName}</h3>
		</div>
		<span class="text-lg font-bold text-text-muted">{targetPrice}</span>
	</div>

	{#if featuresLost.length > 0}
		<div class="mb-5">
			<p class="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
				{tx('subscription.downgrade.featuresLost')}
			</p>
			<ul class="space-y-1.5">
				{#each featuresLost as feature}
					<li class="flex items-center gap-2 text-sm text-text-muted">
						<i class="fa-solid fa-xmark text-[11px] text-red-400"></i>
						{feature}
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<button
		onclick={onDowngrade}
		class="w-full rounded-xl border border-gray-600 bg-transparent px-4 py-2.5 text-sm font-semibold text-text-muted transition-all duration-200 hover:bg-gray-700/30 active:scale-[0.98]"
	>
		{tx('subscription.downgrade.button')}
	</button>
</div>
