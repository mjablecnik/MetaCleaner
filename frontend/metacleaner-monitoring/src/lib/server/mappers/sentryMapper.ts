import type { ErrorKpi, ErrorLogEntry } from '$lib/repositories/index.js';
import type { SentryIssueRaw } from '../clients/sentryClient.js';

function formatTime(isoDate: string): string {
	const d = new Date(isoDate);
	const hh = String(d.getHours()).padStart(2, '0');
	const mm = String(d.getMinutes()).padStart(2, '0');
	const ss = String(d.getSeconds()).padStart(2, '0');
	return `${hh}:${mm}:${ss}`;
}

function mapTypeCode(issue: SentryIssueRaw): string {
	const metaType = issue.metadata.type ?? '';
	const title = issue.title.toLowerCase();

	if (title.includes('timeout') || metaType.toLowerCase().includes('timeout')) return 'TMT';
	if (metaType.endsWith('Error') || metaType.endsWith('Exception')) return 'EXC';

	const statusTag = issue.tags?.find((t) => t.key === 'status_code');
	if (statusTag) {
		const code = parseInt(statusTag.value, 10);
		if (!isNaN(code) && code >= 500) return '5XX';
		if (!isNaN(code) && code >= 400) return '4XX';
	}

	return 'ERR';
}

function mapTypeClass(typeCode: string): string {
	switch (typeCode) {
		case 'EXC':
			return 'bg-[#8b5cf6]/15 text-[#8b5cf6]';
		case 'TMT':
		case '5XX':
		case 'ERR':
			return 'bg-error/15 text-error';
		case '4XX':
			return 'bg-secondary/15 text-secondary';
		default:
			return 'bg-secondary/15 text-secondary';
	}
}

function mapStatusKey(status: string): string {
	switch (status) {
		case 'resolved':
			return 'common_status_resolved';
		case 'ignored':
			return 'common_status_warning';
		default:
			return 'common_status_active';
	}
}

function mapStatusClass(status: string): string {
	switch (status) {
		case 'resolved':
			return 'bg-success/10 text-success';
		case 'ignored':
			return 'bg-secondary/10 text-secondary';
		default:
			return 'bg-error/10 text-error';
	}
}

export function mapToErrorLog(issues: SentryIssueRaw[]): ErrorLogEntry[] {
	return issues.map((issue) => {
		const typeCode = mapTypeCode(issue);
		return {
			id: issue.id,
			time: formatTime(issue.lastSeen),
			type: typeCode,
			typeClass: mapTypeClass(typeCode),
			message: issue.title,
			source: issue.culprit || '—',
			statusKey: mapStatusKey(issue.status),
			statusClass: mapStatusClass(issue.status)
		};
	});
}

function is5xxIssue(issue: SentryIssueRaw): boolean {
	const statusTag = issue.tags?.find((t) => t.key === 'status_code');
	if (statusTag) {
		const code = parseInt(statusTag.value, 10);
		return !isNaN(code) && code >= 500;
	}
	return false;
}

function isExceptionIssue(issue: SentryIssueRaw): boolean {
	const metaType = issue.metadata.type ?? '';
	return metaType.endsWith('Error') || metaType.endsWith('Exception');
}

function isTimeoutIssue(issue: SentryIssueRaw): boolean {
	return issue.title.toLowerCase().includes('timeout');
}

function isJsErrorIssue(issue: SentryIssueRaw): boolean {
	const metaType = issue.metadata.type ?? '';
	return (
		issue.type === 'default' && !is5xxIssue(issue) && !isTimeoutIssue(issue) && metaType !== ''
	);
}

export function mapToErrorKpis(issues: SentryIssueRaw[]): ErrorKpi[] {
	const count5xx = issues.filter(is5xxIssue).length;
	const countExceptions = issues.filter(isExceptionIssue).length;
	const countTimeouts = issues.filter(isTimeoutIssue).length;
	const countJsErrors = issues.filter(isJsErrorIssue).length;

	return [
		{
			key: 'errors5xx',
			labelKey: 'errors_kpi_5xx',
			labelKeyMobile: 'errors_kpi_5xxMobile',
			value: count5xx,
			trend: 0,
			trendUp: false,
			valueClass: count5xx > 0 ? 'text-error' : 'text-textMain',
			trendClass: 'text-textSec',
			severityKey: count5xx > 0 ? 'common_status_critical' : 'common_status_ok',
			severityClass: count5xx > 0 ? 'bg-error/10 text-error' : 'bg-success/10 text-success',
			subtextKey: 'errors_kpi_errors5xxSubtext',
			subtextKeyMobile: 'errors_kpi_errors5xxSubtextMobile'
		},
		{
			key: 'jsErrors',
			labelKey: 'errors_kpi_jsErrors',
			labelKeyMobile: 'errors_legend_jsErrors',
			value: countJsErrors,
			trend: 0,
			trendUp: false,
			valueClass: 'text-textMain',
			trendClass: 'text-textSec',
			severityKey: countJsErrors > 0 ? 'common_status_warning' : 'common_status_ok',
			severityClass:
				countJsErrors > 0 ? 'bg-secondary/10 text-secondary' : 'bg-success/10 text-success',
			subtextKey: 'errors_kpi_jsErrorsSubtext',
			subtextKeyMobile: 'errors_kpi_jsErrorsSubtextMobile'
		},
		{
			key: 'backendExceptions',
			labelKey: 'errors_kpi_backendExceptions',
			labelKeyMobile: 'errors_kpi_backendExceptionsMobile',
			value: countExceptions,
			trend: 0,
			trendUp: false,
			valueClass: 'text-textMain',
			trendClass: 'text-textSec',
			severityKey: countExceptions > 0 ? 'common_status_critical' : 'common_status_ok',
			severityClass: countExceptions > 0 ? 'bg-error/10 text-error' : 'bg-success/10 text-success',
			subtextKey: 'errors_kpi_backendExceptionsSubtext',
			subtextKeyMobile: 'errors_kpi_backendExceptionsSubtextMobile'
		},
		{
			key: 'timeouts',
			labelKey: 'errors_kpi_timeouts',
			labelKeyMobile: 'errors_kpi_timeouts',
			value: countTimeouts,
			trend: 0,
			trendUp: false,
			valueClass: 'text-textMain',
			trendClass: 'text-textSec',
			severityKey: countTimeouts > 0 ? 'common_status_warning' : 'common_status_ok',
			severityClass:
				countTimeouts > 0 ? 'bg-secondary/10 text-secondary' : 'bg-success/10 text-success',
			subtextKey: 'errors_kpi_timeoutsSubtext',
			subtextKeyMobile: 'errors_kpi_timeoutsSubtextMobile'
		}
	];
}
