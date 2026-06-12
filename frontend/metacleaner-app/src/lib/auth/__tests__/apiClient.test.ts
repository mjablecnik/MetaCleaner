import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────
// mockRefresh / mockLogout must be hoisted so vi.mock factories can close over them.

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

// Path must match the exact import in api-client.ts: '$lib/clients/api-config.js'
vi.mock('$lib/clients/api-config.js', () => ({
	buildApiUrl: (path: string) => `http://localhost:8080${path}`
}));

// Path must match the exact import in api-client.ts: './auth.svelte.js'
// Resolved via $lib alias: '$lib/auth/auth.svelte.js'
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

const REFRESH_BUFFER_MS = 60_000;

function setFreshToken(): void {
	mockState.accessToken = 'test-access';
	mockState.refreshToken = 'test-refresh';
	mockState.expiresAt = Date.now() + REFRESH_BUFFER_MS + 1_000; // well beyond 60s buffer
}

function setExpiringToken(msUntilExpiry = 30_000): void {
	mockState.accessToken = 'test-access';
	mockState.refreshToken = 'test-refresh';
	mockState.expiresAt = Date.now() + msUntilExpiry; // less than 60s → refresh required
}

// ─── Token injection ────────────────────────────────────────────────────────────

describe('apiFetch — Authorization header injection', () => {
	let mockFetch: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		setFreshToken();
		mockFetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
		vi.stubGlobal('fetch', mockFetch);
		mockRefresh.mockReset().mockResolvedValue(undefined);
		mockLogout.mockReset().mockResolvedValue(undefined);
	});

	it('injects Authorization Bearer token on protected endpoints', async () => {
		mockState.accessToken = 'my-bearer-token';

		await apiFetch('/api/jobs', {});

		expect(mockFetch).toHaveBeenCalledWith(
			'http://localhost:8080/api/jobs',
			expect.objectContaining({
				headers: expect.objectContaining({ Authorization: 'Bearer my-bearer-token' })
			})
		);
	});

	it('does not inject Authorization on /api/auth/* endpoints', async () => {
		await apiFetch('/api/auth/login', {});

		const [[, init]] = mockFetch.mock.calls as [[string, RequestInit]];
		expect((init.headers as Record<string, string>)?.['Authorization']).toBeUndefined();
	});

	it('does not inject Authorization on /api/health', async () => {
		await apiFetch('/api/health', {});

		const [[, init]] = mockFetch.mock.calls as [[string, RequestInit]];
		expect((init.headers as Record<string, string>)?.['Authorization']).toBeUndefined();
	});

	it('does not inject Authorization when no access token exists', async () => {
		mockState.accessToken = null;

		await apiFetch('/api/jobs', {});

		const [[, init]] = mockFetch.mock.calls as [[string, RequestInit]];
		expect((init.headers as Record<string, string>)?.['Authorization']).toBeUndefined();
	});

	it('merges caller-provided headers with the Authorization header', async () => {
		await apiFetch('/api/jobs', {
			headers: { 'Content-Type': 'application/json' }
		});

		expect(mockFetch).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({
				headers: expect.objectContaining({
					'Content-Type': 'application/json',
					Authorization: expect.stringContaining('Bearer ')
				})
			})
		);
	});

	it('passes through the full URL built by buildApiUrl', async () => {
		await apiFetch('/api/reports', {});

		expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/api/reports', expect.any(Object));
	});
});

// ─── Proactive token refresh ────────────────────────────────────────────────────

describe('apiFetch — proactive refresh when token is near expiry', () => {
	let mockFetch: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockFetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
		vi.stubGlobal('fetch', mockFetch);
		mockRefresh.mockReset().mockResolvedValue(undefined);
		mockLogout.mockReset().mockResolvedValue(undefined);
	});

	it('does not refresh when token is fresh (> 60 s remaining)', async () => {
		setFreshToken();

		await apiFetch('/api/jobs', {});

		expect(mockRefresh).not.toHaveBeenCalled();
	});

	it('refreshes before fetching when token expires within 60 s', async () => {
		setExpiringToken(30_000);

		await apiFetch('/api/jobs', {});

		expect(mockRefresh).toHaveBeenCalledTimes(1);
	});

	it('uses the new access token returned after refresh', async () => {
		setExpiringToken(30_000);
		mockRefresh.mockImplementation(async () => {
			mockState.accessToken = 'refreshed-token';
		});

		await apiFetch('/api/jobs', {});

		expect(mockFetch).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({
				headers: expect.objectContaining({ Authorization: 'Bearer refreshed-token' })
			})
		);
	});

	it('does not refresh for /api/auth/* even when token is expiring', async () => {
		setExpiringToken(30_000);

		await apiFetch('/api/auth/login', {});

		expect(mockRefresh).not.toHaveBeenCalled();
	});

	it('does not refresh when both access token and refresh token are absent', async () => {
		mockState.accessToken = null;
		mockState.refreshToken = null;
		mockState.expiresAt = Date.now() + 30_000;

		await apiFetch('/api/jobs', {});

		expect(mockRefresh).not.toHaveBeenCalled();
	});
});

// ─── Redirect to /login on failed refresh ──────────────────────────────────────

describe('apiFetch — redirect to /login when refresh fails', () => {
	let mockFetch: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		setExpiringToken(30_000);
		mockFetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
		vi.stubGlobal('fetch', mockFetch);
		mockRefresh.mockReset();
		mockLogout.mockReset().mockResolvedValue(undefined);
	});

	it('calls authStore.logout() and throws when refresh returns 401', async () => {
		mockRefresh.mockRejectedValue(
			Object.assign(new Error('Unauthorized'), { status: 401 })
		);

		await expect(apiFetch('/api/jobs', {})).rejects.toThrow('Session expired');

		expect(mockLogout).toHaveBeenCalledTimes(1);
	});

	it('calls authStore.logout() and throws when refresh fails with generic error', async () => {
		mockRefresh.mockRejectedValue(new Error('Auth service unavailable'));

		await expect(apiFetch('/api/jobs', {})).rejects.toThrow('Session expired');

		expect(mockLogout).toHaveBeenCalledTimes(1);
	});

	it('does not call underlying fetch when refresh fails', async () => {
		mockRefresh.mockRejectedValue(new Error('401'));

		await expect(apiFetch('/api/jobs', {})).rejects.toThrow();

		expect(mockFetch).not.toHaveBeenCalled();
	});
});

// ─── Single-flight refresh ──────────────────────────────────────────────────────

describe('apiFetch — single-flight: only one refresh for concurrent requests', () => {
	let mockFetch: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		setExpiringToken(30_000);
		mockFetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
		vi.stubGlobal('fetch', mockFetch);
		mockLogout.mockReset().mockResolvedValue(undefined);
	});

	it('issues exactly one refresh call when multiple requests race', async () => {
		let resolveRefresh!: () => void;
		const refreshBarrier = new Promise<void>((r) => {
			resolveRefresh = r;
		});
		mockRefresh.mockReset().mockReturnValue(refreshBarrier);

		// Start 3 concurrent calls synchronously — they all enter ensureFreshToken
		const p1 = apiFetch('/api/jobs', {});
		const p2 = apiFetch('/api/reports', {});
		const p3 = apiFetch('/api/files', {});

		// After synchronous startup: only one refresh should be in-flight
		expect(mockRefresh).toHaveBeenCalledTimes(1);

		resolveRefresh();
		await Promise.all([p1, p2, p3]);

		// After all settle: still only one refresh call total
		expect(mockRefresh).toHaveBeenCalledTimes(1);
		// All three requests completed and called fetch
		expect(mockFetch).toHaveBeenCalledTimes(3);
	});
});

// ─── Retry on network error ─────────────────────────────────────────────────────

describe('apiFetch — retry refresh once after 5 s on network error', () => {
	let mockFetch: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.useFakeTimers();
		// Set up expiring token using fake Date.now()
		mockState.accessToken = 'test-access';
		mockState.refreshToken = 'test-refresh';
		mockState.expiresAt = Date.now() + 30_000;
		mockFetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
		vi.stubGlobal('fetch', mockFetch);
		mockLogout.mockReset().mockResolvedValue(undefined);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('retries refresh once after 5 s when a TypeError (network error) is thrown', async () => {
		mockRefresh
			.mockReset()
			.mockRejectedValueOnce(new TypeError('Failed to fetch'))
			.mockResolvedValueOnce(undefined);

		const promise = apiFetch('/api/jobs', {});
		await vi.advanceTimersByTimeAsync(5_000);
		await promise;

		expect(mockRefresh).toHaveBeenCalledTimes(2);
	});

	it('calls logout and throws after two consecutive network errors', async () => {
		mockRefresh
			.mockReset()
			.mockRejectedValueOnce(new TypeError('Failed to fetch'))
			.mockRejectedValueOnce(new TypeError('Failed to fetch again'));

		const promise = apiFetch('/api/jobs', {});
		// Attach the rejection handler BEFORE advancing timers to avoid unhandled-rejection warnings.
		const assertion = expect(promise).rejects.toThrow('Session expired');
		await vi.advanceTimersByTimeAsync(5_000);
		await assertion;

		expect(mockLogout).toHaveBeenCalledTimes(1);
	});

	it('does not retry non-network errors (non-TypeError) — logs out immediately', async () => {
		mockRefresh
			.mockReset()
			.mockRejectedValueOnce(new Error('401 Unauthorized'))
			.mockResolvedValueOnce(undefined); // should never be reached

		const promise = apiFetch('/api/jobs', {});
		// No timer advance needed — non-TypeError errors bypass the retry
		await expect(promise).rejects.toThrow('Session expired');

		expect(mockRefresh).toHaveBeenCalledTimes(1);
	});
});
