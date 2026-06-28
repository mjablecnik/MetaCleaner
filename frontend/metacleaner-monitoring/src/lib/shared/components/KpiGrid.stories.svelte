<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import KpiGrid from './KpiGrid.svelte';

	const { Story } = defineMeta({
		title: 'Components/KpiGrid',
		component: KpiGrid,
		tags: ['autodocs']
	});
</script>

<Story
	name="FourColumns"
	args={{
		columns: 4,
		stats: [
			{
				labelKey: 'dashboard_stats_uptimeFrontend',
				value: '99.99%',
				icon: 'fa-desktop',
				iconClass: 'text-textSec',
				barWidth: 'w-[99.99%]',
				barClass: 'bg-success'
			},
			{
				labelKey: 'dashboard_stats_uptimeBackend',
				value: '99.95%',
				icon: 'fa-server',
				iconClass: 'text-textSec',
				barWidth: 'w-[99.95%]',
				barClass: 'bg-success'
			},
			{
				labelKey: 'dashboard_stats_errorRate',
				value: '0.12%',
				icon: 'fa-bug',
				iconClass: 'text-error bg-error/10 p-2 rounded-lg'
			},
			{
				labelKey: 'dashboard_stats_dbHealth',
				value: 'Healthy',
				icon: 'fa-database',
				iconClass: 'text-textSec',
				valueClass: 'text-success',
				subtextKey: 'dashboard_stats_dbHealthSubtextDesktop'
			}
		]
	}}
/>

<Story
	name="TwoColumns"
	args={{
		columns: 2,
		stats: [
			{
				labelKey: 'dashboard_stats_uptimeFrontend',
				value: '99.99%',
				icon: 'fa-desktop',
				iconClass: 'text-textSec',
				barWidth: 'w-[99.99%]',
				barClass: 'bg-success'
			},
			{
				labelKey: 'dashboard_stats_uptimeBackend',
				value: '99.95%',
				icon: 'fa-server',
				iconClass: 'text-textSec',
				barWidth: 'w-[99.95%]',
				barClass: 'bg-success'
			}
		]
	}}
/>

<Story
	name="WithTrends"
	args={{
		columns: 4,
		stats: [
			{
				labelKey: 'dashboard_stats_uptimeFrontend',
				value: '99.99%',
				icon: 'fa-desktop',
				iconClass: 'text-success',
				trend: '+0.01%',
				trendPositive: true
			},
			{
				labelKey: 'dashboard_stats_uptimeBackend',
				value: '98.5%',
				icon: 'fa-server',
				iconClass: 'text-secondary',
				trend: '-0.5%',
				trendPositive: false
			},
			{
				labelKey: 'dashboard_stats_errorRate',
				value: '0.12%',
				icon: 'fa-bug',
				iconClass: 'text-error bg-error/10 p-2 rounded-lg',
				trend: '-0.05%',
				trendPositive: true
			},
			{
				labelKey: 'dashboard_stats_dbHealth',
				value: '42ms',
				icon: 'fa-database',
				iconClass: 'text-textSec',
				trend: '+2ms',
				trendPositive: false
			}
		]
	}}
/>
