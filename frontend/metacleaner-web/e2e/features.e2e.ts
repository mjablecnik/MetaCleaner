import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.addInitScript(() => {
		localStorage.setItem('PARAGLIDE_LOCALE', 'en');
	});
});

test.describe('Features page', () => {
	test('has correct title', async ({ page }) => {
		await page.goto('/features');
		await expect(page).toHaveTitle('MetaCleaner — Features');
	});

	test('features header section is present', async ({ page }) => {
		await page.goto('/features');
		const header = page.locator('#features-header');
		await expect(header).toBeVisible();
		await expect(header.getByText('Features', { exact: true })).toBeVisible();
		// The h1 has "Complete toolkit" as a text node followed by a <br> and a child element,
		// so use regex to avoid exact-text mismatch on the parent element
		await expect(header.getByText(/Complete toolkit/)).toBeVisible();
		await expect(header.getByText('for privacy protection', { exact: true })).toBeVisible();
	});

	test('all 6 feature sections are present with correct titles', async ({ page }) => {
		await page.goto('/features');

		const featureSections = [
			{ id: '#feature-exif', title: 'EXIF Metadata Removal' },
			{ id: '#feature-ai', title: 'AI Tool Detection' },
			{ id: '#feature-c2pa', title: 'C2PA Removal' },
			{ id: '#feature-risk', title: 'Risk Scanner' },
			{ id: '#feature-batch', title: 'Batch Processing' },
			{ id: '#feature-pdf', title: 'PDF Report' }
		];

		for (const { id, title } of featureSections) {
			const section = page.locator(id);
			await expect(section).toBeVisible();
			await expect(section.getByText(title, { exact: true })).toBeVisible();
		}
	});

	test('CTA section is present with correct heading', async ({ page }) => {
		await page.goto('/features');
		const cta = page.locator('#cta-section');
		await expect(cta).toBeVisible();
		await expect(cta.getByText('Get started for free', { exact: true })).toBeVisible();
	});
});
