import type {
	CleaningService,
	CleaningOptions,
	AnalysisResult,
	CleaningJob,
	CleaningCallbacks,
	CleaningError
} from './cleaningService.js';
import type { QueuedFile } from '$lib/scanner/types.js';
import type {
	ProcessingResults,
	FileMetadataResult,
	MetadataBreakdown
} from '$lib/types/processing.js';
import type {
	Report,
	ReportDetail,
	ReportSummaryStats,
	ReportFileDetail,
	FileMetadataSection
} from '$lib/types/report.js';
import * as api from '$lib/clients/metaCleanerApi.js';
import { authStore } from '$lib/auth/auth.svelte.js';
import { cleaningResultsStore } from '$lib/stores/cleaningResultsStore.svelte.js';
import { billingStore } from '$lib/stores/billingStore.svelte.js';

// ─── Accumulated per-file data during WebSocket progress ────────

interface AccumulatedFileResult {
	fileId: string;
	fieldsRemoved: number;
	gpsRemoved: boolean;
}

// ─── Backend response types (as received from API) ──────────────

interface BackendReportSummary {
	id: string;
	reportId: string;
	date: string;
	duration: string;
	fileCount: number;
	fileTypes: string;
	type: string;
	gps: boolean;
	fields: number;
	tags: string[];
}

interface BackendMetadataDetail {
	gpsFields: { label: string; value: string }[];
	exifFields: { label: string; value: string }[];
	xmpFields: { label: string; value: string }[];
	id3Fields?: { label: string; value: string }[];
	mp4Atoms?: { label: string; value: string }[];
	pngChunks?: { label: string; value: string }[];
	totalRemoved: number;
}

interface BackendReportFileDetail {
	name: string;
	original_name?: string;
	extension: string;
	sizeMB: string;
	format: string;
	device: string;
	type: string;
	hasGps: boolean;
	fieldsRemoved: number;
	metadata: BackendMetadataDetail | null;
}

interface BackendReportDetail {
	reportId: string;
	date: string;
	filesProcessed: number;
	fieldsRemoved: number;
	gpsLocationsRemoved: number;
	totalTimeMs: number;
	chartData: { label: string; fields: number; percentage: number }[];
	files: BackendReportFileDetail[];
}

// ─── Polling fallback when WebSocket disconnects mid-job ────────

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 100; // ~5 minutes

async function pollUntilComplete(
	jobId: string,
	callbacks: CleaningCallbacks,
	accumulatedResults: AccumulatedFileResult[],
	isCancelled: () => boolean,
	isCompleted: () => boolean,
	setReportId: (id: string) => void
): Promise<void> {
	for (let i = 0; i < MAX_POLLS; i++) {
		if (isCancelled() || isCompleted()) return;

		await new Promise<void>((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

		if (isCancelled() || isCompleted()) return;

		try {
			const status = await api.getJobStatus(jobId);

			if (status.status === 'completed') {
				if (status.reportId) setReportId(status.reportId);
				void billingStore.refreshCreditsOnly();
				callbacks.onComplete(buildResultsFromStatus(status, accumulatedResults));
				return;
			}

			if (status.status === 'failed') {
				callbacks.onError({
					code: 'JOB_FAILED',
					hexCode: '0xF00',
					message: 'Job failed on server',
					phase: 'cleaning',
					timestamp: new Date().toISOString()
				});
				return;
			}
			// still 'pending' or 'running' — continue polling
		} catch {
			// network error during poll — continue trying
		}
	}

	// Timed out after MAX_POLLS
	if (!isCancelled() && !isCompleted()) {
		callbacks.onError(makeConnectionError());
	}
}

function buildResultsFromStatus(
	status: api.JobStatusResponse,
	accumulatedResults: AccumulatedFileResult[]
): ProcessingResults {
	const fileResults: FileMetadataResult[] = accumulatedResults.map((r) => ({
		fileId: r.fileId,
		gpsRemoved: r.gpsRemoved,
		exifCount: 0,
		xmpCount: 0,
		id3Count: 0,
		mp4AtomsCount: 0,
		pngChunksCount: 0,
		totalFields: r.fieldsRemoved
	}));

	const gpsLocations = accumulatedResults.filter((r) => r.gpsRemoved).length;
	const remainingFields = Math.max(0, status.fieldsRemoved - gpsLocations);

	return {
		filesProcessed: status.filesCompleted,
		fieldsRemoved: status.fieldsRemoved,
		gpsLocationsRemoved: status.gpsLocationsRemoved,
		totalTimeMs: status.totalTimeMs ?? 0,
		fileResults,
		beforeBreakdown: {
			gpsLocations,
			exifFields: remainingFields,
			xmpFields: 0,
			id3mp4Fields: 0,
			otherFields: 0
		}
	};
}

// ─── WebSocket message dispatcher (Req 4, 11) ───────────────────

function dispatchWsMessage(
	msg: Record<string, unknown>,
	callbacks: CleaningCallbacks,
	fileNameMap: Map<string, string>,
	accumulatedResults: AccumulatedFileResult[],
	jobId: string,
	setReportId: (id: string) => void,
	setJobCompleted: () => void
): void {
	switch (msg.type) {
		case 'file_progress': {
			const fileId = typeof msg.fileId === 'string' && msg.fileId ? msg.fileId : null;
			if (!fileId) {
				console.warn('WS file_progress: missing or invalid fileId', msg);
				break;
			}
			const fileName = fileNameMap.get(fileId) ?? fileId;
			callbacks.onFileStart(fileId, fileName);

			// Progress is embedded in file_progress events — no separate job_progress message (Req 4.5)
			callbacks.onProgress(
				typeof msg.overallProgress === 'number' ? msg.overallProgress : 0,
				typeof msg.filesCompleted === 'number' ? msg.filesCompleted : 0,
				typeof msg.totalFiles === 'number' ? msg.totalFiles : 0,
				0,
				0
			);
			break;
		}

		case 'file_complete': {
			const fileId = typeof msg.fileId === 'string' && msg.fileId ? msg.fileId : null;
			if (!fileId) {
				console.warn('WS file_complete: missing or invalid fileId', msg);
				break;
			}
			const fieldsRemoved = typeof msg.fieldsRemoved === 'number' ? msg.fieldsRemoved : 0;
			const gpsRemoved = typeof msg.gpsRemoved === 'boolean' ? msg.gpsRemoved : false;

			accumulatedResults.push({ fileId, fieldsRemoved, gpsRemoved });
			callbacks.onFileComplete(fileId, fieldsRemoved, gpsRemoved);

			callbacks.onProgress(
				typeof msg.overallProgress === 'number' ? msg.overallProgress : 0,
				typeof msg.filesCompleted === 'number' ? msg.filesCompleted : 0,
				typeof msg.totalFiles === 'number' ? msg.totalFiles : 0,
				fieldsRemoved,
				0
			);
			break;
		}

		case 'file_error': {
			const fileId = typeof msg.fileId === 'string' ? msg.fileId : undefined;
			callbacks.onError({
				code: typeof msg.errorCode === 'string' ? msg.errorCode : 'FILE_ERROR',
				hexCode: typeof msg.errorCode === 'string' ? msg.errorCode : 'FILE_ERROR',
				message: typeof msg.message === 'string' ? msg.message : 'File processing failed',
				fileId,
				fileName: fileId ? (fileNameMap.get(fileId) ?? undefined) : undefined,
				phase: 'cleaning',
				timestamp: new Date().toISOString()
			});
			break;
		}

		case 'job_complete': {
			// job_complete embeds reportId — capture it before onComplete triggers WS close (Req 4.10, 11.7)
			const jobCompleteReportId = typeof msg.reportId === 'string' ? msg.reportId : '';
			if (jobCompleteReportId) setReportId(jobCompleteReportId);
			setJobCompleted();
			void billingStore.refreshCreditsOnly();
			callbacks.onComplete(buildProcessingResults(msg, accumulatedResults, jobId));
			break;
		}

		case 'report_ready': {
			// report_ready may arrive after job_complete; store/override reportId silently (Req 4.10, 11.7)
			const reportReadyId = typeof msg.reportId === 'string' ? msg.reportId : '';
			if (reportReadyId) setReportId(reportReadyId);
			break;
		}

		default:
			// Unknown message types are silently ignored
			break;
	}
}

// ─── ProcessingResults construction from accumulated events ──────

function buildProcessingResults(
	msg: Record<string, unknown>,
	accumulatedResults: AccumulatedFileResult[],
	_jobId: string
): ProcessingResults {
	const filesProcessed = (msg.filesProcessed as number) ?? accumulatedResults.length;
	const totalTimeMs = (msg.totalTimeMs as number) ?? 0;
	const msgGpsRemoved = msg.gpsLocationsRemoved as number | undefined;
	const accumulatedGpsRemoved = accumulatedResults.filter((r) => r.gpsRemoved).length;
	const gpsLocationsRemoved =
		msgGpsRemoved && msgGpsRemoved > 0 ? msgGpsRemoved : accumulatedGpsRemoved;

	// Use fieldsRemoved from job_complete if present and non-zero,
	// otherwise sum from accumulated per-file results (more reliable).
	const msgFieldsRemoved = msg.fieldsRemoved as number | undefined;
	const accumulatedFieldsRemoved = accumulatedResults.reduce((sum, r) => sum + r.fieldsRemoved, 0);
	const fieldsRemoved =
		msgFieldsRemoved && msgFieldsRemoved > 0 ? msgFieldsRemoved : accumulatedFieldsRemoved;

	const fileResults: FileMetadataResult[] = accumulatedResults.map((r) => ({
		fileId: r.fileId,
		gpsRemoved: r.gpsRemoved,
		exifCount: 0,
		xmpCount: 0,
		id3Count: 0,
		mp4AtomsCount: 0,
		pngChunksCount: 0,
		totalFields: r.fieldsRemoved
	}));

	const gpsLocations = gpsLocationsRemoved;
	const remainingFields = Math.max(0, fieldsRemoved - gpsLocations);

	const beforeBreakdown: MetadataBreakdown = {
		gpsLocations,
		exifFields: remainingFields,
		xmpFields: 0,
		id3mp4Fields: 0,
		otherFields: 0
	};

	return {
		filesProcessed,
		fieldsRemoved,
		gpsLocationsRemoved,
		totalTimeMs,
		fileResults,
		beforeBreakdown
	};
}

// ─── Error mapping helpers (Req 3.3–3.6) ────────────────────────

function mapApiHttpError(err: api.ApiHttpError): CleaningError {
	const codeMap: Record<number, string> = {
		413: 'FILE_TOO_LARGE',
		415: 'UNSUPPORTED_FORMAT',
		429: 'RATE_LIMIT_EXCEEDED',
		400: 'INVALID_REQUEST',
		404: 'FILE_NOT_FOUND'
	};

	return {
		code: err.errorCode ?? codeMap[err.status] ?? 'UNKNOWN_ERROR',
		hexCode: '0x000',
		message: err.errorMessage ?? `Request failed with status ${err.status}`,
		phase: 'upload',
		timestamp: err.timestamp ?? new Date().toISOString()
	};
}

function makeConnectionError(): CleaningError {
	return {
		code: 'CONNECTION_LOST',
		hexCode: '0xFFE',
		message: 'WebSocket connection closed unexpectedly',
		phase: 'progress',
		timestamp: new Date().toISOString()
	};
}

function makeNetworkError(err: unknown): CleaningError {
	return {
		code: 'NETWORK_ERROR',
		hexCode: '0xFFF',
		message: err instanceof Error ? err.message : 'Network request failed',
		phase: 'upload',
		timestamp: new Date().toISOString()
	};
}

// ─── Report summary mapping (Req 9.1–9.3) ───────────────────────

function extractDate(dateStr: string): string {
	if (dateStr.includes('T')) return dateStr.split('T')[0];
	// Normalize space-separated datetime (e.g. PostgreSQL "YYYY-MM-DD HH:MM:SS+00")
	if (dateStr.includes(' ')) {
		try {
			const d = new Date(dateStr);
			if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
		} catch {
			// ignore — return raw string unchanged
		}
	}
	return dateStr;
}

function extractTime(dateStr: string): string {
	if (dateStr.includes('T')) {
		const timePart = dateStr.split('T')[1];
		if (!timePart) return '';
		return timePart.replace('Z', '').substring(0, 5);
	}
	// Normalize space-separated datetime (e.g. PostgreSQL "YYYY-MM-DD HH:MM:SS+00")
	if (dateStr.includes(' ')) {
		try {
			const d = new Date(dateStr);
			if (!isNaN(d.getTime())) {
				const timePart = d.toISOString().split('T')[1];
				return timePart ? timePart.replace('Z', '').substring(0, 5) : '';
			}
		} catch {
			// ignore — return empty string
		}
	}
	return '';
}

function computeIconColor(type: string): 'blue' | 'orange' {
	return type === 'image' ? 'blue' : 'orange';
}

function mapSingleReport(r: BackendReportSummary): Report {
	return {
		id: r.id,
		date: extractDate(r.date),
		time: extractTime(r.date),
		duration: r.duration,
		fileCount: r.fileCount,
		fileTypes: r.fileTypes,
		type: r.type as 'image' | 'video',
		gps: r.gps,
		fields: r.fields,
		fieldsColor: 'white',
		tags: r.tags ?? [],
		reportId: r.reportId,
		iconColor: computeIconColor(r.type)
	};
}

function mapReportSummaries(backendReports: BackendReportSummary[]): Report[] {
	return backendReports.map(mapSingleReport);
}

// ─── Report file detail mapping (Req 9.4–9.6, 9.8) ─────────────

function computeBarWidth(fileFieldsRemoved: number, totalFieldsRemoved: number): number {
	if (totalFieldsRemoved === 0) return 0;
	return Math.round((fileFieldsRemoved / totalFieldsRemoved) * 100);
}

function getGradientFrom(type: string): string {
	return type === 'image' ? '#22c55e' : '#f97316';
}

function getGradientTo(type: string): string {
	return type === 'image' ? '#16a34a' : '#ea580c';
}

function mapMetadataDetail(md: BackendMetadataDetail | null): FileMetadataSection {
	if (!md) {
		return {
			gpsFields: [],
			exifFields: [],
			xmpFields: [],
			id3Fields: [],
			mp4AtomFields: [],
			totalRemoved: 0
		};
	}

	return {
		gpsFields: (md.gpsFields ?? []).map((f) => ({
			label: f.label,
			value: f.value,
			moreCount: undefined
		})),
		exifFields: (md.exifFields ?? []).map((f) => ({
			label: f.label,
			value: f.value,
			moreCount: undefined
		})),
		xmpFields: (md.xmpFields ?? []).map((f) => ({
			label: f.label,
			value: f.value,
			moreCount: undefined
		})),
		id3Fields: (md.id3Fields ?? []).map((f) => ({
			label: f.label,
			value: f.value,
			moreCount: undefined
		})),
		mp4AtomFields: (md.mp4Atoms ?? []).map((f) => ({
			label: f.label,
			value: f.value,
			moreCount: undefined
		})),
		totalRemoved: md.totalRemoved
	};
}

function mapReportFileDetails(files: BackendReportFileDetail[]): ReportFileDetail[] {
	const totalFieldsRemoved = files.reduce((sum, f) => sum + f.fieldsRemoved, 0);

	return files.map((f) => ({
		name: f.original_name ?? f.name,
		extension: f.extension,
		sizeMB: f.sizeMB,
		format: f.format,
		device: f.device,
		type: f.type as 'image' | 'video',
		iconColor: computeIconColor(f.type),
		hasGps: f.hasGps,
		fieldsRemoved: f.fieldsRemoved,
		barWidthPercent: computeBarWidth(f.fieldsRemoved, totalFieldsRemoved),
		barGradientFrom: getGradientFrom(f.type),
		barGradientTo: getGradientTo(f.type),
		metadata: mapMetadataDetail(f.metadata)
	}));
}

function mapReportDetail(data: BackendReportDetail): ReportDetail {
	return {
		reportId: data.reportId,
		date: data.date,
		filesProcessed: data.filesProcessed,
		fieldsRemoved: data.fieldsRemoved,
		gpsLocationsRemoved: data.gpsLocationsRemoved,
		totalTimeMs: data.totalTimeMs,
		chartData: data.chartData ?? [],
		files: mapReportFileDetails(data.files ?? [])
	};
}

// ─── ApiCleaningService implementation ──────────────────────────

class ApiCleaningService implements CleaningService {
	async analyzeFiles(files: QueuedFile[]): Promise<AnalysisResult> {
		const perFileFieldCounts: Record<string, number> = {};
		let totalFields = 0;
		let hasGps = false;

		for (const file of files) {
			const count = file.scanResult?.fieldCount ?? 0;
			perFileFieldCounts[file.id] = count;
			totalFields += count;
			if (file.scanResult?.hasGps) hasGps = true;
		}

		return { totalFields, hasGps, perFileFieldCounts };
	}

	startCleaning(
		files: QueuedFile[],
		_options: CleaningOptions,
		callbacks: CleaningCallbacks
	): CleaningJob {
		let ws: WebSocket | null = null;
		let cancelled = false;
		let jobCompleted = false;

		const fileNameMap = new Map<string, string>();
		const accumulatedResults: AccumulatedFileResult[] = [];

		// Mutable handle — jobId and reportId are updated as WS events arrive so
		// callers reading these fields inside onComplete see the real IDs.
		const jobHandle: CleaningJob = {
			jobId: '',
			reportId: '',
			cancel() {
				cancelled = true;
				if (jobCompleted) {
					// Delay close to allow trailing report_ready message to arrive
					// (report creation involves a DB roundtrip which can take >500ms).
					setTimeout(() => ws?.close(), 3000);
				} else {
					ws?.close();
				}
			}
		};

		const execute = async () => {
			try {
				const rawFiles = files.map((f) => f.file);
				const uploadResponse = await api.uploadFiles(rawFiles);

				// Report any per-file validation errors from the server.
				if (uploadResponse.fileErrors && uploadResponse.fileErrors.length > 0) {
					for (const fe of uploadResponse.fileErrors) {
						callbacks.onError({
							code: fe.error,
							hexCode: '0x000',
							message: fe.message,
							phase: 'upload',
							timestamp: new Date().toISOString()
						});
					}
				}

				const fileIds = uploadResponse.files.map((f) => f.id);
				cleaningResultsStore.setUploadedFileIds(fileIds);
				const fileNames: Record<string, string> = {};

				for (const fileInfo of uploadResponse.files) {
					fileNameMap.set(fileInfo.id, fileInfo.name);
					fileNames[fileInfo.id] = fileInfo.name;
				}

				if (cancelled) return;

				const jobResponse = await api.createJob(fileIds, fileNames);
				jobHandle.jobId = jobResponse.jobId;

				if (cancelled) return;

				ws = api.connectJobProgress(jobHandle.jobId, authStore.accessToken);

				ws.onmessage = (event) => {
					const msg = JSON.parse(event.data as string) as Record<string, unknown>;
					if (cancelled) {
						// After job_complete + cancel, still capture a trailing report_ready
						// that may arrive within the 500ms WS close delay (defensive measure
						// for edge case where backend omits reportId from job_complete).
						if (jobCompleted && msg.type === 'report_ready') {
							const id = (msg.reportId as string) ?? '';
							if (id) {
								jobHandle.reportId = id;
								cleaningResultsStore.setReportId(id);
							}
						}
						return;
					}
					dispatchWsMessage(
						msg,
						callbacks,
						fileNameMap,
						accumulatedResults,
						jobHandle.jobId,
						(id) => {
							jobHandle.reportId = id;
							cleaningResultsStore.setReportId(id);
						},
						() => {
							jobCompleted = true;
						}
					);
				};

				// On WS error or unexpected close, fall back to polling instead of
				// immediately surfacing an error. The backend continues processing
				// even when the frontend loses the WebSocket connection.
				ws.onerror = () => {
					if (!cancelled && !jobCompleted) {
						void pollUntilComplete(
							jobHandle.jobId,
							callbacks,
							accumulatedResults,
							() => cancelled,
							() => jobCompleted,
							(id) => {
								jobHandle.reportId = id;
								cleaningResultsStore.setReportId(id);
							}
						);
					}
				};

				ws.onclose = (event) => {
					if (!cancelled && !jobCompleted && event.code !== 1000) {
						void pollUntilComplete(
							jobHandle.jobId,
							callbacks,
							accumulatedResults,
							() => cancelled,
							() => jobCompleted,
							(id) => {
								jobHandle.reportId = id;
								cleaningResultsStore.setReportId(id);
							}
						);
					}
				};
			} catch (err) {
				if (cancelled) return;

				if (err instanceof api.ApiHttpError) {
					callbacks.onError(mapApiHttpError(err));
				} else {
					callbacks.onError(makeNetworkError(err));
				}
			}
		};

		void execute();

		return jobHandle;
	}

	async downloadResults(jobId: string): Promise<Blob> {
		try {
			return await api.downloadJobZip(jobId);
		} catch (err) {
			if (err instanceof api.ApiHttpError) {
				if (err.status === 404) throw new Error('File not found or expired', { cause: err });
				if (err.status === 409) throw new Error('Job is still processing', { cause: err });
			}
			throw err;
		}
	}

	async getReports(): Promise<{ summary: ReportSummaryStats; reports: Report[] }> {
		const data = await api.getReports();
		return {
			summary: data.summary as ReportSummaryStats,
			reports: mapReportSummaries(data.reports as BackendReportSummary[])
		};
	}

	async getReportDetail(reportId: string): Promise<ReportDetail> {
		try {
			const data = (await api.getReportDetail(reportId)) as BackendReportDetail;
			return mapReportDetail(data);
		} catch (err) {
			if (err instanceof api.ApiHttpError && err.status === 404) {
				throw new Error('Report not found', { cause: err });
			}
			throw err;
		}
	}
}

export const apiCleaningService: CleaningService = new ApiCleaningService();
