<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AudienceSection from './AudienceSection.svelte';

	const { Story } = defineMeta({
		title: 'Home/Sections/AudienceSection',
		component: AudienceSection,
		tags: ['autodocs']
	});
</script>

<!-- Desktop viewport — resize Storybook to see mobile layout -->
<Story name="Default" />
