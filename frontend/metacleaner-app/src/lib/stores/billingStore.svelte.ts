import { getCredits, getSubscription } from '$lib/clients/metaCleanerApi.js';
import { PLAN_CONFIG } from '$lib/shared/utils/planStyleMap.js';

function createBillingStore() {
	let credits = $state<number | null>(null);
	let subscriptionCredits = $state(0);
	let purchasedCredits = $state(0);
	let planId = $state('free');
	let planStatus = $state('free');
	let billingPeriod = $state<'monthly' | 'yearly' | null>(null);
	let currentPeriodEnd = $state<string | null>(null);
	let scheduledPlanId = $state<string | null>(null);
	let scheduledBillingPeriod = $state<string | null>(null);
	let scheduledChangeDate = $state<string | null>(null);
	let isLoading = $state(false);
	let hasError = $state(false);
	let pendingDeductUntil = 0; // timestamp until which server values higher than local are ignored

	const isCancellingPlan = $derived(planStatus === 'cancelling');
	const isDowngradeScheduled = $derived(scheduledPlanId !== null);
	const isFreeUser = $derived(
		!isCancellingPlan && (planId === 'free' || planStatus === 'cancelled' || planStatus === 'free')
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
			billingPeriod = (sub.billing_period as 'monthly' | 'yearly') ?? null;
			currentPeriodEnd = sub.current_period_end ?? null;
			scheduledPlanId = sub.scheduled_plan_id ?? null;
			scheduledBillingPeriod = sub.scheduled_billing_period ?? null;
			scheduledChangeDate = sub.scheduled_change_date ?? null;

			// If an optimistic deduct is pending, don't let stale server data overwrite our lower local value.
			if (Date.now() < pendingDeductUntil && credits !== null && cred.total_credits > credits) {
				// Server hasn't caught up yet — keep local optimistic value, only update plan info.
				hasError = false;
				return;
			}

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

			// If an optimistic deduct is pending, don't let stale server data overwrite our lower local value.
			if (Date.now() < pendingDeductUntil && credits !== null && cred.total_credits > credits) {
				return;
			}

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
		billingPeriod = null;
		currentPeriodEnd = null;
		scheduledPlanId = null;
		scheduledBillingPeriod = null;
		scheduledChangeDate = null;
		isLoading = false;
		hasError = false;
	}

	/** Optimistically deduct credits from the local state (before server confirms). */
	function optimisticDeduct(amount: number): void {
		if (credits !== null) {
			credits = Math.max(0, credits - amount);
		}
		// Deduct from subscription credits first, then purchased
		const fromSub = Math.min(subscriptionCredits, amount);
		subscriptionCredits -= fromSub;
		const fromPurchased = Math.min(purchasedCredits, amount - fromSub);
		purchasedCredits -= fromPurchased;
		// Guard: ignore server responses that return a higher value for the next 3s
		pendingDeductUntil = Date.now() + 3000;
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
		get billingPeriod() {
			return billingPeriod;
		},
		get currentPeriodEnd() {
			return currentPeriodEnd;
		},
		get scheduledPlanId() {
			return scheduledPlanId;
		},
		get scheduledBillingPeriod() {
			return scheduledBillingPeriod;
		},
		get scheduledChangeDate() {
			return scheduledChangeDate;
		},
		get isLoading() {
			return isLoading;
		},
		get hasError() {
			return hasError;
		},
		get isCancellingPlan() {
			return isCancellingPlan;
		},
		get isDowngradeScheduled() {
			return isDowngradeScheduled;
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
		optimisticDeduct,
		clear
	};
}

export const billingStore = createBillingStore();
