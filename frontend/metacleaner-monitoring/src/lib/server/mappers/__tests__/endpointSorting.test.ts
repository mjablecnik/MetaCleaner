// Feature: monitoring-real-api-integration, Property 11: Endpoint Sorting and Limiting
// For any array of endpoint performance records, the SlowEndpoint mapper returns at most
// 10 entries sorted by average response time descending. If the input has fewer than 10
// entries, all are returned (still sorted).
// Validates: Requirements 14.1

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { RawEndpointRecord } from '../performanceMapper.js';
import { mapToSlowEndpoints } from '../performanceMapper.js';

const endpointRecordArb: fc.Arbitrary<RawEndpointRecord> = fc.record({
	id: fc.string({ minLength: 1, maxLength: 20 }),
	method: fc.constantFrom('GET', 'POST', 'PUT', 'PATCH', 'DELETE'),
	path: fc
		.array(fc.string({ minLength: 1, maxLength: 15 }), { minLength: 1, maxLength: 4 })
		.map((parts) => '/' + parts.join('/')),
	callCount: fc.integer({ min: 0, max: 100_000 }),
	errorCount: fc.integer({ min: 0, max: 1_000 }),
	avgMs: fc.integer({ min: 0, max: 10_000 })
});

describe('Property 11: Endpoint Sorting and Limiting', () => {
	it('returns empty array for empty input', () => {
		expect(mapToSlowEndpoints([])).toEqual([]);
	});

	it('result has at most 10 entries for any input', () => {
		fc.assert(
			fc.property(fc.array(endpointRecordArb, { minLength: 1, maxLength: 50 }), (records) => {
				const result = mapToSlowEndpoints(records);
				expect(result.length).toBeLessThanOrEqual(10);
			}),
			{ numRuns: 100 }
		);
	});

	it('returns all entries when input has fewer than 10 records', () => {
		fc.assert(
			fc.property(fc.array(endpointRecordArb, { minLength: 1, maxLength: 9 }), (records) => {
				const result = mapToSlowEndpoints(records);
				expect(result.length).toBe(records.length);
			}),
			{ numRuns: 100 }
		);
	});

	it('result is sorted by avgMs descending (non-increasing order)', () => {
		fc.assert(
			fc.property(fc.array(endpointRecordArb, { minLength: 2, maxLength: 30 }), (records) => {
				const result = mapToSlowEndpoints(records);
				for (let i = 1; i < result.length; i++) {
					expect(result[i].avgMs).toBeLessThanOrEqual(result[i - 1].avgMs);
				}
			}),
			{ numRuns: 100 }
		);
	});

	it('result contains exactly 10 entries when input has 10 or more records', () => {
		fc.assert(
			fc.property(fc.array(endpointRecordArb, { minLength: 10, maxLength: 50 }), (records) => {
				const result = mapToSlowEndpoints(records);
				expect(result.length).toBe(10);
			}),
			{ numRuns: 100 }
		);
	});

	it('result contains the 10 slowest endpoints when input has more than 10 records', () => {
		fc.assert(
			fc.property(fc.array(endpointRecordArb, { minLength: 11, maxLength: 50 }), (records) => {
				const result = mapToSlowEndpoints(records);

				// The slowest avgMs in the result must be >= the fastest avgMs dropped
				const resultIds = new Set(result.map((r) => r.id));
				const dropped = records.filter((r) => !resultIds.has(r.id));

				if (dropped.length > 0 && result.length > 0) {
					const minResultAvgMs = Math.min(...result.map((r) => r.avgMs));
					const maxDroppedAvgMs = Math.max(...dropped.map((r) => r.avgMs));
					expect(minResultAvgMs).toBeGreaterThanOrEqual(maxDroppedAvgMs);
				}
			}),
			{ numRuns: 100 }
		);
	});

	it('all required SlowEndpoint fields are present and non-undefined', () => {
		const requiredFields = [
			'id',
			'method',
			'methodClass',
			'path',
			'callCount',
			'errorRate',
			'avgMs',
			'barWidth',
			'timeColor',
			'barColor'
		] as const;

		fc.assert(
			fc.property(fc.array(endpointRecordArb, { minLength: 1, maxLength: 20 }), (records) => {
				const result = mapToSlowEndpoints(records);
				for (const entry of result) {
					for (const field of requiredFields) {
						expect(entry[field], `Field "${field}" must not be undefined`).not.toBeUndefined();
						expect(entry[field], `Field "${field}" must not be null`).not.toBeNull();
					}
				}
			}),
			{ numRuns: 100 }
		);
	});

	it('avgMs in result matches input record avgMs', () => {
		fc.assert(
			fc.property(fc.array(endpointRecordArb, { minLength: 1, maxLength: 20 }), (records) => {
				const result = mapToSlowEndpoints(records);
				const inputById = new Map(records.map((r) => [r.id, r]));
				for (const entry of result) {
					const original = inputById.get(entry.id);
					if (original) {
						expect(entry.avgMs).toBe(original.avgMs);
					}
				}
			}),
			{ numRuns: 100 }
		);
	});

	it('barWidth of the slowest endpoint is always 100%', () => {
		fc.assert(
			fc.property(fc.array(endpointRecordArb, { minLength: 1, maxLength: 20 }), (records) => {
				// Ensure at least one record has avgMs > 0
				const hasPositiveMs = records.some((r) => r.avgMs > 0);
				if (!hasPositiveMs) return;

				const result = mapToSlowEndpoints(records);
				if (result.length > 0 && result[0].avgMs > 0) {
					expect(result[0].barWidth).toBe('100%');
				}
			}),
			{ numRuns: 100 }
		);
	});
});
