import { test, expect, type Page } from 'playwright/test';
import { injectAuth } from './helpers/auth.js';

test.beforeEach(async ({ page }) => {
	await injectAuth(page);
});

// Reports page uses mockCleaningService.getReports() directly (not HTTP API).
// Mock service dates: '2025-06-04', '2025-06-03', etc.
// Report IDs: 'report-1', 'report-2', ... (used in /report/:id URL)
// First report (index 0): image type, gps: true, tags: ['GPS','EXIF'], fileTypes: 'JPG, PNG'

async function navigateToReports(page: Page) {
	await page.goto('/reports');
	// Wait for mock service data to load (200ms simulated delay)
	// SummaryStatsRow "Total reports" is visible on all viewports once data loads
	await expect(page.getByText('Total reports')).toBeVisible({ timeout: 8000 });
}

test.describe('Reports page', () => {
	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('renders page heading', async ({ page }) => {
			await page.goto('/reports');
			await expect(page.getByRole('heading', { level: 1, name: /report history/i })).toBeVisible();
		});

		test('shows new cleaning link in header', async ({ page }) => {
			await page.goto('/reports');
			await expect(page.getByRole('link', { name: /new cleaning/i }).first()).toBeVisible();
		});

		test('shows summary stats row after data loads', async ({ page }) => {
			await navigateToReports(page);
			await expect(page.getByText('Total reports')).toBeVisible();
			await expect(page.getByText('Metadata fields removed')).toBeVisible();
			await expect(page.getByText('Files processed')).toBeVisible();
			await expect(page.getByText('GPS locations removed')).toBeVisible();
		});

		test('shows reports table on desktop', async ({ page }) => {
			await navigateToReports(page);
			const table = page.locator('.hidden.lg\\:block').filter({ hasText: 'Report list' });
			await expect(table).toBeVisible();
		});

		test('reports table displays mock report data', async ({ page }) => {
			await navigateToReports(page);
			await expect(page.getByText('2025-06-04').first()).toBeVisible();
			// First report is image type with fileTypes 'JPG, PNG'
			await expect(page.getByText('JPG, PNG').first()).toBeVisible();
		});

		test('reports table shows tags', async ({ page }) => {
			await navigateToReports(page);
			await expect(page.getByText('GPS').first()).toBeVisible();
			await expect(page.getByText('EXIF').first()).toBeVisible();
		});

		// Requirement 13.4 — table column headers
		test('reports table has column headers: Date, Files, Fields, Tags, Status, Actions', async ({
			page
		}) => {
			await navigateToReports(page);
			const tableBlock = page.locator('.hidden.lg\\:block').filter({ hasText: 'Report list' });
			await expect(tableBlock.getByText('Date', { exact: true })).toBeVisible();
			await expect(tableBlock.getByText('Files', { exact: true })).toBeVisible();
			await expect(tableBlock.getByText('Fields', { exact: true })).toBeVisible();
			await expect(tableBlock.getByText('Tags', { exact: true })).toBeVisible();
			await expect(tableBlock.getByText('Status', { exact: true })).toBeVisible();
			await expect(tableBlock.getByText('Actions', { exact: true })).toBeVisible();
		});

		// Requirement 13.3 — filter bar with all filter buttons
		test('filter pills section is visible on desktop', async ({ page }) => {
			await navigateToReports(page);
			await expect(page.getByText('Filter:')).toBeVisible();
		});

		test('filter bar has All, Successful, Contained GPS, Photos, Video buttons', async ({
			page
		}) => {
			await navigateToReports(page);
			const filtersBar = page.locator('.hidden.lg\\:block').filter({ hasText: 'Filter:' });
			await expect(filtersBar.getByRole('button', { name: 'All' })).toBeVisible();
			await expect(filtersBar.getByRole('button', { name: 'Successful' })).toBeVisible();
			await expect(filtersBar.getByRole('button', { name: 'Contained GPS' })).toBeVisible();
			await expect(filtersBar.getByRole('button', { name: 'Photos' })).toBeVisible();
			await expect(filtersBar.getByRole('button', { name: 'Video' })).toBeVisible();
		});

		test('search input is present in filter bar', async ({ page }) => {
			await navigateToReports(page);
			const filtersBar = page.locator('.hidden.lg\\:block').filter({ hasText: 'Filter:' });
			await expect(filtersBar.getByPlaceholder('Search report...')).toBeVisible();
		});

		test('Photos filter keeps image reports visible', async ({ page }) => {
			await navigateToReports(page);
			const filtersBar = page.locator('.hidden.lg\\:block').filter({ hasText: 'Filter:' });
			await filtersBar.getByRole('button', { name: 'Photos' }).click();
			// First report (image type) remains visible after Photos filter
			await expect(page.getByText('2025-06-04').first()).toBeVisible();
		});

		test('Video filter shows video reports', async ({ page }) => {
			await navigateToReports(page);
			const filtersBar = page.locator('.hidden.lg\\:block').filter({ hasText: 'Filter:' });
			await filtersBar.getByRole('button', { name: 'Video' }).click();
			// Mock data has video reports (index 1 and 3) — at least one MP4 report visible
			await expect(page.getByText('MP4, MOV').first()).toBeVisible();
		});

		test('GPS filter keeps GPS reports visible', async ({ page }) => {
			await navigateToReports(page);
			const filtersBar = page.locator('.hidden.lg\\:block').filter({ hasText: 'Filter:' });
			await filtersBar.getByRole('button', { name: 'Contained GPS' }).click();
			// First report has gps: true — should remain visible
			await expect(page.getByText('2025-06-04').first()).toBeVisible();
		});

		test('All filter button resets active filter', async ({ page }) => {
			await navigateToReports(page);
			const filtersBar = page.locator('.hidden.lg\\:block').filter({ hasText: 'Filter:' });
			// Apply Photos filter, then All to reset
			await filtersBar.getByRole('button', { name: 'Photos' }).click();
			await filtersBar.getByRole('button', { name: 'All' }).click();
			// All reports visible again
			await expect(page.getByText('2025-06-04').first()).toBeVisible();
		});

		test('view report link in table row has correct href', async ({ page }) => {
			await navigateToReports(page);
			const viewLink = page.locator('a[title="View report"]').first();
			const href = await viewLink.getAttribute('href');
			// Mock service report IDs: 'report-1', 'report-2', etc.
			expect(href).toContain('report-');
		});

		test('reports list (mobile cards) is hidden on desktop', async ({ page }) => {
			await navigateToReports(page);
			const reportsList = page.locator('.lg\\:hidden').filter({ hasText: 'Report list' }).first();
			await expect(reportsList).not.toBeVisible();
		});

		test('mobile sticky new cleaning bar is hidden on desktop', async ({ page }) => {
			await page.goto('/reports');
			const stickyBar = page.locator('.mobile-gradient-fade');
			await expect(stickyBar).not.toBeVisible();
		});

		test('new cleaning link navigates to /', async ({ page }) => {
			await page.goto('/reports');
			await page
				.getByRole('link', { name: /new cleaning/i })
				.first()
				.click();
			await page.waitForURL('**/');
			await expect(page).toHaveURL(/\/$/);
		});
	});

	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('renders page heading on mobile', async ({ page }) => {
			await page.goto('/reports');
			await expect(page.getByRole('heading', { level: 1, name: /report history/i })).toBeVisible();
		});

		test('shows summary stats on mobile', async ({ page }) => {
			await navigateToReports(page);
			await expect(page.getByText('Total reports')).toBeVisible();
			await expect(page.getByText('Files processed')).toBeVisible();
		});

		test('shows report cards list on mobile', async ({ page }) => {
			await navigateToReports(page);
			const reportsList = page.locator('.lg\\:hidden').filter({ hasText: 'Report list' }).first();
			await expect(reportsList).toBeVisible();
		});

		// Requirement 14.2 — mobile card layout details
		test('report card displays report data', async ({ page }) => {
			await navigateToReports(page);
			// Date is in the mobile card (desktop table is hidden on 375px) — scope to .report-card
			await expect(page.locator('.report-card').first().getByText('2025-06-04')).toBeVisible();
		});

		test('report card shows time and duration', async ({ page }) => {
			await navigateToReports(page);
			// First report: time '14:32', duration '2m 14s'
			const card = page.locator('.report-card').first();
			await expect(card.getByText(/14:32/)).toBeVisible();
			await expect(card.getByText(/2m 14s/)).toBeVisible();
		});

		test('report card shows metadata type badges (GPS, EXIF)', async ({ page }) => {
			await navigateToReports(page);
			const card = page.locator('.report-card').first();
			await expect(card.getByText('GPS')).toBeVisible();
			await expect(card.getByText('EXIF')).toBeVisible();
		});

		test('report card shows action buttons (view + download)', async ({ page }) => {
			await navigateToReports(page);
			const card = page.locator('.report-card').first();
			await expect(card.locator('a[title="View report"]')).toBeVisible();
			await expect(card.locator('button[title="Download PDF"]')).toBeVisible();
		});

		// Requirement 14.3 — fixed bottom CTA
		test('reports table is hidden on mobile', async ({ page }) => {
			await navigateToReports(page);
			const table = page.locator('.hidden.lg\\:block').filter({ hasText: 'Report list' });
			await expect(table).not.toBeVisible();
		});

		test('mobile sticky bar shows new cleaning link', async ({ page }) => {
			await page.goto('/reports');
			const stickyBar = page.locator('.mobile-gradient-fade');
			await expect(stickyBar.getByRole('link', { name: /new cleaning/i })).toBeVisible();
		});

		test('mobile sticky new cleaning link navigates to /', async ({ page }) => {
			await page.goto('/reports');
			const stickyBar = page.locator('.mobile-gradient-fade');
			await stickyBar.getByRole('link', { name: /new cleaning/i }).click();
			await page.waitForURL('**/');
			await expect(page).toHaveURL(/\/$/);
		});

		test('view report link in card has correct href', async ({ page }) => {
			await navigateToReports(page);
			const viewLink = page.locator('a[title="View report"]').first();
			const href = await viewLink.getAttribute('href');
			// Mock service report IDs: 'report-1', 'report-2', etc.
			expect(href).toContain('report-');
		});

		// Requirement 14.1 — scrollable filter pills
		test('filter pills visible on mobile', async ({ page }) => {
			await navigateToReports(page);
			const mobileFilters = page.locator('.lg\\:hidden').filter({ hasText: 'Photos' }).first();
			await expect(mobileFilters).toBeVisible();
		});

		test('mobile filter scroll container exists and contains filter buttons', async ({ page }) => {
			await navigateToReports(page);
			const scrollArea = page.locator('.filters-scroll');
			await expect(scrollArea).toBeVisible();
			// All, Photos, Video buttons must be inside the scroll area
			await expect(scrollArea.getByRole('button', { name: 'All' })).toBeVisible();
			await expect(scrollArea.getByRole('button', { name: 'Photos' })).toBeVisible();
			await expect(scrollArea.getByRole('button', { name: 'Video' })).toBeVisible();
		});

		test('mobile search input is visible', async ({ page }) => {
			await navigateToReports(page);
			await expect(page.locator('.lg\\:hidden input[type="text"]').first()).toBeVisible();
		});

		test('Photos filter on mobile keeps image reports visible', async ({ page }) => {
			await navigateToReports(page);
			const mobilePillsArea = page.locator('.filters-scroll');
			await mobilePillsArea.getByRole('button', { name: 'Photos' }).click();
			// First report is image type — scope to mobile card (desktop table is hidden on 375px)
			await expect(page.locator('.report-card').first().getByText('2025-06-04')).toBeVisible();
		});

		test('Video filter on mobile shows video reports', async ({ page }) => {
			await navigateToReports(page);
			const mobilePillsArea = page.locator('.filters-scroll');
			await mobilePillsArea.getByRole('button', { name: 'Video' }).click();
			// Mock data has video type reports — scope to .report-card (desktop table is hidden on 375px)
			await expect(page.locator('.report-card').first().getByText('MP4, MOV')).toBeVisible();
		});
	});
});
