import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetSubscription = vi.fn();
const mockGetCredits = vi.fn();

vi.mock('$lib/clients/metaCleanerApi.js', () => ({
	getSubscription: mockGetSubscription,
	getCredits: mockGetCredits
}));

const { billingStore } = await import('../billingStore.svelte.js');

function makeSubResponse(overrides = {}) {
	return {
		plan_id: 'free',
		status: 'free',
		subscription_credits: 3,
		purchased_credits: 0,
		total_credits: 3,
		...overrides
	};
}

function makeCredResponse(overrides = {}) {
	return {
		subscription_credits: 3,
		purchased_credits: 0,
		total_credits: 3,
		transactions: [],
		...overrides
	};
}

describe('billingStore', () => {
	beforeEach(() => {
		mockGetSubscription.mockReset();
		mockGetCredits.mockReset();
		billingStore.clear();
	});

	// ─── Initial state ────────────────────────────────────────────────────────

	it('starts with null credits', () => {
		expect(billingStore.credits).toBeNull();
	});

	it('starts with isLoading false', () => {
		expect(billingStore.isLoading).toBe(false);
	});

	it('starts with hasError false', () => {
		expect(billingStore.hasError).toBe(false);
	});

	it('starts with planId free and planStatus free', () => {
		expect(billingStore.planId).toBe('free');
		expect(billingStore.planStatus).toBe('free');
	});

	it('starts with subscriptionCredits and purchasedCredits 0', () => {
		expect(billingStore.subscriptionCredits).toBe(0);
		expect(billingStore.purchasedCredits).toBe(0);
	});

	// ─── refresh success ──────────────────────────────────────────────────────

	it('refresh success updates credits from API response', async () => {
		mockGetSubscription.mockResolvedValue(makeSubResponse());
		mockGetCredits.mockResolvedValue(makeCredResponse({ total_credits: 42 }));

		await billingStore.refresh();

		expect(billingStore.credits).toBe(42);
	});

	it('refresh success updates subscriptionCredits and purchasedCredits', async () => {
		mockGetSubscription.mockResolvedValue(makeSubResponse());
		mockGetCredits.mockResolvedValue(
			makeCredResponse({ subscription_credits: 10, purchased_credits: 5, total_credits: 15 })
		);

		await billingStore.refresh();

		expect(billingStore.subscriptionCredits).toBe(10);
		expect(billingStore.purchasedCredits).toBe(5);
	});

	it('refresh success updates planId and planStatus', async () => {
		mockGetSubscription.mockResolvedValue(makeSubResponse({ plan_id: 'pro', status: 'active' }));
		mockGetCredits.mockResolvedValue(makeCredResponse());

		await billingStore.refresh();

		expect(billingStore.planId).toBe('pro');
		expect(billingStore.planStatus).toBe('active');
	});

	it('refresh success clears hasError', async () => {
		mockGetSubscription.mockRejectedValueOnce(new Error('network'));
		mockGetCredits.mockRejectedValueOnce(new Error('network'));
		await billingStore.refresh();

		mockGetSubscription.mockResolvedValue(makeSubResponse());
		mockGetCredits.mockResolvedValue(makeCredResponse());
		await billingStore.refresh();

		expect(billingStore.hasError).toBe(false);
	});

	it('refresh sets isLoading true during initial fetch and false after', async () => {
		let loadingDuringFetch = false;
		mockGetSubscription.mockImplementation(async () => {
			loadingDuringFetch = billingStore.isLoading;
			return makeSubResponse();
		});
		mockGetCredits.mockResolvedValue(makeCredResponse());

		await billingStore.refresh();

		expect(loadingDuringFetch).toBe(true);
		expect(billingStore.isLoading).toBe(false);
	});

	it('refresh does not set isLoading when credits already cached', async () => {
		mockGetSubscription.mockResolvedValue(makeSubResponse());
		mockGetCredits.mockResolvedValue(makeCredResponse({ total_credits: 10 }));
		await billingStore.refresh();

		let loadingDuringSecondFetch = false;
		mockGetSubscription.mockImplementation(async () => {
			loadingDuringSecondFetch = billingStore.isLoading;
			return makeSubResponse();
		});
		mockGetCredits.mockResolvedValue(makeCredResponse({ total_credits: 8 }));
		await billingStore.refresh();

		expect(loadingDuringSecondFetch).toBe(false);
	});

	// ─── refresh failure — no cached data ─────────────────────────────────────

	it('refresh failure with no cached data sets hasError true', async () => {
		mockGetSubscription.mockRejectedValue(new Error('network'));
		mockGetCredits.mockRejectedValue(new Error('network'));

		await billingStore.refresh();

		expect(billingStore.hasError).toBe(true);
	});

	it('refresh failure with no cached data keeps credits null', async () => {
		mockGetSubscription.mockRejectedValue(new Error('network'));
		mockGetCredits.mockRejectedValue(new Error('network'));

		await billingStore.refresh();

		expect(billingStore.credits).toBeNull();
	});

	it('refresh failure with no cached data sets isLoading false', async () => {
		mockGetSubscription.mockRejectedValue(new Error('network'));
		mockGetCredits.mockRejectedValue(new Error('network'));

		await billingStore.refresh();

		expect(billingStore.isLoading).toBe(false);
	});

	// ─── refresh failure — with cached data ───────────────────────────────────

	it('refresh failure with cached data retains previous credits value', async () => {
		mockGetSubscription.mockResolvedValue(makeSubResponse({ plan_id: 'pro', status: 'active' }));
		mockGetCredits.mockResolvedValue(makeCredResponse({ total_credits: 55 }));
		await billingStore.refresh();

		mockGetSubscription.mockRejectedValue(new Error('network'));
		mockGetCredits.mockRejectedValue(new Error('network'));
		await billingStore.refresh();

		expect(billingStore.credits).toBe(55);
	});

	it('refresh failure with cached data sets hasError true', async () => {
		mockGetSubscription.mockResolvedValue(makeSubResponse());
		mockGetCredits.mockResolvedValue(makeCredResponse({ total_credits: 10 }));
		await billingStore.refresh();

		mockGetSubscription.mockRejectedValue(new Error('network'));
		mockGetCredits.mockRejectedValue(new Error('network'));
		await billingStore.refresh();

		expect(billingStore.hasError).toBe(true);
	});

	// ─── refreshCreditsOnly ───────────────────────────────────────────────────

	it('refreshCreditsOnly updates credits without touching planId', async () => {
		mockGetSubscription.mockResolvedValue(makeSubResponse({ plan_id: 'pro', status: 'active' }));
		mockGetCredits.mockResolvedValue(makeCredResponse({ total_credits: 20 }));
		await billingStore.refresh();

		mockGetCredits.mockResolvedValue(makeCredResponse({ total_credits: 18 }));
		await billingStore.refreshCreditsOnly();

		expect(billingStore.credits).toBe(18);
		expect(billingStore.planId).toBe('pro');
	});

	it('refreshCreditsOnly failure sets hasError true', async () => {
		mockGetCredits.mockRejectedValue(new Error('network'));
		await billingStore.refreshCreditsOnly();
		expect(billingStore.hasError).toBe(true);
	});

	// ─── clear ────────────────────────────────────────────────────────────────

	it('clear resets credits to null', async () => {
		mockGetSubscription.mockResolvedValue(makeSubResponse());
		mockGetCredits.mockResolvedValue(makeCredResponse({ total_credits: 50 }));
		await billingStore.refresh();

		billingStore.clear();

		expect(billingStore.credits).toBeNull();
	});

	it('clear resets planId and planStatus to free', async () => {
		mockGetSubscription.mockResolvedValue(makeSubResponse({ plan_id: 'proplus', status: 'active' }));
		mockGetCredits.mockResolvedValue(makeCredResponse());
		await billingStore.refresh();

		billingStore.clear();

		expect(billingStore.planId).toBe('free');
		expect(billingStore.planStatus).toBe('free');
	});

	it('clear resets hasError to false', async () => {
		mockGetSubscription.mockRejectedValue(new Error('network'));
		mockGetCredits.mockRejectedValue(new Error('network'));
		await billingStore.refresh();

		billingStore.clear();

		expect(billingStore.hasError).toBe(false);
	});

	it('clear resets subscriptionCredits and purchasedCredits to 0', async () => {
		mockGetSubscription.mockResolvedValue(makeSubResponse());
		mockGetCredits.mockResolvedValue(
			makeCredResponse({ subscription_credits: 10, purchased_credits: 5, total_credits: 15 })
		);
		await billingStore.refresh();

		billingStore.clear();

		expect(billingStore.subscriptionCredits).toBe(0);
		expect(billingStore.purchasedCredits).toBe(0);
	});

	it('clear resets isLoading to false', () => {
		billingStore.clear();
		expect(billingStore.isLoading).toBe(false);
	});

	// ─── derived getters ──────────────────────────────────────────────────────

	it('isFreeUser is true when planId is free', async () => {
		mockGetSubscription.mockResolvedValue(makeSubResponse({ plan_id: 'free', status: 'free' }));
		mockGetCredits.mockResolvedValue(makeCredResponse());
		await billingStore.refresh();

		expect(billingStore.isFreeUser).toBe(true);
	});

	it('isFreeUser is true when planStatus is cancelled', async () => {
		mockGetSubscription.mockResolvedValue(
			makeSubResponse({ plan_id: 'pro', status: 'cancelled' })
		);
		mockGetCredits.mockResolvedValue(makeCredResponse());
		await billingStore.refresh();

		expect(billingStore.isFreeUser).toBe(true);
	});

	it('isFreeUser is false for active pro plan', async () => {
		mockGetSubscription.mockResolvedValue(makeSubResponse({ plan_id: 'pro', status: 'active' }));
		mockGetCredits.mockResolvedValue(makeCredResponse());
		await billingStore.refresh();

		expect(billingStore.isFreeUser).toBe(false);
	});

	it('isPaidPlan is true for active pro plan', async () => {
		mockGetSubscription.mockResolvedValue(makeSubResponse({ plan_id: 'pro', status: 'active' }));
		mockGetCredits.mockResolvedValue(makeCredResponse());
		await billingStore.refresh();

		expect(billingStore.isPaidPlan).toBe(true);
	});

	it('isPaidPlan is true for trialing proplus plan', async () => {
		mockGetSubscription.mockResolvedValue(
			makeSubResponse({ plan_id: 'proplus', status: 'trialing' })
		);
		mockGetCredits.mockResolvedValue(makeCredResponse());
		await billingStore.refresh();

		expect(billingStore.isPaidPlan).toBe(true);
	});

	it('isPaidPlan is false for free user', () => {
		billingStore.clear();
		expect(billingStore.isPaidPlan).toBe(false);
	});

	it('isPaidPlan is false for cancelled subscription', async () => {
		mockGetSubscription.mockResolvedValue(
			makeSubResponse({ plan_id: 'pro', status: 'cancelled' })
		);
		mockGetCredits.mockResolvedValue(makeCredResponse());
		await billingStore.refresh();

		expect(billingStore.isPaidPlan).toBe(false);
	});

	it('monthlyAllowance is 3 for free plan', () => {
		billingStore.clear();
		expect(billingStore.monthlyAllowance).toBe(3);
	});

	it('monthlyAllowance is 100 for pro plan', async () => {
		mockGetSubscription.mockResolvedValue(makeSubResponse({ plan_id: 'pro', status: 'active' }));
		mockGetCredits.mockResolvedValue(makeCredResponse());
		await billingStore.refresh();

		expect(billingStore.monthlyAllowance).toBe(100);
	});

	it('monthlyAllowance is 100 for proplus plan', async () => {
		mockGetSubscription.mockResolvedValue(
			makeSubResponse({ plan_id: 'proplus', status: 'active' })
		);
		mockGetCredits.mockResolvedValue(makeCredResponse());
		await billingStore.refresh();

		expect(billingStore.monthlyAllowance).toBe(100);
	});
});
