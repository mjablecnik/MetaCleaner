<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FaqAccordionItem from './FaqAccordionItem.svelte';

	const { Story } = defineMeta({
		title: 'Home/FaqAccordionItem',
		component: FaqAccordionItem,
		tags: ['autodocs'],
		argTypes: {
			size: { control: { type: 'select' }, options: ['desktop', 'mobile'] }
		},
		args: {
			question: 'Is my data safe when I use MetaCleaner?',
			answer:
				'Yes. All processing happens locally in your browser — your files never leave your device. No data is uploaded to any server.',
			size: 'desktop'
		}
	});
</script>

<!-- Desktop / Collapsed -->
<Story
	name="Desktop / Collapsed"
	args={{
		question: 'Is my data safe when I use MetaCleaner?',
		answer:
			'Yes. All processing happens locally in your browser — your files never leave your device. No data is uploaded to any server.',
		size: 'desktop'
	}}
/>

<!-- Mobile / Collapsed -->
<Story
	name="Mobile / Collapsed"
	args={{
		question: 'Does MetaCleaner work on mobile?',
		answer:
			'MetaCleaner works in any modern browser, including Safari and Chrome on iOS and Android.',
		size: 'mobile'
	}}
/>
