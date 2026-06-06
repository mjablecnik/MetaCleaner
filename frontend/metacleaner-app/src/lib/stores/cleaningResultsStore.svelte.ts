import type { ProcessingResults } from '$lib/types/processing.js';
import type { CleaningError } from '$lib/services/cleaningService.js';

let _results = $state<ProcessingResults | null>(null);
let _error = $state<CleaningError | null>(null);

export const cleaningResultsStore = {
	get results() {
		return _results;
	},
	get error() {
		return _error;
	},
	setResults(r: ProcessingResults) {
		_results = r;
		_error = null;
	},
	setError(e: CleaningError) {
		_error = e;
		_results = null;
	},
	clear() {
		_results = null;
		_error = null;
	}
};
