import {
	GPS_FIELDS,
	DEVICE_FIELDS,
	PERSONAL_FIELDS,
	TIMESTAMP_FIELDS,
	CATEGORY_WEIGHTS,
	SEVERITY_THRESHOLDS
} from './constants.js';
import type { MetadataField, RiskCategory, ScanResult, AggregatedRisk, SeverityLevel } from './types.js';

function computeCategoryScore(
	fields: MetadataField[],
	category: keyof RiskCategory,
	knownKeys: string[]
): number {
	const presentKeys = new Set(fields.filter((f) => f.category === category).map((f) => f.key));
	const matchCount = knownKeys.filter((k) => presentKeys.has(k)).length;
	return Math.min(100, (matchCount / knownKeys.length) * 100);
}

export function computeFileScore(fields: MetadataField[]): {
	score: number;
	categories: RiskCategory;
} {
	const gps = computeCategoryScore(fields, 'gps', GPS_FIELDS);
	const deviceIdentity = computeCategoryScore(fields, 'deviceIdentity', DEVICE_FIELDS);
	const personalData = computeCategoryScore(fields, 'personalData', PERSONAL_FIELDS);
	const timestamps = computeCategoryScore(fields, 'timestamps', TIMESTAMP_FIELDS);

	const categories: RiskCategory = { gps, deviceIdentity, personalData, timestamps };

	const score = Math.min(
		100,
		Math.max(
			0,
			gps * CATEGORY_WEIGHTS.gps +
				deviceIdentity * CATEGORY_WEIGHTS.deviceIdentity +
				personalData * CATEGORY_WEIGHTS.personalData +
				timestamps * CATEGORY_WEIGHTS.timestamps
		)
	);

	return { score, categories };
}

export function classifySeverity(score: number): SeverityLevel {
	if (score >= SEVERITY_THRESHOLDS.critical) return 'critical';
	if (score >= SEVERITY_THRESHOLDS.high) return 'high';
	if (score >= SEVERITY_THRESHOLDS.medium) return 'medium';
	return 'low';
}

export function computeAggregatedRisk(results: ScanResult[]): AggregatedRisk {
	const fileCount = results.length;
	const scannedCount = results.filter((r) => r.status === 'done').length;
	const isScanning = results.some((r) => r.status === 'scanning' || r.status === 'pending');

	if (fileCount === 0) {
		return {
			overallScore: 0,
			severity: 'low',
			categories: { gps: 0, deviceIdentity: 0, personalData: 0, timestamps: 0 },
			fileCount: 0,
			scannedCount: 0,
			isScanning: false
		};
	}

	const overallScore = Math.max(...results.map((r) => r.fileScore));
	const severity = classifySeverity(overallScore);

	const maxFile = results.reduce((a, b) => (a.fileScore > b.fileScore ? a : b));
	const categories: RiskCategory = maxFile.categoryScores;

	return { overallScore, severity, categories, fileCount, scannedCount, isScanning };
}
