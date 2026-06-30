<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import StatCard from './StatCard.svelte';

	const { Story } = defineMeta({
		title: 'Elements/StatCard',
		component: StatCard,
		tags: ['autodocs'],
		argTypes: {
			valueClass: { control: 'text' },
			iconClass: { control: 'text' }
		}
	});
</script>

<Story
	name="Default"
	args={{
		labelKey: 'dashboard_stats_uptimeFrontend',
		value: '99.99%',
		icon: 'fa-desktop',
		iconClass: 'text-textSec'
	}}
/>

<Story
	name="WithTrend"
	args={{
		labelKey: 'dashboard_stats_errorRate',
		value: '0.12%',
		icon: 'fa-bug',
		iconClass: 'text-error bg-error/10 p-2 rounded-lg',
		trend: '-0.05%',
		trendPositive: true
	}}
/>

<Story
	name="WithTrendNegative"
	args={{
		labelKey: 'dashboard_stats_errorRate',
		value: '1.5%',
		icon: 'fa-bug',
		iconClass: 'text-error bg-error/10 p-2 rounded-lg',
		trend: '+0.3%',
		trendPositive: false
	}}
/>

<Story
	name="WithProgressBar"
	args={{
		labelKey: 'dashboard_stats_uptimeBackend',
		value: '99.95%',
		icon: 'fa-server',
		iconClass: 'text-textSec',
		barWidth: '99.95%',
		barClass: 'bg-success'
	}}
/>

<Story
	name="WithSubtext"
	args={{
		labelKey: 'dashboard_stats_dbHealth',
		value: 'Healthy',
		icon: 'fa-database',
		iconClass: 'text-textSec',
		valueClass: 'text-success',
		subtextKey: 'dashboard_stats_dbHealthSubtextDesktop'
	}}
/>
