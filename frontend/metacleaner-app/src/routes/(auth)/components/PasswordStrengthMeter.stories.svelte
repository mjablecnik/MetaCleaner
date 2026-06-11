<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PasswordStrengthMeter from './PasswordStrengthMeter.svelte';

	const { Story } = defineMeta({
		title: 'Auth/PasswordStrengthMeter',
		component: PasswordStrengthMeter,
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
	<div class="w-64 p-4">
		<PasswordStrengthMeter score={0} />
	</div>
</Story>

<Story name="Weak">
	<div class="w-64 p-4">
		<PasswordStrengthMeter score={1} />
	</div>
</Story>

<Story name="Medium">
	<div class="w-64 p-4">
		<PasswordStrengthMeter score={2} />
	</div>
</Story>

<Story name="Strong">
	<div class="w-64 p-4">
		<PasswordStrengthMeter score={3} />
	</div>
</Story>

<Story name="VeryStrong">
	<div class="w-64 p-4">
		<PasswordStrengthMeter score={4} />
	</div>
</Story>
