import { test, expect, type Page } from 'playwright/test';

async function mockLoginApi(page: Page) {
	await page.route('**/api/auth/login', async (route) => {
		if (route.request().method() === 'POST') {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					access_token: 'mock-access-token',
					refresh_token: 'mock-refresh-token',
					expires_in: 3600,
					user: { id: 'user-1', email: 'test@example.com', name: 'Test User' }
				})
			});
		} else {
			await route.continue();
		}
	});
}

async function mockMagicLinkApi(page: Page) {
	await page.route('**/api/auth/magic-link', async (route) => {
		if (route.request().method() === 'POST') {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ message: 'magic_link_sent' })
			});
		} else {
			await route.continue();
		}
	});
}

async function navigateToLogin(page: Page) {
	await page.goto('/login');
	// Wait until auth is ready and the form is rendered
	await expect(page.getByRole('heading', { level: 2, name: /sign in/i })).toBeVisible({
		timeout: 8000
	});
}

test.describe('Login page', () => {
	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('renders form heading and subtitle', async ({ page }) => {
			await navigateToLogin(page);
			await expect(page.getByRole('heading', { level: 2, name: /sign in/i })).toBeVisible();
			await expect(page.getByText('Welcome back! Enter your credentials.')).toBeVisible();
		});

		test('renders brand name in navbar', async ({ page }) => {
			await navigateToLogin(page);
			await expect(page.getByText('MetaCleaner').first()).toBeVisible();
		});

		test('navbar shows register link', async ({ page }) => {
			await navigateToLogin(page);
			await expect(page.getByRole('link', { name: /sign up/i }).first()).toBeVisible();
		});

		test('shows social login buttons', async ({ page }) => {
			await navigateToLogin(page);
			await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible();
			await expect(page.getByRole('button', { name: /continue with apple/i })).toBeVisible();
		});

		test('shows email input', async ({ page }) => {
			await navigateToLogin(page);
			await expect(page.locator('#email-input')).toBeVisible();
		});

		test('shows password input', async ({ page }) => {
			await navigateToLogin(page);
			await expect(page.locator('#password-input')).toBeVisible();
		});

		test('shows remember me option', async ({ page }) => {
			await navigateToLogin(page);
			await expect(page.getByText('Remember me on this device')).toBeVisible();
		});

		test('shows submit button', async ({ page }) => {
			await navigateToLogin(page);
			await expect(page.locator('button[type="submit"]')).toBeVisible();
		});

		test('shows forgot password link', async ({ page }) => {
			await navigateToLogin(page);
			await expect(page.getByRole('link', { name: /forgot password/i })).toBeVisible();
		});

		test('shows register link in footer', async ({ page }) => {
			await navigateToLogin(page);
			await expect(page.getByRole('link', { name: /sign up for free/i })).toBeVisible();
		});

		test('shows branding panel on desktop', async ({ page }) => {
			await navigateToLogin(page);
			const branding = page.locator('.hidden.lg\\:flex').filter({ hasText: 'Protect your' });
			await expect(branding).toBeVisible();
		});

		test('mobile hero is hidden on desktop', async ({ page }) => {
			await navigateToLogin(page);
			const mobileHero = page.locator('.lg\\:hidden').filter({ hasText: 'Protect your' }).first();
			await expect(mobileHero).not.toBeVisible();
		});

		test('email validation error on empty submit', async ({ page }) => {
			await navigateToLogin(page);
			await page.locator('button[type="submit"]').click();
			await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
		});

		test('password validation error when email is valid but password empty', async ({ page }) => {
			await navigateToLogin(page);
			await page.locator('#email-input').fill('test@example.com');
			await page.locator('button[type="submit"]').click();
			await expect(page.getByText('Please enter your password.')).toBeVisible();
		});

		test('successful login with mocked API redirects to home', async ({ page }) => {
			await mockLoginApi(page);
			await navigateToLogin(page);
			await page.locator('#email-input').fill('test@example.com');
			await page.locator('#password-input').fill('password123');
			await page.locator('button[type="submit"]').click();
			await page.waitForURL('**/', { timeout: 8000 });
			await expect(page).toHaveURL(/\/$/);
		});

		test('magic link section is visible', async ({ page }) => {
			await navigateToLogin(page);
			await expect(page.locator('button').filter({ hasText: 'Send magic link' })).toBeVisible();
		});

		test('magic link success state shows confirmation message', async ({ page }) => {
			await mockMagicLinkApi(page);
			await navigateToLogin(page);
			await page.locator('#magic-email-input').fill('test@example.com');
			await page.locator('button').filter({ hasText: 'Send magic link' }).click();
			await expect(page.getByText('Check your email')).toBeVisible({ timeout: 5000 });
		});

		test('forgot password link points to /forgot-password', async ({ page }) => {
			await navigateToLogin(page);
			const forgotLink = page.getByRole('link', { name: /forgot password/i });
			const href = await forgotLink.getAttribute('href');
			expect(href).toContain('forgot-password');
		});

		test('register link points to /register', async ({ page }) => {
			await navigateToLogin(page);
			const registerLink = page.getByRole('link', { name: /sign up for free/i });
			const href = await registerLink.getAttribute('href');
			expect(href).toContain('register');
		});

		test('navbar register link points to /register', async ({ page }) => {
			await navigateToLogin(page);
			const navRegisterLink = page.getByRole('link', { name: /sign up/i }).first();
			const href = await navRegisterLink.getAttribute('href');
			expect(href).toContain('register');
		});
	});

	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('renders form heading on mobile', async ({ page }) => {
			await navigateToLogin(page);
			await expect(page.getByRole('heading', { level: 2, name: /sign in/i })).toBeVisible();
		});

		test('shows mobile hero section on mobile', async ({ page }) => {
			await navigateToLogin(page);
			const mobileHero = page.locator('.lg\\:hidden').filter({ hasText: 'Protect your' }).first();
			await expect(mobileHero).toBeVisible();
		});

		test('branding panel is hidden on mobile', async ({ page }) => {
			await navigateToLogin(page);
			const branding = page.locator('.hidden.lg\\:flex').filter({ hasText: 'Protect your' });
			await expect(branding).not.toBeVisible();
		});

		test('shows email and password inputs on mobile', async ({ page }) => {
			await navigateToLogin(page);
			await expect(page.locator('#email-input')).toBeVisible();
			await expect(page.locator('#password-input')).toBeVisible();
		});

		test('shows social login buttons on mobile', async ({ page }) => {
			await navigateToLogin(page);
			await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible();
			await expect(page.getByRole('button', { name: /continue with apple/i })).toBeVisible();
		});

		test('shows submit button on mobile', async ({ page }) => {
			await navigateToLogin(page);
			await expect(page.locator('button[type="submit"]')).toBeVisible();
		});

		test('shows forgot password and register links on mobile', async ({ page }) => {
			await navigateToLogin(page);
			await expect(page.getByRole('link', { name: /forgot password/i })).toBeVisible();
			await expect(page.getByRole('link', { name: /sign up for free/i })).toBeVisible();
		});

		test('email validation error on mobile', async ({ page }) => {
			await navigateToLogin(page);
			await page.locator('button[type="submit"]').click();
			await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
		});
	});
});
