import type { ScanResult } from './types.js';
import type { ImageFormat } from './types.js';
import { detectFormat } from './parsers/formatDetector.js';
import { parseImage } from './parsers/imageParser.js';
import { parseVideo } from './parsers/videoParser.js';

export interface ParseOptions {
	maxImageHeaderBytes: number;
	maxVideoHeaderBytes: number;
	fileSizeThreshold: number;
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

function makeErrorResult(fileId: string, error: unknown): ScanResult {
	const message = error instanceof Error ? error.message : String(error);
	return {
		fileId,
		status: 'error',
		fields: [],
		hasGps: false,
		fieldCount: 0,
		categoryScores: { gps: 0, deviceIdentity: 0, personalData: 0, timestamps: 0, aiOrigin: 0 },
		fileScore: 0,
		error: message
	};
}

export async function parseFile(file: File, fileId: string): Promise<ScanResult> {
	const detected = detectFormat(file);

	if (!detected) {
		return makeEmptyResult(fileId);
	}

	try {
		if (detected.type === 'image') {
			return await parseImage(file, fileId, detected.format as ImageFormat);
		} else {
			return await parseVideo(file, fileId);
		}
	} catch (error) {
		return makeErrorResult(fileId, error);
	}
}
