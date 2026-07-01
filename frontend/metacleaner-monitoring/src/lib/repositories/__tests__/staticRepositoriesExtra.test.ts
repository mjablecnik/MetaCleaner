import { describe, it, expect } from 'vitest';

import {
	getServiceCards,
	getHealthChecks,
	getIncidents,
	getSlaGoals,
	getAvailabilityQuickStats
} from '../availabilityRepository.js';
import {
	getBusinessKpiStats,
	getBusinessSecondaryKpis,
	getOkrGoals,
	getPlanRevenue
} from '../businessRepository.js';
import {
	getDbKpis,
	getTableSizes,
	getDbErrorLog,
	getDatabaseStats,
	getSlowestQueries,
	getQueryTypeDistribution
} from '../databaseRepository.js';
import {
	getEdgeKpiStats,
	getGeoDistribution,
	getWafLog,
	getHttpStatusDistribution
} from '../edgeRepository.js';
import {
	getPerformanceKpiStats,
	getSlowEndpoints,
	getPerformanceEvents
} from '../performanceRepository.js';
import {
	getRuntimeStats,
	getMachineInstances,
	getDeployHistory,
	getRuntimeErrorLog
} from '../runtimeRepository.js';
import { getUserStats, getUsers } from '../usersRepository.js';

// ─── availabilityRepository ──────────────────────────────────────────────────

describe('availabilityRepository — static data integrity', () => {
	it('getServiceCards returns a non-empty array', () => {
		expect(getServiceCards().length).toBeGreaterThan(0);
	});

	it('getServiceCards: all entries have unique keys', () => {
		const cards = getServiceCards();
		const keys = cards.map((c) => c.key);
		expect(new Set(keys).size).toBe(keys.length);
	});

	it('getServiceCards: uptimePercent is finite and between 0 and 100', () => {
		for (const card of getServiceCards()) {
			expect(Number.isFinite(card.uptimePercent)).toBe(true);
			expect(card.uptimePercent).toBeGreaterThanOrEqual(0);
			expect(card.uptimePercent).toBeLessThanOrEqual(100);
		}
	});

	it('getServiceCards: icon starts with "fa-"', () => {
		for (const card of getServiceCards()) {
			expect(card.icon.startsWith('fa-')).toBe(true);
		}
	});

	it('getServiceCards: status is one of online/degraded/offline', () => {
		const valid = new Set(['online', 'degraded', 'offline']);
		for (const card of getServiceCards()) {
			expect(valid.has(card.status)).toBe(true);
		}
	});

	it('getHealthChecks returns a non-empty array', () => {
		expect(getHealthChecks().length).toBeGreaterThan(0);
	});

	it('getHealthChecks: latencyMs is finite and non-negative', () => {
		for (const check of getHealthChecks()) {
			expect(Number.isFinite(check.latencyMs)).toBe(true);
			expect(check.latencyMs).toBeGreaterThanOrEqual(0);
		}
	});

	it('getIncidents returns a non-empty array', () => {
		expect(getIncidents().length).toBeGreaterThan(0);
	});

	it('getIncidents: all entries have unique ids', () => {
		const incidents = getIncidents();
		const ids = incidents.map((i) => i.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('getIncidents: status is one of active/resolved', () => {
		const valid = new Set(['active', 'resolved']);
		for (const incident of getIncidents()) {
			expect(valid.has(incident.status)).toBe(true);
		}
	});

	it('getSlaGoals returns a non-empty array', () => {
		expect(getSlaGoals().length).toBeGreaterThan(0);
	});

	it('getSlaGoals: actual and target are finite numbers between 0 and 100', () => {
		for (const goal of getSlaGoals()) {
			expect(Number.isFinite(goal.actual)).toBe(true);
			expect(Number.isFinite(goal.target)).toBe(true);
			expect(goal.actual).toBeGreaterThanOrEqual(0);
			expect(goal.target).toBeGreaterThanOrEqual(0);
		}
	});

	it('getAvailabilityQuickStats: returns object with finite numeric alertsSent', () => {
		const stats = getAvailabilityQuickStats();
		expect(Number.isFinite(stats.alertsSent)).toBe(true);
		expect(stats.alertsSent).toBeGreaterThanOrEqual(0);
	});

	it('getAvailabilityQuickStats: totalOutages30d is finite and non-negative', () => {
		const stats = getAvailabilityQuickStats();
		expect(Number.isFinite(stats.totalOutages30d)).toBe(true);
		expect(stats.totalOutages30d).toBeGreaterThanOrEqual(0);
	});
});

// ─── businessRepository ───────────────────────────────────────────────────────

describe('businessRepository — static data integrity', () => {
	it('getBusinessKpiStats returns a non-empty array', () => {
		expect(getBusinessKpiStats().length).toBeGreaterThan(0);
	});

	it('getBusinessKpiStats: all entries have unique keys', () => {
		const stats = getBusinessKpiStats();
		const keys = stats.map((s) => s.key);
		expect(new Set(keys).size).toBe(keys.length);
	});

	it('getBusinessKpiStats: labelKey and value are non-empty strings', () => {
		for (const stat of getBusinessKpiStats()) {
			expect(stat.labelKey).toBeTruthy();
			expect(stat.value).toBeTruthy();
		}
	});

	it('getBusinessSecondaryKpis returns a non-empty array', () => {
		expect(getBusinessSecondaryKpis().length).toBeGreaterThan(0);
	});

	it('getBusinessSecondaryKpis: all entries have unique keys', () => {
		const kpis = getBusinessSecondaryKpis();
		const keys = kpis.map((k) => k.key);
		expect(new Set(keys).size).toBe(keys.length);
	});

	it('getOkrGoals returns a non-empty array', () => {
		expect(getOkrGoals().length).toBeGreaterThan(0);
	});

	it('getOkrGoals: all entries have unique ids', () => {
		const goals = getOkrGoals();
		const ids = goals.map((g) => g.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('getOkrGoals: progressPercent is between 0 and 100', () => {
		for (const goal of getOkrGoals()) {
			expect(goal.progressPercent).toBeGreaterThanOrEqual(0);
			expect(goal.progressPercent).toBeLessThanOrEqual(100);
		}
	});

	it('getPlanRevenue returns a non-empty array', () => {
		expect(getPlanRevenue().length).toBeGreaterThan(0);
	});

	it('getPlanRevenue: all entries have unique ids', () => {
		const plans = getPlanRevenue();
		const ids = plans.map((p) => p.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('getPlanRevenue: percent field is a non-empty string', () => {
		for (const plan of getPlanRevenue()) {
			expect(plan.percent).toBeTruthy();
		}
	});
});

// ─── databaseRepository ───────────────────────────────────────────────────────

describe('databaseRepository — static data integrity', () => {
	it('getDbKpis returns a non-empty array', () => {
		expect(getDbKpis().length).toBeGreaterThan(0);
	});

	it('getDbKpis: all entries have unique keys', () => {
		const kpis = getDbKpis();
		const keys = kpis.map((k) => k.key);
		expect(new Set(keys).size).toBe(keys.length);
	});

	it('getDbKpis: labelKey is a non-empty string', () => {
		for (const kpi of getDbKpis()) {
			expect(kpi.labelKey).toBeTruthy();
		}
	});

	it('getTableSizes returns a non-empty array', () => {
		expect(getTableSizes().length).toBeGreaterThan(0);
	});

	it('getTableSizes: name is non-empty for each entry', () => {
		for (const table of getTableSizes()) {
			expect(table.name).toBeTruthy();
		}
	});

	it('getDbErrorLog returns a non-empty array', () => {
		expect(getDbErrorLog().length).toBeGreaterThan(0);
	});

	it('getDbErrorLog: all entries have unique ids', () => {
		const log = getDbErrorLog();
		const ids = log.map((e) => e.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('getDatabaseStats: storagePercent is finite and between 0 and 100', () => {
		const stats = getDatabaseStats();
		expect(Number.isFinite(stats.storagePercent)).toBe(true);
		expect(stats.storagePercent).toBeGreaterThanOrEqual(0);
		expect(stats.storagePercent).toBeLessThanOrEqual(100);
	});

	it('getSlowestQueries returns a non-empty array', () => {
		expect(getSlowestQueries().length).toBeGreaterThan(0);
	});

	it('getSlowestQueries: avgMs is finite and non-negative', () => {
		for (const query of getSlowestQueries()) {
			expect(Number.isFinite(query.avgMs)).toBe(true);
			expect(query.avgMs).toBeGreaterThanOrEqual(0);
		}
	});

	it('getQueryTypeDistribution returns a non-empty array', () => {
		expect(getQueryTypeDistribution().length).toBeGreaterThan(0);
	});

	it('getQueryTypeDistribution: percent values sum to 100', () => {
		const total = getQueryTypeDistribution().reduce((sum, d) => sum + d.percent, 0);
		expect(total).toBe(100);
	});
});

// ─── edgeRepository ───────────────────────────────────────────────────────────

describe('edgeRepository — static data integrity', () => {
	it('getEdgeKpiStats returns a non-empty array', () => {
		expect(getEdgeKpiStats().length).toBeGreaterThan(0);
	});

	it('getEdgeKpiStats: all entries have unique keys', () => {
		const stats = getEdgeKpiStats();
		const keys = stats.map((s) => s.key);
		expect(new Set(keys).size).toBe(keys.length);
	});

	it('getEdgeKpiStats: labelKey is a non-empty string', () => {
		for (const stat of getEdgeKpiStats()) {
			expect(stat.labelKey).toBeTruthy();
		}
	});

	it('getGeoDistribution returns a non-empty array', () => {
		expect(getGeoDistribution().length).toBeGreaterThan(0);
	});

	it('getGeoDistribution: all entries have unique country codes', () => {
		const geo = getGeoDistribution();
		const codes = geo.map((g) => g.code);
		expect(new Set(codes).size).toBe(codes.length);
	});

	it('getWafLog returns a non-empty array', () => {
		expect(getWafLog().length).toBeGreaterThan(0);
	});

	it('getHttpStatusDistribution returns a non-empty array', () => {
		expect(getHttpStatusDistribution().length).toBeGreaterThan(0);
	});
});

// ─── performanceRepository ────────────────────────────────────────────────────

describe('performanceRepository — static data integrity', () => {
	it('getPerformanceKpiStats returns a non-empty array', () => {
		expect(getPerformanceKpiStats().length).toBeGreaterThan(0);
	});

	it('getPerformanceKpiStats: all entries have unique keys', () => {
		const stats = getPerformanceKpiStats();
		const keys = stats.map((s) => s.key);
		expect(new Set(keys).size).toBe(keys.length);
	});

	it('getPerformanceKpiStats: labelKey is a non-empty string', () => {
		for (const stat of getPerformanceKpiStats()) {
			expect(stat.labelKey).toBeTruthy();
		}
	});

	it('getSlowEndpoints returns a non-empty array', () => {
		expect(getSlowEndpoints().length).toBeGreaterThan(0);
	});

	it('getSlowEndpoints: all entries have unique ids', () => {
		const endpoints = getSlowEndpoints();
		const ids = endpoints.map((e) => e.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('getSlowEndpoints: avgMs is finite and non-negative', () => {
		for (const ep of getSlowEndpoints()) {
			expect(Number.isFinite(ep.avgMs)).toBe(true);
			expect(ep.avgMs).toBeGreaterThanOrEqual(0);
		}
	});

	it('getPerformanceEvents returns a non-empty array', () => {
		expect(getPerformanceEvents().length).toBeGreaterThan(0);
	});

	it('getPerformanceEvents: all entries have unique ids', () => {
		const events = getPerformanceEvents();
		const ids = events.map((e) => e.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('getPerformanceEvents: level is one of critical/warning/info', () => {
		const valid = new Set(['critical', 'warning', 'info']);
		for (const evt of getPerformanceEvents()) {
			expect(valid.has(evt.level)).toBe(true);
		}
	});
});

// ─── runtimeRepository ────────────────────────────────────────────────────────

describe('runtimeRepository — static data integrity', () => {
	it('getRuntimeStats returns a non-empty array', () => {
		expect(getRuntimeStats().length).toBeGreaterThan(0);
	});

	it('getRuntimeStats: all entries have unique keys', () => {
		const stats = getRuntimeStats();
		const keys = stats.map((s) => s.key);
		expect(new Set(keys).size).toBe(keys.length);
	});

	it('getRuntimeStats: labelKey and icon are non-empty strings', () => {
		for (const stat of getRuntimeStats()) {
			expect(stat.labelKey).toBeTruthy();
			expect(stat.icon).toBeTruthy();
		}
	});

	it('getMachineInstances returns a non-empty array', () => {
		expect(getMachineInstances().length).toBeGreaterThan(0);
	});

	it('getMachineInstances: all entries have unique ids', () => {
		const machines = getMachineInstances();
		const ids = machines.map((m) => m.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('getMachineInstances: cpuPercent is finite and between 0 and 100', () => {
		for (const machine of getMachineInstances()) {
			expect(Number.isFinite(machine.cpuPercent)).toBe(true);
			expect(machine.cpuPercent).toBeGreaterThanOrEqual(0);
			expect(machine.cpuPercent).toBeLessThanOrEqual(100);
		}
	});

	it('getMachineInstances: status is one of running/stopped/error', () => {
		const valid = new Set(['running', 'stopped', 'error']);
		for (const machine of getMachineInstances()) {
			expect(valid.has(machine.status)).toBe(true);
		}
	});

	it('getDeployHistory returns a non-empty array', () => {
		expect(getDeployHistory().length).toBeGreaterThan(0);
	});

	it('getDeployHistory: all entries have unique ids', () => {
		const history = getDeployHistory();
		const ids = history.map((d) => d.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('getRuntimeErrorLog returns a non-empty array', () => {
		expect(getRuntimeErrorLog().length).toBeGreaterThan(0);
	});

	it('getRuntimeErrorLog: all entries have unique ids', () => {
		const log = getRuntimeErrorLog();
		const ids = log.map((e) => e.id);
		expect(new Set(ids).size).toBe(ids.length);
	});
});

// ─── usersRepository ─────────────────────────────────────────────────────────

describe('usersRepository — static data integrity', () => {
	it('getUserStats returns a non-empty array', () => {
		expect(getUserStats().length).toBeGreaterThan(0);
	});

	it('getUserStats: all entries have unique keys', () => {
		const stats = getUserStats();
		const keys = stats.map((s) => s.key);
		expect(new Set(keys).size).toBe(keys.length);
	});

	it('getUserStats: labelKey is a non-empty string', () => {
		for (const stat of getUserStats()) {
			expect(stat.labelKey).toBeTruthy();
		}
	});

	it('getUsers returns a non-empty array', () => {
		expect(getUsers().length).toBeGreaterThan(0);
	});

	it('getUsers: all entries have unique ids', () => {
		const users = getUsers();
		const ids = users.map((u) => u.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('getUsers: role is one of Admin/Editor/Developer/Viewer', () => {
		const valid = new Set(['Admin', 'Editor', 'Developer', 'Viewer']);
		for (const user of getUsers()) {
			expect(valid.has(user.role)).toBe(true);
		}
	});

	it('getUsers: sessions is finite and non-negative', () => {
		for (const user of getUsers()) {
			expect(Number.isFinite(user.sessions)).toBe(true);
			expect(user.sessions).toBeGreaterThanOrEqual(0);
		}
	});
});
