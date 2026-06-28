<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ProgressBar from './ProgressBar.svelte';

	const { Story } = defineMeta({
		title: 'Elements/ProgressBar',
		component: ProgressBar,
		tags: ['autodocs'],
		argTypes: {
			height: {
				control: 'select',
				options: ['sm', 'md']
			}
		}
	});
</script>

<Story name="Default" args={{ value: 65 }} />

<Story name="WithLabel" args={{ value: 72, label: 'Storage Used', showPercent: true }} />

<Story name="Full" args={{ value: 100, label: 'Capacity', showPercent: true }} />

<Story name="Empty" args={{ value: 0, label: 'Cache Hit Rate', showPercent: true }} />

<Story
	name="CustomColor"
	args={{ value: 45, color: 'bg-blue', label: 'CPU Usage', showPercent: true }}
/>

<Story name="SmallHeight" args={{ value: 80, height: 'sm', color: 'bg-success' }} />
