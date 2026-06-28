import type { PageServerLoad } from './$types.js';
import type { DashboardStat } from '$lib/repositories/dashboardRepository.js';
import { getServiceConfigs } from '$lib/server/config.js';
import { getMachinesForAllApps } from '$lib/server/clients/flyClient.js';
import { getRecentIssues } from '$lib/server/clients/sentryClient.js';
import { queryTable } from '$lib/server/clients/supabaseClient.js';
import { callSection } from '$lib/server/clients/types.js';
import { mergeAndSortAlerts } from '$lib/server/dashboardAlerts.js';

interface JobRow {
	id: string;
	status: string;
	duration_ms?: number;
	created_at: string;
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

			failedValue = totalJobs > 0 ? `${((failedCount / totalJobs) * 100).toFixed(1)}%` : '0';
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
	const alerts = await callSection(async () => {
		const sentryIssues = sentrySettled.status === 'fulfilled' ? sentrySettled.value : null;
		const flyMachines = flySettled.status === 'fulfilled' ? flySettled.value : null;
		return mergeAndSortAlerts(sentryIssues, flyMachines, Date.now());
	});

	return { stats, alerts };
};
