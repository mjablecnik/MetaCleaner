import { test, expect, type Page } from 'playwright/test';

async function mockRegisterApi(page: Page) {
	await page.route('**/api/auth/register', async (route) => {
		if (route.request().method() === 'POST') {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ message: 'verification_email_sent', email: 'test@example.com' })
			});
		} else {
			await route.continue();
		}
	});
}

async function navigateToRegister(page: Page) {
	await page.goto('/register');
	await expect(page.getByRole('heading', { level: 2, name: /create account/i })).toBeVisible({
		timeout: 8000
	});
}

test.describe('Register page', () => {
	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('renders form heading and subtitle', async ({ page }) => {
			await navigateToRegister(page);
			await expect(page.getByRole('heading', { level: 2, name: /create account/i })).toBeVisible();
			await expect(page.getByText('Sign up for free in less than a minute.')).toBeVisible();
		});

		test('renders brand name in navbar', async ({ page }) => {
			await navigateToRegister(page);
			await expect(page.getByText('MetaCleaner').first()).toBeVisible();
		});

		test('navbar shows login link', async ({ page }) => {
			await navigateToRegister(page);
			await expect(page.getByRole('link', { name: /sign in/i }).first()).toBeVisible();
		});

		test('shows social login buttons', async ({ page }) => {
			await navigateToRegister(page);
			await expect(page.getByRole('button', { name: /sign up with google/i })).toBeVisible();
			await expect(page.getByRole('button', { name: /sign up with apple/i })).toBeVisible();
		});

		test('shows first name and last name inputs', async ({ page }) => {
			await navigateToRegister(page);
			await expect(page.locator('#fname-input')).toBeVisible();
			await expect(page.locator('#lname-input')).toBeVisible();
		});

		test('shows email input', async ({ page }) => {
			await navigateToRegister(page);
			await expect(page.locator('#email-input')).toBeVisible();
		});

		test('shows password and confirm password inputs', async ({ page }) => {
			await navigateToRegister(page);
			await expect(page.locator('#password-input')).toBeVisible();
			await expect(page.locator('#confirm-input')).toBeVisible();
		});

		test('shows submit button', async ({ page }) => {
			await navigateToRegister(page);
			await expect(page.getByRole('button', { name: /create free account/i })).toBeVisible();
		});

		test('shows login link in footer', async ({ page }) => {
			await navigateToRegister(page);
			await expect(page.getByRole('link', { name: /sign in/i }).last()).toBeVisible();
		});

		test('shows branding panel on desktop', async ({ page }) => {
			await navigateToRegister(page);
			const branding = page.locator('.hidden.lg\\:flex').filter({ hasText: 'Start protecting' });
			await expect(branding).toBeVisible();
		});

		test('mobile hero is hidden on desktop', async ({ page }) => {
			await navigateToRegister(page);
			const mobileHero = page.locator('.lg\\:hidden').filter({ hasText: 'Remove metadata' }).first();
			await expect(mobileHero).not.toBeVisible();
		});

		test('password strength meter appears after typing password', async ({ page }) => {
			await navigateToRegister(page);
			await page.locator('#password-input').fill('Password1!');
			await expect(page.getByText(/strong/i)).toBeVisible({ timeout: 3000 });
		});

		test('first name validation error on empty submit', async ({ page }) => {
			await navigateToRegister(page);
			await page.getByRole('button', { name: /create free account/i }).click();
			await expect(page.getByText('Please enter your first name.')).toBeVisible();
		});

		test('last name validation error when first name is filled', async ({ page }) => {
			await navigateToRegister(page);
			await page.locator('#fname-input').fill('John');
			await page.getByRole('button', { name: /create free account/i }).click();
			await expect(page.getByText('Please enter your last name.')).toBeVisible();
		});

		test('email validation error when names are filled', async ({ page }) => {
			await navigateToRegister(page);
			await page.locator('#fname-input').fill('John');
			await page.locator('#lname-input').fill('Doe');
			await page.getByRole('button', { name: /create free account/i }).click();
			await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
		});

		test('password too short validation error', async ({ page }) => {
			await navigateToRegister(page);
			await page.locator('#fname-input').fill('John');
			await page.locator('#lname-input').fill('Doe');
			await page.locator('#email-input').fill('test@example.com');
			await page.locator('#password-input').fill('short');
			await page.getByRole('button', { name: /create free account/i }).click();
			await expect(page.getByText('Password must be at least 8 characters.')).toBeVisible();
		});

		test('passwords mismatch validation error', async ({ page }) => {
			await navigateToRegister(page);
			await page.locator('#fname-input').fill('John');
			await page.locator('#lname-input').fill('Doe');
			await page.locator('#email-input').fill('test@example.com');
			await page.locator('#password-input').fill('ValidPass1!');
			await page.locator('#confirm-input').fill('DifferentPass1!');
			await page.getByRole('button', { name: /create free account/i }).click();
			await expect(page.getByText('Passwords do not match.')).toBeVisible();
		});

		test('successful registration transitions to check-email step', async ({ page }) => {
			await mockRegisterApi(page);
			await navigateToRegister(page);
			await page.locator('#fname-input').fill('John');
			await page.locator('#lname-input').fill('Doe');
			await page.locator('#email-input').fill('test@example.com');
			await page.locator('#password-input').fill('ValidPass1!');
			await page.locator('#confirm-input').fill('ValidPass1!');
			await page.getByRole('button', { name: /create free account/i }).click();
			await expect(page.getByText('Check your email')).toBeVisible({ timeout: 8000 });
		});

		test('check-email step shows submitted email address', async ({ page }) => {
			await mockRegisterApi(page);
			await navigateToRegister(page);
			await page.locator('#fname-input').fill('John');
			await page.locator('#lname-input').fill('Doe');
			await page.locator('#email-input').fill('test@example.com');
			await page.locator('#password-input').fill('ValidPass1!');
			await page.locator('#confirm-input').fill('ValidPass1!');
			await page.getByRole('button', { name: /create free account/i }).click();
			await expect(page.getByText('test@example.com')).toBeVisible({ timeout: 8000 });
		});

		test('footer login link points to /login', async ({ page }) => {
			await navigateToRegister(page);
			const loginLinks = page.getByRole('link', { name: /sign in/i });
			const hrefs = await loginLinks.evaluateAll((els) =>
				els.map((el) => el.getAttribute('href'))
			);
			expect(hrefs.some((h) => h?.includes('login'))).toBe(true);
		});

		test('navbar login link points to /login', async ({ page }) => {
			await navigateToRegister(page);
			const navLoginLink = page.getByRole('link', { name: /sign in/i }).first();
			const href = await navLoginLink.getAttribute('href');
			expect(href).toContain('login');
		});
	});

	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('renders form heading on mobile', async ({ page }) => {
			await navigateToRegister(page);
			await expect(page.getByRole('heading', { level: 2, name: /create account/i })).toBeVisible();
		});

		test('shows mobile hero section on mobile', async ({ page }) => {
			await navigateToRegister(page);
			const mobileHero = page.locator('.lg\\:hidden').filter({ hasText: 'Remove metadata' }).first();
			await expect(mobileHero).toBeVisible();
		});

		test('branding panel is hidden on mobile', async ({ page }) => {
			await navigateToRegister(page);
			const branding = page.locator('.hidden.lg\\:flex').filter({ hasText: 'Start protecting' });
			await expect(branding).not.toBeVisible();
		});

		test('shows all form inputs on mobile', async ({ page }) => {
			await navigateToRegister(page);
			await expect(page.locator('#fname-input')).toBeVisible();
			await expect(page.locator('#lname-input')).toBeVisible();
			await expect(page.locator('#email-input')).toBeVisible();
			await expect(page.locator('#password-input')).toBeVisible();
			await expect(page.locator('#confirm-input')).toBeVisible();
		});

		test('shows social login buttons on mobile', async ({ page }) => {
			await navigateToRegister(page);
			await expect(page.getByRole('button', { name: /sign up with google/i })).toBeVisible();
			await expect(page.getByRole('button', { name: /sign up with apple/i })).toBeVisible();
		});

		test('shows submit button on mobile', async ({ page }) => {
			await navigateToRegister(page);
			await expect(page.getByRole('button', { name: /create free account/i })).toBeVisible();
		});

		test('shows login link on mobile', async ({ page }) => {
			await navigateToRegister(page);
			await expect(page.getByRole('link', { name: /sign in/i }).first()).toBeVisible();
		});

		test('email validation error on mobile', async ({ page }) => {
			await navigateToRegister(page);
			await page.locator('#fname-input').fill('John');
			await page.locator('#lname-input').fill('Doe');
			await page.getByRole('button', { name: /create free account/i }).click();
			await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
		});

		test('successful registration on mobile shows check-email', async ({ page }) => {
			await mockRegisterApi(page);
			await navigateToRegister(page);
			await page.locator('#fname-input').fill('John');
			await page.locator('#lname-input').fill('Doe');
			await page.locator('#email-input').fill('test@example.com');
			await page.locator('#password-input').fill('ValidPass1!');
			await page.locator('#confirm-input').fill('ValidPass1!');
			await page.getByRole('button', { name: /create free account/i }).click();
			await expect(page.getByText('Check your email')).toBeVisible({ timeout: 8000 });
		});
	});
});
