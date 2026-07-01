import { expect, test } from '@playwright/test';

test.describe('/databaze (Database)', () => {
	test.beforeEach(async ({ context }) => {
		await context.addCookies([
			{ name: 'mc_session', value: 'e2e-test-secret', url: 'http://localhost:4173' }
		]);
	});

	test('stays on /databaze and does not redirect to /login', async ({ page }) => {
		await page.goto('/databaze');
		await expect(page).toHaveURL('/databaze');
	});

	test('renders page heading "Database (Supabase)"', async ({ page }) => {
		await page.goto('/databaze');
		await expect(page.locator('h1').first()).toHaveText('Database (Supabase)');
	});

	test('sidebar contains all 9 navigation links', async ({ page }) => {
		await page.goto('/databaze');
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

	test('Supabase unreachable — SectionErrorCard with Retry button is visible', async ({ page }) => {
		await page.goto('/databaze');
		await expect(page.locator('button').filter({ hasText: 'Retry' }).first()).toBeVisible();
	});
});
