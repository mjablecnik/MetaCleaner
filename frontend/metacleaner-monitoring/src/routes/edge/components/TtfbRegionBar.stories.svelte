<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TtfbRegionBar from './TtfbRegionBar.svelte';

	const { Story } = defineMeta({
		title: 'Edge/TtfbRegionBar',
		component: TtfbRegionBar,
		tags: ['autodocs']
	});
</script>

<Story
	name="Fast Region Desktop"
	args={{
		region: {
			id: 'eu-west',
			name: 'EU West',
			shortName: 'EU West',
			ttfbMs: 38,
			barWidth: '19%',
			barColor: '#3ecf8e',
			dotColor: 'text-green-muted',
			statusKey: 'common_status_ok',
			statusClass: 'bg-success/10 text-success'
		},
		variant: 'desktop'
	}}
/>

<Story
	name="Slow Region Desktop"
	args={{
		region: {
			id: 's-america',
			name: 'South America',
			shortName: 'S. America',
			ttfbMs: 152,
			barWidth: '74%',
			barColor: '#ef4444',
			dotColor: 'text-error',
			statusKey: 'common_status_slow',
			statusClass: 'bg-error/10 text-error'
		},
		variant: 'desktop'
	}}
/>

<Story
	name="Warning Region Mobile"
	args={{
		region: {
			id: 'asia-pac',
			name: 'Asia Pacific',
			shortName: 'Asia Pac.',
			ttfbMs: 114,
			barWidth: '56%',
			barColor: '#8b5cf6',
			dotColor: 'text-purple',
			statusKey: 'common_status_warning',
			statusClass: 'bg-secondary/10 text-secondary'
		},
		variant: 'mobile'
	}}
/>
