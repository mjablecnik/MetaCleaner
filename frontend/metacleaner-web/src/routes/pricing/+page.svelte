<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { pricingRepository, getEnterprise } from '$lib/repositories';
	import PricingHeaderSection from './sections/PricingHeaderSection.svelte';
	import PricingPlansSection from './sections/PricingPlansSection.svelte';

	let currentBilling = $state<'monthly' | 'yearly'>('monthly');

	const isYearly = $derived(currentBilling === 'yearly');

	const plans = pricingRepository();
	const enterprise = getEnterprise();

	function onBillingChange(value: 'monthly' | 'yearly') {
		currentBilling = value;
	}
</script>

<svelte:head>
	<title>{m.meta_pricing_title()}</title>
</svelte:head>

<div class="flex flex-col items-center w-full min-h-screen">
	<main class="flex flex-col items-center flex-1 w-full max-w-site mx-auto px-4 md:px-6 py-8 md:py-16">
		<PricingHeaderSection value={currentBilling} onChange={onBillingChange} />
		<PricingPlansSection {plans} {isYearly} {enterprise} />
	</main>
</div>
