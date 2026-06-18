<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { pricingRepository, getEnterprise } from '$lib/repositories';
	import SiteNavbar from '$lib/components/shared/SiteNavbar.svelte';
	import MobileNavbar from '$lib/components/shared/MobileNavbar.svelte';
	import MobileMenu from '$lib/components/shared/MobileMenu.svelte';
	import PricingHeaderSection from './sections/PricingHeaderSection.svelte';
	import PricingPlansSection from './sections/PricingPlansSection.svelte';
	import PricingFooter from './sections/PricingFooter.svelte';

	let mobileMenuOpen = $state(false);
	let currentBilling = $state<'monthly' | 'yearly'>('monthly');

	const isYearly = $derived(currentBilling === 'yearly');

	const plans = pricingRepository();
	const enterprise = getEnterprise();

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}

	function onBillingChange(value: 'monthly' | 'yearly') {
		currentBilling = value;
	}
</script>

<svelte:head>
	<title>{m.meta_pricing_title()}</title>
</svelte:head>

<div class="flex flex-col items-center w-full min-h-screen">
	<SiteNavbar active="pricing" />
	<MobileNavbar open={mobileMenuOpen} onToggle={toggleMobileMenu} />
	<MobileMenu variant="dropdown" active="pricing" open={mobileMenuOpen} onClose={closeMobileMenu} />

	<!-- Desktop Main -->
	<main class="hidden md:flex w-full max-w-site mx-auto px-6 py-16 flex-col items-center flex-1">
		<PricingHeaderSection value={currentBilling} onChange={onBillingChange} />
		<PricingPlansSection {plans} {isYearly} {enterprise} />
	</main>

	<!-- Mobile Main -->
	<main class="md:hidden w-full px-4 py-8 flex flex-col items-center flex-1">
		<PricingHeaderSection value={currentBilling} onChange={onBillingChange} />
		<PricingPlansSection {plans} {isYearly} {enterprise} />
	</main>

	<PricingFooter />
</div>
