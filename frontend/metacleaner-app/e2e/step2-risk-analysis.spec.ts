import { test, expect } from 'playwright/test';

// Minimal JPEG (SOI + EOI) — same as step1 test
const TEST_FILE = {
	name: 'photo.jpg',
	mimeType: 'image/jpeg',
	buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9])
};

// Upload a file and wait for files-ready state (SPA — stays on /, no URL navigation)
async function enterFilesReadyState(page: import('playwright/test').Page) {
	await page.goto('/');
	await page.locator('#dropzone-file-input').setInputFiles(TEST_FILE);
	await expect(page.getByText('photo.jpg')).toBeVisible();
	// Files-ready state renders on the same URL — no navigation needed
}

test.describe('Step 2 — Files Ready (Risk Analysis)', () => {
	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('renders page heading and risk scanner card after file upload', async ({ page }) => {
			await enterFilesReadyState(page);

			// Main heading stays "Metadata Cleaning" throughout the SPA
			await expect(page.getByRole('heading', { level: 1 })).toContainText('Metadata Cleaning');
			// Risk scanner card heading appears on files-ready state
			await expect(page.getByRole('heading', { level: 3, name: 'Risk Scanner' })).toBeVisible();
		});

		test('shows risk description text', async ({ page }) => {
			await enterFilesReadyState(page);

			await expect(page.getByText('Your files contain sensitive metadata')).toBeVisible();
		});

		test('shows risk breakdown bars', async ({ page }) => {
			await enterFilesReadyState(page);

			await expect(page.getByText('GPS coordinates')).toBeVisible();
			await expect(page.getByText('Device identity')).toBeVisible();
			await expect(page.getByText('Personal data')).toBeVisible();
			await expect(page.getByText('Timestamp')).toBeVisible();
		});

		test('shows risk analysis section heading', async ({ page }) => {
			await enterFilesReadyState(page);

			await expect(page.getByText('Risk analysis')).toBeVisible();
		});

		test('"Start cleaning" button is visible on desktop', async ({ page }) => {
			await enterFilesReadyState(page);

			// Desktop CTA button is inside .hidden.lg:block section
			const desktopCta = page.locator('.hidden.lg\\:block').getByRole('button', { name: /start cleaning/i });
			await expect(desktopCta).toBeVisible();
		});

		test('"Start cleaning" button transitions to processing state', async ({ page }) => {
			await enterFilesReadyState(page);

			const cleanButton = page.locator('.hidden.lg\\:block').getByRole('button', { name: /start cleaning/i });
			await cleanButton.click();

			// Processing state appears on same URL
			await expect(page.getByText('Cleaning in progress...')).toBeVisible();
			expect(page.url()).toMatch(/\/$/);
		});

		test('shows BeforeAfterScore section', async ({ page }) => {
			await enterFilesReadyState(page);

			// "After cleaning" label from BeforeAfterScore component
			await expect(page.getByText('After cleaning')).toBeVisible();
		});

		test('shows reduce risk CTA hint', async ({ page }) => {
			await enterFilesReadyState(page);

			await expect(page.getByText('reduce risk to 0')).toBeVisible();
		});

		test('URL stays at / after entering files-ready state', async ({ page }) => {
			await enterFilesReadyState(page);
			expect(page.url()).toMatch(/\/$/);
		});
	});

	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('renders mobile heading and risk scanner card after file upload', async ({ page }) => {
			await enterFilesReadyState(page);

			await expect(page.getByRole('heading', { level: 1 })).toContainText('Metadata Cleaning');
			// Mobile risk banner (accordion) appears
			await expect(page.getByRole('heading', { level: 3, name: 'Risk Scanner' })).toBeVisible();
		});

		test('shows risk breakdown bars on mobile', async ({ page }) => {
			await enterFilesReadyState(page);

			await expect(page.getByText('GPS coordinates')).toBeVisible();
			await expect(page.getByText('Device identity')).toBeVisible();
			await expect(page.getByText('Personal data')).toBeVisible();
			await expect(page.getByText('Timestamp')).toBeVisible();
		});

		test('mobile fixed bottom bar with Start Cleaning is visible', async ({ page }) => {
			await enterFilesReadyState(page);

			const mobileBar = page.locator('.fixed.bottom-0');
			await expect(mobileBar).toBeVisible();
			await expect(mobileBar.getByRole('button', { name: /start cleaning/i })).toBeVisible();
		});

		test('"Start cleaning" on mobile transitions to processing state', async ({ page }) => {
			await enterFilesReadyState(page);

			const mobileBar = page.locator('.fixed.bottom-0');
			await mobileBar.getByRole('button', { name: /start cleaning/i }).click();

			// Processing badge appears (mobile shorter text)
			await expect(page.getByText('In progress...')).toBeVisible();
			expect(page.url()).toMatch(/\/$/);
		});

		test('URL stays at / in files-ready state on mobile', async ({ page }) => {
			await enterFilesReadyState(page);
			expect(page.url()).toMatch(/\/$/);
		});
	});
});
