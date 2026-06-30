import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClientError } from '../types.js';
import { getAnalytics, getGeoDistribution, getFirewallEvents } from '../cloudflareClient.js';
import type { CloudflareClientConfig } from '../../config.js';

const BASE_CONFIG: CloudflareClientConfig = {
	token: 'cf-test-token',
	baseUrl: 'https://api.cloudflare.com/client/v4',
	zoneId: 'zone-abc123',
	timeout: 5_000
};

function graphqlOkResponse(data: unknown) {
	return { ok: true, status: 200, json: async () => ({ data }) };
}

function graphqlErrorsResponse(errors: Array<{ message: string }>) {
	return { ok: true, status: 200, json: async () => ({ data: null, errors }) };
}

function httpErrorResponse(status: number) {
	return { ok: false, status, json: async () => ({}) };
}

function abortError(): Error {
	return Object.assign(new Error('aborted'), { name: 'AbortError' });
}

const ANALYTICS_GQL_DATA = {
	viewer: { zones: [{ httpRequests1dGroups: [] }] }
};

beforeEach(() => {
	vi.stubGlobal('fetch', vi.fn().mockResolvedValue(graphqlOkResponse(ANALYTICS_GQL_DATA)));
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.useRealTimers();
});

describe('getAnalytics', () => {
	it('throws unauthorized ClientError when token is empty and does not call fetch', async () => {
		const mockFetch = vi.fn();
		vi.stubGlobal('fetch', mockFetch);
		const config: CloudflareClientConfig = { ...BASE_CONFIG, token: '' };

		await expect(getAnalytics(config)).rejects.toSatisfy(
			(e: unknown) =>
				e instanceof ClientError && e.category === 'unauthorized' && e.service === 'cloudflare'
		);
		expect(mockFetch).not.toHaveBeenCalled();
	});

	it('throws unauthorized ClientError when token is whitespace only', async () => {
		const config: CloudflareClientConfig = { ...BASE_CONFIG, token: '   ' };
		await expect(getAnalytics(config)).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'unauthorized'
		);
	});

	it('throws request_error ClientError when zoneId is empty', async () => {
		const config: CloudflareClientConfig = { ...BASE_CONFIG, zoneId: '' };
		await expect(getAnalytics(config)).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'request_error'
		);
	});

	it('POSTs to the graphql endpoint with Bearer auth and JSON content type', async () => {
		const mockFetch = vi.fn().mockResolvedValue(graphqlOkResponse(ANALYTICS_GQL_DATA));
		vi.stubGlobal('fetch', mockFetch);

		await getAnalytics(BASE_CONFIG);

		const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
		expect(url).toContain('/graphql');
		expect(init.method).toBe('POST');
		const headers = init.headers as Record<string, string>;
		expect(headers['Authorization']).toBe(`Bearer ${BASE_CONFIG.token}`);
		expect(headers['Content-Type']).toBe('application/json');
	});

	it('sends JSON body with query string and variables.zoneId', async () => {
		const mockFetch = vi.fn().mockResolvedValue(graphqlOkResponse(ANALYTICS_GQL_DATA));
		vi.stubGlobal('fetch', mockFetch);

		await getAnalytics(BASE_CONFIG);

		const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
		const body = JSON.parse(init.body as string) as {
			query: string;
			variables: Record<string, unknown>;
		};
		expect(typeof body.query).toBe('string');
		expect(body.variables.zoneId).toBe(BASE_CONFIG.zoneId);
	});

	it('sends since and until date variables derived from 24 hours before now', async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));
		const mockFetch = vi.fn().mockResolvedValue(graphqlOkResponse(ANALYTICS_GQL_DATA));
		vi.stubGlobal('fetch', mockFetch);

		await getAnalytics(BASE_CONFIG);

		const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
		const { variables } = JSON.parse(init.body as string) as {
			variables: { since: string; until: string };
		};
		expect(variables.since).toBe('2024-01-14');
		expect(variables.until).toBe('2024-01-15');
	});

	it('throws categorized ClientError on non-ok HTTP 401', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(httpErrorResponse(401)));
		await expect(getAnalytics(BASE_CONFIG)).rejects.toSatisfy(
			(e: unknown) =>
				e instanceof ClientError && e.category === 'unauthorized' && e.statusCode === 401
		);
	});

	it('throws categorized ClientError on non-ok HTTP 500', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(httpErrorResponse(500)));
		await expect(getAnalytics(BASE_CONFIG)).rejects.toSatisfy(
			(e: unknown) =>
				e instanceof ClientError && e.category === 'service_unavailable' && e.statusCode === 500
		);
	});

	it('throws request_error ClientError when GraphQL response contains errors array', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(graphqlErrorsResponse([{ message: 'Zone not found' }]))
		);
		await expect(getAnalytics(BASE_CONFIG)).rejects.toSatisfy(
			(e: unknown) =>
				e instanceof ClientError && e.category === 'request_error' && e.service === 'cloudflare'
		);
	});

	it('throws timeout ClientError on AbortError from fetch', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError()));
		await expect(getAnalytics(BASE_CONFIG)).rejects.toSatisfy(
			(e: unknown) =>
				e instanceof ClientError && e.category === 'timeout' && e.service === 'cloudflare'
		);
	});

	it('throws request_error ClientError on generic fetch error', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network down')));
		await expect(getAnalytics(BASE_CONFIG)).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'request_error'
		);
	});

	it('returns httpRequests1dGroups array from the successful response', async () => {
		const groups = [
			{
				sum: {
					requests: 1000,
					cachedRequests: 700,
					bytes: 50_000,
					cachedBytes: 35_000,
					threats: 3
				},
				dimensions: { date: '2024-01-14' }
			}
		];
		vi.stubGlobal(
			'fetch',
			vi
				.fn()
				.mockResolvedValue(
					graphqlOkResponse({ viewer: { zones: [{ httpRequests1dGroups: groups }] } })
				)
		);

		const result = await getAnalytics(BASE_CONFIG);
		expect(result.httpRequests1dGroups).toEqual(groups);
	});

	it('returns empty httpRequests1dGroups when zones array is empty', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(graphqlOkResponse({ viewer: { zones: [] } })));

		const result = await getAnalytics(BASE_CONFIG);
		expect(result.httpRequests1dGroups).toEqual([]);
	});
});

describe('getGeoDistribution', () => {
	const GEO_GQL_DATA = {
		viewer: { zones: [{ httpRequests1dGroups: [{ sum: { countryMap: [] } }] }] }
	};

	it('throws unauthorized ClientError when token is empty', async () => {
		const config: CloudflareClientConfig = { ...BASE_CONFIG, token: '' };
		await expect(getGeoDistribution(config)).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'unauthorized'
		);
	});

	it('throws request_error ClientError when zoneId is empty', async () => {
		const config: CloudflareClientConfig = { ...BASE_CONFIG, zoneId: '' };
		await expect(getGeoDistribution(config)).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'request_error'
		);
	});

	it('sends zoneId in GraphQL variables', async () => {
		const mockFetch = vi.fn().mockResolvedValue(graphqlOkResponse(GEO_GQL_DATA));
		vi.stubGlobal('fetch', mockFetch);

		await getGeoDistribution(BASE_CONFIG);

		const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
		const body = JSON.parse(init.body as string) as { variables: { zoneId: string } };
		expect(body.variables.zoneId).toBe(BASE_CONFIG.zoneId);
	});

	it('returns clientCountryMap from the successful response', async () => {
		const countryMap = [
			{ clientCountryName: 'United States', requests: 5000 },
			{ clientCountryName: 'Germany', requests: 2000 }
		];
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(
				graphqlOkResponse({
					viewer: { zones: [{ httpRequests1dGroups: [{ sum: { countryMap } }] }] }
				})
			)
		);

		const result = await getGeoDistribution(BASE_CONFIG);
		expect(result.clientCountryMap).toEqual(countryMap);
	});

	it('returns empty clientCountryMap when zones have no groups', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(graphqlOkResponse({ viewer: { zones: [] } })));

		const result = await getGeoDistribution(BASE_CONFIG);
		expect(result.clientCountryMap).toEqual([]);
	});
});

describe('getFirewallEvents', () => {
	const FIREWALL_GQL_DATA = {
		viewer: { zones: [{ firewallEventsAdaptive: [] }] }
	};

	it('throws unauthorized ClientError when token is empty', async () => {
		const config: CloudflareClientConfig = { ...BASE_CONFIG, token: '' };
		await expect(getFirewallEvents(config)).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'unauthorized'
		);
	});

	it('throws request_error ClientError when zoneId is empty', async () => {
		const config: CloudflareClientConfig = { ...BASE_CONFIG, zoneId: '' };
		await expect(getFirewallEvents(config)).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'request_error'
		);
	});

	it('sends zoneId and limit in GraphQL variables', async () => {
		const mockFetch = vi.fn().mockResolvedValue(graphqlOkResponse(FIREWALL_GQL_DATA));
		vi.stubGlobal('fetch', mockFetch);

		await getFirewallEvents(BASE_CONFIG, 10);

		const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
		const body = JSON.parse(init.body as string) as {
			variables: { zoneId: string; limit: number };
		};
		expect(body.variables.zoneId).toBe(BASE_CONFIG.zoneId);
		expect(body.variables.limit).toBe(10);
	});

	it('maps firewallEventsAdaptive renaming clientCountryName to clientCountry', async () => {
		const rawEvents = [
			{
				action: 'block',
				clientIP: '192.168.1.100',
				clientCountryName: 'US',
				datetime: '2024-01-15T12:00:00Z',
				ruleId: 'waf-rule-1',
				source: 'waf',
				userAgent: 'curl/7.0'
			}
		];
		vi.stubGlobal(
			'fetch',
			vi
				.fn()
				.mockResolvedValue(
					graphqlOkResponse({ viewer: { zones: [{ firewallEventsAdaptive: rawEvents }] } })
				)
		);

		const result = await getFirewallEvents(BASE_CONFIG);
		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({
			action: 'block',
			clientIP: '192.168.1.100',
			clientCountry: 'US',
			datetime: '2024-01-15T12:00:00Z',
			ruleId: 'waf-rule-1',
			source: 'waf',
			userAgent: 'curl/7.0'
		});
	});

	it('returns empty array when no firewall events in response', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(graphqlOkResponse(FIREWALL_GQL_DATA)));

		const result = await getFirewallEvents(BASE_CONFIG);
		expect(result).toEqual([]);
	});

	it('uses default limit of 20 when not specified', async () => {
		const mockFetch = vi.fn().mockResolvedValue(graphqlOkResponse(FIREWALL_GQL_DATA));
		vi.stubGlobal('fetch', mockFetch);

		await getFirewallEvents(BASE_CONFIG);

		const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
		const body = JSON.parse(init.body as string) as { variables: { limit: number } };
		expect(body.variables.limit).toBe(20);
	});
});
