<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FileAccordionList from './FileAccordionList.svelte';
	import type { ReportFileDetail } from '$lib/types/report';

	const { Story } = defineMeta({
		title: 'Report/FileAccordionList',
		component: FileAccordionList,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});

	const imageFile: ReportFileDetail = {
		name: 'vacation_beach.jpg',
		extension: 'JPG',
		sizeMB: '3.2',
		format: 'JPEG',
		device: 'iPhone 14 Pro',
		type: 'image',
		iconColor: 'green',
		hasGps: false,
		fieldsRemoved: 12,
		barWidthPercent: 14,
		barGradientFrom: 'brand-green',
		barGradientTo: 'green-400',
		metadata: {
			gpsFields: [],
			exifFields: [
				{ label: 'Make', value: 'Apple' },
				{ label: 'Model', value: 'iPhone 14 Pro' },
				{ label: 'Software', value: 'iOS 16.5' },
				{ label: 'DateTime', value: '2024:03:15 14:32:01' }
			],
			xmpFields: [
				{ label: 'Creator', value: 'John Doe' },
				{ label: 'Rights', value: 'All rights reserved' }
			],
			id3Fields: [],
			mp4AtomFields: [],
			totalRemoved: 12
		}
	};

	const imageFileWithGps: ReportFileDetail = {
		name: 'city_walk.heic',
		extension: 'HEIC',
		sizeMB: '5.8',
		format: 'HEIF',
		device: 'iPhone 15',
		type: 'image',
		iconColor: 'orange',
		hasGps: true,
		fieldsRemoved: 43,
		barWidthPercent: 49,
		barGradientFrom: 'brand-orange',
		barGradientTo: 'orange-400',
		metadata: {
			gpsFields: [
				{ label: 'GPS Latitude', value: '48.8566° N' },
				{ label: 'GPS Longitude', value: '2.3522° E' },
				{ label: 'GPS Altitude', value: '35 m' }
			],
			exifFields: [
				{ label: 'Make', value: 'Apple' },
				{ label: 'Model', value: 'iPhone 15' },
				{ label: 'ExposureTime', value: '1/120' },
				{ label: 'FNumber', value: 'f/1.8' },
				{ moreCount: 8, label: '', value: '' }
			],
			xmpFields: [{ label: 'Creator', value: 'Jane Smith' }],
			id3Fields: [],
			mp4AtomFields: [],
			totalRemoved: 43
		}
	};

	const videoFile: ReportFileDetail = {
		name: 'family_reunion.mp4',
		extension: 'MP4',
		sizeMB: '142.5',
		format: 'MPEG-4',
		device: 'Samsung Galaxy S23',
		type: 'video',
		iconColor: 'blue',
		hasGps: false,
		fieldsRemoved: 18,
		barWidthPercent: 21,
		barGradientFrom: 'brand-blue',
		barGradientTo: 'blue-400',
		metadata: {
			gpsFields: [],
			exifFields: [
				{ label: 'Make', value: 'Samsung' },
				{ label: 'Model', value: 'Galaxy S23' },
				{ label: 'Software', value: 'Android 13' }
			],
			xmpFields: [
				{ label: 'Creator', value: 'Bob Johnson' },
				{ label: 'Duration', value: '00:03:42' }
			],
			id3Fields: [{ label: 'Title', value: 'Family Reunion 2024' }],
			mp4AtomFields: [{ label: 'com.apple.quicktime.make', value: 'Samsung' }],
			totalRemoved: 18
		}
	};
</script>

<Story name="Single File">
	<div class="w-full max-w-3xl p-4">
		<FileAccordionList files={[imageFile]} />
	</div>
</Story>

<Story name="Multiple Files">
	<div class="w-full max-w-3xl p-4">
		<FileAccordionList files={[imageFile, imageFileWithGps, videoFile]} />
	</div>
</Story>
