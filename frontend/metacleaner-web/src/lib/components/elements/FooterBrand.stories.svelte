<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FooterBrand from './FooterBrand.svelte';

	const { Story } = defineMeta({
		title: 'Elements/FooterBrand',
		component: FooterBrand,
		tags: ['autodocs']
	});
</script>

<Story name="Default" args={{ tagline: 'Remove hidden metadata from your photos in seconds — free, private, no account needed.' }} />
