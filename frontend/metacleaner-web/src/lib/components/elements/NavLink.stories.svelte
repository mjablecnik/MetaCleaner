<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import NavLink from './NavLink.svelte';

	const { Story } = defineMeta({
		title: 'Elements/NavLink',
		component: NavLink,
		tags: ['autodocs'],
		args: {
			href: '/features',
			label: 'Features',
			active: false
		}
	});
</script>

<Story name="Default" args={{ href: '/features', label: 'Features', active: false }} />
<Story name="Active" args={{ href: '/features', label: 'Features', active: true }} />
