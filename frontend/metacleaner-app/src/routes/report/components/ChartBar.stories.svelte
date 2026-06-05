<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ChartBar from './ChartBar.svelte';

	const { Story } = defineMeta({
		title: 'Report/ChartBar',
		component: ChartBar,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }],
			},
		},
	});
</script>

<Story name="Red — high value">
	<div class="bg-navy-card p-4 rounded-xl w-80">
		<ChartBar label="GPS Data" value={42} maxValue={100} color="red" icon="fa-location-dot" />
	</div>
</Story>

<Story name="Orange — medium value">
	<div class="bg-navy-card p-4 rounded-xl w-80">
		<ChartBar label="Camera Info" value={28} maxValue={100} color="orange" icon="fa-camera" />
	</div>
</Story>

<Story name="Blue — low value">
	<div class="bg-navy-card p-4 rounded-xl w-80">
		<ChartBar label="Software Tags" value={15} maxValue={100} color="blue" icon="fa-tag" />
	</div>
</Story>

<Story name="Green — full bar (100%)">
	<div class="bg-navy-card p-4 rounded-xl w-80">
		<ChartBar label="EXIF Fields" value={100} maxValue={100} color="green" icon="fa-image" />
	</div>
</Story>

<Story name="Zero value">
	<div class="bg-navy-card p-4 rounded-xl w-80">
		<ChartBar label="XMP Data" value={0} maxValue={100} color="blue" icon="fa-file-code" />
	</div>
</Story>

<Story name="All colors — multiple bars">
	<div class="bg-navy-card p-4 rounded-xl w-80 flex flex-col gap-4">
		<ChartBar label="GPS Data" value={42} maxValue={87} color="red" icon="fa-location-dot" />
		<ChartBar label="Camera Info" value={28} maxValue={87} color="orange" icon="fa-camera" />
		<ChartBar label="Software Tags" value={15} maxValue={87} color="blue" icon="fa-tag" />
		<ChartBar label="EXIF Fields" value={87} maxValue={87} color="green" icon="fa-image" />
	</div>
</Story>
