<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AnimatedCheckmark from './AnimatedCheckmark.svelte';

	const { Story } = defineMeta({
		title: 'EmailVerified/AnimatedCheckmark',
		component: AnimatedCheckmark,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="SmallSize">
	<div class="flex items-center justify-center p-8">
		<AnimatedCheckmark size="sm" />
	</div>
</Story>

<Story name="LargeSize">
	<div class="flex items-center justify-center p-8">
		<AnimatedCheckmark size="lg" />
	</div>
</Story>
