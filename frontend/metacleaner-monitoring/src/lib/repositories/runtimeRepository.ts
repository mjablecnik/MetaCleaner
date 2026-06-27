export interface RuntimeStat {
	key: string;
	labelKey: string;
	value: string;
	unit?: string;
	trend?: string;
	trendPositive?: boolean;
	badgeKey?: string;
	badgeClass?: string;
	icon: string;
	iconClass: string;
	subtextKey: string;
	subtextValue?: string;
	barWidth?: string;
	barClass?: string;
}

export interface MachineInstance {
	id: string;
	name: string;
	region: string;
	status: 'running' | 'stopped' | 'error';
	cpuPercent: number;
	ramUsed: string;
	ramTotal: string;
	uptime: string;
}

export interface DeployEntry {
	id: string;
	version: string;
	author: string;
	commitMessage: string;
	timestamp: string;
	duration: string;
	status: 'success' | 'failed' | 'rollback';
	statusClass: string;
	statusKey: string;
}

export interface RuntimeErrorEntry {
	id: string;
	time: string;
	level: string;
	levelClass: string;
	message: string;
	machine: string;
	statusKey: string;
	statusClass: string;
}

export function getRuntimeStats(): RuntimeStat[] {
	return [
		{
			key: 'cpuUsage',
			labelKey: 'runtime_kpi_cpuUsage',
			value: '67',
			unit: '%',
			icon: 'fa-microchip',
			iconClass: 'bg-[#3b82f6]/15 text-[#3b82f6]',
			subtextKey: 'runtime_kpi_cpuSubtext',
			barWidth: '67%',
			barClass: 'bg-[#3b82f6]'
		},
		{
			key: 'ramUsage',
			labelKey: 'runtime_kpi_ramUsage',
			value: '45',
			unit: '%',
			icon: 'fa-memory',
			iconClass: 'bg-[#8b5cf6]/15 text-[#8b5cf6]',
			subtextKey: 'runtime_kpi_ramSubtext',
			barWidth: '45%',
			barClass: 'bg-[#8b5cf6]'
		},
		{
			key: 'uptime30d',
			labelKey: 'runtime_kpi_uptime30d',
			value: '99.98',
			unit: '%',
			icon: 'fa-check-circle',
			iconClass: 'bg-success/15 text-success',
			subtextKey: 'runtime_kpi_uptimeSubtext'
		},
		{
			key: 'restarts30d',
			labelKey: 'runtime_kpi_restarts30d',
			value: '3',
			icon: 'fa-rotate-right',
			iconClass: 'bg-secondary/15 text-secondary',
			subtextKey: 'runtime_kpi_restartsSubtext',
			badgeKey: 'common_status_warning',
			badgeClass: 'bg-secondary/10 text-secondary'
		}
	];
}

export function getMachineInstances(): MachineInstance[] {
	return [
		{
			id: 'e286de4f550e18',
			name: 'api-1',
			region: 'fra (Frankfurt)',
			status: 'running',
			cpuPercent: 72,
			ramUsed: '384',
			ramTotal: '512',
			uptime: '12d 4h 32m'
		},
		{
			id: 'd89f2c1a834b91',
			name: 'api-2',
			region: 'fra (Frankfurt)',
			status: 'running',
			cpuPercent: 58,
			ramUsed: '310',
			ramTotal: '512',
			uptime: '8d 17h 15m'
		},
		{
			id: 'a47c9e2f112d56',
			name: 'api-3',
			region: 'ams (Amsterdam)',
			status: 'running',
			cpuPercent: 44,
			ramUsed: '256',
			ramTotal: '512',
			uptime: '3d 9h 44m'
		}
	];
}

export function getDeployHistory(): DeployEntry[] {
	return [
		{
			id: 'deploy-1',
			version: 'v2.14.1',
			author: 'martin.j',
			commitMessage: 'fix: resolve checkout 500 errors on concurrent requests',
			timestamp: 'Dnes, 11:24',
			duration: '2m 18s',
			status: 'success',
			statusClass: 'bg-success/10 text-success',
			statusKey: 'common_status_ok'
		},
		{
			id: 'deploy-2',
			version: 'v2.14.0',
			author: 'petra.n',
			commitMessage: 'feat: add OTP verification for new user registrations',
			timestamp: 'Včera, 16:05',
			duration: '3m 42s',
			status: 'success',
			statusClass: 'bg-success/10 text-success',
			statusKey: 'common_status_ok'
		},
		{
			id: 'deploy-3',
			version: 'v2.13.9',
			author: 'ondrej.k',
			commitMessage: 'perf: optimize product listing query with indexes',
			timestamp: 'Včera, 09:17',
			duration: '1m 55s',
			status: 'success',
			statusClass: 'bg-success/10 text-success',
			statusKey: 'common_status_ok'
		},
		{
			id: 'deploy-4',
			version: 'v2.13.8',
			author: 'martin.j',
			commitMessage: 'hotfix: rollback broken auth middleware',
			timestamp: '23. 5., 22:41',
			duration: '1m 12s',
			status: 'rollback',
			statusClass: 'bg-secondary/10 text-secondary',
			statusKey: 'runtime_deploy_rollback'
		},
		{
			id: 'deploy-5',
			version: 'v2.13.8',
			author: 'jana.h',
			commitMessage: 'refactor: migrate auth to new middleware stack',
			timestamp: '23. 5., 21:55',
			duration: '4m 08s',
			status: 'failed',
			statusClass: 'bg-error/10 text-error',
			statusKey: 'runtime_deploy_failed'
		}
	];
}

export function getRuntimeErrorLog(): RuntimeErrorEntry[] {
	return [
		{
			id: 'rterr-1',
			time: '14:32:11',
			level: 'ERROR',
			levelClass: 'bg-error/15 text-error',
			message: 'Unhandled exception in request handler – connection pool exhausted',
			machine: 'api-1 (e286de)',
			statusKey: 'common_status_active',
			statusClass: 'bg-error/10 text-error'
		},
		{
			id: 'rterr-2',
			time: '11:18:44',
			level: 'WARN',
			levelClass: 'bg-secondary/15 text-secondary',
			message: 'Memory usage above 80% threshold on api-1',
			machine: 'api-1 (e286de)',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'rterr-3',
			time: '09:52:03',
			level: 'ERROR',
			levelClass: 'bg-error/15 text-error',
			message: 'Fly machine restart triggered by OOM killer',
			machine: 'api-2 (d89f2c)',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		}
	];
}

export interface RuntimeSummary {
	machinesOnline: number;
	machinesTotal: number;
	region: string;
}

export function getRuntimeSummary(): RuntimeSummary {
	return {
		machinesOnline: 3,
		machinesTotal: 3,
		region: 'fra (Frankfurt)'
	};
}
