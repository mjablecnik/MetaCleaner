<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ErrorVisual from './ErrorVisual.svelte';

	const { Story } = defineMeta({
		title: 'Step4/ErrorVisual',
		component: ErrorVisual,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }],
			},
		},
	});
</script>

<Story name="Animated Large">
	<ErrorVisual size="lg" />
</Story>

<Story name="Animated Small">
	<ErrorVisual size="sm" />
</Story>
