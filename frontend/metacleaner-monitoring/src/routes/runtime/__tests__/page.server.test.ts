const {
	mockGetServiceConfigs,
	mockGetMachinesForAllApps,
	mockMapToRuntimeStats,
	mockMapToMachineInstances,
	mockMapToDeployEntries,
	mockMapToRuntimeErrors
} = vi.hoisted(() => ({
	mockGetServiceConfigs: vi.fn(),
	mockGetMachinesForAllApps: vi.fn(),
	mockMapToRuntimeStats: vi.fn(),
	mockMapToMachineInstances: vi.fn(),
	mockMapToDeployEntries: vi.fn(),
	mockMapToRuntimeErrors: vi.fn()
}));

vi.mock('$lib/server/config.js', () => ({
	getServiceConfigs: mockGetServiceConfigs
}));

vi.mock('$lib/server/clients/flyClient.js', () => ({
	getMachinesForAllApps: mockGetMachinesForAllApps
}));

vi.mock('$lib/server/mappers/flyMapper.js', () => ({
	mapToRuntimeStats: mockMapToRuntimeStats,
	mapToMachineInstances: mockMapToMachineInstances,
	mapToDeployEntries: mockMapToDeployEntries,
	mapToRuntimeErrors: mockMapToRuntimeErrors
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
const FAKE_STATS = [{ key: 'totalMachines', value: '1' }];
const FAKE_MACHINE_INSTANCES = [{ id: 'm1', app: 'app1', state: 'started' }];
const FAKE_DEPLOY_ENTRIES = [{ id: 'd1', version: '42', deployedAt: '2024-01-01' }];
const FAKE_RUNTIME_ERRORS = [{ id: 'e1', message: 'OOM', severity: 'high' }];

function makeEvent() {
	return { depends: vi.fn(), setHeaders: vi.fn() };
}

beforeEach(() => {
	mockGetServiceConfigs.mockReturnValue(BASE_CONFIG);
	mockGetMachinesForAllApps.mockResolvedValue(FAKE_MACHINES);
	mockMapToRuntimeStats.mockReturnValue(FAKE_STATS);
	mockMapToMachineInstances.mockReturnValue(FAKE_MACHINE_INSTANCES);
	mockMapToDeployEntries.mockReturnValue(FAKE_DEPLOY_ENTRIES);
	mockMapToRuntimeErrors.mockReturnValue(FAKE_RUNTIME_ERRORS);
});

describe('runtime load — not configured (Fly missing)', () => {
	it('returns stats as not-configured when Fly is unconfigured', async () => {
		const result = await load(makeEvent() as never);
		expect(result.stats.status).toBe('not-configured');
	});

	it('returns machines as not-configured when Fly is unconfigured', async () => {
		const result = await load(makeEvent() as never);
		expect(result.machines.status).toBe('not-configured');
	});

	it('returns deploys as not-configured when Fly is unconfigured', async () => {
		const result = await load(makeEvent() as never);
		expect(result.deploys.status).toBe('not-configured');
	});

	it('returns errors as not-configured when Fly is unconfigured', async () => {
		const result = await load(makeEvent() as never);
		expect(result.errors.status).toBe('not-configured');
	});

	it('includes fly missingVars in the not-configured result', async () => {
		const result = await load(makeEvent() as never);
		if (result.stats.status !== 'not-configured') throw new Error('expected not-configured');
		expect(result.stats.missingVars).toEqual(MISSING_FLY);
	});

	it('does not call Fly client when unconfigured', async () => {
		await load(makeEvent() as never);
		expect(mockGetMachinesForAllApps).not.toHaveBeenCalled();
	});
});

describe('runtime load — success path', () => {
	beforeEach(() => {
		mockGetServiceConfigs.mockReturnValue(CONFIGURED_CONFIG);
	});

	it('returns stats as ok with mapper output', async () => {
		const result = await load(makeEvent() as never);
		expect(result.stats.status).toBe('ok');
		if (result.stats.status !== 'ok') return;
		expect(result.stats.data).toEqual(FAKE_STATS);
	});

	it('returns machines as ok with mapper output', async () => {
		const result = await load(makeEvent() as never);
		expect(result.machines.status).toBe('ok');
		if (result.machines.status !== 'ok') return;
		expect(result.machines.data).toEqual(FAKE_MACHINE_INSTANCES);
	});

	it('returns deploys as ok with mapper output', async () => {
		const result = await load(makeEvent() as never);
		expect(result.deploys.status).toBe('ok');
		if (result.deploys.status !== 'ok') return;
		expect(result.deploys.data).toEqual(FAKE_DEPLOY_ENTRIES);
	});

	it('returns errors as ok with mapper output', async () => {
		const result = await load(makeEvent() as never);
		expect(result.errors.status).toBe('ok');
		if (result.errors.status !== 'ok') return;
		expect(result.errors.data).toEqual(FAKE_RUNTIME_ERRORS);
	});

	it('calls depends("app:runtime") and sets no-store header', async () => {
		const event = makeEvent();
		await load(event as never);
		expect(event.depends).toHaveBeenCalledWith('app:runtime');
		expect(event.setHeaders).toHaveBeenCalledWith({ 'Cache-Control': 'no-store' });
	});

	it('delegates to mapToRuntimeStats with machines map', async () => {
		await load(makeEvent() as never);
		expect(mockMapToRuntimeStats).toHaveBeenCalledWith(FAKE_MACHINES);
	});

	it('delegates to mapToMachineInstances with machines map', async () => {
		await load(makeEvent() as never);
		expect(mockMapToMachineInstances).toHaveBeenCalledWith(FAKE_MACHINES);
	});

	it('delegates to mapToDeployEntries with flattened machines array', async () => {
		await load(makeEvent() as never);
		expect(mockMapToDeployEntries).toHaveBeenCalledWith([{ id: 'm1', state: 'started' }]);
	});

	it('delegates to mapToRuntimeErrors with flattened machines array', async () => {
		await load(makeEvent() as never);
		expect(mockMapToRuntimeErrors).toHaveBeenCalledWith([{ id: 'm1', state: 'started' }]);
	});
});

describe('runtime load — Fly rejection', () => {
	beforeEach(() => {
		mockGetServiceConfigs.mockReturnValue(CONFIGURED_CONFIG);
		mockGetMachinesForAllApps.mockRejectedValue(new Error('Fly unreachable'));
	});

	it('returns stats as error when Fly client rejects', async () => {
		const result = await load(makeEvent() as never);
		expect(result.stats.status).toBe('error');
	});

	it('returns machines as error when Fly client rejects', async () => {
		const result = await load(makeEvent() as never);
		expect(result.machines.status).toBe('error');
	});

	it('returns deploys as error when Fly client rejects', async () => {
		const result = await load(makeEvent() as never);
		expect(result.deploys.status).toBe('error');
	});

	it('returns errors as error when Fly client rejects', async () => {
		const result = await load(makeEvent() as never);
		expect(result.errors.status).toBe('error');
	});
});
