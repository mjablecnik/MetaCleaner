import { test, expect } from '@playwright/test';

const CONTACT_API = '**/functions/v1/send-contact-email';

test.beforeEach(async ({ page }) => {
	await page.addInitScript(() => {
		localStorage.setItem('PARAGLIDE_LOCALE', 'en');
	});
});

test.describe('About page — static content', () => {
	test('has correct title', async ({ page }) => {
		await page.goto('/about');
		await expect(page).toHaveTitle('About Us | MetaCleaner');
	});

	test('hero shows "Privacy is" and "a fundamental right"', async ({ page }) => {
		await page.goto('/about');
		await expect(page.getByText('Privacy is', { exact: true })).toBeVisible();
		await expect(page.getByText(/a fundamental right/)).toBeVisible();
	});

	test('values section heading and all 6 value cards', async ({ page }) => {
		await page.goto('/about');
		await expect(page.getByRole('heading', { name: 'Our values', exact: true })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Privacy First', exact: true })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Transparency', exact: true })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Accessibility', exact: true })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Open Source', exact: true })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Security', exact: true })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Innovation', exact: true })).toBeVisible();
	});

	test('#contact section is visible and form heading is present', async ({ page }) => {
		await page.goto('/about');
		await expect(page.locator('#contact')).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Send a message', exact: true })).toBeVisible();
	});
});

test.describe('About page — contact form validation', () => {
	test('empty form shows required errors for all fields and makes no API call', async ({
		page
	}) => {
		let apiCalled = false;
		await page.route(CONTACT_API, (route) => {
			apiCalled = true;
			route.abort();
		});
		await page.goto('/about');

		await page.getByRole('button', { name: 'Send message', exact: true }).click();

		await expect(page.getByText('This field is required.').first()).toBeVisible();
		await expect(page.getByText('This field is required.')).toHaveCount(4);
		expect(apiCalled).toBe(false);
	});

	test('invalid email shows email validation error', async ({ page }) => {
		await page.goto('/about');

		await page.locator('#contact-name').fill('Ada Lovelace');
		await page.locator('#contact-email').fill('not-an-email');
		await page.locator('#contact-subject').fill('Question about metadata');
		await page.locator('#contact-message').fill('How is EXIF data handled during cleaning?');

		await page.getByRole('button', { name: 'Send message', exact: true }).click();

		await expect(
			page.getByText('Please enter a valid email address.', { exact: true })
		).toBeVisible();
	});
});

test.describe('About page — contact form submission', () => {
	test('success: shows success panel after 200 response', async ({ page }) => {
		await page.route(CONTACT_API, (route) =>
			route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' })
		);
		await page.goto('/about');

		await page.locator('#contact-name').fill('Ada Lovelace');
		await page.locator('#contact-email').fill('ada@example.com');
		await page.locator('#contact-subject').fill('Question about metadata');
		await page.locator('#contact-message').fill('How is EXIF data handled during cleaning?');

		await page.getByRole('button', { name: 'Send message', exact: true }).click();

		await expect(
			page.getByText("Your message has been sent successfully. We'll get back to you soon.", {
				exact: true
			})
		).toBeVisible();
	});

	test('rate limit: shows rate-limit error after 429 response', async ({ page }) => {
		await page.route(CONTACT_API, (route) =>
			route.fulfill({
				status: 429,
				contentType: 'application/json',
				body: '{"error":"rate_limit"}'
			})
		);
		await page.goto('/about');

		await page.locator('#contact-name').fill('Ada Lovelace');
		await page.locator('#contact-email').fill('ada@example.com');
		await page.locator('#contact-subject').fill('Question about metadata');
		await page.locator('#contact-message').fill('How is EXIF data handled during cleaning?');

		await page.getByRole('button', { name: 'Send message', exact: true }).click();

		await expect(
			page.getByText(
				"You've sent too many messages. Please wait a few minutes and try again.",
				{ exact: true }
			)
		).toBeVisible();
	});

	test('server error: shows generic error after 500 response', async ({ page }) => {
		await page.route(CONTACT_API, (route) =>
			route.fulfill({
				status: 500,
				contentType: 'application/json',
				body: '{"error":"Internal error"}'
			})
		);
		await page.goto('/about');

		await page.locator('#contact-name').fill('Ada Lovelace');
		await page.locator('#contact-email').fill('ada@example.com');
		await page.locator('#contact-subject').fill('Question about metadata');
		await page.locator('#contact-message').fill('How is EXIF data handled during cleaning?');

		await page.getByRole('button', { name: 'Send message', exact: true }).click();

		await expect(
			page.getByText('Something went wrong. Please try again later.', { exact: true })
		).toBeVisible();
	});
});
