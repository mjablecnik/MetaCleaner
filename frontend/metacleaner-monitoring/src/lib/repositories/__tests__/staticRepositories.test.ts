// Light data-integrity tests for static repository providers.
// These guard against accidental regressions in static mock data
// (duplicate IDs, out-of-range values, empty required arrays).

import { describe, it, expect } from 'vitest';
import { getDashboardStats, getDashboardAlerts } from '../dashboardRepository.js';
import {
	getErrorKpis,
	getErrorTypeBreakdown,
	getTopEndpoints,
	getErrorLog
} from '../errorsRepository.js';
import { getNavSections } from '../navigationRepository.js';

describe('dashboardRepository — static data integrity', () => {
	it('getDashboardStats returns a non-empty array', () => {
		const stats = getDashboardStats();
		expect(stats.length).toBeGreaterThan(0);
	});

	it('getDashboardStats: all entries have unique keys', () => {
		const stats = getDashboardStats();
		const keys = stats.map((s) => s.key);
		expect(new Set(keys).size).toBe(keys.length);
	});

	it('getDashboardStats: all entries have non-empty key, labelKey, value, icon, iconClass', () => {
		for (const stat of getDashboardStats()) {
			expect(stat.key).toBeTruthy();
			expect(stat.labelKey).toBeTruthy();
			expect(stat.value).toBeTruthy();
			expect(stat.icon).toBeTruthy();
			expect(stat.iconClass).toBeTruthy();
		}
	});

	it('getDashboardAlerts returns a non-empty array', () => {
		const alerts = getDashboardAlerts();
		expect(alerts.length).toBeGreaterThan(0);
	});

	it('getDashboardAlerts: all entries have unique ids', () => {
		const alerts = getDashboardAlerts();
		const ids = alerts.map((a) => a.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('getDashboardAlerts: severity is one of error/warning/resolved', () => {
		const valid = new Set(['error', 'warning', 'resolved']);
		for (const alert of getDashboardAlerts()) {
			expect(valid.has(alert.severity)).toBe(true);
		}
	});
});

describe('errorsRepository — static data integrity', () => {
	it('getErrorKpis returns 4 KPIs', () => {
		expect(getErrorKpis()).toHaveLength(4);
	});

	it('getErrorKpis: all entries have unique keys', () => {
		const kpis = getErrorKpis();
		const keys = kpis.map((k) => k.key);
		expect(new Set(keys).size).toBe(keys.length);
	});

	it('getErrorKpis: all numeric values are non-negative', () => {
		for (const kpi of getErrorKpis()) {
			expect(kpi.value).toBeGreaterThanOrEqual(0);
		}
	});

	it('getErrorTypeBreakdown returns a non-empty array', () => {
		expect(getErrorTypeBreakdown().length).toBeGreaterThan(0);
	});

	it('getErrorTypeBreakdown: all counts are non-negative', () => {
		for (const entry of getErrorTypeBreakdown()) {
			expect(entry.count).toBeGreaterThanOrEqual(0);
		}
	});

	it('getTopEndpoints returns a non-empty array', () => {
		expect(getTopEndpoints().length).toBeGreaterThan(0);
	});

	it('getTopEndpoints: first endpoint has barWidth of 100%', () => {
		const endpoints = getTopEndpoints();
		expect(endpoints[0].barWidth).toBe('100%');
	});

	it('getTopEndpoints: error counts are in descending order', () => {
		const endpoints = getTopEndpoints();
		for (let i = 1; i < endpoints.length; i++) {
			expect(endpoints[i].errorCount).toBeLessThanOrEqual(endpoints[i - 1].errorCount);
		}
	});

	it('getErrorLog returns a non-empty array', () => {
		expect(getErrorLog().length).toBeGreaterThan(0);
	});

	it('getErrorLog: all entries have unique ids', () => {
		const log = getErrorLog();
		const ids = log.map((e) => e.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('getErrorLog: time field matches HH:MM:SS format', () => {
		for (const entry of getErrorLog()) {
			expect(entry.time).toMatch(/^\d{2}:\d{2}:\d{2}$/);
		}
	});
});

describe('navigationRepository — static data integrity (via getNavSections)', () => {
	it('returns a stable result on repeated calls', () => {
		const a = getNavSections('/base');
		const b = getNavSections('/base');
		expect(JSON.stringify(a)).toBe(JSON.stringify(b));
	});

	it('all item icons start with "fa-"', () => {
		for (const section of getNavSections('')) {
			for (const item of section.items) {
				expect(item.icon.startsWith('fa-')).toBe(true);
			}
		}
	});
});
