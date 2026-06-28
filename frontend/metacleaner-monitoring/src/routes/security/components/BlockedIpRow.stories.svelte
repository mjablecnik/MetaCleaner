<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import BlockedIpRow from './BlockedIpRow.svelte';

	const { Story } = defineMeta({
		title: 'Security/BlockedIpRow',
		component: BlockedIpRow,
		tags: ['autodocs']
	});
</script>

<Story
	name="Auto Block Desktop"
	args={{
		ip: {
			id: 'ip-1',
			ip: '185.220.101.47',
			country: '🇷🇺 Russia',
			reason: 'DDoS útok',
			blockTypeKey: 'security_blockType_auto',
			blockTypeClass: 'bg-error/15 text-error',
			blockedAt: '14:51',
			iconClass: 'text-error'
		},
		variant: 'desktop'
	}}
/>

<Story
	name="Manual Block Desktop"
	args={{
		ip: {
			id: 'ip-2',
			ip: '92.118.160.22',
			country: '🇨🇳 China',
			reason: 'SQL Injection',
			blockTypeKey: 'security_blockType_manual',
			blockTypeClass: 'bg-secondary/15 text-secondary',
			blockedAt: '13:38',
			iconClass: 'text-secondary'
		},
		variant: 'desktop'
	}}
/>

<Story
	name="Auto Block Mobile"
	args={{
		ip: {
			id: 'ip-3',
			ip: '45.33.32.156',
			country: '🇺🇸 US',
			reason: 'Bad Bot',
			blockTypeKey: 'security_blockType_auto',
			blockTypeClass: 'bg-error/15 text-error',
			blockedAt: '12:04',
			iconClass: 'text-error'
		},
		variant: 'mobile'
	}}
/>
