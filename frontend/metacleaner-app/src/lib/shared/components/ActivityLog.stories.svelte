<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ActivityLog from './ActivityLog.svelte';

	const { Story } = defineMeta({
		title: 'Components/ActivityLog',
		component: ActivityLog,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="With Entries">
	<ActivityLog
		entries={[
			{ timestamp: '14:23:01', text: 'Processing started', status: 'success' },
			{ timestamp: '14:23:02', text: 'Reading EXIF data...', status: 'in_progress' },
			{ timestamp: '14:23:03', text: 'GPS coordinates removed', status: 'success' },
			{ timestamp: '14:23:04', text: 'Camera model removed', status: 'success' },
			{ timestamp: '14:23:05', text: 'Failed to parse thumbnail', status: 'error' },
			{ timestamp: '14:23:06', text: 'Waiting for next file...', status: 'waiting' },
			{ timestamp: '14:23:07', text: 'Skipped (already clean)', status: 'skipped' }
		]}
		class="h-48"
	/>
</Story>

<Story name="Success Only">
	<ActivityLog
		entries={[
			{ timestamp: '14:23:01', text: 'Processing started', status: 'success' },
			{ timestamp: '14:23:02', text: 'GPS coordinates removed', status: 'success' },
			{ timestamp: '14:23:03', text: 'Camera model removed', status: 'success' },
			{ timestamp: '14:23:04', text: 'Processing complete', status: 'success' }
		]}
		class="h-36"
	/>
</Story>

<Story name="With Error">
	<ActivityLog
		entries={[
			{ timestamp: '14:23:01', text: 'Processing started', status: 'success' },
			{ timestamp: '14:23:02', text: 'Reading EXIF data...', status: 'in_progress' },
			{ timestamp: '14:23:03', text: 'Unexpected error: file corrupted', status: 'error' }
		]}
		class="h-28"
	/>
</Story>

<Story name="In Progress">
	<ActivityLog
		entries={[
			{ timestamp: '14:23:01', text: 'Processing started', status: 'success' },
			{ timestamp: '14:23:02', text: 'GPS coordinates removed', status: 'success' },
			{ timestamp: '14:23:03', text: 'Removing camera metadata...', status: 'in_progress' },
			{ timestamp: '14:23:04', text: 'Waiting for completion...', status: 'waiting' }
		]}
		class="h-36"
	/>
</Story>

<Story name="Empty">
	<ActivityLog entries={[]} class="h-20" />
</Story>
