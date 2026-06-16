import {
	GPS_FIELDS,
	DEVICE_FIELDS,
	PERSONAL_FIELDS,
	TIMESTAMP_FIELDS,
	CATEGORY_WEIGHTS,
	SEVERITY_THRESHOLDS
} from './constants.js';
import type {
	MetadataField,
	RiskCategory,
	ScanResult,
	AggregatedRisk,
	SeverityLevel,
	AIDetectionInfo
} from './types.js';

/**
 * Computes category score based on how many fields from the reference list are present,
 * plus a bonus for any additional fields found in the category via pattern matching.
 */
function computeCategoryScore(
	fields: MetadataField[],
	category: keyof RiskCategory,
	referenceKeys: string[]
): number {
	const categoryFields = fields.filter((f) => f.category === category);
	if (categoryFields.length === 0) return 0;

	// Count how many reference keys are present
	const presentKeys = new Set(categoryFields.map((f) => f.key));
	const referenceMatches = referenceKeys.filter((k) => presentKeys.has(k)).length;

	// Base score from reference keys
	const baseScore = (referenceMatches / referenceKeys.length) * 100;

	// Bonus for additional fields found via pattern matching (not in reference list)
	const extraFields = categoryFields.length - referenceMatches;
	const bonus = Math.min(20, extraFields * 5);

	return Math.min(100, baseScore + bonus);
}

export function computeFileScore(
	fields: MetadataField[],
	aiDetection?: AIDetectionInfo
): {
	score: number;
	categories: RiskCategory;
} {
	const gps = computeCategoryScore(fields, 'gps', GPS_FIELDS);
	const deviceIdentity = computeCategoryScore(fields, 'deviceIdentity', DEVICE_FIELDS);
	const personalData = computeCategoryScore(fields, 'personalData', PERSONAL_FIELDS);
	const timestamps = computeCategoryScore(fields, 'timestamps', TIMESTAMP_FIELDS);

	// AI origin score based on detection confidence
	let aiOrigin = 0;
	if (aiDetection?.isAIGenerated) {
		switch (aiDetection.confidence) {
			case 'confirmed':
				aiOrigin = 100;
				break;
			case 'likely':
				aiOrigin = 70;
				break;
			case 'suspected':
				aiOrigin = 40;
				break;
		}
	}

	const categories: RiskCategory = { gps, deviceIdentity, personalData, timestamps, aiOrigin };

	const score = Math.min(
		100,
		Math.max(
			0,
			gps * CATEGORY_WEIGHTS.gps +
				deviceIdentity * CATEGORY_WEIGHTS.deviceIdentity +
				personalData * CATEGORY_WEIGHTS.personalData +
				timestamps * CATEGORY_WEIGHTS.timestamps +
				aiOrigin * CATEGORY_WEIGHTS.aiOrigin
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
			categories: { gps: 0, deviceIdentity: 0, personalData: 0, timestamps: 0, aiOrigin: 0 },
			fileCount: 0,
			scannedCount: 0,
			isScanning: false
		};
	}

	const doneResults = results.filter((r) => r.status === 'done');

	// Take the maximum score per category across all files
	const categories: RiskCategory = {
		gps: Math.max(0, ...doneResults.map((r) => r.categoryScores.gps)),
		deviceIdentity: Math.max(0, ...doneResults.map((r) => r.categoryScores.deviceIdentity)),
		personalData: Math.max(0, ...doneResults.map((r) => r.categoryScores.personalData)),
		timestamps: Math.max(0, ...doneResults.map((r) => r.categoryScores.timestamps)),
		aiOrigin: Math.max(0, ...doneResults.map((r) => r.categoryScores.aiOrigin))
	};

	const overallScore =
		doneResults.length > 0 ? Math.min(100, Math.max(0, ...doneResults.map((r) => r.fileScore))) : 0;
	const severity = classifySeverity(overallScore);

	return { overallScore, severity, categories, fileCount, scannedCount, isScanning };
}
