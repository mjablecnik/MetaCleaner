<script lang="ts">
	import type { Plan, EnterprisePlan } from '$lib/repositories';
	import PricingCard from '../components/PricingCard.svelte';
	import EnterpriseBanner from '../components/EnterpriseBanner.svelte';

	interface Props {
		plans: Plan[];
		isYearly: boolean;
		enterprise: EnterprisePlan;
	}

	const { plans, isYearly, enterprise }: Props = $props();
</script>

<!-- Desktop Plans -->
<div class="hidden md:flex w-full flex-col items-center">
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-10">
		{#each plans as plan, i (i)}
			<PricingCard {plan} {isYearly} size="desktop" />
		{/each}
	</div>
	<EnterpriseBanner {enterprise} size="desktop" />
</div>

<!-- Mobile Plans -->
<div class="md:hidden w-full flex flex-col items-center">
	<div class="flex flex-col gap-4 w-full mb-6">
		{#each plans as plan, i (i)}
			<PricingCard {plan} {isYearly} size="mobile" />
		{/each}
	</div>
	<EnterpriseBanner {enterprise} size="mobile" />
</div>
