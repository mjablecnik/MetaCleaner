# Design Document

## Overview

This design replaces the mock data layer in the MetaCleaner frontend with a real HTTP + WebSocket integration against the Go backend. The architecture uses a **two-layer separation**:

1. **API Client** (`src/lib/clients/metaCleanerApi.ts`) — Thin HTTP + WebSocket client responsible for URL construction, raw fetch calls, response parsing, and low-level error mapping. Purely I/O, no business logic.
2. **Service Layer** (`src/lib/services/apiCleaningService.ts`) — Orchestration layer implementing the `CleaningService` interface. Delegates all network calls to the API client and handles the upload → job → WebSocket orchestration flow, mapping WebSocket events to `CleaningCallbacks`, backend types to frontend types, and constructing `ProcessingResults` from accumulated WebSocket events.

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  SvelteKit Frontend                                             │
│                                                                 │
│  ┌───────────────┐    ┌──────────────────────────────────────┐  │
│  │ Page Components│───▶│  ApiCleaningService (services/)      │  │
│  │ (Step3, Step5, │    │  implements CleaningService           │  │
│  │  Reports, etc.)│    │                                      │  │
│  └───────────────┘    │  • Orchestrates upload → job → WS    │  │
│                        │  • Maps WS events → callbacks        │  │
│  ┌───────────────┐    │  • Maps backend types → frontend     │  │
│  │ Scanner Module │◀───│  • Accumulates file events for       │  │
│  │ (client-side)  │    │    ProcessingResults construction    │  │
│  └───────────────┘    └──────────────┬───────────────────────┘  │
│                                       │ delegates                 │
│                                       ▼                          │
│                        ┌──────────────────────────────────────┐  │
│                        │  metaCleanerApi (clients/)            │  │
│                        │  • buildApiUrl / buildWsUrl           │  │
│                        │  • uploadFiles()                      │  │
│                        │  • createJob()                        │  │
│                        │  • getJobStatus()                     │  │
│                        │  • connectJobProgress() → WebSocket   │  │
│                        │  • downloadFile()                     │  │
│                        │  • downloadJobZip()                   │  │
│                        │  • getReports()                       │  │
│                        │  • getReportDetail()                  │  │
│                        │  • getReportPdf()                     │  │
│                        │  • healthCheck()                      │  │
│                        └──────────────┬───────────────────────┘  │
└───────────────────────────────────────┼──────────────────────────┘
                                        │ HTTP (fetch) + WebSocket
                                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  Go Backend (PUBLIC_API_URL)                                     │
│  POST /api/upload, POST /api/jobs, GET /api/jobs/{id},          │
│  GET /api/jobs/{id}/download, GET /api/files/{id}/download,     │
│  GET /api/reports, GET /api/reports/{id},                       │
│  GET /api/reports/{id}/pdf, WS /api/jobs/{id}/progress,         │
│  GET /api/health                                                │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow — startCleaning Sequence

```
1. ApiCleaningService.startCleaning(files, options, callbacks)
2. Calls metaCleanerApi.uploadFiles(files) → FormData POST
3. Backend returns file IDs + names → service builds fileId→fileName map
4. Calls metaCleanerApi.createJob(fileIds) → JSON POST
5. Backend returns jobId
6. Calls metaCleanerApi.connectJobProgress(jobId) → WebSocket
7. ApiCleaningService listens to WS messages and dispatches:
   - file_progress  → resolve fileName from map → callbacks.onFileStart + callbacks.onProgress (progress embedded)
   - file_complete  → accumulate result → callbacks.onFileComplete + callbacks.onProgress (progress embedded)
   - file_error     → callbacks.onError
   - job_complete   → construct ProcessingResults from accumulated events → callbacks.onComplete
   - report_ready   → store reportId silently
8. On cancel() → WebSocket.close()
```

## Components and Interfaces

### 1. API Client Module

**File:** `src/lib/clients/metaCleanerApi.ts`

A thin HTTP + WebSocket client containing URL builders and typed methods for each endpoint. Purely I/O — no business logic.

```typescript
import { PUBLIC_API_URL } from '$env/static/public';

// ─── URL Builders ───────────────────────────────────────────────

/** Base URL for all API requests, read from environment at build time */
const API_BASE_URL: string = PUBLIC_API_URL;

/** Construct a full REST API URL from an endpoint path */
export function buildApiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

/** Construct a WebSocket URL from an endpoint path, deriving protocol from API_BASE_URL */
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
  totalTimeMs: number;
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

/**
 * Upload files for cleaning.
 * Sends multipart/form-data with field name "files".
 */
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

/**
 * Create a cleaning job for the given file IDs.
 */
export async function createJob(fileIds: string[]): Promise<CreateJobResponse> {
  const res = await fetch(buildApiUrl('/api/jobs'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileIds })
  });

  if (!res.ok) throw await parseErrorResponse(res);
  return res.json();
}

/**
 * Get current job status.
 */
export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  const res = await fetch(buildApiUrl(`/api/jobs/${jobId}`));
  if (!res.ok) throw await parseErrorResponse(res);
  return res.json();
}

/**
 * Open a WebSocket connection for real-time job progress.
 * Returns the raw WebSocket instance — caller is responsible for event handling.
 */
export function connectJobProgress(jobId: string): WebSocket {
  const url = buildWsUrl(`/api/jobs/${jobId}/progress`);
  return new WebSocket(url);
}

/**
 * Download a cleaned file by its file ID.
 * Returns the response as a Blob.
 */
export async function downloadFile(fileId: string): Promise<Blob> {
  const res = await fetch(buildApiUrl(`/api/files/${fileId}/download`));
  if (!res.ok) throw await parseErrorResponse(res);
  return res.blob();
}

/**
 * Download all cleaned files for a job as a ZIP archive.
 * Returns the response as a Blob.
 */
export async function downloadJobZip(jobId: string): Promise<Blob> {
  const res = await fetch(buildApiUrl(`/api/jobs/${jobId}/download`));
  if (!res.ok) throw await parseErrorResponse(res);
  return res.blob();
}

/**
 * Get all reports with summary stats.
 */
export async function getReports(): Promise<{
  summary: { totalReports: number; fieldsRemoved: number; filesProcessed: number; gpsRemoved: number };
  reports: unknown[];
}> {
  const res = await fetch(buildApiUrl('/api/reports'));
  if (!res.ok) throw await parseErrorResponse(res);
  return res.json();
}

/**
 * Get full report detail by ID.
 */
export async function getReportDetail(reportId: string): Promise<unknown> {
  const res = await fetch(buildApiUrl(`/api/reports/${reportId}`));
  if (!res.ok) throw await parseErrorResponse(res);
  return res.json();
}

/**
 * Get PDF redirect URL for a report.
 * Returns the redirect URL (302 target).
 */
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

/**
 * Health check — verify backend is reachable.
 */
export async function healthCheck(): Promise<HealthResponse> {
  const res = await fetch(buildApiUrl('/api/health'));
  if (!res.ok) throw await parseErrorResponse(res);
  return res.json();
}
```

### 2. ApiCleaningService — Orchestration Layer

**File:** `src/lib/services/apiCleaningService.ts`

Implements the `CleaningService` interface. Delegates all network I/O to the API client and handles orchestration logic: upload → job → WebSocket flow, event dispatching, type mapping, and result construction from accumulated events.

```typescript
import type {
  CleaningService,
  CleaningOptions,
  AnalysisResult,
  CleaningJob,
  CleaningCallbacks,
  CleaningError
} from './cleaningService.js';
import type { QueuedFile } from '$lib/scanner/types.js';
import type { ProcessingResults, FileMetadataResult, MetadataBreakdown } from '$lib/types/processing.js';
import type { Report, ReportDetail, ReportSummaryStats, ReportFileDetail } from '$lib/types/report.js';
import * as api from '$lib/clients/metaCleanerApi.js';

/** Accumulated per-file data during WebSocket progress */
interface AccumulatedFileResult {
  fileId: string;
  fieldsRemoved: number;
  gpsRemoved: boolean;
}

class ApiCleaningService implements CleaningService {
  async analyzeFiles(files: QueuedFile[]): Promise<AnalysisResult> {
    // Client-side only — aggregate existing scan results, no HTTP calls
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
    let jobId = '';

    // Accumulated state for constructing ProcessingResults
    const fileNameMap = new Map<string, string>();
    const accumulatedResults: AccumulatedFileResult[] = [];

    const execute = async () => {
      try {
        // Step 1: Upload files via API client
        const rawFiles = files.map((f) => f.file);
        const uploadResponse = await api.uploadFiles(rawFiles);
        const fileIds = uploadResponse.files.map((f) => f.id);

        // Build fileId → fileName map from upload response (Req 11.1)
        for (const fileInfo of uploadResponse.files) {
          fileNameMap.set(fileInfo.id, fileInfo.name);
        }

        if (cancelled) return;

        // Step 2: Create job via API client
        const jobResponse = await api.createJob(fileIds);
        jobId = jobResponse.jobId;

        if (cancelled) return;

        // Step 3: Connect WebSocket for progress via API client
        ws = api.connectJobProgress(jobId);

        ws.onmessage = (event) => {
          if (cancelled) return;
          const msg = JSON.parse(event.data);
          dispatchWsMessage(msg, callbacks, fileNameMap, accumulatedResults, jobId);
        };

        ws.onerror = () => {
          if (!cancelled) {
            callbacks.onError(makeConnectionError());
          }
        };

        ws.onclose = (event) => {
          if (!cancelled && event.code !== 1000) {
            callbacks.onError(makeConnectionError());
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

    return {
      jobId: '',
      cancel() {
        cancelled = true;
        ws?.close();
      }
    };
  }

  async downloadResults(jobId: string): Promise<Blob> {
    try {
      return await api.downloadJobZip(jobId);
    } catch (err) {
      if (err instanceof api.ApiHttpError) {
        if (err.status === 404) throw new Error('File not found or expired');
        if (err.status === 409) throw new Error('Job is still processing');
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
        throw new Error('Report not found');
      }
      throw err;
    }
  }
}

export const apiCleaningService: CleaningService = new ApiCleaningService();
```

### 3. Backend-to-Frontend Type Mapping (Req 9)

The service layer contains mapping functions that transform backend response shapes into the frontend type contracts. The backend does not return computed UI fields (`iconColor`, `barWidthPercent`, gradients, `time`), so these are derived in the service layer.

#### Backend Response Types (as received from API)

```typescript
/** Backend ReportSummary shape — matches Go ReportSummary struct */
interface BackendReportSummary {
  id: string;
  reportId: string;
  date: string;         // ISO date or "YYYY-MM-DD" — may contain time portion
  duration: string;
  fileCount: number;
  fileTypes: string;
  type: string;         // "image" | "video"
  gps: boolean;
  fields: number;
  tags: string[];
}

/** Backend ReportFileDetail — matches Go ReportFileDetail struct */
interface BackendReportFileDetail {
  name: string;
  extension: string;
  sizeMB: string;
  format: string;
  device: string;
  type: string;         // "image" | "video"
  hasGps: boolean;
  fieldsRemoved: number;
  metadata: BackendMetadataDetail | null;
}

/** Backend MetadataDetail — matches Go MetadataDetail struct */
interface BackendMetadataDetail {
  gpsFields: { label: string; value: string }[];
  exifFields: { label: string; value: string }[];
  xmpFields: { label: string; value: string }[];
  id3Fields?: { label: string; value: string }[];
  mp4Atoms?: { label: string; value: string }[];
  pngChunks?: { label: string; value: string }[];
  totalRemoved: number;
}

/** Backend ReportDetail — matches Go ReportDetail struct */
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
```

#### Mapping Functions

```typescript
// ─── Report Summary Mapping (Req 9.1–9.3) ──────────────────────

function mapReportSummaries(backendReports: BackendReportSummary[]): Report[] {
  return backendReports.map(mapSingleReport);
}

function mapSingleReport(r: BackendReportSummary): Report {
  return {
    id: r.id,
    date: extractDate(r.date),
    time: extractTime(r.date),                         // Req 9.1
    duration: r.duration,
    fileCount: r.fileCount,
    fileTypes: r.fileTypes,
    type: r.type as 'image' | 'video',
    gps: r.gps,
    fields: r.fields,
    fieldsColor: 'white',                              // Req 9.3
    tags: r.tags ?? [],
    reportId: r.reportId,
    iconColor: computeIconColor(r.type)                // Req 9.2
  };
}

/** Extract date portion from ISO string or date field */
function extractDate(dateStr: string): string {
  // If ISO format "2024-01-15T10:30:00Z", return "2024-01-15"
  if (dateStr.includes('T')) return dateStr.split('T')[0];
  return dateStr;
}

/** Extract time portion from ISO string, or return empty string */
function extractTime(dateStr: string): string {
  if (!dateStr.includes('T')) return '';
  const timePart = dateStr.split('T')[1];
  if (!timePart) return '';
  // Remove 'Z' suffix and seconds for display: "10:30"
  return timePart.replace('Z', '').substring(0, 5);
}

/** Compute iconColor from file type (Req 9.2, 9.5) */
function computeIconColor(type: string): 'green' | 'orange' {
  return type === 'image' ? 'green' : 'orange';
}

// ─── Report File Detail Mapping (Req 9.4–9.6, 9.8) ─────────────

function mapReportFileDetails(files: BackendReportFileDetail[]): ReportFileDetail[] {
  const totalFieldsRemoved = files.reduce((sum, f) => sum + f.fieldsRemoved, 0);

  return files.map((f) => ({
    name: f.name,
    extension: f.extension,
    sizeMB: f.sizeMB,
    format: f.format,
    device: f.device,
    type: f.type as 'image' | 'video',
    iconColor: computeIconColor(f.type),               // Req 9.5
    hasGps: f.hasGps,
    fieldsRemoved: f.fieldsRemoved,
    barWidthPercent: computeBarWidth(f.fieldsRemoved, totalFieldsRemoved),  // Req 9.4
    barGradientFrom: getGradientFrom(f.type),          // Req 9.6
    barGradientTo: getGradientTo(f.type),              // Req 9.6
    metadata: mapMetadataDetail(f.metadata)            // Req 9.8
  }));
}

/** Compute bar width as percentage of file's fieldsRemoved relative to total (Req 9.4) */
function computeBarWidth(fileFieldsRemoved: number, totalFieldsRemoved: number): number {
  if (totalFieldsRemoved === 0) return 0;
  return Math.round((fileFieldsRemoved / totalFieldsRemoved) * 100);
}

/** Gradient start color based on file type (Req 9.6) */
function getGradientFrom(type: string): string {
  return type === 'image' ? '#22c55e' : '#f97316';  // green-500 / orange-500
}

/** Gradient end color based on file type (Req 9.6) */
function getGradientTo(type: string): string {
  return type === 'image' ? '#16a34a' : '#ea580c';  // green-600 / orange-600
}

/** Map backend MetadataDetail to frontend FileMetadataSection (Req 9.8) */
function mapMetadataDetail(md: BackendMetadataDetail | null): import('$lib/types/report.js').FileMetadataSection {
  if (!md) {
    return { gpsFields: [], exifFields: [], xmpFields: [], totalRemoved: 0 };
  }

  return {
    gpsFields: md.gpsFields.map((f) => ({ label: f.label, value: f.value, moreCount: undefined })),
    exifFields: md.exifFields.map((f) => ({ label: f.label, value: f.value, moreCount: undefined })),
    xmpFields: md.xmpFields.map((f) => ({ label: f.label, value: f.value, moreCount: undefined })),
    totalRemoved: md.totalRemoved
  };
}

// ─── Report Detail Mapping ──────────────────────────────────────

function mapReportDetail(data: BackendReportDetail): ReportDetail {
  return {
    reportId: data.reportId,
    date: data.date,
    filesProcessed: data.filesProcessed,
    fieldsRemoved: data.fieldsRemoved,
    gpsLocationsRemoved: data.gpsLocationsRemoved,
    totalTimeMs: data.totalTimeMs,
    chartData: data.chartData,
    files: mapReportFileDetails(data.files)
  };
}
```

### 4. WebSocket Message Dispatcher with fileName Resolution (Req 4, 11)

The dispatcher resolves `fileName` from the local `fileNameMap` (built from the upload response) and accumulates per-file results for constructing `ProcessingResults` on `job_complete`.

**IMPORTANT:** The backend does NOT emit a separate `job_progress` message type. Instead, progress data (`overallProgress`, `filesCompleted`, `totalFiles`) is embedded within each `file_progress` and `file_complete` event. The dispatcher extracts progress from these events and calls `onProgress` accordingly.

```typescript
function dispatchWsMessage(
  msg: Record<string, unknown>,
  callbacks: CleaningCallbacks,
  fileNameMap: Map<string, string>,
  accumulatedResults: AccumulatedFileResult[],
  jobId: string
): void {
  switch (msg.type) {
    case 'file_progress': {
      const fileId = msg.fileId as string;
      // Resolve fileName from local map (Req 11.2)
      const fileName = fileNameMap.get(fileId) ?? fileId;
      callbacks.onFileStart(fileId, fileName);

      // Progress data is embedded in file_progress events (Req 4.5)
      // Note: fieldsRemoved is NOT present in file_progress — only in file_complete
      // Note: timeRemainingSeconds is NOT computed by backend — always 0
      callbacks.onProgress(
        (msg.overallProgress as number) ?? 0,
        (msg.filesCompleted as number) ?? 0,
        (msg.totalFiles as number) ?? 0,
        0, // fieldsRemoved not available in file_progress
        0  // timeRemainingSeconds not computed by backend
      );
      break;
    }

    case 'file_complete': {
      const fileId = msg.fileId as string;
      const fieldsRemoved = msg.fieldsRemoved as number;
      const gpsRemoved = (msg.gpsRemoved as boolean) ?? false;

      // Accumulate for ProcessingResults construction (Req 11.3)
      accumulatedResults.push({ fileId, fieldsRemoved, gpsRemoved });

      callbacks.onFileComplete(fileId, fieldsRemoved, gpsRemoved);

      // Progress data is also embedded in file_complete events (Req 4.5)
      callbacks.onProgress(
        (msg.overallProgress as number) ?? 0,
        (msg.filesCompleted as number) ?? 0,
        (msg.totalFiles as number) ?? 0,
        fieldsRemoved,
        0  // timeRemainingSeconds not computed by backend
      );
      break;
    }

    case 'file_error':
      callbacks.onError({
        code: msg.errorCode as string,
        hexCode: msg.errorCode as string,
        message: msg.message as string,
        fileId: msg.fileId as string,
        fileName: fileNameMap.get(msg.fileId as string) ?? undefined,
        phase: 'cleaning',
        timestamp: new Date().toISOString()
      });
      break;

    case 'job_complete':
      callbacks.onComplete(
        buildProcessingResults(msg, accumulatedResults, jobId)
      );
      break;

    case 'report_ready':
      // Store reportId for later use — no error callback (Req 4.10)
      break;

    default:
      // Unknown message types are silently ignored
      break;
  }
}
```

### 5. ProcessingResults Construction from Accumulated Events (Req 11.3, 11.5)

Since `job_complete` does not include a `fileResults` array, the service constructs `ProcessingResults` from accumulated `file_complete` events received during the job.

```typescript
function buildProcessingResults(
  msg: Record<string, unknown>,
  accumulatedResults: AccumulatedFileResult[],
  _jobId: string
): ProcessingResults {
  const filesProcessed = (msg.filesProcessed as number) ?? accumulatedResults.length;
  const fieldsRemoved = msg.fieldsRemoved as number;
  const gpsLocationsRemoved = (msg.gpsLocationsRemoved as number) ?? 0;
  const totalTimeMs = (msg.totalTimeMs as number) ?? 0;

  // Construct fileResults from accumulated file_complete events (Req 11.3)
  const fileResults: FileMetadataResult[] = accumulatedResults.map((r) => ({
    fileId: r.fileId,
    gpsRemoved: r.gpsRemoved,
    exifCount: 0,       // Not available from WS events — fine-grained breakdown
    xmpCount: 0,        // comes from report detail if needed
    id3Count: 0,
    mp4AtomsCount: 0,
    pngChunksCount: 0,
    totalFields: r.fieldsRemoved
  }));

  // Derive beforeBreakdown from accumulated data (Req 11.5)
  // GPS count = number of files with GPS removed
  const gpsLocations = accumulatedResults.filter((r) => r.gpsRemoved).length;
  const remainingFields = Math.max(0, fieldsRemoved - gpsLocations);

  const beforeBreakdown: MetadataBreakdown = {
    gpsLocations,
    exifFields: remainingFields,  // Approximate — detailed breakdown from report
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
```

**Fallback strategy (Req 11.4):** If no `file_complete` events were accumulated (e.g., WebSocket reconnection scenario), the service can poll `GET /api/jobs/{jobId}` after completion to obtain final per-file data. This is a defensive fallback — in normal operation, all `file_complete` events are received before `job_complete`.

### 6. Per-File Download (Req 10)

The `downloadFile` method in the API client accepts a **file ID** and downloads the individual cleaned file. The backend serves cleaned files at `GET /api/files/{fileId}/download` with `Content-Disposition: attachment` header.

```typescript
async function downloadFile(fileId: string): Promise<Blob> {
  const res = await fetch(buildApiUrl(`/api/files/${fileId}/download`));
  if (!res.ok) throw await parseErrorResponse(res);
  return res.blob();
}
```

Per-file download (`api.downloadFile(fileId)`) remains available in the client for individual file access if needed by other UI flows.

### 7. Error Mapping Helpers

Within `apiCleaningService.ts`:

```typescript
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
```

### 8. Batch ZIP Download Endpoint (Req 13)

**Backend (Go) — new handler in `source/handlers.go`:**

A new route `GET /api/jobs/{id}/download` is registered in `router.go` (using `{id}` path parameter consistent with existing route conventions). The handler `HandleJobDownload(cfg, db)` performs the following:

1. Looks up the job by ID from the database
2. Returns 404 with `JOB_NOT_FOUND` if job not found
3. Returns 409 with `JOB_NOT_READY` if job status != `"completed"`
4. Fetches file records for the job, filtering to only files with status `"done"` (skips errored files)
5. For each done file, looks for the cleaned file on disk. Files with missing cleaned files are silently skipped.
6. Returns 404 with `FILES_EXPIRED` only if NO cleaned files remain on disk at all
7. Creates a ZIP archive using Go's `archive/zip` package, streaming directly to the response writer
8. Sets headers: `Content-Type: application/zip`, `Content-Disposition: attachment; filename="metacleaner-{jobId}.zip"`
9. Each file in the ZIP uses the cleaned filename (IMG_/VID_ prefix format from `buildCleanedFileName`)

```go
// HandleJobDownload handles GET /api/jobs/{id}/download — serves all cleaned files as a ZIP.
func HandleJobDownload(cfg Config, db *SupabaseClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		jobID := r.PathValue("id")
		if jobID == "" {
			WriteError(w, http.StatusBadRequest, ErrInvalidRequest, "Missing job ID")
			return
		}

		job, err := db.GetJob(r.Context(), jobID)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "Failed to fetch job")
			return
		}
		if job == nil {
			WriteError(w, http.StatusNotFound, ErrJobNotFound, "Job not found")
			return
		}
		if job.Status != "completed" {
			WriteError(w, http.StatusConflict, ErrJobNotReady, "Job is still processing")
			return
		}

		// Get file records for this job
		files, err := db.GetFileRecords(r.Context(), jobID)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "Failed to fetch file records")
			return
		}

		cleanedDir := filepath.Join(cfg.TempStoragePath, "cleaned")

		// Collect cleaned files that exist on disk (skip errored/missing files)
		type zipEntry struct {
			path     string
			fileName string
		}
		entries := make([]zipEntry, 0, len(files))

		for _, f := range files {
			// Skip files that didn't complete successfully
			if f.Status != "done" {
				continue
			}
			// LocalID is NOT persisted to DB — derive from FileName by stripping extension
			localID := strings.TrimSuffix(f.FileName, f.FileExtension)
			matches, _ := filepath.Glob(filepath.Join(cleanedDir, localID+"_cleaned.*"))
			if len(matches) == 0 {
				continue // Cleaned file expired or missing — skip silently
			}
			cleanedPath := matches[0]
			ext := strings.TrimPrefix(filepath.Ext(cleanedPath), ".")
			downloadName := buildCleanedFileName(localID, ext, nil)
			entries = append(entries, zipEntry{path: cleanedPath, fileName: downloadName})
		}

		// If no cleaned files at all, return expired error
		if len(entries) == 0 {
			WriteError(w, http.StatusNotFound, ErrFilesExpired, "Cleaned files have expired")
			return
		}

		// Stream ZIP directly to response
		w.Header().Set("Content-Type", "application/zip")
		w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="metacleaner-%s.zip"`, jobID))

		zipWriter := zip.NewWriter(w)
		defer zipWriter.Close()

		for _, entry := range entries {
			file, err := os.Open(entry.path)
			if err != nil {
				continue // Skip unreadable files
			}

			writer, err := zipWriter.Create(entry.fileName)
			if err != nil {
				file.Close()
				continue
			}

			io.Copy(writer, file)
			file.Close()
		}
	}
}
```

**Frontend API Client (`metaCleanerApi.ts`) — new method:**

```typescript
export async function downloadJobZip(jobId: string): Promise<Blob> {
  const res = await fetch(buildApiUrl(`/api/jobs/${jobId}/download`));
  if (!res.ok) throw await parseErrorResponse(res);
  return res.blob();
}
```

**Service Layer (`apiCleaningService.ts`) — updated `downloadResults`:**

- `downloadResults(jobId)` now calls `api.downloadJobZip(jobId)` by default (returns the ZIP Blob)
- This aligns with the original interface signature where the parameter is named `jobId`
- Per-file download (`api.downloadFile(fileId)`) remains available in the client for individual file access if needed by other UI flows

```typescript
async downloadResults(jobId: string): Promise<Blob> {
  try {
    return await api.downloadJobZip(jobId);
  } catch (err) {
    if (err instanceof api.ApiHttpError) {
      if (err.status === 404) throw new Error('File not found or expired');
      if (err.status === 409) throw new Error('Job is still processing');
    }
    throw err;
  }
}
```

### Interfaces

#### Existing Interface (unchanged)

The `CleaningService` interface in `src/lib/services/cleaningService.ts` remains unchanged. All types (`CleaningOptions`, `AnalysisResult`, `CleaningJob`, `CleaningCallbacks`, `CleaningError`) remain as-is.

**Note on `downloadResults` parameter:** The interface signature uses `jobId: string` as the parameter name. With the batch ZIP endpoint, this is now semantically correct — callers pass the job ID to download all cleaned files as a ZIP archive.

### Module Exports

| Module | Export | Purpose |
|---|---|---|
| `clients/metaCleanerApi.ts` | `buildApiUrl(path)` | REST URL builder |
| `clients/metaCleanerApi.ts` | `buildWsUrl(path)` | WebSocket URL builder |
| `clients/metaCleanerApi.ts` | `uploadFiles(files)` | POST /api/upload |
| `clients/metaCleanerApi.ts` | `createJob(fileIds)` | POST /api/jobs |
| `clients/metaCleanerApi.ts` | `getJobStatus(jobId)` | GET /api/jobs/{id} |
| `clients/metaCleanerApi.ts` | `connectJobProgress(jobId)` | WebSocket factory |
| `clients/metaCleanerApi.ts` | `downloadFile(fileId)` | GET /api/files/{id}/download |
| `clients/metaCleanerApi.ts` | `downloadJobZip(jobId)` | GET /api/jobs/{id}/download |
| `clients/metaCleanerApi.ts` | `getReports()` | GET /api/reports |
| `clients/metaCleanerApi.ts` | `getReportDetail(id)` | GET /api/reports/{id} |
| `clients/metaCleanerApi.ts` | `getReportPdf(id)` | GET /api/reports/{id}/pdf |
| `clients/metaCleanerApi.ts` | `healthCheck()` | GET /api/health |
| `clients/metaCleanerApi.ts` | `ApiHttpError` | Typed HTTP error class |
| `services/apiCleaningService.ts` | `apiCleaningService` | Singleton implementing CleaningService |

### WebSocket Message Types (received from backend)

```typescript
interface WsFileProgress {
  type: 'file_progress';
  fileId: string;
  status: 'in_progress';
  overallProgress: number;
  filesCompleted: number;
  totalFiles: number;
  currentFileId: string;
  // Note: no fileName — resolved from local fileNameMap
  // Note: no fieldsRemoved — only present in file_complete
  // Note: no timeRemainingSeconds — not computed by backend
}

interface WsFileComplete {
  type: 'file_complete';
  fileId: string;
  status: 'done';
  fieldsRemoved: number;
  gpsRemoved: boolean;
  overallProgress: number;
  filesCompleted: number;
  totalFiles: number;
}

interface WsFileError {
  type: 'file_error';
  fileId: string;
  status: 'error';
  errorCode: string;
  message: string;
}

// Note: there is NO separate WsJobProgress message type.
// Progress data is embedded in file_progress and file_complete events.
// timeRemainingSeconds is NOT computed by the backend — always 0.

interface WsJobComplete {
  type: 'job_complete';
  jobId: string;
  filesProcessed: number;
  fieldsRemoved: number;
  gpsLocationsRemoved: number;
  totalTimeMs: number;
  reportId: string;
  // Note: no fileResults array — constructed from accumulated file_complete events
}
```

## Data Models

No new persistent data models are introduced. The client operates as a stateless adapter between the existing frontend types and the backend REST/WebSocket API.

### Type Mapping: Backend → Frontend

| Backend field | Frontend type | Transformation | Handled by |
|---|---|---|---|
| Upload response `files[].id` | `string` | Direct | Client (`uploadFiles`) |
| Upload response `files[].name` | `fileNameMap` | Stored locally | Service (map building) |
| Job response `jobId` | `string` | Direct | Client (`createJob`) |
| WS accumulated events | `ProcessingResults` | Constructed from `file_complete` events | Service (`buildProcessingResults`) |
| `ReportSummary.date` | `Report.date` + `Report.time` | Split ISO string | Service (`extractDate`, `extractTime`) |
| `ReportSummary.type` | `Report.iconColor` | `image`→`green`, `video`→`orange` | Service (`computeIconColor`) |
| — (not in backend) | `Report.fieldsColor` | Default `'white'` | Service |
| `ReportFileDetail.fieldsRemoved` | `ReportFileDetail.barWidthPercent` | `(file / total) * 100` | Service (`computeBarWidth`) |
| `ReportFileDetail.type` | `ReportFileDetail.iconColor` | Same as report summary | Service |
| `ReportFileDetail.type` | `barGradientFrom` / `barGradientTo` | Type-based color map | Service (`getGradientFrom/To`) |
| `MetadataField.label/value` | `MetadataField.label/value/moreCount` | Direct + `moreCount: undefined` | Service (`mapMetadataDetail`) |
| `ReportsSummaryStats` | `ReportSummaryStats` | Pass-through (fields match) | Service |

## Error Handling

### Layer Responsibilities

| Layer | Error Handling |
|---|---|
| **Client** (`metaCleanerApi.ts`) | Throws `ApiHttpError` for any non-OK HTTP response. Includes status, error code, message, timestamp. |
| **Service** (`apiCleaningService.ts`) | Catches `ApiHttpError`, maps to `CleaningError` for callbacks. Handles WebSocket lifecycle errors. |

### HTTP Error Strategy (Client Layer)

| Status | Backend Error Code | Description |
|---|---|---|
| 413 | `FILE_TOO_LARGE` | Upload exceeds MAX_FILE_SIZE |
| 415 | `UNSUPPORTED_FORMAT` | Extension not supported |
| 429 | `RATE_LIMIT_EXCEEDED` | Upload rate limit exceeded |
| 400 | `INVALID_REQUEST` | Malformed request |
| 404 | `FILE_NOT_FOUND` / `REPORT_NOT_FOUND` | Resource not found |
| 404 | `JOB_NOT_FOUND` | Job ID not found |
| 404 | `FILES_EXPIRED` | Cleaned files have expired |
| 409 | `FILE_NOT_READY` | File still processing |
| 409 | `JOB_NOT_READY` | Job still processing |
| Network failure | — | `TypeError` from fetch |

### Service Layer Error Mapping

| Source | Mapped CleaningError Code | Phase |
|---|---|---|
| `ApiHttpError` status 413 | `FILE_TOO_LARGE` | upload |
| `ApiHttpError` status 415 | `UNSUPPORTED_FORMAT` | upload |
| `ApiHttpError` status 429 | `RATE_LIMIT_EXCEEDED` | upload |
| `ApiHttpError` status 400 | `INVALID_REQUEST` | upload/job |
| fetch TypeError | `NETWORK_ERROR` | upload |
| WebSocket `onerror` | `CONNECTION_LOST` | progress |
| WebSocket unexpected close | `CONNECTION_LOST` | progress |
| WS `file_error` message | Backend error code | cleaning |
| Normal close after `job_complete` | — | No error |
| `cancel()` called | — | Suppress callbacks |

## Environment and CORS Configuration (Req 12)

### CORS Behavior

The backend uses the `FRONTEND_ORIGIN` environment variable to control CORS:

- **When `FRONTEND_ORIGIN` is empty or unset:** The backend responds with `Access-Control-Allow-Origin: *` — all origins are allowed. This is the default for local development.
- **When `FRONTEND_ORIGIN` is set:** The backend responds with `Access-Control-Allow-Origin: {value}` — only the specified origin is allowed. This must be set in production (e.g., `https://metacleaner.app`).

The CORS middleware also allows:
- Methods: `GET, POST, PUT, DELETE, OPTIONS`
- Headers: `Content-Type, Authorization, X-Requested-With`
- Credentials: `true`

### Environment Variables

**Frontend (`.env.example`):**
```env
# Backend API URL — used for all HTTP and WebSocket connections
PUBLIC_API_URL=http://localhost:8080
```

**Backend (`.env.example`):**
```env
# Frontend origin for CORS — leave empty to allow all origins in development
FRONTEND_ORIGIN=
```

### README Documentation

The frontend README should include a section documenting:
1. How to set `PUBLIC_API_URL` for local development (default: `http://localhost:8080`)
2. How to set `PUBLIC_API_URL` for production (the deployed backend URL)
3. That the backend must have `FRONTEND_ORIGIN` set to the frontend URL in production for CORS

## File Changes Summary

| Action | File |
|---|---|
| Create | `src/lib/clients/metaCleanerApi.ts` |
| Create | `src/lib/services/apiCleaningService.ts` |
| Delete | `src/lib/services/mockCleaningService.ts` |
| Modify | All files importing `mockCleaningService` — replace with `apiCleaningService` |
| Modify | `.env.example` — add `PUBLIC_API_URL=http://localhost:8080` |
| Modify | `README.md` — add API configuration section |
| Modify | `backend/metacleaner-server/source/handlers.go` — add `HandleJobDownload` |
| Modify | `backend/metacleaner-server/source/router.go` — add `GET /api/jobs/{jobId}/download` route |

## Testing Strategy

### Unit Tests (Vitest)

**Client layer (`metaCleanerApi.ts`):**
- `buildApiUrl`: Various paths produce correct full URLs
- `buildWsUrl`: HTTP/HTTPS base URLs produce correct ws/wss protocol
- `uploadFiles`: Sends correct FormData structure (mocked fetch)
- `createJob`: Sends correct JSON body (mocked fetch)
- `ApiHttpError` parsing: Various error response shapes produce correct error objects

**Service layer (`apiCleaningService.ts`):**
- `analyzeFiles`: Aggregates scan results without network calls
- `dispatchWsMessage`: Each message type invokes the correct callback with resolved fileName
- `buildProcessingResults`: Constructs valid ProcessingResults from accumulated events
- `mapApiHttpError`: Known status codes map to correct CleaningError codes
- `downloadResults`: 404 and 409 produce correct error messages

**Type mapping layer:**
- `mapSingleReport`: Backend ReportSummary correctly maps to frontend Report with computed fields
- `mapReportFileDetails`: Computes barWidthPercent, iconColor, gradients correctly
- `computeBarWidth`: Percentage calculation with edge cases (zero total)
- `extractDate` / `extractTime`: ISO string splitting
- `mapMetadataDetail`: MetadataField mapping with moreCount default

### Property-Based Tests (Vitest + fast-check)

- URL construction: random paths always produce valid URLs with correct base
- WebSocket URL derivation: random http/https URLs always produce correct ws/wss protocol
- analyzeFiles aggregation: random file arrays produce correct totals
- FormData completeness: random file arrays always produce matching FormData entries
- File ID extraction: random response shapes always extract all IDs
- Job creation passthrough: random ID arrays always appear in request body
- Message dispatch: random valid messages always invoke exactly one correct callback
- ProcessingResults construction: accumulated events produce consistent results
- HTTP error mapping: random status codes from known set always produce correct codes
- Report summary mapping: random backend reports produce valid frontend Reports with correct iconColor/time
- Bar width percent: for any set of file details, sum of barWidthPercent ≈ 100 (rounding)
- fileName resolution: for any upload response, all file_progress messages resolve to correct names

### Integration Tests (E2E with Playwright)

- Full upload → job → WebSocket progress → download flow against running backend
- Report listing and detail retrieval with type mapping verification
- Error scenarios (large files, network interruption)

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: API URL construction preserves base and path

*For any* valid endpoint path string, calling `buildApiUrl(path)` SHALL return a string that equals `PUBLIC_API_URL` concatenated with `path`, ensuring the full path is preserved unchanged.

**Validates: Requirements 1.2, 1.4**

### Property 2: WebSocket URL protocol derivation

*For any* base URL string starting with `http://` or `https://`, calling `buildWsUrl(path)` SHALL produce a URL where the protocol is `ws://` when the base starts with `http://` and `wss://` when the base starts with `https://`, and the host and path are correctly preserved.

**Validates: Requirements 8.1, 8.2, 8.3**

### Property 3: analyzeFiles aggregation correctness

*For any* array of `QueuedFile` objects, calling `analyzeFiles` SHALL return a result where `totalFields` equals the sum of each file's `scanResult.fieldCount` (defaulting to 0), `hasGps` is true if and only if at least one file has `scanResult.hasGps === true`, and `perFileFieldCounts` contains an entry for every file ID with the correct count.

**Validates: Requirements 2.4**

### Property 4: Upload FormData completeness

*For any* non-empty array of files passed to `uploadFiles`, the constructed `FormData` SHALL contain exactly one entry per file, each with the field name `files` and the original file name preserved.

**Validates: Requirements 3.1**

### Property 5: File ID extraction from upload response

*For any* valid upload response JSON containing a `files` array with `id` fields, the extracted file IDs array SHALL have the same length and contain exactly the IDs from the response in order.

**Validates: Requirements 3.2**

### Property 6: WebSocket message dispatch correctness with fileName resolution

*For any* valid WebSocket message with a known `type` field (`file_progress`, `file_complete`, `file_error`, `job_complete`, `report_ready`) and a given fileNameMap, the dispatcher SHALL invoke the correct callbacks with arguments matching the message fields — specifically: `file_progress` → `onFileStart(fileId, resolvedFileName)` + `onProgress(overallProgress, filesCompleted, totalFiles, 0, 0)`, `file_complete` → `onFileComplete(fileId, fieldsRemoved, gpsRemoved)` + `onProgress(overallProgress, filesCompleted, totalFiles, fieldsRemoved, 0)`, `file_error` → `onError(...)`, `job_complete` → `onComplete(...)`, `report_ready` → no callback (silent store).

**Validates: Requirements 4.3, 4.4, 4.5, 4.6, 4.7, 11.2**

### Property 7: ProcessingResults construction from accumulated events

*For any* sequence of `file_complete` events and a `job_complete` message, calling `buildProcessingResults` SHALL produce a `ProcessingResults` where `fileResults` has the same length as accumulated events, each entry's `totalFields` matches the corresponding event's `fieldsRemoved`, and `filesProcessed` matches the count from the `job_complete` message.

**Validates: Requirements 4.6, 11.3, 11.5**

### Property 8: HTTP error status code mapping

*For any* HTTP error response with a status in {413, 415, 429, 400, 404}, the `mapApiHttpError` function SHALL produce a `CleaningError` with the correct error code (`FILE_TOO_LARGE`, `UNSUPPORTED_FORMAT`, `RATE_LIMIT_EXCEEDED`, `INVALID_REQUEST`, `FILE_NOT_FOUND` respectively) and a non-empty message string.

**Validates: Requirements 3.3, 3.4, 3.5**

### Property 9: Job creation file ID passthrough

*For any* array of file IDs, calling `createJob(fileIds)` SHALL send a request body containing a `fileIds` field with exactly those IDs in the same order and length.

**Validates: Requirements 4.1**

### Property 10: Report summary type mapping correctness

*For any* valid backend `ReportSummary` object, the `mapSingleReport` function SHALL produce a frontend `Report` where: `iconColor` is `'green'` when `type === 'image'` and `'orange'` when `type === 'video'`, `fieldsColor` is always `'white'`, `time` is derived from the date field (non-empty if date contains 'T', empty string otherwise), and all other fields are passed through unchanged.

**Validates: Requirements 9.1, 9.2, 9.3**

### Property 11: Bar width percentage computation invariant

*For any* non-empty array of `ReportFileDetail` objects with at least one positive `fieldsRemoved`, the computed `barWidthPercent` values SHALL each be between 0 and 100 inclusive, and their sum SHALL equal 100 (within rounding tolerance of ±N where N is the array length).

**Validates: Requirements 9.4**

### Property 12: File name map completeness from upload response

*For any* upload response containing N files, the constructed `fileNameMap` SHALL contain exactly N entries, and for every file in the response, `fileNameMap.get(file.id)` SHALL equal `file.name`.

**Validates: Requirements 11.1**
