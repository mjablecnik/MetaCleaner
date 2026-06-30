// Feature: monitoring-real-api-integration, Property 4: Section Error Isolation
// For any load function with N sections, if K sections throw ClientError, exactly K sections
// return status:'error' and N-K return status:'ok'.
// Validates: Requirements 5.1, 5.3

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { ClientError, callSection } from '../types.js';

const categories = ['timeout', 'unauthorized', 'service_unavailable', 'request_error'] as const;

const clientErrorArb = fc
	.record({
		service: fc.string({ minLength: 1, maxLength: 20 }),
		statusCode: fc.option(fc.integer({ min: 400, max: 599 }), { nil: null }),
		category: fc.constantFrom(...categories),
		message: fc.string({ minLength: 1, maxLength: 100 })
	})
	.map(
		({ service, statusCode, category, message }) =>
			new ClientError(service, statusCode, category, message)
	);

// Each section is either a success (returns some string data) or a failure (throws ClientError)
const sectionSpecArb = fc.record({
	throws: fc.boolean(),
	error: clientErrorArb,
	data: fc.string({ minLength: 0, maxLength: 50 })
});

describe('Property 4: Section Error Isolation', () => {
	it('exactly K sections return error when K sections throw ClientError', async () => {
		await fc.assert(
			fc.asyncProperty(fc.array(sectionSpecArb, { minLength: 1, maxLength: 10 }), async (specs) => {
				const throwingCount = specs.filter((s) => s.throws).length;

				const results = await Promise.all(
					specs.map((spec) =>
						callSection(async () => {
							if (spec.throws) throw spec.error;
							return spec.data;
						})
					)
				);

				const errorResults = results.filter((r) => r.status === 'error');
				const okResults = results.filter((r) => r.status === 'ok');

				expect(errorResults.length).toBe(throwingCount);
				expect(okResults.length).toBe(specs.length - throwingCount);
			}),
			{ numRuns: 200 }
		);
	});

	it('error sections preserve ClientError category and sanitize message to empty string', async () => {
		await fc.assert(
			fc.asyncProperty(clientErrorArb, async (err) => {
				const result = await callSection(async () => {
					throw err;
				});

				expect(result.status).toBe('error');
				if (result.status === 'error') {
					expect(result.error.category).toBe(err.category);
					expect(result.error.message).toBe('');
				}
			}),
			{ numRuns: 100 }
		);
	});

	it('ok sections return the exact data from the resolved promise', async () => {
		await fc.assert(
			fc.asyncProperty(fc.string({ minLength: 0, maxLength: 100 }), async (data) => {
				const result = await callSection(async () => data);

				expect(result.status).toBe('ok');
				if (result.status === 'ok') {
					expect(result.data).toBe(data);
				}
			}),
			{ numRuns: 100 }
		);
	});

	it('non-ClientError exceptions produce error status with category request_error and sanitized empty message', async () => {
		await fc.assert(
			fc.asyncProperty(fc.string({ minLength: 1, maxLength: 50 }), async (message) => {
				const result = await callSection(async () => {
					throw new Error(message);
				});

				expect(result.status).toBe('error');
				if (result.status === 'error') {
					expect(result.error.category).toBe('request_error');
					expect(result.error.message).toBe('');
				}
			}),
			{ numRuns: 100 }
		);
	});

	it('independent sections do not affect each other — mixed success/failure', async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.array(
					fc.record({
						throws: fc.boolean(),
						error: clientErrorArb,
						data: fc.integer()
					}),
					{ minLength: 2, maxLength: 8 }
				),
				async (specs) => {
					// Run sections concurrently (as load functions do via Promise.allSettled)
					const results = await Promise.all(
						specs.map((spec) =>
							callSection(async () => {
								if (spec.throws) throw spec.error;
								return spec.data;
							})
						)
					);

					// Each result must be either ok or error — never throws to caller
					for (let i = 0; i < specs.length; i++) {
						const spec = specs[i];
						const result = results[i];

						if (spec.throws) {
							expect(result.status).toBe('error');
						} else {
							expect(result.status).toBe('ok');
							if (result.status === 'ok') {
								expect(result.data).toBe(spec.data);
							}
						}
					}
				}
			),
			{ numRuns: 200 }
		);
	});
});
