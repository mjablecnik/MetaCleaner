import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { barSeverity } from '../riskStyles';

describe('barSeverity threshold mapping', () => {
	it('returns "critical" for values >= 75', () => {
		fc.assert(
			fc.property(fc.integer({ min: 75, max: 100 }), (value) => {
				expect(barSeverity(value)).toBe('critical');
			}),
			{ numRuns: 100 }
		);
	});

	it('returns "high" for values in [50, 74]', () => {
		fc.assert(
			fc.property(fc.integer({ min: 50, max: 74 }), (value) => {
				expect(barSeverity(value)).toBe('high');
			}),
			{ numRuns: 100 }
		);
	});

	it('returns "medium" for values in [25, 49]', () => {
		fc.assert(
			fc.property(fc.integer({ min: 25, max: 49 }), (value) => {
				expect(barSeverity(value)).toBe('medium');
			}),
			{ numRuns: 100 }
		);
	});

	it('returns "low" for values in [0, 24]', () => {
		fc.assert(
			fc.property(fc.integer({ min: 0, max: 24 }), (value) => {
				expect(barSeverity(value)).toBe('low');
			}),
			{ numRuns: 100 }
		);
	});

	it('boundary: 75 is critical', () => {
		expect(barSeverity(75)).toBe('critical');
	});

	it('boundary: 74 is high', () => {
		expect(barSeverity(74)).toBe('high');
	});

	it('boundary: 50 is high', () => {
		expect(barSeverity(50)).toBe('high');
	});

	it('boundary: 49 is medium', () => {
		expect(barSeverity(49)).toBe('medium');
	});

	it('boundary: 25 is medium', () => {
		expect(barSeverity(25)).toBe('medium');
	});

	it('boundary: 24 is low', () => {
		expect(barSeverity(24)).toBe('low');
	});

	it('boundary: 0 is low', () => {
		expect(barSeverity(0)).toBe('low');
	});

	it('boundary: 100 is critical', () => {
		expect(barSeverity(100)).toBe('critical');
	});

	it('always returns a valid BarSeverity value for any 0-100 integer', () => {
		const validValues = ['critical', 'high', 'medium', 'low'];
		fc.assert(
			fc.property(fc.integer({ min: 0, max: 100 }), (value) => {
				expect(validValues).toContain(barSeverity(value));
			}),
			{ numRuns: 100 }
		);
	});
});
