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
			method: 'GET',
			methodClass: 'bg-[#3b82f6]/20 text-[#3b82f6]',
			path: '/api/jobs/{id}/progress',
			errorCount: 41,
			barWidth: '100%',
			barClass: 'bg-secondary',
			countClass: 'text-secondary'
		},
		{
			method: 'POST',
			methodClass: 'bg-error/20 text-error',
			path: '/api/upload',
			errorCount: 27,
			barWidth: '66%',
			barClass: 'bg-error',
			countClass: 'text-error'
		},
		{
			method: 'POST',
			methodClass: 'bg-error/20 text-error',
			path: '/api/jobs',
			errorCount: 14,
			barWidth: '34%',
			barClass: 'bg-error',
			countClass: 'text-error'
		},
		{
			method: 'POST',
			methodClass: 'bg-error/20 text-error',
			path: '/api/auth/login',
			errorCount: 12,
			barWidth: '29%',
			barClass: 'bg-secondary',
			countClass: 'text-secondary'
		},
		{
			method: 'POST',
			methodClass: 'bg-error/20 text-error',
			path: '/api/billing/webhook',
			errorCount: 2,
			barWidth: '5%',
			barClass: 'bg-[#3b82f6]',
			countClass: 'text-textSec'
		}
	];
}

export function getErrorLog(): ErrorLogEntry[] {
	return [
		{
			id: 'err-1',
			time: '19:14:32',
			type: 'EXC',
			typeClass: 'bg-[#8b5cf6]/15 text-[#8b5cf6]',
			message: 'ExifTool exit code 1 — unsupported format .cr3 (Canon RAW)',
			source: 'metacleaner-server/pipeline',
			statusKey: 'common_status_warning',
			statusClass: 'bg-secondary/10 text-secondary'
		},
		{
			id: 'err-2',
			time: '18:52:07',
			type: 'TMT',
			typeClass: 'bg-error/15 text-error',
			message: 'Job exceeded 60s processing limit (large video file)',
			source: 'metacleaner-server/worker',
			statusKey: 'common_status_active',
			statusClass: 'bg-error/10 text-error'
		},
		{
			id: 'err-3',
			time: '17:38:44',
			type: 'ERR',
			typeClass: 'bg-error/15 text-error',
			message: 'Temp cleaned file not found after pipeline completion (race condition)',
			source: 'metacleaner-server/storage',
			statusKey: 'common_status_active',
			statusClass: 'bg-error/10 text-error'
		},
		{
			id: 'err-4',
			time: '16:44:21',
			type: 'EXC',
			typeClass: 'bg-secondary/15 text-secondary',
			message: 'Webhook signature verification failed (possible clock skew)',
			source: 'metacleaner-server/billing',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'err-5',
			time: '15:22:09',
			type: 'WS',
			typeClass: 'bg-[#3b82f6]/15 text-[#3b82f6]',
			message: 'Write to closed connection — client disconnected mid-stream',
			source: 'metacleaner-server/ws',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'err-6',
			time: '14:08:55',
			type: 'AUTH',
			typeClass: 'bg-secondary/15 text-secondary',
			message: 'Refresh token expired — user session invalidated',
			source: 'supabase/auth',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'err-7',
			time: '12:55:33',
			type: '503',
			typeClass: 'bg-error/15 text-error',
			message: 'PostgREST 503 — connection pool exhausted during peak',
			source: 'metacleaner-server/db',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'err-8',
			time: '11:30:18',
			type: 'OOM',
			typeClass: 'bg-error/15 text-error',
			message: 'FFmpeg exit code 137 (SIGKILL) — OOM during video processing',
			source: 'metacleaner-server/pipeline',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
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
