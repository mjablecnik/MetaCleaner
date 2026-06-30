import { describe, it, expect } from 'vitest';
import { getAudience } from '../audience.ts';
import { getFaq } from '../faq.ts';
import { stepsRepository } from '../steps.ts';
import { statsRepository } from '../stats.ts';

describe('getAudience()', () => {
	const audience = getAudience();

	it('returns 6 audience entries', () => {
		expect(audience.length).toBe(6);
	});

	it('has unique ids', () => {
		const ids = audience.map((a) => a.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('every entry has a non-empty id', () => {
		for (const entry of audience) {
			expect(entry.id).toBeTruthy();
		}
	});

	it('every entry has a non-empty icon', () => {
		for (const entry of audience) {
			expect(entry.icon).toBeTruthy();
		}
	});

	it('every entry has a non-empty color', () => {
		for (const entry of audience) {
			expect(entry.color).toBeTruthy();
		}
	});

	it('every entry has a non-empty titleKey', () => {
		for (const entry of audience) {
			expect(entry.titleKey).toBeTruthy();
		}
	});

	it('every entry has a non-empty descKey', () => {
		for (const entry of audience) {
			expect(entry.descKey).toBeTruthy();
		}
	});

	it('bulletKeys entries are non-empty strings when present', () => {
		for (const entry of audience) {
			if (entry.bulletKeys) {
				for (const key of entry.bulletKeys) {
					expect(typeof key).toBe('string');
					expect(key.length).toBeGreaterThan(0);
				}
			}
		}
	});
});

describe('getFaq()', () => {
	const faq = getFaq();

	it('returns 7 FAQ items', () => {
		expect(faq.length).toBe(7);
	});

	it('has unique ids', () => {
		const ids = faq.map((f) => f.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('every item has a non-empty id', () => {
		for (const item of faq) {
			expect(item.id).toBeTruthy();
		}
	});

	it('every item has a non-empty questionKey', () => {
		for (const item of faq) {
			expect(item.questionKey).toBeTruthy();
		}
	});

	it('every item has a non-empty answerKey', () => {
		for (const item of faq) {
			expect(item.answerKey).toBeTruthy();
		}
	});
});

describe('stepsRepository()', () => {
	const steps = stepsRepository();

	it('returns 3 steps', () => {
		expect(steps.length).toBe(3);
	});

	it('step numbers are 01, 02, 03 in order', () => {
		expect(steps.map((s) => s.number)).toEqual(['01', '02', '03']);
	});

	it('every step has a non-empty icon', () => {
		for (const step of steps) {
			expect(step.icon).toBeTruthy();
		}
	});

	it('every step has a non-empty titleKey', () => {
		for (const step of steps) {
			expect(step.titleKey).toBeTruthy();
		}
	});

	it('every step has a non-empty descKey', () => {
		for (const step of steps) {
			expect(step.descKey).toBeTruthy();
		}
	});

	it('descMobileKey is a non-empty string when present', () => {
		for (const step of steps) {
			if (step.descMobileKey !== undefined) {
				expect(step.descMobileKey.length).toBeGreaterThan(0);
			}
		}
	});
});

describe('statsRepository()', () => {
	const stats = statsRepository();

	it('returns 3 stat entries', () => {
		expect(stats.length).toBe(3);
	});

	it('every stat has a non-empty value', () => {
		for (const stat of stats) {
			expect(stat.value).toBeTruthy();
		}
	});

	it('every stat has a non-empty icon', () => {
		for (const stat of stats) {
			expect(stat.icon).toBeTruthy();
		}
	});

	it('every stat has a non-empty color', () => {
		for (const stat of stats) {
			expect(stat.color).toBeTruthy();
		}
	});

	it('every stat has a non-empty labelKey', () => {
		for (const stat of stats) {
			expect(stat.labelKey).toBeTruthy();
		}
	});
});
