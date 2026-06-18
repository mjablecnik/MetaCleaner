<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import GradientText from './GradientText.svelte';

	const { Story } = defineMeta({
		title: 'Elements/GradientText',
		component: GradientText,
		tags: ['autodocs']
	});
</script>

<Story name="Heading">
	<span class="text-5xl font-black">Remove Hidden Metadata</span>
</Story>

<Story name="Inline Text">
	<span class="text-2xl font-bold">Privacy-First</span>
</Story>

<Story name="Large Heading">
	<span class="text-6xl font-black">Protect Your Privacy</span>
</Story>
