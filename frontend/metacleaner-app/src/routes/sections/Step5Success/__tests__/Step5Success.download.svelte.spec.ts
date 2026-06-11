// Bug Condition 1: Single file download should use direct endpoint, not ZIP.
// EXPECTED OUTCOME: FAILS on unfixed code (always calls downloadJobZip).
// Requires browser/Playwright to run (vitest --project=client).
//
// NOTE: Step5Success.svelte imports `downloadFile` directly from
// `$lib/clients/metaCleanerApi.js` (not from apiCleaningService).
// This test must mock the API client module to intercept that call.
import { page } from 'vitest/browser';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';

// Mock stores before importing the component
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

// Mock the API client — the component imports downloadFile DIRECTLY from here,
// not via apiCleaningService. Mocking apiCleaningService alone is insufficient.
const mockApiDownloadFile = vi.fn().mockResolvedValue(new Blob(['data'], { type: 'image/jpeg' }));
const mockApiDownloadJobZip = vi
	.fn()
	.mockResolvedValue(new Blob(['zip'], { type: 'application/zip' }));

vi.mock('$lib/clients/metaCleanerApi.js', () => ({
	downloadFile: mockApiDownloadFile,
	downloadJobZip: mockApiDownloadJobZip,
	uploadFiles: vi.fn(),
	createJob: vi.fn(),
	connectJobProgress: vi.fn(),
	getJobStatus: vi.fn(),
	getReports: vi.fn(),
	getReportDetail: vi.fn(),
	getReportPdf: vi.fn(),
	healthCheck: vi.fn(),
	buildApiUrl: vi.fn((path: string) => `http://localhost:8080${path}`),
	buildWsUrl: vi.fn((path: string) => `ws://localhost:8080${path}`)
}));

// Also mock apiCleaningService so downloadResults (multi-file ZIP path) is intercepted
const mockDownloadResults = vi
	.fn()
	.mockResolvedValue(new Blob(['zip'], { type: 'application/zip' }));

vi.mock('$lib/services/apiCleaningService', () => ({
	apiCleaningService: {
		downloadResults: mockDownloadResults
	}
}));

import Step5Success from '../Step5Success.svelte';

describe('Bug Condition 1: Single file download uses direct endpoint not ZIP', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// EXPECTED OUTCOME: FAILS on unfixed code (always calls downloadResults/ZIP)
	it('with 1 file result, download calls downloadFile (direct API client) not ZIP', async () => {
		render(Step5Success, {});
		// Find and click the download button
		const downloadBtn = page.getByRole('button', { name: /download/i }).first();
		await downloadBtn.click();

		// Bug 1 fix: component calls downloadFile from $lib/clients/metaCleanerApi.js directly
		expect(mockApiDownloadFile).toHaveBeenCalledWith('f-single-001');
		expect(mockDownloadResults).not.toHaveBeenCalled();
		expect(mockApiDownloadJobZip).not.toHaveBeenCalled();
	});

	// The downloaded blob has image MIME type (not application/zip) for single files
	it('downloadFile is called — result is a non-ZIP blob (image/jpeg mime type)', async () => {
		render(Step5Success, {});
		const downloadBtn = page.getByRole('button', { name: /download/i }).first();
		await downloadBtn.click();

		// Verify the mock was called and would return a non-ZIP blob
		expect(mockApiDownloadFile).toHaveBeenCalled();
		const returnedBlob = await mockApiDownloadFile.mock.results[0].value;
		expect(returnedBlob.type).toBe('image/jpeg');
		expect(returnedBlob.type).not.toBe('application/zip');
	});

	it('download button is present and clickable', async () => {
		render(Step5Success, {});
		const downloadBtn = page.getByRole('button', { name: /download/i }).first();
		await expect.element(downloadBtn).toBeInTheDocument();
	});
});
