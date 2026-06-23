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
		onEnterpriseContact?: () => void;
		currentPlanId?: string | null;
	}

	const {
		plans,
		isYearly,
		enterprise,
		translate,
		translateParam,
		onPlanSelect,
		onEnterpriseContact,
		currentPlanId
	}: Props = $props();
</script>

<!-- Desktop Plans -->
<div class="hidden w-full flex-col items-center md:flex">
	<div class="mb-10 grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
		{#each plans as plan (plan.id)}
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
	<EnterpriseBanner {enterprise} size="desktop" {translate} onContact={onEnterpriseContact} />
</div>

<!-- Mobile Plans -->
<div class="flex w-full flex-col items-center md:hidden">
	<div class="mb-6 flex w-full flex-col gap-4">
		{#each plans as plan (plan.id)}
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
	<EnterpriseBanner {enterprise} size="mobile" {translate} onContact={onEnterpriseContact} />
</div>
