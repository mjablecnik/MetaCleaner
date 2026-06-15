<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ReportCard from './ReportCard.svelte';
	import type { Report } from '$lib/types/report';

	const { Story } = defineMeta({
		title: 'Reports/ReportCard',
		component: ReportCard,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});

	const imageReport = {
		id: '#A1',
		date: '2. 6. 2025',
		time: '10:22',
		duration: '28s',
		fileCount: 4,
		fileTypes: 'JPG, HEIC',
		type: 'image',
		gps: false,
		fields: 87,
		tags: ['EXIF', 'XMP'],
		reportId: 'MCR-2025-0602-A1',
		iconColor: 'blue'
	} satisfies Report;

	const videoReport = {
		id: '#B2',
		date: '29. 5. 2025',
		time: '14:05',
		duration: '1m 12s',
		fileCount: 1,
		fileTypes: 'MP4',
		type: 'video',
		gps: false,
		fields: 43,
		tags: ['XMP'],
		reportId: 'MCR-2025-0529-B2',
		iconColor: 'orange'
	} satisfies Report;

	const withTagsReport = {
		id: '#C3',
		date: '15. 5. 2025',
		time: '08:47',
		duration: '45s',
		fileCount: 6,
		fileTypes: 'JPG, HEIC, MP4',
		type: 'image',
		gps: true,
		fields: 124,
		tags: ['GPS', 'EXIF', 'XMP'],
		reportId: 'MCR-2025-0515-C3',
		iconColor: 'blue'
	} satisfies Report;

	const highFieldsReport = {
		id: '#D4',
		date: '1. 4. 2025',
		time: '16:30',
		duration: '2m 5s',
		fileCount: 12,
		fileTypes: 'JPG, PNG, TIFF',
		type: 'image',
		gps: true,
		fields: 342,
		fieldsColor: 'orange',
		tags: ['GPS', 'EXIF', 'XMP'],
		reportId: 'MCR-2025-0401-D4',
		iconColor: 'blue'
	} satisfies Report;
</script>

<Story name="Image type">
	<div class="max-w-sm overflow-hidden rounded-2xl border border-gray-800 bg-navy-card">
		<ReportCard report={imageReport} onDownload={() => {}} />
	</div>
</Story>

<Story name="Video type">
	<div class="max-w-sm overflow-hidden rounded-2xl border border-gray-800 bg-navy-card">
		<ReportCard report={videoReport} onDownload={() => {}} />
	</div>
</Story>

<Story name="With tags (GPS, EXIF, XMP)">
	<div class="max-w-sm overflow-hidden rounded-2xl border border-gray-800 bg-navy-card">
		<ReportCard report={withTagsReport} onDownload={() => {}} />
	</div>
</Story>

<Story name="High field count — orange highlight">
	<div class="max-w-sm overflow-hidden rounded-2xl border border-gray-800 bg-navy-card">
		<ReportCard report={highFieldsReport} onDownload={() => {}} />
	</div>
</Story>

<Story name="Multiple cards">
	<div class="max-w-sm overflow-hidden rounded-2xl border border-gray-800 bg-navy-card">
		<ReportCard report={imageReport} onDownload={() => {}} />
		<ReportCard report={videoReport} onDownload={() => {}} />
		<ReportCard report={withTagsReport} onDownload={() => {}} />
		<ReportCard report={highFieldsReport} onDownload={() => {}} />
	</div>
</Story>
