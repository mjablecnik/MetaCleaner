import { test, expect, type Page } from 'playwright/test';
import {
	mockUploadApi,
	mockJobsApi,
	mockWebSocketProgress,
	mockReportsApi,
	mockReportDetail,
	mockDownloadApi
} from './helpers/mock-api';

const TEST_FILE = {
	name: 'photo.jpg',
	mimeType: 'image/jpeg',
	buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9])
};

// Sends one progress event and keeps WS open — step3 stays on page indefinitely
async function mockWebSocketStalled(page: Page) {
	await page.routeWebSocket('**/api/jobs/*/progress', (ws) => {
		ws.send(
			JSON.stringify({
				type: 'job_progress',
				overallProgress: 33,
				filesCompleted: 0,
				totalFiles: 1
			})
		);
	});
}

async function mockJobsApiPost(page: Page) {
	await page.route('**/api/jobs', async (route) => {
		if (route.request().method() === 'POST') {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					jobId: 'job-001',
					status: 'processing',
					totalFiles: 1,
					createdAt: '2026-01-15T10:30:00Z'
				})
			});
		} else {
			await route.continue();
		}
	});
}

// POST → processing; GET → failed — triggers polling error path → /step4
async function mockJobsApiFailed(page: Page) {
	await page.route('**/api/jobs', async (route) => {
		if (route.request().method() === 'POST') {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					jobId: 'job-001',
					status: 'processing',
					totalFiles: 1,
					createdAt: '2026-01-15T10:30:00Z'
				})
			});
		} else {
			await route.continue();
		}
	});
	await page.route('**/api/jobs/*', async (route) => {
		if (route.request().method() === 'GET') {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ jobId: 'job-001', status: 'failed', totalFiles: 1 })
			});
		} else {
			await route.continue();
		}
	});
}

// Closes WS after one event → polling fallback → error path
async function mockWebSocketClose(page: Page) {
	await page.routeWebSocket('**/api/jobs/*/progress', (ws) => {
		ws.send(
			JSON.stringify({
				type: 'job_progress',
				overallProgress: 10,
				filesCompleted: 0,
				totalFiles: 1
			})
		);
		ws.close();
	});
}

async function uploadAndGoToStep2(page: Page) {
	await page.goto('/');
	await page.locator('#dropzone-file-input').setInputFiles(TEST_FILE);
	await expect(page.getByText('photo.jpg')).toBeVisible();
	await page.getByRole('button', { name: /start cleaning/i }).click();
	await page.waitForURL('**/step2');
}

async function clickCleanAndGoToStep3(page: Page, viewport: 'desktop' | 'mobile') {
	if (viewport === 'desktop') {
		const cleanBtn = page.locator('.hidden.lg\\:flex button', { hasText: /start cleaning/i });
		await cleanBtn.click();
	} else {
		const mobileBar = page.locator('.fixed.bottom-0');
		await mobileBar.getByRole('button', { name: /start cleaning/i }).click();
	}
	await page.waitForURL('**/step3');
}

async function navigateToStep4(page: Page, viewport: 'desktop' | 'mobile') {
	await uploadAndGoToStep2(page);
	await clickCleanAndGoToStep3(page, viewport);
	await page.waitForURL('**/step4', { timeout: 15000 });
}

async function navigateToStep5(page: Page, viewport: 'desktop' | 'mobile') {
	await uploadAndGoToStep2(page);
	await clickCleanAndGoToStep3(page, viewport);
	await page.waitForURL('**/step5', { timeout: 10000 });
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

// ─── Step 2 ───────────────────────────────────────────────────────────────────

test.describe('Responsive — Step 2 (Risk Analysis)', () => {
	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('mobile CTA bar with Start Cleaning is visible', async ({ page }) => {
			await uploadAndGoToStep2(page);
			const mobileBar = page.locator('.fixed.bottom-0');
			await expect(mobileBar).toBeVisible();
			await expect(mobileBar.getByRole('button', { name: /start cleaning/i })).toBeVisible();
		});

		test('desktop CTA area is not visible on mobile', async ({ page }) => {
			await uploadAndGoToStep2(page);
			const desktopCta = page.locator('.hidden.lg\\:flex').filter({ hasText: /start cleaning/i });
			await expect(desktopCta).not.toBeVisible();
		});

		test('risk scanner card is visible on mobile', async ({ page }) => {
			await uploadAndGoToStep2(page);
			await expect(page.getByRole('heading', { level: 3, name: 'Risk Scanner' })).toBeVisible();
		});
	});

	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('desktop CTA area with Start Cleaning is visible', async ({ page }) => {
			await uploadAndGoToStep2(page);
			const desktopCta = page.locator('.hidden.lg\\:flex');
			await expect(desktopCta.getByRole('button', { name: /start cleaning/i })).toBeVisible();
		});

		test('mobile CTA bar is not visible on desktop', async ({ page }) => {
			await uploadAndGoToStep2(page);
			const mobileBar = page.locator('.fixed.bottom-0');
			await expect(mobileBar).not.toBeVisible();
		});

		test('risk scanner card sidebar is visible on desktop', async ({ page }) => {
			await uploadAndGoToStep2(page);
			await expect(page.getByRole('heading', { level: 3, name: 'Risk Scanner' })).toBeVisible();
		});
	});
});

// ─── Step 3 ───────────────────────────────────────────────────────────────────

test.describe('Responsive — Step 3 (Processing)', () => {
	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('mobile stats card shows "Fields deleted" label', async ({ page }) => {
			await mockUploadApi(page);
			await mockJobsApiPost(page);
			await mockWebSocketStalled(page);
			await uploadAndGoToStep2(page);
			await clickCleanAndGoToStep3(page, 'mobile');

			await expect(page.getByText('Fields deleted')).toBeVisible();
		});

		test('processing status sidebar is hidden on mobile', async ({ page }) => {
			await mockUploadApi(page);
			await mockJobsApiPost(page);
			await mockWebSocketStalled(page);
			await uploadAndGoToStep2(page);
			await clickCleanAndGoToStep3(page, 'mobile');

			const sidebar = page.locator('.hidden.lg\\:flex').filter({ hasText: 'Processing status' });
			await expect(sidebar).not.toBeVisible();
		});
	});

	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('processing status sidebar is visible on desktop', async ({ page }) => {
			await mockUploadApi(page);
			await mockJobsApiPost(page);
			await mockWebSocketStalled(page);
			await uploadAndGoToStep2(page);
			await clickCleanAndGoToStep3(page, 'desktop');

			await expect(
				page.getByRole('heading', { level: 3, name: 'Processing status' })
			).toBeVisible();
		});

		test('desktop shows "Fields removed" label', async ({ page }) => {
			await mockUploadApi(page);
			await mockJobsApiPost(page);
			await mockWebSocketStalled(page);
			await uploadAndGoToStep2(page);
			await clickCleanAndGoToStep3(page, 'desktop');

			await expect(page.getByText('Fields removed').first()).toBeVisible();
		});
	});
});

// ─── Step 4 ───────────────────────────────────────────────────────────────────

test.describe('Responsive — Step 4 (Error)', () => {
	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('mobile error visual is visible', async ({ page }) => {
			await mockUploadApi(page);
			await mockJobsApiFailed(page);
			await mockWebSocketClose(page);
			await navigateToStep4(page, 'mobile');

			// MobileErrorVisual (lg:hidden) shows this text
			await expect(page.getByText('Metadata cleaning failed')).toBeVisible();
		});

		test('error detail accordion is visible on mobile', async ({ page }) => {
			await mockUploadApi(page);
			await mockJobsApiFailed(page);
			await mockWebSocketClose(page);
			await navigateToStep4(page, 'mobile');

			const detailAccordion = page.locator('.lg\\:hidden').filter({ hasText: 'Error detail' });
			await expect(detailAccordion).toBeVisible();
		});

		test('processing status sidebar is hidden on mobile', async ({ page }) => {
			await mockUploadApi(page);
			await mockJobsApiFailed(page);
			await mockWebSocketClose(page);
			await navigateToStep4(page, 'mobile');

			const sidebar = page.locator('.hidden.lg\\:flex').filter({ hasText: 'Processing status' });
			await expect(sidebar).not.toBeVisible();
		});
	});

	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('processing status sidebar is visible on desktop', async ({ page }) => {
			await mockUploadApi(page);
			await mockJobsApiFailed(page);
			await mockWebSocketClose(page);
			await navigateToStep4(page, 'desktop');

			await expect(
				page.getByRole('heading', { level: 3, name: 'Processing status' })
			).toBeVisible();
		});

		test('error detail accordion is hidden on desktop', async ({ page }) => {
			await mockUploadApi(page);
			await mockJobsApiFailed(page);
			await mockWebSocketClose(page);
			await navigateToStep4(page, 'desktop');

			const detailAccordion = page.locator('.lg\\:hidden').filter({ hasText: 'Error detail' });
			await expect(detailAccordion).not.toBeVisible();
		});
	});
});

// ─── Step 5 ───────────────────────────────────────────────────────────────────

test.describe('Responsive — Step 5 (Results)', () => {
	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('success header is visible on mobile', async ({ page }) => {
			await mockUploadApi(page);
			await mockJobsApi(page);
			await mockWebSocketProgress(page, 'success');
			await mockDownloadApi(page);
			await navigateToStep5(page, 'mobile');

			await expect(
				page.getByRole('heading', { level: 1, name: /cleaning complete/i })
			).toBeVisible();
		});

		test('summary stats are visible on mobile', async ({ page }) => {
			await mockUploadApi(page);
			await mockJobsApi(page);
			await mockWebSocketProgress(page, 'success');
			await mockDownloadApi(page);
			await navigateToStep5(page, 'mobile');

			await expect(page.getByText('Files processed')).toBeVisible();
			await expect(page.getByText('Metadata fields removed')).toBeVisible();
		});
	});

	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('success header is visible on desktop', async ({ page }) => {
			await mockUploadApi(page);
			await mockJobsApi(page);
			await mockWebSocketProgress(page, 'success');
			await mockDownloadApi(page);
			await navigateToStep5(page, 'desktop');

			await expect(
				page.getByRole('heading', { level: 1, name: /cleaning complete/i })
			).toBeVisible();
		});

		test('summary stats are visible on desktop', async ({ page }) => {
			await mockUploadApi(page);
			await mockJobsApi(page);
			await mockWebSocketProgress(page, 'success');
			await mockDownloadApi(page);
			await navigateToStep5(page, 'desktop');

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
			await mockReportsApi(page);
			await page.goto('/reports');
			await expect(page.getByText('2026-01-15')).toBeVisible({ timeout: 8000 });

			const reportsList = page.locator('.lg\\:hidden').filter({ hasText: 'Report list' }).first();
			await expect(reportsList).toBeVisible();
		});

		test('reports table is hidden on mobile', async ({ page }) => {
			await mockReportsApi(page);
			await page.goto('/reports');
			await expect(page.getByText('2026-01-15')).toBeVisible({ timeout: 8000 });

			const table = page.locator('.hidden.lg\\:block').filter({ hasText: 'Report list' });
			await expect(table).not.toBeVisible();
		});

		test('mobile filter pills are visible', async ({ page }) => {
			await mockReportsApi(page);
			await page.goto('/reports');
			await expect(page.getByText('2026-01-15')).toBeVisible({ timeout: 8000 });

			const mobileFilters = page.locator('.lg\\:hidden').filter({ hasText: 'Photos' }).first();
			await expect(mobileFilters).toBeVisible();
		});

		test('mobile sticky new cleaning bar is visible', async ({ page }) => {
			await mockReportsApi(page);
			await page.goto('/reports');
			const stickyBar = page.locator('.mobile-gradient-fade');
			await expect(stickyBar.getByRole('link', { name: /new cleaning/i })).toBeVisible();
		});
	});

	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('reports table (ReportsTable) is visible on desktop', async ({ page }) => {
			await mockReportsApi(page);
			await page.goto('/reports');
			await expect(page.getByText('2026-01-15')).toBeVisible({ timeout: 8000 });

			const table = page.locator('.hidden.lg\\:block').filter({ hasText: 'Report list' });
			await expect(table).toBeVisible();
		});

		test('report cards list is hidden on desktop', async ({ page }) => {
			await mockReportsApi(page);
			await page.goto('/reports');
			await expect(page.getByText('2026-01-15')).toBeVisible({ timeout: 8000 });

			const reportsList = page.locator('.lg\\:hidden').filter({ hasText: 'Report list' }).first();
			await expect(reportsList).not.toBeVisible();
		});

		test('desktop filters bar is visible', async ({ page }) => {
			await mockReportsApi(page);
			await page.goto('/reports');
			await expect(page.getByText('2026-01-15')).toBeVisible({ timeout: 8000 });

			const desktopFilters = page.locator('.hidden.lg\\:block').filter({ hasText: 'Filter:' });
			await expect(desktopFilters).toBeVisible();
		});

		test('mobile sticky new cleaning bar is hidden on desktop', async ({ page }) => {
			await mockReportsApi(page);
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

		test('download PDF button is not visible on mobile', async ({ page }) => {
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
