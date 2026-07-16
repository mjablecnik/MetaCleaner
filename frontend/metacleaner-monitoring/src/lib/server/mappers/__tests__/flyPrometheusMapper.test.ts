import { describe, it, expect } from 'vitest';
import type {
	PrometheusInstantResponse,
	PrometheusRangeResponse,
	PrometheusVectorResult,
	PrometheusMatrixResult
} from '../../clients/flyPrometheusClient.js';
import { mapToCurrentCpu, mapToCurrentRam, mapToTimeSeries } from '../flyPrometheusMapper.js';

function makeInstantResponse(result: PrometheusVectorResult[]): PrometheusInstantResponse {
	return { status: 'success', data: { resultType: 'vector', result } };
}

function makeRangeResponse(result: PrometheusMatrixResult[]): PrometheusRangeResponse {
	return { status: 'success', data: { resultType: 'matrix', result } };
}

describe('mapToCurrentCpu', () => {
	it('returns 0 percent and an empty map for empty results', () => {
		const result = mapToCurrentCpu(makeInstantResponse([]));
		expect(result.percent).toBe(0);
		expect(result.perApp.size).toBe(0);
	});

	it('extracts percent from a single-app result', () => {
		const result = mapToCurrentCpu(
			makeInstantResponse([{ metric: { app: 'metacleaner-server' }, value: [1000, '42.5'] }])
		);
		expect(result.percent).toBe(42.5);
		expect(result.perApp.get('metacleaner-server')).toBe(42.5);
	});

	it('averages percent across multiple apps', () => {
		const result = mapToCurrentCpu(
			makeInstantResponse([
				{ metric: { app: 'app1' }, value: [1000, '20'] },
				{ metric: { app: 'app2' }, value: [1000, '60'] }
			])
		);
		expect(result.percent).toBe(40);
		expect(result.perApp.get('app1')).toBe(20);
		expect(result.perApp.get('app2')).toBe(60);
	});

	it('falls back to "unknown" key when app label is missing', () => {
		const result = mapToCurrentCpu(makeInstantResponse([{ metric: {}, value: [1000, '10'] }]));
		expect(result.perApp.get('unknown')).toBe(10);
	});

	it('skips results whose value is not a number', () => {
		const result = mapToCurrentCpu(
			makeInstantResponse([
				{ metric: { app: 'app1' }, value: [1000, 'NaN'] },
				{ metric: { app: 'app2' }, value: [1000, '50'] }
			])
		);
		expect(result.perApp.has('app1')).toBe(false);
		expect(result.percent).toBe(50);
	});
});

describe('mapToCurrentRam', () => {
	it('returns 0 used bytes and an empty map for empty results', () => {
		const result = mapToCurrentRam(makeInstantResponse([]));
		expect(result.usedBytes).toBe(0);
		expect(result.perInstance.size).toBe(0);
	});

	it('extracts used bytes from a single-instance result', () => {
		const result = mapToCurrentRam(
			makeInstantResponse([{ metric: { instance: 'i-1' }, value: [1000, '1073741824'] }])
		);
		expect(result.usedBytes).toBe(1073741824);
		expect(result.perInstance.get('i-1')).toBe(1073741824);
	});

	it('sums used bytes across multiple instances', () => {
		const result = mapToCurrentRam(
			makeInstantResponse([
				{ metric: { instance: 'i-1' }, value: [1000, '100'] },
				{ metric: { instance: 'i-2' }, value: [1000, '250'] }
			])
		);
		expect(result.usedBytes).toBe(350);
		expect(result.perInstance.get('i-1')).toBe(100);
		expect(result.perInstance.get('i-2')).toBe(250);
	});

	it('falls back to "unknown" key when instance label is missing', () => {
		const result = mapToCurrentRam(makeInstantResponse([{ metric: {}, value: [1000, '512'] }]));
		expect(result.perInstance.get('unknown')).toBe(512);
	});

	it('skips results whose value is not a number', () => {
		const result = mapToCurrentRam(
			makeInstantResponse([
				{ metric: { instance: 'i-1' }, value: [1000, 'not-a-number'] },
				{ metric: { instance: 'i-2' }, value: [1000, '200'] }
			])
		);
		expect(result.perInstance.has('i-1')).toBe(false);
		expect(result.usedBytes).toBe(200);
	});
});

describe('mapToTimeSeries', () => {
	it('returns an empty array for empty results', () => {
		expect(mapToTimeSeries(makeRangeResponse([]))).toEqual([]);
	});

	it('maps a single series to timestamp/value points', () => {
		const result = mapToTimeSeries(
			makeRangeResponse([
				{
					metric: { app: 'app1' },
					values: [
						[1000, '10'],
						[1300, '20']
					]
				}
			])
		);
		expect(result).toEqual([
			{ timestamp: 1000, value: 10 },
			{ timestamp: 1300, value: 20 }
		]);
	});

	it('sorts points ascending by timestamp regardless of input order', () => {
		const result = mapToTimeSeries(
			makeRangeResponse([
				{
					metric: { app: 'app1' },
					values: [
						[2000, '2'],
						[1000, '1']
					]
				}
			])
		);
		expect(result.map((p) => p.timestamp)).toEqual([1000, 2000]);
	});

	it('averages values across multiple series at the same timestamp', () => {
		const result = mapToTimeSeries(
			makeRangeResponse([
				{ metric: { app: 'app1' }, values: [[1000, '10']] },
				{ metric: { app: 'app2' }, values: [[1000, '30']] }
			])
		);
		expect(result).toEqual([{ timestamp: 1000, value: 20 }]);
	});

	it('skips non-numeric values', () => {
		const result = mapToTimeSeries(
			makeRangeResponse([
				{
					metric: { app: 'app1' },
					values: [
						[1000, 'NaN'],
						[1300, '5']
					]
				}
			])
		);
		expect(result).toEqual([{ timestamp: 1300, value: 5 }]);
	});
});
