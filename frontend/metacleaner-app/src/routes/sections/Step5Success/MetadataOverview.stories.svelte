<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MetadataOverview from './MetadataOverview.svelte';
	import type { MetadataBreakdown } from '$lib/types/processing';

	const { Story } = defineMeta({
		title: 'Step5/MetadataOverview',
		component: MetadataOverview,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});

	const withGpsBreakdown: MetadataBreakdown = {
		gpsLocations: 3,
		exifFields: 18,
		xmpFields: 7,
		id3mp4Fields: 0,
		otherFields: 2
	};

	const withoutGpsBreakdown: MetadataBreakdown = {
		gpsLocations: 0,
		exifFields: 12,
		xmpFields: 4,
		id3mp4Fields: 2,
		otherFields: 1
	};
</script>

<Story name="With GPS Removed">
	<div class="w-full max-w-4xl p-4">
		<MetadataOverview
			beforeBreakdown={withGpsBreakdown}
			totalFieldsBefore={30}
			gpsLocationsRemoved={3}
		/>
	</div>
</Story>

<Story name="Without GPS">
	<div class="w-full max-w-4xl p-4">
		<MetadataOverview
			beforeBreakdown={withoutGpsBreakdown}
			totalFieldsBefore={19}
			gpsLocationsRemoved={0}
		/>
	</div>
</Story>
