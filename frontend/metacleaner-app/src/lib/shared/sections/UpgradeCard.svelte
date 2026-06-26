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

<div class="relative overflow-hidden rounded-2xl border border-gray-800 bg-navy-card p-5">
	<!-- Decorative circle (desktop only) -->
	<div
		class="absolute top-0 right-0 hidden h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-brand-orange/5 lg:block"
	></div>

	<!-- Header row -->
	<div class="mb-1 flex items-center gap-3 lg:mb-1">
		<div
			class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-orange/20"
		>
			<i class="fa-solid fa-rocket text-brand-orange"></i>
		</div>
		<div>
			<h3 class="text-sm font-bold">{upgradeTitle()}</h3>
			<p class="text-xs text-text-muted">{tx('subscription.upgrade.subtitle')}</p>
		</div>
		<div class="ml-auto shrink-0 text-right">
			<div class="text-base font-black lg:text-lg">{targetPrice}</div>
			<div class="text-xs text-text-muted">{tx('subscription.upgrade.perMonth')}</div>
		</div>
	</div>

	<!-- Features list (desktop: full list, mobile: compact subtitle) -->
	{#if differentialFeatures.length > 0}
		<!-- Mobile: compact features in subtitle -->
		<div class="mt-2 mb-3 lg:hidden">
			<p class="text-xs text-text-muted">
				{differentialFeatures.join(' · ')}
			</p>
		</div>

		<!-- Desktop: features in box -->
		<div class="my-3 hidden rounded-xl bg-navy-lighter p-3 lg:block">
			<div class="flex flex-col gap-1.5">
				{#each differentialFeatures as feature (feature)}
					<div class="flex items-center gap-2">
						<i class="fa-solid fa-check text-xs text-brand-orange"></i>
						<span class="text-xs text-text-muted">{feature}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- CTA Button -->
	<button
		onclick={onUpgrade}
		class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-orange py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600 active:scale-[0.98]"
	>
		<i class="fa-solid fa-arrow-up text-xs"></i>
		{tx('subscription.upgrade.button')} →
	</button>
</div>
