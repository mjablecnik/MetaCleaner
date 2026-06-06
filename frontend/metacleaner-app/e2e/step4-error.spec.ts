import { test, expect, type Page } from 'playwright/test';

// JPEG SOI+EOI bytes — passes file extension and MIME validation
const ERROR_FILE = {
	name: 'error-test.jpg',
	mimeType: 'image/jpeg',
	buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9])
};

async function navigateToErrorState(page: Page, viewport: 'desktop' | 'mobile') {
	await page.goto('/');
	await page.locator('#dropzone-file-input').setInputFiles(ERROR_FILE);
	await expect(page.getByText('error-test.jpg').first()).toBeVisible();

	if (viewport === 'desktop') {
		const startBtn = page.locator('.hidden.lg\\:block').getByRole('button', {
			name: /start cleaning/i
		});
		await startBtn.click();
	} else {
		const mobileBar = page.locator('.fixed.bottom-0');
		await mobileBar.getByRole('button', { name: /start cleaning/i }).click();
	}

	// Wait for error state — mock service triggers onError after ~700ms
	await expect(page.getByText('Cleaning process failed')).toBeVisible({ timeout: 5000 });
}

test.describe('Step 4 — Error flow (SPA)', () => {
	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('URL stays at / after error is triggered', async ({ page }) => {
			await navigateToErrorState(page, 'desktop');
			expect(page.url()).toMatch(/\/$/);
		});

		test('error badge "Processing error" is visible on desktop', async ({ page }) => {
			await navigateToErrorState(page, 'desktop');
			await expect(page.getByText('Processing error')).toBeVisible();
		});

		test('error banner shows "Cleaning process failed" with error code', async ({ page }) => {
			await navigateToErrorState(page, 'desktop');
			await expect(page.getByText('Cleaning process failed')).toBeVisible();
			// ERR-0x4A2 appears multiple times (banner badge, ErrorStateCard, log entries)
			await expect(page.getByText('ERR-0x4A2').first()).toBeVisible();
		});

		test('error banner can be dismissed', async ({ page }) => {
			await navigateToErrorState(page, 'desktop');

			const banner = page.locator('div').filter({ hasText: 'Cleaning process failed' }).first();
			await expect(banner).toBeVisible();

			await page.getByRole('button', { name: /dismiss/i }).click();

			await expect(page.getByText('Cleaning process failed')).not.toBeVisible();
		});

		test('error file card shows the uploaded file with error status', async ({ page }) => {
			await navigateToErrorState(page, 'desktop');

			// Scope to the desktop grid — ErrorFilesCard appears in both mobile (hidden) and desktop (visible) sections
			const desktopGrid = page.locator('.hidden.gap-6');
			// File name appears multiple times (file row, error detail, log entry) — first is the file row <p>
			await expect(desktopGrid.getByText('error-test.jpg').first()).toBeVisible();
			await expect(desktopGrid.getByText('Processing failed').first()).toBeVisible();
		});

		test('"Overall progress" section shows "Interrupted" label', async ({ page }) => {
			await navigateToErrorState(page, 'desktop');

			// Scope to desktop grid — same content appears in hidden mobile section first in DOM
			const desktopGrid = page.locator('.hidden.gap-6');
			await expect(desktopGrid.getByText('Overall progress').first()).toBeVisible();
			await expect(desktopGrid.getByText('Interrupted').first()).toBeVisible();
		});

		test('"Try again" button returns to files-ready state', async ({ page }) => {
			await navigateToErrorState(page, 'desktop');

			// Click Try again in desktop ErrorFilesCard (inside the visible desktop grid)
			const tryAgainBtn = page.locator('.hidden.gap-6').getByRole('button', {
				name: /try again/i
			});
			await tryAgainBtn.click();

			// Error state is gone
			await expect(page.getByText('Cleaning process failed')).not.toBeVisible();
			// Files-ready state shows Risk Scanner
			await expect(page.getByRole('heading', { level: 3, name: 'Risk Scanner' })).toBeVisible();
			// File is still present
			await expect(page.getByText('error-test.jpg').first()).toBeVisible();
			// URL unchanged
			expect(page.url()).toMatch(/\/$/);
		});

		test('"Clear all" button returns to idle state', async ({ page }) => {
			await navigateToErrorState(page, 'desktop');

			const clearAllBtn = page.locator('.hidden.gap-6').getByRole('button', {
				name: /clear all/i
			});
			await clearAllBtn.click();

			// Idle state — waiting for files
			await expect(page.getByText('Waiting for files')).toBeVisible();
			// URL unchanged
			expect(page.url()).toMatch(/\/$/);
		});

		test('mobile accordions (ErrorDetail, ErrorLog) are not visible on desktop', async ({
			page
		}) => {
			await navigateToErrorState(page, 'desktop');

			// These accordions are inside the lg:hidden mobile container
			const mobileContainer = page.locator('.flex.flex-col.gap-4.lg\\:hidden');
			await expect(mobileContainer).not.toBeVisible();
		});

		test('ErrorStateCard sidebar shows "Metadata cleaning failed" on desktop', async ({ page }) => {
			await navigateToErrorState(page, 'desktop');

			// ErrorStateCard is inside the desktop grid (visible at 1280px)
			// Mobile error visual also has "Metadata cleaning failed" but is hidden at 1280px
			const desktopGrid = page.locator('.hidden.gap-6');
			await expect(desktopGrid.getByText('Metadata cleaning failed')).toBeVisible();
		});

		test('can restart cleaning after error by clicking Try again', async ({ page }) => {
			await navigateToErrorState(page, 'desktop');

			const tryAgainBtn = page.locator('.hidden.gap-6').getByRole('button', {
				name: /try again/i
			});
			await tryAgainBtn.click();

			// Files-ready: Start Cleaning re-enabled
			const startBtn = page
				.locator('.hidden.lg\\:block')
				.getByRole('button', { name: /start cleaning/i });
			await expect(startBtn).toBeEnabled();
		});
	});

	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('URL stays at / after error on mobile', async ({ page }) => {
			await navigateToErrorState(page, 'mobile');
			expect(page.url()).toMatch(/\/$/);
		});

		test('mobile error badge "Error" is visible', async ({ page }) => {
			await navigateToErrorState(page, 'mobile');
			// "Error" exact match to avoid matching "Processing error" (desktop badge, hidden at 375px)
			// First exact "Error" in DOM is the mobile Step4 badge span (visible at 375px)
			await expect(page.getByText('Error', { exact: true }).first()).toBeVisible();
		});

		test('mobile error visual shows "Metadata cleaning failed"', async ({ page }) => {
			await navigateToErrorState(page, 'mobile');
			// Mobile error visual card comes first in DOM (inside lg:hidden section, visible at 375px)
			await expect(page.getByText('Metadata cleaning failed').first()).toBeVisible();
		});

		test('error banner shows on mobile', async ({ page }) => {
			await navigateToErrorState(page, 'mobile');
			await expect(page.getByText('Cleaning process failed')).toBeVisible();
		});

		test('ErrorDetailAccordion is visible on mobile (starts open)', async ({ page }) => {
			await navigateToErrorState(page, 'mobile');

			const detailBtn = page.getByRole('button', { name: /error detail/i });
			await expect(detailBtn).toBeVisible();

			// Accordion starts open — "Error code" label should be visible
			await expect(page.getByText('Error code').first()).toBeVisible();
		});

		test('ErrorDetailAccordion can be collapsed then expanded independently', async ({ page }) => {
			await navigateToErrorState(page, 'mobile');

			const detailBtn = page.getByRole('button', { name: /error detail/i });
			const logBtn = page.getByRole('button', { name: /error log/i });

			// Both start open — "Error code" visible
			await expect(page.getByText('Error code').first()).toBeVisible();
			await expect(logBtn).toBeVisible();

			// Collapse only the detail accordion
			await detailBtn.click();
			await expect(page.getByText('Error code')).not.toBeVisible();

			// Error log accordion is still open (independent)
			await expect(logBtn).toBeVisible();

			// Re-expand the detail accordion
			await detailBtn.click();
			await expect(page.getByText('Error code').first()).toBeVisible();
		});

		test('ErrorLogAccordion is visible on mobile (starts open)', async ({ page }) => {
			await navigateToErrorState(page, 'mobile');

			const logBtn = page.getByRole('button', { name: /error log/i });
			await expect(logBtn).toBeVisible();
		});

		test('ErrorLogAccordion collapses and expands independently of ErrorDetailAccordion', async ({
			page
		}) => {
			await navigateToErrorState(page, 'mobile');

			const detailBtn = page.getByRole('button', { name: /error detail/i });
			const logBtn = page.getByRole('button', { name: /error log/i });

			// Collapse only the log accordion
			await logBtn.click();

			// Detail accordion remains open — Error code label still visible
			await expect(page.getByText('Error code').first()).toBeVisible();

			// Expand log accordion again
			await logBtn.click();
			await expect(logBtn).toBeVisible();

			// Detail accordion still intact
			await expect(detailBtn).toBeVisible();
		});

		test('ErrorTypeAccordion is visible and independently collapsible', async ({ page }) => {
			await navigateToErrorState(page, 'mobile');

			const typeBtn = page.getByRole('button', { name: /error type/i });
			await expect(typeBtn).toBeVisible();

			// Starts open — "Cleaning error" option visible
			await expect(page.getByText('Cleaning error').first()).toBeVisible();

			// Collapse it
			await typeBtn.click();
			await expect(page.getByText('Cleaning error')).not.toBeVisible();

			// Detail accordion not affected — ErrorDetailAccordion still accessible
			const detailBtn = page.getByRole('button', { name: /error detail/i });
			await expect(detailBtn).toBeVisible();
			await expect(page.getByText('Error code').first()).toBeVisible();

			// Re-expand type accordion
			await typeBtn.click();
			await expect(page.getByText('Cleaning error').first()).toBeVisible();
		});

		test('"Try again" button returns to files-ready state on mobile', async ({ page }) => {
			await navigateToErrorState(page, 'mobile');

			// Try again is in the mobile section (lg:hidden container)
			const mobileContainer = page.locator('.flex.flex-col.gap-4.lg\\:hidden');
			const tryAgainBtn = mobileContainer.getByRole('button', { name: /try again/i });
			await tryAgainBtn.click();

			// Error state gone
			await expect(page.getByText('Cleaning process failed')).not.toBeVisible();
			// File still present
			await expect(page.getByText('error-test.jpg').first()).toBeVisible();
			// Mobile bottom CTA with Start Cleaning reappears
			const mobileBar = page.locator('.fixed.bottom-0');
			await expect(mobileBar.getByRole('button', { name: /start cleaning/i })).toBeVisible();
			// URL unchanged
			expect(page.url()).toMatch(/\/$/);
		});

		test('mobile "Interrupted" label is visible in error visual card', async ({ page }) => {
			await navigateToErrorState(page, 'mobile');
			// "Interrupted" appears multiple times; mobile visual card comes first in DOM
			await expect(page.getByText('Interrupted').first()).toBeVisible();
		});

		test('desktop sidebar "Processing status" is not visible on mobile', async ({ page }) => {
			await navigateToErrorState(page, 'mobile');

			// ErrorStateCard is inside hidden.gap-6 desktop grid — not visible at 375px
			const desktopGrid = page.locator('.hidden.gap-6');
			await expect(desktopGrid).not.toBeVisible();
		});
	});
});
