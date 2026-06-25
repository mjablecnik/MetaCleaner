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
	<SettingsHeaderSection />
</Story>
