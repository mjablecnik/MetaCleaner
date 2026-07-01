const {
	mockGetServiceConfigs,
	mockGetActiveSubscriptions,
	mockGetCanceledSubscriptions,
	mockGetPrices,
	mockMapToBusinessKpiStats,
	mockMapToPlanRevenue
} = vi.hoisted(() => ({
	mockGetServiceConfigs: vi.fn(),
	mockGetActiveSubscriptions: vi.fn(),
	mockGetCanceledSubscriptions: vi.fn(),
	mockGetPrices: vi.fn(),
	mockMapToBusinessKpiStats: vi.fn(),
	mockMapToPlanRevenue: vi.fn()
}));

vi.mock('$lib/server/config.js', () => ({
	getServiceConfigs: mockGetServiceConfigs
}));

vi.mock('$lib/server/clients/stripeClient.js', () => ({
	getActiveSubscriptions: mockGetActiveSubscriptions,
	getCanceledSubscriptions: mockGetCanceledSubscriptions,
	getPrices: mockGetPrices
}));

vi.mock('$lib/server/mappers/stripeMapper.js', () => ({
	mapToBusinessKpiStats: mockMapToBusinessKpiStats,
	mapToPlanRevenue: mockMapToPlanRevenue
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from '../+page.server.js';

const STRIPE_CONFIG = {
	token: 'stripe-tok',
	baseUrl: 'https://api.stripe.com/v1',
	timeout: 10_000
};

const MISSING_STRIPE = ['STRIPE_SECRET_KEY'];

const BASE_CONFIG = {
	fly: { configured: false as const, missingVars: ['FLY_API_TOKEN'] },
	cloudflare: { configured: false as const, missingVars: ['CLOUDFLARE_API_TOKEN'] },
	stripe: { configured: false as const, missingVars: MISSING_STRIPE },
	supabase: { configured: false as const, missingVars: ['SUPABASE_URL'] },
	sentry: { configured: false as const, missingVars: ['SENTRY_AUTH_TOKEN'] }
};

const CONFIGURED_CONFIG = {
	...BASE_CONFIG,
	stripe: { configured: true as const, config: STRIPE_CONFIG }
};

const FAKE_KPI_STATS = [{ key: 'mrr', labelKey: 'biz_mrr', value: '$100' }];
const FAKE_PLAN_REVENUE = [{ planName: 'Pro', revenue: 100 }];
const FAKE_ACTIVE_SUBS = [{ id: 'sub_1', status: 'active', current_period_end: 9999999999 }];
const FAKE_CANCELED_SUBS = [{ id: 'sub_2', status: 'canceled', current_period_end: 9999999999 }];
const FAKE_PRICES = [{ id: 'price_1', unit_amount: 999 }];

function makeEvent() {
	return { depends: vi.fn(), setHeaders: vi.fn() };
}

beforeEach(() => {
	mockGetServiceConfigs.mockReturnValue(BASE_CONFIG);
	mockGetActiveSubscriptions.mockResolvedValue(FAKE_ACTIVE_SUBS);
	mockGetCanceledSubscriptions.mockResolvedValue(FAKE_CANCELED_SUBS);
	mockGetPrices.mockResolvedValue(FAKE_PRICES);
	mockMapToBusinessKpiStats.mockReturnValue(FAKE_KPI_STATS);
	mockMapToPlanRevenue.mockReturnValue(FAKE_PLAN_REVENUE);
});

describe('business load — not configured (Stripe missing)', () => {
	it('returns kpis as not-configured when Stripe is unconfigured', async () => {
		const result = await load(makeEvent() as never);
		expect(result.kpis.status).toBe('not-configured');
	});

	it('returns planRevenue as not-configured when Stripe is unconfigured', async () => {
		const result = await load(makeEvent() as never);
		expect(result.planRevenue.status).toBe('not-configured');
	});

	it('returns conversionFunnel as not-configured when Stripe is unconfigured', async () => {
		const result = await load(makeEvent() as never);
		expect(result.conversionFunnel.status).toBe('not-configured');
	});

	it('includes stripe missingVars in the not-configured section', async () => {
		const result = await load(makeEvent() as never);
		if (result.kpis.status !== 'not-configured') throw new Error('expected not-configured');
		expect(result.kpis.missingVars).toEqual(MISSING_STRIPE);
	});

	it('does not call Stripe client when unconfigured', async () => {
		await load(makeEvent() as never);
		expect(mockGetActiveSubscriptions).not.toHaveBeenCalled();
	});
});

describe('business load — success path', () => {
	beforeEach(() => {
		mockGetServiceConfigs.mockReturnValue(CONFIGURED_CONFIG);
	});

	it('returns kpis as ok with mapper output', async () => {
		const result = await load(makeEvent() as never);
		expect(result.kpis.status).toBe('ok');
		if (result.kpis.status !== 'ok') return;
		expect(result.kpis.data).toEqual(FAKE_KPI_STATS);
	});

	it('returns planRevenue as ok with mapper output', async () => {
		const result = await load(makeEvent() as never);
		expect(result.planRevenue.status).toBe('ok');
		if (result.planRevenue.status !== 'ok') return;
		expect(result.planRevenue.data).toEqual(FAKE_PLAN_REVENUE);
	});

	it('returns conversionFunnel as ok with empty data', async () => {
		const result = await load(makeEvent() as never);
		expect(result.conversionFunnel.status).toBe('ok');
		if (result.conversionFunnel.status !== 'ok') return;
		expect(result.conversionFunnel.data).toEqual([]);
	});

	it('calls depends("app:business") and sets no-store header', async () => {
		const event = makeEvent();
		await load(event as never);
		expect(event.depends).toHaveBeenCalledWith('app:business');
		expect(event.setHeaders).toHaveBeenCalledWith({ 'Cache-Control': 'no-store' });
	});

	it('delegates to mapToBusinessKpiStats with active subs, canceled subs, and since timestamp', async () => {
		await load(makeEvent() as never);
		expect(mockMapToBusinessKpiStats).toHaveBeenCalledWith(
			FAKE_ACTIVE_SUBS,
			FAKE_CANCELED_SUBS,
			expect.any(Number)
		);
	});

	it('delegates to mapToPlanRevenue with active subs and prices', async () => {
		await load(makeEvent() as never);
		expect(mockMapToPlanRevenue).toHaveBeenCalledWith(FAKE_ACTIVE_SUBS, FAKE_PRICES);
	});
});

describe('business load — Stripe rejection (active subs)', () => {
	beforeEach(() => {
		mockGetServiceConfigs.mockReturnValue(CONFIGURED_CONFIG);
	});

	it('returns kpis as error when getActiveSubscriptions rejects', async () => {
		mockGetActiveSubscriptions.mockRejectedValue(new Error('Stripe down'));

		const result = await load(makeEvent() as never);
		expect(result.kpis.status).toBe('error');
	});

	it('returns planRevenue as error when getActiveSubscriptions rejects', async () => {
		mockGetActiveSubscriptions.mockRejectedValue(new Error('Stripe down'));

		const result = await load(makeEvent() as never);
		expect(result.planRevenue.status).toBe('error');
	});

	it('returns conversionFunnel as ok even when active subs reject (isolated)', async () => {
		mockGetActiveSubscriptions.mockRejectedValue(new Error('Stripe down'));

		const result = await load(makeEvent() as never);
		// conversionFunnel is statically { status: 'ok', data: [] } — not dependent on Stripe
		expect(result.conversionFunnel.status).toBe('ok');
	});
});
