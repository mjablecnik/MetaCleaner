import { describe, it, expect } from 'vitest';
import { mapToErrorLog, mapToErrorKpis, mapToTopEndpoints } from '../sentryMapper.js';
import type { SentryIssueRaw } from '../../clients/sentryClient.js';

function makeIssue(overrides: Partial<SentryIssueRaw> = {}): SentryIssueRaw {
	return {
		id: 'issue-1',
		title: 'Error: Something went wrong',
		culprit: 'GET /api/test',
		status: 'unresolved',
		level: 'error',
		lastSeen: '2024-01-15T12:00:00Z',
		firstSeen: '2024-01-10T00:00:00Z',
		count: '1',
		userCount: 0,
		metadata: { type: 'Error', value: 'Something went wrong' },
		type: 'default',
		tags: [],
		...overrides
	};
}

describe('mapToErrorLog — mapTypeCode precedence', () => {
	it('returns TMT when title contains "timeout" (case-insensitive)', () => {
		const log = mapToErrorLog([
			makeIssue({ title: 'Request Timeout error', metadata: { type: '' } })
		]);
		expect(log[0].type).toBe('TMT');
	});

	it('returns TMT when metaType contains "timeout" (case-insensitive)', () => {
		const log = mapToErrorLog([
			makeIssue({ title: 'generic error', metadata: { type: 'RequestTimeout' } })
		]);
		expect(log[0].type).toBe('TMT');
	});

	it('returns TMT for timeout even when metaType ends with Error (timeout has higher precedence)', () => {
		const log = mapToErrorLog([
			makeIssue({ title: 'timeout error', metadata: { type: 'TimeoutError' } })
		]);
		expect(log[0].type).toBe('TMT');
	});

	it('returns EXC when metaType ends with "Error"', () => {
		const log = mapToErrorLog([
			makeIssue({ title: 'some failure', metadata: { type: 'TypeError' } })
		]);
		expect(log[0].type).toBe('EXC');
	});

	it('returns EXC when metaType ends with "Exception"', () => {
		const log = mapToErrorLog([
			makeIssue({ title: 'some failure', metadata: { type: 'RuntimeException' } })
		]);
		expect(log[0].type).toBe('EXC');
	});

	it('returns 5XX when status_code tag is >= 500', () => {
		const log = mapToErrorLog([
			makeIssue({
				title: 'bad request',
				metadata: { type: '' },
				tags: [{ key: 'status_code', value: '500' }]
			})
		]);
		expect(log[0].type).toBe('5XX');
	});

	it('returns 5XX for status_code 503', () => {
		const log = mapToErrorLog([
			makeIssue({
				title: 'server error',
				metadata: { type: '' },
				tags: [{ key: 'status_code', value: '503' }]
			})
		]);
		expect(log[0].type).toBe('5XX');
	});

	it('returns 4XX when status_code tag is >= 400 and < 500', () => {
		const log = mapToErrorLog([
			makeIssue({
				title: 'not found',
				metadata: { type: '' },
				tags: [{ key: 'status_code', value: '404' }]
			})
		]);
		expect(log[0].type).toBe('4XX');
	});

	it('returns ERR when no matching type conditions apply', () => {
		const log = mapToErrorLog([makeIssue({ title: 'generic error', metadata: { type: '' } })]);
		expect(log[0].type).toBe('ERR');
	});
});

describe('mapToErrorLog — formatTime', () => {
	it('formats lastSeen ISO string as HH:MM:SS (two digits each)', () => {
		const log = mapToErrorLog([makeIssue({ lastSeen: '2024-01-15T03:05:07Z' })]);
		expect(log[0].time).toMatch(/^\d{2}:\d{2}:\d{2}$/);
	});

	it('zero-pads single-digit hour, minute, second', () => {
		// Use a known UTC time to verify zero-padding behavior at midnight UTC
		const log = mapToErrorLog([makeIssue({ lastSeen: '2024-01-15T00:00:00Z' })]);
		// All segments should be exactly 2 characters
		const parts = log[0].time.split(':');
		expect(parts).toHaveLength(3);
		for (const part of parts) {
			expect(part).toHaveLength(2);
		}
	});
});

describe('mapToErrorLog — other fields', () => {
	it('maps issue id, title (message), culprit (source) and status correctly', () => {
		const issue = makeIssue({
			id: 'abc123',
			title: 'TypeError: x is not a function',
			culprit: 'GET /api/data',
			status: 'resolved'
		});
		const log = mapToErrorLog([issue]);
		expect(log[0].id).toBe('abc123');
		expect(log[0].message).toBe('TypeError: x is not a function');
		expect(log[0].source).toBe('GET /api/data');
		expect(log[0].statusKey).toBe('common_status_resolved');
	});

	it('uses "—" as source when culprit is empty string', () => {
		const log = mapToErrorLog([makeIssue({ culprit: '' })]);
		expect(log[0].source).toBe('—');
	});
});

describe('mapToErrorKpis — counts and severity classes', () => {
	it('returns 4 KPIs for any input', () => {
		const result = mapToErrorKpis([]);
		expect(result).toHaveLength(4);
	});

	it('all KPI values are 0 for empty issue list', () => {
		const result = mapToErrorKpis([]);
		for (const kpi of result) {
			expect(kpi.value).toBe(0);
		}
	});

	it('errors5xx KPI counts issues with status_code tag >= 500', () => {
		const issues = [
			makeIssue({ tags: [{ key: 'status_code', value: '500' }] }),
			makeIssue({ tags: [{ key: 'status_code', value: '503' }] }),
			makeIssue({ tags: [{ key: 'status_code', value: '404' }] }) // not 5xx
		];
		const kpis = mapToErrorKpis(issues);
		const kpi = kpis.find((k) => k.key === 'errors5xx')!;
		expect(kpi.value).toBe(2);
	});

	it('errors5xx severityKey is critical and class is bg-error/10 when count > 0', () => {
		const kpis = mapToErrorKpis([makeIssue({ tags: [{ key: 'status_code', value: '500' }] })]);
		const kpi = kpis.find((k) => k.key === 'errors5xx')!;
		expect(kpi.severityKey).toBe('common_status_critical');
		expect(kpi.severityClass).toBe('bg-error/10 text-error');
	});

	it('errors5xx severityKey is ok and class is bg-success/10 when count is 0', () => {
		const kpis = mapToErrorKpis([]);
		const kpi = kpis.find((k) => k.key === 'errors5xx')!;
		expect(kpi.severityKey).toBe('common_status_ok');
		expect(kpi.severityClass).toBe('bg-success/10 text-success');
	});

	it('backendExceptions KPI counts issues where metaType ends with Error or Exception', () => {
		const issues = [
			makeIssue({ metadata: { type: 'TypeError' } }),
			makeIssue({ metadata: { type: 'RuntimeException' } }),
			makeIssue({ metadata: { type: 'SomeClass' } }) // not exception
		];
		const kpis = mapToErrorKpis(issues);
		const kpi = kpis.find((k) => k.key === 'backendExceptions')!;
		expect(kpi.value).toBe(2);
	});

	it('timeouts KPI counts issues where title contains "timeout"', () => {
		const issues = [
			makeIssue({ title: 'Request Timeout', metadata: { type: '' } }),
			makeIssue({ title: 'Connection timeout exceeded', metadata: { type: '' } }),
			makeIssue({ title: 'Database Error', metadata: { type: '' } })
		];
		const kpis = mapToErrorKpis(issues);
		const kpi = kpis.find((k) => k.key === 'timeouts')!;
		expect(kpi.value).toBe(2);
	});

	it('timeouts severityKey is warning when count > 0, ok when 0', () => {
		const withTimeout = mapToErrorKpis([
			makeIssue({ title: 'Request timeout', metadata: { type: '' } })
		]);
		const withoutTimeout = mapToErrorKpis([]);

		const kpiWith = withTimeout.find((k) => k.key === 'timeouts')!;
		const kpiWithout = withoutTimeout.find((k) => k.key === 'timeouts')!;

		expect(kpiWith.severityKey).toBe('common_status_warning');
		expect(kpiWithout.severityKey).toBe('common_status_ok');
	});
});

describe('mapToTopEndpoints', () => {
	it('returns empty array for no issues', () => {
		const result = mapToTopEndpoints([]);
		expect(result).toEqual([]);
	});

	it('aggregates issues with the same culprit into one entry', () => {
		const issues = [
			makeIssue({ culprit: 'GET /api/users' }),
			makeIssue({ culprit: 'GET /api/users' }),
			makeIssue({ culprit: 'GET /api/users' })
		];
		const result = mapToTopEndpoints(issues);
		expect(result).toHaveLength(1);
		expect(result[0].errorCount).toBe(3);
	});

	it('sorts endpoints by error count descending', () => {
		const issues = [
			makeIssue({ culprit: 'GET /api/a' }),
			makeIssue({ culprit: 'GET /api/b' }),
			makeIssue({ culprit: 'GET /api/b' }),
			makeIssue({ culprit: 'GET /api/c' }),
			makeIssue({ culprit: 'GET /api/c' }),
			makeIssue({ culprit: 'GET /api/c' })
		];
		const result = mapToTopEndpoints(issues);
		expect(result[0].path).toBe('/api/c');
		expect(result[1].path).toBe('/api/b');
		expect(result[2].path).toBe('/api/a');
	});

	it('caps output at 10 endpoints', () => {
		const issues = Array.from({ length: 12 }, (_, i) =>
			makeIssue({ culprit: `GET /api/endpoint${i}` })
		);
		const result = mapToTopEndpoints(issues);
		expect(result).toHaveLength(10);
	});

	it('highest-count endpoint has barWidth of 100%', () => {
		const issues = [
			makeIssue({ culprit: 'GET /api/top' }),
			makeIssue({ culprit: 'GET /api/top' }),
			makeIssue({ culprit: 'GET /api/other' })
		];
		const result = mapToTopEndpoints(issues);
		expect(result[0].barWidth).toBe('100%');
	});

	it('barWidth is calculated as round(count/max*100)%', () => {
		const issues = [
			makeIssue({ culprit: 'GET /api/top' }),
			makeIssue({ culprit: 'GET /api/top' }),
			makeIssue({ culprit: 'GET /api/top' }),
			makeIssue({ culprit: 'GET /api/low' }) // 1/3 = 33%
		];
		const result = mapToTopEndpoints(issues);
		expect(result[0].barWidth).toBe('100%');
		expect(result[1].barWidth).toBe('33%');
	});

	it('parseCulprit splits "METHOD /path" into method and path', () => {
		const result = mapToTopEndpoints([makeIssue({ culprit: 'GET /api/users' })]);
		expect(result[0].method).toBe('GET');
		expect(result[0].path).toBe('/api/users');
	});

	it('parseCulprit returns method ERR and full culprit as path when no HTTP method found', () => {
		const result = mapToTopEndpoints([makeIssue({ culprit: 'module.function' })]);
		expect(result[0].method).toBe('ERR');
		expect(result[0].path).toBe('module.function');
	});

	it('parseCulprit handles all standard HTTP methods', () => {
		const methods = ['POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
		for (const method of methods) {
			const result = mapToTopEndpoints([makeIssue({ culprit: `${method} /api/resource` })]);
			expect(result[0].method).toBe(method);
		}
	});

	it('empty culprit string produces ERR method and — path', () => {
		const result = mapToTopEndpoints([makeIssue({ culprit: '' })]);
		// parseCulprit('') → { method: 'ERR', path: '—' }
		expect(result[0].method).toBe('ERR');
		expect(result[0].path).toBe('—');
	});
});
