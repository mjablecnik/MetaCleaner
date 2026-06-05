<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FileResultItem from './FileResultItem.svelte';
	import type { QueuedFile } from '$lib/scanner/types';

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

	const makeFile = (overrides: Partial<QueuedFile>): QueuedFile => ({
		id: 'file-1',
		file: new File([], 'file'),
		name: 'file.jpg',
		size: 1024 * 1024,
		extension: '.jpg',
		type: 'image',
		format: 'jpeg',
		scanResult: null,
		...overrides
	});

	const imageWithGps = makeFile({
		id: 'photo-holiday-2024',
		name: 'photo_holiday_2024.heic',
		size: 8.7 * 1024 * 1024,
		extension: '.heic',
		type: 'image',
		format: 'heic',
		scanResult: {
			fileId: 'photo-holiday-2024',
			status: 'done',
			fields: [],
			hasGps: true,
			device: 'iPhone 15 Pro',
			fieldCount: 18,
			categoryScores: { gps: 100, deviceIdentity: 60, personalData: 0, timestamps: 50 },
			fileScore: 72
		}
	});

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

	const videoFile = makeFile({
		id: 'video-prague-walk',
		name: 'video_prague_walk.mp4',
		size: 142.5 * 1024 * 1024,
		extension: '.mp4',
		type: 'video',
		format: 'mp4',
		scanResult: {
			fileId: 'video-prague-walk',
			status: 'done',
			fields: [],
			hasGps: false,
			device: 'H.264',
			fieldCount: 43,
			categoryScores: { gps: 0, deviceIdentity: 40, personalData: 0, timestamps: 25 },
			fileScore: 16
		}
	});

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

	const imageNoGps = makeFile({
		id: 'img-4821',
		name: 'IMG_4821.jpg',
		size: 3.2 * 1024 * 1024,
		extension: '.jpg',
		type: 'image',
		format: 'jpeg',
		scanResult: {
			fileId: 'img-4821',
			status: 'done',
			fields: [],
			hasGps: false,
			device: 'Canon EOS R5',
			fieldCount: 12,
			categoryScores: { gps: 0, deviceIdentity: 80, personalData: 0, timestamps: 50 },
			fileScore: 27
		}
	});

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
