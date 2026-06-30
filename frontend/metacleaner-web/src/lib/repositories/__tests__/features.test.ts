import { describe, it, expect } from 'vitest';
import { featuresRepository } from '../features.ts';

describe('featuresRepository()', () => {
	const features = featuresRepository();

	it('returns exactly 6 features', () => {
		expect(features.length).toBe(6);
	});

	it('has unique ids', () => {
		const ids = features.map((f) => f.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('has sequential numbers 1 through 6', () => {
		const numbers = features.map((f) => f.number);
		expect(numbers).toEqual([1, 2, 3, 4, 5, 6]);
	});

	it('every feature has layout "ltr" or "rtl"', () => {
		for (const feature of features) {
			expect(['ltr', 'rtl']).toContain(feature.layout);
		}
	});

	it('every feature has a non-empty id', () => {
		for (const feature of features) {
			expect(feature.id).toBeTruthy();
		}
	});

	it('every feature has a non-empty icon', () => {
		for (const feature of features) {
			expect(feature.icon).toBeTruthy();
		}
	});

	it('every feature has a non-empty color', () => {
		for (const feature of features) {
			expect(feature.color).toBeTruthy();
		}
	});

	it('every feature has a non-empty titleText', () => {
		for (const feature of features) {
			expect(feature.titleText).toBeTruthy();
		}
	});

	it('every feature has a non-empty descKey', () => {
		for (const feature of features) {
			expect(feature.descKey).toBeTruthy();
		}
	});

	it('formats entries have a non-empty icon and at least one of key or label', () => {
		for (const feature of features) {
			if (feature.formats) {
				for (const fmt of feature.formats) {
					expect(fmt.icon).toBeTruthy();
					expect(fmt.key !== undefined || fmt.label !== undefined).toBe(true);
				}
			}
		}
	});

	it('bullets entries are non-empty strings', () => {
		for (const feature of features) {
			if (feature.bullets) {
				for (const bullet of feature.bullets) {
					expect(typeof bullet).toBe('string');
					expect(bullet.length).toBeGreaterThan(0);
				}
			}
		}
	});

	it('image entries have non-empty src and altKey when present', () => {
		for (const feature of features) {
			if (feature.image) {
				expect(feature.image.src).toBeTruthy();
				expect(feature.image.altKey).toBeTruthy();
			}
		}
	});

	it('ltr and rtl layouts alternate (no two consecutive same layout)', () => {
		for (let i = 1; i < features.length; i++) {
			expect(features[i].layout).not.toBe(features[i - 1].layout);
		}
	});
});
