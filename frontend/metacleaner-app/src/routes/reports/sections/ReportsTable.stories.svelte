<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ReportsTable from './ReportsTable.svelte';
	import type { Report } from '$lib/types/report';

	const { Story } = defineMeta({
		title: 'Reports/Sections/ReportsTable',
		component: ReportsTable,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});

	const mockReports: Report[] = [
		{
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
		},
		{
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
		},
		{
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
		},
		{
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
		}
	];
</script>

<Story name="With Data">
	<div class="w-full max-w-5xl p-4">
		<ReportsTable reports={mockReports} totalCount={mockReports.length} onDownload={() => {}} />
	</div>
</Story>

<Story name="Empty State">
	<div class="w-full max-w-5xl p-4">
		<ReportsTable reports={[]} totalCount={0} onDownload={() => {}} />
	</div>
</Story>

<Story name="Filtered — Single Result">
	<div class="w-full max-w-5xl p-4">
		<ReportsTable reports={[mockReports[0]]} totalCount={mockReports.length} onDownload={() => {}} />
	</div>
</Story>
