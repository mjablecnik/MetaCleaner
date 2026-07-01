import { expect, test } from '@playwright/test';

test.describe('/performance (Performance)', () => {
	test.beforeEach(async ({ context }) => {
		await context.addCookies([
			{ name: 'mc_session', value: 'e2e-test-secret', url: 'http://localhost:4173' }
		]);
	});

	test('stays on /performance and does not redirect to /login', async ({ page }) => {
		await page.goto('/performance');
		await expect(page).toHaveURL('/performance');
	});

	test('renders page heading "Performance"', async ({ page }) => {
		await page.goto('/performance');
		await expect(page.locator('h1').first()).toHaveText('Performance');
	});

	test('sidebar contains all 9 navigation links', async ({ page }) => {
		await page.goto('/performance');
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

	test('Cloudflare/Fly/Sentry unset — NotConfiguredCard "Service Not Connected" is visible', async ({
		page
	}) => {
		await page.goto('/performance');
		await expect(page.getByText('Service Not Connected').first()).toBeVisible();
	});
});
