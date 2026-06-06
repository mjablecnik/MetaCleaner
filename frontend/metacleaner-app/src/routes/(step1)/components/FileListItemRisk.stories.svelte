<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FileListItemRisk from './FileListItemRisk.svelte';
	import type { QueuedFile } from '$lib/scanner/types';

	const { Story } = defineMeta({
		title: 'Step2/FileListItemRisk',
		component: FileListItemRisk,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});

	const base: Omit<QueuedFile, 'scanResult'> = {
		id: 'file-001',
		file: null as unknown as File,
		name: 'IMG_4821.jpg',
		size: 3_276_800,
		extension: '.jpg',
		type: 'image',
		format: 'jpeg'
	};

	const highRiskFile: QueuedFile = {
		...base,
		id: 'file-high',
		name: 'vacation_beach.heic',
		extension: '.heic',
		format: 'heic',
		size: 9_175_040,
		scanResult: {
			fileId: 'file-high',
			status: 'done',
			fields: [],
			hasGps: true,
			device: 'iPhone 15 Pro',
			fieldCount: 22,
			categoryScores: { gps: 100, deviceIdentity: 80, personalData: 60, timestamps: 40 },
			fileScore: 85
		}
	};

	const mediumRiskFile: QueuedFile = {
		...base,
		id: 'file-medium',
		name: 'portrait_studio.jpg',
		extension: '.jpg',
		format: 'jpeg',
		size: 4_194_304,
		scanResult: {
			fileId: 'file-medium',
			status: 'done',
			fields: [],
			hasGps: false,
			device: 'Canon EOS R5',
			fieldCount: 8,
			categoryScores: { gps: 0, deviceIdentity: 70, personalData: 40, timestamps: 30 },
			fileScore: 52
		}
	};

	const lowRiskFile: QueuedFile = {
		...base,
		id: 'file-low',
		name: 'screenshot_2024.png',
		extension: '.png',
		format: 'png',
		size: 512_000,
		scanResult: {
			fileId: 'file-low',
			status: 'done',
			fields: [],
			hasGps: false,
			device: undefined,
			fieldCount: 2,
			categoryScores: { gps: 0, deviceIdentity: 10, personalData: 0, timestamps: 15 },
			fileScore: 12
		}
	};

	const scanningFile: QueuedFile = {
		...base,
		id: 'file-scanning',
		name: 'raw_photo_dng.dng',
		extension: '.dng',
		format: 'dng',
		size: 24_117_248,
		scanResult: {
			fileId: 'file-scanning',
			status: 'scanning',
			fields: [],
			hasGps: false,
			device: undefined,
			fieldCount: 0,
			categoryScores: { gps: 0, deviceIdentity: 0, personalData: 0, timestamps: 0 },
			fileScore: 0
		}
	};

	const errorFile: QueuedFile = {
		...base,
		id: 'file-error',
		name: 'corrupted_image.jpg',
		extension: '.jpg',
		format: 'jpeg',
		size: 1_048_576,
		scanResult: {
			fileId: 'file-error',
			status: 'error',
			fields: [],
			hasGps: false,
			device: undefined,
			fieldCount: 0,
			categoryScores: { gps: 0, deviceIdentity: 0, personalData: 0, timestamps: 0 },
			fileScore: 0,
			error: 'Failed to parse file metadata'
		}
	};

	const videoFile: QueuedFile = {
		...base,
		id: 'file-video',
		name: 'walk_prague.mp4',
		extension: '.mp4',
		type: 'video',
		format: 'mp4',
		size: 149_946_368,
		scanResult: {
			fileId: 'file-video',
			status: 'done',
			fields: [],
			hasGps: false,
			device: 'H.264',
			fieldCount: 6,
			categoryScores: { gps: 0, deviceIdentity: 40, personalData: 20, timestamps: 30 },
			fileScore: 28
		}
	};
</script>

<Story name="High Risk">
	<FileListItemRisk file={highRiskFile} onRemove={() => {}} />
</Story>

<Story name="Medium Risk">
	<FileListItemRisk file={mediumRiskFile} onRemove={() => {}} />
</Story>

<Story name="Low Risk">
	<FileListItemRisk file={lowRiskFile} onRemove={() => {}} />
</Story>

<Story name="Scanning In Progress">
	<FileListItemRisk file={scanningFile} />
</Story>

<Story name="Scan Error">
	<FileListItemRisk file={errorFile} onRemove={() => {}} />
</Story>

<Story name="Video File">
	<FileListItemRisk file={videoFile} onRemove={() => {}} />
</Story>
