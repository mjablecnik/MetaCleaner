import { test, expect, type Page } from 'playwright/test';
import { injectAuth } from './helpers/auth.js';
import { mockAllApis, mockWebSocketProgress } from './helpers/mock-api.js';

// Use 3 files so processing takes ~2.4s — enough time for assertions before success state
const TEST_FILES = [
	{ name: 'photo.jpg', mimeType: 'image/jpeg', buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9]) },
	{ name: 'photo2.jpg', mimeType: 'image/jpeg', buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9]) },
	{ name: 'photo3.jpg', mimeType: 'image/jpeg', buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9]) }
];

// Upload files and click Start Cleaning to enter the processing state (SPA — stays on /)
async function navigateToProcessing(page: Page, viewport: 'desktop' | 'mobile') {
	await page.goto('/');
	await page.locator('#dropzone-file-input').setInputFiles(TEST_FILES);
	await expect(page.getByText('photo.jpg').first()).toBeVisible();

	if (viewport === 'desktop') {
		const cleanBtn = page
			.locator('.hidden.lg\\:block')
			.getByRole('button', { name: /start cleaning/i });
		await cleanBtn.click();
		// Wait for processing badge (desktop longer text)
		await expect(page.getByText('Cleaning in progress...')).toBeVisible();
	} else {
		const mobileBar = page.locator('.fixed.bottom-0');
		await mobileBar.getByRole('button', { name: /start cleaning/i }).click();
		// Wait for processing badge (mobile shorter text — use exact to avoid matching "Cleaning in progress...")
		await expect(page.getByText('In progress...', { exact: true })).toBeVisible();
	}
}

test.describe('Step 3 — Processing', () => {
	test.beforeEach(async ({ page }) => {
		await injectAuth(page);
		await mockAllApis(page);
		await mockWebSocketProgress(page, 'success');
	});

	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('renders processing badge and status heading', async ({ page }) => {
			await navigateToProcessing(page, 'desktop');

			// No h1 in processing state — header is only shown in idle/files-ready
			// Badge text confirmed by navigateToProcessing; also verify in assertion
			await expect(page.getByText('Cleaning in progress...')).toBeVisible();
			// ProcessingFilesCard has h3 "Processing status"
			await expect(
				page.getByRole('heading', { level: 3, name: 'Processing status' }).first()
			).toBeVisible();
		});

		test('shows Processing status heading and uploaded file', async ({ page }) => {
			await navigateToProcessing(page, 'desktop');

			// ProcessingFilesCard uses h3 "Processing status" (step3.status.title), not "Files to process"
			await expect(
				page.getByRole('heading', { level: 3, name: 'Processing status' }).first()
			).toBeVisible();
			// photo.jpg appears multiple times in DOM during processing — use .first()
			await expect(page.getByText('photo.jpg').first()).toBeVisible();
		});

		test('shows overall progress section', async ({ page }) => {
			await navigateToProcessing(page, 'desktop');

			await expect(page.getByText('Overall progress')).toBeVisible();
		});

		test('shows Processing status sidebar on desktop', async ({ page }) => {
			await navigateToProcessing(page, 'desktop');

			// ProcessingStatusCard is inside hidden lg:flex wrapper — scope to avoid strict mode
			await expect(
				page
					.locator('.hidden.lg\\:flex')
					.getByRole('heading', { level: 3, name: 'Processing status' })
					.first()
			).toBeVisible();
			// Both MobileStatusCard and ProcessingStatusCard render this text — scope to desktop container
			await expect(
				page.locator('.hidden.lg\\:flex').getByText('Metadata cleaning in progress').first()
			).toBeVisible();
		});

		test('shows processing stats on desktop', async ({ page }) => {
			await navigateToProcessing(page, 'desktop');

			// ProcessingStatusCard stats are inside hidden lg:flex — scope to avoid picking MobileStatusCard
			await expect(
				page.locator('.hidden.lg\\:flex').getByText('Fields deleted').first()
			).toBeVisible();
			await expect(page.locator('.hidden.lg\\:flex').getByText('Done').first()).toBeVisible();
		});

		test('URL stays at / during processing', async ({ page }) => {
			await navigateToProcessing(page, 'desktop');
			expect(page.url()).toMatch(/\/$/);
		});

		test('transitions to success state after mock service completes', async ({ page }) => {
			await navigateToProcessing(page, 'desktop');

			await expect(page.getByRole('heading', { level: 1, name: /cleaning complete/i })).toBeVisible(
				{ timeout: 10000 }
			);
			// URL still at /
			expect(page.url()).toMatch(/\/$/);
		});
	});

	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('renders mobile processing badge and status heading', async ({ page }) => {
			await navigateToProcessing(page, 'mobile');

			// No h1 in processing state — header is only shown in idle/files-ready
			// Mobile badge uses shorter text — use exact match to avoid matching desktop badge
			await expect(page.getByText('In progress...', { exact: true })).toBeVisible();
			// MobileStatusCard has h3 "Processing status"
			await expect(
				page.getByRole('heading', { level: 3, name: 'Processing status' }).first()
			).toBeVisible();
		});

		test('shows Processing status heading and uploaded file on mobile', async ({ page }) => {
			await navigateToProcessing(page, 'mobile');

			// ProcessingFilesCard uses h3 "Processing status" (step3.status.title), not "Files to process"
			await expect(
				page.getByRole('heading', { level: 3, name: 'Processing status' }).first()
			).toBeVisible();
			await expect(page.getByText('photo.jpg').first()).toBeVisible();
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

			// MobileStatusCard shows "Fields deleted" label — visible on mobile (lg:hidden wrapper)
			await expect(page.getByText('Fields deleted').first()).toBeVisible();
			await expect(page.getByText('Done').first()).toBeVisible();
		});

		test('URL stays at / during processing on mobile', async ({ page }) => {
			await navigateToProcessing(page, 'mobile');
			expect(page.url()).toMatch(/\/$/);
		});

		test('transitions to success state on mobile after mock service completes', async ({
			page
		}) => {
			await navigateToProcessing(page, 'mobile');

			await expect(page.getByRole('heading', { level: 1, name: /cleaning complete/i })).toBeVisible(
				{ timeout: 15000 }
			);
			expect(page.url()).toMatch(/\/$/);
		});
	});
});
