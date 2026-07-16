import type {
	PrometheusInstantResponse,
	PrometheusRangeResponse
} from '../clients/flyPrometheusClient.js';
import type { TimeSeriesPoint } from '$lib/repositories/index.js';

export interface CurrentCpuUsage {
	percent: number;
	perApp: Map<string, number>;
}

export function mapToCurrentCpu(response: PrometheusInstantResponse): CurrentCpuUsage {
	const perApp = new Map<string, number>();

	for (const result of response.data.result) {
		const app = result.metric.app ?? 'unknown';
		const value = Number(result.value[1]);
		if (!Number.isNaN(value)) {
			perApp.set(app, value);
		}
	}

	const values = [...perApp.values()];
	const percent = values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;

	return { percent, perApp };
}

export interface CurrentRamUsage {
	usedBytes: number;
	perInstance: Map<string, number>;
}

export function mapToCurrentRam(response: PrometheusInstantResponse): CurrentRamUsage {
	const perInstance = new Map<string, number>();

	for (const result of response.data.result) {
		const instance = result.metric.instance ?? 'unknown';
		const value = Number(result.value[1]);
		if (!Number.isNaN(value)) {
			perInstance.set(instance, value);
		}
	}

	const usedBytes = [...perInstance.values()].reduce((sum, v) => sum + v, 0);

	return { usedBytes, perInstance };
}

export type { TimeSeriesPoint };

export function mapToTimeSeries(response: PrometheusRangeResponse): TimeSeriesPoint[] {
	const byTimestamp = new Map<number, number[]>();

	for (const result of response.data.result) {
		for (const [timestamp, rawValue] of result.values) {
			const value = Number(rawValue);
			if (Number.isNaN(value)) continue;

			const existing = byTimestamp.get(timestamp);
			if (existing) {
				existing.push(value);
			} else {
				byTimestamp.set(timestamp, [value]);
			}
		}
	}

	return [...byTimestamp.entries()]
		.sort(([a], [b]) => a - b)
		.map(([timestamp, values]) => ({
			timestamp,
			value: values.reduce((sum, v) => sum + v, 0) / values.length
		}));
}
