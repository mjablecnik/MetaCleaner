<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ToggleSwitch from './ToggleSwitch.svelte';

	const { Story } = defineMeta({
		title: 'Elements/ToggleSwitch',
		component: ToggleSwitch,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Off">
	<ToggleSwitch checked={false} />
</Story>

<Story name="On">
	<ToggleSwitch checked={true} />
</Story>

<Story name="Disabled Off">
	<ToggleSwitch checked={false} disabled={true} />
</Story>

<Story name="Disabled On">
	<ToggleSwitch checked={true} disabled={true} />
</Story>
