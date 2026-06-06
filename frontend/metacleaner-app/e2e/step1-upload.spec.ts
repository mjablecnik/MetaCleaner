import { test, expect } from 'playwright/test';

// Minimal JPEG (SOI + EOI): extension-based format detection accepts it.
const TEST_FILE = {
	name: 'photo.jpg',
	mimeType: 'image/jpeg',
	buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9])
};

test.describe('Step 1 — Upload', () => {
	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('renders page heading and upload zone', async ({ page }) => {
			await page.goto('/');

			await expect(page.getByRole('heading', { level: 1 })).toContainText('Metadata Cleaning');
			await expect(
				page.getByRole('heading', { level: 3, name: /upload files/i })
			).toBeVisible();
			// Drop zone has role=button; desktop text is "Drag files here"
			await expect(page.getByRole('button', { name: /drag files here/i })).toBeVisible();
		});

		test('Start Cleaning button is disabled with no files', async ({ page }) => {
			await page.goto('/');
			await expect(page.getByRole('button', { name: /start cleaning/i })).toBeDisabled();
		});

		test('file list appears after selecting files', async ({ page }) => {
			await page.goto('/');
			await page.locator('#dropzone-file-input').setInputFiles(TEST_FILE);

			await expect(page.getByText('Files to process')).toBeVisible();
			await expect(page.getByText('photo.jpg')).toBeVisible();
		});

		test('Start Cleaning button becomes enabled after selecting files', async ({ page }) => {
			await page.goto('/');
			await page.locator('#dropzone-file-input').setInputFiles(TEST_FILE);

			await expect(page.getByRole('button', { name: /start cleaning/i })).toBeEnabled();
		});

		test('RiskScannerCard sidebar is visible on desktop after adding files', async ({ page }) => {
			await page.goto('/');
			await page.locator('#dropzone-file-input').setInputFiles(TEST_FILE);

			// RiskScannerCard has a visible h3 "Risk Scanner" on desktop (hidden lg:flex container)
			await expect(page.getByRole('heading', { level: 3, name: 'Risk Scanner' })).toBeVisible();
		});

		test('Options button opens the cleaning options sheet', async ({ page }) => {
			await page.goto('/');

			// Sheet overlay is hidden before opening
			await expect(page.locator('.sheet-overlay')).not.toBeVisible();

			await page.getByRole('button', { name: /options/i }).click();

			await expect(page.locator('.sheet-overlay')).toBeVisible();
			await expect(page.getByRole('heading', { name: 'Cleaning options' })).toBeVisible();
		});

		test('navigates to /step2 after clicking Start Cleaning', async ({ page }) => {
			await page.goto('/');
			await page.locator('#dropzone-file-input').setInputFiles(TEST_FILE);
			await expect(page.getByText('photo.jpg')).toBeVisible();

			await page.getByRole('button', { name: /start cleaning/i }).click();

			await page.waitForURL('**/step2');
			await expect(page).toHaveURL(/\/step2/);
		});
	});

	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('renders page heading and mobile upload zone text', async ({ page }) => {
			await page.goto('/');

			await expect(page.getByRole('heading', { level: 1 })).toContainText('Metadata Cleaning');
			// Mobile drop zone text (hidden on desktop)
			await expect(page.getByText('Tap to select files')).toBeVisible();
		});

		test('Start Cleaning button is disabled with no files', async ({ page }) => {
			await page.goto('/');
			await expect(page.getByRole('button', { name: /start cleaning/i })).toBeDisabled();
		});

		test('file list and MobileRiskBanner appear after adding files', async ({ page }) => {
			await page.goto('/');
			await page.locator('#dropzone-file-input').setInputFiles(TEST_FILE);

			await expect(page.getByText('Files to process')).toBeVisible();
			await expect(page.getByText('photo.jpg')).toBeVisible();

			// MobileRiskBanner accordion button contains "Risk Scanner" (mobile only, lg:hidden)
			await expect(
				page.locator('button[type="button"]').filter({ hasText: 'Risk Scanner' }).first()
			).toBeVisible();
		});

		test('navigates to /step2 from mobile Start Cleaning button', async ({ page }) => {
			await page.goto('/');
			await page.locator('#dropzone-file-input').setInputFiles(TEST_FILE);
			await expect(page.getByText('photo.jpg')).toBeVisible();

			await page.getByRole('button', { name: /start cleaning/i }).click();

			await page.waitForURL('**/step2');
			await expect(page).toHaveURL(/\/step2/);
		});
	});
});
