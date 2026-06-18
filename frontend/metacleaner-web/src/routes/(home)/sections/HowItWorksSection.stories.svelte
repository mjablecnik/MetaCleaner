<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import HowItWorksSection from './HowItWorksSection.svelte';

	const { Story } = defineMeta({
		title: 'Home/Sections/HowItWorksSection',
		component: HowItWorksSection,
		tags: ['autodocs']
	});
</script>

<!-- Desktop viewport — resize Storybook to see mobile layout -->
<Story name="Default" />
