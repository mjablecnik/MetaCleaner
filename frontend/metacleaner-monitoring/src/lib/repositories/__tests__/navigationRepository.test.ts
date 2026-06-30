import { describe, it, expect } from 'vitest';
import { getNavSections } from '../navigationRepository.js';

describe('getNavSections', () => {
	it('returns exactly 3 sections', () => {
		const sections = getNavSections('');
		expect(sections).toHaveLength(3);
	});

	it('returns exactly 9 total items across all sections', () => {
		const sections = getNavSections('');
		const total = sections.reduce((sum, s) => sum + s.items.length, 0);
		expect(total).toBe(9);
	});

	it('each section has exactly 3 items', () => {
		const sections = getNavSections('/dashboard');
		for (const section of sections) {
			expect(section.items).toHaveLength(3);
		}
	});

	it('every href is prefixed with the base argument', () => {
		const base = '/my-base';
		const sections = getNavSections(base);
		for (const section of sections) {
			for (const item of section.items) {
				expect(item.href.startsWith(base)).toBe(true);
			}
		}
	});

	it('empty string base — hrefs start with /', () => {
		const sections = getNavSections('');
		for (const section of sections) {
			for (const item of section.items) {
				expect(item.href.startsWith('/')).toBe(true);
			}
		}
	});

	it('trailing slash path is prefixed correctly', () => {
		const sections = getNavSections('/app');
		const dashboard = sections[0].items[0];
		expect(dashboard.href).toBe('/app/');
	});

	it('every section has a non-empty labelKey', () => {
		const sections = getNavSections('');
		for (const section of sections) {
			expect(section.labelKey).toBeTruthy();
			expect(typeof section.labelKey).toBe('string');
		}
	});

	it('every item has a non-empty labelKey and icon', () => {
		const sections = getNavSections('');
		for (const section of sections) {
			for (const item of section.items) {
				expect(item.labelKey).toBeTruthy();
				expect(item.icon).toBeTruthy();
			}
		}
	});

	it('section labelKeys are stable across different base values', () => {
		const s1 = getNavSections('/a');
		const s2 = getNavSections('/b');
		for (let i = 0; i < s1.length; i++) {
			expect(s1[i].labelKey).toBe(s2[i].labelKey);
			for (let j = 0; j < s1[i].items.length; j++) {
				expect(s1[i].items[j].labelKey).toBe(s2[i].items[j].labelKey);
				expect(s1[i].items[j].icon).toBe(s2[i].items[j].icon);
			}
		}
	});

	it('hrefs change with base but paths after base remain consistent', () => {
		const base1 = '/dashboard';
		const base2 = '/admin';
		const s1 = getNavSections(base1);
		const s2 = getNavSections(base2);
		for (let i = 0; i < s1.length; i++) {
			for (let j = 0; j < s1[i].items.length; j++) {
				const suffix1 = s1[i].items[j].href.slice(base1.length);
				const suffix2 = s2[i].items[j].href.slice(base2.length);
				expect(suffix1).toBe(suffix2);
			}
		}
	});
});
