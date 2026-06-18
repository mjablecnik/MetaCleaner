<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FeaturesHeaderSection from './FeaturesHeaderSection.svelte';

	const { Story } = defineMeta({
		title: 'Features/Sections/FeaturesHeaderSection',
		component: FeaturesHeaderSection,
		tags: ['autodocs']
	});
</script>

<!-- Desktop viewport — resize Storybook to see mobile layout -->
<Story name="Default" />
