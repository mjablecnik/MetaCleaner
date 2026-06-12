import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { formatSize } from '../format';

describe('formatSize range correctness', () => {
	it('returns "0.0 KB" for zero', () => {
		expect(formatSize(0)).toBe('0.0 KB');
	});

	it('returns "0.0 KB" for negative values', () => {
		fc.assert(
			fc.property(fc.double({ max: -Number.EPSILON, noNaN: true }), (bytes) => {
				expect(formatSize(bytes)).toBe('0.0 KB');
			}),
			{ numRuns: 100 }
		);
	});

	it('returns KB format for values between 1 and 1,048,575 bytes', () => {
		fc.assert(
			fc.property(fc.integer({ min: 1, max: 1024 * 1024 - 1 }), (bytes) => {
				const result = formatSize(bytes);
				expect(result).toMatch(/^\d+\.\d KB$/);
			}),
			{ numRuns: 200 }
		);
	});

	it('returns MB format for values >= 1,048,576 bytes', () => {
		fc.assert(
			fc.property(fc.integer({ min: 1024 * 1024, max: 1024 * 1024 * 1024 }), (bytes) => {
				const result = formatSize(bytes);
				expect(result).toMatch(/^\d+\.\d MB$/);
			}),
			{ numRuns: 200 }
		);
	});

	it('boundary: 1,048,575 bytes returns KB', () => {
		expect(formatSize(1024 * 1024 - 1)).toMatch(/KB$/);
	});

	it('boundary: 1,048,576 bytes returns MB', () => {
		expect(formatSize(1024 * 1024)).toMatch(/MB$/);
	});

	it('KB value is bytes / 1024 to one decimal place', () => {
		fc.assert(
			fc.property(fc.integer({ min: 1, max: 1024 * 1024 - 1 }), (bytes) => {
				const result = formatSize(bytes);
				const expected = `${(bytes / 1024).toFixed(1)} KB`;
				expect(result).toBe(expected);
			}),
			{ numRuns: 100 }
		);
	});

	it('MB value is bytes / 1,048,576 to one decimal place', () => {
		fc.assert(
			fc.property(fc.integer({ min: 1024 * 1024, max: 512 * 1024 * 1024 }), (bytes) => {
				const result = formatSize(bytes);
				const expected = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
				expect(result).toBe(expected);
			}),
			{ numRuns: 100 }
		);
	});
});
