import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockRedirect, mockResolve, authState } = vi.hoisted(() => ({
	mockRedirect: vi.fn(),
	mockResolve: vi.fn((path: string) => path),
	authState: { isAuthenticated: false, isAuthReady: true }
}));

vi.mock('@sveltejs/kit', () => ({ redirect: mockRedirect }));
vi.mock('$app/environment', () => ({ browser: true }));
vi.mock('$app/paths', () => ({ resolve: mockResolve }));

// Path matches the exact import in auth-guard.ts: './auth.svelte.js'
// Resolved via $lib alias to '$lib/auth/auth.svelte.js'
vi.mock('$lib/auth/auth.svelte.js', () => ({
	authStore: {
		get isAuthenticated() {
			return authState.isAuthenticated;
		},
		get isAuthReady() {
			return authState.isAuthReady;
		}
	}
}));

import { guardProtectedRoute, guardAuthRoute } from '../auth-guard.js';

// ─── guardProtectedRoute ───────────────────────────────────────────────────────

describe('guardProtectedRoute', () => {
	beforeEach(() => {
		authState.isAuthenticated = false;
		authState.isAuthReady = true;
		mockRedirect.mockClear();
		mockResolve.mockClear();
	});

	it('calls redirect(302) to /login when user is not authenticated', async () => {
		await guardProtectedRoute();
		expect(mockRedirect).toHaveBeenCalledWith(302, '/login');
	});

	it('resolves /login path through resolve() before redirecting', async () => {
		await guardProtectedRoute();
		expect(mockResolve).toHaveBeenCalledWith('/login');
	});

	it('does not redirect when user is authenticated', async () => {
		authState.isAuthenticated = true;
		await guardProtectedRoute();
		expect(mockRedirect).not.toHaveBeenCalled();
	});
});

// ─── guardAuthRoute ────────────────────────────────────────────────────────────

describe('guardAuthRoute', () => {
	beforeEach(() => {
		authState.isAuthenticated = true;
		authState.isAuthReady = true;
		mockRedirect.mockClear();
		mockResolve.mockClear();
	});

	it('calls redirect(302) to / when user is already authenticated', async () => {
		await guardAuthRoute();
		expect(mockRedirect).toHaveBeenCalledWith(302, '/');
	});

	it('resolves / path through resolve() before redirecting', async () => {
		await guardAuthRoute();
		expect(mockResolve).toHaveBeenCalledWith('/');
	});

	it('does not redirect when user is not authenticated', async () => {
		authState.isAuthenticated = false;
		await guardAuthRoute();
		expect(mockRedirect).not.toHaveBeenCalled();
	});
});
