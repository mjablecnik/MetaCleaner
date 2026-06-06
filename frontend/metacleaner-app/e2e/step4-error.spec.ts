import { test, expect, type Page } from 'playwright/test';
import { mockUploadApi } from './helpers/mock-api';

const TEST_FILE = {
	name: 'photo.jpg',
	mimeType: 'image/jpeg',
	buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9])
};

// Mock POST /api/jobs + GET /api/jobs/* returning 'failed' to trigger polling error path
async function mockJobsApiFailed(page: Page) {
	await page.route('**/api/jobs', async (route) => {
		if (route.request().method() === 'POST') {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ jobId: 'job-fail', status: 'processing', totalFiles: 1, createdAt: '2026-01-15T10:30:00Z' })
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
				body: JSON.stringify({ jobId: 'job-fail', status: 'failed', totalFiles: 1, filesCompleted: 0 })
			});
		} else {
			await route.continue();
		}
	});
}

// WebSocket that closes immediately after one progress event, triggering polling fallback
async function mockWebSocketClose(page: Page) {
	await page.routeWebSocket('**/api/jobs/*/progress', (ws) => {
		ws.send(JSON.stringify({ type: 'job_progress', overallProgress: 10, filesCompleted: 0, totalFiles: 1 }));
		ws.close();
	});
}

async function navigateToStep4(page: Page) {
	await mockUploadApi(page);
	await mockJobsApiFailed(page);
	await mockWebSocketClose(page);

	await page.goto('/');
	await page.locator('#dropzone-file-input').setInputFiles(TEST_FILE);
	await expect(page.getByText('photo.jpg')).toBeVisible();
	await page.getByRole('button', { name: /start cleaning/i }).click();
	await page.waitForURL('**/step2');

	// Use desktop Start Cleaning button (works at both viewports since locator falls back to first match)
	const cleanBtn = page.getByRole('button', { name: /start cleaning/i }).first();
	await cleanBtn.click();
	await page.waitForURL('**/step3');

	// WS closes → polling starts (3s interval) → poll returns failed → goto /step4
	await page.waitForURL('**/step4', { timeout: 15000 });
}

test.describe('Step 4 — Error', () => {
	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('renders page heading and desktop error badge', async ({ page }) => {
			await navigateToStep4(page);

			await expect(page.getByRole('heading', { level: 1 })).toContainText('Metadata Cleaning');
			await expect(page.getByText('Processing error')).toBeVisible();
		});

		test('error banner is visible with process failed title', async ({ page }) => {
			await navigateToStep4(page);

			await expect(page.getByText('Cleaning process failed')).toBeVisible();
		});

		test('error banner can be dismissed', async ({ page }) => {
			await navigateToStep4(page);

			const banner = page.locator('div').filter({ hasText: 'Cleaning process failed' }).first();
			await expect(banner).toBeVisible();

			await page.getByRole('button', { name: 'close' }).click();

			await expect(page.getByText('Cleaning process failed')).not.toBeVisible();
		});

		test('shows Files to process heading with uploaded file', async ({ page }) => {
			await navigateToStep4(page);

			await expect(page.getByRole('heading', { level: 3, name: /files to process/i })).toBeVisible();
			await expect(page.getByText('photo.jpg')).toBeVisible();
		});

		test('shows overall progress section (desktop only)', async ({ page }) => {
			await navigateToStep4(page);

			await expect(page.getByText('Overall progress').first()).toBeVisible();
			await expect(page.getByText('Interrupted').first()).toBeVisible();
		});

		test('shows Try again and Clear all action buttons', async ({ page }) => {
			await navigateToStep4(page);

			await expect(page.getByRole('link', { name: /try again/i })).toBeVisible();
			await expect(page.getByRole('button', { name: /clear all/i })).toBeVisible();
		});

		test('shows Processing status sidebar on desktop', async ({ page }) => {
			await navigateToStep4(page);

			// ErrorStateCard is desktop-only (hidden lg:flex wrapper)
			await expect(page.getByRole('heading', { level: 3, name: 'Processing status' })).toBeVisible();
			await expect(page.getByText('Metadata cleaning failed')).toBeVisible();
		});

		test('ErrorDetailAccordion is hidden on desktop', async ({ page }) => {
			await navigateToStep4(page);

			// ErrorDetailAccordion has lg:hidden wrapper — not rendered for wide viewport
			const detailAccordion = page.locator('.lg\\:hidden').filter({ hasText: 'Error detail' });
			await expect(detailAccordion).not.toBeVisible();
		});

		test('ErrorLogAccordion is hidden on desktop', async ({ page }) => {
			await navigateToStep4(page);

			// ErrorLogAccordion has lg:hidden wrapper
			const logAccordion = page.locator('.lg\\:hidden').filter({ hasText: 'Error log' });
			await expect(logAccordion).not.toBeVisible();
		});
	});

	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('renders page heading and mobile error badge', async ({ page }) => {
			await navigateToStep4(page);

			await expect(page.getByRole('heading', { level: 1 })).toContainText('Metadata Cleaning');
			// Mobile badge text is "Error"
			await expect(page.getByText('Error').first()).toBeVisible();
		});

		test('error banner is visible on mobile', async ({ page }) => {
			await navigateToStep4(page);

			await expect(page.getByText('Cleaning process failed')).toBeVisible();
		});

		test('MobileErrorVisual is visible on mobile', async ({ page }) => {
			await navigateToStep4(page);

			// MobileErrorVisual has lg:hidden wrapper — only visible on mobile
			await expect(page.getByText('Metadata cleaning failed')).toBeVisible();
			await expect(page.getByText('Interrupted')).toBeVisible();
		});

		test('shows Files to process with uploaded file on mobile', async ({ page }) => {
			await navigateToStep4(page);

			await expect(page.getByRole('heading', { level: 3, name: /files to process/i })).toBeVisible();
			await expect(page.getByText('photo.jpg')).toBeVisible();
		});

		test('ErrorDetailAccordion is visible and expandable on mobile', async ({ page }) => {
			await navigateToStep4(page);

			// ErrorDetailAccordion is mobile-only (lg:hidden), starts open by default
			const detailBtn = page.getByRole('button', { name: /error detail/i });
			await expect(detailBtn).toBeVisible();

			// Accordion is open by default — collapse it
			await detailBtn.click();
			// Expand it again
			await detailBtn.click();

			await expect(page.getByText('Error code').first()).toBeVisible();
		});

		test('ErrorLogAccordion is visible on mobile', async ({ page }) => {
			await navigateToStep4(page);

			// ErrorLogAccordion is mobile-only (lg:hidden)
			const logBtn = page.getByRole('button', { name: /error log/i });
			await expect(logBtn).toBeVisible();
		});

		test('ProcessingStatus sidebar is hidden on mobile', async ({ page }) => {
			await navigateToStep4(page);

			// ErrorStateCard has .hidden.lg:flex wrapper — not visible at 375px
			const sidebar = page.locator('.hidden.lg\\:flex').filter({ hasText: 'Processing status' });
			await expect(sidebar).not.toBeVisible();
		});

		test('shows Try again action button on mobile', async ({ page }) => {
			await navigateToStep4(page);

			await expect(page.getByRole('link', { name: /try again/i })).toBeVisible();
		});
	});

	test.describe('route guard', () => {
		test('redirects to / when no files in store', async ({ page }) => {
			// Navigate directly to /step4 without going through the wizard flow
			await page.goto('/step4');

			await page.waitForURL('**/');
			await expect(page).toHaveURL(/\/$/);
		});
	});
});
