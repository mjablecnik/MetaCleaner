<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ExifIllustration from './ExifIllustration.svelte';

	const { Story } = defineMeta({
		title: 'Features/ExifIllustration',
		component: ExifIllustration,
		tags: ['autodocs']
	});
</script>

<Story name="Default" />
