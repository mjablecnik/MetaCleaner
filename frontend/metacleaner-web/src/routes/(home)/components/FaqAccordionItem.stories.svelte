<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FaqAccordionItem from './FaqAccordionItem.svelte';

	const { Story } = defineMeta({
		title: 'Home/FaqAccordionItem',
		component: FaqAccordionItem,
		tags: ['autodocs'],
		args: {
			question: 'Is my data safe when I use MetaCleaner?',
			answer:
				'Yes. All processing happens locally in your browser — your files never leave your device. No data is uploaded to any server.'
		}
	});
</script>

<!-- Collapsed -->
<Story
	name="Collapsed"
	args={{
		question: 'Is my data safe when I use MetaCleaner?',
		answer:
			'Yes. All processing happens locally in your browser — your files never leave your device. No data is uploaded to any server.'
	}}
/>
