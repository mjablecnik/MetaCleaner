import { test, expect, type Page } from 'playwright/test';
import { injectAuth } from './helpers/auth.js';

// All docs tests use desktop to keep the sidebar visible (hidden lg:block)
test.use({ viewport: { width: 1280, height: 800 } });

test.beforeEach(async ({ page }) => {
	await injectAuth(page);
});

async function goToDocs(page: Page, path = '/docs') {
	await page.goto(path);
	// Sidebar renders once auth is resolved
	await expect(page.locator('aside')).toBeVisible({ timeout: 8000 });
}

test.describe('Docs sidebar — visible on desktop', () => {
	test('sidebar is visible at /docs', async ({ page }) => {
		await goToDocs(page);
		await expect(page.locator('aside')).toBeVisible();
	});

	test('sidebar contains Introduction link', async ({ page }) => {
		await goToDocs(page);
		await expect(page.locator('aside').getByText('Introduction')).toBeVisible();
	});

	test('sidebar contains Authentication link', async ({ page }) => {
		await goToDocs(page);
		await expect(page.locator('aside').getByText('Authentication')).toBeVisible();
	});

	test('sidebar contains Error Codes link', async ({ page }) => {
		await goToDocs(page);
		await expect(page.locator('aside').getByText('Error Codes')).toBeVisible();
	});

	test('sidebar contains API Endpoints link', async ({ page }) => {
		await goToDocs(page);
		await expect(page.locator('aside').getByText('API Endpoints')).toBeVisible();
	});
});

test.describe('Docs page content — /docs (Introduction)', () => {
	test('renders Introduction heading', async ({ page }) => {
		await goToDocs(page, '/docs');
		await expect(page.getByRole('heading', { name: /introduction/i }).first()).toBeVisible();
	});

	test('renders intro subtitle', async ({ page }) => {
		await goToDocs(page, '/docs');
		await expect(page.getByText(/API Overview/i)).toBeVisible();
	});

	test('renders Quick Start section', async ({ page }) => {
		await goToDocs(page, '/docs');
		await expect(page.getByText(/Quick Start/i)).toBeVisible();
	});
});

test.describe('Docs page content — /docs/auth', () => {
	test('renders Authentication heading', async ({ page }) => {
		await goToDocs(page, '/docs/auth');
		await expect(page.getByRole('heading', { name: /authentication/i }).first()).toBeVisible();
	});

	test('renders auth subtitle', async ({ page }) => {
		await goToDocs(page, '/docs/auth');
		await expect(page.getByText(/Bearer Token/i)).toBeVisible();
	});
});

test.describe('Docs page content — /docs/errors', () => {
	test('renders Error Codes heading', async ({ page }) => {
		await goToDocs(page, '/docs/errors');
		await expect(page.getByRole('heading', { name: /error codes/i }).first()).toBeVisible();
	});

	test('renders errors subtitle', async ({ page }) => {
		await goToDocs(page, '/docs/errors');
		await expect(page.getByText(/HTTP Status Codes/i)).toBeVisible();
	});
});

test.describe('Docs page content — /docs/endpoints', () => {
	test('renders endpoints section', async ({ page }) => {
		await goToDocs(page, '/docs/endpoints');
		// Endpoints page contains at least one endpoint card
		await expect(page.locator('[data-section-id]').first()).toBeVisible({ timeout: 8000 });
	});
});

test.describe('Docs sidebar navigation', () => {
	test('clicking Authentication in sidebar navigates to /docs/auth', async ({ page }) => {
		await goToDocs(page, '/docs');
		await page.locator('aside').getByRole('link', { name: /authentication/i }).click();
		await page.waitForURL('**/docs/auth');
		await expect(page).toHaveURL(/\/docs\/auth/);
		await expect(page.getByRole('heading', { name: /authentication/i }).first()).toBeVisible();
	});

	test('clicking Error Codes in sidebar navigates to /docs/errors', async ({ page }) => {
		await goToDocs(page, '/docs');
		await page.locator('aside').getByRole('link', { name: /error codes/i }).click();
		await page.waitForURL('**/docs/errors');
		await expect(page).toHaveURL(/\/docs\/errors/);
		await expect(page.getByRole('heading', { name: /error codes/i }).first()).toBeVisible();
	});

	test('clicking Introduction in sidebar navigates to /docs', async ({ page }) => {
		await goToDocs(page, '/docs/auth');
		await page.locator('aside').getByRole('link', { name: /introduction/i }).click();
		await page.waitForURL('**/docs');
		await expect(page).toHaveURL(/\/docs$/);
		await expect(page.getByRole('heading', { name: /introduction/i }).first()).toBeVisible();
	});

	test('clicking API Endpoints in sidebar navigates to /docs/endpoints', async ({ page }) => {
		await goToDocs(page, '/docs');
		await page.locator('aside').getByRole('link', { name: /api endpoints/i }).click();
		await page.waitForURL('**/docs/endpoints');
		await expect(page).toHaveURL(/\/docs\/endpoints/);
	});
});
