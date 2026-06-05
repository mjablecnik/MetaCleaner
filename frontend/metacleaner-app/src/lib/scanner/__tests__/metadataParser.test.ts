import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { parseFile } from '../metadataParser.js';
import { FILE_SIZE_THRESHOLD, MAX_IMAGE_HEADER_BYTES, MAX_VIDEO_HEADER_BYTES } from '../constants.js';

const UNSUPPORTED_EXTENSIONS = [
	'.pdf', '.doc', '.docx', '.txt', '.zip', '.rar', '.exe', '.bin',
	'.csv', '.json', '.xml', '.html', '.css', '.js', '.ts'
];

const SUPPORTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.avif', '.tiff', '.dng'];
const SUPPORTED_VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];

function makeFakeFile(name: string, data: Uint8Array): File {
	return new File([data.buffer as ArrayBuffer], name);
}

// Property 6: Unsupported file formats yield empty scan results
describe('Feature: client-side-risk-scanner, Property 6: unsupported file formats yield empty scan results', () => {
	it('files with unsupported extensions return done status with 0 fields', async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.constantFrom(...UNSUPPORTED_EXTENSIONS),
				fc.uint8Array({ maxLength: 100 }),
				async (ext, bytes) => {
					const file = makeFakeFile(`testfile${ext}`, bytes);
					const result = await parseFile(file, 'test-id');
					expect(result.status).toBe('done');
					expect(result.fields).toHaveLength(0);
					expect(result.fieldCount).toBe(0);
					expect(result.fileScore).toBe(0);
				}
			),
			{ numRuns: 50 }
		);
	});

	it('file with no extension returns empty result', async () => {
		const file = makeFakeFile('noextension', new Uint8Array([1, 2, 3]));
		const result = await parseFile(file, 'test-id');
		expect(result.status).toBe('done');
		expect(result.fieldCount).toBe(0);
	});
});

// Property 7: Corrupted files never crash the parser
describe('Feature: client-side-risk-scanner, Property 7: corrupted files never crash the parser', () => {
	it('random bytes in image files return valid or error ScanResult without throwing', async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.constantFrom(...SUPPORTED_IMAGE_EXTENSIONS),
				fc.uint8Array({ minLength: 1, maxLength: 256 }),
				async (ext, bytes) => {
					const file = makeFakeFile(`corrupt${ext}`, bytes);
					// Must not throw
					const result = await parseFile(file, 'test-id');
					// Must return either 'done' or 'error', never undefined
					expect(['done', 'error']).toContain(result.status);
					expect(result.fileId).toBe('test-id');
					expect(typeof result.fileScore).toBe('number');
					expect(result.fileScore).toBeGreaterThanOrEqual(0);
					expect(result.fileScore).toBeLessThanOrEqual(100);
				}
			),
			{ numRuns: 50 }
		);
	});

	it('empty file bytes return valid or error ScanResult without throwing', async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.constantFrom(...SUPPORTED_IMAGE_EXTENSIONS),
				async (ext) => {
					const file = makeFakeFile(`empty${ext}`, new Uint8Array(0));
					const result = await parseFile(file, 'test-id');
					expect(['done', 'error']).toContain(result.status);
				}
			),
			{ numRuns: 20 }
		);
	});
});

// Property 8: Large files read only header segments
describe('Feature: client-side-risk-scanner, Property 8: large files read only header segments', () => {
	it('image files larger than 200MB use file.slice for the first 512KB', async () => {
		const sliceSpy = vi.fn().mockReturnValue(new Blob([new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0])]));
		const mockLargeJpeg = {
			name: 'large-photo.jpg',
			size: FILE_SIZE_THRESHOLD + 1,
			type: 'image/jpeg',
			slice: sliceSpy
		} as unknown as File;

		await parseFile(mockLargeJpeg, 'large-id');
		expect(sliceSpy).toHaveBeenCalledWith(0, MAX_IMAGE_HEADER_BYTES);
	});

	it('video files larger than 200MB use file.slice for the first 2MB', async () => {
		const sliceSpy = vi.fn().mockReturnValue(
			new Blob([new Uint8Array([0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70])])
		);
		const mockLargeMp4 = {
			name: 'large-video.mp4',
			size: FILE_SIZE_THRESHOLD + 1,
			type: 'video/mp4',
			slice: sliceSpy
		} as unknown as File;

		// parseFile will try to load mediainfo.js WASM — may fail in test env, but slice must be called
		await parseFile(mockLargeMp4, 'large-video-id');
		expect(sliceSpy).toHaveBeenCalledWith(0, MAX_VIDEO_HEADER_BYTES);
	});
});
