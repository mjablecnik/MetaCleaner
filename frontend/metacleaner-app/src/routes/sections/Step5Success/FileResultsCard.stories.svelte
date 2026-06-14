<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FileResultsCard from './FileResultsCard.svelte';
	import type { QueuedFile } from '$lib/scanner/types';
	import type { FileMetadataResult } from '$lib/types/processing';

	const { Story } = defineMeta({
		title: 'Step5/FileResultsCard',
		component: FileResultsCard,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});

	const makeFile = (id: string, name: string, ext: string, type: 'image' | 'video', size: number): QueuedFile => ({
		id,
		file: null as unknown as File,
		name,
		size,
		extension: ext,
		type,
		format: null,
		scanResult: null
	});

	const makeResult = (fileId: string, gpsRemoved: boolean, exifCount: number, totalFields: number): FileMetadataResult => ({
		fileId,
		gpsRemoved,
		exifCount,
		xmpCount: 0,
		id3Count: 0,
		mp4AtomsCount: 0,
		pngChunksCount: 0,
		totalFields
	});

	const singleFile: QueuedFile[] = [
		makeFile('f1', 'portrait.jpg', '.jpg', 'image', 2457600)
	];

	const singleResult: FileMetadataResult[] = [
		makeResult('f1', true, 14, 14)
	];

	const multipleFiles: QueuedFile[] = [
		makeFile('g1', 'portrait.jpg', '.jpg', 'image', 2457600),
		makeFile('g2', 'IMG_5623.heic', '.heic', 'image', 3145728),
		makeFile('g3', 'vacation_beach.heic', '.heic', 'image', 4194304),
		makeFile('g4', 'screenshot.png', '.png', 'image', 1048576),
		makeFile('g5', 'walk_prague.mp4', '.mp4', 'video', 52428800)
	];

	const multipleResults: FileMetadataResult[] = [
		makeResult('g1', true, 8, 8),
		makeResult('g2', false, 22, 22),
		makeResult('g3', true, 31, 31),
		makeResult('g4', false, 3, 3),
		{ fileId: 'g5', gpsRemoved: false, exifCount: 0, xmpCount: 0, id3Count: 0, mp4AtomsCount: 12, pngChunksCount: 0, totalFields: 12 }
	];
</script>

<Story name="Single File">
	<div class="w-full max-w-2xl p-4">
		<FileResultsCard
			files={singleFile}
			fileResults={singleResult}
			onDownload={() => {}}
			onViewReport={() => {}}
		/>
	</div>
</Story>

<Story name="Multiple Files">
	<div class="w-full max-w-2xl p-4">
		<FileResultsCard
			files={multipleFiles}
			fileResults={multipleResults}
			onDownload={() => {}}
			onViewReport={() => {}}
		/>
	</div>
</Story>
