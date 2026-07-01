import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockGuardProtectedRoute, mockGuardAuthRoute } = vi.hoisted(() => ({
	mockGuardProtectedRoute: vi.fn<() => Promise<void>>(),
	mockGuardAuthRoute: vi.fn<() => Promise<void>>()
}));

vi.mock('$lib/auth/auth-guard.js', () => ({
	guardProtectedRoute: mockGuardProtectedRoute,
	guardAuthRoute: mockGuardAuthRoute
}));

import { load as settingsLoad } from '../settings/+layout.js';
import { load as docsLoad } from '../docs/+layout.js';
import { load as reportLoad } from '../report/+layout.js';
import { load as reportsLoad } from '../reports/+layout.js';
import { load as authLoad } from '../(auth)/+layout.js';

// ─── Layout guard delegation tests ────────────────────────────────────────────

describe('settings +layout load()', () => {
	beforeEach(() => {
		mockGuardProtectedRoute.mockResolvedValue(undefined);
		mockGuardProtectedRoute.mockClear();
	});

	it('delegates to guardProtectedRoute', async () => {
		await settingsLoad({} as Parameters<typeof settingsLoad>[0]);
		expect(mockGuardProtectedRoute).toHaveBeenCalledTimes(1);
	});

	it('calls guardProtectedRoute with no returnTo argument', async () => {
		await settingsLoad({} as Parameters<typeof settingsLoad>[0]);
		expect(mockGuardProtectedRoute).toHaveBeenCalledWith();
	});
});

describe('docs +layout load()', () => {
	beforeEach(() => {
		mockGuardProtectedRoute.mockResolvedValue(undefined);
		mockGuardProtectedRoute.mockClear();
	});

	it('delegates to guardProtectedRoute', async () => {
		await docsLoad({} as Parameters<typeof docsLoad>[0]);
		expect(mockGuardProtectedRoute).toHaveBeenCalledTimes(1);
	});

	it('passes "/docs" as the returnTo argument', async () => {
		await docsLoad({} as Parameters<typeof docsLoad>[0]);
		expect(mockGuardProtectedRoute).toHaveBeenCalledWith('/docs');
	});
});

describe('report +layout load()', () => {
	beforeEach(() => {
		mockGuardProtectedRoute.mockResolvedValue(undefined);
		mockGuardProtectedRoute.mockClear();
	});

	it('delegates to guardProtectedRoute', async () => {
		await reportLoad({} as Parameters<typeof reportLoad>[0]);
		expect(mockGuardProtectedRoute).toHaveBeenCalledTimes(1);
	});

	it('calls guardProtectedRoute with no returnTo argument', async () => {
		await reportLoad({} as Parameters<typeof reportLoad>[0]);
		expect(mockGuardProtectedRoute).toHaveBeenCalledWith();
	});
});

describe('reports +layout load()', () => {
	beforeEach(() => {
		mockGuardProtectedRoute.mockResolvedValue(undefined);
		mockGuardProtectedRoute.mockClear();
	});

	it('delegates to guardProtectedRoute', async () => {
		await reportsLoad({} as Parameters<typeof reportsLoad>[0]);
		expect(mockGuardProtectedRoute).toHaveBeenCalledTimes(1);
	});

	it('calls guardProtectedRoute with no returnTo argument', async () => {
		await reportsLoad({} as Parameters<typeof reportsLoad>[0]);
		expect(mockGuardProtectedRoute).toHaveBeenCalledWith();
	});
});

describe('(auth) +layout load()', () => {
	beforeEach(() => {
		mockGuardAuthRoute.mockResolvedValue(undefined);
		mockGuardAuthRoute.mockClear();
		mockGuardProtectedRoute.mockClear();
	});

	it('delegates to guardAuthRoute', async () => {
		await authLoad({} as Parameters<typeof authLoad>[0]);
		expect(mockGuardAuthRoute).toHaveBeenCalledTimes(1);
	});

	it('does not call guardProtectedRoute', async () => {
		await authLoad({} as Parameters<typeof authLoad>[0]);
		expect(mockGuardProtectedRoute).not.toHaveBeenCalled();
	});
});
