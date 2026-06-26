// Feature: subscription-management
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
	PLAN_HIERARCHY,
	isUpgrade,
	isDowngrade,
	formatCurrency,
	formatDate
} from '../planHierarchy';

// Feature: subscription-management, Property 3: Currency Formatting by Locale
describe('formatCurrency', () => {
	it('en: places € before amount with period decimal', () => {
		fc.assert(
			fc.property(fc.nat({ max: 10000 }), (cents) => {
				const amount = cents / 100;
				const result = formatCurrency(amount, 'en');
				expect(result).toMatch(/^€\d+\.\d{2}$/);
				expect(result.startsWith('€')).toBe(true);
				expect(result).not.toContain(',');
			}),
			{ numRuns: 200 }
		);
	});

	it('cs: places amount before € with comma decimal', () => {
		fc.assert(
			fc.property(fc.nat({ max: 10000 }), (cents) => {
				const amount = cents / 100;
				const result = formatCurrency(amount, 'cs');
				expect(result).toMatch(/^\d+,\d{2} €$/);
				expect(result.endsWith(' €')).toBe(true);
				expect(result).not.toMatch(/^€/);
			}),
			{ numRuns: 200 }
		);
	});

	it('en: specific values', () => {
		expect(formatCurrency(2.99, 'en')).toBe('€2.99');
		expect(formatCurrency(0, 'en')).toBe('€0.00');
		expect(formatCurrency(12.5, 'en')).toBe('€12.50');
	});

	it('cs: specific values', () => {
		expect(formatCurrency(2.99, 'cs')).toBe('2,99 €');
		expect(formatCurrency(0, 'cs')).toBe('0,00 €');
		expect(formatCurrency(12.5, 'cs')).toBe('12,50 €');
	});
});

// Feature: subscription-management, Property 4: Date Formatting by Locale
describe('formatDate', () => {
	const makeDate = (year: number, month: number, day: number) =>
		new Date(Date.UTC(year, month - 1, day));

	it('cs: uses DD.MM.YYYY format with dot separators', () => {
		fc.assert(
			fc.property(
				fc.integer({ min: 2000, max: 2099 }),
				fc.integer({ min: 1, max: 12 }),
				fc.integer({ min: 1, max: 28 }),
				(year, month, day) => {
					const date = makeDate(year, month, day);
					const result = formatDate(date, 'cs');
					expect(result).toMatch(/^\d{2}\.\d{2}\.\d{4}$/);
					const parts = result.split('.');
					expect(Number(parts[0])).toBeGreaterThanOrEqual(1);
					expect(Number(parts[0])).toBeLessThanOrEqual(31);
					expect(Number(parts[1])).toBeGreaterThanOrEqual(1);
					expect(Number(parts[1])).toBeLessThanOrEqual(12);
				}
			),
			{ numRuns: 200 }
		);
	});

	it('en: uses MM/DD/YYYY format with slash separators', () => {
		fc.assert(
			fc.property(
				fc.integer({ min: 2000, max: 2099 }),
				fc.integer({ min: 1, max: 12 }),
				fc.integer({ min: 1, max: 28 }),
				(year, month, day) => {
					const date = makeDate(year, month, day);
					const result = formatDate(date, 'en');
					expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
					const parts = result.split('/');
					expect(Number(parts[0])).toBeGreaterThanOrEqual(1);
					expect(Number(parts[0])).toBeLessThanOrEqual(12);
					expect(Number(parts[1])).toBeGreaterThanOrEqual(1);
					expect(Number(parts[1])).toBeLessThanOrEqual(31);
				}
			),
			{ numRuns: 200 }
		);
	});

	it('cs: specific date 2025-06-15 → "15.06.2025"', () => {
		expect(formatDate(new Date('2025-06-15'), 'cs')).toBe('15.06.2025');
	});

	it('en: specific date 2025-06-15 → "06/15/2025"', () => {
		expect(formatDate(new Date('2025-06-15'), 'en')).toBe('06/15/2025');
	});

	it('accepts ISO string input same as Date object', () => {
		const dateStr = '2025-06-15T00:00:00Z';
		expect(formatDate(dateStr, 'cs')).toBe(formatDate(new Date(dateStr), 'cs'));
		expect(formatDate(dateStr, 'en')).toBe(formatDate(new Date(dateStr), 'en'));
	});
});

// Feature: subscription-management, Property 6 (partial): Plan hierarchy correctness
describe('PLAN_HIERARCHY', () => {
	it('free < pro < proplus', () => {
		expect(PLAN_HIERARCHY.free).toBeLessThan(PLAN_HIERARCHY.pro);
		expect(PLAN_HIERARCHY.pro).toBeLessThan(PLAN_HIERARCHY.proplus);
	});
});

describe('isUpgrade', () => {
	it('returns true when target rank > current rank', () => {
		expect(isUpgrade('free', 'pro')).toBe(true);
		expect(isUpgrade('free', 'proplus')).toBe(true);
		expect(isUpgrade('pro', 'proplus')).toBe(true);
	});

	it('returns false when target rank <= current rank', () => {
		expect(isUpgrade('pro', 'free')).toBe(false);
		expect(isUpgrade('proplus', 'pro')).toBe(false);
		expect(isUpgrade('pro', 'pro')).toBe(false);
		expect(isUpgrade('free', 'free')).toBe(false);
	});

	it('property: isUpgrade and isDowngrade are mutually exclusive and cover all non-equal cases', () => {
		const plans = ['free', 'pro', 'proplus'] as const;
		fc.assert(
			fc.property(fc.constantFrom(...plans), fc.constantFrom(...plans), (a, b) => {
				if (a === b) {
					expect(isUpgrade(a, b)).toBe(false);
					expect(isDowngrade(a, b)).toBe(false);
				} else {
					expect(isUpgrade(a, b)).not.toBe(isDowngrade(a, b));
				}
			}),
			{ numRuns: 100 }
		);
	});
});

describe('isDowngrade', () => {
	it('returns true when target rank < current rank', () => {
		expect(isDowngrade('pro', 'free')).toBe(true);
		expect(isDowngrade('proplus', 'free')).toBe(true);
		expect(isDowngrade('proplus', 'pro')).toBe(true);
	});

	it('returns false when target rank >= current rank', () => {
		expect(isDowngrade('free', 'pro')).toBe(false);
		expect(isDowngrade('pro', 'proplus')).toBe(false);
		expect(isDowngrade('pro', 'pro')).toBe(false);
	});
});

// Feature: subscription-management, Property 2: Credit Usage Bar Percentage Computation
describe('credit usage bar computation', () => {
	function computeUsageBarWidth(used: number, allowance: number): number {
		if (allowance === 0) return 0;
		return Math.min(used / allowance, 1) * 100;
	}

	it('returns 0 when allowance is 0', () => {
		fc.assert(
			fc.property(fc.nat({ max: 100_000 }), (used) => {
				expect(computeUsageBarWidth(used, 0)).toBe(0);
			}),
			{ numRuns: 100 }
		);
	});

	it('result is always in [0, 100]', () => {
		fc.assert(
			fc.property(
				fc.nat({ max: 100_000 }),
				fc.nat({ max: 100_000 }).filter((n) => n > 0),
				(used, allowance) => {
					const width = computeUsageBarWidth(used, allowance);
					expect(width).toBeGreaterThanOrEqual(0);
					expect(width).toBeLessThanOrEqual(100);
				}
			),
			{ numRuns: 300 }
		);
	});

	it('equals (used/allowance)*100 when used <= allowance', () => {
		fc.assert(
			fc.property(
				fc.nat({ max: 1000 }).filter((n) => n > 0),
				fc.nat({ max: 1000 }),
				(allowance, extra) => {
					const used = extra % (allowance + 1); // used <= allowance
					const width = computeUsageBarWidth(used, allowance);
					expect(width).toBeCloseTo((used / allowance) * 100, 10);
				}
			),
			{ numRuns: 200 }
		);
	});

	it('returns 100 when used > allowance', () => {
		fc.assert(
			fc.property(
				fc.nat({ max: 1000 }).filter((n) => n > 0),
				fc.nat({ max: 1000 }),
				(allowance, extra) => {
					const used = allowance + extra + 1;
					const width = computeUsageBarWidth(used, allowance);
					expect(width).toBe(100);
				}
			),
			{ numRuns: 200 }
		);
	});
});
