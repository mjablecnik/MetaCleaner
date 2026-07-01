import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.addInitScript(() => {
		localStorage.setItem('PARAGLIDE_LOCALE', 'en');
	});
});

test.describe('Privacy Policy page', () => {
	test('has correct title', async ({ page }) => {
		await page.goto('/privacy');
		await expect(page).toHaveTitle('Privacy Policy | MetaCleaner');
	});

	test('renders h1 "Privacy Policy"', async ({ page }) => {
		await page.goto('/privacy');
		await expect(
			page.getByRole('heading', { level: 1, name: 'Privacy Policy', exact: true })
		).toBeVisible();
	});

	test('renders 5 section h2 headings', async ({ page }) => {
		await page.goto('/privacy');
		await expect(page.getByRole('heading', { level: 2 })).toHaveCount(5);
	});
});
