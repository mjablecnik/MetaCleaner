// Feature: monitoring-real-api-integration, Property 6: MRR Normalization
// For any set of subscriptions with varying billing intervals, MRR equals the sum of
// normalized monthly amounts; ARPU equals MRR / active count; plan revenue percentages
// sum to 100% (±1% rounding tolerance).
// Validates: Requirements 8.1, 8.2, 8.3

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { StripeSubscriptionRaw, StripePriceRaw } from '../../clients/stripeClient.js';
import { computeMrr, computeArpu, mapToPlanRevenue } from '../stripeMapper.js';

// Arbitrary for a single subscription item with a specific interval
const stripeItemArb = fc.record({
	price: fc.record({
		id: fc.string({ minLength: 5, maxLength: 20 }),
		unit_amount: fc.integer({ min: 100, max: 100_000 }),
		recurring: fc.record({
			interval: fc.constantFrom('month', 'year', 'week') as fc.Arbitrary<'month' | 'year' | 'week'>,
			interval_count: fc.integer({ min: 1, max: 12 })
		})
	}),
	quantity: fc.integer({ min: 1, max: 10 })
});

const stripeSubArb: fc.Arbitrary<StripeSubscriptionRaw> = fc.record({
	id: fc.string({ minLength: 5, maxLength: 20 }),
	status: fc.constantFrom('active', 'canceled') as fc.Arbitrary<'active' | 'canceled'>,
	items: fc.record({
		data: fc.array(stripeItemArb, { minLength: 1, maxLength: 3 })
	}),
	created: fc.integer({ min: 1_600_000_000, max: 1_900_000_000 }),
	canceled_at: fc.option(fc.integer({ min: 1_600_000_000, max: 1_900_000_000 })),
	current_period_start: fc.integer({ min: 1_600_000_000, max: 1_900_000_000 })
});

const stripePriceArb: fc.Arbitrary<StripePriceRaw> = fc.record({
	id: fc.string({ minLength: 5, maxLength: 20 }),
	product: fc.string({ minLength: 5, maxLength: 20 }),
	unit_amount: fc.integer({ min: 0, max: 100_000 }),
	nickname: fc.option(fc.string({ minLength: 1, maxLength: 30 }))
});

// Compute the expected MRR directly from subscription items
function expectedMrrFromSubs(subs: StripeSubscriptionRaw[]): number {
	let mrr = 0;
	for (const sub of subs) {
		for (const item of sub.items.data) {
			const { unit_amount, recurring } = item.price;
			const quantity = item.quantity ?? 1;
			const amount = unit_amount * quantity;
			const count = recurring.interval_count > 0 ? recurring.interval_count : 1;
			if (recurring.interval === 'month') mrr += amount / count;
			else if (recurring.interval === 'year') mrr += amount / (12 * count);
			else if (recurring.interval === 'week') mrr += (amount * 52) / (12 * count);
		}
	}
	return mrr;
}

describe('Property 6: MRR Normalization', () => {
	it('normalizes all billing intervals to monthly equivalent', () => {
		fc.assert(
			fc.property(fc.array(stripeSubArb, { minLength: 1, maxLength: 50 }), (subs) => {
				const mrr = computeMrr(subs);
				const expected = expectedMrrFromSubs(subs);
				expect(mrr).toBeCloseTo(expected, 0);
			}),
			{ numRuns: 100 }
		);
	});

	it('monthly subscriptions are included unchanged (divide by interval_count)', () => {
		// A single subscription with monthly billing and interval_count=1 should
		// contribute exactly unit_amount * quantity to MRR
		fc.assert(
			fc.property(
				fc.integer({ min: 100, max: 100_000 }),
				fc.integer({ min: 1, max: 10 }),
				(unitAmount, quantity) => {
					const sub: StripeSubscriptionRaw = {
						id: 'sub_1',
						status: 'active',
						items: {
							data: [
								{
									price: {
										id: 'price_monthly',
										unit_amount: unitAmount,
										recurring: { interval: 'month', interval_count: 1 }
									},
									quantity
								}
							]
						},
						created: 1_700_000_000,
						canceled_at: null,
						current_period_start: 1_700_000_000
					};
					const mrr = computeMrr([sub]);
					expect(mrr).toBeCloseTo(unitAmount * quantity, 0);
				}
			),
			{ numRuns: 100 }
		);
	});

	it('yearly subscriptions are normalized to monthly (divide by 12 * interval_count)', () => {
		fc.assert(
			fc.property(
				fc.integer({ min: 1200, max: 1_200_000 }),
				fc.integer({ min: 1, max: 3 }),
				(unitAmount, intervalCount) => {
					const sub: StripeSubscriptionRaw = {
						id: 'sub_1',
						status: 'active',
						items: {
							data: [
								{
									price: {
										id: 'price_yearly',
										unit_amount: unitAmount,
										recurring: { interval: 'year', interval_count: intervalCount }
									},
									quantity: 1
								}
							]
						},
						created: 1_700_000_000,
						canceled_at: null,
						current_period_start: 1_700_000_000
					};
					const mrr = computeMrr([sub]);
					expect(mrr).toBeCloseTo(unitAmount / (12 * intervalCount), 0);
				}
			),
			{ numRuns: 100 }
		);
	});

	it('weekly subscriptions are normalized to monthly (amount * 52 / 12 / interval_count)', () => {
		fc.assert(
			fc.property(
				fc.integer({ min: 100, max: 10_000 }),
				fc.integer({ min: 1, max: 4 }),
				(unitAmount, intervalCount) => {
					const sub: StripeSubscriptionRaw = {
						id: 'sub_1',
						status: 'active',
						items: {
							data: [
								{
									price: {
										id: 'price_weekly',
										unit_amount: unitAmount,
										recurring: { interval: 'week', interval_count: intervalCount }
									},
									quantity: 1
								}
							]
						},
						created: 1_700_000_000,
						canceled_at: null,
						current_period_start: 1_700_000_000
					};
					const mrr = computeMrr([sub]);
					expect(mrr).toBeCloseTo((unitAmount * 52) / (12 * intervalCount), 0);
				}
			),
			{ numRuns: 100 }
		);
	});

	it('ARPU equals MRR divided by active subscriber count', () => {
		fc.assert(
			fc.property(fc.array(stripeSubArb, { minLength: 1, maxLength: 50 }), (subs) => {
				const mrr = computeMrr(subs);
				const arpu = computeArpu(mrr, subs.length);
				expect(arpu).toBeCloseTo(mrr / subs.length, 5);
			}),
			{ numRuns: 100 }
		);
	});

	it('ARPU is zero when active count is zero', () => {
		const mrr = computeMrr([]);
		const arpu = computeArpu(mrr, 0);
		expect(arpu).toBe(0);
	});

	it('plan revenue percentages sum to 100% (±1% rounding tolerance)', () => {
		fc.assert(
			fc.property(
				fc.array(stripeSubArb, { minLength: 1, maxLength: 20 }),
				fc.array(stripePriceArb, { maxLength: 5 }),
				(activeSubs, prices) => {
					const result = mapToPlanRevenue(activeSubs, prices);
					if (result.length === 0) return;

					const totalPercent = result.reduce((sum, entry) => {
						// entry.percent is formatted as "XX.X%"
						return sum + parseFloat(entry.percent);
					}, 0);

					expect(totalPercent).toBeGreaterThanOrEqual(99);
					expect(totalPercent).toBeLessThanOrEqual(101);
				}
			),
			{ numRuns: 100 }
		);
	});

	it('MRR is additive across multiple subscriptions', () => {
		// MRR of combined subs should equal sum of individual MRRs
		fc.assert(
			fc.property(
				fc.array(stripeSubArb, { minLength: 1, maxLength: 10 }),
				fc.array(stripeSubArb, { minLength: 1, maxLength: 10 }),
				(subs1, subs2) => {
					const mrr1 = computeMrr(subs1);
					const mrr2 = computeMrr(subs2);
					const mrrCombined = computeMrr([...subs1, ...subs2]);
					expect(mrrCombined).toBeCloseTo(mrr1 + mrr2, 0);
				}
			),
			{ numRuns: 100 }
		);
	});

	it('MRR is non-negative for any subscription set', () => {
		fc.assert(
			fc.property(fc.array(stripeSubArb, { maxLength: 50 }), (subs) => {
				const mrr = computeMrr(subs);
				expect(mrr).toBeGreaterThanOrEqual(0);
			}),
			{ numRuns: 100 }
		);
	});
});
