import { buildApiUrl, buildWsUrl } from './api-config.js';
import { apiFetch } from '$lib/auth/api-client.js';

// Re-export URL builders so existing callers don't need to change their imports.
export { buildApiUrl, buildWsUrl };

// ─── Response Types ─────────────────────────────────────────────

export interface UploadedFileInfo {
	id: string;
	name: string;
	size: number;
	extension: string;
	type: string;
	format: string;
}

export interface UploadedFileError {
	name: string;
	error: string;
	message: string;
}

export interface UploadResponse {
	files: UploadedFileInfo[];
	fileErrors?: UploadedFileError[];
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
	totalTimeMs: number;
	createdAt: string;
	completedAt?: string;
	reportId?: string;
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

	const res = await apiFetch('/api/upload', { method: 'POST', body: formData });

	if (!res.ok) throw await parseErrorResponse(res);
	return res.json();
}

export async function createJob(
	fileIds: string[],
	fileNames?: Record<string, string>
): Promise<CreateJobResponse> {
	const res = await apiFetch('/api/jobs', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ fileIds, ...(fileNames ? { fileNames } : {}) })
	});

	if (!res.ok) throw await parseErrorResponse(res);
	return res.json();
}

export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
	const res = await apiFetch(`/api/jobs/${jobId}`);
	if (!res.ok) throw await parseErrorResponse(res);
	return res.json();
}

export function connectJobProgress(jobId: string, token: string | null): WebSocket {
	const tokenParam = token ? `?token=${encodeURIComponent(token)}` : '';
	const url = buildWsUrl(`/api/jobs/${jobId}/progress${tokenParam}`);
	return new WebSocket(url);
}

export async function downloadFile(fileId: string): Promise<Blob> {
	const res = await apiFetch(`/api/files/${fileId}/download`);
	if (!res.ok) throw await parseErrorResponse(res);
	return res.blob();
}

export async function downloadJobZip(jobId: string): Promise<Blob> {
	const res = await apiFetch(`/api/jobs/${jobId}/download`);
	if (!res.ok) throw await parseErrorResponse(res);
	return res.blob();
}

export async function getReports(): Promise<{
	summary: {
		totalReports: number;
		fieldsRemoved: number;
		filesProcessed: number;
		gpsRemoved: number;
	};
	reports: unknown[];
}> {
	const res = await apiFetch('/api/reports');
	if (!res.ok) throw await parseErrorResponse(res);
	return res.json();
}

export async function getReportDetail(reportId: string): Promise<unknown> {
	const res = await apiFetch(`/api/reports/${reportId}`);
	if (!res.ok) throw await parseErrorResponse(res);
	return res.json();
}

export async function getReportPdf(reportId: string): Promise<string> {
	const res = await apiFetch(`/api/reports/${reportId}/pdf`);
	if (!res.ok) throw await parseErrorResponse(res);
	const data: { url: string } = await res.json();
	return data.url;
}

export async function healthCheck(): Promise<HealthResponse> {
	const res = await fetch(buildApiUrl('/api/health'));
	if (!res.ok) throw await parseErrorResponse(res);
	return res.json();
}

// ─── Billing Types ──────────────────────────────────────────────

export interface SubscriptionResponse {
	plan_id: string;
	status: string;
	billing_period?: string;
	current_period_end?: string;
	subscription_credits: number;
	purchased_credits: number;
	total_credits: number;
	scheduled_plan_id?: string;
	scheduled_billing_period?: string;
	scheduled_change_date?: string;
}

export interface CreditTransaction {
	id: string;
	amount: number;
	type: string;
	credit_source: string;
	reference_id?: string;
	description?: string;
	created_at: string;
}

export interface CreditsResponse {
	subscription_credits: number;
	purchased_credits: number;
	total_credits: number;
	transactions: CreditTransaction[];
}

// ─── Billing Endpoints ──────────────────────────────────────────

export async function getSubscription(): Promise<SubscriptionResponse> {
	const res = await apiFetch('/api/billing/subscription');
	if (!res.ok) throw await parseErrorResponse(res);
	return res.json();
}

export async function getCredits(): Promise<CreditsResponse> {
	const res = await apiFetch('/api/billing/credits');
	if (!res.ok) throw await parseErrorResponse(res);
	return res.json();
}
