export interface RuntimeStat {
	key: string;
	labelKey: string;
	value: string;
	unit?: string;
	trend?: string;
	trendUp?: boolean;
	trendClass?: string;
	valueClass?: string;
	badgeKey?: string;
	badgeClass?: string;
	icon: string;
	iconClass: string;
	subtext: string;
	barWidth?: string;
	barClass?: string;
}

export interface RuntimeSecondaryKpi {
	key: string;
	labelKey: string;
	value: string;
	unit: string;
	icon: string;
	iconClass: string;
	subtext: string;
}

export interface MachineInstance {
	id: string;
	name: string;
	displayId: string;
	region: string;
	status: 'running' | 'stopped' | 'error';
	cpuPercent: number;
	cpuClass: string;
	cpuDisplay: string;
	cpuWarning: boolean;
	ramDisplay: string;
	ramTotalDisplay: string;
	ramBarWidth: string;
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
	icon: string;
	iconClass: string;
	subtext: string;
}

export interface RuntimeErrorEntry {
	id: string;
	time: string;
	level: string;
	levelClass: string;
	borderClass: string;
	message: string;
	machine: string;
	statusKey: string;
	statusClass: string;
}

export interface HttpStatusItem {
	label: string;
	percent: number;
	color: string;
}

export interface RuntimeSummary {
	machinesOnline: number;
	machinesTotal: number;
	region: string;
	statusBadge: string;
}

export function getRuntimeStats(): RuntimeStat[] {
	return [
		{
			key: 'cpuUsage',
			labelKey: 'runtime_kpi_cpuUsage',
			value: '74',
			unit: '%',
			icon: 'fa-microchip',
			iconClass: 'bg-[#3b82f6]/15 text-[#3b82f6]',
			barWidth: '74%',
			barClass: 'bg-secondary',
			subtext: 'Peak: 91% · avg 3 strojů',
			badgeKey: 'common_status_warning',
			badgeClass: 'bg-secondary/10 text-secondary',
			trend: '+12%',
			trendUp: true
		},
		{
			key: 'ramUsage',
			labelKey: 'runtime_kpi_ramUsage',
			value: '1.8',
			unit: '/ 4 GB',
			icon: 'fa-memory',
			iconClass: 'bg-[#8b5cf6]/15 text-[#8b5cf6]',
			barWidth: '45%',
			barClass: 'bg-[#3b82f6]',
			subtext: '45% · bez memory leaků',
			badgeKey: 'common_status_ok',
			badgeClass: 'bg-success/10 text-success'
		},
		{
			key: 'uptime30d',
			labelKey: 'runtime_kpi_uptime30d',
			value: '99.97',
			unit: '%',
			valueClass: 'text-success',
			icon: 'fa-check-circle',
			iconClass: 'bg-success/15 text-success',
			subtext: 'Výpadek: 8 min · 1 incident',
			badgeKey: 'common_status_ok',
			badgeClass: 'bg-success/10 text-success'
		},
		{
			key: 'restarts24h',
			labelKey: 'runtime_kpi_restarts24h',
			value: '5',
			valueClass: 'text-error',
			icon: 'fa-rotate-right',
			iconClass: 'bg-secondary/15 text-secondary',
			subtext: 'OOM kill: 2 · Crash: 3',
			badgeKey: 'common_status_critical',
			badgeClass: 'bg-error/10 text-error',
			trend: '+3',
			trendUp: true,
			trendClass: 'text-error'
		}
	];
}

export function getRuntimeSecondaryKpis(): RuntimeSecondaryKpi[] {
	return [
		{
			key: 'activeInstances',
			labelKey: 'runtime_kpi_activeInstances',
			value: '3',
			unit: '/ 5 max',
			icon: 'fa-network-wired',
			iconClass: 'bg-[#a78bfa]/15 text-[#a78bfa]',
			subtext: 'Autoscale: OFF · fra region'
		},
		{
			key: 'networkTraffic',
			labelKey: 'runtime_kpi_networkTraffic',
			value: '2.4',
			unit: 'GB/h',
			icon: 'fa-arrows-left-right',
			iconClass: 'bg-[#3ecf8e]/15 text-[#3ecf8e]',
			subtext: 'IN: 840 MB · OUT: 1.56 GB'
		},
		{
			key: 'avgResponseTime',
			labelKey: 'runtime_kpi_avgResponseTime',
			value: '112',
			unit: 'ms',
			icon: 'fa-clock',
			iconClass: 'bg-[#3b82f6]/15 text-[#3b82f6]',
			subtext: 'P99: 840ms · P95: 420ms'
		},
		{
			key: 'lastDeploy',
			labelKey: 'runtime_kpi_lastDeploy',
			value: 'v2.14.1',
			unit: '',
			icon: 'fa-rocket',
			iconClass: 'bg-secondary/15 text-secondary',
			subtext: 'Dnes 11:04 · 38s deploy time'
		}
	];
}

export function getMachineInstances(): MachineInstance[] {
	return [
		{
			id: '4d4e555f',
			name: 'fra-01',
			displayId: '4d4e555f',
			region: 'fra (Frankfurt)',
			status: 'running',
			cpuPercent: 68,
			cpuClass: 'bg-[#a78bfa]',
			cpuDisplay: '68%',
			cpuWarning: false,
			ramDisplay: '880 MB',
			ramTotalDisplay: '2',
			ramBarWidth: '44%',
			uptime: '18h 42m'
		},
		{
			id: '7f8a992b',
			name: 'fra-02',
			displayId: '7f8a992b',
			region: 'fra (Frankfurt)',
			status: 'running',
			cpuPercent: 91,
			cpuClass: 'bg-secondary',
			cpuDisplay: '91% ⚠',
			cpuWarning: true,
			ramDisplay: '1.04 GB',
			ramTotalDisplay: '2',
			ramBarWidth: '52%',
			uptime: '3h 18m'
		},
		{
			id: 'b1c2d3e4',
			name: 'fra-03',
			displayId: 'b1c2d3e4',
			region: 'fra (Frankfurt)',
			status: 'running',
			cpuPercent: 62,
			cpuClass: 'bg-[#a78bfa]',
			cpuDisplay: '62%',
			cpuWarning: false,
			ramDisplay: '760 MB',
			ramTotalDisplay: '2',
			ramBarWidth: '38%',
			uptime: '18h 42m'
		}
	];
}

export function getDeployHistory(): DeployEntry[] {
	return [
		{
			id: 'deploy-1',
			version: 'v2.14.1',
			author: 'martin.j',
			commitMessage: 'Fix: memory leak in session handler',
			timestamp: 'Dnes 11:04',
			duration: '38s',
			status: 'success',
			statusClass: 'bg-success/15 text-success',
			statusKey: 'common_status_ok',
			icon: 'fa-check',
			iconClass: 'bg-success/15 text-success',
			subtext: '38s · 3 stroje ✓'
		},
		{
			id: 'deploy-2',
			version: 'v2.14.0',
			author: 'petra.n',
			commitMessage: 'feat: nový API endpoint /v2/orders',
			timestamp: 'Včera 16:32',
			duration: '44s',
			status: 'success',
			statusClass: 'bg-success/15 text-success',
			statusKey: 'common_status_ok',
			icon: 'fa-check',
			iconClass: 'bg-success/15 text-success',
			subtext: '44s · 3 stroje ✓'
		},
		{
			id: 'deploy-3',
			version: 'v2.13.9',
			author: 'ondrej.k',
			commitMessage: 'Failed: health check timeout',
			timestamp: '2 dny 09:15',
			duration: '',
			status: 'failed',
			statusClass: 'bg-error/15 text-error',
			statusKey: 'runtime_deploy_failed',
			icon: 'fa-xmark',
			iconClass: 'bg-error/15 text-error',
			subtext: 'Rollback → v2.13.8'
		},
		{
			id: 'deploy-4',
			version: 'v2.13.8',
			author: 'martin.j',
			commitMessage: 'chore: deps update, perf patches',
			timestamp: '3 dny 14:00',
			duration: '41s',
			status: 'success',
			statusClass: 'bg-success/15 text-success',
			statusKey: 'common_status_ok',
			icon: 'fa-check',
			iconClass: 'bg-success/15 text-success',
			subtext: '41s · 3 stroje ✓'
		},
		{
			id: 'deploy-5',
			version: 'v2.13.7',
			author: 'jana.h',
			commitMessage: 'fix: rate limiter edge case',
			timestamp: '5 dní 08:22',
			duration: '36s',
			status: 'success',
			statusClass: 'bg-success/15 text-success',
			statusKey: 'common_status_ok',
			icon: 'fa-check',
			iconClass: 'bg-success/15 text-success',
			subtext: '36s · 3 stroje ✓'
		}
	];
}

export function getRuntimeErrorLog(): RuntimeErrorEntry[] {
	return [
		{
			id: 'rterr-1',
			time: '14:51:02',
			level: 'OOM Kill',
			levelClass: 'bg-error/15 text-error',
			borderClass: 'border-error/20',
			message: 'Process killed – exceeded 2 GB memory limit',
			machine: 'fra-02',
			statusKey: 'common_status_restarted',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'rterr-2',
			time: '13:22:44',
			level: 'Crash',
			levelClass: 'bg-secondary/15 text-secondary',
			borderClass: 'border-secondary/20',
			message: 'Unhandled exception in /api/v2/orders handler',
			machine: 'fra-02',
			statusKey: 'common_status_restarted',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'rterr-3',
			time: '11:08:31',
			level: 'Health',
			levelClass: 'bg-[#3b82f6]/15 text-[#3b82f6]',
			borderClass: 'border-[#334155]/40',
			message: 'Health check failed 3x – /health returned 503',
			machine: 'fra-01',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'rterr-4',
			time: '10:44:19',
			level: 'Crash',
			levelClass: 'bg-secondary/15 text-secondary',
			borderClass: 'border-secondary/20',
			message: 'SIGKILL received after 30s startup timeout',
			machine: 'fra-02',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'rterr-5',
			time: '08:17:55',
			level: 'OOM Kill',
			levelClass: 'bg-error/15 text-error',
			borderClass: 'border-error/20',
			message: 'RSS memory exceeded limit during batch job',
			machine: 'fra-03',
			statusKey: 'common_status_restarted',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'rterr-6',
			time: '06:03:12',
			level: 'Timeout',
			levelClass: 'bg-[#8b5cf6]/15 text-[#8b5cf6]',
			borderClass: 'border-[#8b5cf6]/20',
			message: 'Request timeout 30s exceeded on POST /webhooks',
			machine: 'fra-01',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'rterr-7',
			time: '03:40:08',
			level: 'Crash',
			levelClass: 'bg-secondary/15 text-secondary',
			borderClass: 'border-secondary/20',
			message: 'Segfault in native addon – node-canvas v2.11.2',
			machine: 'fra-02',
			statusKey: 'common_status_restarted',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'rterr-8',
			time: '01:14:33',
			level: 'Health',
			levelClass: 'bg-[#3b82f6]/15 text-[#3b82f6]',
			borderClass: 'border-[#334155]/40',
			message: 'Readiness probe failed – DB connection not ready',
			machine: 'fra-01',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		}
	];
}

export function getRuntimeHttpStatusDistribution(): HttpStatusItem[] {
	return [
		{ label: '2xx OK', percent: 94.2, color: 'bg-[#3ecf8e]' },
		{ label: '3xx Redirect', percent: 2.8, color: 'bg-[#3b82f6]' },
		{ label: '4xx Client', percent: 2.1, color: 'bg-[#f97316]' },
		{ label: '5xx Server', percent: 0.9, color: 'bg-error' }
	];
}

export function getRuntimeSummary(): RuntimeSummary {
	return {
		machinesOnline: 3,
		machinesTotal: 3,
		region: 'fra (Frankfurt)',
		statusBadge: '3 / 3 Mašiny online'
	};
}
