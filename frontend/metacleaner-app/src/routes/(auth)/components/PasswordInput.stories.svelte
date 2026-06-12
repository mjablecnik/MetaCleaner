<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PasswordInput from './PasswordInput.svelte';

	const { Story } = defineMeta({
		title: 'Auth/PasswordInput',
		component: PasswordInput,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: 'var(--color-navy-main)' }]
			}
		}
	});
</script>

<Story name="Default">
	<div class="w-80 p-4">
		<PasswordInput value="" onToggle={() => {}} />
	</div>
</Story>

<Story name="WithValue">
	<div class="w-80 p-4">
		<PasswordInput value="mysecretpassword" onToggle={() => {}} />
	</div>
</Story>

<Story name="ShowingPassword">
	<div class="w-80 p-4">
		<PasswordInput value="mysecretpassword" visible={true} onToggle={() => {}} />
	</div>
</Story>

<Story name="WithError">
	<div class="w-80 p-4">
		<PasswordInput
			value="short"
			error="Password must be at least 8 characters"
			onToggle={() => {}}
		/>
	</div>
</Story>

<Story name="Disabled">
	<div class="w-80 p-4">
		<PasswordInput value="" showToggle={false} />
	</div>
</Story>
