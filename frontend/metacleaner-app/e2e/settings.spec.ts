import { test, expect } from 'playwright/test';
import { injectAuth } from './helpers/auth.js';
import { mockBillingApi, mockApiKeysListApi } from './helpers/mock-api.js';

test.beforeEach(async ({ page }) => {
	await injectAuth(page);
	await mockBillingApi(page);
	await mockApiKeysListApi(page);
});

async function goToSettings(page: import('playwright/test').Page) {
	await page.goto('/settings');
	await expect(page.getByRole('heading', { level: 1, name: /account settings/i })).toBeVisible({
		timeout: 8000
	});
}

test.describe('Settings page', () => {
	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('renders page heading', async ({ page }) => {
			await goToSettings(page);
			await expect(
				page.getByRole('heading', { level: 1, name: /account settings/i })
			).toBeVisible();
		});

		test('renders subtitle', async ({ page }) => {
			await goToSettings(page);
			await expect(page.getByText(/manage your profile, security, and api access/i)).toBeVisible();
		});

		test('renders Account Info section', async ({ page }) => {
			await goToSettings(page);
			await expect(page.getByText('Account Info').first()).toBeVisible();
		});

		test('renders Change Password section', async ({ page }) => {
			await goToSettings(page);
			await expect(page.getByText('Change Password').first()).toBeVisible();
		});

		test('renders API Keys section', async ({ page }) => {
			await goToSettings(page);
			await expect(page.getByText('API Keys').first()).toBeVisible();
		});

		test('renders Affiliate Program section', async ({ page }) => {
			await goToSettings(page);
			await expect(page.getByText('Affiliate Program').first()).toBeVisible();
		});

		test('renders Danger Zone section on desktop', async ({ page }) => {
			await goToSettings(page);
			await expect(page.getByText('Danger Zone').first()).toBeVisible();
		});

		test('shows Create new key button in API Keys section', async ({ page }) => {
			await goToSettings(page);
			await expect(
				page
					.locator('button')
					.filter({ hasText: /create new key/i })
					.first()
			).toBeVisible();
		});

		test('shows the existing API key in the list', async ({ page }) => {
			await goToSettings(page);
			// Wait for API keys to load (async fetch)
			await expect(page.getByText('My Test Key').first()).toBeVisible({ timeout: 8000 });
		});

		test('shows Verified badge on Account Info', async ({ page }) => {
			await goToSettings(page);
			await expect(page.getByText('Verified').first()).toBeVisible();
		});

		test('Account Info section loads user data from /api/auth/me', async ({ page }) => {
			await goToSettings(page);
			// AccountInfoSection fetches /api/auth/me (mocked by injectAuth to return test@example.com)
			await expect(page.locator('input[id="email"]')).toHaveValue('test@example.com', {
				timeout: 8000
			});
		});

		test('shows Delete Account button in Danger Zone', async ({ page }) => {
			await goToSettings(page);
			await expect(
				page
					.locator('button')
					.filter({ hasText: /delete account/i })
					.first()
			).toBeVisible();
		});
	});

	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('renders page heading on mobile', async ({ page }) => {
			await goToSettings(page);
			await expect(
				page.getByRole('heading', { level: 1, name: /account settings/i })
			).toBeVisible();
		});

		test('renders Account Info section on mobile', async ({ page }) => {
			await goToSettings(page);
			await expect(page.getByText('Account Info').first()).toBeVisible();
		});

		test('renders API Keys section on mobile', async ({ page }) => {
			await goToSettings(page);
			await expect(page.getByText('API Keys').first()).toBeVisible();
		});

		test('Danger Zone section is visible on mobile (at the bottom)', async ({ page }) => {
			await goToSettings(page);
			await expect(page.getByText('Danger Zone').first()).toBeVisible();
		});
	});
});
