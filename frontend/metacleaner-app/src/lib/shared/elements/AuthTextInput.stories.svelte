<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AuthTextInput from './AuthTextInput.svelte';

	const { Story } = defineMeta({
		title: 'Elements/AuthTextInput',
		component: AuthTextInput,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Default">
	<div class="w-80 p-4">
		<AuthTextInput label="Email" placeholder="you@example.com" value="" />
	</div>
</Story>

<Story name="WithIcon">
	<div class="w-80 p-4">
		<AuthTextInput label="Email" icon="fa-regular fa-envelope" placeholder="you@example.com" value="" />
	</div>
</Story>

<Story name="Focused">
	<div class="w-80 p-4">
		<AuthTextInput label="Email" icon="fa-regular fa-envelope" placeholder="you@example.com" value="jan@example.com" />
	</div>
</Story>

<Story name="WithError">
	<div class="w-80 p-4">
		<AuthTextInput
			label="Email"
			icon="fa-regular fa-envelope"
			placeholder="you@example.com"
			value="not-an-email"
			error="Please enter a valid email address."
		/>
	</div>
</Story>

<Story name="Disabled">
	<div class="w-80 p-4">
		<AuthTextInput label="Email" icon="fa-regular fa-envelope" placeholder="you@example.com" value="" disabled />
	</div>
</Story>
