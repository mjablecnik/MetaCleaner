<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MetadataPanel from './MetadataPanel.svelte';

	const { Story } = defineMeta({
		title: 'Step5/MetadataPanel',
		component: MetadataPanel,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }],
			},
		},
	});

	const richBreakdown = {
		gpsLocations: 3,
		exifFields: 47,
		xmpFields: 12,
		id3mp4Fields: 8,
		otherFields: 5,
	};

	const emptyBreakdown = {
		gpsLocations: 0,
		exifFields: 0,
		xmpFields: 0,
		id3mp4Fields: 0,
		otherFields: 0,
	};
</script>

<Story name="Before — With Data">
	<div class="w-full max-w-sm p-4">
		<MetadataPanel type="before" breakdown={richBreakdown} totalFieldsRemoved={75} />
	</div>
</Story>

<Story name="After — All Cleaned">
	<div class="w-full max-w-sm p-4">
		<MetadataPanel type="after" breakdown={richBreakdown} totalFieldsRemoved={75} />
	</div>
</Story>

<Story name="Before and After — Side by Side">
	<div class="w-full max-w-2xl p-4 grid grid-cols-2 gap-4">
		<MetadataPanel type="before" breakdown={richBreakdown} totalFieldsRemoved={75} />
		<MetadataPanel type="after" breakdown={richBreakdown} totalFieldsRemoved={75} />
	</div>
</Story>

<Story name="Before — Empty State">
	<div class="w-full max-w-sm p-4">
		<MetadataPanel type="before" breakdown={emptyBreakdown} totalFieldsRemoved={0} />
	</div>
</Story>
