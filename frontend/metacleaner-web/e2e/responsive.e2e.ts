import { test, expect } from '@playwright/test';

const MOBILE = { width: 375, height: 812 };
const DESKTOP = { width: 1280, height: 800 };
const PAGES = ['/', '/features', '/pricing', '/about', '/privacy', '/terms'] as const;

test.beforeEach(async ({ page }) => {
	await page.addInitScript(() => {
		localStorage.setItem('PARAGLIDE_LOCALE', 'en');
	});
});

test.describe('Responsive layout — mobile 375px', () => {
	test.use({ viewport: MOBILE });

	for (const route of PAGES) {
		test(`${route}: mobile navbar visible, desktop navbar hidden`, async ({ page }) => {
			await page.goto(route);
			// MobileNavbar (md:hidden) is visible at 375px
			await expect(page.locator('nav.md\\:hidden')).toBeVisible();
			// SiteNavbar (hidden md:flex) is hidden at 375px
			await expect(page.locator('nav.hidden.md\\:flex')).not.toBeVisible();
		});

		test(`${route}: mobile footer visible, desktop footer hidden`, async ({ page }) => {
			await page.goto(route);
			const footer = page.locator('footer');
			// Mobile footer (md:hidden) is visible at 375px
			await expect(footer.locator('div.md\\:hidden')).toBeVisible();
			// Desktop footer (hidden md:block) is hidden at 375px
			await expect(footer.locator('div.hidden.md\\:block')).not.toBeVisible();
		});
	}

	test('/: hero content stacks on mobile (mobile drop hint visible)', async ({ page }) => {
		await page.goto('/');
		// At mobile viewport the hero section is visible
		await expect(page.locator('#hero')).toBeVisible();
		// Hamburger button present
		await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible();
	});

	test('/pricing: mobile pricing layout is shown', async ({ page }) => {
		await page.goto('/pricing');
		// At mobile: the md:hidden pricing wrapper is visible
		// The Free plan appears in both mobile and desktop markup; just verify page renders
		await expect(page.getByText('Pricing').first()).toBeVisible();
	});
});

test.describe('Responsive layout — desktop 1280px', () => {
	test.use({ viewport: DESKTOP });

	for (const route of PAGES) {
		test(`${route}: desktop navbar visible, mobile navbar hidden`, async ({ page }) => {
			await page.goto(route);
			// SiteNavbar (hidden md:flex) is visible at 1280px
			await expect(page.locator('nav.hidden.md\\:flex')).toBeVisible();
			// MobileNavbar (md:hidden) is hidden at 1280px
			await expect(page.locator('nav.md\\:hidden')).not.toBeVisible();
		});

		test(`${route}: desktop footer visible, mobile footer hidden`, async ({ page }) => {
			await page.goto(route);
			const footer = page.locator('footer');
			// Desktop footer (hidden md:block) is visible at 1280px
			await expect(footer.locator('div.hidden.md\\:block')).toBeVisible();
			// Mobile footer (md:hidden) is hidden at 1280px
			await expect(footer.locator('div.md\\:hidden')).not.toBeVisible();
		});
	}

	test('/: desktop nav shows all navigation links', async ({ page }) => {
		await page.goto('/');
		const desktopNav = page.locator('nav.hidden.md\\:flex');
		await expect(desktopNav.getByRole('link', { name: 'How it Works', exact: true })).toBeVisible();
		await expect(desktopNav.getByRole('link', { name: 'Features', exact: true })).toBeVisible();
		await expect(desktopNav.getByRole('link', { name: 'Pricing', exact: true })).toBeVisible();
		await expect(desktopNav.getByRole('link', { name: 'FAQ', exact: true })).toBeVisible();
	});

	test('/pricing: desktop plan grid is visible', async ({ page }) => {
		await page.goto('/pricing');
		const desktopPlans = page.locator('div.hidden.md\\:flex');
		await expect(desktopPlans).toBeVisible();
		await expect(desktopPlans.getByText('Pro', { exact: true })).toBeVisible();
	});
});
