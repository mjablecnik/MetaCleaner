import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.addInitScript(() => {
		localStorage.setItem('PARAGLIDE_LOCALE', 'en');
	});
});

test.describe('Terms of Use page', () => {
	test('has correct title', async ({ page }) => {
		await page.goto('/terms');
		await expect(page).toHaveTitle('Terms of Use | MetaCleaner');
	});

	test('renders h1 "Terms of Use"', async ({ page }) => {
		await page.goto('/terms');
		await expect(page.getByRole('heading', { level: 1, name: 'Terms of Use', exact: true })).toBeVisible();
	});

	test('renders 5 section h2 headings', async ({ page }) => {
		await page.goto('/terms');
		await expect(page.getByRole('heading', { level: 2 })).toHaveCount(5);
	});
});
