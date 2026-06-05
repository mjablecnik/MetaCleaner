import type { FileType, ImageFormat, VideoFormat } from '../types.js';
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from '../constants.js';

export interface DetectedFormat {
	type: FileType;
	format: ImageFormat | VideoFormat;
}

export function detectFormat(file: File): DetectedFormat | null {
	const lastDot = file.name.lastIndexOf('.');
	if (lastDot === -1) return null;

	const ext = file.name.slice(lastDot).toLowerCase();

	const imageFormat = IMAGE_EXTENSIONS[ext];
	if (imageFormat) {
		return { type: 'image', format: imageFormat as ImageFormat };
	}

	const videoFormat = VIDEO_EXTENSIONS[ext];
	if (videoFormat) {
		return { type: 'video', format: videoFormat as VideoFormat };
	}

	return null;
}
