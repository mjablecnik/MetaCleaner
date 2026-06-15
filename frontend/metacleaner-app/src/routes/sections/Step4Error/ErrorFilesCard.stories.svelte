<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from 'storybook/test';
	import ErrorFilesCard from './ErrorFilesCard.svelte';
	import type { FileWithErrorState } from './ErrorFilesCard.svelte';
	import type { QueuedFile } from '$lib/scanner/types';

	const { Story } = defineMeta({
		title: 'Step4/ErrorFilesCard',
		component: ErrorFilesCard,
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
		name: 'photo.jpg',
		size: 3_276_800,
		extension: '.jpg',
		type: 'image',
		format: 'jpeg'
	};

	const singleFileState: FileWithErrorState[] = [
		{
			file: {
				...base,
				id: 'file-001',
				name: 'vacation_beach.heic',
				size: 9_175_040,
				extension: '.heic',
				format: 'heic',
				scanResult: null
			},
			status: 'error',
			fieldsRemoved: 0,
			gpsRemoved: false
		}
	];

	const multipleFilesState: FileWithErrorState[] = [
		{
			file: {
				...base,
				id: 'file-001',
				name: 'portrait.jpg',
				size: 4_194_304,
				extension: '.jpg',
				format: 'jpeg',
				scanResult: null
			},
			status: 'done',
			fieldsRemoved: 12,
			gpsRemoved: true
		},
		{
			file: {
				...base,
				id: 'file-002',
				name: 'IMG_5623.heic',
				size: 9_175_040,
				extension: '.heic',
				format: 'heic',
				scanResult: null
			},
			status: 'error',
			fieldsRemoved: 0,
			gpsRemoved: false
		},
		{
			file: {
				...base,
				id: 'file-003',
				name: 'screenshot.png',
				size: 512_000,
				extension: '.png',
				format: 'png',
				scanResult: null
			},
			status: 'skipped',
			fieldsRemoved: 0,
			gpsRemoved: false
		},
		{
			file: {
				...base,
				id: 'file-004',
				name: 'walk_prague.mp4',
				size: 149_946_368,
				extension: '.mp4',
				type: 'video',
				format: 'mp4',
				scanResult: null
			},
			status: 'done',
			fieldsRemoved: 6,
			gpsRemoved: false
		}
	];
</script>

<Story name="Single File Error">
	<div class="w-full max-w-lg p-4">
		<ErrorFilesCard
			filesWithState={singleFileState}
			doneCount={0}
			totalFiles={1}
			overallProgress={35}
			onTryAgain={fn()}
			onClearAll={fn()}
		/>
	</div>
</Story>

<Story name="Multiple Files — Mixed Results">
	<div class="w-full max-w-lg p-4">
		<ErrorFilesCard
			filesWithState={multipleFilesState}
			doneCount={2}
			totalFiles={4}
			overallProgress={65}
			onTryAgain={fn()}
			onClearAll={fn()}
		/>
	</div>
</Story>
