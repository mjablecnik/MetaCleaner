<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import SeoHead from '$lib/components/shared/SeoHead.svelte';
	import JsonLd from '$lib/components/shared/JsonLd.svelte';
	import { t } from '$lib/i18n';
	import {
		pricingRepository,
		getEnterprise,
		PricingHeaderSection,
		PricingPlansSection
	} from 'metacleaner-shared';
	import { PUBLIC_APP_URL } from '$env/static/public';

	function parsePrice(priceStr: string): number {
		return parseFloat(priceStr.replace('€', '').replace(',', '.')) || 0;
	}

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

	const activePlans = plans.filter((p) => !p.disabled);
	const pricingJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'MetaCleaner',
		url: 'https://metacleaner.app',
		applicationCategory: 'WebApplication',
		operatingSystem: 'Web',
		offers: activePlans.map((plan) => ({
			'@type': 'Offer',
			name: plan.nameText ?? (plan.nameKey ? t(plan.nameKey) : plan.id),
			price: parsePrice(plan.priceMonthly),
			priceCurrency: 'EUR',
			url: 'https://metacleaner.app/pricing'
		}))
	};
</script>

<SeoHead
	title={m.meta_pricing_title()}
	description={m.meta_pricing_description()}
	path="/pricing"
/>
<JsonLd data={pricingJsonLd} />

<div class="flex flex-col items-center w-full">
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
