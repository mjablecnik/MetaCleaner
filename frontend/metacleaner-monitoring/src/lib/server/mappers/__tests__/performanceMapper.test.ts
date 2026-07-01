// Feature: monitoring-real-api-integration, Property 9: Apdex and Performance Metrics
// Apdex = (satisfied + tolerating * 0.5) / total with 500ms/2000ms thresholds.
// error rate = (5xx count / total) * 100
// Validates: Requirements 14.2

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { computeApdex, mapToPerformanceKpiStats } from '../performanceMapper.js';
import type { CfAnalyticsRaw } from '../../clients/cloudflareClient.js';
import type { FlyMachineRaw } from '../../clients/flyClient.js';
import type { SentryIssueRaw } from '../../clients/sentryClient.js';

// --- Arbitraries ---

const nonNegIntArb = fc.integer({ min: 0, max: 100_000 });

// Generates satisfied, tolerating, frustrated counts; total = sum
const apdexInputArb = fc
	.tuple(nonNegIntArb, nonNegIntArb, nonNegIntArb)
	.map(([satisfied, tolerating, frustrated]) => ({
		satisfied,
		tolerating,
		frustrated,
		total: satisfied + tolerating + frustrated
	}));

const isoTimestampArb = fc
	.integer({ min: 1_000_000_000, max: 1_700_000_000 })
	.map((s) => new Date(s * 1000).toISOString());

const sentryLevelArb = fc.constantFrom('fatal', 'error', 'warning', 'info', 'debug' as const);

const sentryIssueArb: fc.Arbitrary<SentryIssueRaw> = fc.record({
	id: fc.string({ minLength: 1, maxLength: 20 }),
	title: fc.string({ minLength: 1, maxLength: 80 }),
	culprit: fc.string({ minLength: 0, maxLength: 80 }),
	status: fc.constantFrom('unresolved', 'resolved', 'ignored' as const),
	level: sentryLevelArb,
	lastSeen: isoTimestampArb,
	firstSeen: isoTimestampArb,
	count: fc.integer({ min: 1, max: 9999 }).map(String),
	userCount: fc.integer({ min: 0, max: 999 }),
	metadata: fc.record({
		type: fc.option(fc.string(), { nil: undefined }),
		value: fc.option(fc.string(), { nil: undefined })
	}),
	type: fc.string({ minLength: 1, maxLength: 20 }),
	tags: fc.constant([])
});

const cfAnalyticsArb: fc.Arbitrary<CfAnalyticsRaw> = fc.record({
	httpRequests1dGroups: fc.array(
		fc.record({
			sum: fc.record({
				requests: fc.integer({ min: 0, max: 1_000_000 }),
				cachedRequests: fc.integer({ min: 0, max: 500_000 }),
				bytes: fc.integer({ min: 0, max: 1_000_000_000 }),
				cachedBytes: fc.integer({ min: 0, max: 500_000_000 }),
				threats: fc.integer({ min: 0, max: 10_000 })
			}),
			dimensions: fc.record({ date: fc.string() })
		}),
		{ minLength: 0, maxLength: 7 }
	)
});

const flyMachineArb: fc.Arbitrary<FlyMachineRaw> = fc.record({
	id: fc.string({ minLength: 1, maxLength: 20 }),
	name: fc.string({ minLength: 1, maxLength: 30 }),
	state: fc.constantFrom('started', 'stopped' as const),
	region: fc.string({ minLength: 3, maxLength: 3 }),
	config: fc.record({
		guest: fc.record({
			cpus: fc.integer({ min: 1, max: 8 }),
			memory_mb: fc.integer({ min: 256, max: 8192 })
		})
	}),
	checks: fc.constant(undefined),
	created_at: isoTimestampArb,
	updated_at: isoTimestampArb,
	events: fc.constant([])
});

const flyMachinesMapArb: fc.Arbitrary<Map<string, FlyMachineRaw[]>> = fc
	.array(
		fc.tuple(
			fc.string({ minLength: 1, maxLength: 20 }),
			fc.array(flyMachineArb, { minLength: 0, maxLength: 5 })
		),
		{ minLength: 0, maxLength: 4 }
	)
	.map((entries) => new Map(entries));

// --- Property 9 tests: computeApdex ---

describe('Property 9: Apdex Formula', () => {
	it('result is always in [0, 1] for any non-negative inputs', () => {
		fc.assert(
			fc.property(apdexInputArb, ({ satisfied, tolerating, total }) => {
				const result = computeApdex(satisfied, tolerating, total);
				expect(result).toBeGreaterThanOrEqual(0);
				expect(result).toBeLessThanOrEqual(1);
			}),
			{ numRuns: 500 }
		);
	});

	it('returns 1.0 when total is 0', () => {
		expect(computeApdex(0, 0, 0)).toBe(1.0);
		fc.assert(
			fc.property(fc.integer({ min: 0, max: 1000 }), fc.integer({ min: 0, max: 1000 }), (a, b) => {
				// total = 0 regardless of satisfied/tolerating if we call with total=0
				expect(computeApdex(a, b, 0)).toBe(1.0);
			}),
			{ numRuns: 100 }
		);
	});

	it('equals 1.0 when all requests are satisfied (tolerating = 0, total = satisfied)', () => {
		fc.assert(
			fc.property(fc.integer({ min: 1, max: 100_000 }), (n) => {
				expect(computeApdex(n, 0, n)).toBe(1.0);
			}),
			{ numRuns: 200 }
		);
	});

	it('equals 0.5 when all requests are tolerating (satisfied = 0, total = tolerating)', () => {
		fc.assert(
			fc.property(fc.integer({ min: 1, max: 100_000 }), (n) => {
				const result = computeApdex(0, n, n);
				expect(result).toBeCloseTo(0.5, 10);
			}),
			{ numRuns: 200 }
		);
	});

	it('equals 0 when all requests are frustrated (satisfied = 0, tolerating = 0)', () => {
		fc.assert(
			fc.property(fc.integer({ min: 1, max: 100_000 }), (n) => {
				expect(computeApdex(0, 0, n)).toBe(0);
			}),
			{ numRuns: 200 }
		);
	});

	it('satisfies the Apdex formula: (satisfied + tolerating * 0.5) / total', () => {
		fc.assert(
			fc.property(apdexInputArb, ({ satisfied, tolerating, total }) => {
				if (total === 0) return;
				const expected = (satisfied + tolerating * 0.5) / total;
				const result = computeApdex(satisfied, tolerating, total);
				// clamp to [0,1]
				const clamped = Math.max(0, Math.min(1, expected));
				expect(result).toBeCloseTo(clamped, 10);
			}),
			{ numRuns: 500 }
		);
	});

	it('is monotonically non-decreasing as satisfied count increases (tolerating, total fixed)', () => {
		fc.assert(
			fc.property(
				fc.integer({ min: 1, max: 1000 }),
				fc.integer({ min: 0, max: 500 }),
				fc.integer({ min: 1, max: 500 }),
				(satisfied, tolerating, extra) => {
					const total = satisfied + tolerating;
					if (total <= 0) return;
					const a1 = computeApdex(satisfied, tolerating, total);
					const a2 = computeApdex(satisfied + extra, tolerating, total + extra);
					// More satisfied requests with same tolerating → apdex should not decrease
					expect(a2).toBeGreaterThanOrEqual(a1 - 1e-10);
				}
			),
			{ numRuns: 200 }
		);
	});
});

// --- Property 9 tests: mapToPerformanceKpiStats output invariants ---

describe('Property 9: Performance KPI Stats Invariants', () => {
	it('always returns exactly 4 KPI stats', () => {
		fc.assert(
			fc.property(
				fc.option(cfAnalyticsArb, { nil: null }),
				fc.option(flyMachinesMapArb, { nil: null }),
				fc.array(sentryIssueArb, { minLength: 0, maxLength: 10 }),
				(cfData, flyData, issues) => {
					const result = mapToPerformanceKpiStats(cfData, flyData, issues);
					expect(result).toHaveLength(4);
				}
			),
			{ numRuns: 200 }
		);
	});

	it('always returns KPIs with keys: apdex, uptime, throughput, errorRate', () => {
		fc.assert(
			fc.property(
				fc.option(cfAnalyticsArb, { nil: null }),
				fc.option(flyMachinesMapArb, { nil: null }),
				fc.array(sentryIssueArb, { minLength: 0, maxLength: 10 }),
				(cfData, flyData, issues) => {
					const result = mapToPerformanceKpiStats(cfData, flyData, issues);
					const keys = result.map((kpi) => kpi.key);
					expect(keys).toContain('apdex');
					expect(keys).toContain('uptime');
					expect(keys).toContain('throughput');
					expect(keys).toContain('errorRate');
				}
			),
			{ numRuns: 200 }
		);
	});

	it('Apdex value is always "—" (no latency source wired in)', () => {
		fc.assert(
			fc.property(
				fc.option(cfAnalyticsArb, { nil: null }),
				fc.option(flyMachinesMapArb, { nil: null }),
				fc.array(sentryIssueArb, { minLength: 0, maxLength: 10 }),
				(cfData, flyData, issues) => {
					const result = mapToPerformanceKpiStats(cfData, flyData, issues);
					const apdexKpi = result.find((kpi) => kpi.key === 'apdex');
					expect(apdexKpi).toBeDefined();
					// No real latency source → always renders '—' rather than a fabricated value
					expect(apdexKpi!.value).toBe('—');
					expect(apdexKpi!.barWidth).toBeUndefined();
				}
			),
			{ numRuns: 200 }
		);
	});

	it('error rate is "—" when no Cloudflare data (≤1000 requests), numeric otherwise', () => {
		fc.assert(
			fc.property(
				fc.option(cfAnalyticsArb, { nil: null }),
				fc.option(flyMachinesMapArb, { nil: null }),
				fc.array(sentryIssueArb, { minLength: 0, maxLength: 10 }),
				(cfData, flyData, issues) => {
					const result = mapToPerformanceKpiStats(cfData, flyData, issues);
					const errKpi = result.find((kpi) => kpi.key === 'errorRate');
					expect(errKpi).toBeDefined();
					const val = errKpi!.value;
					if (val === '—') return; // No CF data — honest empty state
					const errVal = parseFloat(val);
					expect(isNaN(errVal)).toBe(false);
					expect(errVal).toBeGreaterThanOrEqual(0);
				}
			),
			{ numRuns: 200 }
		);
	});

	it('throughput is always a non-negative integer', () => {
		fc.assert(
			fc.property(
				fc.option(cfAnalyticsArb, { nil: null }),
				fc.option(flyMachinesMapArb, { nil: null }),
				fc.array(sentryIssueArb, { minLength: 0, maxLength: 10 }),
				(cfData, flyData, issues) => {
					const result = mapToPerformanceKpiStats(cfData, flyData, issues);
					const tpKpi = result.find((kpi) => kpi.key === 'throughput');
					expect(tpKpi).toBeDefined();
					// value may have locale separators (e.g. cs-CZ uses non-breaking space)
					const raw = tpKpi!.value.replace(/\s/g, '').replace(/\u00A0/g, '');
					const tpVal = parseInt(raw, 10);
					expect(isNaN(tpVal)).toBe(false);
					expect(tpVal).toBeGreaterThanOrEqual(0);
				}
			),
			{ numRuns: 200 }
		);
	});

	it('uptime is always a percentage in [0, 100]', () => {
		fc.assert(
			fc.property(
				fc.option(cfAnalyticsArb, { nil: null }),
				fc.option(flyMachinesMapArb, { nil: null }),
				fc.array(sentryIssueArb, { minLength: 0, maxLength: 10 }),
				(cfData, flyData, issues) => {
					const result = mapToPerformanceKpiStats(cfData, flyData, issues);
					const uptimeKpi = result.find((kpi) => kpi.key === 'uptime');
					expect(uptimeKpi).toBeDefined();
					const uptimeVal = parseFloat(uptimeKpi!.value);
					expect(isNaN(uptimeVal)).toBe(false);
					expect(uptimeVal).toBeGreaterThanOrEqual(0);
					expect(uptimeVal).toBeLessThanOrEqual(100);
				}
			),
			{ numRuns: 200 }
		);
	});

	it('when all Fly machines are started, uptime is 100%', () => {
		fc.assert(
			fc.property(fc.array(flyMachineArb, { minLength: 1, maxLength: 10 }), (machines) => {
				const allStarted = machines.map((m) => ({ ...m, state: 'started' as const }));
				const flyMap = new Map([['app', allStarted]]);
				const result = mapToPerformanceKpiStats(null, flyMap, []);
				const uptimeKpi = result.find((kpi) => kpi.key === 'uptime')!;
				expect(parseFloat(uptimeKpi.value)).toBeCloseTo(100, 5);
			}),
			{ numRuns: 100 }
		);
	});

	it('when all Fly machines are stopped, uptime is 0%', () => {
		fc.assert(
			fc.property(fc.array(flyMachineArb, { minLength: 1, maxLength: 10 }), (machines) => {
				const allStopped = machines.map((m) => ({ ...m, state: 'stopped' as const }));
				const flyMap = new Map([['app', allStopped]]);
				const result = mapToPerformanceKpiStats(null, flyMap, []);
				const uptimeKpi = result.find((kpi) => kpi.key === 'uptime')!;
				expect(parseFloat(uptimeKpi.value)).toBeCloseTo(0, 5);
			}),
			{ numRuns: 100 }
		);
	});

	it('all KPI stats have required fields present and non-empty', () => {
		const requiredFields = ['key', 'labelKey', 'value', 'badgeKey', 'badgeClass'] as const;

		fc.assert(
			fc.property(
				fc.option(cfAnalyticsArb, { nil: null }),
				fc.option(flyMachinesMapArb, { nil: null }),
				fc.array(sentryIssueArb, { minLength: 0, maxLength: 5 }),
				(cfData, flyData, issues) => {
					const result = mapToPerformanceKpiStats(cfData, flyData, issues);
					for (const kpi of result) {
						for (const field of requiredFields) {
							expect(
								kpi[field],
								`KPI "${kpi.key}" field "${field}" must not be undefined`
							).not.toBeUndefined();
							expect(kpi[field], `KPI "${kpi.key}" field "${field}" must not be empty`).not.toBe(
								''
							);
						}
					}
				}
			),
			{ numRuns: 100 }
		);
	});
});
