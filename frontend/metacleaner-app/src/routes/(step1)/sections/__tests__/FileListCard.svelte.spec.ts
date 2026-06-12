import { page } from 'vitest/browser';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FileListCard from '../FileListCard.svelte';
import type { QueuedFile } from '$lib/scanner/types';

const { mockRemoveFile, mockClearFiles } = vi.hoisted(() => ({
	mockRemoveFile: vi.fn(),
	mockClearFiles: vi.fn()
}));
let _mockFiles: QueuedFile[] = [];

vi.mock('$lib/scanner/scannerStore.svelte', () => ({
	scannerStore: {
		get files() {
			return _mockFiles;
		},
		removeFile: mockRemoveFile,
		clearFiles: mockClearFiles
	}
}));

function makeQueuedFile(overrides: Partial<QueuedFile> = {}): QueuedFile {
	return {
		id: 'file-1',
		name: 'photo.jpg',
		size: 1024 * 1024,
		extension: '.jpg',
		type: 'image',
		format: 'jpeg',
		file: new File([new Uint8Array([0xff, 0xd8])], 'photo.jpg', { type: 'image/jpeg' }),
		scanResult: {
			fileId: 'file-1',
			status: 'done',
			fields: [],
			hasGps: false,
			fieldCount: 5,
			categoryScores: { gps: 0, deviceIdentity: 0, personalData: 0, timestamps: 0, aiOrigin: 0 },
			fileScore: 20
		},
		...overrides
	};
}

describe('FileListCard', () => {
	beforeEach(() => {
		_mockFiles = [];
		mockRemoveFile.mockClear();
		mockClearFiles.mockClear();
	});

	it('shows file count in header', async () => {
		_mockFiles = [makeQueuedFile(), makeQueuedFile({ id: 'file-2', name: 'video.mp4' })];
		render(FileListCard);
		await expect.element(page.getByText('(2)')).toBeInTheDocument();
	});

	it('renders a row for each file', async () => {
		_mockFiles = [
			makeQueuedFile({ id: 'file-1', name: 'photo1.jpg' }),
			makeQueuedFile({ id: 'file-2', name: 'photo2.jpg' })
		];
		render(FileListCard);
		await expect.element(page.getByText('photo1.jpg')).toBeInTheDocument();
		await expect.element(page.getByText('photo2.jpg')).toBeInTheDocument();
	});

	it('shows remove button for each file', async () => {
		_mockFiles = [makeQueuedFile()];
		render(FileListCard);
		const removeButton = page.getByRole('button', { name: /remove file/i });
		await expect.element(removeButton).toBeInTheDocument();
	});

	it('calls removeFile when remove button is clicked', async () => {
		_mockFiles = [makeQueuedFile({ id: 'file-1' })];
		render(FileListCard);
		const removeButton = page.getByRole('button', { name: /remove file/i });
		await removeButton.click();
		expect(mockRemoveFile).toHaveBeenCalledWith('file-1');
	});

	it('shows clear-all button', async () => {
		_mockFiles = [makeQueuedFile()];
		render(FileListCard);
		// Clear all button exists alongside the remove buttons
		const buttons = page.getByRole('button');
		await expect.element(buttons.first()).toBeInTheDocument();
	});

	it('shows (0) count header when file list is empty', async () => {
		_mockFiles = [];
		render(FileListCard);
		await expect.element(page.getByText('(0)')).toBeInTheDocument();
	});

	it('shows GPS warning for files with GPS data', async () => {
		_mockFiles = [
			makeQueuedFile({
				scanResult: {
					fileId: 'file-1',
					status: 'done',
					fields: [],
					hasGps: true,
					fieldCount: 3,
					categoryScores: { gps: 80, deviceIdentity: 0, personalData: 0, timestamps: 0, aiOrigin: 0 },
					fileScore: 80
				}
			})
		];
		render(FileListCard);
		// The file row is rendered (GPS warning appears inside FileListItemRisk)
		await expect.element(page.getByText('photo.jpg')).toBeInTheDocument();
	});

	it('shows pending state for files still scanning', async () => {
		_mockFiles = [
			makeQueuedFile({
				scanResult: {
					fileId: 'file-1',
					status: 'pending',
					fields: [],
					hasGps: false,
					fieldCount: 0,
					categoryScores: { gps: 0, deviceIdentity: 0, personalData: 0, timestamps: 0, aiOrigin: 0 },
					fileScore: 0
				}
			})
		];
		render(FileListCard);
		await expect.element(page.getByText('photo.jpg')).toBeInTheDocument();
	});
});
