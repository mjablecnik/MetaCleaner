import type {
	PerformanceKpiStat,
	SlowEndpoint,
	PerformanceEvent
} from '$lib/repositories/performanceRepository.js';
import type { CfAnalyticsRaw } from '../clients/cloudflareClient.js';
import type { FlyMachineRaw } from '../clients/flyClient.js';
import type { SentryIssueRaw } from '../clients/sentryClient.js';

// Implements the Apdex formula: (satisfied + tolerating * 0.5) / total
// satisfied: ≤ 500ms, tolerating: 500ms–2000ms, frustrated: > 2000ms
// Returns 1.0 when total is 0 (no data).
export function computeApdex(satisfied: number, tolerating: number, total: number): number {
	if (total <= 0) return 1.0;
	return Math.max(0, Math.min(1, (satisfied + tolerating * 0.5) / total));
}

export interface RawEndpointRecord {
	id: string;
	method: string;
	path: string;
	callCount: number;
	errorCount: number;
	avgMs: number;
}

const MAX_ENDPOINTS = 10;

function flyTimestampToMs(ts: number): number {
	if (ts > 1e15) return ts / 1_000_000;
	if (ts > 1e12) return ts / 1_000;
	return ts * 1_000;
}

function formatTimeHms(ms: number): string {
	const date = new Date(ms);
	const hh = String(date.getHours()).padStart(2, '0');
	const mm = String(date.getMinutes()).padStart(2, '0');
	const ss = String(date.getSeconds()).padStart(2, '0');
	return `${hh}:${mm}:${ss}`;
}

const HTTP_METHODS_KNOWN = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

function parseCulprit(culprit: string): { method: string; path: string } {
	const parts = culprit.trim().split(/\s+/);
	if (parts.length >= 2 && HTTP_METHODS_KNOWN.includes(parts[0].toUpperCase())) {
		return { method: parts[0].toUpperCase(), path: parts.slice(1).join(' ') };
	}
	return { method: 'GET', path: culprit || '—' };
}

function estimateAvgMs(issues: SentryIssueRaw[]): number {
	const hasTimeout = issues.some((i) => i.title.toLowerCase().includes('timeout'));
	if (hasTimeout) return 8000;
	const hasCritical = issues.some((i) => i.level === 'critical');
	if (hasCritical) return 3000;
	const hasError = issues.some((i) => i.level === 'error');
	if (hasError) return 1500;
	const hasWarning = issues.some((i) => i.level === 'warning');
	if (hasWarning) return 600;
	return 250;
}

function getMethodClass(method: string): string {
	if (method === 'GET') return 'bg-[#3b82f6]/20 text-[#3b82f6]';
	if (method === 'POST') return 'bg-error/20 text-error';
	if (method === 'DELETE') return 'bg-secondary/20 text-secondary';
	if (method === 'PUT' || method === 'PATCH') return 'bg-[#f59e0b]/20 text-[#f59e0b]';
	return 'bg-[#6b7280]/20 text-[#6b7280]';
}

function getTimeColor(avgMs: number): string {
	if (avgMs >= 2000) return 'text-error';
	if (avgMs >= 500) return 'text-secondary';
	return 'text-[#3ecf8e]';
}

function getBarColor(avgMs: number): string {
	if (avgMs >= 2000) return 'bg-error';
	if (avgMs >= 500) return 'bg-secondary';
	return 'bg-[#3ecf8e]';
}

export function mapToSlowEndpoints(raw: RawEndpointRecord[]): SlowEndpoint[] {
	if (raw.length === 0) return [];

	const sorted = [...raw].sort((a, b) => b.avgMs - a.avgMs);
	const limited = sorted.slice(0, MAX_ENDPOINTS);

	const maxMs = limited[0].avgMs;

	return limited.map((ep) => {
		const errorRate = ep.callCount > 0 ? (ep.errorCount / ep.callCount) * 100 : 0;
		const barWidthPercent = maxMs > 0 ? Math.round((ep.avgMs / maxMs) * 100) : 0;

		return {
			id: ep.id,
			method: ep.method,
			methodClass: getMethodClass(ep.method),
			path: ep.path,
			callCount: ep.callCount.toLocaleString('en-US'),
			errorRate: `${errorRate.toFixed(1)}%`,
			avgMs: ep.avgMs,
			barWidth: `${barWidthPercent}%`,
			timeColor: getTimeColor(ep.avgMs),
			barColor: getBarColor(ep.avgMs)
		};
	});
}

// Maps Sentry issues to SlowEndpoint by grouping by culprit and estimating latency from severity
export function mapSentryIssuesToSlowEndpoints(issues: SentryIssueRaw[]): SlowEndpoint[] {
	const groups = new Map<string, SentryIssueRaw[]>();
	for (const issue of issues) {
		const key = issue.culprit || '—';
		const group = groups.get(key) ?? [];
		group.push(issue);
		groups.set(key, group);
	}

	type WithSortMs = SlowEndpoint & { _avgMs: number };
	const endpoints: WithSortMs[] = [];

	for (const [culprit, group] of groups) {
		const { method, path } = parseCulprit(culprit);
		const avgMs = estimateAvgMs(group);
		const totalCount = group.reduce((sum, i) => sum + (parseInt(i.count, 10) || 1), 0);
		const errorIssues = group.filter((i) => i.level === 'error' || i.level === 'critical').length;
		const errorRate =
			group.length > 0 ? `${Math.round((errorIssues / group.length) * 100)}%` : '0%';

		endpoints.push({
			_avgMs: avgMs,
			id: `ep-${culprit.replace(/[^a-z0-9]/gi, '-').slice(0, 32)}`,
			method,
			methodClass: getMethodClass(method),
			path,
			callCount: totalCount.toLocaleString('cs-CZ'),
			errorRate,
			avgMs,
			barWidth: '0%',
			timeColor: getTimeColor(avgMs),
			barColor: getBarColor(avgMs)
		});
	}

	// Sort by avgMs desc, limit to 10 (Property 11)
	endpoints.sort((a, b) => b._avgMs - a._avgMs);
	const top10 = endpoints.slice(0, 10);
	const maxMs = top10[0]?._avgMs ?? 1;
	return top10.map(({ _avgMs: _, ...ep }) => ({
		...ep,
		barWidth: `${Math.round((ep.avgMs / maxMs) * 100)}%`
	}));
}

export function mapToPerformanceKpiStats(
	cfAnalytics: CfAnalyticsRaw | null,
	flyMachines: Map<string, FlyMachineRaw[]> | null,
	issues: SentryIssueRaw[]
): PerformanceKpiStat[] {
	let totalRequests = 0;
	let totalThreats = 0;

	if (cfAnalytics) {
		for (const g of cfAnalytics.httpRequests1dGroups) {
			totalRequests += g.sum.requests;
			totalThreats += g.sum.threats;
		}
	}

	const throughputRpm = totalRequests > 0 ? Math.round(totalRequests / 1440) : 0;
	const cfErrorRatePct = totalRequests > 0 ? (totalThreats / totalRequests) * 100 : 0;

	const criticalCount = issues.filter((i) => i.level === 'critical' || i.level === 'error').length;
	const sentryErrorRatePct = Math.min(100, criticalCount * 0.5);
	const errorRatePct =
		totalRequests > 1000 ? Math.max(cfErrorRatePct, sentryErrorRatePct) : sentryErrorRatePct;

	let uptimePct = 100;
	let machineCount = 0;
	if (flyMachines) {
		let total = 0;
		let online = 0;
		for (const machines of flyMachines.values()) {
			for (const m of machines) {
				total++;
				machineCount++;
				if (m.state === 'started') online++;
			}
		}
		if (total > 0) uptimePct = (online / total) * 100;
	}

	// No per-request latency buckets are available from Fly Machines API or Cloudflare Analytics.
	// computeApdex(0, 0, 0) returns 1.0 — the spec-defined no-data sentinel — rather than a heuristic.
	// Wire in real satisfied/tolerating/total counts here once a latency source is integrated.
	const apdex = computeApdex(0, 0, 0);
	const apdexStr = apdex.toFixed(2);
	const apdexBadgeKey =
		apdex >= 0.94
			? 'common_status_excellent'
			: apdex >= 0.85
				? 'common_status_ok'
				: 'common_status_warning';
	const apdexBadgeClass =
		apdex >= 0.85 ? 'bg-success/10 text-success' : 'bg-secondary/10 text-secondary';
	const apdexBarClass = apdex >= 0.85 ? 'bg-success' : apdex >= 0.7 ? 'bg-secondary' : 'bg-error';

	const errorRateStr = errorRatePct.toFixed(1);
	const errorBadgeKey = errorRatePct < 1 ? 'common_status_ok' : 'common_status_warning';
	const errorBadgeClass =
		errorRatePct < 1 ? 'bg-success/10 text-success' : 'bg-secondary/10 text-secondary';
	const errorValueClass: string | undefined = errorRatePct >= 1 ? 'text-secondary' : undefined;

	const throughputSubtext =
		totalRequests > 0
			? `${totalRequests.toLocaleString('cs-CZ')} requests / 24h`
			: 'No Cloudflare data';

	const uptimeStr = uptimePct.toFixed(2);
	const uptimeBadgeKey = uptimePct >= 99.9 ? 'common_status_excellent' : 'common_status_ok';
	const uptimeBadgeClass =
		uptimePct >= 99 ? 'bg-success/10 text-success' : 'bg-secondary/10 text-secondary';
	const uptimeSubtext = flyMachines
		? `${machineCount} machine${machineCount !== 1 ? 's' : ''} monitored`
		: 'No Fly.io data';

	return [
		{
			key: 'apdex',
			labelKey: 'performance_kpi_apdex',
			value: apdexStr,
			badgeKey: apdexBadgeKey,
			badgeClass: apdexBadgeClass,
			subtext: 'No latency data · Goal: ≥ 0.90 · Threshold: 500ms',
			barWidth: `${(apdex * 100).toFixed(0)}%`,
			barClass: apdexBarClass
		},
		{
			key: 'uptime',
			labelKey: 'runtime_kpi_uptime30d',
			value: uptimeStr,
			unit: '%',
			badgeKey: uptimeBadgeKey,
			badgeClass: uptimeBadgeClass,
			subtext: uptimeSubtext
		},
		{
			key: 'throughput',
			labelKey: 'performance_kpi_throughput',
			value: throughputRpm.toLocaleString('cs-CZ'),
			unit: 'req/min',
			badgeKey: 'performance_kpi_throughputBadge',
			badgeClass: 'bg-[#3b82f6]/10 text-[#3b82f6]',
			subtext: throughputSubtext
		},
		{
			key: 'errorRate',
			labelKey: 'performance_kpi_errorRate',
			value: errorRateStr,
			unit: '%',
			badgeKey: errorBadgeKey,
			badgeClass: errorBadgeClass,
			subtext: `Goal: < 1%${totalThreats > 0 ? ` · ${totalThreats} threats blocked` : ''}`,
			valueClass: errorValueClass
		}
	];
}

export function mapToPerformanceEvents(
	issues: SentryIssueRaw[],
	flyMachines: Map<string, FlyMachineRaw[]> | null
): PerformanceEvent[] {
	type WithSortMs = PerformanceEvent & { _sortMs: number };
	const events: WithSortMs[] = [];

	// Sentry critical/error issues → performance events (req 14.3)
	const highPriorityIssues = issues.filter(
		(i) =>
			i.level === 'critical' || i.level === 'error' || i.title.toLowerCase().includes('timeout')
	);

	for (const issue of highPriorityIssues) {
		const tsMs = new Date(issue.lastSeen).getTime();
		const isCritical = issue.level === 'critical' || issue.title.toLowerCase().includes('timeout');
		const level: 'critical' | 'warning' | 'info' = isCritical ? 'critical' : 'warning';

		events.push({
			_sortMs: tsMs,
			id: `sentry-${issue.id}`,
			time: formatTimeHms(tsMs),
			level,
			levelKey: isCritical ? 'performance_filters_critical' : 'performance_filters_warning',
			levelClass: isCritical ? 'bg-error/15 text-error' : 'bg-secondary/15 text-secondary',
			type: issue.title.toLowerCase().includes('timeout') ? 'Timeout' : 'Error',
			message: issue.title,
			endpoint: issue.culprit || undefined,
			statusKey:
				issue.status === 'resolved' ? 'common_status_resolved' : 'performance_status_active',
			statusClass:
				issue.status === 'resolved' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
		});
	}

	// Fly machine crash/kill/restart events
	if (flyMachines) {
		for (const machines of flyMachines.values()) {
			for (const machine of machines) {
				for (const event of machine.events ?? []) {
					if (!['kill', 'crash', 'restart', 'exit'].includes(event.type)) continue;
					if (event.type === 'exit' && event.status === 'success') continue;

					const tsMs = flyTimestampToMs(event.timestamp);
					const isCritical = event.type === 'kill' || event.type === 'crash';

					events.push({
						_sortMs: tsMs,
						id: `fly-${machine.id}-${event.timestamp}`,
						time: formatTimeHms(tsMs),
						level: isCritical ? 'critical' : 'warning',
						levelKey: isCritical ? 'performance_filters_critical' : 'performance_filters_warning',
						levelClass: isCritical ? 'bg-error/15 text-error' : 'bg-secondary/15 text-secondary',
						type: event.type === 'kill' ? 'OOM Kill' : event.type === 'crash' ? 'Crash' : 'Restart',
						message: `Machine ${machine.name} ${event.type} in ${machine.region}`,
						endpoint: machine.name,
						statusKey: 'common_status_restarted',
						statusClass: 'bg-success/10 text-success'
					});
				}
			}
		}
	}

	events.sort((a, b) => b._sortMs - a._sortMs);
	return events.slice(0, 20).map(({ _sortMs: _, ...e }) => e);
}
