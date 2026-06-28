import type { PageServerLoad } from './$types.js';
import type { DashboardStat, DashboardAlert } from '$lib/repositories/dashboardRepository.js';
import { getServiceConfigs } from '$lib/server/config.js';
import { getMachinesForAllApps } from '$lib/server/clients/flyClient.js';
import { getRecentIssues } from '$lib/server/clients/sentryClient.js';
import { queryTable } from '$lib/server/clients/supabaseClient.js';
import { callSection } from '$lib/server/clients/types.js';

interface JobRow {
	id: string;
	status: string;
	duration_ms?: number;
	created_at: string;
}

function flyTsToMs(ts: number): number {
	if (ts > 1e15) return ts / 1_000_000;
	if (ts > 1e12) return ts / 1_000;
	return ts * 1_000;
}

function timeAgo(ms: number): { mobile: string; desktop: string } {
	const diff = Date.now() - ms;
	const mins = Math.round(diff / 60_000);
	if (mins < 1) return { mobile: 'now', desktop: 'just now' };
	if (mins < 60) return { mobile: `${mins} min`, desktop: `${mins} min ago` };
	const hrs = Math.floor(mins / 60);
	return { mobile: `${hrs} hrs`, desktop: `${hrs} hours ago` };
}

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders({ 'Cache-Control': 'no-store' });
	const configs = getServiceConfigs();

	const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

	// Fetch all data concurrently
	const [flySettled, sentrySettled, jobsSettled] = await Promise.allSettled([
		configs.fly.configured ? getMachinesForAllApps(configs.fly.config) : Promise.resolve(null),
		configs.sentry.configured ? getRecentIssues(configs.sentry.config, 5) : Promise.resolve(null),
		configs.supabase.configured
			? queryTable<JobRow>(configs.supabase.config, 'jobs', {
					created_at: `gte.${since24h}`,
					select: '*'
				})
			: Promise.resolve([] as JobRow[])
	]);

	// Stats section: uptime (Fly) + job metrics (Supabase)
	const stats = await callSection<DashboardStat[]>(async () => {
		let uptimeValue = 'N/A';
		let uptimeBarWidth = 'w-0';

		if (flySettled.status === 'fulfilled' && flySettled.value !== null) {
			let total = 0;
			let online = 0;
			for (const machines of flySettled.value.values()) {
				total += machines.length;
				online += machines.filter((m) => m.state === 'started').length;
			}
			const pct = total > 0 ? Math.round((online / total) * 10000) / 100 : 0;
			uptimeValue = `${pct.toFixed(2)}%`;
			uptimeBarWidth = `w-[${pct.toFixed(2)}%]`;
		}

		let totalJobs = 0;
		let avgCleanValue = 'N/A';
		let failedValue = 'N/A';

		if (jobsSettled.status === 'fulfilled' && jobsSettled.value !== null) {
			const jobs = jobsSettled.value;
			totalJobs = jobs.length;
			const failedCount = jobs.filter((j) => j.status === 'error' || j.status === 'failed').length;
			const done = jobs.filter((j) => j.status === 'completed' || j.status === 'done');

			if (done.length > 0) {
				const avgMs = done.reduce((s, j) => s + (j.duration_ms ?? 0), 0) / done.length;
				avgCleanValue = `${(avgMs / 1000).toFixed(1)}s`;
			} else {
				avgCleanValue = totalJobs === 0 ? 'N/A' : '0.0s';
			}

			failedValue =
				totalJobs > 0 ? `${((failedCount / totalJobs) * 100).toFixed(1)}%` : '0';
		}

		return [
			{
				key: 'uptimeServer',
				labelKey: 'dashboard_stats_uptimeServer',
				value: uptimeValue,
				icon: 'fa-server',
				iconClass: 'text-textSec',
				barWidth: uptimeBarWidth,
				barClass: 'bg-success'
			},
			{
				key: 'jobsProcessed',
				labelKey: 'dashboard_stats_jobsProcessed',
				value: String(totalJobs),
				icon: 'fa-broom',
				iconClass: 'text-textSec',
				subtextMobile: 'dashboard_stats_jobsProcessedSubtext',
				subtextDesktop: 'dashboard_stats_jobsProcessedSubtext'
			},
			{
				key: 'avgCleaningTime',
				labelKey: 'dashboard_stats_avgCleaningTime',
				value: avgCleanValue,
				icon: 'fa-clock',
				iconClass: 'text-textSec',
				subtextMobile: 'dashboard_stats_avgCleaningTimeSubtext',
				subtextDesktop: 'dashboard_stats_avgCleaningTimeSubtext'
			},
			{
				key: 'failedJobs',
				labelKey: 'dashboard_stats_failedJobs',
				value: failedValue,
				icon: 'fa-bug',
				iconClass: 'text-error bg-error/10 p-2 rounded-lg'
			}
		];
	});

	// Alerts section: recent Sentry issues + Fly machine events
	const alerts = await callSection<DashboardAlert[]>(async () => {
		const list: Array<DashboardAlert & { _ms: number }> = [];

		// Up to 5 most recent unresolved Sentry issues
		if (sentrySettled.status === 'fulfilled' && sentrySettled.value !== null) {
			const unresolved = sentrySettled.value
				.filter((i) => i.status === 'unresolved')
				.slice(0, 5);

			for (const issue of unresolved) {
				const ms = new Date(issue.lastSeen).getTime();
				const { mobile, desktop } = timeAgo(ms);
				const severity: 'error' | 'warning' =
					issue.level === 'warning' || issue.level === 'info' ? 'warning' : 'error';

				list.push({
					_ms: ms,
					id: `sentry-${issue.id}`,
					severity,
					title: issue.title,
					descriptionMobile: issue.culprit || issue.title,
					descriptionDesktop: issue.culprit || issue.title,
					timeMobile: mobile,
					timeDesktop: desktop
				});
			}
		}

		// Up to 5 most recent non-healthy Fly machine events
		if (flySettled.status === 'fulfilled' && flySettled.value !== null) {
			const flyAlerts: Array<DashboardAlert & { _ms: number }> = [];

			for (const [app, machines] of flySettled.value) {
				for (const machine of machines) {
					for (const event of machine.events ?? []) {
						if (event.type === 'launch' || event.type === 'start') continue;
						const ms = flyTsToMs(event.timestamp);
						const isCrash = event.type === 'crash' || event.type === 'exit' || event.status !== 'success';
						const { mobile, desktop } = timeAgo(ms);

						flyAlerts.push({
							_ms: ms,
							id: `fly-${machine.id}-${event.timestamp}`,
							severity: isCrash ? 'error' : 'warning',
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
	});

	return { stats, alerts };
};
