import exifr from 'exifr';
import ExifReader from 'exifreader';
import type { MetadataField, ScanResult } from '../types.js';
import type { ImageFormat } from '../types.js';
import { FILE_SIZE_THRESHOLD, MAX_IMAGE_HEADER_BYTES, categorizeField } from '../constants.js';
import { computeFileScore } from '../riskAnalyzer.js';
import {
	detectAIInPngBytes,
	detectAIInJpegBytes,
	detectAIInMetadata,
	detectAIByStructure,
	buildAIDetectionResult,
	type AISignal
} from '../aiDetector.js';

const EXIFR_FORMATS = new Set<ImageFormat>(['jpeg', 'png', 'heic', 'heif', 'avif', 'tiff', 'dng']);
const EXIFREADER_FORMATS = new Set<ImageFormat>(['webp', 'gif']);

function makeEmptyResult(fileId: string): ScanResult {
	return {
		fileId,
		status: 'done',
		fields: [],
		hasGps: false,
		fieldCount: 0,
		categoryScores: { gps: 0, deviceIdentity: 0, personalData: 0, timestamps: 0, aiOrigin: 0 },
		fileScore: 0
	};
}

function rawToFields(raw: Record<string, unknown>): MetadataField[] {
	const fields: MetadataField[] = [];
	for (const [key, value] of Object.entries(raw)) {
		const category = categorizeField(key);
		if (!category || value === null || value === undefined) continue;
		const normalized =
			typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
				? value
				: String(value);
		fields.push({ key, value: normalized, category });
	}
	return fields;
}

async function parseWithExifr(
	input: Blob,
	fileId: string,
	format: ImageFormat,
	fileName: string
): Promise<ScanResult> {
	// Read raw bytes for binary-level AI detection (C2PA chunks)
	const rawBytes = await input.arrayBuffer();
	let byteSignals: AISignal[] = [];
	if (format === 'png') {
		byteSignals = detectAIInPngBytes(rawBytes);
	} else if (format === 'jpeg') {
		byteSignals = detectAIInJpegBytes(rawBytes);
	}

	const data = await exifr.parse(input, {
		tiff: true,
		exif: true,
		gps: true,
		xmp: true,
		iptc: true,
		icc: false,
		jfif: false,
		ihdr: false,
		translateKeys: true,
		reviveValues: true,
		sanitize: true,
		mergeOutput: true
	});

	if (!data) {
		// No metadata at all — check for AI via bytes and filename
		const structureSignals = detectAIByStructure({}, fileName);
		const allSignals = [...byteSignals, ...structureSignals];
		const aiDetection = buildAIDetectionResult(allSignals);
		const aiInfo = aiDetection.isAIGenerated ? aiDetection : undefined;
		const { score, categories } = computeFileScore([], aiInfo);

		return {
			fileId,
			status: 'done',
			fields: [],
			hasGps: false,
			fieldCount: 0,
			categoryScores: categories,
			fileScore: score,
			aiDetection: aiInfo
		};
	}

	const raw = data as Record<string, unknown>;
	const fields = rawToFields(raw);
	const hasGps = fields.some((f) => f.category === 'gps');
	const makePart = raw['Make'] as string | undefined;
	const modelPart = raw['Model'] as string | undefined;
	const device = [makePart, modelPart].filter(Boolean).join(' ') || undefined;

	// Build rawMetadata for verbose output
	const rawMetadata: Record<string, string> = {};
	for (const [key, value] of Object.entries(raw)) {
		if (value === null || value === undefined) continue;
		rawMetadata[key] = typeof value === 'string' ? value : String(value);
	}

	// AI detection from metadata + bytes + structure
	const metadataSignals = detectAIInMetadata(raw, fileName);
	const structureSignals = detectAIByStructure(raw, fileName);
	const allSignals = [...byteSignals, ...metadataSignals, ...structureSignals];
	const aiDetection = buildAIDetectionResult(allSignals);
	const aiInfo = aiDetection.isAIGenerated ? aiDetection : undefined;

	const { score, categories } = computeFileScore(fields, aiInfo);

	return {
		fileId,
		status: 'done',
		fields,
		hasGps,
		device,
		fieldCount: fields.length,
		categoryScores: categories,
		fileScore: score,
		aiDetection: aiInfo,
		rawMetadata
	};
}

async function parseWithExifReader(
	input: Blob,
	fileId: string,
	fileName: string
): Promise<ScanResult> {
	const buffer = await input.arrayBuffer();
	const tags = ExifReader.load(buffer);

	const raw: Record<string, unknown> = {};
	for (const [key, tag] of Object.entries(tags)) {
		if (tag && typeof tag === 'object' && 'description' in tag) {
			raw[key] = (tag as { description: unknown }).description;
		}
	}

	const fields = rawToFields(raw);
	const hasGps = fields.some((f) => f.category === 'gps');
	const makePart = raw['Make'] as string | undefined;
	const modelPart = raw['Model'] as string | undefined;
	const device = [makePart, modelPart].filter(Boolean).join(' ') || undefined;

	// AI detection from metadata + structure
	const metadataSignals = detectAIInMetadata(raw, fileName);
	const structureSignals = detectAIByStructure(raw, fileName);
	const allSignals = [...metadataSignals, ...structureSignals];
	const aiDetection = buildAIDetectionResult(allSignals);
	const aiInfo = aiDetection.isAIGenerated ? aiDetection : undefined;

	const { score, categories } = computeFileScore(fields, aiInfo);

	return {
		fileId,
		status: 'done',
		fields,
		hasGps,
		device,
		fieldCount: fields.length,
		categoryScores: categories,
		fileScore: score,
		aiDetection: aiInfo
	};
}

export async function parseImage(
	file: File,
	fileId: string,
	format: ImageFormat
): Promise<ScanResult> {
	const input: Blob =
		file.size > FILE_SIZE_THRESHOLD ? file.slice(0, MAX_IMAGE_HEADER_BYTES) : file;
	const fileName = file.name;

	if (EXIFR_FORMATS.has(format)) {
		return parseWithExifr(input, fileId, format, fileName);
	}

	if (EXIFREADER_FORMATS.has(format)) {
		return parseWithExifReader(input, fileId, fileName);
	}

	return makeEmptyResult(fileId);
}
