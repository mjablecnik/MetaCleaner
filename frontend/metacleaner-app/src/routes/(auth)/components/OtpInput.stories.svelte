<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import OtpInput from './OtpInput.svelte';

	const { Story } = defineMeta({
		title: 'Auth/OtpInput',
		component: OtpInput,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: 'var(--color-navy-main)' }]
			}
		}
	});
</script>

<Story name="Empty">
	<div class="w-80 p-4">
		<OtpInput values={['', '', '', '', '', '']} />
	</div>
</Story>

<Story name="PartiallyFilled">
	<div class="w-80 p-4">
		<OtpInput values={['4', '2', '7', '', '', '']} />
	</div>
</Story>

<Story name="Complete">
	<div class="w-80 p-4">
		<OtpInput values={['4', '2', '7', '8', '1', '9']} />
	</div>
</Story>

<Story name="WithError">
	<div class="w-80 p-4">
		<OtpInput
			values={['1', '2', '3', '', '', '']}
			error="Code is incomplete. Please enter all 6 digits."
		/>
	</div>
</Story>
