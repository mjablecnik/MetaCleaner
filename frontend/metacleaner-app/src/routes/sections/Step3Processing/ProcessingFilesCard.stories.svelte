<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ProcessingFilesCard from './ProcessingFilesCard.svelte';
	import type { QueuedFile } from '$lib/scanner/types';
	import type { FileWithState } from './ProcessingFilesCard.svelte';

	const { Story } = defineMeta({
		title: 'Step3/ProcessingFilesCard',
		component: ProcessingFilesCard,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});

	const makeFile = (
		id: string,
		name: string,
		ext: string,
		type: 'image' | 'video',
		size: number
	): QueuedFile => ({
		id,
		file: null as unknown as File,
		name,
		size,
		extension: ext,
		type,
		format: null,
		scanResult: null
	});

	const processingFiles: FileWithState[] = [
		{
			file: makeFile('f1', 'portrait.jpg', '.jpg', 'image', 2457600),
			state: { status: 'done', progress: 100, fieldsRemoved: 8, gpsRemoved: true }
		},
		{
			file: makeFile('f2', 'IMG_5623.heic', '.heic', 'image', 3145728),
			state: { status: 'done', progress: 100, fieldsRemoved: 22, gpsRemoved: false }
		},
		{
			file: makeFile('f3', 'vacation_beach.heic', '.heic', 'image', 4194304),
			state: { status: 'in_progress', progress: 55, fieldsRemoved: 0, gpsRemoved: false }
		},
		{
			file: makeFile('f4', 'screenshot.png', '.png', 'image', 1048576),
			state: { status: 'waiting', progress: 0, fieldsRemoved: 0, gpsRemoved: false }
		},
		{
			file: makeFile('f5', 'walk_prague.mp4', '.mp4', 'video', 52428800),
			state: { status: 'waiting', progress: 0, fieldsRemoved: 0, gpsRemoved: false }
		}
	];

	const someCompletedFiles: FileWithState[] = [
		{
			file: makeFile('g1', 'portrait.jpg', '.jpg', 'image', 2457600),
			state: { status: 'done', progress: 100, fieldsRemoved: 8, gpsRemoved: true }
		},
		{
			file: makeFile('g2', 'IMG_5623.heic', '.heic', 'image', 3145728),
			state: { status: 'done', progress: 100, fieldsRemoved: 22, gpsRemoved: false }
		},
		{
			file: makeFile('g3', 'vacation_beach.heic', '.heic', 'image', 4194304),
			state: { status: 'done', progress: 100, fieldsRemoved: 31, gpsRemoved: true }
		},
		{
			file: makeFile('g4', 'screenshot.png', '.png', 'image', 1048576),
			state: { status: 'done', progress: 100, fieldsRemoved: 3, gpsRemoved: false }
		},
		{
			file: makeFile('g5', 'walk_prague.mp4', '.mp4', 'video', 52428800),
			state: { status: 'in_progress', progress: 78, fieldsRemoved: 0, gpsRemoved: false }
		}
	];
</script>

<Story name="Processing">
	<div class="w-full max-w-2xl p-4">
		<ProcessingFilesCard
			processedFiles={processingFiles}
			overallProgress={40}
			filesCompleted={2}
			totalFiles={5}
			timeRemainingSeconds={120}
			onStop={() => {}}
		/>
	</div>
</Story>

<Story name="Some Completed">
	<div class="w-full max-w-2xl p-4">
		<ProcessingFilesCard
			processedFiles={someCompletedFiles}
			overallProgress={88}
			filesCompleted={4}
			totalFiles={5}
			timeRemainingSeconds={18}
			onStop={() => {}}
		/>
	</div>
</Story>
