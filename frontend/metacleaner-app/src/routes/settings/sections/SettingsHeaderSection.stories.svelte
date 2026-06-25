<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SettingsHeaderSection from './SettingsHeaderSection.svelte';

	const { Story } = defineMeta({
		title: 'Settings/Sections/SettingsHeaderSection',
		component: SettingsHeaderSection,
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
	<SettingsHeaderSection lastLogin="today, 09:41" />
</Story>

<Story name="With Recent Login">
	<SettingsHeaderSection lastLogin="2 minutes ago" />
</Story>
