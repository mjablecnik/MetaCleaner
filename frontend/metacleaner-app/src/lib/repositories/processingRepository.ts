export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

export interface RiskCategory {
	id: string;
	percentage: number;
	level: RiskLevel;
}

export interface RiskAnalysis {
	score: number;
	categories: RiskCategory[];
}

export type FileProcessingStatus = 'done' | 'in_progress' | 'waiting';

export interface ProcessingFileState {
	fileId: string;
	status: FileProcessingStatus;
	progress?: number;
	fieldsRemoved?: number;
	gpsRemoved?: boolean;
}

export type LogEntryStatus = 'success' | 'in_progress' | 'waiting';

export interface ProcessingLogEntry {
	timestamp: string;
	fileId: string;
	status: LogEntryStatus;
	detail?: string;
}

export interface ProcessingState {
	overallProgress: number;
	filesCompleted: number;
	totalFiles: number;
	fieldsRemoved: number;
	timeRemainingSeconds: number;
	currentFileId: string;
	files: ProcessingFileState[];
	log: ProcessingLogEntry[];
}

export type ErrorLogStatus = 'success' | 'error' | 'skipped';

export interface ErrorLogEntry {
	timestamp: string;
	fileId: string;
	status: ErrorLogStatus;
	errorCode?: string;
}

export interface ErrorType {
	id: string;
	icon: string;
	title: string;
	description: string;
}

export interface ErrorState {
	errorCode: string;
	errorHexCode: string;
	errorTime: string;
	failedFileId: string;
	phase: string;
	filesCompleted: number;
	totalFiles: number;
	errorTypes: ErrorType[];
	log: ErrorLogEntry[];
}

export interface FileMetadataResult {
	fileId: string;
	gpsRemoved: boolean;
	exifCount: number;
	xmpCount: number;
	id3Count: number;
	mp4AtomsCount: number;
	pngChunksCount: number;
	totalFields: number;
}

export interface MetadataBreakdown {
	gpsLocations: number;
	exifFields: number;
	xmpFields: number;
	id3mp4Fields: number;
	otherFields: number;
}

export interface ProcessingResults {
	filesProcessed: number;
	fieldsRemoved: number;
	gpsLocationsRemoved: number;
	totalTimeSeconds: number;
	fileResults: FileMetadataResult[];
	beforeBreakdown: MetadataBreakdown;
}

export async function getRiskAnalysis(): Promise<RiskAnalysis> {
	return {
		score: 72,
		categories: [
			{ id: 'gps', percentage: 92, level: 'critical' },
			{ id: 'device', percentage: 68, level: 'high' },
			{ id: 'personal', percentage: 48, level: 'medium' },
			{ id: 'timestamp', percentage: 22, level: 'low' }
		]
	};
}

export async function getProcessingState(): Promise<ProcessingState> {
	return {
		overallProgress: 62,
		filesCompleted: 2,
		totalFiles: 4,
		fieldsRemoved: 30,
		timeRemainingSeconds: 14,
		currentFileId: 'video-prague-walk',
		files: [
			{ fileId: 'img-4821', status: 'done', fieldsRemoved: 12, gpsRemoved: false },
			{ fileId: 'photo-holiday-2024', status: 'done', fieldsRemoved: 18, gpsRemoved: true },
			{ fileId: 'video-prague-walk', status: 'in_progress', progress: 38 },
			{ fileId: 'screenshot-map', status: 'waiting' }
		],
		log: [
			{ timestamp: '12:04:01', fileId: 'img-4821', status: 'success', detail: '(EXIF, XMP)' },
			{ timestamp: '12:04:03', fileId: 'photo-holiday-2024', status: 'success' },
			{ timestamp: '12:04:05', fileId: 'video-prague-walk', status: 'in_progress' },
			{ timestamp: '—', fileId: 'screenshot-map', status: 'waiting' }
		]
	};
}

export async function getErrorState(): Promise<ErrorState> {
	return {
		errorCode: 'ERR_CLEANING_FAILED',
		errorHexCode: '0x0032A',
		errorTime: '12:04:17',
		failedFileId: 'video-prague-walk',
		phase: 'metadata_strip',
		filesCompleted: 2,
		totalFiles: 4,
		errorTypes: [
			{
				id: 'cleaning',
				icon: 'fa-circle-xmark',
				title: 'Cleaning Process Failed',
				description: 'Interní chyba při čištění metadat'
			},
			{
				id: 'connection',
				icon: 'fa-wifi',
				title: 'Connection Error',
				description: 'Ztráta spojení se serverem'
			},
			{
				id: 'timeout',
				icon: 'fa-clock',
				title: 'Timeout',
				description: 'Operace překročila časový limit'
			}
		],
		log: [
			{ timestamp: '12:04:01', fileId: 'img-4821', status: 'success' },
			{ timestamp: '12:04:09', fileId: 'photo-holiday-2024', status: 'success' },
			{
				timestamp: '12:04:17',
				fileId: 'video-prague-walk',
				status: 'error',
				errorCode: 'ERR_CLEANING_FAILED'
			},
			{ timestamp: '12:04:17', fileId: 'screenshot-map', status: 'skipped' }
		]
	};
}

export async function getResults(): Promise<ProcessingResults> {
	return {
		filesProcessed: 4,
		fieldsRemoved: 87,
		gpsLocationsRemoved: 3,
		totalTimeSeconds: 28,
		fileResults: [
			{
				fileId: 'img-4821',
				gpsRemoved: true,
				exifCount: 8,
				xmpCount: 4,
				id3Count: 0,
				mp4AtomsCount: 0,
				pngChunksCount: 0,
				totalFields: 12
			},
			{
				fileId: 'photo-holiday-2024',
				gpsRemoved: true,
				exifCount: 12,
				xmpCount: 6,
				id3Count: 0,
				mp4AtomsCount: 0,
				pngChunksCount: 0,
				totalFields: 18
			},
			{
				fileId: 'video-prague-walk',
				gpsRemoved: true,
				exifCount: 0,
				xmpCount: 0,
				id3Count: 9,
				mp4AtomsCount: 14,
				pngChunksCount: 0,
				totalFields: 43
			},
			{
				fileId: 'screenshot-map',
				gpsRemoved: false,
				exifCount: 0,
				xmpCount: 9,
				id3Count: 0,
				mp4AtomsCount: 0,
				pngChunksCount: 5,
				totalFields: 14
			}
		],
		beforeBreakdown: {
			gpsLocations: 3,
			exifFields: 52,
			xmpFields: 19,
			id3mp4Fields: 23,
			otherFields: 13
		}
	};
}
