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
