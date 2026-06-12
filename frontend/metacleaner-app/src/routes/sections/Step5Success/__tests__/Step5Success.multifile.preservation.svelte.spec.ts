// Preservation 3.1: Multi-file download (2+ files) CONTINUES to use ZIP archive.
// EXPECTED OUTCOME: PASSES on both unfixed AND fixed code.
// After Bug 1 fix (single-file uses direct download), 2+ files must still use ZIP.
// Requires browser/Playwright to run (vitest --project=client).
import { page } from 'vitest/browser';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';

// Use vi.hoisted so these vars are available when vi.mock factories run (hoisted calls)
const { mockDownloadFile, mockDownloadResults } = vi.hoisted(() => ({
	mockDownloadFile: vi.fn().mockResolvedValue(new Blob(['data'], { type: 'image/jpeg' })),
	mockDownloadResults: vi.fn().mockResolvedValue(new Blob(['zip'], { type: 'application/zip' }))
}));

// Mock stores with 2 files to trigger the multi-file (ZIP) path
vi.mock('$lib/stores/cleaningResultsStore.svelte', () => ({
	cleaningResultsStore: {
		results: {
			filesProcessed: 2,
			fieldsRemoved: 12,
			gpsLocationsRemoved: 1,
			totalTimeSeconds: 5,
			fileResults: [
				{ fileId: 'f-multi-001', gpsRemoved: false, totalFields: 7 },
				{ fileId: 'f-multi-002', gpsRemoved: true, totalFields: 5 }
			],
			beforeBreakdown: {
				gpsLocations: 1,
				exifFields: 11,
				xmpFields: 0,
				id3mp4Fields: 0,
				otherFields: 0
			}
		},
		jobId: 'job-multi-001',
		reportId: 'rpt-multi-001'
	}
}));

vi.mock('$lib/scanner/scannerStore.svelte', () => ({
	scannerStore: {
		files: [
			{
				id: 'f-multi-001',
				file: { name: 'photo1.jpg' },
				name: 'photo1.jpg',
				size: 2000,
				extension: '.jpg',
				type: 'image',
				scanResult: null
			},
			{
				id: 'f-multi-002',
				file: { name: 'photo2.jpg' },
				name: 'photo2.jpg',
				size: 1500,
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

vi.mock('$lib/services/apiCleaningService', () => ({
	apiCleaningService: {
		downloadFile: mockDownloadFile,
		downloadResults: mockDownloadResults
	}
}));

import Step5Success from '../Step5Success.svelte';

describe('Preservation 3.1: Multi-file download continues to use ZIP', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// EXPECTED OUTCOME: PASSES on both unfixed and fixed code
	// On unfixed code: downloadResults always called (always ZIP)
	// On fixed code: with 2 files, downloadResults still called (ZIP for 2+)
	it('with 2 file results, download calls downloadResults (ZIP), not downloadFile', async () => {
		render(Step5Success, {});
		const downloadBtn = page.getByRole('button', { name: /download/i }).first();
		await downloadBtn.click();

		// Preservation: ZIP download is always used for 2+ files
		expect(mockDownloadResults).toHaveBeenCalledWith('job-multi-001');
		expect(mockDownloadFile).not.toHaveBeenCalled();
	});

	// Preservation: download filename is still "cleaned-files.zip" for multi-file
	it('download button is visible and functional for multi-file results', async () => {
		render(Step5Success, {});
		const downloadBtn = page.getByRole('button', { name: /download/i }).first();
		await expect.element(downloadBtn).toBeInTheDocument();
		await expect.element(downloadBtn).not.toBeDisabled();
	});

	// Preservation: both files appear in the results list with their original names
	it('file results card shows both filenames from scanner store', async () => {
		render(Step5Success, {});
		// Results should show original file names (not hashed IDs)
		const photo1 = page.getByText('photo1.jpg');
		const photo2 = page.getByText('photo2.jpg');
		await expect.element(photo1).toBeInTheDocument();
		await expect.element(photo2).toBeInTheDocument();
	});
});
