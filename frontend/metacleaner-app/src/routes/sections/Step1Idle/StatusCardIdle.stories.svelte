<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import StatusCardIdle from './StatusCardIdle.svelte';

	const { Story } = defineMeta({
		title: 'Step1/StatusCardIdle',
		component: StatusCardIdle,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Default">
	<div class="w-full max-w-sm p-4">
		<StatusCardIdle />
	</div>
</Story>
