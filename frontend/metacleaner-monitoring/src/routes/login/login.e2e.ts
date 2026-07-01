import { expect, test } from '@playwright/test';

test.describe('/login page', () => {
	test('renders heading, password field, and submit button', async ({ page }) => {
		await page.goto('/login');
		await expect(page.locator('h1')).toHaveText('Dashboard Access');
		await expect(page.locator('input[type="password"]')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
	});

	test('shows error message on wrong password', async ({ page }) => {
		await page.goto('/login');
		await page.fill('input[type="password"]', 'wrong-password');
		await page.getByRole('button', { name: 'Sign in' }).click();
		await expect(page.getByText('Invalid password. Please try again.')).toBeVisible();
	});

	test('redirects to / after correct password', async ({ page }) => {
		await page.goto('/login');
		await page.fill('input[type="password"]', 'e2e-test-secret');
		await page.getByRole('button', { name: 'Sign in' }).click();
		await expect(page).toHaveURL('/');
	});
});
