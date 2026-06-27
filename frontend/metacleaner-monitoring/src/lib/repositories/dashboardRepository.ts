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
			key: 'uptimeFrontend',
			labelKey: 'dashboard_stats_uptimeFrontend',
			value: '99.99%',
			icon: 'fa-desktop',
			iconClass: 'text-textSec',
			barWidth: 'w-full',
			barClass: 'bg-success'
		},
		{
			key: 'uptimeBackend',
			labelKey: 'dashboard_stats_uptimeBackend',
			value: '99.95%',
			icon: 'fa-server',
			iconClass: 'text-textSec',
			barWidth: 'w-[99.95%]',
			barClass: 'bg-success'
		},
		{
			key: 'errorRate',
			labelKey: 'dashboard_stats_errorRate',
			value: '0.12%',
			trend: '-0.05%',
			trendPositive: true,
			icon: 'fa-bug',
			iconClass: 'text-error bg-error/10 p-2 rounded-lg',
			subtextMobile: 'dashboard_stats_errorRateSubtextMobile',
			subtextDesktop: 'dashboard_stats_errorRateSubtextMobile'
		},
		{
			key: 'dbHealth',
			labelKey: 'dashboard_stats_dbHealth',
			value: 'Healthy',
			icon: 'fa-database',
			iconClass: 'text-textSec',
			subtextMobile: 'dashboard_stats_dbHealthSubtextMobile',
			subtextDesktop: 'dashboard_stats_dbHealthSubtextDesktop'
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
			title: 'Zvýšený počet 500 chyb na API',
			descriptionMobile: 'Detekován spike chyb na endpointu /api/v1/checkout. Restartováno 1x.',
			descriptionDesktop: 'Detekován spike chyb na endpointu /api/v1/checkout. Restartováno 1x.',
			timeMobile: '15 min',
			timeDesktop: 'Před 15 min'
		},
		{
			id: 'alert-2',
			severity: 'warning',
			title: 'Zpomalené dotazy v DB',
			descriptionMobile: 'Uživatelé hlásí pomalé načítání. Průměrná latence stoupla nad 500ms.',
			descriptionDesktop: 'Uživatelé hlásí pomalé načítání. Průměrná latence stoupla nad 500ms.',
			timeMobile: '2 hod',
			timeDesktop: 'Před 2 hod'
		},
		{
			id: 'alert-3',
			severity: 'resolved',
			title: 'Frontend Deployment Timeout',
			descriptionMobile: 'Vyřešeno po restartu pipeliny.',
			descriptionDesktop: 'Vyřešeno automaticky po restartu CI/CD pipeliny.',
			timeMobile: 'Včera',
			timeDesktop: 'Včera, 14:30'
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
