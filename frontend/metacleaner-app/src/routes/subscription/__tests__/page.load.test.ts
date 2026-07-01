import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockGuardProtectedRoute } = vi.hoisted(() => ({
	mockGuardProtectedRoute: vi.fn<() => Promise<void>>()
}));

vi.mock('$lib/auth/auth-guard.js', () => ({
	guardProtectedRoute: mockGuardProtectedRoute
}));

import { load } from '../+page.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeEvent(search: string) {
	return { url: new URL(`http://x/subscription${search}`) } as Parameters<typeof load>[0];
}

// ─── load() ───────────────────────────────────────────────────────────────────

describe('subscription +page load()', () => {
	beforeEach(() => {
		mockGuardProtectedRoute.mockResolvedValue(undefined);
		mockGuardProtectedRoute.mockClear();
	});

	describe('plan present', () => {
		it('returns the plan and billing from search params', async () => {
			const result = await load(makeEvent('?plan=pro&billing=yearly'));
			expect(result.plan).toBe('pro');
			expect(result.billing).toBe('yearly');
		});

		it('calls guardProtectedRoute with encoded returnTo including plan and billing', async () => {
			await load(makeEvent('?plan=pro&billing=yearly'));
			expect(mockGuardProtectedRoute).toHaveBeenCalledWith(
				`/subscription?plan=${encodeURIComponent('pro')}&billing=${encodeURIComponent('yearly')}`
			);
		});

		it('defaults billing to "monthly" when billing param is absent', async () => {
			const result = await load(makeEvent('?plan=pro'));
			expect(result.billing).toBe('monthly');
			expect(mockGuardProtectedRoute).toHaveBeenCalledWith(
				`/subscription?plan=${encodeURIComponent('pro')}&billing=${encodeURIComponent('monthly')}`
			);
		});

		it('URL-encodes special characters in plan and billing', async () => {
			const plan = 'pro+ultra/max&v=1';
			const billing = 'monthly?foo=bar';
			const result = await load(makeEvent(`?plan=${encodeURIComponent(plan)}&billing=${encodeURIComponent(billing)}`));
			expect(result.plan).toBe(plan);
			expect(result.billing).toBe(billing);
			expect(mockGuardProtectedRoute).toHaveBeenCalledWith(
				`/subscription?plan=${encodeURIComponent(plan)}&billing=${encodeURIComponent(billing)}`
			);
		});

		it('calls guardProtectedRoute exactly once', async () => {
			await load(makeEvent('?plan=pro&billing=monthly'));
			expect(mockGuardProtectedRoute).toHaveBeenCalledTimes(1);
		});
	});

	describe('plan absent', () => {
		it('returns plan as null', async () => {
			const result = await load(makeEvent(''));
			expect(result.plan).toBeNull();
		});

		it('defaults billing to "monthly"', async () => {
			const result = await load(makeEvent(''));
			expect(result.billing).toBe('monthly');
		});

		it('calls guardProtectedRoute with returnTo="/subscription" (no query)', async () => {
			await load(makeEvent(''));
			expect(mockGuardProtectedRoute).toHaveBeenCalledWith('/subscription');
		});

		it('passes through "yearly" billing even when plan is absent', async () => {
			const result = await load(makeEvent('?billing=yearly'));
			expect(result.plan).toBeNull();
			expect(result.billing).toBe('yearly');
			expect(mockGuardProtectedRoute).toHaveBeenCalledWith('/subscription');
		});
	});
});
