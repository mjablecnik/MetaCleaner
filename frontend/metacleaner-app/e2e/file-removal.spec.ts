import { test, expect } from 'playwright/test';
import { injectAuth } from './helpers/auth.js';

test.beforeEach(async ({ page }) => {
	await injectAuth(page);
});

// Two minimal valid JPEGs used across all test cases.
const FILE_A = {
	name: 'alpha.jpg',
	mimeType: 'image/jpeg',
	buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9])
};

const FILE_B = {
	name: 'beta.jpg',
	mimeType: 'image/jpeg',
	buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9])
};

const FILE_C = {
	name: 'gamma.jpg',
	mimeType: 'image/jpeg',
	buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9])
};

test.describe('File removal and last-file idle transition', () => {
	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('file list updates after removing one of several files', async ({ page }) => {
			await page.goto('/');

			// Upload two files
			await page.locator('#dropzone-file-input').setInputFiles(FILE_A);
			await page.locator('#dropzone-file-input').setInputFiles(FILE_B);

			await expect(page.getByText('alpha.jpg')).toBeVisible();
			await expect(page.getByText('beta.jpg')).toBeVisible();

			// Locate the row containing alpha.jpg and click its remove button (force=true to bypass opacity-0)
			const alphaRow = page.locator('.group', { hasText: 'alpha.jpg' }).first();
			await alphaRow.hover();
			await alphaRow.getByRole('button', { name: /remove file/i }).click({ force: true });

			// alpha.jpg is gone; beta.jpg remains
			await expect(page.getByText('alpha.jpg')).not.toBeVisible();
			await expect(page.getByText('beta.jpg')).toBeVisible();

			// App is still in files-ready state — Start Cleaning enabled, idle card hidden
			await expect(page.getByRole('button', { name: /start cleaning/i })).toBeEnabled();
			await expect(page.getByText('Waiting for files')).not.toBeVisible();
		});

		test('removing last file transitions to idle state on desktop', async ({ page }) => {
			await page.goto('/');

			// Upload a single file
			await page.locator('#dropzone-file-input').setInputFiles(FILE_A);
			await expect(page.getByText('alpha.jpg')).toBeVisible();
			await expect(page.getByText('Waiting for files')).not.toBeVisible();

			// Remove the only file
			const fileRow = page.locator('.group', { hasText: 'alpha.jpg' }).first();
			await fileRow.hover();
			await fileRow.getByRole('button', { name: /remove file/i }).click({ force: true });

			// File no longer visible
			await expect(page.getByText('alpha.jpg')).not.toBeVisible();

			// App transitions back to idle — StatusCardIdle re-appears
			await expect(page.getByText('Waiting for files')).toBeVisible();

			// Start Cleaning button is disabled in idle state
			await expect(page.getByRole('button', { name: /start cleaning/i })).toBeDisabled();
		});

		test('removing files one by one reduces the list count', async ({ page }) => {
			await page.goto('/');

			// Upload three files
			await page.locator('#dropzone-file-input').setInputFiles(FILE_A);
			await page.locator('#dropzone-file-input').setInputFiles(FILE_B);
			await page.locator('#dropzone-file-input').setInputFiles(FILE_C);

			// All three visible
			await expect(page.getByText('alpha.jpg')).toBeVisible();
			await expect(page.getByText('beta.jpg')).toBeVisible();
			await expect(page.getByText('gamma.jpg')).toBeVisible();

			// Remove first file
			const rowA = page.locator('.group', { hasText: 'alpha.jpg' }).first();
			await rowA.hover();
			await rowA.getByRole('button', { name: /remove file/i }).click({ force: true });
			await expect(page.getByText('alpha.jpg')).not.toBeVisible();

			// Remove second file
			const rowB = page.locator('.group', { hasText: 'beta.jpg' }).first();
			await rowB.hover();
			await rowB.getByRole('button', { name: /remove file/i }).click({ force: true });
			await expect(page.getByText('beta.jpg')).not.toBeVisible();

			// One file remaining — still in files-ready
			await expect(page.getByText('gamma.jpg')).toBeVisible();
			await expect(page.getByText('Waiting for files')).not.toBeVisible();

			// Remove last file
			const rowC = page.locator('.group', { hasText: 'gamma.jpg' }).first();
			await rowC.hover();
			await rowC.getByRole('button', { name: /remove file/i }).click({ force: true });

			// Idle state restored
			await expect(page.getByText('gamma.jpg')).not.toBeVisible();
			await expect(page.getByText('Waiting for files')).toBeVisible();
		});

		test('URL stays at / after removing all files', async ({ page }) => {
			await page.goto('/');
			await page.locator('#dropzone-file-input').setInputFiles(FILE_A);

			const fileRow = page.locator('.group', { hasText: 'alpha.jpg' }).first();
			await fileRow.hover();
			await fileRow.getByRole('button', { name: /remove file/i }).click({ force: true });

			// No navigation — SPA remains on /
			expect(page.url()).toMatch(/\/$/);
		});

		test('RiskScannerCard disappears after removing last file on desktop', async ({ page }) => {
			await page.goto('/');
			await page.locator('#dropzone-file-input').setInputFiles(FILE_A);

			await expect(page.getByRole('heading', { level: 3, name: 'Risk Scanner' })).toBeVisible();

			const fileRow = page.locator('.group', { hasText: 'alpha.jpg' }).first();
			await fileRow.hover();
			await fileRow.getByRole('button', { name: /remove file/i }).click({ force: true });

			await expect(page.getByRole('heading', { level: 3, name: 'Risk Scanner' })).not.toBeVisible();
		});
	});

	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('remove button is always visible on mobile without hover', async ({ page }) => {
			await page.goto('/');
			await page.locator('#dropzone-file-input').setInputFiles(FILE_A);

			// Remove button visible on mobile without any hover (opacity-100 on mobile)
			const fileRow = page.locator('.group', { hasText: 'alpha.jpg' }).first();
			const removeBtn = fileRow.getByRole('button', { name: /remove file/i });
			await expect(removeBtn).toBeVisible();
		});

		test('removing a file updates the list on mobile', async ({ page }) => {
			await page.goto('/');
			await page.locator('#dropzone-file-input').setInputFiles(FILE_A);
			await page.locator('#dropzone-file-input').setInputFiles(FILE_B);

			await expect(page.getByText('alpha.jpg')).toBeVisible();
			await expect(page.getByText('beta.jpg')).toBeVisible();

			// Tap remove on alpha.jpg
			const rowA = page.locator('.group', { hasText: 'alpha.jpg' }).first();
			await rowA.getByRole('button', { name: /remove file/i }).click();

			await expect(page.getByText('alpha.jpg')).not.toBeVisible();
			await expect(page.getByText('beta.jpg')).toBeVisible();
		});

		test('removing last file transitions to idle on mobile', async ({ page }) => {
			await page.goto('/');
			await page.locator('#dropzone-file-input').setInputFiles(FILE_A);

			await expect(page.getByText('alpha.jpg')).toBeVisible();

			// Remove the only file
			const fileRow = page.locator('.group', { hasText: 'alpha.jpg' }).first();
			await fileRow.getByRole('button', { name: /remove file/i }).click();

			// File gone
			await expect(page.getByText('alpha.jpg')).not.toBeVisible();

			// Idle state — StatusCardIdle visible
			await expect(page.getByText('Waiting for files')).toBeVisible();

			// MobileBottomCta exists in both idle and files-ready, but Start Cleaning is disabled in idle
			const mobileBar = page.locator('.fixed.bottom-0');
			await expect(mobileBar.getByRole('button', { name: /start cleaning/i })).toBeDisabled();
		});

		test('removing files one by one on mobile reduces list until idle', async ({ page }) => {
			await page.goto('/');

			await page.locator('#dropzone-file-input').setInputFiles(FILE_A);
			await page.locator('#dropzone-file-input').setInputFiles(FILE_B);

			// Remove alpha
			const rowA = page.locator('.group', { hasText: 'alpha.jpg' }).first();
			await rowA.getByRole('button', { name: /remove file/i }).click();
			await expect(page.getByText('alpha.jpg')).not.toBeVisible();
			await expect(page.getByText('beta.jpg')).toBeVisible();
			// Still files-ready — MobileRiskBanner present
			const riskBanner = page
				.locator('button[type="button"]')
				.filter({ hasText: 'Risk Scanner' })
				.first();
			await expect(riskBanner).toBeVisible();

			// Remove beta
			const rowB = page.locator('.group', { hasText: 'beta.jpg' }).first();
			await rowB.getByRole('button', { name: /remove file/i }).click();
			await expect(page.getByText('beta.jpg')).not.toBeVisible();

			// Idle — MobileRiskBanner gone, StatusCardIdle shown
			await expect(riskBanner).not.toBeVisible();
			await expect(page.getByText('Waiting for files')).toBeVisible();
		});
	});
});
