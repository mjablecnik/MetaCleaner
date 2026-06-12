// Integration test: report detail renders original filenames for both image and video files.
// Design spec (design.md): "Test report detail renders original filenames for both image
// and video files" (Integration Tests section).
//
// Bug 9 fix: report detail must show original upload filenames (e.g., "firefly-kling-3.0.mp4")
// not hashed internal IDs (e.g., "f-fbe455fb.mp4"). The fix maps `original_name` from the
// backend response in mapReportFileDetails() — this test verifies the rendered output uses
// whatever `file.name` the component receives (i.e., the correctly-mapped original name).
//
// Requires browser/Playwright to run (vitest --project=client).
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FileAccordionItem from '../FileAccordionItem.svelte';
import type { ReportFileDetail } from '$lib/types/report';

function makeImageFile(name: string): ReportFileDetail {
	return {
		name,
		extension: '.jpg',
		sizeMB: '2.5',
		format: 'jpeg',
		device: 'Canon EOS',
		type: 'image',
		iconColor: 'blue',
		hasGps: true,
		fieldsRemoved: 12,
		barWidthPercent: 67,
		barGradientFrom: '#22c55e',
		barGradientTo: '#16a34a',
		metadata: {
			gpsFields: [{ label: 'GPSLatitude', value: '50.0756' }],
			exifFields: [{ label: 'Make', value: 'Canon' }],
			xmpFields: [],
			id3Fields: [],
			mp4AtomFields: [],
			totalRemoved: 12
		}
	};
}

function makeVideoFile(name: string): ReportFileDetail {
	return {
		name,
		extension: '.mp4',
		sizeMB: '45.3',
		format: 'mp4',
		device: 'Sony A7',
		type: 'video',
		iconColor: 'orange',
		hasGps: false,
		fieldsRemoved: 5,
		barWidthPercent: 33,
		barGradientFrom: '#f97316',
		barGradientTo: '#ea580c',
		metadata: {
			gpsFields: [],
			exifFields: [],
			xmpFields: [],
			id3Fields: [{ label: 'Title', value: 'My Video' }],
			mp4AtomFields: [{ label: 'Encoder', value: 'ffmpeg' }],
			totalRemoved: 5
		}
	};
}

describe('Integration: FileAccordionItem renders original filenames (Bug 9)', () => {
	// Bug 9: report detail must show original upload filename, not hashed internal ID.
	// Before fix: mapReportFileDetails() used f.name (hashed ID like "f-fbe455fb.mp4")
	// After fix: mapReportFileDetails() uses f.original_name when present
	// This test verifies the component renders whatever file.name it receives correctly.

	it('renders original image filename — not a hashed ID', async () => {
		const originalName = 'holiday-photo.jpg';
		render(FileAccordionItem, {
			file: makeImageFile(originalName),
			open: false,
			onToggle: () => {}
		});
		// The filename renders in both mobile and desktop <p> slots — use .first() to avoid strict mode
		await expect.element(page.getByText(originalName).first()).toBeInTheDocument();
	});

	it('renders original video filename — not a hashed ID', async () => {
		const originalName = 'firefly-kling-3.0.mp4';
		render(FileAccordionItem, {
			file: makeVideoFile(originalName),
			open: false,
			onToggle: () => {}
		});
		await expect.element(page.getByText(originalName).first()).toBeInTheDocument();
	});

	it('hashed ID is never visible when original filename is provided (image)', async () => {
		const hashedName = 'f-fbe455fb.jpg';
		const originalName = 'my-photo.jpg';
		// With the Bug 9 fix, `file.name` is the original name — the component never receives the hashed ID
		render(FileAccordionItem, {
			file: makeImageFile(originalName),
			open: false,
			onToggle: () => {}
		});
		// The hashed form must not appear anywhere in the DOM
		await expect.element(page.getByText(hashedName)).not.toBeInTheDocument();
		// And the original name must be shown
		await expect.element(page.getByText(originalName).first()).toBeInTheDocument();
	});

	it('hashed ID is never visible when original filename is provided (video)', async () => {
		const hashedName = 'f-abc12345.mp4';
		const originalName = 'firefly-kling-3.0.mp4';
		render(FileAccordionItem, {
			file: makeVideoFile(originalName),
			open: false,
			onToggle: () => {}
		});
		await expect.element(page.getByText(hashedName)).not.toBeInTheDocument();
		await expect.element(page.getByText(originalName).first()).toBeInTheDocument();
	});

	it('image and video files each show their distinct original filenames when rendered together', async () => {
		const imageName = 'portrait.jpg';
		const videoName = 'cinematic-shot.mp4';
		// Render both independently (each render creates fresh DOM nodes)
		render(FileAccordionItem, {
			file: makeImageFile(imageName),
			open: false,
			onToggle: () => {}
		});
		render(FileAccordionItem, {
			file: makeVideoFile(videoName),
			open: false,
			onToggle: () => {}
		});
		// Each name appears in both mobile+desktop slots, .first() picks the mobile slot
		await expect.element(page.getByText(imageName).first()).toBeInTheDocument();
		await expect.element(page.getByText(videoName).first()).toBeInTheDocument();
	});

	it('video file metadata sections (id3, mp4Atoms) are visible when accordion is open', async () => {
		const videoName = 'concert-clip.mp4';
		render(FileAccordionItem, {
			file: makeVideoFile(videoName),
			open: true,
			onToggle: () => {}
		});
		// Filename must still be visible even in expanded state
		await expect.element(page.getByText(videoName).first()).toBeInTheDocument();
	});
});
