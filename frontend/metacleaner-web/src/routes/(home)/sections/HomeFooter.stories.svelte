<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import HomeFooter from './HomeFooter.svelte';

	const { Story } = defineMeta({
		title: 'Home/Sections/HomeFooter',
		component: HomeFooter,
		tags: ['autodocs']
	});
</script>

<!-- Desktop viewport — resize Storybook to see mobile layout -->
<Story name="Default" />
