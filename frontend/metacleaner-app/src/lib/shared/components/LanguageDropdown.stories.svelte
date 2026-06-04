<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import LanguageDropdown from './LanguageDropdown.svelte';

	const { Story } = defineMeta({
		title: 'Components/LanguageDropdown',
		component: LanguageDropdown,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }],
			},
		},
	});

	const mockLangOptions = [
		{ code: 'en', flag: '🇬🇧', label: 'EN', name: 'English' },
		{ code: 'cs', flag: '🇨🇿', label: 'CS', name: 'Čeština' },
		{ code: 'de', flag: '🇩🇪', label: 'DE', name: 'Deutsch' },
		{ code: 'sk', flag: '🇸🇰', label: 'SK', name: 'Slovenčina' },
	];
</script>

<Story name="Closed">
	<LanguageDropdown
		langOptions={mockLangOptions}
		currentLocale="en"
		open={false}
		onSelect={() => {}}
	/>
</Story>

<Story name="Open">
	<LanguageDropdown
		langOptions={mockLangOptions}
		currentLocale="en"
		open={true}
		onSelect={() => {}}
	/>
</Story>

<Story name="Czech Selected Closed">
	<LanguageDropdown
		langOptions={mockLangOptions}
		currentLocale="cs"
		open={false}
		onSelect={() => {}}
	/>
</Story>

<Story name="Czech Selected Open">
	<LanguageDropdown
		langOptions={mockLangOptions}
		currentLocale="cs"
		open={true}
		onSelect={() => {}}
	/>
</Story>
