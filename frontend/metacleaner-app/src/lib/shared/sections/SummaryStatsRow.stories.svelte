<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SummaryStatsRow from './SummaryStatsRow.svelte';
	import type { Stat } from './SummaryStatsRow.svelte';

	const { Story } = defineMeta({
		title: 'Sections/SummaryStatsRow',
		component: SummaryStatsRow,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});

	const defaultStats: Stat[] = [
		{
			icon: 'fa-solid fa-shield',
			iconColor: 'blue',
			value: '1,248',
			label: 'Metadata Fields Removed',
			labelMobile: 'Fields',
			highlight: true
		},
		{
			icon: 'fa-solid fa-check-circle',
			iconColor: 'green',
			value: '47',
			label: 'Files Cleaned',
			labelMobile: 'Files',
			highlight: true
		},
		{
			icon: 'fa-solid fa-location-dot',
			iconColor: 'red',
			value: '12',
			label: 'GPS Tags Removed',
			labelMobile: 'GPS',
			highlight: true
		},
		{
			icon: 'fa-solid fa-clock',
			iconColor: 'orange',
			value: '3.2s',
			label: 'Processing Time',
			labelMobile: 'Time'
		}
	];

	const smallStats: Stat[] = [
		{
			icon: 'fa-solid fa-shield',
			iconColor: 'blue',
			value: '3',
			label: 'Metadata Fields Removed',
			highlight: true
		},
		{
			icon: 'fa-solid fa-check-circle',
			iconColor: 'green',
			value: '1',
			label: 'Files Cleaned',
			highlight: true
		},
		{
			icon: 'fa-solid fa-location-dot',
			iconColor: 'red',
			value: '0',
			label: 'GPS Tags Removed'
		},
		{
			icon: 'fa-solid fa-clock',
			iconColor: 'orange',
			value: '0.4s',
			label: 'Processing Time'
		}
	];
</script>

<Story name="Default">
	<div class="w-full p-4">
		<SummaryStatsRow stats={defaultStats} />
	</div>
</Story>

<Story name="Varying Data — Small Numbers">
	<div class="w-full p-4">
		<SummaryStatsRow stats={smallStats} />
	</div>
</Story>
