<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FeaturesShowcaseSection from './FeaturesShowcaseSection.svelte';

	const { Story } = defineMeta({
		title: 'Features/Sections/FeaturesShowcaseSection',
		component: FeaturesShowcaseSection,
		tags: ['autodocs']
	});
</script>

<!-- Desktop viewport — resize Storybook to see mobile layout -->
<Story name="Default" />
