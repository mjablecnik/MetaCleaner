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
	<div class="max-w-md p-4 flex flex-col gap-4">
		<ChangePasswordSection />
	</div>
</Story>

<Story name="With Save Handler">
	<div class="max-w-md p-4 flex flex-col gap-4">
		<ChangePasswordSection onSave={() => {}} />
	</div>
</Story>
