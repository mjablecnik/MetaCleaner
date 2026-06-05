<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ProcessingVisual from './ProcessingVisual.svelte';

	const { Story } = defineMeta({
		title: 'Step3/ProcessingVisual',
		component: ProcessingVisual,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Animated Large">
	<ProcessingVisual size="lg" />
</Story>

<Story name="Animated Small">
	<ProcessingVisual size="sm" />
</Story>
