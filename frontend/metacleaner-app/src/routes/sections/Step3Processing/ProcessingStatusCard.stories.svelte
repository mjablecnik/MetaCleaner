<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ProcessingStatusCard from './ProcessingStatusCard.svelte';
	import type { ActivityLogEntry } from '$lib/shared/components/ActivityLog.svelte';

	const { Story } = defineMeta({
		title: 'Step3/ProcessingStatusCard',
		component: ProcessingStatusCard,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});

	const inProgressEntries: ActivityLogEntry[] = [
		{ timestamp: '14:22:01', text: 'Processing started', status: 'success' },
		{ timestamp: '14:22:03', text: 'Cleaning portrait.jpg', status: 'success' },
		{ timestamp: '14:22:05', text: 'Cleaning IMG_5623.heic', status: 'success' },
		{ timestamp: '14:22:07', text: 'Cleaning vacation_beach.heic', status: 'in_progress' }
	];

	const nearCompletionEntries: ActivityLogEntry[] = [
		{ timestamp: '14:22:01', text: 'Processing started', status: 'success' },
		{ timestamp: '14:22:03', text: 'Cleaned portrait.jpg — 8 fields removed', status: 'success' },
		{ timestamp: '14:22:05', text: 'Cleaned IMG_5623.heic — 22 fields removed', status: 'success' },
		{ timestamp: '14:22:07', text: 'Cleaned vacation_beach.heic — 31 fields removed', status: 'success' },
		{ timestamp: '14:22:09', text: 'Cleaned screenshot.png — 3 fields removed', status: 'success' },
		{ timestamp: '14:22:11', text: 'Cleaning walk_prague.mp4', status: 'in_progress' }
	];
</script>

<Story name="In Progress">
	<div class="w-full max-w-lg p-4">
		<ProcessingStatusCard
			currentFileName="vacation_beach.heic"
			totalFiles={5}
			fieldsRemoved={23}
			filesCompleted={2}
			logEntries={inProgressEntries}
		/>
	</div>
</Story>

<Story name="Near Completion">
	<div class="w-full max-w-lg p-4">
		<ProcessingStatusCard
			currentFileName="walk_prague.mp4"
			totalFiles={5}
			fieldsRemoved={64}
			filesCompleted={4}
			logEntries={nearCompletionEntries}
		/>
	</div>
</Story>
