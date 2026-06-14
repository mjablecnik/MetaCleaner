<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from 'storybook/test';
	import ErrorStateCard from './ErrorStateCard.svelte';
	import type { CleaningError } from '$lib/services/cleaningService';

	const { Story } = defineMeta({
		title: 'Step4/ErrorStateCard',
		component: ErrorStateCard,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});

	const timeoutError: CleaningError = {
		code: 'ERR_TIMEOUT',
		hexCode: '0x4F01',
		message: 'Operation timed out after 30 seconds',
		fileName: 'vacation_beach.heic',
		phase: 'cleaning',
		timestamp: '14:23:01'
	};

	const connectionError: CleaningError = {
		code: 'ERR_NETWORK',
		hexCode: '0x3A02',
		message: 'Failed to establish connection to processing service',
		phase: 'upload',
		timestamp: '09:45:33'
	};

	const cleaningError: CleaningError = {
		code: 'ERR_PARSE_004',
		hexCode: '0x1C04',
		message: 'Unable to parse file metadata',
		fileName: 'portrait.jpg',
		phase: 'metadata-extraction',
		timestamp: '16:07:22'
	};

	const timeoutLogEntries = [
		{ text: 'Initializing cleaning pipeline...', isError: false },
		{ text: 'Loading file: vacation_beach.heic', isError: false },
		{ text: 'Extracting EXIF metadata...', isError: false },
		{ text: 'Error: operation timed out after 30s', isError: true },
		{ text: 'Aborting remaining operations', isError: true }
	];

	const connectionLogEntries = [
		{ text: 'Connecting to cleaning service...', isError: false },
		{ text: 'Sending file chunk 1/3...', isError: false },
		{ text: 'Error: connection refused (ECONNREFUSED)', isError: true },
		{ text: 'Retrying... attempt 1/3', isError: false },
		{ text: 'Error: connection refused (ECONNREFUSED)', isError: true }
	];

	const cleaningLogEntries = [
		{ text: 'File loaded successfully', isError: false },
		{ text: 'Parsing EXIF data...', isError: false },
		{ text: 'Error: unexpected byte sequence at offset 0x00A4', isError: true },
		{ text: 'Metadata extraction failed', isError: true }
	];
</script>

<Story name="Timeout Error">
	<div class="w-full max-w-sm p-4">
		<ErrorStateCard
			error={timeoutError}
			selectedErrorType="timeout"
			onSelectErrorType={fn()}
			logEntries={timeoutLogEntries}
		/>
	</div>
</Story>

<Story name="Connection Error">
	<div class="w-full max-w-sm p-4">
		<ErrorStateCard
			error={connectionError}
			selectedErrorType="connection"
			onSelectErrorType={fn()}
			logEntries={connectionLogEntries}
		/>
	</div>
</Story>

<Story name="Cleaning Error">
	<div class="w-full max-w-sm p-4">
		<ErrorStateCard
			error={cleaningError}
			selectedErrorType="cleaning"
			onSelectErrorType={fn()}
			logEntries={cleaningLogEntries}
		/>
	</div>
</Story>
