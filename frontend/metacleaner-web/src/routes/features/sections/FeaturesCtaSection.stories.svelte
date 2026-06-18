<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FeaturesCtaSection from './FeaturesCtaSection.svelte';

	const { Story } = defineMeta({
		title: 'Features/Sections/FeaturesCtaSection',
		component: FeaturesCtaSection,
		tags: ['autodocs']
	});
</script>

<!-- Resize Storybook viewport to mobile to see this section (md:hidden) -->
<Story name="Default" />
