import { scannerStore } from '$lib/scanner/scannerStore.svelte.js';
import { cleaningResultsStore } from './cleaningResultsStore.svelte.js';

export type AppState = 'idle' | 'files-ready' | 'processing' | 'error' | 'success';

// Explicit state set by actions; idle↔files-ready are overridden by scannerStore.hasFiles
let _explicitState = $state<AppState>('idle');

// Derive actual current state: auto-correct idle↔files-ready based on file presence
const _currentState = $derived((): AppState => {
	if (_explicitState === 'idle' && scannerStore.hasFiles) return 'files-ready';
	if (_explicitState === 'files-ready' && !scannerStore.hasFiles) return 'idle';
	return _explicitState;
});

const isProcessing = $derived(_currentState() === 'processing');
const hasFiles = $derived(_currentState() !== 'idle');

function transitionTo(state: AppState): void {
	_explicitState = state;
}

function reset(): void {
	scannerStore.clearFiles();
	cleaningResultsStore.clear();
	_explicitState = 'idle';
}

export const appState = {
	get current(): AppState {
		return _currentState();
	},
	get isProcessing() {
		return isProcessing;
	},
	get hasFiles() {
		return hasFiles;
	},
	transitionTo,
	reset
};
