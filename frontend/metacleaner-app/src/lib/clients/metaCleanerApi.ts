import { PUBLIC_API_URL } from '$env/static/public';

// ─── URL Builders ───────────────────────────────────────────────

const API_BASE_URL: string = PUBLIC_API_URL;

export function buildApiUrl(path: string): string {
	return `${API_BASE_URL}${path}`;
}

export function buildWsUrl(path: string): string {
	const wsProtocol = API_BASE_URL.startsWith('https://') ? 'wss://' : 'ws://';
	const host = API_BASE_URL.replace(/^https?:\/\//, '');
	return `${wsProtocol}${host}${path}`;
}

// ─── Response Types ─────────────────────────────────────────────

export interface UploadedFileInfo {
	id: string;
	name: string;
	size: number;
	extension: string;
	type: string;
	format: string;
}

export interface UploadResponse {
	files: UploadedFileInfo[];
}

export interface CreateJobResponse {
	jobId: string;
	status: string;
	totalFiles: number;
	createdAt: string;
}

export interface JobStatusResponse {
	jobId: string;
	status: string;
	totalFiles: number;
	filesCompleted: number;
	fieldsRemoved: number;
	gpsLocationsRemoved: number;
	totalTimeSeconds: number;
	createdAt: string;
	completedAt?: string;
}

export interface ApiErrorResponse {
	error: string;
	message: string;
	timestamp: string;
}

export interface HealthResponse {
	status: string;
	exiftool: boolean;
	ffmpeg: boolean;
	database: boolean;
	diskSpace: { available: string; total: string };
}

// ─── Error class for HTTP failures ─────────────────────────────

export class ApiHttpError extends Error {
	constructor(
		public readonly status: number,
		public readonly errorCode: string,
		public readonly errorMessage: string,
		public readonly timestamp: string
	) {
		super(errorMessage);
		this.name = 'ApiHttpError';
	}
}

// ─── Helper: parse error response ──────────────────────────────

async function parseErrorResponse(res: Response): Promise<ApiHttpError> {
	try {
		const body: ApiErrorResponse = await res.json();
		return new ApiHttpError(res.status, body.error, body.message, body.timestamp);
	} catch {
		return new ApiHttpError(
			res.status,
			'UNKNOWN_ERROR',
			`Request failed with status ${res.status}`,
			new Date().toISOString()
		);
	}
}

// ─── Endpoint Methods ───────────────────────────────────────────

export async function uploadFiles(files: File[]): Promise<UploadResponse> {
	const formData = new FormData();
	for (const file of files) {
		formData.append('files', file, file.name);
	}

	const res = await fetch(buildApiUrl('/api/upload'), {
		method: 'POST',
		body: formData
	});

	if (!res.ok) throw await parseErrorResponse(res);
	return res.json();
}

export async function createJob(fileIds: string[]): Promise<CreateJobResponse> {
	const res = await fetch(buildApiUrl('/api/jobs'), {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ fileIds })
	});

	if (!res.ok) throw await parseErrorResponse(res);
	return res.json();
}

export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
	const res = await fetch(buildApiUrl(`/api/jobs/${jobId}`));
	if (!res.ok) throw await parseErrorResponse(res);
	return res.json();
}

export function connectJobProgress(jobId: string): WebSocket {
	const url = buildWsUrl(`/api/jobs/${jobId}/progress`);
	return new WebSocket(url);
}

export async function downloadFile(fileId: string): Promise<Blob> {
	const res = await fetch(buildApiUrl(`/api/files/${fileId}/download`));
	if (!res.ok) throw await parseErrorResponse(res);
	return res.blob();
}

export async function downloadJobZip(jobId: string): Promise<Blob> {
	const res = await fetch(buildApiUrl(`/api/jobs/${jobId}/download`));
	if (!res.ok) throw await parseErrorResponse(res);
	return res.blob();
}

export async function getReports(): Promise<{
	summary: { totalReports: number; fieldsRemoved: number; filesProcessed: number; gpsRemoved: number };
	reports: unknown[];
}> {
	const res = await fetch(buildApiUrl('/api/reports'));
	if (!res.ok) throw await parseErrorResponse(res);
	return res.json();
}

export async function getReportDetail(reportId: string): Promise<unknown> {
	const res = await fetch(buildApiUrl(`/api/reports/${reportId}`));
	if (!res.ok) throw await parseErrorResponse(res);
	return res.json();
}

export async function getReportPdf(reportId: string): Promise<string> {
	const res = await fetch(buildApiUrl(`/api/reports/${reportId}/pdf`), {
		redirect: 'manual'
	});

	if (res.status === 302) {
		return res.headers.get('Location') ?? '';
	}
	if (!res.ok) throw await parseErrorResponse(res);
	return '';
}

export async function healthCheck(): Promise<HealthResponse> {
	const res = await fetch(buildApiUrl('/api/health'));
	if (!res.ok) throw await parseErrorResponse(res);
	return res.json();
}
