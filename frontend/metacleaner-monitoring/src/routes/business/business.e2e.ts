import { expect, test } from '@playwright/test';

test.describe('/business (Business Metrics)', () => {
	test.beforeEach(async ({ context }) => {
		await context.addCookies([
			{ name: 'mc_session', value: 'e2e-test-secret', url: 'http://localhost:4173' }
		]);
	});

	test('stays on /business and does not redirect to /login', async ({ page }) => {
		await page.goto('/business');
		await expect(page).toHaveURL('/business');
	});

	test('renders page heading "Business Metrics"', async ({ page }) => {
		await page.goto('/business');
		await expect(page.locator('h1').first()).toHaveText('Business Metrics');
	});

	test('sidebar contains all 9 navigation links', async ({ page }) => {
		await page.goto('/business');
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

	test('Stripe unset — NotConfiguredCard "Service Not Connected" is visible', async ({ page }) => {
		await page.goto('/business');
		await expect(page.getByText('Service Not Connected').first()).toBeVisible();
	});
});
