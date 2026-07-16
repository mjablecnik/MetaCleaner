import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClientError } from '../types.js';
import { getMachines, getMachinesForAllApps } from '../flyClient.js';
import type { FlyClientConfig } from '../../config.js';

const BASE_CONFIG: FlyClientConfig = {
	token: 'test-fly-token',
	baseUrl: 'https://api.machines.dev/v1',
	org: 'my-org',
	apps: ['app1', 'app2'],
	prometheusBaseUrl: 'https://api.fly.io/prometheus/my-org/api/v1',
	timeout: 5_000
};

function makeFetchResponse(ok: boolean, status: number, data: unknown) {
	return {
		ok,
		status,
		json: async () => data
	};
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

describe('getMachines', () => {
	it('throws unauthorized ClientError and does not call fetch when token is empty', async () => {
		const fetch = vi.fn();
		vi.stubGlobal('fetch', fetch);

		const config: FlyClientConfig = { ...BASE_CONFIG, token: '' };
		await expect(getMachines(config, 'app1')).rejects.toSatisfy(
			(e: unknown) =>
				e instanceof ClientError && e.category === 'unauthorized' && e.service === 'fly'
		);
		expect(fetch).not.toHaveBeenCalled();
	});

	it('throws unauthorized ClientError when token is whitespace only', async () => {
		const config: FlyClientConfig = { ...BASE_CONFIG, token: '   ' };
		await expect(getMachines(config, 'app1')).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'unauthorized'
		);
	});

	it('calls fetch with correct URL and Authorization Bearer header', async () => {
		const mockFetch = vi.fn().mockResolvedValue(makeFetchResponse(true, 200, []));
		vi.stubGlobal('fetch', mockFetch);

		await getMachines(BASE_CONFIG, 'myapp');

		expect(mockFetch).toHaveBeenCalledOnce();
		const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
		expect(url).toContain('/apps/myapp/machines');
		expect(url).toContain(BASE_CONFIG.baseUrl);
		expect((init.headers as Record<string, string>)['Authorization']).toBe(
			`Bearer ${BASE_CONFIG.token}`
		);
	});

	it('returns parsed JSON array on success', async () => {
		const machines = [
			{ id: 'm1', name: 'machine-1', state: 'started', region: 'ams' },
			{ id: 'm2', name: 'machine-2', state: 'stopped', region: 'lax' }
		];
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeFetchResponse(true, 200, machines)));

		const result = await getMachines(BASE_CONFIG, 'app1');
		expect(result).toEqual(machines);
	});

	it('throws ClientError with statusCode and category when response is not ok (401)', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeFetchResponse(false, 401, {})));

		await expect(getMachines(BASE_CONFIG, 'app1')).rejects.toSatisfy(
			(e: unknown) =>
				e instanceof ClientError &&
				e.statusCode === 401 &&
				e.category === 'unauthorized' &&
				e.service === 'fly'
		);
	});

	it('throws ClientError with statusCode and category when response is not ok (500)', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeFetchResponse(false, 500, {})));

		await expect(getMachines(BASE_CONFIG, 'app1')).rejects.toSatisfy(
			(e: unknown) =>
				e instanceof ClientError && e.statusCode === 500 && e.category === 'service_unavailable'
		);
	});

	it('throws ClientError with category timeout when fetch rejects with AbortError', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError()));

		await expect(getMachines(BASE_CONFIG, 'app1')).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'timeout' && e.service === 'fly'
		);
	});

	it('throws ClientError with category request_error for generic fetch errors', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network failure')));

		await expect(getMachines(BASE_CONFIG, 'app1')).rejects.toSatisfy(
			(e: unknown) =>
				e instanceof ClientError && e.category === 'request_error' && e.service === 'fly'
		);
	});

	it('uses default baseUrl when not provided in config', async () => {
		const mockFetch = vi.fn().mockResolvedValue(makeFetchResponse(true, 200, []));
		vi.stubGlobal('fetch', mockFetch);

		const configWithoutBase: FlyClientConfig = {
			token: 'tok',
			org: 'org',
			apps: [],
			prometheusBaseUrl: 'https://api.fly.io/prometheus/org/api/v1',
			timeout: 5_000
		};
		await getMachines(configWithoutBase, 'someapp');
		const [url] = mockFetch.mock.calls[0] as [string];
		expect(url).toContain('api.machines.dev');
	});
});

describe('getMachinesForAllApps', () => {
	it('returns a Map keyed by app name with machines arrays', async () => {
		const app1Machines = [{ id: 'm1', state: 'started' }];
		const app2Machines = [{ id: 'm2', state: 'stopped' }];

		const mockFetch = vi.fn().mockImplementation((url: string) => {
			if (url.includes('/apps/app1/'))
				return Promise.resolve(makeFetchResponse(true, 200, app1Machines));
			if (url.includes('/apps/app2/'))
				return Promise.resolve(makeFetchResponse(true, 200, app2Machines));
			return Promise.reject(new Error('unexpected url'));
		});
		vi.stubGlobal('fetch', mockFetch);

		const result = await getMachinesForAllApps(BASE_CONFIG);

		expect(result).toBeInstanceOf(Map);
		expect(result.get('app1')).toEqual(app1Machines);
		expect(result.get('app2')).toEqual(app2Machines);
	});

	it('rejects entirely if one app fails', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockImplementation((url: string) => {
				if (url.includes('/apps/app1/')) return Promise.resolve(makeFetchResponse(false, 500, {}));
				return Promise.resolve(makeFetchResponse(true, 200, []));
			})
		);

		await expect(getMachinesForAllApps(BASE_CONFIG)).rejects.toBeInstanceOf(ClientError);
	});

	it('returns an empty Map when config.apps is empty', async () => {
		const config: FlyClientConfig = { ...BASE_CONFIG, apps: [] };
		const result = await getMachinesForAllApps(config);
		expect(result.size).toBe(0);
	});
});
