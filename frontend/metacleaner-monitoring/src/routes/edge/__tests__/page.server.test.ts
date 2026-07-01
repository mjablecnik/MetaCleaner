const {
	mockGetServiceConfigs,
	mockGetAnalytics,
	mockGetGeoDistribution,
	mockGetFirewallEvents,
	mockMapToEdgeKpiStats,
	mockMapToGeoDistribution,
	mockMapToWafLog,
	mockMapToHttpStatusDistribution
} = vi.hoisted(() => ({
	mockGetServiceConfigs: vi.fn(),
	mockGetAnalytics: vi.fn(),
	mockGetGeoDistribution: vi.fn(),
	mockGetFirewallEvents: vi.fn(),
	mockMapToEdgeKpiStats: vi.fn(),
	mockMapToGeoDistribution: vi.fn(),
	mockMapToWafLog: vi.fn(),
	mockMapToHttpStatusDistribution: vi.fn()
}));

vi.mock('$lib/server/config.js', () => ({
	getServiceConfigs: mockGetServiceConfigs
}));

vi.mock('$lib/server/clients/cloudflareClient.js', () => ({
	getAnalytics: mockGetAnalytics,
	getGeoDistribution: mockGetGeoDistribution,
	getFirewallEvents: mockGetFirewallEvents
}));

vi.mock('$lib/server/mappers/cloudflareMapper.js', () => ({
	mapToEdgeKpiStats: mockMapToEdgeKpiStats,
	mapToGeoDistribution: mockMapToGeoDistribution,
	mapToWafLog: mockMapToWafLog,
	mapToHttpStatusDistribution: mockMapToHttpStatusDistribution
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from '../+page.server.js';

const CF_CONFIG = {
	token: 'cf-tok',
	zoneId: 'zone1',
	accountId: 'acc1',
	baseUrl: 'https://api.cloudflare.com/client/v4',
	timeout: 10_000
};
const MISSING_CF = ['CLOUDFLARE_API_TOKEN'];

const BASE_CONFIG = {
	fly: { configured: false as const, missingVars: ['FLY_API_TOKEN'] },
	cloudflare: { configured: false as const, missingVars: MISSING_CF },
	stripe: { configured: false as const, missingVars: ['STRIPE_SECRET_KEY'] },
	supabase: { configured: false as const, missingVars: ['SUPABASE_URL'] },
	sentry: { configured: false as const, missingVars: ['SENTRY_AUTH_TOKEN'] }
};

const CONFIGURED_CONFIG = {
	...BASE_CONFIG,
	cloudflare: { configured: true as const, config: CF_CONFIG }
};

const FAKE_ANALYTICS = { totalRequests: 1000, threats: 5 };
const FAKE_GEO = [{ country: 'CZ', requests: 500 }];
const FAKE_FIREWALL = [{ id: 'fw1', action: 'block', source: 'waf' }];
const FAKE_KPIS = [{ key: 'totalRequests', value: '1000' }];
const FAKE_GEO_DIST = [{ country: 'CZ', percentage: 50 }];
const FAKE_WAF_LOG = [{ id: 'fw1', action: 'block' }];
const FAKE_HTTP_DIST = [{ status: 200, percentage: 95 }];

function makeEvent() {
	return { depends: vi.fn(), setHeaders: vi.fn() };
}

beforeEach(() => {
	mockGetServiceConfigs.mockReturnValue(BASE_CONFIG);
	mockGetAnalytics.mockResolvedValue(FAKE_ANALYTICS);
	mockGetGeoDistribution.mockResolvedValue(FAKE_GEO);
	mockGetFirewallEvents.mockResolvedValue(FAKE_FIREWALL);
	mockMapToEdgeKpiStats.mockReturnValue(FAKE_KPIS);
	mockMapToGeoDistribution.mockReturnValue(FAKE_GEO_DIST);
	mockMapToWafLog.mockReturnValue(FAKE_WAF_LOG);
	mockMapToHttpStatusDistribution.mockReturnValue(FAKE_HTTP_DIST);
});

describe('edge load — not configured (Cloudflare missing)', () => {
	it('returns kpis as not-configured when Cloudflare is unconfigured', async () => {
		const result = await load(makeEvent() as never);
		expect(result.kpis.status).toBe('not-configured');
	});

	it('returns geoDistribution as not-configured when Cloudflare is unconfigured', async () => {
		const result = await load(makeEvent() as never);
		expect(result.geoDistribution.status).toBe('not-configured');
	});

	it('returns wafLog as not-configured when Cloudflare is unconfigured', async () => {
		const result = await load(makeEvent() as never);
		expect(result.wafLog.status).toBe('not-configured');
	});

	it('returns httpStatusDistribution as not-configured when Cloudflare is unconfigured', async () => {
		const result = await load(makeEvent() as never);
		expect(result.httpStatusDistribution.status).toBe('not-configured');
	});

	it('includes cloudflare missingVars in the not-configured result', async () => {
		const result = await load(makeEvent() as never);
		if (result.kpis.status !== 'not-configured') throw new Error('expected not-configured');
		expect(result.kpis.missingVars).toEqual(MISSING_CF);
	});

	it('does not call Cloudflare client when unconfigured', async () => {
		await load(makeEvent() as never);
		expect(mockGetAnalytics).not.toHaveBeenCalled();
		expect(mockGetGeoDistribution).not.toHaveBeenCalled();
		expect(mockGetFirewallEvents).not.toHaveBeenCalled();
	});
});

describe('edge load — success path', () => {
	beforeEach(() => {
		mockGetServiceConfigs.mockReturnValue(CONFIGURED_CONFIG);
	});

	it('returns kpis as ok with mapper output', async () => {
		const result = await load(makeEvent() as never);
		expect(result.kpis.status).toBe('ok');
		if (result.kpis.status !== 'ok') return;
		expect(result.kpis.data).toEqual(FAKE_KPIS);
	});

	it('returns geoDistribution as ok with mapper output', async () => {
		const result = await load(makeEvent() as never);
		expect(result.geoDistribution.status).toBe('ok');
		if (result.geoDistribution.status !== 'ok') return;
		expect(result.geoDistribution.data).toEqual(FAKE_GEO_DIST);
	});

	it('returns wafLog as ok with mapper output', async () => {
		const result = await load(makeEvent() as never);
		expect(result.wafLog.status).toBe('ok');
		if (result.wafLog.status !== 'ok') return;
		expect(result.wafLog.data).toEqual(FAKE_WAF_LOG);
	});

	it('returns httpStatusDistribution as ok with mapper output', async () => {
		const result = await load(makeEvent() as never);
		expect(result.httpStatusDistribution.status).toBe('ok');
		if (result.httpStatusDistribution.status !== 'ok') return;
		expect(result.httpStatusDistribution.data).toEqual(FAKE_HTTP_DIST);
	});

	it('calls depends("app:edge") and sets no-store header', async () => {
		const event = makeEvent();
		await load(event as never);
		expect(event.depends).toHaveBeenCalledWith('app:edge');
		expect(event.setHeaders).toHaveBeenCalledWith({ 'Cache-Control': 'no-store' });
	});

	it('delegates to mapToEdgeKpiStats with analytics data', async () => {
		await load(makeEvent() as never);
		expect(mockMapToEdgeKpiStats).toHaveBeenCalledWith(FAKE_ANALYTICS);
	});

	it('delegates to mapToGeoDistribution with geo data', async () => {
		await load(makeEvent() as never);
		expect(mockMapToGeoDistribution).toHaveBeenCalledWith(FAKE_GEO);
	});

	it('delegates to mapToWafLog with firewall events', async () => {
		await load(makeEvent() as never);
		expect(mockMapToWafLog).toHaveBeenCalledWith(FAKE_FIREWALL);
	});

	it('delegates to mapToHttpStatusDistribution with analytics data', async () => {
		await load(makeEvent() as never);
		expect(mockMapToHttpStatusDistribution).toHaveBeenCalledWith(FAKE_ANALYTICS);
	});

	it('calls getFirewallEvents with limit 20', async () => {
		await load(makeEvent() as never);
		expect(mockGetFirewallEvents).toHaveBeenCalledWith(CF_CONFIG, 20);
	});
});

describe('edge load — per-call rejection isolation', () => {
	beforeEach(() => {
		mockGetServiceConfigs.mockReturnValue(CONFIGURED_CONFIG);
	});

	it('returns kpis as error when getAnalytics rejects, other independent sections unaffected', async () => {
		mockGetAnalytics.mockRejectedValue(new Error('CF analytics down'));

		const result = await load(makeEvent() as never);
		expect(result.kpis.status).toBe('error');
		expect(result.httpStatusDistribution.status).toBe('error');
		// geoDistribution and wafLog use separate calls — they succeed
		expect(result.geoDistribution.status).toBe('ok');
		expect(result.wafLog.status).toBe('ok');
	});

	it('returns geoDistribution as error when getGeoDistribution rejects', async () => {
		mockGetGeoDistribution.mockRejectedValue(new Error('CF geo down'));

		const result = await load(makeEvent() as never);
		expect(result.geoDistribution.status).toBe('error');
		// kpis and httpStatusDistribution use analytics — still ok
		expect(result.kpis.status).toBe('ok');
	});

	it('returns wafLog as error when getFirewallEvents rejects', async () => {
		mockGetFirewallEvents.mockRejectedValue(new Error('CF firewall down'));

		const result = await load(makeEvent() as never);
		expect(result.wafLog.status).toBe('error');
		// kpis and httpStatusDistribution use analytics — still ok
		expect(result.kpis.status).toBe('ok');
	});
});
