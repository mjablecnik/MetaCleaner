import { test, expect, type Page } from 'playwright/test';
import { injectAuth } from './helpers/auth.js';

test.beforeEach(async ({ page }) => {
	await injectAuth(page);
});

// Minimal JPEG (SOI + EOI) — valid file accepted by all checks.
const VALID_JPEG = {
	name: 'photo.jpg',
	mimeType: 'image/jpeg',
	buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9])
};

// PDF file — unsupported extension AND MIME type.
const UNSUPPORTED_PDF = {
	name: 'document.pdf',
	mimeType: 'application/pdf',
	buffer: Buffer.from([0x25, 0x50, 0x44, 0x46]) // %PDF magic bytes
};

/**
 * Triggers the dropzone file input's change event with a synthetic File whose
 * `size` property is overridden to exceed the 500 MB limit, without allocating a
 * 500 MB buffer in the test process.
 */
async function uploadLargeFile(page: Page, fileName = 'large.jpg') {
	// Wait for the file input to be attached to DOM — input has class="hidden" so state: attached avoids visibility check
	await page.waitForSelector('#dropzone-file-input', { state: 'attached' });
	await page.evaluate((name) => {
		const input = document.getElementById('dropzone-file-input') as HTMLInputElement;
		if (!input) throw new Error('#dropzone-file-input not found');

		// Create a tiny file then shadow its inherited Blob.size getter on the instance.
		const file = new File(['x'], name, { type: 'image/jpeg' });
		Object.defineProperty(file, 'size', {
			get: () => 600 * 1024 * 1024, // 600 MB > 500 MB limit
			configurable: true
		});

		// Build a minimal iterable FileList surrogate.
		const mockFiles: File[] = [file];
		const fakeFileList = {
			0: file,
			length: 1,
			item(i: number): File | null {
				return i === 0 ? file : null;
			},
			[Symbol.iterator]() {
				return mockFiles[Symbol.iterator]();
			}
		};

		// Shadow the read-only input.files property so the Svelte handler reads our fake list.
		Object.defineProperty(input, 'files', { get: () => fakeFileList, configurable: true });
		input.dispatchEvent(new Event('change', { bubbles: true }));
	}, fileName);
}

test.describe('File upload validation', () => {
	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('rejects unsupported file type and shows toast without adding file', async ({ page }) => {
			await page.goto('/');
			await page.locator('#dropzone-file-input').setInputFiles(UNSUPPORTED_PDF);

			// Desktop toast appears with "unsupported format" message
			const toast = page.locator('.toast-desktop');
			await expect(toast).toBeVisible();
			await expect(toast).toContainText('unsupported format');

			// Rejected file is NOT visible in the file list
			await expect(page.getByText('document.pdf')).not.toBeVisible();

			// App remains in idle state — StatusCardIdle still shown
			await expect(page.getByText('Waiting for files')).toBeVisible();
		});

		test('rejects file exceeding 500 MB and shows toast without adding file', async ({ page }) => {
			await page.goto('/');
			await uploadLargeFile(page, 'huge-photo.jpg');

			// Desktop toast appears with size limit message
			const toast = page.locator('.toast-desktop');
			await expect(toast).toBeVisible();
			await expect(toast).toContainText('500 MB');

			// Rejected file is NOT visible in the file list
			await expect(page.getByText('huge-photo.jpg')).not.toBeVisible();

			// App remains in idle state
			await expect(page.getByText('Waiting for files')).toBeVisible();
		});

		test('accepts valid files and rejects invalid ones in a mixed batch', async ({ page }) => {
			await page.goto('/');

			// Upload one valid JPEG alongside one unsupported PDF in the same batch
			await page.locator('#dropzone-file-input').setInputFiles([VALID_JPEG, UNSUPPORTED_PDF]);

			// Valid file appears in the file list (app transitions to files-ready)
			await expect(page.getByText('photo.jpg')).toBeVisible();

			// Invalid file is NOT shown
			await expect(page.getByText('document.pdf')).not.toBeVisible();

			// Start Cleaning button is enabled because valid file was added
			await expect(page.getByRole('button', { name: /start cleaning/i })).toBeEnabled();
			// Note: toast for rejected file cannot be tested in mixed batches because
			// the valid file triggers a state transition that unmounts the toast component
		});
	});

	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('rejects unsupported file type and shows mobile toast', async ({ page }) => {
			await page.goto('/');
			await page.locator('#dropzone-file-input').setInputFiles(UNSUPPORTED_PDF);

			// Mobile toast appears (desktop toast is hidden at this viewport)
			const toast = page.locator('.toast-mobile');
			await expect(toast).toBeVisible();
			await expect(toast).toContainText('unsupported format');

			// Rejected file is NOT shown
			await expect(page.getByText('document.pdf')).not.toBeVisible();

			// App stays in idle state
			await expect(page.getByText('Waiting for files')).toBeVisible();
		});

		test('rejects file exceeding 500 MB on mobile and shows toast', async ({ page }) => {
			await page.goto('/');
			await uploadLargeFile(page, 'huge-photo.jpg');

			// Mobile toast appears with size limit message
			const toast = page.locator('.toast-mobile');
			await expect(toast).toBeVisible();
			await expect(toast).toContainText('500 MB');

			// Rejected file is NOT shown
			await expect(page.getByText('huge-photo.jpg')).not.toBeVisible();
		});
	});
});
