// Feature: monitoring-real-api-integration, Property 8: Dashboard Alert Merge and Sort
// Merged alerts sorted by timestamp desc, at most 10 entries, severity correctly derived from source.
// Validates: Requirements 13.3

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
	mergeAndSortAlerts,
	deriveSentrySeverity,
	deriveFlySeverity,
	flyTsToMs
} from '../dashboardAlerts.js';
import type { FlyMachineRaw } from '../clients/flyClient.js';
import type { SentryIssueRaw } from '../clients/sentryClient.js';

const NOW = 1_700_000_000_000; // fixed reference time for tests

// Arbitraries

const isoTimestampArb = fc
	.integer({ min: 0, max: 1_699_999_999 })
	.map((s) => new Date(s * 1000).toISOString());

const sentryLevelArb = fc.constantFrom('fatal', 'error', 'warning', 'info', 'debug');

const sentryIssueArb: fc.Arbitrary<SentryIssueRaw> = fc.record({
	id: fc.string({ minLength: 1, maxLength: 20 }),
	title: fc.string({ minLength: 1, maxLength: 80 }),
	culprit: fc.string({ minLength: 0, maxLength: 80 }),
	status: fc.constantFrom('unresolved', 'resolved', 'ignored'),
	level: sentryLevelArb,
	lastSeen: isoTimestampArb,
	firstSeen: isoTimestampArb,
	count: fc.integer({ min: 1, max: 9999 }).map(String),
	userCount: fc.integer({ min: 0, max: 999 }),
	metadata: fc.record({ type: fc.option(fc.string(), { nil: undefined }), value: fc.option(fc.string(), { nil: undefined }) }),
	type: fc.string({ minLength: 1, maxLength: 20 }),
	tags: fc.constant([])
});

const flyEventTypeArb = fc.constantFrom('launch', 'start', 'crash', 'exit', 'restart', 'stop');
const flyEventStatusArb = fc.constantFrom('success', 'failed', 'error');

const flyMachineArb: fc.Arbitrary<FlyMachineRaw> = fc.record({
	id: fc.string({ minLength: 1, maxLength: 20 }),
	name: fc.string({ minLength: 1, maxLength: 30 }),
	state: fc.constantFrom('started', 'stopped'),
	region: fc.string({ minLength: 3, maxLength: 3 }),
	config: fc.record({ guest: fc.record({ cpus: fc.integer({ min: 1, max: 8 }), memory_mb: fc.integer({ min: 256, max: 8192 }) }) }),
	checks: fc.constant(undefined),
	created_at: isoTimestampArb,
	updated_at: isoTimestampArb,
	events: fc.array(
		fc.record({
			type: flyEventTypeArb,
			timestamp: fc.integer({ min: 1_000_000_000, max: 1_699_999_999 }),
			status: flyEventStatusArb
		}),
		{ minLength: 0, maxLength: 5 }
	)
});

const flyMachinesMapArb: fc.Arbitrary<Map<string, FlyMachineRaw[]>> = fc
	.array(
		fc.tuple(
			fc.string({ minLength: 1, maxLength: 20 }),
			fc.array(flyMachineArb, { minLength: 0, maxLength: 3 })
		),
		{ minLength: 0, maxLength: 4 }
	)
	.map((entries) => new Map(entries));

describe('Property 8: Dashboard Alert Merge and Sort', () => {
	it('result has at most 10 entries', () => {
		fc.assert(
			fc.property(
				fc.array(sentryIssueArb, { minLength: 0, maxLength: 20 }),
				flyMachinesMapArb,
				(sentryIssues, flyMachines) => {
					const alerts = mergeAndSortAlerts(sentryIssues, flyMachines, NOW);
					expect(alerts.length).toBeLessThanOrEqual(10);
				}
			),
			{ numRuns: 200 }
		);
	});

	it('result is sorted by timestamp descending', () => {
		fc.assert(
			fc.property(
				fc.array(sentryIssueArb, { minLength: 0, maxLength: 20 }),
				flyMachinesMapArb,
				(sentryIssues, flyMachines) => {
					const alerts = mergeAndSortAlerts(sentryIssues, flyMachines, NOW);
					// Reconstruct timestamps from timeMobile/timeDesktop is not possible directly,
					// so we verify the invariant by checking ids correspond to ordered timestamps.
					// We verify via re-running the merge with tracking:
					// Instead, extract ms from sentry lastSeen and fly event timestamps and verify ordering.

					// Build the expected ordered set by collecting all source timestamps
					const sentryMsMap: Record<string, number> = {};
					for (const issue of sentryIssues.filter((i) => i.status === 'unresolved')) {
						sentryMsMap[`sentry-${issue.id}`] = new Date(issue.lastSeen).getTime();
					}

					const flyMsMap: Record<string, number> = {};
					for (const [, machines] of flyMachines) {
						for (const machine of machines) {
							for (const event of machine.events ?? []) {
								flyMsMap[`fly-${machine.id}-${event.timestamp}`] = flyTsToMs(event.timestamp);
							}
						}
					}

					const tsMap = { ...sentryMsMap, ...flyMsMap };

					// Extract timestamps for alerts that have known ids
					const timestamps = alerts
						.filter((a) => tsMap[a.id] !== undefined)
						.map((a) => tsMap[a.id]);

					for (let i = 1; i < timestamps.length; i++) {
						expect(timestamps[i]).toBeLessThanOrEqual(timestamps[i - 1]);
					}
				}
			),
			{ numRuns: 200 }
		);
	});

	it('only unresolved Sentry issues appear (at most 5)', () => {
		fc.assert(
			fc.property(
				fc.array(sentryIssueArb, { minLength: 0, maxLength: 20 }),
				(sentryIssues) => {
					const alerts = mergeAndSortAlerts(sentryIssues, null, NOW);
					const sentryAlerts = alerts.filter((a) => a.id.startsWith('sentry-'));
					expect(sentryAlerts.length).toBeLessThanOrEqual(5);

					const resolvedIds = new Set(
						sentryIssues
							.filter((i) => i.status !== 'unresolved')
							.map((i) => `sentry-${i.id}`)
					);
					for (const alert of sentryAlerts) {
						expect(resolvedIds.has(alert.id)).toBe(false);
					}
				}
			),
			{ numRuns: 200 }
		);
	});

	it('Fly events of type launch or start are excluded', () => {
		fc.assert(
			fc.property(flyMachinesMapArb, (flyMachines) => {
				const alerts = mergeAndSortAlerts(null, flyMachines, NOW);
				const flyAlerts = alerts.filter((a) => a.id.startsWith('fly-'));

				// Build set of launch/start event ids
				const skippedIds = new Set<string>();
				for (const [, machines] of flyMachines) {
					for (const machine of machines) {
						for (const event of machine.events ?? []) {
							if (event.type === 'launch' || event.type === 'start') {
								skippedIds.add(`fly-${machine.id}-${event.timestamp}`);
							}
						}
					}
				}

				for (const alert of flyAlerts) {
					expect(skippedIds.has(alert.id)).toBe(false);
				}
			}),
			{ numRuns: 200 }
		);
	});

	it('Sentry severity: warning/info level → warning, all others → error', () => {
		expect(deriveSentrySeverity('warning')).toBe('warning');
		expect(deriveSentrySeverity('info')).toBe('warning');
		expect(deriveSentrySeverity('error')).toBe('error');
		expect(deriveSentrySeverity('fatal')).toBe('error');
		expect(deriveSentrySeverity('debug')).toBe('error');

		fc.assert(
			fc.property(sentryLevelArb, (level) => {
				const severity = deriveSentrySeverity(level);
				expect(['error', 'warning']).toContain(severity);
				if (level === 'warning' || level === 'info') {
					expect(severity).toBe('warning');
				} else {
					expect(severity).toBe('error');
				}
			}),
			{ numRuns: 100 }
		);
	});

	it('Fly severity: crash/exit/non-success → error, otherwise → warning', () => {
		expect(deriveFlySeverity('crash', 'success')).toBe('error');
		expect(deriveFlySeverity('exit', 'success')).toBe('error');
		expect(deriveFlySeverity('restart', 'failed')).toBe('error');
		expect(deriveFlySeverity('restart', 'success')).toBe('warning');
		expect(deriveFlySeverity('stop', 'success')).toBe('warning');

		fc.assert(
			fc.property(flyEventTypeArb, flyEventStatusArb, (type, status) => {
				const severity = deriveFlySeverity(type, status);
				expect(['error', 'warning']).toContain(severity);
				if (type === 'crash' || type === 'exit' || status !== 'success') {
					expect(severity).toBe('error');
				} else {
					expect(severity).toBe('warning');
				}
			}),
			{ numRuns: 100 }
		);
	});

	it('null inputs produce empty result', () => {
		const alerts = mergeAndSortAlerts(null, null, NOW);
		expect(alerts).toEqual([]);
	});

	it('empty arrays produce empty result', () => {
		const alerts = mergeAndSortAlerts([], new Map(), NOW);
		expect(alerts).toEqual([]);
	});

	it('Sentry issues with status !== unresolved are not included', () => {
		const resolvedIssue: SentryIssueRaw = {
			id: 'r1',
			title: 'Resolved error',
			culprit: 'test',
			status: 'resolved',
			level: 'error',
			lastSeen: new Date(NOW - 1000).toISOString(),
			firstSeen: new Date(NOW - 10000).toISOString(),
			count: '1',
			userCount: 0,
			metadata: {},
			type: 'error',
			tags: []
		};
		const alerts = mergeAndSortAlerts([resolvedIssue], null, NOW);
		expect(alerts).toHaveLength(0);
	});

	it('exactly the top 5 Fly events by timestamp are included when more than 5 exist', () => {
		const timestamps = [100, 200, 300, 400, 500, 600, 700];
		const machine: FlyMachineRaw = {
			id: 'machine1',
			name: 'web-1',
			state: 'started',
			region: 'ams',
			config: { guest: { cpus: 1, memory_mb: 256 } },
			checks: undefined,
			created_at: new Date(1000).toISOString(),
			updated_at: new Date(1000).toISOString(),
			events: timestamps.map((ts) => ({ type: 'crash', timestamp: ts, status: 'failed' }))
		};

		const flyMap = new Map([['app1', [machine]]]);
		const alerts = mergeAndSortAlerts(null, flyMap, NOW);

		// Only top 5 by timestamp desc → timestamps 700, 600, 500, 400, 300
		expect(alerts).toHaveLength(5);
		const expectedTopTimestamps = [700, 600, 500, 400, 300];
		for (let i = 0; i < 5; i++) {
			expect(alerts[i].id).toBe(`fly-machine1-${expectedTopTimestamps[i]}`);
		}
	});
});
