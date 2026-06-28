import type { SlowEndpoint } from '$lib/repositories/performanceRepository.js';

export interface RawEndpointRecord {
	id: string;
	method: string;
	path: string;
	callCount: number;
	errorCount: number;
	avgMs: number;
}

const MAX_ENDPOINTS = 10;

function getMethodClass(method: string): string {
	if (method === 'GET') return 'bg-[#3b82f6]/20 text-[#3b82f6]';
	if (method === 'POST') return 'bg-error/20 text-error';
	if (method === 'DELETE') return 'bg-secondary/20 text-secondary';
	if (method === 'PUT' || method === 'PATCH') return 'bg-[#f59e0b]/20 text-[#f59e0b]';
	return 'bg-[#6b7280]/20 text-[#6b7280]';
}

function getTimeColor(avgMs: number): string {
	if (avgMs >= 2000) return 'text-error';
	if (avgMs >= 500) return 'text-secondary';
	return 'text-[#3ecf8e]';
}

function getBarColor(avgMs: number): string {
	if (avgMs >= 2000) return 'bg-error';
	if (avgMs >= 500) return 'bg-secondary';
	return 'bg-[#3ecf8e]';
}

export function mapToSlowEndpoints(raw: RawEndpointRecord[]): SlowEndpoint[] {
	if (raw.length === 0) return [];

	const sorted = [...raw].sort((a, b) => b.avgMs - a.avgMs);
	const limited = sorted.slice(0, MAX_ENDPOINTS);

	const maxMs = limited[0].avgMs;

	return limited.map((ep) => {
		const errorRate = ep.callCount > 0 ? (ep.errorCount / ep.callCount) * 100 : 0;
		const barWidthPercent = maxMs > 0 ? Math.round((ep.avgMs / maxMs) * 100) : 0;

		return {
			id: ep.id,
			method: ep.method,
			methodClass: getMethodClass(ep.method),
			path: ep.path,
			callCount: ep.callCount.toLocaleString('en-US'),
			errorRate: `${errorRate.toFixed(1)}%`,
			avgMs: ep.avgMs,
			barWidth: `${barWidthPercent}%`,
			timeColor: getTimeColor(ep.avgMs),
			barColor: getBarColor(ep.avgMs)
		};
	});
}
