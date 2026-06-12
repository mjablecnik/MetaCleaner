import { page } from 'vitest/browser';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import UploadZoneCard from '../UploadZoneCard.svelte';

// Mock the scanner store
const { mockAddFiles } = vi.hoisted(() => ({ mockAddFiles: vi.fn() }));
let _hasFiles = false;
let _isScanning = false;

vi.mock('$lib/scanner/scannerStore.svelte', () => ({
	scannerStore: {
		get hasFiles() {
			return _hasFiles;
		},
		get isScanning() {
			return _isScanning;
		},
		get aggregatedRisk() {
			return { scannedCount: 0, fileCount: 0, overallScore: 0 };
		},
		addFiles: mockAddFiles
	}
}));

describe('UploadZoneCard', () => {
	beforeEach(() => {
		_hasFiles = false;
		_isScanning = false;
		mockAddFiles.mockClear();
	});

	it('renders card with file input', async () => {
		const { container } = render(UploadZoneCard);
		// Hidden file input should exist
		const input = container.querySelector('input[type="file"]');
		expect(input).not.toBeNull();
	});

	it('shows format badges (JPG, PNG, HEIC, MP4, MOV)', async () => {
		render(UploadZoneCard);
		await expect.element(page.getByText('JPG')).toBeInTheDocument();
		await expect.element(page.getByText('PNG')).toBeInTheDocument();
		await expect.element(page.getByText('HEIC')).toBeInTheDocument();
		await expect.element(page.getByText('MP4')).toBeInTheDocument();
		await expect.element(page.getByText('MOV')).toBeInTheDocument();
	});

	it('file input accepts correct formats via accept attribute', async () => {
		const { container } = render(UploadZoneCard);
		const input = container.querySelector('input[type="file"]');
		expect(input).not.toBeNull();
		const acceptAttr = input?.getAttribute('accept');
		expect(acceptAttr).toContain('.jpg');
		expect(acceptAttr).toContain('.png');
		expect(acceptAttr).toContain('.heic');
		expect(acceptAttr).toContain('.mp4');
		expect(acceptAttr).toContain('.mov');
	});

	it('file input does not accept pdf', async () => {
		const { container } = render(UploadZoneCard);
		const input = container.querySelector('input[type="file"]');
		const acceptAttr = input?.getAttribute('accept');
		expect(acceptAttr).not.toContain('.pdf');
	});

	it('file input allows multiple files', async () => {
		const { container } = render(UploadZoneCard);
		const input = container.querySelector('input[type="file"]');
		expect(input?.hasAttribute('multiple')).toBe(true);
	});

	it('drop zone has role=button for keyboard accessibility', async () => {
		const { container } = render(UploadZoneCard);
		const dropZone = container.querySelector('[role="button"]');
		expect(dropZone).not.toBeNull();
		expect(dropZone?.getAttribute('tabindex')).toBe('0');
	});

	it('shows scanning progress when isScanning is true', async () => {
		_isScanning = true;
		_hasFiles = true;
		const { container } = render(UploadZoneCard);
		// The scanning indicator has animate-pulse class
		const pulseEl = container.querySelector('.animate-pulse');
		expect(pulseEl).not.toBeNull();
	});
});
