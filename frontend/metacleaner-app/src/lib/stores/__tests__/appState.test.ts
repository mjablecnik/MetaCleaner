import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock scannerStore before importing appState
const mockClearFiles = vi.fn();
let _mockHasFiles = false;

vi.mock('$lib/scanner/scannerStore.svelte.js', () => ({
	scannerStore: {
		get hasFiles() {
			return _mockHasFiles;
		},
		clearFiles: mockClearFiles
	}
}));

// Mock cleaningResultsStore before importing appState
const mockClearResults = vi.fn();

vi.mock('$lib/stores/cleaningResultsStore.svelte.js', () => ({
	cleaningResultsStore: {
		clear: mockClearResults
	}
}));

async function importFresh() {
	return import('../appState.svelte.js');
}

describe('appState store', () => {
	beforeEach(async () => {
		_mockHasFiles = false;
		mockClearFiles.mockClear();
		mockClearResults.mockClear();
		// Reset to idle by calling transitionTo
		const { appState } = await importFresh();
		appState.transitionTo('idle');
	});

	it('starts in idle state with no files', async () => {
		const { appState } = await importFresh();
		expect(appState.current).toBe('idle');
		expect(appState.isProcessing).toBe(false);
		expect(appState.hasFiles).toBe(false);
	});

	it('transitionTo processing sets state to processing', async () => {
		const { appState } = await importFresh();
		appState.transitionTo('processing');
		expect(appState.current).toBe('processing');
		expect(appState.isProcessing).toBe(true);
		expect(appState.hasFiles).toBe(true);
	});

	it('transitionTo error sets state to error', async () => {
		const { appState } = await importFresh();
		appState.transitionTo('error');
		expect(appState.current).toBe('error');
		expect(appState.isProcessing).toBe(false);
	});

	it('transitionTo success sets state to success', async () => {
		const { appState } = await importFresh();
		appState.transitionTo('success');
		expect(appState.current).toBe('success');
		expect(appState.isProcessing).toBe(false);
	});

	it('processing → files-ready on cancel (files still present)', async () => {
		const { appState } = await importFresh();
		_mockHasFiles = true; // files are still present when cancelling
		appState.transitionTo('processing');
		expect(appState.current).toBe('processing');

		appState.transitionTo('files-ready');
		expect(appState.current).toBe('files-ready');
		expect(appState.isProcessing).toBe(false);
	});

	it('processing → idle on cancel (files were cleared)', async () => {
		const { appState } = await importFresh();
		_mockHasFiles = false; // files cleared before cancel
		appState.transitionTo('processing');
		appState.transitionTo('files-ready');
		// Auto-corrects to idle because no files present
		expect(appState.current).toBe('idle');
	});

	it('error → files-ready on retry (files still present)', async () => {
		const { appState } = await importFresh();
		_mockHasFiles = true; // files are still there on retry
		appState.transitionTo('error');
		appState.transitionTo('files-ready');
		expect(appState.current).toBe('files-ready');
	});

	it('reset() calls scannerStore.clearFiles, cleaningResultsStore.clear, and returns to idle', async () => {
		const { appState } = await importFresh();
		appState.transitionTo('processing');
		expect(appState.current).toBe('processing');

		appState.reset();
		expect(mockClearFiles).toHaveBeenCalledOnce();
		expect(mockClearResults).toHaveBeenCalledOnce();
		expect(appState.current).toBe('idle');
	});

	it('auto-transitions idle → files-ready when hasFiles becomes true', async () => {
		const { appState } = await importFresh();
		// Simulate files being added: set hasFiles true and force a recompute
		// via another state transition that re-reads the derived
		_mockHasFiles = true;
		appState.transitionTo('idle'); // triggers recompute of _currentState
		expect(appState.current).toBe('files-ready');
	});

	it('auto-transitions files-ready → idle when hasFiles becomes false', async () => {
		const { appState } = await importFresh();
		_mockHasFiles = true;
		appState.transitionTo('idle');
		expect(appState.current).toBe('files-ready');

		_mockHasFiles = false;
		appState.transitionTo('files-ready'); // triggers recompute
		expect(appState.current).toBe('idle');
	});

	it('stays in processing when hasFiles is false (no auto-revert)', async () => {
		const { appState } = await importFresh();
		appState.transitionTo('processing');
		_mockHasFiles = false;
		// processing state is stable regardless of hasFiles
		expect(appState.current).toBe('processing');
	});

	it('hasFiles derived is true for non-idle states', async () => {
		const { appState } = await importFresh();

		appState.transitionTo('processing');
		expect(appState.hasFiles).toBe(true);

		appState.transitionTo('error');
		expect(appState.hasFiles).toBe(true);

		appState.transitionTo('success');
		expect(appState.hasFiles).toBe(true);
	});

	it('hasFiles derived is false only in idle state', async () => {
		const { appState } = await importFresh();
		_mockHasFiles = false;
		appState.transitionTo('idle');
		expect(appState.hasFiles).toBe(false);
	});
});
