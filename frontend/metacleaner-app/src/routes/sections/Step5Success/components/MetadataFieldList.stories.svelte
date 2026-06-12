<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MetadataFieldList from './MetadataFieldList.svelte';

	const { Story } = defineMeta({
		title: 'Step5Success/MetadataFieldList',
		component: MetadataFieldList,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<!-- FewFields: only GPS and EXIF before cleaning -->
<Story name="FewFields">
	<div class="w-full max-w-sm p-4">
		<MetadataFieldList
			breakdown={{ gpsLocations: 2, exifFields: 8, xmpFields: 0, id3mp4Fields: 0, otherFields: 0 }}
			gpsCount={2}
			mode="before"
		/>
	</div>
</Story>

<!-- ManyFields: all categories with high counts before cleaning -->
<Story name="ManyFields">
	<div class="w-full max-w-sm p-4">
		<MetadataFieldList
			breakdown={{
				gpsLocations: 14,
				exifFields: 247,
				xmpFields: 63,
				id3mp4Fields: 18,
				otherFields: 12
			}}
			gpsCount={14}
			mode="before"
		/>
	</div>
</Story>

<!-- AllRemoved: after cleaning — all categories show "Removed" -->
<Story name="AllRemoved">
	<div class="w-full max-w-sm p-4">
		<MetadataFieldList
			breakdown={{
				gpsLocations: 14,
				exifFields: 247,
				xmpFields: 63,
				id3mp4Fields: 18,
				otherFields: 12
			}}
			gpsCount={14}
			mode="after"
		/>
	</div>
</Story>

<!-- Mixed: GPS + EXIF + XMP only (no ID3 or other), compact mobile variant -->
<Story name="Mixed">
	<div class="w-full max-w-sm p-4">
		<MetadataFieldList
			breakdown={{
				gpsLocations: 5,
				exifFields: 32,
				xmpFields: 11,
				id3mp4Fields: 0,
				otherFields: 0
			}}
			gpsCount={5}
			mode="before"
			compact
		/>
	</div>
</Story>
