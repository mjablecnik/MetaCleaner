<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MetadataFieldRow from './MetadataFieldRow.svelte';

	const gpsField = { icon: 'fa-location-dot', labelKey: 'meta_field_gps', value: '50.0755°N, 14.4378°E' };
	const gpsFieldMobile = { icon: 'fa-location-dot', labelKey: 'meta_field_gps_short', value: '50.07°N, 14.43°E' };

	const { Story } = defineMeta({
		title: 'Home/MetadataFieldRow',
		component: MetadataFieldRow,
		tags: ['autodocs'],
		argTypes: {
			variant: { control: { type: 'select' }, options: ['before', 'after'] },
			size: { control: { type: 'select' }, options: ['desktop', 'mobile'] }
		},
		args: {
			field: gpsField,
			variant: 'before',
			size: 'desktop'
		}
	});
</script>

<!-- Desktop before -->
<Story name="Desktop / Before" args={{ field: gpsField, variant: 'before', size: 'desktop' }} />

<!-- Desktop after -->
<Story name="Desktop / After" args={{ field: gpsField, variant: 'after', size: 'desktop' }} />

<!-- Mobile before -->
<Story name="Mobile / Before" args={{ field: gpsFieldMobile, variant: 'before', size: 'mobile' }} />

<!-- Mobile after -->
<Story name="Mobile / After" args={{ field: gpsFieldMobile, variant: 'after', size: 'mobile' }} />
