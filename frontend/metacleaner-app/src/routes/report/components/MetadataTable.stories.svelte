<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MetadataTable from './MetadataTable.svelte';

	const { Story } = defineMeta({
		title: 'Report/MetadataTable',
		component: MetadataTable,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Few fields">
	<div class="w-80 rounded-xl bg-navy-card p-4">
		<MetadataTable
			fields={[
				{ label: 'GPS Latitude', value: '48.8566° N' },
				{ label: 'GPS Longitude', value: '2.3522° E' },
				{ label: 'GPS Altitude', value: '35 m' }
			]}
		/>
	</div>
</Story>

<Story name="Many fields">
	<div class="w-80 rounded-xl bg-navy-card p-4">
		<MetadataTable
			fields={[
				{ label: 'Make', value: 'Apple' },
				{ label: 'Model', value: 'iPhone 14 Pro' },
				{ label: 'Software', value: 'iOS 16.5' },
				{ label: 'DateTime', value: '2024:03:15 14:32:01' },
				{ label: 'ExposureTime', value: '1/120' },
				{ label: 'FNumber', value: 'f/1.8' },
				{ label: 'ISO', value: '64' },
				{ label: 'FocalLength', value: '6.86 mm' },
				{ moreCount: 12, label: '', value: '' }
			]}
		/>
	</div>
</Story>

<Story name="With more count row">
	<div class="w-80 rounded-xl bg-navy-card p-4">
		<MetadataTable
			fields={[
				{ label: 'GPS Latitude', value: '48.8566° N' },
				{ label: 'GPS Longitude', value: '2.3522° E' },
				{ moreCount: 5, label: '', value: '' }
			]}
		/>
	</div>
</Story>

<Story name="Single field">
	<div class="w-80 rounded-xl bg-navy-card p-4">
		<MetadataTable fields={[{ label: 'Author', value: 'John Doe' }]} />
	</div>
</Story>
