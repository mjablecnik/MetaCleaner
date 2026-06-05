import { describe, it, expect } from 'vitest';
import { detectFormat } from '../parsers/formatDetector.js';
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from '../constants.js';

function makeFile(name: string): File {
	return new File([new Uint8Array([1, 2, 3])], name);
}

describe('formatDetector — supported image extensions', () => {
	const cases: Array<[string, string]> = [
		['photo.jpg', 'jpeg'],
		['photo.jpeg', 'jpeg'],
		['image.png', 'png'],
		['photo.heic', 'heic'],
		['photo.heif', 'heif'],
		['photo.avif', 'avif'],
		['scan.tiff', 'tiff'],
		['scan.tif', 'tiff'],
		['raw.dng', 'dng'],
		['image.webp', 'webp'],
		['anim.gif', 'gif']
	];

	for (const [name, expectedFormat] of cases) {
		it(`detects ${name} as image/${expectedFormat}`, () => {
			const result = detectFormat(makeFile(name));
			expect(result).not.toBeNull();
			expect(result!.type).toBe('image');
			expect(result!.format).toBe(expectedFormat);
		});
	}
});

describe('formatDetector — supported video extensions', () => {
	const cases: Array<[string, string]> = [
		['video.mp4', 'mp4'],
		['video.m4v', 'mp4'],
		['video.mov', 'mov'],
		['video.avi', 'avi'],
		['video.mkv', 'mkv'],
		['video.webm', 'webm'],
		['video.wmv', 'wmv'],
		['video.flv', 'flv'],
		['video.3gp', '3gp'],
		['video.mpg', 'mpeg'],
		['video.mpeg', 'mpeg'],
		['video.ogv', 'ogv'],
		['video.mts', 'mts'],
		['video.m2ts', 'mts']
	];

	for (const [name, expectedFormat] of cases) {
		it(`detects ${name} as video/${expectedFormat}`, () => {
			const result = detectFormat(makeFile(name));
			expect(result).not.toBeNull();
			expect(result!.type).toBe('video');
			expect(result!.format).toBe(expectedFormat);
		});
	}
});

describe('formatDetector — uppercase extensions', () => {
	it('detects .JPG as image/jpeg (case-insensitive)', () => {
		expect(detectFormat(makeFile('photo.JPG'))).toEqual({ type: 'image', format: 'jpeg' });
	});

	it('detects .PNG as image/png (case-insensitive)', () => {
		expect(detectFormat(makeFile('image.PNG'))).toEqual({ type: 'image', format: 'png' });
	});

	it('detects .MP4 as video/mp4 (case-insensitive)', () => {
		expect(detectFormat(makeFile('video.MP4'))).toEqual({ type: 'video', format: 'mp4' });
	});

	it('detects .HEIC as image/heic (case-insensitive)', () => {
		expect(detectFormat(makeFile('photo.HEIC'))).toEqual({ type: 'image', format: 'heic' });
	});

	it('detects mixed case .MkV as video/mkv (case-insensitive)', () => {
		expect(detectFormat(makeFile('video.MkV'))).toEqual({ type: 'video', format: 'mkv' });
	});
});

describe('formatDetector — double extensions', () => {
	it('uses the last extension for photo.jpg.bak → null (unsupported)', () => {
		expect(detectFormat(makeFile('photo.jpg.bak'))).toBeNull();
	});

	it('uses the last extension for archive.tar.gz → null (unsupported)', () => {
		expect(detectFormat(makeFile('archive.tar.gz'))).toBeNull();
	});

	it('uses last extension for backup.backup.jpg → jpeg', () => {
		expect(detectFormat(makeFile('backup.backup.jpg'))).toEqual({ type: 'image', format: 'jpeg' });
	});
});

describe('formatDetector — no extension or dot-only', () => {
	it('returns null for a file with no extension', () => {
		expect(detectFormat(makeFile('noextension'))).toBeNull();
	});

	it('returns null for a dot-only filename', () => {
		expect(detectFormat(makeFile('.'))).toBeNull();
	});

	it('returns null for a filename starting with a dot and no other dot', () => {
		expect(detectFormat(makeFile('.hidden'))).toBeNull();
	});

	it('returns null for an empty filename', () => {
		expect(detectFormat(makeFile(''))).toBeNull();
	});
});

describe('formatDetector — unsupported extensions', () => {
	const unsupported = ['.pdf', '.doc', '.docx', '.txt', '.zip', '.exe', '.html', '.json'];

	for (const ext of unsupported) {
		it(`returns null for ${ext}`, () => {
			expect(detectFormat(makeFile(`file${ext}`))).toBeNull();
		});
	}
});

describe('formatDetector — constants coverage', () => {
	it('IMAGE_EXTENSIONS has entries for all tested formats', () => {
		expect(Object.keys(IMAGE_EXTENSIONS).length).toBeGreaterThan(0);
		expect(IMAGE_EXTENSIONS['.jpg']).toBe('jpeg');
		expect(IMAGE_EXTENSIONS['.gif']).toBe('gif');
	});

	it('VIDEO_EXTENSIONS has entries for all tested formats', () => {
		expect(Object.keys(VIDEO_EXTENSIONS).length).toBeGreaterThan(0);
		expect(VIDEO_EXTENSIONS['.mp4']).toBe('mp4');
		expect(VIDEO_EXTENSIONS['.m2ts']).toBe('mts');
	});
});
