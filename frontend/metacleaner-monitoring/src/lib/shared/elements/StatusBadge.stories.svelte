<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import StatusBadge from './StatusBadge.svelte';

	const { Story } = defineMeta({
		title: 'Elements/StatusBadge',
		component: StatusBadge,
		tags: ['autodocs'],
		argTypes: {
			status: {
				control: 'select',
				options: [
					'online',
					'degraded',
					'offline',
					'active',
					'resolved',
					'critical',
					'warning',
					'info'
				]
			}
		}
	});
</script>

<Story name="Online" args={{ status: 'online' }} />

<Story name="Degraded" args={{ status: 'degraded' }} />

<Story name="Offline" args={{ status: 'offline' }} />

<Story name="Active" args={{ status: 'active' }} />

<Story name="Resolved" args={{ status: 'resolved' }} />

<Story name="Critical" args={{ status: 'critical' }} />

<Story name="Warning" args={{ status: 'warning' }} />

<Story name="Info" args={{ status: 'info' }} />

<Story name="WithPulse" args={{ status: 'online', pulse: true }} />

<Story name="CustomLabel" args={{ status: 'critical', label: 'THREAT DETECTED' }} />
