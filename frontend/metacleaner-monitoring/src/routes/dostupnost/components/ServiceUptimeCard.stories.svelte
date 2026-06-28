<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ServiceUptimeCard from './ServiceUptimeCard.svelte';

	const { Story } = defineMeta({
		title: 'Availability/ServiceUptimeCard',
		component: ServiceUptimeCard,
		tags: ['autodocs']
	});
</script>

<Story
	name="Online Desktop"
	args={{
		card: {
			key: 'frontend',
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
	name="Degraded Desktop"
	args={{
		card: {
			key: 'edge',
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
		variant: 'desktop'
	}}
/>

<Story
	name="Online Mobile"
	args={{
		card: {
			key: 'backend-m',
			name: 'Backend API',
			icon: 'fa-server',
			provider: 'Fly.io',
			status: 'online',
			uptimePercent: 99.95,
			uptimeDisplay: '99.95',
			outageCount: 2,
			outageLabel: '2 výpadky',
			trend: '-0.03%',
			trendPositive: false,
			barClass: 'bg-success',
			downDays: [12, 67],
			degradedDays: [23, 55]
		},
		variant: 'mobile'
	}}
/>
