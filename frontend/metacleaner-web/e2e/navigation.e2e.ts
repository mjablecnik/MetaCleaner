import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 800 } });

test.beforeEach(async ({ page }) => {
	await page.addInitScript(() => {
		localStorage.setItem('PARAGLIDE_LOCALE', 'en');
	});
});

test.describe('Desktop navbar links', () => {
	test('brand logo navigates to home', async ({ page }) => {
		await page.goto('/features');
		const desktopNav = page.locator('nav.hidden.md\\:flex');
		// BrandLogo is the first link inside the nav
		await desktopNav.getByRole('link').first().click();
		await page.waitForURL(/localhost:4173\/$/);
		await expect(page.locator('#hero')).toBeVisible();
	});

	test('Features link navigates to /features', async ({ page }) => {
		await page.goto('/');
		const desktopNav = page.locator('nav.hidden.md\\:flex');
		await desktopNav.getByRole('link', { name: 'Features', exact: true }).click();
		await page.waitForURL(/\/features$/);
		await expect(page.locator('#features-header')).toBeVisible();
	});

	test('Pricing link navigates to /pricing', async ({ page }) => {
		await page.goto('/');
		const desktopNav = page.locator('nav.hidden.md\\:flex');
		await desktopNav.getByRole('link', { name: 'Pricing', exact: true }).click();
		await page.waitForURL(/\/pricing$/);
		await expect(page.getByRole('heading', { name: 'Pricing', exact: true }).first()).toBeVisible();
	});

	test('How it Works link navigates to home with hash', async ({ page }) => {
		await page.goto('/features');
		const desktopNav = page.locator('nav.hidden.md\\:flex');
		await desktopNav.getByRole('link', { name: 'How it Works', exact: true }).click();
		await expect(page).toHaveURL(/#how-it-works/);
	});

	test('FAQ link navigates to home with hash', async ({ page }) => {
		await page.goto('/features');
		const desktopNav = page.locator('nav.hidden.md\\:flex');
		await desktopNav.getByRole('link', { name: 'FAQ', exact: true }).click();
		await expect(page).toHaveURL(/#faq/);
	});

	test('active page is highlighted in desktop nav', async ({ page }) => {
		await page.goto('/features');
		const desktopNav = page.locator('nav.hidden.md\\:flex');
		// Active NavLink renders text-white; inactive renders text-text-muted
		const featuresLink = desktopNav.getByRole('link', { name: 'Features', exact: true });
		await expect(featuresLink).toHaveClass(/text-white/);
	});

	test('inactive links do not have active styling', async ({ page }) => {
		await page.goto('/features');
		const desktopNav = page.locator('nav.hidden.md\\:flex');
		const pricingLink = desktopNav.getByRole('link', { name: 'Pricing', exact: true });
		await expect(pricingLink).toHaveClass(/text-text-muted/);
	});
});

test.describe('Footer navigation links', () => {
	test('footer Features link navigates to /features', async ({ page }) => {
		await page.goto('/');
		const desktopFooter = page.locator('footer').locator('div.hidden.md\\:block');
		await desktopFooter.getByRole('link', { name: 'Features', exact: true }).click();
		await page.waitForURL(/\/features$/);
		await expect(page.locator('#features-header')).toBeVisible();
	});

	test('footer Pricing link navigates to /pricing', async ({ page }) => {
		await page.goto('/');
		const desktopFooter = page.locator('footer').locator('div.hidden.md\\:block');
		await desktopFooter.getByRole('link', { name: 'Pricing', exact: true }).click();
		await page.waitForURL(/\/pricing$/);
		await expect(page.getByRole('heading', { name: 'Pricing', exact: true }).first()).toBeVisible();
	});

	test('footer How it works link navigates to home with hash', async ({ page }) => {
		await page.goto('/features');
		const desktopFooter = page.locator('footer').locator('div.hidden.md\\:block');
		await desktopFooter.getByRole('link', { name: 'How it works', exact: true }).click();
		await expect(page).toHaveURL(/#how-it-works/);
	});

	test('footer FAQ link navigates to home with hash', async ({ page }) => {
		await page.goto('/features');
		const desktopFooter = page.locator('footer').locator('div.hidden.md\\:block');
		await desktopFooter.getByRole('link', { name: 'FAQ', exact: true }).click();
		await expect(page).toHaveURL(/#faq/);
	});

	test('footer placeholder links are present', async ({ page }) => {
		await page.goto('/');
		const desktopFooter = page.locator('footer').locator('div.hidden.md\\:block');
		await expect(
			desktopFooter.getByRole('link', { name: 'Privacy Policy', exact: true })
		).toBeVisible();
		await expect(
			desktopFooter.getByRole('link', { name: 'Terms of Service', exact: true })
		).toBeVisible();
		await expect(desktopFooter.getByRole('link', { name: 'About us', exact: true })).toBeVisible();
		await expect(desktopFooter.getByRole('link', { name: 'Contact', exact: true })).toBeVisible();
	});
});
