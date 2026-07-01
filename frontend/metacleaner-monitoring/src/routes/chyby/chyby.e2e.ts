import { expect, test } from '@playwright/test';

test.describe('/chyby (Errors & Crashes)', () => {
	test.beforeEach(async ({ context }) => {
		await context.addCookies([
			{ name: 'mc_session', value: 'e2e-test-secret', url: 'http://localhost:4173' }
		]);
	});

	test('stays on /chyby and does not redirect to /login', async ({ page }) => {
		await page.goto('/chyby');
		await expect(page).toHaveURL('/chyby');
	});

	test('renders page heading "Errors & Crashes"', async ({ page }) => {
		await page.goto('/chyby');
		await expect(page.locator('h1').first()).toHaveText('Errors & Crashes');
	});

	test('sidebar contains all 9 navigation links', async ({ page }) => {
		await page.goto('/chyby');
		const navLabels = [
			'Dashboard',
			'Availability',
			'Errors & Crashes',
			'Database (Supabase)',
			'Runtime (Fly.io)',
			'Edge (Cloudflare)',
			'Performance',
			'Business Metrics',
			'Users'
		];
		for (const label of navLabels) {
			await expect(page.locator('a').filter({ hasText: label }).first()).toBeVisible();
		}
	});

	test('Sentry unset — NotConfiguredCard "Service Not Connected" is visible', async ({ page }) => {
		await page.goto('/chyby');
		await expect(page.getByText('Service Not Connected').first()).toBeVisible();
	});
});
