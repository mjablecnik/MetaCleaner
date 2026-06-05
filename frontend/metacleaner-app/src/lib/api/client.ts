import { PUBLIC_API_URL } from '$env/static/public';

const BASE = PUBLIC_API_URL || 'http://localhost:8080';

export interface ApiFileRecord {
	id: string;
	name: string;
	size: number;
	extension: string;
	type: string;
	format: string;
}

export interface ApiJobResponse {
	jobId: string;
	status: string;
	totalFiles: number;
	createdAt: string;
}

export interface ApiReportSummary {
	id: string;
	reportId: string;
	date: string;
	time?: string;
	duration: string;
	fileCount: number;
	fileTypes: string;
	type: 'image' | 'video';
	gps: boolean;
	fields: number;
	tags: string[];
	iconColor: 'green' | 'blue' | 'orange';
}

export interface ApiReportsSummaryStats {
	totalReports: number;
	fieldsRemoved: number;
	filesProcessed: number;
	gpsRemoved: number;
}

export interface ApiReportsResponse {
	summary: ApiReportsSummaryStats;
	reports: ApiReportSummary[];
}

export interface ApiMetadataField {
	label: string;
	value: string;
}

export interface ApiMetadataDetail {
	gpsFields: ApiMetadataField[];
	exifFields: ApiMetadataField[];
	xmpFields: ApiMetadataField[];
	id3Fields?: ApiMetadataField[];
	mp4Atoms?: ApiMetadataField[];
	pngChunks?: ApiMetadataField[];
	totalRemoved: number;
}

export interface ApiReportFileDetail {
	name: string;
	extension: string;
	sizeMB: string;
	format: string;
	device: string;
	type: 'image' | 'video';
	iconColor: 'green' | 'blue' | 'orange';
	hasGps: boolean;
	fieldsRemoved: number;
	metadata: ApiMetadataDetail;
}

export interface ApiChartDataPoint {
	label: string;
	fields: number;
	percentage: number;
}

export interface ApiReportDetail {
	reportId: string;
	date: string;
	filesProcessed: number;
	fieldsRemoved: number;
	gpsLocationsRemoved: number;
	totalTimeSeconds: number;
	chartData: ApiChartDataPoint[];
	files: ApiReportFileDetail[];
}

export type WsEventType =
	| 'file_progress'
	| 'file_complete'
	| 'file_error'
	| 'job_progress'
	| 'job_complete';

export interface WsProgressEvent {
	type: WsEventType;
	fileId?: string;
	status?: string;
	progress?: number;
	fieldsRemoved?: number;
	gpsRemoved?: boolean;
	errorCode?: string;
	message?: string;
	overallProgress?: number;
	filesCompleted?: number;
	totalFiles?: number;
	timeRemainingSeconds?: number;
	currentFileId?: string;
	jobId?: string;
	reportId?: string;
	totalTimeSeconds?: number;
	gpsLocationsRemoved?: number;
}

export async function withRetry<T>(
	fn: () => Promise<T>,
	maxAttempts = 3,
	delayMs = 1000
): Promise<T> {
	let lastErr: unknown;
	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			return await fn();
		} catch (err) {
			lastErr = err;
			if (attempt < maxAttempts) {
				await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
			}
		}
	}
	throw lastErr;
}

export async function uploadFiles(files: File[]): Promise<ApiFileRecord[]> {
	const formData = new FormData();
	for (const file of files) {
		formData.append('files', file);
	}
	const response = await fetch(`${BASE}/api/upload`, {
		method: 'POST',
		body: formData
	});
	if (!response.ok) {
		const err = await response.json().catch(() => ({ message: 'Upload failed' }));
		throw new Error(err.message || `Upload failed: ${response.status}`);
	}
	const data = await response.json();
	return data.files as ApiFileRecord[];
}

export interface ApiJobStatusResponse {
	jobId: string;
	status: string;
	totalFiles: number;
	filesCompleted: number;
	fieldsRemoved: number;
	totalTimeSeconds?: number;
	createdAt: string;
	completedAt?: string;
}

export async function getJobStatus(jobId: string): Promise<ApiJobStatusResponse> {
	const response = await fetch(`${BASE}/api/jobs/${encodeURIComponent(jobId)}`);
	if (!response.ok) {
		throw new Error(`Failed to get job status: ${response.status}`);
	}
	return response.json();
}

export async function createJob(fileIds: string[]): Promise<ApiJobResponse> {
	const response = await fetch(`${BASE}/api/jobs`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ fileIds })
	});
	if (!response.ok) {
		const err = await response.json().catch(() => ({ message: 'Job creation failed' }));
		throw new Error(err.message || `Job creation failed: ${response.status}`);
	}
	return response.json();
}

export function connectJobProgress(
	jobId: string,
	onEvent: (event: WsProgressEvent) => void,
	onClose?: () => void,
	onError?: (error: Event) => void
): WebSocket {
	const wsBase = BASE.replace(/^https/, 'wss').replace(/^http/, 'ws');
	const ws = new WebSocket(`${wsBase}/api/jobs/${jobId}/progress`);
	ws.onmessage = (event) => {
		try {
			const data = JSON.parse(event.data) as WsProgressEvent;
			onEvent(data);
		} catch {
			// ignore malformed messages
		}
	};
	ws.onclose = () => onClose?.();
	ws.onerror = (err) => onError?.(err);
	return ws;
}

export class FileExpiredError extends Error {
	constructor() {
		super('FILE_EXPIRED');
		this.name = 'FileExpiredError';
	}
}

export async function downloadFile(fileId: string): Promise<{ blob: Blob; filename: string }> {
	const response = await fetch(`${BASE}/api/files/${fileId}/download`);
	if (!response.ok) {
		if (response.status === 404) throw new FileExpiredError();
		throw new Error(`Download failed: ${response.status}`);
	}
	const disposition = response.headers.get('Content-Disposition') ?? '';
	const match = disposition.match(/filename="?([^"]+)"?/);
	const filename = match?.[1] ?? `cleaned_${fileId}`;
	const blob = await response.blob();
	return { blob, filename };
}

export async function getReports(): Promise<ApiReportsResponse> {
	const response = await fetch(`${BASE}/api/reports`);
	if (!response.ok) {
		throw new Error(`Failed to fetch reports: ${response.status}`);
	}
	return response.json();
}

export async function getReportDetail(id: string): Promise<ApiReportDetail> {
	const response = await fetch(`${BASE}/api/reports/${encodeURIComponent(id)}`);
	if (!response.ok) {
		throw new Error(`Failed to fetch report: ${response.status}`);
	}
	return response.json();
}

export function getReportPdfUrl(id: string): string {
	return `${BASE}/api/reports/${encodeURIComponent(id)}/pdf`;
}
