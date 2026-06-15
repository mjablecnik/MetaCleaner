import { describe, it, expect } from 'vitest';
import { getLanguages } from '../languageRepository.js';

describe('getLanguages', () => {
	it('resolves to an array', async () => {
		const langs = await getLanguages();
		expect(Array.isArray(langs)).toBe(true);
	});

	it('returns exactly 2 languages', async () => {
		const langs = await getLanguages();
		expect(langs).toHaveLength(2);
	});

	it('includes a Czech entry with code "cs"', async () => {
		const langs = await getLanguages();
		const cs = langs.find((l) => l.code === 'cs');
		expect(cs).toBeDefined();
	});

	it('includes an English entry with code "en"', async () => {
		const langs = await getLanguages();
		const en = langs.find((l) => l.code === 'en');
		expect(en).toBeDefined();
	});

	it('Czech entry has expected shape', async () => {
		const langs = await getLanguages();
		const cs = langs.find((l) => l.code === 'cs')!;
		expect(cs.flag).toBe('/flags/cs.svg');
		expect(cs.label).toBe('CS');
		expect(cs.name).toBeTruthy();
	});

	it('English entry has expected shape', async () => {
		const langs = await getLanguages();
		const en = langs.find((l) => l.code === 'en')!;
		expect(en.flag).toBe('/flags/en.svg');
		expect(en.label).toBe('EN');
		expect(en.name).toBe('English');
	});

	it('all flag paths point to /flags/*.svg', async () => {
		const langs = await getLanguages();
		for (const lang of langs) {
			expect(lang.flag).toMatch(/^\/flags\/.+\.svg$/);
		}
	});

	it('each entry has non-empty code, flag, label, and name', async () => {
		const langs = await getLanguages();
		for (const lang of langs) {
			expect(lang.code).toBeTruthy();
			expect(lang.flag).toBeTruthy();
			expect(lang.label).toBeTruthy();
			expect(lang.name).toBeTruthy();
		}
	});
});
