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
	subtextIsKey?: boolean;
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
	app: string;
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
	app: string;
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

export interface RuntimeSummary {
	machinesOnline: number;
	machinesTotal: number;
	region: string;
	statusBadge: string;
}

export interface TimeSeriesPoint {
	timestamp: number;
	value: number;
}

export function getRuntimeStats(): RuntimeStat[] {
	return [
		{
			key: 'cpuUsage',
			labelKey: 'runtime_kpi_cpuUsage',
			value: '72',
			unit: '%',
			icon: 'fa-microchip',
			iconClass: 'bg-[#3b82f6]/15 text-[#3b82f6]',
			barWidth: '72%',
			barClass: 'bg-secondary',
			subtext: 'Peak: 91% · avg 2 serverů',
			badgeKey: 'common_status_warning',
			badgeClass: 'bg-secondary/10 text-secondary',
			trend: '+12%',
			trendUp: true
		},
		{
			key: 'ramUsage',
			labelKey: 'runtime_kpi_ramUsage',
			value: '1.1',
			unit: '/ 2 GB',
			icon: 'fa-memory',
			iconClass: 'bg-[#8b5cf6]/15 text-[#8b5cf6]',
			barWidth: '55%',
			barClass: 'bg-[#3b82f6]',
			subtext: '55% · bez memory leaků',
			badgeKey: 'common_status_ok',
			badgeClass: 'bg-success/10 text-success'
		},
		{
			key: 'uptime30d',
			labelKey: 'runtime_kpi_uptime30d',
			value: '99.92',
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
			value: '3',
			valueClass: 'text-error',
			icon: 'fa-rotate-right',
			iconClass: 'bg-secondary/15 text-secondary',
			subtext: 'OOM kill: 2 · Crash: 1',
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
			id: '4d891a2b',
			name: 'server-01',
			displayId: '4d891a2b',
			app: 'metacleaner-server',
			region: 'fra (Frankfurt)',
			status: 'running',
			cpuPercent: 72,
			cpuClass: 'bg-secondary',
			cpuDisplay: '72%',
			cpuWarning: false,
			ramDisplay: '680 MB',
			ramTotalDisplay: '1',
			ramBarWidth: '66%',
			uptime: '18h 42m'
		},
		{
			id: '7f3c552e',
			name: 'server-02',
			displayId: '7f3c552e',
			app: 'metacleaner-server',
			region: 'fra (Frankfurt)',
			status: 'running',
			cpuPercent: 45,
			cpuClass: 'bg-[#a78bfa]',
			cpuDisplay: '45%',
			cpuWarning: false,
			ramDisplay: '420 MB',
			ramTotalDisplay: '1',
			ramBarWidth: '41%',
			uptime: '6h 18m'
		},
		{
			id: 'a1d43f8c',
			name: 'web-01',
			displayId: 'a1d43f8c',
			app: 'metacleaner-web',
			region: 'fra (Frankfurt)',
			status: 'running',
			cpuPercent: 2,
			cpuClass: 'bg-[#a78bfa]',
			cpuDisplay: '2%',
			cpuWarning: false,
			ramDisplay: '48 MB',
			ramTotalDisplay: '0.25',
			ramBarWidth: '19%',
			uptime: '4d 12h'
		},
		{
			id: 'c2b87e1a',
			name: 'app-01',
			displayId: 'c2b87e1a',
			app: 'metacleaner-app',
			region: 'fra (Frankfurt)',
			status: 'running',
			cpuPercent: 3,
			cpuClass: 'bg-[#a78bfa]',
			cpuDisplay: '3%',
			cpuWarning: false,
			ramDisplay: '52 MB',
			ramTotalDisplay: '0.25',
			ramBarWidth: '20%',
			uptime: '4d 12h'
		},
		{
			id: 'e9f21d47',
			name: 'mon-01',
			displayId: 'e9f21d47',
			app: 'metacleaner-monitoring',
			region: 'fra (Frankfurt)',
			status: 'running',
			cpuPercent: 8,
			cpuClass: 'bg-[#a78bfa]',
			cpuDisplay: '8%',
			cpuWarning: false,
			ramDisplay: '180 MB',
			ramTotalDisplay: '0.5',
			ramBarWidth: '35%',
			uptime: '2h 45m'
		}
	];
}

export function getDeployHistory(): DeployEntry[] {
	return [
		{
			id: 'deploy-1',
			version: 'v1.8.2',
			app: 'metacleaner-server',
			author: 'martin.j',
			commitMessage: 'fix: ExifTool timeout on corrupted HEIC files',
			timestamp: 'Dnes 11:04',
			duration: '42s',
			status: 'success',
			statusClass: 'bg-success/15 text-success',
			statusKey: 'common_status_ok',
			icon: 'fa-check',
			iconClass: 'bg-success/15 text-success',
			subtext: '42s · server-01, server-02 ✓'
		},
		{
			id: 'deploy-2',
			version: 'v2.5.1',
			app: 'metacleaner-app',
			author: 'martin.j',
			commitMessage: 'fix: locale switch scroll position preserved',
			timestamp: 'Včera 15:22',
			duration: '28s',
			status: 'success',
			statusClass: 'bg-success/15 text-success',
			statusKey: 'common_status_ok',
			icon: 'fa-check',
			iconClass: 'bg-success/15 text-success',
			subtext: '28s · app-01 ✓'
		},
		{
			id: 'deploy-3',
			version: 'v1.3.0',
			app: 'metacleaner-web',
			author: 'martin.j',
			commitMessage: 'feat: pricing page redesign with shared components',
			timestamp: '3 dny 09:45',
			duration: '25s',
			status: 'success',
			statusClass: 'bg-success/15 text-success',
			statusKey: 'common_status_ok',
			icon: 'fa-check',
			iconClass: 'bg-success/15 text-success',
			subtext: '25s · web-01 ✓'
		},
		{
			id: 'deploy-4',
			version: 'v1.8.1',
			app: 'metacleaner-server',
			author: 'martin.j',
			commitMessage: 'feat: API key rate limiting (120 RPM default)',
			timestamp: '5 dní 14:30',
			duration: '40s',
			status: 'success',
			statusClass: 'bg-success/15 text-success',
			statusKey: 'common_status_ok',
			icon: 'fa-check',
			iconClass: 'bg-success/15 text-success',
			subtext: '40s · server-01, server-02 ✓'
		},
		{
			id: 'deploy-5',
			version: 'v1.8.0',
			app: 'metacleaner-server',
			author: 'martin.j',
			commitMessage: 'feat: PDF report generation with QR codes',
			timestamp: '7 dní 10:15',
			duration: '',
			status: 'failed',
			statusClass: 'bg-error/15 text-error',
			statusKey: 'common_status_warning',
			icon: 'fa-xmark',
			iconClass: 'bg-error/15 text-error',
			subtext: 'Rollback → v1.7.9'
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
			message: 'FFmpeg killed — exceeded 1GB limit during 4K MOV remuxing',
			machine: 'server-01',
			statusKey: 'common_status_restarted',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'rterr-2',
			time: '13:22:44',
			level: 'Crash',
			levelClass: 'bg-secondary/15 text-secondary',
			borderClass: 'border-secondary/20',
			message: 'ExifTool process timeout 30s on corrupted DNG file',
			machine: 'server-02',
			statusKey: 'common_status_restarted',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'rterr-3',
			time: '11:08:31',
			level: 'Health',
			levelClass: 'bg-[#3b82f6]/15 text-[#3b82f6]',
			borderClass: 'border-[#334155]/40',
			message: 'Health check failed 3× — /api/health returned 503 (Supabase connection refused)',
			machine: 'server-01',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'rterr-4',
			time: '10:44:19',
			level: 'Timeout',
			levelClass: 'bg-[#8b5cf6]/15 text-[#8b5cf6]',
			borderClass: 'border-[#8b5cf6]/20',
			message: 'WebSocket write to closed connection — client disconnected during job progress',
			machine: 'server-01',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'rterr-5',
			time: '08:17:55',
			level: 'Crash',
			levelClass: 'bg-secondary/15 text-secondary',
			borderClass: 'border-secondary/20',
			message: 'Panic: nil pointer in metadata field categorization',
			machine: 'server-02',
			statusKey: 'common_status_restarted',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'rterr-6',
			time: '06:03:12',
			level: 'OOM Kill',
			levelClass: 'bg-error/15 text-error',
			borderClass: 'border-error/20',
			message: 'RSS exceeded 1GB during concurrent batch (3 large videos simultaneously)',
			machine: 'server-01',
			statusKey: 'common_status_restarted',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'rterr-7',
			time: '03:40:08',
			level: 'Timeout',
			levelClass: 'bg-[#8b5cf6]/15 text-[#8b5cf6]',
			borderClass: 'border-[#8b5cf6]/20',
			message: 'POST /api/upload timed out after 60s — 480MB file on slow connection',
			machine: 'server-01',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'rterr-8',
			time: '01:14:33',
			level: 'Health',
			levelClass: 'bg-[#3b82f6]/15 text-[#3b82f6]',
			borderClass: 'border-[#334155]/40',
			message: 'Readiness probe failed — temp storage disk full (cleanup job stalled)',
			machine: 'server-02',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		}
	];
}

export function getRuntimeSummary(): RuntimeSummary {
	return {
		machinesOnline: 5,
		machinesTotal: 5,
		region: 'fra (Frankfurt)',
		statusBadge: '5 / 5 Mašiny online'
	};
}
