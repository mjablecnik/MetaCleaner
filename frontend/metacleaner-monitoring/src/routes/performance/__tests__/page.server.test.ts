const {
	mockGetServiceConfigs,
	mockGetAnalytics,
	mockGetMachinesForAllApps,
	mockGetRecentIssues,
	mockMapToPerformanceKpiStats,
	mockMapToSlowEndpoints,
	mockMapToPerformanceEvents
} = vi.hoisted(() => ({
	mockGetServiceConfigs: vi.fn(),
	mockGetAnalytics: vi.fn(),
	mockGetMachinesForAllApps: vi.fn(),
	mockGetRecentIssues: vi.fn(),
	mockMapToPerformanceKpiStats: vi.fn(),
	mockMapToSlowEndpoints: vi.fn(),
	mockMapToPerformanceEvents: vi.fn()
}));

vi.mock('$lib/server/config.js', () => ({
	getServiceConfigs: mockGetServiceConfigs
}));

vi.mock('$lib/server/clients/cloudflareClient.js', () => ({
	getAnalytics: mockGetAnalytics
}));

vi.mock('$lib/server/clients/flyClient.js', () => ({
	getMachinesForAllApps: mockGetMachinesForAllApps
}));

vi.mock('$lib/server/clients/sentryClient.js', () => ({
	getRecentIssues: mockGetRecentIssues
}));

vi.mock('$lib/server/mappers/performanceMapper.js', () => ({
	mapToPerformanceKpiStats: mockMapToPerformanceKpiStats,
	mapToSlowEndpoints: mockMapToSlowEndpoints,
	mapToPerformanceEvents: mockMapToPerformanceEvents
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from '../+page.server.js';

const CF_CONFIG = {
	token: 'cf-tok',
	zoneId: 'zone1',
	baseUrl: 'https://api.cloudflare.com/client/v4',
	timeout: 10_000
};
const FLY_CONFIG = {
	token: 'fly-tok',
	org: 'org',
	apps: ['app1'],
	baseUrl: 'https://api.machines.dev/v1',
	timeout: 10_000
};
const SENTRY_CONFIG = {
	token: 'sentry-tok',
	org: 'org',
	project: 'proj',
	baseUrl: 'https://sentry.io/api/0',
	timeout: 10_000
};

const MISSING_FLY = ['FLY_API_TOKEN', 'FLY_ORG', 'FLY_APPS'];
const MISSING_CF = ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ZONE_ID'];

const BASE_CONFIG = {
	fly: { configured: false as const, missingVars: MISSING_FLY },
	cloudflare: { configured: false as const, missingVars: MISSING_CF },
	stripe: { configured: false as const, missingVars: ['STRIPE_SECRET_KEY'] },
	supabase: { configured: false as const, missingVars: ['SUPABASE_URL'] },
	sentry: { configured: false as const, missingVars: ['SENTRY_AUTH_TOKEN'] }
};

const FAKE_KPI_STATS = [{ key: 'requests', value: '1000' }];
const FAKE_SLOW_ENDPOINTS = [{ endpoint: '/api/clean', avgMs: 300 }];
const FAKE_EVENTS = [{ id: 'e1', title: 'Deploy', timestamp: '' }];

function makeEvent() {
	return { depends: vi.fn(), setHeaders: vi.fn() };
}

beforeEach(() => {
	mockGetServiceConfigs.mockReturnValue(BASE_CONFIG);
	mockGetAnalytics.mockResolvedValue({ requests: 1000 });
	mockGetMachinesForAllApps.mockResolvedValue(new Map());
	mockGetRecentIssues.mockResolvedValue([]);
	mockMapToPerformanceKpiStats.mockReturnValue(FAKE_KPI_STATS);
	mockMapToSlowEndpoints.mockReturnValue(FAKE_SLOW_ENDPOINTS);
	mockMapToPerformanceEvents.mockReturnValue(FAKE_EVENTS);
});

describe('performance load — not configured (both Fly + CF missing)', () => {
	it('returns kpis as not-configured when both Fly and CF are unconfigured', async () => {
		const result = await load(makeEvent() as never);
		expect(result.kpis.status).toBe('not-configured');
	});

	it('returns slowEndpoints as not-configured when both Fly and CF are unconfigured', async () => {
		const result = await load(makeEvent() as never);
		expect(result.slowEndpoints.status).toBe('not-configured');
	});

	it('returns events as not-configured when both Fly and CF are unconfigured', async () => {
		const result = await load(makeEvent() as never);
		expect(result.events.status).toBe('not-configured');
	});

	it('merges Fly and CF missingVars (deduped) into the not-configured result', async () => {
		const result = await load(makeEvent() as never);
		if (result.kpis.status !== 'not-configured') throw new Error('expected not-configured');
		const vars = result.kpis.missingVars;
		for (const v of [...MISSING_FLY, ...MISSING_CF]) {
			expect(vars).toContain(v);
		}
	});
});

describe('performance load — error propagation (CF-only configured)', () => {
	beforeEach(() => {
		mockGetServiceConfigs.mockReturnValue({
			...BASE_CONFIG,
			cloudflare: { configured: true, config: CF_CONFIG }
		});
	});

	it('returns kpis as error when CF is the sole primary source and it rejects', async () => {
		mockGetAnalytics.mockRejectedValue(new Error('CF down'));

		const result = await load(makeEvent() as never);
		expect(result.kpis.status).toBe('error');
	});

	it('returns kpis as ok when CF is the sole primary source and it resolves', async () => {
		const result = await load(makeEvent() as never);
		expect(result.kpis.status).toBe('ok');
	});
});

describe('performance load — error propagation (Fly-only configured)', () => {
	beforeEach(() => {
		mockGetServiceConfigs.mockReturnValue({
			...BASE_CONFIG,
			fly: { configured: true, config: FLY_CONFIG }
		});
	});

	it('returns kpis as error when Fly is the sole primary source and it rejects', async () => {
		mockGetMachinesForAllApps.mockRejectedValue(new Error('Fly down'));

		const result = await load(makeEvent() as never);
		expect(result.kpis.status).toBe('error');
	});

	it('returns kpis as ok when Fly is the sole primary source and it resolves', async () => {
		const result = await load(makeEvent() as never);
		expect(result.kpis.status).toBe('ok');
	});
});

describe('performance load — error propagation (both configured, both fail)', () => {
	beforeEach(() => {
		mockGetServiceConfigs.mockReturnValue({
			...BASE_CONFIG,
			fly: { configured: true, config: FLY_CONFIG },
			cloudflare: { configured: true, config: CF_CONFIG }
		});
	});

	it('returns kpis as error when both CF and Fly are configured but both reject', async () => {
		mockGetAnalytics.mockRejectedValue(new Error('CF down'));
		mockGetMachinesForAllApps.mockRejectedValue(new Error('Fly down'));

		const result = await load(makeEvent() as never);
		expect(result.kpis.status).toBe('error');
	});
});

describe('performance load — success path', () => {
	beforeEach(() => {
		mockGetServiceConfigs.mockReturnValue({
			...BASE_CONFIG,
			fly: { configured: true, config: FLY_CONFIG },
			cloudflare: { configured: true, config: CF_CONFIG },
			sentry: { configured: true, config: SENTRY_CONFIG }
		});
	});

	it('returns kpis as ok with mapper output on success', async () => {
		const result = await load(makeEvent() as never);
		expect(result.kpis.status).toBe('ok');
		if (result.kpis.status !== 'ok') return;
		expect(result.kpis.data).toEqual(FAKE_KPI_STATS);
	});

	it('returns slowEndpoints as ok on success', async () => {
		const result = await load(makeEvent() as never);
		expect(result.slowEndpoints.status).toBe('ok');
		if (result.slowEndpoints.status !== 'ok') return;
		expect(result.slowEndpoints.data).toEqual(FAKE_SLOW_ENDPOINTS);
	});

	it('returns events as ok on success', async () => {
		const result = await load(makeEvent() as never);
		expect(result.events.status).toBe('ok');
		if (result.events.status !== 'ok') return;
		expect(result.events.data).toEqual(FAKE_EVENTS);
	});

	it('calls depends("app:performance") and sets no-store header', async () => {
		const event = makeEvent();
		await load(event as never);
		expect(event.depends).toHaveBeenCalledWith('app:performance');
		expect(event.setHeaders).toHaveBeenCalledWith({ 'Cache-Control': 'no-store' });
	});

	it('delegates to mapToPerformanceKpiStats with CF and Fly data', async () => {
		const cfData = { requests: 999 };
		const flyData = new Map([['app1', [{ id: 'm1', state: 'started' }]]]);
		mockGetAnalytics.mockResolvedValue(cfData);
		mockGetMachinesForAllApps.mockResolvedValue(flyData);

		await load(makeEvent() as never);
		expect(mockMapToPerformanceKpiStats).toHaveBeenCalledWith(cfData, flyData, expect.any(Array));
	});
});
