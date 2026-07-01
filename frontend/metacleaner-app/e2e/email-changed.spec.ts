import { test, expect } from 'playwright/test';
import { injectAuth } from './helpers/auth.js';

// ─── Success state (no error param) ────────────────────────────────────────────

test.describe('Email Changed — success state (logged out)', () => {
	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('shows brand name in navbar', async ({ page }) => {
			await page.goto('/email-changed');
			await expect(page.getByText('MetaCleaner').first()).toBeVisible();
		});

		test('shows sign in link in navbar when logged out', async ({ page }) => {
			await page.goto('/email-changed');
			// Navbar sign-in link has a Font Awesome icon — use filter
			await expect(page.locator('a').filter({ hasText: 'Sign in' }).first()).toBeVisible();
		});

		test('shows success title on desktop', async ({ page }) => {
			await page.goto('/email-changed');
			await expect(page.getByText('Email changed successfully!').first()).toBeVisible();
		});

		test('shows success description on desktop', async ({ page }) => {
			await page.goto('/email-changed');
			await expect(page.getByText('Your email address has been updated').first()).toBeVisible();
		});

		test('shows desktop headline on desktop', async ({ page }) => {
			await page.goto('/email-changed');
			const desktopCol = page.locator('.fade-in');
			await expect(desktopCol).toBeVisible();
		});

		test('shows sign in CTA link when logged out', async ({ page }) => {
			await page.goto('/email-changed');
			// Should show "Sign in" CTA (not settings/home, since not logged in)
			await expect(page.locator('a').filter({ hasText: 'Sign in' }).first()).toBeVisible();
		});

		test('sign in link points to /login', async ({ page }) => {
			await page.goto('/email-changed');
			const signInLink = page.locator('a').filter({ hasText: 'Sign in' }).first();
			const href = await signInLink.getAttribute('href');
			expect(href).toContain('login');
		});

		test('mobile layout is hidden on desktop', async ({ page }) => {
			await page.goto('/email-changed');
			const mobileLayout = page.locator('.flex.flex-col.items-center.lg\\:hidden');
			await expect(mobileLayout).not.toBeVisible();
		});

		test('desktop layout is visible on desktop', async ({ page }) => {
			await page.goto('/email-changed');
			const desktopLayout = page.locator('.hidden.w-full.items-center.gap-8.lg\\:grid');
			await expect(desktopLayout).toBeVisible();
		});
	});

	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('shows success title on mobile', async ({ page }) => {
			await page.goto('/email-changed');
			// h1 inside mobile layout
			await expect(page.locator('.flex.flex-col.items-center.lg\\:hidden h1')).toBeVisible();
		});

		test('shows sign in CTA link on mobile when logged out', async ({ page }) => {
			await page.goto('/email-changed');
			const mobileSection = page.locator('.flex.flex-col.items-center.lg\\:hidden');
			await expect(mobileSection.locator('a').filter({ hasText: 'Sign in' })).toBeVisible();
		});

		test('desktop layout is hidden on mobile', async ({ page }) => {
			await page.goto('/email-changed');
			const desktopLayout = page.locator('.hidden.w-full.items-center.gap-8.lg\\:grid');
			await expect(desktopLayout).not.toBeVisible();
		});

		test('mobile layout is visible on mobile', async ({ page }) => {
			await page.goto('/email-changed');
			const mobileLayout = page.locator('.flex.flex-col.items-center.lg\\:hidden');
			await expect(mobileLayout).toBeVisible();
		});
	});
});

// ─── Success state (logged in) ──────────────────────────────────────────────────

test.describe('Email Changed — success state (logged in)', () => {
	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test.beforeEach(async ({ page }) => {
			await injectAuth(page);
		});

		test('shows Go to settings link when logged in', async ({ page }) => {
			await page.goto('/email-changed');
			// Font Awesome icon in link — use filter
			await expect(page.locator('a').filter({ hasText: 'Go to settings' }).first()).toBeVisible();
		});

		test('Go to settings link points to /settings', async ({ page }) => {
			await page.goto('/email-changed');
			const settingsLink = page.locator('a').filter({ hasText: 'Go to settings' }).first();
			const href = await settingsLink.getAttribute('href');
			expect(href).toContain('settings');
		});

		test('shows Go to home button when logged in', async ({ page }) => {
			await page.goto('/email-changed');
			// Font Awesome icon in button — use filter
			await expect(page.locator('button').filter({ hasText: 'Go to home' }).first()).toBeVisible();
		});

		test('does not show sign in link in navbar when logged in', async ({ page }) => {
			await page.goto('/email-changed');
			// Navbar sign-in link is conditional on !isLoggedIn
			await expect(page.locator('nav a').filter({ hasText: 'Sign in' })).toHaveCount(0);
		});
	});

	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test.beforeEach(async ({ page }) => {
			await injectAuth(page);
		});

		test('shows Go to home button on mobile when logged in', async ({ page }) => {
			await page.goto('/email-changed');
			const mobileSection = page.locator('.flex.flex-col.items-center.lg\\:hidden');
			await expect(mobileSection.locator('button').filter({ hasText: 'Go to home' })).toBeVisible();
		});

		test('shows Go to settings link on mobile when logged in', async ({ page }) => {
			await page.goto('/email-changed');
			const mobileSection = page.locator('.flex.flex-col.items-center.lg\\:hidden');
			await expect(mobileSection.locator('a').filter({ hasText: 'Go to settings' })).toBeVisible();
		});
	});
});

// ─── Error state ────────────────────────────────────────────────────────────────

test.describe('Email Changed — error state', () => {
	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('shows error title with ?error=invalid_or_expired_token', async ({ page }) => {
			await page.goto('/email-changed?error=invalid_or_expired_token');
			await expect(page.getByText('Email change failed').first()).toBeVisible();
		});

		test('shows expired error message', async ({ page }) => {
			await page.goto('/email-changed?error=invalid_or_expired_token');
			await expect(
				page.getByText('The verification link has expired or is invalid').first()
			).toBeVisible();
		});

		test('shows error title with ?error=missing_token', async ({ page }) => {
			await page.goto('/email-changed?error=missing_token');
			await expect(page.getByText('Email change failed').first()).toBeVisible();
		});

		test('shows generic error message with unknown error param', async ({ page }) => {
			await page.goto('/email-changed?error=unknown_error');
			await expect(
				page.getByText('An error occurred while changing your email').first()
			).toBeVisible();
		});

		test('shows sign in link on error page when logged out', async ({ page }) => {
			await page.goto('/email-changed?error=invalid_or_expired_token');
			await expect(page.locator('a').filter({ hasText: 'Sign in' }).first()).toBeVisible();
		});
	});

	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('shows error title on mobile', async ({ page }) => {
			await page.goto('/email-changed?error=invalid_or_expired_token');
			const mobileSection = page.locator('.flex.flex-col.items-center.lg\\:hidden');
			await expect(mobileSection.locator('h1')).toBeVisible();
		});

		test('shows expired error message on mobile', async ({ page }) => {
			await page.goto('/email-changed?error=invalid_or_expired_token');
			await expect(
				page.getByText('The verification link has expired or is invalid').first()
			).toBeVisible();
		});
	});
});
