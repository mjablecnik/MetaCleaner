import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.addInitScript(() => {
		localStorage.setItem('PARAGLIDE_LOCALE', 'en');
	});
	// Use desktop viewport so the desktop plans grid is visible
	await page.setViewportSize({ width: 1280, height: 800 });
});

test.describe('Pricing page — static content', () => {
	test('has correct title', async ({ page }) => {
		await page.goto('/pricing');
		await expect(page).toHaveTitle('MetaCleaner — Pricing');
	});

	test('header shows Pricing title and subtitle', async ({ page }) => {
		await page.goto('/pricing');
		// Desktop header is inside hidden md:block — visible at 1280px
		await expect(page.getByRole('heading', { name: 'Pricing', exact: true }).first()).toBeVisible();
		await expect(
			page.getByText('Simple pricing. Credits never expire.', { exact: true }).first()
		).toBeVisible();
	});

	test('4 plan cards are present', async ({ page }) => {
		await page.goto('/pricing');
		// Desktop plans grid (hidden md:flex, visible at 1280px)
		const desktopPlans = page.locator('.hidden.md\\:flex');
		await expect(desktopPlans.getByText('Free', { exact: true })).toBeVisible();
		await expect(desktopPlans.getByText('50 photos', { exact: true })).toBeVisible();
		await expect(desktopPlans.getByText('Pro', { exact: true })).toBeVisible();
		await expect(desktopPlans.getByText('Pro+', { exact: true })).toBeVisible();
	});

	test('plan prices are shown', async ({ page }) => {
		await page.goto('/pricing');
		const desktopPlans = page.locator('.hidden.md\\:flex');
		await expect(desktopPlans.getByText('€0').first()).toBeVisible();
		await expect(desktopPlans.getByText('€4').first()).toBeVisible();
		await expect(desktopPlans.getByText('€5,99').first()).toBeVisible();
	});

	test('Pro plan has Most Popular badge', async ({ page }) => {
		await page.goto('/pricing');
		await expect(page.getByText('Most Popular', { exact: true }).first()).toBeVisible();
	});

	test('Pro+ plan has Coming soon CTA', async ({ page }) => {
		await page.goto('/pricing');
		// Scope to the desktop plans container to avoid strict-mode violation from dual mobile/desktop markup
		const desktopPlans = page.locator('.hidden.md\\:flex');
		await expect(desktopPlans.getByText('Coming soon', { exact: true })).toBeVisible();
	});

	test('enterprise banner is present', async ({ page }) => {
		await page.goto('/pricing');
		const desktopPlans = page.locator('.hidden.md\\:flex');
		await expect(desktopPlans.getByText('Enterprise — custom', { exact: true })).toBeVisible();
		await expect(desktopPlans.getByText('Contact us →', { exact: true })).toBeVisible();
	});
});

test.describe('Pricing page — billing toggle', () => {
	test('defaults to monthly billing with correct Pro price', async ({ page }) => {
		await page.goto('/pricing');
		// Monthly button should be active (has bg-brand-blue class) by default
		const monthlyBtn = page.getByRole('button', { name: 'Monthly', exact: true }).first();
		await expect(monthlyBtn).toBeVisible();
		// Pro monthly price
		const desktopPlans = page.locator('.hidden.md\\:flex');
		await expect(desktopPlans.getByText('€5,99').first()).toBeVisible();
	});

	test('switching to Yearly updates Pro price and shows save amount', async ({ page }) => {
		await page.goto('/pricing');
		const desktopPlans = page.locator('.hidden.md\\:flex');

		// Monthly Pro price is visible initially
		await expect(desktopPlans.getByText('€5,99').first()).toBeVisible();

		// Click Yearly toggle
		await page.getByRole('button', { name: /Yearly/ }).first().click();

		// Pro yearly price should now be visible
		await expect(desktopPlans.getByText('€57,51').first()).toBeVisible();

		// Monthly price should no longer be shown
		await expect(desktopPlans.getByText('€5,99')).not.toBeVisible();

		// Yearly badge −20% is shown in the toggle
		await expect(page.getByText('−20%').first()).toBeVisible();
	});

	test('switching back to Monthly reverts Pro price', async ({ page }) => {
		await page.goto('/pricing');
		const desktopPlans = page.locator('.hidden.md\\:flex');

		// Switch to yearly
		await page.getByRole('button', { name: /Yearly/ }).first().click();
		await expect(desktopPlans.getByText('€57,51').first()).toBeVisible();

		// Switch back to monthly
		await page.getByRole('button', { name: 'Monthly', exact: true }).first().click();
		await expect(desktopPlans.getByText('€5,99').first()).toBeVisible();
		await expect(desktopPlans.getByText('€57,51')).not.toBeVisible();
	});
});
