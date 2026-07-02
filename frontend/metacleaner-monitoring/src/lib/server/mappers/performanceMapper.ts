import type {
	PerformanceKpiStat,
	SlowEndpoint,
	PerformanceEvent
} from '$lib/repositories/performanceRepository.js';
import type { CfAnalyticsRaw } from '../clients/cloudflareClient.js';
import type { FlyMachineRaw } from '../clients/flyClient.js';
import type { SentryIssueRaw } from '../clients/sentryClient.js';
import * as m from '$lib/paraglide/messages.js';

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
			callCount: ep.callCount.toLocaleString(),
			errorRate: `${errorRate.toFixed(1)}%`,
			avgMs: ep.avgMs,
			barWidth: `${barWidthPercent}%`,
			timeColor: getTimeColor(ep.avgMs),
			barColor: getBarColor(ep.avgMs)
		};
	});
}

export function mapToPerformanceKpiStats(
	cfAnalytics: CfAnalyticsRaw | null,
	flyMachines: Map<string, FlyMachineRaw[]> | null,
	_issues: SentryIssueRaw[]
): PerformanceKpiStat[] {
	let totalRequests = 0;

	if (cfAnalytics) {
		for (const g of cfAnalytics.httpRequests1dGroups) {
			totalRequests += g.sum.requests;
		}
	}

	const throughputRpm = totalRequests > 0 ? Math.round(totalRequests / 1440) : 0;

	let uptimePct = 100;
	let machineCount = 0;
	if (flyMachines) {
		let total = 0;
		let online = 0;
		for (const machines of flyMachines.values()) {
			for (const machine of machines) {
				total++;
				machineCount++;
				if (machine.state === 'started') online++;
			}
		}
		if (total > 0) uptimePct = (online / total) * 100;
	}

	const throughputSubtext =
		totalRequests > 0
			? m.performance_kpi_requestsTotal({ count: totalRequests.toLocaleString() })
			: 'performance_kpi_noCloudflareData';

	const uptimeStr = uptimePct.toFixed(2);
	const uptimeBadgeKey = uptimePct >= 99.9 ? 'common_status_excellent' : 'common_status_ok';
	const uptimeBadgeClass =
		uptimePct >= 99 ? 'bg-success/10 text-success' : 'bg-secondary/10 text-secondary';
	const uptimeSubtext = flyMachines
		? m.performance_kpi_machinesMonitored({ count: machineCount })
		: 'performance_kpi_noFlyData';

	// Apdex: no per-request latency source is wired in; render '—' rather than fabricating
	// a perfect score from computeApdex(0,0,0). Wire real satisfied/tolerating/total counts
	// here once a latency source (e.g. Cloudflare httpRequestsAdaptiveGroups) is available.
	const apdexEntry: PerformanceKpiStat = {
		key: 'apdex',
		labelKey: 'performance_kpi_apdex',
		value: '—',
		badgeKey: 'common_status_unknown',
		badgeClass: 'bg-[#475569]/10 text-[#475569]',
		subtext: 'performance_kpi_apdexNoData',
		subtextIsKey: true
	};

	// Error rate: Cloudflare httpRequests1dGroups exposes threats-blocked, not HTTP 5xx counts.
	// Threats blocked are WAF/security blocks — an unrelated metric. Render '—' until a real
	// 5xx source is wired in (e.g. httpRequestsAdaptiveGroups). Req 14.2.
	const errorRateEntry: PerformanceKpiStat = {
		key: 'errorRate',
		labelKey: 'performance_kpi_errorRate',
		value: '—',
		unit: '%',
		badgeKey: 'common_status_unknown',
		badgeClass: 'bg-[#475569]/10 text-[#475569]',
		subtext: 'performance_kpi_errorRateGoal',
		subtextIsKey: true
	};

	return [
		apdexEntry,
		{
			key: 'uptime',
			labelKey: 'runtime_kpi_uptime30d',
			value: uptimeStr,
			unit: '%',
			badgeKey: uptimeBadgeKey,
			badgeClass: uptimeBadgeClass,
			subtext: uptimeSubtext,
			subtextIsKey: !flyMachines
		},
		{
			key: 'throughput',
			labelKey: 'performance_kpi_throughput',
			value: throughputRpm.toLocaleString(),
			unit: 'req/min',
			badgeKey: 'performance_kpi_throughputBadge',
			badgeClass: 'bg-[#3b82f6]/10 text-[#3b82f6]',
			subtext: throughputSubtext,
			subtextIsKey: totalRequests === 0
		},
		errorRateEntry
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
			type: issue.title.toLowerCase().includes('timeout')
				? m.performance_event_type_timeout()
				: m.performance_event_type_error(),
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

					const eventType =
						event.type === 'kill'
							? m.performance_event_type_oomKill()
							: event.type === 'crash'
								? m.performance_event_type_crash()
								: m.performance_event_type_restart();
					events.push({
						_sortMs: tsMs,
						id: `fly-${machine.id}-${event.timestamp}`,
						time: formatTimeHms(tsMs),
						level: isCritical ? 'critical' : 'warning',
						levelKey: isCritical ? 'performance_filters_critical' : 'performance_filters_warning',
						levelClass: isCritical ? 'bg-error/15 text-error' : 'bg-secondary/15 text-secondary',
						type: eventType,
						message: m.performance_event_machineMessage({
							name: machine.name,
							eventType: event.type,
							region: machine.region
						}),
						endpoint: machine.name,
						statusKey: isCritical ? 'common_status_critical' : 'common_status_restarted',
						statusClass: isCritical ? 'bg-error/10 text-error' : 'bg-success/10 text-success'
					});
				}
			}
		}
	}

	events.sort((a, b) => b._sortMs - a._sortMs);
	return events.slice(0, 20).map(({ _sortMs: _, ...e }) => e);
}
