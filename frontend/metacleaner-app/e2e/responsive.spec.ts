import { test, expect, type Page } from 'playwright/test';
import { mockReportsApi, mockReportDetail } from './helpers/mock-api';
import { injectAuth } from './helpers/auth.js';

test.beforeEach(async ({ page }) => {
	await injectAuth(page);
});

const TEST_FILE = {
	name: 'photo.jpg',
	mimeType: 'image/jpeg',
	buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9])
};

const ERROR_FILE = {
	name: 'error-test.jpg',
	mimeType: 'image/jpeg',
	buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9])
};

// Upload a file and wait for files-ready state (SPA — no URL navigation)
async function uploadAndEnterFilesReady(page: Page) {
	await page.goto('/');
	await page.locator('#dropzone-file-input').setInputFiles(TEST_FILE);
	await expect(page.getByText('photo.jpg')).toBeVisible();
	// Files-ready state is now active (no URL change)
}

// Click Start Cleaning and wait for the processing badge
async function clickStartCleaning(page: Page, viewport: 'desktop' | 'mobile') {
	if (viewport === 'desktop') {
		const cleanBtn = page
			.locator('.hidden.lg\\:block')
			.getByRole('button', { name: /start cleaning/i });
		await cleanBtn.click();
	} else {
		const mobileBar = page.locator('.fixed.bottom-0');
		await mobileBar.getByRole('button', { name: /start cleaning/i }).click();
	}
}

// Navigate to processing state on same URL (no URL navigation)
async function navigateToProcessing(page: Page, viewport: 'desktop' | 'mobile') {
	await uploadAndEnterFilesReady(page);
	await clickStartCleaning(page, viewport);
	if (viewport === 'desktop') {
		await expect(page.getByText('Cleaning in progress...')).toBeVisible();
	} else {
		// Use exact match to avoid matching "Cleaning in progress..." (desktop badge)
		await expect(page.getByText('In progress...', { exact: true })).toBeVisible();
	}
}

// Navigate to error state using error-named file (mock service triggers onError)
async function navigateToErrorState(page: Page, viewport: 'desktop' | 'mobile') {
	await page.goto('/');
	await page.locator('#dropzone-file-input').setInputFiles(ERROR_FILE);
	await expect(page.getByText('error-test.jpg').first()).toBeVisible();
	await clickStartCleaning(page, viewport);
	await expect(page.getByText('Cleaning process failed')).toBeVisible({ timeout: 5000 });
}

// Navigate to success state (mock service completes after a few seconds)
async function navigateToSuccess(page: Page, viewport: 'desktop' | 'mobile') {
	await uploadAndEnterFilesReady(page);
	await clickStartCleaning(page, viewport);
	await expect(page.getByRole('heading', { level: 1, name: /cleaning complete/i })).toBeVisible({
		timeout: 10000
	});
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────

test.describe('Responsive — Step 1 (Upload)', () => {
	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('upload zone renders on mobile', async ({ page }) => {
			await page.goto('/');
			await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
			await expect(page.locator('#dropzone-file-input')).toBeAttached();
		});
	});

	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('upload zone renders on desktop', async ({ page }) => {
			await page.goto('/');
			await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
			await expect(page.locator('#dropzone-file-input')).toBeAttached();
		});
	});
});

// ─── Step 2 (files-ready) ─────────────────────────────────────────────────────

test.describe('Responsive — Step 2 (Files Ready)', () => {
	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('mobile CTA bar with Start Cleaning is visible after file upload', async ({ page }) => {
			await uploadAndEnterFilesReady(page);
			const mobileBar = page.locator('.fixed.bottom-0');
			await expect(mobileBar).toBeVisible();
			await expect(mobileBar.getByRole('button', { name: /start cleaning/i })).toBeVisible();
		});

		test('desktop CTA area is not visible on mobile', async ({ page }) => {
			await uploadAndEnterFilesReady(page);
			const desktopCta = page.locator('.hidden.lg\\:block').filter({ hasText: /start cleaning/i });
			await expect(desktopCta).not.toBeVisible();
		});

		test('risk scanner card is visible on mobile', async ({ page }) => {
			await uploadAndEnterFilesReady(page);
			// On mobile, MobileRiskBanner shows "Risk Scanner" as a <span> inside a button, not as h3
			await expect(page.getByText('Risk Scanner', { exact: true }).first()).toBeVisible();
		});
	});

	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('desktop Start Cleaning button is visible after file upload', async ({ page }) => {
			await uploadAndEnterFilesReady(page);
			const desktopCta = page.locator('.hidden.lg\\:block');
			await expect(desktopCta.getByRole('button', { name: /start cleaning/i })).toBeVisible();
		});

		test('mobile CTA bar is not visible on desktop', async ({ page }) => {
			await uploadAndEnterFilesReady(page);
			const mobileBar = page.locator('.fixed.bottom-0');
			await expect(mobileBar).not.toBeVisible();
		});

		test('risk scanner card sidebar is visible on desktop', async ({ page }) => {
			await uploadAndEnterFilesReady(page);
			await expect(page.getByRole('heading', { level: 3, name: 'Risk Scanner' })).toBeVisible();
		});
	});
});

// ─── Step 3 ───────────────────────────────────────────────────────────────────

test.describe('Responsive — Step 3 (Processing)', () => {
	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('mobile stats card shows "Fields deleted" label', async ({ page }) => {
			await navigateToProcessing(page, 'mobile');
			// MobileStatusCard is inside lg:hidden — use .first() to pick visible element
			await expect(page.getByText('Fields deleted').first()).toBeVisible();
		});

		test('processing status sidebar is hidden on mobile', async ({ page }) => {
			await navigateToProcessing(page, 'mobile');
			const sidebar = page.locator('.hidden.lg\\:flex').filter({ hasText: 'Processing status' });
			await expect(sidebar).not.toBeVisible();
		});
	});

	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('processing status sidebar is visible on desktop', async ({ page }) => {
			await navigateToProcessing(page, 'desktop');
			// ProcessingStatusCard is inside hidden lg:flex — scope to avoid strict mode (MobileStatusCard also has same heading)
			await expect(
				page
					.locator('.hidden.lg\\:flex')
					.getByRole('heading', { level: 3, name: 'Processing status' })
					.first()
			).toBeVisible();
		});

		test('desktop shows "Fields deleted" label', async ({ page }) => {
			await navigateToProcessing(page, 'desktop');
			// ProcessingStatusCard stats are inside hidden lg:flex — scope to pick desktop element (not MobileStatusCard)
			await expect(
				page.locator('.hidden.lg\\:flex').getByText('Fields deleted').first()
			).toBeVisible();
		});
	});
});

// ─── Step 4 ───────────────────────────────────────────────────────────────────

test.describe('Responsive — Step 4 (Error)', () => {
	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('mobile error visual is visible', async ({ page }) => {
			await navigateToErrorState(page, 'mobile');
			// Use .first() — "Metadata cleaning failed" appears in both desktop and mobile error elements
			await expect(page.getByText('Metadata cleaning failed').first()).toBeVisible();
		});

		test('error detail accordion is visible on mobile', async ({ page }) => {
			await navigateToErrorState(page, 'mobile');
			const detailBtn = page.getByRole('button', { name: /error detail/i });
			await expect(detailBtn).toBeVisible();
		});

		test('processing status sidebar is hidden on mobile', async ({ page }) => {
			await navigateToErrorState(page, 'mobile');
			const sidebar = page.locator('.hidden.gap-6');
			await expect(sidebar).not.toBeVisible();
		});
	});

	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('error state card sidebar is visible on desktop', async ({ page }) => {
			await navigateToErrorState(page, 'desktop');
			// ErrorStateCard in desktop grid
			const desktopGrid = page.locator('.hidden.gap-6');
			await expect(desktopGrid.getByText('Metadata cleaning failed')).toBeVisible();
		});

		test('mobile error accordions are hidden on desktop', async ({ page }) => {
			await navigateToErrorState(page, 'desktop');
			const mobileContainer = page.locator('.flex.flex-col.gap-4.lg\\:hidden');
			await expect(mobileContainer).not.toBeVisible();
		});
	});
});

// ─── Step 5 ───────────────────────────────────────────────────────────────────

test.describe('Responsive — Step 5 (Results)', () => {
	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('success header is visible on mobile', async ({ page }) => {
			await navigateToSuccess(page, 'mobile');
			await expect(
				page.getByRole('heading', { level: 1, name: /cleaning complete/i })
			).toBeVisible();
		});

		test('summary stats are visible on mobile', async ({ page }) => {
			await navigateToSuccess(page, 'mobile');
			await expect(page.getByText('Files processed')).toBeVisible();
			await expect(page.getByText('Metadata fields removed')).toBeVisible();
		});
	});

	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('success header is visible on desktop', async ({ page }) => {
			await navigateToSuccess(page, 'desktop');
			await expect(
				page.getByRole('heading', { level: 1, name: /cleaning complete/i })
			).toBeVisible();
		});

		test('summary stats are visible on desktop', async ({ page }) => {
			await navigateToSuccess(page, 'desktop');
			await expect(page.getByText('Files processed')).toBeVisible();
			await expect(page.getByText('Metadata fields removed')).toBeVisible();
		});
	});
});

// ─── Reports ──────────────────────────────────────────────────────────────────

test.describe('Responsive — Reports', () => {
	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('report cards list (ReportsList) is visible on mobile', async ({ page }) => {
			await page.goto('/reports');
			// Mock cleaning service has 200ms delay — wait for data to load
			await expect(page.getByRole('heading', { level: 1, name: /report history/i })).toBeVisible({
				timeout: 8000
			});
			// Wait for reports to appear
			await page.waitForTimeout(500);

			const reportsList = page.locator('.lg\\:hidden').filter({ hasText: 'Report list' }).first();
			await expect(reportsList).toBeVisible();
		});

		test('reports table is hidden on mobile', async ({ page }) => {
			await page.goto('/reports');
			await expect(page.getByRole('heading', { level: 1, name: /report history/i })).toBeVisible({
				timeout: 8000
			});

			const table = page.locator('.hidden.lg\\:block').filter({ hasText: 'Report list' });
			await expect(table).not.toBeVisible();
		});

		test('mobile filter pills are visible', async ({ page }) => {
			await page.goto('/reports');
			await expect(page.getByRole('heading', { level: 1, name: /report history/i })).toBeVisible({
				timeout: 8000
			});

			const mobileFilters = page.locator('.lg\\:hidden').filter({ hasText: 'Photos' }).first();
			await expect(mobileFilters).toBeVisible();
		});

		test('mobile sticky new cleaning bar is visible', async ({ page }) => {
			await page.goto('/reports');
			const stickyBar = page.locator('.mobile-gradient-fade');
			await expect(stickyBar.getByRole('link', { name: /new cleaning/i })).toBeVisible();
		});
	});

	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('reports table (ReportsTable) is visible on desktop', async ({ page }) => {
			await page.goto('/reports');
			await expect(page.getByRole('heading', { level: 1, name: /report history/i })).toBeVisible({
				timeout: 8000
			});
			await page.waitForTimeout(500);

			const table = page.locator('.hidden.lg\\:block').filter({ hasText: 'Report list' });
			await expect(table).toBeVisible();
		});

		test('report cards list is hidden on desktop', async ({ page }) => {
			await page.goto('/reports');
			await expect(page.getByRole('heading', { level: 1, name: /report history/i })).toBeVisible({
				timeout: 8000
			});

			const reportsList = page.locator('.lg\\:hidden').filter({ hasText: 'Report list' }).first();
			await expect(reportsList).not.toBeVisible();
		});

		test('desktop filters bar is visible', async ({ page }) => {
			await page.goto('/reports');
			await expect(page.getByRole('heading', { level: 1, name: /report history/i })).toBeVisible({
				timeout: 8000
			});

			const desktopFilters = page.locator('.hidden.lg\\:block').filter({ hasText: 'Filter:' });
			await expect(desktopFilters).toBeVisible();
		});

		test('mobile sticky new cleaning bar is hidden on desktop', async ({ page }) => {
			await page.goto('/reports');
			const stickyBar = page.locator('.mobile-gradient-fade');
			await expect(stickyBar).not.toBeVisible();
		});
	});
});

// ─── Report Detail ────────────────────────────────────────────────────────────

test.describe('Responsive — Report Detail', () => {
	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('chart and file accordion are visible on mobile', async ({ page }) => {
			await mockReportsApi(page);
			await page.goto('/report/rpt-001');
			await expect(page.getByText(mockReportDetail.reportId)).toBeVisible({ timeout: 8000 });

			await expect(
				page.getByRole('heading', { name: /distribution of removed metadata/i })
			).toBeVisible();
			await expect(page.getByRole('heading', { name: /detailed file overview/i })).toBeVisible();
		});

		test('download PDF button is not visible on mobile (desktop-only button)', async ({ page }) => {
			await mockReportsApi(page);
			await page.goto('/report/rpt-001');
			await expect(page.getByText(mockReportDetail.reportId)).toBeVisible({ timeout: 8000 });

			const pdfBtn = page
				.locator('.hidden.lg\\:flex')
				.getByRole('button', { name: /download pdf/i });
			await expect(pdfBtn).not.toBeVisible();
		});
	});

	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('chart and file accordion are visible on desktop', async ({ page }) => {
			await mockReportsApi(page);
			await page.goto('/report/rpt-001');
			await expect(page.getByText(mockReportDetail.reportId)).toBeVisible({ timeout: 8000 });

			await expect(
				page.getByRole('heading', { name: /distribution of removed metadata/i })
			).toBeVisible();
			await expect(page.getByRole('heading', { name: /detailed file overview/i })).toBeVisible();
		});

		test('download PDF button is visible on desktop', async ({ page }) => {
			await mockReportsApi(page);
			await page.goto('/report/rpt-001');
			await expect(page.getByText(mockReportDetail.reportId)).toBeVisible({ timeout: 8000 });

			const pdfBtn = page
				.locator('.hidden.lg\\:flex')
				.getByRole('button', { name: /download pdf/i });
			await expect(pdfBtn).toBeVisible();
		});
	});
});
