import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ErrorFilesCard from '../ErrorFilesCard.svelte';
import type { FileWithErrorState } from '../ErrorFilesCard.svelte';
import type { QueuedFile } from '$lib/scanner/types';

function makeQueuedFile(id: string, name: string): QueuedFile {
	return {
		id,
		name,
		size: 2 * 1024 * 1024,
		extension: '.jpg',
		type: 'image',
		format: 'jpeg',
		file: new File([], name, { type: 'image/jpeg' }),
		scanResult: {
			fileId: id,
			status: 'done',
			fields: [],
			hasGps: false,
			fieldCount: 4,
			categoryScores: { gps: 0, deviceIdentity: 0, personalData: 0, timestamps: 0, aiOrigin: 0 },
			fileScore: 15
		}
	};
}

const sampleFiles: FileWithErrorState[] = [
	{ file: makeQueuedFile('f1', 'clean.jpg'), status: 'done', fieldsRemoved: 4, gpsRemoved: false },
	{
		file: makeQueuedFile('f2', 'failed.jpg'),
		status: 'error',
		fieldsRemoved: 0,
		gpsRemoved: false
	},
	{
		file: makeQueuedFile('f3', 'skipped.jpg'),
		status: 'skipped',
		fieldsRemoved: 0,
		gpsRemoved: false
	}
];

describe('ErrorFilesCard', () => {
	it('renders all file rows', async () => {
		render(ErrorFilesCard, {
			filesWithState: sampleFiles,
			doneCount: 1,
			totalFiles: 3,
			overallProgress: 33,
			onTryAgain: vi.fn(),
			onClearAll: vi.fn()
		});
		await expect.element(page.getByText('clean.jpg')).toBeInTheDocument();
		await expect.element(page.getByText('failed.jpg')).toBeInTheDocument();
		await expect.element(page.getByText('skipped.jpg')).toBeInTheDocument();
	});

	it('calls onTryAgain when Zkusit znovu is clicked', async () => {
		const onTryAgain = vi.fn();
		render(ErrorFilesCard, {
			filesWithState: sampleFiles,
			doneCount: 1,
			totalFiles: 3,
			overallProgress: 33,
			onTryAgain,
			onClearAll: vi.fn()
		});
		const retryBtn = page.getByRole('button').filter({ hasText: /try again/i });
		await retryBtn.click();
		expect(onTryAgain).toHaveBeenCalledOnce();
	});

	it('calls onClearAll when Vymazat vše is clicked', async () => {
		const onClearAll = vi.fn();
		render(ErrorFilesCard, {
			filesWithState: sampleFiles,
			doneCount: 1,
			totalFiles: 3,
			overallProgress: 33,
			onTryAgain: vi.fn(),
			onClearAll
		});
		const clearBtn = page.getByRole('button').filter({ hasText: /clear/i });
		await clearBtn.click();
		expect(onClearAll).toHaveBeenCalledOnce();
	});

	it('shows file count indicator', async () => {
		render(ErrorFilesCard, {
			filesWithState: sampleFiles,
			doneCount: 1,
			totalFiles: 3,
			overallProgress: 33,
			onTryAgain: vi.fn(),
			onClearAll: vi.fn()
		});
		await expect.element(page.getByText(/1 of 3 files/)).toBeInTheDocument();
	});

	it('action buttons are present', async () => {
		render(ErrorFilesCard, {
			filesWithState: sampleFiles,
			doneCount: 2,
			totalFiles: 3,
			overallProgress: 67,
			onTryAgain: vi.fn(),
			onClearAll: vi.fn()
		});
		// Both retry and clear buttons should render
		const buttons = page.getByRole('button');
		await expect.element(buttons.first()).toBeInTheDocument();
		expect(buttons.elements().length).toBeGreaterThanOrEqual(2);
	});
});
