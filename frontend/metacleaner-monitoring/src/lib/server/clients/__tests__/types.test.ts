import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { categorizeStatus, fetchWithTimeout } from '../types.js';

describe('categorizeStatus', () => {
	it('maps 401 to unauthorized', () => {
		expect(categorizeStatus(401)).toBe('unauthorized');
	});

	it('maps 403 to unauthorized', () => {
		expect(categorizeStatus(403)).toBe('unauthorized');
	});

	it('maps 400 to request_error', () => {
		expect(categorizeStatus(400)).toBe('request_error');
	});

	it('maps 404 to request_error', () => {
		expect(categorizeStatus(404)).toBe('request_error');
	});

	it('maps 429 to request_error', () => {
		expect(categorizeStatus(429)).toBe('request_error');
	});

	it('maps 500 to service_unavailable', () => {
		expect(categorizeStatus(500)).toBe('service_unavailable');
	});

	it('maps 503 to service_unavailable', () => {
		expect(categorizeStatus(503)).toBe('service_unavailable');
	});

	it('maps any code >= 500 to service_unavailable (property test)', () => {
		fc.assert(
			fc.property(fc.integer({ min: 500, max: 599 }), (code) => {
				expect(categorizeStatus(code)).toBe('service_unavailable');
			})
		);
	});

	it('maps 4xx codes other than 401/403 to request_error', () => {
		for (const code of [400, 404, 422, 429]) {
			expect(categorizeStatus(code)).toBe('request_error');
		}
	});
});

describe('fetchWithTimeout', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.useRealTimers();
	});

	it('passes an AbortSignal to the underlying fetch call', async () => {
		const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
		vi.stubGlobal('fetch', mockFetch);

		await fetchWithTimeout('http://example.com', {}, 5_000);

		const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
		expect(init.signal).toBeInstanceOf(AbortSignal);
	});

	it('forwards all init options alongside the injected signal', async () => {
		const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
		vi.stubGlobal('fetch', mockFetch);

		await fetchWithTimeout(
			'http://example.com',
			{ method: 'POST', headers: { 'X-Foo': 'bar' } },
			5_000
		);

		const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
		expect(url).toBe('http://example.com');
		expect(init.method).toBe('POST');
		expect((init.headers as Record<string, string>)['X-Foo']).toBe('bar');
		expect(init.signal).toBeInstanceOf(AbortSignal);
	});

	it('returns the fetch response on success', async () => {
		const mockResponse = { ok: true, status: 200, json: async () => ({}) };
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

		const result = await fetchWithTimeout('http://example.com', {}, 5_000);
		expect(result).toBe(mockResponse);
	});

	it('clears the timeout timer after a successful fetch (no dangling timers)', async () => {
		vi.useFakeTimers();
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }));

		await fetchWithTimeout('http://example.com', {}, 5_000);

		expect(vi.getTimerCount()).toBe(0);
	});

	it('aborts the signal and rejects when the timeout elapses', async () => {
		vi.useFakeTimers();

		let fetchReject!: (err: Error) => void;
		const pendingFetch = new Promise<never>((_, reject) => {
			fetchReject = reject;
		});

		vi.stubGlobal(
			'fetch',
			vi.fn().mockImplementation((_url: string, init: RequestInit) => {
				// Simulate a real fetch that rejects when the abort signal fires
				init.signal!.addEventListener('abort', () => {
					fetchReject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
				});
				return pendingFetch;
			})
		);

		const resultPromise = fetchWithTimeout('http://example.com', {}, 5_000);

		// Attach rejection handler BEFORE advancing time to prevent unhandled rejection warning
		const assertion = expect(resultPromise).rejects.toMatchObject({ name: 'AbortError' });

		// Fire the timer synchronously (calls controller.abort() → abort event → fetchReject)
		vi.advanceTimersByTime(5_001);

		await assertion;
	});

	it('does not abort a completed request when timer eventually fires', async () => {
		vi.useFakeTimers();
		const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
		vi.stubGlobal('fetch', mockFetch);

		// Fetch completes immediately (before timeout)
		await fetchWithTimeout('http://example.com', {}, 5_000);

		// Advancing past the timeout should have no effect since it was cleared
		await vi.advanceTimersByTimeAsync(10_000);

		// The fetch was called exactly once and there are no dangling timers
		expect(mockFetch).toHaveBeenCalledOnce();
		expect(vi.getTimerCount()).toBe(0);
	});
});
