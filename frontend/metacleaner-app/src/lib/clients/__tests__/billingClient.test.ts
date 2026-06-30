import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Hoisted mocks ──────────────────────────────────────────────────────────

const { mockFetch, mockBuildApiUrl, mockAuthStore } = vi.hoisted(() => ({
	mockFetch: vi.fn<() => Promise<Response>>(),
	mockBuildApiUrl: vi.fn<(path: string) => string>((path) => `http://localhost:8080${path}`),
	mockAuthStore: { accessToken: 'billing-token' as string | null }
}));

vi.mock('$lib/clients/api-config.js', () => ({
	buildApiUrl: mockBuildApiUrl
}));

vi.mock('$lib/auth/auth.svelte.js', () => ({
	authStore: mockAuthStore
}));

vi.stubGlobal('fetch', mockFetch);

import { billingClient } from '../billingClient.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeResponse(ok: boolean, status: number, body: unknown, statusText = 'Error'): Response {
	return {
		ok,
		status,
		statusText,
		json: vi.fn().mockResolvedValue(body),
		text: vi.fn().mockResolvedValue(JSON.stringify(body))
	} as unknown as Response;
}

function makeResponseJsonFails(status: number, statusText: string): Response {
	return {
		ok: false,
		status,
		statusText,
		json: vi.fn().mockRejectedValue(new Error('not json')),
		text: vi.fn().mockResolvedValue(statusText)
	} as unknown as Response;
}

function makeTextErrorResponse(status: number, text: string): Response {
	return {
		ok: false,
		status,
		statusText: 'Error',
		json: vi.fn().mockResolvedValue({}),
		text: vi.fn().mockResolvedValue(text)
	} as unknown as Response;
}

beforeEach(() => {
	mockFetch.mockReset();
	mockAuthStore.accessToken = 'billing-token';
	mockBuildApiUrl.mockImplementation((path: string) => `http://localhost:8080${path}`);
});

// ─── createCheckoutSession ────────────────────────────────────────────────────

describe('billingClient.createCheckoutSession', () => {
	it('sends POST to /api/billing/checkout with Authorization and JSON body', async () => {
		mockFetch.mockResolvedValue(makeResponse(true, 200, { url: 'https://stripe.com/checkout' }));

		await billingClient.createCheckoutSession('pro', 'monthly');

		expect(mockFetch).toHaveBeenCalledWith(
			'http://localhost:8080/api/billing/checkout',
			expect.objectContaining({
				method: 'POST',
				headers: expect.objectContaining({
					'Content-Type': 'application/json',
					Authorization: 'Bearer billing-token'
				}),
				body: JSON.stringify({ plan_id: 'pro', billing_period: 'monthly' })
			})
		);
	});

	it('returns CheckoutResponse on success', async () => {
		const checkoutResp = { url: 'https://stripe.com/checkout/session-123' };
		mockFetch.mockResolvedValue(makeResponse(true, 200, checkoutResp));

		const result = await billingClient.createCheckoutSession('pro', 'yearly');
		expect(result).toEqual(checkoutResp);
	});

	it('throws Error with body.message on non-ok response', async () => {
		mockFetch.mockResolvedValue(
			makeResponse(false, 400, { message: 'Invalid plan' }, 'Bad Request')
		);

		await expect(billingClient.createCheckoutSession('invalid', 'monthly')).rejects.toThrow(
			'Invalid plan'
		);
	});

	it('falls back to statusText when json() rejects on error', async () => {
		mockFetch.mockResolvedValue(makeResponseJsonFails(503, 'Service Unavailable'));

		await expect(billingClient.createCheckoutSession('pro', 'monthly')).rejects.toThrow(
			'Service Unavailable'
		);
	});
});

// ─── getSubscription ──────────────────────────────────────────────────────────

describe('billingClient.getSubscription', () => {
	it('sends GET to /api/billing/subscription with Authorization header', async () => {
		const sub = { plan_id: 'pro', status: 'active', billing_period: 'monthly' };
		mockFetch.mockResolvedValue(makeResponse(true, 200, sub));

		await billingClient.getSubscription();

		expect(mockFetch).toHaveBeenCalledWith(
			'http://localhost:8080/api/billing/subscription',
			expect.objectContaining({
				headers: expect.objectContaining({ Authorization: 'Bearer billing-token' })
			})
		);
	});

	it('returns SubscriptionStatus on success', async () => {
		const sub = { plan_id: 'free', status: 'active', billing_period: 'monthly' };
		mockFetch.mockResolvedValue(makeResponse(true, 200, sub));

		const result = await billingClient.getSubscription();
		expect(result).toEqual(sub);
	});

	it('throws Error(await res.text()) on non-ok response', async () => {
		mockFetch.mockResolvedValue(makeTextErrorResponse(404, 'Subscription not found'));

		await expect(billingClient.getSubscription()).rejects.toThrow('Subscription not found');
	});
});

// ─── changePlan ───────────────────────────────────────────────────────────────

describe('billingClient.changePlan', () => {
	it('sends POST to /api/billing/change-plan with correct body and Authorization', async () => {
		const resp = { success: true };
		mockFetch.mockResolvedValue(makeResponse(true, 200, resp));

		await billingClient.changePlan('proplus', 'yearly');

		expect(mockFetch).toHaveBeenCalledWith(
			'http://localhost:8080/api/billing/change-plan',
			expect.objectContaining({
				method: 'POST',
				headers: expect.objectContaining({
					'Content-Type': 'application/json',
					Authorization: 'Bearer billing-token'
				}),
				body: JSON.stringify({ plan_id: 'proplus', billing_period: 'yearly' })
			})
		);
	});

	it('returns ChangePlanResponse on success', async () => {
		const resp = { success: true, effective_at: '2026-07-01T00:00:00Z' };
		mockFetch.mockResolvedValue(makeResponse(true, 200, resp));

		const result = await billingClient.changePlan('pro', 'monthly');
		expect(result).toEqual(resp);
	});

	it('throws Error with body.message on non-ok response', async () => {
		mockFetch.mockResolvedValue(makeResponse(false, 400, { message: 'Downgrade not allowed' }));

		await expect(billingClient.changePlan('free', 'monthly')).rejects.toThrow(
			'Downgrade not allowed'
		);
	});

	it('falls back to statusText when json() rejects on error', async () => {
		mockFetch.mockResolvedValue(makeResponseJsonFails(500, 'Server Error'));

		await expect(billingClient.changePlan('pro', 'yearly')).rejects.toThrow('Server Error');
	});
});

// ─── cancelSubscription ───────────────────────────────────────────────────────

describe('billingClient.cancelSubscription', () => {
	it('sends POST to /api/billing/cancel with Authorization header', async () => {
		mockFetch.mockResolvedValue(makeResponse(true, 200, { success: true }));

		await billingClient.cancelSubscription();

		expect(mockFetch).toHaveBeenCalledWith(
			'http://localhost:8080/api/billing/cancel',
			expect.objectContaining({
				method: 'POST',
				headers: expect.objectContaining({ Authorization: 'Bearer billing-token' })
			})
		);
	});

	it('returns CancelResponse on success', async () => {
		const resp = { success: true, cancelled_at: '2026-07-01T00:00:00Z' };
		mockFetch.mockResolvedValue(makeResponse(true, 200, resp));

		const result = await billingClient.cancelSubscription();
		expect(result).toEqual(resp);
	});

	it('throws Error with body.message on non-ok response', async () => {
		mockFetch.mockResolvedValue(makeResponse(false, 400, { message: 'Cannot cancel trial' }));

		await expect(billingClient.cancelSubscription()).rejects.toThrow('Cannot cancel trial');
	});

	it('falls back to statusText when json() rejects on error', async () => {
		mockFetch.mockResolvedValue(makeResponseJsonFails(503, 'Service Unavailable'));

		await expect(billingClient.cancelSubscription()).rejects.toThrow('Service Unavailable');
	});
});

// ─── reactivateSubscription ───────────────────────────────────────────────────

describe('billingClient.reactivateSubscription', () => {
	it('sends POST to /api/billing/reactivate with Authorization header', async () => {
		mockFetch.mockResolvedValue(makeResponse(true, 200, { success: true }));

		await billingClient.reactivateSubscription();

		expect(mockFetch).toHaveBeenCalledWith(
			'http://localhost:8080/api/billing/reactivate',
			expect.objectContaining({
				method: 'POST',
				headers: expect.objectContaining({ Authorization: 'Bearer billing-token' })
			})
		);
	});

	it('returns ReactivateResponse on success', async () => {
		const resp = { success: true };
		mockFetch.mockResolvedValue(makeResponse(true, 200, resp));

		const result = await billingClient.reactivateSubscription();
		expect(result).toEqual(resp);
	});

	it('throws Error with body.message on non-ok response', async () => {
		mockFetch.mockResolvedValue(makeResponse(false, 409, { message: 'Already active' }));

		await expect(billingClient.reactivateSubscription()).rejects.toThrow('Already active');
	});

	it('falls back to statusText when json() rejects on error', async () => {
		mockFetch.mockResolvedValue(makeResponseJsonFails(500, 'Internal Error'));

		await expect(billingClient.reactivateSubscription()).rejects.toThrow('Internal Error');
	});
});

// ─── cancelDowngrade ─────────────────────────────────────────────────────────

describe('billingClient.cancelDowngrade', () => {
	it('sends POST to /api/billing/cancel-downgrade with Authorization header', async () => {
		mockFetch.mockResolvedValue(makeResponse(true, 200, { success: true }));

		await billingClient.cancelDowngrade();

		expect(mockFetch).toHaveBeenCalledWith(
			'http://localhost:8080/api/billing/cancel-downgrade',
			expect.objectContaining({
				method: 'POST',
				headers: expect.objectContaining({ Authorization: 'Bearer billing-token' })
			})
		);
	});

	it('returns CancelDowngradeResponse on success', async () => {
		const resp = { success: true };
		mockFetch.mockResolvedValue(makeResponse(true, 200, resp));

		const result = await billingClient.cancelDowngrade();
		expect(result).toEqual(resp);
	});

	it('throws Error with body.message on non-ok response', async () => {
		mockFetch.mockResolvedValue(makeResponse(false, 400, { message: 'No pending downgrade' }));

		await expect(billingClient.cancelDowngrade()).rejects.toThrow('No pending downgrade');
	});

	it('falls back to statusText when json() rejects on error', async () => {
		mockFetch.mockResolvedValue(makeResponseJsonFails(500, 'Server Failure'));

		await expect(billingClient.cancelDowngrade()).rejects.toThrow('Server Failure');
	});
});
