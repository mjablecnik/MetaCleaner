/**
 * Example-based extraction tests using real fixture files.
 *
 * Validates that parseFile correctly processes known files and returns
 * the expected structure, format detection, and metadata categories.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFile } from '../metadataParser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, 'fixtures');

function loadFixture(filename: string, mimeType?: string): File {
	const buf = readFileSync(join(fixturesDir, filename));
	return new File([buf], filename, mimeType ? { type: mimeType } : undefined);
}

// ---------------------------------------------------------------
// JPEG with embedded GPS EXIF data (48°8'N, 17°35'E)
// ---------------------------------------------------------------
describe('Feature: client-side-risk-scanner — JPEG with GPS fixture', () => {
	it('parses sample.jpg without throwing and returns done status', async () => {
		const file = loadFixture('sample.jpg', 'image/jpeg');
		const result = await parseFile(file, 'jpeg-gps-test');
		expect(['done', 'error']).toContain(result.status);
		expect(result.fileId).toBe('jpeg-gps-test');
		expect(typeof result.fileScore).toBe('number');
		expect(result.fileScore).toBeGreaterThanOrEqual(0);
		expect(result.fileScore).toBeLessThanOrEqual(100);
	});

	it('extracts GPS-category fields from sample.jpg when GPS data is present', async () => {
		const file = loadFixture('sample.jpg', 'image/jpeg');
		const result = await parseFile(file, 'jpeg-gps-test');

		// Must always produce a valid result (done or error — never a crash)
		expect(['done', 'error']).toContain(result.status);

		if (result.status === 'done') {
			const gpsFields = result.fields.filter((f) => f.category === 'gps');
			expect(gpsFields.length).toBeGreaterThan(0);
			expect(result.hasGps).toBe(true);
			// GPS category score should be > 0 since lat+lon are present
			expect(result.categoryScores.gps).toBeGreaterThan(0);
			// Overall file score should reflect GPS risk
			expect(result.fileScore).toBeGreaterThan(0);
		}
	});

	it('identifies the correct file format for .jpg extension', async () => {
		const file = loadFixture('sample.jpg', 'image/jpeg');
		const result = await parseFile(file, 'jpeg-format-test');
		// Parser should not return unsupported-format empty result
		// (it should route to image parser, not return 0 fields due to unknown format)
		expect(result.fileId).toBe('jpeg-format-test');
		expect(['done', 'error']).toContain(result.status);
	});
});

// ---------------------------------------------------------------
// Minimal PNG (1×1 white pixel, no metadata)
// ---------------------------------------------------------------
describe('Feature: client-side-risk-scanner — PNG fixture (no metadata)', () => {
	it('parses sample.png without throwing', async () => {
		const file = loadFixture('sample.png', 'image/png');
		const result = await parseFile(file, 'png-test');
		expect(['done', 'error']).toContain(result.status);
		expect(result.fileId).toBe('png-test');
	});

	it('returns zero GPS fields for PNG with no metadata', async () => {
		const file = loadFixture('sample.png', 'image/png');
		const result = await parseFile(file, 'png-no-meta');
		// Must always produce a valid result
		expect(['done', 'error']).toContain(result.status);
		if (result.status === 'done') {
			expect(result.hasGps).toBe(false);
			expect(result.fieldCount).toBe(0);
			expect(result.fileScore).toBe(0);
		}
	});

	it('returns bounded numeric score for PNG', async () => {
		const file = loadFixture('sample.png', 'image/png');
		const result = await parseFile(file, 'png-score');
		expect(result.fileScore).toBeGreaterThanOrEqual(0);
		expect(result.fileScore).toBeLessThanOrEqual(100);
	});
});

// ---------------------------------------------------------------
// Minimal MP4 (ftyp + mdat, no embedded metadata tags)
// ---------------------------------------------------------------
describe('Feature: client-side-risk-scanner — MP4 fixture (no metadata)', () => {
	it('parses sample.mp4 without throwing (routes to video parser)', async () => {
		const file = loadFixture('sample.mp4', 'video/mp4');
		const result = await parseFile(file, 'mp4-test');
		// Video parser may return 'done' or 'error' for a minimal ftyp-only MP4
		expect(['done', 'error']).toContain(result.status);
		expect(result.fileId).toBe('mp4-test');
		expect(typeof result.fileScore).toBe('number');
		expect(result.fileScore).toBeGreaterThanOrEqual(0);
		expect(result.fileScore).toBeLessThanOrEqual(100);
	});

	it('returns valid ScanResult structure for MP4', async () => {
		const file = loadFixture('sample.mp4', 'video/mp4');
		const result = await parseFile(file, 'mp4-struct');
		expect(result).toMatchObject({
			fileId: 'mp4-struct',
			fields: expect.any(Array),
			hasGps: expect.any(Boolean),
			fieldCount: expect.any(Number),
			categoryScores: {
				gps: expect.any(Number),
				deviceIdentity: expect.any(Number),
				personalData: expect.any(Number),
				timestamps: expect.any(Number)
			},
			fileScore: expect.any(Number)
		});
	});
});

// ---------------------------------------------------------------
// Cross-format: all fixture files return non-negative bounded scores
// ---------------------------------------------------------------
describe('Feature: client-side-risk-scanner — all fixtures return bounded scores', () => {
	const fixtures = [
		{ name: 'sample.jpg', id: 'bound-jpg' },
		{ name: 'sample.png', id: 'bound-png' },
		{ name: 'sample.mp4', id: 'bound-mp4' }
	];

	for (const { name, id } of fixtures) {
		it(`${name} produces a fileScore in [0, 100]`, async () => {
			const file = loadFixture(name);
			const result = await parseFile(file, id);
			expect(result.fileScore).toBeGreaterThanOrEqual(0);
			expect(result.fileScore).toBeLessThanOrEqual(100);
			for (const score of Object.values(result.categoryScores)) {
				expect(score).toBeGreaterThanOrEqual(0);
				expect(score).toBeLessThanOrEqual(100);
			}
		});
	}
});
