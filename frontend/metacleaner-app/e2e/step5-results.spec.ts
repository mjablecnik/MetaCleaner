import { test, expect, type Page } from 'playwright/test';
import {
	mockUploadApi,
	mockJobsApi,
	mockWebSocketProgress,
	mockDownloadApi
} from './helpers/mock-api';

const TEST_FILE = {
	name: 'photo.jpg',
	mimeType: 'image/jpeg',
	buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9])
};

async function navigateToStep5(page: Page, viewport: 'desktop' | 'mobile') {
	await mockUploadApi(page);
	await mockJobsApi(page);
	await mockWebSocketProgress(page, 'success');
	await mockDownloadApi(page);

	await page.goto('/');
	await page.locator('#dropzone-file-input').setInputFiles(TEST_FILE);
	await expect(page.getByText('photo.jpg')).toBeVisible();
	await page.getByRole('button', { name: /start cleaning/i }).click();
	await page.waitForURL('**/step2');

	if (viewport === 'desktop') {
		const cleanBtn = page.locator('.hidden.lg\\:flex button', { hasText: /start cleaning/i });
		await cleanBtn.click();
	} else {
		const mobileBar = page.locator('.fixed.bottom-0');
		await mobileBar.getByRole('button', { name: /start cleaning/i }).click();
	}

	await page.waitForURL('**/step3');
	await page.waitForURL('**/step5', { timeout: 10000 });
}

test.describe('Step 5 — Results', () => {
	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('renders success header with title and badge', async ({ page }) => {
			await navigateToStep5(page, 'desktop');

			await expect(
				page.getByRole('heading', { level: 1, name: /cleaning complete/i })
			).toBeVisible();
			await expect(page.getByText('100% Successfully completed')).toBeVisible();
		});

		test('shows upload new files link on desktop header', async ({ page }) => {
			await navigateToStep5(page, 'desktop');

			await expect(page.getByRole('link', { name: /upload new files/i })).toBeVisible();
		});

		test('shows summary stats row with processing results', async ({ page }) => {
			await navigateToStep5(page, 'desktop');

			await expect(page.getByText('Files processed')).toBeVisible();
			await expect(page.getByText('Metadata fields removed')).toBeVisible();
			await expect(page.getByText('GPS locations removed')).toBeVisible();
			await expect(page.getByText('Total cleaning time')).toBeVisible();
		});

		test('shows metadata overview section on desktop', async ({ page }) => {
			await navigateToStep5(page, 'desktop');

			// Desktop MetadataOverview is a non-accordion panel (hidden.lg:block)
			const metaSection = page.locator('div').filter({ hasText: 'Metadata overview' }).first();
			await expect(metaSection).toBeVisible();
		});

		test('shows file results card with heading and uploaded file', async ({ page }) => {
			await navigateToStep5(page, 'desktop');

			await expect(page.getByRole('heading', { level: 3, name: /file results/i })).toBeVisible();
			await expect(page.getByText('All done')).toBeVisible();
			await expect(page.getByText('photo.jpg')).toBeVisible();
		});

		test('shows download all button enabled on desktop', async ({ page }) => {
			await navigateToStep5(page, 'desktop');

			const downloadBtn = page
				.locator('.hidden.lg\\:flex')
				.getByRole('button', { name: /download all/i });
			await expect(downloadBtn).toBeVisible();
			await expect(downloadBtn).not.toBeDisabled();
		});

		test('shows view report link on desktop', async ({ page }) => {
			await navigateToStep5(page, 'desktop');

			const reportLink = page
				.locator('.hidden.lg\\:flex')
				.getByRole('link', { name: /view report/i });
			await expect(reportLink).toBeVisible();
		});

		test('view report link points to the correct report id', async ({ page }) => {
			await navigateToStep5(page, 'desktop');

			const reportLink = page
				.locator('.hidden.lg\\:flex')
				.getByRole('link', { name: /view report/i });
			const href = await reportLink.getAttribute('href');
			expect(href).toContain('rpt-001');
		});

		test('shows new batch button on desktop', async ({ page }) => {
			await navigateToStep5(page, 'desktop');

			const newBtn = page.locator('.hidden.lg\\:flex').getByRole('button', { name: /^new$/i });
			await expect(newBtn).toBeVisible();
		});

		test('new batch button resets to /', async ({ page }) => {
			await navigateToStep5(page, 'desktop');

			const newBtn = page.locator('.hidden.lg\\:flex').getByRole('button', { name: /^new$/i });
			await newBtn.click();

			await page.waitForURL('**/');
			await expect(page).toHaveURL(/\/$/);
		});
	});

	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('renders success header with title and badge on mobile', async ({ page }) => {
			await navigateToStep5(page, 'mobile');

			await expect(
				page.getByRole('heading', { level: 1, name: /cleaning complete/i })
			).toBeVisible();
			await expect(page.getByText('100% Successfully completed')).toBeVisible();
		});

		test('shows file results with uploaded file on mobile', async ({ page }) => {
			await navigateToStep5(page, 'mobile');

			await expect(page.getByRole('heading', { level: 3, name: /file results/i })).toBeVisible();
			await expect(page.getByText('photo.jpg')).toBeVisible();
		});

		test('metadata overview accordion is visible and collapsible on mobile', async ({ page }) => {
			await navigateToStep5(page, 'mobile');

			// Mobile MetadataOverview is an accordion (lg:hidden wrapper)
			const accordionBtn = page
				.locator('.lg\\:hidden')
				.getByRole('button', { name: /metadata overview/i });
			await expect(accordionBtn).toBeVisible();

			// Collapse accordion
			await accordionBtn.click();
			// Expand again
			await accordionBtn.click();

			await expect(accordionBtn).toBeVisible();
		});

		test('mobile sticky CTA shows download all button', async ({ page }) => {
			await navigateToStep5(page, 'mobile');

			const mobileBar = page.locator('.fixed.bottom-0');
			await expect(mobileBar.getByRole('button', { name: /download all/i })).toBeVisible();
		});

		test('mobile sticky CTA shows view report link', async ({ page }) => {
			await navigateToStep5(page, 'mobile');

			const mobileBar = page.locator('.fixed.bottom-0');
			await expect(mobileBar.getByRole('link', { name: /view report/i })).toBeVisible();
		});

		test('mobile sticky CTA shows history link', async ({ page }) => {
			await navigateToStep5(page, 'mobile');

			const mobileBar = page.locator('.fixed.bottom-0');
			await expect(mobileBar.getByRole('link', { name: /history/i })).toBeVisible();
		});

		test('history link points to /reports', async ({ page }) => {
			await navigateToStep5(page, 'mobile');

			const mobileBar = page.locator('.fixed.bottom-0');
			const historyLink = mobileBar.getByRole('link', { name: /history/i });
			const href = await historyLink.getAttribute('href');
			expect(href).toContain('reports');
		});

		test('mobile sticky CTA shows new batch button', async ({ page }) => {
			await navigateToStep5(page, 'mobile');

			const mobileBar = page.locator('.fixed.bottom-0');
			await expect(mobileBar.getByRole('button', { name: /^new$/i })).toBeVisible();
		});

		test('new batch button resets to / on mobile', async ({ page }) => {
			await navigateToStep5(page, 'mobile');

			const mobileBar = page.locator('.fixed.bottom-0');
			await mobileBar.getByRole('button', { name: /^new$/i }).click();

			await page.waitForURL('**/');
			await expect(page).toHaveURL(/\/$/);
		});

		test('desktop upload new files link is hidden on mobile', async ({ page }) => {
			await navigateToStep5(page, 'mobile');

			// SuccessHeader desktop link has hidden lg:flex wrapper
			const desktopLink = page
				.locator('.hidden.lg\\:flex')
				.filter({ hasText: /upload new files/i });
			await expect(desktopLink).not.toBeVisible();
		});
	});

	test.describe('route guard', () => {
		test('redirects to / when no files in store', async ({ page }) => {
			await page.goto('/step5');

			await page.waitForURL('**/');
			await expect(page).toHaveURL(/\/$/);
		});
	});
});
