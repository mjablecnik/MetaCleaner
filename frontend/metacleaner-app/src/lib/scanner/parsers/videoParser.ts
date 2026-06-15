import type { MetadataField, RiskCategory, ScanResult } from '../types.js';
import { FILE_SIZE_THRESHOLD, MAX_VIDEO_HEADER_BYTES } from '../constants.js';
import { computeFileScore } from '../riskAnalyzer.js';

// Maps MediaInfo track field names (and Apple QuickTime extra keys) to our EXIF-style category fields
const VIDEO_FIELD_MAP: Record<string, { key: string; category: keyof RiskCategory }> = {
	// GPS
	'com.apple.quicktime.location.ISO6709': { key: 'GPSPosition', category: 'gps' },
	com_apple_quicktime_location_ISO6709: { key: 'GPSPosition', category: 'gps' },
	location: { key: 'GPSPosition', category: 'gps' },
	GPS_Coordinate: { key: 'GPSPosition', category: 'gps' },
	'location.ISO6709': { key: 'GPSPosition', category: 'gps' },
	xyz: { key: 'GPSPosition', category: 'gps' },
	// Device identity
	'com.apple.quicktime.make': { key: 'Make', category: 'deviceIdentity' },
	com_apple_quicktime_make: { key: 'Make', category: 'deviceIdentity' },
	'com.apple.quicktime.model': { key: 'Model', category: 'deviceIdentity' },
	com_apple_quicktime_model: { key: 'Model', category: 'deviceIdentity' },
	Encoded_Application: { key: 'Software', category: 'deviceIdentity' },
	Encoder: { key: 'Software', category: 'deviceIdentity' },
	encoder: { key: 'Software', category: 'deviceIdentity' },
	Encoded_Library: { key: 'EncoderLibrary', category: 'deviceIdentity' },
	Encoded_Library_Name: { key: 'EncoderLibrary', category: 'deviceIdentity' },
	Writing_Application: { key: 'Software', category: 'deviceIdentity' },
	Writing_Library: { key: 'EncoderLibrary', category: 'deviceIdentity' },
	'com.apple.quicktime.software': { key: 'Software', category: 'deviceIdentity' },
	com_apple_quicktime_software: { key: 'Software', category: 'deviceIdentity' },
	handler_name: { key: 'HandlerName', category: 'deviceIdentity' },
	HandlerDescription: { key: 'HandlerName', category: 'deviceIdentity' },
	// Personal data
	Title: { key: 'Creator', category: 'personalData' },
	title: { key: 'Creator', category: 'personalData' },
	Author: { key: 'Artist', category: 'personalData' },
	artist: { key: 'Artist', category: 'personalData' },
	Performer: { key: 'Artist', category: 'personalData' },
	Director: { key: 'Artist', category: 'personalData' },
	'com.apple.quicktime.author': { key: 'Artist', category: 'personalData' },
	com_apple_quicktime_author: { key: 'Artist', category: 'personalData' },
	Copyright: { key: 'Copyright', category: 'personalData' },
	copyright: { key: 'Copyright', category: 'personalData' },
	comment: { key: 'Comment', category: 'personalData' },
	Comment: { key: 'Comment', category: 'personalData' },
	description: { key: 'Description', category: 'personalData' },
	Description: { key: 'Description', category: 'personalData' },
	// Timestamps
	Recorded_Date: { key: 'CreateDate', category: 'timestamps' },
	Encoded_Date: { key: 'DateTimeOriginal', category: 'timestamps' },
	Tagged_Date: { key: 'DateTimeDigitized', category: 'timestamps' },
	'com.apple.quicktime.creationdate': { key: 'CreateDate', category: 'timestamps' },
	com_apple_quicktime_creationdate: { key: 'CreateDate', category: 'timestamps' },
	creation_time: { key: 'CreateDate', category: 'timestamps' },
	File_Created_Date: { key: 'CreateDate', category: 'timestamps' },
	File_Modified_Date: { key: 'ModifyDate', category: 'timestamps' },
	Mastered_Date: { key: 'CreateDate', category: 'timestamps' }
};

type MediaInfoInstance = {
	analyzeData(
		getSize: () => number,
		readChunk: (size: number, offset: number) => Promise<Uint8Array>
	): Promise<unknown>;
	close(): void;
};

let mediaInfoInstance: MediaInfoInstance | null = null;

export async function getMediaInfo(): Promise<MediaInfoInstance> {
	if (mediaInfoInstance) return mediaInfoInstance;

	try {
		const MediaInfoFactory = (await import('mediainfo.js')).default as (options: {
			format: string;
			locateFile?: (path: string) => string;
		}) => Promise<MediaInfoInstance>;

		mediaInfoInstance = await MediaInfoFactory({
			format: 'object',
			locateFile: (path: string) => `/${path}`
		});
		return mediaInfoInstance;
	} catch (err) {
		mediaInfoInstance = null;
		throw err;
	}
}

function extractFieldsFromTrack(track: Record<string, unknown>): {
	fields: MetadataField[];
	raw: Record<string, string>;
} {
	const fields: MetadataField[] = [];
	const raw: Record<string, string> = {};
	const seen = new Set<string>();

	for (const [rawKey, rawValue] of Object.entries(track)) {
		if (rawKey === '@type' || rawValue === null || rawValue === undefined) continue;

		// Handle nested extra objects (e.g. track.extra = { 'com.apple.quicktime.make': 'Apple' })
		if (rawKey === 'extra' && typeof rawValue === 'object' && rawValue !== null) {
			const extra = rawValue as Record<string, unknown>;
			for (const [extraKey, extraValue] of Object.entries(extra)) {
				if (extraValue === null || extraValue === undefined) continue;
				const strVal = typeof extraValue === 'string' ? extraValue : String(extraValue);
				raw[extraKey] = strVal;

				const mapping = VIDEO_FIELD_MAP[extraKey];
				if (!mapping || seen.has(mapping.key)) continue;
				const value =
					typeof extraValue === 'string' || typeof extraValue === 'number'
						? extraValue
						: String(extraValue);
				fields.push({ key: mapping.key, value, category: mapping.category });
				seen.add(mapping.key);
			}
			continue;
		}

		// Store all raw fields
		const strVal = typeof rawValue === 'string' ? rawValue : String(rawValue);
		raw[rawKey] = strVal;

		const mapping = VIDEO_FIELD_MAP[rawKey];
		if (!mapping || seen.has(mapping.key)) continue;
		const value =
			typeof rawValue === 'string' || typeof rawValue === 'number' ? rawValue : String(rawValue);
		fields.push({ key: mapping.key, value, category: mapping.category });
		seen.add(mapping.key);
	}

	return { fields, raw };
}

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

export async function parseVideo(file: File, fileId: string): Promise<ScanResult> {
	console.debug('[videoParser] parseVideo called for:', file.name, file.size, file.type);
	let mi: MediaInfoInstance;
	try {
		mi = await getMediaInfo();
		console.debug('[videoParser] MediaInfo loaded OK');
	} catch (err) {
		console.debug('[videoParser] MediaInfo FAILED to load:', err);
		return makeEmptyResult(fileId);
	}

	const slice = file.size > FILE_SIZE_THRESHOLD ? file.slice(0, MAX_VIDEO_HEADER_BYTES) : file;
	const sliceSize = file.size > FILE_SIZE_THRESHOLD ? MAX_VIDEO_HEADER_BYTES : file.size;

	let result: unknown;
	try {
		result = await mi.analyzeData(
			() => sliceSize,
			async (size, offset) => {
				const chunk = slice.slice(offset, offset + size);
				return new Uint8Array(await chunk.arrayBuffer());
			}
		);
	} catch {
		return makeEmptyResult(fileId);
	}

	if (!result || typeof result !== 'object') return makeEmptyResult(fileId);

	const media = (result as { media?: { track?: unknown[] } }).media;
	if (!media?.track) return makeEmptyResult(fileId);

	// DEBUG: log raw MediaInfo output to see what fields are available
	console.debug('[videoParser] MediaInfo tracks:', JSON.stringify(media.track, null, 2));

	const allFields: MetadataField[] = [];
	const allRaw: Record<string, string> = {};
	for (const track of media.track) {
		if (typeof track !== 'object' || track === null) continue;
		const { fields: trackFields, raw: trackRaw } = extractFieldsFromTrack(
			track as Record<string, unknown>
		);
		allFields.push(...trackFields);
		Object.assign(allRaw, trackRaw);
	}

	// Deduplicate by key, keeping first occurrence
	const seen = new Set<string>();
	const fields = allFields.filter((f) => {
		if (seen.has(f.key)) return false;
		seen.add(f.key);
		return true;
	});

	const hasGps = fields.some((f) => f.category === 'gps');
	const makeField = fields.find((f) => f.key === 'Make');
	const modelField = fields.find((f) => f.key === 'Model');
	const device = [makeField?.value, modelField?.value].filter(Boolean).join(' ') || undefined;
	const { score, categories } = computeFileScore(fields);

	return {
		fileId,
		status: 'done',
		fields,
		hasGps,
		device: device as string | undefined,
		fieldCount: fields.length,
		categoryScores: categories,
		fileScore: score,
		rawMetadata: allRaw
	};
}
