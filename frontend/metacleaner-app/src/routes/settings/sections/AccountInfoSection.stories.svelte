<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AccountInfoSection from './AccountInfoSection.svelte';

	const { Story } = defineMeta({
		title: 'Settings/Sections/AccountInfoSection',
		component: AccountInfoSection,
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
	<div class="max-w-md p-4">
		<AccountInfoSection />
	</div>
</Story>
