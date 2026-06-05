<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FileItemProcessing from './FileItemProcessing.svelte';
	import type { UploadedFile } from '$lib/repositories/fileRepository';

	const { Story } = defineMeta({
		title: 'Step3/FileItemProcessing',
		component: FileItemProcessing,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});

	const imageFile = {
		id: 'img-4821',
		name: 'IMG_4821.jpg',
		size: '3.2 MB',
		extension: 'JPG',
		type: 'image',
		metadataFieldCount: 12,
		hasGps: false,
		device: 'Canon EOS R5'
	} satisfies UploadedFile;

	const imageFileWithGps = {
		id: 'photo-holiday-2024',
		name: 'photo_holiday_2024.heic',
		size: '8.7 MB',
		extension: 'HEIC',
		type: 'image',
		metadataFieldCount: 18,
		hasGps: true,
		device: 'iPhone 15 Pro'
	} satisfies UploadedFile;

	const videoFile = {
		id: 'video-prague-walk',
		name: 'video_prague_walk.mp4',
		size: '142.5 MB',
		extension: 'MP4',
		type: 'video',
		metadataFieldCount: 8,
		hasGps: false,
		device: 'H.264'
	} satisfies UploadedFile;
</script>

<Story name="Done — image, no GPS">
	<div class="w-full max-w-md p-4">
		<FileItemProcessing file={imageFile} status="done" fieldsRemoved={12} gpsRemoved={false} />
	</div>
</Story>

<Story name="Done — image with GPS removed">
	<div class="w-full max-w-md p-4">
		<FileItemProcessing
			file={imageFileWithGps}
			status="done"
			fieldsRemoved={18}
			gpsRemoved={true}
		/>
	</div>
</Story>

<Story name="In Progress — video file">
	<div class="w-full max-w-md p-4">
		<FileItemProcessing file={videoFile} status="in_progress" progress={38} />
	</div>
</Story>

<Story name="In Progress — image file">
	<div class="w-full max-w-md p-4">
		<FileItemProcessing file={imageFile} status="in_progress" progress={65} />
	</div>
</Story>

<Story name="Queued">
	<div class="w-full max-w-md p-4">
		<FileItemProcessing file={imageFile} status="waiting" />
	</div>
</Story>
