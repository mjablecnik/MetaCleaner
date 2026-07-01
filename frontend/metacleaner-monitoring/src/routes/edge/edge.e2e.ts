import { expect, test } from '@playwright/test';

test.describe('/edge (Edge)', () => {
	test.beforeEach(async ({ context }) => {
		await context.addCookies([
			{ name: 'mc_session', value: 'e2e-test-secret', url: 'http://localhost:4173' }
		]);
	});

	test('stays on /edge and does not redirect to /login', async ({ page }) => {
		await page.goto('/edge');
		await expect(page).toHaveURL('/edge');
	});

	test('renders page heading "Edge (Cloudflare)"', async ({ page }) => {
		await page.goto('/edge');
		await expect(page.locator('h1').first()).toHaveText('Edge (Cloudflare)');
	});

	test('sidebar contains all 9 navigation links', async ({ page }) => {
		await page.goto('/edge');
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

	test('Cloudflare unset — NotConfiguredCard "Service Not Connected" is visible', async ({
		page
	}) => {
		await page.goto('/edge');
		await expect(page.getByText('Service Not Connected').first()).toBeVisible();
	});
});
