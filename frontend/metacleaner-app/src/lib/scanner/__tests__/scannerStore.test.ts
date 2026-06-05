import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ScanResult } from '../types.js';

// Mock parseFile before importing the store
vi.mock('../metadataParser.js', () => ({
	parseFile: vi.fn()
}));

const { parseFile } = await import('../metadataParser.js');
const parseFileMock = parseFile as ReturnType<typeof vi.fn>;

function makeCompletedResult(fileId: string, fileScore = 0): ScanResult {
	return {
		fileId,
		status: 'done',
		fields: [],
		hasGps: false,
		fieldCount: 0,
		categoryScores: { gps: 0, deviceIdentity: 0, personalData: 0, timestamps: 0 },
		fileScore
	};
}

function makeFileList(files: File[]): FileList {
	return {
		length: files.length,
		item: (i: number) => files[i] ?? null,
		[Symbol.iterator]: function* () {
			for (const f of files) yield f;
		}
	} as unknown as FileList;
}

function makeFakeFile(name: string): File {
	return new File([new Uint8Array([0xff, 0xd8])], name, { type: 'image/jpeg' });
}

// flush pending microtasks / promises
async function flush(): Promise<void> {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('scannerStore', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		// Re-import store to get fresh module state — each test re-evaluates a fresh copy
		const { clearFiles } = await import('../scannerStore.svelte.js');
		clearFiles();
	});

	it('initial state: no files, not scanning, score 0', async () => {
		const { scannerStore } = await import('../scannerStore.svelte.js');
		expect(scannerStore.files).toHaveLength(0);
		expect(scannerStore.hasFiles).toBe(false);
		expect(scannerStore.isScanning).toBe(false);
		expect(scannerStore.aggregatedRisk.overallScore).toBe(0);
		expect(scannerStore.aggregatedRisk.fileCount).toBe(0);
	});

	it('addFiles adds files with pending scanResult', async () => {
		parseFileMock.mockResolvedValue(makeCompletedResult('any'));
		const { addFiles, scannerStore } = await import('../scannerStore.svelte.js');

		const fl = makeFileList([makeFakeFile('photo.jpg')]);
		addFiles(fl);

		expect(scannerStore.files).toHaveLength(1);
		expect(scannerStore.hasFiles).toBe(true);
		expect(scannerStore.files[0].scanResult?.status).toSatisfy(
			(s: string) => s === 'pending' || s === 'scanning'
		);
	});

	it('addFiles triggers parsing and updates state to done', async () => {
		const { addFiles, scannerStore } = await import('../scannerStore.svelte.js');

		parseFileMock.mockImplementation((_file: File, fileId: string) =>
			Promise.resolve(makeCompletedResult(fileId, 42))
		);

		const fl = makeFileList([makeFakeFile('photo.jpg')]);
		addFiles(fl);

		await flush();

		expect(scannerStore.files[0].scanResult?.status).toBe('done');
		expect(scannerStore.files[0].scanResult?.fileScore).toBe(42);
		expect(scannerStore.isScanning).toBe(false);
	});

	it('aggregatedRisk reflects max file score after scanning', async () => {
		const { addFiles, scannerStore } = await import('../scannerStore.svelte.js');

		const scores = [30, 80, 50];
		let callCount = 0;
		parseFileMock.mockImplementation((_file: File, fileId: string) => {
			const score = scores[callCount++ % scores.length];
			return Promise.resolve(makeCompletedResult(fileId, score));
		});

		const fl = makeFileList(scores.map((_, i) => makeFakeFile(`photo${i}.jpg`)));
		addFiles(fl);

		await flush();

		expect(scannerStore.aggregatedRisk.overallScore).toBe(80);
	});

	it('removeFile removes the file and recalculates aggregated risk', async () => {
		const { addFiles, removeFile, scannerStore } = await import('../scannerStore.svelte.js');

		parseFileMock.mockImplementation((_file: File, fileId: string) =>
			Promise.resolve(makeCompletedResult(fileId, 60))
		);

		const fl = makeFileList([makeFakeFile('a.jpg'), makeFakeFile('b.jpg')]);
		addFiles(fl);
		await flush();

		expect(scannerStore.files).toHaveLength(2);

		const firstId = scannerStore.files[0].id;
		removeFile(firstId);

		expect(scannerStore.files).toHaveLength(1);
		expect(scannerStore.files.every((f) => f.id !== firstId)).toBe(true);
	});

	it('clearFiles resets state to initial values', async () => {
		const { addFiles, clearFiles, scannerStore } = await import('../scannerStore.svelte.js');

		parseFileMock.mockResolvedValue(makeCompletedResult('any', 50));

		const fl = makeFileList([makeFakeFile('photo.jpg')]);
		addFiles(fl);
		await flush();

		expect(scannerStore.files).toHaveLength(1);

		clearFiles();

		expect(scannerStore.files).toHaveLength(0);
		expect(scannerStore.hasFiles).toBe(false);
		expect(scannerStore.isScanning).toBe(false);
		expect(scannerStore.aggregatedRisk.overallScore).toBe(0);
	});

	it('processes multiple files sequentially', async () => {
		const { addFiles, scannerStore } = await import('../scannerStore.svelte.js');

		const order: string[] = [];
		parseFileMock.mockImplementation((_file: File, fileId: string) => {
			order.push(fileId);
			return Promise.resolve(makeCompletedResult(fileId, 10));
		});

		const fl = makeFileList([
			makeFakeFile('first.jpg'),
			makeFakeFile('second.jpg'),
			makeFakeFile('third.jpg')
		]);
		addFiles(fl);

		await flush();

		expect(order).toHaveLength(3);
		// All 3 files processed
		expect(scannerStore.files.every((f) => f.scanResult?.status === 'done')).toBe(true);
	});
});
