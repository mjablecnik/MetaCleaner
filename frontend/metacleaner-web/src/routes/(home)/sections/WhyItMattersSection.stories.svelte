<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import WhyItMattersSection from './WhyItMattersSection.svelte';

	const { Story } = defineMeta({
		title: 'Home/Sections/WhyItMattersSection',
		component: WhyItMattersSection,
		tags: ['autodocs']
	});
</script>

<!-- Desktop viewport — resize Storybook to see mobile layout -->
<Story name="Default" />
