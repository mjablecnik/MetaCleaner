<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { t } from '$lib/i18n';
	import {
		pricingRepository,
		getEnterprise,
		PricingHeaderSection,
		PricingPlansSection
	} from 'metacleaner-shared';
	import { PUBLIC_APP_URL } from '$env/static/public';

	let currentBilling = $state<'monthly' | 'yearly'>('monthly');

	const isYearly = $derived(currentBilling === 'yearly');

	const plans = pricingRepository();
	const enterprise = getEnterprise();

	function onBillingChange(value: 'monthly' | 'yearly') {
		currentBilling = value;
	}

	function translateParam(key: string, params: Record<string, string>): string {
		const fn = (
			m as unknown as Record<string, ((p: Record<string, string>) => string) | undefined>
		)[key];
		if (!fn) return key;
		return fn(params);
	}

	function handlePlanSelect(planId: string, billing: 'monthly' | 'yearly') {
		const appUrl = PUBLIC_APP_URL || 'https://app.metacleaner.com';
		window.location.href = `${appUrl}/pricing?plan=${planId}&billing=${billing}`;
	}
</script>

<svelte:head>
	<title>{m.meta_pricing_title()}</title>
</svelte:head>

<div class="flex flex-col items-center w-full min-h-screen">
	<main class="flex flex-col items-center flex-1 w-full max-w-site mx-auto px-6 py-8 md:py-16">
		<PricingHeaderSection value={currentBilling} onChange={onBillingChange} translate={t} />
		<PricingPlansSection
			{plans}
			{isYearly}
			{enterprise}
			translate={t}
			{translateParam}
			onPlanSelect={handlePlanSelect}
		/>
	</main>
</div>
