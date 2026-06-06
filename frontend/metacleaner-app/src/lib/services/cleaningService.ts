import type { ProcessingResults } from '$lib/types/processing.js';
import type { QueuedFile } from '$lib/scanner/types.js';
import type { Report, ReportDetail } from '$lib/types/report.js';

export interface CleaningOptions {
	removeGps: boolean;
	removeExif: boolean;
	removeXmp: boolean;
	removeComments: boolean;
}

export interface AnalysisResult {
	totalFields: number;
	hasGps: boolean;
	perFileFieldCounts: Record<string, number>;
}

export interface FileProgressUpdate {
	fileId: string;
	fileName: string;
	progress: number;
	fieldsRemoved: number;
	gpsRemoved: boolean;
}

export interface CleaningError {
	code: string;
	hexCode: string;
	message: string;
	fileId?: string;
	fileName?: string;
	phase: string;
	timestamp: string;
}

export type CleaningJobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface CleaningJob {
	jobId: string;
	cancel(): void;
}

export interface CleaningCallbacks {
	onProgress(
		overallProgress: number,
		filesCompleted: number,
		totalFiles: number,
		fieldsRemoved: number,
		timeRemainingSeconds: number
	): void;
	onFileStart(fileId: string, fileName: string): void;
	onFileComplete(fileId: string, fieldsRemoved: number, gpsRemoved: boolean): void;
	onComplete(results: ProcessingResults): void;
	onError(error: CleaningError): void;
}

export interface CleaningService {
	analyzeFiles(files: QueuedFile[]): Promise<AnalysisResult>;
	startCleaning(
		files: QueuedFile[],
		options: CleaningOptions,
		callbacks: CleaningCallbacks
	): CleaningJob;
	downloadResults(jobId: string): Promise<Blob>;
	getReports(): Promise<{
		summary: import('$lib/types/report.js').ReportSummaryStats;
		reports: Report[];
	}>;
	getReportDetail(reportId: string): Promise<ReportDetail>;
}
