<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FormatPill from './FormatPill.svelte';

	const { Story } = defineMeta({
		title: 'Features/FormatPill',
		component: FormatPill,
		tags: ['autodocs'],
		argTypes: {
			size: {
				control: { type: 'select' },
				options: ['desktop', 'mobile']
			}
		},
		args: {
			format: { icon: 'fa-location-dot', color: 'brand-red', label: 'GPS Coordinates' },
			size: 'desktop'
		}
	});
</script>

<!-- Color variants (desktop) -->
<Story
	name="Red — desktop"
	args={{
		format: { icon: 'fa-location-dot', color: 'brand-red', label: 'GPS Coordinates' },
		size: 'desktop'
	}}
/>
<Story
	name="Orange — desktop"
	args={{
		format: { icon: 'fa-mobile-screen', color: 'brand-orange', label: 'Device Info' },
		size: 'desktop'
	}}
/>
<Story
	name="Blue — desktop"
	args={{
		format: { icon: 'fa-camera', color: 'brand-blue', label: 'Camera Model' },
		size: 'desktop'
	}}
/>
<Story
	name="Green — desktop"
	args={{
		format: { icon: 'fa-calendar', color: 'brand-green', label: 'Date & Time' },
		size: 'desktop'
	}}
/>
<Story
	name="Muted — desktop"
	args={{ format: { icon: 'fa-code', color: 'text-muted', label: 'Software' }, size: 'desktop' }}
/>

<!-- Mobile variants -->
<Story
	name="Red — mobile"
	args={{
		format: { icon: 'fa-location-dot', color: 'brand-red', label: 'GPS Coordinates' },
		size: 'mobile'
	}}
/>
<Story
	name="Orange — mobile"
	args={{
		format: { icon: 'fa-file-pdf', color: 'brand-red', label: 'PDF Documents' },
		size: 'mobile'
	}}
/>
<Story
	name="Green — mobile"
	args={{
		format: { icon: 'fa-folder-open', color: 'brand-green', label: 'Bulk Folders' },
		size: 'mobile'
	}}
/>
