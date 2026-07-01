const {
	mockGetServiceConfigs,
	mockGetMachinesForAllApps,
	mockMapToServiceCards,
	mockMapToHealthChecks,
	mockMapToIncidents,
	mockMapToSlaGoals
} = vi.hoisted(() => ({
	mockGetServiceConfigs: vi.fn(),
	mockGetMachinesForAllApps: vi.fn(),
	mockMapToServiceCards: vi.fn(),
	mockMapToHealthChecks: vi.fn(),
	mockMapToIncidents: vi.fn(),
	mockMapToSlaGoals: vi.fn()
}));

vi.mock('$lib/server/config.js', () => ({
	getServiceConfigs: mockGetServiceConfigs
}));

vi.mock('$lib/server/clients/flyClient.js', () => ({
	getMachinesForAllApps: mockGetMachinesForAllApps
}));

vi.mock('$lib/server/mappers/flyMapper.js', () => ({
	mapToServiceCards: mockMapToServiceCards,
	mapToHealthChecks: mockMapToHealthChecks,
	mapToIncidents: mockMapToIncidents,
	mapToSlaGoals: mockMapToSlaGoals
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from '../+page.server.js';

const FLY_CONFIG = { token: 'tok', org: 'org', apps: ['app1'], timeout: 10_000 };
const MISSING_FLY = ['FLY_API_TOKEN'];

const BASE_CONFIG = {
	fly: { configured: false as const, missingVars: MISSING_FLY },
	cloudflare: { configured: false as const, missingVars: ['CLOUDFLARE_API_TOKEN'] },
	stripe: { configured: false as const, missingVars: ['STRIPE_SECRET_KEY'] },
	supabase: { configured: false as const, missingVars: ['SUPABASE_URL'] },
	sentry: { configured: false as const, missingVars: ['SENTRY_AUTH_TOKEN'] }
};

const CONFIGURED_CONFIG = {
	...BASE_CONFIG,
	fly: { configured: true as const, config: FLY_CONFIG }
};

const FAKE_MACHINES = new Map([['app1', [{ id: 'm1', state: 'started' }]]]);
const FAKE_SERVICE_CARDS = [{ id: 'app1', name: 'App 1', status: 'online' }];
const FAKE_HEALTH_CHECKS = [{ id: 'hc1', name: 'HTTP', status: 'passing' }];
const FAKE_INCIDENTS = [{ id: 'inc1', title: 'Downtime', severity: 'high' }];
const FAKE_SLA_GOALS = [{ id: 'sla1', name: 'API Uptime', goal: 99.9, actual: 100 }];

function makeEvent() {
	return { depends: vi.fn(), setHeaders: vi.fn() };
}

beforeEach(() => {
	mockGetServiceConfigs.mockReturnValue(BASE_CONFIG);
	mockGetMachinesForAllApps.mockResolvedValue(FAKE_MACHINES);
	mockMapToServiceCards.mockReturnValue(FAKE_SERVICE_CARDS);
	mockMapToHealthChecks.mockReturnValue(FAKE_HEALTH_CHECKS);
	mockMapToIncidents.mockReturnValue(FAKE_INCIDENTS);
	mockMapToSlaGoals.mockReturnValue(FAKE_SLA_GOALS);
});

describe('dostupnost load — not configured (Fly missing)', () => {
	it('returns services as not-configured when Fly is unconfigured', async () => {
		const result = await load(makeEvent() as never);
		expect(result.services.status).toBe('not-configured');
	});

	it('returns healthChecks as not-configured when Fly is unconfigured', async () => {
		const result = await load(makeEvent() as never);
		expect(result.healthChecks.status).toBe('not-configured');
	});

	it('returns incidents as not-configured when Fly is unconfigured', async () => {
		const result = await load(makeEvent() as never);
		expect(result.incidents.status).toBe('not-configured');
	});

	it('returns slaGoals as not-configured when Fly is unconfigured', async () => {
		const result = await load(makeEvent() as never);
		expect(result.slaGoals.status).toBe('not-configured');
	});

	it('includes fly missingVars in the not-configured result', async () => {
		const result = await load(makeEvent() as never);
		if (result.services.status !== 'not-configured') throw new Error('expected not-configured');
		expect(result.services.missingVars).toEqual(MISSING_FLY);
	});

	it('does not call Fly client when unconfigured', async () => {
		await load(makeEvent() as never);
		expect(mockGetMachinesForAllApps).not.toHaveBeenCalled();
	});
});

describe('dostupnost load — success path', () => {
	beforeEach(() => {
		mockGetServiceConfigs.mockReturnValue(CONFIGURED_CONFIG);
	});

	it('returns services as ok with mapper output', async () => {
		const result = await load(makeEvent() as never);
		expect(result.services.status).toBe('ok');
		if (result.services.status !== 'ok') return;
		expect(result.services.data).toEqual(FAKE_SERVICE_CARDS);
	});

	it('returns healthChecks as ok with mapper output', async () => {
		const result = await load(makeEvent() as never);
		expect(result.healthChecks.status).toBe('ok');
		if (result.healthChecks.status !== 'ok') return;
		expect(result.healthChecks.data).toEqual(FAKE_HEALTH_CHECKS);
	});

	it('returns incidents as ok with mapper output', async () => {
		const result = await load(makeEvent() as never);
		expect(result.incidents.status).toBe('ok');
		if (result.incidents.status !== 'ok') return;
		expect(result.incidents.data).toEqual(FAKE_INCIDENTS);
	});

	it('returns slaGoals as ok with mapper output', async () => {
		const result = await load(makeEvent() as never);
		expect(result.slaGoals.status).toBe('ok');
		if (result.slaGoals.status !== 'ok') return;
		expect(result.slaGoals.data).toEqual(FAKE_SLA_GOALS);
	});

	it('calls depends("app:dostupnost") and sets no-store header', async () => {
		const event = makeEvent();
		await load(event as never);
		expect(event.depends).toHaveBeenCalledWith('app:dostupnost');
		expect(event.setHeaders).toHaveBeenCalledWith({ 'Cache-Control': 'no-store' });
	});

	it('delegates to mapToServiceCards with machines map', async () => {
		await load(makeEvent() as never);
		expect(mockMapToServiceCards).toHaveBeenCalledWith(FAKE_MACHINES);
	});

	it('delegates to mapToHealthChecks with machines map', async () => {
		await load(makeEvent() as never);
		expect(mockMapToHealthChecks).toHaveBeenCalledWith(FAKE_MACHINES);
	});

	it('delegates to mapToIncidents with machines map', async () => {
		await load(makeEvent() as never);
		expect(mockMapToIncidents).toHaveBeenCalledWith(FAKE_MACHINES);
	});

	it('delegates to mapToSlaGoals with machines map', async () => {
		await load(makeEvent() as never);
		expect(mockMapToSlaGoals).toHaveBeenCalledWith(FAKE_MACHINES);
	});
});

describe('dostupnost load — Fly rejection', () => {
	beforeEach(() => {
		mockGetServiceConfigs.mockReturnValue(CONFIGURED_CONFIG);
		mockGetMachinesForAllApps.mockRejectedValue(new Error('Fly unreachable'));
	});

	it('returns services as error when Fly client rejects', async () => {
		const result = await load(makeEvent() as never);
		expect(result.services.status).toBe('error');
	});

	it('returns healthChecks as error when Fly client rejects', async () => {
		const result = await load(makeEvent() as never);
		expect(result.healthChecks.status).toBe('error');
	});

	it('returns incidents as error when Fly client rejects', async () => {
		const result = await load(makeEvent() as never);
		expect(result.incidents.status).toBe('error');
	});

	it('returns slaGoals as error when Fly client rejects', async () => {
		const result = await load(makeEvent() as never);
		expect(result.slaGoals.status).toBe('error');
	});
});
