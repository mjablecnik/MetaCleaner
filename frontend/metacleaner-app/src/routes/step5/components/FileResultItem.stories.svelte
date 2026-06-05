<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FileResultItem from './FileResultItem.svelte';
	import type { UploadedFile } from '$lib/repositories/fileRepository';

	const { Story } = defineMeta({
		title: 'Step5/FileResultItem',
		component: FileResultItem,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});

	const imageWithGps = {
		id: 'photo-holiday-2024',
		name: 'photo_holiday_2024.heic',
		size: '8.7 MB',
		extension: 'HEIC',
		type: 'image',
		metadataFieldCount: 18,
		hasGps: true,
		device: 'iPhone 15 Pro'
	} satisfies UploadedFile;

	const imageWithGpsResult = {
		fileId: 'photo-holiday-2024',
		gpsRemoved: true,
		exifCount: 12,
		xmpCount: 6,
		id3Count: 0,
		mp4AtomsCount: 0,
		pngChunksCount: 0,
		totalFields: 18
	};

	const videoFile = {
		id: 'video-prague-walk',
		name: 'video_prague_walk.mp4',
		size: '142.5 MB',
		extension: 'MP4',
		type: 'video',
		metadataFieldCount: 43,
		hasGps: false,
		device: 'H.264'
	} satisfies UploadedFile;

	const videoResult = {
		fileId: 'video-prague-walk',
		gpsRemoved: false,
		exifCount: 0,
		xmpCount: 0,
		id3Count: 9,
		mp4AtomsCount: 14,
		pngChunksCount: 0,
		totalFields: 43
	};

	const imageNoGps = {
		id: 'img-4821',
		name: 'IMG_4821.jpg',
		size: '3.2 MB',
		extension: 'JPG',
		type: 'image',
		metadataFieldCount: 12,
		hasGps: false,
		device: 'Canon EOS R5'
	} satisfies UploadedFile;

	const imageNoGpsResult = {
		fileId: 'img-4821',
		gpsRemoved: false,
		exifCount: 8,
		xmpCount: 4,
		id3Count: 0,
		mp4AtomsCount: 0,
		pngChunksCount: 0,
		totalFields: 12
	};
</script>

<Story name="Image — GPS removed">
	<div class="w-full max-w-md p-4">
		<FileResultItem file={imageWithGps} result={imageWithGpsResult} />
	</div>
</Story>

<Story name="Video file">
	<div class="w-full max-w-md p-4">
		<FileResultItem file={videoFile} result={videoResult} />
	</div>
</Story>

<Story name="Image — no GPS">
	<div class="w-full max-w-md p-4">
		<FileResultItem file={imageNoGps} result={imageNoGpsResult} />
	</div>
</Story>
