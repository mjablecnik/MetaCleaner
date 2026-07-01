import { expect, test } from '@playwright/test';

test.describe('auth guard', () => {
	test('unauthenticated GET / redirects to /login', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveURL('/login');
	});

	test('unauthenticated GET /performance redirects to /login', async ({ page }) => {
		await page.goto('/performance');
		await expect(page).toHaveURL('/login');
	});

	test('authenticated context accesses / without redirect', async ({ page, context }) => {
		await context.addCookies([
			{ name: 'mc_session', value: 'e2e-test-secret', url: 'http://localhost:4173' }
		]);
		await page.goto('/');
		await expect(page).toHaveURL('/');
	});
});
