const {
	mockGetServiceConfigs,
	mockGetMachinesForAllApps,
	mockMapToRuntimeStats,
	mockMapToMachineInstances,
	mockMapToDeployEntries,
	mockMapToRuntimeErrors,
	mockGetCurrentCpuPercent,
	mockGetCurrentRamUsage,
	mockGetCpuOverTime,
	mockGetRamOverTime,
	mockMapToCurrentCpu,
	mockMapToCurrentRam,
	mockMapToTimeSeries
} = vi.hoisted(() => ({
	mockGetServiceConfigs: vi.fn(),
	mockGetMachinesForAllApps: vi.fn(),
	mockMapToRuntimeStats: vi.fn(),
	mockMapToMachineInstances: vi.fn(),
	mockMapToDeployEntries: vi.fn(),
	mockMapToRuntimeErrors: vi.fn(),
	mockGetCurrentCpuPercent: vi.fn(),
	mockGetCurrentRamUsage: vi.fn(),
	mockGetCpuOverTime: vi.fn(),
	mockGetRamOverTime: vi.fn(),
	mockMapToCurrentCpu: vi.fn(),
	mockMapToCurrentRam: vi.fn(),
	mockMapToTimeSeries: vi.fn()
}));

vi.mock('$lib/server/config.js', () => ({
	getServiceConfigs: mockGetServiceConfigs
}));

vi.mock('$lib/server/clients/flyClient.js', () => ({
	getMachinesForAllApps: mockGetMachinesForAllApps
}));

vi.mock('$lib/server/clients/flyPrometheusClient.js', () => ({
	getCurrentCpuPercent: mockGetCurrentCpuPercent,
	getCurrentRamUsage: mockGetCurrentRamUsage,
	getCpuOverTime: mockGetCpuOverTime,
	getRamOverTime: mockGetRamOverTime
}));

vi.mock('$lib/server/mappers/flyMapper.js', () => ({
	mapToRuntimeStats: mockMapToRuntimeStats,
	mapToMachineInstances: mockMapToMachineInstances,
	mapToDeployEntries: mockMapToDeployEntries,
	mapToRuntimeErrors: mockMapToRuntimeErrors
}));

vi.mock('$lib/server/mappers/flyPrometheusMapper.js', () => ({
	mapToCurrentCpu: mockMapToCurrentCpu,
	mapToCurrentRam: mockMapToCurrentRam,
	mapToTimeSeries: mockMapToTimeSeries
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from '../+page.server.js';

const FLY_CONFIG = {
	token: 'tok',
	org: 'org',
	apps: ['app1'],
	timeout: 10_000,
	prometheusBaseUrl: 'https://api.fly.io/prometheus/org/api/v1'
};
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
const FAKE_CPU_INSTANT = { status: 'success', data: { resultType: 'vector', result: [] } };
const FAKE_RAM_INSTANT = { status: 'success', data: { resultType: 'vector', result: [] } };
const FAKE_CPU_RANGE = { status: 'success', data: { resultType: 'matrix', result: [] } };
const FAKE_RAM_RANGE = { status: 'success', data: { resultType: 'matrix', result: [] } };
const FAKE_CPU_CURRENT = { percent: 42, perApp: new Map() };
const FAKE_RAM_CURRENT = { usedBytes: 1024, perInstance: new Map() };
const FAKE_CPU_TIME_SERIES = [{ timestamp: 1, value: 1 }];
const FAKE_RAM_TIME_SERIES = [{ timestamp: 1, value: 2 }];

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
	mockGetCurrentCpuPercent.mockResolvedValue(FAKE_CPU_INSTANT);
	mockGetCurrentRamUsage.mockResolvedValue(FAKE_RAM_INSTANT);
	mockGetCpuOverTime.mockResolvedValue(FAKE_CPU_RANGE);
	mockGetRamOverTime.mockResolvedValue(FAKE_RAM_RANGE);
	mockMapToCurrentCpu.mockReturnValue(FAKE_CPU_CURRENT);
	mockMapToCurrentRam.mockReturnValue(FAKE_RAM_CURRENT);
	mockMapToTimeSeries.mockImplementation((response: unknown) =>
		response === FAKE_CPU_RANGE ? FAKE_CPU_TIME_SERIES : FAKE_RAM_TIME_SERIES
	);
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

	it('returns Prometheus sections as not-configured when Fly is unconfigured', async () => {
		const result = await load(makeEvent() as never);
		expect(result.cpuCurrent.status).toBe('not-configured');
		expect(result.ramCurrent.status).toBe('not-configured');
		expect(result.cpuTimeSeries.status).toBe('not-configured');
		expect(result.ramTimeSeries.status).toBe('not-configured');
	});

	it('does not call Prometheus client when unconfigured', async () => {
		await load(makeEvent() as never);
		expect(mockGetCurrentCpuPercent).not.toHaveBeenCalled();
		expect(mockGetCurrentRamUsage).not.toHaveBeenCalled();
		expect(mockGetCpuOverTime).not.toHaveBeenCalled();
		expect(mockGetRamOverTime).not.toHaveBeenCalled();
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

	it('delegates to mapToRuntimeStats with machines map and current CPU/RAM usage', async () => {
		await load(makeEvent() as never);
		expect(mockMapToRuntimeStats).toHaveBeenCalledWith(
			FAKE_MACHINES,
			FAKE_CPU_CURRENT,
			FAKE_RAM_CURRENT
		);
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

	it('returns cpuCurrent as ok with mapper output', async () => {
		const result = await load(makeEvent() as never);
		expect(result.cpuCurrent.status).toBe('ok');
		if (result.cpuCurrent.status !== 'ok') return;
		expect(result.cpuCurrent.data).toEqual(FAKE_CPU_CURRENT);
	});

	it('returns ramCurrent as ok with mapper output', async () => {
		const result = await load(makeEvent() as never);
		expect(result.ramCurrent.status).toBe('ok');
		if (result.ramCurrent.status !== 'ok') return;
		expect(result.ramCurrent.data).toEqual(FAKE_RAM_CURRENT);
	});

	it('returns cpuTimeSeries as ok with mapper output', async () => {
		const result = await load(makeEvent() as never);
		expect(result.cpuTimeSeries.status).toBe('ok');
		if (result.cpuTimeSeries.status !== 'ok') return;
		expect(result.cpuTimeSeries.data).toEqual(FAKE_CPU_TIME_SERIES);
	});

	it('returns ramTimeSeries as ok with mapper output', async () => {
		const result = await load(makeEvent() as never);
		expect(result.ramTimeSeries.status).toBe('ok');
		if (result.ramTimeSeries.status !== 'ok') return;
		expect(result.ramTimeSeries.data).toEqual(FAKE_RAM_TIME_SERIES);
	});

	it('calls getCpuOverTime and getRamOverTime with a 24h range and 300s step', async () => {
		await load(makeEvent() as never);
		expect(mockGetCpuOverTime).toHaveBeenCalledWith(
			FLY_CONFIG,
			expect.any(Number),
			expect.any(Number),
			300
		);
		expect(mockGetRamOverTime).toHaveBeenCalledWith(
			FLY_CONFIG,
			expect.any(Number),
			expect.any(Number),
			300
		);
		const [, start, end] = mockGetCpuOverTime.mock.calls[0];
		expect(end - start).toBe(24 * 60 * 60);
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

	it('leaves Prometheus sections unaffected by a Fly client rejection', async () => {
		const result = await load(makeEvent() as never);
		expect(result.cpuCurrent.status).toBe('ok');
		expect(result.ramCurrent.status).toBe('ok');
		expect(result.cpuTimeSeries.status).toBe('ok');
		expect(result.ramTimeSeries.status).toBe('ok');
	});
});

describe('runtime load — Prometheus rejection', () => {
	beforeEach(() => {
		mockGetServiceConfigs.mockReturnValue(CONFIGURED_CONFIG);
		mockGetCurrentCpuPercent.mockRejectedValue(new Error('Prometheus unreachable'));
		mockGetCurrentRamUsage.mockRejectedValue(new Error('Prometheus unreachable'));
		mockGetCpuOverTime.mockRejectedValue(new Error('Prometheus unreachable'));
		mockGetRamOverTime.mockRejectedValue(new Error('Prometheus unreachable'));
	});

	it('returns cpuCurrent, ramCurrent, cpuTimeSeries, ramTimeSeries as error', async () => {
		const result = await load(makeEvent() as never);
		expect(result.cpuCurrent.status).toBe('error');
		expect(result.ramCurrent.status).toBe('error');
		expect(result.cpuTimeSeries.status).toBe('error');
		expect(result.ramTimeSeries.status).toBe('error');
	});

	it('leaves Fly-derived sections unaffected by a Prometheus rejection', async () => {
		const result = await load(makeEvent() as never);
		expect(result.stats.status).toBe('ok');
		expect(result.machines.status).toBe('ok');
		expect(result.deploys.status).toBe('ok');
		expect(result.errors.status).toBe('ok');
	});
});
