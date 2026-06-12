<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MetadataCategoryCard from './MetadataCategoryCard.svelte';

	const { Story } = defineMeta({
		title: 'Step5Success/MetadataCategoryCard',
		component: MetadataCategoryCard,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<!-- HighRisk: GPS location before cleaning — high field count, red variant -->
<Story name="HighRisk">
	<div class="w-full max-w-sm p-4">
		<MetadataCategoryCard
			icon="fa-location-dot"
			label="GPS Location"
			variant="before"
			valueText="14 files"
		/>
	</div>
</Story>

<!-- LowRisk: other metadata before cleaning — smaller count -->
<Story name="LowRisk">
	<div class="w-full max-w-sm p-4">
		<MetadataCategoryCard
			icon="fa-ellipsis"
			label="Other Metadata"
			variant="before"
			valueText="3 fields"
		/>
	</div>
</Story>

<!-- AllClean: GPS after cleaning — green "Removed" state -->
<Story name="AllClean">
	<div class="w-full max-w-sm p-4">
		<MetadataCategoryCard
			icon="fa-location-dot"
			label="GPS Location"
			variant="after"
			valueText="Removed"
		/>
	</div>
</Story>

<!-- WithManyFields: EXIF category before cleaning with large count, mobile compact -->
<Story name="WithManyFields">
	<div class="w-full max-w-sm p-4">
		<MetadataCategoryCard
			icon="fa-camera"
			label="EXIF Data"
			variant="before"
			valueText="247 fields"
			compact
		/>
	</div>
</Story>
