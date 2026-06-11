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
		getJobStatus: vi.fn(),
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
import type { ProcessingResults } from '$lib/types/processing.js';

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

// ─── Helper: set up a mock WebSocket scenario ────────────────────────────────

interface UploadedFileInfo {
	id: string;
	name: string;
}

async function setupWsScenario(
	uploadedFiles: UploadedFileInfo[] = [{ id: 'f-seed', name: 'seed.jpg' }]
): Promise<{ ws: MockWebSocket; callbacks: CleaningCallbacks }> {
	let capturedWs: MockWebSocket | null = null;

	vi.mocked(api.uploadFiles).mockResolvedValueOnce({
		files: uploadedFiles.map((f) => ({
			id: f.id,
			name: f.name,
			size: 1000,
			extension: '.jpg',
			type: 'image',
			format: 'jpeg'
		}))
	});
	vi.mocked(api.createJob).mockResolvedValueOnce({
		jobId: 'job-ws-test',
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
		uploadedFiles.map((f) => makeQueuedFile(f.id, 0, false)),
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

	return { ws: capturedWs!, callbacks };
}

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

// ─── Property 6: WebSocket message dispatch correctness ───────────────────────

describe('Feature: api-integration, Property 6: WebSocket message dispatch correctness with fileName resolution', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('file_progress resolves fileName from fileNameMap and calls onProgress with message values', async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.array(
					fc.record({
						overallProgress: fc.integer({ min: 0, max: 100 }),
						filesCompleted: fc.nat({ max: 50 }),
						totalFiles: fc.nat({ max: 50 })
					}),
					{ minLength: 1, maxLength: 8 }
				),
				async (events) => {
					const uploadedFiles = events.map((_, i) => ({
						id: `f-${String(i).padStart(3, '0')}`,
						name: `file-${i}.jpg`
					}));

					const { ws, callbacks } = await setupWsScenario(uploadedFiles);

					events.forEach((e, i) => {
						ws.triggerMessage({
							type: 'file_progress',
							fileId: uploadedFiles[i].id,
							overallProgress: e.overallProgress,
							filesCompleted: e.filesCompleted,
							totalFiles: e.totalFiles
						});
					});

					expect(callbacks.onFileStart).toHaveBeenCalledTimes(events.length);
					uploadedFiles.forEach((f) => {
						expect(callbacks.onFileStart).toHaveBeenCalledWith(f.id, f.name);
					});
					expect(callbacks.onProgress).toHaveBeenCalledTimes(events.length);
				}
			),
			{ numRuns: 20 }
		);
	});

	it('file_complete calls onFileComplete and onProgress for every event', async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.array(
					fc.record({
						fieldsRemoved: fc.nat({ max: 200 }),
						gpsRemoved: fc.boolean(),
						overallProgress: fc.integer({ min: 0, max: 100 }),
						filesCompleted: fc.nat({ max: 50 }),
						totalFiles: fc.nat({ max: 50 })
					}),
					{ minLength: 1, maxLength: 10 }
				),
				async (events) => {
					const { ws, callbacks } = await setupWsScenario();

					events.forEach((e, i) => {
						ws.triggerMessage({
							type: 'file_complete',
							fileId: `f-${String(i).padStart(3, '0')}`,
							fieldsRemoved: e.fieldsRemoved,
							gpsRemoved: e.gpsRemoved,
							overallProgress: e.overallProgress,
							filesCompleted: e.filesCompleted,
							totalFiles: e.totalFiles
						});
					});

					expect(callbacks.onFileComplete).toHaveBeenCalledTimes(events.length);
					expect(callbacks.onProgress).toHaveBeenCalledTimes(events.length);

					events.forEach((e, i) => {
						expect(callbacks.onFileComplete).toHaveBeenCalledWith(
							`f-${String(i).padStart(3, '0')}`,
							e.fieldsRemoved,
							e.gpsRemoved
						);
					});
				}
			),
			{ numRuns: 20 }
		);
	});

	it('file_error calls onError with the errorCode, message, fileId, and phase from the event', async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.record({
					fileIdx: fc.nat({ max: 9 }),
					errorCode: fc.string({ minLength: 1, maxLength: 30 }),
					message: fc.string({ minLength: 1, maxLength: 100 })
				}),
				async (event) => {
					const fileId = `f-${String(event.fileIdx).padStart(3, '0')}`;
					const { ws, callbacks } = await setupWsScenario([{ id: fileId, name: 'err.jpg' }]);

					ws.triggerMessage({
						type: 'file_error',
						fileId,
						errorCode: event.errorCode,
						message: event.message
					});

					expect(callbacks.onError).toHaveBeenCalledTimes(1);
					const errorArg = vi.mocked(callbacks.onError).mock.calls[0][0];
					expect(errorArg.code).toBe(event.errorCode);
					expect(errorArg.message).toBe(event.message);
					expect(errorArg.fileId).toBe(fileId);
					expect(errorArg.phase).toBe('cleaning');
				}
			),
			{ numRuns: 30 }
		);
	});

	it('report_ready fires no callbacks', async () => {
		const { ws, callbacks } = await setupWsScenario();

		ws.triggerMessage({ type: 'report_ready', reportId: 'RPT-001' });

		expect(callbacks.onFileStart).not.toHaveBeenCalled();
		expect(callbacks.onFileComplete).not.toHaveBeenCalled();
		expect(callbacks.onProgress).not.toHaveBeenCalled();
		expect(callbacks.onComplete).not.toHaveBeenCalled();
		expect(callbacks.onError).not.toHaveBeenCalled();
	});

	it('unknown message type is silently ignored', async () => {
		const knownTypes = new Set([
			'file_progress',
			'file_complete',
			'file_error',
			'job_complete',
			'report_ready'
		]);

		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 1, maxLength: 40 }).filter((t) => !knownTypes.has(t)),
				async (unknownType) => {
					const { ws, callbacks } = await setupWsScenario();

					ws.triggerMessage({ type: unknownType });

					expect(callbacks.onFileStart).not.toHaveBeenCalled();
					expect(callbacks.onFileComplete).not.toHaveBeenCalled();
					expect(callbacks.onProgress).not.toHaveBeenCalled();
					expect(callbacks.onComplete).not.toHaveBeenCalled();
					expect(callbacks.onError).not.toHaveBeenCalled();
				}
			),
			{ numRuns: 30 }
		);
	});

	it('job_complete fires onComplete exactly once and no other callbacks', async () => {
		const { ws, callbacks } = await setupWsScenario();

		ws.triggerMessage({
			type: 'job_complete',
			filesProcessed: 2,
			fieldsRemoved: 42,
			gpsLocationsRemoved: 1,
			totalTimeSeconds: 7
		});

		expect(callbacks.onComplete).toHaveBeenCalledTimes(1);
		expect(callbacks.onFileStart).not.toHaveBeenCalled();
		expect(callbacks.onError).not.toHaveBeenCalled();
	});
});

// ─── Property 7: ProcessingResults construction from accumulated events ────────

describe('Feature: api-integration, Property 7: ProcessingResults construction from accumulated events', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('fileResults has one entry per accumulated file_complete event for any N events', async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.array(
					fc.record({
						fieldsRemoved: fc.nat({ max: 200 }),
						gpsRemoved: fc.boolean()
					}),
					{ maxLength: 15 }
				),
				async (events) => {
					const { ws, callbacks } = await setupWsScenario();

					events.forEach((e, i) => {
						ws.triggerMessage({
							type: 'file_complete',
							fileId: `f-${String(i).padStart(3, '0')}`,
							fieldsRemoved: e.fieldsRemoved,
							gpsRemoved: e.gpsRemoved,
							overallProgress: 50,
							filesCompleted: i + 1,
							totalFiles: events.length
						});
					});

					ws.triggerMessage({
						type: 'job_complete',
						filesProcessed: events.length,
						fieldsRemoved: events.reduce((sum, e) => sum + e.fieldsRemoved, 0),
						gpsLocationsRemoved: events.filter((e) => e.gpsRemoved).length,
						totalTimeSeconds: 5
					});

					const result = vi.mocked(callbacks.onComplete).mock.calls[0][0] as ProcessingResults;
					expect(result.fileResults).toHaveLength(events.length);
				}
			),
			{ numRuns: 50 }
		);
	});

	it('beforeBreakdown.gpsLocations equals the count of file_complete events with gpsRemoved=true', async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.array(fc.boolean(), { maxLength: 20 }),
				async (gpsFlags) => {
					const { ws, callbacks } = await setupWsScenario();

					gpsFlags.forEach((gpsRemoved, i) => {
						ws.triggerMessage({
							type: 'file_complete',
							fileId: `f-${String(i).padStart(3, '0')}`,
							fieldsRemoved: 5,
							gpsRemoved,
							overallProgress: 50,
							filesCompleted: i + 1,
							totalFiles: gpsFlags.length
						});
					});

					ws.triggerMessage({
						type: 'job_complete',
						filesProcessed: gpsFlags.length,
						fieldsRemoved: gpsFlags.length * 5,
						gpsLocationsRemoved: gpsFlags.filter(Boolean).length,
						totalTimeSeconds: 3
					});

					const result = vi.mocked(callbacks.onComplete).mock.calls[0][0] as ProcessingResults;
					expect(result.beforeBreakdown.gpsLocations).toBe(gpsFlags.filter(Boolean).length);
				}
			),
			{ numRuns: 50 }
		);
	});

	it('ProcessingResults preserves fieldsRemoved, gpsLocationsRemoved, and totalTimeSeconds from job_complete', async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.record({
					fieldsRemoved: fc.nat({ max: 10000 }),
					gpsLocationsRemoved: fc.nat({ max: 500 }),
					totalTimeSeconds: fc.nat({ max: 3600 })
				}),
				async (jobMsg) => {
					const { ws, callbacks } = await setupWsScenario();

					ws.triggerMessage({
						type: 'job_complete',
						filesProcessed: 0,
						fieldsRemoved: jobMsg.fieldsRemoved,
						gpsLocationsRemoved: jobMsg.gpsLocationsRemoved,
						totalTimeSeconds: jobMsg.totalTimeSeconds
					});

					const result = vi.mocked(callbacks.onComplete).mock.calls[0][0] as ProcessingResults;
					expect(result.fieldsRemoved).toBe(jobMsg.fieldsRemoved);
					expect(result.gpsLocationsRemoved).toBe(jobMsg.gpsLocationsRemoved);
					expect(result.totalTimeSeconds).toBe(jobMsg.totalTimeSeconds);
				}
			),
			{ numRuns: 50 }
		);
	});

	it('each fileResults entry has correct totalFields and gpsRemoved from the corresponding file_complete event', async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.array(
					fc.record({
						fieldsRemoved: fc.nat({ max: 500 }),
						gpsRemoved: fc.boolean()
					}),
					{ minLength: 1, maxLength: 10 }
				),
				async (events) => {
					const { ws, callbacks } = await setupWsScenario();

					events.forEach((e, i) => {
						ws.triggerMessage({
							type: 'file_complete',
							fileId: `f-${String(i).padStart(3, '0')}`,
							fieldsRemoved: e.fieldsRemoved,
							gpsRemoved: e.gpsRemoved,
							overallProgress: 0,
							filesCompleted: i + 1,
							totalFiles: events.length
						});
					});

					ws.triggerMessage({
						type: 'job_complete',
						filesProcessed: events.length,
						fieldsRemoved: events.reduce((sum, e) => sum + e.fieldsRemoved, 0),
						gpsLocationsRemoved: events.filter((e) => e.gpsRemoved).length,
						totalTimeSeconds: 5
					});

					const result = vi.mocked(callbacks.onComplete).mock.calls[0][0] as ProcessingResults;
					events.forEach((e, i) => {
						expect(result.fileResults[i].fileId).toBe(`f-${String(i).padStart(3, '0')}`);
						expect(result.fileResults[i].totalFields).toBe(e.fieldsRemoved);
						expect(result.fileResults[i].gpsRemoved).toBe(e.gpsRemoved);
					});
				}
			),
			{ numRuns: 30 }
		);
	});

	it('filesProcessed defaults to accumulated count when absent from job_complete', async () => {
		const { ws, callbacks } = await setupWsScenario();

		for (let i = 0; i < 3; i++) {
			ws.triggerMessage({
				type: 'file_complete',
				fileId: `f-00${i}`,
				fieldsRemoved: 10,
				gpsRemoved: false,
				overallProgress: ((i + 1) / 3) * 100,
				filesCompleted: i + 1,
				totalFiles: 3
			});
		}

		// Send job_complete without filesProcessed — should fall back to accumulated count (3)
		ws.triggerMessage({
			type: 'job_complete',
			fieldsRemoved: 30,
			gpsLocationsRemoved: 0,
			totalTimeSeconds: 5
		});

		const result = vi.mocked(callbacks.onComplete).mock.calls[0][0] as ProcessingResults;
		expect(result.filesProcessed).toBe(3);
	});
});

// ─── Property 8: HTTP error status code mapping ───────────────────────────────

describe('Feature: api-integration, Property 8: HTTP error status code mapping', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('status 413 maps to FILE_TOO_LARGE, 415 to UNSUPPORTED_FORMAT, 429 to RATE_LIMIT_EXCEEDED', async () => {
		const statusToCode: [number, string][] = [
			[413, 'FILE_TOO_LARGE'],
			[415, 'UNSUPPORTED_FORMAT'],
			[429, 'RATE_LIMIT_EXCEEDED'],
			[400, 'INVALID_REQUEST'],
			[404, 'FILE_NOT_FOUND']
		];

		for (const [status, expectedCode] of statusToCode) {
			const callbacks = makeCallbacks();

			vi.mocked(api.uploadFiles).mockRejectedValueOnce(
				new api.ApiHttpError(status, expectedCode, `Error ${status}`, '2024-01-01T00:00:00Z')
			);

			apiCleaningService.startCleaning([makeQueuedFile('f-001', 5, false)], noopOptions, callbacks);

			await vi.waitFor(
				() => {
					expect(callbacks.onError).toHaveBeenCalledTimes(1);
				},
				{ timeout: 1000 }
			);

			const error = vi.mocked(callbacks.onError).mock.calls[0][0];
			expect(error.code).toBe(expectedCode);
			expect(error.phase).toBe('upload');
		}
	});

	it('error code and message from ApiHttpError are preserved for any status code', async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.record({
					status: fc.oneof(
						fc.constantFrom(413, 415, 429, 400, 404, 500, 503),
						fc.integer({ min: 400, max: 599 })
					),
					errorCode: fc.string({ minLength: 1, maxLength: 40 }),
					errorMessage: fc.string({ minLength: 1, maxLength: 200 })
				}),
				async ({ status, errorCode, errorMessage }) => {
					const callbacks = makeCallbacks();

					vi.mocked(api.uploadFiles).mockRejectedValueOnce(
						new api.ApiHttpError(status, errorCode, errorMessage, '2024-01-01T00:00:00Z')
					);

					apiCleaningService.startCleaning(
						[makeQueuedFile('f-002', 5, false)],
						noopOptions,
						callbacks
					);

					await vi.waitFor(
						() => {
							expect(callbacks.onError).toHaveBeenCalledTimes(1);
						},
						{ timeout: 1000 }
					);

					const error = vi.mocked(callbacks.onError).mock.calls[0][0];
					expect(error.code).toBe(errorCode);
					expect(error.message).toBe(errorMessage);
					expect(error.phase).toBe('upload');
				}
			),
			{ numRuns: 50 }
		);
	});

	it('phase is always upload when uploadFiles throws ApiHttpError', async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.integer({ min: 400, max: 599 }),
				async (status) => {
					const callbacks = makeCallbacks();

					vi.mocked(api.uploadFiles).mockRejectedValueOnce(
						new api.ApiHttpError(status, 'SOME_CODE', 'Error message', '2024-01-01T00:00:00Z')
					);

					apiCleaningService.startCleaning(
						[makeQueuedFile('f-003', 5, false)],
						noopOptions,
						callbacks
					);

					await vi.waitFor(
						() => {
							expect(callbacks.onError).toHaveBeenCalledTimes(1);
						},
						{ timeout: 1000 }
					);

					const error = vi.mocked(callbacks.onError).mock.calls[0][0];
					expect(error.phase).toBe('upload');
				}
			),
			{ numRuns: 50 }
		);
	});

	it('network TypeError from fetch is mapped to code NETWORK_ERROR with phase upload', async () => {
		const callbacks = makeCallbacks();

		vi.mocked(api.uploadFiles).mockRejectedValueOnce(new TypeError('Failed to fetch'));

		apiCleaningService.startCleaning([makeQueuedFile('f-004', 5, false)], noopOptions, callbacks);

		await vi.waitFor(
			() => {
				expect(callbacks.onError).toHaveBeenCalledTimes(1);
			},
			{ timeout: 1000 }
		);

		const error = vi.mocked(callbacks.onError).mock.calls[0][0];
		expect(error.code).toBe('NETWORK_ERROR');
		expect(error.phase).toBe('upload');
		expect(error.message).toBe('Failed to fetch');
	});

	it('onError is called exactly once per HTTP error — no duplicate error callbacks', async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.constantFrom(413, 415, 429, 400, 404),
				async (status) => {
					const callbacks = makeCallbacks();

					vi.mocked(api.uploadFiles).mockRejectedValueOnce(
						new api.ApiHttpError(status, 'ANY_CODE', 'msg', '2024-01-01T00:00:00Z')
					);

					apiCleaningService.startCleaning(
						[makeQueuedFile('f-005', 5, false)],
						noopOptions,
						callbacks
					);

					await vi.waitFor(
						() => {
							expect(callbacks.onError).toHaveBeenCalledTimes(1);
						},
						{ timeout: 1000 }
					);

					expect(callbacks.onError).toHaveBeenCalledTimes(1);
					expect(callbacks.onComplete).not.toHaveBeenCalled();
				}
			),
			{ numRuns: 20 }
		);
	});
});

// ─── Property 10: Report summary type mapping correctness ─────────────────────

describe('Feature: api-integration, Property 10: Report summary type mapping correctness', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	function makeBackendReport(overrides: Record<string, unknown> = {}): Record<string, unknown> {
		return {
			id: 'r-001',
			reportId: 'RPT-001',
			date: '2025-01-15T14:32:00Z',
			duration: '5s',
			fileCount: 3,
			fileTypes: 'jpg',
			type: 'image',
			gps: false,
			fields: 42,
			tags: ['exif'],
			...overrides
		};
	}

	function mockGetReports(reports: Record<string, unknown>[]) {
		vi.mocked(api.getReports).mockResolvedValueOnce({
			summary: { totalReports: reports.length, fieldsRemoved: 0, filesProcessed: 0, gpsRemoved: 0 },
			reports
		} as never);
	}

	it('iconColor is blue for type=image and orange for type=video for any other fields', async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.record({
					id: fc.string({ minLength: 1, maxLength: 20 }),
					reportId: fc.string({ minLength: 1, maxLength: 20 }),
					date: fc.string({ minLength: 1, maxLength: 30 }),
					duration: fc.string({ minLength: 0, maxLength: 10 }),
					fileCount: fc.nat({ max: 1000 }),
					fileTypes: fc.string({ minLength: 0, maxLength: 20 }),
					gps: fc.boolean(),
					fields: fc.nat({ max: 10000 }),
					tags: fc.array(fc.string({ minLength: 1, maxLength: 10 }), { maxLength: 5 }),
					type: fc.constantFrom('image', 'video') as fc.Arbitrary<string>
				}),
				async (backendReport) => {
					mockGetReports([backendReport]);
					const result = await apiCleaningService.getReports();
					expect(result.reports).toHaveLength(1);
					const report = result.reports[0];
					if (backendReport.type === 'image') {
						expect(report.iconColor).toBe('blue');
					} else {
						expect(report.iconColor).toBe('orange');
					}
				}
			),
			{ numRuns: 100 }
		);
	});

	it('fieldsColor is always white regardless of input', async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.record({
					id: fc.string({ minLength: 1, maxLength: 20 }),
					reportId: fc.string({ minLength: 1, maxLength: 20 }),
					date: fc.string({ minLength: 1, maxLength: 30 }),
					duration: fc.string({ minLength: 0, maxLength: 10 }),
					fileCount: fc.nat({ max: 1000 }),
					fileTypes: fc.string({ minLength: 0, maxLength: 20 }),
					type: fc.constantFrom('image', 'video') as fc.Arbitrary<string>,
					gps: fc.boolean(),
					fields: fc.nat({ max: 10000 }),
					tags: fc.array(fc.string({ minLength: 1, maxLength: 10 }), { maxLength: 5 })
				}),
				async (backendReport) => {
					mockGetReports([backendReport]);
					const result = await apiCleaningService.getReports();
					expect(result.reports[0].fieldsColor).toBe('white');
				}
			),
			{ numRuns: 100 }
		);
	});

	it('time is empty string when date has no T, non-empty HH:MM when date contains T', async () => {
		mockGetReports([makeBackendReport({ date: '2025-06-10' })]);
		let result = await apiCleaningService.getReports();
		expect(result.reports[0].time).toBe('');
		expect(result.reports[0].date).toBe('2025-06-10');

		mockGetReports([makeBackendReport({ date: '2025-06-10T14:32:00Z' })]);
		result = await apiCleaningService.getReports();
		expect(result.reports[0].time).toBe('14:32');
		expect(result.reports[0].date).toBe('2025-06-10');
	});

	it('date and time are correctly extracted from any valid ISO timestamp', async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.record({
					year: fc.integer({ min: 2000, max: 2099 }),
					month: fc.integer({ min: 1, max: 12 }),
					day: fc.integer({ min: 1, max: 28 }),
					hour: fc.integer({ min: 0, max: 23 }),
					minute: fc.integer({ min: 0, max: 59 })
				}),
				async ({ year, month, day, hour, minute }) => {
					const pad = (n: number) => String(n).padStart(2, '0');
					const dateStr = `${year}-${pad(month)}-${pad(day)}`;
					const timeStr = `${pad(hour)}:${pad(minute)}`;
					const isoDate = `${dateStr}T${timeStr}:00Z`;

					mockGetReports([makeBackendReport({ date: isoDate })]);
					const result = await apiCleaningService.getReports();
					expect(result.reports[0].date).toBe(dateStr);
					expect(result.reports[0].time).toBe(timeStr);
				}
			),
			{ numRuns: 100 }
		);
	});

	it('all scalar fields are passed through unchanged from backend to frontend', async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.record({
					id: fc.string({ minLength: 1, maxLength: 20 }),
					reportId: fc.string({ minLength: 1, maxLength: 20 }),
					duration: fc.string({ minLength: 0, maxLength: 20 }),
					fileCount: fc.nat({ max: 1000 }),
					fileTypes: fc.string({ minLength: 0, maxLength: 50 }),
					type: fc.constantFrom('image', 'video') as fc.Arbitrary<string>,
					gps: fc.boolean(),
					fields: fc.nat({ max: 10000 }),
					tags: fc.array(fc.string({ minLength: 1, maxLength: 10 }), { maxLength: 5 })
				}),
				async (fields) => {
					mockGetReports([makeBackendReport(fields)]);
					const result = await apiCleaningService.getReports();
					const report = result.reports[0];

					expect(report.id).toBe(fields.id);
					expect(report.reportId).toBe(fields.reportId);
					expect(report.duration).toBe(fields.duration);
					expect(report.fileCount).toBe(fields.fileCount);
					expect(report.fileTypes).toBe(fields.fileTypes);
					expect(report.type).toBe(fields.type);
					expect(report.gps).toBe(fields.gps);
					expect(report.fields).toBe(fields.fields);
					expect(report.tags).toEqual(fields.tags);
				}
			),
			{ numRuns: 100 }
		);
	});

	it('mapReportSummaries preserves array length for any N reports', async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.array(
					fc.record({
						id: fc.string({ minLength: 1, maxLength: 10 }),
						reportId: fc.string({ minLength: 1, maxLength: 10 }),
						date: fc.string({ minLength: 1, maxLength: 30 }),
						duration: fc.string({ minLength: 0, maxLength: 10 }),
						fileCount: fc.nat({ max: 100 }),
						fileTypes: fc.string({ minLength: 0, maxLength: 20 }),
						type: fc.constantFrom('image', 'video') as fc.Arbitrary<string>,
						gps: fc.boolean(),
						fields: fc.nat({ max: 1000 }),
						tags: fc.array(fc.string({ minLength: 1, maxLength: 10 }), { maxLength: 3 })
					}),
					{ maxLength: 20 }
				),
				async (backendReports) => {
					mockGetReports(backendReports);
					const result = await apiCleaningService.getReports();
					expect(result.reports).toHaveLength(backendReports.length);
				}
			),
			{ numRuns: 50 }
		);
	});
});

// ─── Task 6.2: download error handling and report mapping integration ─────────

describe('Feature: api-integration, Task 6.2: downloadResults error handling and report mapping integration', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// downloadResults

	it('downloadResults throws "File not found or expired" on 404', async () => {
		vi.mocked(api.downloadJobZip).mockRejectedValueOnce(
			new api.ApiHttpError(404, 'FILE_NOT_FOUND', 'Not found', '2024-01-01T00:00:00Z')
		);

		await expect(apiCleaningService.downloadResults('job-404')).rejects.toThrow(
			'File not found or expired'
		);
	});

	it('downloadResults throws "Job is still processing" on 409', async () => {
		vi.mocked(api.downloadJobZip).mockRejectedValueOnce(
			new api.ApiHttpError(409, 'JOB_NOT_READY', 'Conflict', '2024-01-01T00:00:00Z')
		);

		await expect(apiCleaningService.downloadResults('job-409')).rejects.toThrow(
			'Job is still processing'
		);
	});

	it('downloadResults re-throws non-404/409 ApiHttpError unchanged', async () => {
		const err = new api.ApiHttpError(500, 'SERVER_ERROR', 'Internal error', '2024-01-01T00:00:00Z');
		vi.mocked(api.downloadJobZip).mockRejectedValueOnce(err);

		await expect(apiCleaningService.downloadResults('job-500')).rejects.toBe(err);
	});

	it('downloadResults returns blob on success', async () => {
		const blob = new Blob(['zip-content'], { type: 'application/zip' });
		vi.mocked(api.downloadJobZip).mockResolvedValueOnce(blob);

		const result = await apiCleaningService.downloadResults('job-ok');
		expect(result).toBe(blob);
	});

	it('downloadResults calls downloadJobZip with the provided jobId', async () => {
		const blob = new Blob(['data'], { type: 'application/zip' });
		vi.mocked(api.downloadJobZip).mockResolvedValueOnce(blob);

		await apiCleaningService.downloadResults('job-id-xyz');
		expect(api.downloadJobZip).toHaveBeenCalledWith('job-id-xyz');
	});

	// getReports

	it('getReports passes summary through unchanged from backend', async () => {
		const backendSummary = { totalReports: 5, fieldsRemoved: 42, filesProcessed: 10, gpsRemoved: 3 };
		vi.mocked(api.getReports).mockResolvedValueOnce({
			summary: backendSummary,
			reports: []
		} as never);

		const result = await apiCleaningService.getReports();
		expect(result.summary).toEqual(backendSummary);
		expect(result.reports).toHaveLength(0);
	});

	it('getReports maps all scalar fields and computes iconColor and fieldsColor', async () => {
		vi.mocked(api.getReports).mockResolvedValueOnce({
			summary: { totalReports: 1, fieldsRemoved: 42, filesProcessed: 3, gpsRemoved: 0 },
			reports: [
				{
					id: 'r-001',
					reportId: 'RPT-001',
					date: '2025-01-15T14:32:00Z',
					duration: '5s',
					fileCount: 3,
					fileTypes: 'jpg',
					type: 'image',
					gps: false,
					fields: 42,
					tags: ['exif', 'xmp']
				}
			]
		} as never);

		const result = await apiCleaningService.getReports();
		const report = result.reports[0];
		expect(report.id).toBe('r-001');
		expect(report.reportId).toBe('RPT-001');
		expect(report.date).toBe('2025-01-15');
		expect(report.time).toBe('14:32');
		expect(report.duration).toBe('5s');
		expect(report.fileCount).toBe(3);
		expect(report.fileTypes).toBe('jpg');
		expect(report.type).toBe('image');
		expect(report.gps).toBe(false);
		expect(report.fields).toBe(42);
		expect(report.fieldsColor).toBe('white');
		expect(report.tags).toEqual(['exif', 'xmp']);
		expect(report.iconColor).toBe('blue');
	});

	it('getReports maps video type to orange iconColor', async () => {
		vi.mocked(api.getReports).mockResolvedValueOnce({
			summary: { totalReports: 1, fieldsRemoved: 10, filesProcessed: 1, gpsRemoved: 0 },
			reports: [
				{
					id: 'r-002',
					reportId: 'RPT-002',
					date: '2025-06-10',
					duration: '2s',
					fileCount: 1,
					fileTypes: 'mp4',
					type: 'video',
					gps: false,
					fields: 10,
					tags: []
				}
			]
		} as never);

		const result = await apiCleaningService.getReports();
		expect(result.reports[0].iconColor).toBe('orange');
	});

	// getReportDetail

	it('getReportDetail maps backend response to ReportDetail with computed barWidthPercent and gradients', async () => {
		vi.mocked(api.getReportDetail).mockResolvedValueOnce({
			reportId: 'RPT-001',
			date: '2025-01-15T14:32:00Z',
			filesProcessed: 2,
			fieldsRemoved: 30,
			gpsLocationsRemoved: 1,
			totalTimeSeconds: 7,
			chartData: [{ label: 'EXIF', fields: 20, percentage: 67 }],
			files: [
				{
					name: 'photo.jpg',
					extension: '.jpg',
					sizeMB: '2.5',
					format: 'jpeg',
					device: 'Canon',
					type: 'image',
					hasGps: true,
					fieldsRemoved: 20,
					metadata: null
				},
				{
					name: 'clip.mp4',
					extension: '.mp4',
					sizeMB: '5.0',
					format: 'mp4',
					device: 'Sony',
					type: 'video',
					hasGps: false,
					fieldsRemoved: 10,
					metadata: null
				}
			]
		} as never);

		const result = await apiCleaningService.getReportDetail('RPT-001');
		expect(result.reportId).toBe('RPT-001');
		expect(result.filesProcessed).toBe(2);
		expect(result.fieldsRemoved).toBe(30);
		expect(result.gpsLocationsRemoved).toBe(1);
		expect(result.totalTimeSeconds).toBe(7);
		expect(result.chartData).toEqual([{ label: 'EXIF', fields: 20, percentage: 67 }]);
		expect(result.files).toHaveLength(2);

		const imageFile = result.files[0];
		expect(imageFile.name).toBe('photo.jpg');
		expect(imageFile.iconColor).toBe('blue');
		expect(imageFile.barWidthPercent).toBe(67); // Math.round(20/30*100)
		expect(imageFile.barGradientFrom).toBe('#22c55e');
		expect(imageFile.barGradientTo).toBe('#16a34a');
		expect(imageFile.hasGps).toBe(true);

		const videoFile = result.files[1];
		expect(videoFile.iconColor).toBe('orange');
		expect(videoFile.barWidthPercent).toBe(33); // Math.round(10/30*100)
		expect(videoFile.barGradientFrom).toBe('#f97316');
		expect(videoFile.barGradientTo).toBe('#ea580c');
	});

	it('getReportDetail maps metadata fields with moreCount: undefined', async () => {
		vi.mocked(api.getReportDetail).mockResolvedValueOnce({
			reportId: 'RPT-002',
			date: '2025-06-10',
			filesProcessed: 1,
			fieldsRemoved: 5,
			gpsLocationsRemoved: 0,
			totalTimeSeconds: 3,
			chartData: [],
			files: [
				{
					name: 'photo.jpg',
					extension: '.jpg',
					sizeMB: '1.0',
					format: 'jpeg',
					device: '',
					type: 'image',
					hasGps: false,
					fieldsRemoved: 5,
					metadata: {
						gpsFields: [{ label: 'Latitude', value: '50.0' }],
						exifFields: [
							{ label: 'Make', value: 'Canon' },
							{ label: 'Model', value: 'EOS' }
						],
						xmpFields: [],
						totalRemoved: 3
					}
				}
			]
		} as never);

		const result = await apiCleaningService.getReportDetail('RPT-002');
		const meta = result.files[0].metadata;
		expect(meta.gpsFields).toHaveLength(1);
		expect(meta.gpsFields[0]).toEqual({ label: 'Latitude', value: '50.0', moreCount: undefined });
		expect(meta.exifFields).toHaveLength(2);
		expect(meta.exifFields[0]).toEqual({ label: 'Make', value: 'Canon', moreCount: undefined });
		expect(meta.xmpFields).toHaveLength(0);
		expect(meta.totalRemoved).toBe(3);
	});

	it('getReportDetail throws "Report not found" on 404', async () => {
		vi.mocked(api.getReportDetail).mockRejectedValueOnce(
			new api.ApiHttpError(404, 'NOT_FOUND', 'Not found', '2024-01-01T00:00:00Z')
		);

		await expect(apiCleaningService.getReportDetail('RPT-999')).rejects.toThrow('Report not found');
	});

	it('getReportDetail re-throws non-404 ApiHttpError unchanged', async () => {
		const err = new api.ApiHttpError(500, 'SERVER_ERROR', 'Internal error', '2024-01-01T00:00:00Z');
		vi.mocked(api.getReportDetail).mockRejectedValueOnce(err);

		await expect(apiCleaningService.getReportDetail('RPT-999')).rejects.toBe(err);
	});
});

// ─── Task 1: Bug Condition Exploration Tests ─────────────────────────────────
// CRITICAL: These tests MUST FAIL on unfixed code - failure confirms the bugs exist.
// They encode expected behavior and will validate fixes once implemented.

describe('Bug Condition 6: computeIconColor should return blue for image', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// EXPECTED OUTCOME: FAILS on unfixed code (currently returns 'green')
	it('computeIconColor returns blue for image type (EXPECTED BEHAVIOR)', async () => {
		vi.mocked(api.getReports).mockResolvedValueOnce({
			summary: { totalReports: 1, fieldsRemoved: 0, filesProcessed: 0, gpsRemoved: 0 },
			reports: [
				{
					id: 'r-img-bug6',
					reportId: 'RPT-IMG-BUG6',
					date: '2025-01-15',
					duration: '5s',
					fileCount: 1,
					fileTypes: 'jpg',
					type: 'image',
					gps: false,
					fields: 10,
					tags: []
				}
			]
		} as never);
		const result = await apiCleaningService.getReports();
		// Bug 6: currently returns 'green' — expected 'blue' per design spec
		expect(result.reports[0].iconColor).toBe('blue');
	});

	// Preservation: video stays orange (EXPECTED OUTCOME: PASSES on unfixed code)
	it('computeIconColor preserves orange for video type', async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.constantFrom('video', 'document') as fc.Arbitrary<string>,
				async (type) => {
					vi.mocked(api.getReports).mockResolvedValueOnce({
						summary: { totalReports: 1, fieldsRemoved: 0, filesProcessed: 0, gpsRemoved: 0 },
						reports: [
							{
								id: 'r-vid-pres',
								reportId: 'RPT-VID-PRES',
								date: '2025-01-15',
								duration: '5s',
								fileCount: 1,
								fileTypes: type,
								type,
								gps: false,
								fields: 10,
								tags: []
							}
						]
					} as never);
					const result = await apiCleaningService.getReports();
					expect(result.reports[0].iconColor).toBe('orange');
				}
			),
			{ numRuns: 20 }
		);
	});
});

describe('Bug Condition 8: mapMetadataDetail should include video-specific fields', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// EXPECTED OUTCOME: FAILS on unfixed code (id3Fields ignored in mapMetadataDetail)
	it('mapMetadataDetail includes id3Fields from backend response (EXPECTED BEHAVIOR)', async () => {
		vi.mocked(api.getReportDetail).mockResolvedValueOnce({
			reportId: 'RPT-BUG8-ID3',
			date: '2025-01-15',
			filesProcessed: 1,
			fieldsRemoved: 2,
			gpsLocationsRemoved: 0,
			totalTimeSeconds: 2,
			chartData: [],
			files: [
				{
					name: 'song.mp3',
					extension: '.mp3',
					sizeMB: '5.0',
					format: 'mp3',
					device: '',
					type: 'video',
					hasGps: false,
					fieldsRemoved: 2,
					metadata: {
						gpsFields: [],
						exifFields: [],
						xmpFields: [],
						id3Fields: [
							{ label: 'Title', value: 'My Track' },
							{ label: 'Artist', value: 'Some Artist' }
						],
						totalRemoved: 2
					}
				}
			]
		} as never);
		const result = await apiCleaningService.getReportDetail('RPT-BUG8-ID3');
		const meta = result.files[0].metadata as unknown as Record<string, unknown>;
		// Bug 8: id3Fields missing from FileMetadataSection — mapMetadataDetail ignores them
		expect(meta['id3Fields']).toBeDefined();
		expect(Array.isArray(meta['id3Fields'])).toBe(true);
		expect((meta['id3Fields'] as unknown[]).length).toBe(2);
	});

	// EXPECTED OUTCOME: FAILS on unfixed code (mp4Atoms ignored in mapMetadataDetail)
	it('mapMetadataDetail includes mp4AtomFields from backend mp4Atoms (EXPECTED BEHAVIOR)', async () => {
		vi.mocked(api.getReportDetail).mockResolvedValueOnce({
			reportId: 'RPT-BUG8-MP4',
			date: '2025-01-15',
			filesProcessed: 1,
			fieldsRemoved: 2,
			gpsLocationsRemoved: 0,
			totalTimeSeconds: 2,
			chartData: [],
			files: [
				{
					name: 'video.mp4',
					extension: '.mp4',
					sizeMB: '15.0',
					format: 'mp4',
					device: '',
					type: 'video',
					hasGps: false,
					fieldsRemoved: 2,
					metadata: {
						gpsFields: [],
						exifFields: [],
						xmpFields: [],
						mp4Atoms: [
							{ label: 'Encoder', value: 'ffmpeg' },
							{ label: 'CreationTime', value: '2025-01-01' }
						],
						totalRemoved: 2
					}
				}
			]
		} as never);
		const result = await apiCleaningService.getReportDetail('RPT-BUG8-MP4');
		const meta = result.files[0].metadata as unknown as Record<string, unknown>;
		// Bug 8: mp4AtomFields missing from FileMetadataSection — mp4Atoms ignored
		expect(meta['mp4AtomFields']).toBeDefined();
		expect(Array.isArray(meta['mp4AtomFields'])).toBe(true);
		expect((meta['mp4AtomFields'] as unknown[]).length).toBe(2);
	});

	// Preservation: existing GPS/EXIF/XMP fields remain (EXPECTED OUTCOME: PASSES)
	it('mapMetadataDetail preserves existing gps/exif/xmp fields', async () => {
		vi.mocked(api.getReportDetail).mockResolvedValueOnce({
			reportId: 'RPT-BUG8-PRES',
			date: '2025-01-15',
			filesProcessed: 1,
			fieldsRemoved: 3,
			gpsLocationsRemoved: 1,
			totalTimeSeconds: 1,
			chartData: [],
			files: [
				{
					name: 'photo.jpg',
					extension: '.jpg',
					sizeMB: '2.0',
					format: 'jpeg',
					device: '',
					type: 'image',
					hasGps: true,
					fieldsRemoved: 3,
					metadata: {
						gpsFields: [{ label: 'GPSLatitude', value: '50.0' }],
						exifFields: [{ label: 'Make', value: 'Canon' }],
						xmpFields: [{ label: 'Creator', value: 'User' }],
						totalRemoved: 3
					}
				}
			]
		} as never);
		const result = await apiCleaningService.getReportDetail('RPT-BUG8-PRES');
		const meta = result.files[0].metadata;
		expect(meta.gpsFields).toHaveLength(1);
		expect(meta.exifFields).toHaveLength(1);
		expect(meta.xmpFields).toHaveLength(1);
		expect(meta.totalRemoved).toBe(3);
	});
});

describe('Bug Condition 9: Report detail should show original upload filename', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// EXPECTED OUTCOME: FAILS on unfixed code (uses f.name which is the hashed ID)
	it('mapReportFileDetails uses original_name when provided by backend (EXPECTED BEHAVIOR)', async () => {
		vi.mocked(api.getReportDetail).mockResolvedValueOnce({
			reportId: 'RPT-BUG9',
			date: '2025-01-15',
			filesProcessed: 1,
			fieldsRemoved: 5,
			gpsLocationsRemoved: 0,
			totalTimeSeconds: 2,
			chartData: [],
			files: [
				{
					name: 'f-fbe455fb.mp4', // hashed internal name — bug shows this
					original_name: 'firefly-kling-3.0.mp4', // real upload name — expected
					extension: '.mp4',
					sizeMB: '15.0',
					format: 'mp4',
					device: '',
					type: 'video',
					hasGps: false,
					fieldsRemoved: 5,
					metadata: null
				}
			]
		} as never);
		const result = await apiCleaningService.getReportDetail('RPT-BUG9');
		// Bug 9: current code uses f.name (hashed) — expected to use f.original_name
		expect(result.files[0].name).toBe('firefly-kling-3.0.mp4');
		expect(result.files[0].name).not.toMatch(/^f-[a-f0-9]+\./);
	});

	// Preservation: when no original_name, name field still works (EXPECTED OUTCOME: PASSES)
	it('mapReportFileDetails falls back to name when original_name is absent', async () => {
		vi.mocked(api.getReportDetail).mockResolvedValueOnce({
			reportId: 'RPT-BUG9-PRES',
			date: '2025-01-15',
			filesProcessed: 1,
			fieldsRemoved: 5,
			gpsLocationsRemoved: 0,
			totalTimeSeconds: 2,
			chartData: [],
			files: [
				{
					name: 'photo.jpg',
					extension: '.jpg',
					sizeMB: '2.0',
					format: 'jpeg',
					device: '',
					type: 'image',
					hasGps: false,
					fieldsRemoved: 5,
					metadata: null
				}
			]
		} as never);
		const result = await apiCleaningService.getReportDetail('RPT-BUG9-PRES');
		expect(result.files[0].name).toBe('photo.jpg');
	});

	// Property: hashed IDs never appear as display names when original_name is present
	it('for any file with original_name, displayed name must not be a hashed ID', async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.record({
					hashedName: fc.stringMatching(/^[0-9a-f]{8}$/).map((h) => `f-${h}.mp4`),
					originalName: fc.string({ minLength: 1, maxLength: 80 }).filter(
						(s) => !s.match(/^f-[a-f0-9]+\./)
					)
				}),
				async ({ hashedName, originalName }) => {
					vi.mocked(api.getReportDetail).mockResolvedValueOnce({
						reportId: 'RPT-PROP9',
						date: '2025-01-15',
						filesProcessed: 1,
						fieldsRemoved: 1,
						gpsLocationsRemoved: 0,
						totalTimeSeconds: 1,
						chartData: [],
						files: [
							{
								name: hashedName,
								original_name: originalName,
								extension: '.mp4',
								sizeMB: '5.0',
								format: 'mp4',
								device: '',
								type: 'video',
								hasGps: false,
								fieldsRemoved: 1,
								metadata: null
							}
						]
					} as never);
					const result = await apiCleaningService.getReportDetail('RPT-PROP9');
					// After fix: original name used; before fix: hashed name used (test fails)
					expect(result.files[0].name).not.toMatch(/^f-[a-f0-9]+\./);
					expect(result.files[0].name).toBe(originalName);
				}
			),
			{ numRuns: 30 }
		);
	});
});

// ─── Property 11: Bar width percentage computation invariant ───────────────────

describe('Feature: api-integration, Property 11: Bar width percentage computation invariant', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	function makeBackendFile(fieldsRemoved: number): Record<string, unknown> {
		return {
			name: 'photo.jpg',
			extension: '.jpg',
			sizeMB: '1.5',
			format: 'jpeg',
			device: 'Canon',
			type: 'image',
			hasGps: false,
			fieldsRemoved,
			metadata: null
		};
	}

	function makeBackendReportDetail(files: Record<string, unknown>[]): Record<string, unknown> {
		return {
			reportId: 'RPT-001',
			date: '2025-01-15T14:32:00Z',
			filesProcessed: files.length,
			fieldsRemoved: files.reduce((sum, f) => sum + (f.fieldsRemoved as number), 0),
			gpsLocationsRemoved: 0,
			totalTimeSeconds: 5,
			chartData: [],
			files
		};
	}

	function mockReportDetail(files: Record<string, unknown>[]) {
		vi.mocked(api.getReportDetail).mockResolvedValueOnce(makeBackendReportDetail(files) as never);
	}

	it('barWidthPercent is always in range [0, 100] for any file configuration', async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.array(fc.nat({ max: 500 }), { minLength: 1, maxLength: 10 }),
				async (fieldCounts) => {
					mockReportDetail(fieldCounts.map((n) => makeBackendFile(n)));
					const result = await apiCleaningService.getReportDetail('RPT-001');
					for (const file of result.files) {
						expect(file.barWidthPercent).toBeGreaterThanOrEqual(0);
						expect(file.barWidthPercent).toBeLessThanOrEqual(100);
					}
				}
			),
			{ numRuns: 100 }
		);
	});

	it('all barWidthPercent values are 0 when totalFieldsRemoved is 0', async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.array(fc.constant(0), { minLength: 1, maxLength: 10 }),
				async (fieldCounts) => {
					mockReportDetail(fieldCounts.map((n) => makeBackendFile(n)));
					const result = await apiCleaningService.getReportDetail('RPT-001');
					for (const file of result.files) {
						expect(file.barWidthPercent).toBe(0);
					}
				}
			),
			{ numRuns: 20 }
		);
	});

	it('a file with all the removed fields gets barWidthPercent = 100', async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.nat({ max: 1000 }).filter((n) => n > 0),
				async (fieldsRemoved) => {
					mockReportDetail([makeBackendFile(fieldsRemoved)]);
					const result = await apiCleaningService.getReportDetail('RPT-001');
					expect(result.files[0].barWidthPercent).toBe(100);
				}
			),
			{ numRuns: 50 }
		);
	});

	it('barWidthPercent equals Math.round((fileFields / totalFields) * 100) for each file', async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.array(fc.nat({ max: 500 }), { minLength: 1, maxLength: 10 }),
				async (fieldCounts) => {
					const total = fieldCounts.reduce((sum, n) => sum + n, 0);
					mockReportDetail(fieldCounts.map((n) => makeBackendFile(n)));
					const result = await apiCleaningService.getReportDetail('RPT-001');
					result.files.forEach((file, i) => {
						const expected = total === 0 ? 0 : Math.round((fieldCounts[i] / total) * 100);
						expect(file.barWidthPercent).toBe(expected);
					});
				}
			),
			{ numRuns: 100 }
		);
	});

	it('sum of barWidthPercents differs from 100 by at most N (rounding error bound) when total > 0', async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.array(fc.nat({ max: 500 }), { minLength: 1, maxLength: 10 }).filter((arr) =>
					arr.some((n) => n > 0)
				),
				async (fieldCounts) => {
					mockReportDetail(fieldCounts.map((n) => makeBackendFile(n)));
					const result = await apiCleaningService.getReportDetail('RPT-001');
					const widthSum = result.files.reduce((sum, f) => sum + f.barWidthPercent, 0);
					expect(Math.abs(widthSum - 100)).toBeLessThanOrEqual(fieldCounts.length);
				}
			),
			{ numRuns: 100 }
		);
	});
});

// ─── Property 13: mapMetadataDetail complete field mapping ─────────────────────
// Design doc: "Generate random BackendMetadataDetail objects with various field
// combinations and verify mapMetadataDetail() preserves all fields"
// Tests the full 5-array mapping including Bug 8 additions (id3Fields, mp4AtomFields).

describe('Feature: api-integration, Property 13: mapMetadataDetail complete field mapping', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const fieldArb = fc.array(
		fc.record({
			label: fc.string({ minLength: 1, maxLength: 30 }),
			value: fc.string({ minLength: 0, maxLength: 50 })
		}),
		{ maxLength: 6 }
	);

	function mockWithMetadata(metadata: Record<string, unknown> | null): void {
		const fieldsRemoved = typeof metadata?.totalRemoved === 'number' ? metadata.totalRemoved : 0;
		vi.mocked(api.getReportDetail).mockResolvedValueOnce({
			reportId: 'RPT-META-PROP',
			date: '2025-01-15',
			filesProcessed: 1,
			fieldsRemoved,
			gpsLocationsRemoved: 0,
			totalTimeSeconds: 1,
			chartData: [],
			files: [
				{
					name: 'file.mp4',
					extension: '.mp4',
					sizeMB: '5.0',
					format: 'mp4',
					device: '',
					type: 'video',
					hasGps: false,
					fieldsRemoved,
					metadata
				}
			]
		} as never);
	}

	it('all 5 field arrays (gps/exif/xmp/id3/mp4Atoms) preserve their lengths for any random combination', async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.record({
					gpsFields: fieldArb,
					exifFields: fieldArb,
					xmpFields: fieldArb,
					id3Fields: fieldArb,
					mp4Atoms: fieldArb,
					totalRemoved: fc.nat({ max: 200 })
				}),
				async ({ gpsFields, exifFields, xmpFields, id3Fields, mp4Atoms, totalRemoved }) => {
					mockWithMetadata({ gpsFields, exifFields, xmpFields, id3Fields, mp4Atoms, totalRemoved });

					const result = await apiCleaningService.getReportDetail('RPT-META-PROP');
					const meta = result.files[0].metadata as unknown as Record<string, unknown>;

					expect((meta['gpsFields'] as unknown[]).length).toBe(gpsFields.length);
					expect((meta['exifFields'] as unknown[]).length).toBe(exifFields.length);
					expect((meta['xmpFields'] as unknown[]).length).toBe(xmpFields.length);
					expect((meta['id3Fields'] as unknown[]).length).toBe(id3Fields.length);
					expect((meta['mp4AtomFields'] as unknown[]).length).toBe(mp4Atoms.length);
					expect(meta['totalRemoved']).toBe(totalRemoved);
				}
			),
			{ numRuns: 80 }
		);
	});

	it('each field label and value pass through unchanged for all 5 field types', async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.record({
					gpsLabel: fc.string({ minLength: 1, maxLength: 20 }),
					gpsValue: fc.string({ minLength: 0, maxLength: 30 }),
					exifLabel: fc.string({ minLength: 1, maxLength: 20 }),
					exifValue: fc.string({ minLength: 0, maxLength: 30 }),
					xmpLabel: fc.string({ minLength: 1, maxLength: 20 }),
					xmpValue: fc.string({ minLength: 0, maxLength: 30 }),
					id3Label: fc.string({ minLength: 1, maxLength: 20 }),
					id3Value: fc.string({ minLength: 0, maxLength: 30 }),
					mp4Label: fc.string({ minLength: 1, maxLength: 20 }),
					mp4Value: fc.string({ minLength: 0, maxLength: 30 })
				}),
				async ({
					gpsLabel,
					gpsValue,
					exifLabel,
					exifValue,
					xmpLabel,
					xmpValue,
					id3Label,
					id3Value,
					mp4Label,
					mp4Value
				}) => {
					mockWithMetadata({
						gpsFields: [{ label: gpsLabel, value: gpsValue }],
						exifFields: [{ label: exifLabel, value: exifValue }],
						xmpFields: [{ label: xmpLabel, value: xmpValue }],
						id3Fields: [{ label: id3Label, value: id3Value }],
						mp4Atoms: [{ label: mp4Label, value: mp4Value }],
						totalRemoved: 5
					});

					const result = await apiCleaningService.getReportDetail('RPT-META-PROP');
					const meta = result.files[0].metadata as unknown as Record<string, unknown>;
					type Field = { label: string; value: string };

					expect((meta['gpsFields'] as Field[])[0]).toMatchObject({ label: gpsLabel, value: gpsValue });
					expect((meta['exifFields'] as Field[])[0]).toMatchObject({
						label: exifLabel,
						value: exifValue
					});
					expect((meta['xmpFields'] as Field[])[0]).toMatchObject({ label: xmpLabel, value: xmpValue });
					expect((meta['id3Fields'] as Field[])[0]).toMatchObject({ label: id3Label, value: id3Value });
					expect((meta['mp4AtomFields'] as Field[])[0]).toMatchObject({
						label: mp4Label,
						value: mp4Value
					});
				}
			),
			{ numRuns: 50 }
		);
	});

	it('absent id3Fields and mp4Atoms in backend response default to empty arrays', async () => {
		mockWithMetadata({
			gpsFields: [{ label: 'Lat', value: '50.0' }],
			exifFields: [],
			xmpFields: [],
			totalRemoved: 1
		});

		const result = await apiCleaningService.getReportDetail('RPT-META-PROP');
		const meta = result.files[0].metadata as unknown as Record<string, unknown>;

		expect(meta['id3Fields']).toEqual([]);
		expect(meta['mp4AtomFields']).toEqual([]);
		expect((meta['gpsFields'] as unknown[]).length).toBe(1);
	});

	it('null metadata produces all-empty arrays and totalRemoved=0', async () => {
		mockWithMetadata(null);

		const result = await apiCleaningService.getReportDetail('RPT-META-PROP');
		const meta = result.files[0].metadata as unknown as Record<string, unknown>;

		expect(meta['gpsFields']).toEqual([]);
		expect(meta['exifFields']).toEqual([]);
		expect(meta['xmpFields']).toEqual([]);
		expect(meta['id3Fields']).toEqual([]);
		expect(meta['mp4AtomFields']).toEqual([]);
		expect(meta['totalRemoved']).toBe(0);
	});
});
