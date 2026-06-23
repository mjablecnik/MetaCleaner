import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { formatCreditCount, getCreditColorScheme } from '../formatCredits';
import { getPlanStyle } from '../planStyleMap';
import { computeProgressRatio, computeTotalCost, isInsufficientCredits } from '../creditCost';
import { creditLabel } from '../creditPlural';

// Property 1: Credit display formatting
describe('formatCreditCount', () => {
	it('returns String(n) for n <= 99999', () => {
		fc.assert(
			fc.property(fc.nat({ max: 99999 }), (n) => {
				expect(formatCreditCount(n)).toBe(String(n));
			}),
			{ numRuns: 500 }
		);
	});

	it('returns "99,999+" for n > 99999', () => {
		fc.assert(
			fc.property(
				fc.nat({ max: 1_000_000 }).filter((n) => n > 99999),
				(n) => {
					expect(formatCreditCount(n)).toBe('99,999+');
				}
			),
			{ numRuns: 200 }
		);
	});

	it('boundary: exactly 99999 returns "99999"', () => {
		expect(formatCreditCount(99999)).toBe('99999');
	});

	it('boundary: 100000 returns "99,999+"', () => {
		expect(formatCreditCount(100000)).toBe('99,999+');
	});
});

// Property 2: Credit balance color scheme determination
describe('getCreditColorScheme', () => {
	it('returns "warning" for balance 0', () => {
		expect(getCreditColorScheme(0)).toBe('warning');
	});

	it('returns "success" for any positive balance', () => {
		fc.assert(
			fc.property(
				fc.nat({ max: 1_000_000 }).filter((n) => n > 0),
				(n) => {
					expect(getCreditColorScheme(n)).toBe('success');
				}
			),
			{ numRuns: 300 }
		);
	});
});

// Property 3: Plan-to-style mapping consistency
describe('getPlanStyle', () => {
	const activeStatuses = ['active', 'trialing'] as const;
	const inactiveStatuses = ['cancelled', 'inactive', null] as const;

	it('returns gray/lock style for free plan regardless of status', () => {
		fc.assert(
			fc.property(fc.constantFrom('active', 'trialing', 'cancelled', null), (status) => {
				const style = getPlanStyle('free', status);
				expect(style.icon).toBe('lock');
				expect(style.label).toBe('Free');
			}),
			{ numRuns: 50 }
		);
	});

	it('returns gray/lock style for null planId', () => {
		fc.assert(
			fc.property(fc.constantFrom('active', 'trialing', 'cancelled', null), (status) => {
				const style = getPlanStyle(null, status);
				expect(style.icon).toBe('lock');
				expect(style.label).toBe('Free');
			}),
			{ numRuns: 50 }
		);
	});

	it('returns gray/lock style for cancelled status on any plan', () => {
		fc.assert(
			fc.property(fc.constantFrom('pro', 'proplus', 'free', null), (planId) => {
				const style = getPlanStyle(planId, 'cancelled');
				expect(style.icon).toBe('lock');
				expect(style.label).toBe('Free');
			}),
			{ numRuns: 50 }
		);
	});

	it('returns blue/star style for pro with active or trialing status', () => {
		fc.assert(
			fc.property(fc.constantFrom(...activeStatuses), (status) => {
				const style = getPlanStyle('pro', status);
				expect(style.icon).toBe('star');
				expect(style.label).toBe('Pro');
				expect(style.dotColor).toContain('blue');
			}),
			{ numRuns: 20 }
		);
	});

	it('returns orange/star style for proplus with active or trialing status', () => {
		fc.assert(
			fc.property(fc.constantFrom(...activeStatuses), (status) => {
				const style = getPlanStyle('proplus', status);
				expect(style.icon).toBe('star');
				expect(style.label).toBe('Pro+');
				expect(style.dotColor).toContain('orange');
			}),
			{ numRuns: 20 }
		);
	});

	it('returns gray/lock for pro/proplus with non-active status', () => {
		fc.assert(
			fc.property(
				fc.constantFrom('pro', 'proplus'),
				fc.constantFrom(...inactiveStatuses),
				(planId, status) => {
					const style = getPlanStyle(planId, status);
					expect(style.icon).toBe('lock');
					expect(style.label).toBe('Free');
				}
			),
			{ numRuns: 50 }
		);
	});
});

// Property 4: Progress bar ratio computation
describe('computeProgressRatio', () => {
	it('returns 0 when allowance is 0', () => {
		fc.assert(
			fc.property(fc.nat({ max: 100_000 }), (remaining) => {
				expect(computeProgressRatio(remaining, 0)).toBe(0);
			}),
			{ numRuns: 100 }
		);
	});

	it('returns ratio clamped to [0, 1] for any inputs with allowance > 0', () => {
		fc.assert(
			fc.property(
				fc.nat({ max: 100_000 }),
				fc.nat({ max: 100_000 }).filter((n) => n > 0),
				(remaining, allowance) => {
					const ratio = computeProgressRatio(remaining, allowance);
					expect(ratio).toBeGreaterThanOrEqual(0);
					expect(ratio).toBeLessThanOrEqual(1);
				}
			),
			{ numRuns: 300 }
		);
	});

	it('equals remaining/allowance when remaining <= allowance', () => {
		fc.assert(
			fc.property(
				fc.nat({ max: 1000 }).filter((n) => n > 0),
				fc.nat({ max: 1000 }),
				(allowance, extra) => {
					const remaining = extra % (allowance + 1); // remaining <= allowance
					const ratio = computeProgressRatio(remaining, allowance);
					expect(ratio).toBeCloseTo(remaining / allowance, 10);
				}
			),
			{ numRuns: 200 }
		);
	});

	it('returns 1 when remaining > allowance', () => {
		fc.assert(
			fc.property(
				fc.nat({ max: 1000 }).filter((n) => n > 0),
				fc.nat({ max: 1000 }),
				(allowance, extra) => {
					const remaining = allowance + extra + 1; // remaining > allowance
					const ratio = computeProgressRatio(remaining, allowance);
					expect(ratio).toBe(1);
				}
			),
			{ numRuns: 200 }
		);
	});
});

// Property 5: Total credit cost computation
describe('computeTotalCost', () => {
	it('returns count of non-unknown files for any array', () => {
		fc.assert(
			fc.property(
				fc.array(fc.record({ type: fc.constantFrom('image', 'video', 'unknown') })),
				(files) => {
					const expected = files.filter((f) => f.type !== 'unknown').length;
					expect(computeTotalCost(files)).toBe(expected);
				}
			),
			{ numRuns: 200 }
		);
	});

	it('returns 0 for empty array', () => {
		expect(computeTotalCost([])).toBe(0);
	});

	it('returns 0 when all files are unknown', () => {
		fc.assert(
			fc.property(fc.nat({ max: 20 }), (count) => {
				const files = Array.from({ length: count }, () => ({ type: 'unknown' }));
				expect(computeTotalCost(files)).toBe(0);
			}),
			{ numRuns: 100 }
		);
	});

	it('returns full count when no files are unknown', () => {
		fc.assert(
			fc.property(
				fc.array(fc.record({ type: fc.constantFrom('image', 'video', 'pdf', 'audio') })),
				(files) => {
					expect(computeTotalCost(files)).toBe(files.length);
				}
			),
			{ numRuns: 100 }
		);
	});
});

// Property 6: Insufficient credits determination
describe('isInsufficientCredits', () => {
	it('returns true when totalCost > creditBalance', () => {
		fc.assert(
			fc.property(fc.nat({ max: 1000 }), fc.nat({ max: 1000 }), (creditBalance, extra) => {
				const totalCost = creditBalance + extra + 1; // strictly greater
				expect(isInsufficientCredits(totalCost, creditBalance)).toBe(true);
			}),
			{ numRuns: 300 }
		);
	});

	it('returns false when totalCost <= creditBalance', () => {
		fc.assert(
			fc.property(fc.nat({ max: 1000 }), fc.nat({ max: 1000 }), (totalCost, extra) => {
				const creditBalance = totalCost + extra; // creditBalance >= totalCost
				expect(isInsufficientCredits(totalCost, creditBalance)).toBe(false);
			}),
			{ numRuns: 300 }
		);
	});

	it('returns false when totalCost equals creditBalance', () => {
		fc.assert(
			fc.property(fc.nat({ max: 10_000 }), (n) => {
				expect(isInsufficientCredits(n, n)).toBe(false);
			}),
			{ numRuns: 100 }
		);
	});
});

// Property 7: Czech and English credit plural forms
describe('creditLabel', () => {
	it('en: returns "credit" for count 1', () => {
		expect(creditLabel(1, 'en')).toBe('credit');
	});

	it('en: returns "credits" for any count != 1', () => {
		fc.assert(
			fc.property(
				fc.nat({ max: 10_000 }).filter((n) => n !== 1),
				(n) => {
					expect(creditLabel(n, 'en')).toBe('credits');
				}
			),
			{ numRuns: 200 }
		);
	});

	it('cs: returns "kredit" for count 1', () => {
		expect(creditLabel(1, 'cs')).toBe('kredit');
	});

	it('cs: returns "kredity" for counts 2-4', () => {
		fc.assert(
			fc.property(fc.constantFrom(2, 3, 4), (n) => {
				expect(creditLabel(n, 'cs')).toBe('kredity');
			}),
			{ numRuns: 30 }
		);
	});

	it('cs: returns "kreditů" for count 0 and counts > 4', () => {
		fc.assert(
			fc.property(
				fc.oneof(
					fc.constant(0),
					fc.nat({ max: 10_000 }).filter((n) => n > 4)
				),
				(n) => {
					expect(creditLabel(n, 'cs')).toBe('kreditů');
				}
			),
			{ numRuns: 200 }
		);
	});
});
