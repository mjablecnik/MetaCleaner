export interface DashboardStat {
	key: string;
	labelKey: string;
	value: string;
	trend?: string;
	trendPositive?: boolean;
	icon: string;
	iconClass: string;
	subtextMobile?: string;
	subtextDesktop?: string;
	barWidth?: string;
	barClass?: string;
}

export interface AlertItem {
	id: string;
	severity: 'error' | 'warning' | 'resolved';
	titleKey: string;
	title: string;
	descriptionMobile: string;
	descriptionDesktop: string;
	timeMobile: string;
	timeDesktop: string;
}

export function getDashboardStats(): DashboardStat[] {
	return [
		{
			key: 'uptimeServer',
			labelKey: 'dashboard_stats_uptimeServer',
			value: '99.92%',
			icon: 'fa-server',
			iconClass: 'text-textSec',
			barWidth: 'w-[99.92%]',
			barClass: 'bg-success'
		},
		{
			key: 'jobsProcessed',
			labelKey: 'dashboard_stats_jobsProcessed',
			value: '847',
			icon: 'fa-broom',
			iconClass: 'text-textSec',
			subtextMobile: 'dashboard_stats_jobsProcessedSubtext',
			subtextDesktop: 'dashboard_stats_jobsProcessedSubtext'
		},
		{
			key: 'avgCleaningTime',
			labelKey: 'dashboard_stats_avgCleaningTime',
			value: '4.2s',
			icon: 'fa-clock',
			iconClass: 'text-textSec',
			subtextMobile: 'dashboard_stats_avgCleaningTimeSubtext',
			subtextDesktop: 'dashboard_stats_avgCleaningTimeSubtext'
		},
		{
			key: 'failedJobs',
			labelKey: 'dashboard_stats_failedJobs',
			value: '0.8%',
			trend: '-0.2%',
			trendPositive: true,
			icon: 'fa-bug',
			iconClass: 'text-error bg-error/10 p-2 rounded-lg'
		}
	];
}

export interface DashboardAlert {
	id: string;
	severity: 'error' | 'warning' | 'resolved';
	title: string;
	descriptionMobile: string;
	descriptionDesktop: string;
	timeMobile: string;
	timeDesktop: string;
}

export function getDashboardAlerts(): DashboardAlert[] {
	return [
		{
			id: 'alert-1',
			severity: 'error',
			title: 'ExifTool process timeout',
			descriptionMobile:
				'ExifTool hung on corrupted HEIC file, job failed after 30s timeout. POST /api/jobs.',
			descriptionDesktop:
				'ExifTool hung on a corrupted HEIC file, job failed after 30s timeout. POST /api/jobs.',
			timeMobile: '15 min',
			timeDesktop: '15 min ago'
		},
		{
			id: 'alert-2',
			severity: 'warning',
			title: 'High memory on metacleaner-server',
			descriptionMobile: 'RAM at 89% (910MB / 1024MB) during concurrent video processing.',
			descriptionDesktop:
				'RAM at 89% (910MB / 1024MB), approaching limit during concurrent video processing.',
			timeMobile: '2 hrs',
			timeDesktop: '2 hours ago'
		},
		{
			id: 'alert-3',
			severity: 'resolved',
			title: 'Stripe webhook retry storm',
			descriptionMobile: 'Stripe retried webhook 3× before delivery, billing delayed 4 min.',
			descriptionDesktop:
				'Stripe retried failed webhook 3× before successful delivery, billing data synced with 4-minute delay.',
			timeMobile: 'Yesterday',
			timeDesktop: 'Yesterday 14:30'
		}
	];
}

export interface ResponseTimeStat {
	value: number;
	unit: string;
	percentile: string;
}

export function getResponseTimeStat(): ResponseTimeStat {
	return { value: 285, unit: 'ms', percentile: 'p95' };
}
