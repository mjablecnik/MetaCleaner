const { mockGetServiceConfigs, mockGetTableStats, mockMapToDbKpis, mockMapToTableSizes } =
	vi.hoisted(() => ({
		mockGetServiceConfigs: vi.fn(),
		mockGetTableStats: vi.fn(),
		mockMapToDbKpis: vi.fn(),
		mockMapToTableSizes: vi.fn()
	}));

vi.mock('$lib/server/config.js', () => ({
	getServiceConfigs: mockGetServiceConfigs
}));

vi.mock('$lib/server/clients/supabaseClient.js', () => ({
	getTableStats: mockGetTableStats
}));

vi.mock('$lib/server/mappers/supabaseMapper.js', () => ({
	mapToDbKpis: mockMapToDbKpis,
	mapToTableSizes: mockMapToTableSizes
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from '../+page.server.js';

const SUPABASE_CONFIG = { url: 'https://db.supabase.co', serviceKey: 'key', timeout: 10_000 };
const MISSING_SUPABASE = ['SUPABASE_URL'];

const BASE_CONFIG = {
	fly: { configured: false as const, missingVars: ['FLY_API_TOKEN'] },
	cloudflare: { configured: false as const, missingVars: ['CLOUDFLARE_API_TOKEN'] },
	stripe: { configured: false as const, missingVars: ['STRIPE_SECRET_KEY'] },
	supabase: { configured: false as const, missingVars: MISSING_SUPABASE },
	sentry: { configured: false as const, missingVars: ['SENTRY_AUTH_TOKEN'] }
};

const CONFIGURED_CONFIG = {
	...BASE_CONFIG,
	supabase: { configured: true as const, config: SUPABASE_CONFIG }
};

const FAKE_TABLE_STATS = [{ table: 'jobs', row_count: 100 }];
const FAKE_KPIS = [{ key: 'totalRows', value: '100' }];
const FAKE_TABLE_SIZES = [{ table: 'jobs', sizeBytes: 4096 }];

function makeEvent() {
	return { depends: vi.fn(), setHeaders: vi.fn() };
}

beforeEach(() => {
	mockGetServiceConfigs.mockReturnValue(BASE_CONFIG);
	mockGetTableStats.mockResolvedValue(FAKE_TABLE_STATS);
	mockMapToDbKpis.mockReturnValue(FAKE_KPIS);
	mockMapToTableSizes.mockReturnValue(FAKE_TABLE_SIZES);
});

describe('databaze load — not configured (Supabase missing)', () => {
	it('returns kpis as not-configured when Supabase is unconfigured', async () => {
		const result = await load(makeEvent() as never);
		expect(result.kpis.status).toBe('not-configured');
	});

	it('returns tableSizes as not-configured when Supabase is unconfigured', async () => {
		const result = await load(makeEvent() as never);
		expect(result.tableSizes.status).toBe('not-configured');
	});

	it('includes supabase missingVars in the not-configured result', async () => {
		const result = await load(makeEvent() as never);
		if (result.kpis.status !== 'not-configured') throw new Error('expected not-configured');
		expect(result.kpis.missingVars).toEqual(MISSING_SUPABASE);
	});

	it('does not call Supabase client when unconfigured', async () => {
		await load(makeEvent() as never);
		expect(mockGetTableStats).not.toHaveBeenCalled();
	});
});

describe('databaze load — success path', () => {
	beforeEach(() => {
		mockGetServiceConfigs.mockReturnValue(CONFIGURED_CONFIG);
	});

	it('returns kpis as ok with mapper output', async () => {
		const result = await load(makeEvent() as never);
		expect(result.kpis.status).toBe('ok');
		if (result.kpis.status !== 'ok') return;
		expect(result.kpis.data).toEqual(FAKE_KPIS);
	});

	it('returns tableSizes as ok with mapper output', async () => {
		const result = await load(makeEvent() as never);
		expect(result.tableSizes.status).toBe('ok');
		if (result.tableSizes.status !== 'ok') return;
		expect(result.tableSizes.data).toEqual(FAKE_TABLE_SIZES);
	});

	it('calls depends("app:databaze") and sets no-store header', async () => {
		const event = makeEvent();
		await load(event as never);
		expect(event.depends).toHaveBeenCalledWith('app:databaze');
		expect(event.setHeaders).toHaveBeenCalledWith({ 'Cache-Control': 'no-store' });
	});

	it('delegates to mapToDbKpis with table stats', async () => {
		await load(makeEvent() as never);
		expect(mockMapToDbKpis).toHaveBeenCalledWith(FAKE_TABLE_STATS);
	});

	it('delegates to mapToTableSizes with table stats', async () => {
		await load(makeEvent() as never);
		expect(mockMapToTableSizes).toHaveBeenCalledWith(FAKE_TABLE_STATS);
	});
});

describe('databaze load — getTableStats rejection', () => {
	beforeEach(() => {
		mockGetServiceConfigs.mockReturnValue(CONFIGURED_CONFIG);
		mockGetTableStats.mockRejectedValue(new Error('Supabase unreachable'));
	});

	it('returns kpis as error when getTableStats rejects', async () => {
		const result = await load(makeEvent() as never);
		expect(result.kpis.status).toBe('error');
	});

	it('returns tableSizes as error when getTableStats rejects', async () => {
		const result = await load(makeEvent() as never);
		expect(result.tableSizes.status).toBe('error');
	});
});
