<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import UptimeTimeline from './UptimeTimeline.svelte';

	const { Story } = defineMeta({
		title: 'Availability/UptimeTimeline',
		component: UptimeTimeline,
		tags: ['autodocs']
	});
</script>

<Story
	name="Online Desktop"
	args={{
		card: {
			key: 'frontend-tl',
			name: 'Frontend',
			icon: 'fa-desktop',
			provider: 'Vercel / CDN',
			status: 'online',
			uptimePercent: 99.99,
			uptimeDisplay: '99.99',
			outageCount: 0,
			outageLabel: '0 výpadků',
			trend: '+0.01%',
			trendPositive: true,
			barClass: 'bg-success',
			downDays: [],
			degradedDays: [45]
		},
		variant: 'desktop'
	}}
/>

<Story
	name="Degraded Mobile"
	args={{
		card: {
			key: 'edge-tl-m',
			name: 'Edge / CDN',
			icon: 'fa-cloud',
			provider: 'Cloudflare',
			status: 'degraded',
			uptimePercent: 99.82,
			uptimeDisplay: '99.82',
			outageCount: 5,
			outageLabel: '5 výpadků',
			trend: '-0.08%',
			trendPositive: false,
			barClass: 'bg-secondary',
			downDays: [5, 18, 42],
			degradedDays: [0, 10, 25, 50]
		},
		variant: 'mobile'
	}}
/>
