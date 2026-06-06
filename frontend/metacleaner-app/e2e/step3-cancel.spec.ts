import { test, expect, type Page } from 'playwright/test';

const TEST_FILE = {
	name: 'photo.jpg',
	mimeType: 'image/jpeg',
	buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9])
};

async function uploadFile(page: Page) {
	await page.locator('#dropzone-file-input').setInputFiles(TEST_FILE);
	await expect(page.getByText('photo.jpg')).toBeVisible();
}

async function enterProcessingState(page: Page, viewport: 'desktop' | 'mobile') {
	await uploadFile(page);

	if (viewport === 'desktop') {
		const startBtn = page.locator('.hidden.lg\\:block').getByRole('button', {
			name: /start cleaning/i
		});
		await startBtn.click();
	} else {
		const mobileBar = page.locator('.fixed.bottom-0');
		await mobileBar.getByRole('button', { name: /start cleaning/i }).click();
	}
}

test.describe('Step 3 cancel — Zastavit / Stop', () => {
	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('clicking Stop returns to files-ready state with files intact', async ({ page }) => {
			await page.goto('/');
			await enterProcessingState(page, 'desktop');

			// Verify processing state is active
			await expect(page.getByText('Cleaning in progress...')).toBeVisible();

			// Click the Stop button
			await page.getByRole('button', { name: /stop/i }).click();

			// Processing badge is gone
			await expect(page.getByText('Cleaning in progress...')).not.toBeVisible();

			// Files-ready state: RiskScannerCard visible
			await expect(page.getByRole('heading', { level: 3, name: 'Risk Scanner' })).toBeVisible();

			// Files are still intact in the list
			await expect(page.getByText('photo.jpg')).toBeVisible();
		});

		test('Start Cleaning button is enabled again after Stop', async ({ page }) => {
			await page.goto('/');
			await enterProcessingState(page, 'desktop');

			await expect(page.getByText('Cleaning in progress...')).toBeVisible();
			await page.getByRole('button', { name: /stop/i }).click();

			// Start Cleaning is re-enabled (files still present)
			await expect(page.getByRole('button', { name: /start cleaning/i }).first()).toBeEnabled();
		});

		test('URL stays at / after Stop', async ({ page }) => {
			await page.goto('/');
			await enterProcessingState(page, 'desktop');

			await expect(page.getByText('Cleaning in progress...')).toBeVisible();
			await page.getByRole('button', { name: /stop/i }).click();

			expect(page.url()).toMatch(/\/$/);
		});

		test('idle card is not shown after Stop (files still present)', async ({ page }) => {
			await page.goto('/');
			await enterProcessingState(page, 'desktop');

			await expect(page.getByText('Cleaning in progress...')).toBeVisible();
			await page.getByRole('button', { name: /stop/i }).click();

			// Should be in files-ready, not idle — "Waiting for files" must not appear
			await expect(page.getByText('Waiting for files')).not.toBeVisible();
		});

		test('can restart cleaning after Stop', async ({ page }) => {
			await page.goto('/');
			await enterProcessingState(page, 'desktop');

			await expect(page.getByText('Cleaning in progress...')).toBeVisible();
			await page.getByRole('button', { name: /stop/i }).click();

			// Re-enter processing by clicking Start Cleaning again
			const startBtn = page.locator('.hidden.lg\\:block').getByRole('button', {
				name: /start cleaning/i
			});
			await startBtn.click();

			// Processing state is active again
			await expect(page.getByText('Cleaning in progress...')).toBeVisible();
		});
	});

	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('clicking Stop on mobile returns to files-ready state with files intact', async ({
			page
		}) => {
			await page.goto('/');
			await enterProcessingState(page, 'mobile');

			// Verify processing state is active on mobile
			await expect(page.getByText('In progress...')).toBeVisible();

			// Click the Stop button
			await page.getByRole('button', { name: /stop/i }).click();

			// Processing badge is gone
			await expect(page.getByText('In progress...')).not.toBeVisible();

			// Files are still intact
			await expect(page.getByText('photo.jpg')).toBeVisible();
		});

		test('URL stays at / after Stop on mobile', async ({ page }) => {
			await page.goto('/');
			await enterProcessingState(page, 'mobile');

			await expect(page.getByText('In progress...')).toBeVisible();
			await page.getByRole('button', { name: /stop/i }).click();

			expect(page.url()).toMatch(/\/$/);
		});

		test('mobile fixed bottom CTA reappears after Stop', async ({ page }) => {
			await page.goto('/');
			await enterProcessingState(page, 'mobile');

			await expect(page.getByText('In progress...')).toBeVisible();
			await page.getByRole('button', { name: /stop/i }).click();

			// Mobile bottom CTA with Start Cleaning should be visible again in files-ready state
			const mobileBar = page.locator('.fixed.bottom-0');
			await expect(mobileBar.getByRole('button', { name: /start cleaning/i })).toBeVisible();
		});

		test('idle card is not shown after Stop on mobile (files still present)', async ({ page }) => {
			await page.goto('/');
			await enterProcessingState(page, 'mobile');

			await expect(page.getByText('In progress...')).toBeVisible();
			await page.getByRole('button', { name: /stop/i }).click();

			// Should be in files-ready, not idle
			await expect(page.getByText('Waiting for files')).not.toBeVisible();
		});
	});
});
