import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClientError } from '../types.js';
import { getTableStats, getUsers, queryTable } from '../supabaseClient.js';
import type { SupabaseClientConfig } from '../../config.js';

const BASE_CONFIG: SupabaseClientConfig = {
	url: 'https://abcdef.supabase.co',
	serviceKey: 'service-key-xyz',
	timeout: 5_000
};

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
	vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('getTableStats', () => {
	it('throws unauthorized ClientError when serviceKey is empty', async () => {
		const fetch = vi.fn();
		vi.stubGlobal('fetch', fetch);
		const config: SupabaseClientConfig = { ...BASE_CONFIG, serviceKey: '' };

		await expect(getTableStats(config)).rejects.toSatisfy(
			(e: unknown) =>
				e instanceof ClientError && e.category === 'unauthorized' && e.service === 'supabase'
		);
		expect(fetch).not.toHaveBeenCalled();
	});

	it('throws request_error ClientError when url is empty', async () => {
		const fetch = vi.fn();
		vi.stubGlobal('fetch', fetch);
		const config: SupabaseClientConfig = { ...BASE_CONFIG, url: '' };

		await expect(getTableStats(config)).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'request_error'
		);
		expect(fetch).not.toHaveBeenCalled();
	});

	it('sends Authorization Bearer and apikey headers', async () => {
		const mockFetch = vi.fn().mockResolvedValue(okResponse([]));
		vi.stubGlobal('fetch', mockFetch);

		await getTableStats(BASE_CONFIG);

		const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
		const headers = init.headers as Record<string, string>;
		expect(headers['Authorization']).toBe(`Bearer ${BASE_CONFIG.serviceKey}`);
		expect(headers['apikey']).toBe(BASE_CONFIG.serviceKey);
	});

	it('calls the get_table_stats RPC endpoint', async () => {
		const mockFetch = vi.fn().mockResolvedValue(okResponse([]));
		vi.stubGlobal('fetch', mockFetch);

		await getTableStats(BASE_CONFIG);

		const [url] = mockFetch.mock.calls[0] as [string];
		expect(url).toContain('/rest/v1/rpc/get_table_stats');
	});

	it('returns the parsed table stats array', async () => {
		const stats = [
			{ table_name: 'users', row_count: 100, total_bytes: 1024 },
			{ table_name: 'orders', row_count: 500, total_bytes: 8192 }
		];
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse(stats)));

		const result = await getTableStats(BASE_CONFIG);
		expect(result).toEqual(stats);
	});

	it('throws categorized ClientError on non-ok response (403)', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(errorResponse(403)));

		await expect(getTableStats(BASE_CONFIG)).rejects.toSatisfy(
			(e: unknown) =>
				e instanceof ClientError && e.statusCode === 403 && e.category === 'unauthorized'
		);
	});

	it('throws timeout ClientError on AbortError', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError()));

		await expect(getTableStats(BASE_CONFIG)).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'timeout'
		);
	});

	it('throws request_error ClientError on generic fetch failure', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Connection refused')));

		await expect(getTableStats(BASE_CONFIG)).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'request_error'
		);
	});
});

describe('getUsers', () => {
	it('throws unauthorized when serviceKey is empty', async () => {
		const config: SupabaseClientConfig = { ...BASE_CONFIG, serviceKey: '' };
		await expect(getUsers(config)).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'unauthorized'
		);
	});

	it('throws request_error when url is empty', async () => {
		const config: SupabaseClientConfig = { ...BASE_CONFIG, url: '' };
		await expect(getUsers(config)).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'request_error'
		);
	});

	it('includes page and per_page query params in URL', async () => {
		const mockFetch = vi.fn().mockResolvedValue(okResponse({ users: [], total: 0 }));
		vi.stubGlobal('fetch', mockFetch);

		await getUsers(BASE_CONFIG, 2, 25);

		const [url] = mockFetch.mock.calls[0] as [string];
		const params = new URL(url).searchParams;
		expect(params.get('page')).toBe('2');
		expect(params.get('per_page')).toBe('25');
	});

	it('hits the auth admin users endpoint', async () => {
		const mockFetch = vi.fn().mockResolvedValue(okResponse({ users: [], total: 0 }));
		vi.stubGlobal('fetch', mockFetch);

		await getUsers(BASE_CONFIG);

		const [url] = mockFetch.mock.calls[0] as [string];
		expect(url).toContain('/auth/v1/admin/users');
	});

	it('null-coalesces users to [] when response has no users', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse({ total: 5 })));

		const result = await getUsers(BASE_CONFIG);
		expect(result.users).toEqual([]);
		expect(result.total).toBe(5);
	});

	it('null-coalesces total to 0 when response has no total', async () => {
		const user = { id: 'u1', email: 'test@example.com' };
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse({ users: [user] })));

		const result = await getUsers(BASE_CONFIG);
		expect(result.total).toBe(0);
		expect(result.users).toHaveLength(1);
	});

	it('returns users and total from response', async () => {
		const users = [{ id: 'u1', email: 'a@b.com' }];
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse({ users, total: 1 })));

		const result = await getUsers(BASE_CONFIG);
		expect(result.users).toEqual(users);
		expect(result.total).toBe(1);
	});

	it('throws categorized ClientError on non-ok response (500)', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(errorResponse(500)));

		await expect(getUsers(BASE_CONFIG)).rejects.toSatisfy(
			(e: unknown) =>
				e instanceof ClientError && e.category === 'service_unavailable' && e.statusCode === 500
		);
	});

	it('throws timeout on AbortError', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError()));

		await expect(getUsers(BASE_CONFIG)).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'timeout'
		);
	});

	it('uses default page=1 and per_page=50 when not specified', async () => {
		const mockFetch = vi.fn().mockResolvedValue(okResponse({ users: [], total: 0 }));
		vi.stubGlobal('fetch', mockFetch);

		await getUsers(BASE_CONFIG);

		const [url] = mockFetch.mock.calls[0] as [string];
		const params = new URL(url).searchParams;
		expect(params.get('page')).toBe('1');
		expect(params.get('per_page')).toBe('50');
	});
});

describe('queryTable', () => {
	it('throws unauthorized when serviceKey is empty', async () => {
		const config: SupabaseClientConfig = { ...BASE_CONFIG, serviceKey: '' };
		await expect(queryTable(config, 'my_table')).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'unauthorized'
		);
	});

	it('throws request_error when url is empty', async () => {
		const config: SupabaseClientConfig = { ...BASE_CONFIG, url: '' };
		await expect(queryTable(config, 'my_table')).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'request_error'
		);
	});

	it('calls the correct table REST endpoint', async () => {
		const mockFetch = vi.fn().mockResolvedValue(okResponse([]));
		vi.stubGlobal('fetch', mockFetch);

		await queryTable(BASE_CONFIG, 'my_table');

		const [url] = mockFetch.mock.calls[0] as [string];
		expect(url).toContain('/rest/v1/my_table');
	});

	it('appends additional query params when provided', async () => {
		const mockFetch = vi.fn().mockResolvedValue(okResponse([]));
		vi.stubGlobal('fetch', mockFetch);

		await queryTable(BASE_CONFIG, 'events', { select: '*', limit: '10' });

		const [url] = mockFetch.mock.calls[0] as [string];
		const params = new URL(url).searchParams;
		expect(params.get('select')).toBe('*');
		expect(params.get('limit')).toBe('10');
	});

	it('returns parsed rows array', async () => {
		const rows = [{ id: 1, name: 'row1' }];
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse(rows)));

		const result = await queryTable(BASE_CONFIG, 'my_table');
		expect(result).toEqual(rows);
	});
});
