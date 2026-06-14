<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from 'storybook/test';
	import { userEvent } from 'storybook/test';
	import ErrorTypeAccordion from './ErrorTypeAccordion.svelte';
	import type { ErrorType } from './ErrorStateCard.svelte';

	const { Story } = defineMeta({
		title: 'Step4/ErrorTypeAccordion',
		component: ErrorTypeAccordion,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Cleaning Error Selected">
	<div class="w-full max-w-lg p-4">
		<ErrorTypeAccordion selectedErrorType="cleaning" onSelectErrorType={fn()} />
	</div>
</Story>

<Story name="Connection Error Selected">
	<div class="w-full max-w-lg p-4">
		<ErrorTypeAccordion selectedErrorType="connection" onSelectErrorType={fn()} />
	</div>
</Story>

<Story name="Timeout Error Selected">
	<div class="w-full max-w-lg p-4">
		<ErrorTypeAccordion selectedErrorType="timeout" onSelectErrorType={fn()} />
	</div>
</Story>

<Story
	name="Collapsed"
	play={async ({ canvasElement }) => {
		const button = canvasElement.querySelector('button');
		if (button) await userEvent.click(button);
	}}
>
	<div class="w-full max-w-lg p-4">
		<ErrorTypeAccordion selectedErrorType="cleaning" onSelectErrorType={fn()} />
	</div>
</Story>
