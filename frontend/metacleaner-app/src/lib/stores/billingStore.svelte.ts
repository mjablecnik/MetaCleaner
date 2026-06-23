import { getCredits, getSubscription } from '$lib/clients/metaCleanerApi.js';
import { PLAN_CONFIG } from '$lib/shared/utils/planStyleMap.js';

function createBillingStore() {
	let credits = $state<number | null>(null);
	let subscriptionCredits = $state(0);
	let purchasedCredits = $state(0);
	let planId = $state('free');
	let planStatus = $state('free');
	let isLoading = $state(false);
	let hasError = $state(false);

	const isFreeUser = $derived(
		planId === 'free' || planStatus === 'cancelled' || planStatus === 'free'
	);
	const isPaidPlan = $derived(
		(planStatus === 'active' || planStatus === 'trialing') &&
			(planId === 'pro' || planId === 'proplus')
	);
	const monthlyAllowance = $derived(
		(PLAN_CONFIG[planId as keyof typeof PLAN_CONFIG] ?? PLAN_CONFIG.free).monthlyAllowance
	);

	async function refresh(): Promise<void> {
		// Only show loading state for the initial fetch (credits is null)
		if (credits === null) {
			isLoading = true;
		}

		try {
			const [sub, cred] = await Promise.all([getSubscription(), getCredits()]);

			planId = sub.plan_id ?? 'free';
			planStatus = sub.status ?? 'free';
			subscriptionCredits = cred.subscription_credits;
			purchasedCredits = cred.purchased_credits;
			credits = cred.total_credits;
			hasError = false;
		} catch {
			hasError = true;
			// Retain last known values (credits stays as-is)
		} finally {
			isLoading = false;
		}
	}

	async function refreshCreditsOnly(): Promise<void> {
		try {
			const cred = await getCredits();
			subscriptionCredits = cred.subscription_credits;
			purchasedCredits = cred.purchased_credits;
			credits = cred.total_credits;
			hasError = false;
		} catch {
			hasError = true;
		}
	}

	function clear(): void {
		credits = null;
		subscriptionCredits = 0;
		purchasedCredits = 0;
		planId = 'free';
		planStatus = 'free';
		isLoading = false;
		hasError = false;
	}

	return {
		get credits() {
			return credits;
		},
		get subscriptionCredits() {
			return subscriptionCredits;
		},
		get purchasedCredits() {
			return purchasedCredits;
		},
		get planId() {
			return planId;
		},
		get planStatus() {
			return planStatus;
		},
		get isLoading() {
			return isLoading;
		},
		get hasError() {
			return hasError;
		},
		get isFreeUser() {
			return isFreeUser;
		},
		get isPaidPlan() {
			return isPaidPlan;
		},
		get monthlyAllowance() {
			return monthlyAllowance;
		},
		refresh,
		refreshCreditsOnly,
		clear
	};
}

export const billingStore = createBillingStore();
