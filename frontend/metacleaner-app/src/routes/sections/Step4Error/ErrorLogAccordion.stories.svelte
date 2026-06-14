<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { userEvent } from 'storybook/test';
	import ErrorLogAccordion from './ErrorLogAccordion.svelte';
	import type { SimpleLogEntry } from './ErrorStateCard.svelte';

	const { Story } = defineMeta({
		title: 'Step4/ErrorLogAccordion',
		component: ErrorLogAccordion,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});

	const mixedLogEntries: SimpleLogEntry[] = [
		{ text: 'Initialising cleaning pipeline...', isError: false },
		{ text: 'Loading file: vacation_beach.heic', isError: false },
		{ text: 'Stripping GPS metadata fields...', isError: false },
		{ text: 'ERR: Failed to process EXIF block at offset 0x1A4F', isError: true },
		{ text: 'Attempting fallback parser...', isError: false },
		{ text: 'ERR: Fallback parser returned null result', isError: true },
		{ text: 'Pipeline aborted after 2 failed attempts', isError: true }
	];

	const successLogEntries: SimpleLogEntry[] = [
		{ text: 'Initialising cleaning pipeline...', isError: false },
		{ text: 'Loading file: portrait.jpg', isError: false },
		{ text: 'Stripping GPS metadata fields...', isError: false },
		{ text: 'Removing device identity fields...', isError: false },
		{ text: 'Cleaning complete — 12 fields removed', isError: false }
	];
</script>

<Story name="Expanded — Mixed Log">
	<div class="w-full max-w-lg p-4">
		<ErrorLogAccordion logEntries={mixedLogEntries} />
	</div>
</Story>

<Story name="Expanded — Success Log">
	<div class="w-full max-w-lg p-4">
		<ErrorLogAccordion logEntries={successLogEntries} />
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
		<ErrorLogAccordion logEntries={mixedLogEntries} />
	</div>
</Story>
