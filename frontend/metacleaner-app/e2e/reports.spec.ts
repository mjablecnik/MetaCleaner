import { test, expect, type Page } from 'playwright/test';
import { mockReportsApi } from './helpers/mock-api';

async function navigateToReports(page: Page) {
	await mockReportsApi(page);
	await page.goto('/reports');
	await expect(page.getByText('2026-01-15')).toBeVisible({ timeout: 8000 });
}

test.describe('Reports page', () => {
	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('renders page heading', async ({ page }) => {
			await mockReportsApi(page);
			await page.goto('/reports');
			await expect(page.getByRole('heading', { level: 1, name: /report history/i })).toBeVisible();
		});

		test('shows new cleaning link in header', async ({ page }) => {
			await mockReportsApi(page);
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
			await expect(page.getByText('2026-01-15')).toBeVisible();
			await expect(page.getByText('JPEG, PNG')).toBeVisible();
		});

		test('reports table shows tags', async ({ page }) => {
			await navigateToReports(page);
			await expect(page.getByText('GPS').first()).toBeVisible();
			await expect(page.getByText('EXIF').first()).toBeVisible();
		});

		test('filter pills section is visible on desktop', async ({ page }) => {
			await navigateToReports(page);
			await expect(page.getByText('Filter:')).toBeVisible();
		});

		test('Photos filter keeps image reports visible', async ({ page }) => {
			await navigateToReports(page);
			const filtersBar = page.locator('.hidden.lg\\:block').filter({ hasText: 'Filter:' });
			await filtersBar.getByRole('button', { name: 'Photos' }).click();
			await expect(page.getByText('2026-01-15')).toBeVisible();
		});

		test('Video filter shows no results', async ({ page }) => {
			await navigateToReports(page);
			const filtersBar = page.locator('.hidden.lg\\:block').filter({ hasText: 'Filter:' });
			await filtersBar.getByRole('button', { name: 'Video' }).click();
			await expect(page.getByText('No reports match your search.')).toBeVisible();
		});

		test('view report link in table row has correct href', async ({ page }) => {
			await navigateToReports(page);
			const viewLink = page.locator('a[title="View report"]').first();
			const href = await viewLink.getAttribute('href');
			expect(href).toContain('rpt-001');
		});

		test('reports list (mobile cards) is hidden on desktop', async ({ page }) => {
			await navigateToReports(page);
			const reportsList = page.locator('.lg\\:hidden').filter({ hasText: 'Report list' }).first();
			await expect(reportsList).not.toBeVisible();
		});

		test('mobile sticky new cleaning bar is hidden on desktop', async ({ page }) => {
			await mockReportsApi(page);
			await page.goto('/reports');
			const stickyBar = page.locator('.mobile-gradient-fade');
			await expect(stickyBar).not.toBeVisible();
		});

		test('new cleaning link navigates to /', async ({ page }) => {
			await mockReportsApi(page);
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
			await mockReportsApi(page);
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

		test('report card displays report data', async ({ page }) => {
			await navigateToReports(page);
			await expect(page.getByText('2026-01-15')).toBeVisible();
		});

		test('reports table is hidden on mobile', async ({ page }) => {
			await navigateToReports(page);
			const table = page.locator('.hidden.lg\\:block').filter({ hasText: 'Report list' });
			await expect(table).not.toBeVisible();
		});

		test('mobile sticky bar shows new cleaning link', async ({ page }) => {
			await mockReportsApi(page);
			await page.goto('/reports');
			const stickyBar = page.locator('.mobile-gradient-fade');
			await expect(stickyBar.getByRole('link', { name: /new cleaning/i })).toBeVisible();
		});

		test('mobile sticky new cleaning link navigates to /', async ({ page }) => {
			await mockReportsApi(page);
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
			expect(href).toContain('rpt-001');
		});

		test('filter pills visible on mobile', async ({ page }) => {
			await navigateToReports(page);
			const mobileFilters = page.locator('.lg\\:hidden').filter({ hasText: 'Photos' }).first();
			await expect(mobileFilters).toBeVisible();
		});

		test('Photos filter on mobile keeps image reports visible', async ({ page }) => {
			await navigateToReports(page);
			const mobilePillsArea = page.locator('.filters-scroll');
			await mobilePillsArea.getByRole('button', { name: 'Photos' }).click();
			await expect(page.getByText('2026-01-15')).toBeVisible();
		});

		test('Video filter on mobile shows no results', async ({ page }) => {
			await navigateToReports(page);
			const mobilePillsArea = page.locator('.filters-scroll');
			await mobilePillsArea.getByRole('button', { name: 'Video' }).click();
			await expect(page.getByText('No reports match your search.')).toBeVisible();
		});
	});
});
