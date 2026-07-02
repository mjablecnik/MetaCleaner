const {
	mockGetServiceConfigs,
	mockGetMachinesForAllApps,
	mockGetRecentIssues,
	mockQueryTable,
	mockMergeAndSortAlerts
} = vi.hoisted(() => ({
	mockGetServiceConfigs: vi.fn(),
	mockGetMachinesForAllApps: vi.fn(),
	mockGetRecentIssues: vi.fn(),
	mockQueryTable: vi.fn(),
	mockMergeAndSortAlerts: vi.fn()
}));

vi.mock('$lib/server/config.js', () => ({
	getServiceConfigs: mockGetServiceConfigs
}));

vi.mock('$lib/server/clients/flyClient.js', () => ({
	getMachinesForAllApps: mockGetMachinesForAllApps
}));

vi.mock('$lib/server/clients/sentryClient.js', () => ({
	getRecentIssues: mockGetRecentIssues
}));

vi.mock('$lib/server/clients/supabaseClient.js', () => ({
	queryTable: mockQueryTable
}));

vi.mock('$lib/server/dashboardAlerts.js', () => ({
	mergeAndSortAlerts: mockMergeAndSortAlerts
}));

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { load } from '../+page.server.js';

const BASE_CONFIG = {
	fly: { configured: false as const, missingVars: ['FLY_API_TOKEN'] },
	cloudflare: { configured: false as const, missingVars: ['CLOUDFLARE_API_TOKEN'] },
	stripe: { configured: false as const, missingVars: ['STRIPE_SECRET_KEY'] },
	supabase: { configured: false as const, missingVars: ['SUPABASE_URL'] },
	sentry: { configured: false as const, missingVars: ['SENTRY_AUTH_TOKEN'] }
};

const FLY_CONFIG = { token: 'tok', org: 'org', apps: ['app1'], timeout: 10_000 };
const SENTRY_CONFIG = {
	token: 'tok',
	org: 'org',
	project: 'proj',
	baseUrl: 'https://sentry.io/api/0',
	timeout: 10_000
};
const SUPABASE_CONFIG = { url: 'https://db.supabase.co', serviceKey: 'key', timeout: 10_000 };

function makeEvent() {
	return { depends: vi.fn(), setHeaders: vi.fn() };
}

beforeEach(() => {
	mockGetServiceConfigs.mockReturnValue(BASE_CONFIG);
	mockGetRecentIssues.mockResolvedValue([]);
	mockMergeAndSortAlerts.mockReturnValue([]);
	vi.useFakeTimers();
	vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
});

afterEach(() => {
	vi.useRealTimers();
});

describe('dashboard load — event wiring', () => {
	it('calls depends("app:dashboard")', async () => {
		const event = makeEvent();
		await load(event as never);
		expect(event.depends).toHaveBeenCalledWith('app:dashboard');
	});

	it('sets Cache-Control: no-store header', async () => {
		const event = makeEvent();
		await load(event as never);
		expect(event.setHeaders).toHaveBeenCalledWith({ 'Cache-Control': 'no-store' });
	});
});

describe('dashboard load — uptime stat (Fly not configured)', () => {
	it('returns stats.status ok with uptimeServer value N/A when Fly not configured', async () => {
		const event = makeEvent();
		const result = await load(event as never);
		expect(result.stats.status).toBe('ok');
		if (result.stats.status !== 'ok') return;
		const uptime = result.stats.data.find((s) => s.key === 'uptimeServer');
		expect(uptime?.value).toBe('N/A');
	});

	it('returns uptimeServer barWidth "0%" when Fly not configured', async () => {
		const result = await load(makeEvent() as never);
		if (result.stats.status !== 'ok') throw new Error('expected ok');
		const uptime = result.stats.data.find((s) => s.key === 'uptimeServer');
		expect(uptime?.barWidth).toBe('0%');
	});
});

describe('dashboard load — uptime stat (Fly configured)', () => {
	beforeEach(() => {
		mockGetServiceConfigs.mockReturnValue({
			...BASE_CONFIG,
			fly: { configured: true, config: FLY_CONFIG }
		});
	});

	it('computes 100.00% uptime when all machines are started', async () => {
		const machines = new Map([
			[
				'app1',
				[
					{ id: 'm1', state: 'started' },
					{ id: 'm2', state: 'started' }
				]
			]
		]);
		mockGetMachinesForAllApps.mockResolvedValue(machines);

		const result = await load(makeEvent() as never);
		if (result.stats.status !== 'ok') throw new Error('expected ok');
		const uptime = result.stats.data.find((s) => s.key === 'uptimeServer');
		expect(uptime?.value).toBe('100.00%');
		expect(uptime?.barWidth).toBe('100.00%');
	});

	it('computes 75.00% uptime when 3 of 4 machines are started', async () => {
		const machines = new Map([
			[
				'app1',
				[
					{ id: 'm1', state: 'started' },
					{ id: 'm2', state: 'started' },
					{ id: 'm3', state: 'started' },
					{ id: 'm4', state: 'stopped' }
				]
			]
		]);
		mockGetMachinesForAllApps.mockResolvedValue(machines);

		const result = await load(makeEvent() as never);
		if (result.stats.status !== 'ok') throw new Error('expected ok');
		const uptime = result.stats.data.find((s) => s.key === 'uptimeServer');
		expect(uptime?.value).toBe('75.00%');
	});

	it('computes 0.00% uptime when total machines is zero (empty map)', async () => {
		mockGetMachinesForAllApps.mockResolvedValue(new Map());

		const result = await load(makeEvent() as never);
		if (result.stats.status !== 'ok') throw new Error('expected ok');
		const uptime = result.stats.data.find((s) => s.key === 'uptimeServer');
		// When total===0, pct=0 → "0.00%" (not "N/A") per current source logic
		expect(uptime?.value).toBe('0.00%');
	});

	it('returns N/A uptime when Fly client rejects (graceful degradation)', async () => {
		mockGetMachinesForAllApps.mockRejectedValue(new Error('Fly unreachable'));

		const result = await load(makeEvent() as never);
		if (result.stats.status !== 'ok') throw new Error('expected ok');
		const uptime = result.stats.data.find((s) => s.key === 'uptimeServer');
		expect(uptime?.value).toBe('N/A');
	});
});

describe('dashboard load — job stats (Supabase not configured)', () => {
	it('returns jobsProcessed value "0" and avgCleaningTime "N/A" when Supabase not configured', async () => {
		const result = await load(makeEvent() as never);
		if (result.stats.status !== 'ok') throw new Error('expected ok');
		const jobs = result.stats.data.find((s) => s.key === 'jobsProcessed');
		const avg = result.stats.data.find((s) => s.key === 'avgCleaningTime');
		expect(jobs?.value).toBe('0');
		expect(avg?.value).toBe('N/A');
	});

	it('returns failedJobs value "N/A" when Supabase not configured', async () => {
		const result = await load(makeEvent() as never);
		if (result.stats.status !== 'ok') throw new Error('expected ok');
		const failed = result.stats.data.find((s) => s.key === 'failedJobs');
		expect(failed?.value).toBe('N/A');
	});
});

describe('dashboard load — job stats (Supabase configured)', () => {
	beforeEach(() => {
		mockGetServiceConfigs.mockReturnValue({
			...BASE_CONFIG,
			supabase: { configured: true, config: SUPABASE_CONFIG }
		});
	});

	it('returns jobsProcessed equal to total job row count', async () => {
		mockQueryTable.mockResolvedValue([
			{ id: '1', status: 'completed', duration_ms: 2000, created_at: '' },
			{ id: '2', status: 'completed', duration_ms: 4000, created_at: '' }
		]);

		const result = await load(makeEvent() as never);
		if (result.stats.status !== 'ok') throw new Error('expected ok');
		const jobs = result.stats.data.find((s) => s.key === 'jobsProcessed');
		expect(jobs?.value).toBe('2');
	});

	it('computes avgCleaningTime as mean of done/completed job duration_ms / 1000', async () => {
		mockQueryTable.mockResolvedValue([
			{ id: '1', status: 'completed', duration_ms: 2000, created_at: '' },
			{ id: '2', status: 'done', duration_ms: 4000, created_at: '' }
		]);

		const result = await load(makeEvent() as never);
		if (result.stats.status !== 'ok') throw new Error('expected ok');
		const avg = result.stats.data.find((s) => s.key === 'avgCleaningTime');
		expect(avg?.value).toBe('3.0s');
	});

	it('returns avgCleaningTime "0.0s" when jobs exist but none are done/completed', async () => {
		mockQueryTable.mockResolvedValue([
			{ id: '1', status: 'error', created_at: '' },
			{ id: '2', status: 'failed', created_at: '' }
		]);

		const result = await load(makeEvent() as never);
		if (result.stats.status !== 'ok') throw new Error('expected ok');
		const avg = result.stats.data.find((s) => s.key === 'avgCleaningTime');
		expect(avg?.value).toBe('0.0s');
	});

	it('returns avgCleaningTime "N/A" when no jobs at all', async () => {
		mockQueryTable.mockResolvedValue([]);

		const result = await load(makeEvent() as never);
		if (result.stats.status !== 'ok') throw new Error('expected ok');
		const avg = result.stats.data.find((s) => s.key === 'avgCleaningTime');
		expect(avg?.value).toBe('N/A');
	});

	it('computes failedJobs percentage from error+failed count over total', async () => {
		mockQueryTable.mockResolvedValue([
			{ id: '1', status: 'error', created_at: '' },
			{ id: '2', status: 'failed', created_at: '' },
			{ id: '3', status: 'completed', duration_ms: 1000, created_at: '' },
			{ id: '4', status: 'completed', duration_ms: 1000, created_at: '' }
		]);

		const result = await load(makeEvent() as never);
		if (result.stats.status !== 'ok') throw new Error('expected ok');
		const failed = result.stats.data.find((s) => s.key === 'failedJobs');
		expect(failed?.value).toBe('50.0%');
	});

	it('returns failedJobs "N/A" when there are no jobs', async () => {
		mockQueryTable.mockResolvedValue([]);

		const result = await load(makeEvent() as never);
		if (result.stats.status !== 'ok') throw new Error('expected ok');
		const failed = result.stats.data.find((s) => s.key === 'failedJobs');
		expect(failed?.value).toBe('N/A');
	});
});

describe('dashboard load — returned stat keys', () => {
	it('returns exactly the four expected stat keys', async () => {
		const result = await load(makeEvent() as never);
		if (result.stats.status !== 'ok') throw new Error('expected ok');
		const keys = result.stats.data.map((s) => s.key);
		expect(keys).toEqual(['uptimeServer', 'jobsProcessed', 'avgCleaningTime', 'failedJobs']);
	});
});

describe('dashboard load — alerts delegation', () => {
	it('delegates to mergeAndSortAlerts and returns the result', async () => {
		const fakeAlerts = [{ id: 'a1', title: 'alert', severity: 'warning' as const }];
		mockMergeAndSortAlerts.mockReturnValue(fakeAlerts);

		const result = await load(makeEvent() as never);
		expect(result.alerts.status).toBe('ok');
		if (result.alerts.status !== 'ok') return;
		expect(result.alerts.data).toEqual(fakeAlerts);
	});

	it('calls mergeAndSortAlerts with Sentry issues and Fly machines', async () => {
		mockGetServiceConfigs.mockReturnValue({
			...BASE_CONFIG,
			sentry: { configured: true, config: SENTRY_CONFIG },
			fly: { configured: true, config: FLY_CONFIG }
		});
		const fakeMachines = new Map([['app1', [{ id: 'm1', state: 'started' }]]]);
		const fakeIssues = [{ id: 'i1', title: 'Error', level: 'error' }];
		mockGetMachinesForAllApps.mockResolvedValue(fakeMachines);
		mockGetRecentIssues.mockResolvedValue(fakeIssues);

		await load(makeEvent() as never);
		expect(mockMergeAndSortAlerts).toHaveBeenCalledWith(
			fakeIssues,
			fakeMachines,
			expect.any(Number)
		);
	});
});
