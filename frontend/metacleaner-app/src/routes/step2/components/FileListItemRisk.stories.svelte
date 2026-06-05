<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from 'storybook/test';
	import FileListItemRisk from './FileListItemRisk.svelte';
	import type { UploadedFile } from '$lib/repositories/fileRepository';

	const { Story } = defineMeta({
		title: 'Step2/FileListItemRisk',
		component: FileListItemRisk,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }],
			},
		},
	});

	const lowRiskImage = {
		id: 'img-4821',
		name: 'IMG_4821.jpg',
		size: '3.2 MB',
		extension: 'JPG',
		type: 'image',
		metadataFieldCount: 3,
		hasGps: false,
		device: 'Canon EOS R5',
	} satisfies UploadedFile;

	const mediumRiskVideo = {
		id: 'video-prague-walk',
		name: 'video_prague_walk.mp4',
		size: '142.5 MB',
		extension: 'MP4',
		type: 'video',
		metadataFieldCount: 43,
		hasGps: false,
		device: 'H.264',
	} satisfies UploadedFile;

	const highRiskImage = {
		id: 'photo-holiday-2024',
		name: 'photo_holiday_2024.heic',
		size: '8.7 MB',
		extension: 'HEIC',
		type: 'image',
		metadataFieldCount: 18,
		hasGps: true,
		device: 'iPhone 15 Pro',
	} satisfies UploadedFile;
</script>

<Story name="Low Risk — few fields, no GPS">
	<div class="w-full max-w-md p-4">
		<FileListItemRisk file={lowRiskImage} onRemove={fn()} />
	</div>
</Story>

<Story name="Medium Risk — many metadata fields">
	<div class="w-full max-w-md p-4">
		<FileListItemRisk file={mediumRiskVideo} onRemove={fn()} />
	</div>
</Story>

<Story name="High Risk — GPS detected">
	<div class="w-full max-w-md p-4">
		<FileListItemRisk file={highRiskImage} onRemove={fn()} />
	</div>
</Story>
