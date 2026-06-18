<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import IconBadge from './IconBadge.svelte';

	const { Story } = defineMeta({
		title: 'Elements/IconBadge',
		component: IconBadge,
		tags: ['autodocs'],
		argTypes: {
			color: {
				control: { type: 'select' },
				options: ['brand-blue', 'brand-green', 'brand-red', 'brand-orange']
			},
			size: {
				control: { type: 'select' },
				options: ['sm', 'md', 'lg', 'xl']
			},
			shape: {
				control: { type: 'select' },
				options: ['circle', 'rounded']
			},
			tint: { control: 'boolean' }
		},
		args: {
			icon: 'fa-shield-halved',
			color: 'brand-blue',
			size: 'lg',
			shape: 'rounded',
			tint: true
		}
	});
</script>

<!-- Color variants (tinted) -->
<Story name="Blue Tinted" args={{ color: 'brand-blue', tint: true }} />
<Story name="Green Tinted" args={{ color: 'brand-green', tint: true }} />
<Story name="Red Tinted" args={{ color: 'brand-red', tint: true }} />
<Story name="Orange Tinted" args={{ color: 'brand-orange', tint: true }} />

<!-- Color variants (solid) -->
<Story name="Blue Solid" args={{ color: 'brand-blue', tint: false }} />
<Story name="Green Solid" args={{ color: 'brand-green', tint: false }} />

<!-- Shape variants -->
<Story name="Circle" args={{ shape: 'circle', color: 'brand-blue' }} />
<Story name="Rounded" args={{ shape: 'rounded', color: 'brand-blue' }} />

<!-- Size variants -->
<Story name="Small" args={{ size: 'sm', color: 'brand-green' }} />
<Story name="Medium" args={{ size: 'md', color: 'brand-green' }} />
<Story name="Large" args={{ size: 'lg', color: 'brand-green' }} />
<Story name="Extra Large" args={{ size: 'xl', color: 'brand-green' }} />
