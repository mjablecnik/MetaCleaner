<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import HeroSection from './HeroSection.svelte';

	const { Story } = defineMeta({
		title: 'Home/Sections/HeroSection',
		component: HeroSection,
		tags: ['autodocs']
	});
</script>

<!-- Desktop viewport — resize Storybook to see mobile layout -->
<Story name="Default" />
