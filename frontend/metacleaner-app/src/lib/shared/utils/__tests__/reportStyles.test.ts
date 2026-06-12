import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { tagStyle, iconStyle } from '../reportStyles';

describe('Style functions always return non-empty valid class strings', () => {
	describe('tagStyle()', () => {
		it('returns non-empty string for any input', () => {
			fc.assert(
				fc.property(fc.string(), (tag) => {
					const result = tagStyle(tag);
					expect(result.length).toBeGreaterThan(0);
				}),
				{ numRuns: 200 }
			);
		});

		it('GPS tag returns brand-red classes', () => {
			expect(tagStyle('GPS')).toBe('bg-brand-red/10 border-brand-red/20 text-brand-red');
		});

		it('EXIF tag returns brand-orange classes', () => {
			expect(tagStyle('EXIF')).toBe('bg-brand-orange/10 border-brand-orange/20 text-brand-orange');
		});

		it('XMP tag returns brand-blue classes', () => {
			expect(tagStyle('XMP')).toBe('bg-brand-blue/10 border-brand-blue/20 text-brand-blue');
		});

		it('unknown tag returns neutral default classes', () => {
			fc.assert(
				fc.property(
					fc.string().filter((t) => t !== 'GPS' && t !== 'EXIF' && t !== 'XMP'),
					(tag) => {
						expect(tagStyle(tag)).toBe('bg-navy-lighter text-text-muted');
					}
				),
				{ numRuns: 100 }
			);
		});
	});

	describe('iconStyle()', () => {
		it('returns non-empty string for any input', () => {
			fc.assert(
				fc.property(fc.string(), (color) => {
					const result = iconStyle(color);
					expect(result.length).toBeGreaterThan(0);
				}),
				{ numRuns: 200 }
			);
		});

		it('green color returns brand-green classes', () => {
			expect(iconStyle('green')).toBe('bg-brand-green/10 border-brand-green/20 text-brand-green');
		});

		it('orange color returns brand-orange classes', () => {
			expect(iconStyle('orange')).toBe(
				'bg-brand-orange/10 border-brand-orange/20 text-brand-orange'
			);
		});

		it('unknown color returns brand-blue default classes', () => {
			fc.assert(
				fc.property(
					fc.string().filter((c) => c !== 'green' && c !== 'orange'),
					(color) => {
						expect(iconStyle(color)).toBe(
							'bg-brand-blue/10 border-brand-blue/20 text-brand-blue'
						);
					}
				),
				{ numRuns: 100 }
			);
		});
	});
});
