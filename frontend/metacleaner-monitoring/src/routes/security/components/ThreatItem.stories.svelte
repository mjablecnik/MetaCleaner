<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ThreatItem from './ThreatItem.svelte';

	const { Story } = defineMeta({
		title: 'Security/ThreatItem',
		component: ThreatItem,
		tags: ['autodocs']
	});
</script>

<Story
	name="Critical Desktop"
	args={{
		threat: {
			id: 'threat-1',
			title: 'Brute Force Útok',
			severityKey: 'security_severity_critical',
			severityClass: 'bg-error/20 text-error',
			borderClass: 'border-error/30',
			bgClass: 'bg-error/5',
			icon: 'fa-shield-halved',
			iconClass: 'text-error',
			iconBg: 'bg-error/15',
			ip: '185.220.101.47',
			origin: 'Russia',
			detail: '8,400 req/min',
			endpoint: '/api/v1/login',
			agentOrNote: 'Scrapy/2.11',
			time: '14:51',
			actionKey: 'security_action_block',
			actionClass: 'bg-error text-white hover:bg-error/80'
		},
		variant: 'desktop'
	}}
/>

<Story
	name="Warning Desktop"
	args={{
		threat: {
			id: 'threat-2',
			title: 'SQL Injection Pokus',
			severityKey: 'common_status_warning',
			severityClass: 'bg-secondary/20 text-secondary',
			borderClass: 'border-secondary/30',
			bgClass: 'bg-secondary/5',
			icon: 'fa-database',
			iconClass: 'text-secondary',
			iconBg: 'bg-secondary/15',
			ip: '92.118.160.22',
			origin: 'China',
			detail: 'CF-WAF-SQLi-001',
			endpoint: '/api/v1/users',
			agentOrNote: 'Mozilla/5.0',
			time: '13:38',
			actionKey: 'security_action_investigate',
			actionClass: 'bg-secondary/20 text-secondary hover:bg-secondary/30'
		},
		variant: 'desktop'
	}}
/>

<Story
	name="Critical Mobile"
	args={{
		threat: {
			id: 'threat-3',
			title: 'Rate Limit Exceeded',
			severityKey: 'security_severity_critical',
			severityClass: 'bg-error/20 text-error',
			borderClass: 'border-error/30',
			bgClass: 'bg-error/5',
			icon: 'fa-gauge-high',
			iconClass: 'text-error',
			iconBg: 'bg-error/15',
			ip: '45.33.32.156',
			origin: 'US',
			detail: '200 req/min limit',
			endpoint: '/api/v1/checkout',
			agentOrNote: 'Python-requests',
			time: '12:04',
			actionKey: 'security_action_block',
			actionClass: 'bg-error text-white hover:bg-error/80'
		},
		variant: 'mobile'
	}}
/>
