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
		// correct anchor links are present as a structural check — scoped to drawer to
		// avoid strict mode violations with matching footer/desktop nav links
		const drawer = page.locator('div.fixed.top-0.right-0.h-full');
		await expect(drawer.locator('a[href="/#how-it-works"]')).toBeAttached();
		await expect(drawer.locator('a[href="/#why-it-matters"]')).toBeAttached();
		await expect(drawer.locator('a[href="/#who-its-for"]')).toBeAttached();
		await expect(drawer.locator('a[href="/#faq"]')).toBeAttached();
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

test.describe('Mobile menu — drawer on /features and /pricing pages', () => {
	test('drawer on /features page opens and shows navigation links', async ({ page }) => {
		await page.goto('/features');
		// Backdrop is absent when drawer is closed
		const backdrop = page.locator('div.fixed.inset-0.bg-black\\/60');
		await expect(backdrop).not.toBeAttached();

		await page.getByRole('button', { name: 'Open menu' }).click();

		// Backdrop present confirms drawer is open
		await expect(backdrop).toBeAttached();
		// Drawer contains navigation links — use filter to avoid FA icon accessible-name issues
		const drawer = page.locator('div.fixed.top-0.right-0.h-full');
		await expect(drawer.locator('a').filter({ hasText: 'Features' })).toBeVisible();
		await expect(drawer.locator('a').filter({ hasText: 'Pricing' })).toBeVisible();
	});

	test('drawer on /pricing page opens and shows navigation links', async ({ page }) => {
		await page.goto('/pricing');
		const backdrop = page.locator('div.fixed.inset-0.bg-black\\/60');
		await expect(backdrop).not.toBeAttached();

		await page.getByRole('button', { name: 'Open menu' }).click();

		await expect(backdrop).toBeAttached();
		const drawer = page.locator('div.fixed.top-0.right-0.h-full');
		await expect(drawer.locator('a').filter({ hasText: 'Features' })).toBeVisible();
		await expect(drawer.locator('a').filter({ hasText: 'Pricing' })).toBeVisible();
	});

	test('clicking a drawer link navigates and closes the menu', async ({ page }) => {
		await page.goto('/features');
		await page.getByRole('button', { name: 'Open menu' }).click();

		const drawer = page.locator('div.fixed.top-0.right-0.h-full');
		await expect(drawer).toBeVisible();

		// Click Pricing link inside the drawer — filter by text to avoid FA icon accessible-name issues
		await drawer.locator('a').filter({ hasText: 'Pricing' }).click();
		await page.waitForURL(/\/pricing$/);

		// Menu should be closed after navigation (aria-label reverts to "Open menu")
		await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible();
	});

	test('closing drawer via close button hides the panel', async ({ page }) => {
		await page.goto('/pricing');
		await page.getByRole('button', { name: 'Open menu' }).click();

		const backdrop = page.locator('div.fixed.inset-0.bg-black\\/60');
		await expect(backdrop).toBeAttached();

		// Use .last() — the X button inside the drawer panel, not the hamburger in MobileNavbar
		await page.getByRole('button', { name: 'Close menu' }).last().click();
		await expect(backdrop).not.toBeAttached();
	});
});
