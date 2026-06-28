<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import InstanceCard from './InstanceCard.svelte';

	const { Story } = defineMeta({
		title: 'runtime/components/InstanceCard',
		component: InstanceCard,
		tags: ['autodocs']
	});
</script>

<Story
	name="Running"
	args={{
		machine: {
			id: 'inst-1',
			name: 'app',
			displayId: '4d891a2b',
			region: 'fra',
			status: 'running',
			cpuPercent: 42,
			cpuClass: 'bg-success',
			cpuDisplay: '42%',
			cpuWarning: false,
			ramDisplay: '1.2 GB',
			ramTotalDisplay: '4',
			ramBarWidth: '30%',
			uptime: '12d 4h 31m'
		},
		variant: 'desktop'
	}}
/>

<Story
	name="HighCpu"
	args={{
		machine: {
			id: 'inst-2',
			name: 'app',
			displayId: '7f3c91d0',
			region: 'fra',
			status: 'running',
			cpuPercent: 88,
			cpuClass: 'bg-secondary',
			cpuDisplay: '88%',
			cpuWarning: true,
			ramDisplay: '3.1 GB',
			ramTotalDisplay: '4',
			ramBarWidth: '78%',
			uptime: '3d 17h 05m'
		},
		variant: 'mobile'
	}}
/>

<Story
	name="Stopped"
	args={{
		machine: {
			id: 'inst-3',
			name: 'app',
			displayId: 'a12b3c4d',
			region: 'fra',
			status: 'stopped',
			cpuPercent: 0,
			cpuClass: 'bg-textSec',
			cpuDisplay: '0%',
			cpuWarning: false,
			ramDisplay: '0 GB',
			ramTotalDisplay: '4',
			ramBarWidth: '0%',
			uptime: '—'
		},
		variant: 'desktop'
	}}
/>
