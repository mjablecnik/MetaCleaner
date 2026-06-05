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
