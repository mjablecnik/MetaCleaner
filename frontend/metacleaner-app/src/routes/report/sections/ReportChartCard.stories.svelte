<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ReportChartCard from './ReportChartCard.svelte';
	import type { ReportDetail, ReportFileDetail } from '$lib/types/report';

	const { Story } = defineMeta({
		title: 'Report/ReportChartCard',
		component: ReportChartCard,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});

	const singleImageFile: ReportFileDetail = {
		name: 'portrait.jpg',
		extension: 'JPG',
		sizeMB: '2.4',
		format: 'JPEG',
		device: 'iPhone 14 Pro',
		type: 'image',
		iconColor: 'green',
		hasGps: true,
		fieldsRemoved: 42,
		barWidthPercent: 100,
		barGradientFrom: 'brand-green',
		barGradientTo: 'green-400',
		metadata: {
			gpsFields: [
				{ label: 'GPS Latitude', value: '48.8566° N' },
				{ label: 'GPS Longitude', value: '2.3522° E' }
			],
			exifFields: [
				{ label: 'Make', value: 'Apple' },
				{ label: 'Model', value: 'iPhone 14 Pro' },
				{ label: 'Software', value: 'iOS 16.5' }
			],
			xmpFields: [{ label: 'Creator', value: 'John Doe' }],
			id3Fields: [],
			mp4AtomFields: [],
			totalRemoved: 42
		}
	};

	const defaultReportDetail: ReportDetail = {
		reportId: 'RPT-2024-001-ABCD',
		date: '15 Mar 2024',
		filesProcessed: 1,
		fieldsRemoved: 42,
		gpsLocationsRemoved: 2,
		totalTimeSeconds: 8,
		chartData: [
			{ label: 'GPS', fields: 12, percentage: 29 },
			{ label: 'EXIF', fields: 22, percentage: 52 },
			{ label: 'XMP', fields: 8, percentage: 19 }
		],
		files: [singleImageFile]
	};

	const multipleFiles: ReportFileDetail[] = [
		{
			name: 'vacation_beach.heic',
			extension: 'HEIC',
			sizeMB: '5.8',
			format: 'HEIF',
			device: 'iPhone 15',
			type: 'image',
			iconColor: 'orange',
			hasGps: true,
			fieldsRemoved: 56,
			barWidthPercent: 64,
			barGradientFrom: 'brand-orange',
			barGradientTo: 'orange-400',
			metadata: {
				gpsFields: [
					{ label: 'GPS Latitude', value: '43.7102° N' },
					{ label: 'GPS Longitude', value: '7.2620° E' },
					{ label: 'GPS Altitude', value: '12 m' }
				],
				exifFields: [
					{ label: 'Make', value: 'Apple' },
					{ label: 'Model', value: 'iPhone 15' },
					{ label: 'ExposureTime', value: '1/1000' },
					{ moreCount: 8, label: '', value: '' }
				],
				xmpFields: [{ label: 'Creator', value: 'Jane Smith' }],
				id3Fields: [],
				mp4AtomFields: [],
				totalRemoved: 56
			}
		},
		{
			name: 'city_walk.mp4',
			extension: 'MP4',
			sizeMB: '124.5',
			format: 'MPEG-4',
			device: 'Samsung Galaxy S23',
			type: 'video',
			iconColor: 'blue',
			hasGps: false,
			fieldsRemoved: 31,
			barWidthPercent: 36,
			barGradientFrom: 'brand-blue',
			barGradientTo: 'blue-400',
			metadata: {
				gpsFields: [],
				exifFields: [{ label: 'Make', value: 'Samsung' }],
				xmpFields: [],
				id3Fields: [{ label: 'Title', value: 'City Walk' }],
				mp4AtomFields: [{ label: 'com.apple.quicktime.make', value: 'Samsung' }],
				totalRemoved: 31
			}
		}
	];

	const varyingReportDetail: ReportDetail = {
		reportId: 'RPT-2024-002-EFGH',
		date: '20 Apr 2024',
		filesProcessed: 2,
		fieldsRemoved: 87,
		gpsLocationsRemoved: 5,
		totalTimeSeconds: 21,
		chartData: [
			{ label: 'GPS', fields: 35, percentage: 40 },
			{ label: 'EXIF', fields: 38, percentage: 44 },
			{ label: 'XMP', fields: 14, percentage: 16 }
		],
		files: multipleFiles
	};
</script>

<Story name="Default">
	<div class="w-full max-w-5xl p-4">
		<ReportChartCard reportDetail={defaultReportDetail} />
	</div>
</Story>

<Story name="Varying Chart Data">
	<div class="w-full max-w-5xl p-4">
		<ReportChartCard reportDetail={varyingReportDetail} />
	</div>
</Story>

<Story name="No Data">
	<div class="w-full max-w-5xl p-4">
		<ReportChartCard reportDetail={null} />
	</div>
</Story>
