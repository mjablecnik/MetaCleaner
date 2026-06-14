<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { userEvent } from 'storybook/test';
	import ErrorDetailAccordion from './ErrorDetailAccordion.svelte';
	import type { CleaningError } from '$lib/services/cleaningService';

	const { Story } = defineMeta({
		title: 'Step4/ErrorDetailAccordion',
		component: ErrorDetailAccordion,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});

	const timeoutError: CleaningError = {
		code: 'ERR_TIMEOUT_003',
		hexCode: '0x00000003',
		message: 'Operation timed out after 30 seconds.',
		fileName: 'vacation_beach.heic',
		phase: 'metadata-strip',
		timestamp: '2024-03-15 14:23:07'
	};

	const connectionError: CleaningError = {
		code: 'ERR_CONN_002',
		hexCode: '0x00000002',
		message: 'Failed to establish a secure connection.',
		phase: 'upload',
		timestamp: '2024-03-15 14:21:44'
	};
</script>

<Story name="Expanded — With File">
	<div class="w-full max-w-lg p-4">
		<ErrorDetailAccordion error={timeoutError} />
	</div>
</Story>

<Story name="Expanded — No File">
	<div class="w-full max-w-lg p-4">
		<ErrorDetailAccordion error={connectionError} />
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
		<ErrorDetailAccordion error={timeoutError} />
	</div>
</Story>
