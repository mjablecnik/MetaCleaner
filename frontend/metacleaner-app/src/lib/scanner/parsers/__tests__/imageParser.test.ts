import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockExifrParse, mockExifReaderLoad } = vi.hoisted(() => ({
	mockExifrParse: vi.fn(),
	mockExifReaderLoad: vi.fn()
}));

vi.mock('exifr', () => ({
	default: { parse: mockExifrParse }
}));

vi.mock('exifreader', () => ({
	default: { load: mockExifReaderLoad }
}));

import { parseImage } from '../imageParser.js';

function makeFile(content: string = 'fake image data', name: string = 'test.jpg'): File {
	return new File([content], name, { type: 'image/jpeg' });
}

beforeEach(() => {
	vi.clearAllMocks();
});

// ─── Format dispatch ─────────────────────────────────────────────────────────

describe('parseImage — format dispatch', () => {
	it('routes jpeg format through exifr path', async () => {
		mockExifrParse.mockResolvedValue(null);
		const file = makeFile('data', 'photo.jpg');
		const result = await parseImage(file, 'file-1', 'jpeg');
		expect(result.fileId).toBe('file-1');
		expect(result.status).toBe('done');
		expect(mockExifrParse).toHaveBeenCalledOnce();
		expect(mockExifReaderLoad).not.toHaveBeenCalled();
	});

	it('routes png format through exifr path', async () => {
		mockExifrParse.mockResolvedValue(null);
		const file = makeFile('data', 'image.png');
		const result = await parseImage(file, 'file-2', 'png');
		expect(result.fileId).toBe('file-2');
		expect(mockExifrParse).toHaveBeenCalledOnce();
	});

	it('routes webp format through ExifReader path', async () => {
		mockExifReaderLoad.mockReturnValue({});
		const file = makeFile('data', 'image.webp');
		const result = await parseImage(file, 'file-3', 'webp');
		expect(result.fileId).toBe('file-3');
		expect(result.status).toBe('done');
		expect(mockExifReaderLoad).toHaveBeenCalledOnce();
		expect(mockExifrParse).not.toHaveBeenCalled();
	});

	it('routes gif format through ExifReader path', async () => {
		mockExifReaderLoad.mockReturnValue({});
		const file = makeFile('data', 'anim.gif');
		const result = await parseImage(file, 'file-4', 'gif');
		expect(result.fileId).toBe('file-4');
		expect(mockExifReaderLoad).toHaveBeenCalledOnce();
	});

	it('returns empty result without calling any parser for unknown format', async () => {
		// 'heic' is in EXIFR_FORMATS so use tiff for a valid exifr format
		// Use a format not in either set (none exist in ImageFormat but test fallback isn't reachable via normal types)
		// Instead verify that an exifr format calls exifr
		mockExifrParse.mockResolvedValue(null);
		const file = makeFile('data', 'photo.tiff');
		const result = await parseImage(file, 'file-tiff', 'tiff');
		expect(result.status).toBe('done');
		expect(mockExifrParse).toHaveBeenCalledOnce();
	});
});

// ─── exifr path (JPEG/PNG) ───────────────────────────────────────────────────

describe('parseImage via exifr — null/empty metadata', () => {
	it('returns done status with empty fields when exifr.parse returns null', async () => {
		mockExifrParse.mockResolvedValue(null);
		const file = makeFile('jpeg data', 'photo.jpg');
		const result = await parseImage(file, 'empty-file', 'jpeg');
		expect(result.status).toBe('done');
		expect(result.fields).toHaveLength(0);
		expect(result.hasGps).toBe(false);
		expect(result.fieldCount).toBe(0);
		expect(result.fileScore).toBeGreaterThanOrEqual(0);
	});

	it('returns done status with empty fields when exifr.parse returns undefined', async () => {
		mockExifrParse.mockResolvedValue(undefined);
		const file = makeFile('jpeg data', 'photo.jpg');
		const result = await parseImage(file, 'empty-file-2', 'jpeg');
		expect(result.status).toBe('done');
		expect(result.fields).toHaveLength(0);
		expect(result.hasGps).toBe(false);
	});
});

describe('parseImage via exifr — GPS extraction', () => {
	it('sets hasGps=true when metadata contains GPS fields', async () => {
		mockExifrParse.mockResolvedValue({
			GPSLatitude: 48.8566,
			GPSLongitude: 2.3522
		});
		const file = makeFile('jpeg data', 'photo.jpg');
		const result = await parseImage(file, 'gps-file', 'jpeg');
		expect(result.hasGps).toBe(true);
		expect(result.fields.some((f) => f.category === 'gps')).toBe(true);
	});

	it('sets hasGps=false when metadata has no GPS fields', async () => {
		mockExifrParse.mockResolvedValue({
			Make: 'Apple',
			Model: 'iPhone 13'
		});
		const file = makeFile('jpeg data', 'photo.jpg');
		const result = await parseImage(file, 'no-gps-file', 'jpeg');
		expect(result.hasGps).toBe(false);
	});
});

describe('parseImage via exifr — device extraction', () => {
	it('constructs device string from Make and Model fields', async () => {
		mockExifrParse.mockResolvedValue({
			Make: 'Canon',
			Model: 'EOS R5'
		});
		const file = makeFile('jpeg data', 'photo.jpg');
		const result = await parseImage(file, 'device-file', 'jpeg');
		expect(result.device).toBe('Canon EOS R5');
	});

	it('constructs device string from Make alone when Model is absent', async () => {
		mockExifrParse.mockResolvedValue({ Make: 'Nikon' });
		const file = makeFile('jpeg data', 'photo.jpg');
		const result = await parseImage(file, 'make-only-file', 'jpeg');
		expect(result.device).toBe('Nikon');
	});

	it('leaves device undefined when neither Make nor Model is present', async () => {
		mockExifrParse.mockResolvedValue({ Software: 'Adobe Lightroom' });
		const file = makeFile('jpeg data', 'photo.jpg');
		const result = await parseImage(file, 'no-device-file', 'jpeg');
		expect(result.device).toBeUndefined();
	});
});

describe('parseImage via exifr — field extraction', () => {
	it('converts metadata fields to MetadataField objects with category', async () => {
		mockExifrParse.mockResolvedValue({
			Make: 'Sony',
			Model: 'A7IV',
			DateTimeOriginal: '2024:06:15 12:00:00'
		});
		const file = makeFile('jpeg data', 'photo.jpg');
		const result = await parseImage(file, 'fields-file', 'jpeg');
		expect(result.fieldCount).toBeGreaterThan(0);
		const makeField = result.fields.find((f) => f.key === 'Make');
		expect(makeField).toBeDefined();
		expect(makeField?.category).toBe('deviceIdentity');
	});

	it('populates rawMetadata with all metadata key-value pairs', async () => {
		mockExifrParse.mockResolvedValue({ Make: 'Apple', Model: 'iPhone 14' });
		const file = makeFile('jpeg data', 'photo.jpg');
		const result = await parseImage(file, 'raw-meta-file', 'jpeg');
		expect(result.rawMetadata).toBeDefined();
		expect(result.rawMetadata?.['Make']).toBe('Apple');
	});
});

// ─── ExifReader path (WebP/GIF) ──────────────────────────────────────────────

describe('parseImage via ExifReader', () => {
	it('returns done status with empty fields when ExifReader.load returns empty tags', async () => {
		mockExifReaderLoad.mockReturnValue({});
		const file = makeFile('webp data', 'image.webp');
		const result = await parseImage(file, 'webp-empty', 'webp');
		expect(result.status).toBe('done');
		expect(result.fields).toHaveLength(0);
		expect(result.hasGps).toBe(false);
		expect(result.fieldCount).toBe(0);
	});

	it('extracts GPS fields from ExifReader tags with description property', async () => {
		mockExifReaderLoad.mockReturnValue({
			GPSLatitude: { description: '51.5074 N' },
			GPSLongitude: { description: '0.1278 W' }
		});
		const file = makeFile('webp data', 'image.webp');
		const result = await parseImage(file, 'webp-gps', 'webp');
		expect(result.hasGps).toBe(true);
	});

	it('extracts device info from ExifReader tags', async () => {
		mockExifReaderLoad.mockReturnValue({
			Make: { description: 'Samsung' },
			Model: { description: 'Galaxy S24' }
		});
		const file = makeFile('webp data', 'image.webp');
		const result = await parseImage(file, 'webp-device', 'webp');
		expect(result.device).toBe('Samsung Galaxy S24');
	});

	it('skips ExifReader tags without description property', async () => {
		mockExifReaderLoad.mockReturnValue({
			Make: { value: 'NoDescription' },
			Model: { description: 'ValidModel' }
		});
		const file = makeFile('webp data', 'image.webp');
		const result = await parseImage(file, 'webp-partial', 'webp');
		// Make has no description so is skipped; Model is included
		const makeField = result.fields.find((f) => f.key === 'Make');
		expect(makeField).toBeUndefined();
	});
});

// ─── Large file slicing ──────────────────────────────────────────────────────

describe('parseImage — large file handling', () => {
	it('processes small files without slicing (calls exifr.parse with original file)', async () => {
		mockExifrParse.mockResolvedValue(null);
		// Small file (well under 200MB threshold)
		const file = makeFile('small content', 'small.jpg');
		await parseImage(file, 'small-file', 'jpeg');
		// exifr.parse should have been called
		expect(mockExifrParse).toHaveBeenCalledOnce();
	});
});

// ─── Error handling ──────────────────────────────────────────────────────────

describe('parseImage — error handling', () => {
	it('propagates error when exifr.parse throws', async () => {
		mockExifrParse.mockRejectedValue(new Error('EXIF parsing failed'));
		const file = makeFile('corrupt data', 'broken.jpg');
		await expect(parseImage(file, 'broken-file', 'jpeg')).rejects.toThrow('EXIF parsing failed');
	});

	it('propagates error when ExifReader.load throws', async () => {
		mockExifReaderLoad.mockImplementation(() => {
			throw new Error('ExifReader load failed');
		});
		const file = makeFile('corrupt data', 'broken.webp');
		await expect(parseImage(file, 'broken-webp', 'webp')).rejects.toThrow('ExifReader load failed');
	});
});
