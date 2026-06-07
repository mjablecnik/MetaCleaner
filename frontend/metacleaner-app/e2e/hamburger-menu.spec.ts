import { test, expect, type Page } from 'playwright/test';
import { mockReportsApi, mockReportDetail } from './helpers/mock-api';

// All hamburger menu tests use mobile viewport
test.use({ viewport: { width: 375, height: 812 } });

async function openHamburger(page: Page) {
	const btn = page.getByRole('button', { name: 'Open menu' });
	await btn.click();
	await expect(page.getByRole('button', { name: 'Close menu' })).toBeVisible();
}

// Requirements 3.1, 3.2, 3.3, 27.3

test.describe('Mobile hamburger menu — main page (/)', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('hamburger button is visible on mobile', async ({ page }) => {
		await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible();
	});

	test('clicking hamburger opens the menu and icon changes to xmark', async ({ page }) => {
		const btn = page.getByRole('button', { name: 'Open menu' });
		await btn.click();

		// Icon must be xmark when open
		await expect(page.getByRole('button', { name: 'Close menu' })).toBeVisible();
		const icon = page.locator('#nav-hamburgerDropdown .fa-xmark');
		await expect(icon).toBeVisible();
	});

	test('clicking hamburger again closes the menu and icon reverts to bars', async ({ page }) => {
		await openHamburger(page);
		await page.getByRole('button', { name: 'Close menu' }).click();

		// Icon must be bars when closed
		const icon = page.locator('#nav-hamburgerDropdown .fa-bars');
		await expect(icon).toBeVisible();
		await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible();
	});

	test('open menu contains language options: Czech, English, German, Slovak', async ({
		page
	}) => {
		await openHamburger(page);

		const menu = page.locator('#nav-hamburgerDropdown .lang-dropdown-menu');
		await expect(menu.getByText('Čeština')).toBeVisible();
		await expect(menu.getByText('English')).toBeVisible();
		await expect(menu.getByText('Deutsch')).toBeVisible();
		await expect(menu.getByText('Slovenčina')).toBeVisible();
	});

	test('open menu contains settings option', async ({ page }) => {
		await openHamburger(page);
		const menu = page.locator('#nav-hamburgerDropdown .lang-dropdown-menu');
		await expect(menu.getByText(/settings/i)).toBeVisible();
	});

	test('open menu contains logout option', async ({ page }) => {
		await openHamburger(page);
		const menu = page.locator('#nav-hamburgerDropdown .lang-dropdown-menu');
		await expect(menu.getByText(/log out/i)).toBeVisible();
	});

	test('active language has a checkmark', async ({ page }) => {
		await openHamburger(page);
		const menu = page.locator('#nav-hamburgerDropdown .lang-dropdown-menu');
		// Default locale is 'en' or 'cs' — either way a checkmark must be present
		await expect(menu.locator('.lang-option.active .fa-check')).toBeVisible();
	});

	test('clicking a language option closes the menu', async ({ page }) => {
		await openHamburger(page);
		const menu = page.locator('#nav-hamburgerDropdown .lang-dropdown-menu');
		// Click the English option
		await menu.getByText('English').click();

		// Menu should be closed after language selection
		await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible();
	});

	test('desktop dropdowns (language, user) are not visible on mobile', async ({ page }) => {
		// Desktop nav items are hidden via lg:hidden / hidden lg:flex
		const desktopNav = page.locator('nav .hidden.items-center.gap-3.lg\\:flex');
		await expect(desktopNav).not.toBeVisible();
	});
});

test.describe('Mobile hamburger menu — reports page (/reports)', () => {
	test.beforeEach(async ({ page }) => {
		await mockReportsApi(page);
		await page.goto('/reports');
	});

	test('hamburger button is visible on reports page', async ({ page }) => {
		await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible();
	});

	test('clicking hamburger opens the menu on reports page', async ({ page }) => {
		await openHamburger(page);
		const menu = page.locator('#nav-hamburgerDropdown .lang-dropdown-menu');
		await expect(menu).toBeVisible();
	});

	test('reports page hamburger menu contains language options', async ({ page }) => {
		await openHamburger(page);
		const menu = page.locator('#nav-hamburgerDropdown .lang-dropdown-menu');
		await expect(menu.getByText('English')).toBeVisible();
		await expect(menu.getByText('Čeština')).toBeVisible();
	});

	test('reports page hamburger menu contains logout option', async ({ page }) => {
		await openHamburger(page);
		const menu = page.locator('#nav-hamburgerDropdown .lang-dropdown-menu');
		await expect(menu.getByText(/log out/i)).toBeVisible();
	});

	test('hamburger icon toggles bars↔xmark on reports page', async ({ page }) => {
		// Initially bars
		await expect(page.locator('#nav-hamburgerDropdown .fa-bars')).toBeVisible();

		// After open → xmark
		await openHamburger(page);
		await expect(page.locator('#nav-hamburgerDropdown .fa-xmark')).toBeVisible();

		// After close → bars again
		await page.getByRole('button', { name: 'Close menu' }).click();
		await expect(page.locator('#nav-hamburgerDropdown .fa-bars')).toBeVisible();
	});
});

test.describe('Mobile hamburger menu — report detail page (/report/[id])', () => {
	test.beforeEach(async ({ page }) => {
		await mockReportsApi(page);
		await page.goto('/report/rpt-001');
		// Wait for report detail content to load (in-memory service returns MC-2025-001, not rpt-001)
		await expect(page.getByText(mockReportDetail.reportId)).toBeVisible({ timeout: 8000 });
	});

	test('hamburger button is visible on report detail page', async ({ page }) => {
		await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible();
	});

	test('clicking hamburger opens menu on report detail page', async ({ page }) => {
		await openHamburger(page);
		const menu = page.locator('#nav-hamburgerDropdown .lang-dropdown-menu');
		await expect(menu).toBeVisible();
	});

	test('report detail page hamburger menu contains language options', async ({ page }) => {
		await openHamburger(page);
		const menu = page.locator('#nav-hamburgerDropdown .lang-dropdown-menu');
		await expect(menu.getByText('English')).toBeVisible();
		await expect(menu.getByText('Čeština')).toBeVisible();
		await expect(menu.getByText('Deutsch')).toBeVisible();
		await expect(menu.getByText('Slovenčina')).toBeVisible();
	});

	test('report detail page hamburger menu contains settings and logout', async ({ page }) => {
		await openHamburger(page);
		const menu = page.locator('#nav-hamburgerDropdown .lang-dropdown-menu');
		await expect(menu.getByText(/settings/i)).toBeVisible();
		await expect(menu.getByText(/log out/i)).toBeVisible();
	});

	test('hamburger icon toggles bars↔xmark on report detail page', async ({ page }) => {
		await expect(page.locator('#nav-hamburgerDropdown .fa-bars')).toBeVisible();
		await openHamburger(page);
		await expect(page.locator('#nav-hamburgerDropdown .fa-xmark')).toBeVisible();
		await page.getByRole('button', { name: 'Close menu' }).click();
		await expect(page.locator('#nav-hamburgerDropdown .fa-bars')).toBeVisible();
	});

	test('mobile back arrow is shown on report detail page', async ({ page }) => {
		// NavBar shows showBackButton on report detail → mobile arrow link
		await expect(page.getByRole('link', { name: /go back/i })).toBeVisible();
	});
});
