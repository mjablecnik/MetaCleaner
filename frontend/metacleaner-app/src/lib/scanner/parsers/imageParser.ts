import exifr from 'exifr';
import ExifReader from 'exifreader';
import type { MetadataField, ScanResult } from '../types.js';
import type { ImageFormat } from '../types.js';
import {
	FILE_SIZE_THRESHOLD,
	MAX_IMAGE_HEADER_BYTES,
	categorizeField
} from '../constants.js';
import { computeFileScore } from '../riskAnalyzer.js';

const EXIFR_FORMATS = new Set<ImageFormat>(['jpeg', 'png', 'heic', 'heif', 'avif', 'tiff', 'dng']);
const EXIFREADER_FORMATS = new Set<ImageFormat>(['webp', 'gif']);

function makeEmptyResult(fileId: string): ScanResult {
	return {
		fileId,
		status: 'done',
		fields: [],
		hasGps: false,
		fieldCount: 0,
		categoryScores: { gps: 0, deviceIdentity: 0, personalData: 0, timestamps: 0 },
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

async function parseWithExifr(input: Blob, fileId: string): Promise<ScanResult> {
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

	if (!data) return makeEmptyResult(fileId);

	const raw = data as Record<string, unknown>;
	const fields = rawToFields(raw);
	const hasGps = fields.some((f) => f.category === 'gps');
	const makePart = raw['Make'] as string | undefined;
	const modelPart = raw['Model'] as string | undefined;
	const device = [makePart, modelPart].filter(Boolean).join(' ') || undefined;
	const { score, categories } = computeFileScore(fields);

	return {
		fileId,
		status: 'done',
		fields,
		hasGps,
		device,
		fieldCount: fields.length,
		categoryScores: categories,
		fileScore: score
	};
}

async function parseWithExifReader(input: Blob, fileId: string): Promise<ScanResult> {
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
	const { score, categories } = computeFileScore(fields);

	return {
		fileId,
		status: 'done',
		fields,
		hasGps,
		device,
		fieldCount: fields.length,
		categoryScores: categories,
		fileScore: score
	};
}

export async function parseImage(
	file: File,
	fileId: string,
	format: ImageFormat
): Promise<ScanResult> {
	const input: Blob =
		file.size > FILE_SIZE_THRESHOLD ? file.slice(0, MAX_IMAGE_HEADER_BYTES) : file;

	if (EXIFR_FORMATS.has(format)) {
		return parseWithExifr(input, fileId);
	}

	if (EXIFREADER_FORMATS.has(format)) {
		return parseWithExifReader(input, fileId);
	}

	return makeEmptyResult(fileId);
}
