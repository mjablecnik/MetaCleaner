<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ReportDetailHeader from './ReportDetailHeader.svelte';
	import type { ReportDetail } from '$lib/types/report';

	const { Story } = defineMeta({
		title: 'Report/ReportDetailHeader',
		component: ReportDetailHeader,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});

	const reportDetail: ReportDetail = {
		reportId: 'RPT-2024-001-ABCD',
		date: '15 Mar 2024',
		filesProcessed: 5,
		fieldsRemoved: 87,
		gpsLocationsRemoved: 3,
		totalTimeSeconds: 42,
		chartData: [],
		files: []
	};
</script>

<Story name="Default">
	<div class="w-full max-w-4xl p-4">
		<ReportDetailHeader
			{reportDetail}
			userEmail="user@example.com"
			onDownloadPdf={() => {}}
		/>
	</div>
</Story>

<Story name="No Report Data">
	<div class="w-full max-w-4xl p-4">
		<ReportDetailHeader
			reportDetail={null}
			userEmail="user@example.com"
			onDownloadPdf={() => {}}
		/>
	</div>
</Story>
