<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MetadataComparisonCard from './MetadataComparisonCard.svelte';

	const desktopFields = [
		{ icon: 'fa-location-dot', labelKey: 'meta_field_gps', value: '50.0755°N, 14.4378°E' },
		{ icon: 'fa-mobile-screen', labelKey: 'meta_field_device', value: 'Apple iPhone 15 Pro' },
		{ icon: 'fa-calendar', labelKey: 'meta_field_datetime', value: '2024-03-15 14:32:07' },
		{ icon: 'fa-user', labelKey: 'meta_field_author', value: 'Jan Novák' },
		{ icon: 'fa-camera', labelKey: 'meta_field_camera', value: 'f/1.8 · 1/120s · ISO 64' }
	];

	const mobileFields = [
		{ icon: 'fa-location-dot', labelKey: 'meta_field_gps_short', value: '50.07°N, 14.43°E' },
		{ icon: 'fa-mobile-screen', labelKey: 'meta_field_device_short', value: 'iPhone 15 Pro' },
		{ icon: 'fa-calendar', labelKey: 'meta_field_datetime_short', value: '2024-03-15 14:32' },
		{ icon: 'fa-user', labelKey: 'meta_field_author_short', value: 'Jan Novák' }
	];

	const { Story } = defineMeta({
		title: 'Home/MetadataComparisonCard',
		component: MetadataComparisonCard,
		tags: ['autodocs'],
		argTypes: {
			variant: { control: { type: 'select' }, options: ['before', 'after'] },
			size: { control: { type: 'select' }, options: ['desktop', 'mobile'] }
		},
		args: {
			variant: 'before',
			fields: desktopFields,
			size: 'desktop'
		}
	});
</script>

<!-- Desktop / Before -->
<Story
	name="Desktop / Before"
	args={{ variant: 'before', fields: desktopFields, size: 'desktop' }}
/>

<!-- Desktop / After -->
<Story name="Desktop / After" args={{ variant: 'after', fields: desktopFields, size: 'desktop' }} />

<!-- Mobile / Before -->
<Story name="Mobile / Before" args={{ variant: 'before', fields: mobileFields, size: 'mobile' }} />

<!-- Mobile / After -->
<Story name="Mobile / After" args={{ variant: 'after', fields: mobileFields, size: 'mobile' }} />
