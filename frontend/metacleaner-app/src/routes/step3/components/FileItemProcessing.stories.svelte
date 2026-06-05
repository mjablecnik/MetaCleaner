<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FileItemProcessing from './FileItemProcessing.svelte';
	import type { QueuedFile } from '$lib/scanner/types';

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
		file: new File([], 'IMG_4821.jpg', { type: 'image/jpeg' }),
		name: 'IMG_4821.jpg',
		size: 3355443,
		extension: '.jpg',
		type: 'image',
		format: 'jpeg',
		scanResult: null
	} satisfies QueuedFile;

	const imageFileWithGps = {
		id: 'photo-holiday-2024',
		file: new File([], 'photo_holiday_2024.heic', { type: 'image/heic' }),
		name: 'photo_holiday_2024.heic',
		size: 9122611,
		extension: '.heic',
		type: 'image',
		format: 'heic',
		scanResult: null
	} satisfies QueuedFile;

	const videoFile = {
		id: 'video-prague-walk',
		file: new File([], 'video_prague_walk.mp4', { type: 'video/mp4' }),
		name: 'video_prague_walk.mp4',
		size: 149373952,
		extension: '.mp4',
		type: 'video',
		format: 'mp4',
		scanResult: null
	} satisfies QueuedFile;
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
