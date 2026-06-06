import { test, expect, type Page } from 'playwright/test';

const TEST_FILE = {
	name: 'photo.jpg',
	mimeType: 'image/jpeg',
	buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9])
};

// Upload file and click Start Cleaning to enter the processing state (SPA — stays on /)
async function navigateToProcessing(page: Page, viewport: 'desktop' | 'mobile') {
	await page.goto('/');
	await page.locator('#dropzone-file-input').setInputFiles(TEST_FILE);
	await expect(page.getByText('photo.jpg')).toBeVisible();

	if (viewport === 'desktop') {
		const cleanBtn = page.locator('.hidden.lg\\:block').getByRole('button', { name: /start cleaning/i });
		await cleanBtn.click();
		// Wait for processing badge (desktop longer text)
		await expect(page.getByText('Cleaning in progress...')).toBeVisible();
	} else {
		const mobileBar = page.locator('.fixed.bottom-0');
		await mobileBar.getByRole('button', { name: /start cleaning/i }).click();
		// Wait for processing badge (mobile shorter text)
		await expect(page.getByText('In progress...')).toBeVisible();
	}
}

test.describe('Step 3 — Processing', () => {
	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('renders page heading and processing badge', async ({ page }) => {
			await navigateToProcessing(page, 'desktop');

			await expect(page.getByRole('heading', { level: 1 })).toContainText('Metadata Cleaning');
			await expect(page.getByText('Cleaning in progress...')).toBeVisible();
		});

		test('shows Files to process heading and uploaded file', async ({ page }) => {
			await navigateToProcessing(page, 'desktop');

			await expect(page.getByRole('heading', { level: 3, name: 'Files to process' })).toBeVisible();
			await expect(page.getByText('photo.jpg')).toBeVisible();
		});

		test('shows overall progress section', async ({ page }) => {
			await navigateToProcessing(page, 'desktop');

			await expect(page.getByText('Overall progress')).toBeVisible();
		});

		test('shows Processing status sidebar on desktop', async ({ page }) => {
			await navigateToProcessing(page, 'desktop');

			// ProcessingStatusCard is only visible on lg+ (hidden lg:flex wrapper)
			await expect(page.getByRole('heading', { level: 3, name: 'Processing status' })).toBeVisible();
			await expect(page.getByText('Metadata cleaning in progress')).toBeVisible();
		});

		test('shows processing stats on desktop', async ({ page }) => {
			await navigateToProcessing(page, 'desktop');

			await expect(page.getByText('Fields deleted').first()).toBeVisible();
			await expect(page.getByText('Done').first()).toBeVisible();
		});

		test('URL stays at / during processing', async ({ page }) => {
			await navigateToProcessing(page, 'desktop');
			expect(page.url()).toMatch(/\/$/);
		});

		test('transitions to success state after mock service completes', async ({ page }) => {
			await navigateToProcessing(page, 'desktop');

			await expect(page.getByRole('heading', { level: 1, name: /cleaning complete/i })).toBeVisible({ timeout: 10000 });
			// URL still at /
			expect(page.url()).toMatch(/\/$/);
		});
	});

	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('renders page heading and mobile processing badge', async ({ page }) => {
			await navigateToProcessing(page, 'mobile');

			await expect(page.getByRole('heading', { level: 1 })).toContainText('Metadata Cleaning');
			// Mobile badge uses shorter text
			await expect(page.getByText('In progress...')).toBeVisible();
		});

		test('shows Files to process heading and uploaded file on mobile', async ({ page }) => {
			await navigateToProcessing(page, 'mobile');

			await expect(page.getByRole('heading', { level: 3, name: 'Files to process' })).toBeVisible();
			await expect(page.getByText('photo.jpg')).toBeVisible();
		});

		test('shows overall progress section on mobile', async ({ page }) => {
			await navigateToProcessing(page, 'mobile');

			await expect(page.getByText('Overall progress')).toBeVisible();
		});

		test('Processing status sidebar is hidden on mobile', async ({ page }) => {
			await navigateToProcessing(page, 'mobile');

			// ProcessingStatusCard has .hidden.lg\\:flex wrapper — not visible on 375px
			const sidebar = page.locator('.hidden.lg\\:flex').filter({ hasText: 'Processing status' });
			await expect(sidebar).not.toBeVisible();
		});

		test('shows mobile stats (Fields deleted, Done)', async ({ page }) => {
			await navigateToProcessing(page, 'mobile');

			// MobileStatusCard shows "Fields deleted" label
			await expect(page.getByText('Fields deleted')).toBeVisible();
			await expect(page.getByText('Done')).toBeVisible();
		});

		test('URL stays at / during processing on mobile', async ({ page }) => {
			await navigateToProcessing(page, 'mobile');
			expect(page.url()).toMatch(/\/$/);
		});

		test('transitions to success state on mobile after mock service completes', async ({ page }) => {
			await navigateToProcessing(page, 'mobile');

			await expect(page.getByRole('heading', { level: 1, name: /cleaning complete/i })).toBeVisible({ timeout: 10000 });
			expect(page.url()).toMatch(/\/$/);
		});
	});
});
