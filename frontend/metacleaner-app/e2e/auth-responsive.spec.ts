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

// ─── Login ────────────────────────────────────────────────────────────────────

test.describe('Auth Responsive — Login', () => {
	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('mobile hero is visible on mobile', async ({ page }) => {
			await navigateToLogin(page);
			const mobileHero = page.locator('.lg\\:hidden').filter({ hasText: 'Protect your' }).first();
			await expect(mobileHero).toBeVisible();
		});

		test('branding panel is hidden on mobile', async ({ page }) => {
			await navigateToLogin(page);
			const branding = page.locator('.hidden.lg\\:flex').filter({ hasText: 'Protect your' });
			await expect(branding).not.toBeVisible();
		});

		test('form elements are visible on mobile', async ({ page }) => {
			await navigateToLogin(page);
			await expect(page.locator('#email-input')).toBeVisible();
			await expect(page.locator('#password-input')).toBeVisible();
			await expect(page.getByRole('button', { name: /^sign in$/i })).toBeVisible();
		});
	});

	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('branding panel is visible on desktop', async ({ page }) => {
			await navigateToLogin(page);
			const branding = page.locator('.hidden.lg\\:flex').filter({ hasText: 'Protect your' });
			await expect(branding).toBeVisible();
		});

		test('mobile hero is hidden on desktop', async ({ page }) => {
			await navigateToLogin(page);
			const mobileHero = page.locator('.lg\\:hidden').filter({ hasText: 'Protect your' }).first();
			await expect(mobileHero).not.toBeVisible();
		});

		test('form elements are visible on desktop', async ({ page }) => {
			await navigateToLogin(page);
			await expect(page.locator('#email-input')).toBeVisible();
			await expect(page.locator('#password-input')).toBeVisible();
			await expect(page.getByRole('button', { name: /^sign in$/i })).toBeVisible();
		});
	});
});

// ─── Register ─────────────────────────────────────────────────────────────────

test.describe('Auth Responsive — Register', () => {
	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('mobile hero is visible on mobile', async ({ page }) => {
			await navigateToRegister(page);
			const mobileHero = page
				.locator('.lg\\:hidden')
				.filter({ hasText: 'Remove metadata' })
				.first();
			await expect(mobileHero).toBeVisible();
		});

		test('branding panel is hidden on mobile', async ({ page }) => {
			await navigateToRegister(page);
			const branding = page.locator('.hidden.lg\\:flex').filter({ hasText: 'Start protecting' });
			await expect(branding).not.toBeVisible();
		});

		test('form elements are visible on mobile', async ({ page }) => {
			await navigateToRegister(page);
			await expect(page.locator('#fname-input')).toBeVisible();
			await expect(page.locator('#lname-input')).toBeVisible();
			await expect(page.locator('#email-input')).toBeVisible();
			await expect(page.locator('#password-input')).toBeVisible();
			await expect(page.getByRole('button', { name: /create free account/i })).toBeVisible();
		});
	});

	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('branding panel is visible on desktop', async ({ page }) => {
			await navigateToRegister(page);
			const branding = page.locator('.hidden.lg\\:flex').filter({ hasText: 'Start protecting' });
			await expect(branding).toBeVisible();
		});

		test('mobile hero is hidden on desktop', async ({ page }) => {
			await navigateToRegister(page);
			const mobileHero = page
				.locator('.lg\\:hidden')
				.filter({ hasText: 'Remove metadata' })
				.first();
			await expect(mobileHero).not.toBeVisible();
		});

		test('form elements are visible on desktop', async ({ page }) => {
			await navigateToRegister(page);
			await expect(page.locator('#fname-input')).toBeVisible();
			await expect(page.locator('#lname-input')).toBeVisible();
			await expect(page.locator('#email-input')).toBeVisible();
			await expect(page.locator('#password-input')).toBeVisible();
			await expect(page.getByRole('button', { name: /create free account/i })).toBeVisible();
		});
	});
});

// ─── Forgot Password ──────────────────────────────────────────────────────────

test.describe('Auth Responsive — Forgot Password', () => {
	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('step progress cards are visible on mobile', async ({ page }) => {
			await navigateToForgotPassword(page);
			await expect(page.getByText('Enter email')).toBeVisible();
		});

		test('branding panel is hidden on mobile', async ({ page }) => {
			await navigateToForgotPassword(page);
			const branding = page.locator('.hidden.lg\\:flex').filter({ hasText: 'Recover' });
			await expect(branding).not.toBeVisible();
		});

		test('email input and send code button are visible on mobile', async ({ page }) => {
			await navigateToForgotPassword(page);
			await expect(page.locator('#email-input')).toBeVisible();
			await expect(page.getByRole('button', { name: /send code/i })).toBeVisible();
		});
	});

	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('branding panel is visible on desktop', async ({ page }) => {
			await navigateToForgotPassword(page);
			const branding = page.locator('.hidden.lg\\:flex').filter({ hasText: 'Recover' });
			await expect(branding).toBeVisible();
		});

		test('email input and send code button are visible on desktop', async ({ page }) => {
			await navigateToForgotPassword(page);
			await expect(page.locator('#email-input')).toBeVisible();
			await expect(page.getByRole('button', { name: /send code/i })).toBeVisible();
		});

		test('step progress bar is visible on desktop', async ({ page }) => {
			await navigateToForgotPassword(page);
			const progressBar = page.locator('div').filter({ hasText: '1' }).first();
			await expect(progressBar).toBeVisible();
		});
	});
});
