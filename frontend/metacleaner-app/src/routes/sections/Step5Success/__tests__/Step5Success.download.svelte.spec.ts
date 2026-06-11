// Bug Condition 1: Single file download should use direct endpoint, not ZIP.
// EXPECTED OUTCOME: FAILS on unfixed code (always calls downloadJobZip).
// Requires browser/Playwright to run (vitest --project=client).
import { page } from 'vitest/browser';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';

// Mock stores and services before importing the component
vi.mock('$lib/stores/cleaningResultsStore.svelte', () => ({
	cleaningResultsStore: {
		results: {
			filesProcessed: 1,
			fieldsRemoved: 5,
			gpsLocationsRemoved: 0,
			totalTimeSeconds: 3,
			fileResults: [{ fileId: 'f-single-001', gpsRemoved: false, totalFields: 5 }],
			beforeBreakdown: {
				gpsLocations: 0,
				exifFields: 5,
				xmpFields: 0,
				id3mp4Fields: 0,
				otherFields: 0
			}
		},
		jobId: 'job-001',
		reportId: 'rpt-001'
	}
}));

vi.mock('$lib/scanner/scannerStore.svelte', () => ({
	scannerStore: {
		files: [
			{
				id: 'f-single-001',
				file: { name: 'photo.jpg' },
				name: 'photo.jpg',
				size: 1000,
				extension: '.jpg',
				type: 'image',
				scanResult: null
			}
		]
	}
}));

vi.mock('$lib/stores/appState.svelte', () => ({
	appState: {
		current: 'success',
		reset: vi.fn()
	}
}));

const mockDownloadFile = vi.fn().mockResolvedValue(new Blob(['data'], { type: 'image/jpeg' }));
const mockDownloadResults = vi
	.fn()
	.mockResolvedValue(new Blob(['zip'], { type: 'application/zip' }));

vi.mock('$lib/services/apiCleaningService', () => ({
	apiCleaningService: {
		downloadFile: mockDownloadFile,
		downloadResults: mockDownloadResults
	}
}));

import Step5Success from '../Step5Success.svelte';

describe('Bug Condition 1: Single file download uses direct endpoint not ZIP', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Restore anchor click behavior
		vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
			const el = document.createElement.wrappedJSObject?.(tag) ?? HTMLElement.prototype;
			if (tag === 'a') {
				const anchor = document.createElement('a') as HTMLAnchorElement;
				anchor.click = vi.fn();
				return anchor;
			}
			return el as HTMLElement;
		});
	});

	// EXPECTED OUTCOME: FAILS on unfixed code (always calls downloadResults/ZIP)
	it('with 1 file result, download calls downloadFile not downloadJobZip (EXPECTED BEHAVIOR)', async () => {
		render(Step5Success, {});
		// Find and click the download button
		const downloadBtn = page.getByRole('button', { name: /download/i }).first();
		await downloadBtn.click();

		// Bug 1: on unfixed code, downloadResults (ZIP) is called instead of downloadFile
		expect(mockDownloadFile).toHaveBeenCalledWith('f-single-001');
		expect(mockDownloadResults).not.toHaveBeenCalled();
	});

	// Preservation test: 2+ files uses ZIP (EXPECTED OUTCOME: test for multi-file is separate)
	it('download button is present and clickable', async () => {
		render(Step5Success, {});
		const downloadBtn = page.getByRole('button', { name: /download/i }).first();
		await expect.element(downloadBtn).toBeInTheDocument();
	});
});
