import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.addInitScript(() => {
		localStorage.setItem('PARAGLIDE_LOCALE', 'en');
	});
});

test.describe('404 / error page', () => {
	test('has correct title for unknown route', async ({ page }) => {
		await page.goto('/this-page-does-not-exist');
		await expect(page).toHaveTitle('Page Not Found | MetaCleaner');
	});

	test('shows 404 badge', async ({ page }) => {
		await page.goto('/this-page-does-not-exist');
		await expect(page.getByText('Error 404 — Page Not Found', { exact: true })).toBeVisible();
	});

	test('shows h1 "This page doesn\'t exist"', async ({ page }) => {
		await page.goto('/this-page-does-not-exist');
		await expect(
			page.getByRole('heading', { level: 1, name: "This page doesn't exist", exact: true })
		).toBeVisible();
	});

	test('shows the 404 number', async ({ page }) => {
		await page.goto('/this-page-does-not-exist');
		await expect(page.locator('p.four-zero-four')).toBeVisible();
	});

	test('shows Quick Links: Try Free, Features, Pricing, FAQ', async ({ page }) => {
		await page.goto('/this-page-does-not-exist');
		await expect(page.getByText('Quick links', { exact: true })).toBeVisible();
		const quickLinks = page.getByText('Quick links', { exact: true }).locator('xpath=..');
		await expect(quickLinks.locator('a').filter({ hasText: 'Try Free' })).toBeVisible();
		await expect(quickLinks.locator('a').filter({ hasText: 'Features' })).toBeVisible();
		await expect(quickLinks.locator('a').filter({ hasText: 'Pricing' })).toBeVisible();
		await expect(quickLinks.locator('a').filter({ hasText: 'FAQ' })).toBeVisible();
	});

	test('Features quick link navigates to /features', async ({ page }) => {
		await page.goto('/this-page-does-not-exist');
		await page.getByRole('link', { name: 'Features', exact: true }).first().click();
		await page.waitForURL(/\/features$/);
		await expect(page.locator('#features-header')).toBeVisible();
	});
});
