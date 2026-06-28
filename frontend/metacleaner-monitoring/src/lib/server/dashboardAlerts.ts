import type { DashboardAlert } from '$lib/repositories/dashboardRepository.js';
import type { FlyMachineRaw } from './clients/flyClient.js';
import type { SentryIssueRaw } from './clients/sentryClient.js';

type AlertWithMs = DashboardAlert & { _ms: number };

export function flyTsToMs(ts: number): number {
	if (ts > 1e15) return ts / 1_000_000;
	if (ts > 1e12) return ts / 1_000;
	return ts * 1_000;
}

export function timeAgo(ms: number, now: number): { mobile: string; desktop: string } {
	const diff = now - ms;
	const mins = Math.round(diff / 60_000);
	if (mins < 1) return { mobile: 'now', desktop: 'just now' };
	if (mins < 60) return { mobile: `${mins} min`, desktop: `${mins} min ago` };
	const hrs = Math.floor(mins / 60);
	return { mobile: `${hrs} hrs`, desktop: `${hrs} hours ago` };
}

export function deriveSentrySeverity(level: string): 'error' | 'warning' {
	return level === 'warning' || level === 'info' ? 'warning' : 'error';
}

export function deriveFlySeverity(eventType: string, eventStatus: string): 'error' | 'warning' {
	return eventType === 'crash' || eventType === 'exit' || eventStatus !== 'success'
		? 'error'
		: 'warning';
}

export function mergeAndSortAlerts(
	sentryIssues: SentryIssueRaw[] | null,
	flyMachines: Map<string, FlyMachineRaw[]> | null,
	now: number
): DashboardAlert[] {
	const list: AlertWithMs[] = [];

	if (sentryIssues !== null) {
		const unresolved = sentryIssues.filter((i) => i.status === 'unresolved').slice(0, 5);
		for (const issue of unresolved) {
			const ms = new Date(issue.lastSeen).getTime();
			const { mobile, desktop } = timeAgo(ms, now);
			list.push({
				_ms: ms,
				id: `sentry-${issue.id}`,
				severity: deriveSentrySeverity(issue.level),
				title: issue.title,
				descriptionMobile: issue.culprit || issue.title,
				descriptionDesktop: issue.culprit || issue.title,
				timeMobile: mobile,
				timeDesktop: desktop
			});
		}
	}

	if (flyMachines !== null) {
		const flyAlerts: AlertWithMs[] = [];
		for (const [app, machines] of flyMachines) {
			for (const machine of machines) {
				for (const event of machine.events ?? []) {
					if (event.type === 'launch' || event.type === 'start') continue;
					const ms = flyTsToMs(event.timestamp);
					const { mobile, desktop } = timeAgo(ms, now);
					flyAlerts.push({
						_ms: ms,
						id: `fly-${machine.id}-${event.timestamp}`,
						severity: deriveFlySeverity(event.type, event.status),
						title: `${event.type} on ${machine.name}`,
						descriptionMobile: `${app} (${machine.region})`,
						descriptionDesktop: `Machine ${machine.name} — ${event.type} in ${machine.region}`,
						timeMobile: mobile,
						timeDesktop: desktop
					});
				}
			}
		}
		flyAlerts.sort((a, b) => b._ms - a._ms);
		list.push(...flyAlerts.slice(0, 5));
	}

	list.sort((a, b) => b._ms - a._ms);
	return list.slice(0, 10).map(({ _ms: _sortKey, ...alert }) => alert);
}
