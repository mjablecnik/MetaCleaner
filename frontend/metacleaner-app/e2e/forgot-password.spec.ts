import { test, expect, type Page } from 'playwright/test';

async function mockForgotPasswordApi(page: Page) {
	await page.route('**/api/auth/forgot-password', async (route) => {
		if (route.request().method() === 'POST') {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ message: 'reset_email_sent' })
			});
		} else {
			await route.continue();
		}
	});
}

async function mockVerifyResetCodeApi(page: Page) {
	await page.route('**/api/auth/verify-reset-code', async (route) => {
		if (route.request().method() === 'POST') {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ valid: true, access_token: 'mock-reset-token' })
			});
		} else {
			await route.continue();
		}
	});
}

async function mockResetPasswordApi(page: Page) {
	await page.route('**/api/auth/reset-password', async (route) => {
		if (route.request().method() === 'POST') {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ message: 'password_reset_success' })
			});
		} else {
			await route.continue();
		}
	});
}

async function navigateToForgotPassword(page: Page) {
	await page.goto('/forgot-password');
	await expect(
		page.getByRole('heading', { level: 2, name: /forgot password/i })
	).toBeVisible({ timeout: 8000 });
}

async function advanceToStep2(page: Page) {
	await mockForgotPasswordApi(page);
	await navigateToForgotPassword(page);
	await page.locator('#email-input').fill('test@example.com');
	await page.getByRole('button', { name: /send code/i }).click();
	await expect(page.getByRole('heading', { level: 2, name: /verify code/i })).toBeVisible({
		timeout: 8000
	});
}

async function fillOtp(page: Page, code = '123456') {
	const otpInputs = page.locator('input[inputmode="numeric"]');
	for (let i = 0; i < 6; i++) {
		await otpInputs.nth(i).fill(code[i]);
	}
}

async function advanceToStep3(page: Page) {
	await mockVerifyResetCodeApi(page);
	await advanceToStep2(page);
	await fillOtp(page);
	await page.getByRole('button', { name: /verify code/i }).click();
	await expect(page.getByRole('heading', { level: 2, name: /new password/i })).toBeVisible({
		timeout: 8000
	});
}

test.describe('Forgot Password page', () => {
	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('renders forgot password heading on step 1', async ({ page }) => {
			await navigateToForgotPassword(page);
			await expect(
				page.getByRole('heading', { level: 2, name: /forgot password/i })
			).toBeVisible();
		});

		test('renders brand name in navbar', async ({ page }) => {
			await navigateToForgotPassword(page);
			await expect(page.getByText('MetaCleaner').first()).toBeVisible();
		});

		test('navbar shows sign in link', async ({ page }) => {
			await navigateToForgotPassword(page);
			await expect(page.getByRole('link', { name: /sign in/i }).first()).toBeVisible();
		});

		test('shows email input on step 1', async ({ page }) => {
			await navigateToForgotPassword(page);
			await expect(page.locator('#email-input')).toBeVisible();
		});

		test('shows send code button on step 1', async ({ page }) => {
			await navigateToForgotPassword(page);
			await expect(page.getByRole('button', { name: /send code/i })).toBeVisible();
		});

		test('shows back to sign in link on step 1', async ({ page }) => {
			await navigateToForgotPassword(page);
			await expect(page.getByRole('link', { name: /back to sign in/i })).toBeVisible();
		});

		test('back to sign in link points to /login', async ({ page }) => {
			await navigateToForgotPassword(page);
			const backLink = page.getByRole('link', { name: /back to sign in/i });
			const href = await backLink.getAttribute('href');
			expect(href).toContain('login');
		});

		test('shows step progress bar on step 1', async ({ page }) => {
			await navigateToForgotPassword(page);
			const progressBar = page.locator('div').filter({ hasText: '1' }).first();
			await expect(progressBar).toBeVisible();
		});

		test('shows branding panel on desktop step 1', async ({ page }) => {
			await navigateToForgotPassword(page);
			const branding = page.locator('.hidden.lg\\:flex').filter({ hasText: 'Recover' });
			await expect(branding).toBeVisible();
		});

		test('email validation error on empty submit', async ({ page }) => {
			await navigateToForgotPassword(page);
			await page.getByRole('button', { name: /send code/i }).click();
			await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
		});

		test('advances to step 2 after successful email submit', async ({ page }) => {
			await advanceToStep2(page);
			await expect(page.getByRole('heading', { level: 2, name: /verify code/i })).toBeVisible();
		});

		test('step 2 shows sent email address', async ({ page }) => {
			await advanceToStep2(page);
			await expect(page.getByText('test@example.com')).toBeVisible();
		});

		test('step 2 shows 6 OTP inputs', async ({ page }) => {
			await advanceToStep2(page);
			const otpInputs = page.locator('input[inputmode="numeric"]');
			await expect(otpInputs).toHaveCount(6);
		});

		test('step 2 shows verify code button', async ({ page }) => {
			await advanceToStep2(page);
			await expect(page.getByRole('button', { name: /verify code/i })).toBeVisible();
		});

		test('step 2 shows resend button', async ({ page }) => {
			await advanceToStep2(page);
			await expect(page.getByRole('button', { name: /resend/i })).toBeVisible();
		});

		test('step 2 shows back button', async ({ page }) => {
			await advanceToStep2(page);
			await expect(page.getByRole('button', { name: /back/i })).toBeVisible();
		});

		test('step 2 OTP incomplete validation error', async ({ page }) => {
			await advanceToStep2(page);
			await page.getByRole('button', { name: /verify code/i }).click();
			await expect(
				page.getByText('Please enter the complete 6-digit code.')
			).toBeVisible();
		});

		test('step 2 back button returns to step 1', async ({ page }) => {
			await advanceToStep2(page);
			await page.getByRole('button', { name: /^back$/i }).click();
			await expect(
				page.getByRole('heading', { level: 2, name: /forgot password/i })
			).toBeVisible();
		});

		test('advances to step 3 after OTP verification', async ({ page }) => {
			await advanceToStep3(page);
			await expect(page.getByRole('heading', { level: 2, name: /new password/i })).toBeVisible();
		});

		test('step 3 shows new password input', async ({ page }) => {
			await advanceToStep3(page);
			await expect(page.locator('#new-password')).toBeVisible();
		});

		test('step 3 shows confirm password input', async ({ page }) => {
			await advanceToStep3(page);
			await expect(page.locator('#confirm-password')).toBeVisible();
		});

		test('step 3 shows set new password button', async ({ page }) => {
			await advanceToStep3(page);
			await expect(page.getByRole('button', { name: /set new password/i })).toBeVisible();
		});

		test('step 3 shows password requirements', async ({ page }) => {
			await advanceToStep3(page);
			await expect(page.getByText('Password requirements')).toBeVisible();
		});

		test('step 3 shows strength meter after typing password', async ({ page }) => {
			await advanceToStep3(page);
			await page.locator('#new-password').fill('StrongPass1!');
			await expect(page.getByText(/strong/i)).toBeVisible({ timeout: 3000 });
		});

		test('step 3 shows passwords match indicator', async ({ page }) => {
			await advanceToStep3(page);
			await page.locator('#new-password').fill('StrongPass1!');
			await page.locator('#confirm-password').fill('StrongPass1!');
			await expect(page.getByText('Passwords match.')).toBeVisible();
		});

		test('step 3 shows passwords mismatch error', async ({ page }) => {
			await advanceToStep3(page);
			await page.locator('#new-password').fill('StrongPass1!');
			await page.locator('#confirm-password').fill('DifferentPass1!');
			await expect(page.getByText('Passwords do not match.')).toBeVisible();
		});

		test('advances to step 4 (success) after setting new password', async ({ page }) => {
			await mockResetPasswordApi(page);
			await advanceToStep3(page);
			await page.locator('#new-password').fill('StrongPass1!');
			await page.locator('#confirm-password').fill('StrongPass1!');
			await page.getByRole('button', { name: /set new password/i }).click();
			await expect(page.getByText('Password changed!')).toBeVisible({ timeout: 8000 });
		});

		test('step 4 shows sign in link', async ({ page }) => {
			await mockResetPasswordApi(page);
			await advanceToStep3(page);
			await page.locator('#new-password').fill('StrongPass1!');
			await page.locator('#confirm-password').fill('StrongPass1!');
			await page.getByRole('button', { name: /set new password/i }).click();
			await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible({
				timeout: 8000
			});
		});

		test('step 4 sign in link points to /login', async ({ page }) => {
			await mockResetPasswordApi(page);
			await advanceToStep3(page);
			await page.locator('#new-password').fill('StrongPass1!');
			await page.locator('#confirm-password').fill('StrongPass1!');
			await page.getByRole('button', { name: /set new password/i }).click();
			await expect(page.getByText('Password changed!')).toBeVisible({ timeout: 8000 });
			const signInLink = page.getByRole('link', { name: /sign in/i }).last();
			const href = await signInLink.getAttribute('href');
			expect(href).toContain('login');
		});
	});

	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('renders forgot password heading on mobile', async ({ page }) => {
			await navigateToForgotPassword(page);
			await expect(
				page.getByRole('heading', { level: 2, name: /forgot password/i })
			).toBeVisible();
		});

		test('shows mobile step cards on mobile step 1', async ({ page }) => {
			await navigateToForgotPassword(page);
			await expect(page.getByText('Enter email')).toBeVisible();
		});

		test('branding panel is hidden on mobile', async ({ page }) => {
			await navigateToForgotPassword(page);
			const branding = page.locator('.hidden.lg\\:flex').filter({ hasText: 'Recover' });
			await expect(branding).not.toBeVisible();
		});

		test('shows email input on mobile', async ({ page }) => {
			await navigateToForgotPassword(page);
			await expect(page.locator('#email-input')).toBeVisible();
		});

		test('shows send code button on mobile', async ({ page }) => {
			await navigateToForgotPassword(page);
			await expect(page.getByRole('button', { name: /send code/i })).toBeVisible();
		});

		test('email validation error on mobile', async ({ page }) => {
			await navigateToForgotPassword(page);
			await page.getByRole('button', { name: /send code/i }).click();
			await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
		});

		test('advances to step 2 on mobile', async ({ page }) => {
			await advanceToStep2(page);
			await expect(page.getByRole('heading', { level: 2, name: /verify code/i })).toBeVisible();
		});

		test('step 2 shows 6 OTP inputs on mobile', async ({ page }) => {
			await advanceToStep2(page);
			const otpInputs = page.locator('input[inputmode="numeric"]');
			await expect(otpInputs).toHaveCount(6);
		});

		test('advances to step 3 on mobile', async ({ page }) => {
			await advanceToStep3(page);
			await expect(page.getByRole('heading', { level: 2, name: /new password/i })).toBeVisible();
		});

		test('step 3 shows new and confirm password inputs on mobile', async ({ page }) => {
			await advanceToStep3(page);
			await expect(page.locator('#new-password')).toBeVisible();
			await expect(page.locator('#confirm-password')).toBeVisible();
		});

		test('advances to step 4 on mobile', async ({ page }) => {
			await mockResetPasswordApi(page);
			await advanceToStep3(page);
			await page.locator('#new-password').fill('StrongPass1!');
			await page.locator('#confirm-password').fill('StrongPass1!');
			await page.getByRole('button', { name: /set new password/i }).click();
			await expect(page.getByText('Password changed!')).toBeVisible({ timeout: 8000 });
		});
	});
});
