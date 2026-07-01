import { expect, test } from '@playwright/test';

test.describe('/ (Dashboard)', () => {
	test.beforeEach(async ({ context }) => {
		await context.addCookies([
			{ name: 'mc_session', value: 'e2e-test-secret', url: 'http://localhost:4173' }
		]);
	});

	test('stays on / and does not redirect to /login', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveURL('/');
	});

	test('renders page heading', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1').first()).toBeVisible();
	});

	test('desktop sidebar is visible at 1280px viewport', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/');
		await expect(page.locator('aside').first()).toBeVisible();
	});

	test('sidebar contains all 9 navigation links', async ({ page }) => {
		await page.goto('/');
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

	test('data sections render error or not-configured cards', async ({ page }) => {
		await page.goto('/');
		// Supabase is unreachable → SectionErrorCard with Retry button
		// Optional services are unconfigured → NotConfiguredCard "Service Not Connected"
		const retryButtons = page.locator('button').filter({ hasText: 'Retry' });
		const notConfiguredCards = page.getByText('Service Not Connected');
		const retryCount = await retryButtons.count();
		const notConfiguredCount = await notConfiguredCards.count();
		expect(retryCount + notConfiguredCount).toBeGreaterThan(0);
	});
});
