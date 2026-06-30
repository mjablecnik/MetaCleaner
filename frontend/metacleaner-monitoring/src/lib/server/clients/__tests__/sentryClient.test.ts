import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClientError } from '../types.js';
import { getRecentIssues, getIssueStats } from '../sentryClient.js';
import type { SentryClientConfig } from '../../config.js';

const BASE_CONFIG: SentryClientConfig = {
	token: 'sentry-auth-token',
	baseUrl: 'https://sentry.io/api/0',
	org: 'my-org',
	project: 'my-project',
	timeout: 5_000
};

// Fixed time: 2024-01-15T12:00:00.000Z (Unix: 1705320000000)
const FIXED_NOW_MS = 1705320000000;
const FIXED_SINCE_ISO = new Date(FIXED_NOW_MS - 24 * 60 * 60 * 1000).toISOString();

function okResponse(data: unknown) {
	return { ok: true, status: 200, json: async () => data };
}

function errorResponse(status: number) {
	return { ok: false, status, json: async () => ({}) };
}

function abortError(): Error {
	return Object.assign(new Error('aborted'), { name: 'AbortError' });
}

beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(FIXED_NOW_MS);
	vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
});

describe('getRecentIssues', () => {
	it('throws unauthorized ClientError when token is empty', async () => {
		const fetch = vi.fn();
		vi.stubGlobal('fetch', fetch);
		const config: SentryClientConfig = { ...BASE_CONFIG, token: '' };

		await expect(getRecentIssues(config)).rejects.toSatisfy(
			(e: unknown) =>
				e instanceof ClientError && e.category === 'unauthorized' && e.service === 'sentry'
		);
		expect(fetch).not.toHaveBeenCalled();
	});

	it('throws request_error when org is empty', async () => {
		const fetch = vi.fn();
		vi.stubGlobal('fetch', fetch);
		const config: SentryClientConfig = { ...BASE_CONFIG, org: '' };

		await expect(getRecentIssues(config)).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'request_error'
		);
		expect(fetch).not.toHaveBeenCalled();
	});

	it('throws request_error when project is empty', async () => {
		const fetch = vi.fn();
		vi.stubGlobal('fetch', fetch);
		const config: SentryClientConfig = { ...BASE_CONFIG, project: '' };

		await expect(getRecentIssues(config)).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'request_error'
		);
		expect(fetch).not.toHaveBeenCalled();
	});

	it('calls the correct issues endpoint URL with org and project', async () => {
		const mockFetch = vi.fn().mockResolvedValue(okResponse([]));
		vi.stubGlobal('fetch', mockFetch);

		await getRecentIssues(BASE_CONFIG);

		const [url] = mockFetch.mock.calls[0] as [string];
		expect(url).toContain(`/projects/${BASE_CONFIG.org}/${BASE_CONFIG.project}/issues/`);
	});

	it('sends Authorization Bearer header', async () => {
		const mockFetch = vi.fn().mockResolvedValue(okResponse([]));
		vi.stubGlobal('fetch', mockFetch);

		await getRecentIssues(BASE_CONFIG);

		const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
		expect((init.headers as Record<string, string>)['Authorization']).toBe(
			`Bearer ${BASE_CONFIG.token}`
		);
	});

	it('sends limit, sort=date, and lastSeen query params', async () => {
		const mockFetch = vi.fn().mockResolvedValue(okResponse([]));
		vi.stubGlobal('fetch', mockFetch);

		await getRecentIssues(BASE_CONFIG, 10);

		const [url] = mockFetch.mock.calls[0] as [string];
		const params = new URL(url).searchParams;
		expect(params.get('limit')).toBe('10');
		expect(params.get('sort')).toBe('date');
		expect(params.get('query')).toBe(`lastSeen:>${FIXED_SINCE_ISO}`);
	});

	it('uses default limit of 25 when not specified', async () => {
		const mockFetch = vi.fn().mockResolvedValue(okResponse([]));
		vi.stubGlobal('fetch', mockFetch);

		await getRecentIssues(BASE_CONFIG);

		const [url] = mockFetch.mock.calls[0] as [string];
		expect(new URL(url).searchParams.get('limit')).toBe('25');
	});

	it('the since timestamp is exactly 24 hours before fixed now', async () => {
		const mockFetch = vi.fn().mockResolvedValue(okResponse([]));
		vi.stubGlobal('fetch', mockFetch);

		await getRecentIssues(BASE_CONFIG);

		const [url] = mockFetch.mock.calls[0] as [string];
		const query = new URL(url).searchParams.get('query') ?? '';
		expect(query).toContain('lastSeen:>');
		const sinceStr = query.replace('lastSeen:>', '');
		const sinceMs = new Date(sinceStr).getTime();
		expect(sinceMs).toBe(FIXED_NOW_MS - 24 * 60 * 60 * 1000);
	});

	it('returns the issues array from a successful response', async () => {
		const issues = [{ id: 'i1', title: 'TypeError: Cannot read' }];
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse(issues)));

		const result = await getRecentIssues(BASE_CONFIG);
		expect(result).toEqual(issues);
	});

	it('throws categorized ClientError on 401 response', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(errorResponse(401)));

		await expect(getRecentIssues(BASE_CONFIG)).rejects.toSatisfy(
			(e: unknown) =>
				e instanceof ClientError && e.statusCode === 401 && e.category === 'unauthorized'
		);
	});

	it('throws categorized ClientError on 500 response', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(errorResponse(500)));

		await expect(getRecentIssues(BASE_CONFIG)).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'service_unavailable'
		);
	});

	it('throws timeout ClientError on AbortError from fetch', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError()));

		await expect(getRecentIssues(BASE_CONFIG)).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'timeout' && e.service === 'sentry'
		);
	});

	it('throws request_error ClientError on generic network error', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network unreachable')));

		await expect(getRecentIssues(BASE_CONFIG)).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'request_error'
		);
	});
});

describe('getIssueStats', () => {
	it('throws unauthorized ClientError when token is missing', async () => {
		const config: SentryClientConfig = { ...BASE_CONFIG, token: '' };
		await expect(getIssueStats(config)).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'unauthorized'
		);
	});

	it('throws request_error when org is empty', async () => {
		const config: SentryClientConfig = { ...BASE_CONFIG, org: '' };
		await expect(getIssueStats(config)).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'request_error'
		);
	});

	it('throws request_error when project is empty', async () => {
		const config: SentryClientConfig = { ...BASE_CONFIG, project: '' };
		await expect(getIssueStats(config)).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'request_error'
		);
	});

	it('sends statsPeriod=24h and lastSeen query params', async () => {
		const mockFetch = vi.fn().mockResolvedValue(okResponse([]));
		vi.stubGlobal('fetch', mockFetch);

		await getIssueStats(BASE_CONFIG);

		const [url] = mockFetch.mock.calls[0] as [string];
		const params = new URL(url).searchParams;
		expect(params.get('statsPeriod')).toBe('24h');
		expect(params.get('query')).toBe(`lastSeen:>${FIXED_SINCE_ISO}`);
	});

	it('uses limit=100 for stats query', async () => {
		const mockFetch = vi.fn().mockResolvedValue(okResponse([]));
		vi.stubGlobal('fetch', mockFetch);

		await getIssueStats(BASE_CONFIG);

		const [url] = mockFetch.mock.calls[0] as [string];
		expect(new URL(url).searchParams.get('limit')).toBe('100');
	});

	it('returns the stats array from a successful response', async () => {
		const stats = [{ id: 'i1', stats: { '24h': [[1705320000, 5]] } }];
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse(stats)));

		const result = await getIssueStats(BASE_CONFIG);
		expect(result).toEqual(stats);
	});

	it('throws timeout on AbortError', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError()));

		await expect(getIssueStats(BASE_CONFIG)).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'timeout'
		);
	});
});
