import { expect, test } from '@playwright/test';

test.describe('Responsive layout (app shell)', () => {
	test.beforeEach(async ({ context }) => {
		await context.addCookies([
			{ name: 'mc_session', value: 'e2e-test-secret', url: 'http://localhost:4173' }
		]);
	});

	test.describe('desktop 1280×800', () => {
		test.beforeEach(async ({ page }) => {
			await page.setViewportSize({ width: 1280, height: 800 });
			await page.goto('/performance');
		});

		test('desktop sidebar is visible', async ({ page }) => {
			// Desktop aside has class "hidden lg:flex" — visible at 1280px
			await expect(page.locator('aside').first()).toBeVisible();
		});

		test('mobile top bar is hidden', async ({ page }) => {
			// Mobile header has class "lg:hidden" — hidden at 1280px
			await expect(page.locator('header.lg\\:hidden')).not.toBeVisible();
		});

		test('hamburger menu button is not visible', async ({ page }) => {
			await expect(page.getByRole('button', { name: 'Menu' })).not.toBeVisible();
		});
	});

	test.describe('mobile 375×812', () => {
		test.beforeEach(async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 812 });
			await page.goto('/performance');
		});

		test('desktop sidebar is hidden', async ({ page }) => {
			// Desktop aside has class "hidden lg:flex" — hidden (display:none) at 375px
			await expect(page.locator('aside').first()).not.toBeVisible();
		});

		test('mobile top bar is visible', async ({ page }) => {
			// Mobile header "lg:hidden" — visible (no display:none) at 375px
			await expect(page.locator('header.lg\\:hidden')).toBeVisible();
		});

		test('hamburger menu button is visible', async ({ page }) => {
			await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();
		});

		test('tapping hamburger opens the mobile drawer with nav links', async ({ page }) => {
			const drawerAside = page.locator('aside').last();
			// Drawer starts off-screen
			await expect(drawerAside).toHaveClass(/-translate-x-full/);

			// Open drawer
			await page.getByRole('button', { name: 'Menu' }).click();

			// Drawer slides in
			await expect(drawerAside).toHaveClass(/translate-x-0/);

			// Nav links present in drawer
			await expect(drawerAside.locator('a').filter({ hasText: 'Availability' })).toBeVisible();
			await expect(drawerAside.locator('a').filter({ hasText: 'Performance' })).toBeVisible();
		});

		test('MobileBottomNav is visible', async ({ page }) => {
			// MobileBottomNav: nav element with "bottom-0" in class, visible at mobile
			await expect(page.locator('nav[class*="bottom-0"]')).toBeVisible();
		});
	});
});
