export interface PerformanceKpiStat {
	key: string;
	labelKey: string;
	value: string;
	unit?: string;
	trend?: string;
	trendPositive?: boolean;
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

export interface CoreWebVital {
	key: string;
	label: string;
	value: string;
	unit: string;
	statusKey: string;
	statusClass: string;
	badgeClass: string;
	description: string;
}

export interface ErrorCodeDistribution {
	code: string;
	label: string;
	percent: number;
	color: string;
}

export interface PerformanceEvent {
	id: string;
	time: string;
	levelKey: string;
	levelClass: string;
	message: string;
	endpoint?: string;
	statusKey: string;
	statusClass: string;
}

export function getPerformanceKpiStats(): PerformanceKpiStat[] {
	return [
		{
			key: 'apdex',
			labelKey: 'perf_kpi_apdex',
			value: '0.94',
			trend: '+0.02',
			trendPositive: true,
			badgeKey: 'perf_kpi_excellent',
			badgeClass: 'bg-success/10 text-success',
			subtext: 'perf_kpi_apdexSubtext',
			barWidth: '94%',
			barClass: 'bg-success'
		},
		{
			key: 'avgResponseTime',
			labelKey: 'perf_kpi_avgResponseTime',
			value: '187',
			unit: 'ms',
			trend: '-14ms',
			trendPositive: true,
			badgeKey: 'common_status_ok',
			badgeClass: 'bg-success/10 text-success',
			subtext: 'perf_kpi_avgResponseTimeSubtext'
		},
		{
			key: 'throughput',
			labelKey: 'perf_kpi_throughput',
			value: '3,841',
			unit: 'req/min',
			badgeKey: 'perf_kpi_normal',
			badgeClass: 'bg-[#3b82f6]/10 text-[#3b82f6]',
			subtext: 'perf_kpi_throughputSubtext'
		},
		{
			key: 'errorRate',
			labelKey: 'perf_kpi_errorRate',
			value: '1.8',
			unit: '%',
			trend: '+0.4%',
			trendPositive: false,
			badgeKey: 'common_status_warning',
			badgeClass: 'bg-secondary/10 text-secondary',
			subtext: 'perf_kpi_errorRateSubtext',
			valueClass: 'text-secondary'
		}
	];
}

export function getPerformanceSecondaryKpis(): PerformanceSecondaryKpi[] {
	return [
		{
			key: 'ramUtilization',
			labelKey: 'perf_kpi_ramUtilization',
			value: '72',
			unit: '%',
			subtext: 'perf_kpi_ramUtilizationSubtext',
			icon: 'fa-memory',
			iconColor: 'text-[#f59e0b]',
			iconBg: 'bg-[#f59e0b]/15',
			barWidth: '72%',
			barColor: 'bg-[#f59e0b]'
		},
		{
			key: 'cpuUtilization',
			labelKey: 'perf_kpi_cpuUtilization',
			value: '38',
			unit: '%',
			subtext: 'perf_kpi_cpuUtilizationSubtext',
			icon: 'fa-microchip',
			iconColor: 'text-[#3ecf8e]',
			iconBg: 'bg-[#3ecf8e]/15',
			barWidth: '38%',
			barColor: 'bg-[#3ecf8e]'
		},
		{
			key: 'networkLatency',
			labelKey: 'perf_kpi_networkLatency',
			value: '12',
			unit: 'ms',
			subtext: 'perf_kpi_networkLatencySubtext',
			icon: 'fa-network-wired',
			iconColor: 'text-[#3b82f6]',
			iconBg: 'bg-[#3b82f6]/15'
		},
		{
			key: 'uptime30d',
			labelKey: 'perf_kpi_uptime30d',
			value: '99.97',
			unit: '%',
			subtext: 'perf_kpi_uptime30dSubtext',
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

export function getCoreWebVitals(): CoreWebVital[] {
	return [
		{
			key: 'lcp',
			label: 'LCP',
			value: '1.8',
			unit: 's',
			statusKey: 'perf_cwv_good',
			statusClass: 'text-success',
			badgeClass: 'bg-success/10 text-success',
			description: 'Largest Contentful Paint'
		},
		{
			key: 'fid',
			label: 'FID',
			value: '12',
			unit: 'ms',
			statusKey: 'perf_cwv_good',
			statusClass: 'text-success',
			badgeClass: 'bg-success/10 text-success',
			description: 'First Input Delay'
		},
		{
			key: 'cls',
			label: 'CLS',
			value: '0.05',
			unit: '',
			statusKey: 'perf_cwv_good',
			statusClass: 'text-success',
			badgeClass: 'bg-success/10 text-success',
			description: 'Cumulative Layout Shift'
		}
	];
}

export function getErrorCodeDistribution(): ErrorCodeDistribution[] {
	return [
		{ code: '500', label: '500 Internal', percent: 42, color: '#ef4444' },
		{ code: '503', label: '503 Timeout', percent: 31, color: '#f97316' },
		{ code: '502', label: '502 Bad GW', percent: 18, color: '#f59e0b' },
		{ code: 'other', label: 'Ostatní', percent: 9, color: '#8b5cf6' }
	];
}

export function getPerformanceEvents(): PerformanceEvent[] {
	return [
		{
			id: 'evt-1',
			time: '14:32',
			levelKey: 'common_level_critical',
			levelClass: 'bg-error/15 text-error',
			message: 'Response time spike – /api/v1/orders/checkout hit 3.2s p99',
			endpoint: '/api/v1/orders/checkout',
			statusKey: 'common_status_active',
			statusClass: 'bg-error/10 text-error'
		},
		{
			id: 'evt-2',
			time: '12:18',
			levelKey: 'common_level_warning',
			levelClass: 'bg-secondary/15 text-secondary',
			message: 'CPU spike 84% on api-1 during flash sale traffic burst',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'evt-3',
			time: '10:45',
			levelKey: 'common_level_warning',
			levelClass: 'bg-secondary/15 text-secondary',
			message: 'Throughput 6,210 rpm – above 80% of capacity limit',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'evt-4',
			time: '09:22',
			levelKey: 'common_level_info',
			levelClass: 'bg-[#3b82f6]/15 text-[#3b82f6]',
			message: 'Deploy v2.14.1 completed – no performance regression detected',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'evt-5',
			time: '07:14',
			levelKey: 'common_level_info',
			levelClass: 'bg-[#3b82f6]/15 text-[#3b82f6]',
			message: 'Auto-scaling triggered: added 1 instance (api-3)',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		}
	];
}
