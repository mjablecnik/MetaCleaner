import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClientError } from '../types.js';
import {
	getActiveSubscriptions,
	getCanceledSubscriptions,
	getPrices
} from '../stripeClient.js';
import type { StripeClientConfig } from '../../config.js';

const BASE_CONFIG: StripeClientConfig = {
	token: 'sk_test_abc123',
	baseUrl: 'https://api.stripe.com/v1',
	timeout: 5_000
};

function stripeListResponse<T>(data: T[], hasMore: boolean) {
	return {
		ok: true,
		status: 200,
		json: async () => ({ object: 'list', data, has_more: hasMore, url: '/v1/subscriptions' })
	};
}

function errorResponse(status: number) {
	return { ok: false, status, json: async () => ({}) };
}

function abortError(): Error {
	return Object.assign(new Error('aborted'), { name: 'AbortError' });
}

beforeEach(() => {
	vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('getActiveSubscriptions', () => {
	it('throws unauthorized ClientError when token is empty', async () => {
		const fetch = vi.fn();
		vi.stubGlobal('fetch', fetch);
		const config: StripeClientConfig = { ...BASE_CONFIG, token: '' };

		await expect(getActiveSubscriptions(config)).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'unauthorized' && e.service === 'stripe'
		);
		expect(fetch).not.toHaveBeenCalled();
	});

	it('throws unauthorized when token is whitespace only', async () => {
		const config: StripeClientConfig = { ...BASE_CONFIG, token: '   ' };
		await expect(getActiveSubscriptions(config)).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'unauthorized'
		);
	});

	it('sends Basic auth header as btoa("token:")', async () => {
		const mockFetch = vi.fn().mockResolvedValue(stripeListResponse([], false));
		vi.stubGlobal('fetch', mockFetch);

		await getActiveSubscriptions(BASE_CONFIG);

		const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
		const expected = `Basic ${btoa(`${BASE_CONFIG.token}:`)}`;
		expect((init.headers as Record<string, string>)['Authorization']).toBe(expected);
	});

	it('sends status=active query param', async () => {
		const mockFetch = vi.fn().mockResolvedValue(stripeListResponse([], false));
		vi.stubGlobal('fetch', mockFetch);

		await getActiveSubscriptions(BASE_CONFIG);

		const [url] = mockFetch.mock.calls[0] as [string];
		const params = new URL(url).searchParams;
		expect(params.get('status')).toBe('active');
	});

	it('returns combined data from paginated responses', async () => {
		const sub1 = { id: 'sub_1', status: 'active' };
		const sub2 = { id: 'sub_2', status: 'active' };
		const sub3 = { id: 'sub_3', status: 'active' };

		const mockFetch = vi
			.fn()
			.mockResolvedValueOnce(stripeListResponse([sub1, sub2], true))
			.mockResolvedValueOnce(stripeListResponse([sub3], false));
		vi.stubGlobal('fetch', mockFetch);

		const result = await getActiveSubscriptions(BASE_CONFIG);

		expect(result).toHaveLength(3);
		expect(mockFetch).toHaveBeenCalledTimes(2);
	});

	it('uses starting_after cursor from last item on paginated fetch', async () => {
		const sub1 = { id: 'sub_first' };
		const sub2 = { id: 'sub_second' };

		const mockFetch = vi
			.fn()
			.mockResolvedValueOnce(stripeListResponse([sub1], true))
			.mockResolvedValueOnce(stripeListResponse([sub2], false));
		vi.stubGlobal('fetch', mockFetch);

		await getActiveSubscriptions(BASE_CONFIG);

		const [url2] = mockFetch.mock.calls[1] as [string];
		expect(new URL(url2).searchParams.get('starting_after')).toBe('sub_first');
	});

	it('throws categorized ClientError on non-ok response', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(errorResponse(401)));

		await expect(getActiveSubscriptions(BASE_CONFIG)).rejects.toSatisfy(
			(e: unknown) =>
				e instanceof ClientError && e.statusCode === 401 && e.category === 'unauthorized'
		);
	});

	it('throws timeout ClientError on AbortError from fetch', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError()));

		await expect(getActiveSubscriptions(BASE_CONFIG)).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'timeout' && e.service === 'stripe'
		);
	});
});

describe('getCanceledSubscriptions', () => {
	it('throws unauthorized when token is missing', async () => {
		const config: StripeClientConfig = { ...BASE_CONFIG, token: '' };
		await expect(getCanceledSubscriptions(config, 1700000000)).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'unauthorized'
		);
	});

	it('sends status=canceled and canceled_at[gte] query params', async () => {
		const mockFetch = vi.fn().mockResolvedValue(stripeListResponse([], false));
		vi.stubGlobal('fetch', mockFetch);

		const since = 1700000000;
		await getCanceledSubscriptions(BASE_CONFIG, since);

		const [url] = mockFetch.mock.calls[0] as [string];
		const params = new URL(url).searchParams;
		expect(params.get('status')).toBe('canceled');
		expect(params.get('canceled_at[gte]')).toBe(String(since));
	});
});

describe('getPrices', () => {
	it('throws unauthorized when token is missing', async () => {
		const config: StripeClientConfig = { ...BASE_CONFIG, token: '' };
		await expect(getPrices(config)).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'unauthorized'
		);
	});

	it('sends active=true query param', async () => {
		const mockFetch = vi.fn().mockResolvedValue(stripeListResponse([], false));
		vi.stubGlobal('fetch', mockFetch);

		await getPrices(BASE_CONFIG);

		const [url] = mockFetch.mock.calls[0] as [string];
		expect(new URL(url).searchParams.get('active')).toBe('true');
	});

	it('returns all prices accumulated across pages', async () => {
		const price1 = { id: 'price_1', unit_amount: 999 };
		const price2 = { id: 'price_2', unit_amount: 1999 };

		vi.stubGlobal(
			'fetch',
			vi
				.fn()
				.mockResolvedValueOnce(stripeListResponse([price1], true))
				.mockResolvedValueOnce(stripeListResponse([price2], false))
		);

		const result = await getPrices(BASE_CONFIG);
		expect(result).toHaveLength(2);
		expect(result[0]).toMatchObject({ id: 'price_1' });
		expect(result[1]).toMatchObject({ id: 'price_2' });
	});

	it('throws service_unavailable ClientError on 500 response', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(errorResponse(500)));

		await expect(getPrices(BASE_CONFIG)).rejects.toSatisfy(
			(e: unknown) =>
				e instanceof ClientError && e.category === 'service_unavailable' && e.statusCode === 500
		);
	});
});
