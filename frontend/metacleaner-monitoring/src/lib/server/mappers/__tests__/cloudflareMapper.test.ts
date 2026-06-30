// Feature: monitoring-real-api-integration, Property 7: Geographic Distribution Aggregation
// For any array of country traffic records (N ≥ 1), result has at most 6 entries (top 5 + "Other"),
// percentages sum to 100% (±1%), sorted by traffic desc. If N ≤ 5, no "Other" entry.
// Validates: Requirements 7.3

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { CfGeoRaw } from '../../clients/cloudflareClient.js';
import { mapToGeoDistribution } from '../cloudflareMapper.js';

const countryEntryArb = fc.record({
	clientCountryName: fc.string({ minLength: 1, maxLength: 30 }),
	requests: fc.integer({ min: 0, max: 1_000_000 })
});

// Generate arrays with at least 1 country entry and unique names
const geoRawArb = (minLength: number, maxLength: number): fc.Arbitrary<CfGeoRaw> =>
	fc.array(countryEntryArb, { minLength, maxLength }).map((entries) => {
		// Deduplicate by name to avoid ambiguous sort behavior
		const seen = new Set<string>();
		const unique = entries.filter((e) => {
			if (seen.has(e.clientCountryName)) return false;
			seen.add(e.clientCountryName);
			return true;
		});
		// Need at least 1 entry
		if (unique.length === 0) unique.push({ clientCountryName: 'Test', requests: 1 });
		return { clientCountryMap: unique };
	});

describe('Property 7: Geographic Distribution Aggregation', () => {
	it('returns empty array for empty input', () => {
		const result = mapToGeoDistribution({ clientCountryMap: [] });
		expect(result).toEqual([]);
	});

	it('result has at most 6 entries (top 5 + "Other") for any input', () => {
		fc.assert(
			fc.property(geoRawArb(1, 50), (raw) => {
				const result = mapToGeoDistribution(raw);
				expect(result.length).toBeGreaterThanOrEqual(1);
				expect(result.length).toBeLessThanOrEqual(6);
			}),
			{ numRuns: 100 }
		);
	});

	it('no "Other" entry when N ≤ 5', () => {
		fc.assert(
			fc.property(geoRawArb(1, 5), (raw) => {
				const result = mapToGeoDistribution(raw);
				const hasOther = result.some((e) => e.country === 'Other');
				expect(hasOther).toBe(false);
			}),
			{ numRuns: 100 }
		);
	});

	it('"Other" entry is present when N > 5', () => {
		fc.assert(
			fc.property(geoRawArb(6, 30), (raw) => {
				// After dedup, may have fewer than 6 unique entries
				const unique = raw.clientCountryMap;
				if (unique.length <= 5) return;

				const result = mapToGeoDistribution(raw);
				const hasOther = result.some((e) => e.country === 'Other');
				expect(hasOther).toBe(true);
			}),
			{ numRuns: 100 }
		);
	});

	it('percentages sum to 100% (±1% rounding tolerance) when total > 0', () => {
		fc.assert(
			fc.property(geoRawArb(1, 30), (raw) => {
				const totalRequests = raw.clientCountryMap.reduce((s, e) => s + e.requests, 0);
				if (totalRequests === 0) return;

				const result = mapToGeoDistribution(raw);
				const sum = result.reduce((s, e) => s + e.percent, 0);
				expect(sum).toBeGreaterThanOrEqual(99);
				expect(sum).toBeLessThanOrEqual(101);
			}),
			{ numRuns: 100 }
		);
	});

	it('non-Other entries are sorted by traffic descending (non-increasing percents)', () => {
		fc.assert(
			fc.property(geoRawArb(2, 20), (raw) => {
				// Only meaningful when requests are all positive (so percent ordering matches request ordering)
				const allPositive = raw.clientCountryMap.every((e) => e.requests > 0);
				if (!allPositive) return;

				const result = mapToGeoDistribution(raw);
				const topEntries = result.filter((e) => e.country !== 'Other');

				for (let i = 1; i < topEntries.length; i++) {
					expect(topEntries[i].percent).toBeLessThanOrEqual(topEntries[i - 1].percent);
				}
			}),
			{ numRuns: 100 }
		);
	});

	it('result entries have all required GeoDistribution fields', () => {
		fc.assert(
			fc.property(geoRawArb(1, 20), (raw) => {
				const result = mapToGeoDistribution(raw);
				for (const entry of result) {
					expect(entry.country).not.toBeUndefined();
					expect(entry.code).not.toBeUndefined();
					expect(entry.flag).not.toBeUndefined();
					expect(entry.percent).not.toBeUndefined();
					expect(entry.color).not.toBeUndefined();
					expect(typeof entry.percent).toBe('number');
					expect(entry.percent).toBeGreaterThanOrEqual(0);
				}
			}),
			{ numRuns: 100 }
		);
	});

	it('"Other" entry always uses code "XX" and color constant', () => {
		fc.assert(
			fc.property(geoRawArb(6, 30), (raw) => {
				if (raw.clientCountryMap.length <= 5) return;

				const result = mapToGeoDistribution(raw);
				const other = result.find((e) => e.country === 'Other');
				if (!other) return;

				expect(other.code).toBe('XX');
				expect(other.flag).toBe('🌍');
				expect(other.percent).toBeGreaterThanOrEqual(0);
			}),
			{ numRuns: 100 }
		);
	});

	it('result length equals min(N, 5) for N ≤ 5, and min(N, 5) + 1 for N > 5', () => {
		// For N in 1..5: result.length === N (all entries, no Other)
		fc.assert(
			fc.property(fc.integer({ min: 1, max: 5 }), (n) => {
				const countries = Array.from({ length: n }, (_, i) => ({
					clientCountryName: `Country${i}`,
					requests: (n - i) * 100
				}));
				const result = mapToGeoDistribution({ clientCountryMap: countries });
				expect(result.length).toBe(n);
			}),
			{ numRuns: 50 }
		);

		// For N > 5: result.length === 6 (top 5 + Other)
		fc.assert(
			fc.property(fc.integer({ min: 6, max: 30 }), (n) => {
				const countries = Array.from({ length: n }, (_, i) => ({
					clientCountryName: `Country${i}`,
					requests: (n - i) * 100
				}));
				const result = mapToGeoDistribution({ clientCountryMap: countries });
				expect(result.length).toBe(6);
			}),
			{ numRuns: 50 }
		);
	});
});
