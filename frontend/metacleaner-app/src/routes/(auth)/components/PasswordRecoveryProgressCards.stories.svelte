<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PasswordRecoveryProgressCards from './PasswordRecoveryProgressCards.svelte';

	const { Story } = defineMeta({
		title: 'Auth/PasswordRecoveryProgressCards',
		component: PasswordRecoveryProgressCards,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: 'var(--color-navy-main)' }]
			}
		}
	});
</script>

<Story name="Step2Active">
	<div class="w-80 p-4">
		<PasswordRecoveryProgressCards currentStep={2} />
	</div>
</Story>

<Story name="Step3Active">
	<div class="w-80 p-4">
		<PasswordRecoveryProgressCards currentStep={3} />
	</div>
</Story>

<Story name="AllDone">
	<div class="w-80 p-4">
		<PasswordRecoveryProgressCards currentStep={4} />
	</div>
</Story>
