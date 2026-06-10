import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';

// Mock the API client before any imports that transitively depend on it
vi.mock('$lib/clients/metaCleanerApi.js', () => {
	class ApiHttpError extends Error {
		constructor(
			public readonly status: number,
			public readonly errorCode: string,
			public readonly errorMessage: string,
			public readonly timestamp: string
		) {
			super(errorMessage);
			this.name = 'ApiHttpError';
		}
	}
	return {
		uploadFiles: vi.fn(),
		createJob: vi.fn(),
		connectJobProgress: vi.fn(),
		downloadJobZip: vi.fn(),
		downloadFile: vi.fn(),
		getReports: vi.fn(),
		getReportDetail: vi.fn(),
		getReportPdf: vi.fn(),
		healthCheck: vi.fn(),
		buildApiUrl: vi.fn((path: string) => `http://localhost:8080${path}`),
		buildWsUrl: vi.fn((path: string) => `ws://localhost:8080${path}`),
		ApiHttpError
	};
});

import * as api from '$lib/clients/metaCleanerApi.js';
import { apiCleaningService } from '../apiCleaningService.js';
import type { QueuedFile } from '$lib/scanner/types.js';
import type { CleaningCallbacks, CleaningOptions } from '../cleaningService.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

class MockWebSocket {
	onmessage: ((event: { data: string }) => void) | null = null;
	onerror: ((event: unknown) => void) | null = null;
	onclose: ((event: { code: number }) => void) | null = null;

	close() {}

	triggerMessage(data: Record<string, unknown>) {
		this.onmessage?.({ data: JSON.stringify(data) });
	}
}

function makeQueuedFile(id: string, fieldCount: number, hasGps: boolean): QueuedFile {
	return {
		id,
		file: null as unknown as File,
		name: `file-${id}.jpg`,
		size: 1000,
		extension: '.jpg',
		type: 'image',
		format: 'jpeg',
		scanResult: {
			fileId: id,
			status: 'done',
			fields: [],
			hasGps,
			fieldCount,
			categoryScores: { gps: 0, deviceIdentity: 0, personalData: 0, timestamps: 0, aiOrigin: 0 },
			fileScore: 0
		}
	};
}

function makeQueuedFileNoScan(id: string): QueuedFile {
	return {
		id,
		file: null as unknown as File,
		name: `file-${id}.jpg`,
		size: 1000,
		extension: '.jpg',
		type: 'image',
		format: 'jpeg',
		scanResult: null
	};
}

function makeCallbacks(): CleaningCallbacks {
	return {
		onProgress: vi.fn(),
		onFileStart: vi.fn(),
		onFileComplete: vi.fn(),
		onComplete: vi.fn(),
		onError: vi.fn()
	};
}

const noopOptions: CleaningOptions = {
	removeGps: false,
	removeExif: false,
	removeXmp: false,
	removeComments: false
};

// ─── Property 3: analyzeFiles aggregation correctness ────────────────────────

describe('Feature: api-integration, Property 3: analyzeFiles aggregation correctness', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('totalFields equals sum of all file fieldCounts for any file array', async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.array(
					fc.record({
						fieldCount: fc.nat({ max: 1000 }),
						hasGps: fc.boolean()
					}),
					{ maxLength: 20 }
				),
				async (fileConfigs) => {
					const files = fileConfigs.map((cfg, i) =>
						makeQueuedFile(`file-${i}`, cfg.fieldCount, cfg.hasGps)
					);
					const result = await apiCleaningService.analyzeFiles(files);
					const expectedTotal = fileConfigs.reduce((sum, cfg) => sum + cfg.fieldCount, 0);
					expect(result.totalFields).toBe(expectedTotal);
				}
			),
			{ numRuns: 100 }
		);
	});

	it('hasGps is true iff at least one file has scanResult.hasGps === true', async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.array(
					fc.record({
						fieldCount: fc.nat({ max: 100 }),
						hasGps: fc.boolean()
					}),
					{ maxLength: 20 }
				),
				async (fileConfigs) => {
					const files = fileConfigs.map((cfg, i) =>
						makeQueuedFile(`file-${i}`, cfg.fieldCount, cfg.hasGps)
					);
					const result = await apiCleaningService.analyzeFiles(files);
					const expectedHasGps = fileConfigs.some((cfg) => cfg.hasGps);
					expect(result.hasGps).toBe(expectedHasGps);
				}
			),
			{ numRuns: 100 }
		);
	});

	it('perFileFieldCounts has an entry for every file ID with the correct count', async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.array(
					fc.record({
						fieldCount: fc.nat({ max: 100 }),
						hasGps: fc.boolean()
					}),
					{ maxLength: 20 }
				),
				async (fileConfigs) => {
					const files = fileConfigs.map((cfg, i) =>
						makeQueuedFile(`file-${i}`, cfg.fieldCount, cfg.hasGps)
					);
					const result = await apiCleaningService.analyzeFiles(files);
					expect(Object.keys(result.perFileFieldCounts)).toHaveLength(files.length);
					for (let i = 0; i < fileConfigs.length; i++) {
						expect(result.perFileFieldCounts[`file-${i}`]).toBe(fileConfigs[i].fieldCount);
					}
				}
			),
			{ numRuns: 100 }
		);
	});

	it('files without scanResult contribute zero to totalFields and false to hasGps', async () => {
		const files = [makeQueuedFileNoScan('f-null-1'), makeQueuedFileNoScan('f-null-2')];
		const result = await apiCleaningService.analyzeFiles(files);
		expect(result.totalFields).toBe(0);
		expect(result.hasGps).toBe(false);
		expect(result.perFileFieldCounts['f-null-1']).toBe(0);
		expect(result.perFileFieldCounts['f-null-2']).toBe(0);
	});

	it('empty file array produces zero totals and empty perFileFieldCounts', async () => {
		const result = await apiCleaningService.analyzeFiles([]);
		expect(result.totalFields).toBe(0);
		expect(result.hasGps).toBe(false);
		expect(Object.keys(result.perFileFieldCounts)).toHaveLength(0);
	});

	it('mixed files with and without scanResult: null entries count as zero', async () => {
		const files = [
			makeQueuedFile('a', 5, false),
			makeQueuedFileNoScan('b'),
			makeQueuedFile('c', 3, true)
		];
		const result = await apiCleaningService.analyzeFiles(files);
		expect(result.totalFields).toBe(8);
		expect(result.hasGps).toBe(true);
		expect(result.perFileFieldCounts['a']).toBe(5);
		expect(result.perFileFieldCounts['b']).toBe(0);
		expect(result.perFileFieldCounts['c']).toBe(3);
	});
});

// ─── Property 12: File name map completeness from upload response ─────────────

describe('Feature: api-integration, Property 12: File name map completeness from upload response', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('onFileStart resolves correct fileName for every file in the upload response', async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 10 }),
				async (names) => {
					// Build upload response with index-based unique IDs
					const uploadedFiles = names.map((name, i) => ({
						id: `f-${String(i).padStart(4, '0')}`,
						name,
						size: 1000,
						extension: '.jpg',
						type: 'image',
						format: 'jpeg'
					}));

					let capturedWs: MockWebSocket | null = null;

					vi.mocked(api.uploadFiles).mockResolvedValueOnce({ files: uploadedFiles });
					vi.mocked(api.createJob).mockResolvedValueOnce({
						jobId: 'job-test-prop12',
						status: 'pending',
						totalFiles: uploadedFiles.length,
						createdAt: '2024-01-01T00:00:00Z'
					});
					vi.mocked(api.connectJobProgress).mockImplementationOnce(() => {
						const ws = new MockWebSocket();
						capturedWs = ws;
						return ws as unknown as WebSocket;
					});

					const callbacks = makeCallbacks();
					apiCleaningService.startCleaning(
						uploadedFiles.map((_, i) => makeQueuedFile(`queued-${i}`, 0, false)),
						noopOptions,
						callbacks
					);

					// Wait for the async execute() to set up the WebSocket handlers
					await vi.waitFor(
						() => {
							expect(capturedWs).not.toBeNull();
							expect(capturedWs!.onmessage).not.toBeNull();
						},
						{ timeout: 1000 }
					);

					// Trigger file_progress for each uploaded file and verify name resolution
					for (const file of uploadedFiles) {
						capturedWs!.triggerMessage({
							type: 'file_progress',
							fileId: file.id,
							overallProgress: 0,
							filesCompleted: 0,
							totalFiles: uploadedFiles.length
						});
					}

					expect(callbacks.onFileStart).toHaveBeenCalledTimes(uploadedFiles.length);
					for (const file of uploadedFiles) {
						expect(callbacks.onFileStart).toHaveBeenCalledWith(file.id, file.name);
					}
				}
			),
			{ numRuns: 20 }
		);
	});

	it('fileNameMap falls back to fileId when the ID is absent from the upload response', async () => {
		const uploadedFile = {
			id: 'f-known',
			name: 'photo.jpg',
			size: 1000,
			extension: '.jpg',
			type: 'image',
			format: 'jpeg'
		};
		let capturedWs: MockWebSocket | null = null;

		vi.mocked(api.uploadFiles).mockResolvedValueOnce({ files: [uploadedFile] });
		vi.mocked(api.createJob).mockResolvedValueOnce({
			jobId: 'job-fallback',
			status: 'pending',
			totalFiles: 1,
			createdAt: '2024-01-01T00:00:00Z'
		});
		vi.mocked(api.connectJobProgress).mockImplementationOnce(() => {
			const ws = new MockWebSocket();
			capturedWs = ws;
			return ws as unknown as WebSocket;
		});

		const callbacks = makeCallbacks();
		apiCleaningService.startCleaning(
			[makeQueuedFile('queued-0', 0, false)],
			noopOptions,
			callbacks
		);

		await vi.waitFor(
			() => {
				expect(capturedWs).not.toBeNull();
				expect(capturedWs!.onmessage).not.toBeNull();
			},
			{ timeout: 1000 }
		);

		// Trigger with an ID that is NOT in the upload response
		capturedWs!.triggerMessage({
			type: 'file_progress',
			fileId: 'f-unknown',
			overallProgress: 0,
			filesCompleted: 0,
			totalFiles: 1
		});

		// Falls back to using the fileId itself as the fileName (Req 11.2)
		expect(callbacks.onFileStart).toHaveBeenCalledWith('f-unknown', 'f-unknown');
	});

	it('known file ID from upload response resolves to its original name', async () => {
		const uploadedFiles = [
			{ id: 'f-abc', name: 'holiday.jpg', size: 2000, extension: '.jpg', type: 'image', format: 'jpeg' },
			{ id: 'f-def', name: 'clip.mp4', size: 5000, extension: '.mp4', type: 'video', format: 'mp4' }
		];
		let capturedWs: MockWebSocket | null = null;

		vi.mocked(api.uploadFiles).mockResolvedValueOnce({ files: uploadedFiles });
		vi.mocked(api.createJob).mockResolvedValueOnce({
			jobId: 'job-named',
			status: 'pending',
			totalFiles: 2,
			createdAt: '2024-01-01T00:00:00Z'
		});
		vi.mocked(api.connectJobProgress).mockImplementationOnce(() => {
			const ws = new MockWebSocket();
			capturedWs = ws;
			return ws as unknown as WebSocket;
		});

		const callbacks = makeCallbacks();
		apiCleaningService.startCleaning(
			[makeQueuedFile('q0', 0, false), makeQueuedFile('q1', 0, false)],
			noopOptions,
			callbacks
		);

		await vi.waitFor(
			() => {
				expect(capturedWs).not.toBeNull();
				expect(capturedWs!.onmessage).not.toBeNull();
			},
			{ timeout: 1000 }
		);

		capturedWs!.triggerMessage({
			type: 'file_progress',
			fileId: 'f-abc',
			overallProgress: 25,
			filesCompleted: 0,
			totalFiles: 2
		});
		capturedWs!.triggerMessage({
			type: 'file_progress',
			fileId: 'f-def',
			overallProgress: 50,
			filesCompleted: 1,
			totalFiles: 2
		});

		expect(callbacks.onFileStart).toHaveBeenCalledWith('f-abc', 'holiday.jpg');
		expect(callbacks.onFileStart).toHaveBeenCalledWith('f-def', 'clip.mp4');
	});
});
