// Feature: monitoring-real-api-integration, Property 10: Health Status Mapping
// Machine state "started" + all checks passing → `online`
// Machine state "started" + any check failing → `degraded`
// "stopped"/"destroyed"/unreachable → `offline`
// Validates: Requirements 6.5

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { FlyMachineRaw } from '../../clients/flyClient.js';
import { mapToServiceCards, mapToMachineInstances } from '../flyMapper.js';

// Minimal valid machine shape for a started machine with all checks passing
const passingCheckArb = fc.record({
	status: fc.constant('passing'),
	name: fc.string({ minLength: 1, maxLength: 20 })
});

const failingCheckArb = fc.record({
	status: fc.constant('failing'),
	name: fc.string({ minLength: 1, maxLength: 20 })
});

const baseMachineArb = fc.record({
	id: fc.string({ minLength: 8, maxLength: 16 }),
	name: fc.string({ minLength: 1, maxLength: 30 }),
	region: fc.constantFrom('fra', 'iad', 'lhr'),
	config: fc.record({
		guest: fc.record({
			cpus: fc.integer({ min: 1, max: 4 }),
			memory_mb: fc.integer({ min: 256, max: 2048 })
		})
	}),
	created_at: fc.constant('2024-01-01T00:00:00Z'),
	updated_at: fc.constant('2024-01-01T00:00:00Z'),
	events: fc.constant([])
});

// Started machine with all passing checks
const startedPassingArb: fc.Arbitrary<FlyMachineRaw> = fc
	.tuple(baseMachineArb, fc.array(passingCheckArb, { minLength: 0, maxLength: 4 }))
	.map(([base, checks]) => ({ ...base, state: 'started', checks }));

// Started machine with at least one failing check
const startedFailingArb: fc.Arbitrary<FlyMachineRaw> = fc
	.tuple(
		baseMachineArb,
		failingCheckArb,
		fc.array(fc.oneof(passingCheckArb, failingCheckArb), { maxLength: 3 })
	)
	.map(([base, failingCheck, extraChecks]) => ({
		...base,
		state: 'started',
		checks: [failingCheck, ...extraChecks]
	}));

// Stopped/destroyed/other non-started machine
const stoppedMachineArb: fc.Arbitrary<FlyMachineRaw> = fc
	.tuple(baseMachineArb, fc.constantFrom('stopped', 'destroyed', 'created'))
	.map(([base, state]) => ({ ...base, state, checks: [] }));

function singleAppMap(machines: FlyMachineRaw[]): Map<string, FlyMachineRaw[]> {
	return new Map([['test-app', machines]]);
}

describe('Property 10: Health Status Mapping', () => {
	describe('mapToServiceCards: app-level status derivation', () => {
		it('no machines → offline', () => {
			const result = mapToServiceCards(singleAppMap([]));
			expect(result).toHaveLength(1);
			expect(result[0].status).toBe('offline');
		});

		it('all non-started machines → offline', () => {
			fc.assert(
				fc.property(
					fc.array(stoppedMachineArb, { minLength: 1, maxLength: 5 }),
					(machines) => {
						const result = mapToServiceCards(singleAppMap(machines));
						expect(result[0].status).toBe('offline');
					}
				),
				{ numRuns: 100 }
			);
		});

		it('started machines + all checks passing → online', () => {
			fc.assert(
				fc.property(
					fc.array(startedPassingArb, { minLength: 1, maxLength: 5 }),
					(machines) => {
						const result = mapToServiceCards(singleAppMap(machines));
						expect(result[0].status).toBe('online');
					}
				),
				{ numRuns: 100 }
			);
		});

		it('started machines + at least one failing check → degraded', () => {
			fc.assert(
				fc.property(
					startedFailingArb,
					fc.array(fc.oneof(startedPassingArb, startedFailingArb), { maxLength: 3 }),
					(failingMachine, otherMachines) => {
						const machines = [failingMachine, ...otherMachines];
						const result = mapToServiceCards(singleAppMap(machines));
						expect(result[0].status).toBe('degraded');
					}
				),
				{ numRuns: 100 }
			);
		});

		it('mix of started+passing and non-started machines → online (any started machine)', () => {
			fc.assert(
				fc.property(
					fc.array(startedPassingArb, { minLength: 1, maxLength: 3 }),
					fc.array(stoppedMachineArb, { minLength: 1, maxLength: 3 }),
					(started, stopped) => {
						const result = mapToServiceCards(singleAppMap([...started, ...stopped]));
						expect(result[0].status).toBe('online');
					}
				),
				{ numRuns: 100 }
			);
		});

		it('status is always one of online | degraded | offline', () => {
			const anyMachineArb: fc.Arbitrary<FlyMachineRaw> = fc.oneof(
				startedPassingArb,
				startedFailingArb,
				stoppedMachineArb
			);

			fc.assert(
				fc.property(fc.array(anyMachineArb, { maxLength: 6 }), (machines) => {
					const result = mapToServiceCards(singleAppMap(machines));
					for (const card of result) {
						expect(['online', 'degraded', 'offline']).toContain(card.status);
					}
				}),
				{ numRuns: 100 }
			);
		});
	});

	describe('mapToMachineInstances: per-machine status derivation', () => {
		it('"started" state → running status', () => {
			fc.assert(
				fc.property(
					fc.array(startedPassingArb, { minLength: 1, maxLength: 5 }),
					(machines) => {
						const result = mapToMachineInstances(singleAppMap(machines));
						for (const instance of result) {
							expect(instance.status).toBe('running');
						}
					}
				),
				{ numRuns: 100 }
			);
		});

		it('"stopped" state → stopped status', () => {
			fc.assert(
				fc.property(
					fc.array(
						baseMachineArb.map((base) => ({ ...base, state: 'stopped', checks: [] })),
						{ minLength: 1, maxLength: 5 }
					),
					(machines) => {
						const result = mapToMachineInstances(singleAppMap(machines));
						for (const instance of result) {
							expect(instance.status).toBe('stopped');
						}
					}
				),
				{ numRuns: 100 }
			);
		});

		it('"destroyed"/"created" state → error status', () => {
			fc.assert(
				fc.property(
					fc.array(
						fc
							.tuple(baseMachineArb, fc.constantFrom('destroyed', 'created'))
							.map(([base, state]) => ({ ...base, state, checks: [] })),
						{ minLength: 1, maxLength: 5 }
					),
					(machines) => {
						const result = mapToMachineInstances(singleAppMap(machines));
						for (const instance of result) {
							expect(instance.status).toBe('error');
						}
					}
				),
				{ numRuns: 100 }
			);
		});

		it('status is always one of running | stopped | error', () => {
			const anyMachineArb: fc.Arbitrary<FlyMachineRaw> = fc.oneof(
				startedPassingArb,
				startedFailingArb,
				stoppedMachineArb
			);

			fc.assert(
				fc.property(
					fc.array(anyMachineArb, { minLength: 1, maxLength: 6 }),
					(machines) => {
						const result = mapToMachineInstances(singleAppMap(machines));
						for (const instance of result) {
							expect(['running', 'stopped', 'error']).toContain(instance.status);
						}
					}
				),
				{ numRuns: 100 }
			);
		});
	});
});
