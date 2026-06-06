import { test, expect, type Page } from 'playwright/test';
import { mockUploadApi, mockJobsApi, mockWebSocketProgress, mockJob } from './helpers/mock-api';

const TEST_FILE = {
	name: 'photo.jpg',
	mimeType: 'image/jpeg',
	buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9])
};

// Mock only the POST /api/jobs endpoint (no GET polling needed for non-error tests)
async function mockJobsApiPost(page: Page) {
	await page.route('**/api/jobs', async (route) => {
		if (route.request().method() === 'POST') {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(mockJob)
			});
		} else {
			await route.continue();
		}
	});
}

// Mock job endpoints where polling returns a failed status (for error path testing)
async function mockJobsApiFailedStatus(page: Page) {
	await page.route('**/api/jobs', async (route) => {
		if (route.request().method() === 'POST') {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(mockJob)
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
				body: JSON.stringify({ ...mockJob, status: 'failed' })
			});
		} else {
			await route.continue();
		}
	});
}

// WebSocket mock that only sends a progress event — page stays on step3 indefinitely
async function mockWebSocketStalled(page: Page) {
	await page.routeWebSocket('**/api/jobs/*/progress', (ws) => {
		ws.send(
			JSON.stringify({ type: 'job_progress', overallProgress: 33, filesCompleted: 0, totalFiles: 1 })
		);
		// No job_complete sent — page remains on step3
	});
}

// WebSocket mock that closes immediately after a progress event, triggering polling fallback
async function mockWebSocketClose(page: Page) {
	await page.routeWebSocket('**/api/jobs/*/progress', (ws) => {
		ws.send(
			JSON.stringify({ type: 'job_progress', overallProgress: 10, filesCompleted: 0, totalFiles: 1 })
		);
		ws.close();
	});
}

async function navigateToStep3(page: Page, viewport: 'desktop' | 'mobile') {
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
}

test.describe('Step 3 — Processing', () => {
	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('renders page heading and processing badge', async ({ page }) => {
			await mockUploadApi(page);
			await mockJobsApiPost(page);
			await mockWebSocketStalled(page);
			await navigateToStep3(page, 'desktop');

			await expect(page.getByRole('heading', { level: 1 })).toContainText('Metadata Cleaning');
			await expect(page.getByText('Cleaning in progress...')).toBeVisible();
		});

		test('shows Files to process heading and uploaded file', async ({ page }) => {
			await mockUploadApi(page);
			await mockJobsApiPost(page);
			await mockWebSocketStalled(page);
			await navigateToStep3(page, 'desktop');

			await expect(page.getByRole('heading', { level: 3, name: 'Files to process' })).toBeVisible();
			await expect(page.getByText('photo.jpg')).toBeVisible();
		});

		test('shows overall progress section', async ({ page }) => {
			await mockUploadApi(page);
			await mockJobsApiPost(page);
			await mockWebSocketStalled(page);
			await navigateToStep3(page, 'desktop');

			await expect(page.getByText('Overall progress')).toBeVisible();
		});

		test('shows Processing status sidebar on desktop', async ({ page }) => {
			await mockUploadApi(page);
			await mockJobsApiPost(page);
			await mockWebSocketStalled(page);
			await navigateToStep3(page, 'desktop');

			// ProcessingStatusCard is only visible on lg+ (hidden lg:flex wrapper)
			await expect(page.getByRole('heading', { level: 3, name: 'Processing status' })).toBeVisible();
			await expect(page.getByText('Metadata cleaning in progress')).toBeVisible();
		});

		test('shows processing stats on desktop', async ({ page }) => {
			await mockUploadApi(page);
			await mockJobsApiPost(page);
			await mockWebSocketStalled(page);
			await navigateToStep3(page, 'desktop');

			await expect(page.getByText('Fields removed').first()).toBeVisible();
			await expect(page.getByText('Done').first()).toBeVisible();
		});

		test('redirects to /step5 when job completes successfully', async ({ page }) => {
			await mockUploadApi(page);
			await mockJobsApi(page);
			await mockWebSocketProgress(page, 'success');
			await navigateToStep3(page, 'desktop');

			await page.waitForURL('**/step5', { timeout: 10000 });
			await expect(page).toHaveURL(/\/step5/);
		});

		test('redirects to /step4 when job fails via polling', async ({ page }) => {
			await mockUploadApi(page);
			await mockJobsApiFailedStatus(page);
			// WS closes → page falls back to polling → polling returns failed → goto /step4
			await mockWebSocketClose(page);
			await navigateToStep3(page, 'desktop');

			await page.waitForURL('**/step4', { timeout: 15000 });
			await expect(page).toHaveURL(/\/step4/);
		});
	});

	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('renders page heading and mobile processing badge', async ({ page }) => {
			await mockUploadApi(page);
			await mockJobsApiPost(page);
			await mockWebSocketStalled(page);
			await navigateToStep3(page, 'mobile');

			await expect(page.getByRole('heading', { level: 1 })).toContainText('Metadata Cleaning');
			// Mobile badge uses shorter text
			await expect(page.getByText('In progress...')).toBeVisible();
		});

		test('shows Files to process heading and uploaded file on mobile', async ({ page }) => {
			await mockUploadApi(page);
			await mockJobsApiPost(page);
			await mockWebSocketStalled(page);
			await navigateToStep3(page, 'mobile');

			await expect(page.getByRole('heading', { level: 3, name: 'Files to process' })).toBeVisible();
			await expect(page.getByText('photo.jpg')).toBeVisible();
		});

		test('shows overall progress section on mobile', async ({ page }) => {
			await mockUploadApi(page);
			await mockJobsApiPost(page);
			await mockWebSocketStalled(page);
			await navigateToStep3(page, 'mobile');

			await expect(page.getByText('Overall progress')).toBeVisible();
		});

		test('Processing status sidebar is hidden on mobile', async ({ page }) => {
			await mockUploadApi(page);
			await mockJobsApiPost(page);
			await mockWebSocketStalled(page);
			await navigateToStep3(page, 'mobile');

			// ProcessingStatusCard has .hidden.lg\\:flex wrapper — not visible on 375px
			const sidebar = page.locator('.hidden.lg\\:flex').filter({ hasText: 'Processing status' });
			await expect(sidebar).not.toBeVisible();
		});

		test('shows mobile stats (Fields deleted, Done)', async ({ page }) => {
			await mockUploadApi(page);
			await mockJobsApiPost(page);
			await mockWebSocketStalled(page);
			await navigateToStep3(page, 'mobile');

			// MobileStatusCard shows "Fields deleted" (different label from desktop "Fields removed")
			await expect(page.getByText('Fields deleted')).toBeVisible();
			await expect(page.getByText('Done')).toBeVisible();
		});

		test('redirects to /step5 when job completes on mobile', async ({ page }) => {
			await mockUploadApi(page);
			await mockJobsApi(page);
			await mockWebSocketProgress(page, 'success');
			await navigateToStep3(page, 'mobile');

			await page.waitForURL('**/step5', { timeout: 10000 });
			await expect(page).toHaveURL(/\/step5/);
		});
	});

	test.describe('route guard', () => {
		test('redirects to / when no files in store', async ({ page }) => {
			// Navigate directly to step3 without going through step1 (no files in scannerStore)
			await page.goto('/step3');

			await page.waitForURL('**/');
			await expect(page).toHaveURL(/\/$/);
		});
	});
});
