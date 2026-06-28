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
			value: '0.94',
			trend: '+0.02',
			trendPositive: true,
			trendUp: true,
			badgeKey: 'performance_kpi_apdexBadge',
			badgeClass: 'bg-success/10 text-success',
			subtext: 'Goal: ≥ 0.90 · Threshold: 500ms',
			barWidth: '94%',
			barClass: 'bg-success'
		},
		{
			key: 'avgResponseTime',
			labelKey: 'performance_kpi_avgResponseTime',
			value: '187',
			unit: 'ms',
			trend: '-14ms',
			trendPositive: true,
			trendUp: false,
			badgeKey: 'common_status_ok',
			badgeClass: 'bg-success/10 text-success',
			subtext: 'P95: 480ms · P99: 1,240ms'
		},
		{
			key: 'throughput',
			labelKey: 'performance_kpi_throughput',
			value: '3,841',
			unit: 'req/min',
			badgeKey: 'performance_kpi_throughputBadge',
			badgeClass: 'bg-[#3b82f6]/10 text-[#3b82f6]',
			subtext: 'Peak: 6,210 rpm (10:42)'
		},
		{
			key: 'errorRate',
			labelKey: 'performance_kpi_errorRate',
			value: '1.8',
			unit: '%',
			trend: '+0.4%',
			trendPositive: false,
			trendUp: true,
			badgeKey: 'common_status_warning',
			badgeClass: 'bg-secondary/10 text-secondary',
			subtext: 'Goal: < 1% · 5xx: 68 per 24h',
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
			path: '/api/v1/orders/checkout',
			callCount: '2,841',
			errorRate: '4.2%',
			avgMs: 1840,
			barWidth: '100%',
			timeColor: 'text-error',
			barColor: 'bg-error'
		},
		{
			id: 'ep-2',
			method: 'GET',
			methodClass: 'bg-[#3b82f6]/20 text-[#3b82f6]',
			path: '/api/v1/analytics/report',
			callCount: '184',
			errorRate: '1.1%',
			avgMs: 940,
			barWidth: '51%',
			timeColor: 'text-secondary',
			barColor: 'bg-secondary'
		},
		{
			id: 'ep-3',
			method: 'GET',
			methodClass: 'bg-[#3b82f6]/20 text-[#3b82f6]',
			path: '/api/v1/users/search',
			callCount: '5,200',
			errorRate: '0.8%',
			avgMs: 620,
			barWidth: '34%',
			timeColor: 'text-[#f59e0b]',
			barColor: 'bg-[#f59e0b]'
		},
		{
			id: 'ep-4',
			method: 'PUT',
			methodClass: 'bg-error/20 text-error',
			path: '/api/v1/products/:id',
			callCount: '1,024',
			errorRate: '2.1%',
			avgMs: 480,
			barWidth: '26%',
			timeColor: 'text-[#3b82f6]',
			barColor: 'bg-[#3b82f6]'
		},
		{
			id: 'ep-5',
			method: 'GET',
			methodClass: 'bg-[#3b82f6]/20 text-[#3b82f6]',
			path: '/api/v1/products',
			callCount: '18,420',
			errorRate: '0.3%',
			avgMs: 310,
			barWidth: '17%',
			timeColor: 'text-[#3ecf8e]',
			barColor: 'bg-[#3ecf8e]'
		},
		{
			id: 'ep-6',
			method: 'POST',
			methodClass: 'bg-error/20 text-error',
			path: '/api/v1/auth/login',
			callCount: '4,810',
			errorRate: '8.4%',
			avgMs: 240,
			barWidth: '13%',
			timeColor: 'text-[#3ecf8e]',
			barColor: 'bg-[#3ecf8e]'
		}
	];
}

export function getPerformanceEvents(): PerformanceEvent[] {
	return [
		{
			id: 'evt-1',
			time: '14:32:11',
			level: 'critical',
			levelKey: 'performance_filters_critical',
			levelClass: 'bg-error/15 text-error',
			type: 'Response Spike',
			message: 'P99 latency exceeded 5,000ms – possible DB lock',
			endpoint: '/api/v1/orders/checkout',
			statusKey: 'performance_status_active',
			statusClass: 'bg-error/10 text-error'
		},
		{
			id: 'evt-2',
			time: '13:48:22',
			level: 'warning',
			levelKey: 'performance_filters_warning',
			levelClass: 'bg-secondary/15 text-secondary',
			type: 'CPU Spike',
			message: 'CPU utilization exceeded 80% for 4 minutes',
			endpoint: 'fly.io · fra · instance-02',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'evt-3',
			time: '12:15:08',
			level: 'warning',
			levelKey: 'performance_filters_warning',
			levelClass: 'bg-secondary/15 text-secondary',
			type: 'Error Rate',
			message: 'Error rate exceeded 3% for 8 minutes (503 timeout)',
			endpoint: '/api/v1/analytics/report',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'evt-4',
			time: '10:42:55',
			level: 'info',
			levelKey: 'performance_filters_info',
			levelClass: 'bg-[#3b82f6]/15 text-[#3b82f6]',
			type: 'Traffic Spike',
			message: 'Throughput reached peak 6,210 req/min – auto-scale triggered',
			endpoint: 'Entire infrastructure',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'evt-5',
			time: '09:12:34',
			level: 'warning',
			levelKey: 'performance_filters_warning',
			levelClass: 'bg-secondary/15 text-secondary',
			type: 'Memory Pressure',
			message: 'RAM utilization exceeded 85% – possible memory leak in worker',
			endpoint: 'fly.io · fra · instance-01',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'evt-6',
			time: '06:30:01',
			level: 'info',
			levelKey: 'performance_filters_info',
			levelClass: 'bg-[#3b82f6]/15 text-[#3b82f6]',
			type: 'Deploy',
			message: 'Version v2.14.1 deployed – rolling restart completed in 42s',
			endpoint: 'Entire infrastructure',
			statusKey: 'performance_status_completed',
			statusClass: 'bg-success/10 text-success'
		}
	];
}
