<script lang="ts">
	import type { Plan, EnterprisePlan } from '../types/pricing.js';
	import PricingCard from './PricingCard.svelte';
	import EnterpriseBanner from './EnterpriseBanner.svelte';

	interface Props {
		plans: Plan[];
		isYearly: boolean;
		enterprise: EnterprisePlan;
		translate: (key: string) => string;
		translateParam?: (key: string, params: Record<string, string>) => string;
		onPlanSelect?: (planId: string, billing: 'monthly' | 'yearly') => void;
		currentPlanId?: string | null;
	}

	const { plans, isYearly, enterprise, translate, translateParam, onPlanSelect, currentPlanId }: Props = $props();
</script>

<!-- Desktop Plans -->
<div class="hidden md:flex w-full flex-col items-center">
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-10">
		{#each plans as plan, i (i)}
			<PricingCard
				{plan}
				{isYearly}
				size="desktop"
				{translate}
				{translateParam}
				onSelect={onPlanSelect}
				isCurrent={currentPlanId === plan.id}
			/>
		{/each}
	</div>
	<EnterpriseBanner {enterprise} size="desktop" {translate} />
</div>

<!-- Mobile Plans -->
<div class="md:hidden w-full flex flex-col items-center">
	<div class="flex flex-col gap-4 w-full mb-6">
		{#each plans as plan, i (i)}
			<PricingCard
				{plan}
				{isYearly}
				size="mobile"
				{translate}
				{translateParam}
				onSelect={onPlanSelect}
				isCurrent={currentPlanId === plan.id}
			/>
		{/each}
	</div>
	<EnterpriseBanner {enterprise} size="mobile" {translate} />
</div>
