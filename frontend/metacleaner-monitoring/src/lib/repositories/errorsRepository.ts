export interface ErrorKpi {
	key: string;
	labelKey: string;
	labelKeyMobile: string;
	value: number;
	trend: number;
	trendUp: boolean;
	valueClass: string;
	trendClass: string;
	severityKey: string;
	severityClass: string;
	subtextKey: string;
	subtextKeyMobile: string;
	subtextValue?: string;
}

export interface ErrorTypeBreakdown {
	labelKey: string;
	color: string;
	count: number;
}


export interface TopEndpoint {
	method: string;
	methodClass: string;
	path: string;
	errorCount: number;
	barWidth: string;
	barClass: string;
	countClass: string;
}

export interface ErrorLogEntry {
	id: string;
	time: string;
	type: string;
	typeClass: string;
	message: string;
	source: string;
	statusKey: string;
	statusClass: string;
}

export function getErrorKpis(): ErrorKpi[] {
	return [
		{
			key: 'errors5xx',
			labelKey: 'errors_kpi_5xx',
			labelKeyMobile: 'errors_kpi_5xxMobile',
			value: 43,
			trend: 18,
			trendUp: true,
			valueClass: 'text-error',
			trendClass: 'text-error',
			severityKey: 'common_status_critical',
			severityClass: 'bg-error/10 text-error',
			subtextKey: 'errors_kpi_errors5xxSubtext',
			subtextKeyMobile: 'errors_kpi_errors5xxSubtextMobile'
		},
		{
			key: 'jsErrors',
			labelKey: 'errors_kpi_jsErrors',
			labelKeyMobile: 'errors_legend_jsErrors',
			value: 127,
			trend: 34,
			trendUp: true,
			valueClass: 'text-textMain',
			trendClass: 'text-secondary',
			severityKey: 'common_status_warning',
			severityClass: 'bg-secondary/10 text-secondary',
			subtextKey: 'errors_kpi_jsErrorsSubtext',
			subtextKeyMobile: 'errors_kpi_jsErrorsSubtextMobile'
		},
		{
			key: 'backendExceptions',
			labelKey: 'errors_kpi_backendExceptions',
			labelKeyMobile: 'errors_kpi_backendExceptionsMobile',
			value: 19,
			trend: -5,
			trendUp: false,
			valueClass: 'text-textMain',
			trendClass: 'text-success',
			severityKey: 'common_status_critical',
			severityClass: 'bg-error/10 text-error',
			subtextKey: 'errors_kpi_backendExceptionsSubtext',
			subtextKeyMobile: 'errors_kpi_backendExceptionsSubtextMobile'
		},
		{
			key: 'timeouts',
			labelKey: 'errors_kpi_timeouts',
			labelKeyMobile: 'errors_kpi_timeouts',
			value: 8,
			trend: -2,
			trendUp: false,
			valueClass: 'text-textMain',
			trendClass: 'text-success',
			severityKey: 'common_status_warning',
			severityClass: 'bg-secondary/10 text-secondary',
			subtextKey: 'errors_kpi_timeoutsSubtext',
			subtextKeyMobile: 'errors_kpi_timeoutsSubtextMobile'
		}
	];
}

export function getErrorTypeBreakdown(): ErrorTypeBreakdown[] {
	return [
		{ labelKey: 'errors_legend_5xx', color: 'bg-error', count: 42 },
		{ labelKey: 'errors_legend_jsErrors', color: 'bg-secondary', count: 127 },
		{ labelKey: 'errors_legend_exceptions', color: 'bg-[#8b5cf6]', count: 19 },
		{ labelKey: 'errors_legend_timeouts', color: 'bg-[#3b82f6]', count: 8 }
	];
}

export function getTopEndpoints(): TopEndpoint[] {
	return [
		{
			method: 'POST',
			methodClass: 'bg-error/20 text-error',
			path: '/api/v1/checkout',
			errorCount: 24,
			barWidth: '85%',
			barClass: 'bg-error',
			countClass: 'text-error'
		},
		{
			method: 'GET',
			methodClass: 'bg-[#3b82f6]/20 text-[#3b82f6]',
			path: '/api/v1/users/profile',
			errorCount: 11,
			barWidth: '45%',
			barClass: 'bg-secondary',
			countClass: 'text-secondary'
		},
		{
			method: 'GET',
			methodClass: 'bg-[#3b82f6]/20 text-[#3b82f6]',
			path: '/api/v1/products',
			errorCount: 7,
			barWidth: '28%',
			barClass: 'bg-secondary',
			countClass: 'text-secondary'
		},
		{
			method: 'PUT',
			methodClass: 'bg-success/20 text-success',
			path: '/api/v1/orders/update',
			errorCount: 4,
			barWidth: '15%',
			barClass: 'bg-[#3b82f6]',
			countClass: 'text-textSec'
		},
		{
			method: 'DEL',
			methodClass: 'bg-error/20 text-error',
			path: '/api/v1/sessions',
			errorCount: 2,
			barWidth: '8%',
			barClass: 'bg-[#3b82f6]',
			countClass: 'text-textSec'
		}
	];
}

export function getErrorLog(): ErrorLogEntry[] {
	return [
		{
			id: 'err-1',
			time: '14:32:11',
			type: '500',
			typeClass: 'bg-error/15 text-error',
			message: 'Internal Server Error – DB connection pool exhausted',
			source: '/api/v1/checkout',
			statusKey: 'common_status_active',
			statusClass: 'bg-error/10 text-error'
		},
		{
			id: 'err-2',
			time: '14:28:45',
			type: 'JS',
			typeClass: 'bg-secondary/15 text-secondary',
			message: "TypeError: Cannot read property 'id' of undefined",
			source: 'cart.component.js:142',
			statusKey: 'common_status_warning',
			statusClass: 'bg-secondary/10 text-secondary'
		},
		{
			id: 'err-3',
			time: '14:15:02',
			type: '503',
			typeClass: 'bg-error/15 text-error',
			message: 'Service Unavailable – upstream timeout from Fly.io',
			source: '/api/v1/users/profile',
			statusKey: 'common_status_active',
			statusClass: 'bg-error/10 text-error'
		},
		{
			id: 'err-4',
			time: '13:50:33',
			type: 'EXC',
			typeClass: 'bg-[#8b5cf6]/15 text-[#8b5cf6]',
			message: 'NullPointerException in OrderService.processPayment()',
			source: 'OrderService.java:87',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'err-5',
			time: '13:22:09',
			type: 'TMT',
			typeClass: 'bg-[#3b82f6]/15 text-[#3b82f6]',
			message: 'Request timeout after 30000ms on products endpoint',
			source: '/api/v1/products',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'err-6',
			time: '12:48:55',
			type: 'JS',
			typeClass: 'bg-secondary/15 text-secondary',
			message: 'ReferenceError: analytics is not defined',
			source: 'analytics.js:23',
			statusKey: 'common_labels_info',
			statusClass: 'bg-badge text-textSec'
		}
	];
}

export interface ErrorsStats {
	activeIncidents: number;
	bannerDescription: string;
}

export function getErrorsStats(): ErrorsStats {
	return {
		activeIncidents: 2,
		bannerDescription: 'Zvýšený počet 500 chyb na API · 5xx Chyby aktivní'
	};
}
