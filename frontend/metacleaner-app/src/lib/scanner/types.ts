export type FileType = 'image' | 'video' | 'unknown';
export type ImageFormat =
	| 'jpeg'
	| 'png'
	| 'heic'
	| 'heif'
	| 'avif'
	| 'tiff'
	| 'dng'
	| 'webp'
	| 'gif';
export type VideoFormat =
	| 'mp4'
	| 'mov'
	| 'avi'
	| 'mkv'
	| 'webm'
	| 'wmv'
	| 'flv'
	| '3gp'
	| 'mpeg'
	| 'ogv'
	| 'mts';
export type ScanStatus = 'pending' | 'scanning' | 'done' | 'error';
export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

export interface RiskCategory {
	gps: number;
	deviceIdentity: number;
	personalData: number;
	timestamps: number;
}

export interface MetadataField {
	key: string;
	value: string | number | boolean;
	category: keyof RiskCategory;
}

export interface ScanResult {
	fileId: string;
	status: ScanStatus;
	fields: MetadataField[];
	hasGps: boolean;
	device?: string;
	fieldCount: number;
	categoryScores: RiskCategory;
	fileScore: number;
	error?: string;
}

export interface QueuedFile {
	id: string;
	file: File;
	name: string;
	size: number;
	extension: string;
	type: FileType;
	format: ImageFormat | VideoFormat | null;
	scanResult: ScanResult | null;
}

export interface AggregatedRisk {
	overallScore: number;
	severity: SeverityLevel;
	categories: RiskCategory;
	fileCount: number;
	scannedCount: number;
	isScanning: boolean;
}
