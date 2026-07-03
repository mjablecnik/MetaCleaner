import { describe, it, expect } from 'vitest';
import { getMetadataFields, getCleanedFields } from '../metadataDemo.ts';

describe('getMetadataFields()', () => {
	it('returns exactly 5 fields', () => {
		expect(getMetadataFields().length).toBe(5);
	});

	it('every field has a non-empty icon', () => {
		for (const field of getMetadataFields()) {
			expect(field.icon).toBeTruthy();
		}
	});

	it('every field has a non-empty labelKey', () => {
		for (const field of getMetadataFields()) {
			expect(field.labelKey).toBeTruthy();
		}
	});

	it('every field has a non-empty value', () => {
		for (const field of getMetadataFields()) {
			expect(field.value).toBeTruthy();
		}
	});
});

describe('getCleanedFields()', () => {
	it('returns the same count as getMetadataFields()', () => {
		expect(getCleanedFields().length).toBe(getMetadataFields().length);
	});

	it('every cleaned field has a non-empty icon', () => {
		for (const field of getCleanedFields()) {
			expect(field.icon).toBeTruthy();
		}
	});

	it('every cleaned field has a non-empty labelKey', () => {
		for (const field of getCleanedFields()) {
			expect(field.labelKey).toBeTruthy();
		}
	});

	it('cleaned fields have no value property', () => {
		for (const field of getCleanedFields()) {
			expect((field as unknown as Record<string, unknown>)['value']).toBeUndefined();
		}
	});

	it('preserves icon order relative to getMetadataFields()', () => {
		const meta = getMetadataFields();
		const clean = getCleanedFields();
		for (let i = 0; i < meta.length; i++) {
			expect(clean[i].icon).toBe(meta[i].icon);
		}
	});

	it('preserves labelKey order relative to getMetadataFields()', () => {
		const meta = getMetadataFields();
		const clean = getCleanedFields();
		for (let i = 0; i < meta.length; i++) {
			expect(clean[i].labelKey).toBe(meta[i].labelKey);
		}
	});
});
