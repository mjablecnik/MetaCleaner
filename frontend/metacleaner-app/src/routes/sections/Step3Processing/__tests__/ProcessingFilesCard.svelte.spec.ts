import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ProcessingFilesCard from '../ProcessingFilesCard.svelte';
import type { FileWithState } from '../ProcessingFilesCard.svelte';
import type { QueuedFile } from '$lib/scanner/types';

function makeQueuedFile(id: string, name: string): QueuedFile {
	return {
		id,
		name,
		size: 1024 * 1024,
		extension: '.jpg',
		type: 'image',
		format: 'jpeg',
		file: new File([], name, { type: 'image/jpeg' }),
		scanResult: {
			fileId: id,
			status: 'done',
			fields: [],
			hasGps: false,
			fieldCount: 3,
			categoryScores: { gps: 0, deviceIdentity: 0, personalData: 0, timestamps: 0, aiOrigin: 0 },
			fileScore: 10
		}
	};
}

function makeFilesWithState(stateOverride?: Partial<FileWithState['state']>): FileWithState[] {
	const defaultState: FileWithState['state'] = {
		status: 'in_progress',
		progress: 45,
		fieldsRemoved: 0,
		gpsRemoved: false
	};
	return [
		{
			file: makeQueuedFile('f1', 'photo1.jpg'),
			state: { ...defaultState, ...stateOverride }
		},
		{
			file: makeQueuedFile('f2', 'photo2.jpg'),
			state: { status: 'waiting', progress: 0, fieldsRemoved: 0, gpsRemoved: false }
		}
	];
}

describe('ProcessingFilesCard', () => {
	it('renders overall progress percentage', async () => {
		const onStop = vi.fn();
		render(ProcessingFilesCard, {
			processedFiles: makeFilesWithState(),
			overallProgress: 45,
			filesCompleted: 0,
			totalFiles: 2,
			timeRemainingSeconds: 30,
			onStop
		});
		await expect.element(page.getByText('45%').first()).toBeInTheDocument();
	});

	it('renders per-file rows', async () => {
		const onStop = vi.fn();
		render(ProcessingFilesCard, {
			processedFiles: makeFilesWithState(),
			overallProgress: 45,
			filesCompleted: 0,
			totalFiles: 2,
			timeRemainingSeconds: 30,
			onStop
		});
		await expect.element(page.getByText('photo1.jpg')).toBeInTheDocument();
		await expect.element(page.getByText('photo2.jpg')).toBeInTheDocument();
	});

	it('calls onStop when Zastavit button is clicked', async () => {
		const onStop = vi.fn();
		render(ProcessingFilesCard, {
			processedFiles: makeFilesWithState(),
			overallProgress: 30,
			filesCompleted: 0,
			totalFiles: 2,
			timeRemainingSeconds: 60,
			onStop
		});
		// Find and click the red stop button
		const stopBtn = page.getByRole('button').filter({ hasText: /stop/i });
		await stopBtn.click();
		expect(onStop).toHaveBeenCalledOnce();
	});

	it('shows completed file with done state', async () => {
		const onStop = vi.fn();
		const filesWithDone: FileWithState[] = [
			{
				file: makeQueuedFile('f1', 'done.jpg'),
				state: { status: 'done', progress: 100, fieldsRemoved: 5, gpsRemoved: true }
			}
		];
		render(ProcessingFilesCard, {
			processedFiles: filesWithDone,
			overallProgress: 100,
			filesCompleted: 1,
			totalFiles: 1,
			timeRemainingSeconds: 0,
			onStop
		});
		await expect.element(page.getByText('done.jpg')).toBeInTheDocument();
	});

	it('shows file count progress', async () => {
		const onStop = vi.fn();
		render(ProcessingFilesCard, {
			processedFiles: makeFilesWithState(),
			overallProgress: 50,
			filesCompleted: 1,
			totalFiles: 2,
			timeRemainingSeconds: 15,
			onStop
		});
		await expect.element(page.getByText(/1 of 2 files/)).toBeInTheDocument();
	});
});
