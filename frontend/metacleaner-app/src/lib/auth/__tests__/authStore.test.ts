import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoist mock functions so vi.mock factories can reference them
const { mockGoto, mockResolve, mockBuildApiUrl } = vi.hoisted(() => ({
	mockGoto: vi.fn().mockResolvedValue(undefined),
	mockResolve: vi.fn((path: string) => path),
	mockBuildApiUrl: vi.fn((path: string) => `http://localhost:8080${path}`)
}));

vi.mock('$app/environment', () => ({ browser: true }));
vi.mock('$app/navigation', () => ({ goto: mockGoto }));
vi.mock('$app/paths', () => ({ resolve: mockResolve }));
vi.mock('$lib/clients/api-config.js', () => ({ buildApiUrl: mockBuildApiUrl }));

const TOKEN_KEY = 'mc_access_token';
const REFRESH_KEY = 'mc_refresh_token';
const EXPIRES_KEY = 'mc_token_expires_at';

function makeMockStorage() {
	const store: Record<string, string> = {};
	return {
		getItem: (key: string): string | null => store[key] ?? null,
		setItem: (key: string, val: string) => {
			store[key] = val;
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			for (const k of Object.keys(store)) delete store[k];
		}
	};
}

type MockStorage = ReturnType<typeof makeMockStorage>;

async function importFresh() {
	return import('../auth.svelte.js');
}

// ─── Token storage and retrieval ──────────────────────────────────────────────

describe('authStore — token storage and retrieval', () => {
	let mockStorage: MockStorage;

	beforeEach(() => {
		vi.resetModules();
		mockStorage = makeMockStorage();
		vi.stubGlobal('localStorage', mockStorage);
		vi.stubGlobal('fetch', vi.fn());
		mockGoto.mockClear();
	});

	it('starts unauthenticated with empty storage', async () => {
		const { authStore } = await importFresh();
		expect(authStore.isAuthenticated).toBe(false);
		expect(authStore.accessToken).toBeNull();
		expect(authStore.refreshToken).toBeNull();
		expect(authStore.user).toBeNull();
	});

	it('restores session via silent refresh on module init when refresh token exists', async () => {
		// Access token is no longer stored in localStorage — only the refresh token persists.
		// _restore() always calls refresh() to get a new in-memory access token.
		mockStorage.setItem(REFRESH_KEY, 'stored-refresh');
		mockStorage.setItem(EXPIRES_KEY, String(Date.now() + 3_600_000));

		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValueOnce(
				new Response(
					JSON.stringify({
						access_token: 'refreshed-access',
						refresh_token: 'stored-refresh',
						expires_in: 3600
					}),
					{ status: 200 }
				)
			)
		);

		const { authStore } = await importFresh();
		await vi.waitFor(() => expect(authStore.isAuthReady).toBe(true));
		expect(authStore.isAuthenticated).toBe(true);
		expect(authStore.accessToken).toBe('refreshed-access');
		expect(authStore.refreshToken).toBe('stored-refresh');
	});

	it('does not restore expired tokens on init', async () => {
		mockStorage.setItem(TOKEN_KEY, 'expired-access');
		mockStorage.setItem(REFRESH_KEY, 'expired-refresh');
		mockStorage.setItem(EXPIRES_KEY, String(Date.now() - 1));

		const { authStore } = await importFresh();
		expect(authStore.isAuthenticated).toBe(false);
		expect(authStore.accessToken).toBeNull();
	});

	it('clears localStorage when expired tokens are found on init', async () => {
		mockStorage.setItem(TOKEN_KEY, 'expired-access');
		mockStorage.setItem(REFRESH_KEY, 'expired-refresh');
		mockStorage.setItem(EXPIRES_KEY, String(Date.now() - 1));

		await importFresh();
		// All stale tokens cleared from localStorage immediately even during async refresh
		expect(mockStorage.getItem(TOKEN_KEY)).toBeNull();
		expect(mockStorage.getItem(REFRESH_KEY)).toBeNull();
		expect(mockStorage.getItem(EXPIRES_KEY)).toBeNull();
	});

	it('isAuthReady is true synchronously when valid tokens exist', async () => {
		mockStorage.setItem(TOKEN_KEY, 'stored-access');
		mockStorage.setItem(REFRESH_KEY, 'stored-refresh');
		mockStorage.setItem(EXPIRES_KEY, String(Date.now() + 3_600_000));

		const { authStore } = await importFresh();
		expect(authStore.isAuthReady).toBe(true);
	});

	it('isAuthReady is true synchronously when no tokens exist', async () => {
		const { authStore } = await importFresh();
		expect(authStore.isAuthReady).toBe(true);
	});

	it('attempts refresh and sets isAuthReady after completion when access token expired with refresh token', async () => {
		mockStorage.setItem(TOKEN_KEY, 'expired-access');
		mockStorage.setItem(REFRESH_KEY, 'valid-refresh');
		mockStorage.setItem(EXPIRES_KEY, String(Date.now() - 1));

		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValueOnce(
				new Response(
					JSON.stringify({
						access_token: 'new-access',
						refresh_token: 'new-refresh',
						expires_in: 3600
					}),
					{ status: 200 }
				)
			)
		);

		const { authStore } = await importFresh();
		// Not yet ready — async refresh in progress
		// Wait for refresh to complete
		await vi.waitFor(() => expect(authStore.isAuthReady).toBe(true));
		expect(authStore.isAuthenticated).toBe(true);
		expect(authStore.accessToken).toBe('new-access');
	});

	it('clears auth and sets isAuthReady when refresh fails on init', async () => {
		mockStorage.setItem(TOKEN_KEY, 'expired-access');
		mockStorage.setItem(REFRESH_KEY, 'invalid-refresh');
		mockStorage.setItem(EXPIRES_KEY, String(Date.now() - 1));

		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValueOnce(
				new Response(JSON.stringify({ error: 'invalid_token', message: 'Token expired' }), {
					status: 401
				})
			)
		);

		const { authStore } = await importFresh();
		await vi.waitFor(() => expect(authStore.isAuthReady).toBe(true));
		expect(authStore.isAuthenticated).toBe(false);
		expect(authStore.accessToken).toBeNull();
	});

	it('setTokensFromCallback stores tokens in state (access in memory, refresh in localStorage)', async () => {
		const { authStore } = await importFresh();
		authStore.setTokensFromCallback('tok-access', 'tok-refresh', 3600);

		expect(authStore.isAuthenticated).toBe(true);
		expect(authStore.accessToken).toBe('tok-access');
		expect(authStore.refreshToken).toBe('tok-refresh');
		// Access token must NOT be stored in localStorage (XSS exfiltration risk)
		expect(mockStorage.getItem(TOKEN_KEY)).toBeNull();
		expect(mockStorage.getItem(REFRESH_KEY)).toBe('tok-refresh');
	});

	it('setTokensFromCallback with user sets user state', async () => {
		const { authStore } = await importFresh();
		const user = { id: 'u-1', email: 'test@example.com' };
		authStore.setTokensFromCallback('tok-access', 'tok-refresh', 3600, user);

		expect(authStore.user).toEqual(user);
	});

	it('setTokensFromCallback without user param leaves user as null', async () => {
		const { authStore } = await importFresh();
		authStore.setTokensFromCallback('tok-access', 'tok-refresh', 3600);

		expect(authStore.user).toBeNull();
	});

	it('expiresAt reflects the stored expiry timestamp within reasonable range', async () => {
		const { authStore } = await importFresh();
		const before = Date.now();
		authStore.setTokensFromCallback('tok-access', 'tok-refresh', 3600);
		const after = Date.now();

		const expiresAt = authStore.expiresAt;
		expect(expiresAt).toBeGreaterThanOrEqual(before + 3_600_000);
		expect(expiresAt).toBeLessThanOrEqual(after + 3_600_000);
	});
});

// ─── Login state transition ───────────────────────────────────────────────────

describe('authStore — login state transition', () => {
	let mockStorage: MockStorage;
	let mockFetch: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.resetModules();
		mockStorage = makeMockStorage();
		mockFetch = vi.fn();
		vi.stubGlobal('localStorage', mockStorage);
		vi.stubGlobal('fetch', mockFetch);
		mockGoto.mockClear();
	});

	it('login() posts credentials to /api/auth/login', async () => {
		mockFetch.mockResolvedValueOnce(
			new Response(
				JSON.stringify({ access_token: 'tok', refresh_token: 'ref', expires_in: 3600 }),
				{ status: 200 }
			)
		);

		const { authStore } = await importFresh();
		await authStore.login('user@example.com', 'pass123');

		expect(mockFetch).toHaveBeenCalledWith(
			'http://localhost:8080/api/auth/login',
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify({ email: 'user@example.com', password: 'pass123' })
			})
		);
	});

	it('login() sets isAuthenticated and persists tokens on success', async () => {
		mockFetch.mockResolvedValueOnce(
			new Response(
				JSON.stringify({
					access_token: 'access-123',
					refresh_token: 'refresh-456',
					expires_in: 3600,
					user: { id: 'u-1', email: 'user@example.com' }
				}),
				{ status: 200 }
			)
		);

		const { authStore } = await importFresh();
		await authStore.login('user@example.com', 'pass');

		expect(authStore.isAuthenticated).toBe(true);
		expect(authStore.accessToken).toBe('access-123');
		// Access token must NOT be in localStorage (XSS exfiltration risk); only refresh token persists
		expect(mockStorage.getItem(TOKEN_KEY)).toBeNull();
		expect(mockStorage.getItem(REFRESH_KEY)).toBe('refresh-456');
	});

	it('login() stores user data on success', async () => {
		const user = { id: 'u-42', email: 'user@example.com' };
		mockFetch.mockResolvedValueOnce(
			new Response(
				JSON.stringify({ access_token: 'tok', refresh_token: 'ref', expires_in: 3600, user }),
				{ status: 200 }
			)
		);

		const { authStore } = await importFresh();
		await authStore.login('user@example.com', 'pass');

		expect(authStore.user).toEqual(user);
	});

	it('login() redirects to / on success', async () => {
		mockFetch.mockResolvedValueOnce(
			new Response(
				JSON.stringify({ access_token: 'tok', refresh_token: 'ref', expires_in: 3600 }),
				{ status: 200 }
			)
		);

		const { authStore } = await importFresh();
		await authStore.login('user@example.com', 'pass');

		expect(mockGoto).toHaveBeenCalledWith('/');
	});

	it('login() resets isLoading to false after success', async () => {
		mockFetch.mockResolvedValueOnce(
			new Response(
				JSON.stringify({ access_token: 'tok', refresh_token: 'ref', expires_in: 3600 }),
				{ status: 200 }
			)
		);

		const { authStore } = await importFresh();
		await authStore.login('user@example.com', 'pass');

		expect(authStore.isLoading).toBe(false);
	});

	it('login() throws on 401 and leaves state unauthenticated', async () => {
		mockFetch.mockResolvedValueOnce(
			new Response(
				JSON.stringify({ error: 'invalid_credentials', message: 'Invalid email or password' }),
				{ status: 401 }
			)
		);

		const { authStore } = await importFresh();
		await expect(authStore.login('user@example.com', 'wrong')).rejects.toThrow(
			'Invalid email or password'
		);
		expect(authStore.isAuthenticated).toBe(false);
		expect(authStore.isLoading).toBe(false);
	});
});

// ─── Logout state transition ──────────────────────────────────────────────────

describe('authStore — logout state transition', () => {
	let mockStorage: MockStorage;
	let mockFetch: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.resetModules();
		mockStorage = makeMockStorage();
		mockFetch = vi.fn();
		vi.stubGlobal('localStorage', mockStorage);
		vi.stubGlobal('fetch', mockFetch);
		mockGoto.mockClear();
	});

	async function setupAuthenticated() {
		const { authStore } = await importFresh();
		authStore.setTokensFromCallback('access-tok', 'refresh-tok', 3600);
		return { authStore };
	}

	it('logout() clears access token from state and localStorage', async () => {
		const { authStore } = await setupAuthenticated();
		mockFetch.mockResolvedValueOnce(new Response('{}', { status: 200 }));

		await authStore.logout();

		expect(authStore.isAuthenticated).toBe(false);
		expect(authStore.accessToken).toBeNull();
		expect(mockStorage.getItem(TOKEN_KEY)).toBeNull();
	});

	it('logout() clears refresh token from state and localStorage', async () => {
		const { authStore } = await setupAuthenticated();
		mockFetch.mockResolvedValueOnce(new Response('{}', { status: 200 }));

		await authStore.logout();

		expect(authStore.refreshToken).toBeNull();
		expect(mockStorage.getItem(REFRESH_KEY)).toBeNull();
	});

	it('logout() redirects to /login', async () => {
		const { authStore } = await setupAuthenticated();
		mockFetch.mockResolvedValueOnce(new Response('{}', { status: 200 }));

		await authStore.logout();

		expect(mockGoto).toHaveBeenCalledWith('/login');
	});

	it('logout() clears tokens even when server call fails (network error)', async () => {
		const { authStore } = await setupAuthenticated();
		mockFetch.mockRejectedValueOnce(new Error('Network error'));

		await authStore.logout();

		expect(authStore.isAuthenticated).toBe(false);
		expect(mockStorage.getItem(TOKEN_KEY)).toBeNull();
	});

	it('logout() clears tokens even when server returns error status', async () => {
		const { authStore } = await setupAuthenticated();
		mockFetch.mockResolvedValueOnce(
			new Response(JSON.stringify({ error: 'server_error', message: 'Internal error' }), {
				status: 500
			})
		);

		await authStore.logout();

		expect(authStore.isAuthenticated).toBe(false);
		expect(mockStorage.getItem(TOKEN_KEY)).toBeNull();
	});

	it('logout() resets isLoading to false after completion', async () => {
		const { authStore } = await setupAuthenticated();
		mockFetch.mockResolvedValueOnce(new Response('{}', { status: 200 }));

		await authStore.logout();

		expect(authStore.isLoading).toBe(false);
	});
});

// ─── Refresh state transition ─────────────────────────────────────────────────

describe('authStore — refresh state transition', () => {
	let mockStorage: MockStorage;
	let mockFetch: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.resetModules();
		mockStorage = makeMockStorage();
		mockFetch = vi.fn();
		vi.stubGlobal('localStorage', mockStorage);
		vi.stubGlobal('fetch', mockFetch);
		mockGoto.mockClear();
	});

	it('refresh() exchanges refresh token for new tokens', async () => {
		const { authStore } = await importFresh();
		authStore.setTokensFromCallback('old-access', 'old-refresh', 3600);

		mockFetch.mockResolvedValueOnce(
			new Response(
				JSON.stringify({
					access_token: 'new-access',
					refresh_token: 'new-refresh',
					expires_in: 7200
				}),
				{ status: 200 }
			)
		);

		await authStore.refresh();

		expect(authStore.accessToken).toBe('new-access');
		expect(authStore.refreshToken).toBe('new-refresh');
		// Access token must NOT be in localStorage; only refresh token persists
		expect(mockStorage.getItem(TOKEN_KEY)).toBeNull();
		expect(mockStorage.getItem(REFRESH_KEY)).toBe('new-refresh');
	});

	it('refresh() sends current refresh_token in request body', async () => {
		const { authStore } = await importFresh();
		authStore.setTokensFromCallback('old-access', 'my-refresh-token', 3600);

		mockFetch.mockResolvedValueOnce(
			new Response(
				JSON.stringify({ access_token: 'new', refresh_token: 'new-ref', expires_in: 3600 }),
				{ status: 200 }
			)
		);

		await authStore.refresh();

		expect(mockFetch).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({ body: JSON.stringify({ refresh_token: 'my-refresh-token' }) })
		);
	});

	it('refresh() uses in-memory refresh token to exchange for new tokens', async () => {
		// Import with empty storage so _restore() returns synchronously without a network call.
		const { authStore } = await importFresh();
		// Establish auth state in memory (access token in-memory, refresh token in localStorage)
		authStore.setTokensFromCallback('old-access', 'old-refresh', 3600);

		mockFetch.mockResolvedValueOnce(
			new Response(
				JSON.stringify({ access_token: 'new-access', refresh_token: 'new-ref', expires_in: 3600 }),
				{ status: 200 }
			)
		);

		await authStore.refresh();

		expect(authStore.accessToken).toBe('new-access');
		expect(authStore.refreshToken).toBe('new-ref');
		// Access token must NOT be stored in localStorage
		expect(mockStorage.getItem(TOKEN_KEY)).toBeNull();
		expect(mockStorage.getItem(REFRESH_KEY)).toBe('new-ref');
	});

	it('refresh() throws when no refresh token exists anywhere', async () => {
		const { authStore } = await importFresh(); // empty storage, no tokens

		await expect(authStore.refresh()).rejects.toThrow('No refresh token');
	});

	it('refresh() updates user data when returned by API', async () => {
		const { authStore } = await importFresh();
		authStore.setTokensFromCallback('old-access', 'old-refresh', 3600);

		const updatedUser = { id: 'u-1', email: 'updated@example.com' };
		mockFetch.mockResolvedValueOnce(
			new Response(
				JSON.stringify({
					access_token: 'new',
					refresh_token: 'new-ref',
					expires_in: 3600,
					user: updatedUser
				}),
				{ status: 200 }
			)
		);

		await authStore.refresh();

		expect(authStore.user).toEqual(updatedUser);
	});
});

// ─── Register ────────────────────────────────────────────────────────────────

describe('authStore — register', () => {
	let mockFetch: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.resetModules();
		vi.stubGlobal('localStorage', makeMockStorage());
		mockFetch = vi.fn();
		vi.stubGlobal('fetch', mockFetch);
		mockGoto.mockClear();
	});

	it('register() posts all required fields to /api/auth/register', async () => {
		mockFetch.mockResolvedValueOnce(new Response('{}', { status: 201 }));

		const { authStore } = await importFresh();
		await authStore.register('user@example.com', 'Password1!', 'John', 'Doe');

		expect(mockFetch).toHaveBeenCalledWith(
			'http://localhost:8080/api/auth/register',
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify({
					email: 'user@example.com',
					password: 'Password1!',
					first_name: 'John',
					last_name: 'Doe'
				})
			})
		);
	});

	it('register() does not authenticate or redirect on success (email confirmation flow)', async () => {
		mockFetch.mockResolvedValueOnce(new Response('{}', { status: 201 }));

		const { authStore } = await importFresh();
		await authStore.register('user@example.com', 'Password1!', 'Jane', 'Doe');

		expect(authStore.isAuthenticated).toBe(false);
		expect(mockGoto).not.toHaveBeenCalled();
	});

	it('register() resets isLoading to false after success', async () => {
		mockFetch.mockResolvedValueOnce(new Response('{}', { status: 201 }));

		const { authStore } = await importFresh();
		await authStore.register('user@example.com', 'Password1!', 'Jane', 'Doe');

		expect(authStore.isLoading).toBe(false);
	});

	it('register() throws on 409 conflict and resets isLoading', async () => {
		mockFetch.mockResolvedValueOnce(
			new Response(JSON.stringify({ error: 'email_exists', message: 'Email already registered' }), {
				status: 409
			})
		);

		const { authStore } = await importFresh();
		await expect(authStore.register('existing@example.com', 'pass', 'Jane', 'Doe')).rejects.toThrow(
			'Email already registered'
		);
		expect(authStore.isLoading).toBe(false);
	});
});
