import { expect, test } from '@playwright/test';

test.describe('/dostupnost (Availability)', () => {
	test.beforeEach(async ({ context }) => {
		await context.addCookies([
			{ name: 'mc_session', value: 'e2e-test-secret', url: 'http://localhost:4173' }
		]);
	});

	test('stays on /dostupnost and does not redirect to /login', async ({ page }) => {
		await page.goto('/dostupnost');
		await expect(page).toHaveURL('/dostupnost');
	});

	test('renders page heading "Availability"', async ({ page }) => {
		await page.goto('/dostupnost');
		await expect(page.locator('h1').first()).toHaveText('Availability');
	});

	test('sidebar contains all 9 navigation links', async ({ page }) => {
		await page.goto('/dostupnost');
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
		await page.goto('/dostupnost');
		const retryButtons = page.locator('button').filter({ hasText: 'Retry' });
		const notConfiguredCards = page.getByText('Service Not Connected');
		const retryCount = await retryButtons.count();
		const notConfiguredCount = await notConfiguredCards.count();
		expect(retryCount + notConfiguredCount).toBeGreaterThan(0);
	});
});
