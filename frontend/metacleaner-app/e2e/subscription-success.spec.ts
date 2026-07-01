import { test, expect } from 'playwright/test';
import { injectAuth } from './helpers/auth.js';
import { mockBillingApi, mockSubscriptionPro, mockCreditsPro } from './helpers/mock-api.js';

// /subscription/success is a protected page that calls authStore.fetchSubscription()
// and billingStore.refresh() on mount. Mock the billing endpoints so it doesn't fail.

test.beforeEach(async ({ page }) => {
	await injectAuth(page);
	// fetchSubscription (auth) and billingStore.refresh() both hit /api/billing/subscription
	await mockBillingApi(page, mockSubscriptionPro, mockCreditsPro);
});

async function goToSuccess(page: import('playwright/test').Page) {
	await page.goto('/subscription/success');
	await expect(page.getByRole('heading', { level: 1, name: /payment successful/i })).toBeVisible({
		timeout: 8000
	});
}

test.describe('Subscription success page', () => {
	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('renders success heading', async ({ page }) => {
			await goToSuccess(page);
			await expect(
				page.getByRole('heading', { level: 1, name: /payment successful/i })
			).toBeVisible();
		});

		test('renders success icon', async ({ page }) => {
			await goToSuccess(page);
			await expect(page.locator('.fa-circle-check')).toBeVisible();
		});

		test('renders success description text', async ({ page }) => {
			await goToSuccess(page);
			await expect(page.getByText(/subscription has been activated/i)).toBeVisible();
		});

		test('renders "Start cleaning" link back to /', async ({ page }) => {
			await goToSuccess(page);
			const link = page.getByRole('link', { name: /start cleaning/i });
			await expect(link).toBeVisible();
			const href = await link.getAttribute('href');
			expect(href).toBe('/');
		});

		test('"Start cleaning" link navigates to /', async ({ page }) => {
			await goToSuccess(page);
			await page.getByRole('link', { name: /start cleaning/i }).click();
			await page.waitForURL('**/');
			await expect(page).toHaveURL(/\/$/);
		});
	});

	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('renders success heading on mobile', async ({ page }) => {
			await goToSuccess(page);
			await expect(
				page.getByRole('heading', { level: 1, name: /payment successful/i })
			).toBeVisible();
		});

		test('renders "Start cleaning" link on mobile', async ({ page }) => {
			await goToSuccess(page);
			await expect(page.getByRole('link', { name: /start cleaning/i })).toBeVisible();
		});
	});
});
