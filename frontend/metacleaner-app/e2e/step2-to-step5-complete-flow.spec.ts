import { test, expect, type Page } from 'playwright/test';
import { injectAuth } from './helpers/auth.js';
import { mockAllApis, mockWebSocketProgress } from './helpers/mock-api.js';

// Minimal JPEG (SOI + EOI): accepted by extension/MIME validation.
const TEST_FILE = {
	name: 'photo.jpg',
	mimeType: 'image/jpeg',
	buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9])
};

async function uploadFile(page: Page) {
	await page.locator('#dropzone-file-input').setInputFiles(TEST_FILE);
	await expect(page.getByText('photo.jpg')).toBeVisible();
}

test.describe('Step 2 → Step 3 → Step 5 complete SPA flow', () => {
	test.beforeEach(async ({ page }) => {
		await injectAuth(page);
		await mockAllApis(page);
		await mockWebSocketProgress(page, 'success');
	});

	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('URL stays at / throughout the entire cleaning flow', async ({ page }) => {
			await page.goto('/');
			expect(page.url()).toMatch(/\/$/);

			await uploadFile(page);
			expect(page.url()).toMatch(/\/$/);

			// Click desktop Start Cleaning button
			const startBtn = page.locator('.hidden.lg\\:block').getByRole('button', {
				name: /start cleaning/i
			});
			await startBtn.click();
			expect(page.url()).toMatch(/\/$/);

			// Wait for success state
			await expect(page.getByRole('heading', { level: 1, name: /cleaning complete/i })).toBeVisible(
				{ timeout: 10000 }
			);
			expect(page.url()).toMatch(/\/$/);
		});

		test('processing state renders after clicking Start Cleaning', async ({ page }) => {
			await page.goto('/');
			await uploadFile(page);

			const startBtn = page.locator('.hidden.lg\\:block').getByRole('button', {
				name: /start cleaning/i
			});
			await startBtn.click();

			// Processing badge visible
			await expect(page.getByText('Cleaning in progress...')).toBeVisible();
			// File list is still shown under ProcessingFilesCard
			// photo.jpg appears multiple times in DOM during processing — use .first()
			await expect(page.getByText('photo.jpg').first()).toBeVisible();
			// URL unchanged
			expect(page.url()).toMatch(/\/$/);
		});

		test('success state renders after processing completes', async ({ page }) => {
			await page.goto('/');
			await uploadFile(page);

			const startBtn = page.locator('.hidden.lg\\:block').getByRole('button', {
				name: /start cleaning/i
			});
			await startBtn.click();

			await expect(page.getByRole('heading', { level: 1, name: /cleaning complete/i })).toBeVisible(
				{ timeout: 10000 }
			);
			await expect(page.getByText('100% Successfully completed').first()).toBeVisible();
		});

		test('success state shows file results for the processed file', async ({ page }) => {
			await page.goto('/');
			await uploadFile(page);

			const startBtn = page.locator('.hidden.lg\\:block').getByRole('button', {
				name: /start cleaning/i
			});
			await startBtn.click();

			await expect(page.getByRole('heading', { level: 1, name: /cleaning complete/i })).toBeVisible(
				{ timeout: 10000 }
			);
			await expect(page.getByText('photo.jpg')).toBeVisible();
		});

		test('success state shows summary stats', async ({ page }) => {
			await page.goto('/');
			await uploadFile(page);

			const startBtn = page.locator('.hidden.lg\\:block').getByRole('button', {
				name: /start cleaning/i
			});
			await startBtn.click();

			await expect(page.getByRole('heading', { level: 1, name: /cleaning complete/i })).toBeVisible(
				{ timeout: 10000 }
			);
			await expect(page.getByText('Files processed')).toBeVisible();
			await expect(page.getByText('Metadata fields removed')).toBeVisible();
		});

		test('no URL navigation occurs during processing state', async ({ page }) => {
			await page.goto('/');
			await uploadFile(page);

			const startBtn = page.locator('.hidden.lg\\:block').getByRole('button', {
				name: /start cleaning/i
			});
			await startBtn.click();

			await expect(page.getByRole('heading', { level: 1, name: /cleaning complete/i })).toBeVisible(
				{ timeout: 10000 }
			);

			// URL must remain at / throughout — SPA state machine does not change URLs
			expect(page.url()).toMatch(/\/$/);
		});

		test('idle state components are hidden during processing', async ({ page }) => {
			await page.goto('/');
			await uploadFile(page);

			const startBtn = page.locator('.hidden.lg\\:block').getByRole('button', {
				name: /start cleaning/i
			});
			await startBtn.click();

			// "Waiting for files" idle card should not be visible
			await expect(page.getByText('Waiting for files')).not.toBeVisible();
			// RiskScannerCard sidebar should not be visible during processing
			await expect(page.getByRole('heading', { level: 3, name: 'Risk Scanner' })).not.toBeVisible();
		});

		test('processing progress bar is visible during Step 3', async ({ page }) => {
			await page.goto('/');
			await uploadFile(page);

			const startBtn = page.locator('.hidden.lg\\:block').getByRole('button', {
				name: /start cleaning/i
			});
			await startBtn.click();

			// Overall progress section (from ProcessingFilesCard en.json key)
			await expect(page.getByText('Overall progress')).toBeVisible();
		});
	});

	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('URL stays at / throughout the entire cleaning flow on mobile', async ({ page }) => {
			await page.goto('/');
			expect(page.url()).toMatch(/\/$/);

			await uploadFile(page);
			expect(page.url()).toMatch(/\/$/);

			// Click mobile bottom CTA Start Cleaning button
			const mobileBar = page.locator('.fixed.bottom-0');
			await mobileBar.getByRole('button', { name: /start cleaning/i }).click();
			expect(page.url()).toMatch(/\/$/);

			await expect(page.getByRole('heading', { level: 1, name: /cleaning complete/i })).toBeVisible(
				{ timeout: 10000 }
			);
			expect(page.url()).toMatch(/\/$/);
		});

		test('processing badge shows on mobile after Start Cleaning', async ({ page }) => {
			await page.goto('/');
			await uploadFile(page);

			const mobileBar = page.locator('.fixed.bottom-0');
			await mobileBar.getByRole('button', { name: /start cleaning/i }).click();

			// Mobile processing badge text — use exact to avoid matching "Cleaning in progress..."
			await expect(page.getByText('In progress...', { exact: true })).toBeVisible();
			expect(page.url()).toMatch(/\/$/);
		});

		test('success state renders on mobile after completion', async ({ page }) => {
			await page.goto('/');
			await uploadFile(page);

			const mobileBar = page.locator('.fixed.bottom-0');
			await mobileBar.getByRole('button', { name: /start cleaning/i }).click();

			await expect(page.getByRole('heading', { level: 1, name: /cleaning complete/i })).toBeVisible(
				{ timeout: 10000 }
			);
			await expect(page.getByText('100% Successfully completed').first()).toBeVisible();
		});

		test('success state has download and report buttons on mobile', async ({ page }) => {
			await page.goto('/');
			await uploadFile(page);

			const mobileBar = page.locator('.fixed.bottom-0');
			await mobileBar.getByRole('button', { name: /start cleaning/i }).click();

			await expect(page.getByRole('heading', { level: 1, name: /cleaning complete/i })).toBeVisible(
				{ timeout: 10000 }
			);

			// Step5Success has no fixed bottom bar — action buttons are inline in FileResultsCard
			await expect(page.getByRole('button', { name: /download all/i }).first()).toBeVisible();
			await expect(page.getByRole('button', { name: /view report/i }).first()).toBeVisible();
		});
	});
});
