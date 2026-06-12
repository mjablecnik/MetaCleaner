import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockRedirect, mockResolve, authState } = vi.hoisted(() => ({
	mockRedirect: vi.fn(),
	mockResolve: vi.fn((path: string) => path),
	authState: { isAuthenticated: false }
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
		}
	}
}));

import { guardProtectedRoute, guardAuthRoute } from '../auth-guard.js';

// ─── guardProtectedRoute ───────────────────────────────────────────────────────

describe('guardProtectedRoute', () => {
	beforeEach(() => {
		authState.isAuthenticated = false;
		mockRedirect.mockClear();
		mockResolve.mockClear();
	});

	it('calls redirect(302) to /login when user is not authenticated', () => {
		guardProtectedRoute();
		expect(mockRedirect).toHaveBeenCalledWith(302, '/login');
	});

	it('resolves /login path through resolve() before redirecting', () => {
		guardProtectedRoute();
		expect(mockResolve).toHaveBeenCalledWith('/login');
	});

	it('does not redirect when user is authenticated', () => {
		authState.isAuthenticated = true;
		guardProtectedRoute();
		expect(mockRedirect).not.toHaveBeenCalled();
	});
});

// ─── guardAuthRoute ────────────────────────────────────────────────────────────

describe('guardAuthRoute', () => {
	beforeEach(() => {
		authState.isAuthenticated = true;
		mockRedirect.mockClear();
		mockResolve.mockClear();
	});

	it('calls redirect(302) to / when user is already authenticated', () => {
		guardAuthRoute();
		expect(mockRedirect).toHaveBeenCalledWith(302, '/');
	});

	it('resolves / path through resolve() before redirecting', () => {
		guardAuthRoute();
		expect(mockResolve).toHaveBeenCalledWith('/');
	});

	it('does not redirect when user is not authenticated', () => {
		authState.isAuthenticated = false;
		guardAuthRoute();
		expect(mockRedirect).not.toHaveBeenCalled();
	});
});
