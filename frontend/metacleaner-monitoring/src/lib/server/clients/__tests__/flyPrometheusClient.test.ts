import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClientError } from '../types.js';
import {
	queryInstant,
	queryRange,
	getCurrentCpuPercent,
	getCurrentRamUsage,
	getCpuOverTime,
	getRamOverTime
} from '../flyPrometheusClient.js';
import type { FlyClientConfig } from '../../config.js';

const BASE_CONFIG: FlyClientConfig = {
	token: 'test-fly-token',
	baseUrl: 'https://api.machines.dev/v1',
	org: 'my-org',
	apps: ['app1', 'app2'],
	prometheusBaseUrl: 'https://api.fly.io/prometheus/my-org/api/v1',
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

describe('queryInstant', () => {
	it('throws unauthorized ClientError and does not call fetch when token is empty', async () => {
		const fetch = vi.fn();
		vi.stubGlobal('fetch', fetch);
		const config: FlyClientConfig = { ...BASE_CONFIG, token: '' };

		await expect(queryInstant(config, 'up')).rejects.toSatisfy(
			(e: unknown) =>
				e instanceof ClientError && e.category === 'unauthorized' && e.service === 'fly'
		);
		expect(fetch).not.toHaveBeenCalled();
	});

	it('throws unauthorized ClientError when token is whitespace only', async () => {
		const config: FlyClientConfig = { ...BASE_CONFIG, token: '   ' };
		await expect(queryInstant(config, 'up')).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'unauthorized'
		);
	});

	it('calls fetch with the query endpoint, encoded promql, and Authorization Bearer header', async () => {
		const mockFetch = vi
			.fn()
			.mockResolvedValue(
				okResponse({ status: 'success', data: { resultType: 'vector', result: [] } })
			);
		vi.stubGlobal('fetch', mockFetch);

		await queryInstant(BASE_CONFIG, 'up{app="metacleaner-server"}');

		expect(mockFetch).toHaveBeenCalledOnce();
		const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
		expect(url).toContain(`${BASE_CONFIG.prometheusBaseUrl}/query?query=`);
		expect(url).toContain(encodeURIComponent('up{app="metacleaner-server"}'));
		expect((init.headers as Record<string, string>)['Authorization']).toBe(
			`Bearer ${BASE_CONFIG.token}`
		);
	});

	it('returns parsed JSON on success', async () => {
		const data = {
			status: 'success',
			data: { resultType: 'vector', result: [{ metric: { app: 'a' }, value: [1, '2'] }] }
		};
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse(data)));

		const result = await queryInstant(BASE_CONFIG, 'up');
		expect(result).toEqual(data);
	});

	it('throws ClientError with statusCode and category when response is not ok (401)', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(errorResponse(401)));

		await expect(queryInstant(BASE_CONFIG, 'up')).rejects.toSatisfy(
			(e: unknown) =>
				e instanceof ClientError &&
				e.statusCode === 401 &&
				e.category === 'unauthorized' &&
				e.service === 'fly'
		);
	});

	it('throws ClientError with statusCode and category when response is not ok (500)', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(errorResponse(500)));

		await expect(queryInstant(BASE_CONFIG, 'up')).rejects.toSatisfy(
			(e: unknown) =>
				e instanceof ClientError && e.statusCode === 500 && e.category === 'service_unavailable'
		);
	});

	it('throws ClientError with category timeout when fetch rejects with AbortError', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError()));

		await expect(queryInstant(BASE_CONFIG, 'up')).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'timeout' && e.service === 'fly'
		);
	});

	it('throws ClientError with category request_error for generic fetch errors', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network failure')));

		await expect(queryInstant(BASE_CONFIG, 'up')).rejects.toSatisfy(
			(e: unknown) =>
				e instanceof ClientError && e.category === 'request_error' && e.service === 'fly'
		);
	});
});

describe('queryRange', () => {
	it('throws unauthorized ClientError and does not call fetch when token is empty', async () => {
		const fetch = vi.fn();
		vi.stubGlobal('fetch', fetch);
		const config: FlyClientConfig = { ...BASE_CONFIG, token: '' };

		await expect(queryRange(config, 'up', 100, 200, 60)).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'unauthorized'
		);
		expect(fetch).not.toHaveBeenCalled();
	});

	it('calls fetch with the query_range endpoint and start/end/step params', async () => {
		const mockFetch = vi
			.fn()
			.mockResolvedValue(
				okResponse({ status: 'success', data: { resultType: 'matrix', result: [] } })
			);
		vi.stubGlobal('fetch', mockFetch);

		await queryRange(BASE_CONFIG, 'up', 1_000, 2_000, 300);

		const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
		expect(url).toContain(`${BASE_CONFIG.prometheusBaseUrl}/query_range?query=`);
		expect(url).toContain('&start=1000');
		expect(url).toContain('&end=2000');
		expect(url).toContain('&step=300');
		expect((init.headers as Record<string, string>)['Authorization']).toBe(
			`Bearer ${BASE_CONFIG.token}`
		);
	});

	it('returns parsed JSON on success', async () => {
		const data = {
			status: 'success',
			data: {
				resultType: 'matrix',
				result: [
					{
						metric: { app: 'a' },
						values: [
							[1000, '1'],
							[1300, '2']
						]
					}
				]
			}
		};
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse(data)));

		const result = await queryRange(BASE_CONFIG, 'up', 1000, 1300, 300);
		expect(result).toEqual(data);
	});

	it('throws ClientError with statusCode and category when response is not ok (500)', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(errorResponse(500)));

		await expect(queryRange(BASE_CONFIG, 'up', 100, 200, 60)).rejects.toSatisfy(
			(e: unknown) =>
				e instanceof ClientError && e.statusCode === 500 && e.category === 'service_unavailable'
		);
	});

	it('throws ClientError with category timeout when fetch rejects with AbortError', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError()));

		await expect(queryRange(BASE_CONFIG, 'up', 100, 200, 60)).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'timeout' && e.service === 'fly'
		);
	});

	it('throws ClientError with category request_error for generic fetch errors', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network failure')));

		await expect(queryRange(BASE_CONFIG, 'up', 100, 200, 60)).rejects.toSatisfy(
			(e: unknown) => e instanceof ClientError && e.category === 'request_error'
		);
	});
});

describe('convenience functions', () => {
	it('getCurrentCpuPercent queries the CPU PromQL expression', async () => {
		const mockFetch = vi
			.fn()
			.mockResolvedValue(
				okResponse({ status: 'success', data: { resultType: 'vector', result: [] } })
			);
		vi.stubGlobal('fetch', mockFetch);

		await getCurrentCpuPercent(BASE_CONFIG);

		const [url] = mockFetch.mock.calls[0] as [string];
		expect(url).toContain(encodeURIComponent('fly_instance_cpu'));
	});

	it('getCurrentRamUsage queries the RAM PromQL expression', async () => {
		const mockFetch = vi
			.fn()
			.mockResolvedValue(
				okResponse({ status: 'success', data: { resultType: 'vector', result: [] } })
			);
		vi.stubGlobal('fetch', mockFetch);

		await getCurrentRamUsage(BASE_CONFIG);

		const [url] = mockFetch.mock.calls[0] as [string];
		expect(url).toContain(encodeURIComponent('fly_instance_memory_mem_total'));
	});

	it('getCpuOverTime queries the CPU PromQL expression over the given range', async () => {
		const mockFetch = vi
			.fn()
			.mockResolvedValue(
				okResponse({ status: 'success', data: { resultType: 'matrix', result: [] } })
			);
		vi.stubGlobal('fetch', mockFetch);

		await getCpuOverTime(BASE_CONFIG, 1000, 2000, 300);

		const [url] = mockFetch.mock.calls[0] as [string];
		expect(url).toContain(encodeURIComponent('fly_instance_cpu'));
		expect(url).toContain('&start=1000&end=2000&step=300');
	});

	it('getRamOverTime queries the RAM PromQL expression over the given range', async () => {
		const mockFetch = vi
			.fn()
			.mockResolvedValue(
				okResponse({ status: 'success', data: { resultType: 'matrix', result: [] } })
			);
		vi.stubGlobal('fetch', mockFetch);

		await getRamOverTime(BASE_CONFIG, 1000, 2000, 300);

		const [url] = mockFetch.mock.calls[0] as [string];
		expect(url).toContain(encodeURIComponent('fly_instance_memory_mem_total'));
		expect(url).toContain('&start=1000&end=2000&step=300');
	});
});
