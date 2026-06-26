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

	const {
		targetPlanId: _targetPlanId,
		targetPlanName,
		targetPrice,
		featuresLost,
		onDowngrade
	}: Props = $props();

	function downgradeTitle() {
		void locale.current;
		return tx('subscription.downgrade.title', { plan: targetPlanName });
	}
</script>

<div class="rounded-2xl border border-gray-800 bg-navy-card p-5">
	<!-- Header row -->
	<div class="mb-1 flex items-center gap-3 lg:mb-1">
		<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-lighter">
			<i class="fa-solid fa-arrow-down text-text-muted"></i>
		</div>
		<div>
			<h3 class="text-sm font-bold">{downgradeTitle()}</h3>
			<p class="text-xs text-text-muted">{tx('subscription.downgrade.subtitle')}</p>
		</div>
		<div class="ml-auto shrink-0 text-right">
			<div class="text-base font-black lg:text-lg">{targetPrice}</div>
			<div class="text-xs text-text-muted">{tx('subscription.downgrade.priceType')}</div>
		</div>
	</div>

	<!-- Features list -->
	{#if featuresLost.length > 0}
		<!-- Mobile: compact features in subtitle -->
		<div class="mt-2 mb-3 lg:hidden">
			<p class="text-xs text-text-muted">
				{featuresLost.join(' · ')}
			</p>
		</div>

		<!-- Desktop: features in box -->
		<div class="my-3 hidden rounded-xl bg-navy-lighter p-3 lg:block">
			<div class="flex flex-col gap-1.5">
				{#each featuresLost as feature (feature)}
					<div class="flex items-center gap-2">
						<i class="fa-solid fa-xmark text-xs text-brand-red"></i>
						<span class="text-xs text-text-muted">{feature}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- CTA Button -->
	<button
		onclick={onDowngrade}
		class="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-700 py-3 text-sm font-semibold text-text-muted transition-colors hover:bg-navy-lighter active:scale-[0.98]"
	>
		<i class="fa-solid fa-arrow-down text-xs"></i>
		{tx('subscription.downgrade.button')}
	</button>
</div>
