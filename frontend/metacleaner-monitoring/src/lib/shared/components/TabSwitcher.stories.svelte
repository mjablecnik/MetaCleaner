<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TabSwitcher from './TabSwitcher.svelte';

	const { Story } = defineMeta({
		title: 'Components/TabSwitcher',
		component: TabSwitcher,
		tags: ['autodocs']
	});
</script>

<Story
	name="Default"
	args={{
		tabs: [
			{ key: 'requests', label: 'Requests' },
			{ key: 'bandwidth', label: 'Bandwidth' }
		],
		active: 'requests',
		onchange: () => {}
	}}
/>

<Story
	name="ThreeTabs"
	args={{
		tabs: [
			{ key: 'cpu', label: 'CPU' },
			{ key: 'ram', label: 'RAM' },
			{ key: 'network', label: 'Network' }
		],
		active: 'ram',
		onchange: () => {}
	}}
/>

<Story
	name="FourTabs"
	args={{
		tabs: [
			{ key: 'response', label: 'Response' },
			{ key: 'throughput', label: 'Throughput' },
			{ key: 'errors', label: 'Errors' },
			{ key: 'resources', label: 'Resources' }
		],
		active: 'throughput',
		onchange: () => {}
	}}
/>
