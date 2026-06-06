import { test, expect, type Page } from 'playwright/test';

// Minimal JPEG (SOI + EOI): accepted by extension/MIME validation
const TEST_FILE = {
	name: 'photo.jpg',
	mimeType: 'image/jpeg',
	buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9])
};

async function navigateToStep5(page: Page, viewport: 'desktop' | 'mobile') {
	await page.goto('/');
	await page.locator('#dropzone-file-input').setInputFiles(TEST_FILE);
	await expect(page.getByText('photo.jpg')).toBeVisible();

	if (viewport === 'desktop') {
		const startBtn = page.locator('.hidden.lg\\:block').getByRole('button', {
			name: /start cleaning/i
		});
		await startBtn.click();
	} else {
		const mobileBar = page.locator('.fixed.bottom-0');
		await mobileBar.getByRole('button', { name: /start cleaning/i }).click();
	}

	// Wait for success state
	await expect(page.getByRole('heading', { level: 1, name: /cleaning complete/i })).toBeVisible({
		timeout: 10000
	});
}

test.describe('Step 5 → Report navigation (SPA)', () => {
	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('"View report" button navigates to /report', async ({ page }) => {
			await navigateToStep5(page, 'desktop');

			await page.getByRole('button', { name: /view report/i }).first().click();

			await page.waitForURL('**/report**');
			expect(page.url()).toMatch(/\/report/);
		});

		test('report page shows "Detailed cleaning report" heading after navigation from Step 5', async ({
			page
		}) => {
			await navigateToStep5(page, 'desktop');

			await page.getByRole('button', { name: /view report/i }).first().click();
			await page.waitForURL('**/report**');

			// Report page title
			await expect(
				page.getByRole('heading', { level: 1, name: /detailed cleaning report/i })
			).toBeVisible({ timeout: 5000 });
		});

		test('report page shows stat cards after navigation from Step 5', async ({ page }) => {
			await navigateToStep5(page, 'desktop');

			await page.getByRole('button', { name: /view report/i }).first().click();
			await page.waitForURL('**/report**');

			// Wait for loading to complete (mock service has 200ms delay)
			await expect(
				page.getByRole('heading', { level: 1, name: /detailed cleaning report/i })
			).toBeVisible({ timeout: 5000 });

			// Summary stats from the report — use exact match to avoid "Metadata fields removed per file"
			await expect(
				page.getByText('Files processed', { exact: true }).first()
			).toBeVisible();
			await expect(
				page.getByText('Metadata fields removed', { exact: true }).first()
			).toBeVisible();
		});

		test('"Back to results" link on /report navigates to /reports', async ({ page }) => {
			await navigateToStep5(page, 'desktop');

			await page.getByRole('button', { name: /view report/i }).first().click();
			await page.waitForURL('**/report**');

			// Desktop NavBar back button — shown as <a> with text "Back to results"
			await page.getByRole('link', { name: /back to results/i }).click();

			await page.waitForURL('**/reports');
			expect(page.url()).toMatch(/\/reports/);
		});

		test('"Back to cleaning" link on /reports navigates to / in idle state', async ({ page }) => {
			await navigateToStep5(page, 'desktop');

			// Navigate to /report via "View report" button
			await page.getByRole('button', { name: /view report/i }).first().click();
			await page.waitForURL('**/report**');

			// Navigate back to /reports via "Back to results"
			await page.getByRole('link', { name: /back to results/i }).click();
			await page.waitForURL('**/reports');

			// Navigate back to / via "Back to cleaning"
			await page.getByRole('link', { name: /back to cleaning/i }).click();
			await page.waitForURL('**/');

			// Main page shows idle state (Step 1)
			await expect(page.getByText('Waiting for files')).toBeVisible();
		});

		test('URL is /report after "View report" navigation — not still /', async ({ page }) => {
			await navigateToStep5(page, 'desktop');

			// Confirm we're at / before clicking
			expect(page.url()).toMatch(/\/$/);

			await page.getByRole('button', { name: /view report/i }).first().click();
			await page.waitForURL('**/report**');

			// URL must have changed
			expect(page.url()).not.toMatch(/\/$/);
			expect(page.url()).toMatch(/\/report/);
		});
	});

	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('"View report" button navigates to /report on mobile', async ({ page }) => {
			await navigateToStep5(page, 'mobile');

			await page.getByRole('button', { name: /view report/i }).first().click();

			await page.waitForURL('**/report**');
			expect(page.url()).toMatch(/\/report/);
		});

		test('report page shows heading on mobile', async ({ page }) => {
			await navigateToStep5(page, 'mobile');

			await page.getByRole('button', { name: /view report/i }).first().click();
			await page.waitForURL('**/report**');

			await expect(
				page.getByRole('heading', { level: 1, name: /detailed cleaning report/i })
			).toBeVisible({ timeout: 5000 });
		});

		test('mobile back arrow on /report navigates to /reports', async ({ page }) => {
			await navigateToStep5(page, 'mobile');

			await page.getByRole('button', { name: /view report/i }).first().click();
			await page.waitForURL('**/report**');

			// Mobile NavBar back button — shown as <a aria-label="Go back">
			await page.getByRole('link', { name: /go back/i }).click();

			await page.waitForURL('**/reports');
			expect(page.url()).toMatch(/\/reports/);
		});

		test('full mobile back navigation: /report → /reports → / (idle)', async ({ page }) => {
			await navigateToStep5(page, 'mobile');

			// Step 5 → /report
			await page.getByRole('button', { name: /view report/i }).first().click();
			await page.waitForURL('**/report**');

			// /report → /reports (via mobile back arrow)
			await page.getByRole('link', { name: /go back/i }).click();
			await page.waitForURL('**/reports');

			// /reports → / (via mobile back arrow)
			await page.getByRole('link', { name: /go back/i }).click();
			await page.waitForURL('**/');

			// Main page should show idle state
			await expect(page.getByText('Waiting for files')).toBeVisible();
		});
	});
});
