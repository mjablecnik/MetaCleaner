import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { MetadataField, ScanResult } from '../types.js';

// Mock the underlying parsers — NOT parseFile — so the full pipeline runs:
// addFiles → detectFormat → parseFile orchestration → parseImage/parseVideo (mocked) → computeAggregatedRisk
vi.mock('../parsers/imageParser.js', () => ({
	parseImage: vi.fn()
}));
vi.mock('../parsers/videoParser.js', () => ({
	parseVideo: vi.fn()
}));

const { parseImage } = await import('../parsers/imageParser.js');
const { parseVideo } = await import('../parsers/videoParser.js');
const parseImageMock = parseImage as ReturnType<typeof vi.fn>;
const parseVideoMock = parseVideo as ReturnType<typeof vi.fn>;

function makeScanResult(fileId: string, fileScore = 0, fields: MetadataField[] = []): ScanResult {
	return {
		fileId,
		status: 'done',
		fields,
		hasGps: fields.some((f) => f.category === 'gps'),
		fieldCount: fields.length,
		categoryScores: { gps: 0, deviceIdentity: 0, personalData: 0, timestamps: 0, aiOrigin: 0 },
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
	return new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], name);
}

async function flush(): Promise<void> {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('Integration: scan pipeline', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		const { clearFiles } = await import('../scannerStore.svelte.js');
		clearFiles();
	});

	// Task 8.3: Test file upload → parse → score update flow
	describe('file upload → parse → score update flow', () => {
		it('uploading a JPEG triggers image parser and updates aggregated risk score', async () => {
			parseImageMock.mockImplementation((_file: File, fileId: string) =>
				Promise.resolve(makeScanResult(fileId, 75))
			);

			const { addFiles, scannerStore } = await import('../scannerStore.svelte.js');
			addFiles(makeFileList([makeFakeFile('photo.jpg')]));

			expect(scannerStore.files).toHaveLength(1);
			expect(scannerStore.hasFiles).toBe(true);

			await flush();

			expect(parseImageMock).toHaveBeenCalledOnce();
			expect(parseVideoMock).not.toHaveBeenCalled();
			expect(scannerStore.files[0].scanResult?.status).toBe('done');
			expect(scannerStore.files[0].scanResult?.fileScore).toBe(75);
			expect(scannerStore.aggregatedRisk.overallScore).toBe(75);
			expect(scannerStore.aggregatedRisk.severity).toBe('critical');
		});

		it('uploading a video file routes to video parser and updates score', async () => {
			parseVideoMock.mockImplementation((_file: File, fileId: string) =>
				Promise.resolve(makeScanResult(fileId, 40))
			);

			const { addFiles, scannerStore } = await import('../scannerStore.svelte.js');
			addFiles(makeFileList([makeFakeFile('clip.mp4')]));

			await flush();

			expect(parseVideoMock).toHaveBeenCalledOnce();
			expect(parseImageMock).not.toHaveBeenCalled();
			expect(scannerStore.files[0].scanResult?.status).toBe('done');
			expect(scannerStore.aggregatedRisk.overallScore).toBe(40);
			expect(scannerStore.aggregatedRisk.severity).toBe('medium');
		});

		it('unsupported file format bypasses parsers and yields score 0', async () => {
			const { addFiles, scannerStore } = await import('../scannerStore.svelte.js');
			addFiles(makeFileList([makeFakeFile('document.pdf')]));

			await flush();

			expect(parseImageMock).not.toHaveBeenCalled();
			expect(parseVideoMock).not.toHaveBeenCalled();
			expect(scannerStore.files[0].scanResult?.status).toBe('done');
			expect(scannerStore.files[0].scanResult?.fileScore).toBe(0);
			expect(scannerStore.aggregatedRisk.overallScore).toBe(0);
		});

		it('parser throwing an error produces error ScanResult without crashing the pipeline', async () => {
			parseImageMock.mockRejectedValue(new Error('Corrupted EXIF data'));

			const { addFiles, scannerStore } = await import('../scannerStore.svelte.js');
			addFiles(makeFileList([makeFakeFile('broken.jpg')]));

			await flush();

			expect(scannerStore.files[0].scanResult?.status).toBe('error');
			expect(scannerStore.files[0].scanResult?.fileScore).toBe(0);
			expect(scannerStore.aggregatedRisk.overallScore).toBe(0);
			expect(scannerStore.isScanning).toBe(false);
		});
	});

	// Task 8.3: Test batch upload processes all files incrementally
	describe('batch upload processes all files incrementally', () => {
		it('all files in a batch are processed and final score equals maximum', async () => {
			const scores = [20, 60, 45];
			let callCount = 0;
			parseImageMock.mockImplementation((_file: File, fileId: string) => {
				const score = scores[callCount++];
				return Promise.resolve(makeScanResult(fileId, score));
			});

			const { addFiles, scannerStore } = await import('../scannerStore.svelte.js');
			addFiles(makeFileList(scores.map((_, i) => makeFakeFile(`img${i}.jpg`))));

			await flush();

			expect(scannerStore.files).toHaveLength(3);
			expect(scannerStore.files.every((f) => f.scanResult?.status === 'done')).toBe(true);
			expect(scannerStore.aggregatedRisk.overallScore).toBe(60);
			expect(scannerStore.aggregatedRisk.fileCount).toBe(3);
			expect(scannerStore.aggregatedRisk.scannedCount).toBe(3);
		});

		it('batch with mixed image and video formats routes each file to the correct parser', async () => {
			parseImageMock.mockImplementation((_file: File, fileId: string) =>
				Promise.resolve(makeScanResult(fileId, 30))
			);
			parseVideoMock.mockImplementation((_file: File, fileId: string) =>
				Promise.resolve(makeScanResult(fileId, 55))
			);

			const { addFiles, scannerStore } = await import('../scannerStore.svelte.js');
			addFiles(
				makeFileList([
					makeFakeFile('photo.jpg'),
					makeFakeFile('clip.mp4'),
					makeFakeFile('photo2.png')
				])
			);

			await flush();

			expect(parseImageMock).toHaveBeenCalledTimes(2);
			expect(parseVideoMock).toHaveBeenCalledTimes(1);
			expect(scannerStore.aggregatedRisk.overallScore).toBe(55);
			expect(scannerStore.aggregatedRisk.fileCount).toBe(3);
		});

		it('batch with one error file still processes remaining files', async () => {
			let callCount = 0;
			parseImageMock.mockImplementation((_file: File, fileId: string) => {
				callCount++;
				if (callCount === 2) return Promise.reject(new Error('Parse error'));
				return Promise.resolve(makeScanResult(fileId, 50));
			});

			const { addFiles, scannerStore } = await import('../scannerStore.svelte.js');
			addFiles(
				makeFileList([makeFakeFile('ok1.jpg'), makeFakeFile('broken.jpg'), makeFakeFile('ok2.jpg')])
			);

			await flush();

			expect(scannerStore.files).toHaveLength(3);
			expect(scannerStore.isScanning).toBe(false);
			const statuses = scannerStore.files.map((f) => f.scanResult?.status);
			expect(statuses).toContain('done');
			expect(statuses).toContain('error');
			expect(scannerStore.aggregatedRisk.overallScore).toBe(50);
		});
	});

	// Task 8.3: Test remove file recalculates correctly
	describe('remove file recalculates correctly', () => {
		it('removing the highest-scoring file lowers the aggregated score', async () => {
			const scores = [80, 30];
			let callCount = 0;
			parseImageMock.mockImplementation((_file: File, fileId: string) =>
				Promise.resolve(makeScanResult(fileId, scores[callCount++]))
			);

			const { addFiles, removeFile, scannerStore } = await import('../scannerStore.svelte.js');
			addFiles(makeFileList([makeFakeFile('high.jpg'), makeFakeFile('low.jpg')]));
			await flush();

			expect(scannerStore.aggregatedRisk.overallScore).toBe(80);

			removeFile(scannerStore.files[0].id);

			expect(scannerStore.files).toHaveLength(1);
			expect(scannerStore.aggregatedRisk.overallScore).toBe(30);
			expect(scannerStore.aggregatedRisk.fileCount).toBe(1);
		});

		it('removing a non-max-scoring file leaves aggregated score unchanged', async () => {
			const scores = [80, 30];
			let callCount = 0;
			parseImageMock.mockImplementation((_file: File, fileId: string) =>
				Promise.resolve(makeScanResult(fileId, scores[callCount++]))
			);

			const { addFiles, removeFile, scannerStore } = await import('../scannerStore.svelte.js');
			addFiles(makeFileList([makeFakeFile('high.jpg'), makeFakeFile('low.jpg')]));
			await flush();

			removeFile(scannerStore.files[1].id);

			expect(scannerStore.files).toHaveLength(1);
			expect(scannerStore.aggregatedRisk.overallScore).toBe(80);
		});

		it('removing all files one by one resets aggregated score to 0', async () => {
			parseImageMock.mockImplementation((_file: File, fileId: string) =>
				Promise.resolve(makeScanResult(fileId, 50))
			);

			const { addFiles, removeFile, scannerStore } = await import('../scannerStore.svelte.js');
			addFiles(makeFileList([makeFakeFile('a.jpg'), makeFakeFile('b.jpg')]));
			await flush();

			const [idA, idB] = scannerStore.files.map((f) => f.id);
			removeFile(idA);
			removeFile(idB);

			expect(scannerStore.files).toHaveLength(0);
			expect(scannerStore.hasFiles).toBe(false);
			expect(scannerStore.aggregatedRisk.overallScore).toBe(0);
		});
	});

	// Task 8.3: Test clear files resets UI state
	describe('clear files resets UI state', () => {
		it('clearFiles after scanning resets score, file list, and scanning state', async () => {
			parseImageMock.mockImplementation((_file: File, fileId: string) =>
				Promise.resolve(makeScanResult(fileId, 90))
			);

			const { addFiles, clearFiles, scannerStore } = await import('../scannerStore.svelte.js');
			addFiles(makeFileList([makeFakeFile('photo.jpg')]));
			await flush();

			expect(scannerStore.files).toHaveLength(1);
			expect(scannerStore.aggregatedRisk.overallScore).toBe(90);

			clearFiles();

			expect(scannerStore.files).toHaveLength(0);
			expect(scannerStore.hasFiles).toBe(false);
			expect(scannerStore.isScanning).toBe(false);
			expect(scannerStore.aggregatedRisk.overallScore).toBe(0);
			expect(scannerStore.aggregatedRisk.fileCount).toBe(0);
		});

		it('clearFiles while a scan is in progress stops further processing', async () => {
			let resolveFirst!: (r: ScanResult) => void;
			const firstDone = new Promise<ScanResult>((res) => (resolveFirst = res));

			parseImageMock.mockImplementationOnce(() => firstDone);

			const { addFiles, clearFiles, scannerStore } = await import('../scannerStore.svelte.js');
			addFiles(makeFileList([makeFakeFile('slow.jpg')]));

			expect(scannerStore.isScanning).toBe(true);

			clearFiles();

			expect(scannerStore.files).toHaveLength(0);
			expect(scannerStore.aggregatedRisk.overallScore).toBe(0);

			// Resolve the in-flight scan — state should remain clear since clearFiles was called
			resolveFirst(makeScanResult('orphan', 99));
			await flush();

			expect(scannerStore.files).toHaveLength(0);
			expect(scannerStore.aggregatedRisk.overallScore).toBe(0);
		});
	});
});
