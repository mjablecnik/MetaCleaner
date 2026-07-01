import { expect, test } from '@playwright/test';

const navItems = [
	{ label: 'Dashboard', href: '/' },
	{ label: 'Availability', href: '/dostupnost' },
	{ label: 'Errors & Crashes', href: '/chyby' },
	{ label: 'Database (Supabase)', href: '/databaze' },
	{ label: 'Runtime (Fly.io)', href: '/runtime' },
	{ label: 'Edge (Cloudflare)', href: '/edge' },
	{ label: 'Performance', href: '/performance' },
	{ label: 'Business Metrics', href: '/business' },
	{ label: 'Users', href: '/uzivatele' }
];

test.describe('Navigation', () => {
	test.beforeEach(async ({ context, page }) => {
		await context.addCookies([
			{ name: 'mc_session', value: 'e2e-test-secret', url: 'http://localhost:4173' }
		]);
		await page.setViewportSize({ width: 1280, height: 800 });
	});

	for (const item of navItems) {
		test(`clicking "${item.label}" navigates to ${item.href}`, async ({ page }) => {
			await page.goto('/');
			await page.locator('a').filter({ hasText: item.label }).first().click();
			await expect(page).toHaveURL(item.href);
			await expect(page.locator('h1').first()).toBeVisible();
		});
	}

	test('Settings link href points to /nastaveni (dangling route — not navigated)', async ({
		page
	}) => {
		await page.goto('/');
		const settingsLink = page.locator('a').filter({ hasText: 'Settings' }).first();
		await expect(settingsLink).toBeVisible();
		const href = await settingsLink.getAttribute('href');
		expect(href).toContain('/nastaveni');
	});
});
