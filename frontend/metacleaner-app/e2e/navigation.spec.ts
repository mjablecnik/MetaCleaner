import { test, expect, type Page } from 'playwright/test';
import { mockReportsApi } from './helpers/mock-api';

const TEST_FILE = {
	name: 'photo.jpg',
	mimeType: 'image/jpeg',
	buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9])
};

const ERROR_FILE = {
	name: 'error-trigger.jpg',
	mimeType: 'image/jpeg',
	buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9])
};

async function uploadFile(page: Page) {
	await page.locator('#dropzone-file-input').setInputFiles(TEST_FILE);
	await expect(page.getByText('photo.jpg')).toBeVisible();
}

async function enterFilesReadyState(page: Page) {
	await page.goto('/');
	await uploadFile(page);
}

async function enterSuccessState(page: Page, viewport: 'desktop' | 'mobile' = 'desktop') {
	await enterFilesReadyState(page);
	if (viewport === 'desktop') {
		const startBtn = page
			.locator('.hidden.lg\\:block')
			.getByRole('button', { name: /start cleaning/i });
		await startBtn.click();
	} else {
		const mobileBar = page.locator('.fixed.bottom-0');
		await mobileBar.getByRole('button', { name: /start cleaning/i }).click();
	}
	await expect(page.getByRole('heading', { level: 1, name: /cleaning complete/i })).toBeVisible({
		timeout: 10000
	});
}

async function enterErrorState(page: Page, viewport: 'desktop' | 'mobile' = 'desktop') {
	await page.goto('/');
	await page.locator('#dropzone-file-input').setInputFiles(ERROR_FILE);
	await expect(page.getByText('error-trigger.jpg')).toBeVisible();
	if (viewport === 'desktop') {
		const startBtn = page
			.locator('.hidden.lg\\:block')
			.getByRole('button', { name: /start cleaning/i });
		await startBtn.click();
	} else {
		const mobileBar = page.locator('.fixed.bottom-0');
		await mobileBar.getByRole('button', { name: /start cleaning/i }).click();
	}
	await expect(page.getByText('Cleaning process failed')).toBeVisible({ timeout: 5000 });
}

test.describe('Navigation — SPA state transitions (no URL changes)', () => {
	test.use({ viewport: { width: 1280, height: 800 } });

	test('uploading files transitions to files-ready state without URL change', async ({ page }) => {
		await page.goto('/');
		expect(page.url()).toMatch(/\/$/);

		await uploadFile(page);

		// URL stays at /
		expect(page.url()).toMatch(/\/$/);
		// Files-ready state: file list visible
		await expect(page.getByText('Files to process')).toBeVisible();
	});

	test('clicking Start Cleaning transitions to processing state without URL change', async ({
		page
	}) => {
		await enterFilesReadyState(page);

		const startBtn = page
			.locator('.hidden.lg\\:block')
			.getByRole('button', { name: /start cleaning/i });
		await startBtn.click();

		// URL stays at /
		expect(page.url()).toMatch(/\/$/);
		// Processing badge visible
		await expect(page.getByText('Cleaning in progress...')).toBeVisible();
	});

	test('processing completes to success state without URL change', async ({ page }) => {
		await enterSuccessState(page);
		expect(page.url()).toMatch(/\/$/);
		await expect(page.getByRole('heading', { level: 1, name: /cleaning complete/i })).toBeVisible();
	});

	test('error triggers error state without URL change', async ({ page }) => {
		await enterErrorState(page);
		expect(page.url()).toMatch(/\/$/);
		await expect(page.getByText('Processing error')).toBeVisible();
	});

	test('Try again in error state returns to files-ready without URL change', async ({ page }) => {
		await enterErrorState(page);

		await page
			.locator('.hidden.gap-6')
			.getByRole('button', { name: /try again/i })
			.click();

		expect(page.url()).toMatch(/\/$/);
		await expect(page.getByRole('heading', { level: 3, name: 'Risk Scanner' })).toBeVisible();
	});

	test('Clear all in error state returns to idle without URL change', async ({ page }) => {
		await enterErrorState(page);

		await page
			.locator('.hidden.gap-6')
			.getByRole('button', { name: /clear all/i })
			.click();

		expect(page.url()).toMatch(/\/$/);
		await expect(page.getByText('Waiting for files')).toBeVisible();
	});

	test('"Upload new files" button in Step 5 returns to idle state', async ({ page }) => {
		await enterSuccessState(page);

		// "Upload new files" is a button (calls appState.reset() — no URL navigation)
		await page.getByRole('button', { name: /upload new files/i }).click();

		// Returns to idle state on same URL
		await expect(page.getByText('Waiting for files')).toBeVisible();
		expect(page.url()).toMatch(/\/$/);
	});

	test('"View report" button in Step 5 navigates to /report', async ({ page }) => {
		await enterSuccessState(page);

		await page
			.getByRole('button', { name: /view report/i })
			.first()
			.click();

		await page.waitForURL('**/report**');
		expect(page.url()).toMatch(/\/report/);
	});
});

test.describe('Navigation — URL navigations (reports and report detail)', () => {
	test.use({ viewport: { width: 1280, height: 800 } });

	test('/reports page loads successfully', async ({ page }) => {
		await page.goto('/reports');
		await expect(page.getByRole('heading', { level: 1, name: /report history/i })).toBeVisible({
			timeout: 8000
		});
	});

	test('/reports → /report/[id] on view-report link click', async ({ page }) => {
		await page.goto('/reports');
		await expect(page.getByRole('heading', { level: 1, name: /report history/i })).toBeVisible({
			timeout: 8000
		});

		// Wait for reports to load (mock service has 200ms delay)
		const viewLink = page.locator('a[title="View report"]').first();
		await expect(viewLink).toBeVisible({ timeout: 5000 });
		await viewLink.click();

		await page.waitForURL('**/report/**');
		expect(page.url()).toMatch(/\/report\//);
	});

	test('/reports → / on New Cleaning link click', async ({ page }) => {
		await page.goto('/reports');
		await page
			.getByRole('link', { name: /new cleaning/i })
			.first()
			.click();

		await page.waitForURL('**/');
		await expect(page).toHaveURL(/\/$/);
	});

	test('/report/[id] → /reports on "Back to results" link', async ({ page }) => {
		await mockReportsApi(page);
		await page.goto('/report/rpt-001');
		await expect(page.getByText('MC-2025-001')).toBeVisible({ timeout: 8000 });

		const backLink = page.getByRole('link', { name: /back to results/i }).first();
		await backLink.click();

		await page.waitForURL('**/reports');
		await expect(page).toHaveURL(/\/reports/);
	});

	test('/report/[id] → / on navigating to /reports → "Back to cleaning"', async ({ page }) => {
		await mockReportsApi(page);
		await page.goto('/report/rpt-001');
		await expect(page.getByText('MC-2025-001')).toBeVisible({ timeout: 8000 });

		await page
			.getByRole('link', { name: /back to results/i })
			.first()
			.click();
		await page.waitForURL('**/reports');

		await page
			.getByRole('link', { name: /back to cleaning/i })
			.first()
			.click();
		await page.waitForURL('**/');
		await expect(page).toHaveURL(/\/$/);
		// Navigating back to / from reports resets app state to idle
		await expect(page.getByText('Waiting for files')).toBeVisible();
	});
});

test.describe('Navigation — mobile SPA state transitions', () => {
	test.use({ viewport: { width: 375, height: 812 } });

	test('uploading files on mobile transitions to files-ready without URL change', async ({
		page
	}) => {
		await page.goto('/');
		await uploadFile(page);

		expect(page.url()).toMatch(/\/$/);
		await expect(page.getByText('Files to process')).toBeVisible();
	});

	test('mobile Start Cleaning transitions to processing state without URL change', async ({
		page
	}) => {
		await enterFilesReadyState(page);

		const mobileBar = page.locator('.fixed.bottom-0');
		await mobileBar.getByRole('button', { name: /start cleaning/i }).click();

		expect(page.url()).toMatch(/\/$/);
		// Use exact match to avoid matching "Cleaning in progress..." (desktop badge)
		await expect(page.getByText('In progress...', { exact: true })).toBeVisible();
	});

	test('mobile success state renders without URL change', async ({ page }) => {
		await enterSuccessState(page, 'mobile');
		expect(page.url()).toMatch(/\/$/);
	});

	test('/reports → / via mobile sticky New Cleaning link', async ({ page }) => {
		await page.goto('/reports');
		const stickyBar = page.locator('.mobile-gradient-fade');
		await stickyBar.getByRole('link', { name: /new cleaning/i }).click();

		await page.waitForURL('**/');
		await expect(page).toHaveURL(/\/$/);
	});
});
