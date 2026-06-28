<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CacheRuleItem from './CacheRuleItem.svelte';

	const { Story } = defineMeta({
		title: 'Edge/CacheRuleItem',
		component: CacheRuleItem,
		tags: ['autodocs']
	});
</script>

<Story
	name="High Hit Rate Desktop"
	args={{
		rule: {
			id: 'images',
			pattern: '/assets/images/*',
			ttlLabel: 'TTL: 30 dní',
			description: 'TTL: 30 dní · Statické soubory',
			hitRate: '99.1%',
			hitRateColor: 'text-success',
			icon: 'fa-image',
			iconBg: 'bg-green-muted/15',
			iconColor: 'text-green-muted'
		},
		variant: 'desktop'
	}}
/>

<Story
	name="Medium Hit Rate Desktop"
	args={{
		rule: {
			id: 'api-products',
			pattern: '/api/v1/products*',
			ttlLabel: 'TTL: 5 min',
			description: 'TTL: 5 min · API cache',
			hitRate: '72.3%',
			hitRateColor: 'text-purple',
			icon: 'fa-database',
			iconBg: 'bg-purple/15',
			iconColor: 'text-purple'
		},
		variant: 'desktop'
	}}
/>

<Story
	name="Bypass Mobile"
	args={{
		rule: {
			id: 'user-profile',
			pattern: '/api/v1/user/profile',
			ttlLabel: 'TTL: Bypass',
			description: 'TTL: Bypass · Auth required',
			hitRate: '0%',
			hitRateColor: 'text-secondary',
			icon: 'fa-file',
			iconBg: 'bg-cf-orange/15',
			iconColor: 'text-cf-orange'
		},
		variant: 'mobile'
	}}
/>
