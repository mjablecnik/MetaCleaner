import { expect, test } from '@playwright/test';

test('login page is accessible without authentication', async ({ page }) => {
	await page.goto('/login');
	await expect(page.locator('h1')).toHaveText('Dashboard Access');
});
