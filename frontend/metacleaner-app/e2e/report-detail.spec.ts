import { test, expect, type Page } from 'playwright/test';
import { mockReportsApi, mockReportDetail } from './helpers/mock-api';

async function navigateToReportDetail(page: Page) {
	await mockReportsApi(page);
	await page.goto('/report/rpt-001');
	await expect(page.getByText(mockReportDetail.reportId)).toBeVisible({ timeout: 8000 });
}

test.describe('Report Detail page', () => {
	test.describe('desktop viewport (1280px)', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('renders report detail heading', async ({ page }) => {
			await navigateToReportDetail(page);
			await expect(
				page.getByRole('heading', { level: 1, name: /detailed cleaning report/i })
			).toBeVisible();
		});

		test('shows report meta info bar with report id', async ({ page }) => {
			await navigateToReportDetail(page);
			await expect(page.getByText(mockReportDetail.reportId)).toBeVisible();
		});

		test('shows report meta info bar with cleaning date', async ({ page }) => {
			await navigateToReportDetail(page);
			await expect(page.getByText(mockReportDetail.date).first()).toBeVisible();
		});

		test('shows summary stats row with files processed', async ({ page }) => {
			await navigateToReportDetail(page);
			await expect(page.getByText('Files processed')).toBeVisible();
		});

		test('shows summary stats row with fields removed', async ({ page }) => {
			await navigateToReportDetail(page);
			// Use exact match: "Metadata fields removed per file" also contains this text
			await expect(page.getByText('Metadata fields removed', { exact: true })).toBeVisible();
		});

		test('shows summary stats row with gps removed', async ({ page }) => {
			await navigateToReportDetail(page);
			await expect(page.getByText('GPS locations removed')).toBeVisible();
		});

		test('shows summary stats row with total time', async ({ page }) => {
			await navigateToReportDetail(page);
			await expect(page.getByText('Total cleaning time')).toBeVisible();
		});

		test('shows chart card with distribution title', async ({ page }) => {
			await navigateToReportDetail(page);
			await expect(
				page.getByRole('heading', { name: /distribution of removed metadata/i })
			).toBeVisible();
		});

		test('shows chart legend with GPS, EXIF, XMP labels', async ({ page }) => {
			await navigateToReportDetail(page);
			await expect(page.getByText('GPS').first()).toBeVisible();
			await expect(page.getByText('EXIF').first()).toBeVisible();
			await expect(page.getByText('XMP').first()).toBeVisible();
		});

		test('shows per-file breakdown in chart card', async ({ page }) => {
			await navigateToReportDetail(page);
			await expect(page.getByRole('heading', { name: /fields removed per file/i })).toBeVisible();
		});

		test('shows file name in per-file breakdown', async ({ page }) => {
			await navigateToReportDetail(page);
			await expect(page.getByText('photo').first()).toBeVisible();
		});

		test('shows file accordion list heading', async ({ page }) => {
			await navigateToReportDetail(page);
			await expect(page.getByRole('heading', { name: /detailed file overview/i })).toBeVisible();
		});

		test('first file accordion item is open by default', async ({ page }) => {
			await navigateToReportDetail(page);
			await expect(page.getByText('Make').first()).toBeVisible();
		});

		test('expand all button is visible', async ({ page }) => {
			await navigateToReportDetail(page);
			const expandBtn = page.getByRole('button', { name: /expand all|collapse all/i });
			await expect(expandBtn).toBeVisible();
		});

		test('collapse all button collapses open accordion', async ({ page }) => {
			await navigateToReportDetail(page);
			// Wait for $effect to run and open first accordion, making allOpen=true → button = "Collapse all"
			const toggleBtn = page.getByRole('button', { name: /collapse all/i });
			await expect(toggleBtn).toBeVisible({ timeout: 5000 });
			await toggleBtn.click();
			await expect(page.getByRole('button', { name: /expand all/i })).toBeVisible({
				timeout: 5000
			});
		});

		test('back button in navbar links to /reports', async ({ page }) => {
			await navigateToReportDetail(page);
			const backLink = page.getByRole('link', { name: /back to results/i }).first();
			const href = await backLink.getAttribute('href');
			expect(href).toContain('reports');
		});

		test('download pdf button is visible on desktop', async ({ page }) => {
			await navigateToReportDetail(page);
			const pdfBtn = page
				.locator('.hidden.lg\\:flex')
				.getByRole('button', { name: /download pdf/i });
			await expect(pdfBtn).toBeVisible();
		});

		test('shows loading state initially before api resolves', async ({ page }) => {
			let resolveRoute: (() => void) | null = null;
			await page.route('**/api/reports/*', async (route) => {
				await new Promise<void>((res) => {
					resolveRoute = res;
				});
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify(mockReportDetail)
				});
			});

			await page.goto('/report/rpt-001');
			const spinner = page.locator('.fa-circle-notch');
			await expect(spinner).toBeVisible();

			resolveRoute?.();
			await expect(page.getByText(mockReportDetail.reportId)).toBeVisible({ timeout: 5000 });
		});

		// Note: error state (loadError) cannot be triggered from E2E since the page uses
		// mockCleaningService in-memory — HTTP route mocks have no effect on in-memory calls.
	});

	test.describe('mobile viewport (375px)', () => {
		test.use({ viewport: { width: 375, height: 812 } });

		test('renders report heading on mobile', async ({ page }) => {
			await navigateToReportDetail(page);
			await expect(
				page.getByRole('heading', { level: 1, name: /detailed cleaning report/i })
			).toBeVisible();
		});

		test('shows report id on mobile', async ({ page }) => {
			await navigateToReportDetail(page);
			await expect(page.getByText(mockReportDetail.reportId)).toBeVisible();
		});

		test('shows summary stats on mobile', async ({ page }) => {
			await navigateToReportDetail(page);
			await expect(page.getByText('Files processed')).toBeVisible();
			// Use exact match: "Metadata fields removed per file" also contains this text
			await expect(page.getByText('Metadata fields removed', { exact: true })).toBeVisible();
		});

		test('shows chart with GPS EXIF XMP labels on mobile', async ({ page }) => {
			await navigateToReportDetail(page);
			await expect(page.getByText('GPS').first()).toBeVisible();
			await expect(page.getByText('EXIF').first()).toBeVisible();
		});

		test('shows file accordion list on mobile', async ({ page }) => {
			await navigateToReportDetail(page);
			await expect(page.getByRole('heading', { name: /detailed file overview/i })).toBeVisible();
		});

		test('first file accordion is open on mobile', async ({ page }) => {
			await navigateToReportDetail(page);
			await expect(page.getByText('Make').first()).toBeVisible();
		});

		test('mobile pdf download button is visible', async ({ page }) => {
			await navigateToReportDetail(page);
			// The mobile PDF button has lg:hidden class itself (not a descendant of lg:hidden)
			// Query by role and name directly — desktop button is inside hidden.lg:flex so not visible
			const pdfBtn = page.getByRole('button', { name: /download pdf report/i });
			await expect(pdfBtn).toBeVisible();
		});

		test('desktop pdf button is hidden on mobile', async ({ page }) => {
			await navigateToReportDetail(page);
			const desktopBtns = page.locator('.hidden.lg\\:flex').filter({ hasText: /download pdf/i });
			await expect(desktopBtns).not.toBeVisible();
		});

		test('back link in navbar navigates to /reports on mobile', async ({ page }) => {
			await navigateToReportDetail(page);
			// Mobile NavBar back button uses aria-label="Go back" (text not visible on mobile)
			const backLink = page.getByRole('link', { name: /go back/i }).first();
			await backLink.click();
			await page.waitForURL('**/reports');
			await expect(page).toHaveURL(/\/reports/);
		});

		// Note: error state (loadError) cannot be triggered from E2E since the page uses
		// mockCleaningService in-memory — HTTP route mocks have no effect on in-memory calls.
	});

	test.describe('route guard', () => {
		test('navigating to /report (no id) redirects to /reports', async ({ page }) => {
			await page.goto('/report');
			await page.waitForURL('**/reports');
			await expect(page).toHaveURL(/\/reports/);
		});
	});
});
