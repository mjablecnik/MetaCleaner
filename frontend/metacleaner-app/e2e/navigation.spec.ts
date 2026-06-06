import { test, expect, type Page } from 'playwright/test';
import {
	mockUploadApi,
	mockJobsApi,
	mockWebSocketProgress,
	mockReportsApi,
	mockDownloadApi
} from './helpers/mock-api';

const TEST_FILE = {
	name: 'photo.jpg',
	mimeType: 'image/jpeg',
	buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9])
};

async function mockJobsApiFailedPolling(page: Page) {
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

async function uploadFileAndGoToStep2(page: Page) {
	await page.goto('/');
	await page.locator('#dropzone-file-input').setInputFiles(TEST_FILE);
	await expect(page.getByText('photo.jpg')).toBeVisible();
	await page.getByRole('button', { name: /start cleaning/i }).click();
	await page.waitForURL('**/step2');
}

async function goToStep3FromStep2(page: Page) {
	const cleanBtn = page.locator('.hidden.lg\\:flex button', { hasText: /start cleaning/i });
	await cleanBtn.click();
	await page.waitForURL('**/step3');
}

test.describe('Navigation — full wizard flow', () => {
	test.use({ viewport: { width: 1280, height: 800 } });

	test('/ → /step2 on file upload and scan', async ({ page }) => {
		await uploadFileAndGoToStep2(page);
		await expect(page).toHaveURL(/\/step2/);
	});

	test('/step2 → /step3 on Start Cleaning click', async ({ page }) => {
		await mockUploadApi(page);
		await mockJobsApi(page);

		await page.routeWebSocket('**/api/jobs/*/progress', (ws) => {
			ws.send(
				JSON.stringify({
					type: 'job_progress',
					overallProgress: 0,
					filesCompleted: 0,
					totalFiles: 1
				})
			);
		});

		await uploadFileAndGoToStep2(page);
		await goToStep3FromStep2(page);
		await expect(page).toHaveURL(/\/step3/);
	});

	test('/step2 → / on Add More Files click', async ({ page }) => {
		await uploadFileAndGoToStep2(page);

		const backBtn = page.locator('.hidden.lg\\:flex button', { hasText: /add more files/i });
		await backBtn.click();

		await page.waitForURL('**/');
		await expect(page).toHaveURL(/\/$/);
	});

	test('/step3 → /step5 when job completes successfully', async ({ page }) => {
		await mockUploadApi(page);
		await mockJobsApi(page);
		await mockWebSocketProgress(page, 'success');
		await mockDownloadApi(page);

		await uploadFileAndGoToStep2(page);
		await goToStep3FromStep2(page);

		await page.waitForURL('**/step5', { timeout: 10000 });
		await expect(page).toHaveURL(/\/step5/);
	});

	test('/step3 → /step4 when job fails', async ({ page }) => {
		await mockUploadApi(page);
		await mockJobsApiFailedPolling(page);
		await mockWebSocketClose(page);

		await uploadFileAndGoToStep2(page);
		await goToStep3FromStep2(page);

		await page.waitForURL('**/step4', { timeout: 15000 });
		await expect(page).toHaveURL(/\/step4/);
	});

	test('/step5 → / on New Batch click', async ({ page }) => {
		await mockUploadApi(page);
		await mockJobsApi(page);
		await mockWebSocketProgress(page, 'success');
		await mockDownloadApi(page);

		await uploadFileAndGoToStep2(page);
		await goToStep3FromStep2(page);
		await page.waitForURL('**/step5', { timeout: 10000 });

		const newBtn = page.locator('.hidden.lg\\:flex').getByRole('button', { name: /^new$/i });
		await newBtn.click();

		await page.waitForURL('**/');
		await expect(page).toHaveURL(/\/$/);
	});

	test('/step5 → /report/[id] on View Report click', async ({ page }) => {
		await mockUploadApi(page);
		await mockJobsApi(page);
		await mockWebSocketProgress(page, 'success');
		await mockDownloadApi(page);
		await mockReportsApi(page);

		await uploadFileAndGoToStep2(page);
		await goToStep3FromStep2(page);
		await page.waitForURL('**/step5', { timeout: 10000 });

		const reportLink = page
			.locator('.hidden.lg\\:flex')
			.getByRole('link', { name: /view report/i });
		await reportLink.click();

		await page.waitForURL('**/report/**');
		await expect(page).toHaveURL(/\/report\//);
	});

	test('/step5 → /reports on All Reports link', async ({ page }) => {
		await mockUploadApi(page);
		await mockJobsApi(page);
		await mockWebSocketProgress(page, 'success');
		await mockDownloadApi(page);
		await mockReportsApi(page);

		await uploadFileAndGoToStep2(page);
		await goToStep3FromStep2(page);
		await page.waitForURL('**/step5', { timeout: 10000 });

		// Desktop header "Upload new files" link navigates to /
		// History/reports: check the mobile bar's history link or find link to /reports
		const historyLink = page.getByRole('link', { name: /reports|history/i }).first();
		await historyLink.click();

		await page.waitForURL('**/reports');
		await expect(page).toHaveURL(/\/reports/);
	});

	test('/reports → /report/[id] on row click', async ({ page }) => {
		await mockReportsApi(page);
		await page.goto('/reports');
		await expect(page.getByText('2026-01-15')).toBeVisible({ timeout: 8000 });

		const viewLink = page.locator('a[title="View report"]').first();
		await viewLink.click();

		await page.waitForURL('**/report/**');
		await expect(page).toHaveURL(/\/report\//);
	});

	test('/reports → / on New Cleaning click', async ({ page }) => {
		await mockReportsApi(page);
		await page.goto('/reports');

		await page
			.getByRole('link', { name: /new cleaning/i })
			.first()
			.click();

		await page.waitForURL('**/');
		await expect(page).toHaveURL(/\/$/);
	});

	test('/report/[id] → /reports on back navigation', async ({ page }) => {
		await mockReportsApi(page);
		await page.goto('/report/rpt-001');
		await expect(page.getByText('RPT-001')).toBeVisible({ timeout: 8000 });

		const backLink = page.getByRole('link', { name: /back to results/i }).first();
		await backLink.click();

		await page.waitForURL('**/reports');
		await expect(page).toHaveURL(/\/reports/);
	});
});

test.describe('Navigation — route guards', () => {
	test.use({ viewport: { width: 1280, height: 800 } });

	test('/step2 without files redirects to /', async ({ page }) => {
		await page.goto('/step2');
		await page.waitForURL('**/');
		await expect(page).toHaveURL(/\/$/);
	});

	test('/step3 without files redirects to /', async ({ page }) => {
		await page.goto('/step3');
		await page.waitForURL('**/');
		await expect(page).toHaveURL(/\/$/);
	});

	test('/step4 without files redirects to /', async ({ page }) => {
		await page.goto('/step4');
		await page.waitForURL('**/');
		await expect(page).toHaveURL(/\/$/);
	});

	test('/step5 without files redirects to /', async ({ page }) => {
		await page.goto('/step5');
		await page.waitForURL('**/');
		await expect(page).toHaveURL(/\/$/);
	});

	test('/report (no id) redirects to /reports', async ({ page }) => {
		await page.goto('/report');
		await page.waitForURL('**/reports');
		await expect(page).toHaveURL(/\/reports/);
	});
});

test.describe('Navigation — mobile wizard flow', () => {
	test.use({ viewport: { width: 375, height: 812 } });

	test('/ → /step2 on mobile file upload', async ({ page }) => {
		await uploadFileAndGoToStep2(page);
		await expect(page).toHaveURL(/\/step2/);
	});

	test('/step2 → /step3 via mobile bottom bar', async ({ page }) => {
		await mockUploadApi(page);
		await mockJobsApi(page);

		await page.routeWebSocket('**/api/jobs/*/progress', (ws) => {
			ws.send(
				JSON.stringify({
					type: 'job_progress',
					overallProgress: 0,
					filesCompleted: 0,
					totalFiles: 1
				})
			);
		});

		await uploadFileAndGoToStep2(page);

		const mobileBar = page.locator('.fixed.bottom-0');
		await mobileBar.getByRole('button', { name: /start cleaning/i }).click();

		await page.waitForURL('**/step3');
		await expect(page).toHaveURL(/\/step3/);
	});

	test('/step2 → / via mobile Add More Files', async ({ page }) => {
		await uploadFileAndGoToStep2(page);

		const mobileBar = page.locator('.fixed.bottom-0');
		await mobileBar.getByRole('button', { name: /add more files/i }).click();

		await page.waitForURL('**/');
		await expect(page).toHaveURL(/\/$/);
	});

	test('/step5 → / via mobile New Batch button', async ({ page }) => {
		await mockUploadApi(page);
		await mockJobsApi(page);
		await mockWebSocketProgress(page, 'success');
		await mockDownloadApi(page);

		await uploadFileAndGoToStep2(page);

		const mobileBar = page.locator('.fixed.bottom-0');
		await mobileBar.getByRole('button', { name: /start cleaning/i }).click();

		await page.waitForURL('**/step3');
		await page.waitForURL('**/step5', { timeout: 10000 });

		const mobileCta = page.locator('.fixed.bottom-0');
		await mobileCta.getByRole('button', { name: /^new$/i }).click();

		await page.waitForURL('**/');
		await expect(page).toHaveURL(/\/$/);
	});

	test('/step5 → /reports via mobile History link', async ({ page }) => {
		await mockUploadApi(page);
		await mockJobsApi(page);
		await mockWebSocketProgress(page, 'success');
		await mockDownloadApi(page);
		await mockReportsApi(page);

		await uploadFileAndGoToStep2(page);

		const mobileBar = page.locator('.fixed.bottom-0');
		await mobileBar.getByRole('button', { name: /start cleaning/i }).click();

		await page.waitForURL('**/step3');
		await page.waitForURL('**/step5', { timeout: 10000 });

		const mobileCta = page.locator('.fixed.bottom-0');
		await mobileCta.getByRole('link', { name: /history/i }).click();

		await page.waitForURL('**/reports');
		await expect(page).toHaveURL(/\/reports/);
	});

	test('/reports → / via mobile sticky New Cleaning link', async ({ page }) => {
		await mockReportsApi(page);
		await page.goto('/reports');

		const stickyBar = page.locator('.mobile-gradient-fade');
		await stickyBar.getByRole('link', { name: /new cleaning/i }).click();

		await page.waitForURL('**/');
		await expect(page).toHaveURL(/\/$/);
	});
});
