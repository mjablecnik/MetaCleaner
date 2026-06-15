import { describe, it, expect, beforeEach } from 'vitest';
import type { ProcessingResults } from '$lib/types/processing.js';
import type { CleaningError } from '$lib/services/cleaningService.js';

const { cleaningResultsStore } = await import('../cleaningResultsStore.svelte.js');

function makeResults(overrides: Partial<ProcessingResults> = {}): ProcessingResults {
	return {
		filesProcessed: 2,
		fieldsRemoved: 10,
		gpsLocationsRemoved: 1,
		totalTimeSeconds: 5,
		fileResults: [],
		beforeBreakdown: {
			gpsFields: [],
			exifFields: [],
			xmpFields: [],
			id3Fields: [],
			mp4Atoms: [],
			pngChunks: [],
			totalRemoved: 0
		},
		...overrides
	};
}

function makeError(overrides: Partial<CleaningError> = {}): CleaningError {
	return {
		code: 'UPLOAD_FAILED',
		hexCode: '0x0001',
		message: 'Upload failed',
		phase: 'upload',
		timestamp: '2025-01-01T00:00:00Z',
		...overrides
	};
}

describe('cleaningResultsStore', () => {
	beforeEach(() => {
		cleaningResultsStore.clear();
	});

	// ─── Initial state ────────────────────────────────────────────────────────

	it('starts with null results, error, jobId, and reportId', () => {
		expect(cleaningResultsStore.results).toBeNull();
		expect(cleaningResultsStore.error).toBeNull();
		expect(cleaningResultsStore.jobId).toBeNull();
		expect(cleaningResultsStore.reportId).toBeNull();
	});

	// ─── setResults ───────────────────────────────────────────────────────────

	it('setResults stores results and clears error', () => {
		cleaningResultsStore.setError(makeError());
		const results = makeResults();
		cleaningResultsStore.setResults(results);
		expect(cleaningResultsStore.results).toBe(results);
		expect(cleaningResultsStore.error).toBeNull();
	});

	it('setResults stores jobId when provided', () => {
		cleaningResultsStore.setResults(makeResults(), 'job-123');
		expect(cleaningResultsStore.jobId).toBe('job-123');
	});

	it('setResults stores reportId when provided', () => {
		cleaningResultsStore.setResults(makeResults(), 'job-123', 'MC-2025-001');
		expect(cleaningResultsStore.reportId).toBe('MC-2025-001');
	});

	it('setResults sets jobId and reportId to null when not provided', () => {
		cleaningResultsStore.setResults(makeResults(), 'old-job', 'old-report');
		cleaningResultsStore.setResults(makeResults());
		expect(cleaningResultsStore.jobId).toBeNull();
		expect(cleaningResultsStore.reportId).toBeNull();
	});

	it('setResults only with jobId leaves reportId null', () => {
		cleaningResultsStore.setResults(makeResults(), 'job-abc');
		expect(cleaningResultsStore.jobId).toBe('job-abc');
		expect(cleaningResultsStore.reportId).toBeNull();
	});

	it('setResults preserves all result fields', () => {
		const results = makeResults({ filesProcessed: 5, fieldsRemoved: 42 });
		cleaningResultsStore.setResults(results);
		expect(cleaningResultsStore.results?.filesProcessed).toBe(5);
		expect(cleaningResultsStore.results?.fieldsRemoved).toBe(42);
	});

	// ─── setError ─────────────────────────────────────────────────────────────

	it('setError stores error and clears results', () => {
		cleaningResultsStore.setResults(makeResults());
		const err = makeError();
		cleaningResultsStore.setError(err);
		expect(cleaningResultsStore.error).toBe(err);
		expect(cleaningResultsStore.results).toBeNull();
	});

	it('setError preserves error fields', () => {
		const err = makeError({ code: 'SERVER_ERROR', phase: 'processing', message: 'oops' });
		cleaningResultsStore.setError(err);
		expect(cleaningResultsStore.error?.code).toBe('SERVER_ERROR');
		expect(cleaningResultsStore.error?.phase).toBe('processing');
		expect(cleaningResultsStore.error?.message).toBe('oops');
	});

	// ─── setReportId ──────────────────────────────────────────────────────────

	it('setReportId updates reportId independently', () => {
		cleaningResultsStore.setResults(makeResults(), 'job-1', 'old-report');
		cleaningResultsStore.setReportId('MC-2025-007');
		expect(cleaningResultsStore.reportId).toBe('MC-2025-007');
		// results and jobId should be unchanged
		expect(cleaningResultsStore.results).not.toBeNull();
		expect(cleaningResultsStore.jobId).toBe('job-1');
	});

	it('setReportId works on a fresh store with no results', () => {
		cleaningResultsStore.setReportId('MC-2025-new');
		expect(cleaningResultsStore.reportId).toBe('MC-2025-new');
		expect(cleaningResultsStore.results).toBeNull();
		expect(cleaningResultsStore.error).toBeNull();
	});

	// ─── clear ────────────────────────────────────────────────────────────────

	it('clear resets all state to null', () => {
		cleaningResultsStore.setResults(makeResults(), 'job-1', 'rep-1');
		cleaningResultsStore.clear();
		expect(cleaningResultsStore.results).toBeNull();
		expect(cleaningResultsStore.error).toBeNull();
		expect(cleaningResultsStore.jobId).toBeNull();
		expect(cleaningResultsStore.reportId).toBeNull();
	});

	it('clear works on already-empty store without throwing', () => {
		cleaningResultsStore.clear();
		cleaningResultsStore.clear();
		expect(cleaningResultsStore.results).toBeNull();
	});

	it('clear after setError nullifies all fields', () => {
		cleaningResultsStore.setError(makeError());
		cleaningResultsStore.clear();
		expect(cleaningResultsStore.error).toBeNull();
		expect(cleaningResultsStore.results).toBeNull();
	});
});
