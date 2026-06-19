import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.addInitScript(() => {
		localStorage.setItem('PARAGLIDE_LOCALE', 'en');
	});
});

test.describe('Home page — static content', () => {
	test('has correct title', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveTitle('MetaCleaner — Protect Your Privacy');
	});

	test('all main sections are present', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('#hero')).toBeVisible();
		await expect(page.locator('#why-it-matters')).toBeVisible();
		await expect(page.locator('#how-it-works')).toBeVisible();
		await expect(page.locator('#who-its-for')).toBeVisible();
		await expect(page.locator('#faq')).toBeVisible();
	});

	test('hero section shows headline', async ({ page }) => {
		await page.goto('/');
		const hero = page.locator('#hero');
		await expect(hero.getByText('Protect Your Privacy', { exact: true })).toBeVisible();
		await expect(hero.getByText('Remove Metadata', { exact: true })).toBeVisible();
	});

	test('hero badge is in DOM (mobile-only element)', async ({ page }) => {
		await page.goto('/');
		// The badge is md:hidden (mobile-only); assert it is attached to the DOM
		await expect(
			page.locator('#hero').getByText('100% local processing', { exact: true })
		).toBeAttached();
	});

	test('upload card shows Clean Files heading and format badges', async ({ page }) => {
		await page.goto('/');
		const hero = page.locator('#hero');
		await expect(hero.getByText('Clean Files', { exact: true })).toBeVisible();
		for (const fmt of ['JPG', 'PNG', 'HEIC', 'WEBP']) {
			await expect(hero.getByText(fmt, { exact: true })).toBeVisible();
		}
	});

	test('audience section shows 6 cards', async ({ page }) => {
		await page.goto('/');
		const section = page.locator('#who-its-for');
		await expect(section.getByText('Journalists & Activists')).toBeVisible();
		await expect(section.getByText('Photographers & Creators')).toBeVisible();
		await expect(section.getByText('Businesses & Lawyers')).toBeVisible();
		await expect(section.getByText('Regular Users')).toBeVisible();
		await expect(section.getByText('Researchers & Academics')).toBeVisible();
		await expect(section.getByText('IT & Security Teams')).toBeVisible();
	});
});

test.describe('Home page — FAQ accordion', () => {
	test('FAQ items are collapsed by default and expand on click', async ({ page }) => {
		await page.goto('/');
		const faqSection = page.locator('#faq');
		const firstQuestion = 'Are my files safe? Are they uploaded to a server?';
		const firstAnswer =
			'No. MetaCleaner processes all files exclusively locally on your device. No file or metadata is ever sent to our servers. Your data stays 100% with you.';

		// Answer should not be visible initially
		await expect(faqSection.getByText(firstAnswer)).not.toBeVisible();

		// Click the question button — use filter to avoid strict-mode issues with FA icon text
		await faqSection.locator('button').filter({ hasText: firstQuestion }).click();

		// Answer should now be visible
		await expect(faqSection.getByText(firstAnswer)).toBeVisible();
	});

	test('FAQ item collapses when clicked again', async ({ page }) => {
		await page.goto('/');
		const faqSection = page.locator('#faq');
		const firstQuestion = 'Are my files safe? Are they uploaded to a server?';
		const firstAnswer =
			'No. MetaCleaner processes all files exclusively locally on your device. No file or metadata is ever sent to our servers. Your data stays 100% with you.';

		// Open the item
		await faqSection.locator('button').filter({ hasText: firstQuestion }).click();
		await expect(faqSection.getByText(firstAnswer)).toBeVisible();

		// Close the item
		await faqSection.locator('button').filter({ hasText: firstQuestion }).click();
		await expect(faqSection.getByText(firstAnswer)).not.toBeVisible();
	});

	test('FAQ section has 8 question buttons', async ({ page }) => {
		await page.goto('/');
		const faqSection = page.locator('#faq');
		// Each FAQ item renders one button (the question toggle)
		const buttons = faqSection.getByRole('button');
		await expect(buttons).toHaveCount(8);
	});
});
