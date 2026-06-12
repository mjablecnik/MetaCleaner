import { test, expect, type Page } from 'playwright/test';

async function navigateToLogin(page: Page) {
	await page.goto('/login');
	await expect(page.getByRole('heading', { level: 2, name: /sign in/i })).toBeVisible({
		timeout: 8000
	});
}

async function navigateToRegister(page: Page) {
	await page.goto('/register');
	await expect(page.getByRole('heading', { level: 2, name: /create account/i })).toBeVisible({
		timeout: 8000
	});
}

async function navigateToForgotPassword(page: Page) {
	await page.goto('/forgot-password');
	await expect(page.getByRole('heading', { level: 2, name: /forgot password/i })).toBeVisible({
		timeout: 8000
	});
}

test.describe('Auth navigation — inter-page links', () => {
	test.use({ viewport: { width: 1280, height: 800 } });

	test('/login → /register via "Sign up for free" footer link', async ({ page }) => {
		await navigateToLogin(page);
		await page.getByRole('link', { name: /sign up for free/i }).click();
		await page.waitForURL('**/register');
		await expect(page).toHaveURL(/\/register/);
		await expect(page.getByRole('heading', { level: 2, name: /create account/i })).toBeVisible({
			timeout: 8000
		});
	});

	test('/login → /register via navbar "Sign up" link', async ({ page }) => {
		await navigateToLogin(page);
		await page.getByRole('link', { name: /sign up/i }).first().click();
		await page.waitForURL('**/register');
		await expect(page).toHaveURL(/\/register/);
		await expect(page.getByRole('heading', { level: 2, name: /create account/i })).toBeVisible({
			timeout: 8000
		});
	});

	test('/login → /forgot-password via "Forgot password" link', async ({ page }) => {
		await navigateToLogin(page);
		await page.getByRole('link', { name: /forgot password/i }).click();
		await page.waitForURL('**/forgot-password');
		await expect(page).toHaveURL(/\/forgot-password/);
		await expect(
			page.getByRole('heading', { level: 2, name: /forgot password/i })
		).toBeVisible({ timeout: 8000 });
	});

	test('/register → /login via navbar "Sign in" link', async ({ page }) => {
		await navigateToRegister(page);
		await page.getByRole('link', { name: /sign in/i }).first().click();
		await page.waitForURL('**/login');
		await expect(page).toHaveURL(/\/login/);
		await expect(page.getByRole('heading', { level: 2, name: /sign in/i })).toBeVisible({
			timeout: 8000
		});
	});

	test('/register → /login via footer "Sign in" link', async ({ page }) => {
		await navigateToRegister(page);
		await page.getByRole('link', { name: /sign in/i }).last().click();
		await page.waitForURL('**/login');
		await expect(page).toHaveURL(/\/login/);
		await expect(page.getByRole('heading', { level: 2, name: /sign in/i })).toBeVisible({
			timeout: 8000
		});
	});

	test('/forgot-password → /login via "Back to sign in" link', async ({ page }) => {
		await navigateToForgotPassword(page);
		await page.getByRole('link', { name: /back to sign in/i }).click();
		await page.waitForURL('**/login');
		await expect(page).toHaveURL(/\/login/);
		await expect(page.getByRole('heading', { level: 2, name: /sign in/i })).toBeVisible({
			timeout: 8000
		});
	});

	test('/forgot-password → /login via navbar "Sign in" link', async ({ page }) => {
		await navigateToForgotPassword(page);
		await page.getByRole('link', { name: /sign in/i }).first().click();
		await page.waitForURL('**/login');
		await expect(page).toHaveURL(/\/login/);
		await expect(page.getByRole('heading', { level: 2, name: /sign in/i })).toBeVisible({
			timeout: 8000
		});
	});
});

test.describe('Auth navigation — mobile viewport (375px)', () => {
	test.use({ viewport: { width: 375, height: 812 } });

	test('/login → /register on mobile via footer link', async ({ page }) => {
		await navigateToLogin(page);
		await page.getByRole('link', { name: /sign up for free/i }).click();
		await page.waitForURL('**/register');
		await expect(page).toHaveURL(/\/register/);
		await expect(page.getByRole('heading', { level: 2, name: /create account/i })).toBeVisible({
			timeout: 8000
		});
	});

	test('/login → /forgot-password on mobile', async ({ page }) => {
		await navigateToLogin(page);
		await page.getByRole('link', { name: /forgot password/i }).click();
		await page.waitForURL('**/forgot-password');
		await expect(page).toHaveURL(/\/forgot-password/);
		await expect(
			page.getByRole('heading', { level: 2, name: /forgot password/i })
		).toBeVisible({ timeout: 8000 });
	});

	test('/register → /login on mobile', async ({ page }) => {
		await navigateToRegister(page);
		await page.getByRole('link', { name: /sign in/i }).first().click();
		await page.waitForURL('**/login');
		await expect(page).toHaveURL(/\/login/);
		await expect(page.getByRole('heading', { level: 2, name: /sign in/i })).toBeVisible({
			timeout: 8000
		});
	});

	test('/forgot-password → /login on mobile via "Back to sign in" link', async ({ page }) => {
		await navigateToForgotPassword(page);
		await page.getByRole('link', { name: /back to sign in/i }).click();
		await page.waitForURL('**/login');
		await expect(page).toHaveURL(/\/login/);
		await expect(page.getByRole('heading', { level: 2, name: /sign in/i })).toBeVisible({
			timeout: 8000
		});
	});
});
