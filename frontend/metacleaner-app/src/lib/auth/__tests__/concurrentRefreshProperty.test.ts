import fc from 'fast-check';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────
// Must use vi.hoisted() so the factories below can close over these refs.

const { mockRefresh, mockLogout, mockState } = vi.hoisted(() => ({
	mockRefresh: vi.fn<[], Promise<void>>(),
	mockLogout: vi.fn<[], Promise<void>>(),
	mockState: {
		accessToken: null as string | null,
		refreshToken: null as string | null,
		expiresAt: 0
	}
}));

vi.mock('$app/environment', () => ({ browser: true }));

vi.mock('$lib/clients/api-config.js', () => ({
	buildApiUrl: (path: string) => `http://localhost:8080${path}`
}));

// Path must match the exact import in api-client.ts
vi.mock('$lib/auth/auth.svelte.js', () => ({
	authStore: {
		get accessToken() {
			return mockState.accessToken;
		},
		get refreshToken() {
			return mockState.refreshToken;
		},
		get expiresAt() {
			return mockState.expiresAt;
		},
		refresh: () => mockRefresh(),
		logout: () => mockLogout()
	}
}));

import { apiFetch } from '../api-client.js';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function setExpiringToken(): void {
	mockState.accessToken = 'old-token';
	mockState.refreshToken = 'refresh-token';
	mockState.expiresAt = Date.now() + 30_000; // within 60 s buffer → refresh required
}

// ─── Property 6: Concurrent refresh deduplication (Req 12.7) ───────────────────
//
// For any N ≥ 2 concurrent apiFetch calls with an expiring token, the single-flight
// lock must issue exactly 1 refresh call and all N requests must complete.

describe('property — concurrent refresh deduplication (Req 12.7)', () => {
	beforeEach(() => {
		setExpiringToken();
		mockLogout.mockReset().mockResolvedValue(undefined);
	});

	it('issues exactly one refresh call regardless of concurrency (N=2..20)', async () => {
		await fc.assert(
			fc.asyncProperty(fc.integer({ min: 2, max: 20 }), async (n) => {
				// Reset per-run state
				mockRefresh.mockReset();
				setExpiringToken();

				// Barrier lets us hold the refresh in-flight while all N requests start
				let resolveRefresh!: () => void;
				const refreshBarrier = new Promise<void>((r) => {
					resolveRefresh = r;
				});
				mockRefresh.mockReturnValueOnce(refreshBarrier);

				const mockFetch = vi
					.fn()
					.mockResolvedValue(new Response('{}', { status: 200 }));
				vi.stubGlobal('fetch', mockFetch);

				// Launch N concurrent requests before releasing the refresh barrier
				const paths = Array.from({ length: n }, (_, i) => `/api/resource-${i}`);
				const promises = paths.map((path) => apiFetch(path, {}));

				// Release refresh — all waiters unblock together
				resolveRefresh();
				await Promise.all(promises);

				// Single-flight invariant: exactly one refresh issued
				expect(mockRefresh).toHaveBeenCalledTimes(1);
				// All N requests must have reached the underlying fetch
				expect(mockFetch).toHaveBeenCalledTimes(n);
			}),
			{ numRuns: 50 }
		);
	});

	it('all N requests receive the refreshed token after deduplication', async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.integer({ min: 2, max: 10 }),
				fc.string({ minLength: 8, maxLength: 32, unit: 'binary' }),
				async (n, newToken) => {
					// Reset per-run state
					mockRefresh.mockReset();
					setExpiringToken();

					// Simulate refresh that updates the access token
					mockRefresh.mockImplementationOnce(async () => {
						mockState.accessToken = newToken;
					});

					const mockFetch = vi
						.fn()
						.mockResolvedValue(new Response('{}', { status: 200 }));
					vi.stubGlobal('fetch', mockFetch);

					const promises = Array.from({ length: n }, (_, i) =>
						apiFetch(`/api/resource-${i}`, {})
					);
					await Promise.all(promises);

					// Every request must inject the new token, not the stale one
					for (const [, init] of mockFetch.mock.calls as [string, RequestInit][]) {
						const auth = (init.headers as Record<string, string>)['Authorization'];
						expect(auth).toBe(`Bearer ${newToken}`);
					}
				}
			),
			{ numRuns: 30 }
		);
	});
});
