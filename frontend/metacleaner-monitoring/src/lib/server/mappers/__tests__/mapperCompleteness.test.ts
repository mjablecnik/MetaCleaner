// Feature: monitoring-real-api-integration, Property 5: Mapper Completeness
// For any valid raw API response, every required field in the target Repository_Interface
// is present and non-undefined in every element of the mapper output.
// Validates: Requirements 3.2, 11.1, 11.4

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { FlyMachineRaw } from '../../clients/flyClient.js';
import type { CfAnalyticsRaw, CfGeoRaw, CfFirewallEventRaw } from '../../clients/cloudflareClient.js';
import type { StripeSubscriptionRaw, StripePriceRaw } from '../../clients/stripeClient.js';
import type { SupabaseTableStatsRaw, SupabaseUserRaw } from '../../clients/supabaseClient.js';
import type { SentryIssueRaw } from '../../clients/sentryClient.js';
import { mapToMachineInstances, mapToDeployEntries, mapToServiceCards, mapToRuntimeStats } from '../flyMapper.js';
import { mapToEdgeKpiStats, mapToGeoDistribution, mapToWafLog, mapToHttpStatusDistribution } from '../cloudflareMapper.js';
import { mapToBusinessKpiStats, mapToPlanRevenue } from '../stripeMapper.js';
import { mapToTableSizes, mapToDbKpis, mapToUserStats, mapToUsers } from '../supabaseMapper.js';
import { mapToErrorLog, mapToErrorKpis } from '../sentryMapper.js';

// Checks that every required field is non-null and non-undefined in each output item.
function assertRequiredFields<T extends Record<string, unknown>>(
	items: T[],
	requiredKeys: readonly (keyof T)[]
): void {
	for (const item of items) {
		for (const key of requiredKeys) {
			expect(item[key], `Field "${String(key)}" must not be undefined`).not.toBeUndefined();
			expect(item[key], `Field "${String(key)}" must not be null`).not.toBeNull();
		}
	}
}

// --- Shared arbitraries ---

const isoDateArb = fc
	.integer({ min: 1_640_000_000_000, max: 1_780_000_000_000 })
	.map((ms) => new Date(ms).toISOString());

// --- Fly.io arbitraries ---

const flyEventArb = fc.record({
	type: fc.constantFrom('start', 'launch', 'restart', 'stop'),
	timestamp: fc.integer({ min: 1_600_000_000_000, max: 1_900_000_000_000 }),
	status: fc.constantFrom('success', 'failed', '')
});

const flyCheckArb = fc.record({
	status: fc.constantFrom('passing', 'failing'),
	name: fc.string({ minLength: 1, maxLength: 30 })
});

const flyMachineArb: fc.Arbitrary<FlyMachineRaw> = fc.record({
	id: fc.string({ minLength: 8, maxLength: 16 }),
	name: fc.string({ minLength: 1, maxLength: 30 }),
	state: fc.constantFrom('started', 'stopped', 'created', 'destroyed'),
	region: fc.constantFrom('fra', 'iad', 'lhr', 'nrt', 'syd', 'unknown'),
	config: fc.record({
		guest: fc.record({
			cpus: fc.integer({ min: 1, max: 8 }),
			memory_mb: fc.integer({ min: 256, max: 4096 })
		})
	}),
	checks: fc.option(fc.array(flyCheckArb)),
	created_at: isoDateArb,
	updated_at: isoDateArb,
	events: fc.option(fc.array(flyEventArb))
});

// Fly machine guaranteed to have at least one launch/start event (needed for deploy entries)
const flyDeployMachineArb: fc.Arbitrary<FlyMachineRaw> = fc.record({
	id: fc.string({ minLength: 8, maxLength: 16 }),
	name: fc.string({ minLength: 1, maxLength: 30 }),
	state: fc.constantFrom('started', 'stopped'),
	region: fc.constantFrom('fra', 'iad', 'lhr', 'nrt'),
	config: fc.record({
		guest: fc.record({
			cpus: fc.integer({ min: 1, max: 4 }),
			memory_mb: fc.integer({ min: 256, max: 2048 })
		})
	}),
	checks: fc.option(fc.array(flyCheckArb)),
	created_at: isoDateArb,
	updated_at: isoDateArb,
	events: fc.array(
		fc.record({
			type: fc.constantFrom('launch', 'start'),
			timestamp: fc.integer({ min: 1_600_000_000_000, max: 1_900_000_000_000 }),
			status: fc.constantFrom('success', 'failed', '')
		}),
		{ minLength: 1, maxLength: 4 }
	)
});

const flyMachineMapArb = fc
	.array(
		fc.tuple(
			fc.string({ minLength: 1, maxLength: 20 }),
			fc.array(flyMachineArb, { minLength: 1, maxLength: 3 })
		),
		{ minLength: 1, maxLength: 3 }
	)
	.map((entries) => new Map(entries));

// --- Cloudflare arbitraries ---

const cfGroupArb = fc.record({
	sum: fc.record({
		requests: fc.nat(),
		cachedRequests: fc.nat(),
		bytes: fc.nat(),
		cachedBytes: fc.nat(),
		threats: fc.nat()
	}),
	dimensions: fc.record({
		date: fc.integer({ min: 1_640_000_000_000, max: 1_780_000_000_000 }).map((ms) => new Date(ms).toISOString().slice(0, 10))
	})
});

const cfAnalyticsArb: fc.Arbitrary<CfAnalyticsRaw> = fc.record({
	httpRequests1dGroups: fc.array(cfGroupArb, { maxLength: 10 })
});

const cfGeoArb: fc.Arbitrary<CfGeoRaw> = fc.record({
	clientCountryMap: fc.array(
		fc.record({
			clientCountryName: fc.string({ minLength: 1, maxLength: 30 }),
			requests: fc.integer({ min: 1, max: 100_000 })
		}),
		{ minLength: 1, maxLength: 20 }
	)
});

const cfFirewallEventArb: fc.Arbitrary<CfFirewallEventRaw> = fc.record({
	action: fc.constantFrom('block', 'challenge', 'jschallenge', 'managedchallenge', 'log'),
	clientIP: fc.string({ minLength: 7, maxLength: 15 }),
	clientCountry: fc.string({ minLength: 2, maxLength: 2 }),
	datetime: isoDateArb,
	ruleId: fc.string({ minLength: 1, maxLength: 20 }),
	source: fc.constantFrom('ddosL7', 'rateLimit', 'botFight', 'waf', 'firewallRules'),
	userAgent: fc.string({ minLength: 0, maxLength: 80 })
});

// --- Stripe arbitraries ---

const stripeItemArb = fc.record({
	price: fc.record({
		id: fc.string({ minLength: 5, maxLength: 20 }),
		unit_amount: fc.integer({ min: 0, max: 100_000 }),
		recurring: fc.record({
			interval: fc.constantFrom('month', 'year', 'week'),
			interval_count: fc.integer({ min: 1, max: 12 })
		})
	}),
	quantity: fc.integer({ min: 1, max: 10 })
});

const stripeSubArb: fc.Arbitrary<StripeSubscriptionRaw> = fc.record({
	id: fc.string({ minLength: 5, maxLength: 20 }),
	status: fc.constantFrom('active', 'canceled'),
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

// --- Supabase arbitraries ---

const supabaseTableStatsArb: fc.Arbitrary<SupabaseTableStatsRaw> = fc.record({
	table_name: fc.string({ minLength: 1, maxLength: 30 }),
	row_count: fc.nat({ max: 10_000_000 }),
	total_bytes: fc.nat({ max: 10_000_000_000 })
});

const supabaseUserArb: fc.Arbitrary<SupabaseUserRaw> = fc.record({
	id: fc.string({ minLength: 5, maxLength: 36 }),
	email: fc.emailAddress(),
	created_at: isoDateArb,
	last_sign_in_at: fc.option(isoDateArb),
	app_metadata: fc.record({
		provider: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
		providers: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 20 })))
	})
});

// --- Sentry arbitraries ---

const sentryIssueArb: fc.Arbitrary<SentryIssueRaw> = fc.record({
	id: fc.string({ minLength: 5, maxLength: 20 }),
	title: fc.string({ minLength: 1, maxLength: 100 }),
	culprit: fc.string({ minLength: 0, maxLength: 100 }),
	status: fc.constantFrom('unresolved', 'resolved', 'ignored'),
	lastSeen: isoDateArb,
	firstSeen: isoDateArb,
	count: fc.nat().map(String),
	userCount: fc.nat(),
	metadata: fc.record({
		type: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
		value: fc.option(fc.string({ minLength: 0, maxLength: 100 })),
		filename: fc.option(fc.string({ minLength: 0, maxLength: 100 }))
	}),
	type: fc.constantFrom('default', 'error', 'csp'),
	tags: fc.option(
		fc.array(
			fc.record({
				key: fc.string({ minLength: 1, maxLength: 20 }),
				value: fc.string({ minLength: 1, maxLength: 20 })
			})
		)
	)
});

// --- Tests ---

describe('Property 5: Mapper Completeness', () => {
	describe('flyMapper', () => {
		it('mapToMachineInstances: all required MachineInstance fields are present', () => {
			const requiredFields = [
				'id', 'name', 'displayId', 'app', 'region', 'status',
				'cpuPercent', 'cpuClass', 'cpuDisplay', 'cpuWarning',
				'ramDisplay', 'ramTotalDisplay', 'ramBarWidth', 'uptime'
			] as const;

			fc.assert(
				fc.property(flyMachineMapArb, (machineMap) => {
					const result = mapToMachineInstances(machineMap);
					assertRequiredFields(result, requiredFields);
				}),
				{ numRuns: 100 }
			);
		});

		it('mapToDeployEntries: all required DeployEntry fields are present', () => {
			const requiredFields = [
				'id', 'version', 'app', 'author', 'commitMessage',
				'timestamp', 'duration', 'status', 'statusClass', 'statusKey',
				'icon', 'iconClass', 'subtext'
			] as const;

			fc.assert(
				fc.property(
					fc.array(flyDeployMachineArb, { minLength: 1, maxLength: 5 }),
					(machines) => {
						const result = mapToDeployEntries(machines);
						assertRequiredFields(result, requiredFields);
					}
				),
				{ numRuns: 100 }
			);
		});

		it('mapToServiceCards: all required ServiceCard fields are present', () => {
			const requiredFields = [
				'key', 'name', 'icon', 'provider', 'status',
				'uptimePercent', 'uptimeDisplay', 'outageCount', 'outageLabel',
				'trend', 'trendPositive', 'barClass', 'downDays', 'degradedDays'
			] as const;

			fc.assert(
				fc.property(flyMachineMapArb, (machineMap) => {
					const result = mapToServiceCards(machineMap);
					assertRequiredFields(result, requiredFields);
				}),
				{ numRuns: 100 }
			);
		});

		it('mapToRuntimeStats: all required RuntimeStat fields are present (always 4 items)', () => {
			const requiredFields = [
				'key', 'labelKey', 'value', 'icon', 'iconClass', 'subtext'
			] as const;

			fc.assert(
				fc.property(flyMachineMapArb, (machineMap) => {
					const result = mapToRuntimeStats(machineMap);
					expect(result).toHaveLength(4);
					assertRequiredFields(result, requiredFields);
				}),
				{ numRuns: 100 }
			);
		});
	});

	describe('cloudflareMapper', () => {
		it('mapToEdgeKpiStats: all required EdgeKpiStat fields are present (always 4 items)', () => {
			const requiredFields = [
				'key', 'labelKey', 'value', 'badgeKey', 'badgeClass', 'subtext'
			] as const;

			fc.assert(
				fc.property(cfAnalyticsArb, (raw) => {
					const result = mapToEdgeKpiStats(raw);
					expect(result).toHaveLength(4);
					assertRequiredFields(result, requiredFields);
				}),
				{ numRuns: 100 }
			);
		});

		it('mapToGeoDistribution: all required GeoDistribution fields are present', () => {
			const requiredFields = [
				'country', 'code', 'flag', 'percent', 'color'
			] as const;

			fc.assert(
				fc.property(cfGeoArb, (raw) => {
					const result = mapToGeoDistribution(raw);
					assertRequiredFields(result, requiredFields);
				}),
				{ numRuns: 100 }
			);
		});

		it('mapToWafLog: all required WafLogEntry fields are present', () => {
			const requiredFields = [
				'id', 'time', 'type', 'typeClass', 'ip', 'country', 'countryFlag',
				'message', 'actionKey', 'actionClass', 'statusKey', 'statusClass'
			] as const;

			fc.assert(
				fc.property(
					fc.array(cfFirewallEventArb, { minLength: 1, maxLength: 20 }),
					(events) => {
						const result = mapToWafLog(events);
						assertRequiredFields(result, requiredFields);
					}
				),
				{ numRuns: 100 }
			);
		});

		it('mapToHttpStatusDistribution: all required HttpStatusDistribution fields are present (always 4 items)', () => {
			const requiredFields = ['code', 'labelKey', 'percent', 'color'] as const;

			fc.assert(
				fc.property(cfAnalyticsArb, (raw) => {
					const result = mapToHttpStatusDistribution(raw);
					expect(result).toHaveLength(4);
					assertRequiredFields(result, requiredFields);
				}),
				{ numRuns: 100 }
			);
		});
	});

	describe('stripeMapper', () => {
		it('mapToBusinessKpiStats: all required BusinessKpiStat fields are present (always 4 items)', () => {
			const requiredFields = [
				'key', 'labelKey', 'value', 'badgeLabel', 'badgeClass', 'subtext'
			] as const;

			fc.assert(
				fc.property(
					fc.array(stripeSubArb),
					fc.array(stripeSubArb),
					(activeSubs, canceledSubs) => {
						const result = mapToBusinessKpiStats(activeSubs, canceledSubs);
						expect(result).toHaveLength(4);
						assertRequiredFields(result, requiredFields);
					}
				),
				{ numRuns: 100 }
			);
		});

		it('mapToPlanRevenue: all required PlanRevenue fields are present', () => {
			const requiredFields = ['id', 'label', 'value', 'color', 'percent'] as const;

			fc.assert(
				fc.property(
					fc.array(stripeSubArb, { minLength: 1, maxLength: 10 }),
					fc.array(stripePriceArb, { maxLength: 5 }),
					(activeSubs, prices) => {
						const result = mapToPlanRevenue(activeSubs, prices);
						assertRequiredFields(result, requiredFields);
					}
				),
				{ numRuns: 100 }
			);
		});
	});

	describe('supabaseMapper', () => {
		it('mapToTableSizes: all required TableSize fields are present', () => {
			const requiredFields = ['name', 'sizeLabel', 'barWidth', 'barClass'] as const;

			fc.assert(
				fc.property(
					fc.array(supabaseTableStatsArb, { minLength: 1, maxLength: 10 }),
					(raw) => {
						const result = mapToTableSizes(raw);
						assertRequiredFields(result, requiredFields);
					}
				),
				{ numRuns: 100 }
			);
		});

		it('mapToDbKpis: all required DbKpi fields are present (always 4 items)', () => {
			const requiredFields = [
				'key', 'labelKey', 'value', 'badgeKey', 'badgeClass', 'subtext'
			] as const;

			fc.assert(
				fc.property(fc.array(supabaseTableStatsArb), (raw) => {
					const result = mapToDbKpis(raw);
					expect(result).toHaveLength(4);
					assertRequiredFields(result, requiredFields);
				}),
				{ numRuns: 100 }
			);
		});

		it('mapToUserStats: all required UserStat fields are present (always 4 items)', () => {
			const requiredFields = [
				'key', 'labelKey', 'value',
				'trendKey', 'trendValue', 'trendPositive',
				'icon', 'iconColor', 'iconBg'
			] as const;

			fc.assert(
				fc.property(
					fc.array(supabaseUserArb),
					fc.option(fc.nat({ max: 100_000 })),
					(users, total) => {
						const result = mapToUserStats(users, total ?? undefined);
						expect(result).toHaveLength(4);
						assertRequiredFields(result, requiredFields);
					}
				),
				{ numRuns: 100 }
			);
		});

		it('mapToUsers: all required User fields are present', () => {
			const requiredFields = [
				'id', 'name', 'email', 'avatar', 'status',
				'registered', 'lastLogin', 'sessions', 'location', 'role'
			] as const;

			fc.assert(
				fc.property(
					fc.array(supabaseUserArb, { minLength: 1, maxLength: 10 }),
					(users) => {
						const result = mapToUsers(users);
						assertRequiredFields(result, requiredFields);
					}
				),
				{ numRuns: 100 }
			);
		});
	});

	describe('sentryMapper', () => {
		it('mapToErrorLog: all required ErrorLogEntry fields are present', () => {
			const requiredFields = [
				'id', 'time', 'type', 'typeClass', 'message', 'source', 'statusKey', 'statusClass'
			] as const;

			fc.assert(
				fc.property(
					fc.array(sentryIssueArb, { minLength: 1, maxLength: 25 }),
					(issues) => {
						const result = mapToErrorLog(issues);
						assertRequiredFields(result, requiredFields);
					}
				),
				{ numRuns: 100 }
			);
		});

		it('mapToErrorKpis: all required ErrorKpi fields are present (always 4 items)', () => {
			const requiredFields = [
				'key', 'labelKey', 'labelKeyMobile',
				'value', 'trend', 'trendUp',
				'valueClass', 'trendClass',
				'severityKey', 'severityClass',
				'subtextKey', 'subtextKeyMobile'
			] as const;

			fc.assert(
				fc.property(fc.array(sentryIssueArb), (issues) => {
					const result = mapToErrorKpis(issues);
					expect(result).toHaveLength(4);
					assertRequiredFields(result, requiredFields);
				}),
				{ numRuns: 100 }
			);
		});
	});
});
