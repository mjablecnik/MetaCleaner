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
	{#snippet children()}
		<span class="text-5xl font-black">Remove Hidden Metadata</span>
	{/snippet}
</Story>

<Story name="Inline Text">
	{#snippet children()}
		<span class="text-2xl font-bold">Privacy-First</span>
	{/snippet}
</Story>

<Story name="Large Heading">
	{#snippet children()}
		<span class="text-6xl font-black">Protect Your Privacy</span>
	{/snippet}
</Story>
