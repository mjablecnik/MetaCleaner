<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ChangePasswordSection from './ChangePasswordSection.svelte';

	const { Story } = defineMeta({
		title: 'Settings/Sections/ChangePasswordSection',
		component: ChangePasswordSection,
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
	<div class="flex max-w-md flex-col gap-4 p-4">
		<ChangePasswordSection />
	</div>
</Story>

<Story name="With Save Handler">
	<div class="flex max-w-md flex-col gap-4 p-4">
		<ChangePasswordSection onSave={() => {}} />
	</div>
</Story>
