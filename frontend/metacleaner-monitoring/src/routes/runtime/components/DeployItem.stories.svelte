<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DeployItem from './DeployItem.svelte';

	const { Story } = defineMeta({
		title: 'runtime/components/DeployItem',
		component: DeployItem,
		tags: ['autodocs']
	});
</script>

<Story
	name="Success"
	args={{
		deploy: {
			id: 'dep-1',
			version: 'v2.4.1',
			author: 'martin.j',
			commitMessage: 'feat: add runtime monitoring dashboard',
			timestamp: '14:32',
			duration: '38s',
			status: 'success',
			statusClass: 'bg-success/10 text-success',
			statusKey: 'common_status_success',
			icon: 'fa-check',
			iconClass: 'bg-success/10',
			subtext: 'martin.j · 38s'
		},
		variant: 'desktop'
	}}
/>

<Story
	name="Failed"
	args={{
		deploy: {
			id: 'dep-2',
			version: 'v2.4.0',
			author: 'martin.j',
			commitMessage: 'fix: resolve memory leak in cache layer',
			timestamp: '11:08',
			duration: '12s',
			status: 'failed',
			statusClass: 'bg-error/10 text-error',
			statusKey: 'common_status_failed',
			icon: 'fa-xmark',
			iconClass: 'bg-error/10',
			subtext: 'martin.j · 12s · build error'
		},
		variant: 'desktop'
	}}
/>

<Story
	name="Rollback"
	args={{
		deploy: {
			id: 'dep-3',
			version: 'v2.3.9',
			author: 'system',
			commitMessage: 'chore: rollback to stable release',
			timestamp: '11:10',
			duration: '22s',
			status: 'rollback',
			statusClass: 'bg-secondary/10 text-secondary',
			statusKey: 'common_status_rollback',
			icon: 'fa-rotate-left',
			iconClass: 'bg-secondary/10',
			subtext: 'system · 22s · auto rollback'
		},
		variant: 'mobile',
		showDivider: true
	}}
/>
