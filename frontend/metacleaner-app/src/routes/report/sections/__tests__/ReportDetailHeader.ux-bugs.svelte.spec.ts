// Bug Condition 3: PDF download button must call getReportPdf on click.
// Bug Condition 4: Back button must call history.back() not navigate to /reports.
// EXPECTED OUTCOME: FAILS on unfixed code (buttons have no click handlers).
// Requires browser/Playwright to run (vitest --project=client).
import { page } from 'vitest/browser';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ReportDetailHeader from '../ReportDetailHeader.svelte';

const mockReportDetail = {
	reportId: 'RPT-TEST-001',
	date: '4. 6. 2025 · 14:32',
	filesProcessed: 3,
	fieldsRemoved: 42,
	gpsLocationsRemoved: 1,
	totalTimeMs: 7,
	chartData: [],
	files: []
};

describe('Bug Condition 3: ReportDetailHeader PDF download button', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// EXPECTED OUTCOME: FAILS on unfixed code (PDF button has no onclick handler)
	it('clicking mobile PDF button triggers a download action (EXPECTED BEHAVIOR)', async () => {
		const onDownloadPdf = vi.fn();
		render(ReportDetailHeader, {
			reportDetail: mockReportDetail,
			userEmail: 'user@test.com',
			onDownloadPdf
		});
		// Bug 3: mobile PDF button has no onclick handler
		const mobileBtn = page.getByRole('button', { name: /download pdf report/i });
		await mobileBtn.click();
		expect(onDownloadPdf).toHaveBeenCalledOnce();
	});

	// EXPECTED OUTCOME: FAILS on unfixed code (desktop PDF button has no onclick handler)
	it('clicking desktop PDF button triggers a download action (EXPECTED BEHAVIOR)', async () => {
		const onDownloadPdf = vi.fn();
		render(ReportDetailHeader, {
			reportDetail: mockReportDetail,
			userEmail: 'user@test.com',
			onDownloadPdf
		});
		// Bug 3: desktop PDF button has no onclick handler
		const desktopBtn = page.getByRole('button', { name: /stáhnout pdf|download pdf/i }).last();
		await desktopBtn.click();
		expect(onDownloadPdf).toHaveBeenCalledOnce();
	});

	// Preservation: Print button still works (EXPECTED OUTCOME: PASSES)
	it('print button triggers window.print()', async () => {
		const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
		render(ReportDetailHeader, {
			reportDetail: mockReportDetail,
			userEmail: 'user@test.com'
		});
		const printBtn = page.getByRole('button', { name: /print/i });
		await printBtn.click();
		expect(printSpy).toHaveBeenCalledOnce();
	});
});
