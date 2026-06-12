<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FileProcessingRow from './FileProcessingRow.svelte';
	import type { QueuedFile } from '$lib/scanner/types';

	const { Story } = defineMeta({
		title: 'Step3Processing/FileProcessingRow',
		component: FileProcessingRow,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});

	const imageFile: QueuedFile = {
		id: 'file-1',
		file: null as unknown as File,
		name: 'vacation_photo.jpg',
		size: 2457600,
		extension: '.jpg',
		type: 'image',
		format: null,
		scanResult: null
	};

	const videoFile: QueuedFile = {
		id: 'file-2',
		file: null as unknown as File,
		name: 'birthday_video.mp4',
		size: 52428800,
		extension: '.mp4',
		type: 'video',
		format: null,
		scanResult: null
	};
</script>

<!-- Waiting: file queued, not yet processed -->
<Story name="Waiting">
	<div class="w-full max-w-lg p-4">
		<FileProcessingRow
			file={imageFile}
			state={{ status: 'waiting', progress: 0, fieldsRemoved: 0, gpsRemoved: false }}
		/>
	</div>
</Story>

<!-- InProgress: file is actively being processed at 42% -->
<Story name="InProgress">
	<div class="w-full max-w-lg p-4">
		<FileProcessingRow
			file={imageFile}
			state={{ status: 'in_progress', progress: 42, fieldsRemoved: 0, gpsRemoved: false }}
		/>
	</div>
</Story>

<!-- Completed: file finished — 14 fields removed including GPS -->
<Story name="Completed">
	<div class="w-full max-w-lg p-4">
		<FileProcessingRow
			file={imageFile}
			state={{ status: 'done', progress: 100, fieldsRemoved: 14, gpsRemoved: true }}
		/>
	</div>
</Story>

<!-- Failed: file encountered an error during processing -->
<Story name="Failed">
	<div class="w-full max-w-lg p-4">
		<FileProcessingRow
			file={imageFile}
			state={{ status: 'error', progress: 0, fieldsRemoved: 0, gpsRemoved: false }}
		/>
	</div>
</Story>

<!-- Skipped: video file waiting in queue — skipped files render as dimmed waiting state -->
<Story name="Skipped">
	<div class="w-full max-w-lg p-4">
		<FileProcessingRow
			file={videoFile}
			state={{ status: 'waiting', progress: 0, fieldsRemoved: 0, gpsRemoved: false }}
		/>
	</div>
</Story>
