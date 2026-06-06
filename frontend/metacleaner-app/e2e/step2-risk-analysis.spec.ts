import { test, expect } from 'playwright/test';

// Minimal JPEG (SOI + EOI) — same as step1 test
const TEST_FILE = {
	name: 'photo.jpg',
	mimeType: 'image/jpeg',
	buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9])
};

async function navigateToStep2(page: import('playwright/test').Page) {
	await page.goto('/');
	await page.locator('#dropzone-file-input').setInputFiles(TEST_FILE);
	await expect(page.getByText('photo.jpg')).toBeVisible();
	await page.getByRole('button', { name: /start cleaning/i }).click();
	await page.waitForURL('**/step2');
}

test.describe('Step 2 — Risk Analysis', () => {
	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('renders page heading and risk scanner card', async ({ page }) => {
			await navigateToStep2(page);

			// Desktop heading
			await expect(page.getByRole('heading', { level: 1 })).toContainText('Ready to start');
			// Risk scanner card heading
			await expect(page.getByRole('heading', { level: 3, name: 'Risk Scanner' })).toBeVisible();
		});

		test('shows risk description text', async ({ page }) => {
			await navigateToStep2(page);

			await expect(
				page.getByText('Your files contain sensitive metadata')
			).toBeVisible();
		});

		test('shows risk breakdown bars', async ({ page }) => {
			await navigateToStep2(page);

			await expect(page.getByText('GPS coordinates')).toBeVisible();
			await expect(page.getByText('Device identity')).toBeVisible();
			await expect(page.getByText('Personal data')).toBeVisible();
			await expect(page.getByText('Timestamp')).toBeVisible();
		});

		test('shows risk analysis section heading', async ({ page }) => {
			await navigateToStep2(page);

			await expect(page.getByText('Risk analysis')).toBeVisible();
		});

		test('shows file count summary', async ({ page }) => {
			await navigateToStep2(page);

			await expect(page.getByText(/file.*ready for cleaning/i)).toBeVisible();
		});

		test('"Start cleaning" button is visible on desktop', async ({ page }) => {
			await navigateToStep2(page);

			// Desktop CTA is in the main content (not fixed bottom bar)
			const desktopCta = page.locator('.hidden.lg\\:flex button', { hasText: /start cleaning/i });
			await expect(desktopCta).toBeVisible();
		});

		test('"Add more files" back button navigates to /', async ({ page }) => {
			await navigateToStep2(page);

			// Click the desktop "Add more files" button (inside the hidden lg:flex section)
			const backButton = page.locator('.hidden.lg\\:flex button', { hasText: /add more files/i });
			await backButton.click();

			await page.waitForURL('**/');
			await expect(page).toHaveURL(/\/$/);
		});

		test('"Start cleaning" button navigates to /step3', async ({ page }) => {
			await navigateToStep2(page);

			const cleanButton = page.locator('.hidden.lg\\:flex button', { hasText: /start cleaning/i });
			await cleanButton.click();

			await page.waitForURL('**/step3');
			await expect(page).toHaveURL(/\/step3/);
		});

		test('shows BeforeAfterScore section', async ({ page }) => {
			await navigateToStep2(page);

			// "After cleaning" label from BeforeAfterScore component
			await expect(page.getByText('After cleaning')).toBeVisible();
		});

		test('shows reduce risk CTA hint', async ({ page }) => {
			await navigateToStep2(page);

			await expect(page.getByText('reduce risk to 0')).toBeVisible();
		});
	});

	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('renders mobile heading and risk scanner card', async ({ page }) => {
			await navigateToStep2(page);

			// Mobile heading
			await expect(page.getByRole('heading', { level: 1 })).toContainText('Ready');
			await expect(page.getByRole('heading', { level: 3, name: 'Risk Scanner' })).toBeVisible();
		});

		test('shows risk breakdown bars on mobile', async ({ page }) => {
			await navigateToStep2(page);

			await expect(page.getByText('GPS coordinates')).toBeVisible();
			await expect(page.getByText('Device identity')).toBeVisible();
			await expect(page.getByText('Personal data')).toBeVisible();
			await expect(page.getByText('Timestamp')).toBeVisible();
		});

		test('mobile fixed bottom bar with Start Cleaning is visible', async ({ page }) => {
			await navigateToStep2(page);

			// The mobile fixed bottom bar contains "Start cleaning"
			const mobileBar = page.locator('.fixed.bottom-0');
			await expect(mobileBar).toBeVisible();
			await expect(mobileBar.getByRole('button', { name: /start cleaning/i })).toBeVisible();
		});

		test('"Start cleaning" on mobile navigates to /step3', async ({ page }) => {
			await navigateToStep2(page);

			const mobileBar = page.locator('.fixed.bottom-0');
			await mobileBar.getByRole('button', { name: /start cleaning/i }).click();

			await page.waitForURL('**/step3');
			await expect(page).toHaveURL(/\/step3/);
		});

		test('"Add more files" on mobile navigates back to /', async ({ page }) => {
			await navigateToStep2(page);

			const mobileBar = page.locator('.fixed.bottom-0');
			await mobileBar.getByRole('button', { name: /add more files/i }).click();

			await page.waitForURL('**/');
			await expect(page).toHaveURL(/\/$/);
		});
	});

	test.describe('route guard', () => {
		test('redirects to / when no files in store', async ({ page }) => {
			// Navigate directly to /step2 without going through step1
			await page.goto('/step2');

			// Route guard should redirect to /
			await page.waitForURL('**/');
			await expect(page).toHaveURL(/\/$/);
		});
	});
});
