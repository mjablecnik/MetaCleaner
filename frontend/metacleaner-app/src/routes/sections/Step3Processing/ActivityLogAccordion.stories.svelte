<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ActivityLogAccordion from './ActivityLogAccordion.svelte';
	import type { ActivityLogEntry } from '$lib/shared/components/ActivityLog.svelte';

	const { Story } = defineMeta({
		title: 'Step3/ActivityLogAccordion',
		component: ActivityLogAccordion,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});

	const logEntries: ActivityLogEntry[] = [
		{ timestamp: '14:22:01', text: 'Processing started', status: 'success' },
		{ timestamp: '14:22:03', text: 'Cleaned portrait.jpg — 8 fields removed', status: 'success' },
		{ timestamp: '14:22:05', text: 'Cleaned IMG_5623.heic — 22 fields removed', status: 'success' },
		{ timestamp: '14:22:07', text: 'Cleaning vacation_beach.heic', status: 'in_progress' }
	];
</script>

<Story name="Collapsed">
	<div class="w-full max-w-lg p-4">
		<ActivityLogAccordion entries={logEntries} />
	</div>
</Story>

<Story name="Expanded">
	<div class="w-full max-w-lg p-4">
		<ActivityLogAccordion entries={logEntries} />
	</div>
</Story>
