// Bug Condition 3: PDF download button must call onDownloadPdf on click.
// The mobile PDF button was moved to MobileBottomCta in [id]/+page.svelte;
// only the desktop button and the print button remain in ReportDetailHeader.
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

describe('ReportDetailHeader PDF download button', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('clicking desktop PDF button triggers onDownloadPdf callback', async () => {
		const onDownloadPdf = vi.fn();
		render(ReportDetailHeader, {
			reportDetail: mockReportDetail,
			userEmail: 'user@test.com',
			onDownloadPdf
		});
		const desktopBtn = page.getByRole('button', { name: /stáhnout pdf|download pdf/i }).first();
		await desktopBtn.click();
		expect(onDownloadPdf).toHaveBeenCalledOnce();
	});

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
