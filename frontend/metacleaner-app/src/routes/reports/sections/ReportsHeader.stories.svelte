<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ReportsHeader from './ReportsHeader.svelte';

	const { Story } = defineMeta({
		title: 'Reports/ReportsHeader',
		component: ReportsHeader,
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
	<div class="w-full max-w-4xl p-4">
		<ReportsHeader totalReports={12} />
	</div>
</Story>

<Story name="No Reports">
	<div class="w-full max-w-4xl p-4">
		<ReportsHeader totalReports={0} />
	</div>
</Story>
