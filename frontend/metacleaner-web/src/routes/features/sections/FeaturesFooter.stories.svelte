<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FeaturesFooter from './FeaturesFooter.svelte';

	const { Story } = defineMeta({
		title: 'Features/Sections/FeaturesFooter',
		component: FeaturesFooter,
		tags: ['autodocs']
	});
</script>

<!-- Desktop viewport shows full 4-column footer; resize to mobile to see compact brand+social layout -->
<Story name="Default" />
