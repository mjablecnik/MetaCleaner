const {
	mockGetServiceConfigs,
	mockGetRecentIssues,
	mockMapToErrorLog,
	mockMapToErrorKpis,
	mockMapToTopEndpoints
} = vi.hoisted(() => ({
	mockGetServiceConfigs: vi.fn(),
	mockGetRecentIssues: vi.fn(),
	mockMapToErrorLog: vi.fn(),
	mockMapToErrorKpis: vi.fn(),
	mockMapToTopEndpoints: vi.fn()
}));

vi.mock('$lib/server/config.js', () => ({
	getServiceConfigs: mockGetServiceConfigs
}));

vi.mock('$lib/server/clients/sentryClient.js', () => ({
	getRecentIssues: mockGetRecentIssues
}));

vi.mock('$lib/server/mappers/sentryMapper.js', () => ({
	mapToErrorLog: mockMapToErrorLog,
	mapToErrorKpis: mockMapToErrorKpis,
	mapToTopEndpoints: mockMapToTopEndpoints
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from '../+page.server.js';

const SENTRY_CONFIG = {
	token: 'sentry-tok',
	org: 'org',
	project: 'proj',
	baseUrl: 'https://sentry.io/api/0',
	timeout: 10_000
};

const MISSING_SENTRY = ['SENTRY_AUTH_TOKEN', 'SENTRY_ORG', 'SENTRY_PROJECT'];

const BASE_CONFIG = {
	fly: { configured: false as const, missingVars: ['FLY_API_TOKEN'] },
	cloudflare: { configured: false as const, missingVars: ['CLOUDFLARE_API_TOKEN'] },
	stripe: { configured: false as const, missingVars: ['STRIPE_SECRET_KEY'] },
	supabase: { configured: false as const, missingVars: ['SUPABASE_URL'] },
	sentry: { configured: false as const, missingVars: MISSING_SENTRY }
};

const CONFIGURED_CONFIG = {
	...BASE_CONFIG,
	sentry: { configured: true as const, config: SENTRY_CONFIG }
};

const FAKE_ISSUES = [{ id: 'i1', title: 'TypeError', level: 'error', count: '5' }];
const FAKE_KPIS = [{ key: 'totalErrors', value: '5' }];
const FAKE_LOG = [{ id: 'l1', title: 'TypeError', severity: 'error' as const }];
const FAKE_TOP_ENDPOINTS = [{ endpoint: '/api/clean', count: 3 }];

function makeEvent() {
	return { depends: vi.fn(), setHeaders: vi.fn() };
}

beforeEach(() => {
	mockGetServiceConfigs.mockReturnValue(BASE_CONFIG);
	mockGetRecentIssues.mockResolvedValue(FAKE_ISSUES);
	mockMapToErrorKpis.mockReturnValue(FAKE_KPIS);
	mockMapToErrorLog.mockReturnValue(FAKE_LOG);
	mockMapToTopEndpoints.mockReturnValue(FAKE_TOP_ENDPOINTS);
});

describe('chyby load — not configured (Sentry missing)', () => {
	it('returns kpis as not-configured when Sentry is unconfigured', async () => {
		const result = await load(makeEvent() as never);
		expect(result.kpis.status).toBe('not-configured');
	});

	it('returns log as not-configured when Sentry is unconfigured', async () => {
		const result = await load(makeEvent() as never);
		expect(result.log.status).toBe('not-configured');
	});

	it('returns topEndpoints as not-configured when Sentry is unconfigured', async () => {
		const result = await load(makeEvent() as never);
		expect(result.topEndpoints.status).toBe('not-configured');
	});

	it('includes sentry missingVars in the not-configured result', async () => {
		const result = await load(makeEvent() as never);
		if (result.kpis.status !== 'not-configured') throw new Error('expected not-configured');
		expect(result.kpis.missingVars).toEqual(MISSING_SENTRY);
	});

	it('does not call Sentry client when unconfigured', async () => {
		await load(makeEvent() as never);
		expect(mockGetRecentIssues).not.toHaveBeenCalled();
	});
});

describe('chyby load — success path', () => {
	beforeEach(() => {
		mockGetServiceConfigs.mockReturnValue(CONFIGURED_CONFIG);
	});

	it('returns kpis as ok with mapper output', async () => {
		const result = await load(makeEvent() as never);
		expect(result.kpis.status).toBe('ok');
		if (result.kpis.status !== 'ok') return;
		expect(result.kpis.data).toEqual(FAKE_KPIS);
	});

	it('returns log as ok with mapper output', async () => {
		const result = await load(makeEvent() as never);
		expect(result.log.status).toBe('ok');
		if (result.log.status !== 'ok') return;
		expect(result.log.data).toEqual(FAKE_LOG);
	});

	it('returns topEndpoints as ok with mapper output', async () => {
		const result = await load(makeEvent() as never);
		expect(result.topEndpoints.status).toBe('ok');
		if (result.topEndpoints.status !== 'ok') return;
		expect(result.topEndpoints.data).toEqual(FAKE_TOP_ENDPOINTS);
	});

	it('calls depends("app:chyby") and sets no-store header', async () => {
		const event = makeEvent();
		await load(event as never);
		expect(event.depends).toHaveBeenCalledWith('app:chyby');
		expect(event.setHeaders).toHaveBeenCalledWith({ 'Cache-Control': 'no-store' });
	});

	it('calls getRecentIssues with sentry config and limit 25', async () => {
		await load(makeEvent() as never);
		expect(mockGetRecentIssues).toHaveBeenCalledWith(SENTRY_CONFIG, 25);
	});

	it('delegates to mapToErrorKpis with sentry issues', async () => {
		await load(makeEvent() as never);
		expect(mockMapToErrorKpis).toHaveBeenCalledWith(FAKE_ISSUES);
	});

	it('delegates to mapToErrorLog with sentry issues', async () => {
		await load(makeEvent() as never);
		expect(mockMapToErrorLog).toHaveBeenCalledWith(FAKE_ISSUES);
	});

	it('delegates to mapToTopEndpoints with sentry issues', async () => {
		await load(makeEvent() as never);
		expect(mockMapToTopEndpoints).toHaveBeenCalledWith(FAKE_ISSUES);
	});
});

describe('chyby load — Sentry rejection', () => {
	beforeEach(() => {
		mockGetServiceConfigs.mockReturnValue(CONFIGURED_CONFIG);
		mockGetRecentIssues.mockRejectedValue(new Error('Sentry unreachable'));
	});

	it('returns kpis as error when Sentry client rejects', async () => {
		const result = await load(makeEvent() as never);
		expect(result.kpis.status).toBe('error');
	});

	it('returns log as error when Sentry client rejects', async () => {
		const result = await load(makeEvent() as never);
		expect(result.log.status).toBe('error');
	});

	it('returns topEndpoints as error when Sentry client rejects', async () => {
		const result = await load(makeEvent() as never);
		expect(result.topEndpoints.status).toBe('error');
	});
});
