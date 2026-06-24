import { test, expect, type Page } from 'playwright/test';

// All tests use desktop viewport so the sidebar is visible (hidden lg:block)
test.use({ viewport: { width: 1280, height: 800 } });

// Inject a fake auth token so the docs auth guard lets us through.
// Must be called before the first page.goto().
async function injectAuth(page: Page) {
	await page.addInitScript(() => {
		const farFuture = String(Date.now() + 3600 * 1000);
		localStorage.setItem('mc_access_token', 'fake-test-token-for-e2e');
		localStorage.setItem('mc_refresh_token', 'fake-refresh-token');
		localStorage.setItem('mc_token_expires_at', farFuture);
	});
}

async function goToDocs(page: Page, path = '/docs/endpoints') {
	await injectAuth(page);
	await page.goto(path);
	await expect(page.locator('aside')).toBeVisible({ timeout: 8000 });
}

test.describe('Docs sidebar highlight — initial state', () => {
	test('all endpoint cards are closed by default (no hash)', async ({ page }) => {
		await goToDocs(page);

		// None of the endpoint cards should have an expanded content area visible
		await expect(page.locator('[data-section-id] .border-t')).toHaveCount(0);
	});

	test('all sidebar endpoint entries have default style on initial load', async ({ page }) => {
		await goToDocs(page);

		// ep-upload sidebar link should not be highlighted
		const uploadLink = page.locator('aside a[href*="#ep-upload"]');
		await expect(uploadLink).toBeVisible();
		await expect(uploadLink).not.toHaveClass(/font-semibold/);
		await expect(uploadLink).not.toHaveClass(/text-brand-blue/);
	});
});

test.describe('Docs sidebar highlight — card open/close interaction', () => {
	test('opening a card highlights the corresponding sidebar entry', async ({ page }) => {
		await goToDocs(page);

		const uploadSidebarLink = page.locator('aside a[href*="#ep-upload"]');
		await expect(uploadSidebarLink).not.toHaveClass(/font-semibold/);

		// Click the ep-upload card header to open it
		await page.locator('#ep-upload > button').click();

		// Card should now be open
		await expect(page.locator('#ep-upload .border-t')).toBeVisible();

		// Sidebar entry should now be highlighted
		await expect(uploadSidebarLink).toHaveClass(/font-semibold/);
		await expect(uploadSidebarLink).toHaveClass(/text-brand-blue/);
	});

	test('closing a card removes the sidebar highlight', async ({ page }) => {
		await goToDocs(page);

		const uploadSidebarLink = page.locator('aside a[href*="#ep-upload"]');
		const uploadCardHeader = page.locator('#ep-upload > button');

		// Open the card
		await uploadCardHeader.click();
		await expect(page.locator('#ep-upload .border-t')).toBeVisible();
		await expect(uploadSidebarLink).toHaveClass(/font-semibold/);

		// Close the card
		await uploadCardHeader.click();
		await expect(page.locator('#ep-upload .border-t')).not.toBeVisible();

		// Sidebar entry should revert to default style
		await expect(uploadSidebarLink).not.toHaveClass(/font-semibold/);
		await expect(uploadSidebarLink).not.toHaveClass(/text-brand-blue/);
	});

	test('opening multiple cards highlights all corresponding sidebar entries', async ({ page }) => {
		await goToDocs(page);

		const uploadSidebarLink = page.locator('aside a[href*="#ep-upload"]');
		const cleanSidebarLink = page.locator('aside a[href*="#ep-clean"]');

		// Open ep-upload
		await page.locator('#ep-upload > button').click();
		await expect(page.locator('#ep-upload .border-t')).toBeVisible();

		// Open ep-clean
		await page.locator('#ep-clean > button').click();
		await expect(page.locator('#ep-clean .border-t')).toBeVisible();

		// Both sidebar entries should be highlighted simultaneously
		await expect(uploadSidebarLink).toHaveClass(/font-semibold/);
		await expect(uploadSidebarLink).toHaveClass(/text-brand-blue/);
		await expect(cleanSidebarLink).toHaveClass(/font-semibold/);
		await expect(cleanSidebarLink).toHaveClass(/text-brand-blue/);
	});

	test('closing one of multiple open cards only removes that entry highlight', async ({ page }) => {
		await goToDocs(page);

		// Open both
		await page.locator('#ep-upload > button').click();
		await page.locator('#ep-clean > button').click();

		const uploadSidebarLink = page.locator('aside a[href*="#ep-upload"]');
		const cleanSidebarLink = page.locator('aside a[href*="#ep-clean"]');

		await expect(uploadSidebarLink).toHaveClass(/font-semibold/);
		await expect(cleanSidebarLink).toHaveClass(/font-semibold/);

		// Close ep-upload
		await page.locator('#ep-upload > button').click();

		// ep-upload should no longer be highlighted, ep-clean still is
		await expect(uploadSidebarLink).not.toHaveClass(/font-semibold/);
		await expect(cleanSidebarLink).toHaveClass(/font-semibold/);
		await expect(cleanSidebarLink).toHaveClass(/text-brand-blue/);
	});
});

test.describe('Docs sidebar highlight — navigation reset', () => {
	test('navigating away from /docs/endpoints reverts all sidebar endpoint highlights', async ({
		page
	}) => {
		await goToDocs(page);

		// Open a card to create a highlight
		await page.locator('#ep-upload > button').click();
		await expect(page.locator('aside a[href*="#ep-upload"]')).toHaveClass(/font-semibold/);

		// Navigate to another docs section
		await page.locator('aside a[href="/docs/auth"]').click();
		await page.waitForURL('**/docs/auth');

		// Wait for sidebar to be visible on the new page
		await expect(page.locator('aside')).toBeVisible();

		// Sidebar endpoint entries should have default style (not highlighted)
		const uploadSidebarLink = page.locator('aside a[href*="#ep-upload"]');
		await expect(uploadSidebarLink).not.toHaveClass(/font-semibold/);
		await expect(uploadSidebarLink).not.toHaveClass(/text-brand-blue/);
	});

	test('returning to /docs/endpoints after navigating away starts with all cards closed', async ({
		page
	}) => {
		await goToDocs(page);

		// Open a card
		await page.locator('#ep-upload > button').click();
		await expect(page.locator('#ep-upload .border-t')).toBeVisible();

		// Navigate away
		await page.locator('aside a[href="/docs/auth"]').click();
		await page.waitForURL('**/docs/auth');

		// Navigate back
		await page.locator('aside a[href="/docs/endpoints"]').click();
		await page.waitForURL('**/docs/endpoints');

		// All cards should be closed again
		await expect(page.locator('[data-section-id] .border-t')).toHaveCount(0);

		// No sidebar endpoint entries should be highlighted
		const uploadSidebarLink = page.locator('aside a[href*="#ep-upload"]');
		await expect(uploadSidebarLink).not.toHaveClass(/font-semibold/);
	});
});

test.describe('Docs sidebar highlight — hash navigation', () => {
	test('navigating to /docs/endpoints#ep-upload opens that card and highlights sidebar entry', async ({
		page
	}) => {
		await goToDocs(page, '/docs/endpoints#ep-upload');

		// The ep-upload card should be open
		await expect(page.locator('#ep-upload .border-t')).toBeVisible({ timeout: 5000 });

		// The sidebar entry for ep-upload should be highlighted
		const uploadSidebarLink = page.locator('aside a[href*="#ep-upload"]');
		await expect(uploadSidebarLink).toHaveClass(/font-semibold/);
		await expect(uploadSidebarLink).toHaveClass(/text-brand-blue/);
	});

	test('clicking a sidebar endpoint link opens the card and highlights sidebar entry', async ({
		page
	}) => {
		await goToDocs(page);

		// All cards closed initially
		await expect(page.locator('[data-section-id] .border-t')).toHaveCount(0);

		// Click sidebar link for ep-clean
		const cleanSidebarLink = page.locator('aside a[href*="#ep-clean"]');
		await cleanSidebarLink.click();

		// The ep-clean card should be force-opened
		await expect(page.locator('#ep-clean .border-t')).toBeVisible({ timeout: 5000 });

		// The sidebar entry for ep-clean should be highlighted
		await expect(cleanSidebarLink).toHaveClass(/font-semibold/);
		await expect(cleanSidebarLink).toHaveClass(/text-brand-blue/);
	});
});
