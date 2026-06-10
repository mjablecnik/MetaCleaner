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

	it('iconColor is green for type=image and orange for type=video for any other fields', async () => {
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
						expect(report.iconColor).toBe('green');
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
