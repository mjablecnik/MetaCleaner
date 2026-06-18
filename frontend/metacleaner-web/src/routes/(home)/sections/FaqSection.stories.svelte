<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FaqSection from './FaqSection.svelte';

	const { Story } = defineMeta({
		title: 'Home/Sections/FaqSection',
		component: FaqSection,
		tags: ['autodocs']
	});
</script>

<!-- Desktop viewport — resize Storybook to see mobile layout -->
<Story name="Default" />
