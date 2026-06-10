import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { computeFileScore, classifySeverity, computeAggregatedRisk } from '../riskAnalyzer.js';
import {
	GPS_FIELDS,
	DEVICE_FIELDS,
	PERSONAL_FIELDS,
	TIMESTAMP_FIELDS,
	CATEGORY_WEIGHTS
} from '../constants.js';
import type { MetadataField, RiskCategory, ScanResult, SeverityLevel } from '../types.js';

const CATEGORY_FIELD_MAP: Partial<Record<keyof RiskCategory, string[]>> = {
	gps: GPS_FIELDS,
	deviceIdentity: DEVICE_FIELDS,
	personalData: PERSONAL_FIELDS,
	timestamps: TIMESTAMP_FIELDS
};

function makeFields(category: keyof RiskCategory, keys: string[]): MetadataField[] {
	return keys.map((key) => ({ key, value: 'test', category }));
}

function makeScanResult(overrides: Partial<ScanResult> = {}): ScanResult {
	return {
		fileId: 'file-1',
		status: 'done',
		fields: [],
		hasGps: false,
		fieldCount: 0,
		categoryScores: { gps: 0, deviceIdentity: 0, personalData: 0, timestamps: 0, aiOrigin: 0 },
		fileScore: 0,
		...overrides
	};
}

// Property 1: Category score computation is correct
describe('Feature: client-side-risk-scanner, Property 1: category score computation is correct', () => {
	(Object.keys(CATEGORY_FIELD_MAP) as Array<keyof RiskCategory>).forEach((category) => {
		const knownKeys = CATEGORY_FIELD_MAP[category]!;
		const weight = 100 / knownKeys.length;

		it(`${category}: score equals sum of per-field weights for any subset`, () => {
			fc.assert(
				fc.property(fc.subarray(knownKeys, { minLength: 0 }), (subset) => {
					const fields = makeFields(category, subset);
					const { categories } = computeFileScore(fields);
					const expected = Math.min(100, subset.length * weight);
					expect(categories[category]).toBeCloseTo(expected, 10);
				}),
				{ numRuns: 100 }
			);
		});
	});
});

// Property 2: Per-file risk score is bounded [0, 100]
describe('Feature: client-side-risk-scanner, Property 2: per-file risk score is bounded', () => {
	it('score is always in [0, 100] for any combination of fields', () => {
		fc.assert(
			fc.property(
				fc.array(
					fc.record({
						key: fc.string(),
						value: fc.oneof(fc.string(), fc.integer(), fc.boolean()),
						category: fc.constantFrom<keyof RiskCategory>(
							'gps',
							'deviceIdentity',
							'personalData',
							'timestamps',
							'aiOrigin'
						)
					}),
					{ maxLength: 50 }
				),
				(fields) => {
					const { score } = computeFileScore(fields as MetadataField[]);
					expect(score).toBeGreaterThanOrEqual(0);
					expect(score).toBeLessThanOrEqual(100);
				}
			),
			{ numRuns: 100 }
		);
	});

	it('empty fields yields score of 0', () => {
		const { score } = computeFileScore([]);
		expect(score).toBe(0);
	});

	it('all known fields present yields score of 100', () => {
		const allFields: MetadataField[] = [
			...makeFields('gps', GPS_FIELDS),
			...makeFields('deviceIdentity', DEVICE_FIELDS),
			...makeFields('personalData', PERSONAL_FIELDS),
			...makeFields('timestamps', TIMESTAMP_FIELDS)
		];
		const { score } = computeFileScore(allFields);
		// weighted sum: 100*0.40 + 100*0.25 + 100*0.20 + 100*0.15 = 100
		expect(score).toBeCloseTo(100, 10);
	});
});

// Property 3: Severity classification is exhaustive and correct
describe('Feature: client-side-risk-scanner, Property 3: severity classification is exhaustive and correct', () => {
	const VALID_LEVELS: SeverityLevel[] = ['low', 'medium', 'high', 'critical'];

	it('returns exactly one valid severity level for any score in [0, 100]', () => {
		fc.assert(
			fc.property(fc.float({ min: 0, max: 100, noNaN: true }), (score) => {
				const level = classifySeverity(score);
				expect(VALID_LEVELS).toContain(level);
			}),
			{ numRuns: 100 }
		);
	});

	it('classifies score 0 as low', () => expect(classifySeverity(0)).toBe('low'));
	it('classifies score 24 as low', () => expect(classifySeverity(24)).toBe('low'));
	it('classifies score 25 as medium', () => expect(classifySeverity(25)).toBe('medium'));
	it('classifies score 49 as medium', () => expect(classifySeverity(49)).toBe('medium'));
	it('classifies score 50 as high', () => expect(classifySeverity(50)).toBe('high'));
	it('classifies score 74 as high', () => expect(classifySeverity(74)).toBe('high'));
	it('classifies score 75 as critical', () => expect(classifySeverity(75)).toBe('critical'));
	it('classifies score 100 as critical', () => expect(classifySeverity(100)).toBe('critical'));

	it('boundary: scores are sorted correctly', () => {
		fc.assert(
			fc.property(fc.float({ min: 0, max: 100, noNaN: true }), (score) => {
				const level = classifySeverity(score);
				if (score >= 75) expect(level).toBe('critical');
				else if (score >= 50) expect(level).toBe('high');
				else if (score >= 25) expect(level).toBe('medium');
				else expect(level).toBe('low');
			}),
			{ numRuns: 100 }
		);
	});
});

// Property 4: Aggregated score equals maximum file score
describe('Feature: client-side-risk-scanner, Property 4: aggregated score equals maximum file score', () => {
	it('overall score equals max of individual file scores', () => {
		fc.assert(
			fc.property(
				fc.array(fc.float({ min: 0, max: 100, noNaN: true }), { minLength: 1, maxLength: 20 }),
				(scores) => {
					const results = scores.map((s) =>
						makeScanResult({
							fileScore: s,
							categoryScores: { gps: 0, deviceIdentity: 0, personalData: 0, timestamps: 0, aiOrigin: 0 }
						})
					);
					const aggregated = computeAggregatedRisk(results);
					expect(aggregated.overallScore).toBeCloseTo(Math.max(...scores), 10);
				}
			),
			{ numRuns: 100 }
		);
	});

	it('empty results yield overall score of 0', () => {
		const aggregated = computeAggregatedRisk([]);
		expect(aggregated.overallScore).toBe(0);
	});

	it('single file: overall score equals that file score', () => {
		fc.assert(
			fc.property(fc.float({ min: 0, max: 100, noNaN: true }), (score) => {
				const aggregated = computeAggregatedRisk([makeScanResult({ fileScore: score })]);
				expect(aggregated.overallScore).toBeCloseTo(score, 10);
			}),
			{ numRuns: 100 }
		);
	});
});

// Property 5: File queue mutation preserves aggregation invariant
describe('Feature: client-side-risk-scanner, Property 5: file queue mutation preserves aggregation invariant', () => {
	it('adding a file yields max(existing, new)', () => {
		fc.assert(
			fc.property(
				fc.array(fc.float({ min: 0, max: 100, noNaN: true }), { minLength: 1, maxLength: 10 }),
				fc.float({ min: 0, max: 100, noNaN: true }),
				(existingScores, newScore) => {
					const existingResults = existingScores.map((s) => makeScanResult({ fileScore: s }));
					const newResult = makeScanResult({ fileScore: newScore });
					const combined = [...existingResults, newResult];

					const aggregated = computeAggregatedRisk(combined);
					const expectedMax = Math.max(...existingScores, newScore);
					expect(aggregated.overallScore).toBeCloseTo(expectedMax, 10);
				}
			),
			{ numRuns: 100 }
		);
	});

	it('removing a file recalculates correctly', () => {
		fc.assert(
			fc.property(
				fc.array(fc.float({ min: 0, max: 100, noNaN: true }), { minLength: 2, maxLength: 10 }),
				fc.integer({ min: 0, max: 9 }),
				(scores, removeIndexRaw) => {
					const removeIndex = removeIndexRaw % scores.length;
					const results = scores.map((s) =>
						makeScanResult({ fileId: String(scores.indexOf(s)), fileScore: s })
					);
					const remaining = results.filter((_, i) => i !== removeIndex);

					if (remaining.length === 0) {
						expect(computeAggregatedRisk(remaining).overallScore).toBe(0);
					} else {
						const aggregated = computeAggregatedRisk(remaining);
						const expectedMax = Math.max(...remaining.map((r) => r.fileScore));
						expect(aggregated.overallScore).toBeCloseTo(expectedMax, 10);
					}
				}
			),
			{ numRuns: 100 }
		);
	});

	it('category weights sum to 1.0', () => {
		const sum =
			CATEGORY_WEIGHTS.gps +
			CATEGORY_WEIGHTS.deviceIdentity +
			CATEGORY_WEIGHTS.personalData +
			CATEGORY_WEIGHTS.timestamps;
		expect(sum).toBeCloseTo(1.0, 10);
	});
});
