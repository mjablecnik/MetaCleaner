export interface PerformanceKpiStat {
	key: string;
	labelKey: string;
	value: string;
	unit?: string;
	trend?: string;
	trendPositive?: boolean;
	trendUp?: boolean;
	badgeKey: string;
	badgeClass: string;
	subtext: string;
	barWidth?: string;
	barClass?: string;
	valueClass?: string;
}

export interface PerformanceSecondaryKpi {
	key: string;
	labelKey: string;
	shortLabel: string;
	value: string;
	unit?: string;
	subtext: string;
	icon: string;
	iconColor: string;
	iconBg: string;
	barWidth?: string;
	barColor?: string;
}

export interface SlowEndpoint {
	id: string;
	method: string;
	methodClass: string;
	path: string;
	callCount: string;
	errorRate: string;
	avgMs: number;
	barWidth: string;
	timeColor: string;
	barColor: string;
}

export interface PerformanceEvent {
	id: string;
	time: string;
	level: 'critical' | 'warning' | 'info';
	levelKey: string;
	levelClass: string;
	type: string;
	message: string;
	endpoint?: string;
	statusKey: string;
	statusClass: string;
}

export function getPerformanceKpiStats(): PerformanceKpiStat[] {
	return [
		{
			key: 'apdex',
			labelKey: 'performance_kpi_apdex',
			value: '0.91',
			trend: '-0.03',
			trendPositive: false,
			trendUp: false,
			badgeKey: 'performance_kpi_apdexBadge',
			badgeClass: 'bg-success/10 text-success',
			subtext: 'Goal: ≥ 0.90 · Threshold: 500ms',
			barWidth: '91%',
			barClass: 'bg-success'
		},
		{
			key: 'avgResponseTime',
			labelKey: 'performance_kpi_avgResponseTime',
			value: '340',
			unit: 'ms',
			trend: '+153ms',
			trendPositive: false,
			trendUp: true,
			badgeKey: 'common_status_warning',
			badgeClass: 'bg-secondary/10 text-secondary',
			subtext: 'P95: 1,840ms · P99: 4,200ms'
		},
		{
			key: 'throughput',
			labelKey: 'performance_kpi_throughput',
			value: '890',
			unit: 'req/min',
			badgeKey: 'performance_kpi_throughputBadge',
			badgeClass: 'bg-[#3b82f6]/10 text-[#3b82f6]',
			subtext: 'Peak: 1,420 rpm (19:00)'
		},
		{
			key: 'errorRate',
			labelKey: 'performance_kpi_errorRate',
			value: '1.2',
			unit: '%',
			trend: '-0.6%',
			trendPositive: true,
			trendUp: false,
			badgeKey: 'common_status_warning',
			badgeClass: 'bg-secondary/10 text-secondary',
			subtext: 'Goal: < 1% · 5xx: 12 per 24h',
			valueClass: 'text-secondary'
		}
	];
}

export function getPerformanceSecondaryKpis(): PerformanceSecondaryKpi[] {
	return [
		{
			key: 'ramUtilization',
			labelKey: 'performance_kpi_ramUtilization',
			shortLabel: 'RAM',
			value: '72',
			unit: '%',
			subtext: '5.8 GB / 8 GB',
			icon: 'fa-memory',
			iconColor: 'text-[#f59e0b]',
			iconBg: 'bg-[#f59e0b]/15',
			barWidth: '72%',
			barColor: 'bg-[#f59e0b]'
		},
		{
			key: 'cpuUtilization',
			labelKey: 'performance_kpi_cpuUtilization',
			shortLabel: 'CPU',
			value: '38',
			unit: '%',
			subtext: 'Peak: 84% (10:38)',
			icon: 'fa-microchip',
			iconColor: 'text-[#3ecf8e]',
			iconBg: 'bg-[#3ecf8e]/15',
			barWidth: '38%',
			barColor: 'bg-[#3ecf8e]'
		},
		{
			key: 'networkLatency',
			labelKey: 'performance_kpi_networkLatency',
			shortLabel: 'Latency',
			value: '12',
			unit: 'ms',
			subtext: 'CDN cache hit: 91.4%',
			icon: 'fa-network-wired',
			iconColor: 'text-[#3b82f6]',
			iconBg: 'bg-[#3b82f6]/15'
		},
		{
			key: 'uptime30d',
			labelKey: 'performance_kpi_uptime',
			shortLabel: 'Uptime',
			value: '99.97',
			unit: '%',
			subtext: 'Outages: 2 × 4 min total',
			icon: 'fa-arrow-up-right-dots',
			iconColor: 'text-success',
			iconBg: 'bg-success/15'
		}
	];
}

export function getSlowEndpoints(): SlowEndpoint[] {
	return [
		{
			id: 'ep-1',
			method: 'POST',
			methodClass: 'bg-error/20 text-error',
			path: '/api/upload',
			callCount: '1,420',
			errorRate: '1.2%',
			avgMs: 2840,
			barWidth: '100%',
			timeColor: 'text-error',
			barColor: 'bg-error'
		},
		{
			id: 'ep-2',
			method: 'POST',
			methodClass: 'bg-error/20 text-error',
			path: '/api/jobs',
			callCount: '1,380',
			errorRate: '2.1%',
			avgMs: 1620,
			barWidth: '57%',
			timeColor: 'text-error',
			barColor: 'bg-error'
		},
		{
			id: 'ep-3',
			method: 'GET',
			methodClass: 'bg-[#3b82f6]/20 text-[#3b82f6]',
			path: '/api/jobs/{id}/download',
			callCount: '640',
			errorRate: '0.4%',
			avgMs: 980,
			barWidth: '35%',
			timeColor: 'text-secondary',
			barColor: 'bg-secondary'
		},
		{
			id: 'ep-4',
			method: 'GET',
			methodClass: 'bg-[#3b82f6]/20 text-[#3b82f6]',
			path: '/api/reports/{id}/pdf',
			callCount: '280',
			errorRate: '0.7%',
			avgMs: 740,
			barWidth: '26%',
			timeColor: 'text-secondary',
			barColor: 'bg-secondary'
		},
		{
			id: 'ep-5',
			method: 'POST',
			methodClass: 'bg-error/20 text-error',
			path: '/api/billing/checkout',
			callCount: '45',
			errorRate: '0%',
			avgMs: 520,
			barWidth: '18%',
			timeColor: 'text-[#f59e0b]',
			barColor: 'bg-[#f59e0b]'
		},
		{
			id: 'ep-6',
			method: 'POST',
			methodClass: 'bg-error/20 text-error',
			path: '/api/auth/register',
			callCount: '34',
			errorRate: '2.9%',
			avgMs: 340,
			barWidth: '12%',
			timeColor: 'text-[#3ecf8e]',
			barColor: 'bg-[#3ecf8e]'
		}
	];
}

export function getPerformanceEvents(): PerformanceEvent[] {
	return [
		{
			id: 'evt-1',
			time: '19:14:32',
			level: 'critical',
			levelKey: 'performance_filters_critical',
			levelClass: 'bg-error/15 text-error',
			type: 'Upload Timeout',
			message: 'POST /api/upload exceeded 30s processing limit on 450MB video file',
			endpoint: '/api/upload',
			statusKey: 'performance_status_active',
			statusClass: 'bg-error/10 text-error'
		},
		{
			id: 'evt-2',
			time: '18:42:08',
			level: 'warning',
			levelKey: 'performance_filters_warning',
			levelClass: 'bg-secondary/15 text-secondary',
			type: 'Pipeline Backpressure',
			message: 'Job worker pool full (3/3 concurrent), new jobs queued for 12s average',
			endpoint: '/api/jobs',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'evt-3',
			time: '17:55:19',
			level: 'warning',
			levelKey: 'performance_filters_warning',
			levelClass: 'bg-secondary/15 text-secondary',
			type: 'Slow DB Query',
			message: 'SELECT on reports table took 2,400ms — missing index on user_id + created_at',
			endpoint: 'Supabase · reports table',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'evt-4',
			time: '19:00:00',
			level: 'info',
			levelKey: 'performance_filters_info',
			levelClass: 'bg-[#3b82f6]/15 text-[#3b82f6]',
			type: 'Traffic Spike',
			message: '120 concurrent uploads during 19:00–20:00 evening peak, all handled within SLA',
			endpoint: 'Entire infrastructure',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'evt-5',
			time: '12:30:01',
			level: 'info',
			levelKey: 'performance_filters_info',
			levelClass: 'bg-[#3b82f6]/15 text-[#3b82f6]',
			type: 'Deploy',
			message: 'metacleaner-server v1.8.2 deployed — rolling restart completed in 38s',
			endpoint: 'metacleaner-server',
			statusKey: 'performance_status_completed',
			statusClass: 'bg-success/10 text-success'
		}
	];
}
