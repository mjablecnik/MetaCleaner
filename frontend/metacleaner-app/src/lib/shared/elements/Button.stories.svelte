<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Button from './Button.svelte';
	import { fn } from 'storybook/test';

	const { Story } = defineMeta({
		title: 'Elements/Button',
		component: Button,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		},
		args: {
			onclick: fn()
		}
	});
</script>

<Story name="Primary">
	<Button variant="primary">Start Cleaning</Button>
</Story>

<Story name="Secondary">
	<Button variant="secondary">Cancel</Button>
</Story>

<Story name="Danger">
	<Button variant="danger">Delete Files</Button>
</Story>

<Story name="Ghost">
	<Button variant="ghost">Skip</Button>
</Story>

<Story name="Disabled">
	<Button variant="primary" disabled>Disabled</Button>
</Story>

<Story name="With Icon">
	<Button variant="primary">
		<i class="fa-solid fa-wand-magic-sparkles"></i>
		Start Cleaning
	</Button>
</Story>

<Story name="Loading">
	<Button variant="primary" disabled>
		<i class="fa-solid fa-spinner fa-spin"></i>
		Processing...
	</Button>
</Story>

<Story name="Size Small">
	<Button variant="primary" size="sm">Small Button</Button>
</Story>

<Story name="Size Medium">
	<Button variant="primary" size="md">Medium Button</Button>
</Story>

<Story name="Size Large">
	<Button variant="primary" size="lg">Large Button</Button>
</Story>
