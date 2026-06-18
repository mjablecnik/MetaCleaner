<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MobileNavbar from './MobileNavbar.svelte';

	const { Story } = defineMeta({
		title: 'Shared/MobileNavbar',
		component: MobileNavbar,
		tags: ['autodocs'],
		argTypes: {
			open: { control: { type: 'boolean' } }
		}
	});
</script>

<Story name="Closed" args={{ open: false, onToggle: () => {} }} />
<Story name="Open" args={{ open: true, onToggle: () => {} }} />
