<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ReportTableRow from './ReportTableRow.svelte';
	import type { Report } from '$lib/repositories/reportRepository';

	const { Story } = defineMeta({
		title: 'Reports/ReportTableRow',
		component: ReportTableRow,
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
		iconColor: 'green'
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

	const gpsReport = {
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
		iconColor: 'green'
	} satisfies Report;
</script>

<Story name="Image type">
	<div class="min-w-[700px] overflow-hidden rounded-2xl border border-gray-800 bg-navy-card">
		<ReportTableRow report={imageReport} onDownload={() => {}} />
	</div>
</Story>

<Story name="Video type">
	<div class="min-w-[700px] overflow-hidden rounded-2xl border border-gray-800 bg-navy-card">
		<ReportTableRow report={videoReport} onDownload={() => {}} />
	</div>
</Story>

<Story name="With GPS tag">
	<div class="min-w-[700px] overflow-hidden rounded-2xl border border-gray-800 bg-navy-card">
		<ReportTableRow report={gpsReport} onDownload={() => {}} />
	</div>
</Story>

<Story name="High field count — orange highlight">
	<div class="min-w-[700px] overflow-hidden rounded-2xl border border-gray-800 bg-navy-card">
		<ReportTableRow report={highFieldsReport} onDownload={() => {}} />
	</div>
</Story>

<Story name="Multiple rows">
	<div class="min-w-[700px] overflow-hidden rounded-2xl border border-gray-800 bg-navy-card">
		<ReportTableRow report={imageReport} onDownload={() => {}} />
		<ReportTableRow report={videoReport} onDownload={() => {}} />
		<ReportTableRow report={gpsReport} onDownload={() => {}} />
		<ReportTableRow report={highFieldsReport} onDownload={() => {}} />
	</div>
</Story>
