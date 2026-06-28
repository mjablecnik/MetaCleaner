<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import WebVitalCard from './WebVitalCard.svelte';

	const { Story } = defineMeta({
		title: 'Performance/WebVitalCard',
		component: WebVitalCard,
		tags: ['autodocs']
	});
</script>

<Story
	name="Good LCP"
	args={{
		vital: {
			key: 'lcp',
			label: 'LCP',
			value: '1.8',
			unit: 's',
			statusKey: 'common_status_good',
			statusClass: 'text-success',
			badgeClass: 'bg-success/10 text-success',
			barClass: 'bg-success',
			description: 'Largest Contentful Paint',
			barWidth: '72%',
			threshold: 'Cíl: ≤ 2.5s',
			statusSymbol: '✓ Dobrý'
		}
	}}
/>

<Story
	name="Warning FID"
	args={{
		vital: {
			key: 'fid',
			label: 'FID',
			value: '38',
			unit: 'ms',
			statusKey: 'common_status_warning',
			statusClass: 'text-secondary',
			badgeClass: 'bg-secondary/10 text-secondary',
			barClass: 'bg-secondary',
			description: 'First Input Delay',
			barWidth: '76%',
			threshold: 'Cíl: ≤ 100ms',
			statusSymbol: '⚠ Varování'
		}
	}}
/>

<Story
	name="Poor CLS"
	args={{
		vital: {
			key: 'cls',
			label: 'CLS',
			value: '0.08',
			unit: '',
			statusKey: 'common_status_good',
			statusClass: 'text-success',
			badgeClass: 'bg-success/10 text-success',
			barClass: 'bg-success',
			description: 'Cumulative Layout Shift',
			barWidth: '32%',
			threshold: 'Cíl: ≤ 0.10',
			statusSymbol: '✓ Dobrý'
		}
	}}
/>
