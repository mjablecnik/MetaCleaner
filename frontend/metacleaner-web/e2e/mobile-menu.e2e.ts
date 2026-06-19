import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 375, height: 812 } });

test.beforeEach(async ({ page }) => {
	await page.addInitScript(() => {
		localStorage.setItem('PARAGLIDE_LOCALE', 'en');
	});
});

test.describe('Mobile hamburger button', () => {
	test('hamburger button is visible and desktop nav is hidden at 375px', async ({ page }) => {
		await page.goto('/');
		// Mobile navbar (md:hidden) is visible
		const mobileNav = page.locator('nav.md\\:hidden');
		await expect(mobileNav).toBeVisible();
		// Desktop navbar (hidden md:flex) is not visible
		const desktopNav = page.locator('nav.hidden.md\\:flex');
		await expect(desktopNav).not.toBeVisible();
		// Hamburger button initially shows aria-label "Open menu"
		await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible();
	});

	test('clicking hamburger changes aria-label to Close menu', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: 'Open menu' }).click();
		await expect(page.getByRole('button', { name: 'Close menu' }).first()).toBeVisible();
	});
});

test.describe('Mobile menu — drawer variant (home page)', () => {
	test('opening drawer on home page shows backdrop and anchor links', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: 'Open menu' }).click();

		// Backdrop is only rendered when {#if open} — its presence confirms the drawer is open
		const backdrop = page.locator('div.fixed.inset-0.bg-black\\/60');
		await expect(backdrop).toBeAttached();

		// Drawer panel always stays in DOM (translate-x-full when closed); verify the
		// correct anchor links are present as a structural check
		await expect(page.locator('a[href="#how-it-works"]')).toBeAttached();
		await expect(page.locator('a[href="#why-it-matters"]')).toBeAttached();
		await expect(page.locator('a[href="#who-its-for"]')).toBeAttached();
		await expect(page.locator('a[href="#faq"]')).toBeAttached();
	});

	test('close button inside drawer closes the menu', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: 'Open menu' }).click();

		// The close button inside the drawer panel (aria-label "Close menu" from m.nav_close_menu())
		// Use .last() because MobileNavbar also shows "Close menu" on its hamburger when open
		await page.getByRole('button', { name: 'Close menu' }).last().click();

		// After closing: hamburger should revert to "Open menu"
		await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible();
		// Backdrop is gone
		const backdrop = page.locator('div.fixed.inset-0.bg-black\\/60');
		await expect(backdrop).not.toBeAttached();
	});

	test('drawer shows Log In and Register buttons', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: 'Open menu' }).click();
		// Drawer footer has Log In and Register links
		await expect(page.locator('a').filter({ hasText: 'Log In' }).last()).toBeAttached();
		await expect(page.locator('a').filter({ hasText: 'Register' }).last()).toBeAttached();
	});
});

test.describe('Mobile menu — dropdown variant (features and pricing pages)', () => {
	test('dropdown on /features page opens and shows navigation links', async ({ page }) => {
		await page.goto('/features');
		// Dropdown panel uses {open ? 'flex' : 'hidden'} — initially hidden
		const dropdown = page.locator('div.md\\:hidden.w-full.flex-col');
		await expect(dropdown).not.toBeVisible();

		await page.getByRole('button', { name: 'Open menu' }).click();

		// Panel should now be visible
		await expect(dropdown).toBeVisible();
		// Dropdown contains navigation links
		await expect(dropdown.getByRole('link', { name: 'Features', exact: true })).toBeVisible();
		await expect(dropdown.getByRole('link', { name: 'Pricing', exact: true })).toBeVisible();
	});

	test('dropdown on /pricing page opens and shows navigation links', async ({ page }) => {
		await page.goto('/pricing');
		const dropdown = page.locator('div.md\\:hidden.w-full.flex-col');
		await expect(dropdown).not.toBeVisible();

		await page.getByRole('button', { name: 'Open menu' }).click();

		await expect(dropdown).toBeVisible();
		await expect(dropdown.getByRole('link', { name: 'Features', exact: true })).toBeVisible();
		await expect(dropdown.getByRole('link', { name: 'Pricing', exact: true })).toBeVisible();
	});

	test('clicking a dropdown link navigates and closes the menu', async ({ page }) => {
		await page.goto('/features');
		await page.getByRole('button', { name: 'Open menu' }).click();

		const dropdown = page.locator('div.md\\:hidden.w-full.flex-col');
		await expect(dropdown).toBeVisible();

		// Click Pricing link inside the dropdown
		await dropdown.getByRole('link', { name: 'Pricing', exact: true }).click();
		await page.waitForURL(/\/pricing$/);

		// Menu should be closed after navigation (aria-label reverts to "Open menu")
		await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible();
	});

	test('closing dropdown via hamburger hides the panel', async ({ page }) => {
		await page.goto('/pricing');
		await page.getByRole('button', { name: 'Open menu' }).click();

		const dropdown = page.locator('div.md\\:hidden.w-full.flex-col');
		await expect(dropdown).toBeVisible();

		// Click the same button (now "Close menu") to close
		await page.getByRole('button', { name: 'Close menu' }).click();
		await expect(dropdown).not.toBeVisible();
	});
});
