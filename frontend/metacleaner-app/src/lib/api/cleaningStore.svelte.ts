import type { QueuedFile } from '$lib/scanner/types';
import type {
	ProcessingState,
	ProcessingFileState,
	ProcessingLogEntry,
	ErrorState,
	ErrorType,
	ProcessingResults,
	FileMetadataResult,
	MetadataBreakdown
} from '$lib/types/processing';
import type { WsProgressEvent, ApiChartDataPoint } from './client';

export type CleaningPhase = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

interface FileMapping {
	serverId: string;
	scannerFile: QueuedFile;
}

// Server file ID → scanner QueuedFile mapping
let fileMappings = $state<FileMapping[]>([]);
let phase = $state<CleaningPhase>('idle');
let uploadError = $state<string | null>(null);
let jobId = $state<string | null>(null);

// Processing state (step3)
let processingState = $state<ProcessingState | null>(null);
let overallPct = $state(0);

// Error state (step4) — uses scanner IDs in failedFileId
let errorState = $state<ErrorState | null>(null);

// Completion state (step5)
let results = $state<ProcessingResults | null>(null);
let reportId = $state<string | null>(null);
let completedAtMs = $state<number | null>(null);

// Accumulates per-file results from file_complete WS events
let pendingFileResults = $state<FileMetadataResult[]>([]);

function getScannerFile(serverId: string): QueuedFile | undefined {
	return fileMappings.find((m) => m.serverId === serverId)?.scannerFile;
}

function getScannerId(serverId: string): string | undefined {
	return getScannerFile(serverId)?.id;
}

function now(): string {
	return new Date().toLocaleTimeString('en-GB', { hour12: false });
}

export const cleaningStore = {
	get phase() {
		return phase;
	},
	get uploadError() {
		return uploadError;
	},
	get jobId() {
		return jobId;
	},
	get processingState() {
		return processingState;
	},
	get overallPct() {
		return overallPct;
	},
	get errorState() {
		return errorState;
	},
	get results() {
		return results;
	},
	get reportId() {
		return reportId;
	},
	get completedAtMs() {
		return completedAtMs;
	},
	get fileMappings() {
		return fileMappings;
	},

	startUpload(queuedFiles: QueuedFile[]) {
		phase = 'uploading';
		uploadError = null;
		jobId = null;
		fileMappings = [];
		processingState = null;
		overallPct = 0;
		errorState = null;
		results = null;
		reportId = null;
		completedAtMs = null;
		pendingFileResults = [];
		void queuedFiles; // used externally to determine files
	},

	setFileMappings(serverFiles: { id: string }[], queuedFiles: QueuedFile[]) {
		fileMappings = serverFiles.map((sf, i) => ({
			serverId: sf.id,
			scannerFile: queuedFiles[i]
		}));
	},

	initJob(id: string) {
		jobId = id;
		phase = 'processing';
		const total = fileMappings.length;
		const fileStates: ProcessingFileState[] = fileMappings.map((m, i) => ({
			fileId: m.scannerFile.id,
			status: i === 0 ? 'in_progress' : 'waiting'
		}));
		const log: ProcessingLogEntry[] = fileMappings.map((m) => ({
			timestamp: '—',
			fileId: m.scannerFile.id,
			status: 'waiting' as const
		}));
		processingState = {
			overallProgress: 0,
			filesCompleted: 0,
			totalFiles: total,
			fieldsRemoved: 0,
			timeRemainingSeconds: total * 8,
			currentFileId: fileMappings[0]?.scannerFile.id ?? '',
			files: fileStates,
			log
		};
		overallPct = 0;
	},

	setUploadError(err: string) {
		uploadError = err;
		phase = 'error';
	},

	handleWsEvent(event: WsProgressEvent) {
		if (!processingState) return;

		if (event.type === 'file_progress' && event.fileId) {
			const scannerId = getScannerId(event.fileId);
			if (scannerId) {
				processingState = {
					...processingState,
					currentFileId: scannerId,
					files: processingState.files.map((f) =>
						f.fileId === scannerId
							? { ...f, status: 'in_progress', progress: event.progress }
							: f
					)
				};
			}
		} else if (event.type === 'file_complete' && event.fileId) {
			const scannerId = getScannerId(event.fileId);
			if (scannerId) {
				pendingFileResults = [
					...pendingFileResults,
					{
						fileId: scannerId,
						gpsRemoved: event.gpsRemoved ?? false,
						exifCount: 0,
						xmpCount: 0,
						id3Count: 0,
						mp4AtomsCount: 0,
						pngChunksCount: 0,
						totalFields: event.fieldsRemoved ?? 0
					}
				];
				processingState = {
					...processingState,
					files: processingState.files.map((f) =>
						f.fileId === scannerId
							? {
									...f,
									status: 'done',
									progress: 100,
									fieldsRemoved: event.fieldsRemoved,
									gpsRemoved: event.gpsRemoved
								}
							: f
					),
					log: processingState.log.map((l) =>
						l.fileId === scannerId ? { ...l, timestamp: now(), status: 'success' as const } : l
					)
				};
			}
		} else if (event.type === 'file_error' && event.fileId) {
			const scannerId = getScannerId(event.fileId);
			if (scannerId) {
				processingState = {
					...processingState,
					files: processingState.files.map((f) =>
						f.fileId === scannerId ? { ...f, status: 'error' } : f
					),
					log: processingState.log.map((l) =>
						l.fileId === scannerId
							? { ...l, timestamp: now(), status: 'error' as const }
							: l
					)
				};
			}
		} else if (event.type === 'job_progress') {
			const pct = event.overallProgress ?? 0;
			overallPct = pct;
			processingState = {
				...processingState,
				overallProgress: pct,
				filesCompleted: event.filesCompleted ?? processingState.filesCompleted,
				fieldsRemoved: event.fieldsRemoved ?? processingState.fieldsRemoved,
				timeRemainingSeconds: event.timeRemainingSeconds ?? processingState.timeRemainingSeconds,
				currentFileId:
					(event.currentFileId ? getScannerId(event.currentFileId) : undefined) ??
					processingState.currentFileId
			};
		} else if (event.type === 'job_complete') {
			overallPct = 100;
			reportId = event.reportId ?? null;
			completedAtMs = Date.now();
			results = {
				filesProcessed: event.filesCompleted ?? processingState.totalFiles,
				fieldsRemoved: event.fieldsRemoved ?? processingState.fieldsRemoved,
				gpsLocationsRemoved: event.gpsLocationsRemoved ?? 0,
				totalTimeSeconds: event.totalTimeSeconds ?? 0,
				fileResults: pendingFileResults,
				beforeBreakdown: {
					gpsLocations: event.gpsLocationsRemoved ?? 0,
					exifFields: 0,
					xmpFields: 0,
					id3mp4Fields: 0,
					otherFields: 0
				}
			};
			phase = 'completed';
		}
	},

	setReportBreakdown(chartData: ApiChartDataPoint[]) {
		if (!results) return;
		const breakdown: MetadataBreakdown = {
			gpsLocations: results.beforeBreakdown.gpsLocations,
			exifFields: 0,
			xmpFields: 0,
			id3mp4Fields: 0,
			otherFields: 0
		};
		for (const point of chartData) {
			const label = point.label.toUpperCase();
			if (label === 'GPS') breakdown.gpsLocations = point.fields;
			else if (label === 'EXIF') breakdown.exifFields = point.fields;
			else if (label === 'XMP') breakdown.xmpFields = point.fields;
			else if (label.includes('ID3') || label.includes('MP4')) breakdown.id3mp4Fields = point.fields;
			else breakdown.otherFields += point.fields;
		}
		results = { ...results, beforeBreakdown: breakdown };
	},

	setError(errCode: string, message: string, failedServerId: string | null) {
		const failedScannerId = failedServerId ? getScannerId(failedServerId) : undefined;
		const completed = processingState?.filesCompleted ?? 0;
		const total = processingState?.totalFiles ?? 0;
		const ts = now();

		const errorTypes: ErrorType[] = [
			{
				id: 'cleaning',
				icon: 'fa-circle-xmark',
				title: 'Cleaning Process Failed',
				description: 'Internal error during metadata cleaning'
			},
			{
				id: 'connection',
				icon: 'fa-wifi',
				title: 'Connection Error',
				description: 'Lost connection to the server'
			},
			{
				id: 'timeout',
				icon: 'fa-clock',
				title: 'Timeout',
				description: 'Operation exceeded the time limit'
			}
		];

		errorState = {
			errorCode: errCode,
			errorHexCode: '0x0001',
			errorTime: ts,
			failedFileId: failedScannerId ?? '',
			phase: 'metadata_strip',
			filesCompleted: completed,
			totalFiles: total,
			errorTypes,
			log: (processingState?.log ?? []).map((l) => ({
				timestamp: l.timestamp,
				fileId: l.fileId,
				status:
					l.status === 'success'
						? ('success' as const)
						: l.fileId === (failedScannerId ?? '')
							? ('error' as const)
							: ('skipped' as const),
				errorCode: l.fileId === (failedScannerId ?? '') ? errCode : undefined
			}))
		};
		phase = 'error';
		void message;
	},

	reset() {
		phase = 'idle';
		uploadError = null;
		jobId = null;
		fileMappings = [];
		processingState = null;
		overallPct = 0;
		errorState = null;
		results = null;
		reportId = null;
		completedAtMs = null;
		pendingFileResults = [];
	}
};
