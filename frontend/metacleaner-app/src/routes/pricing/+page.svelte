<script lang="ts">
	import { onMount } from 'svelte';
	import { tx } from '$lib/shared/utils/i18n';
	import { locale } from '$lib/locale.svelte';
	import { authStore } from '$lib/auth/auth.svelte';
	import { billingClient } from '$lib/clients/billingClient';
	import {
		PricingHeaderSection,
		PricingPlansSection,
		pricingRepository,
		getEnterprise
	} from 'metacleaner-shared';

	let { data } = $props();

	// eslint-disable-next-line svelte/prefer-writable-derived
	let currentBilling = $state<'monthly' | 'yearly'>('monthly');
	$effect(() => {
		currentBilling = data.billing === 'yearly' ? 'yearly' : 'monthly';
	});
	const isYearly = $derived(currentBilling === 'yearly');

	const plans = pricingRepository();
	const enterprise = getEnterprise();

	let checkoutError = $state<string | null>(null);
	let isCheckingOut = $state(false);

	const currentPlanId = $derived(
		authStore.subscription && authStore.subscription.plan_id !== 'free'
			? authStore.subscription.plan_id
			: null
	);

	function translate(key: string): string {
		void locale.current;
		return tx(key);
	}

	function translateParam(key: string, params: Record<string, string>): string {
		void locale.current;
		return tx(key, params);
	}

	function onBillingChange(value: 'monthly' | 'yearly') {
		currentBilling = value;
	}

	async function handlePlanSelect(planId: string, billing: 'monthly' | 'yearly') {
		if (isCheckingOut) return;
		checkoutError = null;
		isCheckingOut = true;
		try {
			const { url } = await billingClient.createCheckoutSession(planId, billing);
			window.location.href = url;
		} catch (err: unknown) {
			checkoutError = (err as Error).message || tx('pricing.checkout.error');
			isCheckingOut = false;
		}
	}

	onMount(() => {
		// Auto-trigger checkout when redirected from website with plan query param
		const planParam = data.plan;
		const billingParam = data.billing;
		if (planParam && authStore.isAuthenticated) {
			handlePlanSelect(planParam, billingParam === 'yearly' ? 'yearly' : 'monthly');
		}
	});
</script>

<svelte:head>
	<title>{tx('pricing.meta.title')}</title>
</svelte:head>

<div class="flex min-h-screen w-full flex-col items-center">
	<main class="mx-auto flex w-full max-w-[1100px] flex-1 flex-col items-center px-6 py-8 md:py-16">
		<PricingHeaderSection value={currentBilling} onChange={onBillingChange} {translate} />

		{#if checkoutError}
			<div
				class="mb-6 w-full max-w-lg rounded-xl bg-red-500/10 px-4 py-3 text-center text-sm text-red-400"
			>
				<i class="fa-solid fa-circle-exclamation mr-1.5"></i>{checkoutError}
			</div>
		{/if}

		{#if isCheckingOut}
			<div class="mb-6 flex items-center gap-2 text-sm text-text-muted">
				<i class="fa-solid fa-spinner fa-spin text-brand-blue"></i>
				<span>Redirecting to checkout...</span>
			</div>
		{/if}

		<PricingPlansSection
			{plans}
			{isYearly}
			{enterprise}
			{translate}
			{translateParam}
			onPlanSelect={handlePlanSelect}
			{currentPlanId}
		/>
	</main>
</div>
