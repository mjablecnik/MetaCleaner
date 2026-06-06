import { test, expect, type Page } from 'playwright/test';

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
			await expect(
				page.getByRole('heading', { level: 1, name: /cleaning complete/i })
			).toBeVisible({ timeout: 10000 });
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
			await expect(page.getByText('photo.jpg')).toBeVisible();
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

			await expect(
				page.getByRole('heading', { level: 1, name: /cleaning complete/i })
			).toBeVisible({ timeout: 10000 });
			await expect(page.getByText('100% Successfully completed')).toBeVisible();
		});

		test('success state shows file results for the processed file', async ({ page }) => {
			await page.goto('/');
			await uploadFile(page);

			const startBtn = page.locator('.hidden.lg\\:block').getByRole('button', {
				name: /start cleaning/i
			});
			await startBtn.click();

			await expect(
				page.getByRole('heading', { level: 1, name: /cleaning complete/i })
			).toBeVisible({ timeout: 10000 });
			await expect(page.getByText('photo.jpg')).toBeVisible();
		});

		test('success state shows summary stats', async ({ page }) => {
			await page.goto('/');
			await uploadFile(page);

			const startBtn = page.locator('.hidden.lg\\:block').getByRole('button', {
				name: /start cleaning/i
			});
			await startBtn.click();

			await expect(
				page.getByRole('heading', { level: 1, name: /cleaning complete/i })
			).toBeVisible({ timeout: 10000 });
			await expect(page.getByText('Files processed')).toBeVisible();
			await expect(page.getByText('Metadata fields removed')).toBeVisible();
		});

		test('no URL navigation occurs during processing state', async ({ page }) => {
			const urlChanges: string[] = [];
			page.on('framenavigated', (frame) => {
				if (frame === page.mainFrame()) urlChanges.push(frame.url());
			});

			await page.goto('/');
			urlChanges.length = 0; // reset after initial navigation

			await uploadFile(page);

			const startBtn = page.locator('.hidden.lg\\:block').getByRole('button', {
				name: /start cleaning/i
			});
			await startBtn.click();

			await expect(
				page.getByRole('heading', { level: 1, name: /cleaning complete/i })
			).toBeVisible({ timeout: 10000 });

			// No further navigations should have occurred after upload
			expect(urlChanges).toHaveLength(0);
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

			await expect(
				page.getByRole('heading', { level: 1, name: /cleaning complete/i })
			).toBeVisible({ timeout: 10000 });
			expect(page.url()).toMatch(/\/$/);
		});

		test('processing badge shows on mobile after Start Cleaning', async ({ page }) => {
			await page.goto('/');
			await uploadFile(page);

			const mobileBar = page.locator('.fixed.bottom-0');
			await mobileBar.getByRole('button', { name: /start cleaning/i }).click();

			// Mobile processing badge text
			await expect(page.getByText('In progress...')).toBeVisible();
			expect(page.url()).toMatch(/\/$/);
		});

		test('success state renders on mobile after completion', async ({ page }) => {
			await page.goto('/');
			await uploadFile(page);

			const mobileBar = page.locator('.fixed.bottom-0');
			await mobileBar.getByRole('button', { name: /start cleaning/i }).click();

			await expect(
				page.getByRole('heading', { level: 1, name: /cleaning complete/i })
			).toBeVisible({ timeout: 10000 });
			await expect(page.getByText('100% Successfully completed')).toBeVisible();
		});

		test('mobile fixed bottom CTA appears in success state', async ({ page }) => {
			await page.goto('/');
			await uploadFile(page);

			const mobileBar = page.locator('.fixed.bottom-0');
			await mobileBar.getByRole('button', { name: /start cleaning/i }).click();

			await expect(
				page.getByRole('heading', { level: 1, name: /cleaning complete/i })
			).toBeVisible({ timeout: 10000 });

			// Mobile success CTA bar should have download/report buttons
			const successBar = page.locator('.fixed.bottom-0');
			await expect(successBar.getByRole('button', { name: /download all/i })).toBeVisible();
		});
	});
});
