import type { ProcessingResults } from '$lib/types/processing.js';
import type { CleaningError } from '$lib/services/cleaningService.js';

let _results = $state<ProcessingResults | null>(null);
let _error = $state<CleaningError | null>(null);
let _jobId = $state<string | null>(null);
let _reportId = $state<string | null>(null);

export const cleaningResultsStore = {
	get results() {
		return _results;
	},
	get error() {
		return _error;
	},
	get jobId() {
		return _jobId;
	},
	get reportId() {
		return _reportId;
	},
	setResults(r: ProcessingResults, jobId?: string, reportId?: string) {
		_results = r;
		_error = null;
		_jobId = jobId ?? null;
		_reportId = reportId ?? null;
	},
	setReportId(reportId: string) {
		_reportId = reportId;
	},
	setError(e: CleaningError) {
		_error = e;
		_results = null;
	},
	clear() {
		_results = null;
		_error = null;
		_jobId = null;
		_reportId = null;
	}
};
