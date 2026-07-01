import { test, expect } from 'playwright/test';
import { injectAuth } from './helpers/auth.js';
import { mockUploadApi } from './helpers/mock-api.js';

// Minimal JPEG (SOI + EOI): accepted by extension/MIME validation.
const TEST_FILE = {
	name: 'photo.jpg',
	mimeType: 'image/jpeg',
	buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9])
};

const SECOND_FILE = {
	name: 'vacation.jpg',
	mimeType: 'image/jpeg',
	buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9])
};

test.describe('Step 1 → Step 2 in-place SPA transition', () => {
	test.beforeEach(async ({ page }) => {
		await injectAuth(page);
		await mockUploadApi(page);
	});

	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('URL stays at / after uploading files', async ({ page }) => {
			await page.goto('/');
			await page.locator('#dropzone-file-input').setInputFiles(TEST_FILE);

			await expect(page.getByText('photo.jpg')).toBeVisible();
			// URL must not change — SPA state machine, no navigation
			expect(page.url()).toMatch(/\/$/);
		});

		test('RiskScannerCard appears on desktop after uploading files', async ({ page }) => {
			await page.goto('/');
			// Risk scanner sidebar is not visible before any files are added
			await expect(page.getByRole('heading', { level: 3, name: 'Risk Scanner' })).not.toBeVisible();

			await page.locator('#dropzone-file-input').setInputFiles(TEST_FILE);

			// After adding files the right-column Risk Scanner sidebar becomes visible on desktop
			await expect(page.getByRole('heading', { level: 3, name: 'Risk Scanner' })).toBeVisible();
		});

		test('FileListCard appears with uploaded file name on desktop', async ({ page }) => {
			await page.goto('/');
			await page.locator('#dropzone-file-input').setInputFiles(TEST_FILE);

			// "Files to process" header appears (from en.json step1.files.title)
			await expect(page.getByText('Files to process')).toBeVisible();
			await expect(page.getByText('photo.jpg')).toBeVisible();
		});

		test('Start Cleaning button becomes enabled after uploading files', async ({ page }) => {
			await page.goto('/');
			await expect(page.getByRole('button', { name: /start cleaning/i })).toBeDisabled();

			await page.locator('#dropzone-file-input').setInputFiles(TEST_FILE);

			await expect(page.getByRole('button', { name: /start cleaning/i })).toBeEnabled();
		});

		test('UploadZoneCard switches to compact state after files added', async ({ page }) => {
			await page.goto('/');
			// Full drop zone visible in idle state — use exact match (mobile also has "or drag files here")
			await expect(page.getByText('Drag files here', { exact: true })).toBeVisible();

			await page.locator('#dropzone-file-input').setInputFiles(TEST_FILE);

			// Full drop zone text is gone; compact "add more" state is shown
			await expect(page.getByText('Drag files here', { exact: true })).not.toBeVisible();
		});

		test('risk breakdown bars are visible in RiskScannerCard on desktop', async ({ page }) => {
			await page.goto('/');
			await page.locator('#dropzone-file-input').setInputFiles(TEST_FILE);

			// Risk breakdown categories (from en.json step2.risk.* keys)
			// Use .first() since bars appear both in RiskScannerCard and potentially MobileRiskBanner DOM
			await expect(page.getByText('GPS coordinates').first()).toBeVisible();
			await expect(page.getByText('Device identity').first()).toBeVisible();
			// Use exact match: "Personal data leak probable" also contains "Personal data"
			await expect(page.getByText('Personal data', { exact: true }).first()).toBeVisible();
			await expect(page.getByText('Timestamp').first()).toBeVisible();
		});

		test('adding a second file keeps the URL at / and shows both files', async ({ page }) => {
			await page.goto('/');
			await page.locator('#dropzone-file-input').setInputFiles(TEST_FILE);
			await expect(page.getByText('photo.jpg')).toBeVisible();

			await page.locator('#dropzone-file-input').setInputFiles(SECOND_FILE);

			expect(page.url()).toMatch(/\/$/);
			await expect(page.getByText('vacation.jpg')).toBeVisible();
		});

		test('StatusCardIdle disappears after files are added', async ({ page }) => {
			await page.goto('/');
			// Idle status card is shown before files are added (step1.status.waitingForFiles key)
			await expect(page.getByText('Waiting for files')).toBeVisible();

			await page.locator('#dropzone-file-input').setInputFiles(TEST_FILE);

			// The idle status card is no longer rendered
			await expect(page.getByText('Waiting for files')).not.toBeVisible();
		});
	});

	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('URL stays at / after uploading files on mobile', async ({ page }) => {
			await page.goto('/');
			await page.locator('#dropzone-file-input').setInputFiles(TEST_FILE);

			await expect(page.getByText('photo.jpg')).toBeVisible();
			expect(page.url()).toMatch(/\/$/);
		});

		test('MobileRiskBanner accordion appears after uploading files', async ({ page }) => {
			await page.goto('/');
			// Banner is not visible before files are added
			const riskBannerToggle = page
				.locator('button[type="button"]')
				.filter({ hasText: 'Risk Scanner' })
				.first();
			await expect(riskBannerToggle).not.toBeVisible();

			await page.locator('#dropzone-file-input').setInputFiles(TEST_FILE);

			// After adding files the MobileRiskBanner (lg:hidden) appears
			await expect(riskBannerToggle).toBeVisible();
		});

		test('FileListCard appears with file name on mobile', async ({ page }) => {
			await page.goto('/');
			await page.locator('#dropzone-file-input').setInputFiles(TEST_FILE);

			await expect(page.getByText('Files to process')).toBeVisible();
			await expect(page.getByText('photo.jpg')).toBeVisible();
		});

		test('mobile fixed bottom bar shows enabled Start Cleaning button', async ({ page }) => {
			await page.goto('/');
			await page.locator('#dropzone-file-input').setInputFiles(TEST_FILE);

			// MobileBottomCta is a fixed bottom bar (z-50, lg:hidden)
			const mobileBar = page.locator('.fixed.bottom-0');
			await expect(mobileBar).toBeVisible();
			await expect(mobileBar.getByRole('button', { name: /start cleaning/i })).toBeEnabled();
		});

		test('MobileRiskBanner expands/collapses on tap', async ({ page }) => {
			await page.goto('/');
			await page.locator('#dropzone-file-input').setInputFiles(TEST_FILE);

			const bannerToggle = page
				.locator('button[type="button"]')
				.filter({ hasText: 'Risk Scanner' })
				.first();
			await expect(bannerToggle).toBeVisible();

			// Expand the accordion
			await bannerToggle.click();
			// Risk breakdown rows appear inside expanded body
			// Use .first(): RiskScannerCard (hidden on mobile) also has GPS coordinates in DOM
			await expect(page.getByText('GPS coordinates').first()).toBeVisible();

			// Collapse again — MobileRiskBanner body is removed from DOM ({#if accordionOpen})
			await bannerToggle.click();
			// After collapse, only the hidden RiskScannerCard's GPS element remains — not visible
			await expect(page.getByText('GPS coordinates').first()).not.toBeVisible();
		});

		test('RiskScannerCard sidebar is hidden on mobile', async ({ page }) => {
			await page.goto('/');
			await page.locator('#dropzone-file-input').setInputFiles(TEST_FILE);

			// RiskScannerCard is inside a .hidden.lg\\:flex wrapper — not visible on 375px
			// Use .first() because both the Step2FilesReady wrapper and RiskScannerCard's inner div have hidden+lg:flex
			const desktopSidebar = page
				.locator('.hidden.lg\\:flex')
				.filter({ hasText: 'Risk Scanner' })
				.first();
			await expect(desktopSidebar).not.toBeVisible();
		});
	});
});
