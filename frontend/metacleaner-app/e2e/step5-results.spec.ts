import { test, expect, type Page } from 'playwright/test';

const TEST_FILE = {
	name: 'photo.jpg',
	mimeType: 'image/jpeg',
	buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9])
};

// Navigate to the success state via SPA flow (upload file, click start, wait for completion)
async function navigateToSuccess(page: Page, viewport: 'desktop' | 'mobile') {
	await page.goto('/');
	await page.locator('#dropzone-file-input').setInputFiles(TEST_FILE);
	await expect(page.getByText('photo.jpg')).toBeVisible();

	if (viewport === 'desktop') {
		const cleanBtn = page.locator('.hidden.lg\\:block').getByRole('button', { name: /start cleaning/i });
		await cleanBtn.click();
	} else {
		const mobileBar = page.locator('.fixed.bottom-0');
		await mobileBar.getByRole('button', { name: /start cleaning/i }).click();
	}

	// Wait for mock service to complete (uses simulated delays per file ~800ms)
	await expect(page.getByRole('heading', { level: 1, name: /cleaning complete/i })).toBeVisible({ timeout: 10000 });
}

test.describe('Step 5 — Results', () => {
	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('renders success header with title and badge', async ({ page }) => {
			await navigateToSuccess(page, 'desktop');

			await expect(page.getByRole('heading', { level: 1, name: /cleaning complete/i })).toBeVisible();
			await expect(page.getByText('100% Successfully completed')).toBeVisible();
		});

		test('URL stays at / in success state', async ({ page }) => {
			await navigateToSuccess(page, 'desktop');
			expect(page.url()).toMatch(/\/$/);
		});

		test('shows upload new files button in header', async ({ page }) => {
			await navigateToSuccess(page, 'desktop');
			// "Upload new files" is a button (not a link)
			await expect(page.getByRole('button', { name: /upload new files/i })).toBeVisible();
		});

		test('shows summary stats row with processing results', async ({ page }) => {
			await navigateToSuccess(page, 'desktop');

			await expect(page.getByText('Files processed')).toBeVisible();
			await expect(page.getByText('Metadata fields removed')).toBeVisible();
			await expect(page.getByText('GPS locations removed')).toBeVisible();
			await expect(page.getByText('Total cleaning time')).toBeVisible();
		});

		test('shows metadata overview section on desktop', async ({ page }) => {
			await navigateToSuccess(page, 'desktop');

			// Desktop MetadataOverview is a non-accordion panel
			const metaSection = page.locator('div').filter({ hasText: 'Metadata overview' }).first();
			await expect(metaSection).toBeVisible();
		});

		test('shows file results card with heading and uploaded file', async ({ page }) => {
			await navigateToSuccess(page, 'desktop');

			await expect(page.getByRole('heading', { level: 3, name: /file results/i })).toBeVisible();
			await expect(page.getByText('All done')).toBeVisible();
			await expect(page.getByText('photo.jpg')).toBeVisible();
		});

		test('shows download all button enabled on desktop', async ({ page }) => {
			await navigateToSuccess(page, 'desktop');

			const downloadBtn = page.getByRole('button', { name: /download all/i }).first();
			await expect(downloadBtn).toBeVisible();
			await expect(downloadBtn).not.toBeDisabled();
		});

		test('shows view report button on desktop', async ({ page }) => {
			await navigateToSuccess(page, 'desktop');

			const reportBtn = page.getByRole('button', { name: /view report/i }).first();
			await expect(reportBtn).toBeVisible();
		});

		test('"View report" button navigates to /report', async ({ page }) => {
			await navigateToSuccess(page, 'desktop');

			await page.getByRole('button', { name: /view report/i }).first().click();

			await page.waitForURL('**/report**');
			expect(page.url()).toMatch(/\/report/);
		});

		test('"Upload new files" button returns to idle state', async ({ page }) => {
			await navigateToSuccess(page, 'desktop');

			await page.getByRole('button', { name: /upload new files/i }).click();

			// Idle state — Waiting for files
			await expect(page.getByText('Waiting for files')).toBeVisible();
			expect(page.url()).toMatch(/\/$/);
		});
	});

	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('renders success header with title and badge on mobile', async ({ page }) => {
			await navigateToSuccess(page, 'mobile');

			await expect(page.getByRole('heading', { level: 1, name: /cleaning complete/i })).toBeVisible();
			await expect(page.getByText('100% Successfully completed')).toBeVisible();
		});

		test('URL stays at / in success state on mobile', async ({ page }) => {
			await navigateToSuccess(page, 'mobile');
			expect(page.url()).toMatch(/\/$/);
		});

		test('shows file results with uploaded file on mobile', async ({ page }) => {
			await navigateToSuccess(page, 'mobile');

			await expect(page.getByRole('heading', { level: 3, name: /file results/i })).toBeVisible();
			await expect(page.getByText('photo.jpg')).toBeVisible();
		});

		test('metadata overview accordion is visible and collapsible on mobile', async ({ page }) => {
			await navigateToSuccess(page, 'mobile');

			// Mobile MetadataOverview is an accordion (lg:hidden wrapper)
			const accordionBtn = page.locator('.lg\\:hidden').getByRole('button', { name: /metadata overview/i });
			await expect(accordionBtn).toBeVisible();

			// Collapse accordion
			await accordionBtn.click();
			// Expand again
			await accordionBtn.click();

			await expect(accordionBtn).toBeVisible();
		});

		test('shows download all button on mobile', async ({ page }) => {
			await navigateToSuccess(page, 'mobile');

			// Download all button is inline in FileResultsCard (no fixed bottom bar)
			await expect(page.getByRole('button', { name: /download all/i }).first()).toBeVisible();
		});

		test('shows view report button on mobile', async ({ page }) => {
			await navigateToSuccess(page, 'mobile');

			// View report button is inline in FileResultsCard
			await expect(page.getByRole('button', { name: /view report/i }).first()).toBeVisible();
		});

		test('shows upload new files button on mobile', async ({ page }) => {
			await navigateToSuccess(page, 'mobile');

			// Upload new files button is in SuccessHeader (visible on all viewports)
			await expect(page.getByRole('button', { name: /upload new files/i })).toBeVisible();
		});
	});
});
