import type { FlyClientConfig } from '../config.js';
import { ClientError, categorizeStatus, fetchWithTimeout } from './types.js';

export interface PrometheusVectorResult {
	metric: Record<string, string>;
	value: [number, string];
}

export interface PrometheusInstantResponse {
	status: string;
	data: {
		resultType: string;
		result: PrometheusVectorResult[];
	};
}

export interface PrometheusMatrixResult {
	metric: Record<string, string>;
	values: Array<[number, string]>;
}

export interface PrometheusRangeResponse {
	status: string;
	data: {
		resultType: string;
		result: PrometheusMatrixResult[];
	};
}

function prometheusBaseUrl(config: FlyClientConfig): string {
	return `https://api.fly.io/prometheus/${config.org}/api/v1`;
}

export async function queryInstant(
	config: FlyClientConfig,
	promql: string
): Promise<PrometheusInstantResponse> {
	if (!config.token || !config.token.trim()) {
		throw new ClientError('fly', null, 'unauthorized', 'FLY_API_TOKEN is missing or empty');
	}

	const url = `${prometheusBaseUrl(config)}/query?query=${encodeURIComponent(promql)}`;

	let response: Response;
	try {
		response = await fetchWithTimeout(
			url,
			{
				headers: {
					Authorization: `Bearer ${config.token}`
				}
			},
			config.timeout ?? 10_000
		);
	} catch (err) {
		if (err instanceof Error && err.name === 'AbortError') {
			throw new ClientError(
				'fly',
				null,
				'timeout',
				`Fly.io Prometheus request timed out for query: ${promql}`
			);
		}
		throw new ClientError(
			'fly',
			null,
			'request_error',
			`Fly.io Prometheus network error for query ${promql}: ${String(err)}`
		);
	}

	if (!response.ok) {
		throw new ClientError(
			'fly',
			response.status,
			categorizeStatus(response.status),
			`Fly.io Prometheus API returned ${response.status} for query: ${promql}`
		);
	}

	return response.json() as Promise<PrometheusInstantResponse>;
}

export async function queryRange(
	config: FlyClientConfig,
	promql: string,
	start: number,
	end: number,
	step: number
): Promise<PrometheusRangeResponse> {
	if (!config.token || !config.token.trim()) {
		throw new ClientError('fly', null, 'unauthorized', 'FLY_API_TOKEN is missing or empty');
	}

	const url =
		`${prometheusBaseUrl(config)}/query_range?query=${encodeURIComponent(promql)}` +
		`&start=${start}&end=${end}&step=${step}`;

	let response: Response;
	try {
		response = await fetchWithTimeout(
			url,
			{
				headers: {
					Authorization: `Bearer ${config.token}`
				}
			},
			config.timeout ?? 10_000
		);
	} catch (err) {
		if (err instanceof Error && err.name === 'AbortError') {
			throw new ClientError(
				'fly',
				null,
				'timeout',
				`Fly.io Prometheus request timed out for query: ${promql}`
			);
		}
		throw new ClientError(
			'fly',
			null,
			'request_error',
			`Fly.io Prometheus network error for query ${promql}: ${String(err)}`
		);
	}

	if (!response.ok) {
		throw new ClientError(
			'fly',
			response.status,
			categorizeStatus(response.status),
			`Fly.io Prometheus API returned ${response.status} for query: ${promql}`
		);
	}

	return response.json() as Promise<PrometheusRangeResponse>;
}

const CPU_PERCENT_PROMQL = '100 - avg(rate(fly_instance_cpu{mode="idle"}[5m])) by (app) * 100';
const RAM_USED_PROMQL = 'fly_instance_memory_mem_total - fly_instance_memory_mem_available';

export function getCurrentCpuPercent(config: FlyClientConfig): Promise<PrometheusInstantResponse> {
	return queryInstant(config, CPU_PERCENT_PROMQL);
}

export function getCurrentRamUsage(config: FlyClientConfig): Promise<PrometheusInstantResponse> {
	return queryInstant(config, RAM_USED_PROMQL);
}

export function getCpuOverTime(
	config: FlyClientConfig,
	start: number,
	end: number,
	step: number
): Promise<PrometheusRangeResponse> {
	return queryRange(config, CPU_PERCENT_PROMQL, start, end, step);
}

export function getRamOverTime(
	config: FlyClientConfig,
	start: number,
	end: number,
	step: number
): Promise<PrometheusRangeResponse> {
	return queryRange(config, RAM_USED_PROMQL, start, end, step);
}
